/**
 * Transaction Module - トランザクション管理機能
 *
 * このモジュールは以下のコンポーネントを提供します:
 * - TransactionManager: トランザクション管理
 * - FileBackupManager: ファイルバックアップ管理
 */

export {
  TransactionManager,
  type Transaction,
  type TransactionOperation,
  type TransactionOptions,
  type TransactionStatus,
  type CommitResult,
} from "./TransactionManager";
export { FileBackupManager, type BackupInfo } from "./FileBackupManager";
