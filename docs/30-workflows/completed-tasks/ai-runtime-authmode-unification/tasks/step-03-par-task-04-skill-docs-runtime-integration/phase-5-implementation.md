# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 5                                  |
| Phase名    | 実装                               |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |
| 前提Phase  | Phase 4（テスト作成）              |
| 後続Phase  | Phase 6（テスト拡充）              |
| ステータス | completed                          |
| 作成日     | 2026-03-13                         |
| 更新日     | 2026-03-16                         |
| 機能名     | skill-docs-runtime-integration     |

## 目的

Phase 4 で定義した 23 テストケースを全て Green にするため、LLMDocQueryAdapter・queryFn DI 切り替え・IPC ハンドラの DocOperationResult 拡張・SkillDocsCapabilityResolver・Terminal Handoff 対応の実装を依存関係に基づく順序で行う。

## 実行タスク

### T-5-1: LLMDocQueryAdapter の実装

LLM プロバイダへの問い合わせを抽象化するアダプタを実装する。

- `query(prompt: string): Promise<DocOperationResult<string>>` を実装する
- `isAvailable(): Promise<boolean>` で API key の設定状態を判定する
- `getProviderName(): string` で現在のプロバイダ名を返す
- エラーハンドリングで 7 エラー種別を DocOperationResult にマッピングする
  - HTTP 408/ETIMEDOUT → code: 3001（timeout, retryable）
  - HTTP 429 → code: 3002（rate limit, retryable）
  - HTTP 5xx → code: 3003（server error, retryable）
  - API key 未設定 → code: 2001（non-retryable）
  - API key 無効 401/403 → code: 2002（non-retryable）
  - IPC 通信失敗 → code: 4001（retryable）
  - その他 → code: 5001（internal, non-retryable）

### T-5-2: SkillDocGenerator の queryFn 差し替え

既存の stub queryFn を LLMDocQueryAdapter に差し替える DI メカニズムを実装する。

- コンストラクタに `queryFn?: (prompt: string) => Promise<DocOperationResult<string>>` オプションを追加する
- デフォルト値として既存 stub を維持する（UT-9I-001 との互換性）
- `adapter.query.bind(adapter)` で adapter の query メソッドを queryFn として注入可能にする
- adapter 注入時に `await adapter.isAvailable()` を事前チェックし、false なら code: 2001 エラーを返す

### T-5-3: registerSkillDocsHandlers の capability チェック追加

IPC ハンドラ登録時に SkillDocsCapabilityResolver による capability 判定を追加する。

- `SkillDocsCapabilityResolver` クラスを新規作成する
- `resolve(): Promise<{ capability: "integrated-api" | "guidance-only" | "terminal-handoff"; provider?: string; guidance?: string; reason?: string }>` を実装する
- 判定ロジック:
  1. API key 未設定 → `guidance-only`（設定手順の guidance を含む）
  2. API key 設定済み + 利用可能 → `integrated-api`（プロバイダ名を含む）
  3. terminal-handoff は失敗後フォールバックとして別途返却する
- `skill:docs:generate` ハンドラで capability チェックを先行実行する
- Pattern 3 登録: `registerSkillDocsHandlers(mainWindow, skillDocGenerator)` に resolver を追加する

### T-5-4: DocOperationResult エラー拡張

既存の DocOperationResult 型に guidance フィールドとエラーカテゴリを追加する。

- `error` オブジェクトに `guidance?: string` フィールドを追加する
- `error` オブジェクトに `category: "validation" | "business" | "external" | "infrastructure" | "internal"` を追加する
- 7 エラー種別それぞれに適切な guidance テキストを定義する
  - 2001: 「設定画面から API key を設定してください」
  - 2002: 「API key が無効です。再設定してください」
  - 3001: 「タイムアウトしました。しばらく待ってから再試行してください」
  - 3002: 「レート制限に達しました。{retryAfter}秒後に再試行してください」
  - 3003: 「サーバーエラーが発生しました。しばらく待ってから再試行してください」
  - 4001: 「通信エラーが発生しました。再試行してください」
  - 5001: 「内部エラーが発生しました。問題が続く場合はアプリを再起動してください」

### T-5-5: Terminal Handoff 対応の実装

capability が `guidance-only` の場合に Renderer へ guidance レスポンスを返す仕組みを実装する。

- `skill:docs:generate` ハンドラで capability === "guidance-only" の場合、DocOperationResult に guidance を格納して返す
- Renderer 側の UI 状態を `guidance-only` に遷移させるレスポンス形式を定義する
- 4層セキュリティ（sender 検証 / P42 3段バリデーション / 入力制約検証 / エラー境界）を全ハンドラに適用する

## 変更対象ファイル一覧

| #   | ファイルパス                                                          | 変更内容                                  | 新規/変更 |
| --- | --------------------------------------------------------------------- | ----------------------------------------- | --------- |
| 1   | `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts`          | Adapter クラス実装                        | 新規      |
| 2   | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`           | queryFn DI メカニズム追加                 | 変更      |
| 3   | `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts` | CapabilityResolver 実装                   | 新規      |
| 4   | `apps/desktop/src/main/ipc/handlers/skill-docs.ts`                    | DocOperationResult 拡張 + capability 判定 | 変更      |
| 5   | `apps/desktop/src/main/ipc/index.ts`                                  | registerSkillDocsHandlers の引数拡張      | 変更      |
| 6   | `packages/shared/src/skill/types.ts` (または相当ファイル)             | DocOperationResult 型に guidance 追加     | 変更      |

## 実装順序（依存関係グラフ）

```
T-5-4 (DocOperationResult 型拡張)
  |
  +---> T-5-1 (LLMDocQueryAdapter)
  |       |
  |       +---> T-5-2 (queryFn 差し替え)
  |
  +---> T-5-3 (CapabilityResolver + IPC ハンドラ)
          |
          +---> T-5-5 (Terminal Handoff)
```

1. **T-5-4** を最初に実装する（型定義が他タスクの前提）
2. **T-5-1** を実装する（T-5-4 の型に依存）
3. **T-5-2** と **T-5-3** を並列実装可能（T-5-1 完了後）
4. **T-5-5** を最後に実装する（T-5-3 の capability 判定に依存）

## 参照資料

### Phase 依存

| 参照資料              | パス                       | 内容                             |
| --------------------- | -------------------------- | -------------------------------- |
| Phase 4（テスト作成） | `phase-4-test-creation.md` | 23 テストケースの Red 状態を確認 |

### ソースコード

| 参照資料          | パス                                                                                                              | 内容                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| SkillDocGenerator | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                       | docs 生成本体を確認する               |
| ipc index         | `apps/desktop/src/main/ipc/index.ts`                                                                              | queryFn DI の current path を確認する |
| task UT-9I-001    | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | 既存 stub 排除タスクを確認する        |
| task UT-9I-002    | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-002-template-crud.md`            | テンプレート CRUD タスクを確認する    |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                   | パス                                                                                                              | 内容                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-details.md`                                      | Skill Docs IPC 正本                            |
| architecture-overview      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                      | registerSkillDocsHandlers の構成正本           |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | Skill Docs 関連未タスクと public contract 正本 |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`                             | sender、path validation、error envelope の正本 |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                              | TASK-9I の完了履歴と未タスク正本               |

## 実行手順

### ステップ1: Phase 4 テストの Red 状態確認

Phase 4 で作成した 23 テストケースが全て失敗（Red）であることを確認する。`cd apps/desktop && pnpm vitest run` で Red 状態を記録する。

### ステップ2: 依存順序に従い実装を進める

T-5-4 → T-5-1 → T-5-2/T-5-3（並列可） → T-5-5 の順で実装する。各タスク完了時にテストを実行し、該当テストケースが Green に遷移することを確認する。

### ステップ3: system spec との整合確認

security-electron-ipc-advanced.md の 4層セキュリティ要件（sender 検証 / P42 3段バリデーション / 入力制約検証 / エラー境界）が全 IPC ハンドラに適用されていることを確認する。

### ステップ4: 全テスト Green + 成果物記録

23 テストケースが全て Green であることを確認し、変更対象ファイルの差分を成果物として記録する。

## 統合テスト連携

- T-5-2 完了時: queryFn DI テスト（T-4-2-01 〜 T-4-2-04）が Green になることを確認
- T-5-3 完了時: CapabilityResolver テスト（T-4-4-01 〜 T-4-4-03）が Green になることを確認
- T-5-5 完了時: IPC ハンドラテスト（T-4-3-01 〜 T-4-3-10）が全て Green になることを確認
- Phase 4 の全 23 テストが Green → Phase 6 へ進む

## 成果物

| 成果物                    | パス                                                                  | 内容                                      |
| ------------------------- | --------------------------------------------------------------------- | ----------------------------------------- |
| LLMDocQueryAdapter        | `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts`          | Adapter 実装                              |
| SkillDocGenerator（変更） | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`           | queryFn DI メカニズム追加                 |
| CapabilityResolver        | `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts` | 3 パス判定の実装                          |
| IPC ハンドラ（変更）      | `apps/desktop/src/main/ipc/handlers/skill-docs.ts`                    | DocOperationResult 拡張 + capability 判定 |
| 型定義（変更）            | `packages/shared/src/skill/types.ts`                                  | guidance フィールド追加                   |
| 実装計画                  | `outputs/phase-5/implementation-plan.md`                              | 実装順序と変更対象を整理する              |

## 完了条件

- [ ] 実装順序が依存関係に基づいて定義され、その通りに実装されている
- [ ] Phase 4 の 23 テストケースが全て Green になっている
- [ ] 7 エラー種別が DocOperationResult にマッピングされている
- [ ] 3 capability パス（full / guidance-only / degraded）が CapabilityResolver に実装されている
- [ ] 4層セキュリティ（sender 検証 / P42 3段バリデーション / 入力制約検証 / エラー境界）が全 IPC ハンドラに適用されている
- [ ] 変更対象 6 ファイルが全て更新されている

## 既知の落とし穴

| Pitfall | 内容                                            | 対策                                           |
| ------- | ----------------------------------------------- | ---------------------------------------------- |
| P5      | リスナー二重登録                                | unregister → register パターンを適用する       |
| P21     | DI 追加時のテストモック大規模修正               | 影響範囲を事前に grep で調査する               |
| P23     | API 二重定義の型管理                            | 型定義ファイルを同時に更新する                 |
| P32     | 型定義の二箇所同時更新必須                      | shared と preload の型を同一コミットで更新する |
| P34     | 遅延初期化が必要な依存オブジェクトの DI         | Setter Injection パターンを検討する            |
| P42     | 文字列引数の .trim() バリデーション漏れ         | 全 IPC ハンドラで 3段バリデーションを適用する  |
| P44     | IPC ハンドラと Preload のインターフェース不整合 | ハンドラ・Preload API・テストの 3箇所同時更新  |

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
