# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 7                                      |
| Phase名    | カバレッジ確認                         |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001     |
| 前提Phase  | Phase 5（実装）、Phase 6（テスト拡充） |
| 後続Phase  | Phase 8（リファクタリング）            |
| ステータス | completed                              |
| 作成日     | 2026-03-13                             |
| 更新日     | 2026-03-16                             |
| 機能名     | skill-docs-runtime-integration         |

## 目的

Phase 4-6 で作成した 42 テストケースのカバレッジを計測し、プロジェクト基準（Line 80%+, Branch 60%+, Function 80%+）を充足しているか確認する。未達の場合は gap を特定し、Phase 6 へフィードバックする。

## 実行タスク

### T-7-1: カバレッジ計測の実行

対象ファイルに対して vitest --coverage を実行し、カバレッジレポートを取得する。

### T-7-2: 対象ファイル別カバレッジ確認

以下の対象ファイルについて、ファイル別のカバレッジを確認する。

| #   | 対象ファイル                                                          | Line 目標 | Branch 目標 | Function 目標 |
| --- | --------------------------------------------------------------------- | --------- | ----------- | ------------- |
| 1   | `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts`          | 90%+      | 70%+        | 90%+          |
| 2   | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`           | 80%+      | 60%+        | 80%+          |
| 3   | `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts` | 90%+      | 70%+        | 90%+          |
| 4   | `apps/desktop/src/main/ipc/handlers/skill-docs.ts`                    | 80%+      | 60%+        | 80%+          |
| 5   | `packages/shared/src/skill/types.ts` (型定義のみ)                     | N/A       | N/A         | N/A           |

カバレッジ基準根拠:

- **新規ファイル**（LLMDocQueryAdapter, CapabilityResolver）: 推奨基準の Line 90% / Branch 70% / Function 90% を適用する
- **変更ファイル**（SkillDocGenerator, skill-docs ハンドラ）: 最低基準の Line 80% / Branch 60% / Function 80% を適用する
- **型定義ファイル**: ランタイムコードを含まないため計測対象外

### T-7-3: gap 検出と Phase 6 フィードバック

カバレッジ目標未達のファイルについて gap を分析し、Phase 6 へのフィードバックを行う。

## 参照資料

### Phase 依存

| 参照資料              | パス                        | 内容                                   |
| --------------------- | --------------------------- | -------------------------------------- |
| Phase 5（実装）       | `phase-5-implementation.md` | 実装済みコードを確認する               |
| Phase 6（テスト拡充） | `phase-6-test-expansion.md` | 42 テストケースの Green 状態を確認する |

### ソースコード

| 参照資料           | パス                                                                  | 内容               |
| ------------------ | --------------------------------------------------------------------- | ------------------ |
| LLMDocQueryAdapter | `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts`          | カバレッジ計測対象 |
| SkillDocGenerator  | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`           | カバレッジ計測対象 |
| CapabilityResolver | `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts` | カバレッジ計測対象 |
| IPC ハンドラ       | `apps/desktop/src/main/ipc/handlers/skill-docs.ts`                    | カバレッジ計測対象 |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                   | パス                                                                                                              | 内容                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-details.md`                                      | Skill Docs IPC 正本                            |
| architecture-overview      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                      | registerSkillDocsHandlers の構成正本           |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | Skill Docs 関連未タスクと public contract 正本 |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`                             | sender、path validation、error envelope の正本 |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                              | TASK-9I の完了履歴と未タスク正本               |

## 実行手順

### ステップ1: カバレッジ計測コマンドの実行

```bash
cd apps/desktop
pnpm vitest run --coverage \
  src/main/services/skill/LLMDocQueryAdapter.ts \
  src/main/services/skill/SkillDocGenerator.ts \
  src/main/services/skill/SkillDocsCapabilityResolver.ts \
  src/main/ipc/handlers/skill-docs.ts
```

v8 カバレッジプロバイダの出力から、ファイル別の Line / Branch / Function カバレッジを抽出する。

### ステップ2: 目標との比較と gap 特定

T-7-2 の目標テーブルと計測結果を比較し、未達ファイルの gap 箇所を特定する。

gap 特定の観点:

- **Line**: 未実行行の特定（エラーハンドリングの分岐に多い）
- **Branch**: 未通過分岐の特定（if/else、switch/case、三項演算子）
- **Function**: 未呼び出し関数の特定（P41: v8 のインライン関数カウントに注意）

### ステップ3: Phase 6 フィードバック判定

| 判定               | アクション                                        |
| ------------------ | ------------------------------------------------- |
| 全ファイル目標達成 | Phase 8 へ進む                                    |
| 1-2 ファイル未達   | gap 箇所のテスト追加リストを作成し Phase 6 へ戻る |
| 3+ ファイル未達    | テスト設計の見直しも含め Phase 6 へ戻る           |

### ステップ4: カバレッジレポートの記録

計測結果をファイル別テーブルとして `outputs/phase-7/coverage-report.md` に記録する。gap がある場合は Phase 6 フィードバック内容も記録する。

## 統合テスト連携

- Phase 6 の 42 テストケースが全て Green であることが前提条件
- カバレッジ gap が検出された場合、Phase 6 に戻ってテストを追加し、再度 Phase 7 を実行する
- Phase 7 → Phase 6 のフィードバックループは最大 2 回とし、3 回目以降は Phase 10（最終レビュー）で MINOR 判定として記録する

## 成果物

| 成果物             | パス                                 | 内容                                           |
| ------------------ | ------------------------------------ | ---------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | ファイル別カバレッジ計測結果と目標比較テーブル |
| gap 分析（未達時） | `outputs/phase-7/gap-analysis.md`    | 未達ファイルの gap 箇所と追加テスト候補リスト  |

## 完了条件

- [ ] カバレッジ計測が全対象ファイル（4ファイル）で実行されている
- [ ] ファイル別カバレッジが目標テーブルの基準を充足している（または Phase 6 フィードバックが記録されている）
- [ ] カバレッジレポートが `outputs/phase-7/coverage-report.md` に記録されている
- [ ] gap がある場合は gap 分析と Phase 6 フィードバック内容が記録されている
- [ ] P41（v8 インライン関数カウント）による見かけ上の低カバレッジが除外判定されている

## 既知の落とし穴

| Pitfall | 内容                                            | 対策                                                          |
| ------- | ----------------------------------------------- | ------------------------------------------------------------- |
| P40     | テスト実行ディレクトリ依存                      | `cd apps/desktop` から実行する                                |
| P41     | v8 カバレッジプロバイダのインライン関数カウント | インラインコールバックの Function Coverage 低下は除外判定する |
| P37     | ドキュメント数値の早期固定                      | テスト数は `grep -c "it(" *.test.ts` で正確にカウントする     |

## 次のPhase

- [Phase 8（リファクタリング）](./phase-8-refactoring.md) に進む
