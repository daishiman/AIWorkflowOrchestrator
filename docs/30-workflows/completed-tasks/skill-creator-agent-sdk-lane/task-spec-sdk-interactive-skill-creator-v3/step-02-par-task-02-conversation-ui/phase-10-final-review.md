# Phase 10: 最終レビュー — Conversation UI（質問受信・回答送信UIコンポーネント）

## メタ情報

| 項目      | 値                  |
| --------- | ------------------- |
| Phase番号 | 10                  |
| 機能名    | conversation-ui     |
| タスクID  | TASK-SDK-SC-02      |
| 作成日    | 2026-04-02          |
| 依存Phase | Phase 9（品質保証） |

## 目的

Phase 3 の設計レビューと同じ4条件で、実装済みコードを最終検証する。  
全条件を満たしていることを確認してから Phase 11 の手動テストに進む。

## 実行タスク

### Task 10-1: 矛盾なしの最終検証

**検証対象**: 実装された各コンポーネントで UI が仕様通りに動作しているか

| 検証ポイント                                    | 期待する動作                                                         | 状態   |
| ----------------------------------------------- | -------------------------------------------------------------------- | ------ |
| `type=single_select` で「その他」が最後の選択肢 | `choicesWithFreeText` の末尾が `FREE_TEXT_LABEL` であることを確認    | 要確認 |
| `type=multi_select` で「その他」が最後の選択肢  | `choicesWithFreeText` の末尾が `FREE_TEXT_LABEL` であることを確認    | 要確認 |
| `type=free_text` で FreeTextInput のみ表示      | ChoiceButton が表示されないことを確認                                | 要確認 |
| `type=secret` で password マスクが適用          | `isSecret=true` の FreeTextInput が表示されることを確認              | 要確認 |
| `type=confirm` で「はい」「いいえ」のみ表示     | FreeTextInput が表示されないことを確認                               | 要確認 |
| 「その他」未選択時に FreeTextInput が非表示     | `isFreeTextVisible=false` の初期状態を確認                           | 要確認 |
| `isSubmitting=true` 時に全入力が無効化          | 全 ChoiceButton と FreeTextInput が `disabled=true` であることを確認 | 要確認 |

問題が発見された場合は実装を修正し、テストを再実行する。

### Task 10-2: 漏れなしの最終検証

**検証対象**: FR-001〜FR-006 の全要件が実装されているか

| 要件   | 実装確認ポイント                                                     | 状態   |
| ------ | -------------------------------------------------------------------- | ------ |
| FR-001 | `QuestionCard` が `payload.question` と `payload.context` を表示する | 要確認 |
| FR-002 | `single_select` で選択肢末尾に「その他（自由入力）」が常に表示される | 要確認 |
| FR-003 | `multi_select` で複数選択・送信ボタン・「その他」が実装されている    | 要確認 |
| FR-004 | `free_text` / `secret` タイプで適切な入力フィールドが表示される      | 要確認 |
| FR-005 | `confirm` タイプで「はい」「いいえ」ボタンが表示・動作する           | 要確認 |
| FR-006 | `ConversationProgress` が「質問 N / 推定合計」形式で表示される       | 要確認 |

### Task 10-3: 整合性の最終検証

**検証対象**: IPCチャネル定数が `channels.ts` 経由で参照されているか

```bash
# 文字列リテラルの直書きが残っていないことを最終確認
grep -rn "skill-creator:question-received\|skill-creator:answer" \
  apps/desktop/src/renderer/components/skill-creator/*.tsx
```

期待する結果: 0件

| 検証ポイント                                   | 実装状態 |
| ---------------------------------------------- | -------- |
| `SKILL_CREATOR_QUESTION_RECEIVED` 定数使用     | 要確認   |
| `SKILL_CREATOR_ANSWER` 定数使用                | 要確認   |
| `@repo/shared/src/ipc/channels` からインポート | 要確認   |
| 文字列リテラルの直書き 0 件                    | 要確認   |

### Task 10-4: 依存関係整合の最終検証

**検証対象**: TASK-SDK-SC-01 の成果物のみに依存しているか

```bash
# 外部依存のインポートを確認
grep -rn "from '@repo/shared" \
  apps/desktop/src/renderer/components/skill-creator/*.tsx
```

| 依存先                                      | 使用目的           | 許容性 |
| ------------------------------------------- | ------------------ | ------ |
| `packages/shared/src/types/skillCreator.ts` | QuestionPayload 型 | OK     |
| `packages/shared/src/ipc/channels.ts`       | IPC チャネル定数   | OK     |
| `react`                                     | UIフレームワーク   | OK     |
| step-02-par 内の他タスク成果物              | なし               | OK     |

step-02-par 内の他タスク成果物（TASK-SDK-SC-03 以降）への依存がないことを確認する。  
依存が発見された場合は、その依存を取り除くか、依存タスクの完了を待つかを判断する。

### Task 10-5: AC（受入基準）の最終確認

| AC    | 受入基準                                                                                    | 状態   |
| ----- | ------------------------------------------------------------------------------------------- | ------ |
| AC-01 | `QuestionCard` が `payload.question` と `payload.context` を表示する                        | 要確認 |
| AC-02 | `single_select` / `multi_select` の選択肢の**最後**に「その他（自由入力）」が常に表示される | 要確認 |
| AC-03 | 「その他（自由入力）」選択時に `FreeTextInput` が展開される                                 | 要確認 |
| AC-04 | `ChoiceButton` クリック（「その他」除く）で `skill-creator:answer` IPCが呼び出される        | 要確認 |
| AC-05 | `FreeTextInput` で Enter キー押下時に `skill-creator:answer` IPCが呼び出される              | 要確認 |
| AC-06 | `secret` タイプでパスワードマスク表示が適用される                                           | 要確認 |
| AC-07 | `confirm` タイプで「はい」「いいえ」ボタンが表示される                                      | 要確認 |
| AC-08 | `ConversationProgress` が「質問 N / 推定合計」形式を表示する                                | 要確認 |
| AC-09 | `SkillCreatorConversationPanel` がアンマウント時に IPCリスナーをクリーンアップする          | 要確認 |

## 参照資料

| 資料名               | パス                           |
| -------------------- | ------------------------------ |
| Phase 1 要件定義     | `phase-1-requirements.md`      |
| Phase 3 設計レビュー | `phase-3-design-review.md`     |
| Phase 9 品質保証     | `phase-9-quality-assurance.md` |

## 成果物

| 成果物                         | パス                       | 形式     |
| ------------------------------ | -------------------------- | -------- |
| 最終レビュー記録（本ファイル） | `phase-10-final-review.md` | Markdown |

## 完了条件

- [ ] 矛盾なし: 全タイプで UI が仕様通りに動作していることを確認した
- [ ] 漏れなし: FR-001〜FR-006 の全要件が実装されていることを確認した
- [ ] 整合性: IPCチャネル定数の文字列リテラル直書きが 0 件であることを確認した
- [ ] 依存関係整合: TASK-SDK-SC-01 の成果物のみに依存していることを確認した
- [ ] AC-01〜AC-09 の全受入基準を確認した
- [ ] 問題が発見された場合は修正し、テストが全件 PASS していることを確認した

## 次の Phase: Phase 11 (phase-11-manual-testing.md)
