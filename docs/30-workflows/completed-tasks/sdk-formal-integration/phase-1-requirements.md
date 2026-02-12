# Phase 1: 要件定義 — SDK `as any` 除去の要件抽出

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-9B-I-SDK-FORMAL-INTEGRATION          |
| Phase番号  | 1                                         |
| Phase名    | 要件定義                                  |
| 目的       | `as any` 除去の要件抽出・受入基準定義     |
| 前提Phase  | なし（本タスクの起点）                    |
| 後続Phase  | Phase 2（設計）                           |
| ステータス | 未実施                                    |
| ブランチ   | refactor/task-9b-i-sdk-formal-integration |
| 関連Issue  | Issue #641                                |
| 作成日     | 2026-02-12                                |

---

## 目的

`SkillExecutor.ts` における `(await import("@anthropic-ai/claude-agent-sdk")) as any` の使用を除去し、Claude Agent SDK の動的インポートを型安全にするための要件を定義する。現状の `as any` は TypeScript のコンパイル時型チェックを無効化しており、SDK API のシグネチャ変更時にランタイムエラーが発生するリスクがある。

---

## 実行タスク

### Task 1: 現状分析 — `as any` 使用箇所の特定と影響範囲調査

#### 調査対象ファイル

| ファイル                                                        | 行番号 | 現状の問題                                           |
| --------------------------------------------------------------- | ------ | ---------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`         | 759    | `(await import(...)) as any` で型チェック無効化      |
| `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts` | -      | `QueryOptions` の定義が実際の SDK シグネチャと不一致 |

#### 調査項目

- [ ] `SkillExecutor.ts` 内の `as any` 使用箇所を全件特定
- [ ] `as any` 経由で呼び出されている SDK メソッド一覧を作成（`query()` 等）
- [ ] `SDKQueryOptions` ローカルインターフェース（420-425行目）の定義内容を確認
- [ ] `AgentExecutor.ts` と `agent-client.ts` の型安全な import パターンを参照
- [ ] 共有型定義ファイル `@anthropic-ai-claude-agent-sdk.d.ts` の `QueryOptions` 定義を確認

#### 比較分析

| 観点                 | 現在の `d.ts` 定義                    | SkillExecutor 実使用                                         |
| -------------------- | ------------------------------------- | ------------------------------------------------------------ |
| `query()` シグネチャ | `{prompt, sessionId?, systemPrompt?}` | `{prompt, options: {apiKey, tools, permissionMode, signal}}` |
| 型チェック           | 無効（`as any` により回避）           | コンパイル時検出不可                                         |
| import 方式          | 動的 `import()` + `as any`            | 他ファイルは直接 import で型安全                             |

### Task 2: 要件抽出

#### 機能要件（FR）

| FR-ID  | 要件                                                                            | 優先度 |
| ------ | ------------------------------------------------------------------------------- | ------ |
| FR-001 | `SkillExecutor.ts` の `as any` を全箇所除去する                                 | 必須   |
| FR-002 | `@anthropic-ai-claude-agent-sdk.d.ts` の型定義を SDK の実シグネチャに整合させる | 必須   |
| FR-003 | `query()` メソッド呼び出しが TypeScript コンパイル時に型チェックされる          | 必須   |
| FR-004 | 動的 `import()` の戻り値型が正しく推論される                                    | 必須   |
| FR-005 | `SDKQueryOptions` ローカル型と共有型定義の整合性を確保する                      | 必須   |

#### 非機能要件（NFR）

| NFR-ID  | 要件                                                             | 優先度 |
| ------- | ---------------------------------------------------------------- | ------ |
| NFR-001 | 既存テスト（SkillExecutor 関連テスト全件）が変更なしで PASS する | 必須   |
| NFR-002 | `@ts-expect-error` / `@ts-ignore` を新規追加しない               | 必須   |
| NFR-003 | `AgentExecutor.ts` / `agent-client.ts` への影響がゼロである      | 必須   |
| NFR-004 | `pnpm typecheck` が全パッケージで PASS する                      | 必須   |
| NFR-005 | SkillExecutor の既存ロジック（実行フロー）に変更を加えない       | 必須   |

### Task 3: 受入基準定義

#### 受入基準一覧

| AC-ID  | Given                                     | When                                          | Then                                                  |
| ------ | ----------------------------------------- | --------------------------------------------- | ----------------------------------------------------- |
| AC-001 | `SkillExecutor.ts` が修正済みの状態       | `grep "as any" SkillExecutor.ts` を実行する   | 一致する行が 0 件である                               |
| AC-002 | 型定義ファイルが更新済みの状態            | `pnpm typecheck` を実行する                   | エラー 0 件で成功する                                 |
| AC-003 | `SkillExecutor.ts` の SDK `import()` 箇所 | TypeScript の型推論を確認する                 | `any` 型ではなく具体的な SDK モジュール型が推論される |
| AC-004 | `query()` に誤った引数を渡すコードを書く  | `pnpm typecheck` を実行する                   | コンパイルエラーが検出される                          |
| AC-005 | 全既存テストスイート                      | `pnpm --filter @repo/desktop test` を実行する | 既存テストが全件 PASS する（追加変更なし）            |
| AC-006 | `AgentExecutor.ts` と `agent-client.ts`   | `git diff` で差分を確認する                   | これらのファイルに変更がないことを確認                |
| AC-007 | 修正後の `SkillExecutor.ts`               | `@ts-expect-error` を検索する                 | 新規追加された `@ts-expect-error` が 0 件である       |

### Task 4: スコープ定義

#### スコープ内（含むもの）

| 項目                                     | 説明                                                       |
| ---------------------------------------- | ---------------------------------------------------------- |
| `as any` 除去                            | `SkillExecutor.ts` の動的 import における `as any` 全箇所  |
| 型定義修正                               | `@anthropic-ai-claude-agent-sdk.d.ts` の `QueryOptions` 等 |
| 動的 import の型付け                     | `import()` 式に適切な型表現を適用                          |
| `SDKQueryOptions` ローカル型の整合性調整 | 共有型定義との一貫性確保                                   |

#### スコープ外（含まないもの）

| 項目                                          | 除外理由                                 |
| --------------------------------------------- | ---------------------------------------- |
| SDK 機能追加（新規メソッド呼び出し）          | 本タスクのスコープは型安全性強化のみ     |
| `SkillExecutor` のビジネスロジック変更        | 実行フローの変更は別タスクで対応         |
| `AgentExecutor.ts` / `agent-client.ts` の修正 | 既に型安全であるため対象外               |
| SDK バージョンアップ                          | 現行 `^0.2.5` のまま対応                 |
| 動的 import から top-level import への変更    | アーキテクチャ変更は本タスクのスコープ外 |

### アーキテクチャ層別要件

| 層                         | 影響 | 内容                                             |
| -------------------------- | ---- | ------------------------------------------------ |
| フロントエンド（Renderer） | なし | 型変更は Main/Shared 層のみ                      |
| バックエンド（Main）       | あり | SkillExecutor.ts の `as any` 除去                |
| IPC 通信                   | なし | IPC チャンネル・ハンドラは変更なし               |
| Preload                    | なし | Preload API は変更なし                           |
| Shared                     | あり | `@anthropic-ai-claude-agent-sdk.d.ts` 型定義更新 |

---

## 参照資料

| 参照資料                      | パス                                                                                 | 内容                                 |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------ |
| SkillExecutor 実装            | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                              | `as any` 使用箇所の実装ファイル      |
| SDK 型定義（共有）            | `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts`                      | 現行の SDK 型宣言ファイル            |
| AgentExecutor 実装            | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                              | 型安全な import パターンの参照       |
| agent-client 実装             | `apps/desktop/src/main/services/agent/agent-client.ts`                               | 型安全な import パターンの参照       |
| Executor インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | SkillExecutor のインターフェース仕様 |
| 技術判断書                    | `docs/30-workflows/skill-import-agent-system/technical-decisions.md` 1               | SDK 採用決定の経緯                   |
| コード品質ルール              | `.claude/rules/02-code-quality.md`                                                   | `any` 型禁止ルール                   |
| エラーハンドリング仕様        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                | 型安全性のエラーハンドリング観点     |
| 開発ガイドライン              | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`        | TypeScript型安全開発原則             |

---

## 実行手順

### Step 1: 現状分析の実行

1. `SkillExecutor.ts` を読み込み、`as any` の全使用箇所を特定する
2. `@anthropic-ai-claude-agent-sdk.d.ts` の現行型定義を確認する
3. `node_modules/@anthropic-ai/claude-agent-sdk/` の実際の型定義またはエクスポートを調査する
4. `AgentExecutor.ts` / `agent-client.ts` の型安全な import パターンを分析する

### Step 2: 要件抽出の実行

1. Task 1 の分析結果に基づき、FR/NFR を確定する
2. 各要件の優先度と実現可能性を検証する

### Step 3: 受入基準の作成

1. 各 FR/NFR に対応する受入基準を Given-When-Then 形式で作成する
2. 自動検証可能な基準（grep, typecheck, test）を優先する

### Step 4: 成果物の生成

1. 要件定義書を `outputs/phase-1/requirements-definition.md` に出力する
2. 受入基準を `outputs/phase-1/acceptance-criteria.md` に出力する

---

## 成果物

| 成果物     | 説明                           | 配置先                                       |
| ---------- | ------------------------------ | -------------------------------------------- |
| 要件定義書 | FR/NFR・スコープの確定版       | `outputs/phase-1/requirements-definition.md` |
| 受入基準書 | Given-When-Then 形式の基準一覧 | `outputs/phase-1/acceptance-criteria.md`     |

---

## 統合テスト連携

本タスクは型定義のみの変更であり、API・DB・認証等の統合テストは直接関係しない。型安全化の統合的検証は Phase 5 の既存テスト全件 PASS 確認で代替する。

---

## 完了条件

- [ ] `SkillExecutor.ts` 内の `as any` 使用箇所が全件特定されている
- [ ] SDK の実シグネチャ（`query()` 等）が調査・文書化されている
- [ ] 機能要件（FR-001 ~ FR-005）が定義されている
- [ ] 非機能要件（NFR-001 ~ NFR-005）が定義されている
- [ ] 受入基準（AC-001 ~ AC-007）が Given-When-Then 形式で作成されている
- [ ] スコープ内・スコープ外が明確に定義されている
- [ ] 全成果物が `outputs/phase-1/` に配置されている
- [ ] 本Phase内の全タスクを100%実行完了した

---

## 多角的チェック観点

| 観点              | 確認内容                                                                         |
| ----------------- | -------------------------------------------------------------------------------- |
| TypeScript 型安全 | `as any` 除去により、コンパイル時に SDK API の誤使用が検出可能になること         |
| セキュリティ      | 型チェックが有効になることで、意図しないパラメータ（API キー漏洩等）の混入を防止 |
| 後方互換性        | 既存の `AgentExecutor` / `agent-client` への影響がゼロであること                 |
| テスト互換性      | 既存テストスイートが変更なしで PASS すること                                     |

---

## 次Phase

**Phase 2: 設計** — 型安全な SDK 統合の設計（型定義更新方針・動的 import 型付けパターン）
