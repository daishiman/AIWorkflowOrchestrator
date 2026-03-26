# Phase 1: 要件定義

## 目的

verify / improve の入力、出力、失敗時動作、UI surface を定義する。

## 実行タスク

- verify contract 定義
- improve contract 定義
- result surface 定義
- source provenance / snapshot hash を verify result に持たせる条件定義

## 前提依存

- Task02 の state owner / lane response baseline
- Task03 の resource / budget degrade trigger
- Task04 の interaction state contract

## 成果物

- verify contract
- improve contract
- apply / re-verify / re-entry surface contract

## 境界メモ

- create mainline navigation は Task05、approval / disclosure / handoff governance は Task07 が担う

## 完了条件

- [ ] verify と improve が独立契約として定義されている
- [ ] verify 対象の source root / snapshot を追跡できる
- [ ] Task05 の mainline、Task07 の governance と責務衝突しない
- [ ] **本Phase内の全タスクを100%実行完了**
