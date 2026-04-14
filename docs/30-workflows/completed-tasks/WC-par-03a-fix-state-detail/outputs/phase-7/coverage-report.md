# Phase 7: カバレッジレポート

## AC 対応表

| AC   | 内容                                                           | 対応 TC                    | concern coverage |
| ---- | -------------------------------------------------------------- | -------------------------- | ---------------- |
| AC-1 | internalAnswers がリトライ時にリセットされる                   | TC-01, TC-11               | ✓                |
| AC-2 | templateモードエラー時にキャンセルボタンが表示・動作する       | TC-03, TC-04, TC-12        | ✓                |
| AC-3 | q5 変更後に resolveExternalIntegration が再計算される          | TC-06, TC-07               | ✓                |
| AC-4 | generationLockRef が正常・エラー・キャンセル全経路で解放される | TC-08/09, TC-10, TC-13     | ✓                |
| AC-5 | 既存の正常フローが回帰していない                               | TC-02, TC-05, TC-07, TC-10 | ✓                |

## concern coverage 詳細

### ConversationRoundStep

| concern                                    | 対応 TC                       | 状態     |
| ------------------------------------------ | ----------------------------- | -------- |
| `useEffect([answers])` の依存              | TC-01, TC-11                  | ✓ 網羅   |
| `allEmpty` 条件の境界                      | TC-01（true）, TC-11（false） | ✓ 両境界 |
| `internalAnswers` 非リセット（通常フロー） | TC-02                         | ✓        |

### GenerateStep

| concern                                    | 対応 TC             | 状態      |
| ------------------------------------------ | ------------------- | --------- |
| `isTemplateMode && error && onCancel` 条件 | TC-03, TC-04, TC-12 | ✓ 全3条件 |
| error=undefined 境界                       | TC-12               | ✓         |
| 非templateモード非表示                     | TC-05               | ✓         |

### SkillCreateWizard

| concern                          | 対応 TC         | 状態 |
| -------------------------------- | --------------- | ---- |
| `useEffect([answers.q5])` 発火   | TC-06           | ✓    |
| q1〜q4 変化でも q5 effect 非発火 | TC-07           | ✓    |
| `generationLockRef` 正常完了解放 | TC-08/09, TC-10 | ✓    |
| `generationLockRef` エラー後解放 | TC-13           | ✓    |

## カバレッジ抜けの確認

- **問題12**: 空→リセット(TC-01) + 非空→非リセット(TC-11) で両境界を網羅。「複数回リトライ」については TC-01 が 1 回のリセットを検証し、その後 TC-11 で非リセットを検証することで連続リトライの動作を間接的に網羅。
- **問題13**: 表示条件の 3 変数（isTemplateMode, error, onCancel）のうち error=false 境界を TC-12 で補強。
- **問題18**: q5 変化(TC-06) と q1 変化(TC-07) で双方向を確認。
- **問題19**: 成功(TC-08/09)・単発(TC-10)・エラー(TC-13) の 3 経路を確認。

## Phase 8 への引き継ぎ

リファクタリング候補として以下を記録する：

| 候補                                | 詳細                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| `allEmpty` ロジックの可読性         | QUESTION_KEYS の every チェックは inline で問題ないが、名前付き関数への抽出も検討可能 |
| `eslint-disable-next-line` コメント | exhaustive-deps は意図的なため現状維持を推奨                                          |
