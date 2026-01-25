# Phase 13: PR作成

## メタ情報

| 項目         | 内容                      |
| ------------ | ------------------------- |
| Phase        | 13                        |
| 名称         | PR作成                    |
| 目的         | GitHub PR作成・マージ準備 |
| 前提Phase    | Phase 12（ドキュメント）  |
| 成果物       | GitHub Pull Request       |
| 成果物配置先 | GitHub                    |

---

## 1. 目的

全Phaseの成果物を含むPull Requestを作成し、レビュー・マージの準備を行う。

---

## 2. 実行タスク

### Task 1: 変更内容確認

#### 2.1.1 変更ファイル一覧

```bash
git status
git diff --stat main
```

#### 2.1.2 変更カテゴリ

| カテゴリ     | ファイル数 | 主な変更内容                                 |
| ------------ | ---------- | -------------------------------------------- |
| 新規サービス | -          | FileService, ContextBuilder, ChatEditService |
| IPCハンドラ  | -          | chatEditHandlers.ts                          |
| チャンネル   | -          | channels.ts更新                              |
| テスト       | -          | ユニット/統合テスト                          |
| ドキュメント | -          | API/実装ドキュメント                         |

---

### Task 2: コミット整理

#### 2.2.1 コミット履歴確認

```bash
git log --oneline main..HEAD
```

#### 2.2.2 コミット構成

| #   | コミットメッセージ         | 含む変更                 |
| --- | -------------------------- | ------------------------ |
| 1   | feat: FileService実装      | FileService + テスト     |
| 2   | feat: ContextBuilder実装   | ContextBuilder + テスト  |
| 3   | feat: ChatEditService実装  | ChatEditService + テスト |
| 4   | feat: chatEditHandlers実装 | IPCハンドラ + テスト     |
| 5   | feat: Preload API更新      | channels.ts更新          |
| 6   | test: 統合テスト追加       | integration.test.ts      |
| 7   | docs: APIドキュメント追加  | ドキュメントファイル     |

---

### Task 3: PR作成

#### 2.3.1 PR作成コマンド

```bash
gh pr create \
  --title "feat: Workspace Chat Edit Main Process実装 (#469)" \
  --body "$(cat <<'EOF'
## 概要

Workspace Chat Edit機能のMain Process側実装を追加します。

Closes #469

## 変更内容

### 新規サービス
- **FileService**: ファイル読み取り・書き込み・言語検出
- **ContextBuilder**: LLMプロンプト用コンテキスト構築
- **ChatEditService**: LLM統合編集機能

### IPCハンドラ
- `chat-edit:read-file`: ファイル読み取り
- `chat-edit:write-file`: ファイル書き込み
- `chat-edit:get-selection`: 選択範囲取得
- `chat-edit:send-with-context`: LLMリクエスト送信

### セキュリティ
- validateIpcSender による送信元検証
- パストラバーサル対策
- サイズ制限によるDoS対策

## テスト

- ユニットテスト: 全サービス + ハンドラ
- 統合テスト: E2Eフロー確認
- カバレッジ: Line ≥ 80%, Branch ≥ 60%

## チェックリスト

- [ ] TypeScript型チェックPASS
- [ ] ESLintエラー0件
- [ ] 全テストPASS
- [ ] カバレッジ目標達成
- [ ] セキュリティレビュー完了
- [ ] ドキュメント作成済み

## スクリーンショット

(該当する場合)

## 関連Issue

- #469

EOF
)" \
  --assignee @me \
  --label "enhancement,main-process"
```

#### 2.3.2 PRテンプレート確認

| 項目           | 記載内容                   | 確認 |
| -------------- | -------------------------- | ---- |
| タイトル       | feat: + 機能名 + Issue番号 | -    |
| 概要           | 変更の目的と概要           | -    |
| 変更内容       | 具体的な変更リスト         | -    |
| テスト         | テスト種別と結果           | -    |
| チェックリスト | レビュー用チェック項目     | -    |
| 関連Issue      | Closes #XXX                | -    |

---

### Task 4: CI確認

#### 2.4.1 CI実行確認

```bash
gh pr checks
```

#### 2.4.2 CI結果

| ジョブ名  | ステータス | 備考 |
| --------- | ---------- | ---- |
| lint      | -          | -    |
| typecheck | -          | -    |
| test      | -          | -    |
| build     | -          | -    |

---

### Task 5: レビュー準備

#### 2.5.1 レビュー依頼

| レビュアー | 役割                 | 依頼済み |
| ---------- | -------------------- | -------- |
| -          | 技術レビュー         | -        |
| -          | セキュリティレビュー | -        |

#### 2.5.2 レビューポイント

| #   | 確認ポイント       | 対象ファイル        |
| --- | ------------------ | ------------------- |
| 1   | セキュリティ実装   | chatEditHandlers.ts |
| 2   | エラーハンドリング | 全サービス          |
| 3   | 型定義の適切さ     | types.ts            |
| 4   | テストカバレッジ   | **tests**/          |

---

### Task 6: マージ準備

#### 2.6.1 マージ前チェック

| #   | 確認項目                 | 結果 |
| --- | ------------------------ | ---- |
| 1   | CIが全てPASS             | -    |
| 2   | レビュー承認済み         | -    |
| 3   | コンフリクトなし         | -    |
| 4   | 変更が最新のmainにrebase | -    |

#### 2.6.2 マージ方法

```bash
# Squash and Merge推奨
gh pr merge --squash --delete-branch
```

---

## 3. PR作成後の作業

### 3.1 Issue更新

```bash
gh issue comment 469 --body "PR #XXX を作成しました。レビューをお願いします。"
```

### 3.2 タスク仕様書更新

| 更新項目   | 更新内容                |
| ---------- | ----------------------- |
| PR番号     | #XXX                    |
| ステータス | レビュー中 → マージ済み |
| 完了日     | YYYY-MM-DD              |

---

## 4. 判定基準

### 4.1 完了条件

- [ ] PRが作成されている
- [ ] CIが全てPASSしている
- [ ] レビューが完了している
- [ ] Issueがクローズされている（マージ後）

---

## 5. 参照資料

### 5.1 コミット規約

| 参照資料             | パス                                 |
| -------------------- | ------------------------------------ |
| Conventional Commits | https://www.conventionalcommits.org/ |

### 5.2 プロジェクト規約

| 参照資料        | パス             |
| --------------- | ---------------- |
| CONTRIBUTING.md | リポジトリルート |

---

## 6. 成果物

| 成果物       | 配置先 | 説明                                       |
| ------------ | ------ | ------------------------------------------ |
| Pull Request | GitHub | feat: Workspace Chat Edit Main Process実装 |

---

## 7. 統合テスト連携【必須】

PR作成時に統合確認結果を含める:

| 統合ポイント        | PR記載確認                   | 確認 |
| ------------------- | ---------------------------- | ---- |
| Renderer → Main IPC | 変更チャンネル一覧をPRに記載 | -    |
| Main → FileSystem   | ファイルI/O仕様をPRに記載    | -    |
| Main → LLMAdapter   | LLM連携仕様をPRに記載        | -    |
| 認証/検証           | セキュリティ対策をPRに記載   | -    |

---

## 8. 完了条件

- [ ] PRが作成されている
- [ ] PR説明が適切に記載されている
- [ ] CIが全てPASSしている
- [ ] レビュアーがアサインされている
- [ ] レビューが完了している（マージ時）
- [ ] PRがマージされている（最終完了時）
- [ ] Issueがクローズされている（マージ時）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 9. サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 変更内容確認（Task 1）
2. コミット整理（Task 2）
3. PR作成（Task 3）
4. CI確認（Task 4）
5. レビュー準備（Task 5）
6. マージ準備（Task 6）
7. 統合テスト連携の確認
8. 完了条件の検証

---

## 10. タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/workspace-chat-edit-main-process --phase 13
```

---

## 11. タスク完了処理【必須】

### 11.1 タスク仕様書のアーカイブ

PRマージ後、タスク仕様書をcompleted-tasksディレクトリに移動:

```bash
# タスク完了時の移動コマンド
mv docs/30-workflows/workspace-chat-edit-main-process/ \
   docs/30-workflows/completed-tasks/workspace-chat-edit-main-process/
```

### 11.2 artifacts.json最終更新

```json
{
  "status": "completed",
  "completedAt": "YYYY-MM-DD",
  "prNumber": "#XXX",
  "mergedAt": "YYYY-MM-DD"
}
```

### 11.3 Issue連携

```bash
# PRマージ後、Issueが自動クローズされない場合
gh issue close 469 --comment "PRがマージされ、実装が完了しました。"
```

---

## 12. 全Phase完了宣言

全13 Phaseが完了したことを確認:

- [ ] Phase 1-13の全完了条件が満たされている
- [ ] 全成果物が配置されている
- [ ] PRがマージされている
- [ ] Issueがクローズされている
- [ ] タスク仕様書がcompleted-tasksに移動されている
