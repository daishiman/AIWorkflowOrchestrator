# UT-FIX-IPC-RESPONSE-UNWRAP-001: IPC レスポンスラッパー未展開修正

## メタ情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| タスクID     | UT-FIX-IPC-RESPONSE-UNWRAP-001     |
| GitHub Issue | #816                               |
| 種別         | バグ修正 (fix)                     |
| 優先度       | 高                                 |
| ブランチ     | fix/ut-fix-ipc-response-unwrap-001 |
| 作成日       | 2026-02-14                         |
| 関連Pitfall  | P19, P23, P24                      |

## 概要

AgentView コンポーネントで `importedSkills.forEach is not a function` ランタイムエラーが発生。Main Process の IPC ハンドラが `{ success: true, data: skills }` 形式でレスポンスを返すが、Preload 層の `safeInvoke<T>()` がラッパーオブジェクトをそのまま通過させることが根本原因。

## Phase 一覧

| Phase | 名称             | 仕様書                                                               | ステータス |
| ----- | ---------------- | -------------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)                   | 完了       |
| 2     | 設計             | [phase-2-design.md](phase-2-design.md)                               | 完了       |
| 3     | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)                 | 完了       |
| 4     | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)                 | 完了       |
| 5     | 実装             | [phase-5-implementation.md](phase-5-implementation.md)               | 完了       |
| 6     | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md)               | 完了       |
| 7     | カバレッジ確認   | [phase-7-coverage-verification.md](phase-7-coverage-verification.md) | 完了       |
| 8     | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)                     | 完了       |
| 9     | 品質保証         | [phase-9-quality-assurance.md](phase-9-quality-assurance.md)         | 完了       |
| 10    | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)                 | 完了       |
| 11    | 手動テスト       | [phase-11-manual-testing.md](phase-11-manual-testing.md)             | 完了       |
| 12    | ドキュメント     | [phase-12-documentation.md](phase-12-documentation.md)               | 完了       |
| 13    | PR作成           | [phase-13-pr-creation.md](phase-13-pr-creation.md)                   | 未実施     |

## 修正対象ファイル

| ファイル                                | 修正内容                          |
| --------------------------------------- | --------------------------------- |
| `apps/desktop/src/preload/skill-api.ts` | 4メソッドのレスポンスラッパー展開 |

## 参照情報

| 種別           | パス                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| 元タスク仕様書 | `docs/30-workflows/completed-tasks/task-ut-fix-ipc-response-unwrap-001.md` |
| クラッシュ箇所 | `apps/desktop/src/renderer/views/AgentView/index.tsx:151`                  |
| Preload API    | `apps/desktop/src/preload/skill-api.ts:192-200`                            |
| IPC ハンドラ   | `apps/desktop/src/main/ipc/skillHandlers.ts:94-115`                        |
| Store Slice    | `apps/desktop/src/renderer/store/slices/agentSlice.ts:556-577`             |
