# Level 2: Intermediate

## 概要

Reactアプリケーションのパフォーマンス最適化を専門とするスキル。 ダン・アブラモフの思想に基づき、測定駆動の最適化アプローチを提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Context 分割戦略 / Context分割の必要性 / Context分割の判断基準 / React DevTools Profiler 測定方法 / インストールと設定 / ブラウザ拡張機能のインストール
- 実務指針: 不要な再レンダリングを検出・防止する時 / React.memoやメモ化の適用を判断する時 / React DevTools Profilerで測定する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/context-splitting.md`: Context分割戦略（把握する知識: Context 分割戦略 / Context分割の必要性 / Context分割の判断基準）
- `resources/profiler-measurement.md`: React DevTools Profiler測定方法（把握する知識: React DevTools Profiler 測定方法 / インストールと設定 / ブラウザ拡張機能のインストール）
- `resources/re-rendering-patterns.md`: 再レンダリングパターン（把握する知識: 再レンダリングパターン / 再レンダリングの4つの原因 / 1. 状態の更新）
- `resources/react-memo-guide.md`: React.memo活用ガイド（把握する知識: React.memo 活用ガイド / React.memoとは / 基本的な使い方）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Performance Optimization React / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/optimization-checklist.md`: 最適化チェックリスト

### 成果物要件
- テンプレートの構成・必須項目を反映する

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. テンプレートを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] テンプレートで成果物の形式を揃えた
