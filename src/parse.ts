import { removeElement } from 'domutils';
import {
  Node,
  Document,
  NodeWithChildren,
  isDocument as checkIsDocument,
} from 'domhandler';
import type { InternalOptions } from './options';



/*
 * Parser
 */
export function getParse(
  parser: (
    content: string,
    options: InternalOptions,
    isDocument: boolean
  ) => Document
) {
  return function parse(
    content: string | Document | Node | Node[] | Buffer,
    options: InternalOptions,
    isDocument: boolean
  ): Document {
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(content)) {
      content = content.toString();
    }

    if (typeof content === 'string') {
      return parser(content, options, isDocument);
    }

    const doc = content as Node | Node[] | Document;

    if (!Array.isArray(doc) && checkIsDocument(doc)) {
      // If `doc` is already a root, just return it
      return doc;
    }

    // Add conent to new root element
    const root = new Document([]);

    // Update the DOM using the root
    update(doc, root);

    return root;
  };
}

/**
 * Update the dom structure, for one changed layer.
 *
 * @param newChilds - The new children.
 * @param parent - The new parent.
 * @returns The parent node.
 */
export function update(
  newChilds: Node[] | Node,
  parent: NodeWithChildren | null
): Node | null {
  // Normalize
  const arr = Array.isArray(newChilds) ? newChilds : [newChilds];

  // Update parent
  if (parent) {
    parent.children = arr;
  } else {
    parent = null;
  }

  // Update neighbors
  for (let i = 0; i < arr.length; i++) {
    const node = arr[i];

    // Cleanly remove existing nodes from their previous structures.
    if (node.parent && node.parent.children !== arr) {
      removeElement(node);
    }

    if (parent) {
      node.prev = arr[i - 1] || null;
      node.next = arr[i + 1] || null;
    } else {
      node.prev = node.next = null;
    }

    node.parent = parent;
  }

  return parent;
}
// added a comment
