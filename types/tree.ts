export type TreeNode = {
  /** Stable path-based id, used for highlight/dim state. */
  id: string;
  name: string;
  type: "file" | "folder";
  /** Optional trailing comment, e.g. `render.php  # template`. */
  comment?: string;
  children?: TreeNode[];
};

export type NodeMark = "highlight" | "dim";
