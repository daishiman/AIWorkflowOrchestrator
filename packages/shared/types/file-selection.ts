/**
 * ファイル選択機能 型定義
 *
 * Zodスキーマから推論された型を再エクスポート。
 *
 * @see schemas/file-selection.schema.ts
 */

export type {
  FileExtension,
  FilePath,
  MimeType,
  FileFilterCategory,
  DialogFileFilter,
  SelectedFile,
  OpenFileDialogRequest,
  OpenFileDialogResponse,
  GetFileMetadataRequest,
  GetFileMetadataResponse,
  GetMultipleFileMetadataRequest,
  GetMultipleFileMetadataResponse,
  ValidateFilePathRequest,
  ValidateFilePathResponse,
  FileSelectionState,
} from "../schemas/file-selection.schema.js";
