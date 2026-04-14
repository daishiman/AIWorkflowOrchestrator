# Phase 6: テスト拡充記録

## 概要

Phase 4 の TC-01〜TC-10 に加え、4 件のバグに対する境界ケースを追加した。

## 追加した境界ケース

### TC-11: internalAnswers — 非空 answers 変化でリセットされない（境界）

**ファイル**: `ConversationRoundStep.test.tsx`
**観点**: Phase 6 Task 1「同一値での再レンダリング時に不要なリセットが発生しないことを確認する」

ユーザーがオプションを選択した後、親から非空の `answers` が渡された場合でも `internalAnswers` がリセットされないことを確認。`allEmpty` 条件が false の場合は effect がリセットをスキップすることを検証。

**境界条件**: `answers` に選択済みオプションが含まれる（`allEmpty=false`）→ リセット不発

---

### TC-12: GenerateStep — templateMode + エラーなしでキャンセルボタン非表示（境界）

**ファイル**: `GenerateStep.test.tsx`
**観点**: Phase 6 Task 2「templateモード・非エラー状態ではキャンセルボタンが表示されないことを確認する」

`isTemplateMode=true` でも `error` が undefined の場合（idle 状態）は問題13修正のキャンセルボタンが表示されないことを確認。修正条件 `isTemplateMode && error && onCancel` の `error` 境界を検証。

**境界条件**: `isTemplateMode=true`・`stage="idle"`・`error=undefined` → キャンセルボタン非表示

---

### TC-13: SkillCreateWizard — 生成エラー後のリトライで再生成可能（境界）

**ファイル**: `SkillCreateWizard.test.tsx`
**観点**: Phase 6 Task 4「エラー発生後のロック状態を確認し、次の生成操作が可能であることを確認する」

`createSkill` が reject した後、`finally` ブロックで `generationLockRef.current = false` が解放され、リトライボタン押下で再生成が成功することを確認。

**境界条件**:

- 1回目: `mockRejectedValueOnce` → `catch` → `finally` でロック解放
- 2回目: `mockResolvedValueOnce` → 成功、CompleteStep 表示
- `mockCreateSkill` 呼び出し回数: 2回

---

## テストファイル別追加数

| ファイル                         | 追加 TC | 境界観点                        |
| -------------------------------- | ------- | ------------------------------- |
| `ConversationRoundStep.test.tsx` | TC-11   | 非空 answers では reset 不発    |
| `GenerateStep.test.tsx`          | TC-12   | error=undefined でボタン非表示  |
| `SkillCreateWizard.test.tsx`     | TC-13   | エラー後ロック解放→リトライ可能 |

## Phase 4 との対応関係

| Phase 4 TC                   | Phase 6 追加 TC | 補強内容                           |
| ---------------------------- | --------------- | ---------------------------------- |
| TC-01（空→リセット）         | TC-11           | 非空→リセット不発の逆境界          |
| TC-03（error+template→表示） | TC-12           | error=なし+template→非表示の逆境界 |
| TC-08/09（成功→リトライ）    | TC-13           | エラー→リトライの error 経路境界   |

## 不要な再実行・再レンダリング防止の確認

- TC-11: `allEmpty=false` により effect の reset コードは実行されない
- TC-07（Phase 4）: q1 変更でも q5 の useEffect は発火しない（同一参照維持）
- TC-12: `error=undefined` により問題13修正ブロックは JSX 非出力
