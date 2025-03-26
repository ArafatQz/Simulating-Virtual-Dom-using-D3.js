// -------------------------------
// Virtual DOM Implementation
// -------------------------------
const vDOM = {
  type: 'div',
  id: 'root',
  attributes: { class: 'list-group' },
  children: [],
  text: ''
};

// Helper to create a new node
const createNode = (type, attributes = {}, children = [], text = '') => ({
  id: Math.random().toString(36).substr(2, 9),
  type,
  attributes,
  children,
  text,
  collapsed: false
});

// -------------------------------
// DOM Rendering (List) using D3
// -------------------------------
const appContainer = d3.select('#app');
let selectedNode = null;

const renderDOM = (node, parent) => {
  const element = parent.append(node.type)
    .attr('id', node.id)
    .classed('fade-in', true)
    .text(node.text)
    .on('click', event => {
      event.stopPropagation();
      selectedNode = node;
      d3.selectAll('.selected').classed('selected', false);
      d3.select(event.currentTarget).classed('selected', true);
    });
  
  // Apply additional attributes
  Object.entries(node.attributes).forEach(([key, value]) => element.attr(key, value));
  
  // For list items add Edit and Remove buttons
  if (node.type === 'li') {
    element.append('button')
      .classed('btn btn-secondary btn-sm ms-2', true)
      .text('Edit')
      .on('click', event => {
        event.stopPropagation();
        editTask(node.id);
      });
      
    element.append('button')
      .classed('btn btn-danger btn-sm ms-2', true)
      .text('×')
      .on('click', event => {
        event.stopPropagation();
        removeTask(node.id);
      });
  }
  
  // Recursively render children
  node.children.forEach(child => renderDOM(child, element));
};

// -------------------------------
// Tree Visualization Setup (Animated)
// -------------------------------
const margin = { top: 20, right: 90, bottom: 30, left: 90 };
const width = 600 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svgContainer = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

const svg = svgContainer.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const treeLayout = d3.tree().size([height, width]);

const updateTree = () => {
  svg.selectAll("*").remove();
  const root = d3.hierarchy(vDOM, d => d.children);
  treeLayout(root);
  
  // Draw Links with Animation
  svg.selectAll(".link")
    .data(root.links())
    .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x))
      .style("opacity", 0)
      .transition()
        .duration(500)
        .style("opacity", 1);
  
  // Draw Nodes with Animation
  const nodeGroup = svg.selectAll(".node")
    .data(root.descendants())
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .on("click", (event, d) => {
        d.data.collapsed = !d.data.collapsed;
        updateTree();
      });
      
  nodeGroup.append("circle")
    .attr("r", 0)
    .style("fill", d => d.data.collapsed ? "#ff7f0e" : "#fff")
    .transition()
      .duration(500)
      .attr("r", 10);
      
  nodeGroup.append("text")
    .attr("dy", "0.31em")
    .attr("x", d => d.children ? -13 : 13)
    .style("text-anchor", d => d.children ? "end" : "start")
    .text(d => `${d.data.type}: ${d.data.text}`)
    .style("opacity", 0)
    .transition()
      .duration(500)
      .style("opacity", 1);
};

// -------------------------------
// Todo List Functions
// -------------------------------
const addTask = () => {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) return;
  const newTask = createNode('li', { class: 'list-group-item' }, [], text);
  vDOM.children.push(newTask);
  refreshDOM();
  input.value = '';
};

const addSubTask = () => {
  if (!selectedNode) {
    alert("Please select a task to add a sub-task.");
    return;
  }
  const subTaskText = prompt("Enter sub-task text:");
  if (!subTaskText || !subTaskText.trim()) return;
  const newSubTask = createNode('li', { class: 'list-group-item' }, [], subTaskText.trim());
  selectedNode.children.push(newSubTask);
  refreshDOM();
};

const editTask = id => {
  const newText = prompt("Enter updated task text:");
  if (newText === null) return; // Cancelled
  const updateText = node => {
    if (node.id === id) node.text = newText.trim() || node.text;
    node.children.forEach(updateText);
  };
  updateText(vDOM);
  refreshDOM();
};

const removeTask = id => {
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

const refreshDOM = () => {
  appContainer.selectAll('*').remove();
  renderDOM(vDOM, appContainer);
  updateTree();
};

// -------------------------------
// Initialization
// -------------------------------
renderDOM(vDOM, appContainer);
updateTree();
