/**
 * Replace Module - ファイル置換機能
 *
 * このモジュールは以下のコンポーネントを提供します:
 * - ReplaceService: 置換オーケストレーション
 * - CaptureExpander: 正規表現キャプチャ展開
 * - PreserveCaseTransformer: 大文字/小文字保持変換
 * - WorkspaceReplaceService: ワークスペース全体置換
 */

export {
  ReplaceService,
  type ReplaceResult,
  type Replacement,
  type ReplacePreview,
  type ReplaceDiff,
} from "./ReplaceService";
export { CaptureExpander } from "./CaptureExpander";
export { PreserveCaseTransformer } from "./PreserveCaseTransformer";
export {
  WorkspaceReplaceService,
  type WorkspaceReplaceOptions,
  type ReplacePreviewItem,
  type FileReplacePreview,
  type ReplacePreview as WorkspaceReplacePreview,
  type ReplaceResult as WorkspaceReplaceResult,
} from "./WorkspaceReplaceService";
