# Phase 10: リファクタリング

## 実施日

2026-04-16

## リファクタリング実施事項

### TASK-SW-STREAM-001

**変更箇所**: `SkillCreatorService.ts` createSkill メソッドシグネチャ

- コールバック引数を `?:` でオプショナル化 → 後方互換性を保持
- 各通知箇所を `onProgress?.()` optional chain で安全に呼び出し
- **リファクタリング不要**: 最小変更で要件を満たしている

### TASK-SW-STRUCT-001

**変更箇所**: `runCreateWorkflow` の `structurePlan` 組み立て

- `extractPurposeAgent` / `planStructureAgent` 変数は保持し `void` で警告回避
- 将来のLLM統合拡張点として明示的にコメントを追加
- **リファクタリング不要**: Phase 2 設計どおりの最小実装

### TASK-SW-CANCEL-003

**変更箇所**: `SkillCreatorService` の `currentAbortController`

- `createSkill` の finally 節でなく、正常完了・エラー時それぞれで null クリア
  （将来的に finally 統合の可能性あり）
- **軽微リファクタ**: キャンセル時のクリーンアップは将来タスク

### TASK-SW-CANCEL-004

**変更箇所**: `useCancelGeneration.ts`

- `cancelGeneration` を async 化。呼び出し元 `SkillCreateWizard.tsx` の `handleCancelGeneration` も async 対応済み
- **リファクタリング不要**: 型変更が呼び出し元1箇所のみで影響最小

## 改善候補（未タスク）

| 項目                       | 内容                                      | 優先度 |
| -------------------------- | ----------------------------------------- | ------ |
| キャンセル後クリーンアップ | 半作成スキルディレクトリの削除            | Medium |
| LLM統合                    | `runCreateWorkflow` で実際の purpose 抽出 | Low    |
| AbortSignal伝播            | createSkill 内部での AbortSignal 利用     | Low    |
