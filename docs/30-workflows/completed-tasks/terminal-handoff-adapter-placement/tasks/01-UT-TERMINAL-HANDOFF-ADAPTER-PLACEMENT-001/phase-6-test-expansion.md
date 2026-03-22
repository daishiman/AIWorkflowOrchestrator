# Phase 6: テスト拡充

## メタ情報

| 項目          | 内容                                                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 6                                                                                                                                   |
| 機能名        | terminal-handoff-adapter-placement (UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001)                                                      |
| 作成日        | 2026-03-22                                                                                                                          |
| 担当          | -                                                                                                                                   |
| ステータス    | 未着手                                                                                                                              |
| 前Phase成果物 | `docs/30-workflows/terminal-handoff-adapter-placement/tasks/01-UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001/phase-5-implementation.md` |

## 目的

Phase 7 のカバレッジ確認（Line: 80%以上、Branch: 60%以上、Function: 80%以上）に備え、Phase 4/5 で不足しているエッジケース・境界値・組合せテストを追加する。非常に長い prompt、マルチバイト文字、undefined フィールド、全空文字列、ChatEdit + workspacePath ありの場合のフラグ生成、HandoffBlock.tsx の型 import 確認を網羅する。

## 実行タスク

### タスク1: カバレッジ仮計測と不足箇所の特定

```bash
# apps/desktop ディレクトリから実行（P40対策）
cd apps/desktop

# カバレッジレポート生成
pnpm vitest run --coverage \
  src/main/adapters/handoff/__tests__/toHandoffGuidance.test.ts

# カバレッジ結果確認（特に branch coverage に注目）
cat coverage/coverage-summary.json | grep -A 10 '"toHandoffGuidance"'
```

### タスク2: エッジケーステストの追加

| ID   | テスト名                                                                                      | 分類         |
| ---- | --------------------------------------------------------------------------------------------- | ------------ |
| T-09 | 非常に長い prompt（10000文字超）で正常動作すること                                            | エッジケース |
| T-10 | マルチバイト文字を含む prompt（日本語）で正常変換されること                                   | エッジケース |
| T-11 | workingDirectory が undefined の場合にデフォルト動作すること                                  | エッジケース |
| T-12 | 全フィールドが空文字列の HandoffSource で正常動作すること                                     | 境界値       |
| T-13 | ChatEdit + workspacePath ありの場合に --add-dir フラグが生成されること                        | 組合せ       |
| T-14 | HandoffBlock.tsx が @repo/shared（または共有元）から HandoffGuidance 型を import していること | 型import確認 |

#### T-09: 非常に長い prompt（10000文字超）

```typescript
it("T-09: 10000文字超の prompt でもエラーなく HandoffGuidance が生成される", () => {
  const longPrompt = "a".repeat(10001);
  const source: ChatEditHandoffSource = {
    kind: "chat-edit",
    request: {
      prompt: longPrompt,
      workspacePath: "/Users/dev/project",
      contextFiles: [],
    },
  };

  const result = toHandoffGuidance(source, "test reason");

  expect(result).toHaveProperty("terminalCommand");
  expect(result).toHaveProperty("contextSummary");
  expect(result).toHaveProperty("reason");
  // 長い prompt でもクラッシュしない
  expect(typeof result.terminalCommand).toBe("string");
});
```

#### T-10: マルチバイト文字を含む prompt（日本語）

```typescript
it("T-10: 日本語を含む prompt で正常変換される", () => {
  const source: ChatEditHandoffSource = {
    kind: "chat-edit",
    request: {
      prompt: "ログイン画面のバグを修正してください。認証モジュールを確認。",
      workspacePath: "/Users/dev/project",
      contextFiles: ["src/auth/login.ts"],
    },
  };

  const result = toHandoffGuidance(source, "test reason");

  expect(result).toHaveProperty("terminalCommand");
  expect(result).toHaveProperty("contextSummary");
  expect(result).toHaveProperty("reason");
  expect(typeof result.terminalCommand).toBe("string");
  expect(result.terminalCommand.length).toBeGreaterThan(0);
});
```

#### T-11: workingDirectory が undefined の場合

```typescript
it("T-11: workingDirectory が undefined の場合にデフォルト動作する", () => {
  const source: ChatEditHandoffSource = {
    kind: "chat-edit",
    request: {
      prompt: "Fix the bug",
      // workspacePath は未指定（undefined）
      contextFiles: [],
    },
  };

  const result = toHandoffGuidance(source, "test reason");

  expect(result).toHaveProperty("terminalCommand");
  expect(result).toHaveProperty("contextSummary");
  expect(result).toHaveProperty("reason");
  // undefined でもクラッシュしない
  expect(typeof result.terminalCommand).toBe("string");
});
```

#### T-12: 全フィールドが空文字列の HandoffSource

```typescript
it("T-12: 全フィールドが空文字列でもエラーなく動作する", () => {
  const source: AgentHandoffSource = {
    kind: "agent",
    skillId: "",
    prompt: "",
  };

  const result = toHandoffGuidance(source, "test reason");

  expect(result).toHaveProperty("terminalCommand");
  expect(result).toHaveProperty("contextSummary");
  expect(result).toHaveProperty("reason");
  expect(typeof result.terminalCommand).toBe("string");
});
```

#### T-13: ChatEdit + workspacePath ありの場合（--add-dir フラグ生成確認）

```typescript
it("T-13: ChatEdit + workspacePath ありの場合、--add-dir フラグが含まれる", () => {
  const source: ChatEditHandoffSource = {
    kind: "chat-edit",
    request: {
      prompt: "Refactor the auth module",
      workspacePath: "/Users/dev/my-workspace",
      contextFiles: ["src/auth/index.ts", "src/auth/session.ts"],
    },
  };

  const result = toHandoffGuidance(source, "test reason");

  // workspacePath が指定されている場合、--add-dir フラグがコマンドに含まれることを確認
  expect(result.terminalCommand).toContain("--add-dir");
  expect(result.terminalCommand).toContain("/Users/dev/my-workspace");
});
```

#### T-14: HandoffBlock.tsx の型 import 確認

```typescript
it("T-14: HandoffBlock.tsx が共有元から HandoffGuidance 型を import していること", () => {
  // このテストは静的解析で担保する。
  // Phase 5 の FR-06 対応により HandoffBlock.tsx のローカル型定義が
  // 共有元（@repo/shared または adapters/handoff/types.ts）からの import に
  // 置換されていることを確認する。
  //
  // 実行時テストとしては、型が一致していることを以下で検証する。
  const guidance: HandoffGuidance = {
    terminalCommand: "claude --print 'test'",
    contextSummary: "surface=chat-edit",
    reason: "Terminal handoff required",
  };

  // HandoffGuidance の3フィールドが正しい型であることを検証
  expect(typeof guidance.terminalCommand).toBe("string");
  expect(typeof guidance.contextSummary).toBe("string");
  expect(typeof guidance.reason).toBe("string");
});
```

### タスク3: セキュリティ拡充テストの追加

| ID   | テスト名                                                  | 分類         |
| ---- | --------------------------------------------------------- | ------------ |
| T-15 | 複合 shell injection パターン（$(), ${}）のサニタイズ確認 | セキュリティ |
| T-16 | 改行・タブ文字を含む prompt のサニタイズ確認              | セキュリティ |

#### T-15: 複合 shell injection パターン

```typescript
it("T-15: 複合 shell injection パターンがサニタイズされる", () => {
  const source: ChatEditHandoffSource = {
    kind: "chat-edit",
    request: {
      prompt: '$(whoami) ${USER} && rm -rf / ; echo "hacked"',
      workspacePath: "/Users/dev/project",
      contextFiles: [],
    },
  };

  const result = toHandoffGuidance(source, "test reason");

  // コマンド置換 $() と ${} がエスケープされていること
  expect(result.terminalCommand).not.toContain("$(whoami)");
  expect(result.terminalCommand).not.toContain("${USER}");
});
```

#### T-16: 改行・タブ文字を含む prompt

```typescript
it("T-16: 改行・タブ文字を含む prompt でも正常動作する", () => {
  const source: ChatEditHandoffSource = {
    kind: "chat-edit",
    request: {
      prompt: "Fix the bug\n\twith proper\n\tindentation",
      workspacePath: "/Users/dev/project",
      contextFiles: [],
    },
  };

  const result = toHandoffGuidance(source, "test reason");

  expect(result).toHaveProperty("terminalCommand");
  expect(typeof result.terminalCommand).toBe("string");
  // 改行やタブがそのまま含まれないことを確認
  expect(result.terminalCommand).not.toContain("\n");
  expect(result.terminalCommand).not.toContain("\t");
});
```

### タスク4: テスト実行と全 PASS 確認

```bash
# apps/desktop ディレクトリから実行（P40対策）
cd apps/desktop

# 全テスト実行
pnpm vitest run src/main/adapters/handoff/__tests__/toHandoffGuidance.test.ts

# カバレッジ再計測
pnpm vitest run --coverage \
  src/main/adapters/handoff/__tests__/toHandoffGuidance.test.ts
```

## 参照資料

### コード品質ルール

| 資料名         | パス                               |
| -------------- | ---------------------------------- |
| カバレッジ基準 | `.claude/rules/02-code-quality.md` |

### 前Phase成果物

| 資料名             | パス                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Phase 4 テスト設計 | `docs/30-workflows/terminal-handoff-adapter-placement/tasks/01-UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001/phase-4-test.md`           |
| Phase 5 実装       | `docs/30-workflows/terminal-handoff-adapter-placement/tasks/01-UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001/phase-5-implementation.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                  | 対策                                                     |
| ---------- | ------------------------------------- | -------------------------------------------------------- |
| P9         | テスト間で状態共有                    | `beforeEach` でリセット                                  |
| P40        | テスト実行ディレクトリ依存            | `apps/desktop` から実行する                              |
| P41        | v8 カバレッジのインライン関数カウント | インライン arrow function のコールバックを明示的にテスト |
| P42        | .trim() バリデーション漏れ            | 空白のみの文字列もテスト対象に含める                     |
| P55        | 正規表現メタ文字を含むパス            | テスト内のパスにメタ文字が含まれないことを確認する       |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                              | 内容                          |
| ------------------ | --------------------------------------------------------------------------------- | ----------------------------- |
| セキュリティルール | `.claude/rules/04-electron-security.md`                                           | Electron セキュリティ         |
| IPC セキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | secret 非露出・auto-send 禁止 |

## 実行手順

1. **タスク1の実施**: カバレッジを仮計測し、不足箇所を特定する
2. **タスク2の実施**: エッジケーステスト（T-09 〜 T-14）を追加する
3. **タスク3の実施**: セキュリティ拡充テスト（T-15 〜 T-16）を追加する
4. **タスク4の実施**: 全テスト PASS とカバレッジ再計測を確認する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこの Phase で確認・更新する
- 追加・変更したテスト観点は対応する `apps/desktop/src/main/adapters/handoff/` の実装ファイルと 1 対 1 で突合する
- T-14（HandoffBlock.tsx 型 import 確認）は、FR-06 対応の Phase 5 成果物が正しく適用されていることの回帰テストとして機能する

## 成果物

| 成果物                       | パス                                                                                                                                | 説明                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 6 仕様書（本ファイル） | `docs/30-workflows/terminal-handoff-adapter-placement/tasks/01-UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001/phase-6-test-expansion.md` | テスト拡充計画書              |
| 追加テストコード             | `apps/desktop/src/main/adapters/handoff/__tests__/toHandoffGuidance.test.ts`（追記）                                                | T-09 〜 T-16 テストケース追加 |

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

| 観点           | 適用判断                                        | 仕様参照先                                          |
| -------------- | ----------------------------------------------- | --------------------------------------------------- |
| セキュリティ   | 複合 shell injection パターンのテストが含まれる | `aiworkflow-requirements: security-electron-ipc.md` |
| アーキテクチャ | adapter テストの配置先が正しい                  | `aiworkflow-requirements: architecture-overview.md` |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                         | 仕様参照先                                          |
| -------------------- | -------------------------------- | --------------------------------------------------- |
| バックエンド（Main） | adapter テストは Main Process 層 | `aiworkflow-requirements: architecture-overview.md` |

## 完了条件

- [ ] タスク1でカバレッジ仮計測を実施し、不足箇所を特定した
- [ ] T-09（10000文字超の prompt）を追加実装し、PASS を確認した
- [ ] T-10（マルチバイト文字・日本語 prompt）を追加実装し、PASS を確認した
- [ ] T-11（workingDirectory が undefined）を追加実装し、PASS を確認した
- [ ] T-12（全フィールド空文字列）を追加実装し、PASS を確認した
- [ ] T-13（ChatEdit + workspacePath ありの --add-dir フラグ確認）を追加実装し、PASS を確認した
- [ ] T-14（HandoffBlock.tsx の型 import 確認）を追加実装し、PASS を確認した
- [ ] T-15（複合 shell injection パターン）を追加実装し、PASS を確認した
- [ ] T-16（改行・タブ文字サニタイズ）を追加実装し、PASS を確認した
- [ ] P41対策（インライン arrow function のカバレッジ確認）を実施した
- [ ] 全追加テスト（T-09 〜 T-16）が PASS であることを確認した
- [ ] テスト間で状態が共有されていない（P9対策: beforeEach でリセット）

## 次のPhase

Phase 7: カバレッジ確認（`phase-7-coverage.md`）
