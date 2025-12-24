# Level 2: Intermediate

## 概要

ElectronデスクトップアプリケーションのUI実装パターンと設計知識

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: ネイティブUI要素 / ダイアログ / ファイルダイアログ / ウィンドウ設定オプション / サイズ・位置 / 外観設定
- 実務指針: BrowserWindowを作成・設定する時 / ネイティブメニューを実装する時 / カスタムタイトルバーを設計する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/native-ui.md`: ネイティブUI要素（メニュー、ダイアログ、通知）（把握する知識: ネイティブUI要素 / ダイアログ / ファイルダイアログ）
- `resources/window-management.md`: BrowserWindow管理詳細（把握する知識: ウィンドウ設定オプション / サイズ・位置 / 外観設定）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: .claude/skills/electron-ui-patterns/SKILL.md / 目的 / 対象者）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/frameless-window.ts`: フレームレスウィンドウテンプレート

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
