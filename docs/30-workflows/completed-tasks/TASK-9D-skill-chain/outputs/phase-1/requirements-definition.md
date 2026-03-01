# TASK-9D スキルチェーン機能 要件定義書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| タスク ID  | TASK-9D-skill-chain  |
| Phase      | 1                    |
| 成果物     | 要件定義書（FR/NFR） |
| 作成日     | 2026-02-28           |
| ステータス | completed            |

## 概要

本ドキュメントは、スキルチェーン機能の機能要件（FR: Functional Requirements）と非機能要件（NFR: Non-Functional Requirements）を定義する。スキルチェーンとは、複数のスキルをパイプラインとして連携させ、1 つのスキルの出力を次のスキルの入力として渡す機能である。

チェーン定義の作成・保存・実行・管理、条件分岐・エラーハンドリング・テンプレート変数の各要件を明確化し、後続の設計・実装フェーズの基盤を確立する。

---

## 1. 型定義

本機能で定義する 7 つの公開型を以下に示す。全型は `packages/shared/src/types/skill-chain.ts` に配置し、`apps/desktop/src/preload/types.ts` にも同期する（P32 準拠）。

### 1.1 SkillChainDefinition

チェーン全体の定義構造。

```typescript
interface SkillChainDefinition {
  id: string; // UUID v4（自動付与）
  name: string; // チェーン名（表示用）
  description: string; // チェーンの説明
  steps: SkillChainStep[]; // 実行ステップ配列（順序保持）
  variables: Record<string, unknown>; // テンプレート変数の初期値
  errorHandling: "stop" | "skip" | "retry"; // エラー時の振る舞い
  createdAt: string; // ISO 8601 文字列
  updatedAt: string; // ISO 8601 文字列
}
```

### 1.2 SkillChainStep

チェーン内の 1 ステップの定義。

```typescript
interface SkillChainStep {
  stepId: string; // ステップ識別子（UUID v4）
  skillName: string; // 実行対象スキル名
  inputMapping: Record<string, InputMapping>; // 入力マッピング定義
  outputMapping?: OutputMapping; // 出力マッピング定義（任意）
  condition?: SkillChainCondition; // 実行条件（任意、未指定時は always）
  timeout?: number; // タイムアウト（ミリ秒、未指定時はデフォルト 30000ms）
  retryCount?: number; // リトライ回数（未指定時は 0）
}
```

### 1.3 InputMapping

ステップへの入力マッピング定義。4 種の入力ソースを指定可能。

```typescript
interface InputMapping {
  type: "literal" | "variable" | "template" | "previousOutput";
  value?: unknown; // literal/variable 時の値
  template?: string; // template 時の Mustache テンプレート文字列
}
```

### 1.4 OutputMapping

ステップからの出力マッピング定義。JSONPath による部分抽出と変数への格納を提供。

```typescript
interface OutputMapping {
  extractPath?: string; // JSONPath 形式の出力抽出パス
  variableName: string; // 抽出結果を格納する変数名
}
```

### 1.5 SkillChainCondition

ステップ実行条件の定義。4 種の条件タイプを提供。

```typescript
interface SkillChainCondition {
  type: "always" | "ifVariable" | "ifPreviousSuccess" | "expression";
  expression?: string; // expression 時の評価式
  variable?: string; // ifVariable 時の変数名
  expectedValue?: unknown; // ifVariable 時の期待値
}
```

### 1.6 SkillChainResult

チェーン実行結果の全体構造。

```typescript
interface SkillChainResult {
  chainId: string; // 実行したチェーンの ID
  success: boolean; // チェーン全体の成否
  results: StepResult[]; // 各ステップの実行結果
  finalVariables: Record<string, unknown>; // 最終的な変数状態
  totalDuration: number; // 合計実行時間（ミリ秒）
}
```

### 1.7 StepResult

個別ステップの実行結果。

```typescript
interface StepResult {
  stepId: string; // ステップ識別子
  success?: boolean; // 成否（skipped 時は undefined）
  skipped?: boolean; // 条件不一致でスキップされたか
  output?: unknown; // ステップ出力
  error?: string; // エラーメッセージ
  duration?: number; // 実行時間（ミリ秒）
}
```

### 型定義サマリー

| 型名                 | 説明                             | 配置先                                     |
| -------------------- | -------------------------------- | ------------------------------------------ |
| SkillChainDefinition | チェーン定義の全体構造           | `packages/shared/src/types/skill-chain.ts` |
| SkillChainStep       | チェーン内の 1 ステップ          | 同上                                       |
| InputMapping         | ステップへの入力マッピング定義   | 同上                                       |
| OutputMapping        | ステップからの出力マッピング定義 | 同上                                       |
| SkillChainCondition  | ステップ実行条件                 | 同上                                       |
| SkillChainResult     | チェーン実行結果                 | 同上                                       |
| StepResult           | 個別ステップの実行結果           | 同上                                       |

---

## 2. 機能要件（FR）

### FR-1: チェーン定義の CRUD

チェーン定義（SkillChainDefinition）の作成・取得・更新・削除操作を提供する。

| ID     | 要件                                            | 優先度 | 対象層       |
| ------ | ----------------------------------------------- | ------ | ------------ |
| FR-1-1 | チェーン定義を新規作成できる                    | 必須   | Main Process |
| FR-1-2 | 保存済みチェーン定義を ID 指定で取得できる      | 必須   | Main Process |
| FR-1-3 | 保存済みチェーン定義の一覧を取得できる          | 必須   | Main Process |
| FR-1-4 | 保存済みチェーン定義を更新できる                | 必須   | Main Process |
| FR-1-5 | 保存済みチェーン定義を削除できる                | 必須   | Main Process |
| FR-1-6 | 存在しない chainId を指定した場合にエラーを返す | 必須   | Main Process |

**詳細:**

- **FR-1-1**: name, steps, errorHandling を指定してチェーンを作成する。id は UUID v4 で自動付与される。createdAt/updatedAt は ISO 8601 文字列で自動設定される。
- **FR-1-2**: 存在する chainId を指定して取得し、全フィールド（id, name, description, steps, variables, errorHandling, createdAt, updatedAt）が保存時と一致する。
- **FR-1-3**: 保存済みの全チェーンが配列で返される。各要素に id, name, description, createdAt, updatedAt を含む。
- **FR-1-4**: 既存チェーンの name/steps/variables/errorHandling を変更可能。updatedAt が更新される。createdAt は変更されない。
- **FR-1-5**: chainId を指定して削除し、以降の取得で見つからない状態にする。
- **FR-1-6**: get/delete で存在しない ID を指定すると `{ success: false, error: "..." }` を返す。

### FR-2: チェーン実行

チェーン定義に基づいてスキルを順次実行し、結果を返す。

| ID     | 要件                                                  | 優先度 | 対象層       |
| ------ | ----------------------------------------------------- | ------ | ------------ |
| FR-2-1 | チェーンを実行し、ステップを定義順に順次実行できる    | 必須   | Main Process |
| FR-2-2 | 前ステップの出力を次ステップの入力として渡せる        | 必須   | Main Process |
| FR-2-3 | 実行結果として SkillChainResult を返す                | 必須   | Main Process |
| FR-2-4 | 各ステップの実行時間を StepResult.duration に記録する | 必須   | Main Process |
| FR-2-5 | チェーン全体の実行時間を totalDuration に記録する     | 必須   | Main Process |

**詳細:**

- **FR-2-1**: 3 ステップのチェーンを実行した場合、results 配列の順序が steps 定義順と一致する。
- **FR-2-2**: InputMapping type="previousOutput" で前ステップの出力が次ステップに渡される。
- **FR-2-3**: success, results, finalVariables, totalDuration の全フィールドが設定される。
- **FR-2-4**: 各 StepResult の duration がミリ秒単位の正数値で記録される。スキップされたステップの duration は undefined。
- **FR-2-5**: totalDuration が全ステップの duration 合計以上の値になる（オーバーヘッド含む）。

### FR-3: 条件分岐

ステップの実行を条件に基づいて制御する。4 種の条件タイプを提供。

| ID     | 要件                                                         | 優先度 | 対象層       |
| ------ | ------------------------------------------------------------ | ------ | ------------ |
| FR-3-1 | condition 未指定のステップは常に実行される                   | 必須   | Main Process |
| FR-3-2 | type="always" のステップは常に実行される                     | 必須   | Main Process |
| FR-3-3 | type="ifVariable" で変数値が期待値と一致する場合に実行される | 必須   | Main Process |
| FR-3-4 | type="ifPreviousSuccess" で前ステップ成功時のみ実行される    | 必須   | Main Process |
| FR-3-5 | type="expression" で式評価結果が truthy の場合に実行される   | 必須   | Main Process |
| FR-3-6 | スキップされたステップの StepResult は skipped=true になる   | 必須   | Main Process |

**詳細:**

- **FR-3-1**: condition フィールドなしのステップが必ず実行され、skipped が false/undefined。
- **FR-3-2**: condition.type="always" のステップが必ず実行される。
- **FR-3-3**: variable="status", expectedValue="ok" 時、変数 status が "ok" なら実行、異なればスキップ。
- **FR-3-4**: 前ステップが success=true なら実行、success=false ならスキップ。最初のステップでは previousSuccess のデフォルト値は true。
- **FR-3-5**: expression="{{count}} > 0" で count=5 なら実行、count=0 ならスキップ。テンプレート変数を展開後に式を評価する。
- **FR-3-6**: 条件不一致でスキップされたステップの StepResult.skipped が true、success/output/duration は undefined。

### FR-4: エラーハンドリング戦略

チェーン全体のエラーハンドリングポリシーを提供する。3 種の戦略（stop/skip/retry）を選択可能。

| ID     | 要件                                                                  | 優先度 | 対象層       |
| ------ | --------------------------------------------------------------------- | ------ | ------------ |
| FR-4-1 | errorHandling="stop" 時、ステップ失敗でチェーン全体を停止する         | 必須   | Main Process |
| FR-4-2 | errorHandling="skip" 時、ステップ失敗でそのステップをスキップして続行 | 必須   | Main Process |
| FR-4-3 | errorHandling="retry" 時、ステップ失敗で retryCount 回リトライする    | 必須   | Main Process |
| FR-4-4 | リトライ成功時はそのステップを成功として続行する                      | 必須   | Main Process |

**詳細:**

- **FR-4-1**: 2 番目のステップが失敗した場合、3 番目以降は実行されず、SkillChainResult.success=false。results 配列には実行されたステップの結果のみ含まれる。
- **FR-4-2**: 2 番目のステップが失敗しても 3 番目が実行される。失敗ステップの StepResult.success=false。チェーン全体の success は全ステップの結果に依存する。
- **FR-4-3**: retryCount=2 のステップが失敗した場合、最大 2 回リトライ後（合計 3 回試行）、それでも失敗なら stop と同じ動作で後続ステップは実行されない。
- **FR-4-4**: 1 回目失敗、2 回目成功の場合、StepResult.success=true で後続ステップも実行される。

### FR-5: テンプレート変数処理

入力マッピングにおけるテンプレート変数の展開と変数管理を提供する。

| ID     | 要件                                                                  | 優先度 | 対象層       |
| ------ | --------------------------------------------------------------------- | ------ | ------------ |
| FR-5-1 | InputMapping type="template" で Mustache 構文のテンプレートを展開する | 必須   | Main Process |
| FR-5-2 | InputMapping type="variable" で変数値を入力に設定する                 | 必須   | Main Process |
| FR-5-3 | InputMapping type="literal" でリテラル値をそのまま入力に設定する      | 必須   | Main Process |
| FR-5-4 | OutputMapping で変数に出力を格納する                                  | 必須   | Main Process |

**詳細:**

- **FR-5-1**: `"{{name}} のレポート"` で variables.name="売上" の場合、`"売上 のレポート"` に展開される。複数変数を含むテンプレートにも対応する。
- **FR-5-2**: variable 名を指定して、variables から対応する値を取得して入力に設定する。
- **FR-5-3**: value フィールドの値がそのまま入力として渡される。文字列・数値・オブジェクト等の任意の型に対応する。
- **FR-5-4**: variableName="result" で出力が variables.result に格納され、後続ステップから参照可能。

### FR-6: 出力抽出

ステップ出力から特定の値を抽出する機能を提供する。

| ID     | 要件                                                       | 優先度 | 対象層       |
| ------ | ---------------------------------------------------------- | ------ | ------------ |
| FR-6-1 | OutputMapping.extractPath で JSONPath 形式の出力抽出を行う | 必須   | Main Process |
| FR-6-2 | extractPath 未指定時は出力全体を変数に格納する             | 必須   | Main Process |

**詳細:**

- **FR-6-1**: extractPath="$.data.items" で出力 JSON の items 配列が抽出される。
- **FR-6-2**: extractPath なしの場合、ステップ出力全体が variableName で指定した変数に格納される。

### FR-7: IPC 経由のチェーン操作

Renderer から Main Process へのチェーン操作を IPC 経由で提供する。全チャネルで P42 準拠バリデーションと sender 検証を実施する。

| ID     | 要件                                                       | 優先度 | 対象層 |
| ------ | ---------------------------------------------------------- | ------ | ------ |
| FR-7-1 | `skill:chain:list` で保存済みチェーン一覧を取得できる      | 必須   | IPC    |
| FR-7-2 | `skill:chain:get` で chainId 指定のチェーンを取得できる    | 必須   | IPC    |
| FR-7-3 | `skill:chain:save` でチェーン定義を保存できる              | 必須   | IPC    |
| FR-7-4 | `skill:chain:delete` で chainId 指定のチェーンを削除できる | 必須   | IPC    |
| FR-7-5 | `skill:chain:execute` でチェーンを実行できる               | 必須   | IPC    |
| FR-7-6 | 全チャネルで P42 準拠 3 段バリデーションを実施する         | 必須   | IPC    |
| FR-7-7 | 全チャネルで sender 検証を実施する                         | 必須   | IPC    |

**詳細:**

- **FR-7-1**: IPC 経由で呼び出し、`IpcResult<SkillChainDefinition[]>` 形式で返る。
- **FR-7-2**: chainId を引数に渡し、`IpcResult<SkillChainDefinition>` 形式で返る。
- **FR-7-3**: SkillChainDefinition を引数に渡し、`IpcResult<SkillChainDefinition>` 形式で返る。
- **FR-7-4**: chainId を引数に渡し、`IpcResult<{ deleted: boolean }>` 形式で返る。
- **FR-7-5**: chainId と初期変数を引数に渡し、`IpcResult<SkillChainResult>` 形式で返る。
- **FR-7-6**: typeof チェック → 空文字列チェック → trim() 空文字列チェックの 3 段階で不正入力を拒否する（P42 準拠）。
- **FR-7-7**: validateIpcSender で呼び出し元ウィンドウを検証し、不正な呼び出しを拒否する。

### FR-8: Renderer 側の状態管理

Renderer 層でのチェーン状態管理を提供する。P31 準拠で個別セレクタを使用し、合成 Hook の依存配列問題を回避する。

| ID     | 要件                                      | 優先度 | 対象層   |
| ------ | ----------------------------------------- | ------ | -------- |
| FR-8-1 | skillSlice にチェーン一覧の状態を保持する | 必須   | Renderer |
| FR-8-2 | チェーン実行状態を保持する                | 必須   | Renderer |
| FR-8-3 | 個別セレクタを提供する（P31 対策）        | 必須   | Renderer |

**詳細:**

- **FR-8-1**: chains: SkillChainDefinition[] が skillSlice に追加され、個別セレクタで取得可能。初期値は空配列。
- **FR-8-2**: chainExecutionStatus: "idle" | "running" | "completed" | "error" の状態遷移が正しく動作する。
- **FR-8-3**: useChains(), useChainExecutionStatus() 等の個別セレクタを提供し、合成 Hook の依存配列問題を回避する。以下のセレクタを提供:
  - 状態セレクタ: useChains(), useChainExecutionStatus(), useChainExecutionResult(), useIsChainsLoading(), useChainError()
  - アクションセレクタ: useFetchChains(), useSaveChain(), useDeleteChain(), useExecuteChain(), useClearChainError()

---

## 3. 非機能要件（NFR）

### NFR-1: パフォーマンス

| ID      | 要件                                                   | 基準値                 |
| ------- | ------------------------------------------------------ | ---------------------- |
| NFR-1-1 | チェーン定義の CRUD 操作の応答時間                     | 各操作 100ms 以内      |
| NFR-1-2 | チェーン実行開始までの応答時間（IPC ラウンドトリップ） | 200ms 以内             |
| NFR-1-3 | ステップ間のデータ転送オーバーヘッド                   | 各ステップ間 50ms 以内 |
| NFR-1-4 | チェーン一覧取得の応答時間（100 件以下）               | 200ms 以内             |

### NFR-2: セキュリティ

| ID      | 要件                                 | 基準                                                                                 |
| ------- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| NFR-2-1 | IPC 入力バリデーション               | P42 準拠 3 段バリデーション（typeof → 空文字列 → trim() 空文字列）を全チャネルで実施 |
| NFR-2-2 | sender 検証                          | validateIpcSender による呼び出し元ウィンドウ検証を全ハンドラで実施                   |
| NFR-2-3 | パストラバーサル防止                 | SkillChainStore のファイルパスに path.normalize() + startsWith() 検証を適用          |
| NFR-2-4 | エラーサニタイズ                     | 内部パス・スタックトレースを Renderer に返さない                                     |
| NFR-2-5 | テンプレート変数インジェクション防止 | Mustache テンプレート展開時にコード実行を許可しない（eval 不使用）                   |

### NFR-3: 信頼性

| ID      | 要件                       | 基準                                                                                    |
| ------- | -------------------------- | --------------------------------------------------------------------------------------- |
| NFR-3-1 | ステップ失敗時の状態整合性 | エラーハンドリング戦略に従い、finalVariables が最後の成功時点の状態を保持する           |
| NFR-3-2 | タイムアウト制御           | 各ステップで timeout 指定値（デフォルト 30000ms）を超えた場合にタイムアウトエラーを返す |
| NFR-3-3 | チェーン定義の永続化       | SkillChainStore の JSON ファイル永続化でアプリ再起動後もチェーン定義が保持される        |

### NFR-4: 保守性

| ID      | 要件                               | 基準                                                                         |
| ------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| NFR-4-1 | 型安全                             | any 型不使用、全型定義が strict: true でコンパイル可能                       |
| NFR-4-2 | SRP 準拠                           | SkillChainExecutor（実行）と SkillChainStore（永続化）の責務分離             |
| NFR-4-3 | テストカバレッジ                   | Line Coverage 80% 以上、Branch Coverage 60% 以上、Function Coverage 80% 以上 |
| NFR-4-4 | 型定義の二箇所同時更新（P32 準拠） | packages/shared と apps/desktop/src/preload の型定義を同時に更新する         |

---

## 4. アーキテクチャ層別要件

### 4.1 Main Process 層

| コンポーネント     | 責務                                                                                   | 新規/修正 |
| ------------------ | -------------------------------------------------------------------------------------- | --------- |
| SkillChainExecutor | チェーン実行エンジン（ステップ順次実行、入出力マッピング、条件評価、テンプレート展開） | 新規作成  |
| SkillChainStore    | チェーン定義の永続化（JSON ファイル保存・読込・削除）                                  | 新規作成  |
| skillHandlers.ts   | チェーン IPC ハンドラ 5 チャネルの登録                                                 | 修正      |

**SkillChainExecutor の責務詳細:**

- ステップを定義順に 1 つずつ実行（順次実行）
- InputMapping 4 種の入力解決（literal, variable, template, previousOutput）
- OutputMapping による出力の変数格納（JSONPath 抽出対応）
- SkillChainCondition 4 種の条件評価（always, ifVariable, ifPreviousSuccess, expression）
- Mustache 構文によるテンプレート文字列展開
- エラーハンドリング 3 戦略（stop, skip, retry）の適用
- ステップ単位のタイムアウト制御（デフォルト 30000ms）
- 実行時間計測（ステップ単位 + チェーン全体）
- SkillService.executeSkill() への委譲（既存スキル実行基盤を利用）

**SkillChainStore の責務詳細:**

- チェーン定義の JSON ファイル永続化（`{storePath}/{chainId}.json`）
- CRUD 操作（save, get, list, delete）
- UUID v4 による ID 自動付与
- createdAt/updatedAt の自動設定
- path.normalize() + startsWith() によるパストラバーサル防止

### 4.2 IPC 通信層

| チャネル              | 方向 | 引数型                                                     | 戻り値型                            |
| --------------------- | ---- | ---------------------------------------------------------- | ----------------------------------- |
| `skill:chain:list`    | R→M  | なし                                                       | `IpcResult<SkillChainDefinition[]>` |
| `skill:chain:get`     | R→M  | `chainId: string`                                          | `IpcResult<SkillChainDefinition>`   |
| `skill:chain:save`    | R→M  | `chain: SkillChainDefinition`                              | `IpcResult<SkillChainDefinition>`   |
| `skill:chain:delete`  | R→M  | `chainId: string`                                          | `IpcResult<{ deleted: boolean }>`   |
| `skill:chain:execute` | R→M  | `{ chainId: string; variables?: Record<string, unknown> }` | `IpcResult<SkillChainResult>`       |

全チャネル共通:

- P42 準拠 3 段バリデーション（typeof → 空文字列 → trim() 空文字列）
- validateIpcSender による sender 検証
- エラーサニタイズ（内部パス・スタックトレース非公開）
- IPC_CHANNELS 定数によるチャネル名参照（ハードコード文字列不使用）

### 4.3 Preload 層

| コンポーネント | 責務                                                                                                            | 新規/修正 |
| -------------- | --------------------------------------------------------------------------------------------------------------- | --------- |
| channels.ts    | `SKILL_CHAIN_LIST`, `SKILL_CHAIN_GET`, `SKILL_CHAIN_SAVE`, `SKILL_CHAIN_DELETE`, `SKILL_CHAIN_EXECUTE` 定数追加 | 修正      |
| skill-api.ts   | chainAPI オブジェクト追加（list, get, save, delete, execute メソッド）                                          | 修正      |
| types.ts       | SkillChainDefinition, SkillChainResult 等の型定義追加                                                           | 修正      |

### 4.4 Renderer 層

| コンポーネント | 責務                                                     | 新規/修正 |
| -------------- | -------------------------------------------------------- | --------- |
| skillSlice.ts  | chains 状態、chainExecutionStatus 状態、個別セレクタ追加 | 修正      |

**skillSlice 追加状態:**

- `chains: SkillChainDefinition[]` -- 保存済みチェーン定義一覧
- `chainExecutionStatus: "idle" | "running" | "completed" | "error"` -- 実行状態
- `chainExecutionResult: SkillChainResult | null` -- 実行結果
- `isChainsLoading: boolean` -- ローディング状態
- `chainError: string | null` -- エラーメッセージ

**個別セレクタ 10 個:**

- 状態セレクタ 5 個: useChains, useChainExecutionStatus, useChainExecutionResult, useIsChainsLoading, useChainError
- アクションセレクタ 5 個: useFetchChains, useSaveChain, useDeleteChain, useExecuteChain, useClearChainError

### 4.5 Shared 層

| コンポーネント | 責務                                                                                                                             | 新規/修正 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------- |
| skill-chain.ts | 7 型定義（SkillChainDefinition, SkillChainStep, InputMapping, OutputMapping, SkillChainCondition, SkillChainResult, StepResult） | 新規作成  |
| types/index.ts | skill-chain.ts のエクスポート追加                                                                                                | 修正      |

---

## 5. 要件サマリー

| カテゴリ     | 要件グループ         | 要件数 |
| ------------ | -------------------- | ------ |
| 機能要件     | FR-1（CRUD）         | 6      |
| 機能要件     | FR-2（実行）         | 5      |
| 機能要件     | FR-3（条件分岐）     | 6      |
| 機能要件     | FR-4（エラー）       | 4      |
| 機能要件     | FR-5（テンプレート） | 4      |
| 機能要件     | FR-6（出力抽出）     | 2      |
| 機能要件     | FR-7（IPC）          | 7      |
| 機能要件     | FR-8（状態管理）     | 3      |
| **FR 合計**  |                      | **37** |
| 非機能要件   | NFR-1（性能）        | 4      |
| 非機能要件   | NFR-2（安全）        | 5      |
| 非機能要件   | NFR-3（信頼）        | 3      |
| 非機能要件   | NFR-4（保守）        | 4      |
| **NFR 合計** |                      | **16** |
| **総合計**   |                      | **53** |

---

## 6. 既知の落とし穴対策

| 落とし穴 ID | 対策                                                          | 対応要件         |
| ----------- | ------------------------------------------------------------- | ---------------- |
| P31         | 個別セレクタ提供（合成 Hook を useEffect 依存配列に含めない） | FR-8-3           |
| P32         | shared/preload 型定義を同時に更新する                         | NFR-4-4          |
| P42         | 3 段バリデーション（typeof → 空文字列 → trim() 空文字列）     | FR-7-6, NFR-2-1  |
| P44         | ハンドラ引数と Preload 呼び出しのインターフェース一致         | FR-7-1 〜 FR-7-5 |
| P45         | 引数名のセマンティクスが実際の値と一致                        | FR-7-1 〜 FR-7-5 |

---

## 7. 統合テスト連携

| テスト種別         | 対象                                    | 確認内容                                                         |
| ------------------ | --------------------------------------- | ---------------------------------------------------------------- |
| 単体テスト         | SkillChainExecutor                      | ステップ順次実行、入出力マッピング、条件分岐、エラーハンドリング |
| 単体テスト         | SkillChainStore                         | CRUD 操作、JSON 永続化、ID バリデーション                        |
| 統合テスト         | IPC ハンドラ + SkillChainExecutor/Store | IPC 経由の全チャネル操作                                         |
| セキュリティテスト | IPC ハンドラ                            | P42 準拠バリデーション、sender 検証、パストラバーサル防止        |
