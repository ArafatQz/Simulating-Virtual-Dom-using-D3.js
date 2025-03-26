// Helper to create unique IDs
function createUniqueId() {
  return 'task-' + Math.random().toString(36).substring(2, 11);
}

// Create virtual DOM nodes
function createNode(type, attributes = {}, children = [], text = '') {
  return {
    id: createUniqueId(),
    type: type,
    attributes,
    children,
    text
  };
}

// Initial Todo List virtual DOM
let mainDOM = createNode('div', { class: 'list-group' }, []);