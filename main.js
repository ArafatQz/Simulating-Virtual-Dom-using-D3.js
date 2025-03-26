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
