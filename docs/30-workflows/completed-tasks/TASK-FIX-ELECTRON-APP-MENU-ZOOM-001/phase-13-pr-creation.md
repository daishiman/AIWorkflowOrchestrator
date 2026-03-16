# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| タスク ID  | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001                                |
| Phase      | 13 / 13                                                            |
| 作成日     | 2026-03-16                                                         |
| 担当       | spec-phase11-13                                                    |
| 依存 Phase | Phase 12（ドキュメント作成）— 完了済み                             |
| 成果物パス | `docs/30-workflows/electron-app-menu-zoom/phase-13-pr-creation.md` |

---

## 目的

Phase 5 で実装した変更（`createApplicationMenu()` の追加）を `main` ブランチへマージするための Pull Request を作成する。ユーザーの明示的な承認を受けてから PR を作成する。

---

## 重要: ユーザー承認が必須

> このフェーズのすべての操作（`git commit`、`git push`、`gh pr create`）は **ユーザーの明示的な承認を得てから実行する**。
>
> ユーザーから「PR を作成してください」または「push してください」等の明示的な指示がない限り、以下のコマンドは実行しない:
>
> - `git commit`
> - `git push`
> - `gh pr create`
>
> **なぜ blocked にするか**: PR の作成はチームリポジトリに影響を与える操作であり、コードレビューのタイミング・CI/CD パイプライン・マージ戦略などはユーザーが決定すべきことだから。

---

## 実行タスク

| No. | タスク名               | 目的                                             | 実行タイミング           |
| --- | ---------------------- | ------------------------------------------------ | ------------------------ |
| 1   | ローカル確認           | commit 前に型チェック・lint が通ることを確認する | ユーザー承認前に実行可   |
| 2   | コミットメッセージ準備 | 規約に従ったコミットメッセージを準備する         | ユーザー承認前に準備可   |
| 3   | PR 本文準備            | PR タイトル・本文テンプレートを準備する          | ユーザー承認前に準備可   |
| 4   | git commit             | 変更をコミットする                               | **ユーザー承認後に実行** |
| 5   | git push               | リモートリポジトリにプッシュする                 | **ユーザー承認後に実行** |
| 6   | gh pr create           | GitHub に PR を作成する                          | **ユーザー承認後に実行** |
| 7   | CI/CD 確認             | GitHub Actions が PASS することを確認する        | PR 作成後に確認          |

---

## 参照資料

| 資料                                                                 | 参照理由                                |
| -------------------------------------------------------------------- | --------------------------------------- |
| `docs/30-workflows/electron-app-menu-zoom/phase-1-requirements.md`   | 受入基準 AC-1〜AC-8 の参照              |
| `docs/30-workflows/electron-app-menu-zoom/phase-12-documentation.md` | Phase 12 完了確認                       |
| `.claude/rules/07-git-and-tooling.md`                                | PR 作成ルール・コミット前チェックリスト |
| `CLAUDE.md`                                                          | `--no-verify` 禁止・pnpm 使用必須       |

---

## 実行手順

### Step 1: ローカル確認（承認前に実行可）

#### 1-1. 変更ファイルの確認

```bash
git -C /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.claude/worktrees/feature-electron-app-menu-zoom \
  diff --stat HEAD
```

期待する出力: `apps/desktop/src/main/index.ts` に変更が含まれていること。

#### 1-2. 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

合格基準: コマンドが exit code 0 で終了する（TypeScript コンパイルエラーなし）。

#### 1-3. Lint チェック

```bash
pnpm --filter @repo/desktop lint
```

合格基準: コマンドが exit code 0 で終了する（ESLint エラーなし）。

#### 1-4. テスト実行

```bash
pnpm --filter @repo/desktop exec vitest run src/main/__tests__/menu.test.ts
```

合格基準: 全テストケースが PASS すること。

#### 1-5. git diff による受入基準確認

```bash
git -C /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.claude/worktrees/feature-electron-app-menu-zoom \
  diff HEAD -- apps/desktop/src/main/index.ts
```

確認項目（AC-8 対応）:

- `contextIsolation`, `nodeIntegration`, `sandbox` の設定が変更されていないこと
- `getCSPPolicy()` が変更されていないこと
- `registerAllIpcHandlers` / `unregisterAllIpcHandlers` の呼び出しが変更されていないこと

---

### Step 2: コミットメッセージ（承認前に準備可）

**規約**: Conventional Commits 形式を使用する（`.claude/rules/07-git-and-tooling.md` 準拠）。

**コミットメッセージ**:

```
fix(desktop): Electron アプリケーションメニュー追加によるズーム制御修正

- Menu.buildFromTemplate() でアプリケーションメニューを定義
- macOS: アプリ名/編集/表示/ウィンドウの 4 メニュー構成（Apple HIG 準拠）
- Windows/Linux: 表示メニューのみの最小構成
- zoomIn/zoomOut/resetZoom role により Cmd+= / Cmd+- / Cmd+0 が動作

Fixes: TASK-FIX-ELECTRON-APP-MENU-ZOOM-001
```

**コミットコマンド（ユーザー承認後に実行）**:

```bash
# --no-verify は禁止（CLAUDE.md に記載）
git -C /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.claude/worktrees/feature-electron-app-menu-zoom \
  commit -m "fix(desktop): Electron アプリケーションメニュー追加によるズーム制御修正

- Menu.buildFromTemplate() でアプリケーションメニューを定義
- macOS: アプリ名/編集/表示/ウィンドウの 4 メニュー構成（Apple HIG 準拠）
- Windows/Linux: 表示メニューのみの最小構成
- zoomIn/zoomOut/resetZoom role により Cmd+= / Cmd+- / Cmd+0 が動作

Fixes: TASK-FIX-ELECTRON-APP-MENU-ZOOM-001"
```

---

### Step 3: PR 本文（承認前に準備可）

**PR タイトル（70文字以内）**:

```
fix(desktop): Electron アプリケーションメニュー追加によるズーム制御修正
```

**PR 本文テンプレート**:

```markdown
## Summary

- `Menu.buildFromTemplate()` を使用してアプリケーションメニューを定義し、
  `Cmd+-`（ズームアウト）・`Cmd+0`（ズームリセット）が動作しない問題を修正する
- macOS では Apple HIG 準拠の 4 メニュー構成（アプリ名・編集・表示・ウィンドウ）を提供する
- Windows/Linux では表示メニューのみの最小構成を提供する

## 変更ファイル

- `apps/desktop/src/main/index.ts`: `Menu` import 追加、`createApplicationMenu()` / `buildMacTemplate()` / `buildDefaultTemplate()` 関数を追加、`app.whenReady()` 内で `Menu.setApplicationMenu()` を呼び出し

## Test Plan

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS していること（AC-6）
- [ ] `pnpm --filter @repo/desktop lint` が PASS していること（AC-7）
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/__tests__/menu.test.ts` が全 PASS していること
- [ ] macOS で `Cmd+=` / `Cmd+-` / `Cmd+0` がズーム操作として機能することを手動確認（AC-1〜AC-3）
- [ ] メニューバー「表示」に「拡大」「縮小」「実際のサイズ」が表示されることを手動確認（AC-4）
- [ ] 既存の認証フロー・IPC ハンドラ・CSP 設定が変更されていないことを `git diff` で確認（AC-8）

## セキュリティ影響

影響なし。`Menu` は Main Process の API であり、`BrowserWindow.webPreferences`（`contextIsolation: true`、`sandbox: true`、`nodeIntegration: false`）とは独立している。
```

---

### Step 4: git push（ユーザー承認後に実行）

**ブランチ名規約**: `fix/electron-app-menu-zoom`

```bash
# worktree のブランチ名を確認する
git -C /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.claude/worktrees/feature-electron-app-menu-zoom \
  branch --show-current

# リモートにプッシュする（--no-verify は禁止）
git -C /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.claude/worktrees/feature-electron-app-menu-zoom \
  push origin fix/electron-app-menu-zoom
```

**注意**: `git push --force` は `main` ブランチに実行しない（`07-git-and-tooling.md` 参照）。

---

### Step 5: gh pr create（ユーザー承認後に実行）

```bash
gh pr create \
  --title "fix(desktop): Electron アプリケーションメニュー追加によるズーム制御修正" \
  --body "$(cat <<'EOF'
## Summary

- `Menu.buildFromTemplate()` を使用してアプリケーションメニューを定義し、`Cmd+-`（ズームアウト）・`Cmd+0`（ズームリセット）が動作しない問題を修正する
- macOS では Apple HIG 準拠の 4 メニュー構成（アプリ名・編集・表示・ウィンドウ）を提供する
- Windows/Linux では表示メニューのみの最小構成を提供する

## 変更ファイル

- `apps/desktop/src/main/index.ts`: `Menu` import 追加、`createApplicationMenu()` / `buildMacTemplate()` / `buildDefaultTemplate()` 関数を追加、`app.whenReady()` 内で `Menu.setApplicationMenu()` を呼び出し

## Test Plan

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS していること（AC-6）
- [ ] `pnpm --filter @repo/desktop lint` が PASS していること（AC-7）
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/__tests__/menu.test.ts` が全 PASS していること
- [ ] macOS で `Cmd+=` / `Cmd+-` / `Cmd+0` がズーム操作として機能することを手動確認（AC-1〜AC-3）
- [ ] メニューバー「表示」に「拡大」「縮小」「実際のサイズ」が表示されることを手動確認（AC-4）
- [ ] 既存の認証フロー・IPC ハンドラ・CSP 設定が変更されていないことを `git diff` で確認（AC-8）

## セキュリティ影響

影響なし。`Menu` は Main Process の API であり、`BrowserWindow.webPreferences`（`contextIsolation: true`、`sandbox: true`、`nodeIntegration: false`）とは独立している。
EOF
)" \
  --base main \
  --head fix/electron-app-menu-zoom
```

---

### Step 6: CI/CD 確認（PR 作成後）

PR 作成後、以下を確認する:

1. GitHub Actions の CI ワークフローが自動実行されることを確認する
2. 以下のジョブが全て PASS することを確認する:
   - TypeScript 型チェック
   - ESLint
   - テスト（Vitest）
3. CI が失敗した場合は、失敗ログを確認して修正する（`--no-verify` でバイパスしない）

---

## Phase 12 完了の根拠

PR 作成前に以下が完了していることを確認する:

| 確認項目                                      | 確認方法                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Phase 11 手動テスト PASS                      | `outputs/phase-11/manual-test-result.md` の全 MT が PASS                                         |
| Phase 12 実装ガイド作成済み                   | `outputs/phase-12/implementation-guide.md` が存在する                                            |
| Phase 12 LOGS.md 2箇所更新済み                | `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の両方に完了記録がある |
| Phase 12 topic-map.md 再生成済み              | `git log --oneline -- .claude/skills/aiworkflow-requirements/indexes/` で再生成コミットを確認    |
| Phase 12 未タスク検出レポート作成済み         | `outputs/phase-12/unassigned-task-detection.md` が存在する                                       |
| Phase 12 スキルフィードバックレポート作成済み | `outputs/phase-12/skill-feedback-report.md` が存在する                                           |

---

## 成果物

| 成果物                 | パス                                  | 説明                                        |
| ---------------------- | ------------------------------------- | ------------------------------------------- |
| Pull Request（GitHub） | GitHub PR URL                         | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 の PR   |
| コミット（git）        | `fix/electron-app-menu-zoom` ブランチ | fix(desktop): Electron メニュー追加コミット |

---

## 完了条件

### ユーザー承認前（準備段階）

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] `pnpm --filter @repo/desktop lint` が PASS している
- [ ] テストが全 PASS している
- [ ] `git diff HEAD -- apps/desktop/src/main/index.ts` でセキュリティ設定の変更がないことを確認している
- [ ] コミットメッセージが準備されている（`--no-verify` なしで使用できる状態）
- [ ] PR 本文が準備されている

### ユーザー承認後（PR 作成）

- [ ] ユーザーから「PR を作成してください」等の明示的な承認を受けている
- [ ] `git commit` が `--no-verify` なしで完了している
- [ ] `git push origin fix/electron-app-menu-zoom` が完了している
- [ ] `gh pr create` で PR が作成されている
- [ ] PR の URL が確認できる
- [ ] GitHub Actions CI が全 PASS している

---

## タスク100%実行確認【必須】

| No. | タスク名               | 結果      | 備考 |
| --- | ---------------------- | --------- | ---- |
| 1   | ローカル確認           | ⬜ 未実施 |      |
| 2   | コミットメッセージ準備 | ⬜ 未実施 |      |
| 3   | PR 本文準備            | ⬜ 未実施 |      |
| 4   | git commit             | ⬜ 未実施 |      |
| 5   | git push               | ⬜ 未実施 |      |
| 6   | gh pr create           | ⬜ 未実施 |      |
| 7   | CI/CD 確認             | ⬜ 未実施 |      |

---

## 次 Phase

なし。Phase 13 が完了すると TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 の全 Phase が完了する。

PR がマージされた後、`fix/electron-app-menu-zoom` ブランチおよび対応する worktree を削除する（任意）:

```bash
# worktree の削除
git worktree remove \
  /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.claude/worktrees/feature-electron-app-menu-zoom

# ブランチの削除（リモートマージ後）
git branch -d fix/electron-app-menu-zoom
```
