# レベル2: 実務

## 概要

設計パターンと合成方針の決定を扱う。

references/ と assets/ を活用する運用を前提とする。

## 前提条件

- レベル1の成果物が揃っている
- 抽出対象が明確になっている

## 詳細ガイド

### 必要な知識・情報

- 主要トピック: API設計、合成、状態管理パターン
- 参照必須: `references/design-patterns.md`

### 判断基準と検証観点

- 回避事項: 返却値が肥大化する設計

### リソース運用

- `references/composition-patterns.md`: 合成パターン
- `references/extraction-criteria.md`: 抽出基準の再確認

### テンプレート運用

- `assets/hook-api-contract-template.md`: API設計
- `assets/basic-hooks-template.md`: 基本実装

### 成果物要件

- API設計が明文化されている
- 合成方針が整理されている

## 実践手順

1. 設計パターンを選定する
2. 合成方針を整理する
3. API設計テンプレートに記入する

## チェックリスト

- [ ] API設計が記載されている
- [ ] 合成方針が明記されている
- [ ] 依存関係が整理されている
