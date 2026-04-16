# Skill Feedback Report: UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001

## workflow 改善観点

| 観点                  | フィードバック                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Phase 12 テンプレート | Step 0 直後に `answers.q5` が空でも `smartDefaults.tool` fallback を説明へ残す guidance があると drift を防ぎやすい |
| artifacts parity      | root / outputs parity を Phase 12 初手で固定する流れは有効。今回も早めに揃えることで整合を取りやすかった            |
| renderer-local 判定   | shared へ昇格しない軽微変更でも、Step 2 を `N/A` と明記する欄があると迷いが減る                                     |
| visual regression     | `NON_VISUAL` でも見た目の回帰があるなら、補助 screenshot を 1 wave で残す欄があると判断が安定する                   |

## 技術的教訓

| テーマ          | 内容                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| 複数ツール統合  | `Promise.all` + 個別 `try/catch` + `Set` 集約の組み合わせで、成功分だけ返す構造にしやすい            |
| fallback 記述   | UI state が空でも smart default が先に決まるケースは、実装と文書の両方で補足しないと解釈差が出やすい |
| 暫定 UI の撤去  | 導入時の背景と削除条件が別 task にまたがる場合、Phase 12 で依存 task との関係を書き戻すと読みやすい  |
| 補助 screenshot | `NON_VISUAL` でも Q5 などの見た目変化は、画像 2 枚程度の補助証跡を添えるとレビューしやすい           |

## task-specification-creator への提案

### 改善候補

1. Phase 12 implementation guide の必須項目に「smart defaults fallback のような Step 間 state 補足」を加える
2. system-spec-update-summary のテンプレートに `shared interface 昇格: N/A / required` の明示欄を固定する
3. NON_VISUAL task 向けに「visual regression がある場合は補助 screenshot を許可する」テンプレート文を用意する

### 今回すぐの skill 更新

**なし。**

理由:

- 今回の知見は workflow close-out 運用に近く、即座に SKILL 本体を変えなくても文書側で閉じられる
- 新規未タスクも 0 件であり、別 wave の formalize が必要なほどの欠陥ではない

## pitfall 候補

| pitfall                             | 説明                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| `selectedOptions[0]` 前提の残骸     | multi-select 化後も先頭 1 件参照の説明が残りやすい                                   |
| `answers.q5` 空と未連携の混同       | Step 0 直後の空 state と「外部ツールなし」を同一視すると drift する                  |
| close-out と shared spec 更新の混同 | renderer-local 修正なのに shared spec まで触りに行くと過剰更新になる                 |
| 画像証跡の未記録                    | 見た目差分があるのに `NON_VISUAL` と決め打ちすると、補助 screenshot を取り忘れやすい |
