# Phase 12 実装ガイド

## メタ情報

| 項目     | 内容                     |
| -------- | ------------------------ |
| 作成日時 | 2026-01-22               |
| タスクID | SKILL-IMPORT-PERSIST-001 |

---

# Part 1: 概念的説明（初学者・非技術者向け）

## 1.1 問題の概要

### 何が起きていたか

アプリケーションでスキルをインポートしても、アプリを再起動するとインポート情報が消えてしまう問題がありました。

### ユーザーへの影響

- スキルをインポートしても、アプリ再起動後に再度インポートが必要だった
- `skill:list-imported` APIが常に空の配列を返していた

## 1.2 解決策の概要

スキルのインポート情報を永続化（保存）する仕組みを正しく動作するように修正しました。

### 修正後の動作

1. スキルをインポートすると、その情報がファイルに保存される
2. アプリを再起動しても、保存された情報が読み込まれる
3. インポート済みスキル一覧が正しく表示される

## 1.3 影響範囲

| 項目             | 影響 |
| ---------------- | ---- |
| スキルインポート | ✅   |
| スキル削除       | ✅   |
| スキル一覧取得   | ✅   |
| その他の機能     | ❌   |

---

# Part 2: 技術的詳細（開発者向け）

## 2.1 根本原因の詳細

### 問題の発生箇所

`apps/desktop/src/main/ipc/index.ts` で `electron-store` を初期化する際に、`defaults` オプションが未設定だった。

### 技術的原因

```typescript
// 問題のあったコード
const skillStore = new Store<SkillStoreSchema>({
  name: "skills",
  // defaults が未設定
});
```

`electron-store` は `defaults` が設定されていない場合、初回起動時にストアファイルを生成しないため、`store.get()` が期待通りに動作しなかった。

### 発生シーケンス

1. アプリ初回起動時、`defaults` がないためストアファイルが生成されない
2. `SkillImportManager` のコンストラクタで `store.get(STORE_KEY, [])` を呼び出す
3. ストアファイルが存在しないため、空の配列が返される
4. スキルをインポートすると `importedIds` に追加されるが、メモリ上のみ
5. アプリ再起動で `importedIds` がリセットされ、空に戻る

## 2.2 修正内容の詳細

### 修正1: ストア初期化の修正

**ファイル**: `apps/desktop/src/main/ipc/index.ts`

```typescript
// 修正後
interface SkillStoreSchema {
  importedSkillIds: string[];
}

const skillStore = new Store<SkillStoreSchema>({
  name: "skills",
  defaults: {
    importedSkillIds: [],
  },
});
```

### 修正2: 型インターフェースの追加

**ファイル**: `apps/desktop/src/main/services/skill/SkillImportManager.ts`

```typescript
interface SkillStore {
  get(key: string, defaultValue: string[]): string[];
  set(key: string, value: string[]): void;
}
```

**理由**: TypeScriptの型パラメータ互換性問題を解決するため

### 修正3: エラーハンドリングの追加

```typescript
constructor(store: SkillStore) {
  this.store = store;
  try {
    const stored = this.store.get(STORE_KEY, []) as string[];
    this.importedIds = new Set(stored);
  } catch (error) {
    console.error("[SkillImportManager] Failed to load from store:", error);
    this.importedIds = new Set();
  }
}
```

## 2.3 コード変更箇所

| ファイル                                                                    | 変更種別 | 変更内容                                     |
| --------------------------------------------------------------------------- | -------- | -------------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts`                                        | 修正     | `defaults`オプション追加、型スキーマ定義追加 |
| `apps/desktop/src/main/services/skill/SkillImportManager.ts`                | 修正     | `SkillStore`インターフェース追加、エラー処理 |
| `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts` | 追加     | 28テストケース                               |

## 2.4 テスト方法

### ユニットテスト実行

```bash
cd apps/desktop
pnpm vitest run src/main/services/skill/__tests__/SkillImportManager.test.ts
```

### テストカバレッジ確認

```bash
pnpm vitest run --coverage src/main/services/skill
```

### 実アプリでの手動確認

1. アプリを起動: `pnpm dev`
2. スキルをインポート
3. アプリを完全終了（Cmd+Q）
4. アプリを再起動
5. インポート済みスキル一覧を確認

### ストアファイル確認

```bash
cat ~/Library/Application\ Support/com.aiworkflow.orchestrator/skills.json
```

期待される出力:

```json
{
  "importedSkillIds": ["skill-id-1", "skill-id-2"]
}
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-22 | 初版作成 |
