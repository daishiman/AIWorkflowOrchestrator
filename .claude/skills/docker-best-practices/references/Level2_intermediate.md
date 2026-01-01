# レベル2: 実務

## 概要

Dockerfile設計と最適化を実務レベルで整理する。
references/・assets/ を活用した設計を前提とする。

## 前提条件

- レベル1 の内容を理解している
- スコープと制約が明確になっている

## 詳細ガイド

### 必要な知識・情報

- 主要トピック: レイヤー最適化、キャッシュ、マルチステージ
- 実務指針: 再利用性と最小化を両立する

### 判断基準と検証観点

- 回避事項: 不要ファイルの混入
- 検証観点: イメージサイズとビルド時間

### リソース運用

- `references/dockerfile-optimization.md`: 最適化
- `references/multi-stage-builds.md`: ビルド分離
- `references/requirements-index.md`: 要件整合
- `references/legacy-skill.md`: 旧版差分確認

### テンプレート運用

- `assets/nodejs-dockerfile-template.dockerfile`: Dockerfile雛形
- `assets/dockerfile-review-checklist.md`: レビュー観点

### 成果物要件

- 最適化方針が明記されている

## 実践手順

1. Dockerfile構成を決める
2. チェックリストで検証する
3. 最適化方針を記録する

## チェックリスト

- [ ] レイヤー構成が整理済み
- [ ] キャッシュ方針が明確
- [ ] チェック済み
