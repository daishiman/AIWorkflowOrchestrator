/**
 * ファイル操作ユーティリティ
 * TASK-9C: スキル改善・自動修正機能 - Phase 8 リファクタリング
 *
 * SkillAnalyzer/SkillImproverで共通利用するファイル操作を集約
 */
import * as fs from "fs/promises";
import * as path from "path";

/**
 * ディレクトリを再帰的に走査してファイル内容を収集
 * @param dir ディレクトリパス
 * @param extensions 対象拡張子（省略時は全て）
 * @returns ファイルパスと内容のマップ
 */
export async function collectFiles(
  dir: string,
  extensions?: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();

  async function walk(currentDir: string): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // 隠しディレクトリや.backupsはスキップ
        if (!entry.name.startsWith(".")) {
          await walk(fullPath);
        }
      } else if (entry.isFile()) {
        // 拡張子フィルタ
        if (extensions && !extensions.some((ext) => entry.name.endsWith(ext))) {
          continue;
        }

        try {
          const content = await fs.readFile(fullPath, "utf-8");
          const relativePath = path.relative(dir, fullPath);
          result.set(relativePath, content);
        } catch {
          // バイナリファイル等は無視
        }
      }
    }
  }

  await walk(dir);
  return result;
}

/**
 * タイムスタンプ付きバックアップディレクトリを作成
 * @param skillDir スキルディレクトリパス
 * @param baseDir バックアップ保存先のベースディレクトリ
 * @param skillName スキル名
 * @returns 作成したバックアップディレクトリパス
 */
export async function createBackupDir(
  skillDir: string,
  baseDir: string,
  skillName: string,
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(
    baseDir,
    ".backups",
    `${skillName}.backup.${timestamp}`,
  );

  await fs.mkdir(path.dirname(backupDir), { recursive: true });
  await fs.cp(skillDir, backupDir, { recursive: true });

  return backupDir;
}

/**
 * 最新のバックアップからスキルを復元
 * @param backupsDir バックアップディレクトリのパス
 * @param skillName スキル名
 * @param targetDir 復元先ディレクトリ
 */
export async function restoreFromBackup(
  backupsDir: string,
  skillName: string,
  targetDir: string,
): Promise<void> {
  const backups = await fs.readdir(backupsDir);
  const skillBackups = backups
    .filter((b) => b.startsWith(`${skillName}.backup.`))
    .sort()
    .reverse();

  if (skillBackups.length === 0) {
    throw new Error(`スキル「${skillName}」のバックアップが見つかりません`);
  }

  const latestBackup = path.join(backupsDir, skillBackups[0]);

  // 現在のディレクトリを削除して復元
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.cp(latestBackup, targetDir, { recursive: true });
}

/**
 * ディレクトリの存在を確認
 * @param dirPath ディレクトリパス
 * @throws ディレクトリが存在しない場合
 */
export async function verifyDirectory(dirPath: string): Promise<void> {
  try {
    const stat = await fs.stat(dirPath);
    if (!stat.isDirectory()) {
      throw new Error(`パスがディレクトリではありません: ${dirPath}`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`ディレクトリが存在しません: ${dirPath}`);
    }
    throw error;
  }
}

/**
 * ファイルを安全に読み込む
 * @param filePath ファイルパス
 * @param errorMessage ファイルが存在しない場合のエラーメッセージ
 * @returns ファイル内容
 */
export async function readFileSafe(
  filePath: string,
  errorMessage?: string,
): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(errorMessage ?? `ファイルが見つかりません: ${filePath}`);
    }
    throw error;
  }
}
