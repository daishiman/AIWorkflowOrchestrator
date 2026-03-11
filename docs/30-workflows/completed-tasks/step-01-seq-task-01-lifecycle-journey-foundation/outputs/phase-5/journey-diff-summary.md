# 導線差分サマリー

## before

- 一次導線の正本がなく、Skill Center は探索画面としてのみ見えていた。
- skill-center alias が shell 側で明示正規化されていなかった。
- current workflow 用 screenshot 実行経路が存在しなかった。

## after

- skillLifecycleJourney.ts が一次導線・責務・advanced policy の正本になった。
- Skill Center に 3ステップの guide panel と surface ownership board を追加した。
- App shell は legacy alias を canonical view へ正規化する。
- workflow 専用 screenshot script で TC-11-01..06 を再取得でき、TC-11-05 は責務ボード要素を直接 capture する。
