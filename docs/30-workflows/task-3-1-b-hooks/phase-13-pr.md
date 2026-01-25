# Phase 13: PR作成 - TASK-3-1-B Hooks実装

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| Phase名    | PR作成                       |
| 前提Phase  | Phase 12（ドキュメント更新） |
| 後続Phase  | なし（タスク完了）           |
| ステータス | 未実施                       |
| 作成日     | 2026-01-25                   |
| 機能名     | TASK-3-1-B Hooks実装         |

---

## 目的

実装をコミットし、Pull Requestを作成してCI/CDを確認する。

## 背景

全てのPhaseが完了した後、変更をリモートリポジトリにプッシュし、レビューを依頼する。

---

## 重要な注意事項

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認

**目的**: PRを作成する前にローカルで最終確認を行う

**実行手順**:

1. ビルドが成功することを確認
2. 全テストがパスすることを確認
3. 型チェックがパスすることを確認
4. Lintエラーがないことを確認

**期待される成果物**:

- ローカル確認結果

```bash
# ローカル確認コマンド
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

#### ローカル確認チェックリスト

| 確認項目       | コマンド         | 結果 |
| -------------- | ---------------- | ---- |
| ビルド成功     | `pnpm build`     |      |
| 全テストパス   | `pnpm test`      |      |
| 型チェックパス | `pnpm typecheck` |      |
| Lintエラーなし | `pnpm lint`      |      |

---

### タスク2: 変更内容の確認

**目的**: コミット対象の変更を確認する

**実行手順**:

1. git statusで変更ファイルを確認
2. git diffで変更内容を確認
3. コミット対象外のファイルがないか確認

**期待される成果物**:

- 変更ファイルリスト

```bash
# 変更確認コマンド
git status
git diff
```

#### 変更ファイルリスト

| ファイル                                                       | 変更種別 | 内容                          |
| -------------------------------------------------------------- | -------- | ----------------------------- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`        | 修正     | Hooks追加・エラーハンドリング |
| `apps/desktop/src/main/services/skill/__tests__/hooks.test.ts` | 新規     | Hooksテスト                   |
| `apps/desktop/src/main/services/skill/__tests__/error.test.ts` | 新規     | エラーハンドリングテスト      |

---

### タスク3: ユーザー確認

**目的**: PR作成の許可をユーザーから得る

**実行手順**:

1. 変更内容をユーザーに提示
2. PR作成の許可を明示的に得る
3. 許可が得られたら次のタスクへ進む

**ユーザーへの確認内容**:

```
以下の変更をPRとして作成する準備ができました。

## 変更内容
- SkillExecutorにHooks機能を追加
  - PreToolUse: 危険コマンド・保護パスのブロック
  - PostToolUse: ツール完了通知
  - categorizeError: エラー分類
  - isRetryable: リトライ可能性判定

## 変更ファイル
- apps/desktop/src/main/services/skill/SkillExecutor.ts
- apps/desktop/src/main/services/skill/__tests__/hooks.test.ts
- apps/desktop/src/main/services/skill/__tests__/error.test.ts

PR作成を進めてよろしいですか？
```

---

### タスク4: コミット・PR作成

**目的**: 変更をコミットし、PRを作成する

**前提条件**: タスク3でユーザーから明示的な許可を得ていること

**実行手順**:

1. 変更をステージング
2. コミットメッセージを作成
3. リモートにプッシュ
4. PRを作成

**期待される成果物**:

- コミット
- Pull Request

#### コミットメッセージ案

```
feat(skill): add Hooks for PreToolUse/PostToolUse

- Add createHooks method to SkillExecutor
- Implement PreToolUse hook for dangerous command blocking
- Implement PreToolUse hook for protected path blocking
- Implement PostToolUse hook for result/completion notification
- Add categorizeError for error classification
- Add isRetryable for retry eligibility check

Closes TASK-3-1-B

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

#### PR作成コマンド（/ai:diff-to-pr）

```bash
# ユーザーの許可を得た後にのみ実行
/ai:diff-to-pr
```

---

### タスク5: CI/CD確認

**目的**: CIパイプラインが成功することを確認する

**実行手順**:

1. GitHub ActionsでCIが開始されることを確認
2. 全てのチェックがパスすることを確認
3. 失敗があれば対応

**期待される成果物**:

- CI結果

#### CI確認チェックリスト

| チェック項目 | 状態 | 備考 |
| ------------ | ---- | ---- |
| Build        |      |      |
| Test         |      |      |
| Lint         |      |      |
| Type Check   |      |      |

---

### タスク6: マージ準備完了報告

**目的**: PRがマージ可能な状態であることを報告する

**実行手順**:

1. 全CIチェックがパスしていることを確認
2. PRのURLをユーザーに報告
3. マージはユーザーがGitHub UIで手動実行

**期待される成果物**:

- マージ準備完了報告

#### 報告内容

```
## PR作成完了

PR URL: （PRのURLをここに記載）

## ステータス
- [x] 全CIチェックがパス
- [x] レビュー準備完了

## 次のアクション
マージはGitHub UIで手動実行してください。
```

---

## 参照資料

| 参照資料              | パス                          | 内容             |
| --------------------- | ----------------------------- | ---------------- |
| Phase 12 ドキュメント | `./phase-12-documentation.md` | 最終ドキュメント |

---

## 成果物

| 成果物           | パス           | 内容             |
| ---------------- | -------------- | ---------------- |
| ローカル確認結果 | 本ドキュメント | チェックリスト   |
| コミット         | Git            | 変更のコミット   |
| Pull Request     | GitHub         | PRリンク         |
| CI結果           | GitHub Actions | パイプライン結果 |

---

## 完了条件

- [ ] ローカル確認チェックリストが全てパス
- [ ] 変更ファイルリストが作成されている
- [ ] ユーザーからPR作成の許可を得ている
- [ ] コミットが作成されている
- [ ] PRが作成されている
- [ ] 全CIチェックがパスしている
- [ ] マージ準備完了報告が完了している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## タスク完了

本Phaseが完了すると、TASK-3-1-B Hooks実装が完了となります。

### 完了後のアクション

1. PRがマージされたら、タスクステータスを `completed` に更新
2. 元のタスク仕様書（`task-3-1-b-hooks.md`）を `completed-task/` に移動
3. 後続タスク（TASK-4-1）のブロック解除

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
