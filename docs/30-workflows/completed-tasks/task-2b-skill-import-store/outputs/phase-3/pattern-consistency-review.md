# パターン整合性レビュー

## メタ情報

| 項目   | 内容                                                 |
| ------ | ---------------------------------------------------- |
| Phase  | 3                                                    |
| タスク | 2                                                    |
| 対象   | slideSettingsStore.ts vs SkillImportStore設計        |
| 作成日 | 2026-01-24                                           |
| 比較先 | apps/desktop/src/main/settings/slideSettingsStore.ts |

---

## 1. Store構造比較

### 1.1 クラス構造

| 観点           | slideSettingsStore              | SkillImportStore設計            | 整合性  |
| -------------- | ------------------------------- | ------------------------------- | ------- |
| クラス定義     | `class SlideSettingsStore`      | `class SkillImportStore`        | ✅ 一致 |
| 内部ストア     | `private _store: Store<Schema>` | `private _store: Store<Schema>` | ✅ 一致 |
| コンストラクタ | electron-store初期化            | electron-store初期化            | ✅ 一致 |
| テスト支援     | `reset()`, `internalStore`      | `reset()`, `internalStore`      | ✅ 一致 |

### 1.2 シングルトン実装

| 観点             | slideSettingsStore                        | SkillImportStore設計                    | 整合性  |
| ---------------- | ----------------------------------------- | --------------------------------------- | ------- |
| インスタンス変数 | `slideSettingsStoreInstance: ... \| null` | `skillImportStoreInstance: ... \| null` | ✅ 一致 |
| ゲッター関数     | `getSlideSettingsStore()`                 | `getSkillImportStore()`                 | ✅ 一致 |
| リセット関数     | `resetSlideSettingsStore()`               | `resetSkillImportStore()`               | ✅ 一致 |

**コード比較**:

```typescript
// slideSettingsStore.ts (L389-408)
let slideSettingsStoreInstance: SlideSettingsStore | null = null;
export function getSlideSettingsStore(): SlideSettingsStore { ... }
export function resetSlideSettingsStore(): void { ... }

// SkillImportStore設計 (api-design L54-66)
let skillImportStoreInstance: SkillImportStore | null = null;
export function getSkillImportStore(): SkillImportStore { ... }
export function resetSkillImportStore(): void { ... }
```

---

## 2. スキーマ定義比較

### 2.1 JSON Schema使用

| 観点           | slideSettingsStore        | SkillImportStore設計      | 整合性  |
| -------------- | ------------------------- | ------------------------- | ------- |
| Schema形式     | TypeScript const as const | TypeScript const as const | ✅ 一致 |
| 型定義         | interface + schema連携    | interface + schema連携    | ✅ 一致 |
| バリデーション | electron-store組み込み    | electron-store組み込み    | ✅ 一致 |

**slideSettingsStore**:

```typescript
// L62-67
const slideSettingsSchema = {
  outputDirectory: { type: "string" },
  autoCreateDirectory: { type: "boolean" },
  defaultTheme: { type: "string", enum: ["kanagawa"] },
  schemaVersion: { type: "number" },
} as const;
```

**SkillImportStore設計** (schema-design L155-211):

```typescript
const skillStoreJsonSchema = {
  schemaVersion: { type: "number", minimum: 1 },
  importedSkills: { type: "object", additionalProperties: {...} },
  skillSettings: { type: "object", additionalProperties: {...} },
  // ...
} as const;
```

### 2.2 デフォルト値パターン

| 観点           | slideSettingsStore       | SkillImportStore設計           | 整合性  |
| -------------- | ------------------------ | ------------------------------ | ------- |
| 定数定義       | `DEFAULT_SLIDE_SETTINGS` | `DEFAULT_STORE_DATA`           | ✅ 一致 |
| 項目別定数     | -                        | `DEFAULT_SKILL_SETTINGS`       | ✅ 拡張 |
| コンストラクタ | `defaults: { ... }`      | `defaults: DEFAULT_STORE_DATA` | ✅ 一致 |

---

## 3. マイグレーションパターン

### 3.1 バージョン管理

| 観点             | slideSettingsStore      | SkillImportStore設計      | 整合性  |
| ---------------- | ----------------------- | ------------------------- | ------- |
| バージョン保持   | `schemaVersion: number` | `schemaVersion: number`   | ✅ 一致 |
| 初期バージョン   | 1                       | 1                         | ✅ 一致 |
| マイグレーション | `applyMigrations()`     | electron-store migrations | ⚠️ 差異 |

**差異の説明**:

- slideSettingsStore: 手動関数 `applyMigrations(store)` で実装
- SkillImportStore: electron-store組み込み `migrations` オプション使用

**評価**: ✅ 許容可能な差異

- electron-store組み込み機能を使用する方が堅牢
- 既存コードの技術的負債を解消するパターン

---

## 4. エクスポート形式比較

### 4.1 モジュールエクスポート

| エクスポート項目 | slideSettingsStore           | SkillImportStore設計         | 整合性  |
| ---------------- | ---------------------------- | ---------------------------- | ------- |
| クラス           | `export class ...`           | `export class ...`           | ✅ 一致 |
| シングルトン     | `export function get...()`   | `export function get...()`   | ✅ 一致 |
| 定数             | `export const DEFAULT_...`   | `export const DEFAULT_...`   | ✅ 一致 |
| 型               | `export interface ...`       | `export interface ...`       | ✅ 一致 |
| リセット         | `export function reset...()` | `export function reset...()` | ✅ 一致 |

---

## 5. エラーハンドリングパターン

### 5.1 読み取りエラー

| 観点           | slideSettingsStore (L161-187) | SkillImportStore設計                | 整合性  |
| -------------- | ----------------------------- | ----------------------------------- | ------- |
| try-catch      | ✅ 使用                       | ✅ 使用 (api-design L89-96)         | ✅ 一致 |
| フォールバック | デフォルト値返却              | 空配列返却                          | ✅ 一致 |
| ログ出力       | なし                          | console.error (error-handling L107) | ⚠️ 拡張 |

### 5.2 書き込みエラー

| 観点           | slideSettingsStore     | SkillImportStore設計                     | 整合性  |
| -------------- | ---------------------- | ---------------------------------------- | ------- |
| バリデーション | validatePathSecurity() | validateSkillName()                      | ✅ 一致 |
| 例外スロー     | ✅ Error               | ✅ SkillStoreError (error-handling L119) | ✅ 拡張 |

**拡張の評価**: ✅ 改善

- SkillStoreErrorはエラーコードを含む構造化エラー
- 既存パターンの改善として許容

---

## 6. セキュリティパターン

### 6.1 入力バリデーション

| 観点             | slideSettingsStore    | SkillImportStore設計             | 整合性  |
| ---------------- | --------------------- | -------------------------------- | ------- |
| パストラバーサル | detectPathTraversal() | SKILL_NAME_PATTERN               | ✅ 類似 |
| Null byte        | ✅ チェック           | ✅ チェック (schema-design L233) | ✅ 一致 |
| 長さ制限         | -                     | 最大128文字                      | ✅ 追加 |

---

## 7. 差異サマリー

### 7.1 意図的な差異（改善）

| 項目            | 理由                             |
| --------------- | -------------------------------- |
| migrations使用  | electron-store組み込み機能の活用 |
| SkillStoreError | 構造化エラーでIPC連携を改善      |
| ログ出力追加    | デバッグ・監視機能の強化         |
| 長さ制限追加    | セキュリティ強化                 |

### 7.2 パターン逸脱（問題）

| 項目 | 評価        |
| ---- | ----------- |
| なし | ✅ 問題なし |

---

## 8. レビュー結果

| 観点             | 結果                                    |
| ---------------- | --------------------------------------- |
| Store構造        | ✅ PASS - クラス/シングルトン構造が一致 |
| スキーマ定義     | ✅ PASS - JSON Schema使用パターン一致   |
| マイグレーション | ✅ PASS - 改善された方式を採用          |
| エクスポート形式 | ✅ PASS - 同一パターン                  |

---

## 9. 結論

**判定: PASS**

SkillImportStoreの設計は、既存のslideSettingsStore.tsパターンと高い一貫性を維持している。差異はすべて意図的な改善であり、既存パターンからの逸脱はない。

改善点:

- electron-store組み込みマイグレーション機能の活用
- 構造化エラークラスの導入
- より厳格な入力バリデーション
