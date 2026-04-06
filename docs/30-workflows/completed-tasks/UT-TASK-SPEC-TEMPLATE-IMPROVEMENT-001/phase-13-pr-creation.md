# Phase 13: PR 作成・CI 確認

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| Phase      | 13                                                                 |
| 機能名     | UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001                              |
| タスク名   | task-specification-creator テンプレートの validator 必須見出し強化 |
| 前提Phase  | Phase 12                                                           |
| 後続Phase  | -（マージ後完了）                                                  |
| 作成日     | 2026-04-06                                                         |
| ステータス | スキップ                                                           |

## 目的

変更をコミットし、Pull Request を作成して CI が全てグリーンになることを確認する。

## 実行タスク

### タスク1: コミット作成

**目的**: 変更内容を適切なコミットメッセージでコミットする

**実行手順**:

1. 変更ファイルを確認する:
   - `.claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js`
   - `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`
   - `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md`
   - テストファイル
2. コミットメッセージを作成する（例: `fix(task-spec): validator必須見出し強化とchangelogテンプレートフィールド追加 #1917`）
3. コミットを作成する（`--no-verify` は使用禁止）

**実行コマンド**:

```bash
git status
git diff
git add .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js
git add .claude/skills/task-specification-creator/assets/implementation-guide-template.md
git add .claude/skills/task-specification-creator/assets/documentation-changelog-template.md
git add ".claude/skills/task-specification-creator/scripts/__tests__/"
git commit -m "fix(task-spec): validator必須見出し強化とchangelogテンプレートフィールド追加 #1917"
```

---

### タスク2: PR 作成

**目的**: GitHub Pull Request を作成する

**実行手順**:

1. ブランチをリモートにプッシュする
2. PR を作成する
3. PR の説明に以下を含める:
   - 修正の背景と目的
   - 変更内容（validator 修正、テンプレート修正）
   - テスト追加内容
   - 関連 Issue (#1917)

**実行コマンド**:

```bash
git push origin HEAD

gh pr create \
  --title "fix(task-spec): validator必須見出し強化とchangelogテンプレートフィールド追加" \
  --body "## 概要
Issue #1917 の修正。

### 変更内容
- \`validate-phase12-implementation-guide.js\`: \`part2_usage_example\` チェックを全文から \`### 使用例\` 見出しを直接検査するよう修正
- \`implementation-guide-template.md\`: \`## Part 2\` 配下の \`### 使用例\` 配置を明確化
- \`documentation-changelog-template.md\`: 変更者・関連Issue/PR・validator実行結果・current/baseline・artifacts同期結果の5フィールドを追加
- テスト: \`### 使用例\` 見出し検査の正常系・異常系を追加

## テスト
- 全既存テスト PASS
- 新規テスト TC-01〜TC-07 PASS

Closes #1917"
```

---

### タスク3: CI 確認

**目的**: CI が全てグリーンになることを確認する

**実行手順**:

1. PR の CI ステータスを確認する
2. CI が失敗した場合は原因を調査して修正する

**実行コマンド**:

```bash
gh pr checks
```

---

## 参照資料

| 参照資料         | パス                                        | 用途           |
| ---------------- | ------------------------------------------- | -------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 変更内容の確認 |
| 最終レビュー結果 | `outputs/phase-10/final-review.md`          | PR 説明の根拠  |

## 成果物

| 成果物   | パス           | 内容               |
| -------- | -------------- | ------------------ |
| コミット | git history    | 変更内容のコミット |
| PR       | GitHub URL     | Pull Request       |
| CI 結果  | GitHub Actions | CI グリーン確認    |

## 完了条件

- [ ] コミットが作成されている（`--no-verify` 不使用）
- [ ] PR が作成されている
- [ ] CI が全てグリーン
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した
