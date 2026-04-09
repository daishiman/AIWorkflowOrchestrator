# Phase 1: 影響範囲マップ

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 1                                          |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001 |
| 作成日     | 2026-04-08                                 |
| ステータス | completed                                  |

---

## 旧実装の影響範囲分析

### 削除された state

| state名               | 旧型             | 削除理由                              |
| --------------------- | ---------------- | ------------------------------------- |
| `description`         | `string`         | `SkillInfoFormData.purpose` に統合    |
| `options`             | `object`         | `SKILL_GENERATION_OPTIONS` 定数に移行 |
| `旧生成モード`        | `string \| null` | 新設計では不要（LLM専用化）           |
| `旧生成モード setter` | function         | 上記と同様に削除                      |

### 削除されたハンドラ

| ハンドラ名                                     | 削除理由                       |
| ---------------------------------------------- | ------------------------------ |
| `handleDescribeNext()`                         | `handleStep0Next()` に置き換え |
| `createSkill(description, options)` 旧呼び出し | Props 経由での呼び出しに変更   |

### 旧設計との互換性破壊箇所

| 種別    | 内容                                                      | 対処方針                                                            |
| ------- | --------------------------------------------------------- | ------------------------------------------------------------------- |
| Props   | 旧 `DescribeStep` / 旧生成フロー向け Props の受け渡し整理 | `SkillInfoStep` / `ConversationRoundStep` / `CompleteStep` へ再配線 |
| 旧 UI   | テンプレート生成切り替え UI（`generation-mode-selector`） | 削除済み（data-testid 確認）                                        |
| 旧 Step | `DescribeStep` (旧 Step 0)                                | `SkillInfoStep` に置き換え済み                                      |

### 依存コンポーネントへの影響

| コンポーネント              | 影響                                            | 対処状況          |
| --------------------------- | ----------------------------------------------- | ----------------- |
| `ConversationRoundStep.tsx` | Step 1 から `onGenerate` で生成処理開始         | ✅ 対処済み       |
| `CompleteStep.tsx`          | Step 2 完了画面として利用・アクションカード接続 | ✅ 対処済み       |
| `wizard/index.ts`           | 新コンポーネントの再エクスポート                | W2-seq-03b で対処 |

---

## 新設計での追加 state

| state名                  | 型                           | 用途                                |
| ------------------------ | ---------------------------- | ----------------------------------- |
| `formData`               | `SkillInfoFormData`          | Step 0 の入力フォームデータ         |
| `answers`                | `ConversationAnswers`        | Step 1 の6問回答                    |
| `smartDefaults`          | `SmartDefaultResult \| null` | Step 0 推論結果→Step 1 への受け渡し |
| `generationMethod`       | `"complete" \| "skip"`       | 生成方式の選択                      |
| `isGenerating`           | `boolean`                    | ローカル生成状態                    |
| `skillPath`              | `string \| null`             | 生成済みスキルパス                  |
| `hasExternalIntegration` | `boolean`                    | 外部連携フラグ                      |
| `externalToolName`       | `string \| null`             | 外部ツール名                        |
