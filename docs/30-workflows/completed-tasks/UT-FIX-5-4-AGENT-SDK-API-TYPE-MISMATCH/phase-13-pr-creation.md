# Phase 13: PR作成

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 13                                     |
| 機能名 | ut-fix-5-4-agent-sdk-api-type-mismatch |
| 作成日 | 2026-02-10                             |

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

- アプリ起動とAgent機能の基本動作
- DevToolsで `window.electronAPI.agentSDK.abort()` の戻り値がPromiseであること
- TypeScript IDEで `.then()` や `await` の補完が効くこと
- クエリ実行中のAbort操作が正常動作すること

### 2. 変更サマリーの提示と許可確認【必須】

以下の変更サマリーをユーザーに提示し、PRを作成してよいか確認する。

#### 変更サマリーテンプレート

```markdown
## 変更内容

### 型定義修正: AgentSDKAPI.abort()の戻り値型

- `apps/desktop/src/preload/types.ts`: `abort(): void` -> `abort(): Promise<void>`
- `packages/shared/src/agent/types.ts`: `abort(): void` -> `abort(): Promise<void>`

### 影響

- TypeScript型推論が正しく機能
- IDE補完で`.then()`/`.catch()`が利用可能
- async/awaitパターンが使用可能

### テスト結果

- ユニットテスト: {{N}}件 全PASS
- 手動テスト: 18件 全PASS
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
git checkout -b fix/agent-sdk-api-type-mismatch

# 変更をコミット
git add .
git commit -m "fix(types): AgentSDKAPI.abort()の戻り値型をPromise<void>に修正

- preload/types.tsのAgentSDKAPI.abort型定義を修正
- packages/shared/src/agent/types.tsのAgentAPI.abort型定義を修正
- TypeScript型推論とIDE補完の改善

UT-FIX-5-4"

# リモートにプッシュ
git push -u origin fix/agent-sdk-api-type-mismatch

# PRを作成
gh pr create --title "fix(types): AgentSDKAPI.abort()の戻り値型をPromise<void>に修正" --body "..."
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
mv docs/30-workflows/UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH/ \
   docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep -i "ut-fix-5-4"

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCHをcompleted-tasksに移動"
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

## 関連Issue

- [Issue #765](https://github.com/daishiman/AIWorkflowOrchestrator/issues/765)
```

## 次のPhase

なし（ワークフロー完了）
