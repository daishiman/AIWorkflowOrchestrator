# Phase 9: 品質保証

## 目的

API 主線 / handoff 補助の原則が崩れていないことを確認する。

## 実行タスク

- route priority の再点検
- approval / disclosure / manual boundary の確認
- consumer auth 非流用の確認

## 品質観点

- API 実行が primary lane として扱われている
- handoff は API unavailable や明示退避時の secondary lane に限定されている
- no-op CTA や hidden execution を生まない

## 公式照合観点

- permissions docs の考え方と approval flow が矛盾していない
- Claude Code / consumer auth を third-party product 本体へ流用しない前提が維持されている

## 完了条件

- [ ] route priority が明確
- [ ] approval / disclosure / manual boundary が読める
- [ ] compliance 前提とのズレがない
- [ ] **本Phase内の全タスクを100%実行完了**
