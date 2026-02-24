# Phase 11: 手動テスト — UT-SKILL-IMPORT-CHANNEL-CONFLICT-001

## メタ情報

| 項目               | 値                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------ |
| タスクID           | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001                                                       |
| Phase              | 11 — 手動テスト                                                                            |
| 機能名             | ut-skill-import-channel-conflict-001                                                       |
| 前提Phase          | Phase 10（最終レビュー）PASS または MINOR 判定                                             |
| 成果物ディレクトリ | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-11/` |
| 作成日             | 2026-02-24                                                                                 |

## 目的

自動検証（grep）では確認できない仕様書の意味的整合性を手動で目視確認する。仕様書修正のみのタスクであるため、コード実行を伴わず、Markdown ファイルの目視確認が中心となる。

## 背景

grep による文字列マッチだけでは、チャネル名の「文脈上の正しさ」（ローカル用と外部用の区別が文意として明確か）や、テーブルのフォーマット整合性は検証できない。人間の目で仕様書を通読し、TASK-9F 実装者が混乱しない品質であることを確認する。

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 1: チャネル名区別の目視確認

#### 1-1. テストケーステーブル

| No  | カテゴリ         | テスト項目                                                              | 操作手順                                    | 期待結果                                                                | 結果 | 備考 |
| --- | ---------------- | ----------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------- | ---- | ---- |
| 1   | チャネル区別     | task-022 の Step 3 で `skill:import` が `skill:importFromSource` に変更 | task-022 の Step 3 全体を通読               | IPC チャネル定義・ハンドラ定義・Preload API の3箇所全てが変更済み       |      |      |
| 2   | IPC テーブル     | task-030 セクション 15B.2 のチャネル名が更新                            | 15B.2 の IPC テーブルを目視確認             | 外部インポート関連の4行が `skill:importFromSource` に変更されている     |      |      |
| 3   | セクション11追加 | task-030 セクション 11 に3チャネルが追加                                | セクション 11 のIPC連携テーブルを目視確認   | `skill:importFromSource`, `skill:validateSource`, `skill:export` が存在 |      |      |
| 4   | 既存互換         | task-030 セクション 11 の既存チャネルが変更されていない                 | セクション 11 の既存行（skill:list 等）確認 | `skill:list`, `skill:import`, `skill:remove` 等の既存行が変更なし       |      |      |
| 5   | 注記追加         | task-022 に競合防止の注記が追加                                         | task-022 内を通読して注記を確認             | 既存/新規チャネルの用途区別が注記として明記されている                   |      |      |
| 6   | artifacts        | task-022 の artifacts.modifies に2ファイルが含まれている                | task-022 の artifacts セクションを確認      | `channels.ts` と `preload/types.ts` が modifies に追加されている        |      |      |

### Task 2: 意味的整合性の確認

#### 2-1. テストケーステーブル

| No  | カテゴリ       | テスト項目                                                    | 操作手順                                         | 期待結果                                                           | 結果 | 備考 |
| --- | -------------- | ------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------ | ---- | ---- |
| 7   | 文脈の明確さ   | task-022 の修正箇所の前後文脈が自然                           | Step 3 の修正箇所周辺を通読                      | `skill:importFromSource` が文脈上自然で、TASK-9F実装者が混乱しない |      |      |
| 8   | テーブル整合   | task-030 セクション 15B.2 のテーブル構造が維持                | テーブルのカラム数・アライメントを確認           | テーブルが正しく表示される（Markdownとしてパース可能）             |      |      |
| 9   | テーブル整合   | task-030 セクション 11 の追加行がテーブル構造を破壊していない | セクション 11 のテーブルを通読                   | 追加行が既存行と同じカラム構造で、テーブルが正しく表示される       |      |      |
| 10  | 引数型の明確さ | 追加チャネルの引数型が明記されている                          | セクション 11 / 15B.2 の引数型記述を確認         | `ShareTarget`（importFromSource）等の引数型が明確に記載されている  |      |      |
| 11  | 相互参照       | task-022 と task-030 の修正内容に矛盾がない                   | 両ファイルの `skill:importFromSource` 記述を比較 | 両ファイルで同じチャネル名・同じ引数型が記載されている             |      |      |

## 参照資料

> 依存Phase成果物: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                                        | 内容                                        |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| API IPC仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 既存 `skill:import` 契約の正本確認          |
| Skillインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Renderer/Preload/Main の契約整合確認        |
| IPCセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | チャネルホワイトリストと契約ドリフト防止    |
| Skill IPC詳細         | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | `skill:import` 系チャネル検証要件の詳細確認 |
| 型/チャネル調査手順   | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`            | チャネル名衝突時の横断確認手順              |
| IPC契約チェック       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 3層同時更新チェック（P23/P32/P42/P44）      |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC不整合再発防止パターン参照               |
| 教訓                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 類似タスクの再発防止知見                    |

| 参照                             | パス                                                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| index.md（タスク定義）           | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/index.md`                                               |
| task-022（修正対象）             | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`     |
| task-030（修正対象）             | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md` |
| Phase 10 レビュー結果            | `outputs/phase-10/final-review-result.md`                                                                                       |
| P5（リスナー二重登録）           | `.claude/rules/06-known-pitfalls.md#P5`                                                                                         |
| P44（IPCインターフェース不整合） | `.claude/rules/06-known-pitfalls.md#P44`                                                                                        |

## 統合テスト連携

本タスクは仕様書修正中心のため、統合テストは仕様間整合の確認を対象とする。

- Phase 10 の最終レビュー結果との整合を確認する。
- Phase 11 の目視確認結果を `outputs/phase-11/manual-test-result.md` に集約する。
- Phase 12 の未タスク検出・仕様更新判断へ引き継ぐ。

## 成果物

| #   | 成果物         | パス                                     |
| --- | -------------- | ---------------------------------------- |
| 1   | 手動テスト結果 | `outputs/phase-11/manual-test-result.md` |

## 完了条件

- [ ] Task 1: テストケース #1〜#6 全て PASS
- [ ] Task 2: テストケース #7〜#11 全て PASS
- [ ] 全11テストケースの結果が `manual-test-result.md` に記録されている
- [ ] 発見された問題がある場合、severity（Critical/Major/Minor）と対応方針が記録されている

## Phase末端アクション【必須】

- [ ] `artifacts.json` の Phase 11 ステータスを `completed` に更新
- [ ] 発見された Critical/Major 問題がある場合、Phase 差し戻し判断を記録
- [ ] Minor 問題は未タスク仕様書候補としてリストアップ（Phase 12 Task 4 で処理）

## 依存関係

| 方向 | Phase / タスク           | 内容                               |
| ---- | ------------------------ | ---------------------------------- |
| 前提 | Phase 10（最終レビュー） | PASS または MINOR 判定             |
| 後続 | Phase 12（ドキュメント） | 手動テスト結果を未タスク検出に活用 |

## 次のPhase

→ Phase 12（ドキュメント）`phase-12-documentation.md`
