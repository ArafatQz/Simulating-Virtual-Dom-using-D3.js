    // -------------------------------
    // Virtual DOM Implementation
    // -------------------------------
    let vDOM = {
      type: 'div',
      id: 'root',
      attributes: { class: 'list-group' },
      children: [],
      text: ''
    };

    // Helper to create a new node
    function createNode(type, attributes = {}, children = [], text = '') {
      return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        attributes,
        children,
        text,
        collapsed: false
      };
    }

    // -------------------------------
    // DOM Rendering (List) using D3
    // -------------------------------
    const appContainer = d3.select('#app');
    let selectedNode = null;

    function renderDOM(node, parent) {
      const element = parent.append(node.type)
        .attr('id', node.id)
        .classed('fade-in', true)
        .text(node.text)
        .on('click', function(event) {
          event.stopPropagation();
          selectedNode = node;
          d3.selectAll('.selected').classed('selected', false);
          d3.select(this).classed('selected', true);
        });
      
      // Apply any additional attributes
      Object.entries(node.attributes).forEach(([key, value]) => {
        element.attr(key, value);
      });
      
      // For list items add Edit and Remove buttons
      if (node.type === 'li') {
        // Edit Button
        element.append('button')
          .classed('btn btn-secondary btn-sm ms-2', true)
          .text('Edit')
          .on('click', function(event) {
            event.stopPropagation();
            editTask(node.id);
          });
        // Remove Button
        element.append('button')
          .classed('btn btn-danger btn-sm ms-2', true)
          .text('×')
          .on('click', function(event) {
            event.stopPropagation();
            removeTask(node.id);
          });
      }
      
      // Recursively render children
      node.children.forEach(child => renderDOM(child, element));
    }

      // -------------------------------
      // Tree Visualization Setup (Animated)
      // -------------------------------
      const margin = { top: 20, right: 90, bottom: 30, left: 90 };
      const width = 600 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;
  
      // Create the SVG container for the tree
      const svg = d3.select("#chart").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);
  
      // Update tree: completely re-draws the tree so new nodes appear.
      function updateTree() {
        // Clear previous tree content
        svg.selectAll("*").remove();
        
        // Build the tree layout from vDOM (always using d.children)
        const root = d3.hierarchy(vDOM, d => d.children);
        d3.tree().size([height, width])(root);

        
        // --------------------
        // Draw Links with Animation
        // --------------------
        const links = root.links();
        svg.selectAll(".link")
           .data(links)
           .enter().append("path")
             .attr("class", "link")
             .attr("d", d3.linkHorizontal()
               .x(d => d.y)
               .y(d => d.x))
             .style("opacity", 0)
             .transition()
               .duration(500)
               .style("opacity", 1);
        
        // --------------------
        // Draw Nodes with Animation
        // --------------------
        const nodes = root.descendants();
        const node = svg.selectAll(".node")
          .data(nodes)
          .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.y},${d.x})`)
            .on("click", (event, d) => {
              // Toggle collapse/expand on click and update tree
              d.data.collapsed = !d.data.collapsed;
              updateTree();
            });
        
        node.append("circle")
            .attr("r", 0)  // start with 0 radius
            .style("fill", d => d.data.collapsed ? "#ff7f0e" : "#fff")
            .transition()
              .duration(500)
              .attr("r", 10);
        
        node.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d.children ? -13 : 13)
            .style("text-anchor", d => d.children ? "end" : "start")
            .text(d => `${d.data.type}: ${d.data.text}`)
            .style("opacity", 0)
            .transition()
              .duration(500)
              .style("opacity", 1);
      }