# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 2                                  |
| Phase名    | 設計                               |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |
| 前提Phase  | Phase 1（要件定義）                |
| 後続Phase  | Phase 3（設計レビュー）            |
| ステータス | completed                          |
| 作成日     | 2026-03-13                         |
| 更新日     | 2026-03-16                         |
| 機能名     | skill-docs-runtime-integration     |

## 目的

Skill Docs を Task01 の共通 runtime 契約に接続する設計を確定する。queryFn の差し替え設計、失敗ポリシー、IPC エラー正規化、UI 状態遷移を定義する。

## 設計方針

| 方針               | 内容                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| Runtime 契約の統一 | queryFn 実装は docs 生成専用でも runtime 契約は Task01 に合わせる      |
| Stub 排除          | production 経路では stub を許容しない                                  |
| Main Process 完結  | Renderer 依存を増やさず Main Process だけで解決する                    |
| 既存契約の保全     | 4 チャンネル IPC + 4 層セキュリティを維持する                          |
| Access Matrix 消費 | 各 surface 独自の mode 判定を持たず Task01 の access matrix を消費する |

## 実行タスク

### T-2-1: queryFn Provider Adapter 設計

stubQueryFn を production LLM クライアントに差し替える adapter を設計する。

- LLMDocQueryAdapter インターフェースを定義する
  ```typescript
  interface LLMDocQueryAdapter {
    query(prompt: string): Promise<{ content: string }>;
    isAvailable(): Promise<boolean>;
    getProviderName(): string;
  }
  ```
- Provider Adapter の責務境界を定義する
  - API key 検証: AuthKeyService から取得し、未設定時は `await isAvailable()` が false を返す
  - LLM クライアント初期化: provider 固有の SDK 初期化
  - queryFn 注入: `SkillDocGenerator` の constructor に adapter.query を渡す
- SkillDocGenerator の DI 拡張方針を定義する
  - 既存: `constructor(queryFn: LLMQueryFn)` のまま維持
  - 変更: IPC 初期化時に adapter.query を bind して注入
  - `await adapter.isAvailable()` が false の場合は guidance mode で初期化

### T-2-2: 失敗ポリシー設計

timeout、retry、rate limit、guidance、terminal handoff messaging の方針を定義する。

- タイムアウトポリシー
  - 既存の 30 秒 Promise.race を維持する
  - timeout 発生時のレスポンス形式を定義する
    ```typescript
    { success: false, error: { code: 3001, category: 'EXTERNAL_SERVICE', message: string, retryable: true } }
    ```
- リトライポリシー
  - retryable エラー（3000-3999, 4000-4999）に限り最大 2 回再試行
  - exponential backoff: 1秒 → 2秒
  - 429 応答時は Retry-After ヘッダ値を優先
- 失敗ポリシーの分類表

  | エラー種別           | コード | retryable | UI 表示                         | CTA               |
  | -------------------- | ------ | --------- | ------------------------------- | ----------------- |
  | API key 未設定       | 2001   | false     | guidance block                  | Settings へ遷移   |
  | API key 無効         | 2002   | false     | guidance block                  | Settings へ遷移   |
  | LLM timeout          | 3001   | true      | timeout block + retry + handoff | 再試行 / terminal |
  | LLM rate limit (429) | 3002   | true      | rate limit block + wait time    | 待機後自動再試行  |
  | LLM server error     | 3003   | true      | error block + retry             | 再試行            |
  | IPC 通信エラー       | 4001   | true      | error block                     | 再試行            |
  | 内部エラー           | 5001   | false     | error block                     | guidance block    |

### T-2-3: IPC エラー正規化設計

IPC エラーレスポンスを統一し、public contract の境界を定義する。

- 現状の `{ success, error }` 形式を拡張する
  ```typescript
  interface DocOperationResult<T> {
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
      guidance?: {
        reason: string;
        action: string;
        handoffAvailable: boolean;
      };
    };
  }
  ```
- エラーサニタイゼーションを維持する
  - 内部エラーの詳細は "Internal error" へ正規化（4 層検証の Layer 4）
  - パス情報、API key 値、スタックトレースを Renderer に送らない

### T-2-4: Capability Resolver 統合設計

Task01 の Access Matrix を Skill Docs に統合する設計を定義する。

- SkillDocsCapabilityResolver を定義する
  - 入力: access matrix の capability 状態
  - 出力: `'integrated-api' | 'guidance-only' | 'terminal-handoff'`
  - 判定ロジック:
    1. API key 有効 + LLM 到達可能 → `integrated-api`
    2. API key 未設定 → `guidance-only`
    3. API key 有効 + LLM 到達不可 → `terminal-handoff`
- IPC ハンドラでの capability チェック
  - `skill:docs:generate` 実行前に capability を判定
  - `guidance-only` の場合は生成せず guidance レスポンスを即時返却

### T-2-5: UI 状態遷移設計

docs generation の画面状態と CTA を定義する。

- 状態遷移図

  ```
  [ready] ---(generate click)---> [generating]
  [generating] ---(success)---> [result]
  [generating] ---(timeout)---> [timeout-guidance]
  [generating] ---(rate limit)---> [rate-limit-wait]
  [generating] ---(error)---> [error-guidance]
  [guidance-only] (API key 未設定で初期表示)
  ```

- 各状態の UI 構成

  | 状態             | 表示内容                        | Primary CTA    | Secondary CTA     |
  | ---------------- | ------------------------------- | -------------- | ----------------- |
  | ready            | 生成可能、実行経路表示          | `docs を生成`  | -                 |
  | generating       | 進捗インジケータ、中断手段      | `キャンセル`   | -                 |
  | result           | 生成結果サマリー                | `エクスポート` | `プレビュー`      |
  | timeout-guidance | 失敗理由 + 再試行 + handoff     | `再試行`       | `terminal で作成` |
  | rate-limit-wait  | 待機時間表示                    | `待機中...`    | `terminal で作成` |
  | error-guidance   | エラー詳細 + 次のアクション     | `再試行`       | `guidance を確認` |
  | guidance-only    | API key 未設定の説明 + 設定導線 | `Settings へ`  | `terminal で作成` |

- マイクロコピー方針
  - timeout では失敗理由と再試行か handoff かを同じブロックに示す（Task01 UI/UX 正本準拠）
  - guidance block では「なぜ使えないか」を一文で説明する

## Atent Team / SubAgent 分担

| 役割               | 主担当                                             |
| ------------------ | -------------------------------------------------- |
| Doc Runtime Agent  | T-2-1: queryFn と provider adapter を整理する      |
| Error Policy Agent | T-2-2, T-2-3: 失敗ポリシーと IPC エラーを整理する  |
| Spec Sync Agent    | T-2-4, T-2-5: capability resolver と UI を整理する |

## 参照資料

| 参照資料            | パス                                                                                                              | 内容                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Phase 1（要件定義） | `phase-1-requirements.md`                                                                                         | 依存する前提成果物を確認する                          |
| pack parent index   | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                                      | 実行順序、依存グラフ、共通方針の正本を確認する        |
| pack design audit   | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                                        | 多角的監査の結論、禁止事項、依存整合を確認する        |
| pack UI/UX 図解     | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                             | 5 図セットの画面構成、状態遷移、CTA 導線を確認する    |
| pack UI/UX 正本     | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                          | docs generation の ready / generating / guidance 状態 |
| SkillDocGenerator   | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                       | docs 生成本体を確認する                               |
| ipc index           | `apps/desktop/src/main/ipc/index.ts`                                                                              | queryFn DI の current path を確認する                 |
| task UT-9I-001      | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | 既存 stub 排除タスクを確認する                        |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                   | パス                                                                                                              | 内容                                             |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-details.md`                                      | Skill Docs IPC 正本（4 チャンネル契約）          |
| architecture-overview      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                      | registerSkillDocsHandlers の Pattern 3 構成      |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | DocGenerationRequest / GeneratedDoc 型定義正本   |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`                             | 4 層検証（sender / P42 / 入力制約 / エラー境界） |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                              | TASK-9I 完了履歴と UT-9I-001/002 未タスク正本    |

## 実行手順

### ステップ1: 参照資料を確認する

Phase 1 の成果物（requirements-definition.md, scope-definition.md）と Task01 の access matrix 設計を確認する。

### ステップ2: 実行タスクを T-2-1 から T-2-5 まで順に実施する

設計の 5 タスクを上から順に処理する。各タスクの出力を成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合する。特に:

- DocGenerationRequest の拡張が既存型と後方互換であること
- IPC レスポンス形式の拡張が既存 Preload API と互換であること
- エラーコード体系が 02-code-quality.md に準拠していること

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

以下の契約、state、IPC、security 境界を設計へ反映する:

- queryFn: LLMDocQueryAdapter → SkillDocGenerator の DI 注入経路
- provider adapter: isAvailable() → capability resolver → IPC ハンドラの判定連鎖
- timeout: Promise.race(30s) → DocOperationResult.error.retryable の伝播
- retry: exponential backoff → IPC レスポンスの retry 情報
- guidance: capability 判定 → guidance block → handoff card の表示連鎖

## UI/UX リアライズ

| 観点           | 内容                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| 画面構成       | docs generation sheet、result summary、guidance block の 3 領域で構成する                                  |
| Primary CTA    | `docs を生成`                                                                                              |
| Secondary CTA  | `再試行` `guidance を確認` `terminal で作成`                                                               |
| 状態           | `ready` `generating` `result` `timeout-guidance` `rate-limit-wait` `error-guidance` `guidance-only` を扱う |
| マイクロコピー | timeout では失敗理由だけでなく、再試行か handoff かを同じブロックに示す                                    |

## 成果物

| 成果物       | パス                                   | 内容                                                       |
| ------------ | -------------------------------------- | ---------------------------------------------------------- |
| 設計サマリー | `outputs/phase-2/design-summary.md`    | queryFn 差し替え、失敗ポリシー、capability resolver を整理 |
| 契約一覧     | `outputs/phase-2/contract-matrix.md`   | IPC、state、runtime 契約と型定義を一覧化する               |
| UI/UX 実体化 | `outputs/phase-2/ui-ux-realization.md` | docs generation sheet の状態遷移と CTA を整理する          |

## 完了条件

- [ ] LLMDocQueryAdapter インターフェースが定義されている
- [ ] queryFn の stub → production 差し替え設計が明文化されている
- [ ] 失敗ポリシーの分類表（7 エラー種別）が定義されている
- [ ] DocOperationResult のエラー拡張が既存契約と後方互換である
- [ ] SkillDocsCapabilityResolver の判定ロジック（3 path）が定義されている
- [ ] UI 状態遷移図（7 状態）と各状態の CTA が定義されている
- [ ] マイクロコピー方針が Task01 UI/UX 正本に準拠している
- [ ] Renderer 依存を増やさず Main Process で完結する設計になっている

## 既知の落とし穴（関連 Pitfall）

| Pitfall | 内容                           | 本 Phase での対策                                 |
| ------- | ------------------------------ | ------------------------------------------------- |
| P34     | 遅延初期化が必要な DI パターン | adapter は IPC 初期化時に Setter Injection で注入 |
| P44     | IPC インターフェース不整合     | ハンドラ引数と Preload API の整合を設計時に検証   |
| P45     | IPC 引数命名の契約ドリフト     | セマンティクスに一致する引数名を設計時に確定      |
| P54     | safeRegister パターン不適合    | 戻り値要否を設計時に判断し適切なパターンを選択    |

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
