# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 1                                          |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03a                 |
| 機能名     | SkillCreateWizard オーケストレーション更新 |
| 前提Phase  | -                                          |
| 後続Phase  | Phase 2                                    |
| 作成日     | 2026-04-07                                 |
| ステータス | pending                                    |

## 目的

`description` / `options` / `generationMode` の削除による影響範囲を確定し、スマートデフォルト推論・新Step構成の受け入れ基準を固定する。

## 背景

スキル作成ウィザードのテンプレート生成モードを廃止し、LLM専用化する。  
`description` / `options` / `generationMode` state と全 `template` 条件分岐を除去し、新たに `formData` / `answers` / `smartDefaults` / `generationMethod` / `skillPath` / `hasExternalIntegration` / `externalToolName` state を追加する。
`GenerateStep` は `generationMode` なしの LLM 進捗表示に統一し、`CompleteStep` は `skillPath` / `hasExternalIntegration` / `externalToolName` と `onRetry` を受け取る回復可能な完了画面とする。

## 追加要件（実装差分反映）

| 区分       | 要件                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 推論ルール | `inferSmartDefaults` は `purpose` を小文字化して判定し、`slack` / `github` / `notion` を大小文字不問で検出する                                 |
| 生成制御   | `handleGenerate(method)` は `isGenerating` 中の再入を拒否し、二重呼び出しを防止する                                                            |
| 完了画面   | Step 3 で `skillPath` を明示表示し、生成先パスを確認できること                                                                                 |
| リトライ   | `handleRetry` は `formData` を保持し、`answers` / `smartDefaults` / `skillPath` / `hasExternalIntegration` / `externalToolName` をリセットする |

## description/options/generationMode 削除による影響範囲

### 削除対象の全 templateブランチ一覧

| 削除箇所                                     | 現在の分岐条件                       | 削除後の動作                |
| -------------------------------------------- | ------------------------------------ | --------------------------- |
| `description` state                          | 旧説明入力 UI に紐づく               | `formData` に統合           |
| `options` state                              | 旧オプション UI に紐づく             | Step 1 の会話回答へ統合     |
| `handleGenerate()` 内                        | `generationMode === "template"` 分岐 | LLM生成のみに統一           |
| `handleDescribeNext()` 内                    | `generationMode === "llm"` 確認分岐  | 常にLLM遷移に統一           |
| Step 1レンダリング分岐                       | `generationMode` による UI 切り替え  | ConversationRoundStep 固定  |
| `<GenerateStep>` へのprops渡し               | `mode={generationMode}` prop         | prop削除                    |
| Step 3レンダリング                           | `skillPath` 未接続                   | `CompleteStep` へ接続       |
| ヘッダー/ラベル表示                          | `generationMode === "template"` 判定 | LLMラベルのみ表示           |
| `createSkill(description, options)` 呼び出し | 旧入力引数での生成                   | 新 state ベースの生成へ移行 |

### 影響を受けるコンポーネント・型

| コンポーネント/型        | 影響内容                                              |
| ------------------------ | ----------------------------------------------------- |
| `SkillCreateWizard.tsx`  | state削除・ハンドラ再実装・Step構成変更               |
| `GenerateStep.tsx`       | `mode` prop削除・LLM専用UIに変更                      |
| `CompleteStep.tsx`       | `skillPath` / `onRetry` 接続の前提となる              |
| `wizard/index.ts`        | `GenerationMode` 型エクスポート削除（W2-seq-03b担当） |
| `SkillInfoFormData` 型   | W0-seq-01で定義済み・Step 0入力の型として使用         |
| `ConversationAnswers` 型 | W0-seq-01で定義済み・Step 1回答の型として使用         |
| `SmartDefaultResult` 型  | W0-seq-01で定義済み・推論結果の型として使用           |

## 実行タスク

- 影響範囲分析: `generationMode` 参照箇所を全コンポーネントで洗い出す
- 影響範囲分析: `description` / `options` 参照箇所も合わせて洗い出す
- 型依存確認: W0-seq-01で定義された型が正しく参照可能であることを確認する
- 受け入れ基準定義: 削除後の動作・新機能の検証基準を定義する
- 依存確認: W1-par-02c（CompleteStep）の recovery contract が前提として利用可能であることを確認する

## 参照資料

| 資料名                    | パス                                                                          | 用途                        |
| ------------------------- | ----------------------------------------------------------------------------- | --------------------------- |
| 現行ウィザード            | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | 削除対象の現行実装確認      |
| 型定義（W0-seq-01成果物） | `packages/shared/src/types/skillCreator.ts`                                   | SkillInfoFormData等の型確認 |
| SkillInfoStep             | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`         | Step 0コンポーネント確認    |
| ConversationRoundStep     | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | Step 1コンポーネント確認    |
| CompleteStep              | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`          | Step 3コンポーネント確認    |
| レーンindex               | `docs/30-workflows/skill-wizard-redesign-lane/index.md`                       | タスク依存関係確認          |

## 実行手順

1. `SkillCreateWizard.tsx` の現行実装を読み込み、`generationMode` の参照箇所を全て列挙する。
2. `template` 条件分岐を含む全箇所をリストアップする。
3. W0-seq-01成果物の型定義（`SkillInfoFormData`/`ConversationAnswers`/`SmartDefaultResult`）を確認する。
4. W1-par-02a（SkillInfoStep）・W1-par-02b（ConversationRoundStep）・W1-par-02c（CompleteStep）の完了状態を確認する。
5. 削除後の受け入れ基準を矛盾なし・漏れなしで固定する。

## 成果物

| 成果物         | パス                                         | 説明                                           |
| -------------- | -------------------------------------------- | ---------------------------------------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件                           |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | 検証可能なAC一覧                               |
| 影響範囲マップ | `outputs/phase-1/impact-scope-map.md`        | description/options/generationMode削除影響範囲 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `generationMode` 参照箇所が全て洗い出されていること
- [ ] `description` / `options` 参照箇所が全て洗い出されていること
- [ ] 全 `template` 条件分岐の削除範囲が確定していること
- [ ] W0-seq-01型定義との整合が確認されていること
- [ ] W1-par-02c（CompleteStep）との recovery contract 整合が確認されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. description/options/generationMode 影響範囲の全列挙
3. 受け入れ基準の定義
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
