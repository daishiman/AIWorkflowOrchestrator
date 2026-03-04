# Phase 2 アーキテクチャ設計

## 設計方針

- hooks/componentsに safeLength / normalizeSearchText / nullish default を導入し防御。
- 既存レイヤ境界（Main / IPC / Renderer）を変えずに局所修正する。

## 依存境界

- 入力正規化は境界層で実施し、下位層へ未正規化データを渡さない。
- 例外は既存エラーハンドリング契約へ集約する。

## 設計判断

- 最小変更で再発条件を潰す方針を採用。
