# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 2                            |
| Phase名    | 設計                         |
| 前提Phase  | Phase 1                      |
| 後続Phase  | Phase 3                      |
| ステータス | 未実施                       |
| 作成日     | 2026-04-18                   |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |

---

## 目的

Phase 1 で確定した要件に基づき、`runCreateWorkflow` への LLM 呼び出し統合の設計を行う。
LLM 呼び出し方式・purpose 抽出フロー・エラーハンドリング・出力フォーマット・既存パターンとの整合性を確定する。

## 背景

現状の `runCreateWorkflow` では `structurePlan.purpose` に `options.description` が直接代入されており、
LLM 推論結果が利用されていない。本 Phase では「どのように LLM を呼び出すか」「失敗時にどう振る舞うか」を設計し、
Phase 4 以降の実装・テスト作成の基盤とする。

---

## 実行タスク

### タスク1: LLM 呼び出し方式の設計

**目的**: 直接呼び出し vs エージェント経由のトレードオフを評価し、採用方式を決定する。

**実行手順**:

1. 候補案 A（直接呼び出し）と候補案 B（エージェント経由）のトレードオフを整理する
2. 既存の `SkillCreatorService` コードベースに `llmClient` 相当の実装が存在するか確認する
3. `runCollaborativeWorkflow` および `runOrchestrateWorkflow` の LLM 利用パターンを参照する
4. 採用方式を決定し、根拠を記録する

**トレードオフ比較**:

| 観点               | 案 A: 直接呼び出し（`llmClient.generate`） | 案 B: エージェント経由（スクリプト実行）     |
| ------------------ | ------------------------------------------ | -------------------------------------------- |
| シンプルさ         | ○ コード量少・依存関係明確                 | △ スクリプト起動オーバーヘッド               |
| 既存パターン整合   | ○ `llmClient` フィールド追加で統一的       | △ `scriptExecutor` 経由は purpose 抽出に不適 |
| テスト容易性       | ○ `vi.mock` で `llmClient` を差し替え可能  | △ スクリプト実行モックが複雑                 |
| エラーハンドリング | ○ `try-catch` で統一的に制御可能           | △ スクリプト終了コードと stdout の解析が必要 |
| 拡張性             | ○ モデル切り替え・プロンプト変更が容易     | △ スクリプト変更が必要                       |

**採用方式**: **案 A（直接呼び出し）**

- `llmClient.generate({ system: purposeAgentDef, user: skillInput })` を採用
- `llmClient` はコンストラクタ注入でテスト時にモック差し替え可能にする

**期待される成果物**:

- 採用方式の決定と根拠記録

---

### タスク2: purpose 抽出フローの詳細設計

**目的**: `loadAgent` → LLM `generate` → `structurePlan.purpose` への格納フローを設計する。

**実行手順**:

1. `runCreateWorkflow` メソッド内の変更箇所を特定する
2. `llmClient` フィールドの型定義（インターフェース）を設計する
3. purpose 抽出フローのシーケンスを設計する
4. `skillInput` の構築方法を設計する（スキル名 + 説明文の組み合わせ）
5. LLM 生成結果の受け取り方を設計する（文字列直接 vs JSON パース）

**llmClient インターフェース設計**:

```typescript
interface LlmGenerateOptions {
  system: string;
  user: string;
}

interface LlmClient {
  generate(options: LlmGenerateOptions): Promise<string>;
}
```

**purpose 抽出フロー設計**:

```
runCreateWorkflow(options, signal)
  │
  ├─ loadAgent("extract-purpose", { signal })
  │    └─ resourceLoader.loadAgent("extract-purpose")
  │         └─ 戻り値: purposeAgentDef (string)
  │
  ├─ skillInput の構築
  │    └─ `スキル名: ${options.name}\n説明: ${options.description}`
  │
  ├─ llmClient.generate({ system: purposeAgentDef, user: skillInput })
  │    └─ LLM から purpose 文字列を受け取る
  │
  ├─ structurePlan.purpose = purpose (LLM 生成結果)
  │
  └─ return structurePlan
```

**`skillInput` 構築設計**:

| フィールド  | 値                                        | 理由                                         |
| ----------- | ----------------------------------------- | -------------------------------------------- |
| `user` 引数 | `"スキル名: {name}\n説明: {description}"` | extract-purpose エージェントの入力要件に準拠 |

**LLM 生成結果の受け取り**:

- LLM は `string` 型で purpose 文章を直接返すことを期待する
- JSON パースは行わない（extract-purpose エージェントの `summary` フィールド相当の文字列を直接返す）
- 先頭・末尾の空白は `.trim()` で除去する

**期待される成果物**:

- `llmClient` インターフェース定義
- purpose 抽出フロー図（擬似コード）
- `skillInput` 構築仕様

---

### タスク3: エラーハンドリング設計

**目的**: LLM 呼び出し失敗時のフォールバック動作を設計し、既存の堅牢性を維持する。

**実行手順**:

1. `runCreateWorkflow` の既存エラーハンドリング（`try-catch` → `return null`）を確認する
2. LLM 呼び出し失敗時のフォールバック方針を決定する
3. 各エラーケースの処理を設計する
4. AbortSignal による中断時の処理を確認する

**エラーハンドリング設計**:

| エラーケース                        | 処理方針                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| `loadAgent` 失敗（ファイル不在等）  | `runCreateWorkflow` の `catch` ブロックで捕捉 → `return null`                          |
| `llmClient.generate` 失敗（通信等） | `runCreateWorkflow` の `catch` ブロックで捕捉 → `return null`                          |
| LLM が空文字を返す                  | `purpose` に空文字を格納（フォールバックなし、Phase 6 で境界テスト）                   |
| `llmClient` が未設定（`undefined`） | `optional chaining` で安全に処理 → `purpose` は `options.description` にフォールバック |
| AbortError                          | `isAbortError` で判定後 rethrow（既存パターンを踏襲）                                  |

**フォールバック構造**:

```typescript
private async runCreateWorkflow(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<StructurePlanJson | null> {
  try {
    // ... purpose 抽出処理 ...
    const purpose = await this.extractPurposeWithLlm(options, signal);
    structurePlan.purpose = purpose ?? options.description;
    return structurePlan;
  } catch (error) {
    if (this.isAbortError(error)) throw error;
    return null; // 既存パターン踏襲
  }
}
```

**期待される成果物**:

- エラーハンドリング設計表
- フォールバック構造の擬似コード

---

### タスク4: extract-purpose エージェントの期待する出力フォーマット定義

**目的**: AC-5「エージェント定義ファイルの期待する出力フォーマットが明確化・文書化される」を充足する。

**実行手順**:

1. `.claude/skills/skill-creator/agents/extract-purpose.md` の出力スキーマを確認する
2. `StructurePlanJson.purpose` が文字列型（`string`）であることを確認する
3. LLM が返すべき文字列フォーマットを設計する

**期待する出力フォーマット**:

LLM（`llmClient.generate`）が返す文字列は以下の仕様に従う:

| 項目         | 仕様                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| 型           | `string`（プレーンテキスト）                                            |
| 長さ         | 10〜200 文字（extract-purpose エージェントの `summary` フィールド準拠） |
| 形式         | 1〜2 文の自然言語文（日本語または英語）                                 |
| JSON 形式    | 不要（文字列直接返却）                                                  |
| 先頭末尾空白 | `trim()` により除去して格納                                             |

**extract-purpose エージェント定義との対応**:

| エージェント出力フィールド | `structurePlan` への格納先 | 備考                                          |
| -------------------------- | -------------------------- | --------------------------------------------- |
| `summary`                  | `structurePlan.purpose`    | 主要フィールド、1-2文の目的文                 |
| `skillName`                | 使用しない                 | `options.name` を使用                         |
| `goals`                    | 使用しない（将来タスク）   | `features` フィールドへの格納は別タスクで対応 |

**期待される成果物**:

- 出力フォーマット仕様表
- エージェントフィールドと `StructurePlanJson` フィールドの対応表

---

### タスク5: SkillCreatorService の既存パターンとの整合性確認

**目的**: `llmClient` 追加が既存のクラス構造・テスト・型定義と整合することを確認する。

**実行手順**:

1. `SkillCreatorService` コンストラクタの現状を確認する（`skillsDir`, `workflowsDir` の任意引数）
2. `llmClient` をオプショナルなコンストラクタ引数として追加する設計を確認する
3. 既存テスト（`SkillCreatorService.test.ts`, `SkillCreatorService.struct-001.test.ts` 等）への影響を確認する
4. `llmClient` が `undefined` の場合のフォールバック動作を確認する

**コンストラクタ変更設計**:

```typescript
// 変更前
constructor(skillsDir?: string, workflowsDir?: string)

// 変更後
constructor(
  skillsDir?: string,
  workflowsDir?: string,
  llmClient?: LlmClient,  // オプショナル追加（後方互換）
)
```

**後方互換性確認**:

- 既存テストはコンストラクタ引数なしで `new SkillCreatorService()` を呼び出しており、
  `llmClient` をオプショナルにすることで既存テストの変更は不要
- `llmClient` が `undefined` の場合、purpose 抽出をスキップして `options.description` を使用する

**期待される成果物**:

- コンストラクタ変更設計
- 後方互換性確認結果

---

### タスク6: 統合テスト連携 — 統合ポイント/契約の設計への反映

**目的**: `llmClient` API・スキーマを設計に反映し、統合テスト計画の基礎を整備する。

**実行手順**:

1. `llmClient` インターフェースを正式なコントラクトとして定義する
2. `skillInput` の構築フォーマットを統合テストシナリオの入力仕様として記録する
3. purpose 抽出後のデータフロー（`structurePlan.purpose` → `generateSkillMd` → SKILL.md）を確認する
4. モジュール間インターフェース（`ResourceLoader.loadAgent` ↔ `llmClient.generate` ↔ `StructurePlanJson`）を統合ポイントとして明記する

**統合ポイント定義**:

| 統合ポイント                   | 提供元              | 消費元              | 契約                                          |
| ------------------------------ | ------------------- | ------------------- | --------------------------------------------- |
| `loadAgent("extract-purpose")` | `ResourceLoader`    | `runCreateWorkflow` | `Promise<string>`: エージェント定義 MD 文字列 |
| `llmClient.generate`           | `LlmClient` 実装    | `runCreateWorkflow` | `Promise<string>`: purpose 文字列             |
| `structurePlan.purpose`        | `runCreateWorkflow` | `generateSkillMd`   | `string`: LLM 生成の purpose 文字列           |

**期待される成果物**:

- 統合ポイント定義表
- `llmClient` API コントラクト仕様

---

## 参照資料

| 参照資料                         | パス                                                                   | 内容                        |
| -------------------------------- | ---------------------------------------------------------------------- | --------------------------- |
| SkillCreatorService              | apps/desktop/src/main/services/skill/SkillCreatorService.ts            | 実装対象                    |
| ResourceLoader                   | apps/desktop/src/main/services/skill/ResourceLoader.ts                 | loadAgent メソッド提供元    |
| extract-purpose エージェント定義 | .claude/skills/skill-creator/agents/extract-purpose.md                 | system prompt・出力スキーマ |
| Phase 1 要件定義書               | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-1-requirements.md | 受入条件・命名規則          |

---

## 成果物

| 成果物                 | パス                                                             | 内容                                             |
| ---------------------- | ---------------------------------------------------------------- | ------------------------------------------------ |
| Phase 2 設計書（本書） | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-2-design.md | LLM 呼び出し方式・フロー・エラーハンドリング設計 |

---

## 統合テスト連携

**Phase 2 アクション**: 統合ポイント/契約（`llmClient` API・スキーマ）を設計に反映する。

- `LlmClient` インターフェース（`generate(options): Promise<string>`）を正式コントラクトとして確立する
- `skillInput` 構築フォーマット（`"スキル名: {name}\n説明: {description}"`）を統合テスト入力仕様として記録する
- モジュール間の 3 つの統合ポイント（`loadAgent` → `generate` → `structurePlan.purpose`）を明文化する
- Phase 4 のテスト作成で参照するコントラクト仕様として本設計書を使用する

---

## 完了条件

- [ ] LLM 呼び出し方式（直接呼び出し）の採用と根拠が記録されている
- [ ] `LlmClient` インターフェース定義が完成している
- [ ] purpose 抽出フロー（擬似コード・フロー図）が完成している
- [ ] `skillInput` の構築仕様が確定している
- [ ] LLM 生成結果の期待出力フォーマットが明文化されている（AC-5 充足）
- [ ] エラーハンドリング設計（各ケースの処理方針）が完成している
- [ ] コンストラクタ変更設計（後方互換）が確認されている
- [ ] 統合ポイント定義表が完成している
