# システム仕様更新サマリー（W2-seq-03a）

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 12                                         |
| タスクID | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001 |
| 作成日   | 2026-04-08                                 |

---

## 変更されたシステム仕様

### 1. SkillCreateWizard.tsx 設計変更

| 項目                  | 変更前                                          | 変更後                                           |
| --------------------- | ----------------------------------------------- | ------------------------------------------------ |
| ステップ構成          | 旧構成（description/options/生成モード ベース） | 3ステップ（SkillInfo/Conversation/Complete）     |
| Step 0 コンポーネント | `DescribeStep`（旧）                            | `SkillInfoStep`（新）                            |
| Step 1 コンポーネント | なし（旧設計）                                  | `ConversationRoundStep`（新）                    |
| Step 2 コンポーネント | 旧完了ステップ                                  | `CompleteStep`（skillPath/アクションカード追加） |
| 旧生成モード state    | あり                                            | 削除（LLM専用化）                                |
| description state     | あり                                            | 削除（formData.purpose に統合）                  |

### 2. inferSmartDefaults の統合

`@repo/shared/services/skillCreator` から `inferSmartDefaults` を利用。
Step 0 完了時に呼び出し、結果を `ConversationRoundStep` の `smartDefaults` Props として渡す。

### 3. NON_VISUAL 計装ポイント 5 つの追加

`trackEvent` スタブ関数を定義し、ウィザードの各ライフサイクルポイントにログ出力を追加。
Wave 3（W3-seq-04）での本実装への差し替えを考慮した設計。

### 4. CompleteStep アクションカードの接続

- `onExecuteNow` / `onOpenInEditor` → `onClose` を直接呼び出し
- `onCreateAnother` → formData リセット + Step 0 復帰
- `onRetry`（👎フィードバック）→ Step 0 復帰（formData 保持）

---

## 影響範囲

| コンポーネント/ファイル                 | 影響                | 内容                  |
| --------------------------------------- | ------------------- | --------------------- |
| `SkillCreateWizard.tsx`                 | 変更（再実装）      | W2-seq-03a の主対象   |
| `SkillCreateWizard.test.tsx`            | 更新                | W2-seq-03a 新設計対応 |
| `SkillCreateWizard.W2-seq-03a.test.tsx` | 新規追加            | 追加テスト            |
| `wizard/index.ts`                       | W2-seq-03b 対応予定 | エクスポート更新      |
