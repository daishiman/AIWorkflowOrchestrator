# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 13                               |
| Phase名    | PR作成                           |
| 前提Phase  | Phase 12                         |
| 後続Phase  | -（タスク完了）                  |
| ステータス | 未実施                           |
| 作成日     | 2026-02-12                       |
| 機能名     | UT-STORE-HOOKS-TEST-REFACTOR-001 |

---

## 目的

成果物を最終確認し、Pull Requestを作成する。

---

## 実行タスク

### タスク1: 成果物の最終確認

**確認リスト**:

- [ ] 全Phase（1-12）の成果物が揃っている
- [ ] artifacts.jsonの全Phaseステータスが「完了」
- [ ] テストが全てPASS
- [ ] カバレッジ基準達成
- [ ] ドキュメントが完成

### タスク1.5: タスク完了処理【必須】

**実行手順**:

1. 仕様書ディレクトリの移動（完了後）:

   ```bash
   # タスク完了時にcompleted-tasksに移動
   mv docs/30-workflows/UT-STORE-HOOKS-TEST-REFACTOR-001 docs/30-workflows/completed-tasks/

   # 移動を確認
   ls docs/30-workflows/completed-tasks/ | grep UT-STORE-HOOKS-TEST-REFACTOR-001
   ```

2. artifacts.jsonの全Phaseステータスを「完了」に更新

3. タスクワークフローの更新:
   - `task-workflow.md` の該当タスクを完了ステータスに更新

4. 移動をコミット:

   ```bash
   git add docs/30-workflows/
   git commit -m "docs(workflows): UT-STORE-HOOKS-TEST-REFACTOR-001をcompleted-tasksに移動"
   ```

### タスク2: コミット準備

**確認項目**:

```bash
# Lint確認
pnpm --filter @repo/desktop lint

# 型チェック
pnpm --filter @repo/desktop typecheck

# 全テスト実行
pnpm --filter @repo/desktop test -- --run
```

### タスク3: PR作成

> **⚠️ 注意**: PR作成はユーザーの明示的な許可を得てから実行すること

**実行手順**:

1. **ユーザーにローカル動作確認を依頼**
2. **変更サマリーの提示と許可確認**:
   - [ ] ユーザーに変更内容のサマリーを提示
   - [ ] ユーザーからPR作成の許可を取得
   - [ ] ローカルでの最終検証完了を報告
3. **`/ai:diff-to-pr` を実行**（ユーザー許可後）:
   ```
   /ai:diff-to-pr
   ```
4. **実行結果の確認**: PRが作成されCIが通過していること
5. **フォールバック**（`/ai:diff-to-pr` が使えない場合）: git/gh CLIで手動対応（下記PR情報を使用）

**PR情報**:

- **ブランチ名**: `task/UT-STORE-HOOKS-TEST-REFACTOR-001`
- **PRタイトル**: `refactor(test): Store HooksテストをrenderHookパターンに移行 (UT-STORE-HOOKS-TEST-REFACTOR-001)`
- **ベースブランチ**: `main`
- **関連Issue**: #779

**PR本文テンプレート**:

```markdown
## Summary

- agentSlice.selectors.test.tsのgetState()パターンをrenderHookパターンに移行
- 全Sliceテスト間の参照安定性テストパターンを統一
- P31（Zustand Hook無限ループ問題）の再発防止テストを強化

## Test Plan

- [ ] agentSliceセレクタテスト全PASS
- [ ] authModeSliceセレクタテスト全PASS（リグレッションなし）
- [ ] llmSliceセレクタテスト全PASS（リグレッションなし）
- [ ] カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] TypeScript型エラー0件
- [ ] ESLintエラー0件
```

### タスク4: CI確認

- [ ] CI/CDパイプラインが全てGreen
- [ ] 自動テストが全てPASS

---

## 参照資料

| 参照資料             | パス                                      | 内容               |
| -------------------- | ----------------------------------------- | ------------------ |
| Phase 10レビュー結果 | `outputs/phase-10/final-review-result.md` | 最終レビュー判定   |
| Phase 11テスト結果   | `outputs/phase-11/manual-test-result.md`  | 手動テスト結果     |
| Phase 12ドキュメント | `outputs/phase-12/`                       | ドキュメント成果物 |
| PR作成ルール         | `.claude/rules/07-git-and-tooling.md`     | PR作成ルール       |

---

## 成果物

| 成果物       | パス                          | 説明           |
| ------------ | ----------------------------- | -------------- |
| PR情報       | `outputs/phase-13/pr-info.md` | PR URL等の記録 |
| Pull Request | GitHub UI                     | PR URL         |

---

## 完了条件

- [ ] 全Phase（1-12）の成果物確認完了
- [ ] コミット前チェック（lint, typecheck, test）全PASS
- [ ] タスク完了処理（completed-tasks移動）が完了
- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] PR作成完了（ユーザー許可後）
- [ ] CI/CDパイプライン全Green
- [ ] **本Phase内の全タスクを100%実行完了**
