# Phase 13: PR作成

## メタ情報

| 項目   | 値                   |
| ------ | -------------------- |
| Phase  | 13                   |
| 機能名 | auth-session-refresh |
| 作成日 | 2026-02-05           |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認

## 参照資料

| 資料名               | パス                                          | 説明           |
| -------------------- | --------------------------------------------- | -------------- |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

### システム仕様（aiworkflow-requirements）

> PR作成前に以下のシステム仕様との整合性を最終確認してください。

| 参照資料             | パス                                                                       | 内容                        |
| -------------------- | -------------------------------------------------------------------------- | --------------------------- |
| 認証インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`     | AuthSession型定義の最終確認 |
| セキュリティ原則     | `.claude/skills/aiworkflow-requirements/references/security-principles.md` | セキュリティ要件の最終確認  |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

```bash
pnpm --filter @repo/desktop preview
```

確認項目:

- OAuth認証でログイン可能
- コンソールログでスケジューラー開始を確認
- 自動リフレッシュが正常に動作
- ログアウトでスケジューラーが停止

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**変更ファイル一覧:**

| ファイル                                                       | 変更内容                               |
| -------------------------------------------------------------- | -------------------------------------- |
| `apps/desktop/src/main/services/tokenRefreshScheduler.ts`      | 新規作成: スケジューラーサービス       |
| `apps/desktop/src/main/services/tokenRefreshScheduler.test.ts` | 新規作成: ユニットテスト               |
| `apps/desktop/src/renderer/store/slices/authSlice.ts`          | 修正: 自動リフレッシュ連携追加         |
| `apps/desktop/src/main/ipc/authHandlers.ts`                    | 修正: スケジューラー統合・ログ出力追加 |
| `apps/desktop/src/main/infrastructure/supabaseClient.ts`       | 修正: autoRefreshToken: false設定      |

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

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

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-AUTH-SESSION-REFRESH-001/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-AUTH-SESSION-REFRESH-001

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-AUTH-SESSION-REFRESH-001をcompleted-tasksに移動"
git push
```

## サブタスク管理

1. ユーザーにローカル動作確認を依頼
2. 変更サマリーの提示
3. PR作成の許可確認
4. `/ai:diff-to-pr`の実行（またはgit/gh CLIでの手動対応）
5. CIの確認
6. タスクディレクトリのcompleted-tasks移動
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-AUTH-SESSION-REFRESH-001 --phase 13
```

## 次のPhase

なし（ワークフロー完了）
