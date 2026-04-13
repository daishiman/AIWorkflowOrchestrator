# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 2                                                             |
| タスクID   | TASK-SW-FIX-MODE-MGMT-001                                     |
| 機能名     | generationModeラジオボタン廃止・LLM専用化・Step 1スキップ修正 |
| 前提Phase  | Phase 1                                                       |
| 後続Phase  | Phase 3                                                       |
| 作成日     | 2026-04-12                                                    |
| ステータス | completed                                                     |

## 目的

`generationMode` / `hasActivatedLlmMode` 廃止後のウィザードアーキテクチャを設計し、フロー変更前後の比較・修正後のstate管理設計を確定する。

## フロー変更前後の比較

### 修正前フロー

```
SkillCreateWizard（修正前）
│
├─ Step 0: SkillInfoStep
│   ├─ [ラジオボタン] ○ テンプレートから作成  ← 問題1: 仕様外UI
│   │                ○ LLMで生成
│   │
│   ├─ generationMode === "template" の場合
│   │   └─ 次へ → Step 1（テンプレート設定）→ Step 2（テンプレート生成）
│   │
│   └─ generationMode === "llm" の場合
│       └─ handleLlmGenerate() 呼び出し
│           └─ goToStep(2) 直接呼び出し   ← 問題10: Step 1スキップ
│               └─ Step 2（LLM生成）    ← Step 1をスキップ
│
├─ 問題9: generationMode と hasActivatedLlmMode の2系統フラグが混在
│   ├─ generationMode: "template" | "llm"
│   └─ hasActivatedLlmMode: boolean
│
└─ Step 1: ConversationRoundStep（LLMモードでは未到達）
    └─ Q1〜Q6インタビュー（スキップされるため無効化）
```

### 修正後フロー

```
SkillCreateWizard（修正後）
│
├─ Step 0: SkillInfoStep
│   ├─ ラジオボタン削除（LLM専用UI）       ← AC-1
│   └─ 次へ → handleStep0Next() → Step 1  ← 正規フロー開始
│
├─ Step 1: ConversationRoundStep          ← AC-4: スキップ禁止
│   └─ Q1〜Q6インタビュー（必ず通過）
│       └─ 生成ボタン → handleGenerate() → Step 2
│
├─ Step 2: GenerateStep
│   └─ LLM生成（generationMode prop不使用）
│
└─ Step 3: CompleteStep
    └─ 完了表示
```

## トポロジー / 責務レーン（SubAgent lane） / 検証パス

| 観点                        | 設計                                                               |
| --------------------------- | ------------------------------------------------------------------ |
| トポロジー                  | Step 0 → Step 1 → Step 2 → Step 3 の単一路線に統一する             |
| 責務レーン（SubAgent lane） | Step 0 は入力、Step 1 は文脈収集、Step 2 は生成、Step 3 は完了表示 |
| 検証パス                    | Step 1 スキップを禁止し、Phase 4 の fail-first で直列フローを固定  |

## 削除するstate一覧

| state名               | 型                    | 削除理由                                     |
| --------------------- | --------------------- | -------------------------------------------- |
| `generationMode`      | `"template" \| "llm"` | LLM専用化によりモード選択が不要              |
| `hasActivatedLlmMode` | `boolean`             | `generationMode`廃止により存在意義がなくなる |

## 削除するハンドラ・分岐一覧

| 削除対象                                         | 削除理由             |
| ------------------------------------------------ | -------------------- |
| `handleLlmGenerate`内の`goToStep(2)`直接呼び出し | Step 1スキップの原因 |
| `generationMode === "template"`条件分岐          | templateモード廃止   |
| `setGenerationMode(...)` 呼び出し箇所            | state廃止に伴う除去  |
| `setHasActivatedLlmMode(...)` 呼び出し箇所       | state廃止に伴う除去  |

## 修正後のウィザードstate管理設計

### 維持するstate（既存）

| state名        | 型                    | 役割                   |
| -------------- | --------------------- | ---------------------- |
| `currentStep`  | `number`              | 現在のステップ番号     |
| `formData`     | `SkillInfoFormData`   | Step 0のフォーム入力値 |
| `answers`      | `ConversationAnswers` | Step 1の会話回答       |
| `isGenerating` | `boolean`             | LLM生成中フラグ        |
| `error`        | `Error \| null`       | 生成失敗時のエラー保持 |
| `skillPath`    | `string \| null`      | 生成完了後のスキルパス |

### 廃止するstate

| state名               | 廃止後の代替              |
| --------------------- | ------------------------- |
| `generationMode`      | なし（LLM固定のため不要） |
| `hasActivatedLlmMode` | なし（廃止、管理不要）    |

## ハンドラ修正設計

### handleStep0Next（修正後）

```
handleStep0Next()
│
├─ （generationMode分岐なし・LLM固定）
└─ setCurrentStep(1)  // Step 1（ConversationRoundStep）へ遷移
```

### handleGenerate（修正後）

```
handleGenerate(method: "complete" | "skip")
│
├─ （hasActivatedLlmMode確認不要）
├─ clearGenerationState()
├─ setCurrentStep(2)
├─ setIsGenerating(true)
├─ result = await createSkill(formData, answers)  // Step 1の回答を渡す
├─ setSkillPath(result ?? null)
├─ setIsGenerating(false)
└─ setCurrentStep(3)
```

## SkillInfoStep UIの整理設計

### 修正前

```tsx
{
  /* ラジオボタン（削除対象） */
}
<RadioGroup value={generationMode} onChange={setGenerationMode}>
  <Radio value="template">テンプレートから作成</Radio>
  <Radio value="llm">LLMで生成</Radio>
</RadioGroup>;
```

### 修正後

```tsx
{
  /* ラジオボタン削除済み・LLM専用UI */
}
{
  /* フォーム入力（スキル名・目的・カテゴリ）のみ表示 */
}
```

## レンダリング設計

| currentStep | レンダリングコンポーネント | 備考                                  |
| ----------- | -------------------------- | ------------------------------------- |
| 0           | `<SkillInfoStep>`          | ラジオボタンなし・LLM専用フォームのみ |
| 1           | `<ConversationRoundStep>`  | 常に表示（スキップ不可）              |
| 2           | `<GenerateStep>`           | `generationMode` prop なし            |
| 3           | `<CompleteStep>`           | 既存の完了表示                        |

## 参照資料

| 資料名       | パス                                         | 用途           |
| ------------ | -------------------------------------------- | -------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | Phase 1 成果物 |

## 実行手順

1. Phase 1 成果物を確認し、設計の前提を固める。
2. フロー変更前後の比較アスキーアートを詳細化する。
3. 削除するstate一覧を確定する。
4. 削除するハンドラ・分岐一覧を確定する。
5. 修正後のstate管理設計テーブルを完成させる。
6. ハンドラ修正設計の擬似コードを記述する。
7. レンダリング設計テーブルを完成させる。

## 成果物

| 成果物             | パス                                     | 説明                                      |
| ------------------ | ---------------------------------------- | ----------------------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | state廃止・ハンドラ修正・レンダリング設計 |
| フロー比較図       | `outputs/phase-2/flow-comparison.md`     | 修正前後のウィザードフロー比較            |
| テスト戦略         | `outputs/phase-2/test-strategy.md`       | テスト方針と対象ケース                    |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] フロー変更前後の比較が全パスを網羅していること
- [ ] 削除するstate / ハンドラ / 分岐が全て列挙されていること
- [ ] 修正後のstate管理設計が記述されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. フロー比較図の詳細化
3. 削除対象の確定
4. 修正後設計の記述
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビュー
