# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目          | 内容                                                                                                                               |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 4                                                                                                                                  |
| 機能名        | terminal-handoff-adapter-placement (UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001)                                                     |
| 作成日        | 2026-03-22                                                                                                                         |
| 担当          | -                                                                                                                                  |
| ステータス    | 未着手                                                                                                                             |
| 前Phase成果物 | `docs/30-workflows/terminal-handoff-adapter-placement/tasks/01-UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001/phase-3-design-review.md` |

## 目的

Phase 2 で設計した `toHandoffGuidance` adapter 関数に対するテストケースを先に設計・実装し、Red 状態（テスト失敗）から始める TDD サイクルを確立する。Discriminated Union（`HandoffSource`）の4種 kind 別正常変換、shell injection 対策のサニタイズ、機密情報除外、空入力・workingDirectory 指定時の動作を網羅する。

## 実行タスク

- 既存テストと import path を確認する
- `toHandoffGuidance.test.ts` のテストケースを設計する
- テスト用モックデータを準備する
- Red 状態で test suite を起動する

### タスク1: テスト対象の確認

P63 対策として、既存テストファイルのインポートパスを参照してから新規テストを作成する。

```bash
# 既存の handoff 関連テストファイルを確認
find apps/desktop/src/main -name "*.test.ts" -path "*handoff*"

# 既存の adapter 関連テストファイルを確認
find apps/desktop/src/main/adapters -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null

# 既存の TerminalHandoffBuilder テストのインポートパス参照（P63対策）
grep -rn "^import" apps/desktop/src/main/chat-edit/TerminalHandoffBuilder.test.ts 2>/dev/null
grep -rn "^import" apps/desktop/src/main/runtime/TerminalHandoffBuilder.test.ts 2>/dev/null

# テスト実行環境の確認（P40対策）
cat apps/desktop/vitest.config.ts | grep -A 5 "environment"
```

### タスク2: テスト用モックデータの準備

HandoffSource Discriminated Union の4種に対するモックデータを定義する。

```typescript
// ChatEditHandoffSource モック
const mockChatEditSource: ChatEditHandoffSource = {
  kind: "chat-edit",
  request: {
    prompt: "Fix the login bug in auth module",
    workspacePath: "/Users/dev/project",
    contextFiles: ["src/auth/login.ts", "src/auth/session.ts"],
  },
};

// AgentHandoffSource モック
const mockAgentSource: AgentHandoffSource = {
  kind: "agent",
  skillId: "test-skill-001",
  prompt: "do something with the agent",
};

// SkillHandoffSource モック
const mockSkillSource: SkillHandoffSource = {
  kind: "skill",
  skillName: "test-skill",
};

// BundleHandoffSource モック
const mockBundleSource: BundleHandoffSource = {
  kind: "bundle",
  launcher: "claude",
  promptBundle: "Run integration tests and fix failures",
};
```

### タスク3: テストケース設計と実装

**テストファイルパス**: `apps/desktop/src/main/adapters/handoff/__tests__/toHandoffGuidance.test.ts`

**注意**: コード成果物（テストファイル）は `apps/desktop/src/main/adapters/handoff/__tests__/` に配置する。`outputs/` ディレクトリには配置しない。

**テストケース一覧**:

| ID   | テスト名                                                | 分類         |
| ---- | ------------------------------------------------------- | ------------ |
| T-01 | ChatEditHandoffSource から HandoffGuidance への正常変換 | 正常系       |
| T-02 | AgentHandoffSource から HandoffGuidance への正常変換    | 正常系       |
| T-03 | SkillHandoffSource から HandoffGuidance への正常変換    | 正常系       |
| T-04 | BundleHandoffSource から HandoffGuidance への正常変換   | 正常系       |
| T-05 | shell injection 文字列のサニタイズ                      | セキュリティ |
| T-06 | 機密情報が terminalCommand に含まれないこと             | セキュリティ |
| T-07 | 空の prompt での正常動作                                | 境界値       |
| T-08 | workingDirectory 指定時のコマンド生成                   | 正常系       |

#### T-01: ChatEditHandoffSource -> HandoffGuidance 正常変換

```typescript
it("T-01: ChatEditHandoffSource から HandoffGuidance に正常変換できる", () => {
  const source: ChatEditHandoffSource = {
    kind: "chat-edit",
    request: {
      prompt: "Fix the login bug in auth module",
      workspacePath: "/Users/dev/project",
      contextFiles: ["src/auth/login.ts", "src/auth/session.ts"],
    },
  };

  const result = toHandoffGuidance(source, "test reason");

  expect(result).toHaveProperty("terminalCommand");
  expect(result).toHaveProperty("contextSummary");
  expect(result).toHaveProperty("reason");
  expect(typeof result.terminalCommand).toBe("string");
  expect(typeof result.contextSummary).toBe("string");
  expect(typeof result.reason).toBe("string");
  expect(result.terminalCommand.length).toBeGreaterThan(0);
});
```

#### T-02: AgentHandoffSource -> HandoffGuidance 正常変換

```typescript
it("T-02: AgentHandoffSource から HandoffGuidance に正常変換できる", () => {
  const source: AgentHandoffSource = {
    kind: "agent",
    skillId: "test-skill-001",
    prompt: "do something with the agent",
  };

  const result = toHandoffGuidance(source, "test reason");

  expect(result.contextSummary).toContain("surface=agent");
  expect(result.terminalCommand.length).toBeGreaterThan(0);
  expect(result.reason.length).toBeGreaterThan(0);
});
```

#### T-03: SkillHandoffSource -> HandoffGuidance 正常変換

```typescript
it("T-03: SkillHandoffSource から HandoffGuidance に正常変換できる", () => {
  const source: SkillHandoffSource = {
    kind: "skill",
    skillName: "test-skill",
  };

  const result = toHandoffGuidance(source, "test reason");

  expect(result.contextSummary).toContain("surface=skill");
  expect(result.terminalCommand.length).toBeGreaterThan(0);
  expect(result.reason.length).toBeGreaterThan(0);
});
```

#### T-04: BundleHandoffSource -> HandoffGuidance 正常変換

```typescript
it("T-04: BundleHandoffSource から HandoffGuidance に正常変換できる", () => {
  const source: BundleHandoffSource = {
    kind: "bundle",
    launcher: "claude",
    promptBundle: "Run integration tests and fix failures",
  };

  const result = toHandoffGuidance(source, "test reason");

  expect(result.terminalCommand).toContain("claude");
  expect(result.contextSummary.length).toBeGreaterThan(0);
  expect(result.reason.length).toBeGreaterThan(0);
});
```

#### T-05: shell injection 文字列のサニタイズ

```typescript
it("T-05: shell injection 文字列がエスケープされる", () => {
  const source: ChatEditHandoffSource = {
    kind: "chat-edit",
    request: {
      prompt: 'Delete everything with $HOME and `rm -rf /` and "quotes"',
      workspacePath: "/Users/dev/project",
      contextFiles: [],
    },
  };

  const result = toHandoffGuidance(source, "test reason");

  // 4種エスケープ対象: $変数展開, バッククォート, ダブルクォート, シングルクォート
  expect(result.terminalCommand).not.toContain("$HOME");
  expect(result.terminalCommand).not.toContain("`rm -rf /`");
  // エスケープされた形式で含まれることを確認
  expect(result.terminalCommand).toBeDefined();
});
```

#### T-06: 機密情報が terminalCommand に含まれないこと

```typescript
it("T-06: 機密情報（APIキーパターン）が terminalCommand に含まれない", () => {
  const source: ChatEditHandoffSource = {
    kind: "chat-edit",
    request: {
      prompt: "Use API key sk-abc123def456ghi789 to authenticate",
      workspacePath: "/Users/dev/project",
      contextFiles: [],
    },
  };

  const result = toHandoffGuidance(source, "test reason");

  // APIキーパターン（sk-xxx）が terminalCommand に含まれないことを検証
  expect(result.terminalCommand).not.toMatch(/sk-[a-zA-Z0-9]{10,}/);
});
```

#### T-07: 空の prompt での正常動作

```typescript
it("T-07: 空の prompt でもエラーなく HandoffGuidance が生成される", () => {
  const source: ChatEditHandoffSource = {
    kind: "chat-edit",
    request: {
      prompt: "",
      workspacePath: "/Users/dev/project",
      contextFiles: [],
    },
  };

  const result = toHandoffGuidance(source, "test reason");

  expect(result).toHaveProperty("terminalCommand");
  expect(result).toHaveProperty("contextSummary");
  expect(result).toHaveProperty("reason");
  // 空 prompt でもクラッシュしない
  expect(typeof result.terminalCommand).toBe("string");
});
```

#### T-08: workingDirectory 指定時のコマンド生成

```typescript
it("T-08: workingDirectory が指定されている場合、コマンドに反映される", () => {
  const source: ChatEditHandoffSource = {
    kind: "chat-edit",
    request: {
      prompt: "Fix the bug",
      workspacePath: "/Users/dev/my-project",
      contextFiles: ["src/index.ts"],
    },
  };

  const result = toHandoffGuidance(source, "test reason");

  // workingDirectory（workspacePath）がコマンドに反映されることを確認
  expect(result.terminalCommand).toContain("/Users/dev/my-project");
});
```

### タスク4: テスト実行で Red 確認

```bash
# apps/desktop ディレクトリから実行（P40対策）
cd apps/desktop
pnpm vitest run src/main/adapters/handoff/__tests__/toHandoffGuidance.test.ts
```

全テストが Red（失敗）であることを確認する。adapter 関数がまだ実装されていないため、import エラーまたは関数未定義エラーで失敗する。

## 参照資料

### システム仕様

| 資料名                     | パス                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| セキュリティルール         | `.claude/rules/04-electron-security.md`                                                     |
| 実装パターン               | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| IPC セキュリティ           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`           |
| TerminalHandoffBuilder DTO | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`              |

### 関連ソースコード

| ファイル                              | パス                                                          |
| ------------------------------------- | ------------------------------------------------------------- |
| テスト対象 adapter（新規）            | `apps/desktop/src/main/adapters/handoff/toHandoffGuidance.ts` |
| 型定義（新規）                        | `apps/desktop/src/main/adapters/handoff/types.ts`             |
| 既存 Chat Edit TerminalHandoffBuilder | `apps/desktop/src/main/chat-edit/TerminalHandoffBuilder.ts`   |
| 既存 Runtime TerminalHandoffBuilder   | `apps/desktop/src/main/runtime/TerminalHandoffBuilder.ts`     |

### 既知の落とし穴

| 落とし穴ID | 説明                                 | 対策                                               |
| ---------- | ------------------------------------ | -------------------------------------------------- |
| P9         | テスト間で状態共有                   | `beforeEach` でモック・状態をリセット              |
| P40        | テスト実行ディレクトリ依存           | `apps/desktop` ディレクトリからテストを実行する    |
| P42        | .trim() バリデーション漏れ           | 文字列引数に `.trim() === ""` チェックを含める     |
| P55        | 正規表現メタ文字を含むパス           | `escapeRegExp()` でメタ文字をエスケープする        |
| P60        | IPC テスト応答形式の不一致           | レスポンス wrapper 形式を Phase 2 設計と整合させる |
| P63        | サブエージェントのインポートパス誤り | 既存テストファイルのインポートパスを必ず参照する   |

## 実行手順

1. **既存テストファイルの確認**: タスク1のコマンドを実行し、インポートパスを把握する
2. **モックデータの準備**: タスク2に従い、HandoffSource 4種のモックデータを定義する
3. **テストケースの実装**: T-01 から T-08 まで順にテストを実装する（Red 状態を確認しながら進める）
4. **テスト実行で Red 確認**: 全テストが失敗（Red）することを確認する

## 統合テスト連携

- `toHandoffGuidance` adapter が既存の `TerminalHandoffBuilder`（chat-edit / runtime）と共存する前提でテストを設計する
- Consumer 5件（C1 Chat Edit, C2 Runtime Agent, C3 Runtime Skill, C4 Skill Docs, C5 GuidanceBlock UI）との接続は Phase 6 以降で拡充する
- shell injection サニタイズの4種エスケープ（`$変数展開`, バッククォート, ダブルクォート, シングルクォート）が全 kind で共通適用されることを unit test で検証する

## 成果物

| 成果物                       | パス                                                                                                                      | 説明                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Phase 4 仕様書（本ファイル） | `docs/30-workflows/terminal-handoff-adapter-placement/tasks/01-UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001/phase-4-test.md` | テスト設計書              |
| テストファイル               | `apps/desktop/src/main/adapters/handoff/__tests__/toHandoffGuidance.test.ts`                                              | T-01 〜 T-08 テストケース |

**注意**: コード成果物（テストファイル）の配置先は `apps/desktop/src/main/adapters/handoff/__tests__/` であり、`outputs/` には配置しない。

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                         | 仕様参照先                                          |
| -------------- | -------------------------------- | --------------------------------------------------- |
| セキュリティ   | shell injection テストが含まれる | `aiworkflow-requirements: security-electron-ipc.md` |
| アーキテクチャ | adapter テストの配置先が正しい   | `aiworkflow-requirements: architecture-overview.md` |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                         | 仕様参照先                                          |
| -------------------- | -------------------------------- | --------------------------------------------------- |
| バックエンド（Main） | adapter テストは Main Process 層 | `aiworkflow-requirements: architecture-overview.md` |

## 完了条件

- [ ] タスク1のコマンドを実行し、既存テストファイルのインポートパスを確認した
- [ ] テスト用モックデータ（HandoffSource 4種）を定義した
- [ ] T-01（ChatEditHandoffSource 正常変換）のテストを実装し、Red 状態を確認した
- [ ] T-02（AgentHandoffSource 正常変換）のテストを実装し、Red 状態を確認した
- [ ] T-03（SkillHandoffSource 正常変換）のテストを実装し、Red 状態を確認した
- [ ] T-04（BundleHandoffSource 正常変換）のテストを実装し、Red 状態を確認した
- [ ] T-05（shell injection サニタイズ）のテストを実装し、Red 状態を確認した
- [ ] T-06（機密情報除外）のテストを実装し、Red 状態を確認した
- [ ] T-07（空 prompt 正常動作）のテストを実装し、Red 状態を確認した
- [ ] T-08（workingDirectory 指定時コマンド生成）のテストを実装し、Red 状態を確認した
- [ ] テスト間で状態が共有されていない（P9対策: beforeEach でリセット）
- [ ] `apps/desktop` ディレクトリからテストを実行している（P40対策）

## 次のPhase

Phase 5: 実装（`phase-5-implementation.md`）
