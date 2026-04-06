# Phase 13: PR 作成

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 13                            |
| タスクID | TASK-NOTIFICATION-SERVICE-001 |
| 作成日   | 2026-04-01                    |

---

## 重要事項

- コミットしない
- PR を作成しない
- **ユーザーからの明示的な指示があるまで実行しない**

---

## PR 準備条件

以下が全て満たされた場合に PR 作成の準備が完了したとみなす:

| 条件                                                              | 確認方法                                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Phase 11 手動テスト（MTC-01〜MTC-04）が全て PASS                  | `outputs/phase-11/manual-test-result.md` 確認                                               |
| Phase 11 チェックリストと検出課題が作成済み                       | `outputs/phase-11/manual-test-checklist.md` と `outputs/phase-11/discovered-issues.md` 確認 |
| Phase 12 ドキュメント更新が完了（6 本全て作成）                   | `outputs/phase-12/` ディレクトリ確認                                                        |
| Phase 12 仕様準拠チェックが完了                                   | `outputs/phase-12/phase12-task-spec-compliance-check.md` 確認                               |
| TC-E-01〜TC-E-05、TC-F-01〜TC-F-08、TC-B-01〜TC-B-03 が全て GREEN | `pnpm vitest run` 実行確認                                                                  |
| `pnpm --filter @repo/desktop typecheck` が 0 エラー               | コマンド実行確認                                                                            |
| `pnpm --filter @repo/desktop lint` が 0 エラー                    | コマンド実行確認                                                                            |
| `notificationHandlers.ts` に変更がないこと                        | `git diff apps/desktop/src/main/ipc/notificationHandlers.ts` が空                           |
| PR 本文が準備されていること                                       | `outputs/phase-13/pr-body.md` が存在すること                                                |

---

## PR タイトル候補

```
feat(desktop): INotificationService DI + ElectronNotificationService + before-quit guard (TASK-NOTIFICATION-SERVICE-001)
```

---

## PR 説明候補

```markdown
## 概要

スキル生成完了時に macOS 通知を送信する `INotificationService` 抽象 + `ElectronNotificationService` 実装を追加し、
スキル生成中のアプリ終了を防ぐ `before-quit` ガードを実装する。

## 変更内容

### 新規作成

- `apps/desktop/src/main/services/notification/INotificationService.ts` — 通知サービスインターフェース
- `apps/desktop/src/main/services/notification/ElectronNotificationService.ts` — macOS 通知実装（`Notification.isSupported()` ガード付き）
- `apps/desktop/src/main/services/notification/__tests__/ElectronNotificationService.test.ts` — ユニットテスト
- `apps/desktop/src/main/ipc/beforeQuitGuard.ts` — before-quit ガードの抽出

### 修正

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - `RuntimeSkillCreatorFacadeDeps` に `notificationService: INotificationService` を追加
  - `execute` 完了時に `notify('スキル作成完了', skillName)` を呼ぶ
  - `execute` 失敗時に `notify('スキル作成失敗', errorSummary)` を呼ぶ
  - `hasRunningExecution(): boolean` メソッドを追加
- `apps/desktop/src/main/ipc/index.ts`
  - `ElectronNotificationService` のインスタンス化と DI 注入
  - `beforeQuitGuard` の登録・解除

## テスト

- `ElectronNotificationService.test.ts`: TC-E-01〜TC-E-05（5 件）
- `RuntimeSkillCreatorFacade.notification.test.ts`: TC-F-01〜TC-F-08（8 件）
- `beforeQuitGuard.test.ts`: TC-B-01〜TC-B-03（3 件）

## 受入条件

- AC-1〜AC-9 全て PASS
- macOS 手動テスト（MTC-01〜MTC-04）全て PASS
- `ElectronNotificationService.ts` ブランチカバレッジ 100%

## 関連タスク

- TASK-NOTIFICATION-SERVICE-001（本タスク）
- TASK-FIX-EXECUTE-PLAN-FF-001（前提タスク）

## スコープ外

- Windows/Linux 通知（`feat-notification-cross-platform` として記録済み）
- 通知設定 UI（`feat-notification-settings-ui` として記録済み）
```

---

## PR 作成手順（ユーザー承認後のみ実施）

```bash
# 1. ブランチの確認
git status
git branch

# 2. 変更の確認
git diff --staged

# 3. typecheck / lint / test の最終確認
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm vitest run

# 4. PR 作成
gh pr create \
  --title "feat(desktop): INotificationService DI + ElectronNotificationService + before-quit guard (TASK-NOTIFICATION-SERVICE-001)" \
  --body "$(cat outputs/phase-13/pr-body.md)"
```

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                         | 内容                      |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC セキュリティ |

### 確認対象

| ファイル             | パス                                          |
| -------------------- | --------------------------------------------- |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`      |
| ドキュメント変更履歴 | `outputs/phase-12/documentation-changelog.md` |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`     |

---

## 実行手順

### ステップ 1: PR 準備条件の確認

上記の準備条件を全て確認する。

### ステップ 2: PR 本文の作成

`outputs/phase-13/pr-body.md` を作成し、PR 説明候補の内容を反映する。

### ステップ 3: ユーザー承認の取得

ユーザーに「PR を作成してよいか」を確認する。承認なしに PR を作成しない。

### ステップ 4: PR の作成（承認後のみ）

PR タイトル・説明候補を使用して PR を作成する。

---

## 多角的チェック観点

| 観点                | 確認内容                                                             |
| ------------------- | -------------------------------------------------------------------- |
| PR タイトルの明確さ | タスク ID とタイトルが一致していること                               |
| PR 説明の完全性     | 変更ファイル・テスト数・受入条件・スコープ外が全て記載されていること |
| 準備条件の充足      | 全条件が満たされていることを確認してから PR を作成すること           |

---

## 成果物

| 成果物              | パス                          | 説明                    |
| ------------------- | ----------------------------- | ----------------------- |
| PR 本文             | `outputs/phase-13/pr-body.md` | PR 送信前に作成する本文 |
| GitHub Pull Request | （承認後に URL を記録）       | PR URL                  |

---

## 完了条件

- [ ] PR 作成は blocked であると明記されている（ユーザー承認待ち）
- [ ] PR 準備条件が全て確認されている
- [ ] PR タイトル・説明候補が準備されている
- [ ] `outputs/phase-13/pr-body.md` が作成されている
- [ ] ユーザーからの明示指示を待つことが記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク 100% 実行確認【必須】

Phase 13 完了時に以下を明記すること:

- PR 作成のブロック状態（ユーザー承認待ちであること）
- PR 準備条件の確認結果（全条件が満たされているか）
- ユーザー承認後に実行するコマンドの確認
- PR 本文の準備状況
