# HIG Widgets & Live Activities 仕様書

## Widgets 概要

### ウィジェットファミリー

| ファミリー               | サイズ     | プラットフォーム         |
| ------------------------ | ---------- | ------------------------ |
| **systemSmall**          | 小         | iOS, iPadOS, macOS       |
| **systemMedium**         | 中         | iOS, iPadOS, macOS       |
| **systemLarge**          | 大         | iOS, iPadOS, macOS       |
| **systemExtraLarge**     | 特大       | iPadOS, macOS            |
| **accessoryCircular**    | 円形       | watchOS, iOS Lock Screen |
| **accessoryRectangular** | 長方形     | watchOS, iOS Lock Screen |
| **accessoryInline**      | インライン | watchOS, iOS Lock Screen |
| **accessoryCorner**      | コーナー   | watchOS                  |

---

## ウィジェットサイズ詳細

### iOS ウィジェット（ホーム画面）

| デバイス              | Small   | Medium  | Large   |
| --------------------- | ------- | ------- | ------- |
| **iPhone 15 Pro Max** | 170×170 | 364×170 | 364×382 |
| **iPhone 15 Pro**     | 158×158 | 338×158 | 338×354 |
| **iPhone 15/15 Plus** | 158×158 | 338×158 | 338×354 |
| **iPhone SE**         | 141×141 | 292×141 | 292×311 |

### iPadOS ウィジェット

| デバイス           | Small   | Medium  | Large   | Extra Large |
| ------------------ | ------- | ------- | ------- | ----------- |
| **iPad Pro 12.9"** | 170×170 | 379×170 | 379×379 | 795×379     |
| **iPad Pro 11"**   | 155×155 | 342×155 | 342×342 | 715×342     |
| **iPad Air**       | 155×155 | 342×155 | 342×342 | 715×342     |
| **iPad**           | 141×141 | 305×141 | 305×305 | 634×305     |

### ロック画面ウィジェット（iOS 16+）

| タイプ          | サイズ     | 位置       |
| --------------- | ---------- | ---------- |
| **Circular**    | 76×76 pt   | 時計の上下 |
| **Rectangular** | 172×76 pt  | 時計の下   |
| **Inline**      | 全幅×20 pt | 時計の上   |

### Apple Watch コンプリケーション

| ファミリー      | サイズ (pt) | 用途             |
| --------------- | ----------- | ---------------- |
| **Circular**    | 47×47       | ウォッチフェイス |
| **Rectangular** | 174×76      | ウォッチフェイス |
| **Inline**      | 全幅×16     | テキスト表示     |
| **Corner**      | 40×40       | コーナー位置     |

---

## ウィジェットデザインガイドライン

### レイアウト原則

```
┌────────────────────────────────────┐
│  P                                P│  P = パディング (16pt)
│    ┌────────────────────────────┐  │
│    │                            │  │
│    │      コンテンツエリア       │  │
│    │                            │  │
│    │  - 明確な情報階層          │  │
│    │  - 一目で理解可能          │  │
│    │  - タップ可能領域明示      │  │
│    │                            │  │
│    └────────────────────────────┘  │
│  P                                P│
└────────────────────────────────────┘
```

### パディング値

| サイズ      | パディング |
| ----------- | ---------- |
| Small       | 16pt       |
| Medium      | 16pt       |
| Large       | 16pt       |
| Extra Large | 20pt       |

### タイポグラフィ

```
Small Widget:
├── タイトル: SF Pro Text 13pt Semibold
├── 値: SF Pro Display 34pt Light
└── サブテキスト: SF Pro Text 11pt Regular

Medium Widget:
├── タイトル: SF Pro Text 15pt Semibold
├── 値: SF Pro Display 40pt Light
└── サブテキスト: SF Pro Text 13pt Regular

Large Widget:
├── タイトル: SF Pro Text 17pt Semibold
├── 値: SF Pro Display 48pt Light
└── サブテキスト: SF Pro Text 15pt Regular
```

### 背景スタイル

```css
/* システム背景（推奨） */
.widget-background {
  background: var(--widget-background);
  /* iOS が自動でコンテキスト適応 */
}

/* カスタムカラー */
.widget-background-custom {
  background: linear-gradient(
    to bottom,
    var(--brand-primary),
    var(--brand-secondary)
  );
}

/* ブラー背景 */
.widget-background-blur {
  background: var(--widget-background-blur);
  backdrop-filter: blur(20px);
}
```

---

## ウィジェットインタラクション

### タップターゲット

```
Small Widget:
└── 全体が1つのタップターゲット
    └── widgetURL() でディープリンク

Medium Widget:
├── 最大4つのタップ領域
├── 各領域: 最小 44×44pt
└── Link() でそれぞれにURL設定

Large Widget:
├── 最大8つのタップ領域
├── リスト形式可
└── 各行にdeepLink設定可能
```

### インタラクティブウィジェット（iOS 17+）

```swift
// ボタンアクション
Button(intent: ToggleIntent()) {
    Label("Toggle", systemImage: "toggle")
}
.buttonStyle(.plain)

// トグル
Toggle(isOn: $isEnabled, intent: ToggleIntent()) {
    Text("Enable")
}
```

### タップ可能領域の視覚表示

```css
/* タップ領域ホバー */
.widget-tap-area {
  border-radius: 12pt;
  transition: background 100ms;
}

.widget-tap-area:active {
  background: rgba(0, 0, 0, 0.1);
}
```

---

## Live Activities

### Dynamic Island 仕様

#### サイズ

| 状態                 | サイズ           | 用途           |
| -------------------- | ---------------- | -------------- |
| **Compact Leading**  | 52×36.67 pt      | 左側コンパクト |
| **Compact Trailing** | 52×36.67 pt      | 右側コンパクト |
| **Minimal**          | 36.67×36.67 pt   | 最小表示       |
| **Expanded**         | 371×160 pt (max) | 長押し展開時   |

#### Compact レイアウト

```
┌─────────────────────────────────────────────┐
│                                             │
│  [Leading]  ████████████████  [Trailing]    │
│   52×37pt       Cutout          52×37pt     │
│                                             │
└─────────────────────────────────────────────┘
```

#### Expanded レイアウト

```
┌─────────────────────────────────────────────┐
│                                             │
│     [Leading]  ████████  [Trailing]         │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │                                       │  │
│  │           Bottom Content              │  │
│  │           (フル幅)                    │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### ロック画面 Live Activity

```
┌────────────────────────────────────────────┐
│                                            │
│  [App Icon]  タイトル                       │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │                                      │  │
│  │         コンテンツ領域               │  │
│  │         (最大高さ: 160pt)            │  │
│  │                                      │  │
│  └──────────────────────────────────────┘  │
│                                            │
└────────────────────────────────────────────┘
```

---

## Live Activity デザインガイドライン

### コンテンツ原則

```
✅ リアルタイム性の高い情報
✅ 一目で理解可能
✅ 進捗/状態の明確な表示
✅ 最小限のテキスト

❌ 広告・プロモーション
❌ 複雑なインタラクション
❌ 過度な更新頻度
❌ 長文テキスト
```

### 更新頻度

| タイプ             | 推奨頻度     | 最大頻度 |
| ------------------ | ------------ | -------- |
| **Push更新**       | イベント駆動 | 制限なし |
| **定期更新**       | 15分以上     | 1分      |
| **バッテリー考慮** | 30分以上     | -        |

### アニメーション

```swift
// コンテンツ遷移
.contentTransition(.numericText())
.contentTransition(.interpolate)

// タイマー
Text(timerInterval: startDate...endDate, countsDown: true)
    .monospacedDigit()
```

---

## StandBy モード（iOS 17+）

### サイズ

| 状態         | サイズ                 |
| ------------ | ---------------------- |
| **フル表示** | 画面サイズ依存         |
| **縮小時**   | ウィジェットサイズ準拠 |

### デザイン要件

```
特徴:
├── 高コントラスト（暗い環境向け）
├── 大きなフォントサイズ
├── 最小限の情報量
└── 常時表示対応（OLED焼き付き防止）

色:
├── 背景: 黒または暗色
├── テキスト: 白または明るい色
└── アクセント: 控えめな使用
```

---

## Smart Stack

### 優先度設定

```swift
// 関連性スコア
struct MyWidgetEntry: TimelineEntry {
    let date: Date
    let relevance: TimelineEntryRelevance?
}

// 高優先度
TimelineEntryRelevance(score: 0.9) // 0.0 - 1.0

// 時間ベース
TimelineEntryRelevance(score: 0.8, duration: 3600) // 1時間
```

### 表示条件

```
自動表示トリガー:
├── 時間帯（朝の天気、夜の睡眠）
├── 場所（自宅、職場）
├── アプリ使用パターン
├── カレンダーイベント
└── Siri提案
```

---

## ウィジェット実装パターン

### 情報表示ウィジェット

```
┌─────────────────────┐
│  📊 売上             │
│                     │
│     ¥1,234,567      │
│                     │
│  前日比 +12.3%      │
└─────────────────────┘

構成:
├── アイコン + ラベル（上部）
├── メイン値（中央、大きく）
└── コンテキスト（下部、小さく）
```

### 進捗ウィジェット

```
┌─────────────────────┐
│  🎯 目標達成         │
│                     │
│  ████████░░░  80%   │
│                     │
│  あと2,000歩        │
└─────────────────────┘

構成:
├── タイトル（上部）
├── プログレスバー（中央）
└── 残り/詳細（下部）
```

### リストウィジェット

```
┌─────────────────────┐
│  📋 タスク      3/5  │
├─────────────────────┤
│  ☑ 買い物           │
│  ☐ 会議資料作成      │
│  ☐ メール返信       │
└─────────────────────┘

構成:
├── ヘッダー（タイトル + カウント）
├── 区切り線
└── リスト項目（最大3-4項目）
```

### カウントダウンウィジェット

```
┌─────────────────────┐
│  ✈️ フライト         │
│                     │
│     02:34:56        │
│                     │
│  搭乗開始まで        │
└─────────────────────┘

構成:
├── イベント名（上部）
├── タイマー（中央、等幅フォント）
└── 説明（下部）
```

---

## アクセシビリティ

### VoiceOver

```swift
.accessibilityLabel("売上ウィジェット、123万4567円、前日比12.3%増")
.accessibilityElement(children: .combine)
```

### Dynamic Type

```swift
// サイズクラスに応じたフォント
@Environment(\.widgetFamily) var family

var titleFont: Font {
    switch family {
    case .systemSmall: return .caption
    case .systemMedium: return .subheadline
    case .systemLarge: return .headline
    default: return .body
    }
}
```

---

## パフォーマンス最適化

### Timeline 設計

```swift
// 効率的なタイムライン
func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {

    // 現在時刻から1時間分のエントリー
    let currentDate = Date()
    var entries: [SimpleEntry] = []

    for hourOffset in 0..<6 {
        let entryDate = Calendar.current.date(
            byAdding: .hour,
            value: hourOffset,
            to: currentDate
        )!
        let entry = SimpleEntry(date: entryDate)
        entries.append(entry)
    }

    // 6時間後に再読み込み
    let timeline = Timeline(
        entries: entries,
        policy: .after(
            Calendar.current.date(byAdding: .hour, value: 6, to: currentDate)!
        )
    )
    completion(timeline)
}
```

### データ軽量化

```
推奨:
├── 最小限のデータのみ保持
├── 画像はキャッシュ活用
├── ネットワーク呼び出しを最小化
└── バックグラウンド更新を活用

サイズ制限:
├── ウィジェットデータ: ≤ 4MB
├── 画像: 最適化済み、必要サイズのみ
└── キャッシュ: App Group 共有
```

---

## チェックリスト

### ウィジェット

- [ ] 全サイズ対応（Small, Medium, Large）
- [ ] ダークモード対応
- [ ] プレースホルダー状態定義
- [ ] タップ領域とdeepLink設定
- [ ] VoiceOverラベル設定
- [ ] パフォーマンス最適化
- [ ] エラー状態の表示

### Live Activity

- [ ] Dynamic Island レイアウト（Compact, Expanded, Minimal）
- [ ] ロック画面レイアウト
- [ ] 更新頻度の最適化
- [ ] 終了状態の適切な処理
- [ ] StandByモード対応（iOS 17+）

---

## 参考文献

- Apple Human Interface Guidelines - Widgets
- Apple Human Interface Guidelines - Live Activities
- WidgetKit Documentation
- ActivityKit Documentation
- WWDC 2023: Bring widgets to new places
- WWDC 2022: Meet WidgetKit for watchOS
