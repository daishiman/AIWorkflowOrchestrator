# レベル2: 実務

## 概要

スキーマ変更と移行期間の設計を扱う。

references/ と assets/ を活用する運用を前提とする。

## 前提条件

- レベル1の成果物が揃っている
- 変更対象が明確になっている

## 詳細ガイド

### 必要な知識・情報

- 主要トピック: 移行戦略、ロールバック設計
- 参照必須: `references/migration-strategies.md`

### 判断基準と検証観点

- 回避事項: 互換性を無視した変更

### リソース運用

- `references/transition-period-patterns.md`: 移行期間パターン
- `references/zero-downtime-patterns.md`: 無停止移行

### スクリプト運用

- `scripts/check-migration-safety.mjs`: 安全性確認
- `scripts/validate-skill.mjs`: 構造検証

### テンプレート運用

- `assets/migration-plan-template.md`: 計画テンプレート
- `assets/rollback-plan-template.md`: ロールバック計画

### 成果物要件

- 変更手順と移行期間が明記されている

## 実践手順

1. 移行戦略を選定する
2. 移行期間を設計する
3. ロールバック方針を整理する

## チェックリスト

- [ ] 移行期間が設計されている
- [ ] ロールバック方針が明記されている
- [ ] 安全性チェックが実施されている
