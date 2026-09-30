import type { TreeNode } from "@/types/tree";

// Characters that make up the "drawing" in front of a name:
// box drawing (tree), ASCII fallbacks (`tree -A`/`--charset=ascii`) and whitespace.
const PREFIX = /^[\s│├└─┬┼┆┊|`+\\-]*/;
const SUMMARY = /^\d+\s+director(y|ies)(,\s*\d+\s+files?)?$/i;
// A trailing comment needs whitespace before its marker: `render.php  # template`, `index.js ← entry`.
const COMMENT = /\s+((?:#|\/\/|←|<-)(?:\s.*)?)$/;

type Entry = { column: number; node: TreeNode };

/**
 * Parses ASCII trees (e.g. `tree` output) as well as plain indented lists.
 *
 * Both formats are handled by the same idea: the column where the *name*
 * starts defines the depth. A line's parent is the closest previous line
 * whose name starts further left.
 */
export function parseTree(input: string): TreeNode[] {
  const roots: TreeNode[] = [];
  const stack: Entry[] = [];

  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.replace(/ /g, " ").replace(/\t/g, "    ").trimEnd();
    const prefix = line.match(PREFIX)?.[0] ?? "";
    let text = line.slice(prefix.length);

    // Skip empty lines, pure connector lines ("│") and the `tree` summary.
    if (!text || SUMMARY.test(text)) continue;

    let comment: string | undefined;
    const commentMatch = text.match(COMMENT);
    if (commentMatch && commentMatch.index! > 0) {
      comment = commentMatch[1].trim();
      text = text.slice(0, commentMatch.index).trimEnd();
    }

    const isFolder = text.endsWith("/");
    const name = text.replace(/\/+$/, "") || text;

    const node: TreeNode = { id: "", name, type: isFolder ? "folder" : "file" };
    if (comment) node.comment = comment;

    const column = prefix.length;
    while (stack.length && stack[stack.length - 1].column >= column) stack.pop();

    const parent = stack[stack.length - 1]?.node;
    if (parent) {
      parent.type = "folder";
      (parent.children ??= []).push(node);
    } else {
      roots.push(node);
    }
    stack.push({ column, node });
  }

  // `tree` prints "." as root for the current directory — it adds nothing visually.
  const result = roots.length === 1 && roots[0].name === "." ? (roots[0].children ?? []) : roots;
  assignIds(result, "");
  return result;
}

function assignIds(nodes: TreeNode[], parentId: string) {
  const seen = new Map<string, number>();
  for (const node of nodes) {
    const count = seen.get(node.name) ?? 0;
    seen.set(node.name, count + 1);
    node.id = `${parentId}/${node.name}${count ? `#${count}` : ""}`;
    if (node.children) assignIds(node.children, node.id);
  }
}
