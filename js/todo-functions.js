// Todo list functionality
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