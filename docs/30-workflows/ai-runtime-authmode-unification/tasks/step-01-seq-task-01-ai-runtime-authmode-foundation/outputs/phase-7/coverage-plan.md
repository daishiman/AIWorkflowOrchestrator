# Phase 7 カバレッジ計画

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| Phase      | 7                                            |
| 成果物種別 | カバレッジ計画                               |
| 作成日     | 2026-03-13                                   |
| 前提       | Phase 5 実装計画、Phase 6 回帰計画           |
| 後続       | Phase 8 リファクタリング                     |

---

## 1. カバレッジ目標

プロジェクト標準（02-code-quality.md）に基づく目標値:

| 指標              | 最低基準 | 推奨基準 | 本タスク目標 |
| ----------------- | -------- | -------- | ------------ |
| Line Coverage     | 80%      | 90%      | 80%          |
| Branch Coverage   | 60%      | 70%      | 60%          |
| Function Coverage | 80%      | 90%      | 80%          |

---

## 2. 対象ファイル x カバレッジ計画

### 2.1 新規ファイル（目標: Line 90%, Branch 70%, Function 90%）

新規ファイルはテストファースト（Phase 4）で設計済みのため、推奨基準を目標とする。

| ファイル                                                          | Line 目標 | Branch 目標 | Function 目標 | Phase 4 テスト                         | Phase 6 回帰テスト           |
| ----------------------------------------------------------------- | --------- | ----------- | ------------- | -------------------------------------- | ---------------------------- |
| `packages/shared/src/ai/types.ts`                                 | 100%      | N/A         | 100%          | 型定義のみ（テスト不要）               | -                            |
| `packages/shared/src/ai/credential-provider.ts`                   | 100%      | N/A         | 100%          | インターフェースのみ（テスト不要）     | -                            |
| `apps/desktop/src/main/services/ai/AIAccessCapabilityResolver.ts` | 90%       | 70%         | 90%           | 契約テスト（capability 判定 x 5 条件） | MR-01 ~ MR-06, ME-01 ~ ME-04 |
| `apps/desktop/src/main/services/ai/AIRuntimeResolver.ts`          | 90%       | 70%         | 90%           | 契約テスト（解決順 x 4 優先度）        | CI-05, CI-06                 |
| `apps/desktop/src/main/services/ai/CredentialProvider.ts`         | 90%       | 70%         | 90%           | 契約テスト（get/exists）+ 失敗系       | CI-01, CI-02                 |
| `apps/desktop/src/renderer/store/slices/aiAccessSlice.ts`         | 90%       | 70%         | 90%           | state 更新テスト                       | MR-04, TA-01, TA-02          |

### 2.2 変更ファイル（目標: Line 80%, Branch 60%, Function 80%）

既存ファイルは変更箇所のカバレッジを最低基準以上に維持する。

| ファイル                                                         | 変更内容                        | Line 目標 | Branch 目標 | Function 目標 | 追加テスト                            |
| ---------------------------------------------------------------- | ------------------------------- | --------- | ----------- | ------------- | ------------------------------------- |
| `apps/desktop/src/main/services/auth/AuthModeService.ts`         | `migrateToCapability()` 追加    | 80%       | 60%         | 80%           | migration 変換テーブル x 4 パターン   |
| `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`        | credential 取得経路変更         | 80%       | 60%         | 80%           | CI-01 ~ CI-06, CE-01 ~ CE-03          |
| `apps/desktop/src/main/ipc/aiHandlers.ts`                        | resolver.resolve() 統一         | 80%       | 60%         | 80%           | GD-01 ~ GD-04（fail-fast 経路）       |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`          | API key 直読み -> resolver 経由 | 80%       | 60%         | 80%           | resolver 経由の credential 取得テスト |
| `apps/desktop/src/main/services/agent/AgentExecutor.ts`          | runtime 取得 -> resolver 経由   | 80%       | 60%         | 80%           | resolver 経由の runtime 取得テスト    |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts`             | runtime 入口統一                | 80%       | 60%         | 80%           | resolver 経由の runtime 解決テスト    |
| `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`      | queryFn DI 統一                 | 80%       | 60%         | 80%           | resolver 経由の provider 接続テスト   |
| `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts` | capability ベース判定           | 80%       | 60%         | 80%           | GD-05, GD-06, GE-01 ~ GE-05           |
| `apps/desktop/src/renderer/store/index.ts`                       | aiAccessSlice 合成              | 80%       | 60%         | 80%           | slice 合成の初期化テスト              |
| `apps/desktop/src/main/ipc/channels.ts`                          | チャンネル定数追加              | 100%      | N/A         | 100%          | 定数定義のみ（テスト不要）            |

---

## 3. 不足箇所と対策

### 3.1 Branch Coverage 不足リスク

Branch Coverage（目標 60%）は以下の箇所で不足が予測される。

| ファイル                    | 不足予測箇所                           | 不足理由                                  | 対策                                              |
| --------------------------- | -------------------------------------- | ----------------------------------------- | ------------------------------------------------- |
| AIAccessCapabilityResolver  | surface 別 capability 判定の全組合せ   | surface x capability x 条件の組合せが多い | 主要 5 パターン + 境界ケース 4 パターンで網羅する |
| AIRuntimeResolver           | 解決順フォールバックの全分岐           | 4 段階の優先度 x 成功/失敗の組合せ        | 各優先度の成功/失敗を明示的にテストする           |
| LLMAdapterFactory           | cache hit/miss x 4 provider            | provider 別の分岐が多い                   | OpenAI + Anthropic を代表テストし、残りは型で保証 |
| skillExecutionAuthPreflight | capability 値 x CTA 活性状態の全組合せ | 4 capability 値 x 複数 CTA の組合せ       | capability 値ごとに CTA 状態を全数テストする      |

### 3.2 Function Coverage 不足リスク

Function Coverage（目標 80%）は以下の箇所で不足が予測される。

| ファイル           | 不足予測箇所                           | 不足理由                                              | 対策                                                     |
| ------------------ | -------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| CredentialProvider | `get()` のエラー分岐内関数             | SecureStorage の内部エラーパターンが多い              | mockSecureStorage で主要エラーパターンを再現する         |
| aiHandlers         | IPC ハンドラ内のインラインコールバック | P41 準拠: v8 プロバイダがインライン関数を独立カウント | validateIpcSender のコールバック戻り値を明示的に検証する |
| SkillExecutor      | resolver 注入前の fallback 関数        | Setter Injection で注入前に呼ばれる可能性             | 注入前の呼び出しテストを追加する                         |

### 3.3 Line Coverage 不足リスク

Line Coverage（目標 80%）は以下の箇所で不足が予測される。

| ファイル         | 不足予測箇所                          | 不足理由                               | 対策                                                 |
| ---------------- | ------------------------------------- | -------------------------------------- | ---------------------------------------------------- |
| AuthModeService  | legacy migration のエラーハンドリング | 正常系テストだけでは到達しない行がある | 不正 authMode 値、SecureStorage 障害のテストを追加   |
| chatEditHandlers | resolver 失敗時の error envelope 生成 | fail-fast 経路のテストが不足しがち     | `PROVIDER_UNKNOWN` / `CREDENTIAL_MISSING` テスト追加 |

---

## 4. カバレッジ測定・確認手順

### 4.1 測定コマンド

```bash
# 対象ファイルのカバレッジ測定
cd apps/desktop
pnpm vitest run --coverage \
  src/main/services/ai/ \
  src/main/services/auth/AuthModeService.ts \
  src/main/adapters/llm/LLMAdapterFactory.ts \
  src/main/ipc/aiHandlers.ts \
  src/main/services/skill/SkillExecutor.ts \
  src/main/services/agent/AgentExecutor.ts \
  src/main/handlers/chatEditHandlers.ts \
  src/main/services/skill/SkillDocGenerator.ts \
  src/renderer/utils/skillExecutionAuthPreflight.ts \
  src/renderer/store/slices/aiAccessSlice.ts
```

### 4.2 判定基準

| 判定     | 条件                                    | 次の Phase         |
| -------- | --------------------------------------- | ------------------ |
| PASS     | 全ファイルが目標値を達成                | Phase 8 へ進む     |
| 要追加   | 1 ファイル以上で目標値未達              | Phase 6 へ戻る     |
| 測定不能 | テスト実行エラー / カバレッジツール障害 | 原因調査後に再測定 |

### 4.3 注意事項（既知の落とし穴）

| 落とし穴 | 対象                   | 対策                                                                     |
| -------- | ---------------------- | ------------------------------------------------------------------------ |
| P41      | aiHandlers 等の IPC    | インラインコールバックを独立関数としてカウントするため、明示的に呼び出す |
| P39      | Renderer テスト        | happy-dom 環境では `fireEvent` を使用（`userEvent` 禁止）                |
| P40      | テスト実行ディレクトリ | `cd apps/desktop` から実行する（プロジェクトルートから実行しない）       |
| P48      | 派生セレクタ           | `useShallow` 適用の有無を確認する                                        |
