import * as fs from "node:fs";
import * as path from "node:path";

/**
 * .git ファイルから gitdir の値を読み取る内部ヘルパー。
 *
 * @param projectRoot - プロジェクトルートディレクトリ
 * @returns gitdir の値（パス文字列）。Worktree でない場合や読み取り失敗時は null
 */
function readGitDir(projectRoot: string): string | null {
  const gitPath = path.join(projectRoot, ".git");

  try {
    const stat = fs.statSync(gitPath);
    if (!stat.isFile()) {
      return null;
    }
    const content = fs.readFileSync(gitPath, "utf-8").trim();
    if (!content.startsWith("gitdir: ")) {
      return null;
    }
    return content.slice("gitdir: ".length).trim();
  } catch {
    return null;
  }
}

/**
 * 現在のプロジェクトルートが Git Worktree 環境かどうかを判定する。
 *
 * 判定ロジック:
 * 1. .git がファイルであれば Worktree の可能性あり
 * 2. .git ファイルの内容が "gitdir: " で始まれば Worktree と確定
 * 3. .git がディレクトリまたは存在しなければ通常リポジトリ
 *
 * @param projectRoot - 判定対象のプロジェクトルートディレクトリ（省略時は process.cwd()）
 * @returns Worktree 環境の場合 true、通常リポジトリの場合 false
 */
export function isWorktreeEnvironment(projectRoot?: string): boolean {
  const root = projectRoot ?? process.cwd();
  return readGitDir(root) !== null;
}

/**
 * メインリポジトリのパスを取得する。
 *
 * .git ファイルから `gitdir:` の値を解析し、`.git/worktrees/` 以前のパスを返す。
 * 例: `gitdir: /path/to/repo/.git/worktrees/my-branch`
 *   → `/path/to/repo`
 *
 * @param projectRoot - プロジェクトルートディレクトリ（省略時は process.cwd()）
 * @returns メインリポジトリの絶対パス。Worktree でない場合は null
 */
export function getMainRepoPath(projectRoot?: string): string | null {
  const root = projectRoot ?? process.cwd();
  const gitDir = readGitDir(root);
  if (gitDir === null) {
    return null;
  }

  // gitdir の値から `.git/worktrees/{name}` パターンを検出
  const worktreesSegment = `${path.sep}.git${path.sep}worktrees${path.sep}`;
  const idx = gitDir.indexOf(worktreesSegment);
  if (idx === -1) {
    // POSIX パス形式でも試行（Windows 以外の環境との互換性）
    const posixSegment = "/.git/worktrees/";
    const posixIdx = gitDir.indexOf(posixSegment);
    if (posixIdx === -1) {
      return null;
    }
    return gitDir.slice(0, posixIdx);
  }

  return gitDir.slice(0, idx);
}

/**
 * Worktree 名を取得する。
 *
 * `.git/worktrees/{name}` の `{name}` 部分を返す。
 * 例: `gitdir: /path/to/repo/.git/worktrees/my-branch`
 *   → `my-branch`
 *
 * @param projectRoot - プロジェクトルートディレクトリ（省略時は process.cwd()）
 * @returns Worktree 名。Worktree でない場合は null
 */
export function getWorktreeName(projectRoot?: string): string | null {
  const root = projectRoot ?? process.cwd();
  const gitDir = readGitDir(root);
  if (gitDir === null) {
    return null;
  }

  // gitdir の値から `.git/worktrees/{name}` パターンを検出
  const worktreesSegment = `${path.sep}.git${path.sep}worktrees${path.sep}`;
  let afterWorktrees: string | undefined;

  const idx = gitDir.indexOf(worktreesSegment);
  if (idx !== -1) {
    afterWorktrees = gitDir.slice(idx + worktreesSegment.length);
  } else {
    // POSIX パス形式でも試行
    const posixSegment = "/.git/worktrees/";
    const posixIdx = gitDir.indexOf(posixSegment);
    if (posixIdx === -1) {
      return null;
    }
    afterWorktrees = gitDir.slice(posixIdx + posixSegment.length);
  }

  // 末尾のスラッシュや追加パスを除去し、Worktree 名のみ取得
  const name = afterWorktrees.split("/")[0].split(path.sep)[0];
  return name || null;
}
