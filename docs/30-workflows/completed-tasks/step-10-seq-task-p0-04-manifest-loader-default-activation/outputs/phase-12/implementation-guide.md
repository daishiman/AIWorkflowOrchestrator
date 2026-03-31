# TASK-P0-04 実装ガイド

## Part 1: 中学生レベルの概念説明

### なぜこの機能が必要なのか

以前の AIWorkflowOrchestrator では、スキル作成 AI が参考書（エージェント仕様書）を読むには「参考書係（resourceLoader）」を外から渡す必要がありました。渡さない場合はエラーになり、AI が参考書なしで動くしかありませんでした。

この TASK-P0-04 で「渡さなくても自動で参考書を探す」ようにしました。これにより「設定を忘れた」状態でも AI が正しく参考書を見つけて動けます。

### dynamic resource pipeline とは何か（この機能でできること）

スキルを作成するとき、AIは「参考書」が必要です。参考書には「どんな問題を発見するか」「どんな設計にするか」「どう構成するか」という3冊があります。

**以前の仕組み**: 参考書を読む係（resourceLoader）を外から渡さないと、AIは「参考書がないよ」と言って諦めていました。

**新しい仕組み（dynamic resource pipeline）**: AIが自分で本棚を探して参考書を見つけてきます。誰かが参考書係を指定しなくても、まず自分で探して、見つからなければ渡された参考書を使い、それもなければ参考書なしで頑張ります。

たとえば、本屋さんに行くときを考えてみてください。「あのお店で買ってきて」と言われなくても、まず家の本棚を探して（自動発見）、なければ近くの本屋に行って（static fallback）、それでもなければ手持ちの知識で対応する（graceful degradation）、という流れです。

### なぜデフォルトで有効にするのか

以前は「参考書係を指定した場合だけ賢い動作をする」でした。でも参考書係を指定しなかった場合でも、プロジェクトの中にある参考書（`.claude/skills/skill-creator`）を使えるはずです。デフォルトで有効にすることで、「指定し忘れた」ケースでも正しく動くようになります。

### fallback とは何か

fallback（フォールバック）とは「次の手段に切り替える」ことです。メインの手段が失敗したら、バックアップの手段を試します。

1. **まず dynamic pipeline を試す**: manifest ファイルを使って参考書を自動で探す
2. **ダメなら static loader を試す**: 渡された resourceLoader で参考書を読む
3. **それもなければ止まる**: 参考書がなければ `resource_loader_unavailable` を返して誤動作を防ぐ

---

## Part 2: 技術詳細

### APIシグネチャ

```typescript
// RuntimeSkillCreatorFacade の主要メソッドシグネチャ
class RuntimeSkillCreatorFacade {
  constructor(deps: RuntimeSkillCreatorFacadeDeps): void;

  // Planner role
  async plan(
    skillSpec: string,
    authMode: AuthMode,
    apiKey: string | null,
  ): Promise<RuntimeSkillCreatorPlanResponse>;

  // Improver role
  async improve(
    skillName: string,
    feedback: string,
    authMode: AuthMode,
    apiKey: string | null,
  ): Promise<RuntimeSkillCreatorImproveResponse>;

  // Setter Injection
  setLLMAdapter(adapter: ILLMAdapter): void;
  setLLMAdapterFailed(reason: string): void;
}
```

### 自動インスタンス化の仕組みと DI override パターン

```typescript
// コンストラクタで DI override パターンを適用
constructor(deps: RuntimeSkillCreatorFacadeDeps) {
  // 外部注入を優先し、なければ自動インスタンス化（TASK-P0-04）
  this.sourceResolver =
    deps.sourceResolver ?? new SkillCreatorSourceResolver();
  this.resourcePlanner =
    deps.resourcePlanner ?? new PhaseResourcePlanner();
  this.resolvedResourceReader =
    deps.resolvedResourceReader ??
    new ResolvedResourceReader(deps.resourceLoader);
}
```

3コンポーネントはフィールドで `readonly` 必須型として宣言されるため、TypeScript が null を型レベルで除外します。

### manifest 自動発見のアルゴリズム

`loadWorkflowManifest(explicitRoot?: string)`:

1. `explicitRoot` がある場合: そのパスの `workflow-manifest.json` を直接読む
2. `explicitRoot` がない場合:
   - `sourceResolver.resolve({})` で候補ディレクトリ一覧を取得
   - 各候補の `workflow-manifest.json` を `fs.access` でチェック
   - 最初に見つかったものを `manifestLoader.loadManifest()` で読み込む
   - JSON パースエラーは `catch { continue }` で silently skip

候補ディレクトリの優先順位（`getSkillCreatorRootCandidates()`）:

1. `explicit` — 明示的に渡されたパス
2. `env` — `AIWORKFLOW_SKILL_CREATOR_PATH` 環境変数
3. `home` — `~/.aiworkflow/skills/skill-creator`
4. `repo` — `{cwd}/.claude/skills/skill-creator`

### fallback chain の遷移条件

```typescript
let dynamicPipelineSucceeded = false;
try {
  // 1. dynamic pipeline
  const resolved = await this.resolveOperationResources(requests, maxBytes, operation);
  const loaded = await this.readPlannedResources(resolved.resources);
  const agentSpecs = loaded.filter(r => r.kind === "agent").map(...);
  if (agentSpecs.length > 0 || referenceSpecs.length > 0) {
    dynamicPipelineSucceeded = true; // SUCCESS
  }
} catch {
  // required_resource_missing など → fallback へ
}

// 2. static loader fallback
if (!dynamicPipelineSucceeded && this.resourceLoader) {
  for (const name of PLAN_PROMPT_CONSTANTS.AGENT_NAMES) {
    agentSpecs.push({ name, content: await this.resourceLoader.loadAgent(name) });
  }
}

// 3. degraded error
if (!dynamicPipelineSucceeded && agentSpecs.length === 0) {
  return buildDegradedError("resource_loader_unavailable");
}
```

遷移条件まとめ:

- `dynamicPipelineSucceeded = true`: manifest + agents 全取得成功
- `dynamicPipelineSucceeded = false` && `resourceLoader` あり: static fallback
- `dynamicPipelineSucceeded = false` && `resourceLoader` なし: `resource_loader_unavailable`

### TypeScript 型定義

```typescript
// deps インターフェース（外部注入オプション）
export interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;          // 必須
  llmAdapter?: ILLMAdapter;             // optional（後から setLLMAdapter()）
  resourceLoader?: ResourceLoader;       // optional（static fallback 用）
  sourceResolver?: SkillCreatorSourceResolver;    // optional（DI override）
  resourcePlanner?: PhaseResourcePlanner;         // optional（DI override）
  resolvedResourceReader?: ResolvedResourceReader; // optional（DI override）
  // ... その他
}

// フィールド宣言（必須 readonly）
private readonly sourceResolver: SkillCreatorSourceResolver;
private readonly resourcePlanner: PhaseResourcePlanner;
private readonly resolvedResourceReader: ResolvedResourceReader;
```

### 使用例

```typescript
// 最小構成（3コンポーネントは自動インスタンス化）
const facade = new RuntimeSkillCreatorFacade({
  skillExecutor,
  llmAdapter,
});

// resourceLoader のみ指定（static fallback 付き）
const facade = new RuntimeSkillCreatorFacade({
  skillExecutor,
  llmAdapter,
  resourceLoader: new ResourceLoaderImpl(skillCreatorPath),
});

// テスト用（sourceResolver を差し替え）
const facade = new RuntimeSkillCreatorFacade({
  skillExecutor,
  llmAdapter,
  sourceResolver: customSourceResolver, // prototype mock より確実
});
```

### エラーハンドリング

| エラー源                     | 処理方法                                                      |
| ---------------------------- | ------------------------------------------------------------- |
| JSON parse error in manifest | `loadWorkflowManifest` の catch で silently skip → undefined  |
| `required_resource_missing`  | `resolveOperationResources` の catch で捕捉 → static fallback |
| `loadAgent` 失敗             | static fallback 内でそのまま propagate（テスト TC-09）        |
| `sendChat` 失敗              | plan() の呼び出し元へ propagate                               |

### エッジケース

1. **REPO_SKILL_CREATOR_PATH が常時候補**: テストで `sourceResolver.resolve` を mock しないと実際の skill-creator ファイルで dynamic pipeline が成功してしまう。境界ケーステストでは必ず mock が必要。

2. **concurrent plan() 呼び出し**: `llmAdapter` は plan() の呼び出し開始時点でキャプチャされるため、実行中の `setLLMAdapter()` 呼び出しは当該リクエストに影響しない（TC-08 で確認済み）。

3. **resolvedResourceReader と resourceLoader の関係**: `resolvedResourceReader = new ResolvedResourceReader(deps.resourceLoader)` で初期化されるため、dynamic pipeline でのリソース読み込みも `resourceLoader` を経由する可能性がある。

### 設定可能なパラメータと定数一覧

| 定数                                                 | 値                                                          | 用途                                      |
| ---------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------- |
| `PLAN_PROMPT_CONSTANTS.AGENT_NAMES`                  | `["discover-problem", "design-workflow", "plan-structure"]` | static fallback の agent 名               |
| `PLAN_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES` | `16_384`                                                    | dynamic pipeline のコンテキストバジェット |
| `AIWORKFLOW_SKILL_CREATOR_PATH`                      | env var                                                     | manifest 発見の優先候補                   |
