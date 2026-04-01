# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 3                                |
| タスクID   | TASK-NOTIFICATION-SERVICE-001    |
| 作成日     | 2026-04-01                       |
| ゲート種別 | 設計レビュー（Phase 4 進入許可） |

---

## 目的

Phase 2 の設計が AC-1〜AC-9 を全て満たし、DI 境界ルール・既存コードとの責務分離が正しいことを確認する。
MAJOR 指摘があれば Phase 2 へ差し戻し、PASS であれば Phase 4（テスト作成）へ進む。

---

## 実行タスク

### タスク 3-1: AC-1〜AC-9 の設計充足チェック

| AC   | 内容                                                                               | 設計での対応箇所                                     | 充足判定 |
| ---- | ---------------------------------------------------------------------------------- | ---------------------------------------------------- | -------- |
| AC-1 | `INotificationService.notify(title, body)` が型安全に定義される                    | Phase 2 タスク 2-2: `INotificationService.ts`        | PENDING  |
| AC-2 | `ElectronNotificationService` が `new Notification({ title, body }).show()` を呼ぶ | Phase 2 タスク 2-2: `ElectronNotificationService.ts` | PENDING  |
| AC-3 | `MockNotificationService` が `calls: Array<{title, body}>` を持つ                  | Phase 2 タスク 2-2: MockNotificationService 型定義   | PENDING  |
| AC-4 | `RuntimeSkillCreatorFacadeDeps` に `notificationService` が追加される              | Phase 2 タスク 2-3: DI 注入ポイント設計              | PENDING  |
| AC-5 | 完了時に `notify('スキル作成完了', skillName)` が呼ばれる                          | Phase 2 タスク 2-3: `executeAsync` 修正箇所          | PENDING  |
| AC-6 | 失敗時に `notify('スキル作成失敗', errorSummary)` が呼ばれる                       | Phase 2 タスク 2-3: `executeAsync` catch ブロック    | PENDING  |
| AC-7 | `before-quit` で `hasRunningExecution()` チェックが行われる                        | Phase 2 タスク 2-5: before-quit ガード設計           | PENDING  |
| AC-8 | `hasRunningExecution()` が boolean を返す                                          | Phase 2 タスク 2-4: `size > 0` チェック              | PENDING  |
| AC-9 | `notificationHandlers.ts` との競合がない                                           | Phase 1 タスク 1-1: P50 チェックで確認済み           | PENDING  |

### タスク 3-2: DI 境界ルールへの準拠チェック

| チェック項目                                                         | 評価基準                                                         | 判定    |
| -------------------------------------------------------------------- | ---------------------------------------------------------------- | ------- |
| `INotificationService` が `packages/shared` に露出していない         | `services/notification/` ディレクトリ内に閉じている              | PENDING |
| `ElectronNotificationService` が Main Process 外から import されない | Renderer Process や preload からの import がない設計になっている | PENDING |
| `MockNotificationService` がテストファイル内のみで定義される         | 本番コードにテスト用クラスが含まれない                           | PENDING |
| 通知サービスが IPC チャネルを経由しない                              | Main Process 内で直接 `Notification` API を呼ぶ設計になっている  | PENDING |

### タスク 3-3: 既存 `notificationHandlers.ts` との責務境界チェック

| 項目       | `notificationHandlers.ts`（既存）       | 本タスク（新規）                        |
| ---------- | --------------------------------------- | --------------------------------------- |
| 管理対象   | データベースに保存された通知（DB 通知） | OS ネイティブ通知（macOS ポップアップ） |
| 通信経路   | IPC ハンドラ経由                        | Main Process 内で直接呼び出し           |
| 名前空間   | `notification:*` IPC チャネル           | `INotificationService` インターフェース |
| 競合リスク | なし（責務が明確に分離されている）      | -                                       |

### タスク 3-4: `notify()` 失敗時の副作用チェック

設計で `notify()` のエラーが `executeAsync` の完了/失敗判定に影響しないことを確認する:

- `notify()` 呼び出しを個別の `try/catch` でラップする設計になっているか
- 通知の失敗がスキル生成のステータスを `failed` に変えないことが保証されているか

### タスク 3-5: ゲート判定

以下のいずれかの判定を下す:

| 判定      | 意味                           | 次のアクション                           |
| --------- | ------------------------------ | ---------------------------------------- |
| **PASS**  | 全チェックが通過した           | Phase 4（テスト作成）へ進む              |
| **MAJOR** | 重大な設計上の問題が発見された | Phase 2 へ差し戻し、問題を修正する       |
| **MINOR** | 軽微な問題が発見された         | Phase 4 へ進み、Phase 5 実装時に対処する |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                      |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Electron IPC セキュリティ |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI パターン               |

### 確認対象

| ファイル       | パス                                 |
| -------------- | ------------------------------------ |
| 要件定義       | `phase-1-requirements.md`            |
| 設計書         | `phase-2-design.md`                  |
| 設計トポロジー | `outputs/phase-2/design-topology.md` |

---

## 実行手順

### ステップ 1: 設計書の読み込み

`outputs/phase-2/design-topology.md` と `phase-2-design.md` を読み込む。

### ステップ 2: AC チェックの実施

タスク 3-1 の表の各行に対して PASS/FAIL/PENDING を記入する。

### ステップ 3: DI 境界ルールチェックの実施

タスク 3-2 の表の各行に対して PASS/FAIL を記入する。

### ステップ 4: 責務境界チェックの実施

タスク 3-3 の表を確認し、`notificationHandlers.ts` との競合がないことを確認する。

### ステップ 5: ゲート判定の実施

全チェック結果を集計し、PASS/MAJOR/MINOR のいずれかを `outputs/phase-3/design-review-result.md` に記録する。

---

## 多角的チェック観点

| 観点                   | 確認内容                                                              |
| ---------------------- | --------------------------------------------------------------------- |
| AC 充足度              | AC-1〜AC-9 の全てが設計で対応されていること                           |
| DI 境界の正確さ        | `INotificationService` が Main Process 外に漏れていないこと           |
| テスト可能性           | `MockNotificationService` をテストで使用できる設計になっていること    |
| 通知失敗の安全性       | 通知失敗がスキル生成の結果を変えない設計になっていること              |
| `before-quit` の安全性 | `event.preventDefault()` の後に必ず終了手段がある設計になっていること |
| 既存コードへの影響     | `notificationHandlers.ts` と競合しない責務設計になっていること        |

---

## 成果物

| 成果物           | パス                                      | 説明                                             |
| ---------------- | ----------------------------------------- | ------------------------------------------------ |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | AC チェック結果・DI 境界チェック結果・ゲート判定 |

---

## 完了条件

- [ ] AC-1〜AC-9 全てに対して充足判定（PASS/FAIL）が記入された
- [ ] DI 境界ルールへの準拠チェックが完了した
- [ ] 既存 `notificationHandlers.ts` との責務境界が明確に整理された
- [ ] `notify()` 失敗時の副作用が設計で対処されていることを確認した
- [ ] PASS / MAJOR / MINOR のゲート判定が `outputs/phase-3/design-review-result.md` に記録された
- [ ] MAJOR の場合は具体的な差し戻し指摘と Phase 2 修正ポイントが明記された
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク 100% 実行確認【必須】

Phase 3 完了時に以下を明記すること:

- AC-1〜AC-9 の充足判定結果（PASS の場合は全 AC の判定を列挙）
- DI 境界チェック結果
- ゲート判定（PASS/MAJOR/MINOR）
- MAJOR の場合は差し戻し先と修正内容

---

## 次 Phase

- **PASS / MINOR**: Phase 4（テスト作成 TDD Red）へ進む
- **MAJOR**: Phase 2（設計）へ差し戻し、修正完了後に再度 Phase 3 を実施する
