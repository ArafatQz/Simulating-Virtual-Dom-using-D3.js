
  // Generate id for nodes
  function generateId() {
    return `vnode-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Function to create a VNode as a plain object
  function createVNode(tag, props = {}, children = [], textContent = "") {
    return {
      id: generateId(),
      tag,        // e.g., 'div', 'span', 'h1'
      props,      // e.g., { class: 'container', style: 'color: red' }
      children,   // Array of child VNodes
      textContent // Text inside the node if applicable
    };
  }
    // Create the initial Virtual DOM Structure
    let virtualDOM = createVNode("div", { class: "container" }, [
      createVNode("h1", {}, [], "Welcome to Virtual DOM"),
      createVNode("p", {}, [], "This is a paragraph inside the virtual DOM."),
      createVNode("ul", {}, [
        createVNode("li", {}, [], "Item 1"),
        createVNode("li", {}, [], "Item 2"),
        createVNode("li", {}, [], "Item 3")
      ])
    ]);
  