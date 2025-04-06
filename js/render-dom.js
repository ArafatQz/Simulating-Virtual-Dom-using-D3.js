// DOM rendering logic
const appContainer = d3.select('#app');
let selectedNodeId = null;

const renderDOM = (node, parent) => {
    // Append the element and set its id and text.
    const element = parent.append(node.type)
      .attr('id', node.id)
      .text(node.text || '')
      .on('click', event => {
        event.stopPropagation();
        selectedNodeId = node.id;
        d3.selectAll('.selected').classed('selected', false);
        d3.select(event.currentTarget).classed('selected', true);
      });
    
    // Merge node.attributes with a mandatory "fade-in" class (added only once).
    if (node.attributes.class) {
      element.attr('class', node.attributes.class);
    }
    element.classed('fade-in', true);
    
    // Apply additional attributes (skip class since it was handled above).
    Object.entries(node.attributes).forEach(([key, value]) => {
        if(key !== 'class'){
           element.attr(key, value);
        }
    });
    
    // For list items add Edit and Remove buttons
    if (node.type === 'li') {
      if (element.select('button.edit').empty()) {
        element.append('button')
          .classed('btn btn-secondary btn-sm ms-2 edit', true)
          .text('Edit')
          .on('click', event => {
            event.stopPropagation();
            // Look up the current node in vDOM using the stored selectedNodeId.
            const currentNode = findNodeById(vDOM, node.id);
            if (currentNode) {
              editTask(node.id);
            }
          });
          
      }
      if (element.select('button.remove').empty()) {
        element.append('button')
          .classed('btn btn-danger btn-sm ms-2 remove', true)
          .text('×')
          .on('click', event => {
            event.stopPropagation();
            removeTask(node.id);
          });
      }
    }
    
    // Recursively render children.
    node.children.forEach(child => renderDOM(child, element));
  };

const refreshDOM = () => {
  const patches = diff(prevVDOM, vDOM);
  applyPatches(patches);
  updateTree();
  prevVDOM = clone(vDOM);
};