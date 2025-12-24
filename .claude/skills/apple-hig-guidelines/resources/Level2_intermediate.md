# Level 2: Intermediate

## 概要

Apple Human Interface Guidelines（HIG）に基づくUI設計原則を専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: VoiceOver / 基本要素 / Traits一覧 / HIG App Icons 仕様書 / アイコンサイズ一覧 / iOS / iPadOS
- 実務指針: iOSネイティブアプリのUI設計時 / Apple Design Systemに準拠したUIを作成する時 / モバイルファーストのUIを設計する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/accessibility-specs.md`: HIG アクセシビリティ詳細仕様（把握する知識: VoiceOver / 基本要素 / Traits一覧）
- `resources/app-icons-specifications.md`: HIG App Icons 仕様書（把握する知識: HIG App Icons 仕様書 / アイコンサイズ一覧 / iOS / iPadOS）
- `resources/component-states.md`: HIG コンポーネント状態定義（把握する知識: HIG コンポーネント状態定義 / 状態一覧 / 基本状態）
- `resources/design-themes.md`: HIGの3つのテーマと6つの設計原則（把握する知識: HIGの3つのテーマと6つの設計原則 / HIGの基本理念 / 「ヒューマンインターフェース」という名称の意味）
- `resources/interaction-patterns.md`: HIG インタラクションパターン（把握する知識: HIG インタラクションパターン / ジェスチャー / 基本ジェスチャー）
- `resources/launch-screens.md`: HIG Launch Screens 仕様書（把握する知識: HIG Launch Screens 仕様書 / 基本概念 / 目的）
- `resources/layout-grid-system.md`: HIG レイアウト＆グリッドシステム（把握する知識: HIG レイアウト＆グリッドシステム / レイアウト原則 / コンテンツ優先設計）
- `resources/notifications.md`: HIG Notifications 仕様書（把握する知識: HIG Notifications 仕様書 / 通知タイプ一覧 / 表示スタイル）
- `resources/platform-specifics.md`: プラットフォーム別HIG対応（把握する知識: プラットフォーム別HIG対応 / プラットフォーム比較表 / iOS）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: UI/UX ガイドライン）
- `resources/typography-colors.md`: HIGタイポグラフィとカラーシステム（把握する知識: HIGタイポグラフィとカラーシステム / San Franciscoフォントシステム / フォントファミリー）
- `resources/ui-components.md`: HIG UIコンポーネント仕様（把握する知識: HIG UIコンポーネント仕様 / ボタンとタッチターゲット / 最小タッチターゲットサイズ）
- `resources/visual-design-specs.md`: HIG ビジュアルデザイン仕様（把握する知識: HIG ビジュアルデザイン仕様 / 角丸（Corner Radius） / iOS/iPadOS 標準角丸値）
- `resources/widgets-live-activities.md`: HIG Widgets & Live Activities 仕様書（把握する知識: HIG Widgets & Live Activities 仕様書 / ウィジェットファミリー / iOS ウィジェット（ホーム画面））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Apple Human Interface Guidelines / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/check-hig-compliance.mjs`: Apple HIG準拠チェックスクリプト v1.2.0
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/hig-design-checklist.md`: Apple HIG設計チェックリスト v1.2.0

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
