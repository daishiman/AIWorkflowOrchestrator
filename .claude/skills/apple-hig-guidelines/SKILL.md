---
name: apple-hig-guidelines
description: |
  Apple Human Interface Guidelines（HIG）に基づくUI設計原則を専門とするスキル。
  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/apple-hig-guidelines/resources/accessibility-specs.md`: HIG アクセシビリティ詳細仕様
  - `.claude/skills/apple-hig-guidelines/resources/app-icons-specifications.md`: HIG App Icons 仕様書
  - `.claude/skills/apple-hig-guidelines/resources/component-states.md`: HIG コンポーネント状態定義
  - `.claude/skills/apple-hig-guidelines/resources/design-themes.md`: HIGの3つのテーマと6つの設計原則
  - `.claude/skills/apple-hig-guidelines/resources/interaction-patterns.md`: HIG インタラクションパターン
  - `.claude/skills/apple-hig-guidelines/resources/launch-screens.md`: HIG Launch Screens 仕様書
  - `.claude/skills/apple-hig-guidelines/resources/layout-grid-system.md`: HIG レイアウト＆グリッドシステム
  - `.claude/skills/apple-hig-guidelines/resources/notifications.md`: HIG Notifications 仕様書
  - `.claude/skills/apple-hig-guidelines/resources/platform-specifics.md`: プラットフォーム別HIG対応
  - `.claude/skills/apple-hig-guidelines/resources/typography-colors.md`: HIGタイポグラフィとカラーシステム
  - `.claude/skills/apple-hig-guidelines/resources/ui-components.md`: HIG UIコンポーネント仕様
  - `.claude/skills/apple-hig-guidelines/resources/visual-design-specs.md`: HIG ビジュアルデザイン仕様
  - `.claude/skills/apple-hig-guidelines/resources/widgets-live-activities.md`: HIG Widgets & Live Activities 仕様書
  - `.claude/skills/apple-hig-guidelines/templates/hig-design-checklist.md`: Apple HIG設計チェックリスト v1.2.0
  - `.claude/skills/apple-hig-guidelines/scripts/check-hig-compliance.mjs`: Apple HIG準拠チェックスクリプト v1.2.0

  専門分野:
  - 基本理念: Clarity（明瞭性）、Deference（謙譲性）、Depth（深度）
  - 6つの設計原則: Aesthetic Integrity、Consistency、Direct Manipulation、Feedback、Metaphors、User Control
  - UIコンポーネント仕様: ボタン、ナビゲーション、モーダル、タイポグラフィ
  - コンポーネント状態: Default、Hover、Pressed、Focused、Selected、Disabled、Loading、Error
  - ビジュアルデザイン: 角丸（Squircle）、シャドウ、スペーシング（4pt/8ptグリッド）、アニメーション
  - マテリアル＆エフェクト: ブラー（Vibrancy）、半透明、グラデーション
  - レイアウト: グリッドシステム、レスポンシブデザイン、Size Classes
  - インタラクション: ジェスチャー、触覚フィードバック、ローディング、ドラッグ＆ドロップ
  - App Icons: 全プラットフォーム対応サイズ、Squircle仕様、3層構造（visionOS）
  - Launch Screens: 静的スプラッシュ、Launch Storyboard、遷移アニメーション
  - Widgets: systemSmall/Medium/Large/ExtraLarge、Lock Screen、Smart Stack
  - Live Activities: Dynamic Island、Compact/Expanded/Minimal、StandByモード
  - Notifications: バナー、アラート、アクション、グループ化
  - プラットフォーム別最適化: iOS、iPadOS、macOS、watchOS、visionOS
  - アクセシビリティ: VoiceOver、Dynamic Type、Reduce Motion、高コントラスト

  使用タイミング:
  - iOSネイティブアプリのUI設計時
  - Apple Design Systemに準拠したUIを作成する時
  - モバイルファーストのUIを設計する時
  - クロスプラットフォームApple対応が必要な時

  Use proactively when designing iOS/Apple platform UI, implementing HIG-compliant
  components, or ensuring native-quality user experience.
version: 1.2.0
---

# Apple Human Interface Guidelines

## 概要

このスキルは、Apple Human Interface Guidelines（HIG）に基づき、
ネイティブ品質のAppleプラットフォーム向けUIを設計するための知識を提供します。

**核心概念**:
HIGが「ユーザーインターフェース」ではなく「ヒューマンインターフェース」と名付けられた理由は、
「人々はコンピュータを使おうとしているのではなく、仕事を完了しようとしている」という
根本原則に基づいている。

**主要な価値**:

- Appleプラットフォームに最適化されたネイティブ体験の実現
- 6つのプラットフォーム、6,900以上のSFシンボルを活用
- 一貫性のある高品質なUI設計
- アクセシビリティの標準準拠

**対象ユーザー**:

- UI設計を行う@ui-designer
- iOS/macOS向けアプリを開発する開発者
- AIツールでUI生成を行うプロンプトエンジニア

## リソース構造

```
apple-hig-guidelines/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── design-themes.md                        # 3つのテーマと6つの原則
│   ├── ui-components.md                        # コンポーネント仕様
│   ├── component-states.md                     # コンポーネント状態定義（8状態）
│   ├── platform-specifics.md                   # プラットフォーム別対応
│   ├── typography-colors.md                    # タイポグラフィとカラー
│   ├── visual-design-specs.md                  # 角丸、シャドウ、スペーシング、アニメーション
│   ├── layout-grid-system.md                   # レイアウトとグリッドシステム
│   ├── interaction-patterns.md                 # ジェスチャーとインタラクション
│   ├── accessibility-specs.md                  # アクセシビリティ詳細仕様
│   ├── app-icons-specifications.md             # App Icons仕様（全サイズ、Squircle）
│   ├── launch-screens.md                       # Launch Screens仕様
│   ├── widgets-live-activities.md              # Widgets & Live Activities
│   └── notifications.md                        # 通知デザイン仕様
├── scripts/
│   └── check-hig-compliance.mjs                # HIG準拠チェック
└── templates/
    └── hig-design-checklist.md                 # 設計チェックリスト
```

## コマンドリファレンス

### リソース読み取り

```bash
# 3つのテーマと6つの設計原則
cat .claude/skills/apple-hig-guidelines/resources/design-themes.md

# UIコンポーネント仕様
cat .claude/skills/apple-hig-guidelines/resources/ui-components.md

# プラットフォーム別対応
cat .claude/skills/apple-hig-guidelines/resources/platform-specifics.md

# タイポグラフィとカラー
cat .claude/skills/apple-hig-guidelines/resources/typography-colors.md

# ビジュアルデザイン仕様（角丸、シャドウ、スペーシング、アニメーション、マテリアル）
cat .claude/skills/apple-hig-guidelines/resources/visual-design-specs.md

# レイアウトとグリッドシステム
cat .claude/skills/apple-hig-guidelines/resources/layout-grid-system.md

# インタラクションパターン（ジェスチャー、フィードバック、ローディング）
cat .claude/skills/apple-hig-guidelines/resources/interaction-patterns.md

# アクセシビリティ詳細仕様（VoiceOver、Dynamic Type、コントラスト）
cat .claude/skills/apple-hig-guidelines/resources/accessibility-specs.md

# コンポーネント状態定義（Default、Hover、Pressed、Focused等）
cat .claude/skills/apple-hig-guidelines/resources/component-states.md

# App Icons仕様（全サイズ、Squircle、visionOS 3層構造）
cat .claude/skills/apple-hig-guidelines/resources/app-icons-specifications.md

# Launch Screens仕様
cat .claude/skills/apple-hig-guidelines/resources/launch-screens.md

# Widgets & Live Activities（Dynamic Island、Smart Stack）
cat .claude/skills/apple-hig-guidelines/resources/widgets-live-activities.md

# Notifications仕様（バナー、アクション、グループ化）
cat .claude/skills/apple-hig-guidelines/resources/notifications.md
```

### スクリプト実行

```bash
# HIG準拠チェック
node .claude/skills/apple-hig-guidelines/scripts/check-hig-compliance.mjs src/components/
```

## HIGの基本理念

### 「ヒューマンインターフェース」の思想

Apple WWDC 2017で説明されたように、「userという言葉は臨床的で匿名化する効果を持ち、
人々をインターフェースとの関係でのみ狭く定義する。humanはより豊かなニュアンスを想起させる」
という哲学がHIGの根底にある。

### iOS 7以降の3つのテーマ

#### 1. Clarity（明瞭性）

あらゆるサイズで読みやすいテキスト、正確で理解しやすいアイコン、控えめで適切な装飾。

**実践ポイント**:

- 強い視覚的階層でユーザーを重要な要素へ導く
- 曖昧さや混乱を排除する
- テキストは読みやすさを最優先

#### 2. Deference（謙譲性）

UIがユーザーのコンテンツを主役にするために一歩引く姿勢。

**実践ポイント**:

- 流動的なアニメーションと半透明のUI要素
- ボーダーや重いボタン、影は最小限
- コンテンツを輝かせる設計

#### 3. Depth（深度）

視覚的なレイヤーとリアルな動きで階層を伝え、理解を促進。

**実践ポイント**:

- 視差効果やブラー処理の活用
- 要素間の関係性を直感的に把握できる設計
- レイヤーによる情報階層の表現

## 6つの設計原則

### 1. Aesthetic Integrity（美的一貫性）

アプリの外観がその機能といかに統合されているかの尺度。

**適用指針**:

- 生産性アプリ → 装飾を控えめに
- ゲーム → 発見を促す魅力的な外観
- 機能と見た目の調和

### 2. Consistency（一貫性）

ユーザーがあるアプリから別のアプリへ知識を転用できる設計。

**適用指針**:

- システム提供のインターフェース要素を使用
- よく知られたアイコン（設定用の歯車、検索用の虫眼鏡）
- 標準的なテキストスタイルの使用

### 3. Direct Manipulation（直接操作）

画面上のオブジェクトを直接操作することで、タスクにより深く関与。

**適用指針**:

- ピンチでズーム、スワイプで削除
- アクションの結果を即座に理解できる設計
- ジェスチャーによる直感的な操作

### 4. Feedback（フィードバック）

ユーザーのアクションを認識し、処理が進行中であることを保証。

**適用指針**:

- 視覚的なハイライト
- プログレスバー
- アニメーション、色の変化

### 5. Metaphors（メタファー）

実世界や既存のデジタル体験から連想して、より早く学習。

**適用指針**:

- フォルダ、封筒型のメールアイコン、ゴミ箱
- 実世界の操作感をデジタルに反映
- 直感的な理解を促進

### 6. User Control（ユーザーコントロール）

アプリではなく人がコントロールする。

**適用指針**:

- 行動を提案したり危険を警告は可能
- 意思決定を奪わない
- ユーザーの自律性を尊重

## UIコンポーネント仕様

### ボタンとタッチターゲット

**最小タッチターゲット**:
| プラットフォーム | サイズ |
|----------------|-------|
| iOS/iPadOS | 44×44pt |
| visionOS | 60×60pt |

**ボタン設計ルール**:

- タイトルには動詞を使用
- タイトルケースで短く保つ
- プライマリアクション → 青色
- 破壊的アクション → 赤色

### ナビゲーションパターン

**タブバー**:

- iOSのボトムに配置
- 3〜5個のタブを推奨
- 「Home」のような広すぎるラベルは避ける
- 具体的な名詞や動詞を使用
- タブバーとツールバーは同時に表示しない

**ナビゲーションバー**:

- 左: 戻るボタン
- 中央: タイトル
- 右: アクションボタン
- 標準高さ: 44pt（iPadは50pt）
- ラージタイトルスタイル: 96pt

### モーダルとシート

**使用指針**:

- モーダルの使用は最小限に（ユーザーは非線形のインタラクションを好む）
- 完了ボタンとキャンセルボタンを常に含める
- タスクはシンプルかつ焦点を絞る
- iPhoneのシートには中程度の高さのdetentを推奨

### アラートとアクションシート

**アラート**:

- 重要で予期しない情報に使用
- 短いタイトル（1行以内）
- 1〜2個のボタン
- 乱用するとUX低下

**アクションシート**:

- 意図的なアクションに関連する選択肢を提示
- iPhone: 画面下部
- iPad: ポップオーバー
- キャンセルボタンを常に含める
- 破壊的アクションは赤色で上部に配置
- ボタン数は最大4個（キャンセル含む）

## タイポグラフィ仕様

### テキストスタイル（San Francisco）

| スタイル    | サイズ           | 用途               |
| ----------- | ---------------- | ------------------ |
| Large Title | 34pt             | メイン画面タイトル |
| Title 1     | 28pt             | セクションヘッダー |
| Title 2     | 22pt             | サブセクション     |
| Title 3     | 20pt             | 三次ヘッダー       |
| Headline    | 17pt（Semibold） | 強調本文           |
| Body        | 17pt             | メインコンテンツ   |
| Footnote    | 13pt             | 注釈               |
| Caption 2   | 11pt             | **最小ラベル**     |

### フォントファミリー

- **SF Pro Display**: 20pt以上のテキスト
- **SF Pro Text**: 19pt以下の本文
- **Dynamic Type**: 12〜17段階のスケーリング対応

## カラーシステム

### システムカラー（ライトモード）

| カラー        | Hex     | 用途                 |
| ------------- | ------- | -------------------- |
| System Blue   | #007AFF | プライマリアクション |
| System Red    | #FF3B30 | 破壊的アクション     |
| System Green  | #4CD964 | 成功、確認           |
| System Orange | #FF9500 | 警告                 |

### セマンティックカラー

`.label`、`.secondaryLabel`、`.systemBackground`などは
ライト/ダークモード間で自動的に適応。

**カラーコントラスト要件**:

- 通常テキスト: 4.5:1以上
- 大きいテキスト（18pt以上）: 3:1以上
- カスタムカラー推奨: 7:1

## アクセシビリティ

### VoiceOverサポート

- すべてのUI要素はVoiceOverでナビゲート可能
- `.accessibilityLabel`で説明的な名前を提供
- `.accessibilityHint`でアクションの追加コンテキスト
- 「ボタン」という語は避ける（VoiceOverが自動追加）

### Dynamic Type対応

- 12段階すべてのDynamic Typeサイズをサポート
- 5段階のアクセシビリティサイズをサポート
- テキストは最低200%までスケーリング可能
- 極端なサイズでレイアウトをテスト

### Reduce Motion対応

`accessibilityReduceMotion`が有効な場合:

- アニメーションはディゾルブやフェードに置き換え
- 回転、スケーリング、全画面モーションを排除
- モーションのみに依存して情報を伝達しない

## プラットフォーム別対応

### iOS

- モバイルファースト
- タブバーナビゲーション
- Face ID/Touch ID対応
- 最小タップターゲット: 44×44pt

### iPadOS

- Split View/Slide Over
- ポインター対応
- サイドバーナビゲーション推奨
- iPadOS 26: macOSライクな信号機ボタン

### macOS

- メニューバー
- キーボードショートカット
- ウィンドウ管理

### watchOS

- 一目で把握できる情報設計
- Digital Crown
- コンプリケーション
- 最小タップターゲット: 44pt

### visionOS

- 空間コンピューティング
- 視線追跡、ハンドジェスチャー
- **最小タップターゲット: 60×60pt**
- 水平方向のレイアウトを優先（上下より左右を見る方が楽）

## AIツールでのプロンプト活用

### 効果的なプロンプト構造

```markdown
# [アプリ名] – [画面名] (iOS UI Design)

Apple Human Interface Guidelinesに準拠したiOS画面をデザイン。

## 仕様

- **フォント**: San Francisco Pro
- **ナビゲーションバー**: ラージタイトルスタイル
- **カード**: 角丸12pt、微妙なシャドウ
- **タブバー**: 5アイコン（44ptタッチターゲット）
- **ライト/ダークモード**: 対応
- **余白**: 16ptマージン
- **視覚階層**: コンテンツを主役に
```

### プロンプトのベストプラクティス

**コンテキストの明示**:

- 「iOS style」「Apple Human Interface Guidelinesに準拠」と指定
- 関連するHIGセクションをプロンプトに含める
- 具体的なAppleアプリを参照例として提示

**HIG固有パラメータ**:

- San Franciscoフォントファミリー
- 44pt最小タッチターゲット
- iOSコンポーネント名（Navigation Bar、Tab Bar等）
- システムカラーの期待値

**反復的改善**:

- 初期コンセプトを生成後、HIG固有のフィードバックを提供
- 「よりiOSネイティブデザインに近づける」などの改良を依頼

## Material Designとの比較

| 観点               | Apple HIG                      | Material Design                  |
| ------------------ | ------------------------------ | -------------------------------- |
| **哲学**           | コンテンツが主役、UIは控えめに | マテリアルとしてのメタファー     |
| **視覚スタイル**   | ミニマリスト、微妙な深度       | 大胆、鮮やか、影による明確な深度 |
| **ナビゲーション** | タブバー（下部）、フラット階層 | ハンバーガーメニュー、ドロワー   |
| **カラー**         | 抑制的、コンテンツ中心         | 鮮やか、多様なパレット           |
| **モーション**     | 微妙、目的主導                 | 大胆、意味のあるアニメーション   |

**選択基準**:

- iOS専用アプリでネイティブ体験重視 → HIG
- クロスプラットフォーム（Android + Web）→ Material Design

## ワークフロー

### Phase 1: 要件とプラットフォーム確認

**目的**: 対象プラットフォームとHIG要件を把握

**ステップ**:

1. 対象プラットフォームの特定（iOS/iPadOS/macOS/watchOS/visionOS）
2. プラットフォーム固有の仕様確認
3. 必要なHIGセクションの特定

**判断基準**:

- [ ] 対象プラットフォームが明確か？
- [ ] プラットフォーム固有の制約を理解しているか？
- [ ] 必要なコンポーネント種別を把握しているか？

### Phase 2: コンポーネント設計

**目的**: HIG準拠のコンポーネント設計

**ステップ**:

1. 3つのテーマ（Clarity、Deference、Depth）の適用
2. 6つの原則に基づく設計判断
3. タッチターゲットサイズの確認（44pt/60pt）
4. ナビゲーションパターンの選択

**判断基準**:

- [ ] タッチターゲットは最小サイズを満たすか？
- [ ] ナビゲーションパターンは適切か？
- [ ] 視覚的階層は明確か？

### Phase 3: タイポグラフィとカラー

**目的**: 一貫したビジュアルシステムの構築

**ステップ**:

1. San Franciscoフォントシステムの適用
2. システムカラーの選択
3. ダークモード対応
4. カラーコントラストの検証

**判断基準**:

- [ ] テキストスタイルは適切か？
- [ ] カラーコントラストは4.5:1以上か？
- [ ] ダークモード対応が考慮されているか？

### Phase 4: アクセシビリティ

**目的**: 全ユーザーが使用可能な設計

**ステップ**:

1. VoiceOverラベルの追加
2. Dynamic Type対応
3. Reduce Motion対応
4. アクセシビリティテスト

**判断基準**:

- [ ] VoiceOverで完全にナビゲート可能か？
- [ ] Dynamic Typeの全サイズで動作するか？
- [ ] Reduce Motion時も機能するか？

## ベストプラクティス

### すべきこと

1. **システムコンポーネントを優先**:
   - 標準UIKitコンポーネントを使用
   - カスタマイズは必要最小限に

2. **プラットフォーム慣習の尊重**:
   - iOS → タブバー（下部）
   - macOS → メニューバー

3. **公式リソースの活用**:
   - Apple Design Resources
   - SF Symbols（6,900以上）

### 避けるべきこと

1. **Material Designとの混在**:
   - ❌ iOSアプリにハンバーガーメニュー
   - ✅ タブバーナビゲーション

2. **プラットフォーム無視**:
   - ❌ visionOSで44ptタッチターゲット
   - ✅ visionOSは60pt以上

3. **アクセシビリティの軽視**:
   - ❌ VoiceOverラベルなし
   - ✅ 全要素にアクセシビリティ対応

## トラブルシューティング

### 問題1: タッチターゲットが小さすぎる

**症状**: タップしにくい、誤操作が多い

**解決策**:

1. 最小44×44pt（visionOSは60×60pt）を確保
2. 視覚的サイズが小さくてもタッチ領域を拡大
3. 要素間の適切な間隔を確保

### 問題2: ダークモードで視認性が低い

**症状**: テキストや要素が見えにくい

**解決策**:

1. セマンティックカラーを使用
2. ハードコードされた色を避ける
3. 両モードでコントラストを検証

### 問題3: VoiceOverで操作できない

**症状**: スクリーンリーダーユーザーが使用できない

**解決策**:

1. すべての要素にaccessibilityLabelを追加
2. カスタムコントロールにはaccessibilityTraitsを設定
3. 論理的なフォーカス順序を確保

## 関連スキル

- **accessibility-wcag** (`.claude/skills/accessibility-wcag/SKILL.md`): WCAG準拠
- **design-system-architecture** (`.claude/skills/design-system-architecture/SKILL.md`): デザインシステム
- **headless-ui-principles** (`.claude/skills/headless-ui-principles/SKILL.md`): Headless UI

## メトリクス

### HIG準拠スコア

**評価基準**:

- 3つのテーマ適用度: 0-30点
- 6つの原則準拠度: 0-30点
- コンポーネント仕様準拠: 0-20点
- アクセシビリティ対応: 0-20点

**目標**: 80点以上

## 公式リソース

### Apple Design Resources

- URL: https://developer.apple.com/design/resources/
- 内容: Figma/Sketchテンプレート、iOS 26、macOS、visionOS、watchOS向け

### SF Symbols

- URL: https://developer.apple.com/sf-symbols/
- 内容: 6,900以上のシンボル

### San Franciscoフォント

- URL: https://developer.apple.com/fonts/
- 内容: SF Pro Display、SF Pro Text

### 日本語版HIG

- URL: https://developer.apple.com/jp/design/human-interface-guidelines/
- リリース: 2025年11月

## 変更履歴

| バージョン | 日付       | 変更内容                                                                                             |
| ---------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| 1.2.0      | 2025-11-25 | 追加リソース - App Icons、Launch Screens、Component States、Widgets & Live Activities、Notifications |
| 1.1.0      | 2025-11-25 | 追加リソース - ビジュアルデザイン仕様、レイアウト＆グリッド、インタラクション、アクセシビリティ詳細  |
| 1.0.0      | 2025-11-25 | 初版作成 - Apple HIG原則の体系化                                                                     |

## 参考文献

- **Apple Human Interface Guidelines** (Apple公式)
  - https://developer.apple.com/design/human-interface-guidelines/
- **WWDC 2017**: HIG設計哲学の解説
- **「UIデザインの教科書」**: 人間の認知特性に基づくUIデザイン
- **「オブジェクト指向UIデザイン」**: ソシオメディア
- **「融けるデザイン」**: 渡邊恵太著、HIG概念と整合
