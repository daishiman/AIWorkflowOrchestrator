# Phase 11: 手動テスト

## メタ情報

| 項目          | 値                                                                                   |
| ------------- | ------------------------------------------------------------------------------------ |
| Phase番号     | 11                                                                                   |
| 機能名        | WorkspaceChat ストリーミングエラーUX改善                                             |
| タスクID      | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR                                                 |
| 作成日        | 2026-03-20                                                                           |
| ステータス    | 実施・証跡採取完了                                                                   |
| 前Phase成果物 | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-10-final-review.md` |

## 目的

Workspace Chat の代表的な streaming error UX を current build 上で視覚確認し、light/dark 両テーマで CTA と dismiss/recovery の画面証跡を残す。あわせて manual result / metadata / screenshot plan を 1:1 で整合させる。

## 実行タスク

- Task 1: current build と `workspace-layout` harness を使って screenshot 5 件を取得する
- Task 2: API_KEY_MISSING / NETWORK_ERROR / RATE_LIMIT / dismiss / VALIDATION_ERROR の 5 シナリオを検証する
- Task 3: screenshot / metadata / manual result / coverage matrix を突合する

### Task 1: 手動テスト環境準備

```bash
pnpm --filter @repo/desktop build
pnpm --filter @repo/desktop screenshot:workspace-chat-stream-error
```

- capture script: `apps/desktop/scripts/capture-task-fix-workspace-chat-stream-error-phase11.mjs`
- capture method: `current-renderer-entry + workspace-layout-harness + seeded-llm-selection`
- 実行タイムスタンプ正本: `outputs/phase-11/screenshots/phase11-capture-metadata.json`

## テストケース

| テストケース | シナリオ                               | 証跡ファイル                                                                 | 結果 |
| ------------ | -------------------------------------- | ---------------------------------------------------------------------------- | ---- |
| TC-11-01     | API_KEY_MISSING / Settings CTA / light | `outputs/phase-11/screenshots/TC-11-01-settings-cta-light.png`               | PASS |
| TC-11-02     | NETWORK_ERROR / Retry CTA / light      | `outputs/phase-11/screenshots/TC-11-02-retry-cta-light.png`                  | PASS |
| TC-11-03     | RATE_LIMIT / hint + Retry / dark       | `outputs/phase-11/screenshots/TC-11-03-rate-limit-hint-dark.png`             | PASS |
| TC-11-04     | dismiss 後の回復状態 / light           | `outputs/phase-11/screenshots/TC-11-04-dismissed-error-light.png`            | PASS |
| TC-11-05     | VALIDATION_ERROR / no-action / dark    | `outputs/phase-11/screenshots/TC-11-05-validation-error-no-actions-dark.png` | PASS |

## 画面カバレッジマトリクス

| テストケース | 画面 / 状態                              | 必須証跡                                                                     | 補足                                        |
| ------------ | ---------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------- |
| TC-11-01     | Workspace Chat / light / API_KEY_MISSING | `outputs/phase-11/screenshots/TC-11-01-settings-cta-light.png`               | Settings CTA が表示され、retry CTA は出ない |
| TC-11-02     | Workspace Chat / light / NETWORK_ERROR   | `outputs/phase-11/screenshots/TC-11-02-retry-cta-light.png`                  | Retry CTA が表示される                      |
| TC-11-03     | Workspace Chat / dark / RATE_LIMIT       | `outputs/phase-11/screenshots/TC-11-03-rate-limit-hint-dark.png`             | hint と Retry CTA が同時に出る              |
| TC-11-04     | Workspace Chat / light / dismissed state | `outputs/phase-11/screenshots/TC-11-04-dismissed-error-light.png`            | alert 消滅後に入力面が回復している          |
| TC-11-05     | Workspace Chat / dark / VALIDATION_ERROR | `outputs/phase-11/screenshots/TC-11-05-validation-error-no-actions-dark.png` | アクション CTA なしの non-action error      |

## 手動テスト結果

| シナリオ               | 結果 | 備考                                                                          |
| ---------------------- | ---- | ----------------------------------------------------------------------------- |
| AC-1: Settings 誘導    | PASS | TC-11-01 で light theme の CTA を確認                                         |
| AC-2: Retry 導線       | PASS | TC-11-02 で retry CTA、runtime test `R-26` で再送動作を確認                   |
| AC-3: RATE_LIMIT hint  | PASS | TC-11-03 で dark theme hint と retry CTA を確認                               |
| AC-4: non-action error | PASS | TC-11-05 で CTA が出ないことを確認                                            |
| AC-5: dismiss 後の回復 | PASS | TC-11-04 で alert 消滅と入力面回復を確認                                      |
| Apple HIG / a11y       | PASS | light/dark の色・角丸・`role="alert"`・aria-label を code / screenshot で確認 |
| 総合判定               | PASS | 5/5 screenshot、metadata、manual result の整合を確認済み                      |

## 参照資料

| ドキュメント          | パス                                                                                              | 参照目的             |
| --------------------- | ------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 1 受入基準      | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-1-requirements.md`               | AC-1〜AC-6           |
| Phase 5 実装          | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-5-implementation.md`             | UI / hook 実装範囲   |
| Phase 6 テスト拡充    | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-6-test-expansion.md`             | runtime / panel test |
| Phase 10 最終レビュー | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-10-final-review.md`              | PASS 判定            |
| screenshot plan       | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-11/screenshot-plan.json` | capture 方針         |

## 実行手順

1. `pnpm --filter @repo/desktop build` で current build を生成する。
2. `pnpm --filter @repo/desktop screenshot:workspace-chat-stream-error` を実行する。
3. `outputs/phase-11/screenshots/*.png` と `phase11-capture-metadata.json` を確認する。
4. `manual-test-checklist.md` / `manual-test-result.md` / 本ファイルの TC と証跡を 1:1 で確認する。

## 統合テスト連携

- `useWorkspaceChatController.runtime.test.ts` が retry / dismiss / state reset を固定する。
- `WorkspaceChatPanel.runtime.test.tsx` が banner 表示と inline fallback 抑止を固定する。
- `StreamingErrorDisplay.test.tsx` と `mapLLMErrorToStreamingError.test.ts` が action 分岐を固定する。
- Phase 11 screenshot は unit/runtime test で取り切れない visual contract を補完する。

## 成果物

| 成果物          | パス                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| 手動テスト仕様  | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-11-manual-test.md`                   |
| 実施チェック    | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-11/manual-test-checklist.md` |
| 手動テスト結果  | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-11/manual-test-result.md`    |
| 発見課題        | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-11/discovered-issues.md`     |
| screenshot plan | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-11/screenshot-plan.json`     |
| screenshots     | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-11/screenshots/`             |

## 完了条件

- [x] TC-11-01〜TC-11-05 の screenshot を取得した
- [x] `manual-test-checklist.md` を作成した
- [x] `manual-test-result.md` を作成した
- [x] `discovered-issues.md` を 0 件でも出力した
- [x] `phase11-capture-metadata.json` と screenshot plan を保存した
- [x] AC-1〜AC-5 と visual contract の証跡が揃っている

## 次Phase

Phase 12: ドキュメント (`phase-12-documentation.md`)
