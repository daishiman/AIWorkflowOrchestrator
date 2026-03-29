# Phase 9: 品質保証

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 9                             |
| 機能名 | llm-adapter-error-propagation |
| 作成日 | 2026-03-29                    |

## 目的

型安全性、fire-and-forget パターンとの整合性、既存テストへの影響、エラーレスポンスの一貫性を確認する。

## 実行タスク

- 型安全性の再点検
- fire-and-forget パターン整合性の再点検
- 既存テストへの影響の再点検
- エラーレスポンスの一貫性の再点検

## 参照資料

| 資料名                 | パス                                        | 説明          |
| ---------------------- | ------------------------------------------- | ------------- |
| Phase 5 実装           | `phase-5-implementation.md`                 | 実装対象      |
| Phase 6 test expansion | `phase-6-test-expansion.md`                 | edge case     |
| Phase 7 coverage       | `phase-7-coverage-check.md`                 | coverage 結果 |
| Phase 8 refactoring    | `phase-8-refactoring.md`                    | 共通化方針    |
| 型定義                 | `packages/shared/src/types/skillCreator.ts` | 現行型定義    |

## 品質観点

- `LLMAdapterStatus` 型が shared types に正しく export されている
- `RuntimeSkillCreatorPlanResponse` の拡張が後方互換である
- fire-and-forget パターン（`void (async () => { ... })()`）が維持されている
- 既存の `setLLMAdapter()` テストがステータス自動遷移で影響を受けない
- `plan()` のエラーレスポンスと正常レスポンスが型的に区別可能である

## 実行手順

### ステップ1: 型安全性を監査する

- `LLMAdapterStatus` が `"ready" | "initializing" | "failed"` の 3 値に限定されていること
- `RuntimeSkillCreatorPlanResponse` の `error` / `errorCode` / `adapterStatus` が全て optional であること
- `setLLMAdapterFailed(reason: string)` の `reason` パラメータが non-null string であること
- Facade の getter 戻り値型が正しいこと

### ステップ2: fire-and-forget パターンを監査する

- `ipc/index.ts` の `void (async () => { ... })()` パターンが維持されていること
- catch ブロックが `setLLMAdapterFailed()` を呼ぶだけで、他の副作用がないこと
- `console.warn` が維持されていること（既存のデバッグ情報を削除しない）
- IPC 登録がブロックされないこと

### ステップ3: 既存テスト互換性を監査する

- 既存の `setLLMAdapter()` テストパターンが、ステータスの自動遷移により破壊されないこと
- 既存の `plan()` テストが、新しい分岐に影響されないこと（llmAdapter 設定済みの場合は既存動作を維持）
- 型拡張が既存の型チェックテストに影響しないこと

### ステップ4: エラーレスポンスの一貫性を監査する

- `success: false` のとき必ず `error` フィールドが存在すること
- `success: false` のとき必ず `errorCode` フィールドが存在すること
- `success: false` のとき必ず `adapterStatus` フィールドが存在すること
- `success: true` のとき `error` / `errorCode` が存在しないこと
- actionable メッセージの判定ロジックが一貫していること

## 統合テスト連携

- Phase 10 で AC-1〜AC-6 の pass/fail matrix を確認する
- Phase 12 に型拡張と互換性の根拠を記録する

## 成果物

| 成果物  | パス                           | 説明         |
| ------- | ------------------------------ | ------------ |
| QA 本文 | `phase-9-quality-assurance.md` | QA gate 本文 |

## 完了条件

- [ ] 型拡張が後方互換であることを確認した
- [ ] fire-and-forget パターンが維持されていることを確認した
- [ ] 既存テストに影響がないことを確認した
- [ ] エラーレスポンスが一貫していることを確認した
- [ ] **本Phase内の全タスクを100%実行完了**
