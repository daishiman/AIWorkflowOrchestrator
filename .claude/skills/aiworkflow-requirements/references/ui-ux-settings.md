# 設定画面 UI/UX ガイドライン

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

Electronデスクトップアプリにおける設定画面のUI/UX仕様を定義する。
アプリケーション設定、スキル設定、その他のユーザー設定を管理する。

---

## 設定画面アーキテクチャ

### レイヤー構成

```
┌─────────────────────────────────────────────────────────────┐
│  Renderer Process                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Settings Components (React)                          │   │
│  │ - SlideDirectorySettings.tsx                         │   │
│  │ - useSlideSettings フック                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │ window.slideSettingsAPI         │
└───────────────────────────┼─────────────────────────────────┘
                            │ contextBridge
┌───────────────────────────┼─────────────────────────────────┐
│  Preload Script           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ channels.ts + index.ts                               │   │
│  │ - SLIDE_SETTINGS_CHANNELS（ホワイトリスト）         │   │
│  │ - slideSettingsAPI 公開                              │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────┼─────────────────────────────────┘
                            │ IPC通信
┌───────────────────────────┼─────────────────────────────────┐
│  Main Process             │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ slideSettingsHandlers.ts + slideSettingsStore.ts     │   │
│  │ - validateIpcSender() でsender検証                   │   │
│  │ - electron-store による永続化                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## スライド出力ディレクトリ設定

### 機能概要

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| 機能名     | スライド出力ディレクトリ設定                   |
| 目的       | プレゼンスライドの保存先をユーザーが指定       |
| 対象スキル | presentation-slide-generator                   |
| 永続化     | electron-store（アプリ再起動後も維持）         |

### UIコンポーネント構成

```
SlideDirectorySettings
├── ディレクトリパス入力欄（読み取り専用）
│   └── aria-label="スライド出力ディレクトリ"
├── フォルダ選択ボタン
│   └── OSネイティブダイアログを起動
├── 自動作成チェックボックス
│   └── ディレクトリが存在しない場合に自動作成
└── エラー/成功メッセージ表示エリア
```

### UI仕様

| 要素               | 仕様                                           |
| ------------------ | ---------------------------------------------- |
| パス入力欄         | 読み取り専用、最大幅500px、等幅フォント       |
| フォルダ選択ボタン | プライマリスタイル、アイコン付き              |
| チェックボックス   | ラベル「フォルダを自動作成」                  |
| エラー表示         | 赤色、インラインで即時表示                    |
| 成功表示           | 緑色、3秒後にフェードアウト                   |

### 状態管理（useSlideSettings）

```typescript
interface UseSlideSettingsReturn {
  settings: SlideSettings | null;    // 現在の設定
  loading: boolean;                   // 読み込み中フラグ
  error: string | null;               // エラーメッセージ
  selectDirectory: () => Promise<void>; // フォルダ選択
  setDirectory: (path: string) => Promise<void>; // 設定保存
  validateDirectory: (path: string) => Promise<ValidationResult>; // 検証
}
```

### バリデーション仕様

| チェック項目       | エラーコード             | メッセージ例                   |
| ------------------ | ------------------------ | ------------------------------ |
| 空パス             | EMPTY_PATH               | パスを入力してください         |
| パストラバーサル   | PATH_TRAVERSAL_DETECTED  | 不正なパスです                 |
| 存在しないパス     | PATH_NOT_EXISTS          | 指定されたパスが存在しません   |
| 書き込み権限なし   | NO_WRITE_PERMISSION      | 書き込み権限がありません       |

### アクセシビリティ要件

| 要件               | 実装                                           |
| ------------------ | ---------------------------------------------- |
| キーボード操作     | Tab移動、Enter/Spaceでボタン操作               |
| スクリーンリーダー | aria-label、aria-describedby、role属性設定     |
| フォーカス表示     | visible focus indicator（2px solid）           |
| コントラスト比     | WCAG AA準拠（4.5:1以上）                       |
| ダークモード       | prefers-color-scheme対応                       |

---

## 設定永続化

### electron-store スキーマ

```typescript
interface SlideSettings {
  outputDirectory: string;      // デフォルト: ~/Documents/Slides
  autoCreateDirectory: boolean; // デフォルト: true
}
```

### 設定ファイル配置

| OS      | パス                                               |
| ------- | -------------------------------------------------- |
| macOS   | ~/Library/Application Support/AIWorkflow/config.json |
| Windows | %APPDATA%/AIWorkflow/config.json                   |
| Linux   | ~/.config/AIWorkflow/config.json                   |

---

## IPC API仕様

### チャンネル一覧

| チャンネル                        | 機能               | 引数                  | 戻り値                    |
| --------------------------------- | ------------------ | --------------------- | ------------------------- |
| slideSettings:getDirectory        | 現在のパス取得     | なし                  | IPCResult<string>         |
| slideSettings:setDirectory        | パス設定           | path: string          | IPCResult<void>           |
| slideSettings:selectDirectory     | ダイアログ表示     | なし                  | IPCResult<string \| null> |
| slideSettings:validateDirectory   | パス検証           | path: string          | IPCResult<ValidationResult> |
| slideSettings:getAll              | 全設定取得         | なし                  | IPCResult<SlideSettings>  |

### IPCResult型

```typescript
type IPCResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; message?: string };
```

---

## セキュリティ要件

### IPC通信セキュリティ

| 要件               | 実装                                           |
| ------------------ | ---------------------------------------------- |
| ホワイトリスト     | SLIDE_SETTINGS_CHANNELS定数で管理              |
| sender検証         | validateIpcSender()で全ハンドラー保護          |
| パストラバーサル   | detectPathTraversal()で32パターン検出          |
| Unicode正規化      | normalize("NFC")で統一                         |

詳細: [security-api-electron.md](./security-api-electron.md)（slideSettingsAPIセクション）

---

## テスト要件

### テストカバレッジ目標

| 指標             | 目標   | 実績    |
| ---------------- | ------ | ------- |
| Line Coverage    | 80%    | 94.30%  |
| Branch Coverage  | 60%    | 75%+    |
| テスト数         | 100+   | 156     |

### テストケースカテゴリ

| カテゴリ           | テスト数 | 内容                           |
| ------------------ | -------- | ------------------------------ |
| Store基本操作      | 24       | get/set/validate               |
| パストラバーサル   | 32       | 攻撃パターン検出               |
| IPCハンドラー      | 48       | 正常系・異常系                 |
| sender検証         | 24       | DevTools拒否・Window検証       |
| Reactフック        | 12       | 状態管理・非同期処理           |
| エラーハンドリング | 16       | 境界値・例外処理               |

---

## ツール許可設定（Permission Settings）

**実装タスク**: TASK-3-1-E（2026-01-26完了）

### 機能概要

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| 機能名     | ツール許可設定（Permission Settings）          |
| 目的       | 許可済みツールの確認・取り消し機能を提供       |
| 対象       | rememberChoice機能で許可されたツール一覧       |
| 永続化     | PermissionStore（electron-store）              |

### UIコンポーネント構成

```
PermissionSettings
├── 許可済みツール一覧（AllowedToolList）
│   ├── ツール名
│   ├── 許可日時（YYYY-MM-DD HH:mm形式）
│   └── Revokeボタン（個別取り消し）
├── Clear Allボタン（全クリア）
│   └── 確認ダイアログ付き
└── 空状態表示
    └── "許可されたツールはありません"
```

### UI仕様

| 要素             | 仕様                                           |
| ---------------- | ---------------------------------------------- |
| ツール一覧       | リスト表示、許可日時付き                       |
| Revokeボタン     | 各ツール横に配置、即時削除                     |
| Clear Allボタン  | リスト下部、確認ダイアログ経由で全削除         |
| 空状態           | 許可ツールがない場合のメッセージ表示           |

### アクセシビリティ要件

| 要件               | 実装                                           |
| ------------------ | ---------------------------------------------- |
| キーボード操作     | Tab移動、Enter/Spaceでボタン操作               |
| スクリーンリーダー | aria-label設定、ボタンの目的を明示             |
| フォーカス表示     | visible focus indicator                        |
| 確認ダイアログ     | Clear All時にモーダル確認                      |

### IPC API仕様

| チャンネル                   | 機能           | 引数                   | 戻り値                               |
| ---------------------------- | -------------- | ---------------------- | ------------------------------------ |
| permission:getAllowedTools   | 許可ツール取得 | なし                   | `{ tools: AllowedToolEntry[] }`      |
| permission:revokeTool        | 許可取消       | `{ toolName: string }` | `{ success: boolean }`               |
| permission:clearAll          | 全クリア       | なし                   | `{ success: boolean, clearedCount }` |

### テストカバレッジ

| カテゴリ              | テスト数 | 内容                           |
| --------------------- | -------- | ------------------------------ |
| PermissionSettings UI | 17       | 表示・操作・アクセシビリティ   |
| permission-handlers   | 22       | IPCハンドラー正常系・異常系    |
| PermissionStore       | 47       | ユニット・統合テスト           |

---

## 関連ドキュメント

- [security-api-electron.md](./security-api-electron.md) - IPCセキュリティ詳細
- [security-skill-execution.md](./security-skill-execution.md) - Permission Storeセキュリティ
- [ui-ux-forms.md](./ui-ux-forms.md) - フォーム設計ガイドライン
- [deployment-electron.md](./deployment-electron.md) - Electronデプロイ

---

## 実装ファイル

| ファイル                                     | 役割                    |
| -------------------------------------------- | ----------------------- |
| apps/desktop/src/renderer/components/settings/SlideDirectorySettings.tsx | UIコンポーネント |
| apps/desktop/src/renderer/hooks/useSlideSettings.ts | カスタムフック |
| apps/desktop/src/preload/channels.ts         | チャンネル定義          |
| apps/desktop/src/preload/index.ts            | API公開                 |
| apps/desktop/src/main/settings/slideSettingsStore.ts | 永続化ストア      |
| apps/desktop/src/main/ipc/slideSettingsHandlers.ts | IPCハンドラー      |
| apps/desktop/src/renderer/components/settings/PermissionSettings/ | 許可設定UI |
| apps/desktop/src/main/services/skill/PermissionStore.ts | 権限永続化ストア |
| apps/desktop/src/main/ipc/permission-handlers.ts | 権限IPCハンドラー |
| packages/shared/src/types/permission-store.ts | 型定義 |

---

## バージョン履歴

| Version | Date       | Changes                                              |
| ------- | ---------- | ---------------------------------------------------- |
| 1.1.0   | 2026-01-26 | PermissionSettings UI追加（TASK-3-1-E）              |
| 1.0.0   | 2026-01-14 | 初版作成: スライド出力ディレクトリ設定機能           |
