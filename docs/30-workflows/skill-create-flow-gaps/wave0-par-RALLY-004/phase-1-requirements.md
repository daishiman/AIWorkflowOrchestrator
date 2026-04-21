# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Phase      | 1                                                  |
| 機能名     | TASK-RALLY-004                                     |
| タスク名   | selectedOptionIds/selectedValues重複フィールド整理 |
| 前提Phase  | -                                                  |
| 後続Phase  | Phase 2                                            |
| 作成日     | 2026-04-21                                         |
| ステータス | pending                                            |

## 目的

`packages/shared/src/types/skillCreator.ts` において、`selectedOptionIds` と `selectedValues` という類似フィールドが両方存在し、どちらが正規値かが型定義レベルで明記されていない問題を解消する。

## SubAgentチーム編成（並列実行可能部分を明示）

| SubAgent   | 担当                                                             | 実行形態               |
| ---------- | ---------------------------------------------------------------- | ---------------------- |
| SubAgent-A | 型定義現状調査（skillCreator.ts の該当型を特定）                 | **並列**               |
| SubAgent-B | 使用箇所調査（selectedOptionIds/selectedValuesの呼び出し側全件） | **並列**               |
| SubAgent-C | 統合監査（A・B結果を統合し受け入れ基準を確定）                   | **直列**（A・B完了後） |

## P50チェック（必須）

```bash
# 対象ファイルの最近のコミット履歴
git log --oneline -20 -- packages/shared/src/types/skillCreator.ts

# 重複フィールドの現在の定義を確認
grep -n "selectedOptionIds\|selectedValues\|canonical\|deprecated" \
  packages/shared/src/types/skillCreator.ts

# selectedValues を参照している呼び出し側を確認
grep -rn "selectedValues" apps/ packages/ --include="*.ts" --include="*.tsx" | \
  grep -v "node_modules" | grep -v ".test."

# selectedOptionIds を参照している呼び出し側を確認
grep -rn "selectedOptionIds" apps/ packages/ --include="*.ts" --include="*.tsx" | \
  grep -v "node_modules" | grep -v ".test."
```

### 現状（2026-04-21 時点の確認結果）

`packages/shared/src/types/skillCreator.ts` の L595〜620 付近に以下が存在する。

**`SkillCreatorUserInputSubmission`（L595）:**

- `selectedOptionId?: string;`（単数形・single_select 用）
- `selectedOptionIds?: string[];`（複数選択・正規フィールド）
- `selectedValues?: string[];`（重複フィールド・レガシー互換）

**`InterviewUserAnswer`（L612）:**

- `selectedOptionId?: string;`（単数形）
- `selectedOptionIds?: string[];`（複数選択・正規フィールド）
- `selectedValues?: string[];`（重複フィールド・レガシー互換）

**主な利用箇所:**

- `SkillCreatorWorkflowEngine.ts` L1324: `normalizeSelectedOptionIds` が `selectedOptionIds ?? selectedValues` でフォールバック
- `ConversationalInterview.tsx` L132〜133: 両フィールドに同値をセット
- `useInterviewState.ts` L160〜163: 相互フォールバックで両フィールドに代入

## 実行タスク

1. SubAgent-A: `packages/shared/src/types/skillCreator.ts` を読み込み、`selectedOptionIds`・`selectedValues` フィールドの定義箇所・行番号・型を記録する
2. SubAgent-B: `grep -rn "selectedOptionIds\|selectedValues"` で全呼び出し側を列挙し、正規フィールドを特定する
3. SubAgent-C: A・B の結果をマージし、正規フィールド（`selectedOptionIds`）と廃止予定フィールド（`selectedValues`）の判定を確定させる

## 受け入れ基準

- AC-1: `SkillCreatorUserInputSubmission.selectedOptionIds` に `@canonical` JSDoc が追加されている
- AC-2: `SkillCreatorUserInputSubmission.selectedValues` に `@deprecated Use selectedOptionIds instead.` JSDoc が追加されている
- AC-3: `InterviewUserAnswer.selectedOptionIds` に `@canonical` JSDoc が追加されている
- AC-4: `InterviewUserAnswer.selectedValues` に `@deprecated Use selectedOptionIds instead.` JSDoc が追加されている
- AC-5: IDE（VSCode 等）で `selectedValues` フィールドを参照するとデプリケーション警告が表示される
- AC-6: `pnpm typecheck` がエラーなしで通過する
- AC-7: `pnpm lint` がエラーなしで通過する

## 完了条件

- [ ] SubAgent-A による型定義現状調査が完了している
- [ ] SubAgent-B による使用箇所調査が完了している
- [ ] SubAgent-C による統合監査が完了し、正規フィールドが確定している
- [ ] P50チェックの bash コマンドが全件実行済みである
- [ ] 受け入れ基準 AC-1〜AC-7 が検証可能な形で定義されている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
