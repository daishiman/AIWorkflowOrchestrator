# Phase 13: PR作成 - IPC ハンドラ二重登録バグ修正

## メタ情報

| 項目         | 値                                |
| ------------ | --------------------------------- |
| Phase        | 13                                |
| タスクID     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| タスク名     | IPC ハンドラ二重登録例外の修正    |
| 機能名       | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| 種別         | バグ修正 (fix)                    |
| 優先度       | 高                                |
| GitHub Issue | #815                              |
| 関連Pitfall  | P5（リスナー二重登録）            |
| 作成日       | 2026-02-14                        |

---

## 目的

Phase 1-12 の全成果物を最終確認し、PR を作成してタスクを完了する。全 Phase の成果物ファイルが存在すること、品質基準を達成していること、コミット履歴がクリーンであることを検証した上で、GitHub に PR を作成する。

---

## 実行タスク

### Task 1: 成果物最終確認

Phase 1-12 の全成果物が揃っていることを確認する。

#### 1-1: artifacts.json の全 Phase ステータス確認

`artifacts.json` を読み込み、以下の条件を検証する。

- [ ] Phase 1（要件定義）のステータスが `completed` であること
- [ ] Phase 2（設計）のステータスが `completed` であること
- [ ] Phase 3（設計レビューゲート）のステータスが `completed` であること
- [ ] Phase 4（テスト作成）のステータスが `completed` であること
- [ ] Phase 5（実装）のステータスが `completed` であること
- [ ] Phase 6（テスト拡充）のステータスが `completed` であること
- [ ] Phase 7（カバレッジ確認）のステータスが `completed` であること
- [ ] Phase 8（リファクタリング）のステータスが `completed` であること
- [ ] Phase 9（品質保証）のステータスが `completed` であること
- [ ] Phase 10（最終レビューゲート）のステータスが `completed` であること
- [ ] Phase 11（手動テスト検証）のステータスが `completed` であること
- [ ] Phase 12（ドキュメント更新）のステータスが `completed` であること

**ステータスが `completed` でない Phase がある場合**: 該当 Phase を先に完了させてから Phase 13 に戻る。Phase 13 を先行して実行しない。

#### 1-2: 全 Phase の成果物ファイル存在確認

以下のコマンドで全成果物の存在を確認する。

```bash
# Phase 仕様書（12ファイル）
ls -la docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/phase-{1,2,3,4,5,6,7,8,9,10,11,12}-*.md

# Phase 出力成果物
ls -la docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-1/requirements-analysis.md
ls -la docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-2/design-document.md
ls -la docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-3/design-review-result.md
ls -la docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-7/coverage-report.md
ls -la docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-9/quality-report.md
ls -la docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-10/final-review-result.md
ls -la docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-11/manual-test-result.md
ls -la docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-12/implementation-guide.md
ls -la docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-12/documentation-changelog.md
ls -la docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-12/unassigned-task-detection.md
ls -la docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/outputs/phase-12/skill-feedback-report.md

# 実装成果物
ls -la apps/desktop/src/main/ipc/index.ts
ls -la apps/desktop/src/main/index.ts
ls -la apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts
```

- [ ] 全仕様書ファイル（Phase 1-12）が存在すること
- [ ] 全出力成果物が存在すること
- [ ] 実装成果物（ソースコード・テストファイル）が存在すること

#### 1-3: Phase 10 最終レビュー結果の確認

`outputs/phase-10/final-review-result.md` を読み込み、以下を確認する。

- [ ] レビュー判定が PASS または MINOR であること
- [ ] MINOR 判定の場合、全指摘が未タスク仕様書に変換済みであること（Phase 12 Task 4 で処理済み）
- [ ] MAJOR または CRITICAL 判定でないこと（MAJOR/CRITICAL の場合は Phase 13 に進めない）

---

### Task 2: ブランチ整理

#### 2-1: ブランチ名の確認

| 項目           | 値                                      |
| -------------- | --------------------------------------- |
| ブランチ名     | `fix/ut-fix-ipc-handler-double-reg-001` |
| ベースブランチ | `main`                                  |

```bash
# 現在のブランチ名を確認
git branch --show-current

# ブランチが存在しない場合は作成
git checkout -b fix/ut-fix-ipc-handler-double-reg-001
```

- [ ] ブランチ名が `fix/ut-fix-ipc-handler-double-reg-001` であること
- [ ] ベースブランチが `main` であること

#### 2-2: 全変更ファイルの差分確認

```bash
# main ブランチとの差分を確認
git diff main...HEAD --stat

# 詳細な差分を確認
git diff main...HEAD
```

- [ ] 変更ファイルが意図した範囲内であること
- [ ] デバッグ用の `console.log` / `console.warn` が残っていないこと
- [ ] `debugger` ステートメントが残っていないこと
- [ ] 一時ファイル（`.tmp`, `.bak`, `.swp`）が含まれていないこと
- [ ] `.env` や認証情報ファイルが含まれていないこと

**変更が予想されるファイル一覧**:

| ファイル                                                              | 変更種別 | 内容                                     |
| --------------------------------------------------------------------- | -------- | ---------------------------------------- |
| `apps/desktop/src/main/index.ts`                                      | 修正     | activate イベントでの IPC ハンドラ再登録 |
| `apps/desktop/src/main/ipc/index.ts`                                  | 修正     | `unregisterAllIpcHandlers()` 関数追加    |
| `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` | 新規     | 二重登録防止テスト                       |
| `docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001/**`              | 新規     | 全 Phase 仕様書と成果物                  |

---

### Task 3: コミット確認

#### 3-1: コミットメッセージ形式の確認

コミットメッセージが Conventional Commits 形式に準拠していることを確認する。

**推奨コミットメッセージ**:

```
fix(ipc): activate時のIPCハンドラ二重登録防止

macOS で全ウィンドウ閉鎖後にドックアイコンクリックで activate イベントが
発火した際、registerAllIpcHandlers() が再実行されて ipcMain.handle() が
同一チャンネルへの二重登録を拒否し例外が発生するバグを修正。

- unregisterAllIpcHandlers() を追加し、activate 前にハンドラを解除
- activate イベントで unregister → createWindow → register の順序を保証

Closes #815
```

**Conventional Commits 形式のルール**:

| 要素    | 値                                         |
| ------- | ------------------------------------------ |
| type    | `fix`（バグ修正）                          |
| scope   | `ipc`（IPC 関連）                          |
| subject | 50文字以内の簡潔な説明                     |
| body    | 変更理由と変更内容の詳細                   |
| footer  | `Closes #815`（GitHub Issue 自動クローズ） |

#### 3-2: コミット履歴の確認

```bash
# コミット履歴を確認
git log --oneline main..HEAD

# 不要なコミットがないか確認
git log --stat main..HEAD
```

- [ ] コミットメッセージが Conventional Commits 形式（`fix(ipc): ...`）であること
- [ ] `Closes #815` がコミットメッセージに含まれていること
- [ ] デバッグ用のコミット（`wip`, `tmp`, `test` のみ等）が含まれていないこと
- [ ] コミット履歴にマージコミット以外の不要なコミットが混在していないこと

---

### Task 4: PR 作成

ユーザーに変更サマリーを提示し、PR 作成の許可を確認してから実行する。ユーザーの明示的な許可がない場合は、このタスクを実行しない。

#### 4-1: ローカル動作確認の依頼

PR 作成前に、ユーザーに以下の確認を依頼する。

1. `pnpm --filter @repo/shared build` が成功すること
2. `pnpm --filter @repo/desktop typecheck` が成功すること
3. `pnpm --filter @repo/desktop lint` が成功すること
4. 関連テストが全て PASS すること
5. macOS でのアプリ起動確認（Command+W → ドッククリックでエラーなし）

#### 4-2: 変更サマリー提示と許可確認

ユーザーに以下の変更サマリーを提示し、PR 作成の許可を求める。

| 変更カテゴリ   | 変更内容                                                                                |
| -------------- | --------------------------------------------------------------------------------------- |
| バグ修正       | `app.on("activate")` 時の IPC ハンドラ二重登録例外を防止                                |
| 修正ファイル 1 | `apps/desktop/src/main/index.ts` - activate イベントでの IPC ハンドラ再登録ロジック修正 |
| 修正ファイル 2 | `apps/desktop/src/main/ipc/index.ts` - `unregisterAllIpcHandlers()` 関数追加            |
| テスト         | IPC ハンドラ二重登録防止の自動テスト追加                                                |

#### 4-3: push と PR 作成（ユーザー許可後のみ実行）

```bash
# リモートへ push
git push -u origin fix/ut-fix-ipc-handler-double-reg-001
```

#### PR 情報

| 項目        | 値                                              |
| ----------- | ----------------------------------------------- |
| ブランチ名  | `fix/ut-fix-ipc-handler-double-reg-001`         |
| PR タイトル | `fix(ipc): activate時のIPCハンドラ二重登録防止` |
| ベース      | `main`                                          |

**PR タイトルの制約**: 70文字以内であること。上記タイトルは30文字であり、制約を満たす。

**PR ボディ**:

```markdown
## Summary

- macOS の `app.on("activate")` イベントで IPC ハンドラが二重登録される問題を修正
- `unregisterAllIpcHandlers()` 関数を追加し、再登録前に既存ハンドラを解除
- P5（リスナー二重登録）Pitfall パターンの解消

## Changes

- `apps/desktop/src/main/ipc/index.ts`: `unregisterAllIpcHandlers()` 関数の追加
- `apps/desktop/src/main/index.ts`: `activate` イベントでの IPC ハンドラ再登録ロジック修正
- テストファイル追加: `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`

## Test Plan

- [ ] 二重登録防止テスト（自動）が PASS すること
- [ ] unregister → re-register の順序が正しいこと（自動）
- [ ] macOS でドックアイコンクリック後にアプリが正常復帰すること（手動）
- [ ] 既存 IPC 機能にリグレッションがないこと（手動）
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を満たすこと

Closes #815
```

**PR 作成コマンド**:

```bash
gh pr create \
  --title "fix(ipc): activate時のIPCハンドラ二重登録防止" \
  --body "$(cat <<'EOF'
## Summary
- macOS の `app.on("activate")` イベントで IPC ハンドラが二重登録される問題を修正
- `unregisterAllIpcHandlers()` 関数を追加し、再登録前に既存ハンドラを解除
- P5（リスナー二重登録）Pitfall パターンの解消

## Changes
- `apps/desktop/src/main/ipc/index.ts`: `unregisterAllIpcHandlers()` 関数の追加
- `apps/desktop/src/main/index.ts`: `activate` イベントでの IPC ハンドラ再登録ロジック修正
- テストファイル追加: `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`

## Test Plan
- [ ] 二重登録防止テスト（自動）が PASS すること
- [ ] unregister → re-register の順序が正しいこと（自動）
- [ ] macOS でドックアイコンクリック後にアプリが正常復帰すること（手動）
- [ ] 既存 IPC 機能にリグレッションがないこと（手動）
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を満たすこと

Closes #815
EOF
)" \
  --base main
```

#### 4-4: PR URL の記録

PR 作成後、PR URL を `outputs/phase-13/pr-info.md` に記録する。

```markdown
# PR 情報 - UT-FIX-IPC-HANDLER-DOUBLE-REG-001

| 項目        | 値                                            |
| ----------- | --------------------------------------------- |
| PR URL      | {{PR_URL}}                                    |
| PR 番号     | {{PR_NUMBER}}                                 |
| ブランチ名  | fix/ut-fix-ipc-handler-double-reg-001         |
| PR タイトル | fix(ipc): activate時のIPCハンドラ二重登録防止 |
| 作成日時    | {{CREATED_AT}}                                |
| ステータス  | Open                                          |
```

- [ ] PR が作成され、URL が取得できていること
- [ ] `outputs/phase-13/pr-info.md` に PR URL が記録されていること

---

### Task 5: CI 通過確認

PR 作成後に GitHub Actions の CI ジョブ結果を確認する。

```bash
# PR のチェック結果を確認
gh pr checks {{PR_NUMBER}}
```

- [ ] lint チェックが PASS していること
- [ ] typecheck が PASS していること
- [ ] テストが PASS していること
- [ ] GitHub Actions の全 CI ジョブが PASS していること

**CI が失敗した場合の対応**:

| 失敗箇所  | 対応                                                                      |
| --------- | ------------------------------------------------------------------------- |
| lint      | `pnpm --filter @repo/desktop lint --fix` で修正し、新規コミットを追加する |
| typecheck | 型エラーを修正し、新規コミットを追加する                                  |
| テスト    | テストを修正し、新規コミットを追加する（`.skip` + Issue 作成も許容）      |
| ビルド    | ビルドエラーを修正し、新規コミットを追加する                              |

`--no-verify` は絶対に使用しない。

---

### Task 6: artifacts.json 最終更新

全 Phase のステータスを確認し、最終更新を行う。

#### 6-1: 全 Phase ステータスの最終確認

artifacts.json の全 Phase（1-13）のステータスが `completed` であることを確認する。

#### 6-2: PR URL の記録

artifacts.json に PR URL を追記する。

```json
{
  "prUrl": "{{PR_URL}}",
  "prNumber": {{PR_NUMBER}}
}
```

#### 6-3: qualityMetrics の記録

Phase 7 のカバレッジレポートから値を取得し、artifacts.json に記録する。

```json
{
  "qualityMetrics": {
    "lineCoverage": {{LINE_COV}},
    "branchCoverage": {{BRANCH_COV}},
    "functionCoverage": {{FUNCTION_COV}},
    "testCount": {{TEST_COUNT}}
  }
}
```

- [ ] artifacts.json の全 Phase（1-13）が `completed` であること
- [ ] PR URL が artifacts.json に記録されていること
- [ ] qualityMetrics にカバレッジ値とテスト数が記録されていること

---

### Task 7: タスク完了処理

CI 通過後に以下を実行する。

```bash
# タスクディレクトリを completed-tasks に移動
mv docs/30-workflows/UT-FIX-IPC-HANDLER-DOUBLE-REG-001 docs/30-workflows/completed-tasks/UT-FIX-IPC-HANDLER-DOUBLE-REG-001

# 移動をコミット
git add docs/30-workflows/
git commit -m "chore: move UT-FIX-IPC-HANDLER-DOUBLE-REG-001 to completed-tasks"
git push
```

- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/` に移動されていること
- [ ] 移動がコミットされ、リモートに push されていること

---

## 参照資料

| 資料名                    | パス                                                                          | 説明                   |
| ------------------------- | ----------------------------------------------------------------------------- | ---------------------- |
| Phase 1 要件定義          | `phase-1-requirements.md`                                                     | 受入基準 AC-1 ~ AC-5   |
| Phase 2 設計              | `phase-2-design.md`                                                           | アーキテクチャ設計     |
| Phase 3 設計レビュー      | `phase-3-design-review.md`                                                    | 設計レビュー判定       |
| Phase 4 テスト作成        | `phase-4-test-creation.md`                                                    | テスト設計             |
| Phase 5 実装              | `phase-5-implementation.md`                                                   | 実装仕様               |
| Phase 6 テスト拡充        | `phase-6-test-expansion.md`                                                   | テスト拡充             |
| Phase 7 カバレッジ確認    | `phase-7-coverage-verification.md`                                            | カバレッジ基準達成     |
| Phase 8 リファクタリング  | `phase-8-refactoring.md`                                                      | コード品質改善         |
| Phase 9 品質検証          | `phase-9-quality-assurance.md`                                                | Lint/型チェック/テスト |
| Phase 10 最終レビュー     | `phase-10-final-review.md`                                                    | 最終レビュー判定       |
| Phase 11 手動テスト       | `phase-11-manual-testing.md`                                                  | 手動テスト結果         |
| Phase 12 ドキュメント更新 | `phase-12-documentation.md`                                                   | ドキュメント最終更新   |
| artifacts.json            | `artifacts.json`                                                              | 全 Phase ステータス    |
| PR 作成ルール             | `.claude/rules/07-git-and-tooling.md`                                         | PR タイトル・本文規約  |
| 開発ガイドライン          | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | コミット規約           |
| デプロイ/CI               | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`         | CI 確認観点            |

---

## 実行手順

### Step 1: 成果物確認（Task 1）

artifacts.json の全 Phase ステータスを確認し、全成果物ファイルの存在を検証する。Phase 10 の最終レビュー結果が PASS または MINOR であることを確認する。

### Step 2: ブランチ整理（Task 2）

ブランチ名が `fix/ut-fix-ipc-handler-double-reg-001` であること、ベースブランチが `main` であることを確認する。`git diff main...HEAD` で全変更ファイルを確認し、不要な変更が含まれていないことを検証する。

### Step 3: コミット確認（Task 3）

コミットメッセージが Conventional Commits 形式であること、`Closes #815` が含まれていること、不要なコミットが存在しないことを確認する。

### Step 4: ローカル動作確認の依頼（Task 4-1）

ユーザーに typecheck / lint / test / 手動テストの確認を依頼する。

### Step 5: 変更サマリー提示と許可確認（Task 4-2）

ユーザーに変更サマリーを提示し、PR 作成の明示的な許可を得る。

### Step 6: PR 作成（Task 4-3, 4-4 - ユーザー許可後のみ）

`git push -u origin` で push し、`gh pr create` で PR を作成する。PR URL を `outputs/phase-13/pr-info.md` に記録する。

### Step 7: CI 通過確認（Task 5）

`gh pr checks` で GitHub Actions の全 CI ジョブが PASS していることを確認する。

### Step 8: artifacts.json 最終更新（Task 6）

全 Phase ステータスを `completed` に更新し、PR URL と qualityMetrics を記録する。

### Step 9: タスク完了処理（Task 7）

タスクディレクトリを `completed-tasks/` に移動し、コミット・push する。

---

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | 永続化やDB操作がある場合           | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理がある場合                 | `aiworkflow-requirements: error-handling.md` |

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | 永続化がある場合            | `aiworkflow-requirements: database-*.md`               |

---

## サブタスク管理

1. 参照資料の確認
2. Task 1: artifacts.json 全 Phase ステータス確認
3. Task 1: 全成果物ファイルの存在確認
4. Task 1: Phase 10 最終レビュー結果の確認
5. Task 2: ブランチ名・ベースブランチの確認
6. Task 2: 全変更ファイルの差分確認（不要な変更の排除）
7. Task 3: コミットメッセージの Conventional Commits 準拠確認
8. Task 3: コミット履歴のクリーンさ確認
9. Task 4-1: ローカル動作確認の依頼
10. Task 4-2: 変更サマリー提示と許可確認
11. Task 4-3: push と PR 作成（ユーザー許可後のみ）
12. Task 4-4: PR URL の記録
13. Task 5: CI 通過確認
14. Task 6: artifacts.json 最終更新（PR URL + qualityMetrics）
15. Task 7: タスクディレクトリの completed-tasks 移動
16. 完了条件の全項目検証

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスク（Task 1-7）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最終更新されている
- [ ] Phase末端で完了を明記している

---

## 成果物

| 成果物         | パス                          | 説明                                 |
| -------------- | ----------------------------- | ------------------------------------ |
| PR情報         | `outputs/phase-13/pr-info.md` | PR URL、PR 番号、ブランチ名、CI 結果 |
| artifacts.json | `artifacts.json`              | 全 Phase `completed`、PR URL 記録済  |

---

## 完了条件

### Task 1: 成果物最終確認

- [ ] artifacts.json の全 Phase（1-12）のステータスが `completed` であること
- [ ] 全 Phase の成果物ファイルが存在すること
- [ ] Phase 10 最終レビュー結果が PASS または MINOR（未タスク変換済み）であること

### Task 2: ブランチ整理

- [ ] ブランチ名が `fix/ut-fix-ipc-handler-double-reg-001` であること
- [ ] ベースブランチが `main` であること
- [ ] 不要な変更（デバッグコード、一時ファイル、認証情報）が含まれていないこと

### Task 3: コミット確認

- [ ] コミットメッセージが Conventional Commits 形式（`fix(ipc): ...`）であること
- [ ] `Closes #815` がコミットメッセージに含まれていること
- [ ] 不要なコミットが存在しないこと

### Task 4: PR 作成

- [ ] ユーザーにローカル動作確認を依頼していること
- [ ] 変更サマリーを提示し PR 作成の許可を得ていること
- [ ] PR タイトルが70文字以内で Conventional Commits 形式であること
- [ ] PR 本文に Summary と Test Plan が含まれていること
- [ ] `Closes #815` が PR 本文に含まれていること
- [ ] PR が作成され、URL が `outputs/phase-13/pr-info.md` に記録されていること
- [ ] `--no-verify` を使用していないこと

### Task 5: CI 通過確認

- [ ] GitHub Actions の全 CI ジョブが PASS していること

### Task 6: artifacts.json 最終更新

- [ ] artifacts.json の全 Phase（1-13）が `completed` であること
- [ ] PR URL が artifacts.json に記録されていること
- [ ] qualityMetrics にカバレッジ値とテスト数が記録されていること

### Task 7: タスク完了処理

- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/` に移動されていること

### 全体

- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

なし（ワークフロー完了）
