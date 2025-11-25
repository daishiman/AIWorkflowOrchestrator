# HIG Launch Screens 仕様書

## 基本概念

### 目的

Launch Screenは**アプリの瞬間的な起動を演出**するための静的画面。
実際のUI読み込み時間を隠しながら、ユーザーにシームレスな体験を提供。

### 原則

```
✅ アプリのファーストビューに類似
✅ 静的で軽量
✅ ブランド要素は最小限
✅ ローカライズ不要なデザイン

❌ 広告やマーケティング
❌ 複雑なアニメーション
❌ テキスト情報
❌ 長時間の表示
```

---

## プラットフォーム別仕様

### iOS / iPadOS

#### Launch Storyboard（推奨）

```xml
<!-- LaunchScreen.storyboard -->
<storyboard>
  <view>
    <!-- 背景色 -->
    <color key="backgroundColor" systemColor="systemBackgroundColor"/>

    <!-- 中央ロゴ（オプション） -->
    <imageView
      contentMode="scaleAspectFit"
      image="logo"
      translatesAutoresizingMaskIntoConstraints="NO">
      <constraints>
        <constraint firstAttribute="centerX" secondAttribute="centerX"/>
        <constraint firstAttribute="centerY" secondAttribute="centerY"/>
        <constraint firstAttribute="width" constant="120"/>
        <constraint firstAttribute="height" constant="120"/>
      </constraints>
    </imageView>
  </view>
</storyboard>
```

#### Auto Layout要件

```
必須:
├── Center X / Center Y アンカー
├── Safe Area対応
├── Size Class対応（Compact/Regular）
└── 全デバイスサイズ対応

制約例:
├── ロゴ: centerX, centerY, width ≤ 200pt
├── 背景: 全画面（Safe Area考慮）
└── 余白: ≥ 16pt（端から）
```

#### 背景色指定

```swift
// System Colors（ダークモード自動対応）
UIColor.systemBackground       // 白/黒
UIColor.secondarySystemBackground
UIColor.tertiarySystemBackground

// カスタムカラー（両モード定義必須）
Assets.xcassets/
└── LaunchBackground.colorset/
    ├── Contents.json
    └── "appearances": [
          { "dark": "#1C1C1E" },
          { "light": "#FFFFFF" }
        ]
```

### macOS

```
Launch Screen不要
├── アプリは即座にメインウィンドウ表示
├── 起動時のプレースホルダーはシステム提供
└── Dock アイコンバウンスが進捗表示
```

### watchOS

```
Launch画面は自動生成
├── App Iconをそのまま使用
├── カスタマイズ不可
└── 短い表示時間
```

### tvOS

```
Top Shelf画像使用
├── 1920×1080 静的画像
├── フォーカスアニメーションなし
├── ブランドカラー中心
└── テキスト禁止
```

### visionOS

```
Ornament Splash
├── 3D空間での表示
├── 立体的なロゴ配置
├── 環境への適応
└── 深度情報対応
```

---

## デザインパターン

### パターン1: ミニマル（推奨）

```
┌────────────────────────────────────┐
│                                    │
│                                    │
│                                    │
│             [ロゴ]                 │
│            (中央配置)              │
│                                    │
│                                    │
│                                    │
└────────────────────────────────────┘

背景: システム背景色
ロゴ: アプリアイコンまたはワードマーク
サイズ: 80-120pt
```

### パターン2: ブランドカラー

```
┌────────────────────────────────────┐
│████████████████████████████████████│
│████████████████████████████████████│
│████████████████████████████████████│
│███████████  [白ロゴ]  █████████████│
│████████████████████████████████████│
│████████████████████████████████████│
│████████████████████████████████████│
└────────────────────────────────────┘

背景: ブランドプライマリカラー
ロゴ: 白またはコントラスト色
注意: ダークモード考慮
```

### パターン3: スケルトンUI（高度）

```
┌────────────────────────────────────┐
│  ████████████████  │ ■ ■ ■        │
├────────────────────┴──────────────│
│                                    │
│  ┌──────┐  ████████████████       │
│  │      │  ████████████           │
│  └──────┘                          │
│                                    │
│  ┌──────┐  ████████████████       │
│  │      │  ████████████           │
│  └──────┘                          │
│                                    │
└────────────────────────────────────┘

構成: 実際のUIレイアウトを模倣
色: プレースホルダーグレー
目的: 最速のUI遷移感
```

---

## 実装詳細

### Info.plist 設定

```xml
<key>UILaunchStoryboardName</key>
<string>LaunchScreen</string>

<!-- または静的画像の場合（非推奨） -->
<key>UILaunchImages</key>
<array>
  <dict>
    <key>UILaunchImageMinimumOSVersion</key>
    <string>12.0</string>
    <key>UILaunchImageName</key>
    <string>LaunchImage</string>
    <key>UILaunchImageOrientation</key>
    <string>Portrait</string>
    <key>UILaunchImageSize</key>
    <string>{375, 812}</string>
  </dict>
</array>
```

### サイズ別対応（静的画像の場合）

| デバイス | Portrait | Landscape |
|---------|----------|-----------|
| **iPhone 15 Pro Max** | 1290×2796 | 2796×1290 |
| **iPhone 15 Pro** | 1179×2556 | 2556×1179 |
| **iPhone 15** | 1179×2556 | 2556×1179 |
| **iPhone SE** | 750×1334 | 1334×750 |
| **iPad Pro 12.9"** | 2048×2732 | 2732×2048 |
| **iPad Pro 11"** | 1668×2388 | 2388×1668 |
| **iPad Air** | 1640×2360 | 2360×1640 |
| **iPad** | 1620×2160 | 2160×1620 |
| **iPad mini** | 1488×2266 | 2266×1488 |

### SwiftUI での Launch Screen

```swift
// iOS 14+
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

// Info.plist で UILaunchScreen 辞書を使用
```

```xml
<!-- Info.plist -->
<key>UILaunchScreen</key>
<dict>
    <key>UIColorName</key>
    <string>LaunchBackgroundColor</string>
    <key>UIImageName</key>
    <string>LaunchLogo</string>
    <key>UIImageRespectsSafeAreaInsets</key>
    <true/>
</dict>
```

---

## アニメーション遷移

### 標準遷移

```
Launch Screen
    ↓ (システム管理)
    ↓ フェードアウト
    ↓ (約0.3秒)
メインUI表示
```

### カスタム遷移（オプション）

```swift
// AppDelegate
func application(_ application: UIApplication,
                 didFinishLaunchingWithOptions...) -> Bool {

    // Launch Screenを延長表示
    Thread.sleep(forTimeInterval: 0.5) // 非推奨だが可能

    // またはカスタムスプラッシュビューでアニメーション
    let splashVC = SplashViewController()
    window?.rootViewController = splashVC

    // 遷移アニメーション
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
        UIView.transition(with: self.window!,
                          duration: 0.5,
                          options: .transitionCrossDissolve) {
            self.window?.rootViewController = MainViewController()
        }
    }

    return true
}
```

### 推奨遷移パターン

| パターン | Duration | 用途 |
|---------|----------|------|
| **即時** | 0秒 | 標準アプリ |
| **フェード** | 0.3秒 | スムーズ遷移 |
| **スケール** | 0.4秒 | ブランド強調 |
| **マッチング** | 0.5秒 | スケルトンUI |

---

## ダークモード対応

### 色定義

```swift
// Assets.xcassets でカラーセット定義
{
  "colors": [
    {
      "color": {
        "color-space": "srgb",
        "components": { "red": 1, "green": 1, "blue": 1, "alpha": 1 }
      },
      "idiom": "universal"
    },
    {
      "appearances": [{ "appearance": "luminosity", "value": "dark" }],
      "color": {
        "color-space": "srgb",
        "components": { "red": 0.11, "green": 0.11, "blue": 0.12, "alpha": 1 }
      },
      "idiom": "universal"
    }
  ]
}
```

### 画像対応

```
Assets.xcassets/
└── LaunchLogo.imageset/
    ├── Contents.json
    ├── logo-light.png
    ├── logo-light@2x.png
    ├── logo-light@3x.png
    ├── logo-dark.png
    ├── logo-dark@2x.png
    └── logo-dark@3x.png
```

---

## パフォーマンス最適化

### 軽量化要件

```
画像サイズ: ≤ 500KB（圧縮後）
色数: ≤ 256色（可能なら）
フォーマット: PNG（透明なし）、JPEG（写真）
解像度: デバイス解像度に最適化
```

### キャッシュ動作

```
Launch Screenはシステムキャッシュ
├── アプリ更新時に再キャッシュ
├── 動的変更不可
├── ローカライズ非推奨
└── 一度読み込み後は高速表示
```

### 起動時間目標

| カテゴリ | 目標時間 |
|---------|---------|
| **Cold Start** | ≤ 400ms |
| **Warm Start** | ≤ 200ms |
| **Hot Start** | ≤ 100ms |
| **Launch Screen表示** | ≤ 1秒 |

---

## アクセシビリティ

### コントラスト要件

```
背景と前景のコントラスト比: ≥ 3:1
ロゴの視認性: 全ユーザーに明確
テキスト: 使用しない（アクセシブルでないため）
```

### Reduce Motion

```
Launch Screenは静的なため影響なし
遷移アニメーションはシステム管理
カスタムアニメーションは設定尊重:

if UIAccessibility.isReduceMotionEnabled {
    // 即時遷移
} else {
    // アニメーション遷移
}
```

---

## チェックリスト

### デザイン
- [ ] アプリのファーストビューに類似
- [ ] ブランドカラー一貫性
- [ ] ダークモード対応
- [ ] 全デバイスサイズ確認
- [ ] テキスト未使用

### 技術
- [ ] Launch Storyboard作成
- [ ] Auto Layout制約設定
- [ ] Safe Area対応
- [ ] Size Class対応
- [ ] Info.plist設定

### パフォーマンス
- [ ] 画像最適化（≤500KB）
- [ ] 起動時間測定
- [ ] メモリ使用量確認
- [ ] キャッシュ動作確認

### アクセシビリティ
- [ ] コントラスト比確認
- [ ] VoiceOver非干渉
- [ ] Reduce Motion対応
- [ ] Dynamic Type非依存

---

## 禁止事項

```
❌ 広告・プロモーション
❌ 進捗インジケーター（偽装）
❌ バージョン番号表示
❌ 法的テキスト
❌ ログインフォーム
❌ 外部リソース読み込み
❌ ネットワーク通信
❌ 複雑なアニメーション
❌ ビデオ再生
❌ サウンド再生
```

---

## 参考文献

- Apple Human Interface Guidelines - Launch Screens
- App Programming Guide for iOS - App Launch Sequence
- WWDC 2020: Build for the iPadOS pointer
- WWDC 2019: Optimizing App Launch
