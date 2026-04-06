# Phase 8 Refactoring Report

## Refactoring Summary

- `checksByLayer` と `expandedLayers` の責務を分離した。
- severity icon と count label の計算を helper 化した。
- `reverify` 後に折りたたみ状態が消えないように整理した。
- `VerifyLayerGroup` は local component として、親の state に近い位置に置いた。

## Naming

- `VerifyLayerGroup`
- `checksByLayer`
- `expandedLayers`
- `toggleLayer`
- `verifyCheckSeverityIcon`

## Avoided Changes

- backend / shared contract の再構成は行っていない。
- SVG アイコン依存は増やしていない。
- 不要な file split は行っていない。
