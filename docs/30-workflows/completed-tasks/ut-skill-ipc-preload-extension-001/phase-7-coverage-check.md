# Phase 7: テストカバレッジ確認 - UT-SKILL-IPC-PRELOAD-EXTENSION-001

## メタ情報

| 項目               | 値                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| タスクID           | UT-SKILL-IPC-PRELOAD-EXTENSION-001                                                                    |
| Phase              | 7（テストカバレッジ確認）                                                                             |
| 機能名             | ut-skill-ipc-preload-extension-001                                                                    |
| 作成日             | 2026-02-24                                                                                            |
| 前提Phase          | phase-6-test-expansion.md                                                                             |
| 目的               | 仕様書専用タスクとしてカバレッジ確認の非該当判定を維持する。                                          |
| 成果物ディレクトリ | docs/30-workflows/skill-import-agent-system/tasks/ut-skill-ipc-preload-extension-001/outputs/phase-7/ |

## 目的

仕様書専用タスクとしてカバレッジ確認の非該当判定を維持する。

## 実行タスク

- 実行方針: 下記Taskを順番に実施し、成果物へ根拠を記録する。

### Task 7-1: 非該当判定維持

- コード対象カバレッジ計測を実施しない判定を明記する
- 仕様書タスク制約との関係を明記する

### Task 7-2: 品質検証移管

- Phase 9文書品質検証項目を定義する
- 検証コマンドを再掲する

## SubAgent分担

| SubAgent   | 担当           |
| ---------- | -------------- |
| SubAgent-D | 非該当判定維持 |
| SubAgent-C | 型整合観点移管 |

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

| 参照資料      | パス                      | 内容           |
| ------------- | ------------------------- | -------------- |
| Phase 6成果物 | phase-6-test-expansion.md | 非該当判定記録 |
| Phase 5成果物 | phase-5-implementation.md | 更新対象一覧   |

## 統合テスト連携

- Phase 9で仕様書品質検証を実施する条件を引き継ぐ

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

1. 非該当判定を再確認する
2. Phase 9へ引き継ぐ観点を確定する

## 成果物

| 成果物               | パス                                       | 説明                       |
| -------------------- | ------------------------------------------ | -------------------------- |
| カバレッジ非該当記録 | outputs/phase-7/coverage-not-applicable.md | カバレッジ確認対象外の根拠 |

## 完了条件

- [ ] 非該当判定が維持されている
- [ ] 移管観点が明記されている
- [ ] 成果物パスが明記されている

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

Phase 8（リファクタリング）へ進む。
