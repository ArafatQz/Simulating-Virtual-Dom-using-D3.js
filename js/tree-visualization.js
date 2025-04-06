// Tree visualization logic
const margin = { top: 20, right: 90, bottom: 30, left: 90 };
const width = 600;
const height = 500;

const svgContainer = d3.select("#chart")
  .append("svg")
  .attr("width", "100%")
  .attr("height", height + margin.top + margin.bottom);

const svg = svgContainer.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const treeLayout = d3.tree().size([height, width]);

const updateTree = () => {
    const root = d3.hierarchy(vDOM, d => d.collapsed ? [] : d.children);
    treeLayout(root);
  
    // ------------------------------
    // Links Section with Animation
    // ------------------------------
    const links = svg.selectAll(".link")
      .data(root.links(), d => `${d.source.data.id}-${d.target.data.id}`);
  
    links.exit().remove();
  
    const enterLinks = links.enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x))
      .each(function() {
        // Get the total length of the path for the animation.
        const totalLength = this.getTotalLength();
        d3.select(this)
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength);
      });
  
    enterLinks.merge(links)
      .transition().duration(1000)
      .attr("stroke-dashoffset", 0) // Animate the dash offset to 0.
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x));
  
    // ------------------------------
    // Nodes Section
    // ------------------------------
    const nodes = svg.selectAll(".node")
      .data(root.descendants(), d => d.data.id);
  
    nodes.exit().remove();
  
    const enterNodes = nodes.enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .on('click', function(event, d) {
        event.stopPropagation();
        selectedNodeId = d.data.id;
        showContextMenu(event);
        d3.selectAll('.node.selected').classed('selected', false);
        d3.select(this).classed('selected', true);
      });
  
    enterNodes.append("circle")
      .attr("r", 10)
      .style("fill", d => d.data.collapsed ? "#ff7f0e" : "#ffffff")
      .style("stroke", "#3182bd")
      .style('z-index', 1)
  
    enterNodes.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.children ? -13 : 13)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.text || `Node ${d.data.id}`);
  
    const mergedNodes = nodes.merge(enterNodes);
  
    // Update text for existing nodes
    mergedNodes.select("text")
      .text(d => d.data.text || `Node ${d.data.id}`);
  
    mergedNodes.transition().duration(500)
      .attr("transform", d => `translate(${d.y},${d.x})`);
  
    mergedNodes.select("circle")
      .transition().duration(500)
      .style("fill", d => d.data.collapsed ? "#ff7f0e" : "#3182bd");
  
    
  };