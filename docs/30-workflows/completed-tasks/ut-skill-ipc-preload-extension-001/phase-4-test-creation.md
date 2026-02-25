# Phase 4: テスト作成 - UT-SKILL-IPC-PRELOAD-EXTENSION-001

## メタ情報

| 項目               | 値                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| タスクID           | UT-SKILL-IPC-PRELOAD-EXTENSION-001                                                                    |
| Phase              | 4（テスト作成）                                                                                       |
| 機能名             | ut-skill-ipc-preload-extension-001                                                                    |
| 作成日             | 2026-02-24                                                                                            |
| 前提Phase          | phase-3-design-review.md                                                                              |
| 目的               | 仕様書タスクとして実装前に必要な検証ケースを定義する。                                                |
| 成果物ディレクトリ | docs/30-workflows/skill-import-agent-system/tasks/ut-skill-ipc-preload-extension-001/outputs/phase-4/ |

## 目的

仕様書タスクとして実装前に必要な検証ケースを定義する。

## 実行タスク

- 実行方針: 下記Taskを順番に実施し、成果物へ根拠を記録する。

### Task 4-1: チャネル整合検証ケース作成

- 30チャネル完全一致検証ケースを作成する
- 重複検出ケースを作成する
- 命名規則違反検出ケースを作成する

### Task 4-2: IPC契約検証ケース作成

- 引数型不整合検出ケースを作成する
- 戻り値型不整合検出ケースを作成する
- handle/on混在検出ケースを作成する

### Task 4-3: P32検証ケース作成

- channels.ts、skill-api.ts、preload/types.ts三点同期検証を作成する
- shared型配置漏れ検出ケースを作成する

### Task 4-4: SubAgent責任検証ケース作成

- 成果物責任重複検出ケースを作成する
- 引き継ぎ漏れ検出ケースを作成する

## SubAgent分担

| SubAgent   | 担当                   |
| ---------- | ---------------------- |
| SubAgent-A | チャネル整合テスト設計 |
| SubAgent-B | Preload契約テスト設計  |
| SubAgent-C | 型同期テスト設計       |
| SubAgent-D | 責任境界テスト設計     |

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

| 参照資料      | パス                     | 内容         |
| ------------- | ------------------------ | ------------ |
| Phase 1成果物 | phase-1-requirements.md  | 受け入れ基準 |
| Phase 2成果物 | phase-2-design.md        | 設計仕様     |
| Phase 3成果物 | phase-3-design-review.md | レビュー指摘 |

## 統合テスト連携

- Phase 9品質検証スクリプト条件をテストケースへ埋め込む
- Phase 11手動点検項目へ連結する

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

1. 要件と設計から検証条件を抽出する
2. 失敗ケースと成功ケースを定義する
3. P32検証表を作成する
4. SubAgent責任検証ケースを作成する

## 成果物

| 成果物             | パス                                   | 説明                             |
| ------------------ | -------------------------------------- | -------------------------------- |
| 契約検証ケース     | outputs/phase-4/contract-test-cases.md | チャネル、引数、戻り値検証ケース |
| P32検証ケース      | outputs/phase-4/p32-test-cases.md      | 三点同期検証ケース               |
| 責任境界検証ケース | outputs/phase-4/subagent-test-cases.md | SubAgent責任検証ケース           |

## 完了条件

- [ ] 30チャネル検証ケースが定義されている
- [ ] 契約不整合検出ケースが定義されている
- [ ] P32検証ケースが定義されている
- [ ] SubAgent責任検証ケースが定義されている
- [ ] 成果物3件が定義されている

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

Phase 5（実装）へ進む。
