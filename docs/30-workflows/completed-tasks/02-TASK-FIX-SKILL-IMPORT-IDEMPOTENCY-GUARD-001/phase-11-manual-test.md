# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 11                                                |
| 機能名     | TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001       |
| タスク名   | 重複インポート時の冪等性保証と不要IPC呼び出し抑止 |
| 前提Phase  | Phase 10                                          |
| 後続Phase  | ドキュメント更新                                  |
| 作成日     | 2026-03-04                                        |
| ステータス | completed                                         |

## 目的

実機で主要シナリオを検証し、画面証跡を取得する。

## 背景

既存実装では再インポート要求が繰り返し Main に到達し、冪等成功であっても無駄なIPC/ログ発生が残っていた。

## SubAgent分担

| SubAgent | 担当                                   |
| -------- | -------------------------------------- |
| A        | IPC Handler（`skill:import` 冪等契約） |
| B        | Renderer Store（再インポート抑止）     |
| C        | 回帰テスト設計・Phase 12仕様同期       |

## 実行タスク

- 手動シナリオ実行: 主要ユーザーフローを実機検証する
- 画面証跡取得: 検証目的付きスクリーンショットを保存する
- 差分確認: 想定外挙動の有無を記録する

## テストケース

| TC-ID | 観点                 | 操作                                   | 期待結果                                                              |
| ----- | -------------------- | -------------------------------------- | --------------------------------------------------------------------- |
| TC-01 | 初期表示の冪等状態   | Skill Center 初期表示                  | 既に追加済みスキルは `追加済み!` 表示で、再追加導線が無効化されている |
| TC-02 | 追加中の二重操作抑止 | 未追加スキルを追加し、処理中状態を確認 | ボタンは `追加中...` となり、追加処理中の重複トリガーが発生しない     |
| TC-03 | 追加後の状態整合     | TC-02 の完了後状態を確認               | 追加済みスキルとして一覧から除外され、残カード数が整合する            |
| TC-04 | 詳細パネル整合       | 追加済みスキルの詳細パネルを表示       | 詳細パネルに `追加済み` バッジが表示され、削除導線が正しく表示される  |

## 参照資料

| 参照資料           | パス                                      | 説明               |
| ------------------ | ----------------------------------------- | ------------------ |
| 最終レビュー結果   | `outputs/phase-10/final-review-result.md` | Phase 10 成果物    |
| 修正指示           | `outputs/phase-10/fix-instructions.md`    | Phase 10 成果物    |
| 依存Phase 2 成果物 | `outputs/phase-2/`                        | Phase 2 依存成果物 |
| 依存Phase 5 成果物 | `outputs/phase-5/`                        | Phase 5 依存成果物 |
| 依存Phase 6 成果物 | `outputs/phase-6/`                        | Phase 6 依存成果物 |
| 依存Phase 7 成果物 | `outputs/phase-7/`                        | Phase 7 依存成果物 |
| 依存Phase 8 成果物 | `outputs/phase-8/`                        | Phase 8 依存成果物 |
| 依存Phase 9 成果物 | `outputs/phase-9/`                        | Phase 9 依存成果物 |

## システム仕様（aiworkflow-requirements）

> 実装・検証の前に以下の正本仕様を確認し、仕様差分があれば Phase 12 で必ず同期すること。

| 参照資料         | パス                                                                            | 内容                                                      |
| ---------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 参照起点         | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                  | タスク種別から必要仕様を絞り込む                          |
| API/IPC 正本     | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md              | `skill:import` 契約と成功判定の整合を確認                 |
| Interface 正本   | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md | `ImportedSkill` の型契約を確認                            |
| 状態管理正本     | .claude/skills/aiworkflow-requirements/references/arch-state-management.md      | 冪等ガードと Store 同期契約を確認                         |
| UI仕様正本       | .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md   | Skill Center 表示契約と導線を確認                         |
| セキュリティ正本 | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md      | IPC 境界防御（sender 検証・入力境界保護・権限境界）を確認 |
| Electron API防御 | .claude/skills/aiworkflow-requirements/references/security-api-electron.md      | Preload公開面の境界防御を確認                             |
| エラー処理正本   | .claude/skills/aiworkflow-requirements/references/error-handling.md             | 冪等早期終了時のエラー状態を確認                          |
| タスク運用正本   | .claude/skills/aiworkflow-requirements/references/task-workflow.md              | `spec_created` / `completed` の更新運用を確認             |
| 抽出網羅性監査   | outputs/phase-2/aiworkflow-requirements-extraction-audit.md                     | 必須仕様と条件付き仕様の判定結果を確認                    |

## 実行手順

1. 参照資料を確認して判断根拠を固定する。
2. 実行タスクを順に処理し、成果物へ反映する。
3. 完了条件を検証し、次Phaseへ引き継ぐ。

## 統合テスト連携（Phase 1〜11）

- Main/Preload/Renderer の接続点を明示してテスト観点へ反映する。
- 不具合再現条件を自動テストと手動テスト双方へ引き継ぐ。

## 多角的チェック観点（AIが判断）

| 観点               | 確認内容                         | 参照仕様                   |
| ------------------ | -------------------------------- | -------------------------- |
| セキュリティ       | sender検証・入力検証・境界防御   | security-\*.md             |
| UI/UX              | 表示崩れ・導線・アクセシビリティ | ui-ux-\*.md                |
| アーキテクチャ     | 責務分離と依存方向               | architecture-\*.md         |
| API/IPC            | 引数・戻り値・エラー契約         | api-_.md / interfaces-_.md |
| エラーハンドリング | 例外分類と利用者通知             | error-handling.md          |

## 画面カバレッジマトリクス

| TC    | 画面/状態                               | 証跡                                                            |
| ----- | --------------------------------------- | --------------------------------------------------------------- |
| TC-01 | 初期表示（追加済み + 未追加の同時表示） | `outputs/phase-11/screenshots/TC-01-initial-imported-state.png` |
| TC-02 | 追加中状態（processing）                | `outputs/phase-11/screenshots/TC-02-new-skill-processing.png`   |
| TC-03 | 追加完了後状態（一覧整合）              | `outputs/phase-11/screenshots/TC-03-post-import-state.png`      |
| TC-04 | 詳細パネル表示（追加済みバッジ）        | `outputs/phase-11/screenshots/TC-04-imported-detail-panel.png`  |

## 成果物

| 成果物         | パス                                     | 内容             |
| -------------- | ---------------------------------------- | ---------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | シナリオ結果     |
| 画面証跡一覧   | `outputs/phase-11/screenshot-index.md`   | 検証目的付き証跡 |

## 完了条件

- [x] 実行タスクの成果物が定義されている
- [x] 参照仕様との整合根拠を記録した
- [x] 次Phaseへの引き継ぎ事項を記録した
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに `completed` に更新すること。

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001
```

## Phase実行記録

| 項目         | 記録                                                       |
| ------------ | ---------------------------------------------------------- |
| 実行タスク   | 完了（TC-01〜TC-04 実施、スクリーンショット4枚取得）       |
| 発見事項     | 冪等状態で `追加済み` 表示は安定。追加中状態でもUI破綻なし |
| 引き継ぎ事項 | Phase 12で証跡・診断JSON・仕様更新内容を正本へ同期         |

## 次のPhase

Phase 12 ドキュメント更新
