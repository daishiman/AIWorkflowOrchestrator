# Phase 9: QA

## メタ情報

- Phase: 9
- タスクID: UT-SKILL-WIZARD-W1-par-02b
- 機能名: ConversationRoundStep コンポーネント実装（Step 1）
- 作成日: 2026-04-07

## 目的

実装・リファクタリング後のコードに対して品質保証（QA）を実施する。自動テスト・静的解析・統合確認を通じてリリース品質を担保する。

## 実行順（簡潔に）

Phase 9 は「機械的に落ちるものを早く落とす」順で実行する。

1. 型チェック（速く壊れている箇所を特定）
2. lint（規約違反と危険なパターンの検出）
3. format（差分のノイズを除去）
4. テスト（最後にまとめて GREEN を確認）
5. 参照残存チェック（削除対象の参照が残っていないこと）

## 実行タスク

- [ ] 全自動テストを実行する
- [ ] TypeScript 型チェックを実行する
- [ ] ESLint チェックを実行する
- [ ] Prettier フォーマットチェックを実行する
- [ ] ウィザード全体の統合動作を確認する
- [ ] 削除ファイルの残存参照がないか確認する

## 参照資料

| 資料名         | パス                                                           | 説明        |
| -------------- | -------------------------------------------------------------- | ----------- |
| 実装ファイル群 | `apps/desktop/src/renderer/components/skill/wizard/`           | QA 対象     |
| テストファイル | `apps/desktop/src/renderer/components/skill/wizard/__tests__/` | テスト実行  |
| ESLint 設定    | `apps/desktop/.eslintrc.*`                                     | lint ルール |

## 実行手順

### Step 1: 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

TypeScript コンパイルエラーが 0 件であることを確認する。

### Step 2: lint チェック

```bash
pnpm --filter @repo/desktop lint
```

ESLint エラー・警告が 0 件であることを確認する。

### Step 3: フォーマットチェック

```bash
pnpm --filter @repo/desktop format:check
```

Prettier フォーマット差分が 0 件であることを確認する。

### Step 4: 全テスト実行

```bash
pnpm --filter @repo/desktop vitest run
```

全テストスイートが GREEN であることを確認する。

### Step 5: 削除ファイル/型の残存参照確認

削除対象は「ファイル」だけでなく「型のエクスポート」も含むため、両方の文字列参照が 0 件であることを確認する。

```bash
rg -n "ConfigureStep|WizardOptions" apps packages
```

出力が 0 件であることを確認する（参照が全て解消されていること）。

### Step 6: ウィザード統合確認

親ウィザードコンポーネントで `ConversationRoundStep` が正しく使用されているか確認する。

確認ポイント:

- `ConversationRoundStep` が Step 1 として正しく組み込まれている
- `formData`（SkillInfoFormData）が Step 0 から正しく渡されている
- `smartDefaults` が W0-seq-01 の処理結果から渡されている
- `answers` / `onAnswersChange` が親で状態管理されている
- `onBack` で Step 0 へ戻れる
- `onGenerate` でスキル生成フローに遷移する

### Step 7: QA チェックリスト

| 項目                              | 結果 |
| --------------------------------- | ---- |
| 全テスト GREEN                    | -    |
| TypeScript エラー 0 件            | -    |
| ESLint エラー 0 件                | -    |
| Prettier 差分 0 件                | -    |
| ConfigureStep 参照 0 件           | -    |
| WizardOptions 参照 0 件           | -    |
| ウィザード統合動作確認            | -    |
| InterviewProgressBar 独立動作確認 | -    |
| ApplySummaryCard 独立動作確認     | -    |

## 統合テスト連携

- AC-08（ConfigureStep / WizardOptions 参照ゼロ）を QA の削除確認ステップとして検証する（`rg -n "ConfigureStep|WizardOptions"` で 0 件）。
- Phase 4/6/7/8 の全テストが GREEN であることを最終確認する。

## 成果物

- QA チェックリスト（全項目合格）
- テスト実行結果ログ

## 完了条件

- [ ] 全自動テストが GREEN になっている
- [ ] TypeScript 型チェックがエラー 0 件
- [ ] ESLint チェックがエラー 0 件
- [ ] Prettier フォーマットチェックが差分 0 件
- [ ] `ConfigureStep` / `WizardOptions` の残存参照が 0 件
- [ ] ウィザード全体の統合動作が確認されている
