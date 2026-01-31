/**
 * permissionDescriptions - ツール別人間可読説明テンプレート
 *
 * PermissionDialogで表示するツール操作の自然言語説明を生成する。
 * 各ツールの引数から日本語の説明文を組み立てる。
 *
 * @module @repo/desktop/renderer/components/skill/permissionDescriptions
 */

/** 引数値を安全な表示用文字列に変換する */
function safeString(value: unknown, maxLength = 100): string {
  if (value === null || value === undefined) {
    return "";
  }
  const str = typeof value === "string" ? value : String(value);
  if (str.length > maxLength) {
    return str.slice(0, maxLength) + "...";
  }
  return str;
}

/** ツール別説明文を生成する関数型 */
type ToolDescriptionGenerator = (args: Record<string, unknown>) => string;

/** ツール別説明テンプレート（12種類） */
const toolDescriptionGenerators: Record<string, ToolDescriptionGenerator> = {
  Bash: (args) => {
    const command = safeString(args.command);
    if (!command) return "コマンドを実行します";
    return `「${command}」コマンドを実行します`;
  },

  Read: (args) => {
    const filePath = safeString(args.file_path);
    if (!filePath) return "ファイルを読み取ります";
    return `「${filePath}」ファイルを読み取ります`;
  },

  Write: (args) => {
    const filePath = safeString(args.file_path);
    if (!filePath) return "ファイルに書き込みます";
    return `「${filePath}」ファイルに書き込みます`;
  },

  Edit: (args) => {
    const filePath = safeString(args.file_path);
    if (!filePath) return "ファイルを編集します";
    return `「${filePath}」ファイルを編集します`;
  },

  Glob: (args) => {
    const pattern = safeString(args.pattern);
    if (!pattern) return "パターンでファイルを検索します";
    return `「${pattern}」パターンでファイルを検索します`;
  },

  Grep: (args) => {
    const pattern = safeString(args.pattern);
    if (!pattern) return "ファイル内を検索します";
    return `「${pattern}」を含むファイルを検索します`;
  },

  WebSearch: (args) => {
    const query = safeString(args.query);
    if (!query) return "Webを検索します";
    return `「${query}」で検索します`;
  },

  Task: (args) => {
    const description = safeString(args.description);
    if (!description) return "タスクを実行します";
    return `タスクを実行します：${description}`;
  },

  NotebookEdit: (args) => {
    const notebookPath = safeString(args.notebook_path);
    if (!notebookPath) return "ノートブックを編集します";
    return `ノートブックを編集します：${notebookPath}`;
  },

  WebFetch: (args) => {
    const url = safeString(args.url);
    if (!url) return "URLからデータを取得します";
    return `「${url}」からデータを取得します`;
  },

  Skill: (args) => {
    const skill = safeString(args.skill);
    if (!skill) return "スキルを実行します";
    return `「${skill}」スキルを実行します`;
  },

  AskUser: () => {
    return "ユーザーに確認します";
  },
};

/** デフォルト説明生成（未定義ツール用） */
function defaultDescription(toolName: string): string {
  const name = safeString(toolName);
  if (!name) return "操作を実行します";
  return `「${name}」ツールの操作を実行します`;
}

/**
 * ツール名と引数から人間可読な説明文を取得する
 *
 * @param toolName - ツール名（例: "Bash", "Read"）
 * @param args - ツール引数（例: { command: "ls -la" }）
 * @returns 人間可読な説明文（例: "「ls -la」コマンドを実行します"）
 */
export function getDescription(
  toolName: string,
  args: Record<string, unknown>,
): string {
  try {
    const generator = toolDescriptionGenerators[toolName];
    if (generator) {
      return generator(args);
    }
    return defaultDescription(toolName);
  } catch {
    return defaultDescription(toolName);
  }
}
