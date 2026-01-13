# スライド出力ディレクトリ設定 - 技術ドキュメント

## 概要

presentation-slide-generatorスキルで生成されるスライドファイルの出力先ディレクトリを設定・管理する機能。

## アーキテクチャ

### コンポーネント構成

```
packages/shared/src/types/slideSettings.ts
    └── SlideSettings型定義

apps/desktop/src/
├── main/
│   ├── settings/
│   │   └── slideSettingsStore.ts      # 設定永続化ストア
│   └── ipc/
│       └── slideSettingsHandlers.ts   # IPCハンドラー
├── preload/
│   └── index.ts                       # Preload API定義
└── renderer/
    ├── hooks/
    │   └── useSlideSettings.ts        # 状態管理フック
    └── components/settings/
        └── SlideDirectorySettings/
            └── SlideDirectorySettings.tsx  # UIコンポーネント
```

### データフロー

```
UI操作
    ↓ (React Event)
SlideDirectorySettings.tsx
    ↓ (Custom Hook)
useSlideSettings.ts
    ↓ (Preload API)
window.slideSettingsAPI
    ↓ (IPC)
slideSettingsHandlers.ts
    ↓ (Store)
slideSettingsStore.ts
    ↓ (electron-store)
永続化ストレージ
```

## IPCチャンネル

| チャンネル                      | 説明                     | 引数   | 戻り値                   |
| ------------------------------- | ------------------------ | ------ | ------------------------ |
| slideSettings:getDirectory      | 現在のディレクトリを取得 | なし   | `Result<string>`         |
| slideSettings:setDirectory      | ディレクトリを設定       | `path` | `Result<void>`           |
| slideSettings:selectDirectory   | OSダイアログで選択       | なし   | `Result<string \| null>` |
| slideSettings:validateDirectory | パスの有効性を検証       | `path` | `ValidationResult`       |
| slideSettings:getAll            | 全設定を取得             | なし   | `Result<SlideSettings>`  |

## データスキーマ

### SlideSettings型

```typescript
export interface SlideSettings {
  outputDirectory: string; // 出力ディレクトリパス
  autoCreateDirectory: boolean; // 存在しない場合の自動作成フラグ
  defaultTheme: string; // デフォルトテーマ
  schemaVersion: number; // スキーマバージョン
}
```

### デフォルト値

```typescript
export const DEFAULT_SLIDE_SETTINGS: SlideSettings = {
  outputDirectory: "~/Documents/Slides",
  autoCreateDirectory: true,
  defaultTheme: "kanagawa",
  schemaVersion: 1,
};
```

## セキュリティ

### IPC通信

- `validateIpcSender`: 送信元URLの検証
- チャンネルホワイトリスト: 定義済みチャンネルのみ許可

### パス検証

- パストラバーサル攻撃の検出
  - `..`, `%2e%2e`, Unicode正規化後の検出
  - `\0` (null byte injection)の検出
- 書き込み権限の検証

## マイグレーション

`schemaVersion`によるバージョン管理を実装。将来のスキーマ変更時に`applyMigrations`関数で自動マイグレーションを実行。

```typescript
function applyMigrations(settings: SlideSettings): SlideSettings {
  let migrated = { ...settings };
  // 将来のマイグレーションロジックをここに追加
  return migrated;
}
```

## テスト

### テストスイート

| カテゴリ     | ファイル                                   | テスト数 |
| ------------ | ------------------------------------------ | -------- |
| Store        | slideSettingsStore.test.ts                 | 28       |
| Store Edge   | slideSettingsStore.edge.test.ts            | 32       |
| Handler      | slideSettingsHandlers.test.ts              | 24       |
| Handler Err  | slideSettingsHandlers.error.test.ts        | 12       |
| Hook         | useSlideSettings.test.ts                   | 18       |
| Component    | SlideDirectorySettings.test.tsx            | 8        |
| Component+   | SlideDirectorySettings.extended.test.tsx   | 4        |
| Integration  | slideSettings.integration.test.ts          | 14       |
| Integration+ | slideSettings.extended.integration.test.ts | 16       |

### カバレッジ

| 指標              | 達成率 |
| ----------------- | ------ |
| Line Coverage     | 94.30% |
| Branch Coverage   | 87.49% |
| Function Coverage | 83.33% |

## 関連ドキュメント

- [APIリファレンス](../api/slide-settings-api.md)
- [ユーザーガイド](../user-guide/slide-settings.md)
