# Phase 11: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 11                              |
| Phase名    | PR作成                          |
| 前提Phase  | Phase 10                        |
| 後続Phase  | なし（ワークフロー完了）        |
| ステータス | 未実施                          |
| 作成日     | 2026-01-04                      |
| 機能名     | frontend-testing-best-practices |

---

## 目的

変更をコミットし、Pull Requestを作成してCIを確認する。

## 背景

全Phaseの実装が完了したため、PRを作成してレビュー・マージ準備を行う。

---

## 使用エージェント

なし（git/gh CLIで直接実行）

---

## 使用スキル

なし

---

## 参照資料

| 参照資料     | パス                                           | 内容           |
| ------------ | ---------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-8/final-review-result.md`       | Phase 8成果物  |
| 手動テスト   | `outputs/phase-9/manual-test-result.md`        | Phase 9成果物  |
| ドキュメント | `outputs/phase-10/documentation-update-log.md` | Phase 10成果物 |

---

## 実行手順

### ステップ1: 変更の確認

```bash
git status
git diff
```

### ステップ2: コミット

```bash
git add .
git commit -m "feat(testing): フロントエンドテストベストプラクティス導入

- MSW導入によるAPIモック
- Vitest UI導入
- E2Eテスト10本以上実装
- カバレッジ閾値80%設定
- テストユーティリティ整備
- CI/CD統合
- テストドキュメント作成"
```

### ステップ3: プッシュとPR作成

```bash
git push -u origin <branch>
gh pr create --title "feat(testing): フロントエンドテストベストプラクティス導入" --body "..."
```

### ステップ4: CI確認

```bash
gh pr checks <PR_NUMBER>
```

---

## 成果物

| 成果物 | パス                          | 内容     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-11/pr-info.md` | PR URL等 |

---

## 完了条件

- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している

---

## 依存関係

- **前提**: Phase 10 が完了していること
- **後続**: なし（ワークフロー完了）

---

## スキルフィードバック記録

なし

---

## ワークフロー完了

このPhaseをもってワークフローは完了です。
