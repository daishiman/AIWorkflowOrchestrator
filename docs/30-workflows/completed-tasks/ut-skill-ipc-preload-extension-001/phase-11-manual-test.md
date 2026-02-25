# Phase 11: 手動テスト検証 - UT-SKILL-IPC-PRELOAD-EXTENSION-001

## メタ情報

| 項目               | 値                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| タスクID           | UT-SKILL-IPC-PRELOAD-EXTENSION-001                                                                     |
| Phase              | 11（手動テスト検証）                                                                                   |
| 機能名             | ut-skill-ipc-preload-extension-001                                                                     |
| 作成日             | 2026-02-24                                                                                             |
| 前提Phase          | phase-10-final-review.md                                                                               |
| 目的               | 仕様書の目視点検で機械検証が拾わない矛盾を除去する。                                                   |
| 成果物ディレクトリ | docs/30-workflows/skill-import-agent-system/tasks/ut-skill-ipc-preload-extension-001/outputs/phase-11/ |

## 目的

仕様書の目視点検で機械検証が拾わない矛盾を除去する。

## 実行タスク

- 実行方針: 下記Taskを順番に実施し、成果物へ根拠を記録する。

### Task 11-1: 目視点検

- 用語統一と命名統一を点検する
- 章構成欠落を点検する

### Task 11-2: 契約表点検

- 30チャネル表の数と内訳を点検する
- task-9対応表の抜けを点検する

### Task 11-3: 引き継ぎ情報点検

- Phase 12入力情報不足有無を点検する
- Phase 13入力情報不足有無を点検する

## SubAgent分担

| SubAgent   | 担当             |
| ---------- | ---------------- |
| SubAgent-A | 契約表点検       |
| SubAgent-D | 引き継ぎ情報点検 |

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

| 参照資料       | パス                         | 内容           |
| -------------- | ---------------------------- | -------------- |
| Phase 10成果物 | phase-10-final-review.md     | 最終判定結果   |
| Phase 9成果物  | phase-9-quality-assurance.md | 品質検証結果   |
| Phase 2成果物  | phase-2-design.md            | 設計基準       |
| Phase 5成果物  | phase-5-implementation.md    | 更新手順       |
| Phase 6成果物  | phase-6-test-expansion.md    | 非該当判定記録 |
| Phase 7成果物  | phase-7-coverage-check.md    | 移管観点       |
| Phase 8成果物  | phase-8-refactoring.md       | 表現統一ルール |

## 統合テスト連携

- 手動点検結果をPhase 12更新履歴へ反映する

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

1. 目視点検観点で仕様書を確認する
2. 契約表数値整合を確認する
3. 引き継ぎ情報を確認する

## 成果物

| 成果物         | パス                                    | 説明                   |
| -------------- | --------------------------------------- | ---------------------- |
| 手動点検結果   | outputs/phase-11/manual-check-result.md | 目視点検ログ           |
| 引き継ぎ確認票 | outputs/phase-11/handover-checklist.md  | Phase 12と13向け確認票 |

## 完了条件

- [ ] 目視点検結果が記録されている
- [ ] 30チャネル数値整合が確認されている
- [ ] 引き継ぎ情報不足が0件である
- [ ] 改善点が記録されている
- [ ] 成果物2件が定義されている

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

Phase 12（ドキュメント更新）へ進む。
