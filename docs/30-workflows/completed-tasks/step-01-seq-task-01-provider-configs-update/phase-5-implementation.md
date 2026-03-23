# Phase 5: 実装（TDD: Green）— PROVIDER_CONFIGS モデル定義 + inferProviderId 更新

## メタ情報

| 項目       | 値                      |
| ---------- | ----------------------- |
| Phase番号  | 5                       |
| 機能名     | provider-configs-update |
| タスクID   | TASK-LLM-MOD-01         |
| 作成日     | 2026-03-23              |
| 依存 Phase | Phase 4（テスト作成）   |

## 目的

Phase 4 で追加した失敗テスト（T-01〜T-06）を全て通す実装を行う（TDD: Green フェーズ）。`apps/desktop/src/main/handlers/llm.ts` の `PROVIDER_CONFIGS` 型定義とデータ定義を変更する。`inferProviderId` は変更しない。

## 実行タスク

### Task 5-1: 対象ファイルの読み込み確認

実装前に `apps/desktop/src/main/handlers/llm.ts` の現行の内容を確認し、変更箇所を特定する：

- `PROVIDER_CONFIGS` の型定義（`description?: string` 追加位置。行番号は実行時に Read で確認すること）
- OpenAI モデル定義（差し替え位置。行番号は実行時に Read で確認すること）
- Anthropic モデル定義（差し替え位置。行番号は実行時に Read で確認すること）
- Google モデル定義（差し替え位置。行番号は実行時に Read で確認すること）
- xAI モデル定義（差し替え位置。行番号は実行時に Read で確認すること）
- OpenRouter モデル定義（変更しない）

### Task 5-2: 型定義の変更

`PROVIDER_CONFIGS` の型定義に `description?: string` を追加する。

変更箇所: `models` 配列要素の型定義部分（行番号は実行時に Read で確認すること）

```typescript
// 変更前
const PROVIDER_CONFIGS: Array<{
  id: LLMProviderId;
  name: string;
  models: Array<{
    id: string;
    name: string;
    contextWindow: number;
    isDefault: boolean;
  }>;
}> = [

// 変更後
const PROVIDER_CONFIGS: Array<{
  id: LLMProviderId;
  name: string;
  models: Array<{
    id: string;
    name: string;
    contextWindow: number;
    isDefault: boolean;
    description?: string;
  }>;
}> = [
```

### Task 5-3: OpenAI モデル定義の差し替え

Phase 2 Task 2-2 の「OpenAI（差し替え）」設計どおりに差し替える。
実装前に `apps/desktop/src/main/handlers/llm.ts` を Read で確認し、OpenAI エントリの正確な位置を特定すること。

### Task 5-4: Anthropic モデル定義の差し替え

Phase 2 Task 2-2 の「Anthropic（差し替え）」設計どおりに差し替える。
実装前に `apps/desktop/src/main/handlers/llm.ts` を Read で確認し、Anthropic エントリの正確な位置を特定すること。

### Task 5-5: Google モデル定義の差し替え

Phase 2 Task 2-2 の「Google（差し替え）」設計どおりに差し替える。
実装前に `apps/desktop/src/main/handlers/llm.ts` を Read で確認し、Google エントリの正確な位置を特定すること。

### Task 5-6: xAI モデル定義の差し替え

Phase 2 Task 2-2 の「xAI（差し替え）」設計どおりに差し替える。
実装前に `apps/desktop/src/main/handlers/llm.ts` を Read で確認し、xAI エントリの正確な位置を特定すること。

### Task 5-7: OpenRouter モデル定義（変更なし）

OpenRouter の `PROVIDER_CONFIGS` エントリは変更しない。既存のまま維持する。

### Task 5-8: `inferProviderId` 確認（変更なし）

`inferProviderId` 関数は変更しない。現行コードに `o3`/`o4` パターンが既に含まれているため、追加実装は不要（行番号は実行時に Read で確認すること）。

### Task 5-9: Green フェーズの確認

実装後に以下を実行し、Phase 4 で追加したテストが全て通ることを確認する：

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts
```

期待する結果:

- `PROVIDER_CONFIGS - モデル定義更新検証` の全テスト（T-01〜T-06）: PASS
- `inferProviderId - 新パターン検証`（T-07〜T-08）: PASS
- 既存テスト全て: PASS

### Task 5-10: TypeScript コンパイル確認

```bash
cd apps/desktop && pnpm typecheck
```

期待する結果: エラー 0 件

## 参照資料

| 資料名           | パス                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Phase 2 設計     | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/phase-2-design.md`        |
| Phase 4 テスト   | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/phase-4-test-creation.md` |
| 実装対象ファイル | `apps/desktop/src/main/handlers/llm.ts`                                                  |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                                       |

## 成果物

| 成果物               | パス                                    | 形式       |
| -------------------- | --------------------------------------- | ---------- |
| 更新済み実装ファイル | `apps/desktop/src/main/handlers/llm.ts` | TypeScript |

## 完了条件

- [ ] 実装前に `apps/desktop/src/main/handlers/llm.ts` を Read で確認した
- [ ] `PROVIDER_CONFIGS` 型定義に `description?: string` を追加した
- [ ] OpenAI モデル定義を6モデルに差し替えた（`gpt-5.4`, `gpt-5.4-mini`, `gpt-5.4-nano`, `gpt-5.4-pro`, `o3`, `o4-mini`）
- [ ] Anthropic モデル定義を3モデルに差し替えた（`claude-haiku-4-5`, `claude-sonnet-4-6`, `claude-opus-4-6`）
- [ ] Google モデル定義を3モデルに差し替えた（`gemini-3.1-flash-lite-preview`, `gemini-3-flash-preview`, `gemini-3.1-pro-preview`）
- [ ] xAI モデル定義を3モデルに差し替えた（`grok-3-mini`, `grok-4-1-fast-non-reasoning`, `grok-4-1-fast-reasoning`）
- [ ] OpenRouter モデル定義が変更されていない
- [ ] `inferProviderId` が変更されていない
- [ ] Phase 4 追加テスト（T-01〜T-06）が全て PASS した
- [ ] `pnpm typecheck` がエラー 0 件で完了した

## 統合テスト連携

Phase 5 で実装完了後、`handleGetProviders()` の全プロバイダーを対象にした統合確認を実施する。テスト実行コマンド:

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts --reporter=verbose
```

## 多角的チェック観点

| 観点                 | 確認内容                                                              |
| -------------------- | --------------------------------------------------------------------- |
| DRY 原則             | Task 5-3〜5-6 は Phase 2 設計書を正本とし、コードの重複記載を排除した |
| 行番号非依存         | 固定行番号ではなく実行時の Read で位置を特定する指示になっていること  |
| OpenRouter 不変      | OpenRouter モデル定義が変更対象外であることが明示されていること       |
| inferProviderId 不変 | `inferProviderId` が変更対象外であることが明示されていること          |
| TypeCheck            | `pnpm typecheck` エラー 0 件であること                                |

## サブタスク管理

| サブタスク | 状態   | 担当   |
| ---------- | ------ | ------ |
| Task 5-1   | 未着手 | メイン |
| Task 5-2   | 未着手 | メイン |
| Task 5-3   | 未着手 | メイン |
| Task 5-4   | 未着手 | メイン |
| Task 5-5   | 未着手 | メイン |
| Task 5-6   | 未着手 | メイン |
| Task 5-7   | 未着手 | メイン |
| Task 5-8   | 未着手 | メイン |
| Task 5-9   | 未着手 | メイン |
| Task 5-10  | 未着手 | メイン |

## タスク 100% 実行確認

- [ ] 全 Task（5-1〜5-10）の完了条件を満たした
- [ ] 多角的チェック観点を全て確認した
- [ ] 成果物が全て生成された

## 次の Phase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）
