# Phase 8: リファクタリング - タスク仕様書

## 目的

mode ごとの条件分岐過多、重複 hook、状態の二重保持を解消する。

## 対象

- duplicated selector
- duplicated streaming handler
- mode 専用分岐の散在

## 完了条件

- [ ] 共通基盤と mode adapter の境界が明快
- [ ] Task03 追加時の拡張点が限定されている
