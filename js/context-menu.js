// Context menu handlers
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