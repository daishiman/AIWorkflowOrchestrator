# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 4                            |
| Phase名    | テスト作成                   |
| 対象機能   | TASK-SW-FIX-STATE-DETAIL-001 |
| 前提Phase  | Phase 3: 設計レビュー        |
| 次Phase    | Phase 5: 実装                |
| ステータス | pending                      |
| 作成日     | 2026-04-12                   |

## 目的

4件のバグ再発を検出するテストを実装より先に定義し、
AC-1〜AC-5の検証可能性を確保する。

## 実行タスク

### Task 1: AC-1対応テスト（internalAnswersリセット）

- リトライ操作後に`internalAnswers`が空値になることを検証するテストケースを定義する
- `answers` propが変化した際に`internalAnswers`がリセットされることをuseEffect経由で確認するテストを定義する
- 前回値が残留しないことを明示的にassertするケースを含める

### Task 2: AC-2対応テスト（キャンセルボタン表示）

- templateモードかつエラー状態でキャンセルボタンが表示されることを検証するテストケースを定義する
- キャンセルボタン押下後にStep 0に遷移するコールバックが呼ばれることを検証するテストを定義する
- 非templateモードではキャンセルボタンが表示されないことを確認するテストを含める

### Task 3: AC-3対応テスト（resolveExternalIntegration再計算）

- q5の回答変更後に`hasExternalIntegration`と`externalToolName`が更新されることを検証するテストケースを定義する
- q5変更前の古い値が残留しないことをassertするケースを含める

### Task 4: AC-4対応テスト（generationLockRefリセット）

- キャンセル操作後に`generationLockRef.current`が`false`になることを検証するテストケースを定義する
- キャンセル後に再度生成操作が実行可能になることを確認するテストを定義する
- 正常完了・エラー・キャンセルの3経路すべてでロックが解放されることを個別に検証するテストを含める

### Task 5: AC-5対応テスト（回帰テスト）

- リトライなし・キャンセルなしの正常フローが引き続き動作することを確認する回帰テストを定義する
- 既存のウィザードフロー（問題12〜19修正前の正常系）が変化していないことを確認するテストを含める

## テストケース一覧（TC-01〜TC-10）

以下のテストケースを Phase 4 で実装し、`outputs/phase-4/test-specifications.md` に記録する。

| テストID | 対象バグ | 入力条件                                                     | 期待結果                                                  | 備考                             |
| -------- | -------- | ------------------------------------------------------------ | --------------------------------------------------------- | -------------------------------- |
| TC-01    | 問題12   | リトライ時に `answers` prop に空オブジェクト `{}` が渡される | `internalAnswers` state が `{}` にリセットされる          | useEffect 再実行確認             |
| TC-02    | 問題12   | 通常フローで `answers` が変化しない                          | `internalAnswers` state が変化しない（回帰）              | 不要なリセットが発生しないこと   |
| TC-03    | 問題13   | templateモードでエラーが発生した状態                         | キャンセルボタンが DOM に存在する                         | `isTemplateMode && isError` 条件 |
| TC-04    | 問題13   | templateモードエラー後にキャンセルボタンを押す               | `onCancel`（または `onReset`）コールバックが呼び出される  | Step 0 遷移の確認                |
| TC-05    | 問題13   | 非templateモード（通常モード）のエラー状態                   | キャンセルボタンが表示されない（回帰）                    | 既存 UI への影響がないこと       |
| TC-06    | 問題18   | q5 の回答を変更する                                          | `resolveExternalIntegration` が再呼び出しされ最新値が返る | 再計算トリガーの確認             |
| TC-07    | 問題18   | q5 以外の質問（q1〜q4）の回答を変更する                      | `resolveExternalIntegration` が再呼び出しされない（回帰） | 不要な再計算が発生しないこと     |
| TC-08    | 問題19   | 生成処理をキャンセルする                                     | `generationLockRef.current` が `false` になる             | finally 節の実行確認             |
| TC-09    | 問題19   | キャンセル後に再度生成操作を行う                             | 生成が正常に開始できる（ロック残留なし）                  | 後続フローの疎通確認             |
| TC-10    | 問題19   | 生成処理が正常完了する                                       | `generationLockRef.current` が `false` になる（回帰）     | 正常終了パスの確認               |

---

## 参照資料

| 資料名               | パス                                                                          | 説明         |
| -------------------- | ----------------------------------------------------------------------------- | ------------ |
| 設計レビュー         | `phase-3-design-review.md`                                                    | gate結果     |
| 設計成果物           | `outputs/phase-2/design-document.md`                                          | テスト観測点 |
| Step 1コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | テスト対象   |
| 生成ステップ         | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`          | テスト対象   |
| ウィザード実装       | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | テスト対象   |

## 統合テスト連携

- Phase 10の最終レビューでAC-1〜AC-5との対応表を再利用する
- リトライ→internalAnswersリセット→再入力の一連フローを1ケースにまとめる

## 成果物

| 成果物       | パス                                     | 説明             |
| ------------ | ---------------------------------------- | ---------------- |
| テスト仕様書 | `outputs/phase-4/test-specifications.md` | テストケース一覧 |

## 完了条件

- [ ] AC-1〜AC-5のすべてに対応するテストケースが定義されている
- [ ] 回帰テスト（AC-5）が含まれている
- [ ] 3経路（正常・エラー・キャンセル）のロック解放テストが定義されている
- [ ] 実装前にfail-first観点が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
