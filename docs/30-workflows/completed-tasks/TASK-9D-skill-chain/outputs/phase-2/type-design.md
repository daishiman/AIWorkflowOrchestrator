# TASK-9D スキルチェーン機能 型設計

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| タスク ID  | TASK-9D-skill-chain     |
| Phase      | 2                       |
| 成果物     | 型設計                  |
| 作成日     | 2026-02-28              |
| ステータス | completed               |
| 前提       | Phase 1（要件定義）完了 |

## 概要

本ドキュメントは、スキルチェーン機能の 7 公開型 + 内部型の詳細定義を記述する。全型定義は JSDoc コメント付きで、`packages/shared/src/types/skill-chain.ts` に配置する。

---

## 1. 公開型定義（7 型）

### 1.1 SkillChainDefinition

チェーン定義の最上位型。チェーンの全体構造を表す。

```typescript
/**
 * スキルチェーン定義
 * チェーンの全体構造を定義する最上位型
 *
 * @example
 * const chain: SkillChainDefinition = {
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   name: "データ分析パイプライン",
 *   description: "データ取得→分析→レポート生成",
 *   steps: [...],
 *   variables: { apiUrl: "https://api.example.com" },
 *   errorHandling: "stop",
 *   createdAt: "2026-02-28T12:00:00.000Z",
 *   updatedAt: "2026-02-28T12:00:00.000Z",
 * };
 */
export interface SkillChainDefinition {
  /** チェーン識別子（UUID v4 形式） */
  id: string;

  /**
   * チェーン名（表示用）
   * - 1〜100 文字
   * - 空文字列不可
   */
  name: string;

  /**
   * チェーンの説明
   * - 0〜500 文字
   * - 空文字列は許可
   */
  description: string;

  /**
   * 実行ステップ配列（順序保持）
   * - 1 ステップ以上必須
   * - 配列の順序がそのまま実行順序
   */
  steps: SkillChainStep[];

  /**
   * テンプレート変数の初期値
   * - チェーン実行時の初期変数として使用
   * - executeChain の initialVariables とマージされる（initialVariables が優先）
   */
  variables: Record<string, unknown>;

  /**
   * エラー発生時の振る舞い
   * - "stop": 即座にチェーンを停止
   * - "skip": 失敗ステップをスキップして続行
   * - "retry": retryCount 回リトライ後、失敗なら停止
   */
  errorHandling: SkillChainErrorStrategy;

  /** 作成日時（ISO 8601 文字列） */
  createdAt: string;

  /** 更新日時（ISO 8601 文字列） */
  updatedAt: string;
}
```

| フィールド    | 型                        | 必須 | デフォルト       | 制約                  |
| ------------- | ------------------------- | ---- | ---------------- | --------------------- |
| id            | `string`                  | Yes  | UUID v4 自動生成 | UUID v4 形式          |
| name          | `string`                  | Yes  | -                | 1〜100 文字           |
| description   | `string`                  | Yes  | `""`             | 0〜500 文字           |
| steps         | `SkillChainStep[]`        | Yes  | -                | 1 要素以上            |
| variables     | `Record<string, unknown>` | Yes  | `{}`             | -                     |
| errorHandling | `SkillChainErrorStrategy` | Yes  | -                | "stop"/"skip"/"retry" |
| createdAt     | `string`                  | Yes  | 自動設定         | ISO 8601              |
| updatedAt     | `string`                  | Yes  | 自動設定         | ISO 8601              |

### 1.2 SkillChainStep

チェーン内の 1 ステップを表す型。

```typescript
/**
 * チェーン内の1ステップ
 * 1つのスキル実行とその入出力マッピングを定義する
 *
 * @example
 * const step: SkillChainStep = {
 *   stepId: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
 *   skillName: "data-analyzer",
 *   inputMapping: {
 *     data: { type: "previousOutput" },
 *     format: { type: "literal", value: "json" },
 *   },
 *   outputMapping: { variableName: "analysisResult" },
 *   condition: { type: "ifPreviousSuccess" },
 *   timeout: 60000,
 *   retryCount: 2,
 * };
 */
export interface SkillChainStep {
  /** ステップ識別子（UUID v4 形式） */
  stepId: string;

  /**
   * 実行対象スキル名
   * - インポート済みスキルの名前を指定
   */
  skillName: string;

  /**
   * 入力マッピング定義
   * - キー: スキルの入力パラメータ名
   * - 値: InputMapping による値の取得方法
   */
  inputMapping: Record<string, InputMapping>;

  /**
   * 出力マッピング定義（任意）
   * - 未指定の場合、出力は変数に格納されない
   * - 指定した場合、出力を変数に格納して後続ステップから参照可能
   */
  outputMapping?: OutputMapping;

  /**
   * 実行条件（任意）
   * - 未指定の場合は常に実行（type="always" と同等）
   */
  condition?: SkillChainCondition;

  /**
   * タイムアウト（ミリ秒）
   * - 未指定時はデフォルト 30000ms
   * - 0 は無制限を意味しない（0 は即座にタイムアウト）
   */
  timeout?: number;

  /**
   * リトライ回数
   * - 未指定時は 0（リトライなし）
   * - errorHandling="retry" 時のみ有効
   * - 最大試行回数は retryCount + 1（初回 + リトライ回数）
   */
  retryCount?: number;
}
```

| フィールド    | 型                             | 必須 | デフォルト | 制約          |
| ------------- | ------------------------------ | ---- | ---------- | ------------- |
| stepId        | `string`                       | Yes  | -          | UUID v4 形式  |
| skillName     | `string`                       | Yes  | -          | 空文字列不可  |
| inputMapping  | `Record<string, InputMapping>` | Yes  | -          | -             |
| outputMapping | `OutputMapping`                | No   | undefined  | -             |
| condition     | `SkillChainCondition`          | No   | undefined  | 未指定=always |
| timeout       | `number`                       | No   | 30000      | ミリ秒、正数  |
| retryCount    | `number`                       | No   | 0          | 0 以上の整数  |

### 1.3 InputMapping

ステップへの入力値の取得方法を定義する型。

```typescript
/**
 * 入力マッピング定義
 * ステップへの入力値の取得方法を指定する
 *
 * @example
 * // literal: 固定値
 * { type: "literal", value: "Hello, World!" }
 *
 * // variable: 変数参照
 * { type: "variable", value: "apiUrl" }
 *
 * // template: Mustache テンプレート
 * { type: "template", template: "{{name}} のレポート" }
 *
 * // previousOutput: 前ステップ出力
 * { type: "previousOutput" }
 */
export interface InputMapping {
  /**
   * 入力値の取得方法
   * - "literal": value フィールドの値をそのまま使用
   * - "variable": value フィールドで指定した変数名から値を取得
   * - "template": template フィールドの Mustache テンプレートを展開
   * - "previousOutput": 直前ステップの出力をそのまま使用
   */
  type: InputMappingType;

  /**
   * literal: リテラル値そのもの
   * variable: 変数名（string）
   * template/previousOutput: 使用しない
   */
  value?: unknown;

  /**
   * template 時の Mustache テンプレート文字列
   * {{variableName}} 構文で変数を参照する
   */
  template?: string;
}
```

| フィールド | 型                 | 必須                     | 説明                        |
| ---------- | ------------------ | ------------------------ | --------------------------- |
| type       | `InputMappingType` | Yes                      | 入力値の取得方法            |
| value      | `unknown`          | literal/variable 時: Yes | リテラル値 or 変数名        |
| template   | `string`           | template 時: Yes         | Mustache テンプレート文字列 |

### 1.4 OutputMapping

ステップ出力から値を抽出して変数に格納する型。

```typescript
/**
 * 出力マッピング定義
 * ステップ出力から値を抽出して変数に格納する
 *
 * @example
 * // 出力全体を変数に格納
 * { variableName: "fullOutput" }
 *
 * // JSONPath で部分抽出
 * { extractPath: "$.data.items", variableName: "items" }
 */
export interface OutputMapping {
  /**
   * JSONPath 形式の出力抽出パス
   * - 未指定時は出力全体を変数に格納
   * - 例: "$.data.items", "$.name", "$[0]"
   */
  extractPath?: string;

  /**
   * 抽出結果を格納する変数名
   * - 後続ステップから variables[variableName] で参照可能
   */
  variableName: string;
}
```

| フィールド   | 型       | 必須 | 説明                    |
| ------------ | -------- | ---- | ----------------------- |
| extractPath  | `string` | No   | JSONPath 形式の抽出パス |
| variableName | `string` | Yes  | 格納先変数名            |

### 1.5 SkillChainCondition

ステップの実行条件を定義する型。

```typescript
/**
 * ステップ実行条件
 *
 * @example
 * // 常に実行
 * { type: "always" }
 *
 * // 変数一致
 * { type: "ifVariable", variable: "status", expectedValue: "ok" }
 *
 * // 前ステップ成功時
 * { type: "ifPreviousSuccess" }
 *
 * // 式評価
 * { type: "expression", expression: "{{count}} > 0" }
 */
export interface SkillChainCondition {
  /**
   * 条件種別
   * - "always": 常に実行
   * - "ifVariable": 指定変数が期待値と一致する場合
   * - "ifPreviousSuccess": 直前ステップが成功した場合
   * - "expression": 式評価結果が truthy の場合
   */
  type: SkillChainConditionType;

  /**
   * expression 時の評価式
   * - Mustache 変数参照可能（{{variableName}}）
   * - サポートする演算子: >, <, >=, <=, ===, !==
   * - eval 不使用（NFR-2-5）
   */
  expression?: string;

  /**
   * ifVariable 時の変数名
   * - variables[variable] の値を取得する
   */
  variable?: string;

  /**
   * ifVariable 時の期待値
   * - variables[variable] === expectedValue で判定
   */
  expectedValue?: unknown;
}
```

| フィールド    | 型                        | 必須               | 説明     |
| ------------- | ------------------------- | ------------------ | -------- |
| type          | `SkillChainConditionType` | Yes                | 条件種別 |
| expression    | `string`                  | expression 時: Yes | 評価式   |
| variable      | `string`                  | ifVariable 時: Yes | 変数名   |
| expectedValue | `unknown`                 | ifVariable 時: Yes | 期待値   |

### 1.6 SkillChainResult

チェーン実行結果の型。

```typescript
/**
 * チェーン実行結果
 *
 * @example
 * const result: SkillChainResult = {
 *   chainId: "550e8400-e29b-41d4-a716-446655440000",
 *   success: true,
 *   results: [
 *     { stepId: "step-1", success: true, output: {...}, duration: 150 },
 *     { stepId: "step-2", success: true, output: {...}, duration: 200 },
 *   ],
 *   finalVariables: { rawData: {...}, analysis: {...} },
 *   totalDuration: 380,
 * };
 */
export interface SkillChainResult {
  /** 実行したチェーンの ID */
  chainId: string;

  /**
   * チェーン全体の成否
   * - true: 全ステップが成功（スキップ含む）
   * - false: いずれかのステップが失敗（errorHandling に従い停止）
   */
  success: boolean;

  /**
   * 各ステップの実行結果
   * - 配列の順序は steps 定義順と一致
   * - errorHandling="stop" で途中停止の場合、停止後のステップは含まれない
   */
  results: StepResult[];

  /**
   * 最終的な変数状態
   * - チェーン完了時点の全変数のスナップショット
   * - エラーで停止した場合は最後の成功時点の状態
   */
  finalVariables: Record<string, unknown>;

  /**
   * 合計実行時間（ミリ秒）
   * - チェーン実行開始から完了までの経過時間
   * - 各ステップの duration 合計以上の値（オーバーヘッド含む）
   */
  totalDuration: number;
}
```

| フィールド     | 型                        | 必須 | 説明               |
| -------------- | ------------------------- | ---- | ------------------ |
| chainId        | `string`                  | Yes  | チェーン ID        |
| success        | `boolean`                 | Yes  | 全体成否           |
| results        | `StepResult[]`            | Yes  | ステップ結果配列   |
| finalVariables | `Record<string, unknown>` | Yes  | 最終変数状態       |
| totalDuration  | `number`                  | Yes  | 合計実行時間（ms） |

### 1.7 StepResult

個別ステップの実行結果を表す型。

```typescript
/**
 * 個別ステップの実行結果
 *
 * @example
 * // 成功
 * { stepId: "step-1", success: true, output: { data: [1,2,3] }, duration: 150 }
 *
 * // 失敗
 * { stepId: "step-2", success: false, error: "Timeout after 30000ms", duration: 30050 }
 *
 * // スキップ
 * { stepId: "step-3", skipped: true }
 */
export interface StepResult {
  /** ステップ識別子 */
  stepId: string;

  /**
   * 成否
   * - true: 実行成功
   * - false: 実行失敗
   * - undefined: スキップされた場合（skipped=true）
   */
  success?: boolean;

  /**
   * 条件不一致でスキップされたか
   * - true: 条件不一致によりスキップ
   * - undefined/false: 実行された
   */
  skipped?: boolean;

  /**
   * ステップ出力
   * - スキル実行の戻り値
   * - スキップされた場合は undefined
   */
  output?: unknown;

  /**
   * エラーメッセージ
   * - 実行失敗時のエラー内容
   * - サニタイズ済み（内部パス除去）
   */
  error?: string;

  /**
   * 実行時間（ミリ秒）
   * - スキル実行の所要時間
   * - スキップされた場合は undefined
   */
  duration?: number;
}
```

| フィールド | 型        | 必須 | 説明                         |
| ---------- | --------- | ---- | ---------------------------- |
| stepId     | `string`  | Yes  | ステップ識別子               |
| success    | `boolean` | No   | 成否（スキップ時 undefined） |
| skipped    | `boolean` | No   | スキップフラグ               |
| output     | `unknown` | No   | ステップ出力                 |
| error      | `string`  | No   | エラーメッセージ             |
| duration   | `number`  | No   | 実行時間（ms）               |

---

## 2. ユニオン型（エイリアス型）

### 2.1 SkillChainErrorStrategy

```typescript
/** エラーハンドリング戦略 */
export type SkillChainErrorStrategy = "stop" | "skip" | "retry";
```

| 値      | 説明                                                      |
| ------- | --------------------------------------------------------- |
| "stop"  | ステップ失敗時にチェーン全体を停止                        |
| "skip"  | ステップ失敗時にそのステップをスキップして後続を続行      |
| "retry" | retryCount 回リトライ後、それでも失敗なら stop と同じ動作 |

### 2.2 InputMappingType

```typescript
/** 入力マッピング種別 */
export type InputMappingType =
  | "literal"
  | "variable"
  | "template"
  | "previousOutput";
```

| 値               | 説明                                            |
| ---------------- | ----------------------------------------------- |
| "literal"        | value フィールドの値をそのまま使用              |
| "variable"       | value フィールドで指定した変数名から値取得      |
| "template"       | template フィールドの Mustache テンプレート展開 |
| "previousOutput" | 直前ステップの出力をそのまま使用                |

### 2.3 SkillChainConditionType

```typescript
/** 条件種別 */
export type SkillChainConditionType =
  | "always"
  | "ifVariable"
  | "ifPreviousSuccess"
  | "expression";
```

| 値                  | 説明                                 |
| ------------------- | ------------------------------------ |
| "always"            | 常に実行                             |
| "ifVariable"        | 指定変数が期待値と一致する場合に実行 |
| "ifPreviousSuccess" | 直前ステップが成功した場合のみ実行   |
| "expression"        | 式評価結果が truthy の場合に実行     |

---

## 3. 内部型定義

### 3.1 ChainExecutionContext

チェーン実行中の状態を管理する内部型。SkillChainExecutor 内部でのみ使用する。

```typescript
/**
 * チェーン実行コンテキスト（内部型）
 * チェーン実行中の状態を保持する
 *
 * @internal SkillChainExecutor 内部でのみ使用
 */
interface ChainExecutionContext {
  /**
   * 現在の変数状態
   * - chain.variables と initialVariables のマージから始まり、
   *   各ステップの outputMapping で更新される
   */
  variables: Record<string, unknown>;

  /**
   * 直前ステップの出力
   * - InputMapping type="previousOutput" で参照される
   * - 最初のステップでは undefined
   */
  previousOutput: unknown;

  /**
   * 直前ステップの成否
   * - SkillChainCondition type="ifPreviousSuccess" で参照される
   * - 最初のステップでは true（初期値）
   */
  previousSuccess: boolean;

  /**
   * これまでのステップ結果
   * - 実行済みステップの StepResult を蓄積
   */
  stepResults: StepResult[];
}
```

| フィールド      | 型                        | 初期値     | 説明                   |
| --------------- | ------------------------- | ---------- | ---------------------- |
| variables       | `Record<string, unknown>` | マージ結果 | 現在の変数状態         |
| previousOutput  | `unknown`                 | undefined  | 直前ステップの出力     |
| previousSuccess | `boolean`                 | true       | 直前ステップの成否     |
| stepResults     | `StepResult[]`            | []         | これまでのステップ結果 |

### 3.2 ChainExecutionStatus

Renderer 側のチェーン実行状態を表す型。

```typescript
/**
 * チェーン実行状態（Renderer 側）
 */
type ChainExecutionStatus = "idle" | "running" | "completed" | "error";
```

| 値          | 説明               | 遷移元  |
| ----------- | ------------------ | ------- |
| "idle"      | 初期状態、実行待ち | -       |
| "running"   | チェーン実行中     | idle    |
| "completed" | チェーン実行成功   | running |
| "error"     | チェーン実行失敗   | running |

---

## 4. エクスポート定義

### 4.1 skill-chain.ts のエクスポート

```typescript
// packages/shared/src/types/skill-chain.ts

// 公開型
export type {
  SkillChainDefinition,
  SkillChainStep,
  InputMapping,
  OutputMapping,
  SkillChainCondition,
  SkillChainResult,
  StepResult,
};

// ユニオン型
export type {
  SkillChainErrorStrategy,
  InputMappingType,
  SkillChainConditionType,
};
```

### 4.2 types/index.ts の追加エクスポート

```typescript
// packages/shared/src/types/index.ts に追加
export type {
  SkillChainDefinition,
  SkillChainErrorStrategy,
  SkillChainStep,
  InputMapping,
  InputMappingType,
  OutputMapping,
  SkillChainCondition,
  SkillChainConditionType,
  SkillChainResult,
  StepResult,
} from "./skill-chain";
```

---

## 5. P32 準拠: 型定義の二箇所同時更新

### 5.1 更新対象ファイル

| ファイル                                   | 内容                          |
| ------------------------------------------ | ----------------------------- |
| `packages/shared/src/types/skill-chain.ts` | 7 公開型 + 3 ユニオン型の定義 |
| `packages/shared/src/types/index.ts`       | エクスポート追加              |
| `apps/desktop/src/preload/types.ts`        | ChainAPI インターフェース追加 |

### 5.2 型整合性確認手順

1. `packages/shared/src/types/skill-chain.ts` を作成・更新
2. `packages/shared/src/types/index.ts` にエクスポート追加
3. `apps/desktop/src/preload/types.ts` に ChainAPI インターフェース追加
4. `pnpm typecheck` で型整合性を検証

---

## 6. 型定義サマリー

| カテゴリ   | 型名                    | 種別       | フィールド数 |
| ---------- | ----------------------- | ---------- | ------------ |
| 公開型     | SkillChainDefinition    | interface  | 8            |
| 公開型     | SkillChainStep          | interface  | 7            |
| 公開型     | InputMapping            | interface  | 3            |
| 公開型     | OutputMapping           | interface  | 2            |
| 公開型     | SkillChainCondition     | interface  | 4            |
| 公開型     | SkillChainResult        | interface  | 5            |
| 公開型     | StepResult              | interface  | 6            |
| ユニオン型 | SkillChainErrorStrategy | type alias | 3 値         |
| ユニオン型 | InputMappingType        | type alias | 4 値         |
| ユニオン型 | SkillChainConditionType | type alias | 4 値         |
| 内部型     | ChainExecutionContext   | interface  | 4            |
| 内部型     | ChainExecutionStatus    | type alias | 4 値         |
| **合計**   |                         | **12 型**  |              |
