# Phase 13: PR作成

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 13                                     |
| 機能名 | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| 作成日 | 2026-02-12                             |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 参照資料

| 資料名       | パス                                            | 説明           |
| ------------ | ----------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`       | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`        | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md`   | Phase 12成果物 |
| 未タスク     | `outputs/phase-12/unassigned-task-detection.md` | Phase 12成果物 |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

#### 確認依頼項目

- アプリ起動と設定画面の基本動作
- 設定画面がぐるぐる回り続けないこと
- LLM/スキル選択が無限ループしないこと
- 認証モード切り替えが正常動作すること
- DevToolsで非推奨警告が表示されないこと

### 2. 変更サマリーの提示と許可確認【必須】

以下の変更サマリーをユーザーに提示し、PRを作成してよいか確認する。

#### 変更サマリーテンプレート

```markdown
## 変更内容

### Store Hooks無限ループ修正

#### 修正対象コンポーネント

- {{COMPONENT_1}}: useRefガード追加
- {{COMPONENT_2}}: 個別セレクタに移行
- {{COMPONENT_N}}: ...

#### 修正パターン

1. **useRefガード**: 初期化関数の二重実行を防止
2. **個別セレクタ移行**: 合成Hookから安定した参照を返すセレクタへ移行

### 影響

- 設定画面の無限ループ解消
- LLM/スキル選択の安定動作
- 認証モード切り替えの正常動作
- 非推奨警告の解消

### テスト結果

- ユニットテスト: {{N}}件 全PASS
- 手動テスト: 30件 全PASS
- カバレッジ: Line {{N}}%, Branch {{N}}%, Function {{N}}%
```

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること
- PRタイトルが70文字以内、descriptionにSummary（1-3箇条書き）とTest Planが含まれている

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# ブランチ作成（必要な場合）
git checkout -b fix/store-hooks-infinite-loop

# 変更をコミット
git add .
git commit -m "fix(store): Store Hooks無限ループ修正とコンポーネント移行

- useRefガードによる初期化関数の二重実行防止
- 個別セレクタへの移行で安定した参照を返却
- 設定画面/LLM選択/認証モード切り替えの安定動作

UT-STORE-HOOKS-COMPONENT-MIGRATION-001

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# リモートにプッシュ
git push -u origin fix/store-hooks-infinite-loop

# PRを作成
gh pr create --title "fix(store): Store Hooks無限ループ修正とコンポーネント移行" --body "..."
```

## 統合テスト連携【必須】

| 確認項目  | 判定基準                              |
| --------- | ------------------------------------- |
| CI通過    | GitHub Actions全ジョブ成功            |
| typecheck | `pnpm typecheck` エラーなし           |
| lint      | `pnpm lint` エラーなし                |
| test      | `pnpm test` 全PASS                    |
| coverage  | Line 80%+, Branch 60%+, Function 80%+ |

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/UT-STORE-HOOKS-COMPONENT-MIGRATION-001/ \
   docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep -i "ut-store-hooks"

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): UT-STORE-HOOKS-COMPONENT-MIGRATION-001をcompleted-tasksに移動

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
git push
```

## PR情報テンプレート

PR作成後、以下の形式で `outputs/phase-13/pr-info.md` を作成する:

```markdown
# PR情報

| 項目         | 値           |
| ------------ | ------------ |
| PR番号       | #{{NUMBER}}  |
| PR URL       | {{URL}}      |
| 作成日時     | {{DATETIME}} |
| CIステータス | {{STATUS}}   |
| レビュアー   | {{REVIEWER}} |

## 変更ファイル数

- 追加: {{N}}
- 変更: {{N}}
- 削除: {{N}}

## 主な変更内容

- Store Hooks無限ループ修正
- useRefガードパターンの適用
- 個別セレクタへの移行

## 関連Issue

- [Issue #{{ISSUE_NUMBER}}](https://github.com/daishiman/AIWorkflowOrchestrator/issues/{{ISSUE_NUMBER}})

## 関連Pitfall

- P31: Zustand Store Hooks無限ループ（解決）
```

## 次のPhase

なし（ワークフロー完了）
