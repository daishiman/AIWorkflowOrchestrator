# Phase 9: 品質保証

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 9                             |
| タスクID | TASK-NOTIFICATION-SERVICE-001 |
| 作成日   | 2026-04-01                    |

---

## 目的

Phase 5〜8 の成果物が AC-1〜AC-9 を全て満たし、既存機能に影響を与えていないことを確認する。
typecheck・lint・テスト・セキュリティの 4 軸でのチェックと、リスク管理を完了させる。

---

## 実行タスク

### タスク 9-1: 全品質チェックの実施

```bash
# 1. TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# 2. ESLint
pnpm --filter @repo/desktop lint

# 3. 全テスト実行
pnpm vitest run

# 4. ビルド確認（型エラーが残っていないことをビルドでも確認）
pnpm --filter @repo/desktop build
```

全てのコマンドがエラー 0 件で完了することを確認する。

### タスク 9-2: AC-1〜AC-9 の最終充足チェック

| AC   | 内容                                                                                        | 確認方法                                                                | 結果    |
| ---- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------- |
| AC-1 | `INotificationService.notify(title, body)` が型安全に定義される                             | `typecheck` の通過                                                      | PENDING |
| AC-2 | `ElectronNotificationService` が `new Notification({ title, body }).show()` を呼ぶ          | TC-E-01 が Green                                                        | PENDING |
| AC-3 | `MockNotificationService` が `calls: Array<{title, body}>` を持つ                           | TC-F-01 が Green                                                        | PENDING |
| AC-4 | `RuntimeSkillCreatorFacadeDeps` に `notificationService: INotificationService` が追加される | `typecheck` の通過                                                      | PENDING |
| AC-5 | 完了時に `notify('スキル作成完了', skillName)` が呼ばれる                                   | TC-F-01 が Green                                                        | PENDING |
| AC-6 | 失敗時に `notify('スキル作成失敗', errorSummary)` が呼ばれる                                | TC-F-02 が Green                                                        | PENDING |
| AC-7 | `ipc/index.ts` / `beforeQuitGuard.ts` で `hasRunningExecution()` チェックが行われる         | TC-B-01, TC-B-02 が Green                                               | PENDING |
| AC-8 | `hasRunningExecution()` が boolean を返す                                                   | TC-F-04, TC-F-05 が Green                                               | PENDING |
| AC-9 | `notificationHandlers.ts` との競合がない                                                    | `git diff apps/desktop/src/main/ipc/notificationHandlers.ts` に変更なし | PENDING |

### タスク 9-3: セキュリティチェック

| チェック項目                                                           | 確認内容                                                                 | 結果    |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------- |
| `ElectronNotificationService` が Main Process 外に import されていない | `git grep "ElectronNotificationService" apps/desktop/src/renderer/` が空 | PENDING |
| `ElectronNotificationService` が preload に import されていない        | `git grep "ElectronNotificationService" apps/desktop/src/preload/` が空  | PENDING |
| `INotificationService` が `packages/shared` に露出していない           | `git grep "INotificationService" packages/` が空                         | PENDING |

### タスク 9-4: リスク管理

| リスク                                                                     | 可能性 | 影響                                   | 軽減策                                                       |
| -------------------------------------------------------------------------- | ------ | -------------------------------------- | ------------------------------------------------------------ |
| macOS 以外（Windows/Linux）で `Notification.isSupported()` が false を返す | 中     | 通知が送られない（機能的には問題なし） | `console.warn` でログを出力。将来タスクとして記録            |
| `before-quit` の `dialog.showMessageBox` が拒否された場合に終了できない    | 低     | ユーザーが意図せずアプリを閉じられない | `app.exit(0)` を「中断して終了」選択時のみ呼ぶ設計で対処済み |
| 複数の通知が連続して発火する（スキル生成が短時間に複数実行された場合）     | 低     | 複数の通知ポップアップが重なる         | 現時点では許容。将来タスクとして通知管理 UI を検討           |
| `notify()` の失敗ログが `console.warn` のみで気づきにくい                  | 中     | 通知失敗を認知できない                 | Phase 12 でモニタリング方針を記録                            |

### タスク 9-5: 品質レポートの作成

`outputs/phase-9/quality-report.md` に以下を記録する:

- 全品質チェック実行結果（コマンドと結果）
- AC-1〜AC-9 の最終充足結果
- セキュリティチェック結果
- リスク管理表

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                      |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Electron IPC セキュリティ |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI パターン               |

---

## 実行手順

### ステップ 1: 品質チェックの実施

タスク 9-1 のコマンドを全て実行し、エラーが 0 件であることを確認する。

### ステップ 2: AC の最終確認

タスク 9-2 の表を全て PENDING から PASS または FAIL に更新する。

### ステップ 3: セキュリティチェックの実施

タスク 9-3 のコマンドを実行し、Main Process 外への漏洩がないことを確認する。

### ステップ 4: リスク管理の整理

タスク 9-4 のリスクを評価し、追加リスクがあれば記録する。

### ステップ 5: 品質レポートの作成

`outputs/phase-9/quality-report.md` を作成する。

---

## 多角的チェック観点

| 観点             | 確認内容                                                             |
| ---------------- | -------------------------------------------------------------------- |
| リグレッション   | 既存の全テストが Green であること（新規失敗がゼロであること）        |
| 型安全性         | `typecheck` が 0 エラーで通過すること                                |
| コード品質       | `lint` が 0 エラーで通過すること                                     |
| セキュリティ境界 | `ElectronNotificationService` が Main Process 外に漏洩していないこと |
| 機能完全性       | AC-1〜AC-9 が全て PASS であること                                    |

---

## 成果物

| 成果物       | パス                                | 説明                                          |
| ------------ | ----------------------------------- | --------------------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 全品質チェック結果・AC 充足結果・リスク管理表 |

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` が 0 エラーで通過した
- [ ] `pnpm --filter @repo/desktop lint` が 0 エラーで通過した
- [ ] `pnpm vitest run` が全て Green（既存テストに新規失敗がない）であることを確認した
- [ ] AC-1〜AC-9 が全て PASS に更新された
- [ ] セキュリティチェック（タスク 9-3）が全て PASS した
- [ ] リスク管理表が作成された
- [ ] `outputs/phase-9/quality-report.md` が作成された
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク 100% 実行確認【必須】

Phase 9 完了時に以下を明記すること:

- typecheck / lint / test / build の実行結果（エラー数）
- AC-1〜AC-9 の全 PASS 確認
- セキュリティチェック全 PASS 確認

---

## 次 Phase

Phase 9 の完了条件が全て満たされたら Phase 10（最終レビューゲート）へ進む。
いずれかのチェックが FAIL の場合は、原因を分析して該当 Phase（Phase 5 または Phase 6）へ差し戻す。
