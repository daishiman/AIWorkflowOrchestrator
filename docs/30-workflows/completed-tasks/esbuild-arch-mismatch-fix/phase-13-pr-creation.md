# Phase 13: PR作成

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 13                                 |
| Phase名    | PR作成                             |
| 対象機能   | UT-RT-06-ESBUILD-ARCH-MISMATCH-001 |
| 前Phase    | Phase 12: ドキュメント更新         |
| 次Phase    | -（ワークフロー完了）              |
| ステータス | 未実施                             |
| 作成日     | 2026-03-30                         |

---

## 目的

全 Phase（1〜12）の成果物を確認し、ユーザーの明示的な承認を得た上で Pull Request を作成する。
CI 通過を確認し、レビュー準備完了状態にする。

**重要**: PR作成はユーザーの明示的な承認後にのみ実行すること。

---

## 実行タスク

### Task 1: Pre-PR チェックリスト【必須】

PR作成前に以下の全項目を確認する:

| No  | チェック項目                           | 確認方法                                                        |
| --- | -------------------------------------- | --------------------------------------------------------------- |
| 1   | Phase 1〜12 全て完了                   | artifacts.json の全 Phase ステータスを確認                      |
| 2   | artifacts.json が最新                  | 全 Phase の成果物が登録されていることを確認                     |
| 3   | outputs/ ディレクトリが充足            | 各 Phase の必須成果物が存在することを確認                       |
| 4   | タスクドキュメント内に TODO/FIXME なし | `docs/30-workflows/esbuild-arch-mismatch-fix/` 内を検索         |
| 5   | Phase 12 準拠チェック PASS             | `outputs/phase-12/phase12-task-spec-compliance-check.md` を確認 |

成果物: `outputs/phase-13/pr-checklist.md`

### Task 2: コミット準備【必須】

#### ステージング対象

```
docs/30-workflows/esbuild-arch-mismatch-fix/**
```

#### コミットメッセージ案

```
docs(esbuild-arch-mismatch): UT-RT-06-ESBUILD-ARCH-MISMATCH-001 タスク仕様書 (#1710)

esbuild darwin アーキテクチャ不整合の解消に関するタスク仕様書一式。
Phase 1〜13 の実行仕様書、環境診断手順、再発防止ドキュメントを含む。
```

### Task 3: 変更サマリー提示と許可確認【必須】

ユーザーに以下の変更サマリーを提示し、PR作成の明示的な許可を得る:

| カテゴリ     | 変更内容                                                                 |
| ------------ | ------------------------------------------------------------------------ |
| タスク仕様書 | Phase 1〜13 の全仕様書（index.md + phase-\*.md）                         |
| 成果物       | outputs/ 配下の Phase 実行結果                                           |
| 対象 Issue   | [#1710](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1710) |

**重要**: ユーザーから明示的な許可を得るまで Task 4 に進まないこと。

### Task 4: PR作成【ユーザー承認後のみ】

ユーザーの許可を得た後、PR作成を実行する。

| 項目       | 値                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------- |
| ブランチ名 | `task/UT-RT-06-ESBUILD-ARCH-MISMATCH-001-spec`                                                  |
| PRタイトル | `[UT-RT-06-ESBUILD-ARCH-MISMATCH-001] esbuild darwin アーキテクチャ不整合の解消 - タスク仕様書` |
| 関連 Issue | #1710                                                                                           |

**PR本文に含める内容**:

- Summary: タスク仕様書の概要（環境修正、再発防止手順、Phase 1〜13 仕様）
- Test plan: Phase 11 手動テスト結果のサマリー
- Related issues: #1710

```
/ai:diff-to-pr
```

### Task 5: CI確認【必須】

| 確認項目   | 期待結果   |
| ---------- | ---------- |
| テスト     | 全て成功   |
| Lint       | エラーなし |
| 型チェック | エラーなし |
| ビルド     | 成功       |

CI が失敗した場合は原因を調査し、修正を行う。

---

## 参照資料

| 資料名                | パス                                                     | 説明            |
| --------------------- | -------------------------------------------------------- | --------------- |
| 最終レビュー結果      | `outputs/phase-10/final-review-result.md`                | Phase 10 成果物 |
| 手動テスト結果        | `outputs/phase-11/manual-test-result.md`                 | Phase 11 成果物 |
| ドキュメント変更履歴  | `outputs/phase-12/documentation-changelog.md`            | Phase 12 成果物 |
| Phase 12 準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 成果物 |

---

## 成果物

| 成果物            | パス                               | 説明                |
| ----------------- | ---------------------------------- | ------------------- |
| PR チェックリスト | `outputs/phase-13/pr-checklist.md` | Pre-PR チェック結果 |

---

## 完了条件

- [ ] Pre-PR チェックリストの全項目が PASS
- [ ] 変更サマリーをユーザーに提示済み
- [ ] ユーザーから PR 作成の明示的な許可を取得済み
- [ ] 全変更がコミットされている
- [ ] PR が作成されている
- [ ] CI が通過している
- [ ] **本Phase内の全タスクを100%実行完了**

---

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/esbuild-arch-mismatch-fix/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep esbuild-arch-mismatch-fix

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): esbuild-arch-mismatch-fixをcompleted-tasksに移動"
git push
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 1: Pre-PR チェックリスト
3. Task 2: コミット準備
4. Task 3: 変更サマリー提示と許可確認
5. Task 4: PR作成
6. Task 5: CI確認
7. タスク完了処理
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/esbuild-arch-mismatch-fix --phase 13
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### 実行タスク

| タスク                             | 結果            | 備考     |
| ---------------------------------- | --------------- | -------- |
| Task 1: Pre-PR チェックリスト      | {{完了/未完了}} | {{備考}} |
| Task 2: コミット準備               | {{完了/未完了}} | {{備考}} |
| Task 3: 変更サマリー提示と許可確認 | {{完了/未完了}} | {{備考}} |
| Task 4: PR作成                     | {{完了/未完了}} | {{備考}} |
| Task 5: CI確認                     | {{完了/未完了}} | {{備考}} |

### タスク完了処理

- [ ] タスクディレクトリをcompleted-tasksに移動済み

### 発見事項

- 良かった点: {{GOOD_POINTS}}
- 問題点: {{ISSUES}}
- 改善提案: {{IMPROVEMENTS}}
```

---

## 次のPhase

なし（ワークフロー完了）
