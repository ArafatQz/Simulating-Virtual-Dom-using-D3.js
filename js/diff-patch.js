// Diffing and patching logic
const diff = (oldNode, newNode, parentId = null) => {
    let patches = [];
  
    // Case 1: node in new vDom does not exist => remove old node.
    if (!newNode) {
      patches.push({ type: 'REMOVE', id: oldNode.id });
      return patches;
    }
  
    // Case 2: node in new vDom exists => add new node.
    if (!oldNode) {
      patches.push({ type: 'ADD', node: newNode, parentId });
      return patches;
    }
  
    // Case 3: Nodes are of different types => replace the old node.
    if (oldNode.type !== newNode.type) {
      patches.push({ type: 'REPLACE', id: oldNode.id, node: newNode, parentId });
      return patches;
    }
  
    // Case 4: Nodes are of the same type.
    const attrPatches = diffAttributes(oldNode.attributes, newNode.attributes);
    if (Object.keys(attrPatches).length > 0) {
      patches.push({ type: 'ATTRS', id: oldNode.id, attrs: attrPatches });
    }
  
    // Check for text differences.
    if (oldNode.text !== newNode.text) {
      patches.push({ type: 'TEXT', id: oldNode.id, text: newNode.text });
    }
  
    // Recursively diff children.
    patches = patches.concat(diffChildren(oldNode.children, newNode.children, oldNode.id));
    return patches;
  };
  
const diffAttributes = (oldAttrs = {}, newAttrs = {}) => {
    const patches = {};
  
    // Check for changed or removed attributes.
    for (let key in oldAttrs) {
      if (oldAttrs[key] !== newAttrs[key]) {
        patches[key] = newAttrs[key]; // newAttrs[key] will be undefined if removed.
      }
    }
  
    // Check for new attributes.
    for (let key in newAttrs) {
      if (!oldAttrs.hasOwnProperty(key)) {
        patches[key] = newAttrs[key];
      }
    }
    return patches;
  };
  
const diffChildren = (oldChildren = [], newChildren = [], parentId) => {
    let patches = [];
    const oldMap = {};
    oldChildren.forEach(child => { oldMap[child.id] = child; });
    const newMap = {};
    newChildren.forEach(child => { newMap[child.id] = child; });
   
    // Diff or add new children.
    newChildren.forEach(child => {
      if (oldMap[child.id]) {
        patches = patches.concat(diff(oldMap[child.id], child, parentId));
      } else {
        patches.push({ type: 'ADD', node: child, parentId });
      }
    });
    // Remove children that are no longer present.
    oldChildren.forEach(child => {
      if (!newMap[child.id]) {
        patches.push({ type: 'REMOVE', id: child.id });
      }
    });
    return patches;
  };
  
const applyPatches = patches => {
    patches.forEach(patch => {
      switch(patch.type) {
        case 'REMOVE': {
           d3.select(`#${patch.id}`).remove();
           break;
        }
        case 'ADD': {
           // For ADD patches, find the parent's element and render the new node.
           const parentElem = d3.select(`#${patch.parentId}`);
           if (parentElem.empty()) {
             d3.select('#app').append(() => {
               const container = document.createElement(patch.node.type);
               container.id = patch.node.id;
               return container;
             });
           } else {
             renderDOM(patch.node, parentElem);
           }
           break;
        }
        case 'REPLACE': {
           // Remove the old element and render the new node within its parent.
           const parentElem = d3.select(`#${patch.parentId}`);
           d3.select(`#${patch.id}`).remove();
           if (parentElem.empty()) {
             d3.select('#app').append(() => {
               const container = document.createElement(patch.node.type);
               container.id = patch.node.id;
               return container;
             });
           } else {
             renderDOM(patch.node, parentElem);
           }
           break;
        }
        case 'ATTRS': {
           const elem = d3.select(`#${patch.id}`);
           console.log(Object.entries(patch.attrs))
           Object.entries(patch.attrs).forEach(([key, value]) => {
             if(key === 'class') {
               // Instead of merging, reset the class and ensure fade-in is added once.
               elem.attr('class', value || '');
               if (!elem.classed('fade-in')) {
                 elem.classed('fade-in', true);
               }
             } else {
               if (value === undefined) {
                 // Use removeAttr for attribute removal.
                 elem.attr(key, null);
               } else {
                 elem.attr(key, value);
               }
             }
           });
           break;
        }
        case 'TEXT': {
          const elem = d3.select(`#${patch.id}`);
          elem.text(patch.text || ''); // Directly update element text
          break;
        }
      }
    });
  };