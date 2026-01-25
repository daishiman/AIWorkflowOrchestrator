# Phase 13: PR作成 - TASK-3-1-A SDK query() 基本実装

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 13                          |
| Phase名    | PR作成                      |
| 前提Phase  | Phase 12 (ドキュメント更新) |
| 後続Phase  | なし（タスク完了）          |
| ステータス | 未実施                      |
| 作成日     | 2026-01-24                  |
| 機能名     | TASK-3-1-A-sdk-query        |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

---

## 実行タスク

### タスク1: ローカル動作確認依頼【必須】

**目的**: ユーザーにローカルでの動作確認を依頼

**実行手順**:

1. 変更内容のサマリーを提示
2. ローカル確認チェックリストを提示
3. ユーザーに確認を依頼

**ローカル確認チェックリスト**:

| #   | 確認項目                       | コマンド例                              |
| --- | ------------------------------ | --------------------------------------- |
| 1   | ビルドが成功する               | `pnpm --filter @repo/desktop build`     |
| 2   | 全テストがパスする             | `pnpm --filter @repo/desktop test`      |
| 3   | 型チェックがパスする           | `pnpm --filter @repo/desktop typecheck` |
| 4   | Lintエラーがない               | `pnpm --filter @repo/desktop lint`      |
| 5   | 実際の動作確認（該当する場合） | `pnpm --filter @repo/desktop dev`       |

### タスク2: 変更サマリー提示・許可確認【必須】

**目的**: PRを作成する前にユーザーの許可を得る

**実行手順**:

1. 変更ファイル一覧を提示
2. 主な変更内容を説明
3. PR作成の許可を確認

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しない

### タスク3: PR作成（許可後）

**目的**: `/ai:diff-to-pr` を使用してPRを作成

**実行手順**:

1. ユーザーの許可を確認
2. `/ai:diff-to-pr` を実行
3. PRが作成されたことを確認

### タスク4: CI確認

**目的**: CIが通過したことを確認

**実行手順**:

1. GitHub ActionsのCI結果を確認
2. 全てのチェックがパスしていることを確認
3. 失敗している場合は原因を調査

### タスク5: タスク完了処理

**目的**: タスクディレクトリを完了タスクフォルダに移動

**実行手順**:

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/skill-import-agent-system/tasks/TASK-3-1-A-sdk-query/ \
   docs/30-workflows/skill-import-agent-system/tasks/completed-task/

# 移動を確認
ls docs/30-workflows/skill-import-agent-system/tasks/completed-task/ | grep TASK-3-1-A

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-3-1-A-sdk-queryをcompleted-taskに移動"
git push
```

---

## 参照資料

| 参照資料         | パス                                          | 内容           |
| ---------------- | --------------------------------------------- | -------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント更新 | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

---

## 変更サマリーテンプレート

```markdown
# 変更サマリー - TASK-3-1-A SDK query() 基本実装

## 変更概要

SkillExecutor クラスを実装し、Claude Agent SDK の query() API を使用した
スキル実行機能の基盤を構築しました。

## 主な変更点

- SkillExecutor クラスの新規作成
- execute() メソッドによるスキル実行機能
- abort() メソッドによる実行中断機能
- ストリーミングレスポンスの IPC 配信

## 変更ファイル

- `apps/desktop/src/main/services/skill/SkillExecutor.ts` (新規)
- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts` (新規)
- `apps/desktop/src/main/services/skill/index.ts` (更新)
- `packages/desktop/package.json` (更新: 依存追加)

## テスト結果

- ユニットテスト: PASS
- 統合テスト: PASS
- カバレッジ: Line XX%, Branch XX%, Function XX%

## 依存パッケージ追加

- @anthropic-ai/claude-agent-sdk
- uuid
```

---

## 成果物

| 成果物 | パス                          | 内容     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

---

## PR情報テンプレート

```markdown
# PR情報 - TASK-3-1-A

## PR URL

{{PR_URL}}

## ブランチ

- ソース: task/TASK-3-1-A-sdk-query
- ターゲット: main

## CI結果

- ステータス: PASS / FAIL
- 確認日時: {{DATETIME}}

## マージ準備状況

- [ ] CIパス
- [ ] レビュー承認待ち
```

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-taskに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] タスクディレクトリを completed-task に移動

---

## 次のPhase

なし（ワークフロー完了）

**PRがマージされた後、このタスクは完了となります。**
