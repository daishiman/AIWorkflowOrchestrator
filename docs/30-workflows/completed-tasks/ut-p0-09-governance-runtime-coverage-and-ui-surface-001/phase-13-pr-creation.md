# Phase 13: PR 作成

## メタ情報

| 項目   | 値                                                      |
| ------ | ------------------------------------------------------- |
| Phase  | 13                                                      |
| 機能名 | ut-p0-09-governance-runtime-coverage-and-ui-surface-001 |
| 作成日 | 2026-04-02                                              |

## 目的

ユーザーの明示承認後、PR を作成し CI を確認する。タスクディレクトリを completed-tasks に移動する。

## 実行タスク

- タスク1: ユーザー承認確認【必須・このPhase開始前】
- タスク2: PR 作成
- タスク3: CI 確認
- タスク4: タスクディレクトリの移動

## 参照資料

| 資料名       | パス                                       | 説明                     |
| ------------ | ------------------------------------------ | ------------------------ |
| 実装ガイド   | `outputs/phase-12/implementation-guide.md` | PR 本文の元資料          |
| 最終レビュー | `outputs/phase-10/final-review-result.md`  | 受入条件の最終判定       |
| 手動テスト   | `outputs/phase-11/manual-test-report.md`   | Phase 11 evidence の要点 |

## 実行手順

### ステップ1: ユーザー承認確認

**注意**: このフェーズはユーザーが「PR を作成してください」と明示的に指示するまで実行しない。

### ステップ2: PR 作成

```bash
gh pr create \
  --title "feat(governance): UT-P0-09 全フェーズ governance 適用と renderer 可視化 #1791" \
  --body "..."
```

**PR 本文に含める内容**:

- Summary: 実装内容の箇条書き
- 関連 Issue: Closes #1791
- Test plan: テスト実行方法
- Screenshots: Phase 11 で撮影した画像リンク

### ステップ3: CI 確認

```bash
gh pr checks
```

CI が全て PASS するまで確認。

### ステップ4: タスクディレクトリ移動

```bash
mv docs/30-workflows/ut-p0-09-governance-runtime-coverage-and-ui-surface-001 \
   docs/30-workflows/completed-tasks/
```

## 成果物

| 成果物  | パス                          | 説明            |
| ------- | ----------------------------- | --------------- |
| PR 情報 | `outputs/phase-13/pr-info.md` | PR URL・CI 結果 |

## 完了条件

- [ ] ユーザーの明示承認が得られている
- [ ] PR が作成されている
- [ ] CI が全て PASS している
- [ ] タスクディレクトリが completed-tasks に移動されている
- [ ] **本Phase内の全タスクを100%実行完了**
