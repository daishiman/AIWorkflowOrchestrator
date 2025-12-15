/**
 * FileBackupManager - ファイルバックアップ管理
 *
 * 機能:
 * - ファイル内容のバックアップ作成
 * - バックアップからの復元
 * - バックアップの削除（クリーンアップ）
 */

import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir } from "os";
import { generateId } from "../utils";

export interface BackupInfo {
  backupId: string;
  filePath: string;
  backupPath: string;
  createdAt: Date;
}

export class FileBackupManager {
  private backups: Map<string, BackupInfo> = new Map();
  private backupDir: string;

  constructor(backupDir?: string) {
    this.backupDir = backupDir ?? path.join(tmpdir(), "file-backup-manager");
  }

  /**
   * バックアップディレクトリを初期化
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.backupDir, { recursive: true });
  }

  /**
   * ファイルのバックアップを作成
   */
  async createBackup(filePath: string): Promise<string> {
    await this.initialize();

    const backupId = generateId("backup");
    const backupPath = path.join(this.backupDir, backupId);

    // ファイル内容を読み込んでバックアップ
    const content = await fs.readFile(filePath, "utf-8");
    await fs.writeFile(backupPath, content, "utf-8");

    const backupInfo: BackupInfo = {
      backupId,
      filePath,
      backupPath,
      createdAt: new Date(),
    };

    this.backups.set(backupId, backupInfo);

    return backupId;
  }

  /**
   * バックアップから復元
   */
  async restore(backupId: string): Promise<void> {
    const backupInfo = this.backups.get(backupId);

    if (!backupInfo) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    // バックアップ内容を読み込んで元のファイルに書き戻す
    const content = await fs.readFile(backupInfo.backupPath, "utf-8");
    await fs.writeFile(backupInfo.filePath, content, "utf-8");
  }

  /**
   * バックアップを削除
   */
  async deleteBackup(backupId: string): Promise<void> {
    const backupInfo = this.backups.get(backupId);

    if (!backupInfo) {
      return; // 存在しない場合は無視
    }

    try {
      await fs.unlink(backupInfo.backupPath);
    } catch {
      // 削除に失敗しても続行
    }

    this.backups.delete(backupId);
  }

  /**
   * 全バックアップをクリーンアップ
   */
  async cleanup(): Promise<void> {
    for (const [backupId] of this.backups) {
      await this.deleteBackup(backupId);
    }
  }
}
