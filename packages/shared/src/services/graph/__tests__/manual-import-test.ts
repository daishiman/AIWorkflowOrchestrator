/**
 * 手動インポート検証用テストファイル
 * Phase 11: 手動テスト検証で使用
 *
 * このファイルは型インポートの動作検証のために作成されました。
 * TypeScriptコンパイラでエラーがないことを確認します。
 */

// 型のインポート
import type {
  Community,
  CommunitySummary,
  StoredEntity,
  ExtractedEntity as _ExtractedEntity,
  CommunityDetectionOptions as _CommunityDetectionOptions,
  CommunityDetectionResult as _CommunityDetectionResult,
  GraphNode as _GraphNode,
  GraphPath as _GraphPath,
  TraversalOptions as _TraversalOptions,
} from "../index";

// 値のインポート
import {
  CommunityErrorCode,
  CommunityDetectionError,
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
  normalizeEntityName,
} from "../index";

// 型が正しくインポートされていることを確認
const _checkCommunity = (community: Community): void => {
  console.log(community.id);
};

const _checkCommunitySummary = (summary: CommunitySummary): void => {
  console.log(summary.summary);
};

const _checkStoredEntity = (entity: StoredEntity): void => {
  console.log(entity.name);
};

// enumが正しくインポートされていることを確認
console.log("CommunityErrorCode.NOT_FOUND:", CommunityErrorCode.NOT_FOUND);
console.log(
  "CommunitySummarizationErrorCode.LLM_GENERATION_FAILED:",
  CommunitySummarizationErrorCode.LLM_GENERATION_FAILED,
);

// classが正しくインポートされていることを確認
const error1 = new CommunityDetectionError(
  "Test error",
  CommunityErrorCode.NOT_FOUND,
);
console.log("CommunityDetectionError.name:", error1.name);

const error2 = new CommunitySummarizationError(
  "Test error",
  CommunitySummarizationErrorCode.LLM_GENERATION_FAILED,
);
console.log("CommunitySummarizationError.name:", error2.name);

// 関数が正しくインポートされていることを確認
console.log("normalizeEntityName:", normalizeEntityName("Test Entity"));

// Export to prevent unused variable warnings (this file is for manual testing)
export {
  _checkCommunity,
  _checkCommunitySummary,
  _checkStoredEntity,
  error1,
  error2,
};
