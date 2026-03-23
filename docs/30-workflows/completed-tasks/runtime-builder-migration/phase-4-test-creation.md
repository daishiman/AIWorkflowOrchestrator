# Phase 4: テスト作成

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| タスクID   | UT-RUNTIME-BUILDER-MIGRATION-001 |
| Phase      | 4                                |
| 担当       | Claude Code                      |
| 前提成果物 | phase-3-design-review.md (PASS)  |
| 作成日     | 2026-03-23                       |

## 目的

`TerminalHandoffBuilder.buildForSurface()` のユニットテストを作成し、Phase 5（実装）前にテスト仕様を確定させる。Red（失敗）→ Green（成功）→ Refactor のサイクルを前提とする。

## 実行タスク

`buildForSurface()` メソッドに対する 16 ケースのユニットテストを作成する。

## 参照資料

- `docs/30-workflows/runtime-builder-migration/phase-2-design.md` — 設計書（型定義・メソッドシグネチャ）
- `docs/30-workflows/runtime-builder-migration/phase-3-design-review.md` — 設計レビュー結果
- `.claude/rules/06-known-pitfalls.md#P55` — shell 特殊文字サニタイズ
- `.claude/rules/06-known-pitfalls.md#P62` — DEFAULT_CONFIG への暗黙 fallback 禁止

## テスト対象ファイル

```
apps/desktop/src/main/services/runtime/__tests__/TerminalHandoffBuilder.test.ts
```

## テストケース仕様

### 概要

| グループ                      | ケース数 | 内容         |
| ----------------------------- | -------- | ------------ |
| chat-edit surface × 4 reason  | 4        | ケース 1〜4  |
| runtime surface × 4 reason    | 4        | ケース 5〜8  |
| skill-docs surface × 4 reason | 4        | ケース 9〜12 |
| エラーハンドリング            | 1        | ケース 13    |
| セキュリティ・サニタイズ      | 1        | ケース 14    |
| 空値処理                      | 1        | ケース 15    |
| 返却型検証                    | 1        | ケース 16    |
| **合計**                      | **16**   |              |

### ケース 1〜4: chat-edit surface

**前提**: `surfaceType = "chat-edit"`、`commandType = "refactor"`, `filePaths = ["App.tsx", "utils.ts"]`, `message = "テストプロンプト"`, `workspacePath = "/workspace/my-project"`

| ケース番号 | reason                     | 検証内容                                                                                                                                               |
| ---------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1          | `"subscription mode"`      | `terminalCommand` が `claude -p "..."` 形式。`contextSummary` に surface 固有フォーマット（chat-edit）を含む。`reason` が `"subscription mode"` と一致 |
| 2          | `"API key not configured"` | `terminalCommand` が `claude -p "..."` 形式。`reason` が `"API key not configured"` と一致                                                             |
| 3          | `"terminal_handoff"`       | `terminalCommand` が `claude -p "..."` 形式。`reason` が `"terminal_handoff"` と一致                                                                   |
| 4          | `"LLM unreachable"`        | `terminalCommand` が `claude -p "..."` 形式。`reason` が `"LLM unreachable"` と一致                                                                    |

**共通アサーション（ケース 1〜4）**:

- `result.terminalCommand` が `"claude -p "` で始まること
- `result.reason` が入力の `reason` と厳密一致すること
- `result.terminalCommand` に API キー文字列が含まれないこと
- `result.contextSummary` が空文字列でないこと

### ケース 5〜8: runtime surface（agent/skill）

**前提**: `surfaceType = "runtime"`, `runtimeType = "agent"`, `skillId = "agent-123"`, `prompt = "エージェントプロンプト"`, `workingDirectory = "/workspace"`

| ケース番号 | reason                     | 検証内容                                                            |
| ---------- | -------------------------- | ------------------------------------------------------------------- |
| 5          | `"subscription mode"`      | `contextSummary` に runtime 固有フォーマットを含む。`reason` が一致 |
| 6          | `"API key not configured"` | `reason` が一致                                                     |
| 7          | `"terminal_handoff"`       | `reason` が一致                                                     |
| 8          | `"LLM unreachable"`        | `reason` が一致                                                     |

**共通アサーション（ケース 5〜8）**:

- `result.terminalCommand` が `"claude -p "` で始まること
- `result.reason` が入力の `reason` と厳密一致すること
- `result.terminalCommand` に API キー文字列が含まれないこと

### ケース 9〜12: skill-docs surface

**前提**: `surfaceType = "skill-docs"`, `queryText = "How to use skill X"`, `skillName = "my-skill"`

| ケース番号 | reason                     | 検証内容                                                               |
| ---------- | -------------------------- | ---------------------------------------------------------------------- |
| 9          | `"subscription mode"`      | `contextSummary` に skill-docs 固有フォーマットを含む。`reason` が一致 |
| 10         | `"API key not configured"` | `reason` が一致                                                        |
| 11         | `"terminal_handoff"`       | `reason` が一致                                                        |
| 12         | `"LLM unreachable"`        | `reason` が一致                                                        |

**共通アサーション（ケース 9〜12）**:

- `result.terminalCommand` が `"claude -p "` で始まること
- `result.reason` が入力の `reason` と厳密一致すること
- `result.terminalCommand` に API キー文字列が含まれないこと

### ケース 13: P62対策 — 未知 surfaceType でエラー throw

**目的**: 未定義の surfaceType が渡された場合、暗黙 fallback（P62）を防ぐためにエラーをスローすること。

**入力**:

```typescript
const input = {
  surfaceType: "unknown-surface" as never,
  // ...他のフィールド
};
```

**アサーション**:

- `buildForSurface(input, "terminal_handoff")` が例外をスローすること（`toThrow` または `rejects.toThrow`）
- エラーメッセージに `"unknown-surface"` またはそれに相当する surface 名が含まれること
- `never` 型の exhaustive check により TypeScript コンパイル時にも型エラーが発生すること（コンパイルチェックはコメントで明示）

### ケース 14: P55対策 — shell 特殊文字のサニタイズ

**目的**: prompt に shell 特殊文字（`"`, `$`, `\``, `\` 等）が含まれる場合、`terminalCommand` がシェルインジェクション可能な状態にならないこと。

**入力**:

```typescript
const input = {
  surfaceType: "chat-edit",
  commandType: "refactor",
  filePaths: ["/path/to/file.ts"],
  message: 'rm -rf / && echo "hacked" $(dangerous) `cmd`',
};
```

**アサーション**:

- `result.terminalCommand` が文字列として取得できること
- `result.terminalCommand` に未エスケープの `$(...)` または `` ` `` が含まれないこと
- `result.terminalCommand` に未エスケープの二重引用符（外側の `claude -p "..."` を壊す形）が含まれないこと
- サニタイズ後も `result.terminalCommand` が空文字列でないこと

### ケース 15: 空値処理 — prompt 未指定時のデフォルト値

**目的**: `prompt` が `undefined` または省略された場合、デフォルト値が設定されて `terminalCommand` が生成されること。

**入力**:

```typescript
const input = {
  surfaceType: "chat-edit",
  commandType: "edit",
  filePaths: ["/path/to/file.ts"],
  // message: 省略（prompt相当のフィールド未指定テスト）
};
```

**アサーション**:

- `buildForSurface(input, "terminal_handoff")` がエラーをスローしないこと
- `result.terminalCommand` が空文字列でないこと
- `result.terminalCommand` が `"claude -p "` で始まること

### ケース 16: 返却型 — HandoffGuidance 型の検証

**目的**: `buildForSurface()` の戻り値が `HandoffGuidance` 型の全プロパティを持つこと。

**入力**:

```typescript
const input = {
  surfaceType: "chat-edit",
  commandType: "refactor",
  filePaths: ["/path/to/file.ts"],
  message: "検証用プロンプト",
};
```

**アサーション**:

- `result` が `terminalCommand: string` プロパティを持つこと
- `result` が `contextSummary: string` プロパティを持つこと
- `result` が `reason: string` プロパティを持つこと
- 各プロパティが `string` 型であること（`typeof result.terminalCommand === "string"` 等）
- `result` に予期しない追加プロパティが存在しないこと（厳密な型構造検証）

## モック戦略

`buildForSurface()` は pure function（外部 I/O なし）のため、基本的にモックは不要。

| 依存                 | モック要否   | 理由                                                                                                    |
| -------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `path.basename`      | 条件付き必要 | `docPath` を扱う skill-docs surface のみ。実際のパス文字列で代替可能な場合はモック不要                  |
| ファイルシステム     | 不要         | pure function のため                                                                                    |
| IPC / Electron       | 不要         | pure function のため                                                                                    |
| 環境変数（API キー） | 不要（注意） | テストコード内で API キーを使用・参照しないこと。P55 対策テストのみ、キーが出力に漏れていないことを確認 |

## 実行コマンド

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/TerminalHandoffBuilder.test.ts
```

## 成果物

| ファイルパス                                                                      | 説明                              |
| --------------------------------------------------------------------------------- | --------------------------------- |
| `apps/desktop/src/main/services/runtime/__tests__/TerminalHandoffBuilder.test.ts` | 16 ケースのユニットテストファイル |

## 完了条件

- [ ] テストファイル `TerminalHandoffBuilder.test.ts` が作成されていること
- [ ] 16 ケース全てが記述されていること
- [ ] Phase 5（実装）前の時点では全テストが Red（失敗）状態であること
- [ ] テスト実行コマンドでエラーなく起動すること（モジュール解決エラーなし）
- [ ] P62 対策（ケース 13）で未知 surfaceType のエラーが検証されていること
- [ ] P55 対策（ケース 14）でシェル特殊文字のサニタイズが検証されていること
- [ ] API キーがテストコードおよびテスト出力に含まれないこと

---

## 統合テスト連携

本 Phase は単体テスト作成のため、統合テストは Phase 6 で実施する。ハンドラー統合テスト（C-1〜C-3）は Phase 6 のスコープ。

---

## 多角的チェック観点

| 観点               | 確認内容                                           | 該当ケース   |
| ------------------ | -------------------------------------------------- | ------------ |
| セキュリティ       | P55（shell injection）テストが含まれているか       | ケース 14    |
| エラーハンドリング | P62（unknown surfaceType）テストが含まれているか   | ケース 13    |
| データ整合性       | 全 surfaceType × reason の組合せが網羅されているか | ケース 1〜12 |

---

## サブタスク管理

- [ ] テストファイルを作成する
- [ ] chat-edit surface テスト（ケース1〜4）を記述する
- [ ] runtime surface テスト（ケース5〜8）を記述する
- [ ] skill-docs surface テスト（ケース9〜12）を記述する
- [ ] エラー・セキュリティ・空値・返却型テスト（ケース13〜16）を記述する
- [ ] テスト実行でモジュール解決エラーがないことを確認する

## タスク100%実行確認【必須】

- [ ] 全サブタスクが完了している
- [ ] 16 ケース全てが記述されている

---

## 次 Phase

Phase 5: 実装 (`phase-5-implementation.md`)
