# 統合テスト観点レビュー

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| 機能名   | システムプロンプトのデータベース永続化 |
| 作成日   | 2026-01-22                             |
| Phase    | 3                                      |
| タスクID | TASK-CHAT-SYSPROMPT-DB-001             |

---

## 1. IPC通信のテスト可能性

### 1.1 モック化の容易性

| コンポーネント     | モック化手法                   | 容易性 | 判定 |
| ------------------ | ------------------------------ | ------ | ---- |
| ipcMain.handle     | Electron testutilsでモック可能 | 高     | ✅   |
| ipcRenderer.invoke | jest.mockでモック可能          | 高     | ✅   |
| Repository層       | インターフェースDIでモック注入 | 高     | ✅   |
| validateIpcSender  | オプションで無効化可能         | 高     | ✅   |
| contextBridge      | preload経由のAPIテスト可能     | 中     | ✅   |

**設計確認ポイント**:

```typescript
// IPC Handler設計書より - DIパターンでモック化可能
export function registerSystemPromptHandlers(
  repository: ISystemPromptRepository, // ← インターフェースDI
): void {
  // ...
}
```

**結果**: 5/5 テスト可能 (100%)

### 1.2 エラーケースのテスト可能性

| エラーケース               | テスト手法                      | テスト可能性 | 判定 |
| -------------------------- | ------------------------------- | ------------ | ---- |
| Zodバリデーションエラー    | 不正入力を直接渡す              | 高           | ✅   |
| TemplateNotFoundError      | 存在しないIDで呼び出し          | 高           | ✅   |
| DuplicateTemplateNameError | 重複名で作成を試みる            | 高           | ✅   |
| PresetNotEditableError     | プリセットIDで更新/削除を試みる | 高           | ✅   |
| UnauthorizedAccessError    | 他ユーザーIDで操作を試みる      | 高           | ✅   |
| IPC Sender検証エラー       | 不正なsenderでeventを偽装       | 中           | ✅   |

**設計確認ポイント**:

```typescript
// IPC Handler設計書より - 明確なエラーハンドリング
function handleError(error: unknown): IPCErrorResponse {
  if (error instanceof z.ZodError) { ... }
  if (error instanceof TemplateNotFoundError) { ... }
  // すべてのエラーパターンが個別に処理される
}
```

**結果**: 6/6 テスト可能 (100%)

---

## 2. Repository層のテスト可能性

### 2.1 インメモリDBでのテスト

| 観点                   | 対応状況                     | テスト可能性 | 判定 |
| ---------------------- | ---------------------------- | ------------ | ---- |
| SQLiteインメモリモード | better-sqlite3の:memory:対応 | 高           | ✅   |
| Drizzle ORM互換性      | インメモリDBでも同一API      | 高           | ✅   |
| スキーマ適用           | drizzle-kit push:sqlite対応  | 高           | ✅   |
| テストデータ投入       | 直接INSERT可能               | 高           | ✅   |
| テスト分離             | 各テストで新規DBインスタンス | 高           | ✅   |

**設計確認ポイント**:

```typescript
// Repository設計書より - コンストラクタDIでDB注入可能
export class SystemPromptRepository implements ISystemPromptRepository {
  constructor(private db: BetterSQLite3Database) {} // ← テスト用DB注入可能
}
```

**テストセットアップ例**:

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

function createTestDb() {
  const sqlite = new Database(":memory:");
  const db = drizzle(sqlite);
  // スキーマ適用
  db.run(sql`CREATE TABLE system_prompt_templates (...)`);
  return db;
}

describe("SystemPromptRepository", () => {
  let db: BetterSQLite3Database;
  let repository: SystemPromptRepository;

  beforeEach(() => {
    db = createTestDb();
    repository = new SystemPromptRepository(db);
  });
});
```

**結果**: 5/5 テスト可能 (100%)

### 2.2 トランザクション境界の明確性

| 操作             | トランザクション境界               | 分離性 | 判定 |
| ---------------- | ---------------------------------- | ------ | ---- |
| create           | 単一INSERT（暗黙トランザクション） | 明確   | ✅   |
| update           | SELECT + UPDATE（分離）            | 明確   | ✅   |
| delete           | 単一DELETE（暗黙トランザクション） | 明確   | ✅   |
| findAllByUserId  | 単一SELECT（読み取り専用）         | 明確   | ✅   |
| マイグレーション | ループ内個別INSERT                 | 明確   | ✅   |

**注記**: マイグレーション処理は個別INSERT方式であり、1件失敗しても他は影響しない設計。

**結果**: 5/5 トランザクション境界明確 (100%)

---

## 3. マイグレーション処理のテスト可能性

### 3.1 テストデータの準備容易性

| 観点                     | 対応状況                          | 容易性 | 判定 |
| ------------------------ | --------------------------------- | ------ | ---- |
| electron-storeモック     | コンストラクタDIでStore注入可能   | 高     | ✅   |
| テストデータ形式         | JSON形式で明確に定義済み          | 高     | ✅   |
| バックアップファイル操作 | fs.writeFile/readFileでテスト可能 | 高     | ✅   |
| 移行元データ設定         | store.set()で任意データ設定可能   | 高     | ✅   |

**設計確認ポイント**:

```typescript
// マイグレーション設計書より - StoreもDI可能
export class ElectronStoreMigration implements IElectronStoreMigration {
  constructor(
    private repository: ISystemPromptRepository,
    store?: Store, // ← テスト用Storeモック注入可能
  ) {
    this.store = store ?? new Store();
  }
}
```

**テストデータ例**:

```typescript
const mockStore = {
  get: jest.fn().mockReturnValue([
    {
      id: "custom-1703347200000-abc123",
      name: "テスト翻訳",
      content: "翻訳テンプレート内容",
      isPreset: false,
      createdAt: "2024-12-23T12:00:00.000Z",
      updatedAt: "2024-12-23T12:00:00.000Z",
    },
  ]),
  set: jest.fn(),
};
```

**結果**: 4/4 容易 (100%)

### 3.2 ロールバックのテスト可能性

| シナリオ             | テスト手法                          | テスト可能性 | 判定 |
| -------------------- | ----------------------------------- | ------------ | ---- |
| バックアップ作成確認 | 一時ディレクトリでファイル確認      | 高           | ✅   |
| バックアップ復元確認 | restoreFromBackup後のstore.get検証  | 高           | ✅   |
| 移行失敗時の自動復元 | Repository.createをエラーにして検証 | 高           | ✅   |
| 完了マークリセット   | resetMigrationStatus後の再移行検証  | 高           | ✅   |

**テストシナリオ例**:

```typescript
it("移行失敗時にバックアップから復元される", async () => {
  // Arrange
  const mockRepository = {
    existsByUserIdAndName: jest.fn().mockResolvedValue(false),
    create: jest.fn().mockRejectedValue(new Error("DB_ERROR")),
  };

  // Act
  await runMigrationWithRecovery(migration, "user-1");

  // Assert
  expect(mockStore.set).toHaveBeenCalledWith(
    "systemPromptTemplates",
    expect.any(Array),
  );
});
```

**結果**: 4/4 テスト可能 (100%)

---

## 4. E2Eテストの観点

### 4.1 ユーザーシナリオカバレッジ

| ユーザーシナリオ       | カバー状況                        | 優先度 | 判定 |
| ---------------------- | --------------------------------- | ------ | ---- |
| テンプレート一覧表示   | IPC + UI連携テスト必要            | 高     | ✅   |
| 新規テンプレート作成   | フォーム → IPC → DB → 表示更新    | 高     | ✅   |
| テンプレート編集       | 選択 → 編集 → 保存 → 表示更新     | 高     | ✅   |
| テンプレート削除       | 選択 → 削除確認 → 削除 → 表示更新 | 高     | ✅   |
| プリセット表示         | プリセット一覧表示確認            | 中     | ✅   |
| プリセット編集不可確認 | 編集ボタン無効化・エラー表示      | 中     | ✅   |
| マイグレーション実行   | 初回起動時の自動移行確認          | 高     | ✅   |
| 名前重複エラー表示     | 重複名入力時のエラーメッセージ    | 中     | ✅   |

**E2Eテスト構成例**:

```typescript
// Playwright + Electron テスト
describe("System Prompt Templates E2E", () => {
  test("ユーザーがテンプレートを作成・編集・削除できる", async ({ page }) => {
    // 1. 一覧ページへ遷移
    await page.goto("/settings/templates");

    // 2. 新規作成
    await page.click('[data-testid="create-template-button"]');
    await page.fill('[data-testid="template-name-input"]', "テスト");
    await page.fill('[data-testid="template-content-input"]', "内容");
    await page.click('[data-testid="save-button"]');

    // 3. 一覧に表示確認
    await expect(page.locator("text=テスト")).toBeVisible();

    // 4. 編集
    await page.click('[data-testid="edit-button"]');
    await page.fill('[data-testid="template-name-input"]', "テスト編集済");
    await page.click('[data-testid="save-button"]');

    // 5. 削除
    await page.click('[data-testid="delete-button"]');
    await page.click('[data-testid="confirm-delete"]');
    await expect(page.locator("text=テスト編集済")).not.toBeVisible();
  });
});
```

**結果**: 8/8 カバー (100%)

### 4.2 オフライン動作のテスト方針

| テスト観点                | テスト手法                            | 実現可能性 | 判定 |
| ------------------------- | ------------------------------------- | ---------- | ---- |
| オフライン時のCRUD        | ネットワーク切断状態でE2E実行         | 中         | ✅   |
| Embedded Replicas使用確認 | Turso接続エラー時のフォールバック検証 | 中         | ✅   |
| オンライン復帰後の同期    | 接続復帰後のデータ同期確認            | 低         | ⚠️   |
| 競合解決（LWW）           | 同時更新シナリオの検証                | 低         | ⚠️   |

**注記**: オンライン復帰後の同期と競合解決は、Tursoの自動同期機能に依存するため、詳細なE2Eテストは困難。統合テストレベルでの検証を推奨。

**テスト方針**:

```typescript
// Playwrightでネットワーク切断をシミュレート
test("オフライン時もテンプレートCRUDが動作する", async ({ page, context }) => {
  // オフライン状態をシミュレート
  await context.setOffline(true);

  // CRUD操作を実行
  await page.click('[data-testid="create-template-button"]');
  // ...

  // オンラインに復帰
  await context.setOffline(false);

  // 同期完了を待機（実装依存）
  await page.waitForSelector('[data-testid="sync-complete"]');
});
```

**結果**: 2/4 完全テスト可能、2/4 部分的テスト可能 (75%)

---

## 5. 問題リスト

| ID   | 重要度 | 問題内容                           | 対処方針                         |
| ---- | ------ | ---------------------------------- | -------------------------------- |
| IT-1 | MINOR  | オンライン復帰後の同期テストが困難 | 統合テストレベルで基本動作を確認 |
| IT-2 | MINOR  | 競合解決（LWW）のE2Eテストが困難   | 単体テストでLWWロジックを検証    |

---

## 6. 総合判定

| 検証カテゴリ                  | テスト可能項目 | 総項目数 | テスト可能率 |
| ----------------------------- | -------------- | -------- | ------------ |
| IPC モック化                  | 5              | 5        | 100%         |
| IPC エラーケース              | 6              | 6        | 100%         |
| Repository インメモリDB       | 5              | 5        | 100%         |
| Repository トランザクション   | 5              | 5        | 100%         |
| マイグレーション データ準備   | 4              | 4        | 100%         |
| マイグレーション ロールバック | 4              | 4        | 100%         |
| E2E ユーザーシナリオ          | 8              | 8        | 100%         |
| E2E オフライン動作            | 2              | 4        | 50%          |
| **合計**                      | **39**         | **41**   | **95.1%**    |

**判定結果**: ✅ PASS

オフライン動作の一部テストが困難であるが、これはTursoの自動同期機能に依存する部分であり、単体テスト・統合テストでカバー可能。E2Eテストでは基本的なオフラインCRUD動作の確認に留める方針で問題なし。

---

## 7. 完了条件

- [x] IPC通信のテスト可能性が確認されている
- [x] Repository層のテスト可能性が確認されている
- [x] マイグレーション処理のテスト可能性が確認されている
- [x] E2Eテストの観点が確認されている
- [x] 問題リストが作成されている
- [x] 判定結果がPASSである
