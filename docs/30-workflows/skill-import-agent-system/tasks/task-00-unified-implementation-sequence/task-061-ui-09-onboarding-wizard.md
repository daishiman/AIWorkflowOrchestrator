# TASK-UI-09-ONBOARDING-WIZARD: はじめよう

## 1. メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-UI-09-ONBOARDING-WIZARD                       |
| ティア     | 4 (UI刷新)                                         |
| 依存       | TASK-UI-00〜08（全タスク完了後に実装）             |
| 並列可     | なし（最終タスク）                                 |
| 複雑度     | small                                              |
| ステータス | pending                                            |
| 優先度     | low                                                |
| タグ       | frontend, renderer, ui, onboarding, electron-store |

## 2. 目的

初回起動時にのみ表示される4ステップのインタラクティブ操作型ウィザードを実装する。テキスト説明は一切行わず、ユーザーが各ステップで1つのミニタスク（名前入力・AIへの話しかけ・ツール追加・テーマ切替）を完了することで「次へ」が解放される、Tap&Discover体験を提供する。

## 3. Why（なぜ必要か）

### 設計哲学: Tap&Discover

従来のオンボーディングは「読んで理解する」テキスト説明型だが、ユーザーの大半はテキストを読み飛ばす。本ウィザードでは、各ステップに1つだけのタスクを配置し、操作完了が次のステップへの鍵となる構造にすることで、「操作しながら機能を発見する」体験を実現する。

**3つの設計レベル:**

| Level | 原則                        | 実現方法                                                     |
| ----- | --------------------------- | ------------------------------------------------------------ |
| 1     | 各ステップで1つのタスクのみ | 名前入力 / バブルタップ / ツール選択 / テーマ切替の4操作     |
| 2     | タスク完了で次へ進む        | ミニタスク完了まで「次へ」がdisabled、完了でpulse解放        |
| 3     | 全操作にフィードバック      | マイクロインタラクション（bounce / fade / slide / confetti） |

### UX言語の統一

| Before（旧）                     | After（新）               |
| -------------------------------- | ------------------------- |
| オンボーディング                 | はじめよう                |
| スキル                           | ツール                    |
| エージェント                     | AIアシスタント            |
| 始める                           | 準備完了!                 |
| スキップ                         | あとで                    |
| AIWorkflowOrchestratorへようこそ | あなたのお名前は?         |
| ワークスペース説明               | AIに話しかけてみよう      |
| スキル説明                       | ツールを1つ追加してみよう |
| テーマ選択                       | 見た目を選ぼう            |

### Task 5B（error/offline）適用境界

本タスクは「初回導入体験の操作学習」が主責務であり、エラー/オフラインUIを主責務に持つ画面ではない。
そのため Task 5B は以下ルールで適用する。

| 観点                       | 判定   | 理由                                                             |
| -------------------------- | ------ | ---------------------------------------------------------------- |
| onboarding本編の文言/導線  | 対象   | UX言語統一（Task 5D）で直接ユーザー体験に影響するため            |
| 通信失敗時の包括的エラーUI | 対象外 | 詳細な障害UIは Workspace / SkillCenter 側の責務で定義済み        |
| offlineリカバリ導線の実装  | 対象外 | 本タスクでは状態遷移学習を優先し、障害回復フローは別タスクで扱う |

### 全画面完成後に実装する理由

オンボーディングウィザードは各ステップで実装済み機能を体験させる。体験対象の画面が未完成の状態で設計すると以下の問題が生じる：

1. **SuggestionBubbleが使えない**: Step 2で使用するコンポーネントがTASK-UI-00で定義済みである必要がある
2. **テーマプレビューが不完全**: Step 4の即時テーマ切替には完成したテーマシステムが必要
3. **遷移先が存在しない**: 完了後のダッシュボード遷移先ViewTypeが未定義

したがって、TASK-UI-00〜08が全て完了した後に本タスクを実装する。

### 想定ユーザーフロー

```
初回起動
    |
    v
[electron-store: hasCompletedOnboarding === false]
    |
    v
はじめようウィザード 表示
    |
    +-- Step 1（なまえ）-> Step 2（おためし）-> Step 3（ツール）-> Step 4（テーマ）
    |   |                                                              |
    |   +-- 各ステップのミニタスク完了で「次へ」がアクティブに --------+
    |                                                                  |
    |                                                                  v
    |                                                         「{名前}さん、準備完了です!」
    |                                                         confettiアニメーション 2秒
    |                                                                  |
    |                                                                  v
    |                                                         3秒後にパーソナライズされたホームに自動遷移
    |
    +-- 「あとで」-> 即座にダッシュボード

2回目以降の起動
    |
    v
[electron-store: hasCompletedOnboarding === true]
    |
    v
ダッシュボード直接表示

設定画面から「はじめようを再表示」
    |
    v
[electron-store: hasCompletedOnboarding = false に戻す]
    |
    v
はじめようウィザード 表示
```

## 4. 画面構成図（ASCII）

### 共通レイアウト

```
+-- OnboardingWizard（モーダルオーバーレイ）---------------------+
|                                                                |
|  +-- WizardModal (max(600px, 50vw) x auto) -----------------+  |
|  |                                                          |  |
|  |  +-- StepIndicator ------------------------------------+ |  |
|  |  | [1.なまえ]--[2.おためし]--[3.ツール]--[4.テーマ]     | |  |
|  |  +-----------------------------------------------------+ |  |
|  |                                                          |  |
|  |  +-- StepContent（ステップごとに異なる）-----------------+ |  |
|  |  |                                                     | |  |
|  |  |  （各ステップの操作エリア）                          | |  |
|  |  |                                                     | |  |
|  |  +-----------------------------------------------------+ |  |
|  |                                                          |  |
|  |  +-- WizardNavigation ---------------------------------+  |  |
|  |  | [あとで]              [戻る]  [次へ(disabled)]       |  |  |
|  |  +-----------------------------------------------------+  |  |
|  |                                                          |  |
|  +----------------------------------------------------------+  |
|                                                                |
+----------------------------------------------------------------+
```

### Step 1: あなたのお名前は?

```
+-- StepContent ----------------------------------------+
|                                                       |
|        lucide: Sparkles (64px)                        |
|                                                       |
|        「あなたのお名前は?」                          |
|                                                       |
|   +---------------------------------------------+    |
|   |  ニックネームでOK                            |    |
|   |  (テキスト入力欄 h=56px, 中央配置)           |    |
|   +---------------------------------------------+    |
|                                                       |
|   入力中: リアルタイムプレビュー                      |
|   「こんにちは、{name}さん!」                         |
|   (入力に連動してテキスト更新)                        |
|                                                       |
|        1文字以上入力 -> [次へ] がpulseでアクティブに   |
|                                                       |
+-------------------------------------------------------+
```

### Step 2: AIに話しかけてみよう

```
+-- StepContent ----------------------------------------+
|                                                       |
|        lucide: MessageCircle (64px)                   |
|                                                       |
|        「AIに話しかけてみよう」                        |
|        「気になるものをタップしてみて」                |
|                                                       |
|   +-- SuggestionBubble (size="lg") ---------------+   |
|   |  「おすすめの映画を教えて」                    |   |
|   +-----------------------------------------------+   |
|   +-- SuggestionBubble (size="lg") ---------------+   |
|   |  「今日の天気は?」                             |   |
|   +-----------------------------------------------+   |
|   +-- SuggestionBubble (size="lg") ---------------+   |
|   |  「簡単なジョークを言って」                    |   |
|   +-----------------------------------------------+   |
|                                                       |
|   タップ時: scale(0.97 -> 1.05 -> 1) bounce          |
|   タップ後: モック応答がフェードイン表示              |
|   +-- MockResponse --------------------------------+   |
|   |  （AIのプリセット応答テキスト）                 |   |
|   +-----------------------------------------------+   |
|                                                       |
|        応答表示後 -> [次へ] がpulseでアクティブに      |
|                                                       |
+-------------------------------------------------------+
```

### Step 3: ツールを1つ追加してみよう

```
+-- StepContent ----------------------------------------+
|                                                       |
|        lucide: Wrench (64px)                          |
|                                                       |
|        「ツールを1つ追加してみよう」                   |
|        「使ってみたいものを選んでね」                  |
|                                                       |
|   +-- ToolCard --+ +-- ToolCard --+ +-- ToolCard --+  |
|   | 120x120px    | | 120x120px    | | 120x120px    |  |
|   |  {icon}      | |  {icon}      | |  {icon}      |  |
|   |  {name}      | |  {name}      | |  {name}      |  |
|   |  {desc}      | |  {desc}      | |  {desc}      |  |
|   |              | |              | |              |  |
|   | 選択時:      | |              | |              |  |
|   | checkmark +  | |              | |              |  |
|   | success-     | |              | |              |  |
|   | bounce       | |              | |              |  |
|   +--------------+ +--------------+ +--------------+  |
|                                                       |
|        選択完了後 -> [次へ] がpulseでアクティブに      |
|                                                       |
+-------------------------------------------------------+
```

### Step 4: 見た目を選ぼう

```
+-- StepContent ----------------------------------------+
|                                                       |
|        lucide: Palette (64px)                         |
|                                                       |
|        「見た目を選ぼう」                              |
|        「タップで切り替わるよ」                        |
|                                                       |
|   +-- ThemePreview --+ +-- ThemePreview --+ +-- ThemePreview --+  |
|   | kanagawa-dragon  | |    light         | |    dark          |  |
|   |  カラーパレット  | |  カラーパレット  | |  カラーパレット  |  |
|   |                  | |   check 選択中   | |                  |  |
|   |                  | | accent border    | |                  |  |
|   +------------------+ +------------------+ +------------------+  |
|                                                       |
|   タップで画面全体がクロスフェード（opacity 300ms）   |
|   選択中: チェックマーク + アクセントボーダー          |
|                                                       |
|   テーマ選択後 -> [準備完了!] がpulseでアクティブに    |
|                                                       |
+-------------------------------------------------------+
```

### 完了画面

```
+-- CompletionScreen -----------------------------------+
|                                                       |
|   EmptyState mood="celebrating"                       |
|                                                       |
|   confetti風パーティクル（CSS animation 2秒）         |
|                                                       |
|   「{userName}さん、準備完了です!」                    |
|                                                       |
|   3秒後にパーソナライズされたホームへ自動遷移         |
|                                                       |
+-------------------------------------------------------+
```

## 5. コンポーネント構成

### 5.1 コンポーネントツリー

```
OnboardingWizard (organisms/OnboardingWizard/index.tsx) [新規]
+-- WizardModal (molecules/WizardModal/index.tsx) [新規]
|   +-- StepIndicator (atoms/StepIndicator/index.tsx) [新規]
|   |   +-- StepLabel x 4（「1.なまえ」「2.おためし」「3.ツール」「4.テーマ」）
|   +-- WizardStep (molecules/WizardStep/index.tsx) [新規]
|   |   +-- StepIcon (lucide-react アイコン)
|   |   +-- StepTitle / StepDescription (テキスト)
|   |   +-- StepInteraction（ステップごとに異なる操作エリア）
|   |       +-- Step 1: NameInput (atoms/NameInput/index.tsx) [新規]
|   |       |   +-- WelcomePreview（リアルタイム更新テキスト）
|   |       +-- Step 2: AiTryOut (molecules/AiTryOut/index.tsx) [新規]
|   |       |   +-- SuggestionBubble x 3 (TASK-UI-00で定義済み, size="lg")
|   |       |   +-- MockResponse (atoms/MockResponse/index.tsx) [新規]
|   |       +-- Step 3: ToolPicker (molecules/ToolPicker/index.tsx) [新規]
|   |       |   +-- ToolCard x 3 (atoms/ToolCard/index.tsx) [新規]
|   |       +-- Step 4: ThemePreview (molecules/ThemePreview/index.tsx) [新規]
|   +-- WizardNavigation (molecules/WizardNavigation/index.tsx) [新規]
|       +-- LaterButton（「あとで」）
|       +-- BackButton
|       +-- NextButton / CompleteButton
+-- CompletionScreen (molecules/CompletionScreen/index.tsx) [新規]
|   +-- EmptyState (mood="celebrating")
|   +-- ConfettiAnimation (CSS animation)
+-- Overlay (背景オーバーレイ)
```

### 5.2 ウィザードステップ定義

#### Step 1: あなたのお名前は?（パーソナライズ用）

| 項目             | 値                                                                                |
| ---------------- | --------------------------------------------------------------------------------- |
| アイコン         | lucide: Sparkles (64px)                                                           |
| タイトル         | 「あなたのお名前は?」                                                             |
| 説明             | なし（操作で学ぶ）                                                                |
| 操作             | テキスト入力欄（1つだけ、中央配置、高さ56px）                                     |
| プレースホルダー | 「ニックネームでOK」                                                              |
| リアルタイム更新 | 入力中に「こんにちは、{name}さん!」テキストがリアルタイムで更新される             |
| 完了条件         | 1文字以上入力（trim後）                                                           |
| 完了時の動作     | 「次へ」ボタンがdisabled -> enabledに変化し、pulseアニメーション1回               |
| データ用途       | ダッシュボードの挨拶表示 + 完了画面のパーソナライズに使用（electron-storeに保存） |

#### Step 2: AIに話しかけてみよう（SuggestionBubbleタップ体験）

| 項目         | 値                                                                    |
| ------------ | --------------------------------------------------------------------- |
| アイコン     | lucide: MessageCircle (64px)                                          |
| タイトル     | 「AIに話しかけてみよう」                                              |
| 説明         | 「気になるものをタップしてみて」                                      |
| 操作         | SuggestionBubble 3つ（TASK-UI-00で定義済み、size="lg"）               |
| バブル内容   | 「おすすめの映画を教えて」「今日の天気は?」「簡単なジョークを言って」 |
| タップ時     | バブルのscale(0.97 -> 1.05 -> 1) bounce + AIの応答がフェードイン      |
| 完了条件     | いずれか1つのバブルをタップし、モック応答が表示された状態             |
| 完了時の動作 | 「次へ」がdisabled -> enabledに変化し、pulseアニメーション1回         |
| 注意         | 実際のAPI呼び出しは行わない。プリセット応答をハードコードで表示       |

##### モック応答マッピング

| バブル                     | プリセット応答                                                                   |
| -------------------------- | -------------------------------------------------------------------------------- |
| 「おすすめの映画を教えて」 | 「『インターステラー』はいかがですか? 壮大な宇宙の旅と家族の絆を描いた名作です」 |
| 「今日の天気は?」          | 「今日は晴れのち曇り、最高気温22度の過ごしやすい一日になりそうです」             |
| 「簡単なジョークを言って」 | 「プログラマーはなぜ海が嫌いなの? ...それはバグが多いからです」                  |

#### Step 3: ツールを1つ追加してみよう（3択から選んで追加）

| 項目         | 値                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------- |
| アイコン     | lucide: Wrench (64px)                                                                         |
| タイトル     | 「ツールを1つ追加してみよう」                                                                 |
| 説明         | 「使ってみたいものを選んでね」                                                                |
| 操作         | 3つのおすすめツールカード（120x120px、アイコン + 名前 + 一言説明）                            |
| タップ時     | 選択カードにチェックマーク表示 + success-bounce                                               |
| 完了条件     | いずれか1つのツールカードを選択                                                               |
| 完了時の動作 | 「次へ」がdisabled -> enabledに変化し、pulseアニメーション1回                                 |
| 注意         | 実際のインポートAPIは呼ばない。選択結果をローカルステートに保存し、ウィザード完了後に一括実行 |

##### おすすめツール定義

| ツール名     | アイコン (lucide) | 一言説明                   |
| ------------ | ----------------- | -------------------------- |
| 文章リライト | PenLine           | 文章をもっと読みやすく     |
| コード生成   | Code              | AIがコードを書いてくれる   |
| 要約         | FileText          | 長い文章をサクッとまとめる |

#### Step 4: 見た目を選ぼう（3テーマのライブプレビュー切替）

| 項目         | 値                                                                       |
| ------------ | ------------------------------------------------------------------------ |
| アイコン     | lucide: Palette (64px)                                                   |
| タイトル     | 「見た目を選ぼう」                                                       |
| 説明         | 「タップで切り替わるよ」                                                 |
| 操作         | 3テーマのライブプレビューカード（既存のThemePreview構成を維持）          |
| タップ時     | 画面全体がクロスフェード（opacity transition 300ms）で即時切替           |
| 選択中表示   | チェックマーク + アクセントボーダー                                      |
| 完了条件     | いずれか1つのテーマをタップ（初期選択テーマが適用済みなら即完了）        |
| 完了時の動作 | 「準備完了!」ボタンがdisabled -> enabledに変化し、pulseアニメーション1回 |

### 5.3 コンポーネント詳細

#### OnboardingWizard

```typescript
interface OnboardingWizardProps {
  onComplete: (userName: string, selectedTool: string | null) => void; // 完了時コールバック
  onSkip: () => void; // 「あとで」コールバック
}
```

- 表示条件: `hasCompletedOnboarding === false`（electron-storeから取得）
- 完了時: `hasCompletedOnboarding = true` + `userName` をelectron-storeに保存
- 「あとで」時: `hasCompletedOnboarding = true` をelectron-storeに保存
- モーダルオーバーレイ上に表示（背景はぼかし + 半透明）

#### WizardModal

```typescript
interface WizardModalProps {
  children: React.ReactNode;
  className?: string;
}
```

- 幅: `max(600px, 50vw)`
- 最大高さ: `80vh`
- 角丸: 16px（大きめの角丸でフレンドリーな印象）
- 影: `0 24px 48px rgba(0, 0, 0, 0.2)`
- 中央配置（flexbox）

#### StepIndicator

```typescript
interface StepIndicatorProps {
  currentStep: number; // 0-indexed
  totalSteps: number; // 4
  stepLabels: string[]; // ["1.なまえ", "2.おためし", "3.ツール", "4.テーマ"]
}
```

- 各ステップをラベル付きで表示（ドットではなくステップ名）
- 完了ステップ: アクセントカラーのテキスト + 下線
- 現在ステップ: アクセントカラーのテキスト + 太字 + 下線アニメーション
- 未到達ステップ: グレーテキスト
- ステップ間は細い接続線で繋ぐ

#### NameInput（Step 1専用）

```typescript
interface NameInputProps {
  value: string;
  onChange: (name: string) => void;
  onComplete: () => void; // 入力完了コールバック（1文字以上）
}
```

- 高さ: 56px（大きめで入力しやすく）
- 幅: 100%（最大幅 400px、中央配置）
- プレースホルダー: 「ニックネームでOK」
- フォーカス時: ボーダーがアクセントカラーに変化（200ms transition）
- フォントサイズ: 18px（読みやすさ重視）
- バリデーション: trim後1文字以上で完了
- **リアルタイムプレビュー**: 入力欄の下に「こんにちは、{name}さん!」テキストを表示。入力に連動してリアルタイム更新される。未入力時は非表示

#### AiTryOut（Step 2専用）

```typescript
interface AiTryOutProps {
  onComplete: () => void; // バブルタップ後のコールバック
}

interface MockResponseData {
  bubble: string; // タップしたバブルテキスト
  response: string; // プリセット応答テキスト
}
```

- SuggestionBubble: TASK-UI-00で定義済みのコンポーネントを `size="lg"` で使用
- タップ時: バブルのscale(0.97 -> 1.05 -> 1) bounceアニメーション
- タップ後: 選択したバブルがハイライト状態に、他のバブルはフェードアウト（opacity: 0.5）
- MockResponse: フェードイン（300ms ease-out）で表示
- 一度タップしたら再タップ不可（選択済み状態をロック）

#### ToolPicker（Step 3専用）

```typescript
interface ToolPickerProps {
  onComplete: (selectedTool: string) => void; // ツール選択完了コールバック
}

interface ToolCardData {
  id: string;
  name: string;
  icon: IconName; // lucide-react
  description: string;
}
```

- 3カードをグリッド表示（3x1、gap: 16px）
- 各カードサイズ: 120x120px
- カード構成: アイコン(32px) + ツール名(14px bold) + 説明(12px secondary)
- hover: `scale(1.02)` + 影が強くなる（200ms transition）
- タップ: カードにチェックマーク即時表示 + success-bounce
- 選択後: 選択済みカードにアクセントボーダー、他カードはフェードアウト（opacity: 0.5）

#### ThemePreview（Step 4）

```typescript
interface ThemePreviewProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}
```

- 3つのテーマプレビューカードをグリッド表示（3x1）
- 各カードは小さなカラーパレットプレビュー
- タップで画面全体がクロスフェード（opacity transition 300ms）して即時テーマ適用（settingsSlice.setTheme()）
- 選択中: チェックマークアイコン + アクセントカラーボーダー（2px solid）
- hover: `scale(1.02)` + 影の変化

#### CompletionScreen

```typescript
interface CompletionScreenProps {
  userName: string;
  onAutoNavigate: () => void; // 自動遷移コールバック
}
```

- EmptyState（mood="celebrating"）をベースに構成
- テキスト: 「{userName}さん、準備完了です!」（パーソナライズ表示）
- confetti風パーティクル: CSS animationで実装（`@keyframes confetti-fall`）
  - 20〜30個の小さなカラフルな四角形が上から降る
  - 各パーティクルにランダムな遅延・回転・落下速度
  - 2秒間のアニメーション、ループなし
- 3秒後に `onAutoNavigate` を呼び出してパーソナライズされたホームに遷移
- 画面下部に「ダッシュボードへ」リンク（待てない人用）

#### WizardNavigation

```typescript
interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  isStepCompleted: boolean; // 現在ステップのミニタスクが完了したか
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onComplete: () => void;
}
```

- Step 1: [あとで] ... [次へ(disabled)]（「戻る」なし）
- Step 2-3: [あとで] ... [戻る] [次へ(disabled)]
- Step 4: [あとで] ... [戻る] [準備完了!(disabled)]
- 「次へ」/「準備完了!」ボタンの状態:
  - ミニタスク未完了: `disabled`（グレーアウト、opacity: 0.5、cursor: not-allowed）
  - ミニタスク完了: disabled -> enabledの瞬間にpulseアニメーション1回再生
- pulse: `scale(1) -> scale(1.08) -> scale(1)` + `box-shadow glow` を400msで実行

## 6. マイクロインタラクション

### 6.1 ステップ遷移

- 現在のコンテンツがslideOut（左方向） + 次のコンテンツがslideIn（右方向）300ms ease-out
- 戻る: 右にslideOut → 左からslideIn（300ms ease-out）
- フェード（opacity 0 -> 1）を組み合わせて滑らかな切替を実現

### 6.2 Step 1: なまえ入力

- テキスト入力フォーカス時: ボーダーがグレー -> アクセントカラーに変化（200ms transition）
- **タイプ中**: 入力欄下の「こんにちは、{name}さん!」テキストがリアルタイム更新
  - 1文字目入力: テキストがフェードインで出現（200ms ease-out）
  - 入力中: テキスト内の名前部分のみ即時更新（フェードなし、テキスト置換のみ）
  - 全削除: テキストがフェードアウトで消失（200ms ease-out）
- 1文字以上入力: 「次へ」ボタンにpulseアニメーション発火（disabled -> enabled切替時のみ）

### 6.3 Step 2: AIおためし

- SuggestionBubble hover: `scale(1.02)`（150ms ease-out）
- **SuggestionBubble タップ**: scale(0.97 -> 1.05 -> 1) bounceアニメーション（300ms cubic-bezier）
- 他のバブル: `opacity: 0.5`にフェードアウト（200ms）
- **AIの応答がフェードイン**: MockResponseが300ms ease-outで出現
- 「次へ」ボタンにpulseアニメーション発火

### 6.4 Step 3: ツール追加

- ToolCard hover: `scale(1.02)` + 影の強化（150ms ease-out）
- **ToolCard タップ（選択）**: カードにチェックマークが出現 + success-bounce
  - success-bounce: `scale(1) -> scale(0.95) -> scale(1.05) -> scale(1)` を400ms cubic-bezierで実行
  - チェックマーク: lucide Check アイコンがscale(0 -> 1.2 -> 1)で出現（300ms）
- 非選択カード: `opacity: 0.5`にフェードアウト
- 「次へ」ボタンにpulseアニメーション発火

### 6.5 Step 4: テーマ選択

- ThemePreview hover: `scale(1.02)`（150ms ease-out）
- ThemePreview タップ: `border: 2px solid accent` + チェックマーク表示
- **テーマ切替**: 画面全体がクロスフェード（opacity transition 300ms ease-in-out）
  - WizardModal全体のopacityを 1 -> 0 -> 1 で切替（前半150ms fadeout、テーマ適用、後半150ms fadein）
- 「準備完了!」ボタンにpulseアニメーション発火

### 6.6 ステップ進行: 「次へ」ボタン有効化

- disabled -> enabled切替の瞬間にpulseアニメーション1回:
  ```
  @keyframes button-pulse {
    0%   { transform: scale(1); box-shadow: 0 0 0 0 rgba(accent, 0.4); }
    50%  { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(accent, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(accent, 0); }
  }
  animation: button-pulse 400ms ease-out 1;
  ```
- 一度再生したら再生しない（useRefでガード）

### 6.7 完了画面

- EmptyState: フェードイン（400ms ease-out）
- 「{userName}さん、準備完了です!」テキスト: フェードイン（600ms ease-out, delay 200ms）
- confettiパーティクル: 上部から降下（2秒間、`@keyframes confetti-fall`）
- 自動遷移: 3秒後にフェードアウト（300ms） -> パーソナライズされたホームへ遷移

## 7. 状態管理

### 7.1 ローカルステート（useState）

オンボーディングウィザードはアプリ全体で共有する必要がないため、Zustand Sliceは作成しない。コンポーネント内の `useState` で管理する。

```typescript
// OnboardingWizard内部
const [currentStep, setCurrentStep] = useState(0);
const [isVisible, setIsVisible] = useState(false);
const [userName, setUserName] = useState("");
const [selectedBubble, setSelectedBubble] = useState<string | null>(null);
const [selectedTool, setSelectedTool] = useState<string | null>(null);
const [isCompleted, setIsCompleted] = useState(false); // 完了画面表示用

// 各ステップの完了状態を導出
const stepCompleted: Record<number, boolean> = {
  0: userName.trim().length > 0,
  1: selectedBubble !== null,
  2: selectedTool !== null,
  3: true, // テーマは初期値が適用済みのため常にtrue（タップで変更可能）
};
```

### 7.2 永続化（electron-store）

```typescript
// Main Process側: electron-store のスキーマ
interface AppConfig {
  hasCompletedOnboarding: boolean; // デフォルト: false
  onboardingUserName: string; // デフォルト: ""
  onboardingSelectedTool: string | null; // デフォルト: null
}

// IPC経由で取得/更新
// Renderer -> Main
window.electronAPI.config.get("hasCompletedOnboarding"); // boolean
window.electronAPI.config.set("hasCompletedOnboarding", true);
window.electronAPI.config.set("onboardingUserName", userName);
window.electronAPI.config.set("onboardingSelectedTool", selectedTool);
```

### 7.3 テーマ選択の即時反映

Step 4でテーマを選択した場合、settingsSliceのアクションを使用：

```typescript
// 個別セレクタ（P31対策）
const setTheme = useSetTheme(); // settingsSlice の個別セレクタ

const handleThemeChange = (theme: ThemeMode) => {
  setTheme(theme); // 即時反映（クロスフェード付き）
};
```

### 7.4 再表示機能

設定画面（SettingsView）に「はじめようを再表示」オプションを追加：

```typescript
// SettingsView内
const handleResetOnboarding = async () => {
  await window.electronAPI.config.set("hasCompletedOnboarding", false);
  // 次回起動時にはじめようウィザードが表示される
  // または即座にOnboardingWizardを表示
};
```

### 7.5 完了後のツールインポート

ウィザード完了時に、Step 3で選択したツールを実際にインポートする：

```typescript
// OnboardingWizard完了ハンドラ内
const handleComplete = async () => {
  // 1. ユーザー名を保存
  await window.electronAPI.config.set("onboardingUserName", userName);

  // 2. 完了フラグを保存
  await window.electronAPI.config.set("hasCompletedOnboarding", true);

  // 3. 選択したツールのインポートを実行（完了後に非同期で実行）
  if (selectedTool) {
    await window.electronAPI.config.set("onboardingSelectedTool", selectedTool);
    // 実際のインポートはダッシュボード遷移後にバックグラウンドで実行
  }

  // 4. 完了画面を表示
  setIsCompleted(true);

  // 5. 3秒後にパーソナライズされたホームへ遷移
  setTimeout(() => {
    onComplete(userName, selectedTool);
  }, 3000);
};
```

## 8. レスポンシブ仕様

| ブレークポイント | WizardModal幅      | ToolCard/ThemePreviewグリッド | ステップ遷移 |
| ---------------- | ------------------ | ----------------------------- | ------------ |
| lg (1024px+)     | max(600px, 50vw)   | 3x1（横並び）                 | 横スライド   |
| md (768-1023px)  | max(600px, 70vw)   | 3x1（横並び）                 | 横スライド   |
| sm (<768px)      | calc(100vw - 32px) | 1x3（縦積み）                 | フェードのみ |

- sm時のStepIndicatorは短縮表示（「1」「2」「3」「4」の数字のみ）に切り替え
- sm時のSuggestionBubbleは幅100%で縦積み
- sm時のToolCardは80x80pxに縮小し縦積み

## 9. ゼロステート

該当なし（はじめようウィザード自体がゼロステート的な役割を果たす）。

## 10. 成果物（ファイルパス）

| 成果物              | パス                                                                        | 種別 |
| ------------------- | --------------------------------------------------------------------------- | ---- |
| OnboardingWizard    | `apps/desktop/src/renderer/components/organisms/OnboardingWizard/index.tsx` | 新規 |
| WizardModal         | `apps/desktop/src/renderer/components/molecules/WizardModal/index.tsx`      | 新規 |
| StepIndicator       | `apps/desktop/src/renderer/components/atoms/StepIndicator/index.tsx`        | 新規 |
| WizardStep          | `apps/desktop/src/renderer/components/molecules/WizardStep/index.tsx`       | 新規 |
| NameInput           | `apps/desktop/src/renderer/components/atoms/NameInput/index.tsx`            | 新規 |
| AiTryOut            | `apps/desktop/src/renderer/components/molecules/AiTryOut/index.tsx`         | 新規 |
| MockResponse        | `apps/desktop/src/renderer/components/atoms/MockResponse/index.tsx`         | 新規 |
| ToolPicker          | `apps/desktop/src/renderer/components/molecules/ToolPicker/index.tsx`       | 新規 |
| ToolCard            | `apps/desktop/src/renderer/components/atoms/ToolCard/index.tsx`             | 新規 |
| ThemePreview        | `apps/desktop/src/renderer/components/molecules/ThemePreview/index.tsx`     | 新規 |
| CompletionScreen    | `apps/desktop/src/renderer/components/molecules/CompletionScreen/index.tsx` | 新規 |
| WizardNavigation    | `apps/desktop/src/renderer/components/molecules/WizardNavigation/index.tsx` | 新規 |
| SettingsView (改修) | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                    | 改修 |
| electron-store設定  | `apps/desktop/src/main/config/store-schema.ts`                              | 改修 |

## 11. テスト計画

### 11.1 ユニットテスト

| テスト対象                 | テスト内容                                                          |
| -------------------------- | ------------------------------------------------------------------- |
| NameInput                  | trim後1文字以上でonComplete発火、空文字・スペースのみでは発火しない |
| NameInput リアルタイム更新 | 入力値に連動してウェルカムメッセージが更新される                    |
| AiTryOut                   | バブルタップでMockResponse表示、再タップ不可、onComplete発火        |
| ToolPicker                 | カードタップでチェックマーク表示、onComplete発火                    |
| ThemePreview               | テーマタップでonThemeChange発火、選択中表示が正しい                 |
| WizardNavigation           | isStepCompleted=falseでdisabled、trueでenabled                      |
| CompletionScreen           | userNameがパーソナライズ表示される、3秒後にonAutoNavigate発火       |
| OnboardingWizard           | ステップ進行・戻るが正しく動作、「あとで」でonSkip発火              |
| stepCompleted導出ロジック  | 各ステップの完了条件が正しく導出される                              |

### 11.2 テスト実行環境（P39/P40対策）

- テスト環境: happy-dom（`apps/desktop/vitest.config.ts` 準拠）
- `fireEvent` を使用（`userEvent` はhappy-dom非互換のため使用禁止）
- 非同期ハンドラ: `await act(async () => { fireEvent.click(el) })` で包む
- 実行コマンド: `cd apps/desktop && pnpm vitest run src/renderer/components/organisms/OnboardingWizard/`

### 11.3 テスト注意事項

| Pitfall | 対策                                                                |
| ------- | ------------------------------------------------------------------- |
| P31     | テーマ変更はsettingsSliceの個別セレクタをモック（合成Hook使用禁止） |
| P39     | `userEvent.setup()` 使用禁止、`fireEvent` + `act` を使用            |
| P40     | テスト実行は `cd apps/desktop && pnpm vitest run` で実行            |
| P19     | `hasCompletedOnboarding` 取得時に型バリデーション                   |

## 12. 完了条件

- [ ] 初回起動時にはじめようウィザードが自動表示される
- [ ] `hasCompletedOnboarding` フラグがelectron-storeで正しく管理される
- [ ] Step 1: 名前入力中に「こんにちは、{name}さん!」がリアルタイム更新される
- [ ] Step 1: 1文字以上入力後に「次へ」がpulseアニメーションでアクティブになる
- [ ] Step 2: SuggestionBubbleタップ時にscale(0.97 -> 1.05 -> 1) bounceが再生される
- [ ] Step 2: タップ後にモック応答がフェードインで表示され「次へ」がアクティブになる
- [ ] Step 3: ToolCardタップでチェックマーク + success-bounceが正常動作する
- [ ] Step 4: テーマタップで画面全体がクロスフェード（300ms）で切替される
- [ ] Step 4: 「準備完了!」がpulseアニメーションでアクティブになる
- [ ] 各ステップのミニタスク未完了時は「次へ」がdisabled状態である
- [ ] disabled -> enabled切替時にpulseアニメーションが1回のみ再生される
- [ ] ステップ遷移がslideOut(左) + slideIn(右) 300msで動作する
- [ ] 完了画面でEmptyState(mood="celebrating") + confettiアニメーション（2秒）が表示される
- [ ] 完了画面で「{userName}さん、準備完了です!」とパーソナライズ表示される
- [ ] 完了画面から3秒後にパーソナライズされたホームへ自動遷移する
- [ ] 「あとで」ボタンで即座にダッシュボードに遷移する
- [ ] StepIndicatorが「1.なまえ」「2.おためし」「3.ツール」「4.テーマ」で表示される
- [ ] 完了後の2回目以降の起動ではウィザードが表示されない
- [ ] 設定画面から「はじめようを再表示」で再表示可能
- [ ] WizardModalの幅が max(600px, 50vw) である
- [ ] 全テーマ（kanagawa-dragon/light/dark）で表示正常
- [ ] lucide-reactアイコンのみ使用（絵文字不使用）
- [ ] レスポンシブ対応（lg/md/sm）が正常動作
- [ ] アクセシビリティ: キーボード操作（Tab/Enter/Escape）対応
- [ ] 関連テストがPASS

## 13. 既知の落とし穴・教訓

| Pitfall | 内容                                 | 対策                                                            |
| ------- | ------------------------------------ | --------------------------------------------------------------- |
| P31     | Zustand合成Hook無限ループ            | テーマ変更はsettingsSliceの個別セレクタ経由                     |
| P19     | electron-storeの型キャストバイパス   | `hasCompletedOnboarding` の取得時に型バリデーション             |
| P39     | happy-dom環境でのuserEvent非互換     | テストでは`fireEvent`を使用                                     |
| P40     | テスト実行ディレクトリ依存           | `cd apps/desktop && pnpm vitest run` で実行                     |
| -       | ステップ遷移アニメーションのちらつき | CSS transition で opacity + transform を同時制御                |
| -       | electron-store の IPC 遅延           | フラグ取得はアプリ初期化時に1回のみ。結果をキャッシュ           |
| -       | confettiパーティクルのパフォーマンス | CSS animationのみ使用（JS不使用）。パーティクル数30以下         |
| -       | SuggestionBubble再タップ防止         | 選択済みフラグでイベントハンドラを無効化                        |
| -       | pulseアニメーション二重再生          | useRefでガードし、disabled -> enabled切替時のみ1回再生          |
| -       | リアルタイムプレビューの再レンダー   | NameInput内のuseStateで完結。親への伝搬はonChange経由で最小限に |

## 14. 参照資料

| 資料                         | パス / 参照先                                             |
| ---------------------------- | --------------------------------------------------------- |
| 共通基盤コンポーネント       | TASK-UI-00（SuggestionBubble定義）                        |
| アーキテクチャ仕様           | TASK-UI-01                                                |
| GlobalNavStrip仕様           | TASK-UI-02                                                |
| ワークスペース仕様           | TASK-UI-04                                                |
| ツール（スキル）センター仕様 | TASK-UI-05                                                |
| 既存settingsSlice            | `apps/desktop/src/renderer/store/slices/settingsSlice.ts` |
| 既存ThemeMode型              | `apps/desktop/src/renderer/store/types.ts:131`            |
| Electronセキュリティ         | `.claude/rules/04-electron-security.md`                   |
| 状態管理ルール               | `.claude/rules/03-state-management.md`                    |
| 既知の落とし穴               | `.claude/rules/06-known-pitfalls.md`                      |
