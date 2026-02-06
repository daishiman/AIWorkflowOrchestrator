# Phase 13: PR作成

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| Phase    | 13                      |
| 機能名   | auth-callback-urlscheme |
| 作成日   | 2026-02-05              |
| タスクID | TASK-AUTH-CALLBACK-001  |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

**PR作成は必ずユーザーの明示的な許可を得てから実行すること。**

---

## 実行タスク

- Task 1: 差分確認 - git diff --stat で変更ファイル一覧確認
- Task 2: PR作成（ユーザー許可必須） - タイトル・本文作成、/ai:diff-to-prコマンド使用
- Task 3: CI確認 - GitHub Actions結果確認

---

## 参照資料

| 参照資料             | パス                                          | 説明           |
| -------------------- | --------------------------------------------- | -------------- |
| 最終レビュー         | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト           | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |
| 品質レポート         | `outputs/phase-9/quality-report.md`           | Phase 9成果物  |

---

## 実行手順

### Task 1: 差分確認

**目的**: PR作成前に変更ファイルの一覧と差分を確認する。

```bash
# 変更ファイル一覧
git diff --stat

# 変更行数の確認
git diff --shortstat

# 新規ファイル一覧
git status --short
```

**確認項目**:

| 確認項目                                        | 結果 |
| ----------------------------------------------- | ---- |
| 変更ファイル数が想定範囲内                      | -    |
| 不要なファイルが含まれていない                  | -    |
| テストファイルが含まれている                    | -    |
| ドキュメントファイルが含まれている              | -    |
| 機密情報（.env, credentials等）が含まれていない | -    |

**想定される変更ファイル**:

| カテゴリ           | ファイルパス                                             | 変更種別  |
| ------------------ | -------------------------------------------------------- | --------- |
| PKCE生成           | `apps/desktop/src/main/auth/pkce.ts`                     | 新規      |
| HTTPサーバー       | `apps/desktop/src/main/auth/authCallbackServer.ts`       | 新規      |
| オーケストレーター | `apps/desktop/src/main/auth/authFlowOrchestrator.ts`     | 新規      |
| 認証ハンドラー     | `apps/desktop/src/main/ipc/authHandlers.ts`              | 変更      |
| カスタムプロトコル | `apps/desktop/src/main/protocol/customProtocol.ts`       | 変更      |
| Preload            | `apps/desktop/src/preload/index.ts`                      | 変更      |
| devMockAuth        | `apps/desktop/src/renderer/utils/devMockAuth.ts`         | 変更      |
| IPCチャネル        | `packages/shared/constants/ipcChannels.ts`               | 変更      |
| 型定義             | `packages/shared/types/auth-pkce.ts`                     | 新規      |
| テスト             | `apps/desktop/src/main/auth/__tests__/*.test.ts`         | 新規      |
| ドキュメント       | `docs/30-workflows/auth-callback-urlscheme/**`           | 新規/変更 |
| システム仕様       | `.claude/skills/aiworkflow-requirements/references/*.md` | 変更      |

---

### Task 2: PR作成【ユーザー許可必須】

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

#### Step 1: ユーザーにローカル動作確認を依頼

PR作成前に、ユーザーにローカル環境での動作確認を依頼する:

```
PR作成前に、以下の手順でローカル環境での動作確認をお願いします:

1. pnpm install
2. pnpm --filter @repo/shared build
3. pnpm --filter @repo/desktop dev
4. Googleログインボタンをクリック
5. ブラウザでGoogle認証を完了
6. アプリに復帰し、ログイン状態になることを確認
```

#### Step 2: 変更サマリーの提示と許可確認

**PRタイトル**:

```
feat(auth): OAuth認証コールバックをPKCE + ローカルHTTPサーバー方式に移行
```

**PR本文テンプレート**:

```markdown
## Summary

- OAuth認証コールバック受信方式をImplicit FlowからAuthorization Code Flow + PKCEに移行
- ローカルHTTPサーバー（127.0.0.1動的ポート）でauthorization_codeを安全に受信
- State parameter検証によるCSRF対策を実装
- 技術的負債DEBT-SEC-001/002/003を解消

## Changes

### 新規ファイル

- `apps/desktop/src/main/auth/pkce.ts` - PKCE code_verifier/code_challenge生成
- `apps/desktop/src/main/auth/authCallbackServer.ts` - ローカルHTTPサーバー
- `apps/desktop/src/main/auth/authFlowOrchestrator.ts` - 認証フロー制御
- `packages/shared/types/auth-pkce.ts` - PKCE関連型定義

### 変更ファイル

- `apps/desktop/src/main/ipc/authHandlers.ts` - Implicit Flow → PKCE対応
- `apps/desktop/src/main/protocol/customProtocol.ts` - URLスキームフォールバック統合
- `apps/desktop/src/preload/index.ts` - IPCホワイトリスト更新
- `apps/desktop/src/renderer/utils/devMockAuth.ts` - `return true;`一時修正の復元
- `packages/shared/constants/ipcChannels.ts` - 新規チャネル追加

## Security Improvements

- PKCE (RFC 7636) によるAuthorization Code保護
- State parameter によるCSRF対策
- ローカルHTTPサーバーの127.0.0.1バインド（外部アクセス不可）
- トークンのRenderer Process非露出
- Refresh TokenのsafeStorage暗号化保存

## Test Results

- 自動テスト: 全パス（新規 + 既存リグレッションなし）
- 手動テスト: MT-01〜MT-09 全実行
- カバレッジ: Line 80%+, Branch 60%+, Function 80%+
```

**ユーザーへの確認**:

> 上記の内容でPRを作成してよろしいでしょうか？

#### Step 3: PR作成実行

ユーザーの許可後、PR作成を実行する:

```
/ai:diff-to-pr
```

#### Step 4: フォールバック（/ai:diff-to-prが使えない場合）

```bash
# ブランチ作成（必要な場合）
git checkout -b feat/auth-callback-pkce

# 変更をステージング
git add apps/desktop/src/main/auth/
git add apps/desktop/src/main/ipc/authHandlers.ts
git add apps/desktop/src/main/protocol/customProtocol.ts
git add apps/desktop/src/preload/index.ts
git add apps/desktop/src/renderer/utils/devMockAuth.ts
git add packages/shared/constants/ipcChannels.ts
git add packages/shared/types/
git add apps/desktop/src/main/auth/__tests__/
git add docs/30-workflows/auth-callback-urlscheme/
git add .claude/skills/aiworkflow-requirements/references/

# コミット
git commit -m "feat(auth): OAuth認証コールバックをPKCE + ローカルHTTPサーバー方式に移行

- Authorization Code Flow + PKCE (RFC 7636) を実装
- ローカルHTTPサーバー（127.0.0.1動的ポート）でコールバック受信
- State parameter検証によるCSRF対策
- 技術的負債DEBT-SEC-001/002/003を解消
- devMockAuth.tsの一時修正を復元"

# プッシュ
git push -u origin feat/auth-callback-pkce

# PR作成（gh CLI）
gh pr create \
  --title "feat(auth): OAuth認証コールバックをPKCE + ローカルHTTPサーバー方式に移行" \
  --body "$(cat outputs/phase-13/pr-body.md)"
```

---

### Task 3: CI確認

**目的**: GitHub ActionsでCIが通過していることを確認する。

```bash
# PR作成後のCI確認
gh pr checks
```

**確認項目**:

| CI項目          | 基準 | 結果 |
| --------------- | ---- | ---- |
| Lint            | パス | -    |
| TypeCheck       | パス | -    |
| Test（desktop） | パス | -    |
| Test（shared）  | パス | -    |
| Build           | パス | -    |

> 注: 上記の「-」は実行時に確認結果を記入する

**CI失敗時の対応**:

1. 失敗内容を確認
2. ローカルで修正
3. 追加コミット & プッシュ
4. CI再実行確認

---

## 成果物

| 成果物 | パス                          | 説明             |
| ------ | ----------------------------- | ---------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・CI結果等 |

---

## 完了条件

- [ ] git diff --statで変更ファイル一覧が確認されている
- [ ] 不要なファイルや機密情報が含まれていないことを確認
- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

---

## タスク完了処理【必須】

PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/auth-callback-urlscheme/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep auth-callback-urlscheme

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): auth-callback-urlschemeをcompleted-tasksに移動"
git push
```

---

## タスク100%実行確認

- [ ] Task 1: 差分確認（git diff --stat） - 完了
- [ ] Task 2: PR作成（ユーザー許可取得済み・PR作成済み） - 完了
- [ ] Task 3: CI確認（GitHub Actions全パス） - 完了

---

## 次のPhase

なし（ワークフロー完了）
