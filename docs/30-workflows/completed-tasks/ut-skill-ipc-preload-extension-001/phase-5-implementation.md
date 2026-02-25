# Phase 5: 実装 - UT-SKILL-IPC-PRELOAD-EXTENSION-001

## メタ情報

| 項目               | 値                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| タスクID           | UT-SKILL-IPC-PRELOAD-EXTENSION-001                                                                    |
| Phase              | 5（実装）                                                                                             |
| 機能名             | ut-skill-ipc-preload-extension-001                                                                    |
| 作成日             | 2026-02-24                                                                                            |
| 前提Phase          | phase-4-test-creation.md                                                                              |
| 目的               | コード実装を行わず、仕様書更新手順と計画書生成手順を確定する。                                        |
| 成果物ディレクトリ | docs/30-workflows/skill-import-agent-system/tasks/ut-skill-ipc-preload-extension-001/outputs/phase-5/ |

## 目的

コード実装を行わず、仕様書更新手順と計画書生成手順を確定する。

## 実行タスク

- 実行方針: 下記Taskを順番に実施し、成果物へ根拠を記録する。

### Task 5-1: IPC拡張計画書作成手順の確定

- 30チャネル定義表作成手順を定義する
- P32チェックリスト90項目作成手順を定義する
- 実装順序固定手順を定義する

### Task 5-2: task-9更新手順の確定

- artifacts.modifies更新ルールを定義する
- artifacts.creates更新ルールを定義する
- 参照パス更新ルールを定義する

### Task 5-3: SubAgent統合手順の確定

- 仕様書単位の責務分割手順を定義する
- 統合レビュー手順を定義する
- 引き継ぎ記録手順を定義する

### Task 5-4: 変更対象固定

- 変更対象ファイル一覧を確定する
- 対象外ファイルを固定する
- 実装禁止範囲を再確認する

## SubAgent分担

| SubAgent   | 担当                  |
| ---------- | --------------------- |
| SubAgent-A | 契約計画書作成手順    |
| SubAgent-B | Preload計画書作成手順 |
| SubAgent-C | 型配置計画書作成手順  |
| SubAgent-D | task-9更新手順統合    |

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

| 参照資料       | パス                                                                                                                                     | 内容       |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Phase 4成果物  | phase-4-test-creation.md                                                                                                                 | 検証ケース |
| 元タスク仕様書 | docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-012-ut-skill-ipc-preload-extension-001.md | 計画書要求 |

## 統合テスト連携

- Phase 9品質検証で確認する成果物完全性条件を固定する
- Phase 12更新履歴出力項目を先行定義する

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

1. 計画書更新手順を対象ファイル単位で分解する
2. task-9更新ルールを明文化する
3. SubAgent統合手順を定義する
4. 変更対象一覧を固定する

## 成果物

| 成果物         | パス                                        | 説明                       |
| -------------- | ------------------------------------------- | -------------------------- |
| 計画書作成手順 | outputs/phase-5/plan-authoring-procedure.md | ipc-extension-plan作成手順 |
| 仕様更新手順   | outputs/phase-5/spec-update-procedure.md    | task-9更新手順             |
| 変更対象一覧   | outputs/phase-5/spec-update-targets.md      | 更新対象と対象外ファイル   |

## 完了条件

- [ ] 計画書作成手順が定義されている
- [ ] task-9更新手順が定義されている
- [ ] SubAgent統合手順が定義されている
- [ ] 変更対象一覧が固定されている
- [ ] コード実装を行わない制約が明記されている

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

Phase 6（テスト拡充）へ進む。
