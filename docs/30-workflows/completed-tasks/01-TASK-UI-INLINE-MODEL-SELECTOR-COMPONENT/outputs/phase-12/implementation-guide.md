# InlineModelSelector 実装ガイド

## Part 1: 概念説明（中学生向け）

### 1. インラインセレクター（Inline Selector）とは

テレビのリモコンで使うチャンネルのダイヤル選択のようなもの。テレビの画面を変えなくても、手元のリモコンでサッとチャンネルを変えられる。InlineModelSelector も、別の設定画面に移動せずに、その場で AI モデルを選べる。

### 2. プロバイダーとモデルの2段階選択

スマートフォンを選ぶとき、まず「Apple」か「Samsung」かを選び（プロバイダー）、次に「iPhone 15」か「iPhone 16」かを選ぶ（モデル）のと同じ。InlineModelSelector も、まず AI のメーカー（Anthropic、OpenAI 等）を選び、次にそのモデル（Claude、GPT-4 等）を選ぶ。

### 3. ヘルスステータスドット（Health Status Dot）とは

エレベーターのボタンの横にある小さなランプのようなもの。緑なら「正常動作中」、黄なら「少し混んでいる」、赤なら「故障中」とわかる。InlineModelSelector のドットも、AI が正常なら緑、問題があれば色が変わって知らせてくれる。

### 4. compact モードとは

折りたたみ傘と普通の傘のようなもの。どちらも雨をしのげるが、折りたたみ傘はカバンに入れやすいサイズになっている。compact モードは機能はそのままで、表示サイズだけ小さくする。

---

## Part 2: 開発者向け実装詳細

### コンポーネント構成

```
InlineModelSelector (molecule)
  ├── SelectorTrigger (atom) ← ドロップダウントリガーボタン
  │   ├── HealthDot ← ステータスインジケーター（5状態）
  │   ├── DisplayText ← Provider/Model名表示
  │   └── Chevron ← 展開/折りたたみアイコン
  └── SelectorDropdown (molecule) ← 展開時のリスト
      ├── ProviderSection ← プロバイダー選択
      └── ModelSection ← モデル選択（プロバイダー連動）
```

### Props API

| Prop                 | 型                                             | デフォルト | 説明                                      |
| -------------------- | ---------------------------------------------- | ---------- | ----------------------------------------- |
| `compact`            | `boolean`                                      | `false`    | コンパクト表示切替                        |
| `className`          | `string`                                       | -          | 追加CSSクラス                             |
| `onSelectionChange`  | `(selection: { providerId, modelId }) => void` | -          | 選択変更コールバック                      |
| `disabled`           | `boolean`                                      | `false`    | 無効化                                    |
| `providers`          | `LLMProvider[]`                                | Store取得  | プロバイダーリスト（Store非依存モード用） |
| `selectedProviderId` | `LLMProviderId \| null`                        | Store取得  | 選択中プロバイダー                        |
| `selectedModelId`    | `string \| null`                               | Store取得  | 選択中モデル                              |
| `healthStatus`       | `HealthStatus`                                 | Store取得  | ヘルスステータス                          |

### デュアルモード設計

1. **Store連携モード**（propsなし）: Zustand個別セレクタ経由でStore状態を取得。マウント時に`fetchProviders()`で遅延ハイドレーション。プロバイダー変更時に`checkHealth()`で自動ヘルスチェック。
2. **スタンドアロンモード**（`providers` prop渡し）: Storeに依存せず、テスト/Storybookで使用可能。

### State 管理設計

- **ドロップダウン開閉**: `useState`（ローカル状態）
- **Provider/Model選択**: Zustand 個別セレクタ（P31対策: 合成Hook禁止）
- **外部クリック検知**: `useRef` + `useEffect`
- **キーボード操作**: `useEffect`（Escape で閉じ、フォーカスをトリガーに戻す）
- **遅延ハイドレーション**: `useEffect` + `fetchProviders()`（Store連携モードのみ）
- **ヘルス自動更新**: `prevProviderIdRef` でプロバイダー変更を検知し `checkHealth()` を呼出

### プロバイダー選択時の動作

プロバイダー選択時はデフォルトモデルを即時選択しつつ、ドロップダウンは開いたままにする。ユーザーは続けて別モデルを選択可能。モデル選択時にドロップダウンが閉じる。

### デザイントークン定数（P47対策）

`selectorTriggerStyles`、`healthDotStyles`、`dropdownStyles` がモジュールスコープに `export` されており、テストからインポートして期待値検証に利用可能。

### 使用例

```tsx
// Store連携モード（ChatView等で使用）
<InlineModelSelector onSelectionChange={handleModelChange} />

// Props直接渡しモード（テスト・Storybook等で使用）
<InlineModelSelector
  providers={mockProviders}
  selectedProviderId="anthropic"
  selectedModelId="claude-3-5-sonnet"
  healthStatus="healthy"
  onSelectionChange={handleModelChange}
/>

// コンパクトモード（WorkspaceChat等で使用）
<InlineModelSelector compact onSelectionChange={handleModelChange} />
```
