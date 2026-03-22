# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                                  |
| ---------- | --------------------------------------------------- |
| Phase番号  | 11                                                  |
| 機能名     | LLMモデル選択インラインガイダンス追加               |
| タスクID   | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE               |
| 作成日     | 2026-03-21                                          |
| ステータス | 実施・証跡採取完了                                  |
| 依存       | [Phase 10 最終レビュー](./phase-10-final-review.md) |

## 目的

モデル未選択時の導線が ChatView / WorkspaceView の両方で成立しているかを current build 上で確認する。あわせて UI 変更タスクとして representative screenshot を保存し、Settings 遷移要求とキーボードフォーカスを証跡化する。

## 実行タスク

### Task 1: 手動テスト環境準備

```bash
pnpm --filter @repo/desktop build
pnpm --filter @repo/desktop screenshot:llm-selector-inline-guidance
```

- worktree 環境では `apps/desktop/scripts/capture-task-fix-llm-selector-inline-guidance-phase11.mjs` が current renderer entry を static server で公開し、Playwright から実画面 DOM と Settings 遷移要求を確認する。
- 実行証跡のタイムスタンプは `outputs/phase-11/screenshots/phase11-capture-metadata.json` を正本とする。

### Task 2: シナリオ1 — ChatView メインフロー

| ステップ | 操作                                   | 期待結果                               | 判定根拠                                      |
| -------- | -------------------------------------- | -------------------------------------- | --------------------------------------------- |
| 1        | Dashboard から ChatView を開く         | `data-testid="chat-view"` が表示される | metadata `TC-11-01.selector`                  |
| 2        | モデル未選択状態でヘッダー下を確認する | バナー文言と CTA が表示される          | `TC-11-01-chatview-inline-guidance-light.png` |
| 3        | 「設定画面へ」を押す                   | `currentView=settings` 要求が発火する  | metadata `checks.navigationToSettings=true`   |

### Task 3: シナリオ2 — WorkspaceView blocked guidance

| ステップ | 操作                                | 期待結果                                          | 判定根拠                                        |
| -------- | ----------------------------------- | ------------------------------------------------- | ----------------------------------------------- |
| 1        | Dashboard から WorkspaceView を開く | `data-testid="workspace-view"` が表示される       | metadata `TC-11-02.selector`                    |
| 2        | blocked guidance を確認する         | GuidanceBlock 内に `Settings を開く` が表示される | `TC-11-02-workspace-guidance-blocked-light.png` |
| 3        | CTA を押す                          | `currentView=settings` 要求が発火する             | metadata `checks.navigationToSettings=true`     |

### Task 4: シナリオ3 — ダークモード確認

| 確認項目            | 期待結果                                       | 判定根拠                                             |
| ------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| ChatView バナー表示 | dark theme でも文言・CTA の配置が保持される    | `TC-11-03-chatview-inline-guidance-dark.png`         |
| CTA 導線            | ダークモードでも Settings 遷移要求が維持される | metadata `TC-11-03.checks.navigationToSettings=true` |

### Task 5: シナリオ4 — アクセシビリティ確認

| 確認項目             | 期待結果                             | 判定根拠                                               |
| -------------------- | ------------------------------------ | ------------------------------------------------------ |
| Tab 移動             | CTA にフォーカスできる               | metadata `TC-11-04.checks.keyboardFocus=true`          |
| フォーカス状態の証跡 | フォーカスリング付き状態を保存できる | `TC-11-04-chatview-inline-guidance-keyboard-focus.png` |

## テストケース

| テストケース | シナリオ                                | 証跡ファイル                                                                        | 結果 |
| ------------ | --------------------------------------- | ----------------------------------------------------------------------------------- | ---- |
| TC-11-01     | ChatView メインフロー（light）          | `outputs/phase-11/screenshots/TC-11-01-chatview-inline-guidance-light.png`          | PASS |
| TC-11-02     | WorkspaceView blocked guidance（light） | `outputs/phase-11/screenshots/TC-11-02-workspace-guidance-blocked-light.png`        | PASS |
| TC-11-03     | ChatView ダークモード                   | `outputs/phase-11/screenshots/TC-11-03-chatview-inline-guidance-dark.png`           | PASS |
| TC-11-04     | ChatView キーボードフォーカス           | `outputs/phase-11/screenshots/TC-11-04-chatview-inline-guidance-keyboard-focus.png` | PASS |

## 画面カバレッジマトリクス

| テストケース | 画面 / 状態                              | 必須証跡                                                                            | 補足                                   |
| ------------ | ---------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------- |
| TC-11-01     | ChatView / モデル未選択 / light          | `outputs/phase-11/screenshots/TC-11-01-chatview-inline-guidance-light.png`          | 文言と CTA の存在確認                  |
| TC-11-02     | WorkspaceView / blocked guidance / light | `outputs/phase-11/screenshots/TC-11-02-workspace-guidance-blocked-light.png`        | GuidanceBlock から Settings 導線を確認 |
| TC-11-03     | ChatView / モデル未選択 / dark           | `outputs/phase-11/screenshots/TC-11-03-chatview-inline-guidance-dark.png`           | dark theme の代表証跡                  |
| TC-11-04     | ChatView / keyboard focus                | `outputs/phase-11/screenshots/TC-11-04-chatview-inline-guidance-keyboard-focus.png` | 視覚証跡 + metadata の二重確認         |

## 手動テスト結果

| シナリオ                         | 結果     | 備考                                                                   |
| -------------------------------- | -------- | ---------------------------------------------------------------------- |
| シナリオ1: ChatView メインフロー | PASS     | Settings 遷移要求を metadata で確認。代表 screenshot 1 件を保存        |
| シナリオ2: WorkspaceView フロー  | PASS     | blocked guidance の CTA 表示と Settings 遷移要求を確認                 |
| シナリオ3: ダークモード確認      | PASS     | dark theme screenshot を保存し、CTA 導線維持を metadata で確認         |
| シナリオ4: アクセシビリティ確認  | PASS     | keyboard focus screenshot と `keyboardFocus=true` を確認               |
| **総合判定**                     | **PASS** | `generatedAt=2026-03-21T00:20:48.902Z` の Phase 11 evidence 一式を保存 |

## 参照資料

| ファイル                                                                                                                                | 用途                                |
| --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                                             | Phase 11 screenshot / evidence 契約 |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-2-design.md`                                          | Guidance 導線設計                   |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-5-implementation.md`                                  | 実装対象ファイル                    |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-6-test-expansion.md`                                  | 追加テストと境界条件                |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-7-coverage-check.md`                                  | coverage gate の記録                |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-8-refactoring.md`                                     | リファクタリング境界と残存リスク    |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-9-quality-assurance.md`                               | test / lint / typecheck の検証結果  |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-10-final-review.md`                                   | 最終レビュー判定と未タスク化対象    |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-11/screenshot-plan.json`                      | capture plan                        |
| `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-11/screenshots/phase11-capture-metadata.json` | 実行結果 metadata                   |

## 実行手順

### Step 1: current build を生成する

`pnpm --filter @repo/desktop build`

### Step 2: capture script を実行する

`pnpm --filter @repo/desktop screenshot:llm-selector-inline-guidance`

### Step 3: screenshot / metadata / result を突合する

`outputs/phase-11/manual-test-result.md` と `outputs/phase-11/screenshots/phase11-capture-metadata.json` を 1:1 で確認する。

## 統合テスト連携

- ChatView 側は `LLMGuidanceBanner.test.tsx` と `ChatView.guidance.test.tsx` で UI 条件と Settings 遷移を固定する。
- Workspace 側は `WorkspaceChatPanel.guidance.test.tsx` で `GuidanceBlock` の CTA 接続を固定する。
- Phase 11 は代表 screenshot と callback 判定を補完し、UI regression を visual evidence として残す。

## 成果物

| 成果物                   | パス                                        |
| ------------------------ | ------------------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` |
| 手動テスト結果記録       | `outputs/phase-11/manual-test-result.md`    |
| 発見課題一覧             | `outputs/phase-11/discovered-issues.md`     |
| スクリーンショット計画   | `outputs/phase-11/screenshot-plan.json`     |
| スクリーンショット証跡   | `outputs/phase-11/screenshots/`             |

## 完了条件

- [x] シナリオ1（ChatView メインフロー）が PASS
- [x] シナリオ2（WorkspaceView フロー）が PASS
- [x] シナリオ3（ダークモード）が screenshot で確認済み
- [x] シナリオ4（アクセシビリティ）が metadata + screenshot で確認済み
- [x] `outputs/phase-11/manual-test-checklist.md` が作成されている
- [x] `outputs/phase-11/manual-test-result.md` に TC-ID と証跡パスが記録されている
- [x] `outputs/phase-11/discovered-issues.md` が 0 件でも出力されている
- [x] `outputs/phase-11/screenshots/` に representative evidence が配置されている

## 次Phase

[Phase 12: ドキュメント](./phase-12-documentation.md)
