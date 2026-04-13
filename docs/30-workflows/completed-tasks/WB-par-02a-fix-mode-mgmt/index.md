# TASK-SW-FIX-MODE-MGMT-001: generationModeラジオボタン廃止・LLM専用化・Step 1スキップ修正

## メタ情報

| 項目         | 内容                                                                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-SW-FIX-MODE-MGMT-001                                                                                                                 |
| タスク名     | generationModeラジオボタン廃止・LLM専用化・Step 1スキップ修正                                                                             |
| ウェーブ     | Wave B（TASK-SW-FIX-DATAFLOW-001完了後。Phase 1-4/6-13 は並列、Phase 5 は共有ファイル調整が必要）                                         |
| 依存タスク   | TASK-SW-FIX-DATAFLOW-001（Wave A完了後に着手）                                                                                            |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`, `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` |
| 作成日       | 2026-04-12                                                                                                                                |
| ステータス   | phase12_completed（Phase 13 はユーザー承認待ちで blocked）                                                                                |

## プロジェクト概要

| 項目           | 内容                                                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| プロジェクトID | `elegant-improvement`                                                                                                                   |
| 最上位目的     | 本ブランチの変更分が 2 つの skill 定義に漏れなく反映されていることを最優先で確認し、30 種の思考法を使ってエレガントな解決策へ再構成する |
| 背景           | 既存実装が skill 定義に準拠していない可能性があるため、必要なら既存実装を破棄してでも再構成する                                         |
| 期待される成果 | 2 つの skill 定義に完全準拠し、30 種の思考法による多角的検証を経たエレガントな実装方針                                                  |
| 成功基準       | 矛盾なし・漏れなし・整合性あり・依存関係整合の 4 条件をすべて満たす                                                                     |
| スコープ       | 含む: 変更分の検証 / 30 種の思考法による多角的分析 / エレガントな改善。含まない: コミット / PR 作成                                     |

## オーケストレーション

| Agent   | 役割                       | 並列可否             | 主な入力                                                | 主な出力                               |
| ------- | -------------------------- | -------------------- | ------------------------------------------------------- | -------------------------------------- |
| Agent 1 | skill準拠検証エージェント  | 可能                 | 2つの skill 定義、git status / diff、対象 workflow 一式 | 差異一覧、PASS/FAIL 表                 |
| Agent 2 | 多角的思考分析エージェント | 可能                 | 30 種の思考法、差分、現実装                             | 改善仮説、設計代替案（分析マトリクス） |
| Agent 3 | 改善統合エージェント       | 不可（Agent 1/2 後） | Agent 1/2 の結果                                        | 仕様修正計画、ファイル別タスク分割     |

### 並列実行原則

- Phase 2 は Agent 1 と Agent 2 を並列実行する
- Phase 4 はファイル群ごとに SubAgent を分割し、独立パートは並列で進める
- Phase 12 は `implementation-guide` の Part 1/2 を並列で起こし、`system-spec-update-summary` は更新対象を固定した後に進める
- 30 種の思考法は Agent 2 が 1 つの分析マトリクスへ集約し、30 個の SubAgent に分割しない

### 思考法適用方針

| 系統         | 主な適用フェーズ   | 目的                                 |
| ------------ | ------------------ | ------------------------------------ |
| 論理分析系   | Phase 1-3          | skill 原文と変更分の整合確認         |
| 構造分解系   | Phase 1-2 / 12     | 要件・ファイル・成果物の責務分離     |
| メタ・抽象系 | Phase 2-3 / 12     | 前提の妥当性確認と粒度の調整         |
| 発想・拡張系 | Phase 2 / 5 / 8    | 破棄判断と代替案比較                 |
| システム系   | Phase 1-2 / 9 / 12 | 依存関係・波及効果・状態所有権の確認 |
| 戦略・価値系 | Phase 1-3 / 10     | 最小複雑性と価値最大化の均衡         |
| 問題解決系   | Phase 1-12 全般    | 根本原因の特定と改善仮説の収束       |

## 概要

task-specification-creator / aiworkflow-requirements の正本を参照しつつ skill準拠検証と 30 種の思考法による再構成を並列で進める。  
スキルウィザードの`generationMode`ラジオボタン（「テンプレートから作成」「LLMで生成」）を完全に廃止し、LLM専用フローへ一本化する。  
同時に`generationMode`と`hasActivatedLlmMode`という2系統のフラグを廃止し、状態遷移をシンプル化する。  
さらに、LLMモード選択時に`goToStep(2)`を直接呼び出してStep 1をスキップする問題を修正し、Step 0→Step 1→Step 2の正規フローを確立する。

## 問題の背景

| 問題番号 | 問題内容                                                                            | 影響                                             |
| -------- | ----------------------------------------------------------------------------------- | ------------------------------------------------ |
| 問題1    | `generationMode`初期値が`"template"`のため、Step 0にラジオボタンが表示される        | 仕様ではLLM専用なのにUIにモード選択が現れる      |
| 問題9    | `generationMode`と`hasActivatedLlmMode`という2系統のフラグが混在し、状態遷移が複雑  | バグの温床・コードの可読性低下                   |
| 問題10   | LLMモード選択時に`handleLlmGenerate`が`goToStep(2)`を直接呼び、Step 1をスキップする | Q1〜Q6インタビューが実行されずデータ欠損が起きる |

## 修正方針

1. ラジオボタンUIを完全削除（LLM専用に統一）
2. `generationMode` stateを廃止し`hasActivatedLlmMode` stateも削除
3. LLMモードでもStep 0→Step 1→Step 2の正規フローを通るよう修正
4. Step 0 から生成へ直行する旧分岐を除去し、Step 1 の `handleGenerate` から Step 2 を開始するフローへ統一

## 受け入れ基準

| ID   | 基準内容                                                                      |
| ---- | ----------------------------------------------------------------------------- |
| AC-1 | Step 0からラジオボタン（テンプレートから作成/LLMで生成）が削除されている      |
| AC-2 | `generationMode` stateと`hasActivatedLlmMode` stateが廃止されている           |
| AC-3 | LLMモードでStep 0→Step 1→Step 2の正規フローを通る                             |
| AC-4 | Step 1（Q1〜Q6）がLLMモードでもスキップされない                               |
| AC-5 | 既存のテンプレートモードのテストが全件PASS（またはLLM専用化に伴い適切に更新） |

## Phaseリスト

| Phase | 名前         | 概要                                                            | ステータス        |
| ----- | ------------ | --------------------------------------------------------------- | ----------------- |
| 1     | 要件定義     | 影響範囲分析・受け入れ基準定義                                  | completed         |
| 2     | 設計         | フロー変更前後比較・state廃止設計                               | completed         |
| 3     | 設計レビュー | 設計の矛盾・漏れチェック                                        | completed         |
| 4     | テスト作成   | `test-specification.md` / `test-cases.md` による Red テスト定義 | completed         |
| 5     | 実装         | ラジオボタン削除・state廃止・フロー修正                         | completed         |
| 6     | テスト拡充   | エッジケース・回帰テスト                                        | completed         |
| 7     | カバレッジ   | カバレッジ計測・未到達分析                                      | completed         |
| 8     | リファクタ   | コード品質改善                                                  | completed         |
| 9     | 品質保証     | 静的解析・リスク評価                                            | completed         |
| 10    | 最終レビュー | Phase 1-9の成果物統合レビュー                                   | completed         |
| 11    | 手動テスト   | Playwright current-build capture / 画面証跡整理（VISUAL）       | completed         |
| 12    | ドキュメント | 実装ガイド・仕様更新・フィードバック                            | phase12_completed |
| 13    | PR作成       | 提出準備済み・ユーザー承認待ち                                  | blocked           |

## 削除する内容

| 削除対象                                             | 理由                               |
| ---------------------------------------------------- | ---------------------------------- |
| `generationMode` state（`"template" \| "llm"`）      | LLM専用化によりモード選択が不要    |
| `hasActivatedLlmMode` state                          | `generationMode`廃止により冗長     |
| ラジオボタンUI（「テンプレートから作成/LLMで生成」） | 仕様ではLLM専用のため表示不要      |
| `handleLlmGenerate`内の`goToStep(2)`直接呼び出し     | Step 1スキップの原因であるため修正 |
| templateモード関連の条件分岐                         | templateモード廃止に伴う除去       |

## 修正後のフロー

```
修正前:
Step 0 → [ラジオ選択]
           ├─ template → Step 2（生成）
           └─ llm → handleLlmGenerate → goToStep(2) → Step 2（Step 1スキップ）

修正後:
Step 0 → Step 1（Q1〜Q6インタビュー） → Step 2（LLM生成） → Step 3（完了）
```

## 参照

| ドキュメント                    | パス                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------- |
| 既存ウィザード実装              | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            |
| Step 0 コンポーネント           | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`         |
| Step 1 コンポーネント           | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` |
| ウェーブindex                   | `docs/30-workflows/skill-wizard-bugfix-wave/index.md`                         |
| 依存タスク                      | `docs/30-workflows/WA-seq-01-fix-dataflow/index.md`                           |
| task-specification-creator 正本 | `.claude/skills/task-specification-creator/SKILL.md`                          |
| aiworkflow-requirements 正本    | `.claude/skills/aiworkflow-requirements/SKILL.md`                             |
