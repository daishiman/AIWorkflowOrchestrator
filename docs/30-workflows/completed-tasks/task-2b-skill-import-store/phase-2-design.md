# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 2                       |
| Phase名    | 設計                    |
| 前提Phase  | Phase 1（要件定義）     |
| 後続Phase  | Phase 3（設計レビュー） |
| ステータス | 未実施                  |
| 作成日     | 2026-01-24              |
| 機能名     | SkillImportStore        |

---

## 目的

Phase 1 で確定した要件に基づき、SkillImportStore の詳細設計を行う。
スキーマ定義、API設計、マイグレーション設計を完成させる。

## 背景

適切な設計なしに実装を進めると、後からの修正コストが増大する。
特に永続化層は変更が困難なため、スキーマ設計を慎重に行う必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: スキーマ詳細設計

**目的**: SkillStoreSchema の詳細を設計する

**実行手順**:

1. Phase 1 の要件仕様書を読み込む
2. 各フィールドの型、デフォルト値、制約を定義する
3. JSON Schema バリデーションルールを設計する
4. ストレージファイルパス（`~/.aiworkflow/config/skill-imports.json`）を確認する

**設計内容**:

```typescript
interface SkillStoreSchema {
  /** スキーマバージョン（マイグレーション用） */
  schemaVersion: number;

  /** インポート済みスキル（キー: スキル名） */
  importedSkills: Record<string, ImportedSkillData>;

  /** スキル個別設定（キー: スキル名） */
  skillSettings: Record<string, SkillSettings>;

  /** 最終スキャン日時（ISO文字列） */
  lastScanAt?: string;

  /** メタデータキャッシュ（キー: スキル名） */
  skillCache?: Record<
    string,
    {
      metadata: SkillMetadata;
      cachedAt: string;
    }
  >;
}
```

**期待される成果物**:

- `outputs/phase-2/schema-design.md`

---

### タスク2: API詳細設計

**目的**: skillImportStore の API を詳細設計する

**実行手順**:

1. 各メソッドのシグネチャを定義する
2. 各メソッドの入力バリデーションを設計する
3. 各メソッドのエラーケースを列挙する
4. 戻り値の型を確定する

**設計内容**:

| メソッド                | シグネチャ                                                                        | 説明                     |
| ----------------------- | --------------------------------------------------------------------------------- | ------------------------ |
| getImported             | `(): ImportedSkillData[]`                                                         | インポート済みスキル一覧 |
| addImport               | `(skillName: string): void`                                                       | スキルをインポート       |
| removeImport            | `(skillName: string): void`                                                       | スキルを削除             |
| exists                  | `(skillName: string): boolean`                                                    | 存在確認                 |
| updateLastUsed          | `(skillName: string): void`                                                       | 最終使用日時更新         |
| getSettings             | `(skillName: string): SkillSettings`                                              | 設定取得                 |
| updateSettings          | `(skillName: string, settings: Partial<SkillSettings>): void`                     | 設定更新                 |
| rememberPermission      | `(skillName: string, toolName: string, decision: "allow" \| "deny"): void`        | 権限記憶                 |
| getRememberedPermission | `(skillName: string, toolName: string): "allow" \| "deny" \| undefined`           | 記憶権限取得             |
| setCache                | `(skillName: string, metadata: SkillMetadata): void`                              | キャッシュ設定           |
| getCache                | `(skillName: string): { metadata: SkillMetadata; cachedAt: string } \| undefined` | キャッシュ取得           |
| invalidateCache         | `(skillName?: string): void`                                                      | キャッシュ無効化         |

**期待される成果物**:

- `outputs/phase-2/api-design.md`

---

### タスク3: マイグレーション設計

**目的**: スキーマバージョン管理とマイグレーション機能を設計する

**実行手順**:

1. 現在のスキーマバージョン（CURRENT_SCHEMA_VERSION = 1）を確認する
2. マイグレーション関数の構造を設計する
3. バージョン0（初回）→1へのマイグレーションを定義する
4. 将来のバージョンアップに備えた拡張性を確保する

**設計内容**:

```typescript
const CURRENT_SCHEMA_VERSION = 1;

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
    // 将来のマイグレーション
    // "2": (store) => { ... },
  },
});
```

**期待される成果物**:

- `outputs/phase-2/migration-design.md`

---

### タスク4: エラーハンドリング設計

**目的**: ストア操作時のエラーハンドリングを設計する

**実行手順**:

1. 発生しうるエラーパターンを列挙する
2. 各エラーの処理方針を決定する
3. エラーログ・通知方針を決定する
4. リカバリー方針を決定する

**エラーパターン**:

| エラー                 | 原因                   | 処理方針                     |
| ---------------------- | ---------------------- | ---------------------------- |
| ストア読み込みエラー   | ファイル破損           | デフォルト値で初期化         |
| スキル未存在           | 存在しないスキル名指定 | 静かに無視（removeの場合）   |
| バリデーションエラー   | 不正なデータ形式       | エラーログ出力・操作スキップ |
| ディスク書き込みエラー | 権限不足・ディスクフル | エラーログ出力・例外スロー   |

**期待される成果物**:

- `outputs/phase-2/error-handling-design.md`

---

### タスク5: テスト設計

**目的**: 単体テストの設計を行う

**実行手順**:

1. テストケースを列挙する
2. モック/スタブの設計を行う
3. テストデータを設計する
4. テストカバレッジ目標を設定する

**テストケース一覧**:

```typescript
describe("skillImportStore", () => {
  describe("import management", () => {
    it("should add a new import");
    it("should remove an import");
    it("should return all imported skills");
    it("should check if skill exists");
    it("should update last used timestamp");
  });

  describe("settings management", () => {
    it("should return default settings for new skill");
    it("should update settings");
    it("should merge partial settings");
  });

  describe("permission management", () => {
    it("should remember permission");
    it("should return remembered permission");
    it("should return undefined for unknown permission");
  });

  describe("cache management", () => {
    it("should set and get cache");
    it("should invalidate specific skill cache");
    it("should invalidate all cache");
  });

  describe("schema migration", () => {
    it("should migrate from version 0 to 1");
    it("should handle corrupted data gracefully");
  });
});
```

**期待される成果物**:

- `outputs/phase-2/test-design.md`

---

## 参照資料

| 参照資料       | パス                                                           | 内容          |
| -------------- | -------------------------------------------------------------- | ------------- |
| Phase 1 成果物 | `outputs/phase-1/requirements-specification.md`                | 要件仕様      |
| 既存パターン   | `apps/desktop/src/main/settings/slideSettingsStore.ts`         | 実装パターン  |
| 仕様書         | `docs/30-workflows/skill-import-agent-system/specification.md` | セクション6.1 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                   | 内容                |
| -------------------- | ---------------------------------------------------------------------- | ------------------- |
| コアインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md` | Repository パターン |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`  | エラー処理方針      |

---

## 成果物

| 成果物               | パス                                       | 内容             |
| -------------------- | ------------------------------------------ | ---------------- |
| スキーマ設計書       | `outputs/phase-2/schema-design.md`         | スキーマ詳細     |
| API設計書            | `outputs/phase-2/api-design.md`            | API詳細          |
| マイグレーション設計 | `outputs/phase-2/migration-design.md`      | マイグレーション |
| エラーハンドリング   | `outputs/phase-2/error-handling-design.md` | エラー処理       |
| テスト設計書         | `outputs/phase-2/test-design.md`           | テストケース     |

---

## 統合テスト連携

> skillImportStore API設計をIPCハンドラと整合させる

| 連携ポイント | 確認事項                                  |
| ------------ | ----------------------------------------- |
| API形式      | 同期APIとして設計（electron-storeは同期） |
| 戻り値形式   | IPC で JSON シリアライズ可能な形式        |
| エラー伝播   | ストアエラーを IPC エラーレスポンスに変換 |

---

## 完了条件

- [ ] スキーマ設計が完了し、`schema-design.md` が生成されている
- [ ] API設計が完了し、`api-design.md` が生成されている
- [ ] マイグレーション設計が完了し、`migration-design.md` が生成されている
- [ ] エラーハンドリング設計が完了し、`error-handling-design.md` が生成されている
- [ ] テスト設計が完了し、`test-design.md` が生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/task-2b-skill-import-store/phase-3-design-review.md`
