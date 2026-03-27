# Refactoring Summary

## naming rule

- `Layer34` を shared DTO 名にだけ使い、renderer 表示文言へ漏らさない
- `verifyDetail` / `reverifyAction` / `delegatedNote` を主要語彙として統一する

## duplicate reduction

- mapping は facade 側 1 回に集約する
- renderer 側で DTO を再構成しない
