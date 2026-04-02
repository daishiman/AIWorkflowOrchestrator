# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 6                             |
| タスクID | TASK-NOTIFICATION-SERVICE-001 |
| 作成日   | 2026-04-01                    |

---

## 目的

Phase 4 で作成した基本テスト（TC-E-01〜TC-E-03、TC-F-01〜TC-F-05、TC-B-01〜TC-B-02）を補完するエッジケーステストを追加する。
境界値・異常系・並行実行シナリオを追加し、実装の堅牢性を高める。

---

## 実行タスク

### タスク 6-1: エッジケーステストの追加

#### TC-E-04: `notify()` を連続で複数回呼んでも `show()` がそれぞれ呼ばれる

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| テスト名 | `notify() can be called multiple times independently` |
| 対象     | `ElectronNotificationService.notify()`                |
| 操作     | `service.notify()` を 3 回連続で呼ぶ                  |
| 期待結果 | `show()` が 3 回呼ばれること                          |

#### TC-E-05: `title` または `body` に空文字を渡しても `Notification` コンストラクタに渡る

| 項目     | 内容                                                        |
| -------- | ----------------------------------------------------------- |
| テスト名 | `notify() passes empty strings to Notification constructor` |
| 対象     | `ElectronNotificationService.notify()`                      |
| 操作     | `service.notify('', '')` を呼ぶ                             |
| 期待結果 | `Notification` が `{ title: '', body: '' }` で呼ばれること  |

#### TC-F-06: 並行して複数の `executeAsync` が実行中のとき `hasRunningExecution()` が `true` を返す

| 項目     | 内容                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| テスト名 | `hasRunningExecution() returns true with multiple concurrent executions`        |
| 対象     | `RuntimeSkillCreatorFacade.hasRunningExecution()`                               |
| 操作     | `executeAsync` を 2 回並行で開始し、両方完了前に `hasRunningExecution()` を呼ぶ |
| 期待結果 | `true` が返ること                                                               |

#### TC-F-07: 1 つが完了し残り 1 つが実行中のとき `hasRunningExecution()` が `true` を返す

| 項目     | 内容                                                                             |
| -------- | -------------------------------------------------------------------------------- |
| テスト名 | `hasRunningExecution() returns true when one of two executions completes`        |
| 対象     | `RuntimeSkillCreatorFacade.hasRunningExecution()`                                |
| 操作     | 2 つの `executeAsync` のうち 1 つを完了させてから `hasRunningExecution()` を呼ぶ |
| 期待結果 | `true` が返ること                                                                |

#### TC-F-08: 全ての `executeAsync` が完了したとき `hasRunningExecution()` が `false` を返す

| 項目     | 内容                                                                      |
| -------- | ------------------------------------------------------------------------- |
| テスト名 | `hasRunningExecution() returns false after all executions complete`       |
| 対象     | `RuntimeSkillCreatorFacade.hasRunningExecution()`                         |
| 操作     | 2 つの `executeAsync` を両方完了させてから `hasRunningExecution()` を呼ぶ |
| 期待結果 | `false` が返ること                                                        |

### タスク 6-2: 既存テストのリグレッション確認

Phase 5 の実装後に既存の `RuntimeSkillCreatorFacade` テストが全て Green であることを確認する:

```bash
pnpm --filter @repo/desktop test -- RuntimeSkillCreatorFacade
```

失敗があれば Phase 5 の実装を修正する。

### タスク 6-3: テスト拡充レポートの作成

`outputs/phase-6/test-expansion-report.md` に以下を記録する:

- 追加したテストケース一覧（TC-E-04〜TC-E-05、TC-F-06〜TC-F-08）
- 各テストケースの目的（何を検証するか）
- リグレッション確認結果

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                         | 内容                      |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC セキュリティ |

---

## 実行手順

### ステップ 1: エッジケーステストの追加

タスク 6-1 のテストケースを既存のテストファイルに追記する。

### ステップ 2: テストの実行

```bash
pnpm --filter @repo/desktop test -- ElectronNotificationService
pnpm --filter @repo/desktop test -- RuntimeSkillCreatorFacade
pnpm vitest run
```

### ステップ 3: レポートの作成

`outputs/phase-6/test-expansion-report.md` に結果を記録する。

---

## 多角的チェック観点

| 観点             | 確認内容                                                           |
| ---------------- | ------------------------------------------------------------------ |
| エッジケース網羅 | 空文字・複数並行実行・部分完了のシナリオが全てカバーされていること |
| リグレッション   | 既存テストが全て Green のままであること                            |
| テスト命名       | テスト名が「何を確認するか」を明確に表していること                 |

---

## 成果物

| 成果物             | パス                                       | 説明                           |
| ------------------ | ------------------------------------------ | ------------------------------ |
| テスト拡充レポート | `outputs/phase-6/test-expansion-report.md` | 追加テストケース一覧と実行結果 |

---

## 完了条件

- [ ] TC-E-04〜TC-E-05 が追加された
- [ ] TC-F-06〜TC-F-08 が追加された
- [ ] 全テスト（既存 + 新規）が Green であることを確認した
- [ ] `outputs/phase-6/test-expansion-report.md` が作成された
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク 100% 実行確認【必須】

Phase 6 完了時に以下を明記すること:

- 追加したテストケース（TC 番号・テスト名）
- 全テスト実行結果（テスト数・成功数・失敗数）

---

## 次 Phase

Phase 6 の完了条件が全て満たされたら Phase 7（カバレッジ確認）へ進む。
