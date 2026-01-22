# スキルインポート ストア永続化 - 実装ガイド

## 作成日

2026-01-22

---

# Part 1: 概念的説明（初学者・非技術者向け）

## 1.1 問題の概要

### 何が起きていたのか

AIWorkflowOrchestratorでは、ユーザーがスキル（拡張機能）をインポートして利用できます。しかし、以下の問題が報告されていました：

- スキルをインポートしても、インポート済みスキル一覧を取得すると「0件」と表示される
- アプリを再起動すると、インポートしたスキルが消えてしまったように見える

### なぜ問題が発見されなかったのか

開発時のテスト（28件）はすべて成功していました。しかし、これらのテストは「模擬データ（モック）」を使用しており、実際のファイル保存処理を行っていませんでした。

つまり、テストは「理論上は正しい」ことを証明していましたが、「実際に動く」ことは確認できていませんでした。

---

## 1.2 修正内容

### 行ったこと

1. **統合テストの追加**: 実際のファイル保存処理を使ったテストを追加しました
2. **デバッグログの追加**: 問題発生時に原因を特定しやすくするログを追加しました

### 何が変わったのか

| 項目       | 修正前         | 修正後                          |
| ---------- | -------------- | ------------------------------- |
| テスト種類 | 模擬データのみ | 模擬データ + 実際のファイル操作 |
| ログ出力   | 最小限         | 詳細な操作ログ                  |
| 問題特定   | 困難           | 容易                            |

---

## 1.3 修正後の動作

### 正常な動作フロー

1. ユーザーがスキルをインポート
2. スキルIDがアプリ内のファイルに保存される
3. アプリを再起動しても、保存されたスキルIDが読み込まれる
4. インポート済みスキル一覧で正しくスキルが表示される

### 保存場所

スキルのインポート情報は以下のファイルに保存されます：

```
~/Library/Application Support/@repo/desktop/skills.json
```

このファイルには以下のような形式でデータが保存されます：

```json
{
  "importedSkillIds": ["skill-1", "skill-2", "skill-3"]
}
```

---

# Part 2: 技術的詳細（開発者向け）

## 2.1 修正箇所の技術的詳細

### 修正対象ファイル

| ファイル                                 | 修正内容                  |
| ---------------------------------------- | ------------------------- |
| `SkillImportManager.ts`                  | デバッグログの追加        |
| `SkillImportManager.integration.test.ts` | 新規作成（統合テスト）    |
| `skillHandlers.integration.test.ts`      | 新規作成（IPC統合テスト） |

### アーキテクチャ概要

```
Renderer Process (UI)
        ↓
    IPC Bridge (skill:import, skill:list-imported)
        ↓
Main Process (skillHandlers.ts)
        ↓
SkillImportManager
        ↓
electron-store (skills.json)
```

---

## 2.2 electron-store設定

### ストア設定

```typescript
// ipc/index.ts
const skillsStore = new ElectronStore<{
  importedSkillIds: string[];
}>({
  name: "skills",
  defaults: {
    importedSkillIds: [],
  },
});
```

### ストアインターフェース

```typescript
// SkillImportManager.ts
interface SkillStore {
  get(key: string, defaultValue: string[]): string[];
  set(key: string, value: string[]): void;
  path?: string; // デバッグ用
}
```

---

## 2.3 コード例

### デバッグログ実装

```typescript
// constructor
if (process.env.NODE_ENV !== "test") {
  console.log("[SkillImportManager] Store path:", store.path ?? "unknown");
}
console.log(
  "[SkillImportManager] Loaded imported IDs:",
  stored.length,
  "items",
);

// importSkills
console.log("[SkillImportManager] importSkills called with:", skillIds);
console.log(
  "[SkillImportManager] importSkills result:",
  importedCount,
  "new imports",
);

// removeSkill
console.log("[SkillImportManager] removeSkill called with:", skillId);
console.log("[SkillImportManager] removeSkill result:", removed);

// persist
console.log("[SkillImportManager] Persisting:", data.length, "items");
console.log("[SkillImportManager] Persist successful");
```

### 統合テスト例

```typescript
describe("SkillImportManager Integration Tests", () => {
  let store: ElectronStore<SkillStoreSchema>;
  let manager: SkillImportManager;
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "skill-store-test-"));
    store = new ElectronStore<SkillStoreSchema>({
      name: "skills-test",
      cwd: tempDir,
      defaults: { importedSkillIds: [] },
    });
    manager = new SkillImportManager(store);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("should persist imported skills to actual store file", async () => {
    await manager.importSkills(["skill-1", "skill-2"]);

    const storeData = store.get("importedSkillIds", []);
    expect(storeData).toEqual(["skill-1", "skill-2"]);
  });
});
```

---

## 2.4 トラブルシューティング

### 問題: インポート済みスキルが取得できない

**確認手順**:

1. ログを確認

   ```bash
   # Electronアプリのログを確認
   # [SkillImportManager] Store path: が出力されているか
   # [SkillImportManager] Loaded imported IDs: の件数を確認
   ```

2. ストアファイルを確認

   ```bash
   cat ~/Library/Application\ Support/@repo/desktop/skills.json
   ```

3. ファイルの権限を確認
   ```bash
   ls -la ~/Library/Application\ Support/@repo/desktop/skills.json
   # -rw-r--r-- が正常
   ```

### 問題: ストアファイルが存在しない

**原因**: アプリが一度も起動されていない、または権限の問題

**解決策**:

1. アプリを起動してスキルをインポート
2. ディレクトリの権限を確認

### 問題: ストアファイルが破損している

**症状**: JSONパースエラーがログに出力される

**解決策**:

1. バックアップを取る
2. ファイルを削除してアプリを再起動
   ```bash
   rm ~/Library/Application\ Support/@repo/desktop/skills.json
   ```

---

## 2.5 テストカバレッジ

| メトリクス        | 達成値 |
| ----------------- | ------ |
| Line Coverage     | 97.36% |
| Branch Coverage   | 92.85% |
| Function Coverage | 100%   |
| 全テスト数        | 144    |
| 統合テスト        | 23     |

---

## 2.6 関連ファイル

| ファイル                                                     | 用途                          |
| ------------------------------------------------------------ | ----------------------------- |
| `apps/desktop/src/main/services/skill/SkillImportManager.ts` | スキルインポート管理クラス    |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                 | IPCハンドラー                 |
| `apps/desktop/src/main/ipc/index.ts`                         | IPC初期化、electron-store設定 |

---

## 2.7 参考リンク

- [electron-store 公式ドキュメント](https://github.com/sindresorhus/electron-store)
- [Vitest 公式ドキュメント](https://vitest.dev/)

---

## 完了条件確認

- [x] Part 1: 概念的説明（初学者・非技術者向け）が記載されている
- [x] Part 2: 技術的詳細（開発者向け）が記載されている
- [x] electron-storeの設定が記載されている
- [x] コード例が含まれている
- [x] トラブルシューティング情報が記載されている
