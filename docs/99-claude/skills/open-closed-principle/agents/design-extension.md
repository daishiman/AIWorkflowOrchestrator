# Task: 拡張ポイント設計

> **相対パス**: `agents/design-extension.md`
> **バージョン**: 1.0.0

---

## 目的

OCP準拠の拡張ポイントを設計し、既存コードを修正せずに新機能を追加できる構造を作成する。

## 入力

- OCP違反分析レポート
- 対象機能の要件
- 既存コード構造

## 出力

- 拡張ポイント設計書
- インターフェース定義
- 実装サンプル

## 手順

### Step 1: 拡張パターンの選定

違反タイプに応じた最適なパターンを選定：

| 違反タイプ               | 推奨パターン            | 適用条件                   |
| ------------------------ | ----------------------- | -------------------------- |
| switch文（タイプ別処理） | Strategy                | 処理が独立、実行時切り替え |
| switch文（状態遷移）     | State                   | 状態に応じた振る舞い変化   |
| if-elseチェーン          | Chain of Responsibility | 条件が複雑、順次評価       |
| instanceof               | Visitor / 多態性        | 型階層が安定               |
| フラグパラメータ         | Strategy / Policy       | 動作の切り替えが必要       |

### Step 2: インターフェース設計

```typescript
// 例: Strategy パターン
interface IWorkflowExecutor {
  readonly type: string;
  canHandle(workflow: Workflow): boolean;
  execute(workflow: Workflow): Promise<Result>;
}
```

**設計ポイント**:

- 単一責任（1つの拡張ポイントは1つの責任）
- 最小限のインターフェース（必要なメソッドのみ）
- 適切な戻り値型（Promise、Result型）

### Step 3: レジストリ設計

```typescript
// 拡張の登録・取得メカニズム
interface IExecutorRegistry {
  register(executor: IWorkflowExecutor): void;
  get(type: string): IWorkflowExecutor | undefined;
  getAll(): IWorkflowExecutor[];
}

class ExecutorRegistry implements IExecutorRegistry {
  private executors: Map<string, IWorkflowExecutor> = new Map();

  register(executor: IWorkflowExecutor): void {
    this.executors.set(executor.type, executor);
  }

  get(type: string): IWorkflowExecutor | undefined {
    return this.executors.find((e) => e.canHandle({ type } as Workflow));
  }
}
```

### Step 4: 拡張方法のドキュメント化

```markdown
## 新しいワークフロータイプの追加方法

1. `IWorkflowExecutor`を実装するクラスを作成
2. `type`プロパティに一意の識別子を設定
3. `canHandle`で対象ワークフローを判定
4. `execute`で実際の処理を実装
5. アプリケーション起動時にレジストリに登録

### 例

\`\`\`typescript
class NotificationExecutor implements IWorkflowExecutor {
readonly type = 'NOTIFICATION';

canHandle(workflow: Workflow): boolean {
return workflow.type === this.type;
}

async execute(workflow: Workflow): Promise<Result> {
// 通知処理
}
}

// 登録
registry.register(new NotificationExecutor());
\`\`\`
```

## 成果物

1. **インターフェース定義ファイル**: `types/executor.ts`
2. **レジストリ実装**: `services/executor-registry.ts`
3. **拡張ガイド**: `docs/extending-executors.md`

## 完了条件

- [ ] 拡張パターンを選定
- [ ] インターフェースを設計
- [ ] レジストリを設計
- [ ] 拡張方法をドキュメント化
- [ ] サンプル実装を作成
