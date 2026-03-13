# Phase 1: 受入基準

## AC-1

- Given: 作成依頼文、create 後 analysis、execute 後 stream、improve 後 analysis が揃う
- When: `evaluateDraft` `evaluatePostCreate` `evaluatePostExecute` `evaluatePostImprove` を呼ぶ
- Then: `draft` `post_create` `post_execute` `post_improve` の 4 checkpoint が `LifecycleEvaluationSnapshot.stage` に記録される

## AC-2

- Given: prompt / skill / execution の各データが入力される
- When: `buildLifecycleEvaluationSnapshot()` を実行する
- Then: `promptEvaluation` `skillAnalysis` `executionQuality` が同一 snapshot に集約される

## AC-3

- Given: totalScore と hardBlocks が計算済み
- When: `buildLifecycleGateDecision()` を実行する
- Then: `revise_required` `save_with_warning` `use_with_warning` `use_ready` `recommended` のいずれか 1 つに分岐する

## AC-4

- Given: Task03 の create / execute / improve 導線を使う
- When: create 完了、execute 終了、improve 適用後に UI を見る
- Then: `SkillLifecyclePanel` / `SkillAnalysisView` に summary・badge・delta が表示される

## AC-5

- Given: Task04 で最新評価が存在する
- When: `SkillCenterView` を開いて `再評価する` を押す
- Then: 利用前品質ゲートが表示され、再評価後の最新状態が反映される

## AC-6

- Given: 評価結果と内部分担をユーザーに見せる
- When: Task03 / Task05 の主要 surface を表示する
- Then: UI 主導線には `Atent Team` / `SubAgent` / `Codex` を露出せず、補助的な内部役割表示に留める
