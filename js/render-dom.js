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
    
    if (node.type === 'li') {
      // Add flex container styling to list item
      element.classed('d-flex align-items-center justify-content-between', true);
      
      // Create a container for the buttons
      const buttonGroup = element.append('div')
        .classed('btn-group me-2', true);
    
      if (element.select('button.edit').empty()) {
        buttonGroup.append('button')
          .classed('btn btn-secondary btn-sm edit', true)
          .text('Edit')
          .on('click', event => {
            event.stopPropagation();
            const currentNode = findNodeById(vDOM, node.id);
            if (currentNode) editTask(node.id);
          });
      }
    
      if (element.select('button.remove').empty()) {
        buttonGroup.append('button')
          .classed('btn btn-danger btn-sm remove', true)
          .text('×')
          .on('click', event => {
            event.stopPropagation();
            removeTask(node.id);
          });
      }
    
      // Move the text to a separate span and push it to the right
 
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