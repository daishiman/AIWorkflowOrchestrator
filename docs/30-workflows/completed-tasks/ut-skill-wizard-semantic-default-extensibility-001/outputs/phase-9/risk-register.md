# Phase 9: リスク台帳

## 残存リスク

| No  | リスク内容                                                                                 | 影響度 | 発生確率 | 対応状況                                                                                         |
| --- | ------------------------------------------------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------------------------ |
| R-1 | q6「週次」→「週に1回」はQ6 optionsに存在しないためfreeTextに格納される                     | LOW    | 低       | 設計上許容（Phase 3 矛盾チェック記録済み）                                                       |
| R-2 | notion の freeText "Notion" 設定は resolveSemanticLabel 外の特別処理に依存                 | LOW    | 低       | createQuestionAnswer 内で先行チェックとして残存                                                  |
| R-3 | vitest.config.ts の resolve.alias 追加（@repo/shared/types/skillWizard）は手動メンテが必要 | LOW    | 低       | 将来の subpath 追加時に同様対応が必要（手順は outputs/phase-5/implementation-summary.md に記録） |

## 解消済みリスク

| リスク                             | 解消方法                                                       |
| ---------------------------------- | -------------------------------------------------------------- |
| 変換テーブルのハードコード管理限界 | SEMANTIC_LABEL_MAP を shared に外部化                          |
| createQuestionAnswer の未テスト    | applySmartDefaults を export してテスト可能化                  |
| Phase 4 TC-01 の questionId 矛盾   | Phase 12 を正とし q1 で統一（contradiction-checklist.md 記録） |
