# Phase 5: 実装

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 5                             |
| タスクID | UT-EXECUTION-ENV-TERMINAL-001 |
| 機能名   | execution-env-terminal        |
| 作成日   | 2026-03-23                    |

## 目的

Phase 4 のテストを Green にするための本実装を行う。TDD の Green フェーズ。

## 実行タスク

### Task 1: assertNoSilentFallback ガード実装

**対象ファイル**: `apps/desktop/src/main/ipc/llmConfigProvider.ts`

#### 実装内容

1. `LLMConfigNotSelectedError` カスタムエラークラスを追加
2. `assertNoSilentFallback()` 関数を追加
3. 既存の `getSelectedLLMConfig`, `setSelectedLLMConfig`, `resetLLMConfig` は変更なし

#### 実装コード

```typescript
/**
 * P62 対策: LLM Provider/Model 未選択時のカスタムエラー
 */
export class LLMConfigNotSelectedError extends Error {
  readonly code = "LLM_CONFIG_NOT_SELECTED" as const;

  constructor(message: string) {
    super(message);
    this.name = "LLMConfigNotSelectedError";
  }
}

/**
 * P62 対策: Provider/Model 未選択時に DEFAULT_CONFIG への暗黙 fallback を防止する。
 * LLM 呼び出し前の全エントリポイントで呼び出すこと。
 *
 * @throws {LLMConfigNotSelectedError} Provider/Model が未選択の場合
 * @returns 選択済みの LLM 設定（non-null 保証）
 */
export function assertNoSilentFallback(): SelectedLLMConfig {
  const config = currentConfig;
  if (config === null) {
    throw new LLMConfigNotSelectedError(
      "LLM Provider/Model が選択されていません。設定画面で選択してください。",
    );
  }
  return config;
}
```

### Task 2: ExecutionEnvironment.terminal 本実装

**対象ファイル**: `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx`

#### 実装内容

1. `ExecutionEnvironmentProps` に `handoffGuidance` props を追加
2. `case "terminal"` を placeholder から本実装に変更
3. `TerminalHandoffCard` コンポーネントを import

#### 実装手順

1. `import { TerminalHandoffCard } from "../TerminalHandoffCard"` を追加
2. `import type { HandoffGuidance } from "@repo/shared/types/handoff"` を追加
3. Props interface に `handoffGuidance?: HandoffGuidance | null` を追加
4. `case "terminal"` の分岐を以下に変更:

```typescript
case "terminal":
  if (!handoffGuidance) {
    return (
      <Placeholder
        iconPath={PLACEHOLDER_CONFIG.terminal.iconPath}
        title="ターミナル環境"
        subtitle="実行コンテキストを待機中..."
        testId="terminal-waiting"
      />
    );
  }
  return (
    <TerminalHandoffCard
      guidance={handoffGuidance}
      testId="terminal-handoff-card"
    />
  );
```

### Task 3: テスト実行確認

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/assertNoSilentFallback.test.ts
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/ExecutionEnvironment/__tests__/terminal.test.tsx
```

全テストが Green（PASS）になることを確認する。

## 参照資料

| 資料名         | パス                                                                | 説明                 |
| -------------- | ------------------------------------------------------------------- | -------------------- |
| Phase 2 設計   | `docs/30-workflows/execution-env-terminal/phase-2-design.md`        | インターフェース設計 |
| Phase 4 テスト | `docs/30-workflows/execution-env-terminal/phase-4-test-creation.md` | テストケース         |

## 統合テスト連携

- Phase 4 で作成した全テストが PASS すること
- 既存テスト（ExecutionEnvironment の html/markdown ケース）が引き続き PASS すること

## 成果物

| 成果物                    | パス                                                                            | 説明                              |
| ------------------------- | ------------------------------------------------------------------------------- | --------------------------------- |
| llmConfigProvider.ts 更新 | `apps/desktop/src/main/ipc/llmConfigProvider.ts`                                | assertNoSilentFallback + エラー型 |
| ExecutionEnvironment 更新 | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx` | terminal 本実装                   |

## 完了条件

- [ ] `LLMConfigNotSelectedError` クラスが実装されている
- [ ] `assertNoSilentFallback()` 関数が実装されている
- [ ] `ExecutionEnvironment` の terminal case が TerminalHandoffCard を表示する
- [ ] handoffGuidance が null の場合に待機中 Placeholder を表示する
- [ ] Phase 4 の全テスト（T-1〜T-12）が PASS する
- [ ] 既存テストが全て PASS する（回帰なし）
- [ ] `pnpm typecheck` が PASS する
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 6: テスト拡充
