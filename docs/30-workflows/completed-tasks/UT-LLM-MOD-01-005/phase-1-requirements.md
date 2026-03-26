# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| Phase      | 1                                                                        |
| Phase名    | 要件定義                                                                 |
| 前提Phase  | -                                                                        |
| 後続Phase  | Phase 2                                                                  |
| ステータス | 完了                                                                     |
| 作成日     | 2026-03-25                                                               |
| 機能名     | UT-LLM-MOD-01-005                                                        |
| タスクID   | UT-LLM-MOD-01-005                                                        |
| Issue      | [#1524](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1524) |

---

## 目的

`PROVIDER_CONFIGS`、`inferProviderId`、`LLMProviderIdSchema` の三重管理を解消し、`PROVIDER_CONFIGS` を Single Source of Truth（SSoT）として確立する。新プロバイダー追加時の変更箇所を1箇所に集約する。

## 背景

現在、LLMプロバイダー情報が以下の3箇所で独立して管理されている:

| #   | ソース                | ファイル                                            | 行      | 役割                                           |
| --- | --------------------- | --------------------------------------------------- | ------- | ---------------------------------------------- |
| 1   | `PROVIDER_CONFIGS`    | `apps/desktop/src/main/handlers/llm.ts`             | 34-208  | プロバイダーID・名前・モデル一覧の静的定義     |
| 2   | `inferProviderId`     | `apps/desktop/src/main/handlers/llm.ts`             | 519-532 | モデルIDからプロバイダーIDを推定（手動prefix） |
| 3   | `LLMProviderIdSchema` | `packages/shared/src/types/llm/schemas/provider.ts` | 13-19   | プロバイダーIDのZod enum（手動列挙）           |

**問題点**: 新プロバイダー（例: Mistral）追加時に3箇所を同時更新する必要があり、同期漏れが発生するリスクがある。実際に `o5` シリーズが追加された場合、`inferProviderId` の prefix ルール更新漏れが起きうる。

---

## 実行タスク

1. 三重管理が発生している実装箇所を洗い出し、課題を明文化する。
2. SSoT 化で満たすべき機能要件・非機能要件・受け入れ基準を定義する。
3. 影響ファイル、スコープ、依存タスク、リスクを整理する。
4. Phase 2 以降で検証すべき統合テスト連携を確定する。

## P50チェック: 既実装状態の調査

```bash
# 対象ファイルの最近のコミット履歴
git log --oneline -10 -- apps/desktop/src/main/handlers/llm.ts
git log --oneline -10 -- packages/shared/src/types/llm/schemas/provider.ts

# 三重管理の現状確認
grep -n "PROVIDER_CONFIGS" apps/desktop/src/main/handlers/llm.ts
grep -n "inferProviderId" apps/desktop/src/main/handlers/llm.ts
grep -n "LLMProviderIdSchema" packages/shared/src/types/llm/schemas/provider.ts
```

### 現状分析

| ソース                | 管理内容                                                         | 依存関係                        |
| --------------------- | ---------------------------------------------------------------- | ------------------------------- |
| `PROVIDER_CONFIGS`    | 5プロバイダー × 各モデル詳細                                     | `LLMProviderId` 型を import     |
| `inferProviderId`     | 5つの手動 prefix ルール + OpenRouter "/" 検出                    | 独立（PROVIDER_CONFIGS 非参照） |
| `LLMProviderIdSchema` | `z.enum(["openai", "anthropic", "google", "xai", "openrouter"])` | 独立                            |

---

## 機能要件

### FR-001: PROVIDER_CONFIGS を SSoT として確立

- `PROVIDER_CONFIGS` に `modelPrefixes` フィールドを追加し、各プロバイダーのモデルID prefix ルールを保持する
- 新プロバイダー追加時に `PROVIDER_CONFIGS` への1エントリ追加のみで済む構造にする

### FR-002: LLMProviderIdSchema の自動導出

- `LLMProviderIdSchema` を `PROVIDER_CONFIGS` のプロバイダーIDから自動生成する
- Zod `z.enum()` の型安全性を維持する

### FR-003: inferProviderId の自動導出

- `inferProviderId` を `PROVIDER_CONFIGS.modelPrefixes` から自動導出する
- OpenRouter の特殊ルール（`modelId.includes("/")` ）もレジストリに統合する

### FR-004: 既存テスト互換性

- 既存の `LLMProviderIdSchema` テスト（`provider.test.ts`）が全てPASSすること
- 既存の `llm.test.ts` が全てPASSすること

### FR-005: LLMAdapterFactory.ts の SUPPORTED_PROVIDER_IDS 連動

- `LLMAdapterFactory.ts` の `SUPPORTED_PROVIDER_IDS` が `PROVIDER_CONFIGS` から導出可能な構造にする、または `PROVIDER_IDS` を直接 import する

---

## 非機能要件

### NFR-001: 型安全性

- `LLMProviderId` 型が TypeScript のリテラル型ユニオンとして維持されること
- `as unknown as` のような unsafe cast を最小限にすること

### NFR-002: パッケージ境界

- `packages/shared/` と `apps/desktop/` のモノレポ依存方向を維持すること（shared → desktop の import 禁止）

### NFR-003: ランタイム影響

- 起動時の処理負荷増加がないこと（静的定義のため問題なし）

---

## 受け入れ基準

| AC-ID  | 基準                                                                       | 検証方法                    |
| ------ | -------------------------------------------------------------------------- | --------------------------- |
| AC-001 | `PROVIDER_CONFIGS` が唯一のプロバイダー/モデル情報源である                 | コードレビュー + grep 検証  |
| AC-002 | `inferProviderId` が `PROVIDER_CONFIGS` から自動導出されている             | ユニットテスト              |
| AC-003 | `LLMProviderIdSchema` が `PROVIDER_CONFIGS` のキーから自動生成されている   | ユニットテスト + 型チェック |
| AC-004 | 新プロバイダー追加時に `PROVIDER_CONFIGS` のみの変更で済むことをテスト検証 | SSoT検証テスト              |
| AC-005 | 既存テスト全PASS                                                           | `pnpm test`                 |
| AC-006 | 型チェック全PASS                                                           | `pnpm typecheck`            |

---

## 対象ファイル

### 変更対象

| ファイル                                            | 変更内容                                                                                 |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `packages/shared/src/types/llm/schemas/provider.ts` | `LLMProviderIdSchema` を PROVIDER_CONFIGS から自動導出に変更                             |
| `apps/desktop/src/main/handlers/llm.ts`             | `inferProviderId` を PROVIDER_CONFIGS から自動導出、PROVIDER_CONFIGS にmodelPrefixes追加 |

### 新規作成候補

| ファイル                                                     | 内容                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------- |
| `packages/shared/src/types/llm/schemas/provider-registry.ts` | PROVIDER_CONFIGS 定義 + modelPrefixes + inferProviderId |

### 影響を受けるファイル（import元、変更不要の見込み）

| ファイル                                                  | 影響                                                                                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/llm/schemas/health.ts`         | `LLMProviderIdSchema` import（パス不変なら影響なし）                                                                             |
| `packages/shared/src/types/llm/schemas/ipc.ts`            | 同上                                                                                                                             |
| `packages/shared/src/types/llm/schemas/request.ts`        | 同上                                                                                                                             |
| `packages/shared/src/types/llm/schemas/response.ts`       | 同上                                                                                                                             |
| `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` | `LLMProviderId` 型 import + `SUPPORTED_PROVIDER_IDS: LLMProviderId[]` 手動列挙あり（SSoT化後に `PROVIDER_IDS` からの導出を検討） |
| `apps/desktop/src/main/services/secureStorage.ts`         | 同上                                                                                                                             |
| `apps/desktop/src/renderer/store/slices/chatSlice.ts`     | 同上                                                                                                                             |

---

## スコープ

### 含むもの

- `PROVIDER_CONFIGS` への `modelPrefixes` フィールド追加
- `LLMProviderIdSchema` の自動導出ロジック実装
- `inferProviderId` の自動導出ロジック実装
- SSoT を検証するユニットテスト
- 既存テストの互換性維持

### 含まないもの

- 新プロバイダーの実際の追加（テストでシミュレーションのみ）
- Renderer側の変更（型 export パスが不変のため）
- `PROVIDER_CONFIGS` の `packages/shared/` への移動（必要性を Phase 2 で検討）
- UI変更

---

## 依存タスク

| タスクID          | 関係             | 内容                                                  |
| ----------------- | ---------------- | ----------------------------------------------------- |
| UT-LLM-MOD-01-001 | 関連（依存なし） | 保存済みユーザー設定の移行戦略                        |
| UT-LLM-MOD-01-004 | 関連（依存なし） | ProviderModelCache のリアルタイムモデル情報キャッシュ |

---

## リスク

| リスク                  | 影響度 | 発生確率 | 対策                                                                      |
| ----------------------- | ------ | -------- | ------------------------------------------------------------------------- |
| cross-package 循環依存  | 高     | 中       | `packages/shared/` に SSoT を配置し、`apps/desktop/` が参照する方向を維持 |
| `z.enum()` の型推論問題 | 中     | 中       | `as const` + tuple 型アサーションで解決。Phase 4 でテスト作成             |
| 既存テストの破壊        | 高     | 低       | export パスを維持し、Phase 5 で段階的移行                                 |

---

## 統合テスト連携

接続要件として以下を確認:

| 接続ポイント                 | 確認内容                                                        |
| ---------------------------- | --------------------------------------------------------------- |
| `LLMProviderIdSchema` import | `packages/shared/src/types/llm/schemas/index.ts` から re-export |
| `LLMProviderId` type         | 全 import 元で型が変わらないこと                                |
| `inferProviderId`            | `llm.ts` 内での呼び出し箇所が正常動作すること                   |

---

## 参照資料

| 参照資料           | パス                                                                     | 内容             |
| ------------------ | ------------------------------------------------------------------------ | ---------------- |
| Issue #1524        | GitHub                                                                   | タスク定義       |
| 未完了タスク指示書 | `docs/30-workflows/completed-tasks/unassigned-task/UT-LLM-MOD-01-005.md` | 元の指示書       |
| LLM Handlers       | `apps/desktop/src/main/handlers/llm.ts`                                  | 対象ソースコード |
| Provider Schema    | `packages/shared/src/types/llm/schemas/provider.ts`                      | 対象Zodスキーマ  |
| Provider Tests     | `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts`       | 既存テスト       |
| LLM Handler Tests  | `apps/desktop/src/main/handlers/__tests__/llm.test.ts`                   | 既存テスト       |

---

## 成果物

| 成果物     | パス                              | 内容           |
| ---------- | --------------------------------- | -------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | 本ドキュメント |

---

## 完了条件

- [ ] 問題の3箇所が特定・文書化されている
- [ ] 機能要件 FR-001〜FR-004 が定義されている
- [ ] 非機能要件 NFR-001〜NFR-003 が定義されている
- [ ] 受け入れ基準 AC-001〜AC-006 が検証可能な形で定義されている
- [ ] 対象ファイル・影響ファイルが一覧化されている
- [ ] スコープが明確に定義されている
- [ ] リスクと対策が記載されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005 --phase 1
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

## Phase 1 実行記録

### 実行タスク

| タスク | 結果 | 備考 |
| ------ | ---- | ---- |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

- （記入欄）

---

## 次のPhase

Phase 2: 設計

`docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/phase-2-*.md`
