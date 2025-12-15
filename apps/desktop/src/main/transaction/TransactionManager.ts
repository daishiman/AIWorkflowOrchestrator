/**
 * TransactionManager - トランザクション管理
 *
 * 機能:
 * - トランザクションの開始・コミット・ロールバック
 * - Undo/Redo操作の連携
 * - 複数ファイル操作のアトミック性保証
 */

import * as fs from "fs/promises";
import { FileBackupManager } from "./FileBackupManager";
import { generateId } from "../utils";

export type TransactionStatus =
  | "pending"
  | "committed"
  | "rolled_back"
  | "cancelled";

export interface TransactionOperation {
  type: "replace";
  filePath: string;
  originalContent: string;
  newContent: string;
}

export interface TransactionOptions {
  timeout?: number;
}

export interface CommitResult {
  undoGroupId: string;
}

export interface Transaction {
  id: string;
  status: TransactionStatus;
  operations: TransactionOperation[];
  backupIds: string[];
  createdAt: Date;
  timeout?: number;
  addOperation: (operation: TransactionOperation) => Promise<void>;
}

export class TransactionManager {
  private transactions: Map<string, Transaction> = new Map();
  private undoStacks: Map<string, TransactionOperation[][]> = new Map();
  private redoStacks: Map<string, TransactionOperation[][]> = new Map();
  private backupManager: FileBackupManager;

  constructor(backupManager?: FileBackupManager) {
    this.backupManager = backupManager ?? new FileBackupManager();
  }

  /**
   * 新しいトランザクションを開始
   */
  begin(options?: TransactionOptions): Transaction {
    const id = generateId("tx");
    const now = new Date();

    const transaction: Transaction = {
      id,
      status: "pending",
      operations: [],
      backupIds: [],
      createdAt: now,
      timeout: options?.timeout,
      addOperation: async (operation: TransactionOperation) => {
        if (transaction.status !== "pending") {
          throw new Error(`Transaction ${id} is not pending`);
        }

        // バックアップを作成
        const backupId = await this.backupManager.createBackup(
          operation.filePath,
        );
        transaction.backupIds.push(backupId);
        transaction.operations.push(operation);
      },
    };

    this.transactions.set(id, transaction);

    return transaction;
  }

  /**
   * トランザクションをコミット
   */
  async commit(transactionId: string): Promise<CommitResult> {
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    if (transaction.status === "committed") {
      throw new Error(`Transaction ${transactionId} is already committed`);
    }

    if (transaction.status === "rolled_back") {
      throw new Error(
        `Transaction ${transactionId} has already been rolled back`,
      );
    }

    if (transaction.status === "cancelled") {
      throw new Error(`Transaction ${transactionId} has been cancelled`);
    }

    // タイムアウトチェック
    if (transaction.timeout) {
      const elapsed = Date.now() - transaction.createdAt.getTime();
      if (elapsed > transaction.timeout) {
        transaction.status = "rolled_back";
        throw new Error(
          `Transaction ${transactionId} has expired (timeout: ${transaction.timeout}ms)`,
        );
      }
    }

    try {
      // すべての操作を実行
      for (const operation of transaction.operations) {
        // ファイル存在確認（削除されていないか）
        try {
          await fs.access(operation.filePath);
        } catch {
          throw new Error(`File not found: ${operation.filePath}`);
        }
        await fs.writeFile(operation.filePath, operation.newContent, "utf-8");
      }

      transaction.status = "committed";

      // Undo用にグループを保存
      const undoGroupId = `undo-${transactionId}`;
      this.undoStacks.set(undoGroupId, [transaction.operations]);

      // バックアップをクリーンアップ
      for (const backupId of transaction.backupIds) {
        await this.backupManager.deleteBackup(backupId);
      }

      return { undoGroupId };
    } catch (error) {
      // エラー時はロールバック
      await this.rollback(transactionId);
      throw error;
    }
  }

  /**
   * トランザクションをロールバック
   */
  async rollback(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    if (transaction.status === "rolled_back") {
      throw new Error(
        `Transaction ${transactionId} has already been rolled back`,
      );
    }

    // バックアップから逆順で復元
    const reversedBackupIds = [...transaction.backupIds].reverse();
    for (const backupId of reversedBackupIds) {
      await this.backupManager.restore(backupId);
    }

    // バックアップを削除
    for (const backupId of transaction.backupIds) {
      await this.backupManager.deleteBackup(backupId);
    }

    transaction.status = "rolled_back";
  }

  /**
   * トランザクションをキャンセル
   */
  cancel(transactionId: string): void {
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      return;
    }

    transaction.status = "cancelled";
  }

  /**
   * Undo操作
   */
  async undo(undoGroupId: string): Promise<void> {
    const operationsStack = this.undoStacks.get(undoGroupId);

    if (!operationsStack || operationsStack.length === 0) {
      throw new Error(`Undo group not found: ${undoGroupId}`);
    }

    const operations = operationsStack[operationsStack.length - 1];

    // 逆順で元に戻す
    for (const operation of [...operations].reverse()) {
      await fs.writeFile(
        operation.filePath,
        operation.originalContent,
        "utf-8",
      );
    }

    // Redoスタックに追加
    if (!this.redoStacks.has(undoGroupId)) {
      this.redoStacks.set(undoGroupId, []);
    }
    this.redoStacks.get(undoGroupId)!.push(operations);
  }

  /**
   * Redo操作
   */
  async redo(undoGroupId: string): Promise<void> {
    const operationsStack = this.redoStacks.get(undoGroupId);

    if (!operationsStack || operationsStack.length === 0) {
      throw new Error(`Redo group not found: ${undoGroupId}`);
    }

    const operations = operationsStack.pop()!;

    // 操作を再適用
    for (const operation of operations) {
      await fs.writeFile(operation.filePath, operation.newContent, "utf-8");
    }
  }
}
