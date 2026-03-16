# Skill Docs Runtime Integration - 実装ガイド

## Part 1: 概念説明（中学生レベル）

### なぜ必要か

この機能が必要な理由は、Skill Docs 生成が「本番のAI応答」と「設定不足時の安全な案内」を同時に扱う必要があるからです。  
以前は stub 応答で画面フローだけを成立させていましたが、運用では API key の有無や timeout を判定して返答を変える必要があります。

### 何が変わるか

- 何が変わるか 1: docs 生成の queryFn が stub から `LLMDocQueryAdapter` に置き換わる
- 何が変わるか 2: 失敗時は `DocOperationResult` でエラー分類と guidance を返す
- 何が変わるか 3: capability 判定を `SkillDocsCapabilityResolver` が担当する

### 日常の例え

本機能は「図書館カウンター」の例えで考えると分かりやすいです。  
利用者が本を探すとき、カウンター係は「本棚に在庫があるか」を確認して、なければ別ルートを案内します。

- 利用者: Skill Docs 画面のユーザー操作
- カウンター係: IPC + resolver
- 本棚: LLM プロバイダ接続（API key と応答可否）
- 別ルート案内: guidance-only / terminal-handoff

### capability の3状態

| 状態             | 意味                               | ユーザーに見える挙動              |
| ---------------- | ---------------------------------- | --------------------------------- |
| integrated-api   | API key があり LLM 利用可能        | 生成実行できる                    |
| guidance-only    | API key 未設定/未取得              | 設定導線を表示                    |
| terminal-handoff | 生成中エラー後に terminal へ誘導可 | context copy + handoff 案内を表示 |

## Part 2: 開発者向け実装詳細

### アーキテクチャ

```text
SkillDocGenerator
  ├── queryFn: (prompt) => Promise<{ content: string }>
  └── receives adapter.query.bind(adapter)

LLMDocQueryAdapter
  ├── query(prompt): Promise<DocOperationResult<string>>
  ├── isAvailable(): Promise<boolean>
  └── getProviderName(): string

SkillDocsCapabilityResolver
  └── resolve(): Promise<SkillDocsCapabilityResult>
```

### 型定義（TypeScript）

```typescript
export interface ILLMDocQueryAdapter {
  query(prompt: string): Promise<DocOperationResult<string>>;
  isAvailable(): Promise<boolean>;
  getProviderName(): string;
}

export interface SkillDocsCapabilityResult {
  capability: "integrated-api" | "guidance-only" | "terminal-handoff";
  provider?: string;
  guidance?: string;
  reason?: string;
}
```

```typescript
export interface DocOperationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    category:
      | "VALIDATION"
      | "BUSINESS"
      | "EXTERNAL_SERVICE"
      | "INFRASTRUCTURE"
      | "INTERNAL";
    message: string;
    retryable: boolean;
    guidance?: { reason: string; action: string; handoffAvailable: boolean };
  };
}
```

### APIシグネチャ

```typescript
// main/service
query(prompt: string): Promise<DocOperationResult<string>>
isAvailable(): Promise<boolean>
resolve(): Promise<SkillDocsCapabilityResult>
```

```typescript
// renderer-preload bridge
window.electronAPI.skill.docs.generate(request);
window.electronAPI.skill.docs.preview(request);
window.electronAPI.skill.docs.export(request);
window.electronAPI.skill.docs.templates();
```

### CLIシグネチャ

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-04-skill-docs-runtime-integration --json
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-04-skill-docs-runtime-integration --json
```

### 使用例

```typescript
const adapter = new LLMDocQueryAdapter(
  () => authKeyService.getKey("llm"),
  "claude",
);
const resolver = new SkillDocsCapabilityResolver(adapter);
const capability = await resolver.resolve();

if (capability.capability !== "integrated-api") {
  return capability;
}

const generator = new SkillDocGenerator(
  adapter.query.bind(adapter),
  skillFileManager,
);
const result = await generator.generateSection("overview", source);
```

```bash
pnpm --filter @repo/desktop typecheck
node apps/desktop/scripts/capture-skill-docs-runtime-integration-phase11.mjs
```

### エラーハンドリング

| code | category         | retryable | UI指針                   |
| ---- | ---------------- | --------- | ------------------------ |
| 2001 | BUSINESS         | false     | settings 誘導            |
| 2002 | BUSINESS         | false     | API key 再設定誘導       |
| 3001 | EXTERNAL_SERVICE | true      | timeout-guidance + retry |
| 3002 | EXTERNAL_SERVICE | true      | rate-limit-wait + retry  |
| 3003 | EXTERNAL_SERVICE | true      | error-guidance           |
| 5001 | INTERNAL         | false     | 非再試行、ログ確認       |

`query()` は例外を `DocOperationResult.error` に正規化し、UI が code/retryable で分岐できる状態にする。

### エッジケース

- API key resolver が `Promise<string | null>` を返すケース
- API key が空白のみで返るケース（trim 後に 2001）
- LLM query が throw し、message が空の場合の 5001 フォールバック
- resolver 判定と生成開始の間に key が失効したケース

### 設定項目と定数一覧

| 項目              | 値/型                                                   | 説明                                       |
| ----------------- | ------------------------------------------------------- | ------------------------------------------ |
| providerName      | `"claude"` など                                         | adapter が返す provider 表示名             |
| timeoutMs         | `30000`                                                 | 生成 timeout 判定の基準                    |
| error code range  | `1001-5001`                                             | 失敗種別を UI/ログで識別するための定数体系 |
| capability values | `integrated-api` / `guidance-only` / `terminal-handoff` | 画面状態分岐の定数                         |
