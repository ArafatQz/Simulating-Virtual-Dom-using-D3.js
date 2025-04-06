// Helper functions
const clone = (obj) => {
    if (Array.isArray(obj)) return obj.map(item => clone(item));
    if (obj instanceof Object) {
      const copy = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) copy[key] = clone(obj[key]);
      }
      return copy;
    }
    return obj;
};
  
const findNodeById = (node, id) => {
    if (node.id === id) return node;
    for (let child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
    return null;
};