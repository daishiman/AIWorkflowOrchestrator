# Phase 2 成果物: 型定義設計書 -- SkillForkOptions / SkillForkResult / SkillForkMetadata

## メタ情報

| 項目     | 値                 |
| -------- | ------------------ |
| Phase    | 2                  |
| 機能名   | TASK-9E-skill-fork |
| タスクID | TASK-9E            |
| 作成日   | 2026-02-28         |

---

## 1. 型定義概要

### 1.1 命名規則

型名に `SkillFork` プレフィックスを付与し、既存の Node.js / ライブラリの `SkillForkOptions` 型との名前衝突を回避する。

| 型名                | 目的                                          | 配置先                                                |
| ------------------- | --------------------------------------------- | ----------------------------------------------------- |
| `SkillForkOptions`  | フォーク操作のリクエストパラメータ            | `packages/shared/src/types/skill-fork.ts`             |
| `SkillForkResult`   | フォーク操作の結果                            | `packages/shared/src/types/skill-fork.ts`             |
| `SkillForkMetadata` | fork-metadata.json に記録されるフォーク元情報 | `packages/shared/src/types/skill-fork.ts`             |
| `SkillForkError`    | フォーク処理専用のエラークラス                | `apps/desktop/src/main/services/skill/SkillForker.ts` |

### 1.2 型の責務分離

```
packages/shared/src/types/skill-fork.ts（共有型定義）
  +-- SkillForkOptions   : IPC リクエストのデータ構造
  +-- SkillForkResult    : IPC レスポンスの data フィールド構造
  +-- SkillForkMetadata  : fork-metadata.json のファイル構造

apps/desktop/src/main/services/skill/SkillForker.ts（Main Process 専用）
  +-- SkillForkError     : エラークラス（Renderer には送信しない）
```

---

## 2. SkillForkOptions 型

### 2.1 型定義

```typescript
// packages/shared/src/types/skill-fork.ts

/**
 * スキルフォークオプション
 *
 * フォーク元スキルから新スキルを作成する際の設定。
 * 「コピー+メタデータ」方式を採用（technical-decisions.md Section 20.2）。
 *
 * IPC境界での送受信:
 *   Renderer -> safeInvoke(SKILL_FORK, options) -> Main
 *   全フィールドは JSON シリアライズ可能な型のみ使用
 */
export interface SkillForkOptions {
  /**
   * フォーク元のスキル名（ディレクトリ名）
   *
   * - P42準拠: 非空文字列、trim後も非空
   * - パストラバーサル検証対象: validatePath() で検証
   * @example "aiworkflow-requirements"
   */
  sourceSkill: string;

  /**
   * 新スキル名（ディレクトリ名として使用される）
   *
   * - P42準拠: 非空文字列、trim後も非空
   * - パストラバーサル検証対象: validatePath() で検証
   * - 同名スキルが存在する場合はエラー（1002）
   * @example "my-custom-skill"
   */
  newName: string;

  /**
   * 新スキルの説明文
   *
   * - 省略時はフォーク元の説明を維持する
   * - 指定時は SKILL.md の description フィールドを上書き
   * - P42準拠: 指定時は非空文字列、trim後も非空
   */
  description?: string;

  /**
   * agents/ ディレクトリをコピーするか
   *
   * - true: フォーク元の agents/ を新スキルにコピー
   * - false: agents/ はコピーしない
   * - フォーク元に agents/ が存在しない場合はスキップ
   */
  copyAgents: boolean;

  /**
   * references/ ディレクトリをコピーするか
   *
   * - true: フォーク元の references/ を新スキルにコピー
   * - false: references/ はコピーしない
   * - フォーク元に references/ が存在しない場合はスキップ
   */
  copyReferences: boolean;

  /**
   * scripts/ ディレクトリをコピーするか
   *
   * - true: フォーク元の scripts/ を新スキルにコピー
   * - false: scripts/ はコピーしない
   * - フォーク元に scripts/ が存在しない場合はスキップ
   */
  copyScripts: boolean;

  /**
   * assets/ ディレクトリをコピーするか
   *
   * - true: フォーク元の assets/ を新スキルにコピー
   * - false: assets/ はコピーしない
   * - フォーク元に assets/ が存在しない場合はスキップ
   */
  copyAssets: boolean;

  /**
   * allowed-tools の上書き値
   *
   * - 省略時はフォーク元の allowed-tools 設定を維持する
   * - 指定時は SKILL.md の allowed-tools を指定値で上書き
   * - P42準拠: 各要素は非空文字列、trim後も非空
   * @example ["Read", "Write", "Bash"]
   */
  modifyAllowedTools?: string[];
}
```

### 2.2 フィールド一覧

| フィールド名         | 型                      | 必須 | バリデーション                    | IPC 境界での注意点    |
| -------------------- | ----------------------- | ---- | --------------------------------- | --------------------- |
| `sourceSkill`        | `string`                | 必須 | P42 3段（型 -> 空文字列 -> trim） | JSON シリアライズ可能 |
| `newName`            | `string`                | 必須 | P42 3段（型 -> 空文字列 -> trim） | JSON シリアライズ可能 |
| `description`        | `string \| undefined`   | 任意 | 指定時: P42 3段                   | undefined は省略可能  |
| `copyAgents`         | `boolean`               | 必須 | typeof === "boolean"              | JSON シリアライズ可能 |
| `copyReferences`     | `boolean`               | 必須 | typeof === "boolean"              | JSON シリアライズ可能 |
| `copyScripts`        | `boolean`               | 必須 | typeof === "boolean"              | JSON シリアライズ可能 |
| `copyAssets`         | `boolean`               | 必須 | typeof === "boolean"              | JSON シリアライズ可能 |
| `modifyAllowedTools` | `string[] \| undefined` | 任意 | Array.isArray + 各要素 P42 3段    | undefined は省略可能  |

---

## 3. SkillForkResult 型

### 3.1 型定義

```typescript
/**
 * スキルフォーク結果
 *
 * IPC境界での送受信:
 *   Main -> IpcResult<SkillForkResult> -> Renderer
 *
 * 成功時: { success: true, data: SkillForkResult }
 * 失敗時: { success: false, error: string }
 */
export interface SkillForkResult {
  /**
   * フォーク成功フラグ
   *
   * - true: フォーク処理が正常完了
   * - false: フォーク処理が失敗（この場合は IpcResult.error に詳細）
   */
  success: boolean;

  /**
   * 新スキルのディレクトリパス
   *
   * - Main Process 内部のファイルシステムパス
   * - Renderer 側ではスキル名として使用（パスの最後のセグメント）
   * @example "/Users/dm/.claude/skills/my-custom-skill"
   */
  newSkillPath: string;

  /**
   * コピーされたファイルの相対パス一覧
   *
   * - 新スキルディレクトリからの相対パス
   * - SKILL.md は必ず含まれる
   * - fork-metadata.json は必ず含まれる
   * @example ["SKILL.md", "agents/main-agent.md", "references/guide.md", "fork-metadata.json"]
   */
  copiedFiles: string[];

  /**
   * 警告メッセージ（非致命的な問題がある場合）
   *
   * - Frontmatter のパース失敗時に記録
   * - 存在しないサブディレクトリのコピースキップ時には記録しない
   * - 空配列の場合は undefined を返す
   */
  warnings?: string[];
}
```

### 3.2 フィールド一覧

| フィールド名   | 型                      | 必須 | 説明                               |
| -------------- | ----------------------- | ---- | ---------------------------------- |
| `success`      | `boolean`               | 必須 | フォーク処理の成否                 |
| `newSkillPath` | `string`                | 必須 | 新スキルの絶対パス                 |
| `copiedFiles`  | `string[]`              | 必須 | コピーされたファイルの相対パス一覧 |
| `warnings`     | `string[] \| undefined` | 任意 | 非致命的な問題のメッセージ         |

### 3.3 copiedFiles の構成例

```
正常系（agents + references コピー）:
  [
    "SKILL.md",
    "agents/main-agent.md",
    "agents/sub-agent.md",
    "references/guide.md",
    "references/api-spec.md",
    "fork-metadata.json"
  ]

最小構成（サブディレクトリコピーなし）:
  [
    "SKILL.md",
    "fork-metadata.json"
  ]
```

---

## 4. SkillForkMetadata 型

### 4.1 型定義

```typescript
/**
 * フォークメタデータ
 *
 * fork-metadata.json として新スキルディレクトリに保存される。
 * フォーク元スキルとの関連を記録し、トレーサビリティを確保する。
 *
 * ファイル配置: {newSkillDir}/fork-metadata.json
 *
 * IPC境界ではISO 8601文字列として送受信する。
 * Main Process内部ではDateオブジェクトを使用し、
 * JSON.stringify時に.toISOString()で変換する。
 */
export interface SkillForkMetadata {
  /**
   * フォーク元スキル名
   *
   * - フォーク元のディレクトリ名と一致する
   * @example "aiworkflow-requirements"
   */
  forkedFrom: string;

  /**
   * フォーク日時
   *
   * - ISO 8601 形式の文字列
   * - new Date().toISOString() で生成
   * @format ISO 8601
   * @example "2026-02-28T12:00:00.000Z"
   */
  forkedAt: string;

  /**
   * フォーク元スキルの説明文（記録用）
   *
   * - フォーク元の SKILL.md から取得した description
   * - フォーク元に description がない場合は undefined
   */
  originalDescription?: string;
}
```

### 4.2 フィールド一覧

| フィールド名          | 型                    | 必須 | 説明                                   |
| --------------------- | --------------------- | ---- | -------------------------------------- |
| `forkedFrom`          | `string`              | 必須 | フォーク元のスキル名（ディレクトリ名） |
| `forkedAt`            | `string`              | 必須 | フォーク日時（ISO 8601 形式）          |
| `originalDescription` | `string \| undefined` | 任意 | フォーク元の description（記録用）     |

### 4.3 fork-metadata.json ファイル例

```json
{
  "forkedFrom": "aiworkflow-requirements",
  "forkedAt": "2026-02-28T12:00:00.000Z",
  "originalDescription": "AIワークフローオーケストレーターの要件定義スキル"
}
```

---

## 5. SkillForkError クラス

### 5.1 型定義

```typescript
// apps/desktop/src/main/services/skill/SkillForker.ts 内に定義

/**
 * スキルフォーク処理専用のエラークラス
 *
 * エラーコード体系:
 *   - 1000番台: Validation Error（バリデーション失敗、リトライ不可）
 *   - 4000番台: Infrastructure Error（FS操作失敗、リトライ可能）
 *
 * sanitizeErrorMessage() の対象:
 *   - 1000番台: メッセージにパス情報を含めない設計のためサニタイズは低影響
 *   - 4000番台: FS操作エラーの元メッセージにパス情報が含まれる場合がある
 */
export class SkillForkError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly isRetryable: boolean = false,
  ) {
    super(message);
    this.name = "SkillForkError";
  }
}
```

### 5.2 エラーコード一覧

| エラーコード | エラー種別             | isRetryable | メッセージ例                                         |
| ------------ | ---------------------- | ----------- | ---------------------------------------------------- |
| 1001         | フォーク元スキル不存在 | `false`     | `フォーク元スキル "${sourceSkill}" が見つかりません` |
| 1002         | 同名スキル存在         | `false`     | `スキル "${newName}" は既に存在します`               |
| 1003         | パストラバーサル検出   | `false`     | `不正なスキル名です`                                 |
| 1004         | 引数バリデーション失敗 | `false`     | `引数が不正です`                                     |
| 4001         | SKILL.md 読み取り失敗  | `true`      | `SKILL.md の読み取りに失敗しました`                  |
| 4002         | ディレクトリコピー失敗 | `true`      | `ディレクトリのコピーに失敗しました`                 |
| 4003         | メタデータ書き込み失敗 | `true`      | `メタデータの書き込みに失敗しました`                 |
| 4004         | ディレクトリ作成失敗   | `true`      | `ディレクトリの作成に失敗しました`                   |

---

## 6. packages/shared/src/types/index.ts への re-export

```typescript
// 既存の export に追加
export type {
  SkillForkOptions,
  SkillForkResult,
  SkillForkMetadata,
} from "./skill-fork";
```

---

## 7. IPC 境界での型変換

### 7.1 シリアライズ境界

IPC 通信では JSON シリアライズが行われるため、全型フィールドは JSON シリアライズ可能な型のみを使用する。

| 型          | JSON シリアライズ | 注意点                            |
| ----------- | ----------------- | --------------------------------- |
| `string`    | 可能              | そのまま送受信                    |
| `boolean`   | 可能              | そのまま送受信                    |
| `string[]`  | 可能              | そのまま送受信                    |
| `undefined` | 可能              | JSON.stringify で省略される       |
| `Date`      | 不可              | `.toISOString()` で string に変換 |

### 7.2 Date 型の扱い

`SkillForkMetadata.forkedAt` は `string` 型（ISO 8601）として定義する。Main Process 内部で `new Date().toISOString()` を使用して生成し、JSON.stringify 時の暗黙変換に依存しない。

```typescript
// Main Process 内部での生成
const metadata: SkillForkMetadata = {
  forkedFrom: options.sourceSkill,
  forkedAt: new Date().toISOString(), // "2026-02-28T12:00:00.000Z"
  originalDescription: originalDesc,
};
```

---

## 8. SKILL.md Frontmatter 更新仕様

### 8.1 更新対象フィールド

| フィールド      | 更新条件                                 | 更新内容                         |
| --------------- | ---------------------------------------- | -------------------------------- |
| `name`          | 常に更新                                 | `options.newName` の値に置換     |
| `description`   | `options.description` が指定されている時 | 指定値に置換                     |
| `forked-from`   | 常に追加                                 | `options.sourceSkill` の値を設定 |
| `allowed-tools` | `options.modifyAllowedTools` 指定時      | 指定値で上書き                   |

### 8.2 Frontmatter 更新前後の例

**更新前（フォーク元 SKILL.md）:**

```yaml
---
name: aiworkflow-requirements
description: AIワークフローオーケストレーターの要件定義スキル
allowed-tools:
  - Read
  - Glob
  - Grep
---
```

**更新後（フォーク先 SKILL.md）:**

```yaml
---
name: my-custom-skill
description: カスタマイズした要件定義スキル
forked-from: aiworkflow-requirements
allowed-tools:
  - Read
  - Glob
  - Grep
  - Write
  - Bash
---
```
