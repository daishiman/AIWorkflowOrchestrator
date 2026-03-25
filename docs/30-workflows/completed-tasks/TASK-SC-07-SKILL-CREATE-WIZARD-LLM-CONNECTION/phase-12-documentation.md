# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 12                                            |
| Phase名    | ドキュメント更新                              |
| 前提Phase  | Phase 11                                      |
| 後続Phase  | Phase 13                                      |
| ステータス | 未実施                                        |
| 作成日     | 2026-03-24                                    |
| 機能名     | TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION |

---

## 目的

TASK-SC-07 の実装完了に伴い、実装ガイド・システム仕様書・更新履歴・未タスク検出レポート・スキルフィードバックレポートの5種類のドキュメントを作成・更新する。次のタスク実装者（または将来の自分）が本タスクの内容と教訓を確実に引き継げるようにする。

## 背景

TASK-SC-06 では苦戦箇所（C-1, C-2, C-4, 対称クリア）が実装中に発生し、修正コストがかかった。本タスクでは TASK-SC-06 の教訓を基に実装した内容を記録し、将来の類似タスクで同じ問題が起きないようにする。また、システム仕様書（aiworkflow-requirements）への反映により、設計の一貫性を維持する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成

**目的**: TASK-SC-07 の変更点と教訓を記録する

**実行手順**:

1. 以下の2パート構成で実装ガイドを作成する:

   ***

   #### Part 1: 初学者・中学生レベル向け説明

   **対象読者**: プログラミングを始めたばかりの人、中学生レベル

   **記載内容**（専門用語は使わないか、使う場合は即座に説明する）:
   - **SkillCreateWizard の LLM 生成フローとは何か**
     - 日常の例え話で説明する（例: 料理のレシピを注文するように、「こんな機能が欲しい」と言葉で伝えると AI が自動でレシピ（=計画）を作ってくれる仕組み）
     - 「なぜ LLM 生成フローが必要か」を先に説明し、その後「何をするか」を説明する順序で記述する
   - **画面の流れ（ステップ）をわかりやすく説明する**
     - どの画面から次の画面に進むか、どんなボタンを押すと何が起きるかを説明する
   - **Hybrid State Pattern（状態管理の仕組み）を日常例で説明する**
     - 例: 「メモ帳を2冊使う」—— 1冊は自分だけのメモ帳（画面ローカルの状態）、もう1冊はみんなで共有するメモ帳（ストア）。最終的に共有メモ帳に書き写す

   ***

   #### Part 2: 開発者・技術者レベル向け説明

   **対象読者**: TypeScript / React の知識がある開発者

   **記載内容**:
   - **変更点サマリー**（変更ファイル一覧と変更内容の概要）
   - **TypeScript 型定義**:
     - `GenerationMode`（`"llm" | "template"`）
     - `DescribeStepProps`（`generationMode` props 追加）
     - `GenerateStepProps`（`planResult`, `generationProgress`, `generationError`, `onExecutePlan`, `onCancelPlan` 追加）
     - `SkillCreatorRuntimeApi`（ランタイム API インターフェース）
   - **API シグネチャと使用例**:
     - `planSkill` のシグネチャ、引数型、戻り値型、呼び出し例
     - `executePlan` のシグネチャ、引数型、戻り値型、呼び出し例
   - **TASK-SC-06 苦戦箇所の回避記録**:
     - C-1（executePlan 引数型）: 本タスクでどう対処したか
     - C-2（generationProgress 未表示）: 本タスクでどう対処したか
     - C-4（PlanResult 二重定義）: 本タスクでどう対処したか
     - 対称クリア: handleCancelPlan / handleExecutePlan の実装パターン
   - **エラーハンドリングとエッジケース**（API 失敗時・タイムアウト時の挙動）
   - **設定可能なパラメータと定数**（タイムアウト値、再試行回数等）
   - Phase 8 リファクタリングの結果（共通化した箇所・しなかった箇所と理由）
   - 既知の制限事項・残課題

   ***

2. ファイルを `outputs/phase-12/implementation-guide.md` に出力する

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（実装ガイド・2パート構成）

---

### タスク2: システム仕様書更新

**目的**: aiworkflow-requirements の UI 仕様に SkillCreateWizard LLM フローを追加する

**実行手順**:

#### Step 1-A: タスク完了記録

1. 仕様書の「完了タスク」セクションに TASK-SC-07 の完了記録を追加する
   - 関連ドキュメントリンクと変更履歴を追記する
2. **LOGS.md を2ファイル更新する**:
   - `.claude/skills/task-specification-creator/LOGS.md`
   - `.claude/skills/aiworkflow-requirements/LOGS.md`
3. `topic-map.md` にエントリを追加する（新規セクションがある場合）
   - 対象: `.claude/skills/aiworkflow-requirements/references/topic-map.md`

**補助スクリプト**（Step 1-A の一部を自動化できる場合に使用）:

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js
```

---

#### Step 1-B: 実装状況テーブル更新

1. 仕様書内の実装状況テーブルで「未実装」→「完了」に更新する
   - 仕様書作成のみの場合は `spec_created` に更新する
2. 更新対象: `.claude/skills/aiworkflow-requirements/references/arch-ui-components-core.md` 内の該当テーブル

---

#### Step 1-C: 関連タスクテーブル更新

1. 仕様書内の「関連タスク」「未タスク候補」テーブルのステータスを更新する
2. `.claude/skills/aiworkflow-requirements/references/` 内の関連仕様書を確認して整合性を保つ

---

#### Step 2: システム仕様更新（条件付き: 新規インターフェース追加のため実施）

新規インターフェース（`GenerationMode`, LLM 生成フロー Props）が追加されているため、以下の3つの仕様書を更新する:

1. **`arch-ui-components-core.md`**: SkillCreateWizard LLM フロー仕様を追記する

   **追記内容**:
   - DescribeStep に `generationMode` props 追加（`"llm" | "template"`）
   - GenerateStep に `planResult`, `generationProgress`, `generationError`, `onExecutePlan`, `onCancelPlan` props 追加
   - LLM モード時のステップ遷移: DescribeStep → GenerateStep（ConfigureStep スキップ）
   - テンプレートモード時のステップ遷移: DescribeStep → ConfigureStep → GenerateStep（既存）
   - Hybrid State Pattern の説明（localPlanResult + store の二重管理）

2. **`arch-state-management-core.md`**: Hybrid State Pattern を追記する（該当する場合）
   - 参照: `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`

3. **`api-ipc-agent-core.md`**: planSkill/executePlan 契約を確認・更新する（該当する場合）
   - 参照: `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`

---

4. 全更新内容を `outputs/phase-12/spec-update-log.md` に記録する（diff 相当の内容）
5. Step 1-A〜Step 2 の実施記録を `outputs/phase-12/system-spec-update-summary.md` にまとめる

**期待される成果物**:

- 更新済み `.claude/skills/aiworkflow-requirements/references/arch-ui-components-core.md`
- 更新済み `.claude/skills/task-specification-creator/LOGS.md`
- 更新済み `.claude/skills/aiworkflow-requirements/LOGS.md`
- `outputs/phase-12/spec-update-log.md`（更新内容ログ）
- `outputs/phase-12/system-spec-update-summary.md`（Step 1-A〜Step 2 の実施記録）

---

### タスク3: ドキュメント更新履歴作成

**目的**: 本タスクで作成・更新した全ドキュメントの履歴を記録する

**実行手順**:

1. 以下のスクリプトを実行して更新履歴の雛形を生成する（利用可能な場合）:

   ```bash
   node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js
   ```

   > 参照: `.claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js`

2. 以下の更新履歴を作成する（スクリプト出力を補完する形で記述する）:

   | 更新日     | ドキュメント                                 | 更新内容                               | 担当       |
   | ---------- | -------------------------------------------- | -------------------------------------- | ---------- |
   | 2026-03-24 | `arch-ui-components-core.md`                 | SkillCreateWizard LLM フロー仕様を追記 | TASK-SC-07 |
   | 2026-03-24 | `outputs/phase-12/implementation-guide.md`   | TASK-SC-07 実装ガイドを新規作成        | TASK-SC-07 |
   | 2026-03-24 | `outputs/phase-12/unassigned-task-report.md` | 未タスク検出レポートを新規作成         | TASK-SC-07 |
   | 2026-03-24 | `outputs/phase-12/skill-feedback-report.md`  | スキルフィードバックレポートを新規作成 | TASK-SC-07 |

3. 本 Phase で実施した全ドキュメント更新を追記する（LOGS.md 2ファイルの更新も含める）
4. 結果を `outputs/phase-12/doc-update-history.md` に記録する

**期待される成果物**:

- `outputs/phase-12/doc-update-history.md`（更新履歴）

---

### タスク4: 未タスク検出レポート作成

**目的**: 実装中に発見した未タスク・残課題を記録する（0件でも出力必須）

**実行手順**:

1. 本タスクの実施全体を振り返り、以下の観点で未対応項目がないかを確認する:
   - スコープ外として意図的に除外した機能
   - 実装中に発見したが本タスクでは対応しなかった問題
   - Phase 10（最終レビュー）で MINOR として記録した指摘事項
   - Phase 11（手動テスト）で Minor として記録した UI/UX 問題

2. 未タスク・残課題があれば以下の形式で記録する:

   | タスクID | 概要 | 優先度   | 備考 |
   | -------- | ---- | -------- | ---- |
   | 未TASK-1 | ...  | 高/中/低 | ...  |

3. **未タスクが 0 件の場合**: 「未タスク 0 件」と明記した上でレポートを出力する（出力自体は必須）
4. 結果を `outputs/phase-12/unassigned-task-report.md` に記録する

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`（未タスク検出レポート ※0件でも出力必須）

---

### タスク5: スキルフィードバックレポート作成

**目的**: 本タスクを通じた開発プロセス・ツール・仕様書への改善提案を記録する（改善点なしでも出力必須）

**実行手順**:

1. 本タスクの実施全体を振り返り、以下の観点でフィードバックを収集する:
   - Phase 仕様書（本ドキュメント群）の改善点
   - Claude Code Hooks の動作に関する気づき
   - TASK-SC-06 苦戦箇所の回避策が有効だったかの評価
   - 開発フロー（TDD → リファクタリング → 品質保証）の有効性評価
   - 次の類似タスク（wizard への API 接続）向けのテンプレート化提案

2. 改善提案がある場合は以下の形式で記録する:

   | 対象           | 改善提案内容 | 優先度   | 実施推奨 Phase |
   | -------------- | ------------ | -------- | -------------- |
   | Phase N 仕様書 | ...          | 高/中/低 | 次タスク前     |

3. **改善点が 0 件の場合**: 「改善提案なし（現状の仕様書・フローで問題なし）」と明記した上でレポートを出力する（出力自体は必須）
4. 結果を `outputs/phase-12/skill-feedback-report.md` に記録する

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`（スキルフィードバックレポート ※改善点なしでも出力必須）

---

## 参照資料

| 参照資料                           | パス                                                                                    | 内容                           |
| ---------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 11 手動テスト結果            | `outputs/phase-11/manual-test-summary.md`                                               | 手動テスト完了状態の確認       |
| Phase 10 最終レビュー              | `outputs/phase-10/final-review-summary.md`                                              | AC 充足・品質確認済み状態      |
| Phase 8 リファクタリング結果       | `outputs/phase-8/`                                                                      | 共通化の決定と実施内容         |
| UI コンポーネント仕様              | `.claude/skills/aiworkflow-requirements/references/arch-ui-components-core.md`          | 更新対象のシステム仕様書       |
| 状態管理仕様                       | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`       | Hybrid State Pattern 参照      |
| IPC Agent API                      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`               | planSkill/executePlan 契約確認 |
| TASK-SC-06 苦戦箇所                | `docs/30-workflows/unassigned-task/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION.md`    | 回避記録の元ネタ               |
| SkillCreateWizard                  | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                      | 変更点サマリーの参照元         |
| GenerateStep                       | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`                    | 変更点サマリーの参照元         |
| DescribeStep                       | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                    | 変更点サマリーの参照元         |
| task-specification-creator LOGS.md | `.claude/skills/task-specification-creator/LOGS.md`                                     | タスク完了記録                 |
| aiworkflow-requirements LOGS.md    | `.claude/skills/aiworkflow-requirements/LOGS.md`                                        | タスク完了記録                 |
| topic-map.md                       | `.claude/skills/aiworkflow-requirements/references/topic-map.md`                        | トピックエントリ追加           |
| 更新履歴生成スクリプト             | `.claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js` | Step 1-A 自動化                |
| Phase 12 ガイド                    | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`  | Phase 12 詳細手順              |
| 仕様更新ワークフロー               | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1-A/1-B/1-C/Step 2 手順   |

---

## 成果物

| 成果物                       | パス                                                                           | 内容                                                        |
| ---------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`                                     | 変更点サマリーと TASK-SC-06 苦戦箇所回避記録（2パート構成） |
| 仕様書更新ログ               | `outputs/phase-12/spec-update-log.md`                                          | aiworkflow-requirements への追記内容                        |
| 仕様更新サマリー             | `outputs/phase-12/system-spec-update-summary.md`                               | Step 1-A〜Step 2 の実施記録                                 |
| 更新履歴                     | `outputs/phase-12/doc-update-history.md`                                       | 本タスクで更新した全ドキュメントの一覧                      |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-report.md`                                   | 残課題・未対応項目の一覧（0件でも出力必須）                 |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`                                    | 開発プロセス改善提案（改善点なしでも出力必須）              |
| 更新済み仕様書               | `.claude/skills/aiworkflow-requirements/references/arch-ui-components-core.md` | SkillCreateWizard LLM フロー追記済み                        |

---

## 統合テスト連携（Phase 12）

ドキュメント更新 Phase において統合テストの観点から確認すること:

- 更新したシステム仕様書（arch-ui-components-core.md）の内容が実装と整合していること
- 実装ガイドに記載した API シグネチャが実際のコードと一致していること
- 未タスク検出レポートに IPC 関連の未対応事項が含まれていないこと

---

## 完了条件

- [ ] 実装ガイド（`implementation-guide.md`）が生成されている
- [ ] 実装ガイドが Part 1（中学生レベル）と Part 2（技術者レベル）の2パート構成になっている
- [ ] システム仕様書（`arch-ui-components-core.md`）が更新されている
- [ ] 仕様書更新ログ（`spec-update-log.md`）が生成されている
- [ ] 仕様更新サマリー（`system-spec-update-summary.md`）が生成されている
- [ ] Step 1-A の LOGS.md が2ファイル（`task-specification-creator`, `aiworkflow-requirements`）更新されている
- [ ] Step 1-B の実装状況テーブルが更新されている
- [ ] Step 1-C の関連タスクテーブルが更新されている
- [ ] `topic-map.md` が更新されている（新規セクション追加がある場合）
- [ ] ドキュメント更新履歴（`doc-update-history.md`）が生成されている
- [ ] 未タスク検出レポート（`unassigned-task-report.md`）が生成されている（0件でも必須）
- [ ] スキルフィードバックレポート（`skill-feedback-report.md`）が生成されている（改善点なしでも必須）
- [ ] 全ての成果物の内容が実装の実態と整合している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト）が完了し、重大な問題が存在しないこと
- **後続**: Phase 13（PR 作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/phase-13-pr-creation.md`
