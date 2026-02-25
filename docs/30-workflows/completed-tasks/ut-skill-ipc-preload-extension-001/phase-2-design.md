# Phase 2: 設計 - UT-SKILL-IPC-PRELOAD-EXTENSION-001

## メタ情報

| 項目               | 値                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| タスクID           | UT-SKILL-IPC-PRELOAD-EXTENSION-001                                                                    |
| Phase              | 2（設計）                                                                                             |
| 機能名             | ut-skill-ipc-preload-extension-001                                                                    |
| 作成日             | 2026-02-24                                                                                            |
| 前提Phase          | phase-1-requirements.md                                                                               |
| 目的               | channels.ts、skill-api.ts、preload/types.ts、packages/sharedの設計方針を整合させる。                  |
| 成果物ディレクトリ | docs/30-workflows/skill-import-agent-system/tasks/ut-skill-ipc-preload-extension-001/outputs/phase-2/ |

## 目的

channels.ts、skill-api.ts、preload/types.ts、packages/sharedの設計方針を整合させる。

## 実行タスク

- 実行方針: 下記Taskを順番に実施し、成果物へ根拠を記録する。

### Task 2-1: チャネル設計

- 定数名と文字列リテラル対応表を作成する
- チャネル重複ゼロを確定する
- task-9Dから9Jへの所属を固定する

### Task 2-2: Preload API設計

- skillAPIサブネームスペース構造を固定する
- safeInvokeとsafeOn適用境界を明記する
- debug.onEvent解除関数契約を定義する

### Task 2-3: 型配置設計

- packages/shared/src/types/skill配下の分割案を定義する
- preload/types.tsとの責務境界を定義する
- barrel export方針を定義する

### Task 2-4: 仕様書更新設計

- task-9Dから9Jのartifacts.modifies更新ルールを定義する
- artifacts.creates更新対象を定義する
- 実装順序を依存順で固定する

## SubAgent分担

| SubAgent   | 担当                 |
| ---------- | -------------------- |
| SubAgent-A | チャネル設計レビュー |
| SubAgent-B | Preload API設計      |
| SubAgent-C | shared型設計         |
| SubAgent-D | task-9更新方針統合   |

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

| 参照資料      | パス                                                                                                                           | 内容                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| Phase 1成果物 | phase-1-requirements.md                                                                                                        | 要件と受け入れ基準        |
| task-9D       | docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023e-task-9d-skill-chain.md     | チェーン5チャネル要件     |
| task-9E       | docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023f-task-9e-skill-fork.md      | フォーク1チャネル要件     |
| task-9F       | docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md      | 共有3チャネル要件         |
| task-9G       | docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023a-task-9g-skill-schedule.md  | スケジュール5チャネル要件 |
| task-9H       | docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023b-task-9h-skill-debug.md     | デバッグ7チャネル要件     |
| task-9I       | docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023c-task-9i-skill-docs.md      | ドキュメント4チャネル要件 |
| task-9J       | docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023d-task-9j-skill-analytics.md | 分析5チャネル要件         |

## 統合テスト連携

- Phase 4契約検証ケース設計へ入力を渡す
- Phase 9 P32整合検証観点を固定する

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

1. Phase 1要件を設計論点へ展開する
2. チャネル、Preload、型配置を連結する
3. task-9更新対象を確定する
4. 設計根拠を成果物へ保存する

## 成果物

| 成果物             | パス                                  | 説明                       |
| ------------------ | ------------------------------------- | -------------------------- |
| チャネル設計書     | outputs/phase-2/channel-design.md     | 30チャネル対応表           |
| Preload API設計書  | outputs/phase-2/preload-api-design.md | skillAPI構造と呼び出し契約 |
| 型配置設計書       | outputs/phase-2/type-layout-design.md | shared型分割案             |
| 仕様更新マトリクス | outputs/phase-2/spec-update-matrix.md | task-9更新一覧             |

## 完了条件

- [ ] 30チャネル定義表が確定している
- [ ] safeInvoke/safeOn境界が明記されている
- [ ] shared型配置計画が確定している
- [ ] task-9更新対象が定義されている
- [ ] 成果物4件が定義されている

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

Phase 3（設計レビューゲート）へ進む。
