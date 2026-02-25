# Phase 3: 設計レビューゲート - UT-SKILL-IPC-PRELOAD-EXTENSION-001

## メタ情報

| 項目               | 値                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| タスクID           | UT-SKILL-IPC-PRELOAD-EXTENSION-001                                                                    |
| Phase              | 3（設計レビューゲート）                                                                               |
| 機能名             | ut-skill-ipc-preload-extension-001                                                                    |
| 作成日             | 2026-02-24                                                                                            |
| 前提Phase          | phase-2-design.md                                                                                     |
| 目的               | 設計の矛盾、依存抜け、セキュリティ欠落をレビューで除去する。                                          |
| 成果物ディレクトリ | docs/30-workflows/skill-import-agent-system/tasks/ut-skill-ipc-preload-extension-001/outputs/phase-3/ |

## 目的

設計の矛盾、依存抜け、セキュリティ欠落をレビューで除去する。

## 実行タスク

- 実行方針: 下記Taskを順番に実施し、成果物へ根拠を記録する。

### Task 3-1: 契約整合レビュー

- 30チャネル名、引数型、戻り値型の不整合を検査する
- P44/P45抵触項目を抽出する
- 修正要求を記録する

### Task 3-2: セキュリティレビュー

- ホワイトリスト運用とsender検証要件を確認する
- safeOn利用チャネルの監視境界を確認する
- P5二重登録リスク予防策を確認する

### Task 3-3: 依存関係レビュー

- Phase 1と2成果物参照漏れを確認する
- task-9更新順序の循環依存有無を確認する
- 依存順を確定する

### Task 3-4: SubAgent統合レビュー

- AからD成果物責任重複を確認する
- 引き継ぎ不足を抽出する
- レビュー結論を確定する

## SubAgent分担

| SubAgent   | 担当                        |
| ---------- | --------------------------- |
| SubAgent-A | 契約差分レビュー            |
| SubAgent-B | Preloadセキュリティレビュー |
| SubAgent-C | 型依存レビュー              |
| SubAgent-D | 最終判定統合                |

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

| 参照資料      | パス                    | 内容     |
| ------------- | ----------------------- | -------- |
| Phase 1成果物 | phase-1-requirements.md | 要件基準 |
| Phase 2成果物 | phase-2-design.md       | 設計案   |

## 統合テスト連携

- Phase 4失敗ケースへレビュー指摘を変換する
- Phase 10最終判定入力へレビュー結果を連結する

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

1. 契約、セキュリティ、依存の観点に分解する
2. 観点別に不整合を抽出する
3. 修正要求を優先度付きで記録する
4. ゲート判定を記録する

## 成果物

| 成果物           | パス                                    | 説明         |
| ---------------- | --------------------------------------- | ------------ |
| 設計レビュー結果 | outputs/phase-3/design-review-result.md | 指摘と判定   |
| 差分一覧         | outputs/phase-3/design-gap-list.md      | 修正要求一覧 |

## 完了条件

- [ ] 重大矛盾が0件である
- [ ] P5/P44/P45観点の判定が記録されている
- [ ] 依存循環が0件である
- [ ] SubAgent責務重複が0件である
- [ ] レビュー結果が保存されている

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

Phase 4（テスト作成）へ進む。
