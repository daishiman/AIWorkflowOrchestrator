# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 1                                                             |
| タスクID   | TASK-SW-FIX-MODE-MGMT-001                                     |
| 機能名     | generationModeラジオボタン廃止・LLM専用化・Step 1スキップ修正 |
| 前提Phase  | -                                                             |
| 後続Phase  | Phase 2                                                       |
| 作成日     | 2026-04-12                                                    |
| ステータス | pending                                                       |

## 目的

`generationMode` / `hasActivatedLlmMode` の削除による影響範囲を確定し、ラジオボタンUI削除・Step 1スキップ修正の受け入れ基準を固定する。

## 背景

スキル作成ウィザードでは本来LLM専用モードのみを想定しているが、以下の3問題が混在している。

- **問題1**: `generationMode`の初期値が`"template"`のため、Step 0に「テンプレートから作成」「LLMで生成」のラジオボタンが表示される
- **問題9**: `generationMode`（`"template"|"llm"`）と`hasActivatedLlmMode`という2系統のフラグが混在し、状態遷移が複雑化している
- **問題10**: LLMモード選択時に`handleLlmGenerate`が`goToStep(2)`を直接呼び、Step 1（Q1〜Q6インタビュー）をスキップする

これらを一括修正し、ウィザードをLLM専用・Step 0→Step 1→Step 2→Step 3の正規フローに統一する。

## 受け入れ基準（AC一覧）

| ID   | 基準内容                                                                      | 検証方法               |
| ---- | ----------------------------------------------------------------------------- | ---------------------- |
| AC-1 | Step 0からラジオボタン（テンプレートから作成/LLMで生成）が削除されている      | 自動テスト・手動確認   |
| AC-2 | `generationMode` stateと`hasActivatedLlmMode` stateが廃止されている           | コード検索・型チェック |
| AC-3 | LLMモードでStep 0→Step 1→Step 2の正規フローを通る                             | 自動テスト・手動確認   |
| AC-4 | Step 1（Q1〜Q6）がLLMモードでもスキップされない                               | 自動テスト・手動確認   |
| AC-5 | 既存のテンプレートモードのテストが全件PASS（またはLLM専用化に伴い適切に更新） | テスト実行結果         |

## 影響範囲分析

### 削除対象の一覧

| 削除箇所                                               | 現在の状態                               | 削除後の動作            |
| ------------------------------------------------------ | ---------------------------------------- | ----------------------- |
| `generationMode` state（`"template" \| "llm"`）        | 初期値`"template"`でラジオボタンUIを制御 | 廃止・LLM固定           |
| `hasActivatedLlmMode` state                            | LLMモード選択済みかを追跡                | 廃止・不要になる        |
| ラジオボタンUI（テンプレートから作成/LLMで生成）       | Step 0に表示                             | 削除                    |
| `handleLlmGenerate`内の`goToStep(2)`呼び出し           | Step 1をスキップしてStep 2へ直接遷移     | Step 1遷移に変更        |
| `template`関連の条件分岐                               | `generationMode === "template"` の全分岐 | 除去（LLMパスのみ残す） |
| `setGenerationMode` / `setHasActivatedLlmMode`呼び出し | 複数箇所に散在                           | 削除                    |

### 影響を受けるコンポーネント・ファイル

| コンポーネント/ファイル | 影響内容                                   |
| ----------------------- | ------------------------------------------ |
| `SkillCreateWizard.tsx` | state削除・ハンドラ修正・フロー変更        |
| `SkillInfoStep.tsx`     | ラジオボタンUI削除・LLM専用UI整理          |
| 関連テストファイル      | `generationMode`参照テストの更新または削除 |

## 実行タスク

- 影響範囲分析: `generationMode` / `hasActivatedLlmMode` の参照箇所を全コンポーネントで洗い出す
- 影響範囲分析: `template`条件分岐を含む全箇所をリストアップする
- 影響範囲分析: `handleLlmGenerate`内の`goToStep(2)`呼び出し箇所を特定する
- 受け入れ基準定義: 削除後の動作・修正後フローの検証基準を矛盾なく固定する
- 依存確認: TASK-SW-FIX-DATAFLOW-001（Wave A）完了後の状態が前提として利用可能であることを確認する

## 参照資料

| 資料名                | パス                                                                          | 用途                     |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------ |
| 既存ウィザード実装    | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | 削除対象の現行実装確認   |
| Step 0 コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`         | ラジオボタンUIの現行確認 |
| Step 1 コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | Step 1スキップ問題の確認 |
| ウェーブindex         | `docs/30-workflows/skill-wizard-bugfix-wave/index.md`                         | タスク依存関係確認       |

## 実行手順

1. `SkillCreateWizard.tsx` の現行実装を読み込み、`generationMode` / `hasActivatedLlmMode` の参照箇所を全て列挙する。
2. `SkillInfoStep.tsx` のラジオボタンUI箇所を特定する。
3. `handleLlmGenerate` 内の`goToStep(2)`を含むフロー遷移を追跡する。
4. `template`条件分岐を含む全箇所をリストアップする。
5. TASK-SW-FIX-DATAFLOW-001の完了状態と、本タスクへの影響を確認する。
6. 削除後・修正後の受け入れ基準を矛盾なし・漏れなしで固定する。

## 成果物

| 成果物       | パス                                         | 説明                                           |
| ------------ | -------------------------------------------- | ---------------------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件                           |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能なAC一覧                               |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | generationMode/hasActivatedLlmMode削除影響範囲 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `generationMode` 参照箇所が全て洗い出されていること
- [ ] `hasActivatedLlmMode` 参照箇所が全て洗い出されていること
- [ ] `handleLlmGenerate`内の`goToStep(2)`呼び出し箇所が特定されていること
- [ ] 全`template`条件分岐の削除範囲が確定していること
- [ ] TASK-SW-FIX-DATAFLOW-001との依存整合が確認されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. generationMode / hasActivatedLlmMode 影響範囲の全列挙
3. handleLlmGenerate フロー追跡
4. 受け入れ基準の定義
5. 成果物出力
6. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
