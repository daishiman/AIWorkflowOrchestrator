# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 1                                       |
| タスクID   | TASK-NOTIFICATION-SERVICE-001           |
| 作成日     | 2026-04-01                              |
| 前提タスク | TASK-FIX-EXECUTE-PLAN-FF-001 完了が前提 |

---

## 目的

スコープ、受入条件（AC）、変更対象インベントリを固定し、Phase 2 の設計に必要な全前提を確立する。
「何を作るか・何を作らないか」の境界を明確化することで、設計フェーズで判断ブレを防ぐ。

---

## 実行タスク

### タスク 1-1: P50 チェック（既存コード確認）

以下のコマンドで `INotificationService` と `ElectronNotificationService` が既存コードに存在しないこと、`notificationHandlers` が既存の DB 通知管理として存在することを確認する:

```bash
# INotificationService の存在確認
git grep -r "INotificationService" apps/desktop/src/

# ElectronNotificationService の存在確認
git grep -r "ElectronNotificationService" apps/desktop/src/

# 既存の Notification 使用箇所確認
git grep -r "new Notification" apps/desktop/src/main/

# 既存の notificationHandlers の確認（競合チェック用）
git grep -r "notificationHandlers" apps/desktop/src/
```

期待結果:

- `INotificationService` と `ElectronNotificationService` は 0 件（未実装）
- `new Notification` は 0 件（OS 通知未導入）
- `notificationHandlers` は 1 件以上（既存の DB 通知管理の存在確認）

### タスク 1-2: 変更対象ファイルのインベントリ確定

| 種別     | ファイルパス                                                                                      | 目的                                                 |
| -------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 新規作成 | `apps/desktop/src/main/services/notification/INotificationService.ts`                             | 通知サービスインターフェース定義                     |
| 新規作成 | `apps/desktop/src/main/services/notification/ElectronNotificationService.ts`                      | Electron 実装（macOS 通知）                          |
| 新規作成 | `apps/desktop/src/main/services/notification/__tests__/ElectronNotificationService.test.ts`       | Electron 実装のユニットテスト                        |
| 新規作成 | `apps/desktop/src/main/ipc/beforeQuitGuard.ts`                                                    | `before-quit` ガードの共通化ヘルパー                 |
| 新規作成 | `apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts`                                     | before-quit ガードのユニットテスト                   |
| 新規作成 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` | Facade 通知のユニットテスト                          |
| 修正     | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | deps 追加・notify 呼び出し・hasRunningExecution 追加 |
| 修正     | `apps/desktop/src/main/ipc/index.ts`                                                              | DI 注入・before-quit guard 登録                      |

### タスク 1-3: 受入条件（AC）の定義

| AC   | 内容                                                                                                                            | 検証方法                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| AC-1 | `INotificationService.notify(title: string, body: string): void` インターフェースが TypeScript で型安全に定義される             | `tsc --noEmit` が通ること                                      |
| AC-2 | `ElectronNotificationService` が `new Notification({ title, body }).show()` を呼ぶ                                              | ユニットテストで `Notification` コンストラクタのモックを確認   |
| AC-3 | `MockNotificationService` が `calls: Array<{ title: string; body: string }>` を持ち、`notify()` 呼び出しで `calls` に追記される | ユニットテストで `calls` の内容を検証                          |
| AC-4 | `RuntimeSkillCreatorFacadeDeps` に `notificationService: INotificationService` フィールドが追加される                           | TypeScript 型チェックで確認                                    |
| AC-5 | スキル生成完了時に `notificationService.notify('スキル作成完了', skillName)` が呼ばれる                                         | Facade ユニットテストで `MockNotificationService.calls` を確認 |
| AC-6 | スキル生成失敗時に `notificationService.notify('スキル作成失敗', errorSummary)` が呼ばれる                                      | Facade ユニットテストで `MockNotificationService.calls` を確認 |
| AC-7 | `before-quit` ガードで `facade.hasRunningExecution()` が `true` の場合に `event.preventDefault()` が呼ばれる                    | ユニットテストまたはインテグレーションテストで確認             |
| AC-8 | `hasRunningExecution()` が実行中のとき `true`、完了後は `false` を返す                                                          | Facade ユニットテストで両状態を確認                            |
| AC-9 | 既存の `notificationHandlers.ts`（DB 通知管理）のコードが変更されない、または同名の識別子が衝突しない                           | `git diff notificationHandlers.ts` で変更がないことを確認      |

### タスク 1-4: タスク分類の確定

| 分類項目          | 値                    | 理由                                                    |
| ----------------- | --------------------- | ------------------------------------------------------- |
| タスク種別        | code 実装タスク       | TypeScript ファイルの新規作成・修正を行う               |
| VISUAL/NON_VISUAL | NON_VISUAL            | UI コンポーネントの変更なし。通知は OS ネイティブ UI    |
| テスト種別        | ユニットテスト（TDD） | Electron 環境外で実行可能なユニットテストを先に作成する |
| 影響範囲          | Main Process のみ     | Renderer Process・preload には変更なし                  |

### タスク 1-5: 命名規則の確認

| 識別子                        | 命名規則                           | 確認                                             |
| ----------------------------- | ---------------------------------- | ------------------------------------------------ |
| `INotificationService`        | PascalCase（TypeScript interface） | `I` プレフィックスは Main Process 側の慣習に準拠 |
| `ElectronNotificationService` | PascalCase（TypeScript class）     | 実装クラスの標準命名                             |
| `MockNotificationService`     | PascalCase（TypeScript class）     | テスト用モッククラスの標準命名                   |
| `notificationService`         | camelCase（プロパティ名）          | TypeScript プロパティの標準命名                  |
| `hasRunningExecution`         | camelCase（メソッド名）            | TypeScript メソッドの標準命名                    |

### タスク 1-6: 前提タスクへの依存確認

TASK-FIX-EXECUTE-PLAN-FF-001 が完了していることを確認する:

```bash
# RuntimeSkillCreatorFacade.execute の存在確認
rg -n "async execute\\(" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# SKILL_CREATOR_WORKFLOW_STATE_CHANGED の存在確認
git grep -r "SKILL_CREATOR_WORKFLOW_STATE_CHANGED" apps/desktop/src/
```

期待結果: 両方とも 1 件以上ヒットすること。未実装の場合は本タスクを中断し、前提タスクの完了を待つ。

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                              |
| -------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| セキュリティ仕様           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Electron IPC セキュリティ         |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI パターン・インターフェース設計 |

### 関連ファイル

| ファイル                  | パス                                                                  | 用途                        |
| ------------------------- | --------------------------------------------------------------------- | --------------------------- |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 修正対象 Facade             |
| notificationHandlers      | `apps/desktop/src/main/ipc/notificationHandlers.ts`                   | 競合確認対象（DB 通知管理） |
| IPC 組み立て（Main）      | `apps/desktop/src/main/ipc/index.ts`                                  | DI 注入・ガード登録対象     |
| before-quit ガード        | `apps/desktop/src/main/ipc/beforeQuitGuard.ts`                        | ガード共通化対象            |

---

## 実行手順

### ステップ 1: P50 チェックの実施

タスク 1-1 のコマンドを実行し、結果を `outputs/phase-1/spec-extraction-map.md` に記録する。

### ステップ 2: インベントリの確定

タスク 1-2 の表を `outputs/phase-1/spec-extraction-map.md` に転記し、実際のファイル存在状況とのギャップを記録する。

### ステップ 3: AC の確認

タスク 1-3 の AC-1〜AC-9 が全て定義されていることを確認する。

### ステップ 4: 前提タスク依存確認

タスク 1-6 のコマンドを実行し、結果を記録する。未実装の場合は作業を停止する。

---

## 多角的チェック観点

| 観点                       | 確認内容                                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 既存コードとの競合         | `notificationHandlers.ts` が管理する「DB 通知」と本タスクの「OS 通知」が同じ名前空間に入らないこと          |
| Electron API 可用性        | `new Notification()` が Main Process でのみ動作することを確認（Renderer では `window.Notification` が別物） |
| テスト可能性               | `ElectronNotificationService` が `Notification` コンストラクタをモック可能な形に設計されること              |
| 前提タスクのブロッカー確認 | `execute()` が存在しない場合、本タスクの Phase 4 以降は実施不可                                             |

---

## 成果物

| 成果物             | パス                                     | 説明                                    |
| ------------------ | ---------------------------------------- | --------------------------------------- |
| スペック抽出マップ | `outputs/phase-1/spec-extraction-map.md` | P50 チェック結果・インベントリ・AC 一覧 |

---

## 完了条件

- [ ] P50 チェック（タスク 1-1）を実行し、`INotificationService` と `ElectronNotificationService` が既存コードに存在しないことを確認した
- [ ] 変更対象ファイルのインベントリ（新規 6 本 + 修正 2 本）が確定した
- [ ] AC-1〜AC-9 が全て定義された
- [ ] タスク分類（NON_VISUAL、ユニットテスト）が確定した
- [ ] 命名規則（PascalCase / camelCase）が確定した
- [ ] 前提タスク TASK-FIX-EXECUTE-PLAN-FF-001 の完了状態を確認した
- [ ] `outputs/phase-1/spec-extraction-map.md` が作成された
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク 100% 実行確認【必須】

Phase 1 完了時に以下を明記すること:

- P50 チェック結果（ヒット件数とファイル名）
- 前提タスク確認結果（`execute` と `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` の存在）
- インベントリ確定状態
- AC-1〜AC-9 の定義完了

---

## 次 Phase

Phase 1 の完了条件が全て満たされたら Phase 2（設計）へ進む。

前提タスクが未完了の場合は Phase 2 への移行を停止し、TASK-FIX-EXECUTE-PLAN-FF-001 の完了を待つ。
