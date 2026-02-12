# アーキテクチャ設計書

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| Phase    | 2                                     |
| 作成日   | 2026-02-11                            |
| 更新日   | 2026-02-12                            |

## 1. 設計概要

本設計書は、`SkillService.executeSkill()` メソッドが `SkillExecutor` に実行を委譲するためのアーキテクチャを定義する。

### 1.1 解決すべき課題

**課題**: SkillExecutor は BrowserWindow を必要とするため、SkillService のコンストラクタ時点では生成不可能。

```
SkillService コンストラクタ時点
    ↓
    SkillScanner, SkillParser, SkillImportManager は利用可能
    ↓
    BrowserWindow はまだ生成されていない
    ↓
    SkillExecutor は BrowserWindow 依存のため生成不可
```

### 1.2 採用パターン: Setter Injection

Constructor Injection ではなく **Setter Injection** パターンを採用する。

**理由**:

- BrowserWindow は Electron アプリ起動後に生成される
- SkillService は起動時に他のコンポーネントから参照される
- 遅延初期化により、依存オブジェクトの準備完了後に注入可能

## 2. DIパターン比較

| パターン              | 適用可否 | 理由                                                  |
| --------------------- | -------- | ----------------------------------------------------- |
| Constructor Injection | 不可     | 依存オブジェクト（SkillExecutor）が生成時点で利用不可 |
| **Setter Injection**  | **採用** | 外部リソース準備後に注入可能                          |
| Factory Pattern       | 候補     | 動的生成には適するが、今回は単一インスタンス          |

## 3. クラス設計

### 3.1 SkillService クラス

```typescript
export class SkillService {
  private cache: Map<string, Skill> = new Map();
  private lastScanTime: Date | null = null;
  private skillExecutor: SkillExecutor | null = null; // Setter Injection

  constructor(
    private scanner: SkillScanner,
    private parser: SkillParser,
    public importManager: SkillImportManager,
  ) {}

  /**
   * SkillExecutorを設定する（Setter Injection）
   *
   * BrowserWindow 準備完了後に呼び出される。
   * @param executor SkillExecutorインスタンス
   */
  setSkillExecutor(executor: SkillExecutor): void {
    this.skillExecutor = executor;
  }

  /**
   * スキルを実行する
   *
   * @throws Error SkillExecutor未初期化の場合
   * @throws Error スキルが見つからない場合
   * @throws Error スキルがインポートされていない場合
   */
  async executeSkill(
    skillId: string,
    params?: ExecuteSkillParams,
  ): Promise<SkillExecutionResponse> {
    // 初期化確認 → スキル取得 → 型変換 → 委譲
  }
}
```

### 3.2 初期化シーケンス

```
┌─────────────────────────────────────────────────────────────────┐
│                    アプリケーション起動                          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. SkillService 生成                                            │
│    - SkillScanner, SkillParser, SkillImportManager を DI        │
│    - skillExecutor = null                                       │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. BrowserWindow 生成                                           │
│    - Electron の createWindow() 実行後                          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. SkillExecutor 生成                                           │
│    - new SkillExecutor(mainWindow, permissionStore, authKey)    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Setter Injection                                             │
│    - skillService.setSkillExecutor(executor)                    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. IPC ハンドラ登録                                              │
│    - skill:execute チャンネルが executeSkill() を呼び出し       │
└─────────────────────────────────────────────────────────────────┘
```

## 4. 型変換設計

### 4.1 Skill 型（UI層）

```typescript
// @repo/shared で定義（packages/shared/src/types/skill.ts）
interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  path: string;
  triggers: string[];
  anchors: Anchor[];
  category?: SkillCategory | string;
  environment?: EnvironmentConfig;
  license?: string;
  allowedTools?: string[];
  tags?: string[];
  dependencies?: string[];
  lastModified: Date;
}
```

### 4.2 SkillMetadata 型（SDK層）

```typescript
// SkillExecutor.ts で定義
interface SkillMetadata extends Omit<Skill, "lastModified"> {
  // Skill型から継承（lastModified を除外）:
  // id, name, slug, description, path, triggers, anchors, allowedTools, category 等
}
```

### 4.3 変換ロジック

```typescript
// SkillService.executeSkill() 内
const metadata: SkillMetadata = {
  id: skill.id,
  name: skill.name,
  slug: skill.slug,
  description: skill.description,
  path: skill.path,
  triggers: skill.triggers,
  anchors: skill.anchors,
  allowedTools: skill.allowedTools,
  category: skill.category,
};
```

**設計判断**: `lastModified` は実行時に不要なため除外。SDK層に必要な最小限のメタデータのみ渡す。

## 5. エラーハンドリング設計

### 5.1 エラーパターン

| エラー条件             | エラーメッセージ                       | エラーコード             |
| ---------------------- | -------------------------------------- | ------------------------ |
| SkillExecutor 未初期化 | `SkillExecutor が初期化されていません` | EXECUTOR_NOT_INITIALIZED |
| スキルID不存在         | `スキルが見つかりません`               | SKILL_NOT_FOUND          |
| スキル未インポート     | `スキルがインポートされていません`     | SKILL_NOT_IMPORTED       |
| 実行エラー（SDK由来）  | 透過的に伝播                           | SkillExecutionErrorCode  |

### 5.2 エラー処理フロー

```
executeSkill() 呼び出し
    │
    ├─ skillExecutor === null → Error("SkillExecutor が初期化されていません")
    │
    ├─ getSkillById() === null → Error("スキルが見つかりません")
    │
    ├─ !isImported() → Error("スキルがインポートされていません")
    │
    └─ skillExecutor.execute() →
        ├─ 成功 → SkillExecutionResponse { success: true }
        └─ 失敗 → SkillExecutionResponse { success: false, error }
```

## 6. テスタビリティ設計

### 6.1 Setter Injection の利点

- **モック注入が容易**: テスト時に mockSkillExecutor を設定可能
- **初期化タイミング制御**: テストケースごとに初期化状態を制御可能

### 6.2 テストパターン

```typescript
describe("SkillService.executeSkill", () => {
  let skillService: SkillService;
  let mockSkillExecutor: jest.Mocked<SkillExecutor>;

  beforeEach(() => {
    // Setter Injection でモックを注入
    skillService = new SkillService(scanner, parser, importManager);
    mockSkillExecutor = createMockSkillExecutor();
    skillService.setSkillExecutor(mockSkillExecutor);
  });

  it("should delegate to SkillExecutor", async () => {
    await skillService.executeSkill("test-skill-id");
    expect(mockSkillExecutor.execute).toHaveBeenCalled();
  });

  it("should throw error when executor not initialized", async () => {
    const uninitializedService = new SkillService(
      scanner,
      parser,
      importManager,
    );
    // setSkillExecutor() を呼ばない
    await expect(uninitializedService.executeSkill("test")).rejects.toThrow();
  });
});
```

## 7. 統合ポイント

### 7.1 コンポーネント間契約

| 統合ポイント               | 契約定義                                        |
| -------------------------- | ----------------------------------------------- |
| SkillService→SkillExecutor | `execute(request, metadata): Promise<Response>` |
| SkillExecutor→SDK          | `callSDKQuery()` via AuthKeyService             |
| IPC通信                    | `skill:execute` チャンネル                      |

### 7.2 データフロー

```
Renderer Process
    │
    │ IPC: skill:execute
    ▼
Main Process
    │
    │ skill-handler.ts
    ▼
SkillService.executeSkill()
    │
    │ 1. SkillExecutor 初期化確認
    │ 2. スキル存在確認（getSkillById）
    │ 3. インポート状態確認（isImported）
    │ 4. 型変換（Skill → SkillMetadata）
    ▼
SkillExecutor.execute()
    │
    │ 1. 同時実行数チェック
    │ 2. リトライ付きSDK呼び出し
    │ 3. ストリーミング処理
    ▼
Claude Agent SDK
```

## 8. 関連ドキュメント

- [P34: 遅延初期化が必要な依存オブジェクトの DI パターン選択](/.claude/rules/06-known-pitfalls.md#P34)
- [architecture-implementation-patterns.md](/.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md)
- [要件定義書](../phase-1/requirements-definition.md)
