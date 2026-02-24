/**
 * セキュリティパターン定義
 * スキル実行時のセキュリティチェックに使用
 *
 * @module constants/security
 */

/**
 * 危険コマンドパターンと保護パスの定義
 * PreToolUseフックでセキュリティチェックに使用
 */
export const DANGEROUS_PATTERNS = {
  /**
   * 危険なBashコマンドパターン
   * これらのパターンを含むコマンドはブロックされる
   */
  BASH_COMMANDS: [
    // 破壊的コマンド
    "rm -rf",
    "rm -r",
    "> /dev/",
    "dd if=",
    "mkfs",

    // 権限昇格
    "sudo",
    "su -",
    "su ",

    // シェル操作
    "chmod 777",
    "chown root",
    "chattr",
    "setfacl",

    // コマンド置換（インジェクション防止）
    "$(",
    "`",

    // 危険なシェル起動
    "/bin/sh",
    "/bin/bash",
    "bash -c",
    "sh -c",

    // 評価・実行
    "eval ",
    "exec ",
    "source ",

    // スケジューラ操作
    "crontab",
    "at ",

    // フォークボム
    ":(){ :|:& };:",
  ] as const,

  /**
   * 保護対象パスパターン（Glob形式）
   * これらのパスへの書き込みはブロックされる
   */
  PROTECTED_PATHS: [
    // システムディレクトリ
    "/etc/**",
    "/usr/**",
    "/var/**",
    "/sys/**",
    "/proc/**",
    "/boot/**",
    "/root/**",

    // シェル設定ファイル
    "**/.bashrc",
    "**/.bash_profile",
    "**/.bash_login",
    "**/.zshrc",
    "**/.zshenv",
    "**/.zprofile",
    "**/.profile",

    // 認証・鍵ファイル
    "~/.ssh/**",
    "~/.gnupg/**",

    // クラウド認証情報
    "~/.aws/**",
    "~/.azure/**",
    "~/.kube/**",
    "~/.config/gcloud/**",

    // アプリケーション認証情報
    "**/.env",
    "**/.env.local",
    "**/.env.production",
    "**/credentials.json",
    "**/secrets.json",
  ] as const,
} as const;

/**
 * 許可されたツールのホワイトリスト
 * これ以外のツールはスキル実行で使用不可
 */
export const ALLOWED_TOOLS_WHITELIST = [
  "Read",
  "Write",
  "Edit",
  "Bash",
  "Glob",
  "Grep",
  "LS",
  "Task",
  "WebSearch",
  "WebFetch",
  "TodoWrite",
] as const;

/**
 * 許可されたツールの型
 * ALLOWED_TOOLS_WHITELIST から自動推論
 */
export type AllowedTool = (typeof ALLOWED_TOOLS_WHITELIST)[number];

/**
 * コマンドが危険かどうかを判定
 *
 * @param command - 検査対象のコマンド文字列
 * @returns 危険なパターンを含む場合はtrue
 *
 * @example
 * ```typescript
 * isDangerousCommand("rm -rf /"); // true
 * isDangerousCommand("ls -la");   // false
 * ```
 */
export function isDangerousCommand(command: string): boolean {
  if (!command) return false;

  // パイプ経由でシェル実行する典型パターン
  if (/\|\s*(?:sh|bash)(?:\s|$)/.test(command)) {
    return true;
  }

  // 単語境界を考慮する必要があるパターン
  const WORD_BOUNDARY_PATTERNS = [
    "sudo",
    "at ",
    "su ",
    "su -",
    "eval ",
    "exec ",
    "source ",
  ];

  return DANGEROUS_PATTERNS.BASH_COMMANDS.some((pattern) => {
    if (WORD_BOUNDARY_PATTERNS.includes(pattern)) {
      // 単語境界チェック: コマンド先頭 or 空白/セミコロン/パイプの後
      // かつ、パターン末尾が空白の場合はそのまま、そうでなければ単語境界を確認
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const endsWithSpace = pattern.endsWith(" ");
      const suffix = endsWithSpace ? "" : "(?:[\\s;|&]|$)";
      const regex = new RegExp(`(?:^|[\\s;|&])${escapedPattern}${suffix}`);
      return regex.test(command);
    }
    return command.includes(pattern);
  });
}

/**
 * Globパターンマッチ（簡易版）
 *
 * @param path - 検査対象のパス
 * @param pattern - Globパターン
 * @returns マッチする場合はtrue
 *
 * @remarks
 * - ** は任意のパスにマッチ
 * - * は単一階層にマッチ
 * - ~ はホームディレクトリに展開
 *
 * @example
 * ```typescript
 * matchGlobPattern("/etc/passwd", "/etc/**");    // true
 * matchGlobPattern("/home/user/.bashrc", "**\/.bashrc"); // true
 * ```
 */
export function matchGlobPattern(path: string, pattern: string): boolean {
  const homeDir = process.env.HOME || "";

  // 空の場合は空同士でマッチ
  if (path === "" && pattern === "") return true;

  // パターンを正規表現に変換
  // 1. 特殊文字をエスケープ（ただし * は除く）
  // 2. ** を .* に置換（任意のパス）
  // 3. * を [^/]* に置換（単一階層）
  // 4. ~ をホームディレクトリに置換
  let escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&"); // 特殊文字エスケープ

  // ** と * の順序に注意: 先に ** を処理
  escapedPattern = escapedPattern
    .replace(/\*\*/g, "__DOUBLE_STAR__")
    .replace(/\*/g, "[^/]*")
    .replace(/__DOUBLE_STAR__/g, ".*");

  // ~ をホームディレクトリに置換
  escapedPattern = escapedPattern.replace(
    /~/g,
    homeDir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );

  try {
    const regex = new RegExp(`^${escapedPattern}$`);
    return regex.test(path);
  } catch {
    // 無効な正規表現の場合はマッチしない
    return false;
  }
}

/**
 * パスが保護されているかどうかを判定
 *
 * @param filePath - 検査対象のファイルパス
 * @returns 保護対象パスの場合はtrue
 *
 * @example
 * ```typescript
 * isProtectedPath("/etc/passwd");      // true
 * isProtectedPath("~/.ssh/id_rsa");    // true
 * isProtectedPath("/home/user/code");  // false
 * ```
 */
export function isProtectedPath(filePath: string): boolean {
  if (!filePath) return false;

  const normalizedPath = filePath.trim();
  const homeDir = process.env.HOME || "";
  const candidates = new Set<string>([
    normalizedPath,
    normalizedPath.replace(/\\/g, "/"),
  ]);

  // 相対パスの単独ファイル名（例: ".env", "credentials.json"）を補完
  if (!normalizedPath.includes("/") && !normalizedPath.startsWith("~")) {
    candidates.add(`./${normalizedPath}`);
  }

  // "~/" と実ホームディレクトリ表記の双方を比較可能にする
  if (homeDir && normalizedPath.startsWith("~/")) {
    candidates.add(`${homeDir}/${normalizedPath.slice(2)}`);
  }
  if (homeDir && normalizedPath.startsWith(`${homeDir}/`)) {
    candidates.add(`~/${normalizedPath.slice(homeDir.length + 1)}`);
  }

  const sensitiveFileNames = new Set([
    ".env",
    ".env.local",
    ".env.production",
    "credentials.json",
    "secrets.json",
  ]);

  for (const candidate of candidates) {
    const normalizedCandidate = candidate.replace(/\\/g, "/");
    const fileName =
      normalizedCandidate.split("/").filter(Boolean).pop() ??
      normalizedCandidate;

    if (sensitiveFileNames.has(fileName)) {
      return true;
    }

    if (
      DANGEROUS_PATTERNS.PROTECTED_PATHS.some((pattern) =>
        matchGlobPattern(normalizedCandidate, pattern),
      )
    ) {
      return true;
    }
  }

  return false;
}

/**
 * 許可ツールを検証
 *
 * @param tools - 検証対象のツール名配列（読み取り専用配列も受け入れ可能）
 * @returns 全てのツールが許可リストに含まれる場合はtrue
 *
 * @example
 * ```typescript
 * validateAllowedTools(["Read", "Write"]); // true
 * validateAllowedTools(["Unknown"]);       // false
 * ```
 */
export function validateAllowedTools(tools: readonly string[]): boolean {
  return tools.every((tool) =>
    ALLOWED_TOOLS_WHITELIST.includes(tool as AllowedTool),
  );
}

/**
 * 許可ツールをフィルタ（無効なツールを除外）
 *
 * @param tools - フィルタ対象のツール名配列（読み取り専用配列も受け入れ可能）
 * @returns 許可リストに含まれるツールのみの配列
 *
 * @example
 * ```typescript
 * filterAllowedTools(["Read", "Unknown", "Write"]);
 * // ["Read", "Write"]
 * ```
 */
export function filterAllowedTools(tools: readonly string[]): AllowedTool[] {
  return tools.filter((tool) =>
    ALLOWED_TOOLS_WHITELIST.includes(tool as AllowedTool),
  ) as AllowedTool[];
}
