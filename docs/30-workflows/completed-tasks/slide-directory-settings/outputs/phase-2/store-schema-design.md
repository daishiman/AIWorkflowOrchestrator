# electron-storeスキーマ設計書 - スライド出力ディレクトリ設定

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 2                        |
| タスク     | T-02-3                   |
| 作成日     | 2026-01-13               |
| 機能名     | slide-directory-settings |
| ステータス | 完了                     |

---

## 設定スキーマ定義

### TypeScript型定義

**ファイル**: `packages/shared/src/types/slideSettings.ts`

```typescript
/**
 * スライド設定のスキーマ定義
 */
export interface SlideSettings {
  /** スライド出力先ディレクトリ */
  outputDirectory: string;

  /** ディレクトリが存在しない場合に自動作成するか */
  autoCreateDirectory: boolean;

  /** デフォルトテーマ */
  defaultTheme: "kanagawa";

  /** スキーマバージョン（マイグレーション用） */
  schemaVersion: number;
}

/**
 * デフォルト設定値
 */
export const DEFAULT_SLIDE_SETTINGS: SlideSettings = {
  outputDirectory: "~/Documents/Slides",
  autoCreateDirectory: true,
  defaultTheme: "kanagawa",
  schemaVersion: 1,
};

/**
 * 現在のスキーマバージョン
 */
export const CURRENT_SCHEMA_VERSION = 1;
```

---

## electron-store設定

### Store実装

**ファイル**: `apps/desktop/src/main/settings/slideSettingsStore.ts`

```typescript
import Store from "electron-store";
import * as os from "os";
import * as path from "path";
import type { SlideSettings } from "@repo/shared/types/slideSettings";
import {
  DEFAULT_SLIDE_SETTINGS,
  CURRENT_SCHEMA_VERSION,
} from "@repo/shared/types/slideSettings";

// JSON Schemaによるバリデーション定義
const schema: Store.Schema<SlideSettings> = {
  outputDirectory: {
    type: "string",
    minLength: 1,
    maxLength: 1000,
    default: DEFAULT_SLIDE_SETTINGS.outputDirectory,
  },
  autoCreateDirectory: {
    type: "boolean",
    default: DEFAULT_SLIDE_SETTINGS.autoCreateDirectory,
  },
  defaultTheme: {
    type: "string",
    enum: ["kanagawa"],
    default: DEFAULT_SLIDE_SETTINGS.defaultTheme,
  },
  schemaVersion: {
    type: "number",
    minimum: 1,
    default: CURRENT_SCHEMA_VERSION,
  },
};

// Lazy-initialized store instance
let slideSettingsStore: Store<SlideSettings> | null = null;

/**
 * スライド設定ストアのシングルトンインスタンスを取得
 */
export function getSlideSettingsStore(): Store<SlideSettings> {
  if (!slideSettingsStore) {
    slideSettingsStore = new Store<SlideSettings>({
      name: "slide-settings",
      schema,
      defaults: DEFAULT_SLIDE_SETTINGS,
      migrations: {
        // バージョン1へのマイグレーション（初期バージョン）
        "1.0.0": (store) => {
          // 初期バージョンのためマイグレーション不要
          // 将来のバージョンアップ時に使用
          store.set("schemaVersion", 1);
        },
      },
      // 破損時のリカバリ
      clearInvalidConfig: true,
    });

    // スキーマバージョンの検証
    validateAndMigrate(slideSettingsStore);
  }

  return slideSettingsStore;
}

/**
 * スキーマバージョンの検証とマイグレーション実行
 */
function validateAndMigrate(store: Store<SlideSettings>): void {
  const currentVersion = store.get("schemaVersion", 0);

  if (currentVersion < CURRENT_SCHEMA_VERSION) {
    console.log(
      `[SlideSettings] Migrating from version ${currentVersion} to ${CURRENT_SCHEMA_VERSION}`,
    );
    applyMigrations(store, currentVersion, CURRENT_SCHEMA_VERSION);
  }

  // バージョンが未来の場合（ダウングレードシナリオ）
  if (currentVersion > CURRENT_SCHEMA_VERSION) {
    console.warn(
      `[SlideSettings] Schema version ${currentVersion} is newer than current ${CURRENT_SCHEMA_VERSION}. Resetting to defaults.`,
    );
    resetToDefaults(store);
  }
}

/**
 * マイグレーションの適用
 */
function applyMigrations(
  store: Store<SlideSettings>,
  fromVersion: number,
  toVersion: number,
): void {
  const migrations = getMigrations();

  for (let v = fromVersion + 1; v <= toVersion; v++) {
    const migration = migrations[v];
    if (migration) {
      console.log(`[SlideSettings] Applying migration to version ${v}`);
      migration(store);
    }
  }

  store.set("schemaVersion", toVersion);
}

/**
 * マイグレーション関数のマップ
 */
function getMigrations(): Record<
  number,
  (store: Store<SlideSettings>) => void
> {
  return {
    // バージョン1: 初期バージョン（マイグレーション不要）
    1: (_store) => {
      // 初期バージョンのため何もしない
    },
    // 将来のバージョン2への例
    // 2: (store) => {
    //   // 新フィールドの追加例
    //   if (!store.has('newField')) {
    //     store.set('newField', 'defaultValue');
    //   }
    // },
  };
}

/**
 * デフォルト値へのリセット
 */
function resetToDefaults(store: Store<SlideSettings>): void {
  console.log("[SlideSettings] Resetting to default values");
  store.clear();
  Object.entries(DEFAULT_SLIDE_SETTINGS).forEach(([key, value]) => {
    store.set(
      key as keyof SlideSettings,
      value as SlideSettings[keyof SlideSettings],
    );
  });
}

/**
 * テスト用: ストアインスタンスをリセット
 */
export function resetSlideSettingsStore(): void {
  slideSettingsStore = null;
}

/**
 * ホームディレクトリパスの展開
 */
export function expandHomePath(inputPath: string): string {
  if (inputPath.startsWith("~")) {
    return path.join(os.homedir(), inputPath.slice(1));
  }
  return inputPath;
}

/**
 * ホームディレクトリパスの圧縮（表示用）
 */
export function compressToHomePath(inputPath: string): string {
  const homedir = os.homedir();
  if (inputPath.startsWith(homedir)) {
    return inputPath.replace(homedir, "~");
  }
  return inputPath;
}
```

---

## ストレージ構成

### ファイル配置

```
{app.getPath('userData')}/
└── slide-settings.json    # スライド設定ファイル
```

### OS別のパス

| OS      | 設定ファイルパス                                                           |
| ------- | -------------------------------------------------------------------------- |
| macOS   | `~/Library/Application Support/AIWorkflowOrchestrator/slide-settings.json` |
| Windows | `%APPDATA%/AIWorkflowOrchestrator/slide-settings.json`                     |
| Linux   | `~/.config/AIWorkflowOrchestrator/slide-settings.json`                     |

### JSONファイル形式

```json
{
  "outputDirectory": "~/Documents/Slides",
  "autoCreateDirectory": true,
  "defaultTheme": "kanagawa",
  "schemaVersion": 1
}
```

---

## マイグレーション戦略

### バージョン管理方針

1. **schemaVersion フィールド**: すべての設定に `schemaVersion` フィールドを含める
2. **前方互換性**: 新バージョンは古いバージョンの設定を読み込み可能
3. **後方非互換**: 古いバージョンのアプリは新しい設定を読み込む際にデフォルト値にフォールバック

### マイグレーションフロー

```
┌─────────────────────────────────────────────────────────────┐
│                    アプリケーション起動                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              getSlideSettingsStore() 呼び出し                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 設定ファイルを読み込み                        │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
       ┌──────────┐    ┌──────────┐    ┌──────────┐
       │ファイル破損│    │バージョン │    │バージョン │
       │または不正 │    │が古い     │    │が最新    │
       └──────────┘    └──────────┘    └──────────┘
              │               │               │
              ▼               ▼               │
       ┌──────────┐    ┌──────────┐          │
       │デフォルト │    │マイグレー │          │
       │値で初期化 │    │ション実行│          │
       └──────────┘    └──────────┘          │
              │               │               │
              └───────────────┴───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      設定を返却                              │
└─────────────────────────────────────────────────────────────┘
```

### 将来のマイグレーション例

```typescript
// バージョン2へのマイグレーション（例）
function migrateV1toV2(store: Store<SlideSettings>): void {
  // 新フィールドの追加
  store.set("exportFormat", "html");

  // フィールド名の変更
  const oldValue = store.get("outputDirectory");
  store.set("slideOutputPath", oldValue);
  store.delete("outputDirectory");

  // バージョン更新
  store.set("schemaVersion", 2);
}
```

---

## エラーハンドリング

### 破損ファイルのリカバリ

```typescript
// electron-storeのclearInvalidConfigオプションで自動処理
const store = new Store<SlideSettings>({
  name: "slide-settings",
  schema,
  defaults: DEFAULT_SLIDE_SETTINGS,
  clearInvalidConfig: true, // JSONパースエラー時にデフォルト値で初期化
});
```

### 手動リカバリ

```typescript
/**
 * 設定ファイルの完全リセット
 */
export function hardResetSettings(): void {
  const store = getSlideSettingsStore();
  store.clear();
  resetSlideSettingsStore();
  // 再初期化で新しいストアインスタンスを作成
  getSlideSettingsStore();
}
```

---

## パフォーマンス考慮

### 同期読み込み

```typescript
// electron-storeは同期的にJSONを読み込む
// ファイルサイズが小さい（1KB未満）ため問題なし
const directory = store.get("outputDirectory"); // 同期
```

### キャッシュ戦略

```typescript
// シングルトンパターンでメモリキャッシュ
// 複数回の読み込みでもファイルI/Oは初回のみ
let slideSettingsStore: Store<SlideSettings> | null = null;

export function getSlideSettingsStore(): Store<SlideSettings> {
  if (!slideSettingsStore) {
    slideSettingsStore = new Store<SlideSettings>({...});
  }
  return slideSettingsStore;
}
```

---

## テスト戦略

### ユニットテスト

```typescript
// apps/desktop/src/main/settings/__tests__/slideSettingsStore.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getSlideSettingsStore,
  resetSlideSettingsStore,
} from "../slideSettingsStore";

describe("SlideSettingsStore", () => {
  beforeEach(() => {
    resetSlideSettingsStore();
  });

  afterEach(() => {
    resetSlideSettingsStore();
  });

  it("should return default values on first access", () => {
    const store = getSlideSettingsStore();
    expect(store.get("outputDirectory")).toBe("~/Documents/Slides");
    expect(store.get("autoCreateDirectory")).toBe(true);
    expect(store.get("defaultTheme")).toBe("kanagawa");
    expect(store.get("schemaVersion")).toBe(1);
  });

  it("should persist settings", () => {
    const store = getSlideSettingsStore();
    store.set("outputDirectory", "/custom/path");

    resetSlideSettingsStore();
    const newStore = getSlideSettingsStore();
    expect(newStore.get("outputDirectory")).toBe("/custom/path");
  });

  it("should validate schema", () => {
    const store = getSlideSettingsStore();
    // スキーマ違反は自動的に拒否される
    expect(() => store.set("outputDirectory", "")).toThrow();
  });
});
```

---

## 完了確認

- [x] TypeScript型定義が完了している
- [x] electron-storeの設定が完了している
- [x] JSON Schemaによるバリデーションが定義されている
- [x] マイグレーション戦略が設計されている
- [x] デフォルト値が定義されている
- [x] 破損時のフォールバックが設計されている
- [x] パフォーマンス考慮（キャッシュ）が設計されている
- [x] テスト戦略が定義されている
