# Phase 1: 要件定義 - UT-SKILL-IPC-PRELOAD-EXTENSION-001

## メタ情報

| 項目               | 値                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| タスクID           | UT-SKILL-IPC-PRELOAD-EXTENSION-001                                                                    |
| Phase              | 1（要件定義）                                                                                         |
| 機能名             | ut-skill-ipc-preload-extension-001                                                                    |
| 作成日             | 2026-02-24                                                                                            |
| 前提Phase          | なし（開始Phase）                                                                                     |
| 目的               | 元タスク仕様を分解し、30チャネル計画の機能要件、非機能要件、受け入れ基準を固定する。                  |
| 成果物ディレクトリ | docs/30-workflows/skill-import-agent-system/tasks/ut-skill-ipc-preload-extension-001/outputs/phase-1/ |

## 目的

元タスク仕様を分解し、30チャネル計画の機能要件、非機能要件、受け入れ基準を固定する。

## 実行タスク

- 実行方針: 下記Taskを順番に実施し、成果物へ根拠を記録する。

### Task 1-1: 機能要件の固定

- 30チャネルをtask-9Dから9Jに分類する
- handle 29件とon 1件を確定する
- skill:importFromSource前提を固定する

### Task 1-2: 非機能要件の固定

- P5/P32/P44/P45再発防止要件を定義する
- ホワイトリストを個別定義で固定する
- ワイルドカード不採用を明記する

### Task 1-3: 受け入れ基準の定義

- 検証コマンドと期待結果を定義する
- 依存タスクと前提条件を明記する

### Task 1-4: SubAgent分担の定義

- SubAgent-AからDの責務境界を定義する
- 成果物責任をPhase単位で紐付ける

## SubAgent分担

| SubAgent   | 担当                 |
| ---------- | -------------------- |
| SubAgent-A | 30チャネル要件の抽出 |
| SubAgent-B | Preload API要件抽出  |
| SubAgent-C | shared型要件抽出     |
| SubAgent-D | 依存関係と順序統合   |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                      | 内容                                       |
| ------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| API IPC仕様              | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md                        | IPCチャネル命名、引数契約、戻り値契約      |
| Skillインターフェース    | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md           | Renderer-Preload-Main間のSkill API契約     |
| Electron APIセキュリティ | .claude/skills/aiworkflow-requirements/references/security-api-electron.md                | contextBridge、ホワイトリスト、公開API制約 |
| Electron IPCセキュリティ | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md                | ipcMain.handle/on運用差分、Sender検証      |
| Skill IPCセキュリティ    | .claude/skills/aiworkflow-requirements/references/security-skill-ipc.md                   | safeInvoke/safeOn運用、Skill API防御       |
| Skill実行セキュリティ    | .claude/skills/aiworkflow-requirements/references/security-skill-execution.md             | 権限と実行境界                             |
| IPC契約チェックリスト    | .claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md               | P23/P32/P42/P44/P45検証                    |
| IPC型不整合解決          | .claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md            | 型不整合分類と解消手順                     |
| 実装パターン             | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md | IPC拡張とPreload API設計                   |
| Electronサービス設計     | .claude/skills/aiworkflow-requirements/references/arch-electron-services.md               | Main Process責務分離                       |
| 品質基準                 | .claude/skills/aiworkflow-requirements/references/quality-requirements.md                 | 品質ゲートとテスト要件                     |
| 既知の落とし穴           | .claude/skills/aiworkflow-requirements/references/06-known-pitfalls.md                    | P5/P32/P44/P45再発防止                     |
| エラーハンドリング       | .claude/skills/aiworkflow-requirements/references/error-handling.md                       | IPC失敗時のエラー契約                      |
| 教訓集                   | .claude/skills/aiworkflow-requirements/references/lessons-learned.md                      | 同種タスク失敗例と予防策                   |
| Desktop技術要件          | .claude/skills/aiworkflow-requirements/references/technology-desktop.md                   | Electron 3層責務                           |

### タスク固有参照

| 参照資料       | パス                                                                                                                                       | 内容                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| 元タスク仕様書 | docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-012-ut-skill-ipc-preload-extension-001.md   | 要件正本             |
| 依存タスク     | docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023-task-9b-skill-creator-core.md           | TASK-9B 前提確認     |
| 依存タスク     | docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-011-ut-skill-import-channel-conflict-001.md | チャネル競合回避前提 |

## 統合テスト連携

- Phase 4の検証観点を要件として固定する
- 30チャネル完全一致の期待値を固定する

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                   | 仕様参照先                                       |
| ------------------ | -------------------------- | ------------------------------------------------ |
| セキュリティ       | 必須                       | aiworkflow-requirements: security-\*.md          |
| UI/UX              | 非該当（仕様書タスク）     | aiworkflow-requirements: ui-ux-\*.md             |
| アーキテクチャ     | 必須                       | aiworkflow-requirements: architecture-\*.md      |
| API設計            | 必須                       | aiworkflow-requirements: api-\*.md               |
| データ整合性       | 非該当（DB変更なし）       | aiworkflow-requirements: database-\*.md          |
| エラーハンドリング | 必須                       | aiworkflow-requirements: error-handling.md       |
| パフォーマンス     | 対象限定（設計妥当性確認） | aiworkflow-requirements: quality-requirements.md |
| アクセシビリティ   | 非該当（UI実装なし）       | aiworkflow-requirements: ui-ux-\*.md             |
| テスタビリティ     | 必須                       | aiworkflow-requirements: quality-requirements.md |

### Electronデスクトップアプリ観点

| 層                         | 適用判断             | 仕様参照先                                             |
| -------------------------- | -------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | 契約確認のみ適用     | aiworkflow-requirements: interfaces-agent-sdk-skill.md |
| バックエンド（Main）       | 必須                 | aiworkflow-requirements: arch-electron-services.md     |
| IPC通信                    | 必須                 | aiworkflow-requirements: api-ipc-agent.md              |
| Preload/セキュリティ       | 必須                 | aiworkflow-requirements: security-api-electron.md      |
| ローカルストレージ         | 非該当（DB変更なし） | aiworkflow-requirements: database-\*.md                |

## 実行手順

1. 元タスク仕様書の要件を抽出する
2. 機能要件と非機能要件を分類する
3. 受け入れ基準を検証コマンドと紐付ける
4. SubAgent分担を記録する

## 成果物

| 成果物         | パス                                       | 説明                 |
| -------------- | ------------------------------------------ | -------------------- |
| 要件定義書     | outputs/phase-1/requirements-definition.md | 機能要件と非機能要件 |
| 受け入れ基準   | outputs/phase-1/acceptance-criteria.md     | 検証可能条件一覧     |
| SubAgent責務表 | outputs/phase-1/subagent-ownership.md      | 責務分割と責任境界   |

## 完了条件

- [ ] 30チャネル要件と分類が確定している
- [ ] P5/P32/P44/P45再発防止要件が明記されている
- [ ] 受け入れ基準が検証コマンドと紐付いている
- [ ] SubAgent責務が重複なく定義されている
- [ ] 成果物3件の出力先が明記されている

## サブタスク管理

Phase実行開始時に以下のサブタスクを作成して管理する。

1. 参照資料確認
2. 実行タスク実施
3. 成果物作成
4. 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で完了状態を明記している

## 次Phase

Phase 2（設計）へ進む。
