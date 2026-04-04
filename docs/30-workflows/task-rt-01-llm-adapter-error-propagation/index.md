# task-rt-01-llm-adapter-error-propagation - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | TASK-RT-01                                                               |
| 機能名       | task-rt-01-llm-adapter-error-propagation                                 |
| 作成日       | 2026-04-04                                                               |
| ステータス   | 未実施                                                                   |
| 総Phase数    | 13                                                                       |
| GitHub Issue | [#1879](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1879) |

---

## タスク概要

LLMAdapter 初期化が失敗した場合に、そのエラー状態を IPC 経由で Renderer に即時公開し、
ユーザーが次のアクション（APIキー設定・リトライ・問い合わせ）を取れるよう UI に適切なエラー表示を追加する。

### 問題

- `setLLMAdapterFailed()` 呼び出し後の Renderer 側への通知パスが未整備
- `skill-creator:get-adapter-status` IPC チャネルが未定義
- `LLMAdapterErrorBanner` コンポーネントが未実装
- `SkillLifecyclePanel` に LLMAdapter エラー表示の統合がない

### 解決策

pull（`skill-creator:get-adapter-status` invoke）+ push（`skill-creator:adapter-status-changed` on）の組み合わせで、Renderer がアダプタ状態をリアルタイムに把握できるようにする。

## オーケストレーション方針

- Phase 1 で既存実装と受入条件を固定する。
- Phase 2-3 は `skill準拠検証` と `多角的思考分析` を並列で回し、Phase 3 で合流してから先へ進む。
- Phase 4-5 は TDD の順序を守り、テスト作成を先に固定してから実装へ進む。
- Phase 6-10 は追加テスト、カバレッジ、リファクタリング、品質、最終レビューを直列で進める。
- Phase 11 は UI task として、手動テストとスクリーンショット証跡を同一 wave で収集する。
- Phase 12 は aiworkflow-requirements と task-specification-creator の正本を同時に更新し、Step 1 と Step 2 を分けて閉じる。
- Phase 13 はユーザーの明示承認があるまで `blocked` のまま維持する。

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                   | ステータス |
| ----- | -------------------- | -------------------------------------------------------- | ---------- |
| 1     | 要件定義             | [phase-01-requirements.md](phase-01-requirements.md)     | 未実施     |
| 2     | 設計                 | [phase-02-design.md](phase-02-design.md)                 | 未実施     |
| 3     | 設計レビューゲート   | [phase-03-design-review.md](phase-03-design-review.md)   | 未実施     |
| 4     | テスト作成           | [phase-04-test-creation.md](phase-04-test-creation.md)   | 未実施     |
| 5     | 実装                 | [phase-05-implementation.md](phase-05-implementation.md) | 未実施     |
| 6     | テスト拡充           | [phase-06-test-expansion.md](phase-06-test-expansion.md) | 未実施     |
| 7     | テストカバレッジ確認 | [phase-07-coverage.md](phase-07-coverage.md)             | 未実施     |
| 8     | リファクタリング     | [phase-08-refactoring.md](phase-08-refactoring.md)       | 未実施     |
| 9     | 品質保証             | [phase-09-quality.md](phase-09-quality.md)               | 未実施     |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)     | 未実施     |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)       | 未実施     |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)   | 未実施     |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)       | blocked    |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## 実装済み基盤（開始前確認済み）

| 実装済み項目                                    | ファイル                       | 行        |
| ----------------------------------------------- | ------------------------------ | --------- |
| `_llmAdapterStatus` / `setLLMAdapterFailed()`   | `RuntimeSkillCreatorFacade.ts` | 146-229   |
| `setLLMAdapterFailed()` の呼び出し              | `main/ipc/index.ts`            | 1060-1063 |
| `LLMAdapterStatus` 型 / `SkillCreatorErrorCode` | `shared/types/skillCreator.ts` | 338-344   |

## 未実装項目（本タスクのスコープ）

| 未実装項目                                          | 対象ファイル                   |
| --------------------------------------------------- | ------------------------------ |
| IPC チャネル `skill-creator:get-adapter-status`     | `preload/channels.ts`          |
| IPC チャネル `skill-creator:adapter-status-changed` | `preload/channels.ts`          |
| `onAdapterStatusChanged` コールバック               | `RuntimeSkillCreatorFacade.ts` |
| IPC ハンドラ                                        | `main/ipc/creatorHandlers.ts`  |
| Preload API メソッド                                | `preload/skill-creator-api.ts` |
| `LLMAdapterErrorBanner.tsx`                         | renderer/components/skill/     |
| `useLLMAdapterStatus.ts`                            | renderer/.../hooks/            |
| `SkillLifecyclePanel` 統合                          | renderer/components/skill/     |

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/task-rt-01-llm-adapter-error-propagation --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                                                                       |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義サマリー, 受入条件一覧, 現状棚卸し                                                                                                                       |
| 2     | IPC 4層設計表, コンポーネント設計, フック設計                                                                                                                    |
| 3     | 設計レビューゲート判定                                                                                                                                           |
| 4     | IPC ハンドラ単体テスト, コンポーネントテスト                                                                                                                     |
| 5     | channels.ts 修正, Facade コールバック, creatorHandlers 修正, skill-creator-api 修正, LLMAdapterErrorBanner.tsx, useLLMAdapterStatus.ts, SkillLifecyclePanel 統合 |
| 6     | テスト拡充（push 通知、競合状態）                                                                                                                                |
| 7     | カバレッジ確認                                                                                                                                                   |
| 8     | リファクタリング（命名・コード整理）                                                                                                                             |
| 9     | typecheck + vitest PASS                                                                                                                                          |
| 10    | 最終レビューゲート PASS                                                                                                                                          |
| 11    | 手動テスト検証レポート                                                                                                                                           |
| 12    | ドキュメント更新・system spec 同期                                                                                                                               |
| 13    | PR 作成（ユーザー指示待ち）                                                                                                                                      |
