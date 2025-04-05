// ==============================
// Virtual DOM Implementation
// ==============================

// Global unique id counter.
let idCounter = 0;

const vDOM = {
  type: 'div',
  id: 'root',
  attributes: { class: 'list-group' },
  children: [],
  text: '',
  collapsed: false
};

// Helper to create a new node
const createNode = (type, attributes = {}, children = [], text = '') => ({
  id: `node-${++idCounter}`,
  type,
  attributes,
  children,
  text: text || '', 
  collapsed: false
});

const clone = obj => {
  // Handle Arrays.
  if (Array.isArray(obj)) {
    return obj.map(item => clone(item));
  }
  // Handle Objects.
  else if (obj instanceof Object) {
    const copy = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = clone(obj[key]);
      }
    }
    return copy;
  }
  // Handle Primitives.
  else {
    return obj;
  }
};

// Global previous state of the Virtual DOM for diffing
let prevVDOM = clone(vDOM);

// ==============================
// Helper: Find Node by ID in vDOM
// ==============================
const findNodeById = (node, id) => {
  if (node.id === id) return node;
  for (let child of node.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
};

// ==============================
// Diffing Algorithm Implementation
// ==============================
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

// Compare two sets of attributes and return changes.
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

// ==============================
// Patching Function
// ==============================
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

// ==============================
// DOM Rendering (List) using D3
// ==============================
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

// ==============================
// Tree Visualization Setup (Animated)
// ==============================
const margin = { top: 20, right: 90, bottom: 30, left: 90 };
const width = 600;
const height = 500;

const svgContainer = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
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

function showContextMenu(event) {
  const menu = document.getElementById('contextMenu');
  menu.style.display = 'block';
  menu.style.left = `${event.pageX}px`;
  menu.style.top = `${event.pageY}px`;
  event.preventDefault();
}

function hideContextMenu() {
  document.getElementById('contextMenu').style.display = 'none';
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('#contextMenu') && !e.target.closest('.node')) {
    hideContextMenu();
  }
});

document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

function handleEdit() {
  if (!selectedNodeId) return;
  const node = findNodeById(vDOM, selectedNodeId);
  const newText = prompt('Edit text:', node.text);
  if (newText === null) return;

  prevVDOM = clone(vDOM);
  node.text = newText.trim();
  refreshDOM();
  hideContextMenu();
}

function handleDelete() {
  if (!selectedNodeId) return;
  
  prevVDOM = clone(vDOM);
  const removeNode = (node) => {
    node.children = node.children.filter(child => {
      if (child.id === selectedNodeId) return false;
      removeNode(child);
      return true;
    });
  };
  removeNode(vDOM);
  refreshDOM();
  hideContextMenu();
}

function handleCreateChild() {
  if (!selectedNodeId) return;
  const childText = prompt('Enter child node text:');
  if (!childText) return;

  prevVDOM = clone(vDOM);
  const parent = findNodeById(vDOM, selectedNodeId);
  const newChild = createNode('div', { class: 'list-group-item' }, [], childText.trim());
  parent.children.push(newChild);
  refreshDOM();
  hideContextMenu();
}

function handleToggle() {
  if (!selectedNodeId) return;
  prevVDOM = clone(vDOM);
  const node = findNodeById(vDOM, selectedNodeId);
  node.collapsed = !node.collapsed;
  refreshDOM();
  hideContextMenu();
}

// ==============================
// Todo List Functions
// ==============================
const addTask = () => {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) return;
  const newTask = createNode('li', { class: 'list-group-item' }, [], text);
  
  // Clone current state before mutation.
  prevVDOM = clone(vDOM);
  vDOM.children.push(newTask);
  refreshDOM();
  input.value = '';
};

const addSubTask = () => {
  if (!selectedNodeId) {
    alert("Please select a task to add a sub-task.");
    return;
  }
  const subTaskText = prompt("Enter sub-task text:");
  if (!subTaskText || !subTaskText.trim()) return;
  const newSubTask = createNode('li', { class: 'list-group-item' }, [], subTaskText.trim());
  
  // Clone before mutation.
  prevVDOM = clone(vDOM);
  const currentNode = findNodeById(vDOM, selectedNodeId);
  if (currentNode) {
    currentNode.children.push(newSubTask);
    refreshDOM();
  }
};

const editTask = id => {
  const newText = prompt("Enter updated task text:");
  if (newText === null) return;
  
  prevVDOM = clone(vDOM);
  const node = findNodeById(vDOM, id);
  if (node) {
    node.text = newText.trim();
  }
  refreshDOM();
};

const removeTask = id => {
  prevVDOM = clone(vDOM);
  const removeNode = node => {
    node.children = node.children.filter(child => {
      if (child.id === id) return false;
      removeNode(child);
      return true;
    });
  };
  removeNode(vDOM);
  refreshDOM();
};


// refreshDOM diffs the previous and current vDOM and applies patches.
const refreshDOM = () => {
  const patches = diff(prevVDOM, vDOM);
  applyPatches(patches);
  updateTree();
  // Update prevVDOM to the current state.
  prevVDOM = clone(vDOM);
};

// ==============================
// Initialization
// ==============================
// Render the initial list and tree.
renderDOM(vDOM, appContainer);
updateTree();
