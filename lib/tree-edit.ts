import type { TreeNode } from "@/types/tree";

export type TreeFormat = "ascii" | "indented";

export const detectFormat = (input: string): TreeFormat =>
  /[├└│]|\|--|`--/.test(input) ? "ascii" : "indented";

/**
 * Turns a tree back into text, so edits made in the preview land in the editor.
 * Folders always get a trailing slash — otherwise an empty folder would parse as a file.
 */
export function serializeTree(nodes: TreeNode[], format: TreeFormat): string {
  const lines: string[] = [];
  const label = (n: TreeNode) => `${n.name}${n.type === "folder" ? "/" : ""}${n.comment ? `  ${n.comment}` : ""}`;

  if (format === "indented") {
    const walk = (list: TreeNode[], depth: number) => {
      for (const n of list) {
        lines.push("  ".repeat(depth) + label(n));
        if (n.children) walk(n.children, depth + 1);
      }
    };
    walk(nodes, 0);
  } else {
    const draw = (list: TreeNode[], prefix: string) => {
      list.forEach((n, i) => {
        const last = i === list.length - 1;
        lines.push(`${prefix}${last ? "└── " : "├── "}${label(n)}`);
        if (n.children) draw(n.children, prefix + (last ? "    " : "│   "));
      });
    };
    for (const root of nodes) {
      lines.push(label(root));
      if (root.children) draw(root.children, "");
    }
  }
  return lines.join("\n");
}

export const parentIdOf = (id: string) => id.slice(0, id.lastIndexOf("/"));

function mapTree(nodes: TreeNode[], fn: (list: TreeNode[], parentId: string) => TreeNode[], parentId = ""): TreeNode[] {
  return fn(nodes, parentId).map((n) =>
    n.children ? { ...n, children: mapTree(n.children, fn, n.id) } : n,
  );
}

/** Picks "untitled", "untitled-2", … so the new node's id is predictable. */
function uniqueName(siblings: TreeNode[], base: string) {
  const taken = new Set(siblings.map((n) => n.name));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

/**
 * Inserts into a folder (`targetId` is a folder), next to a file (`targetId` is a file),
 * or at the root (`targetId` is null). Returns the new tree and the new node's id.
 */
export function insertNode(
  nodes: TreeNode[],
  targetId: string | null,
  type: TreeNode["type"],
): { nodes: TreeNode[]; id: string } {
  const base = type === "folder" ? "new-folder" : "new-file";
  const make = (siblings: TreeNode[], parentId: string): TreeNode => {
    const name = uniqueName(siblings, base);
    return { id: `${parentId}/${name}`, name, type, ...(type === "folder" ? { children: [] } : null) };
  };

  if (targetId === null) {
    const node = make(nodes, "");
    return { nodes: [...nodes, node], id: node.id };
  }

  let newId = "";
  const result = mapTree(nodes, (list, parentId) => {
    const index = list.findIndex((n) => n.id === targetId);
    if (index === -1) return list;
    const target = list[index];
    if (target.type === "folder") {
      const children = target.children ?? [];
      const node = make(children, target.id);
      newId = node.id;
      return list.map((n, i) => (i === index ? { ...n, children: [...children, node] } : n));
    }
    const node = make(list, parentId);
    newId = node.id;
    return [...list.slice(0, index + 1), node, ...list.slice(index + 1)];
  });
  return { nodes: result, id: newId };
}

export function renameNode(nodes: TreeNode[], id: string, name: string): TreeNode[] {
  return mapTree(nodes, (list) => list.map((n) => (n.id === id ? { ...n, name } : n)));
}

export function removeNode(nodes: TreeNode[], id: string): TreeNode[] {
  return mapTree(nodes, (list) => list.filter((n) => n.id !== id));
}
