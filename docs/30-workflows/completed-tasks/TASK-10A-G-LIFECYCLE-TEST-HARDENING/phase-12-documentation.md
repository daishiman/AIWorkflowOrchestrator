# Phase 12: ドキュメント更新 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目      | 内容                   |
| --------- | ---------------------- |
| タスクID  | TASK-10A-G             |
| Phase     | 12                     |
| 名称      | ドキュメント更新       |
| 依存Phase | Phase 11（手動テスト） |
| 次Phase   | Phase 13（PR作成）     |

---

## 目的

TASK-10A-G の実装成果を実装ガイド・システム仕様書・変更履歴に反映し、未タスクを検出・登録する。05-task-execution.md Phase 12 チェックリストに完全準拠する。

---

## 参照資料

| 参照資料                   | パス                                                                                                 | 使用目的                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 2 設計書             | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-2-design.md`            | テスト構成/依存境界の再確認          |
| Phase 5 実装書             | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-5-implementation.md`    | Green後の実装差分記録                |
| Phase 6 拡充書             | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-6-test-expansion.md`    | 追加テストの仕様同期                 |
| Phase 7 カバレッジ書       | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-7-coverage-check.md`    | 指標・未カバー箇所の反映             |
| Phase 8 リファクタリング書 | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-8-refactoring.md`       | テスト構造改善の反映                 |
| Phase 9 品質保証書         | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-9-quality-assurance.md` | 品質証跡の反映                       |
| Phase 10 最終レビュー書    | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-10-final-review.md`     | Gate判定の反映                       |
| Phase 11 手動テスト書      | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-11-manual-test.md`      | 手動検証結果の反映                   |
| タスク運用ルール           | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                           | Phase 12 チェックリスト              |
| Phase 11/12 ガイド         | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                          | 必須5成果物/完了条件                 |
| 仕様更新ワークフロー       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                       | Step 1-A〜Step 2 の手順              |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                          | カバレッジ基準記載用                 |
| テストパターン             | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                    | テスト構成パターン追記先             |
| P1/P25（LOGS.md）          | `.claude/rules/06-known-pitfalls.md`                                                                 | 2ファイル更新必須                    |
| P4（早期完了記載）         | `.claude/rules/06-known-pitfalls.md`                                                                 | changelog事後記録ルール              |
| P2/P27（topic-map）        | `.claude/rules/06-known-pitfalls.md`                                                                 | 仕様書変更時の再生成必須             |
| P43（rate limit）          | `.claude/rules/06-known-pitfalls.md`                                                                 | 仕様書更新3ファイル以下/エージェント |

---

## 前提条件

- Phase 11（手動テスト）が完了していること
- 全テストがPASSし、カバレッジ基準を達成していること

---

## 実行タスク

- Task 1: 実装ガイドと追加テストドキュメントを作成する
- Task 2: task-specification-creator 準拠で仕様更新と索引再生成を行う
- Task 3: `spec-update-summary.md` と `documentation-changelog.md` を事後記録で作成する
- Task 4: `outputs/phase-12/unassigned-task-detection.md` を 0件でも出力する
- Task 5: `skill-feedback-report.md` を改善点なしでも出力する

### Task 1: 実装ガイド作成

#### Task 1-1: implementation-guide.md Part 1（概念説明）

**成果物**: `outputs/phase-12/implementation-guide.md`

中学生でも理解できるレベルで、スキルライフサイクルテストの概念を説明する。日常例えを必ず含む。

**必須セクション**:

- テストの3層構造を「品質検査工場」に例えた概念説明
  - Layer 1（IPC契約テスト）: 「受付窓口で書類の記入漏れをチェックする係」
  - Layer 2（Renderer統合テスト）: 「工場のライン全体が正しく流れるか確認する検査員」
  - Layer 3（既存テスト拡張）: 「新しい部品が既存の製品と組み合わせても動くか確認する係」
- なぜテストを書くのか（壊れた時に気づける仕組み）
- 契約テストとは何か（「約束を守っているか自動で確認する仕組み」）

#### Task 1-2: implementation-guide.md Part 2（開発者向け実装詳細）

**同一ファイルの後半に記載**。

**必須セクション**:

- 3層テスト構成の技術的詳細（テスト対象・モック戦略・テストデータ）
- 各テストファイルの責務と実行方法
- モック構成（`vi.mock` のパターンと注意点）
- テストデータファクトリの使用方法
- トラブルシューティング（P9, P31, P39, P40, P42, P48 の該当パターン）

#### Task 1-3: テストドキュメント

**成果物**: `outputs/phase-12/test-documentation.md`

**必須セクション**:

- テスト構成一覧（55テスト: Layer 1 = 25, Layer 2 = 14, Layer 3 = 16）
- 各テストの実行コマンド
- カバレッジレポートの読み方
- 新規テスト追加時のガイドライン

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

以下の4ファイルを更新する:

| ファイル                                             | 更新内容                                                 |
| ---------------------------------------------------- | -------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`     | TASK-10A-G 完了記録追加                                  |
| `.claude/skills/task-specification-creator/LOGS.md`  | TASK-10A-G 完了記録追加（P1/P25対策: 2ファイル両方更新） |
| `.claude/skills/aiworkflow-requirements/SKILL.md`    | 変更履歴テーブルに TASK-10A-G 追加                       |
| `.claude/skills/task-specification-creator/SKILL.md` | 変更履歴テーブルに TASK-10A-G 追加                       |

#### Step 1-B: 実装状況テーブル更新

本タスクはテストコードのみの追加であり、新規APIエンドポイントの追加はない。`api-endpoints.md` の更新は不要。

#### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "TASK-10A-G" .claude/skills/aiworkflow-requirements/references/
```

検索結果に基づき、関連仕様書のタスクテーブルを更新する。対象として想定されるファイル:

| ファイル                                                                          | 更新内容                   |
| --------------------------------------------------------------------------------- | -------------------------- |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | 完了タスクセクションに追加 |
| `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | 実績値を実測へ補正         |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | 再監査教訓を追加           |

#### Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING \
  --regenerate
```

仕様書に変更がある場合は `aiworkflow-requirements` 側の索引と workflow 側 index の両方を同期する（P2/P27対策）。

#### Step 2: システム仕様更新

**対象**: `testing-component-patterns.md`, `lessons-learned.md`

以下を追記する:

- 3層テスト構成パターン（Main IPC + Renderer統合 + 既存テスト拡張）
- 実測テスト件数 `25 + 14 + 16 = 55` と、handler-scope coverage `96.9 / 88.9 / 100`
- ChatPanel起点の統合テストパターンと screenshot harness 修正内容

**注意**: 仕様書更新は3ファイル以下/エージェントに分割する（P43対策）。

### Task 3: spec-update-summary.md / documentation-changelog.md 作成

**成果物**:

- `outputs/phase-12/spec-update-summary.md`
- `outputs/phase-12/documentation-changelog.md`

**必須ルール**:

- 各Stepの実行結果を**事後記録**する（P4対策: 全Step確認前に「完了」と記載しない）
- 更新した全仕様書の変更内容を記録する

**記載テンプレート**:

```markdown
## documentation-changelog

### Step 1-A: タスク完了記録

- [ ] aiworkflow-requirements/LOGS.md: [実行結果]
- [ ] task-specification-creator/LOGS.md: [実行結果]
- [ ] aiworkflow-requirements/SKILL.md: [実行結果]
- [ ] task-specification-creator/SKILL.md: [実行結果]

### Step 1-B: 実装状況テーブル

- 該当なし（テストコードのみの追加）

### Step 1-C: 関連タスクテーブル

- [ ] [更新したファイル]: [変更内容]

### Step 1-D: topic-map.md 再生成

- [ ] generate-index.js 実行結果: [成功/失敗]

### Step 2: システム仕様更新

- [ ] testing-component-patterns.md: [変更内容]

### Task 1: 実装ガイド

- [ ] implementation-guide.md Part 1: [作成結果]
- [ ] implementation-guide.md Part 2: [作成結果]
- [ ] test-documentation.md: [作成結果]
```

### Task 4: 未タスク検出

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

**手順**:

1. 実装中に発見した改善点・残課題をリストアップする
2. 0件でもレポートは必ず作成する
3. 検出した未タスクは3ステップ全完了する（P3/P38対策）:
   - `tasks/unassigned-task/` に指示書を作成
   - `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録
   - 関連仕様書に参照リンクを追加

**未タスク検出観点**:

- 既存 open backlog が今回差分か、依存タスク由来かの切り分け
- screenshot harness / coverage command / planned wording の再発防止有無

### Task 5: スキルフィードバックレポート

**成果物**: `outputs/phase-12/skill-feedback-report.md`

**必須観点**:

- テンプレート改善: Phase 4 / Phase 11 / Phase 12 の不足見出しや成果物命名ドリフトがないか
- ワークフロー改善: `validate-phase-output` / `verify-all-specs` で機械検知できる観点の追加余地
- 仕様抽出導線: `aiworkflow-requirements` から今回必要な仕様へ迷わず到達できるか

---

## 成果物

| 成果物               | パス                                            | 説明                            |
| -------------------- | ----------------------------------------------- | ------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1（概念）+ Part 2（技術）  |
| テストドキュメント   | `outputs/phase-12/test-documentation.md`        | テスト構成・実行方法            |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | Step 1-A〜Step 2 の実施結果     |
| ドキュメント変更履歴 | `outputs/phase-12/documentation-changelog.md`   | 全Step実行結果                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 未タスク検出結果（0件でも必須） |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善点なしでも必須              |

---

## 統合テスト連携

| 連携対象                | Phase 12 で同期する内容                  | 参照先                       |
| ----------------------- | ---------------------------------------- | ---------------------------- |
| Phase 5〜9              | 実測テスト数・カバレッジ・品質ゲート結果 | `spec-update-summary.md`     |
| Phase 10/11             | Gate判定・手動検証結果                   | `documentation-changelog.md` |
| aiworkflow-requirements | テストパターン/状態管理/教訓の正本更新   | `references/*.md`            |

---

## 完了条件

- [ ] Task 1-1: implementation-guide.md Part 1 が日常例えを含む中学生レベルの説明で作成されている
- [ ] Task 1-2: implementation-guide.md Part 2 が開発者向け実装詳細を含んでいる
- [ ] Task 1-3: test-documentation.md が28テストケースの構成・実行方法を記載している
- [ ] Task 3: `spec-update-summary.md` が Step 1-A〜Step 2 の実施結果を記録している
- [ ] Task 2 Step 1-A: LOGS.md 2ファイル（aiworkflow-requirements + task-specification-creator）が更新されている
- [ ] Task 2 Step 1-A: SKILL.md 2ファイルの変更履歴が更新されている
- [ ] Task 2 Step 1-C: 関連タスクテーブルが更新されている
- [ ] Task 2 Step 1-D: topic-map.md が再生成されている
- [ ] Task 2 Step 2: testing-component-patterns.md に3層テストパターンが追記されている
- [ ] Task 3: documentation-changelog.md が全Stepの実行結果を事後記録で記載している
- [ ] Task 4: `outputs/phase-12/unassigned-task-detection.md` が作成されている（0件でも必須）
- [ ] Task 5: `skill-feedback-report.md` が作成されている（改善点なしでも必須）
- [ ] Task 4: 検出された未タスクが3ステップ（指示書→残課題テーブル→関連仕様書リンク）全完了している
- [ ] `artifacts.json` と `outputs/artifacts.json` の Phase 12 成果物一覧が同期している
- [ ] `artifacts.json` の Phase 12 ステータスが更新されている

---

_このファイルは TASK-10A-G Phase 12 仕様書として作成されました。_
_最終更新: 2026-03-09_
