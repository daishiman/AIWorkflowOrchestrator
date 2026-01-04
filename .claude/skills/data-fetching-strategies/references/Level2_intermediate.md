# レベル2: 実務

## 概要

ライブラリ選定とキャッシュ方針の設計を扱う。

references/ と assets/ を活用する運用を前提とする。

## 前提条件

- レベル1の成果物が揃っている
- 取得対象と更新頻度が明確

## 詳細ガイド

### 必要な知識・情報

- 主要トピック: ライブラリ選定、キャッシュ設計、キー設計
- 参照必須: `references/library-comparison.md`

### 判断基準と検証観点

- 回避事項: 複数ライブラリを混在させる

### リソース運用

- `references/caching-patterns.md`: キャッシュパターン
- `references/query-key-guidelines.md`: キー設計

### スクリプト運用

- `scripts/analyze-data-fetching.mjs`: 実装傾向の確認
- `scripts/validate-skill.mjs`: 構造検証

### テンプレート運用

- `assets/cache-policy-matrix.md`: キャッシュ方針整理
- `assets/fetching-requirements-template.md`: 要件整理

### 成果物要件

- 設計方針とキャッシュ方針が明記されている

## 実践手順

1. ライブラリ選定の根拠を整理する
2. キャッシュ方針をマトリクスで整理する
3. キー設計を決定する

## チェックリスト

- [ ] ライブラリ選定理由が記載されている
- [ ] キャッシュ方針が明記されている
- [ ] キー設計が整理されている
