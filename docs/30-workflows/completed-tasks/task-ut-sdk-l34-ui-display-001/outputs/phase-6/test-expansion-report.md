# Phase 6 Test Expansion Report

## Added Assertions

- Layer 1 〜 Layer 4 のヘッダー表示
- `layer3` の check が Layer 3 内にあること
- severity icon の表示
- severity 件数バッジの表示
- 空 Layer の非表示
- Layer1 / Layer2 の後方互換
- accordion の collapse / expand
- reverify 後の折りたたみ状態保持

## Fixture Changes

- `SkillLifecyclePanel.llm-generation.test.tsx` の layer3 fixture を `L3-001` / `L3-002` へ更新した。

## Regression Focus

- flat 表示のまま戻らないこと
- unknown layer が混入しても UI が壊れないこと
- reverify 後に折りたたみ状態が初期化されないこと

## Result

- 追加した tests は green で通過した。
