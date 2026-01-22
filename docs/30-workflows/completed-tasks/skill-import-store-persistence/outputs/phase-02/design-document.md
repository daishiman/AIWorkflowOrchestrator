# Phase 2 - タスク1: 設計書

## 作成日

2026-01-22

---

## 1. 問題の要約（Phase 1より）

### 根本原因

**統合テストの不足により、モックと実際のelectron-storeの挙動差異が検出されていない**

### 調査結果

- ストアファイル: 正常に作成されている（`~/Library/Application Support/@repo/desktop/skills.json`）
- ストア内容: `{"importedSkillIds": []}` - 空配列
- コード: 問題なし（SkillImportManager, skillHandlers, preload API）
- テスト: モックのみ使用、実際のelectron-storeとの統合テストがない

---

## 2. 修正方針

### 方針A: 統合テストの追加（推奨）

**概要**: 既存コードは正常であり、問題は検証不足。実際のelectron-storeを使用した統合テストを追加する。

**修正内容**:

1. 統合テストファイルの作成
2. デバッグログの追加
3. テスト用ユーティリティの作成

**メリット**:

- 既存コードへの影響が最小限
- 問題の早期発見が可能
- 将来のリグレッション防止

**デメリット**:

- テストの実行時間が増加
- テスト環境の準備が必要

### 方針B: コードの安全性強化（補助的）

**概要**: 既存コードにデバッグログとエラーハンドリングを強化する。

**修正内容**:

1. SkillImportManagerにデバッグログ追加
2. ストアパスのログ出力
3. 読み書き時のデータログ

---

## 3. 採用方針

**方針A + 方針Bの組み合わせ**

1. 統合テストを追加して問題を検証可能にする
2. デバッグログを追加して問題特定を容易にする
3. 既存のユニットテストは維持する

---

## 4. 修正対象ファイル

### 新規作成

| ファイル                                                                                | 説明       |
| --------------------------------------------------------------------------------------- | ---------- |
| `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.integration.test.ts` | 統合テスト |

### 修正

| ファイル                                                     | 修正内容         |
| ------------------------------------------------------------ | ---------------- |
| `apps/desktop/src/main/services/skill/SkillImportManager.ts` | デバッグログ追加 |

### 影響なし

| ファイル                                                                    | 理由           |
| --------------------------------------------------------------------------- | -------------- |
| `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts` | 既存テスト維持 |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                                | 変更不要       |
| `apps/desktop/src/main/ipc/index.ts`                                        | 変更不要       |

---

## 5. 設計詳細

### 5.1 統合テストの設計

```typescript
// SkillImportManager.integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Store from "electron-store";
import { SkillImportManager } from "../SkillImportManager";
import fs from "fs";
import path from "path";
import os from "os";

describe("SkillImportManager Integration Tests", () => {
  let testStorePath: string;
  let store: Store<{ importedSkillIds: string[] }>;
  let manager: SkillImportManager;

  beforeEach(() => {
    // テスト用の一時ディレクトリを作成
    testStorePath = path.join(os.tmpdir(), `skill-test-${Date.now()}`);
    fs.mkdirSync(testStorePath, { recursive: true });

    // 実際のelectron-storeインスタンスを作成
    store = new Store<{ importedSkillIds: string[] }>({
      name: "skills-test",
      cwd: testStorePath,
      defaults: { importedSkillIds: [] },
    });

    manager = new SkillImportManager(store);
  });

  afterEach(() => {
    // テスト後にクリーンアップ
    fs.rmSync(testStorePath, { recursive: true, force: true });
  });

  it("should persist imported skills to actual store file", async () => {
    // Act
    await manager.importSkills(["skill-1", "skill-2"]);

    // Assert - ストアファイルの内容を直接確認
    const storeFilePath = path.join(testStorePath, "skills-test.json");
    const fileContent = JSON.parse(fs.readFileSync(storeFilePath, "utf-8"));
    expect(fileContent.importedSkillIds).toContain("skill-1");
    expect(fileContent.importedSkillIds).toContain("skill-2");
  });

  it("should restore imported skills across instances", async () => {
    // Arrange - 最初のインスタンスでインポート
    await manager.importSkills(["skill-1"]);

    // Act - 新しいインスタンスを作成
    const newStore = new Store<{ importedSkillIds: string[] }>({
      name: "skills-test",
      cwd: testStorePath,
      defaults: { importedSkillIds: [] },
    });
    const newManager = new SkillImportManager(newStore);

    // Assert
    expect(newManager.getImportedSkillIds()).toContain("skill-1");
  });
});
```

### 5.2 デバッグログの設計

```typescript
// SkillImportManager.ts に追加するログ
constructor(store: SkillStore) {
  this.store = store;

  // デバッグログ: ストアパスの出力
  if (process.env.NODE_ENV !== "test") {
    const storePath = (store as unknown as { path?: string }).path;
    console.log("[SkillImportManager] Store path:", storePath);
  }

  try {
    const stored = this.store.get(STORE_KEY, []) as string[];
    console.log("[SkillImportManager] Loaded imported IDs:", stored);
    this.importedIds = new Set(stored);
  } catch (error) {
    console.error("[SkillImportManager] Failed to load from store:", error);
    this.importedIds = new Set();
  }
}

private persist(): void {
  try {
    const data = Array.from(this.importedIds);
    console.log("[SkillImportManager] Persisting:", data);
    this.store.set(STORE_KEY, data);
    console.log("[SkillImportManager] Persist successful");
  } catch (error) {
    console.error("[SkillImportManager] Failed to persist:", error);
  }
}
```

---

## 6. 影響範囲評価

### 既存テストへの影響

| テストファイル             | 影響 | 対応     |
| -------------------------- | ---- | -------- |
| SkillImportManager.test.ts | なし | 変更不要 |
| SkillService.test.ts       | なし | 変更不要 |
| skillHandlers.test.ts      | なし | 変更不要 |
| skillAPI.test.ts           | なし | 変更不要 |

### 本番環境への影響

| 項目           | 影響                 | 対応                     |
| -------------- | -------------------- | ------------------------ |
| パフォーマンス | 軽微（ログ出力のみ） | 本番では最小限のログ     |
| データ互換性   | なし                 | データ構造変更なし       |
| API互換性      | なし                 | インターフェース変更なし |

---

## 7. 統合ポイント

### データフロー図

```
┌───────────────────────────────────────────────────────────────────┐
│ 統合テスト対象範囲                                                  │
│                                                                     │
│  ┌─────────────────┐     ┌─────────────────────┐                  │
│  │ Test Runner     │────>│ SkillImportManager  │                  │
│  │ (Vitest)        │     │ (実インスタンス)     │                  │
│  └─────────────────┘     └──────────┬──────────┘                  │
│                                      │                              │
│                                      ▼                              │
│                          ┌─────────────────────┐                   │
│                          │    electron-store   │                   │
│                          │ (実ファイルI/O)      │                   │
│                          └──────────┬──────────┘                   │
│                                      │                              │
│                                      ▼                              │
│                          ┌─────────────────────┐                   │
│                          │  skills-test.json   │                   │
│                          │  (テスト用一時ファイル) │                │
│                          └─────────────────────┘                   │
│                                                                     │
└───────────────────────────────────────────────────────────────────┘
```

---

## 8. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                 |
| -------------------------------- | ------ | -------- | ------------------------------------ |
| テスト環境のファイルアクセス権限 | 中     | 低       | os.tmpdir()を使用                    |
| テスト間の干渉                   | 中     | 低       | beforeEach/afterEachでクリーンアップ |
| CI/CD環境での動作差異            | 中     | 中       | クロスプラットフォームパスを使用     |

---

## 9. 完了条件

- [x] 修正方針が明確に設計されている
- [x] 修正対象ファイルが特定されている
- [x] 統合テストの設計が完了している
- [x] デバッグログの設計が完了している
- [x] 影響範囲が評価されている
