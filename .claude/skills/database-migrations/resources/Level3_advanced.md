# Level 3: Advanced

## 概要

スコット・アンブラーの『Refactoring Databases』に基づく、安全で可逆的なデータベースマイグレーション管理スキル。 Drizzle Kitを使用したスキーマ変更の計画、マイグレーション生成、本番適用、 ロールバック戦略、および移行期間（Transition Period）を含む包括的なワークフローを提供します。

Progressive Disclosure 設計とトークン最適化の実践方法を整理します。

## 前提条件

- Level 2 の運用を完了している
- リソース/スクリプト/テンプレートの位置を把握している

## 詳細ガイド

### Progressive Disclosure 設計
- まず Level1/Level2 で要点だけを確認し、必要に応じて詳細リソースへ拡張する
- 説明量が過剰な場合は要約を作り、必要な箇所のみを参照する

### トークン最適化
- 目的に直結しない情報は後回しにし、必須項目を優先して読み込む
- 参照回数が多い資料は要点メモを作って再利用する

### 高度知識の扱い
- `resources/schema-change-patterns.md`: schema-change-patterns のパターン集（把握する知識: スキーマ変更パターン (SQLite) / カラム操作 / カラム追加）
- `resources/transition-period-patterns.md`: transition-period-patterns のパターン集（把握する知識: 移行期間パターン (SQLite) / 移行期間の原則 / 1. 新旧共存期間）
- `resources/zero-downtime-patterns.md`: zero-downtime-patterns のパターン集（把握する知識: ゼロダウンタイムマイグレーションパターン / 基本原則 / 後方互換性の維持）

### 判断基準
- 詳細な判断が必要なときのみ高度リソースを読み込む
- 検証が必要な場合は参照系スクリプトを優先する

### スクリプト分類
- 参照系: `scripts/check-migration-safety.mjs`, `scripts/validate-skill.mjs`
- 更新系: `scripts/generate-rollback.mjs`
- その他: `scripts/log_usage.mjs`
- テンプレートは出力一貫性の維持に活用する

## 実践手順

1. 必要最低限の情報に絞って参照範囲を決める
2. 不足が見えたら高度リソースを追加で読み込む
3. 参照系スクリプトで検証し、必要なら更新系スクリプトを実行する
4. テンプレートで表現の差異を最小化する
5. 情報量が多い場合は要約を作成して再利用する

## チェックリスト

- [ ] 参照範囲を段階的に広げる設計ができた
- [ ] スクリプトの種類に応じて実行順を調整した
- [ ] テンプレートで成果物の一貫性を保った
- [ ] トークン消費を抑えるため要約や分割を行った
