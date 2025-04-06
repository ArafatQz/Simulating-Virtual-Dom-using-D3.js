// Virtual DOM structure
let idCounter = 0;
let prevVDOM = null;

const vDOM = {
  type: 'div',
  id: 'root',
  attributes: { class: 'list-group' },
  children: [],
  text: '',
  collapsed: false
};

prevVDOM = clone(vDOM);

const createNode = (type, attributes = {}, children = [], text = '') => ({
  id: `node-${++idCounter}`,
  type,
  attributes,
  children,
  text: text || '',
  collapsed: false
});