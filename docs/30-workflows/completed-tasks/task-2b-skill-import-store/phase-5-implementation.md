# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 5                     |
| Phase名    | 実装（TDD: Green）    |
| 前提Phase  | Phase 4（テスト作成） |
| 後続Phase  | Phase 6（テスト拡充） |
| ステータス | 未実施                |
| 作成日     | 2026-01-24            |
| 機能名     | SkillImportStore      |

---

## 目的

TDD の Green フェーズとして、Phase 4 で作成したテストが全てパスする最小限の実装を行う。
Phase 2 の設計に基づき、skillImportStore の全機能を実装する。

## 背景

TDD では、テストを通すための最小限の実装を行い、動作するコードを素早く作成する。
リファクタリングは Phase 8 で行うため、この段階では機能の動作を優先する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ファイル作成・基本構造

**目的**: skillImportStore.ts ファイルを作成し、基本構造を実装する

**実行手順**:

1. `apps/desktop/src/main/settings/skillImportStore.ts` を作成する
2. electron-store の初期化コードを実装する
3. スキーマ定義とデフォルト値を設定する
4. エクスポート構造を定義する

**実装コード（骨格）**:

```typescript
/**
 * Skill Import Store - スキルインポート情報永続化サービス
 *
 * electron-storeを使用してインポート済みスキルの情報を永続化するサービス。
 * スキーマバージョン管理とマイグレーション機能を含む。
 *
 * @module @repo/desktop/main/settings/skillImportStore
 */

import Store from "electron-store";
import type { SkillMetadata } from "@repo/shared/types";

// --- 型定義 ---

interface ImportedSkillData {
  name: string;
  importedAt: string; // ISO文字列
  status: "active" | "disabled";
  lastUsedAt?: string;
}

interface SkillSettings {
  autoApproveReadOnly: boolean;
  rememberPermissions: boolean;
  rememberedPermissions: Record<string, "allow" | "deny">;
}

interface SkillStoreSchema {
  schemaVersion: number;
  importedSkills: Record<string, ImportedSkillData>;
  skillSettings: Record<string, SkillSettings>;
  lastScanAt?: string;
  skillCache?: Record<string, { metadata: SkillMetadata; cachedAt: string }>;
}

// --- 定数 ---

const CURRENT_SCHEMA_VERSION = 1;

const DEFAULT_SKILL_SETTINGS: SkillSettings = {
  autoApproveReadOnly: false,
  rememberPermissions: true,
  rememberedPermissions: {},
};

// --- ストア初期化 ---

const store = new Store<SkillStoreSchema>({
  name: "skill-imports",
  defaults: {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    importedSkills: {},
    skillSettings: {},
  },
  migrations: {
    "1": (store) => {
      store.set("schemaVersion", 1);
    },
  },
});

// --- API実装 ---

export const skillImportStore = {
  // 実装をここに追加
};
```

**期待される成果物**:

- `apps/desktop/src/main/settings/skillImportStore.ts`（骨格）

---

### タスク2: インポート管理機能の実装

**目的**: getImported, addImport, removeImport, exists, updateLastUsed を実装する

**実行手順**:

1. getImported() を実装する
2. addImport(skillName) を実装する
3. removeImport(skillName) を実装する
4. exists(skillName) を実装する
5. updateLastUsed(skillName) を実装する
6. 対応するテストがパスすることを確認する

**実装コード**:

```typescript
export const skillImportStore = {
  /** インポート済みスキル一覧を取得 */
  getImported(): ImportedSkillData[] {
    return Object.values(store.get("importedSkills"));
  },

  /** スキルをインポート */
  addImport(skillName: string): void {
    const importedSkills = store.get("importedSkills");
    importedSkills[skillName] = {
      name: skillName,
      importedAt: new Date().toISOString(),
      status: "active",
    };
    store.set("importedSkills", importedSkills);
  },

  /** スキルを削除 */
  removeImport(skillName: string): void {
    const importedSkills = store.get("importedSkills");
    delete importedSkills[skillName];
    store.set("importedSkills", importedSkills);

    // 設定とキャッシュも削除
    const skillSettings = store.get("skillSettings");
    delete skillSettings[skillName];
    store.set("skillSettings", skillSettings);

    this.invalidateCache(skillName);
  },

  /** スキルが存在するか確認 */
  exists(skillName: string): boolean {
    const importedSkills = store.get("importedSkills");
    return skillName in importedSkills;
  },

  /** 最終使用日時を更新 */
  updateLastUsed(skillName: string): void {
    const importedSkills = store.get("importedSkills");
    if (importedSkills[skillName]) {
      importedSkills[skillName].lastUsedAt = new Date().toISOString();
      store.set("importedSkills", importedSkills);
    }
  },
  // ...
};
```

**期待される成果物**:

- `outputs/phase-5/import-management-implementation.md`

---

### タスク3: 設定管理機能の実装

**目的**: getSettings, updateSettings を実装する

**実行手順**:

1. getSettings(skillName) を実装する（デフォルト値返却含む）
2. updateSettings(skillName, settings) を実装する（マージ処理含む）
3. 対応するテストがパスすることを確認する

**実装コード**:

```typescript
  /** スキル設定を取得 */
  getSettings(skillName: string): SkillSettings {
    const skillSettings = store.get("skillSettings");
    return skillSettings[skillName] ?? { ...DEFAULT_SKILL_SETTINGS };
  },

  /** スキル設定を更新 */
  updateSettings(skillName: string, settings: Partial<SkillSettings>): void {
    const skillSettings = store.get("skillSettings");
    const currentSettings = skillSettings[skillName] ?? { ...DEFAULT_SKILL_SETTINGS };
    skillSettings[skillName] = {
      ...currentSettings,
      ...settings,
    };
    store.set("skillSettings", skillSettings);
  },
```

**期待される成果物**:

- `outputs/phase-5/settings-management-implementation.md`

---

### タスク4: 権限管理機能の実装

**目的**: rememberPermission, getRememberedPermission を実装する

**実行手順**:

1. rememberPermission(skillName, toolName, decision) を実装する
2. getRememberedPermission(skillName, toolName) を実装する
3. 対応するテストがパスすることを確認する

**実装コード**:

```typescript
  /** 権限を記憶 */
  rememberPermission(
    skillName: string,
    toolName: string,
    decision: "allow" | "deny"
  ): void {
    const skillSettings = store.get("skillSettings");
    const currentSettings = skillSettings[skillName] ?? { ...DEFAULT_SKILL_SETTINGS };
    currentSettings.rememberedPermissions[toolName] = decision;
    skillSettings[skillName] = currentSettings;
    store.set("skillSettings", skillSettings);
  },

  /** 記憶された権限を取得 */
  getRememberedPermission(
    skillName: string,
    toolName: string
  ): "allow" | "deny" | undefined {
    const skillSettings = store.get("skillSettings");
    return skillSettings[skillName]?.rememberedPermissions[toolName];
  },
```

**期待される成果物**:

- `outputs/phase-5/permission-management-implementation.md`

---

### タスク5: キャッシュ管理機能の実装

**目的**: setCache, getCache, invalidateCache を実装する

**実行手順**:

1. setCache(skillName, metadata) を実装する
2. getCache(skillName) を実装する
3. invalidateCache(skillName?) を実装する
4. 対応するテストがパスすることを確認する

**実装コード**:

```typescript
  /** キャッシュを設定 */
  setCache(skillName: string, metadata: SkillMetadata): void {
    const skillCache = store.get("skillCache") ?? {};
    skillCache[skillName] = {
      metadata,
      cachedAt: new Date().toISOString(),
    };
    store.set("skillCache", skillCache);
  },

  /** キャッシュを取得 */
  getCache(
    skillName: string
  ): { metadata: SkillMetadata; cachedAt: string } | undefined {
    const skillCache = store.get("skillCache") ?? {};
    return skillCache[skillName];
  },

  /** キャッシュを無効化 */
  invalidateCache(skillName?: string): void {
    if (skillName) {
      const skillCache = store.get("skillCache") ?? {};
      delete skillCache[skillName];
      store.set("skillCache", skillCache);
    } else {
      store.set("skillCache", {});
    }
  },
```

**期待される成果物**:

- `outputs/phase-5/cache-management-implementation.md`

---

## 参照資料

| 参照資料       | パス                                                                | 内容         |
| -------------- | ------------------------------------------------------------------- | ------------ |
| API設計        | `outputs/phase-2/api-design.md`                                     | API仕様      |
| スキーマ設計   | `outputs/phase-2/schema-design.md`                                  | スキーマ詳細 |
| 既存パターン   | `apps/desktop/src/main/settings/slideSettingsStore.ts`              | 実装パターン |
| テストファイル | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` | テストコード |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                   | 内容         |
| -------------------- | ---------------------------------------------------------------------- | ------------ |
| コアインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md` | 設計パターン |

---

## 成果物

| 成果物             | パス                                                      | 内容       |
| ------------------ | --------------------------------------------------------- | ---------- |
| 実装ファイル       | `apps/desktop/src/main/settings/skillImportStore.ts`      | 本体コード |
| インポート管理実装 | `outputs/phase-5/import-management-implementation.md`     | 実装記録   |
| 設定管理実装       | `outputs/phase-5/settings-management-implementation.md`   | 実装記録   |
| 権限管理実装       | `outputs/phase-5/permission-management-implementation.md` | 実装記録   |
| キャッシュ管理実装 | `outputs/phase-5/cache-management-implementation.md`      | 実装記録   |

---

## 統合テスト連携

> electron-store連携の実装とテスト支援コード整備

| 連携ポイント   | 確認事項                                |
| -------------- | --------------------------------------- |
| electron-store | 正しいパスにストアファイルが作成される  |
| IPC連携準備    | TASK-4-2 で使用可能な形式でエクスポート |
| テスト支援     | テスト用のリセット関数を提供            |

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- skillImportStore
```

**確認項目**:

- [ ] 全てのテストが成功することを確認（Green状態）

---

## 完了条件

- [ ] `skillImportStore.ts` が作成されている
- [ ] getImported, addImport, removeImport, exists, updateLastUsed が実装されている
- [ ] getSettings, updateSettings が実装されている
- [ ] rememberPermission, getRememberedPermission が実装されている
- [ ] setCache, getCache, invalidateCache が実装されている
- [ ] Phase 4 で作成した全テストがパスする（Green状態）
- [ ] `pnpm --filter @repo/desktop build` が成功する

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] テストがGreen状態であることを確認

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/task-2b-skill-import-store/phase-6-test-expansion.md`
