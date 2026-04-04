# TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

## メタ情報

| 項目         | 値                                                   |
| ------------ | ---------------------------------------------------- |
| タスクID     | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001      |
| 機能名       | ut-rt-01-execute-improve-adapter-guard-001           |
| ステータス   | completed（Phase 1-12 completed / Phase 13 blocked） |
| 作成日       | 2026-04-04                                           |
| 親タスク     | TASK-RT-01                                           |
| GitHub Issue | #1703                                                |
| タスク種別   | follow-up / feature（コード変更タスク）              |

## 概要

TASK-RT-01 で `plan()` に LLMAdapter ステータスチェックを実装したが、同じく LLM を使用する `execute()` と `improve()` にはガードが未実装。

adapter 未設定・初期化失敗時にユーザーへの actionable メッセージが提供されない問題を解決するため、`execute()` / `improve()` の先頭に `_llmAdapterStatus` チェックを追加する。

## スコープ

### 含む

- `RuntimeSkillCreatorFacade.execute()` / `_executeInternal()` 先頭に `_llmAdapterStatus` チェック追加
- `RuntimeSkillCreatorFacade.improve()` 先頭に `_llmAdapterStatus` チェック追加
- `packages/shared/src/types/skillCreator.ts` に `RuntimeSkillCreatorExecuteErrorResponse` 型追加
- `RuntimeSkillCreatorExecuteResponse` union への新型追加
- `packages/shared/src/types/index.ts` へのエクスポート追加
- `RuntimeSkillCreatorFacade.adapter-status.test.ts` にテスト追加（T-EX-01〜03、T-IM-01〜03）
- `SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx` に consumer 側の type narrowing 追加
- `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts` の union 期待値更新
- T-COMPAT-02 の期待値更新（"initializing" 状態のメッセージ変更に対応）

### 含まない

- `execute()` / `improve()` のストリーミング途中でのアダプター状態変化への対応
- 新規エラーコードの追加（既存の `llm_adapter_unavailable` を流用）
- Renderer 側の視覚/UI 変更

## 受入基準

| ID   | 基準                                                                                       |
| ---- | ------------------------------------------------------------------------------------------ |
| AC-1 | `execute()` が `_llmAdapterStatus === "failed"` 時に `llm_adapter_unavailable` を返す      |
| AC-2 | `execute()` が `_llmAdapterStatus === "initializing"` 時に待機メッセージを返す             |
| AC-3 | `improve()` が `_llmAdapterStatus === "failed"` 時に `llm_adapter_unavailable` を返す      |
| AC-4 | `improve()` が `_llmAdapterStatus === "initializing"` 時に待機メッセージを返す             |
| AC-5 | actionable メッセージが `plan()` と同等品質（APIキー未設定→「APIキーを設定してください」） |
| AC-6 | 既存の `execute()` / `improve()` テストがリグレッションなし                                |
| AC-7 | `RuntimeSkillCreatorExecuteErrorResponse` 型が TypeScript 型チェックを通過                 |

## Phase 構成

| Phase | 名称             | ステータス |
| ----- | ---------------- | ---------- |
| 1     | 要件定義         | completed  |
| 2     | 設計             | completed  |
| 3     | 設計レビュー     | completed  |
| 4     | テスト作成       | completed  |
| 5     | 実装             | completed  |
| 6     | テスト拡充       | completed  |
| 7     | カバレッジ確認   | completed  |
| 8     | リファクタリング | completed  |
| 9     | 品質検証         | completed  |
| 10    | 最終レビュー     | completed  |
| 11    | 手動テスト       | completed  |
| 12    | ドキュメント     | completed  |
| 13    | PR作成           | blocked    |

## 参照資料

| 資料名                    | パス                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                               |
| skillCreator 型定義       | `packages/shared/src/types/skillCreator.ts`                                                         |
| adapter-status テスト     | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts` |
| renderer 互換更新         | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                  |
| renderer 互換更新         | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                |
| 契約パリティ更新          | `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts`                          |
| 元タスク仕様書            | `docs/30-workflows/unassigned-task/task-ut-rt-01-execute-improve-adapter-guard-001.md`              |
| TASK-RT-01 完了タスク     | TASK-RT-01（`plan()` のアダプターステータスチェック実装済み）                                       |
