# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 11                                           |
| タスクID   | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001    |
| タスク名   | Renderer 側エラーメッセージ UI 表示 E2E 確認 |
| 前提Phase  | Phase 10（PASS）                             |
| 後続Phase  | Phase 12                                     |
| 作成日     | 2026-04-13                                   |
| ステータス | completed                                    |

## タスク種別判定

| 分類           | 該当 | 理由                                                   |
| -------------- | ---- | ------------------------------------------------------ |
| UI task        | ✅   | `data-testid="skill-lifecycle-error"` の表示確認が目的 |
| docs-only task | ❌   | テスト実装を含む                                       |
| NON_VISUAL     | △    | Vitest テストで証跡が残っていれば実地操作不要          |

**判定**: Vitest テスト（UT-01〜UT-11）が主証跡となるため、
Playwright/手動スクリーンショットは補完的証跡として位置づける。

**注意（[Feedback BEFORE-QUIT-001]）**: 実地操作が不可能な環境の場合は
「実地操作不可」を明記し、自動テスト結果 + 既知制限リストを代替証跡として残す。

## 3層評価

### 1. Semantic 評価（自動テスト証跡）

```bash
# UT-01〜UT-11 の全通過を確認
pnpm --filter @repo/desktop exec vitest run \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.test.tsx \
  --reporter=verbose 2>&1 | tee outputs/phase-11/vitest-result.txt
```

### 2. Visual 評価（UI 表示確認）

実機確認が可能な場合:

```bash
# Electron 開発モードで起動
pnpm --filter @repo/desktop dev
```

確認手順:

1. アプリを起動し、スキル実行画面を開く
2. 意図的に失敗するスキルを実行する（または `onWorkflowStateChanged` を手動発火）
3. `data-testid="skill-lifecycle-error"` が表示されることを確認する
4. スクリーンショットを `outputs/phase-11/screenshots/` に保存する

実機確認が不可能な場合:

- NON_VISUAL として記録する
- 理由: 「Electron ビルド環境が CI では利用不可」等を明記
- 代替証跡: Vitest テスト結果（UT-01〜UT-11 全通過）

### 3. AI UX 評価

| 観点                     | 確認内容                                                 | 判定 |
| ------------------------ | -------------------------------------------------------- | ---- |
| エラーメッセージの視認性 | `role="alert"` が適切に設定されているか                  | -    |
| アクセシビリティ         | スクリーンリーダーでエラーが読み上げられるか             | -    |
| エラー表示の優先順位     | `localError > workflowError > skillError` の順序が適切か | -    |

## 既知の制限

| 制限事項                                                             | 対応                                       |
| -------------------------------------------------------------------- | ------------------------------------------ |
| IPC variadic 化の runtime 動作は Vitest モックでは完全に再現できない | Phase 11 実機確認または将来の E2E タスクへ |
| `applyWorkflowSnapshot` のリセットタイミングは環境依存               | UT-08 で論理的に確認済み                   |
| Playwright E2E は本タスクのスコープ外                                | 必要であれば別タスクとして未タスク化する   |

## 参照資料

| 参照資料         | パス                                              | 説明            |
| ---------------- | ------------------------------------------------- | --------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | Phase 10 成果物 |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |

## 成果物

| 成果物                 | パス                                     | 説明                                   |
| ---------------------- | ---------------------------------------- | -------------------------------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md` | 3層評価結果（証跡の主ソース明記）      |
| 証跡インデックス       | `outputs/phase-11/evidence-index.md`     | 証跡ファイルの一覧                     |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.md`    | Visual 確認計画（NON_VISUAL 理由含む） |

**注意（[Feedback 4]）**: `manual-test-result.md` のメタ情報に
「証跡の主ソース（自動テスト名/件数）」と「スクリーンショットを作らない理由（NON_VISUAL の場合）」を必ず明記する。

## 完了条件

- [ ] 3層評価の結果が記録されている
- [ ] 証跡の主ソース（Vitest テスト UT-01〜UT-11 全通過）が記録されている
- [ ] NON_VISUAL の場合は「宣言」と理由が `screenshot-plan.md` に明記されている
- [ ] 発見した未タスク候補が `unassigned-task/` 配下に記録されている
- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 証跡が残っている
- [ ] 実行記録を残した

## 次のPhase

Phase 12: ドキュメント更新
