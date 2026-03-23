# Phase 4: テスト作成

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 4                             |
| タスクID | UT-EXECUTION-ENV-TERMINAL-001 |
| 機能名   | execution-env-terminal        |
| 作成日   | 2026-03-23                    |

## 目的

Phase 2 設計に基づき、`assertNoSilentFallback` ガードと `ExecutionEnvironment.terminal` 本実装のテストケースを設計・作成する。TDD の Red フェーズとして、実装前にテストを記述する。

## 実行タスク

### Task 1: assertNoSilentFallback ガードのテスト作成

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/assertNoSilentFallback.test.ts`（新規作成）

#### テストケース設計

| ID  | テストケース                                     | 期待結果                                | AC   |
| --- | ------------------------------------------------ | --------------------------------------- | ---- |
| T-1 | currentConfig が null の場合                     | `LLMConfigNotSelectedError` を throw    | AC-4 |
| T-2 | currentConfig が有効な SelectedLLMConfig の場合  | 設定を返却（non-null 保証）             | AC-3 |
| T-3 | エラーの code プロパティ                         | `"LLM_CONFIG_NOT_SELECTED"` と一致      | AC-4 |
| T-4 | エラーの instanceof 判定                         | `LLMConfigNotSelectedError` の instance | AC-4 |
| T-5 | エラーメッセージにユーザー向け文言が含まれる     | Provider/Model 選択を促すメッセージ     | AC-5 |
| T-6 | setSelectedLLMConfig 後に assertNoSilentFallback | 設定した config が返却される            | AC-3 |
| T-7 | resetLLMConfig 後に assertNoSilentFallback       | `LLMConfigNotSelectedError` を throw    | AC-4 |

#### テストコード構造

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import {
  assertNoSilentFallback,
  setSelectedLLMConfig,
  resetLLMConfig,
  LLMConfigNotSelectedError,
} from "../llmConfigProvider";

describe("assertNoSilentFallback", () => {
  beforeEach(() => {
    resetLLMConfig();
  });

  it("should throw LLMConfigNotSelectedError when config is null", () => {
    expect(() => assertNoSilentFallback()).toThrow(LLMConfigNotSelectedError);
  });

  it("should return config when config is set", () => {
    const config = { providerId: "openai" as const, modelId: "gpt-4o" };
    setSelectedLLMConfig(config);
    expect(assertNoSilentFallback()).toEqual(config);
  });

  // ... T-3〜T-7
});
```

### Task 2: ExecutionEnvironment terminal 表示のテスト作成

**対象ファイル**: `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/__tests__/terminal.test.tsx`（新規作成）

#### テストケース設計

| ID   | テストケース                                              | 期待結果                                | AC   |
| ---- | --------------------------------------------------------- | --------------------------------------- | ---- |
| T-8  | environmentType="terminal" + handoffGuidance あり         | TerminalHandoffCard が表示される        | AC-1 |
| T-9  | environmentType="terminal" + handoffGuidance が null      | 待機中 Placeholder が表示される         | AC-2 |
| T-10 | environmentType="terminal" + handoffGuidance が undefined | 待機中 Placeholder が表示される         | AC-2 |
| T-11 | TerminalHandoffCard に guidance props が渡される          | guidance の内容が表示される             | AC-1 |
| T-12 | environmentType="html" の場合                             | terminal 実装に影響なし（既存動作維持） | -    |

#### テストコード構造

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExecutionEnvironment } from "../index";

describe("ExecutionEnvironment - terminal", () => {
  it("should render TerminalHandoffCard when guidance is provided", () => {
    const guidance = {
      terminalCommand: "claude --model gpt-4o",
      contextSummary: "テスト実行",
      reason: "API key 未設定",
    };
    render(
      <ExecutionEnvironment
        environmentType="terminal"
        content={null}
        handoffGuidance={guidance}
      />,
    );
    expect(screen.getByTestId("terminal-handoff-card")).toBeInTheDocument();
  });

  it("should render waiting placeholder when guidance is null", () => {
    render(
      <ExecutionEnvironment
        environmentType="terminal"
        content={null}
        handoffGuidance={null}
      />,
    );
    expect(screen.getByTestId("terminal-waiting")).toBeInTheDocument();
  });
});
```

### テスト実行環境の注意事項

- P40 対策: テスト実行は `cd apps/desktop && pnpm vitest run` で行う
- P39 対策: happy-dom 環境では `fireEvent` を使用（`userEvent` 不可）
- P9 対策: `beforeEach` で `resetLLMConfig()` を実行してテスト間の状態リークを防止

## 参照資料

| 資料名           | パス                                                                | 説明                 |
| ---------------- | ------------------------------------------------------------------- | -------------------- |
| Phase 2 設計     | `docs/30-workflows/execution-env-terminal/phase-2-design.md`        | インターフェース設計 |
| Phase 3 レビュー | `docs/30-workflows/execution-env-terminal/phase-3-design-review.md` | 設計レビュー結果     |

### システム仕様（aiworkflow-requirements）

| 参照資料          | パス                                                                  | 内容               |
| ----------------- | --------------------------------------------------------------------- | ------------------ |
| error-handling.md | `.claude/skills/aiworkflow-requirements/references/error-handling.md` | エラーカテゴリ定義 |

## 統合テスト連携

- assertNoSilentFallback テスト: `apps/desktop/src/main/ipc/__tests__/assertNoSilentFallback.test.ts`
- ExecutionEnvironment terminal テスト: `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/__tests__/terminal.test.tsx`
- 全テスト: `cd apps/desktop && pnpm vitest run` で実行確認

## 成果物

| 成果物                               | パス                                                                                              | 説明                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------- |
| assertNoSilentFallback テスト        | `apps/desktop/src/main/ipc/__tests__/assertNoSilentFallback.test.ts`                              | ガードの unit test（7 ケース）  |
| ExecutionEnvironment terminal テスト | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/__tests__/terminal.test.tsx` | terminal 表示テスト（5 ケース） |

## 完了条件

- [ ] T-1〜T-7（assertNoSilentFallback）のテストコードが作成されている
- [ ] T-8〜T-12（ExecutionEnvironment terminal）のテストコードが作成されている
- [ ] 全テストが Red 状態（実装前のため FAIL が期待される）
- [ ] テスト間で状態を共有しない（beforeEach でリセット）
- [ ] P40 準拠: `cd apps/desktop` からテスト実行可能
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 5: 実装
