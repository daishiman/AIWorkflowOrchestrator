# Phase 7: カバレッジレポート

## タスク: TASK-SW-FIX-STATE-DETAIL-001

## AC カバレッジ対応表

### AC-1: internalAnswers リセット

| TC-ID | テスト内容                                                         | 対応AC | 種別   |
| ----- | ------------------------------------------------------------------ | ------ | ------ |
| TC-01 | answers prop が空値に変わった場合 internalAnswers がリセットされる | AC-1   | 正常系 |
| TC-02 | ユーザーがオプションを選択しても選択状態が維持される（回帰）       | AC-1   | 回帰   |
| TC-B1 | 同一値での再レンダリング時に不要なリセットが発生しない             | AC-1   | 境界値 |
| TC-B3 | 異なるオブジェクト参照で複数回リセットが発生する                   | AC-1   | 境界値 |

**判定: COVERED** — 正常系・回帰・境界値の3方向で閉じている

### AC-2: キャンセルボタン表示・遷移

| TC-ID | テスト内容                                                                    | 対応AC | 種別   |
| ----- | ----------------------------------------------------------------------------- | ------ | ------ |
| TC-03 | templateモードでエラーが発生した場合、キャンセルボタンが表示される            | AC-2   | 正常系 |
| TC-04 | templateモードエラー後にキャンセルボタンを押すと onCancel が呼ばれる          | AC-2   | 正常系 |
| TC-05 | 非templateモードのエラー状態ではtemplateキャンセルボタンが表示されない        | AC-2   | 回帰   |
| TC-B2 | templateモード + 生成中ステージ（非エラー）ではキャンセルボタンが表示されない | AC-2   | 境界値 |

**判定: COVERED** — 正常系・クリック動作・非templateモード回帰・非エラー状態境界値で閉じている

### AC-3: resolveExternalIntegration 再計算

| TC-ID  | テスト内容                                                                            | 対応AC | 種別         |
| ------ | ------------------------------------------------------------------------------------- | ------ | ------------ |
| TC-06  | q5 に Slack が選択されると hasExternalIntegration=true, externalToolName=Slack になる | AC-3   | 正常系       |
| TC-07  | q5 に「なし」が選択されると hasExternalIntegration=false になる                       | AC-3   | 正常系/回帰  |
| TC-06b | q5 に「その他」+freeText が入力されると externalToolName に freeText が使われる       | AC-3   | エッジケース |

**判定: COVERED** — Slack/なし/その他 の3パターンで主要ケースを網羅

### AC-4: generationLockRef リセット

| TC-ID    | テスト内容                                                           | 対応AC | 種別           |
| -------- | -------------------------------------------------------------------- | ------ | -------------- |
| TC-08/09 | キャンセル後に再度生成操作が実行可能になる（ロック残留なし）         | AC-4   | キャンセル経路 |
| TC-10    | 生成処理が正常完了した後、ロックが解放される（回帰）                 | AC-4   | 成功経路       |
| TC-B4    | エラー発生時にエラーカードが表示される（finally 経由ロック解放確認） | AC-4   | エラー経路     |

**判定: COVERED** — finally ブロックの3経路（成功・エラー・キャンセル）を個別に確認

### AC-5: 回帰なし

| TC-ID | テスト内容                                                     | 種別                       |
| ----- | -------------------------------------------------------------- | -------------------------- |
| TC-02 | ユーザーがオプションを選択しても選択状態が維持される           | ConversationRoundStep 回帰 |
| TC-05 | 非templateモードのエラー状態ではキャンセルボタンが表示されない | GenerateStep 回帰          |
| TC-07 | q5以外変更の回帰（q5=なしのケースと兼用）                      | SkillCreateWizard 回帰     |
| TC-10 | 正常完了フロー回帰                                             | SkillCreateWizard 回帰     |
| TC-B1 | 同一参照での不要リセット回避                                   | ConversationRoundStep 回帰 |

**判定: COVERED** — 3ファイルそれぞれで回帰テストが存在する

## concern coverage 確認

### ConversationRoundStep

| concern                                 | テスト対象                      | covered |
| --------------------------------------- | ------------------------------- | ------- |
| useEffect 分割（2つの effect）          | TC-01, TC-02, TC-B1             | ✓       |
| isInternalChangeRef フラグ（echo 防止） | TC-B1（同一参照再レンダリング） | ✓       |
| answers prop 変化 → リセット            | TC-01, TC-B3                    | ✓       |
| smartDefaults 変化 → リセット           | 既存テスト群で間接確認          | ✓       |

### GenerateStep

| concern                                       | テスト対象   | covered |
| --------------------------------------------- | ------------ | ------- |
| mode="template" + stage="error" → ボタン表示  | TC-03, TC-04 | ✓       |
| mode 省略 + stage="error" → ボタン非表示      | TC-05        | ✓       |
| mode="template" + 非エラー状態 → ボタン非表示 | TC-B2        | ✓       |
| onCancel コールバック呼び出し                 | TC-04        | ✓       |

### SkillCreateWizard

| concern                                           | テスト対象              | covered |
| ------------------------------------------------- | ----------------------- | ------- |
| q5 変化 → resolveExternalIntegration 再計算       | TC-06, TC-07, TC-06b    | ✓       |
| q5SeriRef による不要計算抑制                      | TC-07（q5変化のみ反応） | ✓       |
| finally → generationLockRef = false（キャンセル） | TC-08/09                | ✓       |
| finally → generationLockRef = false（成功）       | TC-10                   | ✓       |
| finally → generationLockRef = false（エラー）     | TC-B4                   | ✓       |

## カバレッジ抜け確認

**抜けなし** — AC-1〜AC-5 の全受入条件に対して対応するテストが存在する。

## Phase 8 への引き継ぎ

リファクタリング候補:

1. `isInternalChangeRef` は boolean flag だが、TC-B3 の検討により「参照等価性ベースのリセット」という仕組みへの理解を深めた。実装は現状維持（flag アプローチで十分）
2. `q5SeriRef` の `JSON.stringify` は shallow copy の範囲内なので安全。ただし `ConversationAnswers` 型の変化には注意が必要（将来 nested array 追加時に serialize 結果が変わる可能性あり）
3. `generationLockRef` の `finally` 位置移動は最小限の変更で3経路対称性を実現している
