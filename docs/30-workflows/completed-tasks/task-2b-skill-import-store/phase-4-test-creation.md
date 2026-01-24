# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 4                       |
| Phase名    | テスト作成（TDD: Red）  |
| 前提Phase  | Phase 3（設計レビュー） |
| 後続Phase  | Phase 5（実装）         |
| ステータス | 未実施                  |
| 作成日     | 2026-01-24              |
| 機能名     | SkillImportStore        |

---

## 目的

TDD の Red フェーズとして、実装前に失敗するテストを作成する。
Phase 2 のテスト設計に基づき、全ての機能要件をテストでカバーする。

## 背景

TDD では、実装前にテストを書くことで、要件を明確化し、実装の品質を保証する。
失敗するテストを先に作成し、実装後にテストが成功することを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストファイル・ディレクトリ作成

**目的**: テストファイルの雛形を作成する

**実行手順**:

1. `apps/desktop/src/main/settings/__tests__/` ディレクトリが存在することを確認する
2. `skillImportStore.test.ts` ファイルを作成する
3. Vitest の設定と import を記述する
4. テストスイートの骨格を作成する

**作成ファイル**:

```typescript
// apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
// import { skillImportStore } from "../skillImportStore"; // 実装後にアンコメント

describe("skillImportStore", () => {
  beforeEach(() => {
    // テスト前のセットアップ
  });

  afterEach(() => {
    // テスト後のクリーンアップ
  });

  describe("import management", () => {
    // テストケースをここに追加
  });

  describe("settings management", () => {
    // テストケースをここに追加
  });

  describe("permission management", () => {
    // テストケースをここに追加
  });

  describe("cache management", () => {
    // テストケースをここに追加
  });

  describe("schema migration", () => {
    // テストケースをここに追加
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts`（骨格）

---

### タスク2: インポート管理テストの作成

**目的**: スキルインポート管理機能のテストを作成する

**実行手順**:

1. `outputs/phase-2/test-design.md` を参照する
2. import management のテストケースを実装する
3. テストが失敗することを確認する（Red状態）

**テストケース**:

```typescript
describe("import management", () => {
  it("should add a new import", () => {
    // skillImportStore.addImport("test-skill");
    // const imported = skillImportStore.getImported();
    // expect(imported).toHaveLength(1);
    // expect(imported[0].name).toBe("test-skill");
    expect(true).toBe(false); // Red: 実装前は失敗
  });

  it("should remove an import", () => {
    // skillImportStore.addImport("test-skill");
    // skillImportStore.removeImport("test-skill");
    // expect(skillImportStore.exists("test-skill")).toBe(false);
    expect(true).toBe(false);
  });

  it("should return all imported skills", () => {
    // skillImportStore.addImport("skill-1");
    // skillImportStore.addImport("skill-2");
    // const imported = skillImportStore.getImported();
    // expect(imported).toHaveLength(2);
    expect(true).toBe(false);
  });

  it("should check if skill exists", () => {
    // skillImportStore.addImport("test-skill");
    // expect(skillImportStore.exists("test-skill")).toBe(true);
    // expect(skillImportStore.exists("unknown")).toBe(false);
    expect(true).toBe(false);
  });

  it("should update last used timestamp", () => {
    // skillImportStore.addImport("test-skill");
    // const before = skillImportStore.getImported()[0].lastUsedAt;
    // skillImportStore.updateLastUsed("test-skill");
    // const after = skillImportStore.getImported()[0].lastUsedAt;
    // expect(after).not.toBe(before);
    expect(true).toBe(false);
  });
});
```

**期待される成果物**:

- `outputs/phase-4/import-management-tests.md`（テストケース一覧）

---

### タスク3: 設定管理テストの作成

**目的**: スキル設定管理機能のテストを作成する

**実行手順**:

1. settings management のテストケースを実装する
2. テストが失敗することを確認する（Red状態）

**テストケース**:

```typescript
describe("settings management", () => {
  it("should return default settings for new skill", () => {
    // const settings = skillImportStore.getSettings("new-skill");
    // expect(settings.autoApproveReadOnly).toBe(false);
    // expect(settings.rememberPermissions).toBe(true);
    // expect(settings.rememberedPermissions).toEqual({});
    expect(true).toBe(false);
  });

  it("should update settings", () => {
    // skillImportStore.updateSettings("test-skill", {
    //   autoApproveReadOnly: true,
    // });
    // const settings = skillImportStore.getSettings("test-skill");
    // expect(settings.autoApproveReadOnly).toBe(true);
    expect(true).toBe(false);
  });

  it("should merge partial settings", () => {
    // skillImportStore.updateSettings("test-skill", {
    //   autoApproveReadOnly: true,
    // });
    // skillImportStore.updateSettings("test-skill", {
    //   rememberPermissions: false,
    // });
    // const settings = skillImportStore.getSettings("test-skill");
    // expect(settings.autoApproveReadOnly).toBe(true);
    // expect(settings.rememberPermissions).toBe(false);
    expect(true).toBe(false);
  });
});
```

**期待される成果物**:

- `outputs/phase-4/settings-management-tests.md`

---

### タスク4: 権限管理テストの作成

**目的**: 権限記憶機能のテストを作成する

**実行手順**:

1. permission management のテストケースを実装する
2. テストが失敗することを確認する（Red状態）

**テストケース**:

```typescript
describe("permission management", () => {
  it("should remember permission", () => {
    // skillImportStore.rememberPermission("test-skill", "Read", "allow");
    // const permission = skillImportStore.getRememberedPermission(
    //   "test-skill",
    //   "Read"
    // );
    // expect(permission).toBe("allow");
    expect(true).toBe(false);
  });

  it("should return remembered permission", () => {
    // skillImportStore.rememberPermission("test-skill", "Write", "deny");
    // expect(skillImportStore.getRememberedPermission("test-skill", "Write")).toBe("deny");
    expect(true).toBe(false);
  });

  it("should return undefined for unknown permission", () => {
    // const permission = skillImportStore.getRememberedPermission(
    //   "test-skill",
    //   "Unknown"
    // );
    // expect(permission).toBeUndefined();
    expect(true).toBe(false);
  });
});
```

**期待される成果物**:

- `outputs/phase-4/permission-management-tests.md`

---

### タスク5: キャッシュ管理・マイグレーションテストの作成

**目的**: キャッシュ管理とスキーママイグレーションのテストを作成する

**実行手順**:

1. cache management のテストケースを実装する
2. schema migration のテストケースを実装する
3. テストが失敗することを確認する（Red状態）

**テストケース**:

```typescript
describe("cache management", () => {
  it("should set and get cache", () => {
    // const metadata: SkillMetadata = { name: "test", ... };
    // skillImportStore.setCache("test-skill", metadata);
    // const cached = skillImportStore.getCache("test-skill");
    // expect(cached?.metadata.name).toBe("test");
    expect(true).toBe(false);
  });

  it("should invalidate specific skill cache", () => {
    // skillImportStore.setCache("skill-1", metadata1);
    // skillImportStore.setCache("skill-2", metadata2);
    // skillImportStore.invalidateCache("skill-1");
    // expect(skillImportStore.getCache("skill-1")).toBeUndefined();
    // expect(skillImportStore.getCache("skill-2")).toBeDefined();
    expect(true).toBe(false);
  });

  it("should invalidate all cache", () => {
    // skillImportStore.setCache("skill-1", metadata1);
    // skillImportStore.setCache("skill-2", metadata2);
    // skillImportStore.invalidateCache();
    // expect(skillImportStore.getCache("skill-1")).toBeUndefined();
    // expect(skillImportStore.getCache("skill-2")).toBeUndefined();
    expect(true).toBe(false);
  });
});

describe("schema migration", () => {
  it("should migrate from version 0 to 1", () => {
    // バージョン0の古いデータで初期化
    // マイグレーション後にバージョン1になることを確認
    expect(true).toBe(false);
  });

  it("should handle corrupted data gracefully", () => {
    // 破損データでの初期化がエラーにならないことを確認
    expect(true).toBe(false);
  });
});
```

**期待される成果物**:

- `outputs/phase-4/cache-migration-tests.md`

---

## 参照資料

| 参照資料   | パス                                        | 内容             |
| ---------- | ------------------------------------------- | ---------------- |
| テスト設計 | `outputs/phase-2/test-design.md`            | テストケース設計 |
| API設計    | `outputs/phase-2/api-design.md`             | API仕様          |
| 既存テスト | `apps/desktop/src/main/settings/__tests__/` | テストパターン   |

---

## 成果物

| 成果物                       | パス                                                                | 内容         |
| ---------------------------- | ------------------------------------------------------------------- | ------------ |
| テストファイル               | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` | テストコード |
| インポート管理テスト一覧     | `outputs/phase-4/import-management-tests.md`                        | テストケース |
| 設定管理テスト一覧           | `outputs/phase-4/settings-management-tests.md`                      | テストケース |
| 権限管理テスト一覧           | `outputs/phase-4/permission-management-tests.md`                    | テストケース |
| キャッシュ・マイグレーション | `outputs/phase-4/cache-migration-tests.md`                          | テストケース |

---

## 統合テスト連携

> 統合テストシナリオを全カテゴリで作成する

| テストカテゴリ     | 確認事項                            |
| ------------------ | ----------------------------------- |
| IPC連携テスト      | IPC経由でのストア操作テストシナリオ |
| データフローテスト | Renderer → IPC → Store の往復確認   |
| エラーハンドリング | ストアエラー時のIPC応答確認         |

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- skillImportStore
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 完了条件

- [ ] テストファイル `skillImportStore.test.ts` が作成されている
- [ ] import management テストケースが5件以上作成されている
- [ ] settings management テストケースが3件以上作成されている
- [ ] permission management テストケースが3件以上作成されている
- [ ] cache management テストケースが3件以上作成されている
- [ ] schema migration テストケースが2件以上作成されている
- [ ] 全てのテストが失敗する（Red状態）ことを確認

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] テストがRed状態であることを確認

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/task-2b-skill-import-store/phase-5-implementation.md`
