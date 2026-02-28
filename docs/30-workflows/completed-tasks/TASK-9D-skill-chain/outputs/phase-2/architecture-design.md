# Phase 2 成果物: アーキテクチャ設計

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 2                                        |
| 機能名     | TASK-9D-skill-chain                      |
| 成果物種別 | アーキテクチャ設計                       |
| 作成日     | 2026-02-28                               |
| 前提       | Phase 1（要件定義）完了、FR-1〜FR-8 確定 |

---

## 1. データフロー

### 1.1 全体データフロー図

```
┌──────────────────────────────────────────────────────────┐
│ Renderer (React / Zustand)                               │
│                                                          │
│  skillSlice                                              │
│   ├─ chains: SkillChainDefinition[]                      │
│   ├─ chainExecutionStatus: ChainExecutionStatus          │
│   ├─ chainExecutionResult: SkillChainResult | null       │
│   ├─ isChainsLoading: boolean                            │
│   └─ chainError: string | null                           │
│                                                          │
│  個別セレクタ（P31 対策）                                │
│   useChains(), useChainExecutionStatus(), ...            │
│                                                          │
│  呼び出し: window.electronAPI.chain.execute(chainId, v)  │
└───────────────────────┬──────────────────────────────────┘
                        │ chainAPI.execute(chainId, variables)
                        ▼
┌──────────────────────────────────────────────────────────┐
│ Preload (skill-api.ts / contextBridge)                   │
│                                                          │
│  chainAPI = {                                            │
│    list:    () => safeInvoke(SKILL_CHAIN_LIST),          │
│    get:     (chainId) => safeInvoke(SKILL_CHAIN_GET,     │
│                                     chainId),            │
│    save:    (chain) => safeInvoke(SKILL_CHAIN_SAVE,      │
│                                   chain),                │
│    delete:  (chainId) => safeInvoke(SKILL_CHAIN_DELETE,  │
│                                     chainId),            │
│    execute: (chainId, variables) =>                      │
│               safeInvoke(SKILL_CHAIN_EXECUTE,            │
│                          { chainId, variables }),         │
│  }                                                       │
└───────────────────────┬──────────────────────────────────┘
                        │ IPC (ipcRenderer.invoke)
                        ▼
┌──────────────────────────────────────────────────────────┐
│ Main Process                                             │
│                                                          │
│  skillHandlers.ts                                        │
│   ├─ ipcMain.handle("skill:chain:list", ...)             │
│   ├─ ipcMain.handle("skill:chain:get", ...)              │
│   ├─ ipcMain.handle("skill:chain:save", ...)             │
│   ├─ ipcMain.handle("skill:chain:delete", ...)           │
│   └─ ipcMain.handle("skill:chain:execute", ...)          │
│                                                          │
│  SkillChainStore (CRUD)                                  │
│   ├─ save(chain) → JSON ファイル永続化                   │
│   ├─ get(chainId) → JSON ファイル読込                    │
│   ├─ list() → ディレクトリ内全 JSON 読込                 │
│   └─ delete(chainId) → JSON ファイル削除                 │
│                                                          │
│  SkillChainExecutor (実行)                               │
│   ├─ executeChain(chain, variables) → SkillChainResult   │
│   ├─ buildStepInput(inputMapping, context)               │
│   ├─ evaluateCondition(condition, context)               │
│   ├─ extractOutput(outputMapping, rawOutput)              │
│   └─ renderTemplate(template, variables)                 │
│         │                                                │
│         ▼                                                │
│   SkillService.executeSkill(skillName, input)            │
│     （既存スキル実行基盤に委譲）                         │
└──────────────────────────────────────────────────────────┘
```

### 1.2 チェーン実行時の詳細データフロー

```
Renderer
  │ chainAPI.execute(chainId, variables)
  ▼
Preload
  │ safeInvoke(IPC_CHANNELS.SKILL_CHAIN_EXECUTE, { chainId, variables })
  ▼
Main Process: IPC ハンドラ
  │ 1. validateIpcSender(event, opts)
  │ 2. P42 準拠 3 段バリデーション（chainId）
  │ 3. variables 型チェック
  │ 4. skillChainStore.get(chainId)
  │ 5. skillChainExecutor.executeChain(chain, variables)
  ▼
SkillChainExecutor.executeChain(chain, variables)
  │
  │ 初期化:
  │   context = {
  │     variables: { ...chain.variables, ...initialVariables },
  │     previousOutput: undefined,
  │     previousSuccess: true,
  │     stepResults: [],
  │   }
  │
  │ for each step in chain.steps:
  │   │
  │   ├─ 1. evaluateCondition(step.condition, context)
  │   │     → false: { stepId, skipped: true } を追加、continue
  │   │
  │   ├─ 2. buildStepInput(step.inputMapping, context)
  │   │     → literal:          value をそのまま使用
  │   │     → variable:         context.variables[value] を取得
  │   │     → template:         renderTemplate(template, variables)
  │   │     → previousOutput:   context.previousOutput を使用
  │   │
  │   ├─ 3. skillService.executeSkill(step.skillName, input)
  │   │     → タイムアウト: step.timeout ?? 30000ms
  │   │
  │   ├─ 4. extractOutput(step.outputMapping, rawOutput)
  │   │     → extractPath 指定あり: JSONPath で値を抽出
  │   │     → extractPath なし:    rawOutput 全体
  │   │     → variableName に格納: context.variables[variableName] = value
  │   │
  │   └─ 5. context 更新:
  │         context.previousOutput = extractedOutput
  │         context.previousSuccess = true/false
  │         context.stepResults.push(stepResult)
  │
  │ return SkillChainResult
  ▼
Main Process → IPC → Preload → Renderer
  │ { success: true, data: SkillChainResult }
  ▼
Renderer: skillSlice 更新
  chainExecutionStatus = "completed"
  chainExecutionResult = result
```

---

## 2. コンポーネント責務

### 2.1 コンポーネント一覧

| コンポーネント     | 層           | 責務                                                                                                       | 依存先                              | 新規/修正 |
| ------------------ | ------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------- |
| SkillChainExecutor | Main Process | チェーン実行ロジック（ステップ順次実行、入出力マッピング、条件評価、テンプレート展開、エラーハンドリング） | SkillService（DI）                  | 新規作成  |
| SkillChainStore    | Main Process | チェーン定義の永続化（JSON ファイルによる CRUD 操作）                                                      | ファイルシステム（fs/path）         | 新規作成  |
| skillHandlers.ts   | Main Process | IPC ハンドラ登録（5 チャネル）、入力バリデーション、sender 検証、エラーサニタイズ                          | SkillChainExecutor, SkillChainStore | 修正      |
| channels.ts        | Preload      | チェーン関連 IPC チャネル定数の定義                                                                        | なし                                | 修正      |
| skill-api.ts       | Preload      | chainAPI オブジェクトの定義と contextBridge 公開                                                           | channels.ts                         | 修正      |
| types.ts           | Preload      | ChainAPI インターフェース型の定義                                                                          | @repo/shared                        | 修正      |
| skillSlice.ts      | Renderer     | チェーン状態管理（chains, executionStatus, selectors）                                                     | chainAPI（Preload 経由）            | 修正      |
| skill-chain.ts     | Shared       | 7 型定義 + ユニオン型のエクスポート                                                                        | なし                                | 新規作成  |

### 2.2 SkillChainExecutor 詳細設計

```typescript
class SkillChainExecutor {
  constructor(private skillService: SkillService) {}

  /**
   * チェーンを実行し、全ステップの結果を返す
   * @param chain チェーン定義
   * @param initialVariables 初期変数（chain.variables とマージ）
   * @returns SkillChainResult
   */
  async executeChain(
    chain: SkillChainDefinition,
    initialVariables?: Record<string, unknown>,
  ): Promise<SkillChainResult>;

  /**
   * ステップの入力を構築する
   * @param inputMapping 入力マッピング定義
   * @param context 実行コンテキスト（variables, previousOutput）
   * @returns 構築された入力オブジェクト
   */
  private buildStepInput(
    inputMapping: Record<string, InputMapping>,
    context: ChainExecutionContext,
  ): Record<string, unknown>;

  /**
   * ステップの実行条件を評価する
   * @param condition 条件定義（undefined の場合は true を返す）
   * @param context 実行コンテキスト
   * @returns 実行するかどうか
   */
  private evaluateCondition(
    condition: SkillChainCondition | undefined,
    context: ChainExecutionContext,
  ): boolean;

  /**
   * ステップ出力から指定パスの値を抽出する
   * @param outputMapping 出力マッピング定義
   * @param rawOutput ステップの生出力
   * @returns 抽出された値
   */
  private extractOutput(
    outputMapping: OutputMapping | undefined,
    rawOutput: unknown,
  ): unknown;

  /**
   * Mustache テンプレートを展開する
   * eval を使用せず、正規表現ベースの安全な展開を行う（NFR-2-5 準拠）
   * @param template テンプレート文字列
   * @param variables 変数マップ
   * @returns 展開後の文字列
   */
  private renderTemplate(
    template: string,
    variables: Record<string, unknown>,
  ): string;
}
```

#### メソッド別責務

| メソッド          | 責務                                                                                     | 入力                     | 出力                      |
| ----------------- | ---------------------------------------------------------------------------------------- | ------------------------ | ------------------------- |
| executeChain      | チェーン全体の実行制御、コンテキスト初期化、ステップ順次実行、結果集約                   | chain, initialVariables  | SkillChainResult          |
| buildStepInput    | 4 種のマッピングタイプに応じた入力値構築                                                 | inputMapping, context    | Record\<string, unknown\> |
| evaluateCondition | 4 種の条件タイプに応じた真偽値評価                                                       | condition, context       | boolean                   |
| extractOutput     | JSONPath による出力値抽出と変数格納                                                      | outputMapping, rawOutput | unknown                   |
| renderTemplate    | `{{variableName}}` 形式の Mustache テンプレート展開（eval 不使用、正規表現ベースで安全） | template, variables      | string                    |

#### DI 設計

SkillChainExecutor は SkillService を Constructor Injection で受け取る。SkillService は既にアプリケーション起動時に生成されているため、Constructor Injection が適切（P34 の使い分け基準に準拠）。

```typescript
// アプリケーション初期化時
const skillService = new SkillService(/* ... */);
const skillChainExecutor = new SkillChainExecutor(skillService);
```

### 2.3 SkillChainStore 詳細設計

```typescript
class SkillChainStore {
  private readonly storePath: string;

  constructor(basePath: string) {
    // basePath 配下に "skill-chains/" ディレクトリを使用
    this.storePath = path.join(basePath, "skill-chains");
  }

  /**
   * チェーン定義を保存する（新規作成 or 更新）
   * - 新規: id 未設定の場合 UUID v4 を生成
   * - 更新: 既存 id の場合 updatedAt を更新
   * @param chain チェーン定義
   * @returns 保存後のチェーン定義（id, createdAt, updatedAt が設定済み）
   */
  async save(chain: SkillChainDefinition): Promise<SkillChainDefinition>;

  /**
   * chainId 指定でチェーン定義を取得する
   * @param chainId チェーン識別子
   * @returns チェーン定義。見つからない場合は null
   */
  async get(chainId: string): Promise<SkillChainDefinition | null>;

  /**
   * 保存済み全チェーン定義を取得する
   * @returns チェーン定義の配列（0 件の場合は空配列）
   */
  async list(): Promise<SkillChainDefinition[]>;

  /**
   * chainId 指定でチェーン定義を削除する
   * @param chainId チェーン識別子
   * @returns 削除成功 true、見つからない場合 false
   */
  async delete(chainId: string): Promise<boolean>;
}
```

#### 永続化方式

| 項目                 | 内容                                                                |
| -------------------- | ------------------------------------------------------------------- |
| 保存形式             | JSON ファイル（1 チェーン = 1 ファイル）                            |
| ファイルパス         | `{storePath}/{chainId}.json`                                        |
| ファイル名           | chainId（UUID v4）で一意性を保証                                    |
| エンコーディング     | UTF-8                                                               |
| JSON インデント      | 2 スペース（可読性のため）                                          |
| パストラバーサル防止 | `path.normalize()` + `startsWith(storePath)` で検証（NFR-2-3 準拠） |
| ディレクトリ自動作成 | 初回保存時に `fs.mkdir(storePath, { recursive: true })` を実行      |

#### save メソッドのロジック

```typescript
async save(chain: SkillChainDefinition): Promise<SkillChainDefinition> {
  const now = new Date().toISOString();

  // 新規作成時: id と createdAt を設定
  if (!chain.id) {
    chain.id = crypto.randomUUID();
    chain.createdAt = now;
  }

  // 常に updatedAt を更新
  chain.updatedAt = now;

  // パストラバーサル防止（NFR-2-3）
  const filePath = path.join(this.storePath, `${chain.id}.json`);
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(path.normalize(this.storePath))) {
    throw new Error("Invalid chain ID: path traversal detected");
  }

  // ディレクトリ自動作成
  await fs.mkdir(this.storePath, { recursive: true });

  // JSON ファイル書き込み
  await fs.writeFile(normalizedPath, JSON.stringify(chain, null, 2), "utf-8");

  return chain;
}
```

---

## 3. エラーハンドリング戦略

### 3.1 エラーハンドリング全体像

```
ErrorStrategy
  ├─ "stop":  ステップ失敗 → チェーン全体を即座に停止
  ├─ "skip":  ステップ失敗 → そのステップをスキップして次へ続行
  └─ "retry": ステップ失敗 → retryCount 回リトライ、全リトライ失敗で stop と同動作
```

### 3.2 エラーハンドリング実行ロジック（擬似コード）

```typescript
// executeChain 内のエラーハンドリング擬似コード
async executeChain(
  chain: SkillChainDefinition,
  initialVariables?: Record<string, unknown>,
): Promise<SkillChainResult> {
  const startTime = Date.now();
  const results: StepResult[] = [];

  // コンテキスト初期化
  const context: ChainExecutionContext = {
    variables: { ...chain.variables, ...initialVariables },
    previousOutput: undefined,
    previousSuccess: true,
    stepResults: [],
  };

  for (const step of chain.steps) {
    // ── 1. 条件評価 ──
    const shouldRun = this.evaluateCondition(step.condition, context);
    if (!shouldRun) {
      const skipResult: StepResult = { stepId: step.stepId, skipped: true };
      results.push(skipResult);
      context.stepResults.push(skipResult);
      continue;
    }

    // ── 2. リトライ制御 ──
    let lastError: string | undefined;
    let stepSuccess = false;
    let stepOutput: unknown;
    const maxAttempts =
      chain.errorHandling === "retry" ? (step.retryCount ?? 0) + 1 : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const stepStart = Date.now();
      try {
        // ── 3. 入力構築 ──
        const input = this.buildStepInput(step.inputMapping, context);

        // ── 4. スキル実行（タイムアウト付き） ──
        stepOutput = await this.executeStepWithTimeout(
          step.skillName,
          input,
          step.timeout ?? 30000,
        );

        // ── 5. 出力抽出 ──
        const extracted = this.extractOutput(step.outputMapping, stepOutput);
        if (step.outputMapping?.variableName) {
          context.variables[step.outputMapping.variableName] = extracted;
        }

        // 成功時の結果記録
        const successResult: StepResult = {
          stepId: step.stepId,
          success: true,
          output: extracted,
          duration: Date.now() - stepStart,
        };
        results.push(successResult);
        context.stepResults.push(successResult);
        context.previousOutput = extracted;
        context.previousSuccess = true;
        stepSuccess = true;
        break;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
    }

    // ── 6. 全試行失敗時のエラーハンドリング ──
    if (!stepSuccess) {
      const failResult: StepResult = {
        stepId: step.stepId,
        success: false,
        error: lastError,
        duration: undefined,
      };
      results.push(failResult);
      context.stepResults.push(failResult);

      switch (chain.errorHandling) {
        case "stop":
          // チェーン全体を停止、後続ステップは実行しない
          return {
            chainId: chain.id,
            success: false,
            results,
            finalVariables: context.variables,
            totalDuration: Date.now() - startTime,
          };

        case "skip":
          // このステップをスキップして続行
          context.previousSuccess = false;
          continue;

        case "retry":
          // maxAttempts 回リトライ後も失敗 → stop と同じ動作
          return {
            chainId: chain.id,
            success: false,
            results,
            finalVariables: context.variables,
            totalDuration: Date.now() - startTime,
          };
      }
    }
  }

  // 全ステップ完了（成功）
  return {
    chainId: chain.id,
    success: true,
    results,
    finalVariables: context.variables,
    totalDuration: Date.now() - startTime,
  };
}
```

### 3.3 エラー戦略別の動作マトリクス

| 戦略    | ステップ失敗時の動作          | context.previousSuccess | 後続ステップ | SkillChainResult.success |
| ------- | ----------------------------- | ----------------------- | ------------ | ------------------------ |
| `stop`  | チェーン全体を即座に停止      | false                   | 実行しない   | false                    |
| `skip`  | スキップして次ステップへ続行  | false                   | 実行する     | 全ステップ完了後に判定   |
| `retry` | retryCount 回リトライ後に停止 | false                   | 実行しない   | false                    |

### 3.4 条件評価ロジック

```typescript
private evaluateCondition(
  condition: SkillChainCondition | undefined,
  context: ChainExecutionContext,
): boolean {
  // condition 未指定 → 常に実行
  if (!condition) return true;

  switch (condition.type) {
    case "always":
      return true;

    case "ifPreviousSuccess":
      return context.previousSuccess;

    case "ifVariable":
      if (!condition.variable) return true;
      return context.variables[condition.variable] === condition.expectedValue;

    case "expression":
      if (!condition.expression) return true;
      // テンプレート展開後の文字列を安全に評価
      // eval は使用しない（NFR-2-5 準拠）
      const rendered = this.renderTemplate(
        condition.expression,
        context.variables,
      );
      return this.safeEvaluateExpression(rendered);

    default:
      return true;
  }
}
```

### 3.5 式評価の安全性（NFR-2-5 準拠）

`expression` 型の条件評価では `eval()` を使用しない。代わりに、安全な比較演算のみをサポートする:

| サポートする演算子 | 例               | 評価結果 |
| ------------------ | ---------------- | -------- |
| `>`                | `"5 > 0"`        | true     |
| `<`                | `"0 < 5"`        | true     |
| `>=`               | `"5 >= 5"`       | true     |
| `<=`               | `"3 <= 5"`       | true     |
| `===`              | `"ok === ok"`    | true     |
| `!==`              | `"error !== ok"` | true     |

---

## 4. 内部型: ChainExecutionContext

```typescript
/**
 * チェーン実行中の内部状態
 * SkillChainExecutor 内部でのみ使用し、外部に公開しない
 */
interface ChainExecutionContext {
  /** 現在の変数状態（chain.variables + initialVariables + ステップ出力） */
  variables: Record<string, unknown>;
  /** 直前ステップの出力（最初のステップ実行前は undefined） */
  previousOutput: unknown;
  /** 直前ステップの成否（最初のステップ実行前は true） */
  previousSuccess: boolean;
  /** これまでのステップ実行結果 */
  stepResults: StepResult[];
}
```

### コンテキストのライフサイクル

```
初期化時:
  variables = { ...chain.variables, ...initialVariables }
  previousOutput = undefined
  previousSuccess = true
  stepResults = []

各ステップ実行後:
  variables[outputMapping.variableName] = extractedOutput  (出力マッピングあり)
  previousOutput = extractedOutput
  previousSuccess = stepSuccess
  stepResults.push(stepResult)

スキップ時:
  previousOutput = 変更なし
  previousSuccess = 変更なし
  stepResults.push({ stepId, skipped: true })
```

---

## 5. DI（依存性注入）設計

### 5.1 依存関係図

```
SkillChainExecutor
  └─ SkillService (Constructor Injection)

SkillChainStore
  └─ basePath: string (Constructor Injection)

skillHandlers.ts
  ├─ SkillChainExecutor (参照)
  └─ SkillChainStore (参照)
```

### 5.2 初期化順序

```typescript
// 1. SkillService は既存の初期化フローで生成済み
const skillService = existingSkillService;

// 2. SkillChainStore を basePath で初期化
const skillChainStore = new SkillChainStore(app.getPath("userData"));

// 3. SkillChainExecutor を SkillService の DI で初期化
const skillChainExecutor = new SkillChainExecutor(skillService);

// 4. IPC ハンドラ登録時に両方を渡す
registerSkillChainHandlers(skillChainExecutor, skillChainStore, mainWindow);
```

### 5.3 DI パターン選択理由（P34 準拠）

| コンポーネント     | DI パターン           | 理由                                                             |
| ------------------ | --------------------- | ---------------------------------------------------------------- |
| SkillChainExecutor | Constructor Injection | SkillService はアプリ起動時点で生成済み。遅延初期化は不要        |
| SkillChainStore    | Constructor Injection | basePath（文字列）は起動時点で確定済み。外部リソースへの依存なし |

---

## 6. FR/NFR 対応マッピング

### 機能要件カバレッジ

| FR   | 設計カバー箇所                                                            |
| ---- | ------------------------------------------------------------------------- |
| FR-1 | SkillChainStore の save/get/list/delete + IPC 4 チャネル                  |
| FR-2 | SkillChainExecutor.executeChain + IPC skill:chain:execute                 |
| FR-3 | SkillChainExecutor.evaluateCondition（4 種条件タイプ）                    |
| FR-4 | executeChain 内のエラーハンドリングロジック（stop/skip/retry）            |
| FR-5 | SkillChainExecutor.buildStepInput（4 種マッピングタイプ）+ renderTemplate |
| FR-6 | SkillChainExecutor.extractOutput（JSONPath 抽出）                         |
| FR-7 | skillHandlers.ts の 5 チャネル IPC ハンドラ                               |
| FR-8 | skillSlice のチェーン状態 + 個別セレクタ                                  |

### 非機能要件カバレッジ

| NFR   | 設計カバー箇所                                                               |
| ----- | ---------------------------------------------------------------------------- |
| NFR-1 | SkillChainStore の JSON ファイル直接操作（軽量 I/O）                         |
| NFR-2 | P42 3 段バリデーション、validateIpcSender、パストラバーサル防止、eval 不使用 |
| NFR-3 | タイムアウト制御、エラーハンドリング戦略、JSON 永続化                        |
| NFR-4 | 型安全設計、SRP 分離、DI パターン                                            |

---

## 7. 既知の落とし穴対策

| Pitfall | 対策                                                                                |
| ------- | ----------------------------------------------------------------------------------- |
| P31     | 個別セレクタ設計（useChains, useChainExecutionStatus 等）で再レンダー最適化         |
| P32     | packages/shared の型定義と apps/desktop/src/preload/types.ts の同時更新を設計に明示 |
| P42     | 全 IPC チャネルで 3 段バリデーション（typeof → 空文字列 → trim 空文字列）を実施     |
| P44     | ハンドラ引数形式と Preload 呼び出し形式の一致を検証済み（chainId は string 直渡し） |
| P45     | 引数名 chainId/chain/variables のセマンティクスが実際の値と一致                     |
