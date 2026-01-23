# エキスパートレビュー

> スキルインポートエージェントシステム仕様書のレビュー
> 著名な設計思想家の視点から

---

## 1. Robert C. Martin (Uncle Bob) - クリーンアーキテクチャ / SOLID原則

### 1.1 評価

| 原則                       | 評価 | コメント                                                |
| -------------------------- | ---- | ------------------------------------------------------- |
| 単一責任原則 (SRP)         | B+   | サービス分離は良好だが、SkillMetadataが多くの責務を持つ |
| 開放閉鎖原則 (OCP)         | A-   | Hookシステムは拡張に開かれている                        |
| リスコフ置換原則 (LSP)     | B    | ImportedSkill extends SkillMetadataは適切               |
| インターフェース分離 (ISP) | C+   | SkillAPIインターフェースが肥大化傾向                    |
| 依存性逆転原則 (DIP)       | B+   | IPC層による抽象化は評価できる                           |
| 依存方向                   | A-   | Renderer → IPC → Main → Services の流れは適切           |

### 1.2 クリーンアーキテクチャ観点

**良い点:**

```
┌─────────────────────────────────────────────────────────┐
│ Frameworks & Drivers (外側)                             │
│  └─ Electron IPC, React Components                     │ ✓ 外側に配置
├─────────────────────────────────────────────────────────┤
│ Interface Adapters                                      │
│  └─ IPC Handlers, Zustand Store                        │ ✓ アダプター層あり
├─────────────────────────────────────────────────────────┤
│ Application Business Rules                              │
│  └─ SkillExecutor, PermissionResolver                  │ ✓ ユースケース層
├─────────────────────────────────────────────────────────┤
│ Enterprise Business Rules (内側)                        │
│  └─ SkillMetadata, ImportedSkill                       │ △ エンティティ層が薄い
└─────────────────────────────────────────────────────────┘
```

**改善が必要な点:**

1. **エンティティ層の強化**

   ```typescript
   // 現状: データ構造のみ
   interface SkillMetadata { ... }

   // 推奨: ビジネスロジックをエンティティに
   class Skill {
     private metadata: SkillMetadata;

     canExecute(): boolean { ... }
     hasPermission(tool: string): boolean { ... }
     validateExecution(request: ExecutionRequest): ValidationResult { ... }
   }
   ```

2. **ユースケースの明示化**

   ```typescript
   // 推奨: ユースケースクラスの導入
   class ImportSkillUseCase {
     constructor(
       private scanner: ISkillScanner,
       private store: ISkillStore,
       private validator: ISkillValidator,
     ) {}

     async execute(path: string): Promise<ImportResult> {
       const skill = await this.scanner.scan(path);
       const validation = await this.validator.validate(skill);
       if (!validation.isValid) return validation.errors;
       return this.store.save(skill);
     }
   }
   ```

3. **依存性注入の強化**

   ```typescript
   // 現状: 直接依存
   class SkillExecutor {
     private scanner = new SkillScanner(); // ✗ 直接インスタンス化
   }

   // 推奨: コンストラクタインジェクション
   class SkillExecutor {
     constructor(
       private readonly scanner: ISkillScanner,
       private readonly permissionResolver: IPermissionResolver,
     ) {}
   }
   ```

### 1.3 Uncle Bobからの提言

> "Architecture is about intent. Looking at your codebase, I should immediately
> understand what the system does, not what framework it uses."

**具体的改善案:**

```
src/
├── domain/                    # エンティティ層（フレームワーク非依存）
│   ├── entities/
│   │   ├── Skill.ts
│   │   ├── Permission.ts
│   │   └── Execution.ts
│   └── value-objects/
│       ├── SkillName.ts
│       └── ToolSet.ts
├── application/               # ユースケース層
│   ├── use-cases/
│   │   ├── ImportSkillUseCase.ts
│   │   ├── ExecuteSkillUseCase.ts
│   │   └── RequestPermissionUseCase.ts
│   └── ports/                 # 抽象インターフェース
│       ├── ISkillRepository.ts
│       └── IPermissionGateway.ts
├── infrastructure/            # フレームワーク/ドライバー層
│   ├── electron/
│   ├── persistence/
│   └── external-services/
└── presentation/              # UIアダプター層
    ├── components/
    └── stores/
```

---

## 2. Eric Evans - ドメイン駆動設計 (DDD)

### 2.1 ドメインモデル評価

| DDD概念                    | 評価 | コメント                                   |
| -------------------------- | ---- | ------------------------------------------ |
| ユビキタス言語             | B    | 「スキル」「インポート」は明確だが一部曖昧 |
| 境界づけられたコンテキスト | C+   | コンテキスト境界が不明確                   |
| エンティティ               | C    | IDを持つオブジェクトの識別が弱い           |
| 値オブジェクト             | D    | ほぼ使用されていない                       |
| 集約                       | C    | 集約ルートが不明確                         |
| ドメインイベント           | B+   | ストリーミングイベントは良い設計           |
| リポジトリ                 | B    | SkillImportStoreは概念的にリポジトリ       |

### 2.2 境界づけられたコンテキストの提案

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Skill Management Context                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ Skill Discovery │  │ Skill Catalog   │  │ Skill Settings  │     │
│  │ (スキル発見)    │  │ (スキル管理)    │  │ (スキル設定)    │     │
│  │                 │  │                 │  │                 │     │
│  │ - Scanner       │  │ - ImportStore   │  │ - Permissions   │     │
│  │ - Parser        │  │ - Metadata      │  │ - Preferences   │     │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘     │
│           │                    │                    │               │
│           └────────────────────┼────────────────────┘               │
│                                │                                    │
│                    Published Language (共有型)                      │
│                    SkillId, SkillName, ToolSet                      │
└────────────────────────────────┼────────────────────────────────────┘
                                 │
                    Anti-Corruption Layer
                                 │
┌────────────────────────────────┼────────────────────────────────────┐
│                    Skill Execution Context                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ Execution       │  │ Permission      │  │ Streaming       │     │
│  │ Engine          │  │ Control         │  │ Communication   │     │
│  │                 │  │                 │  │                 │     │
│  │ - Executor      │  │ - Resolver      │  │ - Messages      │     │
│  │ - Agent SDK     │  │ - Hooks         │  │ - Events        │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 値オブジェクトの導入提案

```typescript
// 現状: プリミティブ型の多用
interface SkillMetadata {
  name: string; // ✗ 任意の文字列
  allowedTools?: string[]; // ✗ 任意の文字列配列
  path: string; // ✗ 任意の文字列
}

// 推奨: 値オブジェクトによる型安全性
class SkillName {
  private constructor(private readonly value: string) {
    if (!SkillName.isValid(value)) {
      throw new InvalidSkillNameError(value);
    }
  }

  static create(value: string): SkillName {
    return new SkillName(value);
  }

  static isValid(value: string): boolean {
    return /^[a-z0-9-]+$/.test(value) && value.length <= 50;
  }

  equals(other: SkillName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

class ToolSet {
  private constructor(private readonly tools: ReadonlySet<Tool>) {}

  static create(tools: string[]): ToolSet {
    const validTools = tools.map((t) => Tool.fromString(t));
    return new ToolSet(new Set(validTools));
  }

  contains(tool: Tool): boolean {
    return this.tools.has(tool);
  }

  isSubsetOf(other: ToolSet): boolean {
    return [...this.tools].every((t) => other.contains(t));
  }
}

class SkillPath {
  private constructor(private readonly value: string) {
    if (!SkillPath.isValid(value)) {
      throw new InvalidSkillPathError(value);
    }
  }

  static isValid(value: string): boolean {
    return value.includes(".claude/skills/") && !value.includes("..");
  }

  getSkillName(): SkillName {
    const parts = this.value.split("/");
    return SkillName.create(parts[parts.length - 1]);
  }
}
```

### 2.4 集約の設計

```typescript
// 推奨: Skill集約
class Skill {
  private constructor(
    private readonly id: SkillId,
    private readonly name: SkillName,
    private readonly metadata: SkillMetadata,
    private permissions: PermissionSettings,
    private status: SkillStatus,
  ) {}

  // ファクトリメソッド
  static import(metadata: SkillMetadata): Skill {
    return new Skill(
      SkillId.generate(),
      metadata.name,
      metadata,
      PermissionSettings.default(),
      SkillStatus.Active,
    );
  }

  // ドメインロジック
  requestExecution(prompt: string): ExecutionRequest {
    if (!this.status.canExecute()) {
      throw new SkillNotExecutableError(this.id);
    }
    return ExecutionRequest.create(this.id, prompt, this.permissions);
  }

  // ドメインイベント発行
  private events: DomainEvent[] = [];

  disable(): void {
    this.status = SkillStatus.Disabled;
    this.events.push(new SkillDisabledEvent(this.id));
  }
}
```

### 2.5 Eric Evansからの提言

> "The heart of software is its ability to solve domain-related problems for its user.
> All other features, vital though they may be, support this basic purpose."

**ユビキタス言語の整理:**

| 現在の用語       | 問題点               | 推奨用語        |
| ---------------- | -------------------- | --------------- |
| SkillMetadata    | メタデータは技術用語 | SkillDefinition |
| SkillSubResource | 曖昧                 | SkillAsset      |
| ImportedSkill    | 状態と型の混同       | ActiveSkill     |
| allowedTools     | 許可という受動的表現 | capabilities    |
| SkillImportStore | Store は技術用語     | SkillCatalog    |

---

## 3. Martin Fowler - リファクタリング / エンタープライズパターン

### 3.1 コードスメル検出

| スメル                 | 検出箇所                    | 深刻度 | 改善案                    |
| ---------------------- | --------------------------- | ------ | ------------------------- |
| Long Parameter List    | SkillExecutionRequest       | 中     | Parameter Object パターン |
| Data Clumps            | agents, references, scripts | 高     | 共通型 SkillAssets に統合 |
| Primitive Obsession    | string型の多用              | 高     | 値オブジェクト導入        |
| Feature Envy           | UI内でのビジネスロジック    | 中     | ドメイン層へ移動          |
| Speculative Generality | Tier 3の詳細設計            | 低     | YAGNI: 必要時に設計       |
| Parallel Inheritance   | Skill系の階層               | 低     | 継承より合成              |

### 3.2 リファクタリング提案

#### 3.2.1 Extract Class - SkillAssets

```typescript
// 現状: 重複する構造
interface SkillMetadata {
  agents: SkillSubResource[];
  references: SkillSubResource[];
  scripts: SkillSubResource[];
  assets: SkillSubResource[];
  schemas: SkillSubResource[];
  indexes: SkillSubResource[];
}

// 推奨: Extract Class
class SkillAssets {
  constructor(
    private readonly resources: Map<AssetCategory, SkillSubResource[]>,
  ) {}

  static readonly CATEGORIES = [
    "agents",
    "references",
    "scripts",
    "assets",
    "schemas",
    "indexes",
  ] as const;

  getByCategory(category: AssetCategory): SkillSubResource[] {
    return this.resources.get(category) ?? [];
  }

  getAllResources(): SkillSubResource[] {
    return [...this.resources.values()].flat();
  }

  getTotalSize(): number {
    return this.getAllResources().reduce((sum, r) => sum + r.size, 0);
  }

  hasCategory(category: AssetCategory): boolean {
    return (this.resources.get(category)?.length ?? 0) > 0;
  }
}

interface SkillMetadata {
  name: SkillName;
  description: string;
  capabilities: ToolSet;
  path: SkillPath;
  assets: SkillAssets; // ✓ 統合
  otherFiles: SkillOtherFile[];
}
```

#### 3.2.2 Replace Conditional with Polymorphism

```typescript
// 現状: 条件分岐の多用
function handleStreamMessage(msg: SkillStreamMessage) {
  switch (msg.type) {
    case 'assistant':
      return handleAssistant(msg);
    case 'tool_use':
      return handleToolUse(msg);
    case 'tool_result':
      return handleToolResult(msg);
    case 'status':
      return handleStatus(msg);
    case 'error':
      return handleError(msg);
  }
}

// 推奨: Strategy パターン
interface MessageHandler {
  canHandle(msg: SkillStreamMessage): boolean;
  handle(msg: SkillStreamMessage): void;
}

class AssistantMessageHandler implements MessageHandler {
  canHandle(msg: SkillStreamMessage): boolean {
    return msg.type === 'assistant';
  }
  handle(msg: SkillStreamMessage): void { ... }
}

class MessageDispatcher {
  constructor(private handlers: MessageHandler[]) {}

  dispatch(msg: SkillStreamMessage): void {
    const handler = this.handlers.find(h => h.canHandle(msg));
    if (handler) handler.handle(msg);
  }
}
```

### 3.3 エンタープライズパターンの適用

#### Repository パターンの強化

```typescript
// 推奨: リポジトリインターフェース
interface SkillRepository {
  findById(id: SkillId): Promise<Skill | null>;
  findByName(name: SkillName): Promise<Skill | null>;
  findAll(): Promise<Skill[]>;
  findActive(): Promise<Skill[]>;
  save(skill: Skill): Promise<void>;
  delete(id: SkillId): Promise<void>;
}

// 実装
class ElectronStoreSkillRepository implements SkillRepository {
  constructor(private store: ElectronStore<SkillStoreSchema>) {}

  async findById(id: SkillId): Promise<Skill | null> {
    const data = this.store.get(`skills.${id.toString()}`);
    return data ? SkillMapper.toDomain(data) : null;
  }

  async save(skill: Skill): Promise<void> {
    const data = SkillMapper.toPersistence(skill);
    this.store.set(`skills.${skill.id.toString()}`, data);
  }
}
```

#### Unit of Work パターン

```typescript
// 推奨: トランザクション管理
class SkillUnitOfWork {
  private newSkills: Skill[] = [];
  private dirtySkills: Skill[] = [];
  private deletedSkills: SkillId[] = [];

  registerNew(skill: Skill): void {
    this.newSkills.push(skill);
  }

  registerDirty(skill: Skill): void {
    this.dirtySkills.push(skill);
  }

  registerDeleted(id: SkillId): void {
    this.deletedSkills.push(id);
  }

  async commit(repository: SkillRepository): Promise<void> {
    for (const skill of this.newSkills) {
      await repository.save(skill);
    }
    for (const skill of this.dirtySkills) {
      await repository.save(skill);
    }
    for (const id of this.deletedSkills) {
      await repository.delete(id);
    }
    this.clear();
  }
}
```

### 3.4 Martin Fowlerからの提言

> "Any fool can write code that a computer can understand.
> Good programmers write code that humans can understand."

**リファクタリングの優先順位:**

1. **高優先度**: Primitive Obsession → 値オブジェクト導入
2. **高優先度**: Data Clumps → SkillAssets 抽出
3. **中優先度**: Long Parameter List → Parameter Object
4. **中優先度**: Feature Envy → ドメインロジック移動
5. **低優先度**: Speculative Generality → YAGNI 適用

---

## 4. Kent Beck - XP / TDD / シンプルデザイン

### 4.1 シンプルデザインの4原則評価

| 原則                | 評価 | コメント                     |
| ------------------- | ---- | ---------------------------- |
| 1. テストがパスする | B+   | テスト仕様あり、TDD推奨      |
| 2. 意図を明確にする | B    | 命名は概ね良好、一部抽象的   |
| 3. 重複を排除する   | C+   | SkillSubResource系に重複あり |
| 4. 最小限の要素     | C    | Tier 3は過剰設計の傾向       |

### 4.2 YAGNI (You Aren't Gonna Need It) 分析

| 機能           | 現在必要か | Kent Beckの判定      |
| -------------- | ---------- | -------------------- |
| Tier 1 (MVP)   | ✓ 必要     | 実装すべき           |
| Tier 2 (拡張)  | △ 要検討   | MVP後に再評価        |
| Tier 3 (将来)  | ✗ 不要     | **削除推奨**         |
| SkillChain     | ✗ 不要     | 需要が証明されてから |
| SkillScheduler | ✗ 不要     | 需要が証明されてから |
| SkillAnalytics | ✗ 不要     | 需要が証明されてから |

### 4.3 テスト駆動開発の提案

```typescript
// Kent Beck流: テストファースト

// 1. まずテストを書く
describe("Skill", () => {
  describe("import", () => {
    it("should create active skill from valid metadata", () => {
      const metadata = createValidMetadata();
      const skill = Skill.import(metadata);

      expect(skill.isActive()).toBe(true);
      expect(skill.name.equals(metadata.name)).toBe(true);
    });

    it("should reject invalid skill name", () => {
      const metadata = createMetadataWithInvalidName();

      expect(() => Skill.import(metadata)).toThrow(InvalidSkillNameError);
    });
  });

  describe("requestExecution", () => {
    it("should create execution request for active skill", () => {
      const skill = createActiveSkill();
      const request = skill.requestExecution("Create a presentation");

      expect(request.skillId).toBe(skill.id);
      expect(request.prompt).toBe("Create a presentation");
    });

    it("should throw when skill is disabled", () => {
      const skill = createDisabledSkill();

      expect(() => skill.requestExecution("prompt")).toThrow(
        SkillNotExecutableError,
      );
    });
  });
});

// 2. テストをパスする最小限のコードを書く
// 3. リファクタリングする
```

### 4.4 インクリメンタル設計

```
Kent Beck推奨のリリースサイクル:

Week 1-2: Minimal Walking Skeleton
├── スキルスキャン（基本機能のみ）
├── スキル一覧表示
└── シンプルなインポート

Week 3-4: First Usable Version
├── スキル実行（単一ツール）
├── 基本的な権限確認
└── エラーハンドリング

Week 5-6: Iterative Enhancement
├── ストリーミング表示
├── 複数ツール対応
└── ユーザーフィードバック反映

Week 7+: Continuous Improvement
├── パフォーマンス改善
├── UI/UX改善
└── 必要に応じて機能追加
```

### 4.5 Kent Beckからの提言

> "Make it work, make it right, make it fast. In that order."

**具体的アクション:**

1. **Make it work (動くようにする)**
   - Tier 1 MVPを最優先
   - 完璧を求めず動くコードを
   - エッジケースは後回し

2. **Make it right (正しくする)**
   - テストを追加
   - リファクタリング
   - 重複排除

3. **Make it fast (速くする)**
   - プロファイリング
   - 必要な箇所のみ最適化
   - 早すぎる最適化を避ける

**Tier 3への対応:**

```markdown
# Kent Beckの提案

Tier 3（将来機能）は仕様書から削除し、以下に置き換える:

## 将来の拡張可能性

システムは以下の拡張ポイントを持つ:

- SkillExecutor: カスタム実行戦略
- PermissionResolver: カスタム権限ルール
- IPC: 追加チャネル

具体的な機能は、ユーザーからの要望に基づいて
その時点で最適な設計を行う。

「必要になったら設計する」
```

---

## 5. Alistair Cockburn - ヘキサゴナルアーキテクチャ（ポート&アダプター）

### 5.1 ポート&アダプターモデル評価

| 概念               | 評価 | コメント                                       |
| ------------------ | ---- | ---------------------------------------------- |
| プライマリポート   | B+   | IPC経由のユーザー操作は明確                    |
| セカンダリポート   | B    | electron-store、ファイルシステムのアダプター化 |
| アプリケーション核 | C+   | ビジネスロジックの境界が曖昧                   |
| 対称性             | B-   | 入力側は整備、出力側のポートが不足             |

### 5.2 ヘキサゴナル構造の提案

```
                    ┌─────────────────────────────────────┐
                    │           Driving Side              │
                    │         (プライマリ側)              │
                    └──────────────┬──────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│  React UI     │         │  CLI Adapter  │         │  API Adapter  │
│  (Renderer)   │         │  (将来)       │         │  (将来)       │
└───────┬───────┘         └───────┬───────┘         └───────┬───────┘
        │                         │                         │
        └─────────────────────────┼─────────────────────────┘
                                  │
                     ┌────────────▼────────────┐
                     │    Primary Ports        │
                     │  ┌─────────────────────┐│
                     │  │ ISkillImportPort    ││ ← 新規定義推奨
                     │  │ ISkillExecutePort   ││
                     │  │ ISkillQueryPort     ││
                     │  └─────────────────────┘│
                     └────────────┬────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │        APPLICATION CORE           │
                │  ┌─────────────────────────────┐  │
                │  │     SkillDomain             │  │
                │  │  - ImportSkillUseCase       │  │
                │  │  - ExecuteSkillUseCase      │  │
                │  │  - Skill (Entity)           │  │
                │  │  - SkillAssets (VO)         │  │
                │  └─────────────────────────────┘  │
                └─────────────────┼─────────────────┘
                                  │
                     ┌────────────▼────────────┐
                     │   Secondary Ports       │
                     │  ┌─────────────────────┐│
                     │  │ ISkillRepository    ││ ✅ 定義済み
                     │  │ ISkillScanner       ││ ✅ 定義済み
                     │  │ IAgentSDKGateway    ││ ← 新規定義推奨
                     │  │ INotificationPort   ││ ← 新規定義推奨
                     │  └─────────────────────┘│
                     └────────────┬────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│ ElectronStore │         │ FileSystem    │         │ ClaudeAgentSDK│
│   Adapter     │         │   Adapter     │         │   Adapter     │
└───────────────┘         └───────────────┘         └───────────────┘
                    │           Driven Side               │
                    │        (セカンダリ側)               │
                    └─────────────────────────────────────┘
```

### 5.3 ポートインターフェース設計

```typescript
// プライマリポート（Driving側）
// apps/desktop/src/main/ports/primary/

export interface ISkillImportPort {
  scanAvailableSkills(): Promise<SkillMetadata[]>;
  importSkill(path: SkillPath): Promise<ImportResult>;
  removeSkill(id: SkillId): Promise<void>;
}

export interface ISkillExecutePort {
  execute(request: SkillExecutionRequest): AsyncGenerator<SkillStreamMessage>;
  cancel(executionId: ExecutionId): Promise<void>;
  getStatus(executionId: ExecutionId): ExecutionStatus;
}

export interface ISkillQueryPort {
  findById(id: SkillId): Promise<Skill | null>;
  findAll(): Promise<Skill[]>;
  findActive(): Promise<Skill[]>;
  searchByName(query: string): Promise<Skill[]>;
}

// セカンダリポート（Driven側）
// apps/desktop/src/main/ports/secondary/

export interface IAgentSDKGateway {
  query(options: AgentQueryOptions): AsyncGenerator<SDKMessage>;
  abort(signal: AbortSignal): void;
}

export interface INotificationPort {
  notifyImportComplete(skill: Skill): void;
  notifyExecutionStart(execution: Execution): void;
  notifyExecutionComplete(result: ExecutionResult): void;
  notifyError(error: DomainError): void;
}

export interface IPermissionGateway {
  requestPermission(request: PermissionRequest): Promise<PermissionDecision>;
  getStoredDecisions(skillId: SkillId): Promise<PermissionDecision[]>;
}
```

### 5.4 Alistair Cockburnからの提言

> "Allow an application to equally be driven by users, programs, automated test
> or batch scripts, and to be developed and tested in isolation from its
> eventual run-time devices and databases."

**テスタビリティの向上:**

```typescript
// テスト用のスタブアダプター
class InMemorySkillRepository implements ISkillRepository {
  private skills: Map<string, Skill> = new Map();

  async findById(id: SkillId): Promise<Skill | null> {
    return this.skills.get(id.toString()) ?? null;
  }

  async save(skill: Skill): Promise<void> {
    this.skills.set(skill.id.toString(), skill);
  }

  // テストヘルパー
  clear(): void {
    this.skills.clear();
  }

  seedWith(skills: Skill[]): void {
    skills.forEach((s) => this.skills.set(s.id.toString(), s));
  }
}

// アプリケーションコアのテスト
describe("ImportSkillUseCase", () => {
  let useCase: ImportSkillUseCase;
  let repository: InMemorySkillRepository;
  let scanner: MockSkillScanner;

  beforeEach(() => {
    repository = new InMemorySkillRepository();
    scanner = new MockSkillScanner();
    useCase = new ImportSkillUseCase(
      scanner,
      repository,
      new StrictValidator(),
    );
  });

  it("should import valid skill", async () => {
    scanner.willReturn(validSkillMetadata);

    const result = await useCase.execute("/path/to/skill");

    expect(result.isSuccess).toBe(true);
    expect(await repository.findByName(validSkillMetadata.name)).not.toBeNull();
  });
});
```

---

## 6. Vaughn Vernon - 実践ドメイン駆動設計 (IDDD)

### 6.1 戦術的DDD評価

| パターン         | 評価 | コメント                                           |
| ---------------- | ---- | -------------------------------------------------- |
| 集約設計         | C+   | 集約ルートが不明確、トランザクション境界が曖昧     |
| ドメインサービス | C    | ユースケースとドメインサービスの区別が不明確       |
| ドメインイベント | B+   | ストリーミングメッセージはイベント的、より明示的に |
| ファクトリ       | B    | Skill.import() は良いパターン                      |
| リポジトリ       | B+   | インターフェース定義済み、実装は改善の余地あり     |
| 仕様パターン     | D    | 未使用、バリデーションに適用可能                   |

### 6.2 集約設計の改善

```typescript
// Vaughn Vernon推奨: 小さな集約

// ✗ 悪い例: 大きすぎる集約
class Skill {
  private metadata: SkillMetadata;
  private assets: SkillAssets;
  private permissions: Permission[];
  private executions: Execution[]; // ← 履歴が肥大化
  private settings: SkillSettings;
}

// ✓ 良い例: 小さな集約 + 結果整合性
class Skill {
  // 集約ルート
  private readonly id: SkillId;
  private readonly name: SkillName;
  private status: SkillStatus;
  private settings: SkillSettings;

  // 集約内のエンティティ/値オブジェクト
  private readonly metadata: SkillMetadata;
  private readonly assets: SkillAssets;
}

// 別集約: 実行履歴
class ExecutionHistory {
  private readonly skillId: SkillId; // 参照のみ
  private executions: Execution[];

  addExecution(execution: Execution): void {
    this.executions.push(execution);
    // ドメインイベント発行
    this.addEvent(new ExecutionRecordedEvent(this.skillId, execution.id));
  }
}

// 別集約: 権限設定
class PermissionPolicy {
  private readonly skillId: SkillId; // 参照のみ
  private rules: PermissionRule[];

  evaluate(request: PermissionRequest): PermissionDecision {
    // 仕様パターンの適用
    return (
      this.rules.find((r) => r.matches(request))?.decision ??
      PermissionDecision.Ask
    );
  }
}
```

### 6.3 ドメインイベントの明示化

```typescript
// イベント定義
abstract class SkillDomainEvent {
  readonly occurredOn: Date = new Date();
  abstract readonly eventType: string;
}

class SkillImportedEvent extends SkillDomainEvent {
  readonly eventType = "skill.imported";
  constructor(
    readonly skillId: SkillId,
    readonly skillName: SkillName,
    readonly importedBy: UserId,
  ) {
    super();
  }
}

class SkillExecutionStartedEvent extends SkillDomainEvent {
  readonly eventType = "skill.execution.started";
  constructor(
    readonly executionId: ExecutionId,
    readonly skillId: SkillId,
    readonly prompt: string,
  ) {
    super();
  }
}

class SkillExecutionCompletedEvent extends SkillDomainEvent {
  readonly eventType = "skill.execution.completed";
  constructor(
    readonly executionId: ExecutionId,
    readonly result: ExecutionResult,
    readonly duration: number,
  ) {
    super();
  }
}

// イベントパブリッシャー
interface IDomainEventPublisher {
  publish(event: SkillDomainEvent): void;
  subscribe<T extends SkillDomainEvent>(
    eventType: string,
    handler: (event: T) => void,
  ): void;
}

// ユースケースでの使用
class ImportSkillUseCase {
  constructor(
    private scanner: ISkillScanner,
    private repository: ISkillRepository,
    private eventPublisher: IDomainEventPublisher,
  ) {}

  async execute(path: string): Promise<ImportResult> {
    const skill = await this.doImport(path);
    this.eventPublisher.publish(
      new SkillImportedEvent(skill.id, skill.name, currentUser.id),
    );
    return ImportResult.success(skill);
  }
}
```

### 6.4 仕様パターンの適用

```typescript
// バリデーション用の仕様パターン
interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

abstract class CompositeSpecification<T> implements Specification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;

  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  not(): Specification<T> {
    return new NotSpecification(this);
  }
}

// スキルインポート可能性の仕様
class ValidSkillPathSpecification extends CompositeSpecification<string> {
  isSatisfiedBy(path: string): boolean {
    return path.includes(".claude/skills/") && !path.includes("..");
  }
}

class HasRequiredFilesSpecification extends CompositeSpecification<SkillMetadata> {
  isSatisfiedBy(metadata: SkillMetadata): boolean {
    return metadata.entryPoint !== undefined && metadata.name !== undefined;
  }
}

class NoConflictingSkillSpecification extends CompositeSpecification<SkillMetadata> {
  constructor(private repository: ISkillRepository) {
    super();
  }

  isSatisfiedBy(metadata: SkillMetadata): boolean {
    const existing = this.repository.findByNameSync(metadata.name);
    return existing === null || existing.id === metadata.id;
  }
}

// 複合仕様の使用
const importableSkillSpec = new HasRequiredFilesSpecification()
  .and(new NoConflictingSkillSpecification(repository))
  .and(new ValidToolSetSpecification());

if (!importableSkillSpec.isSatisfiedBy(metadata)) {
  throw new SkillNotImportableError(metadata.name);
}
```

### 6.5 Vaughn Vernonからの提言

> "Keep aggregates small. Reference other aggregates by identity only.
> Use eventual consistency outside the aggregate boundary."

**具体的改善案:**

1. **集約の分割**: Skill, ExecutionHistory, PermissionPolicy を別集約に
2. **IDによる参照**: 集約間は ID のみで参照、直接参照しない
3. **結果整合性**: 集約間の整合性はドメインイベントで非同期に保証
4. **仕様パターン**: 複雑なバリデーションルールは仕様オブジェクトで表現

---

## 7. Greg Young - CQRS / イベントソーシング

### 7.1 CQRS適用可能性評価

| 側面             | 評価 | コメント                                   |
| ---------------- | ---- | ------------------------------------------ |
| コマンド/クエリ  | C+   | 分離が不明確、同一インターフェースで処理   |
| 読み取りモデル   | C    | 書き込みモデルをそのまま表示に使用         |
| 書き込みモデル   | B    | ユースケース層は概念的にコマンドハンドラー |
| イベント保存     | D    | 実行ログはあるが、イベントストアではない   |
| プロジェクション | D    | 未使用、UI最適化に有効                     |

### 7.2 CQRS分離の提案

```typescript
// Commands（書き込み側）
// apps/desktop/src/main/application/commands/

interface Command {
  readonly type: string;
}

interface CommandHandler<T extends Command> {
  execute(command: T): Promise<void>;
}

// スキルインポートコマンド
class ImportSkillCommand implements Command {
  readonly type = "skill.import";
  constructor(
    readonly path: SkillPath,
    readonly options?: ImportOptions,
  ) {}
}

class ImportSkillCommandHandler implements CommandHandler<ImportSkillCommand> {
  constructor(
    private scanner: ISkillScanner,
    private repository: ISkillRepository,
    private eventStore: IEventStore,
  ) {}

  async execute(command: ImportSkillCommand): Promise<void> {
    const metadata = await this.scanner.scan(command.path.toString());
    const skill = Skill.import(metadata);
    await this.repository.save(skill);

    // イベント保存
    await this.eventStore.append(
      new SkillImportedEvent(skill.id, skill.name, new Date()),
    );
  }
}

// スキル実行コマンド
class ExecuteSkillCommand implements Command {
  readonly type = "skill.execute";
  constructor(
    readonly skillId: SkillId,
    readonly prompt: string,
    readonly options?: ExecutionOptions,
  ) {}
}

// Queries（読み取り側）
// apps/desktop/src/main/application/queries/

interface Query<TResult> {
  readonly type: string;
}

interface QueryHandler<T extends Query<TResult>, TResult> {
  execute(query: T): Promise<TResult>;
}

// スキル一覧クエリ
class GetActiveSkillsQuery implements Query<SkillListItem[]> {
  readonly type = "skill.getActive";
}

// 読み取り専用モデル（ViewModel）
interface SkillListItem {
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly toolCount: number;
  readonly lastExecutedAt: Date | null;
  readonly executionCount: number;
  readonly status: "active" | "disabled";
}

class GetActiveSkillsQueryHandler implements QueryHandler<
  GetActiveSkillsQuery,
  SkillListItem[]
> {
  constructor(private readDb: ISkillReadDatabase) {}

  async execute(_query: GetActiveSkillsQuery): Promise<SkillListItem[]> {
    // 読み取り専用DBから最適化されたビューを取得
    return this.readDb.getActiveSkillListItems();
  }
}
```

### 7.3 イベントソーシング（軽量版）の提案

```typescript
// イベントストア
interface IEventStore {
  append(event: DomainEvent): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
  getEventsSince(timestamp: Date): Promise<DomainEvent[]>;
}

// 軽量イベントストア実装（JSON Lines形式）
class JsonLinesEventStore implements IEventStore {
  private filePath: string;

  constructor(basePath: string) {
    this.filePath = path.join(basePath, "events.jsonl");
  }

  async append(event: DomainEvent): Promise<void> {
    const line = JSON.stringify({
      id: crypto.randomUUID(),
      type: event.eventType,
      aggregateId: event.aggregateId,
      timestamp: event.occurredOn.toISOString(),
      payload: event,
    });
    await fs.appendFile(this.filePath, line + "\n");
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    const lines = await this.readLines();
    return lines
      .filter((e) => e.aggregateId === aggregateId)
      .map((e) => e.payload);
  }
}

// プロジェクション（読み取りモデルの構築）
class SkillStatisticsProjection {
  private statistics: Map<string, SkillStats> = new Map();

  apply(event: DomainEvent): void {
    switch (event.eventType) {
      case "skill.imported":
        this.handleImported(event as SkillImportedEvent);
        break;
      case "skill.execution.completed":
        this.handleExecutionCompleted(event as SkillExecutionCompletedEvent);
        break;
    }
  }

  private handleImported(event: SkillImportedEvent): void {
    this.statistics.set(event.skillId.toString(), {
      skillId: event.skillId.toString(),
      importedAt: event.occurredOn,
      executionCount: 0,
      totalDuration: 0,
      lastExecutedAt: null,
    });
  }

  private handleExecutionCompleted(event: SkillExecutionCompletedEvent): void {
    const stats = this.statistics.get(event.skillId.toString());
    if (stats) {
      stats.executionCount++;
      stats.totalDuration += event.duration;
      stats.lastExecutedAt = event.occurredOn;
    }
  }

  getStatistics(skillId: string): SkillStats | undefined {
    return this.statistics.get(skillId);
  }
}
```

### 7.4 Greg Youngからの提言

> "CQRS is not about having separate databases. It's about having a different
> model for reading than for writing. The simplest form is just different DTOs."

**段階的適用:**

```
Level 0: 同一モデル（現状）
├── SkillMetadata を読み書き両方に使用

Level 1: DTO分離（推奨）
├── Command: ImportSkillCommand, ExecuteSkillCommand
├── Query Result: SkillListItem, SkillDetailView
└── 同一DBだがモデルは分離

Level 2: 読み取り最適化（将来）
├── 書き込み: 正規化されたドメインモデル
├── 読み取り: 非正規化されたビューモデル
└── 同期: ドメインイベントによるプロジェクション

Level 3: 完全分離（必要時のみ）
├── 書き込みDB: イベントストア
├── 読み取りDB: 最適化されたビューDB
└── 結果整合性
```

---

## 8. Michael Feathers - レガシーコード改善

### 8.1 テスタビリティ評価

| 観点                   | 評価 | コメント                                  |
| ---------------------- | ---- | ----------------------------------------- |
| シーム（Seam）         | B    | IPC層がシームとして機能、さらに細分化可能 |
| 依存関係の注入         | C+   | 一部で直接依存、DIコンテナ未使用          |
| テストダブル作成容易性 | C    | インターフェース不足でモック作成が困難    |
| 特性テスト             | D    | レガシー部分の特性テストがない            |
| 安全なリファクタリング | C+   | テストカバレッジが不十分な領域あり        |

### 8.2 シームの特定と活用

```typescript
// シーム（Seam）= 振る舞いを変更できる接合点

// シーム1: IPC層
// 現状: 直接実装にバインド
ipcMain.handle("skill:scan", async () => {
  const scanner = new SkillScanner(); // ← 直接依存
  return scanner.scan();
});

// 改善: シームの活用
class SkillIpcHandlers {
  constructor(
    private scanner: ISkillScanner, // ← 注入可能なシーム
    private repository: ISkillRepository,
    private executor: ISkillExecutor,
  ) {}

  register(ipcMain: IpcMain): void {
    ipcMain.handle("skill:scan", () => this.scanner.scan());
    ipcMain.handle("skill:import", (_, path) => this.handleImport(path));
  }
}

// シーム2: ファイルシステムアクセス
// 現状
class SkillScanner {
  async scan(path: string) {
    const files = await fs.readdir(path); // ← 直接依存
    // ...
  }
}

// 改善: ファイルシステム抽象化
interface IFileSystem {
  readdir(path: string): Promise<string[]>;
  readFile(path: string): Promise<string>;
  stat(path: string): Promise<FileStat>;
  exists(path: string): Promise<boolean>;
}

class SkillScanner {
  constructor(private fs: IFileSystem) {} // ← シームとして注入

  async scan(path: string) {
    const files = await this.fs.readdir(path);
    // ...
  }
}

// テスト用スタブ
class StubFileSystem implements IFileSystem {
  private files: Map<string, string> = new Map();

  setFile(path: string, content: string): void {
    this.files.set(path, content);
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (!content) throw new Error(`File not found: ${path}`);
    return content;
  }
}
```

### 8.3 Sprout と Wrap テクニック

```typescript
// Sprout Class: 新機能を新クラスとして追加

// 既存コード（変更したくない）
class LegacySkillManager {
  async importSkill(path: string) {
    // 複雑なレガシーロジック
    // テストが難しい
  }
}

// Sprout: 新機能を別クラスに
class SkillValidator {
  // 新しいバリデーションロジック
  // テスト容易
  validate(metadata: SkillMetadata): ValidationResult {
    const errors: ValidationError[] = [];

    if (!SkillName.isValid(metadata.name)) {
      errors.push(new ValidationError("name", "Invalid skill name"));
    }

    if (!SkillPath.isValid(metadata.path)) {
      errors.push(new ValidationError("path", "Invalid skill path"));
    }

    return new ValidationResult(errors);
  }
}

// 既存コードから新クラスを呼び出し
class LegacySkillManager {
  private validator = new SkillValidator(); // Sprout

  async importSkill(path: string) {
    const metadata = await this.scan(path);
    const validation = this.validator.validate(metadata); // 新機能使用
    if (!validation.isValid) {
      throw new ValidationException(validation.errors);
    }
    // 既存のレガシーロジック
  }
}

// Wrap Method: 既存メソッドをラップ

class SkillExecutor {
  // 既存メソッド（変更したくない）
  private async executeInternal(
    request: ExecutionRequest,
  ): Promise<ExecutionResult> {
    // レガシー実行ロジック
  }

  // Wrap: ログ/計測を追加
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = Date.now();
    this.logger.info("Execution started", { skillId: request.skillId });

    try {
      const result = await this.executeInternal(request); // 既存を呼び出し

      this.metrics.recordSuccess(Date.now() - startTime);
      return result;
    } catch (error) {
      this.metrics.recordFailure(Date.now() - startTime);
      this.logger.error("Execution failed", { error });
      throw error;
    }
  }
}
```

### 8.4 特性テスト（Characterization Test）

```typescript
// 特性テスト: 既存の振る舞いを記録するテスト

describe("SkillScanner (Characterization Tests)", () => {
  // 既存の振る舞いを「発見」するテスト
  it("should return empty array for non-existent directory", async () => {
    const scanner = new SkillScanner();
    const result = await scanner.scan("/non/existent/path");

    // 現在の振る舞いを記録（修正するかは後で判断）
    expect(result).toEqual([]);
  });

  it("should include hidden files starting with dot", async () => {
    const scanner = new SkillScanner();
    const result = await scanner.scan(fixturePathWithHiddenFiles);

    // 現在の振る舞いを確認（仕様として正しいか後で検討）
    expect(result.some((f) => f.name.startsWith("."))).toBe(true);
  });

  it("should handle symlinks by following them", async () => {
    const scanner = new SkillScanner();
    const result = await scanner.scan(fixturePathWithSymlinks);

    // シンボリックリンクの扱いを記録
    expect(result.some((f) => f.isSymlink)).toBe(false); // 解決される
  });
});

// Golden Master テスト
describe("SkillMetadata parsing (Golden Master)", () => {
  it("should match golden master output", async () => {
    const scanner = new SkillScanner();
    const result = await scanner.scan(fixtureSkillPath);

    // ゴールデンマスターと比較
    expect(result).toMatchSnapshot();
  });
});
```

### 8.5 Michael Feathersからの提言

> "Legacy code is code without tests. The first step to improving legacy
> code is to get it under test."

**安全なリファクタリングのステップ:**

```
1. 特性テストの追加
   └── 既存の振る舞いを記録

2. シームの特定
   └── 変更可能な接合点を見つける

3. 依存関係の注入
   └── テストダブルを注入可能にする

4. Sprout/Wrapで新機能追加
   └── 既存コードを変更せずに拡張

5. 段階的リファクタリング
   └── テストで保護しながら改善
```

---

## 9. 総合評価とアクションアイテム

### 9.1 総合スコア

| 評価者            | スコア | 主な懸念                             |
| ----------------- | ------ | ------------------------------------ |
| Uncle Bob         | B+     | エンティティ層の薄さ                 |
| Eric Evans        | B-     | 値オブジェクト不足                   |
| Martin Fowler     | B      | コードスメル（Data Clumps）          |
| Kent Beck         | B-     | YAGNI違反（Tier 3）                  |
| Alistair Cockburn | B      | 出力側ポートの不足                   |
| Vaughn Vernon     | C+     | 集約設計の曖昧さ、仕様パターン未使用 |
| Greg Young        | C+     | CQRS分離不足、イベントストア未使用   |
| Michael Feathers  | C+     | テスタビリティ、シーム活用不足       |
| **総合**          | **B-** | 基盤は良好、DDD戦術パターン強化要    |

### 9.2 優先度付きアクションアイテム

#### ~~P0: 即時対応（Tier 3削除）~~ → 保留

> **決定**: Tier 3は将来の参照用として維持。実装しなければYAGNI違反にはならない。

#### P1: 高優先度（値オブジェクト導入） ✅ 実装済み

```typescript
// specification.md §5.0.1 に追加
// packages/shared/src/domain/value-objects/
export { SkillName } from "./SkillName"; // ✅ スキル名の型安全性
export { SkillPath } from "./SkillPath"; // ✅ パスのバリデーション
export { ToolSet } from "./ToolSet"; // ✅ 許可ツールの集合
export { ExecutionId } from "./ExecutionId"; // ✅ 実行IDのUUID検証
```

#### P2: 中優先度（Data Clumps解消） ✅ 実装済み

```typescript
// specification.md §5.0.2 に追加
// packages/shared/src/domain/SkillAssets.ts
export class SkillAssets {
  // agents, references, scripts, assets, schemas, indexes を統合管理
  getByCategory(category: AssetCategory): SkillSubResource[];
  getAllResources(): SkillSubResource[];
  getTotalSize(): number;
  getCategoryCounts(): Record<AssetCategory, number>;
}
```

#### P3: 低優先度（ユースケース層の明示化） ✅ 実装済み

```typescript
// specification.md §5.0.3 に追加
// apps/desktop/src/main/application/use-cases/

// インターフェース定義
export interface ISkillScanner { ... }
export interface ISkillRepository { ... }
export interface ISkillValidator { ... }

// ユースケース実装
export class ImportSkillUseCase { ... }  // ✅ スキルインポート
export class ExecuteSkillUseCase { ... } // ✅ スキル実行
```

#### P4: エラー型定義 ✅ 実装済み

```typescript
// specification.md §5.0.4 に追加
export class DomainError extends Error { ... }
export class InvalidSkillNameError extends DomainError { ... }
export class InvalidSkillPathError extends DomainError { ... }
export class InvalidExecutionIdError extends DomainError { ... }
export class SkillNotFoundError extends DomainError { ... }
export class SkillNotActiveError extends DomainError { ... }
```

#### P5: ヘキサゴナルアーキテクチャ強化 🆕

```typescript
// specification.md に追加推奨
// apps/desktop/src/main/ports/

// プライマリポート
export interface ISkillImportPort { ... }
export interface ISkillExecutePort { ... }
export interface ISkillQueryPort { ... }

// セカンダリポート
export interface IAgentSDKGateway { ... }
export interface INotificationPort { ... }
export interface IPermissionGateway { ... }
```

#### P6: 仕様パターン導入 🆕

```typescript
// specification.md に追加推奨
// packages/shared/src/domain/specifications/

interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
}

export class ValidSkillPathSpecification { ... }
export class HasRequiredFilesSpecification { ... }
export class NoConflictingSkillSpecification { ... }
```

#### P7: CQRS導入（Level 1: DTO分離） 🆕

```typescript
// specification.md に追加推奨
// Command DTOs
export class ImportSkillCommand { ... }
export class ExecuteSkillCommand { ... }

// Query DTOs (読み取り専用ビューモデル)
export interface SkillListItem { ... }
export interface SkillDetailView { ... }
```

#### P8: テスタビリティ強化 🆕

```typescript
// specification.md に追加推奨
// テスト用シーム
export interface IFileSystem {
  readdir(path: string): Promise<string[]>;
  readFile(path: string): Promise<string>;
  stat(path: string): Promise<FileStat>;
}

// テスト用スタブ
export class InMemorySkillRepository { ... }
export class StubFileSystem { ... }
export class MockSkillScanner { ... }
```

### 9.3 設計原則チェックリスト

```markdown
## 実装時に確認すべき原則

### Uncle Bob (Clean Architecture)

- [ ] 依存の方向は内側（ドメイン）に向いているか
- [ ] フレームワークの詳細は外側に隔離されているか
- [ ] ビジネスロジックはテスト可能か

### Eric Evans (DDD)

- [ ] ドメイン用語は統一されているか
- [ ] 値オブジェクトを使用しているか
- [ ] 集約の境界は明確か

### Martin Fowler (Refactoring)

- [ ] コードの重複はないか
- [ ] 長いメソッドはないか
- [ ] 名前は意図を表しているか

### Kent Beck (XP/TDD)

- [ ] テストはあるか
- [ ] シンプルか
- [ ] 今必要な機能だけか

### Alistair Cockburn (Hexagonal)

- [ ] プライマリポート（入力側）は定義されているか
- [ ] セカンダリポート（出力側）は定義されているか
- [ ] アプリケーションコアはフレームワーク非依存か
- [ ] アダプターは交換可能か（テスト用スタブ等）

### Vaughn Vernon (IDDD)

- [ ] 集約は小さく保たれているか
- [ ] 集約間はIDのみで参照しているか
- [ ] ドメインイベントは明示的に定義されているか
- [ ] 仕様パターンで複雑なルールを表現しているか

### Greg Young (CQRS)

- [ ] コマンドとクエリは分離されているか
- [ ] 読み取り用DTOと書き込み用モデルは分けられているか
- [ ] 必要に応じてイベントを保存しているか

### Michael Feathers (Legacy Code)

- [ ] シームは特定されているか
- [ ] 依存関係は注入可能か
- [ ] 特性テストで既存動作を保護しているか
- [ ] 新機能はSprout/Wrapパターンで追加しているか
```

---

## 10. 結論

本仕様書は全体として良好な設計基盤を示しているが、8名のエキスパートレビューにより以下の改善ポイントが特定された:

### 実装済み（P1-P4）

1. ✅ **値オブジェクトの導入**: SkillName, SkillPath, ToolSet, ExecutionId
2. ✅ **Data Clumpsの解消**: SkillAssetsクラスによる構造の整理
3. ✅ **ユースケース層の明示化**: ImportSkillUseCase, ExecuteSkillUseCase
4. ✅ **ドメインエラー型**: DomainError階層の定義

### 今後の改善候補（P5-P8）

5. 🆕 **ヘキサゴナルアーキテクチャ強化**: プライマリ/セカンダリポートの明示化
6. 🆕 **仕様パターン導入**: 複雑なバリデーションルールの表現
7. 🆕 **CQRS導入（Level 1）**: コマンド/クエリDTOの分離
8. 🆕 **テスタビリティ強化**: シームの活用、テスト用スタブ/モック

### 保留

- ⏸️ **Tier 3の削除**: 将来の参照用として維持（実装しなければYAGNI違反にはならない）

### 総合評価

| カテゴリ       | 評価 |
| -------------- | ---- |
| アーキテクチャ | B+   |
| ドメインモデル | B-   |
| テスタビリティ | C+   |
| 拡張性         | B    |
| **総合**       | B-   |

これらの改善により、保守性・拡張性・テスタビリティが大幅に向上する。
特にP5-P8は段階的に導入することで、既存機能を維持しながら品質向上が可能。

---

_レビュー実施日: 2026-01-23_
_レビュアー:_

- _Robert C. Martin (Uncle Bob) - クリーンアーキテクチャ / SOLID_
- _Eric Evans - ドメイン駆動設計 (DDD)_
- _Martin Fowler - リファクタリング / エンタープライズパターン_
- _Kent Beck - XP / TDD / シンプルデザイン_
- _Alistair Cockburn - ヘキサゴナルアーキテクチャ (Ports & Adapters)_
- _Vaughn Vernon - 実践ドメイン駆動設計 (IDDD)_
- _Greg Young - CQRS / イベントソーシング_
- _Michael Feathers - レガシーコード改善_
