# コンポーネント UI/UX ガイドライン

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## コンポーネント設計原則

### Atomic Design の適用

| 階層          | 説明                              | 配置場所                           |
| ------------- | --------------------------------- | ---------------------------------- |
| **Atoms**     | 最小単位の要素                    | `packages/shared/ui/atoms/`        |
| **Molecules** | Atomsを組み合わせた機能単位       | `packages/shared/ui/molecules/`    |
| **Organisms** | Moleculesを組み合わせたセクション | `packages/shared/ui/organisms/`    |
| **Templates** | ページのレイアウト構造            | 各アプリ内 `components/templates/` |
| **Pages**     | 具体的なコンテンツを持つ画面      | 各アプリの `app/` または `pages/`  |

**分類例**

| 分類      | コンポーネント例                           |
| --------- | ------------------------------------------ |
| Atoms     | Button, Input, Label, Icon, Badge, Spinner |
| Molecules | FormField, SearchBar, Dropdown, Tooltip    |
| Organisms | Header, Sidebar, DataTable, Modal, Card    |

### コンポーネントの命名規則

| ルール                             | 例                                             |
| ---------------------------------- | ---------------------------------------------- |
| PascalCaseを使用する               | `Button`, `FormField`, `DataTable`             |
| 具体的で説明的な名前にする         | `UserAvatarCard`（○）、`Card1`（×）            |
| プレフィックスで用途を明示する     | `IconButton`, `PrimaryButton`, `FormInput`     |
| バリアントはPropsで管理する        | `variant="primary"`（○）、`PrimaryButton`（△） |
| ファイル名はコンポーネント名と一致 | `Button.tsx` exports `Button`                  |

### Props設計のベストプラクティス

| 原則                                 | 説明                                  |
| ------------------------------------ | ------------------------------------- |
| 必須Propsは最小限に                  | 多くのPropsにデフォルト値を設ける     |
| Boolean Propsは肯定形で              | `isDisabled`（○）、`notEnabled`（×）  |
| イベントハンドラは`on`プレフィックス | `onClick`, `onChange`, `onSubmit`     |
| children Propsを活用する             | Compositionパターンで柔軟性を確保     |
| スプレッド演算子で拡張性を確保       | `...rest`でHTML属性を透過的に渡す     |
| Discriminated Unionsで型安全に       | バリアントごとに異なるPropsを型で表現 |

---

## Apple HIG 準拠（Electron向け）

### macOSネイティブな見た目と操作感

| 要素                 | 準拠事項                                         |
| -------------------- | ------------------------------------------------ |
| ウィンドウ外観       | 角丸（10px相当）、シャドウ、半透明背景のサポート |
| アニメーション       | 滑らかな300ms前後のイージング（ease-out）        |
| 視覚フィードバック   | ホバー、プレス状態の明確な変化                   |
| スクロール           | 慣性スクロール、スムーズなバウンス効果           |
| コンテキストメニュー | 右クリック・Ctrl+クリックで表示                  |

### タイトルバー・トラフィックライト

| 項目                   | 推奨設定                                          |
| ---------------------- | ------------------------------------------------- |
| タイトルバースタイル   | `hidden`または`hiddenInset`でカスタムタイトルバー |
| トラフィックライト位置 | 左上（デフォルト）、または`titleBarOverlay`で調整 |
| ドラッグ可能領域       | `-webkit-app-region: drag`をヘッダー領域に適用    |
| ボタン非活性化         | ドラッグ領域内のボタンには`no-drag`を設定         |
| フルスクリーン対応     | トラフィックライトの表示切替に対応する            |

### キーボードショートカット

| 操作       | macOS       | Windows/Linux |
| ---------- | ----------- | ------------- |
| 新規作成   | Cmd+N       | Ctrl+N        |
| 保存       | Cmd+S       | Ctrl+S        |
| 設定を開く | Cmd+,       | Ctrl+,        |
| 検索       | Cmd+F       | Ctrl+F        |
| 全選択     | Cmd+A       | Ctrl+A        |
| 取り消し   | Cmd+Z       | Ctrl+Z        |
| やり直し   | Cmd+Shift+Z | Ctrl+Y        |
| 閉じる     | Cmd+W       | Ctrl+W        |
| 終了       | Cmd+Q       | Alt+F4        |

**考慮事項**

- ショートカットはメニューバーのラベルに表示する
- カスタムショートカットはOS標準と競合しないようにする
- アクセシビリティのため、全機能はキーボードでアクセス可能にする

### メニューバー設計

| メニュー         | 含めるべき項目                                       |
| ---------------- | ---------------------------------------------------- |
| アプリ名メニュー | About、環境設定、サービス、非表示、終了              |
| File             | 新規、開く、保存、閉じる                             |
| Edit             | 取り消し、やり直し、カット、コピー、ペースト、全選択 |
| View             | 表示切替、ズーム、サイドバー、フルスクリーン         |
| Window           | 最小化、ズーム、ウィンドウ切替                       |
| Help             | ヘルプを検索、ドキュメント、サポート                 |

---

## インタラクション設計

### ローディング状態の表示

| パターン             | 使用場面                         | 実装方針                         |
| -------------------- | -------------------------------- | -------------------------------- |
| インラインスピナー   | ボタン内、入力フィールド横       | 元の要素サイズを維持             |
| スケルトンスクリーン | リスト、カード、コンテンツ領域   | 実際のコンテンツと同じ形状で表示 |
| プログレスバー       | ファイルアップロード、長時間処理 | 進捗率を数値でも表示する         |
| オーバーレイ         | ページ全体、モーダル内           | 使用は最小限に                   |

**ベストプラクティス**

- 200ms以上かかる処理にのみローディング表示を行う
- 処理完了後は即座にローディングを非表示にする
- 可能であれば残り時間や進捗を表示する
- キャンセル可能な処理にはキャンセルボタンを提供する

### エラー状態の表示

| 種類               | 表示方法                       | 例                                     |
| ------------------ | ------------------------------ | -------------------------------------- |
| フィールドエラー   | 入力フィールド直下に赤字で表示 | メールアドレスの形式が正しくありません |
| フォームエラー     | フォーム上部にまとめて表示     | エラー件数とリンク付きリスト           |
| トースト通知       | 画面端に一時的に表示           | API通信エラー、保存失敗                |
| インラインアラート | コンテンツ内に埋め込み         | 権限不足、機能制限の説明               |
| フルページエラー   | 画面全体をエラー表示に         | 404、500、ネットワークエラー           |

**メッセージの書き方**

- 何が起きたかを明確に伝える
- ユーザーが次に何をすべきかを示す
- 技術的な詳細は避け、平易な言葉を使う

### Error Boundaryパターン

React Error Boundaryを使用して、コンポーネントツリー内のエラーをキャッチし、ユーザーフレンドリーなフォールバックUIを表示する。

| コンポーネント      | 配置場所                   | 用途                     |
| ------------------- | -------------------------- | ------------------------ |
| `AuthErrorBoundary` | 認証コンポーネントをラップ | 認証関連エラーのキャッチ |

**Error Boundaryの実装原則**

| 原則             | 説明                                                       |
| ---------------- | ---------------------------------------------------------- |
| 適切な粒度       | 機能単位でError Boundaryを配置（認証、チャット、グラフ等） |
| フォールバックUI | エラー内容を日本語で表示し、再試行ボタンを提供             |
| エラーログ       | `componentDidCatch`でエラー情報をログ出力                  |
| アクセシビリティ | `role="alert"`, `aria-live="assertive"`を適用              |

**フォールバックUIの構成**

| 要素             | 仕様                               |
| ---------------- | ---------------------------------- |
| アイコン         | `alert-triangle`（赤色、48px）     |
| タイトル         | 「エラーが発生しました」           |
| 説明文           | エラーの概要と次のアクションを案内 |
| アクションボタン | 「再試行」ボタンで状態をリセット   |
| スタイル         | GlassPanelでモーダル風に中央配置   |

### アニメーション・トランジション

| 種類             | 継続時間  | イージング  | 用途                         |
| ---------------- | --------- | ----------- | ---------------------------- |
| 瞬時（Instant）  | 0-100ms   | -           | ホバー、ボタンプレス         |
| 高速（Fast）     | 100-200ms | ease-out    | ツールチップ、ドロップダウン |
| 標準（Normal）   | 200-300ms | ease-in-out | モーダル、パネル、ページ遷移 |
| 強調（Emphasis） | 300-500ms | ease-out    | オンボーディング、重要な変更 |

**原則**

- アニメーションは目的を持って使用する
- ユーザーの操作を妨げない速度にする
- `prefers-reduced-motion`で簡略化オプションを提供する
- CPUリソースへの影響を考慮し、`transform`と`opacity`を優先する

### フィードバック原則

| 操作            | フィードバック         | タイミング               |
| --------------- | ---------------------- | ------------------------ |
| クリック/タップ | 視覚的な押下状態       | 即時                     |
| ホバー          | 色の変化、カーソル変更 | 即時                     |
| フォーカス      | フォーカスリング表示   | 即時                     |
| 入力            | バリデーション結果     | blur時またはリアルタイム |
| 送信            | 成功/失敗の通知        | 処理完了後               |
| ドラッグ        | ドラッグ中の視覚表現   | ドラッグ開始時           |

---

## アクセシビリティ（WCAG 2.1 AA準拠）

### キーボードナビゲーション

| 要件                             | 実装方針                                 |
| -------------------------------- | ---------------------------------------- |
| 全機能にキーボードでアクセス可能 | マウス専用の操作を作らない               |
| 論理的なタブ順序                 | DOMの順序を視覚的な順序と一致させる      |
| フォーカストラップ               | モーダル内でフォーカスを閉じ込める       |
| ショートカット                   | 主要操作に割り当て、ヘルプで一覧表示     |
| スキップリンク                   | メインコンテンツへのスキップリンクを提供 |

| キー      | 期待される動作                           |
| --------- | ---------------------------------------- |
| Tab       | 次のインタラクティブ要素へ移動           |
| Shift+Tab | 前のインタラクティブ要素へ移動           |
| Enter     | ボタンの実行、リンクの遷移               |
| Space     | チェックボックスのトグル、ボタン実行     |
| Escape    | モーダルを閉じる、ドロップダウンを閉じる |
| 矢印キー  | リスト内の移動、ラジオボタンの選択       |

### スクリーンリーダー対応

| 要件                 | 実装方針                                         |
| -------------------- | ------------------------------------------------ |
| 適切なHTML要素を使用 | `<button>`, `<a>`, `<nav>`, `<main>`, `<header>` |
| 見出しの階層構造     | `<h1>`から順番に使用、レベルをスキップしない     |
| 代替テキスト         | 画像には`alt`属性、装飾画像は`alt=""`            |
| ライブリージョン     | 動的コンテンツには`aria-live`を使用              |
| フォームラベル       | 全入力フィールドに`<label>`を関連付け            |

### フォーカス管理

| シナリオ         | フォーカス移動先                       |
| ---------------- | -------------------------------------- |
| モーダルを開く   | モーダル内の最初のインタラクティブ要素 |
| モーダルを閉じる | モーダルを開いたトリガー要素           |
| ページ遷移       | ページのメインコンテンツ領域           |
| エラー発生       | 最初のエラーフィールド                 |
| 要素の削除       | 削除された要素の前後の要素             |

**フォーカスインジケータ**

- 2px以上の太さで視認性を確保
- 背景とのコントラスト比3:1以上
- `outline-offset`で要素から離して表示
- `:focus-visible`で意図的なフォーカスのみ表示

### 色だけに頼らない情報伝達

| 情報           | 追加の伝達方法                          |
| -------------- | --------------------------------------- |
| エラー状態     | アイコン（警告マーク）+ テキストラベル  |
| 成功/失敗      | アイコン + 明確なメッセージ             |
| 必須フィールド | アスタリスク + テキスト「（必須）」     |
| リンク         | 下線 + ホバー時の色変化                 |
| 選択状態       | 背景色 + チェックマークアイコン         |
| ステータス     | 色 + テキストラベル（例：進行中、完了） |

---

## Agent Execution UI コンポーネント（AGENT-004）

エージェント実行画面のUI/UXコンポーネント仕様。チャットインターフェース、ストリーミング出力、権限確認ダイアログを提供する。

### コンポーネント階層

```
AgentExecutionView (views)
├── Header
│   ├── BackButton
│   └── SkillInfo
├── AgentChatInterface (organisms)
│   ├── MessageList
│   │   └── MessageItem (複数)
│   └── AgentOutputStream (molecules)
│       └── StreamingText
├── AgentExecutionControls (molecules)
│   ├── CancelButton
│   └── ClearButton
├── AgentMessageInput (molecules)
│   ├── TextInput
│   └── SendButton
└── PermissionDialog (organisms, モーダル)
    ├── DialogHeader
    ├── PermissionDetails
    ├── RememberCheckbox
    └── ActionButtons (Allow/Deny)
```

### コンポーネント仕様

#### AgentExecutionView

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/views/AgentExecutionView/` |
| 責務 | メインビュー、ルーティング、レイアウト、状態接続 |
| Props | `skillId: string` (オプション) |
| 状態管理 | Zustand agentSlice使用 |

**レイアウト構造**

```
┌─────────────────────────────────────┐
│          ヘッダー（戻るボタン）      │
├─────────────────────────────────────┤
│                                     │
│    チャットインターフェース          │
│    （メッセージ履歴・ストリーミング）│
│                                     │
├─────────────────────────────────────┤
│   [キャンセル] [クリア]             │
├─────────────────────────────────────┤
│   メッセージを入力...  [送信]       │
└─────────────────────────────────────┘
```

#### AgentChatInterface

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/components/organisms/AgentChatInterface/` |
| 責務 | メッセージ履歴表示、自動スクロール、ストリーミング統合 |
| Props | `messages: AgentMessage[]`, `streamingContent: string` |

**振る舞い**

| シナリオ | 動作 |
| -------- | ---- |
| 新規メッセージ | 自動スクロールで最新メッセージを表示 |
| ストリーミング中 | リアルタイムで差分テキストを追記表示 |
| 長いメッセージ | 折り返し表示、Markdownレンダリング |

#### AgentMessageInput

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/components/molecules/AgentMessageInput/` |
| 責務 | テキスト入力、送信トリガー |
| Props | `onSubmit: (message: string) => void`, `disabled: boolean` |

**キーボード操作**

| キー | 動作 |
| ---- | ---- |
| Enter | メッセージ送信（テキストがある場合） |
| Shift+Enter | 改行挿入 |
| Escape | 入力クリア |

**状態制御**

| 状態 | 送信ボタン | テキスト入力 |
| ---- | ---------- | ------------ |
| idle | 有効 | 有効 |
| executing | 無効 | 無効 |
| streaming | 無効 | 無効 |
| awaiting_permission | 無効 | 無効 |

#### AgentExecutionControls

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/components/molecules/AgentExecutionControls/` |
| 責務 | 実行制御（キャンセル・クリア） |
| Props | `onCancel: () => void`, `onClear: () => void`, `status: AgentExecutionStatus` |

**ボタン状態**

| ボタン | idle | executing/streaming | awaiting_permission | completed/error |
| ------ | ---- | ------------------- | ------------------- | --------------- |
| キャンセル | 無効 | 有効 | 有効 | 無効 |
| クリア | 有効（履歴あり時） | 無効 | 無効 | 有効 |

#### PermissionDialog

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/components/organisms/PermissionDialog/` |
| 責務 | ツール使用権限確認、フォーカストラップ、「常に許可」機能 |
| Props | `request: PermissionRequest`, `onAllow: (remember: boolean) => void`, `onDeny: (remember: boolean) => void` |

**モーダル構成**

```
┌─────────────────────────────────────┐
│  ⚠️ 権限の確認                      │
├─────────────────────────────────────┤
│                                     │
│  「Edit」ツールを実行してもいいですか？│
│                                     │
│  引数:                              │
│  file_path: /path/to/file.ts        │
│                                     │
│  ☐ この選択を記憶する               │
│                                     │
├─────────────────────────────────────┤
│        [拒否]        [許可]         │
└─────────────────────────────────────┘
```

**アクセシビリティ**

| 要件 | 実装 |
| ---- | ---- |
| フォーカストラップ | モーダル内でTabキーがループ |
| Escapeで閉じる | 拒否として処理 |
| 初期フォーカス | 「許可」ボタンにフォーカス |
| aria属性 | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |

**キーボード操作**

| キー | 動作 |
| ---- | ---- |
| Tab | 次の要素へ移動（チェックボックス→拒否→許可→チェックボックス...） |
| Shift+Tab | 前の要素へ移動 |
| Enter | フォーカス中のボタン実行 |
| Escape | 拒否として閉じる |
| Space | チェックボックストグル |

#### AgentOutputStream

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/components/molecules/AgentOutputStream/` |
| 責務 | ストリーミングテキストのリアルタイム表示 |
| Props | `content: string`, `isStreaming: boolean` |

**振る舞い**

| 状態 | 表示 |
| ---- | ---- |
| ストリーミング中 | テキスト + カーソル点滅アニメーション |
| ストリーミング完了 | テキストのみ |

### インタラクション設計

#### メッセージ送信フロー

```
1. ユーザーがテキスト入力
   ↓
2. Enterキーまたは送信ボタン押下
   ↓
3. ユーザーメッセージをチャットに追加
   ↓
4. 入力欄をクリア & 無効化
   ↓
5. agent:start IPC送信
   ↓
6. ストリーミング応答を受信・表示
   ↓
7. 完了後、入力欄を有効化
```

#### 権限確認フロー

```
1. Main Processから権限確認要求を受信
   ↓
2. PermissionDialogをモーダル表示
   ↓
3. フォーカスを「許可」ボタンに移動
   ↓
4. ユーザーが選択（許可/拒否）
   ↓
5. 「記憶する」チェック時はローカル保存
   ↓
6. agent:permission:res IPC送信
   ↓
7. ダイアログを閉じ、フォーカスを元に戻す
```

### 視覚デザイン

#### メッセージバブル

| ロール | 背景色 | 配置 |
| ------ | ------ | ---- |
| user | プライマリ薄色 | 右寄せ |
| assistant | セカンダリ薄色 | 左寄せ |
| system | グレー | 中央 |

#### ステータスインジケータ

| 状態 | 視覚表現 |
| ---- | -------- |
| idle | なし |
| executing | ローディングスピナー |
| streaming | カーソル点滅 |
| awaiting_permission | モーダル表示 |
| completed | 成功アイコン（緑チェック） |
| error | エラーアイコン（赤×） |
| cancelled | キャンセルアイコン（グレー） |

### アクセシビリティ（WCAG 2.1 AA）

| 要件 | 実装方法 |
| ---- | -------- |
| キーボードナビゲーション | Tab順序の論理的配置 |
| スクリーンリーダー | `aria-live="polite"` でストリーミング更新を通知 |
| フォーカス管理 | PermissionDialog開閉時の適切なフォーカス移動 |
| 色コントラスト | 4.5:1以上のコントラスト比確保 |
| エラー状態 | アイコン + テキストで色以外でも伝達 |

### 関連ドキュメント

| ドキュメント | パス |
| ------------ | ---- |
| Agent SDK仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` |
| Agent Execution UI実装ガイド | `docs/30-workflows/agent-execution-ui/outputs/phase-12/implementation-guide.md` |
| コンポーネント設計書 | `docs/30-workflows/agent-execution-ui/outputs/phase-2/component-design.md` |

---

## Community Visualization UI コンポーネント（CONV-08-05）

コミュニティ構造を可視化するUIコンポーネント群。グラフベースのコミュニティ表示、フィルタリング、検索、詳細表示などの機能を提供する。

### コンポーネント階層

```
CommunityVisualization (templates)
├── CommunityFilter (organisms)
│   ├── レベル選択ドロップダウン
│   └── 検索入力
├── CommunityGraph (organisms)
│   ├── SVGベースのグラフ描画
│   ├── ノード（コミュニティ）
│   └── エッジ（親子関係）
└── CommunityDetailPanel (organisms)
    ├── 基本情報（ID、レベル、サイズ）
    ├── 要約テキスト
    ├── キーワードリスト
    └── メンバーエンティティリスト
```

### コンポーネント仕様

#### CommunityVisualization

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/components/community/templates/CommunityVisualization/` |
| 責務 | 全体レイアウト、状態管理、コンポーネント統合 |
| Props | `className?: string` |

**レイアウト構造**

```
┌─────────────────────────────────────┐
│    フィルターバー（レベル・検索）    │
├───────────────────────┬─────────────┤
│                       │             │
│    グラフエリア        │  詳細パネル  │
│  （ズーム/パン対応）   │（選択時表示）│
│                       │             │
└───────────────────────┴─────────────┘
```

#### CommunityGraph

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/components/community/organisms/CommunityGraph/` |
| 責務 | SVGベースのグラフ描画、ズーム/パン、ノード選択 |
| Props | `communities`, `selectedId`, `highlightedIds`, `onSelect`, `onZoomChange` |

**機能**

| 機能 | 説明 |
| ---- | ---- |
| 階層レイアウト | dagreアルゴリズムによるレベル別配置 |
| ズーム/パン | マウスホイール、ドラッグ操作 |
| ノード選択 | クリックで選択、詳細パネル表示 |
| ハイライト | 検索結果マッチノードの強調表示 |
| キーボード操作 | Tab/Enter/Escapeでナビゲーション |

#### CommunityDetailPanel

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/components/community/organisms/CommunityDetailPanel/` |
| 責務 | 選択コミュニティの詳細情報表示 |
| Props | `community`, `summary`, `members`, `isLoading`, `onClose` |

**表示内容**

| セクション | 内容 |
| ---------- | ---- |
| ヘッダー | コミュニティID、レベル、サイズ |
| 要約 | CommunitySummaryのテキスト |
| キーワード | タグ形式で表示 |
| 主要エンティティ | 重要度順リスト |
| センチメント | ポジティブ/ニュートラル/ネガティブ |
| メンバー | エンティティリスト（スクロール可能） |

#### CommunityFilter

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/components/community/organisms/CommunityFilter/` |
| 責務 | レベルフィルタリング、検索機能 |
| Props | `levels`, `selectedLevel`, `searchQuery`, `totalCount`, `filteredCount`, `onChange` |

**機能**

| 機能 | 説明 |
| ---- | ---- |
| レベル選択 | ドロップダウンで階層レベル絞り込み |
| キーワード検索 | デバウンス付きテキスト入力 |
| カウント表示 | フィルター結果件数表示 |
| クリア | Escapeキーまたはクリアボタン |

### IPC API

```typescript
interface CommunityAPI {
  getAll(): Promise<Result<Community[]>>;
  getByLevel(level: number): Promise<Result<Community[]>>;
  getSummary(communityId: CommunityId): Promise<Result<CommunitySummary | null>>;
  getMembers(communityId: CommunityId): Promise<Result<StoredEntity[]>>;
  search(query: string): Promise<Result<Community[]>>;
}
```

### 使用ライブラリ

| ライブラリ | バージョン | 用途 |
| ---------- | ---------- | ---- |
| dagre | ^0.8.5 | 階層グラフレイアウトアルゴリズム |

### アクセシビリティ（WCAG 2.1 AA）

| 要件 | 実装方法 |
| ---- | -------- |
| キーボードナビゲーション | Tab順序、Enter/Escapeでの操作 |
| スクリーンリーダー | aria-label、role属性の適切な設定 |
| フォーカス管理 | パネル開閉時のフォーカス移動 |
| 色コントラスト | 4.5:1以上のコントラスト比確保 |

### 関連ドキュメント

| ドキュメント | パス |
| ------------ | ---- |
| 実装ガイド | `docs/30-workflows/community-visualization-ui/outputs/phase-12/implementation-guide.md` |
| コンポーネント設計書 | `docs/30-workflows/community-visualization-ui/outputs/phase-2/component-design.md` |
| 最終レビュー | `docs/30-workflows/community-visualization-ui/outputs/phase-10/final-review.md` |

---

## Custom Execution Environment UI コンポーネント（AGENT-006）

エージェント実行結果をリアルタイムでプレビューするためのUIコンポーネント群。
HTML、Markdownのプレビューに対応し、3層セキュリティ防御を実装。

### コンポーネント階層

```
AgentExecutionView (views)
├── SplitLayout (organisms)
│   ├── leftPanel
│   │   └── AgentChatInterface (既存)
│   ├── Divider
│   └── rightPanel
│       └── ExecutionEnvironment (organisms)
│           ├── EnvironmentSelector (molecules)
│           └── HTMLPreviewEnvironment / MarkdownPreviewEnvironment
```

### コンポーネント仕様

| コンポーネント             | 種類     | 責務                              |
| -------------------------- | -------- | --------------------------------- |
| SplitLayout                | organism | 左右分割レイアウト、ドラッグ調整  |
| EnvironmentSelector        | molecule | 環境タイプ選択ドロップダウン      |
| ExecutionEnvironment       | organism | 環境タイプに応じたプレビュー切替  |
| HTMLPreviewEnvironment     | organism | sandbox iframe内でHTMLを安全表示  |
| MarkdownPreviewEnvironment | organism | Markdownをレンダリング表示        |

### ファイル配置

| コンポーネント             | パス                                                                    |
| -------------------------- | ----------------------------------------------------------------------- |
| SplitLayout                | `apps/desktop/src/renderer/components/organisms/SplitLayout/`           |
| EnvironmentSelector        | `apps/desktop/src/renderer/components/molecules/EnvironmentSelector/`   |
| ExecutionEnvironment       | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/`  |
| HTMLPreviewEnvironment     | `apps/desktop/src/renderer/components/organisms/HTMLPreviewEnvironment/`|
| MarkdownPreviewEnvironment | `apps/desktop/src/renderer/components/organisms/MarkdownPreviewEnvironment/` |
| sanitize.ts                | `apps/desktop/src/renderer/utils/sanitize.ts`                           |

### SplitLayout Props

| Prop            | 型                      | 必須 | デフォルト | 説明               |
| --------------- | ----------------------- | ---- | ---------- | ------------------ |
| leftPanel       | `React.ReactNode`       | ✓    | -          | 左パネルコンテンツ |
| rightPanel      | `React.ReactNode`       | ✓    | -          | 右パネルコンテンツ |
| initialRatio    | `number`                | -    | 50         | 初期分割比率 (%)   |
| minRatio        | `number`                | -    | 20         | 最小比率 (%)       |
| maxRatio        | `number`                | -    | 80         | 最大比率 (%)       |
| onRatioChange   | `(ratio: number) => void` | -  | -          | 比率変更コールバック |
| showRightPanel  | `boolean`               | -    | true       | 右パネル表示       |
| className       | `string`                | -    | -          | カスタムクラス     |

### SplitLayout キーボード操作

| キー       | 動作             |
| ---------- | ---------------- |
| ArrowLeft  | 左パネルを5%縮小 |
| ArrowRight | 左パネルを5%拡大 |
| Home       | 最小比率に設定   |
| End        | 最大比率に設定   |

### セキュリティ（3層防御）

| レイヤー | 実装                   | 防御対象                         |
| -------- | ---------------------- | -------------------------------- |
| Layer 1  | DOMPurify HTMLサニタイズ | scriptタグ、イベントハンドラ除去 |
| Layer 2  | CSP（script-src 'none'） | インラインスクリプト防止         |
| Layer 3  | iframe sandbox         | スクリプト実行、ポップアップ禁止 |

### アクセシビリティ

| 要件               | 実装                                   |
| ------------------ | -------------------------------------- |
| キーボードナビ     | Dividerにtabindex=0、矢印キー対応      |
| スクリーンリーダー | aria-label、aria-valuemin/max/now属性  |
| フォーカス管理     | フォーカスリング表示                   |
| 色コントラスト     | WCAG 2.1 AA 4.5:1以上                  |

### 関連ドキュメント（AGENT-006）

| ドキュメント   | パス                                                             |
| -------------- | ---------------------------------------------------------------- |
| 実装ガイド     | `docs/30-workflows/custom-environment-ui/outputs/phase-12/implementation-guide.md` |
| APIドキュメント | `docs/30-workflows/custom-environment-ui/outputs/phase-12/api-documentation.md` |
| セキュリティ設計 | `docs/30-workflows/custom-environment-ui/outputs/phase-2/security-design.md` |

---

## workspace-chat-edit-ui コンポーネント（Issue #468）

AIアシスタントとのチャット中にファイル編集を依頼し、差分プレビュー・適用を行うためのUIコンポーネント群。

### コンポーネント階層

```
ChatView (views)
├── FileContextDropZone (organisms)
│   └── ChatContent
├── FileContextBadge (molecules, 複数)
├── EditCommandInput (molecules)
│   ├── CommandTypeSelector
│   └── TextInput + SendButton
└── DiffPreview (organisms, モーダル)
    ├── DiffEditor
    │   └── Monaco DiffEditor
    └── ApplyControls
```

### コンポーネント仕様

#### FileContextBadge

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextBadge.tsx` |
| 責務 | 添付ファイルの表示と削除 |
| Props | `file: FileContext`, `isSelected?: boolean`, `onRemove?: (id) => void`, `onClick?: (id) => void` |

#### ApplyControls

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/ApplyControls.tsx` |
| 責務 | 差分の適用または却下 |
| Props | `resultId: string`, `onApplied?: () => void`, `onRejected?: () => void` |

#### FileContextDropZone

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/FileContextDropZone.tsx` |
| 責務 | ドラッグ&ドロップでのファイル添付 |
| Props | `children: ReactNode`, `disabled?: boolean`, `onFilesDropped?: (files) => void` |

#### DiffPreview

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/DiffPreview.tsx` |
| 責務 | 差分プレビューモーダルの表示 |
| Props | `original: string`, `modified: string`, `fileName: string`, `language?: string`, `resultId: string`, `onClose: () => void`, `onApplied?: () => void` |

#### DiffEditor

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/DiffEditor.tsx` |
| 責務 | Monaco Editorによる差分表示 |
| Props | `original: string`, `modified: string`, `language?: string`, `height?: string | number` |

#### EditCommandInput

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/features/workspace-chat-edit/components/EditCommandInput.tsx` |
| 責務 | 編集コマンドの入力と送信 |
| Props | `onSubmit: (command: EditCommand) => void`, `disabled?: boolean`, `placeholder?: string` |

### 状態管理

| Hook | 責務 |
| ---- | ---- |
| useFileContext | ファイルコンテキストの管理（添付/削除/クリア） |
| useDiffApply | 差分適用状態の管理（適用/却下/リセット） |

### バリデーション

| 項目 | 制限値 |
| ---- | ------ |
| 最大ファイル数 | 10ファイル |
| 最大ファイルサイズ | 10MB |

### キーボード操作

| キー | コンポーネント | 動作 |
| ---- | -------------- | ---- |
| Delete/Backspace | FileContextBadge | 選択中のバッジを削除 |
| Ctrl+Enter | EditCommandInput | コマンド送信 |
| Escape | DiffPreview | プレビューを閉じる |
| Tab | DiffPreview | フォーカストラップ内を循環 |

### アクセシビリティ（WCAG 2.1 AA）

| 要件 | 実装方法 |
| ---- | -------- |
| キーボードナビゲーション | 全要素にtabIndex設定 |
| スクリーンリーダー | aria-label、role属性の適切な設定 |
| フォーカス管理 | DiffPreview開閉時のフォーカス移動 |
| 色コントラスト | 4.5:1以上のコントラスト比確保 |

### 関連ドキュメント

| ドキュメント | パス |
| ------------ | ---- |
| 実装ガイド | `docs/30-workflows/workspace-chat-edit-ui/outputs/phase-12/implementation-guide.md` |
| コンポーネント設計書 | `docs/30-workflows/workspace-chat-edit-ui/outputs/phase-2/component-design.md` |
| アクセシビリティ設計 | `docs/30-workflows/workspace-chat-edit-ui/outputs/phase-2/accessibility-design.md` |

---

## SkillStreamDisplay コンポーネント（TASK-3-2）

スキル実行結果をリアルタイムでストリーミング表示するUIコンポーネント。

### コンポーネント階層

```
SkillStreamDisplay (organisms)
├── StreamHeader
│   ├── StatusBadge
│   ├── AbortButton (running時)
│   └── ResetButton (completed/error/aborted時)
└── StreamContent (role="log", aria-live="polite")
    └── MessageItem (複数, React.memo)
```

### コンポーネント仕様

#### SkillStreamDisplay

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` |
| 責務 | スキル実行ストリームの表示、実行制御 |
| 依存Hook | `useSkillExecution` |

**Props**

| Prop | 型 | 必須 | デフォルト | 説明 |
| ---- | --- | ---- | ---------- | ---- |
| skillId | `string` | Yes | - | 実行対象のスキルID |
| initialPrompt | `string` | No | - | 初期プロンプト |
| autoExecute | `boolean` | No | false | 自動実行フラグ |
| onComplete | `() => void` | No | - | 完了時コールバック |
| onError | `(error: SkillExecutionError) => void` | No | - | エラー時コールバック |
| onStatusChange | `(status: string) => void` | No | - | ステータス変更コールバック |
| height | `string \| number` | No | "auto" | コンポーネント高さ |
| className | `string` | No | - | カスタムクラス名 |

**ステータス表示**

| ステータス | 日本語表示 | 色 |
| ---------- | ---------- | --- |
| idle | 待機中 | gray |
| running | 実行中 | blue |
| completed | 完了 | green |
| error | エラー | red |
| aborted | 中断 | red |

#### useSkillExecution Hook

| 項目 | 仕様 |
| ---- | ---- |
| ファイル | `apps/desktop/src/renderer/hooks/useSkillExecution.ts` |
| 責務 | スキル実行状態管理、IPC通信 |

**戻り値**

| プロパティ | 型 | 説明 |
| ---------- | --- | ---- |
| messages | `SkillStreamMessage[]` | ストリームメッセージ一覧 |
| status | `ExecutionStatus` | 現在のステータス |
| executionId | `string \| null` | 現在の実行ID |
| error | `SkillExecutionError \| null` | エラー情報 |
| isAborting | `boolean` | 中断処理中フラグ |
| execute | `(prompt: string) => Promise<Response>` | 実行開始関数 |
| abort | `() => Promise<void>` | 中断関数 |
| reset | `() => void` | リセット関数 |

### IPC API（Preload）

```typescript
interface SkillAPI {
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;
  abort: (executionId: string) => Promise<boolean>;
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;
}
```

**IPCチャンネル**

| チャンネル | 方向 | 用途 |
| ---------- | ---- | ---- |
| skill:execute | Renderer → Main | 実行開始 |
| skill:stream | Main → Renderer | メッセージストリーム |
| skill:abort | Renderer → Main | 実行中断 |
| skill:get-status | Renderer → Main | ステータス照会 |

### アクセシビリティ（WCAG 2.1 AA）

| 要件 | 実装方法 |
| ---- | -------- |
| キーボードナビゲーション | 標準ボタン要素使用 |
| スクリーンリーダー | `role="log"`, `aria-live="polite"`, sr-only ステータス通知 |
| フォーカス管理 | ボタンに`aria-label`設定 |
| 色コントラスト | Tailwind CSS標準色（4.5:1以上） |

### 関連ドキュメント

| ドキュメント           | パス                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| 実装ガイド             | `docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/outputs/phase-12/implementation-guide.md` |
| Agent SDK仕様          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`                    |
| タスク仕様書           | `docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/`                                    |
| 後続タスク（UX改善）   | `docs/30-workflows/unassigned-task/task-3-2-A-skill-stream-ux-improvements.md`                 |

---

## 完了タスク

| Issue # | 機能名 | 完了日 | 関連ドキュメント |
| ------- | ------ | ------ | ---------------- |
| TASK-3-2 | skillexecutor-ipc-integration | 2026-01-25 | `docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/` |
| #468 | workspace-chat-edit-ui | 2026-01-25 | `docs/30-workflows/workspace-chat-edit-ui/` |

---
