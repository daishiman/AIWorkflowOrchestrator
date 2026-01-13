# Phase 13: PR作成

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 13                            |
| 機能名 | agent-007-environment-backend |
| 作成日 | 2026-01-13                    |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## ⚠️ PR作成に関する重要な注意【必須確認】

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認
- タスク完了処理: completed-tasksへの移動

## 参照資料

| 資料名           | パス                                           | 説明           |
| ---------------- | ---------------------------------------------- | -------------- |
| ドキュメント更新 | `outputs/phase-12/documentation-update-log.md` | Phase 12成果物 |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`     | Phase 12成果物 |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`      | Phase 10成果物 |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`       | Phase 11成果物 |

## タスク完了フロー

```
Phase 1〜12 完了
    ↓
【必須】ローカルでの動作確認
    ↓
【必須】ユーザーにPR作成の許可を確認
    ↓
ユーザー許可後: PR作成（/ai:diff-to-pr 使用）
    ↓
CI通過確認
    ↓
タスクディレクトリを completed-tasks/ に移動
    ↓
（該当する場合）未タスク指示書を削除
    ↓
変更をコミット・プッシュ
    ↓
ワークフロー完了
```

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

### 2. ローカル確認チェックリスト【PR作成前に必須】

PR作成前に以下を**必ず**確認すること:

| #   | 確認項目                       | コマンド例                              | 結果 |
| --- | ------------------------------ | --------------------------------------- | ---- |
| 1   | ビルドが成功する               | `pnpm --filter @repo/desktop build`     |      |
| 2   | 全テストがパスする             | `pnpm --filter @repo/desktop test`      |      |
| 3   | 型チェックがパスする           | `pnpm --filter @repo/desktop typecheck` |      |
| 4   | Lintエラーがない               | `pnpm --filter @repo/desktop lint`      |      |
| 5   | 実際の動作確認（該当する場合） | `pnpm --filter @repo/desktop dev`       |      |

### 3. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

#### 変更サマリー例

```markdown
## 変更内容サマリー

### 新規追加ファイル

- `apps/desktop/src/main/services/environment/ContentExtractor.ts`
- `apps/desktop/src/main/services/environment/ContentSanitizer.ts`
- `apps/desktop/src/main/services/environment/TempFileManager.ts`
- `apps/desktop/src/main/services/environment/EnvironmentService.ts`
- 関連テストファイル

### 変更ファイル

- `apps/desktop/src/main/ipc/agentHandlers.ts`
- `apps/desktop/src/preload/channels.ts`
- `packages/shared/src/types/agent.ts`

PRを作成してよろしいですか？
```

### 4. `/ai:diff-to-pr` スキルの使用

**ユーザーの許可を得た後にのみ**、`/ai:diff-to-pr` スキルを使用してPR作成を行う:

```bash
# ユーザー許可後にのみ実行
/ai:diff-to-pr
```

このスキルが実行する内容:

1. 変更差分の確認
2. コミットメッセージ生成
3. PR作成
4. CI結果確認

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する:

```bash
# ステータス確認
git status

# 変更内容確認
git diff

# コミット（機能単位）
git add apps/desktop/src/main/services/environment/
git commit -m "feat(agent): add Environment Backend service

- Add ContentExtractor for code block extraction
- Add ContentSanitizer with DOMPurify for XSS prevention
- Add TempFileManager for temporary file handling
- Add EnvironmentService as Facade
- Add IPC handlers for agent communication"

# テストコミット
git add apps/desktop/src/main/services/environment/__tests__/
git commit -m "test(agent): add Environment Backend tests

- Add unit tests for ContentExtractor
- Add unit tests for ContentSanitizer
- Add unit tests for TempFileManager
- Add integration tests for IPC handlers"

# ドキュメントコミット
git add docs/
git commit -m "docs(agent): add Environment Backend documentation

- Update README with new features
- Add API documentation for IPC channels
- Update architecture diagrams"

# リモートへプッシュ
git push -u origin task-XXXXXX-agent-007-environment-backend

# PR作成
gh pr create --title "feat(agent): AGENT-007 Environment Backend実装" --body "..."
```

### 6. PR本文テンプレート

```markdown
## 概要

エージェント出力からのコンテンツ抽出・サニタイズ・一時ファイル管理機能を実装。

## 変更内容

### 新規追加

- `EnvironmentService` - Facadeサービス
- `ContentExtractor` - コードブロック抽出
- `ContentSanitizer` - XSS対策サニタイズ
- `TempFileManager` - 一時ファイル管理

### IPCチャネル

- `agent:extract-content` - コンテンツ抽出
- `agent:get-preview-content` - プレビュー取得
- `agent:cleanup-temp-files` - クリーンアップ

## テスト

- [ ] ユニットテスト全件PASS
- [ ] 統合テスト全件PASS
- [ ] 手動テスト完了
- [ ] カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）

## セキュリティ

- [ ] XSS対策（DOMPurify）実装済み
- [ ] 一時ファイルパーミッション（0o600）設定済み
- [ ] 入力バリデーション実装済み

## 関連Issue

- Closes #AGENT-007

## チェックリスト

- [ ] コードレビュー完了
- [ ] テスト全件PASS
- [ ] ドキュメント更新済み
- [ ] CIパイプライン成功
```

### 7. レビュー依頼

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| レビュアー   | プロジェクトメンバー           |
| レビュー観点 | コード品質、セキュリティ、設計 |
| 期限         | PR作成から3営業日以内          |

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/agent-007-environment-backend/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep agent-007-environment-backend

# 3. 未タスク指示書を削除（該当する場合）
rm docs/30-workflows/unassigned-task/task-agent-07-environment-backend.md

# 4. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): agent-007-environment-backendをcompleted-tasksに移動"
git push
```

## 成果物

| 成果物 | パス                          | 説明       |
| ------ | ----------------------------- | ---------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR作成情報 |

## 完了条件

- [ ] ローカルでビルド・テスト・型チェック・Lintが全てパス
- [ ] ユーザーにPR作成の許可を確認済み
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリが `completed-tasks/` に移動済み
- [ ] `artifacts.json` の `status` が `"completed"`
- [ ] （該当時）未タスク指示書が削除済み
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. ローカル動作確認依頼
2. ローカル確認チェックリスト実行
3. 変更サマリー提示
4. ユーザー許可確認
5. PR作成（/ai:diff-to-pr）
6. CI確認
7. タスクディレクトリ移動
8. 未タスク指示書削除（該当時）
9. PR情報記録
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-007-environment-backend --phase 13
```

## ワークフロー完了

Phase 13完了をもって、AGENT-007 Environment Backend実装タスクは完了となる。
