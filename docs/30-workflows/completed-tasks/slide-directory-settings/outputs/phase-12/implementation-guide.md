# スライド出力ディレクトリ設定機能 - 実装ガイド

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| 機能名   | スライド出力ディレクトリ設定 |
| 作成日   | 2026-01-14                   |
| 対象読者 | 開発者・技術者・学習者       |

---

# Part 1: 概念的な説明（中学生でもわかる版）

## 1. スライド出力ディレクトリ設定って何？

### 1.1 身近な例で考えてみよう

スマホで写真を撮ったとき、その写真はどこに保存されますか？
普通は「カメラロール」や「ギャラリー」に自動的に保存されますよね。

でも、もし「仕事の写真は仕事フォルダに」「旅行の写真は旅行フォルダに」と
自分で選べたら便利だと思いませんか？

```
今までのスライド保存:
┌─────────────────┐
│ 固定の場所に保存 │ ← 変更できない！
└─────────────────┘

今回作った機能:
┌─────────────────┐
│ 好きな場所を選ぶ │ ← 自分で決められる！
└─────────────────┘
        ↓
  プレゼン資料/
  仕事/スライド/
  プロジェクトA/
  ...どこでもOK！
```

### 1.2 なぜ必要なの？

今まで、プレゼンテーション作成スキルで作ったスライドは、
決められた場所（`05_Project/スライド/`）にしか保存できませんでした。

これだと困る場面:

- 仕事用と個人用で保存場所を分けたい
- プロジェクトごとにスライドを管理したい
- 外付けハードディスクに直接保存したい

### 1.3 今回作ったもの

| 日本語       | 英語             | 役割                             |
| ------------ | ---------------- | -------------------------------- |
| 設定画面     | Settings UI      | ユーザーが保存場所を選ぶ画面     |
| 設定ストア   | Settings Store   | 選んだ場所を覚えておく仕組み     |
| フォルダ選択 | Directory Dialog | OSのフォルダ選択画面を開く機能   |
| 入力チェック | Validation       | 選んだ場所が使えるか確認する機能 |

---

## 2. どうやって動くの？

### 2.1 全体の流れ

```
ユーザーが設定を変更するとき:

1. 設定画面を開く
       ↓
2. 「フォルダを選択」ボタンを押す
       ↓
3. OSのフォルダ選択画面が開く
       ↓
4. フォルダを選ぶ
       ↓
5. 選んだ場所が使えるかチェック
   ├─ OK → 設定を保存
   └─ NG → エラーメッセージを表示
       ↓
6. アプリを閉じても設定は残る！
```

### 2.2 データの保存方法

スライドの保存場所は、パソコンの中にある設定ファイルに記録されます。

**SlideSettings（スライド設定）**:
| 項目 | 説明 | 例 |
| -------------------- | ------------------------------ | ------------------------- |
| outputDirectory | スライドの保存場所 | /Users/me/Documents/Slides|
| autoCreateDirectory | フォルダを自動で作るか | true（作る）/ false |

---

## 3. 作ったものの全体像

```
┌─────────────────────────────────────────────────────────────┐
│                    デスクトップアプリ                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐      IPC通信      ┌─────────────────┐  │
│  │   設定画面      │ ←───────────────→ │   設定ストア    │  │
│  │ （ユーザー操作）│    安全なやり取り  │ （設定を保存）  │  │
│  └─────────────────┘                   └─────────────────┘  │
│          │                                     │            │
│          │ フォルダ選択                        │ ファイルに │
│          ↓                                     ↓ 記録       │
│  ┌─────────────────┐                   ┌─────────────────┐  │
│  │ OSのダイアログ  │                   │   config.json   │  │
│  │ （フォルダ選択）│                   │ （設定ファイル）│  │
│  └─────────────────┘                   └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

# Part 2: 技術的な詳細（開発者向け）

## 1. アーキテクチャ概要

### 1.1 ファイル構成

```
apps/desktop/src/
├── main/
│   ├── settings/
│   │   └── slideSettingsStore.ts      # electron-storeによる永続化
│   └── ipc/
│       └── slideSettingsHandlers.ts   # IPCハンドラー登録
├── preload/
│   ├── channels.ts                    # チャンネル定義（ホワイトリスト）
│   ├── types.ts                       # 型定義
│   └── index.ts                       # contextBridge API公開
└── renderer/
    ├── components/settings/
    │   └── SlideDirectorySettings.tsx # 設定UIコンポーネント
    └── hooks/
        └── useSlideSettings.ts        # カスタムフック

packages/shared/src/types/
└── slideSettings.ts                   # 共有型定義
```

### 1.2 レイヤー構成

```
┌─────────────────────────────────────────────────────────────┐
│  Renderer Process                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ SlideDirectorySettings.tsx                           │   │
│  │ - UIコンポーネント                                   │   │
│  │ - useSlideSettings フック使用                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │ window.slideSettingsAPI         │
└───────────────────────────┼─────────────────────────────────┘
                            │ contextBridge
┌───────────────────────────┼─────────────────────────────────┐
│  Preload Script           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ preload/index.ts                                     │   │
│  │ - slideSettingsAPI を公開                            │   │
│  │ - ipcRenderer.invoke をラップ                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │ IPC通信                         │
└───────────────────────────┼─────────────────────────────────┘
                            │ SLIDE_SETTINGS_CHANNELS
┌───────────────────────────┼─────────────────────────────────┐
│  Main Process             │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ slideSettingsHandlers.ts                             │   │
│  │ - validateIpcSender() でsender検証                   │   │
│  │ - slideSettingsStore 呼び出し                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ slideSettingsStore.ts                                │   │
│  │ - electron-store による永続化                        │   │
│  │ - detectPathTraversal() でセキュリティチェック       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. セキュリティ設計（設計理由付き）

### 2.1 IPCチャンネルホワイトリスト

```typescript
// apps/desktop/src/preload/channels.ts
export const SLIDE_SETTINGS_CHANNELS = {
  GET_DIRECTORY: "slideSettings:getDirectory",
  SET_DIRECTORY: "slideSettings:setDirectory",
  SELECT_DIRECTORY: "slideSettings:selectDirectory",
  VALIDATE_DIRECTORY: "slideSettings:validateDirectory",
  GET_ALL: "slideSettings:getAll",
} as const;

// なぜホワイトリスト: 未定義のチャンネルを拒否し、攻撃対象を限定
// なぜas const: 型安全性を確保、typoを防止
```

### 2.2 IPC sender検証

```typescript
// apps/desktop/src/main/ipc/slideSettingsHandlers.ts
function validateIpcSender(event: IpcMainInvokeEvent): void {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);

  if (!win) {
    throw new Error("INVALID_SENDER: No associated window");
  }

  if (webContents.getURL().startsWith("devtools://")) {
    throw new Error("INVALID_SENDER: DevTools access denied");
  }
}

// なぜsender検証: DevToolsコンソールからの不正呼び出しを防止
// なぜBrowserWindowチェック: 正規のウィンドウからの呼び出しのみ許可
```

### 2.3 パストラバーサル防止

```typescript
// apps/desktop/src/main/settings/slideSettingsStore.ts
const TRAVERSAL_PATTERNS = [
  "..", // 標準の親ディレクトリ参照
  "%2e%2e", // URLエンコード（小文字）
  "%2E%2E", // URLエンコード（大文字）
  "%2e.", // 混合エンコード
  ".%2e", // 混合エンコード
  "..%c0%af", // UTF-8オーバーロング
  "..%c1%9c", // UTF-8オーバーロング
  "\0", // ヌルバイト
];

function detectPathTraversal(inputPath: string): boolean {
  // Unicode正規化（NFC）で統一
  const normalized = inputPath.normalize("NFC");
  // URLデコードして検査
  const decoded = decodeURIComponent(normalized);

  return TRAVERSAL_PATTERNS.some(
    (pattern) => decoded.includes(pattern) || normalized.includes(pattern),
  );
}

// なぜUnicode正規化: 同じ文字の異なる表現を統一（U+00E9 vs U+0065 U+0301）
// なぜ複数パターン: エンコーディングを変えた攻撃を網羅的に検出
// なぜ32テストケース: 既知の攻撃パターンを全てカバー
```

### 2.4 設計判断の根拠

| 設計判断       | 選択肢                          | 採用理由                                 |
| -------------- | ------------------------------- | ---------------------------------------- |
| チャンネル管理 | ホワイトリスト / ブラックリスト | ホワイトリスト: 未知の攻撃を防止         |
| 永続化方式     | electron-store / SQLite         | electron-store: 設定用途に最適化、軽量   |
| パス検証       | 正規表現 / パターンマッチ       | パターンマッチ: 可読性が高く保守しやすい |
| Unicode正規化  | NFC / NFD / NFKC / NFKD         | NFC: 最も一般的、互換性が高い            |

---

## 3. 型定義

### 3.1 SlideSettings型

```typescript
// packages/shared/src/types/slideSettings.ts
export interface SlideSettings {
  outputDirectory: string; // スライド出力先ディレクトリ
  autoCreateDirectory: boolean; // ディレクトリ自動作成フラグ
}

// なぜinterface: 拡張性を考慮（将来のdefaultTheme追加など）
// なぜシンプルな構造: 設定は最小限に、複雑化を避ける
```

### 3.2 ValidationResult型

```typescript
// apps/desktop/src/preload/types.ts
export interface ValidationResult {
  valid: boolean; // 検証結果
  error?: string; // エラーコード（valid=false時）
  message?: string; // ユーザー向けメッセージ
  suggestion?: string; // 修正提案
}

// なぜerrorとmessage分離: エラーコードで分岐、メッセージは表示用
// なぜsuggestion: ユーザーが次のアクションを取りやすくする
```

### 3.3 IPCResult型

```typescript
// apps/desktop/src/preload/types.ts
export type IPCResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; message?: string };

// なぜDiscriminated Union: success分岐で型を絞り込める
// TypeScriptの型推論を最大限活用
```

---

## 4. 使用例

### 4.1 設定の取得

```typescript
// Renderer Process
const result = await window.slideSettingsAPI.getAll();

if (result.success) {
  const { outputDirectory, autoCreateDirectory } = result.data;
  console.log(`保存先: ${outputDirectory}`);
} else {
  console.error(`エラー: ${result.error}`);
}
```

### 4.2 フォルダ選択ダイアログ

```typescript
// Renderer Process
const result = await window.slideSettingsAPI.selectDirectory();

if (result.success && result.data) {
  // ユーザーがフォルダを選択した
  const selectedPath = result.data;

  // バリデーション
  const validation =
    await window.slideSettingsAPI.validateDirectory(selectedPath);

  if (validation.success && validation.data.valid) {
    // 設定を保存
    await window.slideSettingsAPI.setDirectory(selectedPath);
  }
}
// result.data === null の場合はキャンセル
```

### 4.3 Reactフックの使用

```typescript
// Renderer Process (React Component)
import { useSlideSettings } from '../hooks/useSlideSettings';

function SettingsPanel() {
  const {
    settings,
    loading,
    error,
    selectDirectory,
    setDirectory,
  } = useSlideSettings();

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <Input value={settings.outputDirectory} readOnly />
      <Button onClick={selectDirectory}>フォルダを選択</Button>
    </div>
  );
}
```

---

## 5. テスト構成

| テストファイル                      | テスト数 | カバー範囲                          |
| ----------------------------------- | -------- | ----------------------------------- |
| slideSettingsStore.test.ts          | 72       | Store・バリデーション・セキュリティ |
| slideSettingsHandlers.test.ts       | 48       | IPCハンドラー・sender検証           |
| slideSettingsHandlers.error.test.ts | 24       | エラーケース・境界値                |
| useSlideSettings.test.ts            | 12       | Reactフック                         |
| **合計**                            | **156**  | **Line: 94.30%**                    |

---

## 6. 使用上の注意

### 6.1 パス入力のサニタイズ

```typescript
// ❌ 使用禁止: ユーザー入力をそのまま使う
const path = userInput;
await setDirectory(path);

// ⭕ 正しい使い方: 必ずバリデーションを通す
const validation = await validateDirectory(userInput);
if (validation.success && validation.data.valid) {
  await setDirectory(userInput);
} else {
  showError(validation.data.message);
}
```

### 6.2 非同期処理のエラーハンドリング

```typescript
// ❌ 使用禁止: エラーを無視
await window.slideSettingsAPI.setDirectory(path);

// ⭕ 正しい使い方: 結果を確認
const result = await window.slideSettingsAPI.setDirectory(path);
if (!result.success) {
  console.error(result.error);
  showError(result.message);
}
```

### 6.3 アクセシビリティ要件

```typescript
// ⭕ 必須: aria-label, role属性を設定
<input
  type="text"
  aria-label="スライド出力ディレクトリ"
  aria-describedby="directory-hint"
  readOnly
/>
<span id="directory-hint" className="sr-only">
  現在の保存先ディレクトリを表示しています
</span>
```

---

## 7. 次のステップ

| タスクID                                 | タスク名                           | 相対パス                                                                      | 状態   |
| ---------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- | ------ |
| task-imp-slide-agent-sdk-integration-001 | スキル呼び出し時のディレクトリ注入 | docs/30-workflows/unassigned-task/task-imp-slide-agent-sdk-integration-001.md | 未実施 |

---

## 8. 用語集

| 用語                | 読み方                         | 説明                                                                       |
| ------------------- | ------------------------------ | -------------------------------------------------------------------------- |
| IPC                 | アイピーシー                   | Inter-Process Communication。プロセス間通信。ElectronのMain-Renderer間通信 |
| contextBridge       | コンテキストブリッジ           | Electronのセキュアなプロセス間API公開機構                                  |
| preload             | プリロード                     | Rendererプロセス起動前に実行されるスクリプト。API公開に使用                |
| electron-store      | エレクトロンストア             | Electron向け設定永続化ライブラリ。JSONファイルでデータを保存               |
| パストラバーサル    | パストラバーサル               | `../`等を使って意図しないディレクトリにアクセスする攻撃                    |
| Unicode正規化       | ユニコードせいきか             | 同じ文字の異なる表現を統一する処理（例: é = e + ́）                         |
| sender検証          | センダーけんしょう             | IPC呼び出し元が正規のウィンドウかを検証するセキュリティ処理                |
| ホワイトリスト      | ホワイトリスト                 | 許可するものを明示的にリスト化。リスト外は全て拒否                         |
| Discriminated Union | ディスクリミネイテッドユニオン | TypeScriptの型パターン。共通プロパティで型を区別する                       |
| WCAG                | ダブリューシーエージー         | Web Content Accessibility Guidelines。Webアクセシビリティ標準              |

**用語集作成のポイント**:

- electron-store: SQLiteより軽量で、設定保存に最適。JSON形式で可読性も高い
- contextBridge: nodeIntegration=falseでもセキュアにAPIを公開できる
- Discriminated Union: success: true/false で型推論が効く、TypeScriptのベストプラクティス
