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

## 5. 総合評価とアクションアイテム

### 5.1 総合スコア

| 評価者        | スコア | 主な懸念                    |
| ------------- | ------ | --------------------------- |
| Uncle Bob     | B+     | エンティティ層の薄さ        |
| Eric Evans    | B-     | 値オブジェクト不足          |
| Martin Fowler | B      | コードスメル（Data Clumps） |
| Kent Beck     | B-     | YAGNI違反（Tier 3）         |
| **総合**      | **B**  | 設計は良好、過剰設計の傾向  |

### 5.2 優先度付きアクションアイテム

#### P0: 即時対応（Tier 3削除）

```diff
- ## 🔮 Tier 3: 将来（7タスク）
-
- > 高度なスキル管理機能（優先度: 低）
-
- | ID      | タイトル                      |
- | ------- | ----------------------------- |
- | TASK-9D | スキルチェーン機能            |
- | TASK-9E | スキルフォーク・派生機能      |
- | TASK-9F | スキル共有・インポート機能    |
- | TASK-9G | スキルスケジュール実行機能    |
- | TASK-9H | スキルデバッグモード          |
- | TASK-9I | スキルドキュメント生成機能    |
- | TASK-9J | スキル使用統計・分析機能      |

+ ## 将来の拡張可能性
+
+ 以下の拡張ポイントを設計に組み込む:
+ - SkillExecutor: カスタム実行戦略のフック
+ - PermissionResolver: カスタム権限ルール
+ - IPC: 追加チャネル用インターフェース
+
+ 具体的な機能は需要に基づいて設計する。
```

#### P1: 高優先度（値オブジェクト導入）

```typescript
// 追加ファイル: packages/shared/src/domain/value-objects/
export { SkillName } from "./SkillName";
export { SkillPath } from "./SkillPath";
export { ToolSet } from "./ToolSet";
export { ExecutionId } from "./ExecutionId";
```

#### P2: 中優先度（Data Clumps解消）

```typescript
// SkillAssetsクラスの導入
// SkillMetadataのリファクタリング
```

#### P3: 低優先度（ユースケース層の明示化）

```typescript
// apps/desktop/src/main/application/use-cases/
// ImportSkillUseCase.ts
// ExecuteSkillUseCase.ts
```

### 5.3 設計原則チェックリスト

```markdown
## 実装時に確認すべき原則

### Uncle Bob

- [ ] 依存の方向は内側（ドメイン）に向いているか
- [ ] フレームワークの詳細は外側に隔離されているか
- [ ] ビジネスロジックはテスト可能か

### Eric Evans

- [ ] ドメイン用語は統一されているか
- [ ] 値オブジェクトを使用しているか
- [ ] 集約の境界は明確か

### Martin Fowler

- [ ] コードの重複はないか
- [ ] 長いメソッドはないか
- [ ] 名前は意図を表しているか

### Kent Beck

- [ ] テストはあるか
- [ ] シンプルか
- [ ] 今必要な機能だけか
```

---

## 6. 結論

本仕様書は全体として良好な設計を示しているが、以下の改善により更に品質を高められる:

1. **Tier 3の削除**: YAGNI原則に従い、将来機能は需要が証明されてから設計
2. **値オブジェクトの導入**: ドメインの表現力と型安全性の向上
3. **エンティティ層の強化**: ビジネスロジックをドメインに集約
4. **Data Clumpsの解消**: SkillAssetsクラスによる構造の整理

これらの改善により、保守性・拡張性・テスタビリティが大幅に向上する。

---

_レビュー実施日: 2026-01-23_
_レビュアー: クリーンアーキテクチャ / DDD / リファクタリング / XP エキスパート_
