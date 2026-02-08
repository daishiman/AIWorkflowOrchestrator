# 実装ガイド: スキル永続化機能

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| タスクID   | TASK-FIX-4-2-SKILL-STORE-PERSISTENCE |
| 作成日     | 2026-02-08                           |
| バージョン | 1.0.0                                |

---

# Part 1: 概念説明（初学者向け）

## 1.1 スキル永続化とは何か

### 日常生活での例え

**図書館の貸出リストをメモに書いておくイメージ**です。

図書館で本を借りたとき、どの本を借りたかを紙にメモしておくと便利です。
メモを取っておけば、次に図書館に行ったとき、前回どの本を借りたかすぐに思い出せます。
もしメモを取っていなければ、借りた本を覚えておくことができません。

アプリも同じです。アプリに「スキル」をインポート（追加）したとき、
その情報をファイルに保存しておけば、次回アプリを開いたときに
どのスキルを追加したか覚えていてくれます。

この「ファイルに保存しておく」ことを**永続化**と呼びます。

### なぜ必要なのか

アプリを終了すると、メモリ（一時的な記憶領域）の情報は消えてしまいます。
これは、黒板に書いた文字が電気を消すと見えなくなるようなものです。

永続化することで、アプリを閉じても情報が残り、
次回起動時に前回の状態から続けられます。

### この機能でできること

| 機能           | 説明                                   | 例                             |
| -------------- | -------------------------------------- | ------------------------------ |
| スキル保存     | インポートしたスキルをファイルに保存   | スキルを追加したら自動で保存   |
| スキル復元     | アプリ起動時に保存済みスキルを読み込み | 再起動後もスキルが残っている   |
| エラー回復     | ファイルが壊れても安全にアプリを起動   | 壊れた場合は空の状態から再開   |
| 不正データ除去 | おかしなデータが混ざっても正しく動作   | 文字列以外のデータは自動で除外 |

---

## 1.2 何が起きていたか（バグの説明）

### 問題

以前のバージョンでは、保存されたデータを読み込むとき、
「このデータは正しい形式か？」を確認せずに使っていました。

これは、メモに書いてある内容を確認せずにそのまま使うようなものです。
もしメモに落書きが紛れていたら、困りますよね。

### 解決策

今回の修正で、データを読み込むときに必ず内容をチェックするようになりました。
正しい形式のデータだけを使い、おかしなデータは自動で取り除きます。

これは、メモを読むときに「これは本当に本の名前か？」を
一つずつ確認するようなものです。

---

# Part 2: 技術詳細（開発者向け）

## 2.1 アーキテクチャ概要

### コンポーネント構成

```
┌─────────────────────────────────────────────────────────────┐
│                       Renderer Process                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │               React Components                       │    │
│  │                     │                                │    │
│  │                     ▼                                │    │
│  │           window.electronAPI.skill                   │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ IPC (skill:getImported)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        Main Process                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  skillHandlers.ts                    │    │
│  │                        │                             │    │
│  │                        ▼                             │    │
│  │                   SkillService                       │    │
│  │                        │                             │    │
│  │                        ▼                             │    │
│  │     ┌──────────────────────────────────────┐        │    │
│  │     │         SkillImportManager           │        │    │
│  │     │  ┌─────────────────────────────┐     │        │    │
│  │     │  │  validateStoredSkillIds()   │     │        │    │
│  │     │  │    (型バリデーション)        │     │        │    │
│  │     │  └─────────────────────────────┘     │        │    │
│  │     └──────────────────────────────────────┘        │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   electron-store                     │    │
│  │              (skill-imports.json)                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### データフロー

1. **起動時**: electron-store → validateStoredSkillIds() → importedIds Set
2. **インポート時**: importedIds.add() → persist() → electron-store
3. **削除時**: importedIds.delete() → persist() → electron-store
4. **取得時**: importedIds → Array → Renderer

---

## 2.2 API リファレンス

### validateStoredSkillIds() 関数

ストアから取得した値を安全に `string[]` に変換する関数。

**シグネチャ**:

```typescript
function validateStoredSkillIds(value: unknown): string[];
```

**パラメータ**:

| パラメータ | 型        | 説明                           |
| ---------- | --------- | ------------------------------ |
| value      | `unknown` | ストアから取得した値（型不明） |

**戻り値**:

| 型         | 説明                                 |
| ---------- | ------------------------------------ |
| `string[]` | 検証済みのスキルID配列（空配列も可） |

**バリデーションロジック**:

```typescript
function validateStoredSkillIds(value: unknown): string[] {
  // 1. null/undefined チェック
  if (value == null) {
    return [];
  }

  // 2. 配列チェック
  if (!Array.isArray(value)) {
    console.warn(
      "[SkillImportManager] Invalid stored data type, expected array:",
      typeof value,
    );
    return [];
  }

  // 3. 配列内の各要素をフィルタリング（string以外を除外）
  return value.filter((item): item is string => {
    const isValid = typeof item === "string";
    if (!isValid) {
      console.warn(
        "[SkillImportManager] Filtered out non-string element:",
        typeof item,
      );
    }
    return isValid;
  });
}
```

**エラーケース別の戻り値**:

| 入力値                   | 戻り値             | 警告ログ                 |
| ------------------------ | ------------------ | ------------------------ |
| `null`                   | `[]`               | なし                     |
| `undefined`              | `[]`               | なし                     |
| `"string"`               | `[]`               | `Invalid stored data...` |
| `123`                    | `[]`               | `Invalid stored data...` |
| `{}`                     | `[]`               | `Invalid stored data...` |
| `["a", 1, "b", null]`    | `["a", "b"]`       | `Filtered out...` (2回)  |
| `["skill-1", "skill-2"]` | `["skill-1", ...]` | なし                     |

---

### SkillStore インターフェース

electron-store 互換のインターフェース。

```typescript
interface SkillStore {
  /**
   * ストアから値を取得する
   *
   * TASK-FIX-4-2: 戻り値を unknown に変更し型安全性を向上
   */
  get(key: string, defaultValue: string[]): unknown;

  /**
   * ストアに値を設定する
   */
  set(key: string, value: string[]): void;

  /**
   * ストアファイルのパス（デバッグ用）
   */
  path?: string;
}
```

---

### SkillImportManager クラス

**コンストラクタ**:

```typescript
constructor(store: SkillStore, options?: { debug?: boolean })
```

| パラメータ     | 型           | 説明                                             |
| -------------- | ------------ | ------------------------------------------------ |
| store          | `SkillStore` | electron-store インスタンス                      |
| options?.debug | `boolean`    | デバッグログを有効化（デフォルト: 開発環境のみ） |

**メソッド**:

| メソッド              | 戻り値                  | 説明                           |
| --------------------- | ----------------------- | ------------------------------ |
| `importSkills(ids)`   | `Promise<ImportResult>` | スキルをインポートし永続化     |
| `removeSkill(id)`     | `Promise<RemoveResult>` | スキルを削除し永続化           |
| `getImportedSkillIds` | `string[]`              | インポート済みスキルID一覧取得 |
| `isImported(id)`      | `boolean`               | 指定IDがインポート済みか確認   |

---

## 2.3 electron-store 設定と初期化

### ストアファイルの場所

| OS      | パス                                                   |
| ------- | ------------------------------------------------------ |
| macOS   | `~/Library/Application Support/AIWorkflow/skills.json` |
| Windows | `%APPDATA%\AIWorkflow\skills.json`                     |
| Linux   | `~/.config/AIWorkflow/skills.json`                     |

### 初期化コード（ipc/index.ts）

```typescript
import Store from "electron-store";

// ストア初期化
const skillStore = new Store<{ importedSkillIds: string[] }>({
  name: "skills",
  defaults: {
    importedSkillIds: [],
  },
});

// SkillImportManager 初期化
const skillImportManager = new SkillImportManager(skillStore, {
  debug: process.env.NODE_ENV === "development",
});
```

### JSON スキーマ

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "importedSkillIds": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "default": []
    }
  }
}
```

---

## 2.4 エラーハンドリングとフォールバック戦略

### エラーカテゴリ別対応

| カテゴリ     | 例                       | 対応                     |
| ------------ | ------------------------ | ------------------------ |
| 型不正       | ストアに数値が保存       | 空配列にフォールバック   |
| ファイル破損 | JSON パースエラー        | 空配列にフォールバック   |
| 読み取り失敗 | パーミッションエラー     | 空配列にフォールバック   |
| 書き込み失敗 | ディスク容量不足         | コンソールエラー出力のみ |
| 配列要素不正 | 配列内に null/数値が混在 | 不正要素を除外して継続   |

### コンストラクタでのエラーハンドリング

```typescript
constructor(store: SkillStore, options?: { debug?: boolean }) {
  this.store = store;
  this.debug = options?.debug ?? process.env.NODE_ENV === "development";

  try {
    // 型バリデーション付きでストアから読み込み
    const rawValue = this.store.get(STORE_KEY, []);
    const stored = validateStoredSkillIds(rawValue);
    this.importedIds = new Set(stored);
  } catch (error) {
    // フォールバック: 空のセットで初期化
    console.error("[SkillImportManager] Failed to load from store:", error);
    this.importedIds = new Set();
  }
}
```

### persist() でのエラーハンドリング

```typescript
private persist(): void {
  try {
    const data = Array.from(this.importedIds);
    this.store.set(STORE_KEY, data);
  } catch (error) {
    // エラーログを出力するが、メモリ状態は維持
    console.error("[SkillImportManager] Failed to persist:", error);
  }
}
```

---

## 2.5 デバッグ方法

### デバッグログの有効化

```typescript
// オプション1: 環境変数で有効化
process.env.NODE_ENV = "development";

// オプション2: コンストラクタで明示的に有効化
const manager = new SkillImportManager(store, { debug: true });
```

### ログ出力例

```
[SkillImportManager] Store path: /Users/xxx/Library/Application Support/AIWorkflow/skills.json
[SkillImportManager] Loaded imported IDs: 3 items
[SkillImportManager] importSkills called with: ["skill-1", "skill-2"]
[SkillImportManager] importSkills result: 1 new imports
[SkillImportManager] Persisting: 4 items
[SkillImportManager] Persist successful
```

### ストアファイルの直接確認

```bash
# macOS
cat ~/Library/Application\ Support/AIWorkflow/skills.json

# 出力例
{
  "importedSkillIds": ["skill-001", "skill-002", "skill-003"]
}
```

### ストアのリセット

```bash
# macOS
rm ~/Library/Application\ Support/AIWorkflow/skills.json
```

---

## 2.6 テストカバレッジ

### テストファイル構成

| ファイル                                 | テスト数 | 内容                     |
| ---------------------------------------- | -------- | ------------------------ |
| `SkillImportManager.test.ts`             | 28       | 基本機能・同時実行テスト |
| `SkillImportManager.persistence.test.ts` | 11       | 型バリデーション・永続化 |
| `SkillImportManager.boundary.test.ts`    | 12       | 境界値テスト             |
| `SkillImportManager.error.test.ts`       | 13       | エラーハンドリングテスト |
| `SkillImportManager.integration.test.ts` | 15       | 統合テスト               |

### カバレッジ結果

| 指標      | 基準 | 実績   | 達成 |
| --------- | ---- | ------ | ---- |
| Statement | 80%+ | 91.52% | PASS |
| Branch    | 60%+ | 91.17% | PASS |
| Function  | 80%+ | 100%   | PASS |
| Line      | 80%+ | 91.52% | PASS |

---

## 2.7 関連ファイル

| ファイル                                                     | 役割                  |
| ------------------------------------------------------------ | --------------------- |
| `apps/desktop/src/main/services/skill/SkillImportManager.ts` | 永続化ロジック本体    |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                 | IPC ハンドラー        |
| `apps/desktop/src/main/services/skill/SkillService.ts`       | スキルサービス        |
| `apps/desktop/src/main/ipc/index.ts`                         | electron-store 初期化 |

---

## 変更履歴

| バージョン | 日付       | 変更内容                                         |
| ---------- | ---------- | ------------------------------------------------ |
| 1.0.0      | 2026-02-08 | 初版作成（TASK-FIX-4-2-SKILL-STORE-PERSISTENCE） |
