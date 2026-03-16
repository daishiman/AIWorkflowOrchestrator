# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| Phase      | 8                                                                                                       |
| Phase名    | リファクタリング                                                                                        |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001                                                                      |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認） |
| 後続Phase  | Phase 9（品質検証）                                                                                     |
| ステータス | completed                                                                                               |
| 作成日     | 2026-03-13                                                                                              |
| 更新日     | 2026-03-16                                                                                              |
| 機能名     | skill-docs-runtime-integration                                                                          |

## 目的

Skill Docs 生成の AI runtime 統合における責務境界を SRP（単一責務原則）に従って整理する。SkillDocGenerator に集中している prompt build / query 実行 / error mapping の 3 責務を分離し、IPC ハンドラ間の重複コードを共通パターンに抽出する。

## 実行タスク

### T-8-1: PromptBuilder の責務分離

SkillDocGenerator から prompt 構築ロジックを `PromptBuilder` クラスに抽出する。

- SkillDocGenerator 内の prompt 組み立てロジックを特定する
  - DocGenerationRequest から prompt 文字列を構築する処理
  - DocTemplate / TemplateSection を prompt に変換する処理
- `PromptBuilder` クラスを新規作成する
  ```typescript
  class PromptBuilder {
    build(request: DocGenerationRequest, template: DocTemplate): string;
    buildPreview(request: DocGenerationRequest): string;
  }
  ```
- SkillDocGenerator の constructor に PromptBuilder を DI する
- 既存テストが全て PASS することを確認する

### T-8-2: LLMDocQueryAdapter の抽象化層確認

Phase 2 で設計した LLMDocQueryAdapter の抽象化が仕様どおりに機能しているか確認し、差分があれば責務分離方針に従って整理する。

- adapter インターフェースの実装が設計どおりか確認する
  ```typescript
  interface LLMDocQueryAdapter {
    query(prompt: string): Promise<{ content: string }>;
    isAvailable(): Promise<boolean>;
    getProviderName(): string;
  }
  ```
- SkillDocGenerator が adapter に直接依存せず queryFn 経由で間接参照していることを確認する
- adapter の生成・注入経路が IPC 初期化時の Setter Injection パターン（P34 準拠）に従っていることを確認する

### T-8-3: ErrorMapper の責務分離

エラーコード変換ロジックを `ErrorMapper` クラスに集約する。

- SkillDocGenerator 内のエラー変換処理を特定する
  - LLM SDK エラー → DocOperationResult.error への変換
  - HTTP ステータスコード → エラーコード（2001-5001）への変換
  - guidance 情報の付与ロジック
- `ErrorMapper` クラスを新規作成する
  ```typescript
  class ErrorMapper {
    mapLLMError(error: unknown): DocOperationResult<never>;
    mapTimeoutError(): DocOperationResult<never>;
    mapRateLimitError(retryAfter?: number): DocOperationResult<never>;
    mapValidationError(message: string): DocOperationResult<never>;
  }
  ```
- エラー分類表（Phase 2 T-2-2）の 7 種別が ErrorMapper に集約されていることを確認する

  | エラー種別           | コード | retryable | ErrorMapper メソッド |
  | -------------------- | ------ | --------- | -------------------- |
  | API key 未設定       | 2001   | false     | mapLLMError          |
  | API key 無効         | 2002   | false     | mapLLMError          |
  | LLM timeout          | 3001   | true      | mapTimeoutError      |
  | LLM rate limit (429) | 3002   | true      | mapRateLimitError    |
  | LLM server error     | 3003   | true      | mapLLMError          |
  | IPC 通信エラー       | 4001   | true      | mapLLMError          |
  | 内部エラー           | 5001   | false     | mapLLMError          |

### T-8-4: IPC ハンドラの重複コード整理

4 チャンネル間の共通パターンを抽出する。

- 4 チャンネルの共通処理を特定する
  - `skill:docs:generate` / `skill:docs:preview` / `skill:docs:export` / `skill:docs:templates`
  - 共通パターン: sender 検証 → P42 3段バリデーション → capability チェック → 実行 → エラー境界
- 共通処理をヘルパー関数に抽出する
  ```typescript
  async function withDocHandler<T>(
    event: IpcMainInvokeEvent,
    mainWindow: BrowserWindow,
    args: unknown,
    validator: (args: unknown) => ValidatedArgs,
    handler: (validatedArgs: ValidatedArgs) => Promise<DocOperationResult<T>>,
  ): Promise<DocOperationResult<T>>;
  ```
- 各チャンネル固有のロジックのみがハンドラに残ることを確認する
- Pattern 3 登録（registerSkillDocsHandlers）の構造を維持する

### T-8-5: Capability チェックの共通化検討

SkillDocsCapabilityResolver のパターンが他 surface と共有可能か検討する。

- SkillDocsCapabilityResolver の判定ロジックを確認する
  - `integrated-api` / `guidance-only` / `terminal-handoff` の 3 path
- Task01 の共通 CapabilityResolver との差分を確認する
  - 共通化可能: isAvailable() チェック、guidance-only 判定
  - Skill Docs 固有: terminal-handoff 経路の判定
- 共通化する場合の影響範囲を評価し、リファクタリングか未タスク化かを判断する
  - 本 Phase では「共通化可能性の評価」に留め、実際の共通化は未タスクとする

## 参照資料

| 参照資料                  | パス                                                                                                              | 内容                                              |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Phase 1（要件定義）       | `phase-1-requirements.md`                                                                                         | エラー分類コード体系と非機能要件を確認する        |
| Phase 2（設計）           | `phase-2-design.md`                                                                                               | LLMDocQueryAdapter / ErrorMapper の設計を確認する |
| Phase 5（実装）           | `phase-5-implementation.md`                                                                                       | 実装成果物の責務配置を確認する                    |
| Phase 6（テスト拡充）     | `phase-6-test-expansion.md`                                                                                       | テストカバレッジ状況を確認する                    |
| Phase 7（カバレッジ確認） | `phase-7-coverage-check.md`                                                                                       | カバレッジ基準の充足状況を確認する                |
| SkillDocGenerator         | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                       | docs 生成本体の責務を確認する                     |
| ipc index                 | `apps/desktop/src/main/ipc/index.ts`                                                                              | registerSkillDocsHandlers の DI 経路を確認する    |
| task UT-9I-001            | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | 既存 stub 排除タスクとの責務境界を確認する        |

### システム仕様（aiworkflow-requirements）

> リファクタリング前に以下の正本仕様を確認し、既存契約を壊さないことを保証する。

| 参照資料                   | パス                                                                                                              | 内容                                             |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-details.md`                                      | Skill Docs IPC 正本（4 チャンネル契約）          |
| architecture-overview      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                      | registerSkillDocsHandlers の Pattern 3 構成      |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | DocGenerationRequest / GeneratedDoc 型定義正本   |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`                             | 4 層検証（sender / P42 / 入力制約 / エラー境界） |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                              | TASK-9I 完了履歴と UT-9I-001/002 未タスク正本    |

## 実行手順

### ステップ1: 現状の責務配置を可視化する

SkillDocGenerator.ts の public/private メソッド一覧と行数を確認し、prompt build / query / error mapping の 3 責務がどのメソッドに分散しているかを特定する。IPC ハンドラ 4 チャンネルの共通パターンと固有ロジックを区別する。

### ステップ2: T-8-1 から T-8-4 を順に実施する

各タスクで以下のサイクルを守る:

1. 抽出対象のコードを特定する
2. 新クラス/関数を作成し、元のコードからの呼び出しに置換する
3. 既存テストが全て PASS することを確認する（`pnpm --filter @repo/desktop exec vitest run` で対象テスト実行）
4. 抽出後のクラスが SRP に従っていることを確認する

### ステップ3: system spec との整合を確認する

リファクタリング後に以下を検証する:

- IPC 4 チャンネルの public contract（引数・戻り値の型）が変更されていないこと
- DocOperationResult の error 構造が Phase 2 設計と一致していること
- Pattern 3 登録の構造が維持されていること
- 4 層セキュリティ検証が全チャンネルで維持されていること

### ステップ4: 成果物と完了条件を確認する

リファクタリング計画書を作成し、責務分離の前後比較を記録する。全テスト PASS と型チェック PASS を確認して次の Phase への handoff を準備する。

## 統合テスト連携

リファクタリングによる責務分離が統合テストに影響しないことを確認する:

- queryFn: PromptBuilder → LLMDocQueryAdapter → SkillDocGenerator の呼び出しチェーンが維持されること
- provider adapter: isAvailable() の判定経路がリファクタリング前後で同一であること
- timeout: Promise.race(30s) の配置がリファクタリングで移動していないこと
- retry: ErrorMapper の retryable 判定が exponential backoff と正しく連携すること
- guidance: ErrorMapper の guidance 付与が UI 状態遷移と正しく連携すること

## 成果物

| 成果物               | パス                                        | 内容                                    |
| -------------------- | ------------------------------------------- | --------------------------------------- |
| リファクタリング計画 | `outputs/phase-8/refactor-plan.md`          | 責務分離の前後比較と抽出対象の一覧      |
| 責務マップ           | `outputs/phase-8/responsibility-map.md`     | 分離後の各クラス/関数の責務と依存関係図 |
| 共通化評価           | `outputs/phase-8/capability-commonality.md` | T-8-5 の共通化可能性評価と未タスク候補  |

## 完了条件

- [ ] PromptBuilder が SkillDocGenerator から分離され、prompt 構築の単一責務を持っている
- [ ] ErrorMapper がエラーコード変換の単一責務を持ち、7 種別が集約されている
- [ ] IPC ハンドラ 4 チャンネルの共通パターンが withDocHandler に抽出されている
- [ ] LLMDocQueryAdapter の抽象化層が Phase 2 設計どおりに機能している
- [ ] リファクタリング前後で IPC public contract（引数・戻り値の型）が変更されていない
- [ ] 全テストが PASS している（`pnpm --filter @repo/desktop exec vitest run`）
- [ ] `pnpm typecheck` が PASS している
- [ ] CapabilityResolver の共通化可能性が評価され、結果が記録されている

## 既知の落とし穴（関連 Pitfall）

| Pitfall | 内容                                   | 本 Phase での対策                                              |
| ------- | -------------------------------------- | -------------------------------------------------------------- |
| P5      | リスナー二重登録                       | withDocHandler 抽出時に ipcMain.handle の登録経路を変更しない  |
| P34     | 遅延初期化が必要な DI パターン         | PromptBuilder/ErrorMapper は Constructor Injection で注入する  |
| P54     | safeRegister パターン不適合            | withDocHandler は戻り値不要のため safeRegister 互換を維持する  |
| P9      | モジュールスコープ変数のテスト間リーク | 抽出したクラスがモジュールスコープ状態を持たないことを確認する |

## 次のPhase

- [Phase 9（品質検証）](./phase-9-quality-assurance.md) に進む
