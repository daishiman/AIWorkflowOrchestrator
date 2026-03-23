# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| タスクID   | UT-RUNTIME-BUILDER-MIGRATION-001                         |
| Phase      | 6                                                        |
| 担当       | Claude Code                                              |
| 前提成果物 | phase-5-implementation.md（全 16 ケース Green 確認済み） |
| 作成日     | 2026-03-23                                               |

## 目的

Phase 4 で作成した 16 ケースのテストではカバーしきれない境界値・回帰テスト・統合テストを追加し、カバレッジ基準（Line 90%、Branch 70%、Function 90%）を達成する。

## 実行タスク

Phase 5 実装完了後、カバレッジ計測を行い、不足箇所を補完するテストを追加する。

## 参照資料

- `docs/30-workflows/runtime-builder-migration/phase-4-test-creation.md` — 既存テストケース一覧
- `docs/30-workflows/runtime-builder-migration/phase-7-coverage.md` — カバレッジ基準
- `.claude/rules/02-code-quality.md#テスト駆動開発（TDD）` — カバレッジ基準定義

## テスト追加対象ファイル

| ファイルパス                                                                         | 追加テストの種別                     |
| ------------------------------------------------------------------------------------ | ------------------------------------ |
| `apps/desktop/src/main/services/runtime/__tests__/TerminalHandoffBuilder.test.ts`    | 境界値・回帰テスト                   |
| `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.test.ts`                       | 統合テスト（`buildForSurface` 経由） |
| `apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts`                          | 統合テスト（`buildForSurface` 経由） |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                          | 統合テスト（`buildForSurface` 経由） |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | 戻り値型変更の回帰テスト             |

## 追加テスト仕様

### A. 境界値テスト（TerminalHandoffBuilder.test.ts に追加）

#### A-1: 空文字列 prompt

**目的**: `prompt = ""` が渡された場合、エラーをスローせず `terminalCommand` が生成されること。

**入力**:

```typescript
{ surfaceType: "chat-edit", skillName: "test", reason: "terminal_handoff", prompt: "" }
```

**アサーション**:

- `buildForSurface(input)` がエラーをスローしないこと
- `result.terminalCommand` が空文字列でないこと（デフォルト値が適用されるか、空のプロンプトでコマンドが成立すること）

#### A-2: 超長文 prompt

**目的**: 非常に長い prompt（1000 文字以上）でも `terminalCommand` が生成されること。

**入力**:

```typescript
{
  surfaceType: "runtime",
  agentId: "agent-xyz",
  reason: "terminal_handoff",
  prompt: "a".repeat(1000),
}
```

**アサーション**:

- `buildForSurface(input)` がエラーをスローしないこと
- `result.terminalCommand` が `"claude -p "` で始まること
- `result.terminalCommand` の長さが 0 より大きいこと

#### A-3: 特殊文字のみの prompt

**目的**: `prompt` が特殊文字のみ（`'"<>&|;` 等）の場合、サニタイズ後に `terminalCommand` が成立すること。

**入力**:

```typescript
{
  surfaceType: "skill-docs",
  docPath: "/path/to/doc.md",
  reason: "terminal_handoff",
  prompt: '`$()\\<>&|;"\'',
}
```

**アサーション**:

- `buildForSurface(input)` がエラーをスローしないこと
- `result.terminalCommand` が文字列として取得できること
- `result.terminalCommand` に未エスケープのシェル特殊文字が含まれないこと

#### A-4: 日本語・マルチバイト文字の prompt

**目的**: 日本語等のマルチバイト文字が含まれる prompt で `terminalCommand` が正しく生成されること。

**入力**:

```typescript
{
  surfaceType: "chat-edit",
  skillName: "日本語スキル",
  reason: "terminal_handoff",
  prompt: "日本語のプロンプトです。テスト用。",
}
```

**アサーション**:

- `buildForSurface(input)` がエラーをスローしないこと
- `result.terminalCommand` が `"claude -p "` で始まること
- `result.terminalCommand` が正しく文字列として取得できること

### B. 旧メソッド回帰テスト（TerminalHandoffBuilder.test.ts に追加）

#### B-1: chat-edit/TerminalHandoffBuilder の build() が依然として動作すること

**目的**: `@deprecated` を付与した旧メソッドが後方互換性を維持し、既存の呼び出しコードが壊れないこと。

**対象ファイル**: `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts`

**アサーション**:

- 旧 `build()` メソッドが呼び出し可能であること
- 旧 `build()` の戻り値が期待するフォーマットであること
- `@deprecated` JSDoc が付与されていること（型チェックで警告が出ること）

### C. 呼び出し元ハンドラー統合テスト

#### C-1: chatEditHandlers — buildForSurface 経由のガイダンス生成

**目的**: `chatEditHandlers.ts` が `buildForSurface({ surfaceType: "chat-edit", ... })` を経由してハンドオフガイダンスを生成すること。

**モック戦略**:

- `TerminalHandoffBuilder.buildForSurface` をモック化し、呼び出し引数を検証する
- IPC イベントオブジェクトをモック化する

**アサーション**:

- `buildForSurface` が `{ surfaceType: "chat-edit" }` を含む引数で呼び出されること
- ハンドラーの返却値に `terminalCommand` が含まれること

#### C-2: agentHandlers — buildForSurface 経由のガイダンス生成

**目的**: `agentHandlers.ts` が `buildForSurface({ surfaceType: "runtime", ... })` を経由してハンドオフガイダンスを生成すること。

**アサーション**:

- `buildForSurface` が `{ surfaceType: "runtime" }` を含む引数で呼び出されること

#### C-3: skillHandlers — buildForSurface 経由のガイダンス生成

**目的**: `skillHandlers.ts` が `buildForSurface({ surfaceType: "skill-docs", ... })` を経由してハンドオフガイダンスを生成すること。

**アサーション**:

- `buildForSurface` が `{ surfaceType: "skill-docs" }` を含む引数で呼び出されること

### D. RuntimeSkillCreatorFacade 戻り値型回帰テスト

#### D-1: HandoffGuidance 型への変更が Facade の戻り値に反映されること

**目的**: `RuntimeSkillCreatorFacade` の戻り値型が `HandoffGuidance` に変更されたことを検証する。

**アサーション**:

- Facade の戻り値が `terminalCommand`、`contextSummary`、`reason` を持つこと
- 旧戻り値型のプロパティ（存在する場合）が削除または移行されていること
- TypeScript の型定義（型チェック）で `HandoffGuidance` 型が適用されていること

## カバレッジ目標

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 90%      | 95%      |
| Branch Coverage   | 70%      | 80%      |
| Function Coverage | 90%      | 95%      |

## 重点カバレッジ確認箇所

`buildForSurface()` 内の以下の分岐が全て網羅されていること:

| 分岐                                      | 担当テストケース      |
| ----------------------------------------- | --------------------- |
| `surfaceType === "chat-edit"` の処理パス  | ケース 1〜4、A-1、A-4 |
| `surfaceType === "runtime"` の処理パス    | ケース 5〜8、A-2      |
| `surfaceType === "skill-docs"` の処理パス | ケース 9〜12、A-3     |
| `default`（未知 surfaceType）パス         | ケース 13             |
| `sanitizePrompt()` の各エスケープ分岐     | ケース 14、A-3        |
| `prompt` が `undefined` のパス            | ケース 15             |

## 実行コマンド

### テスト追加後の全ケース実行

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/TerminalHandoffBuilder.test.ts
```

### ハンドラー統合テスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/
```

### カバレッジ計測（Phase 7 に引き継ぐ）

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/services/runtime/__tests__/TerminalHandoffBuilder.test.ts
```

## 成果物

| ファイルパス                                                                         | 追加内容                                     |
| ------------------------------------------------------------------------------------ | -------------------------------------------- |
| `apps/desktop/src/main/services/runtime/__tests__/TerminalHandoffBuilder.test.ts`    | 境界値テスト A-1〜A-4、回帰テスト B-1 を追加 |
| `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.test.ts`                       | 統合テスト C-1 を追加                        |
| `apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts`                          | 統合テスト C-2 を追加                        |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                          | 統合テスト C-3 を追加                        |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | 回帰テスト D-1 を追加                        |

## 完了条件

- [ ] 全追加テストが Green（PASS）であること
- [ ] `buildForSurface()` の全分岐がテストで網羅されていること
- [ ] カバレッジ計測が実行可能な状態になっていること（Phase 7 への引き継ぎ準備）
- [ ] 追加テストが既存 16 ケースと重複していないこと
- [ ] モックが適切に設定され、テスト間で状態がリークしていないこと（`beforeEach` でリセット）

---

## 統合テスト連携

本 Phase で追加する統合テスト:

- C-1: chatEditHandlers → `buildForSurface({ surfaceType: "chat-edit" })` 経由確認
- C-2: agentHandlers → `buildForSurface({ surfaceType: "runtime" })` 経由確認
- C-3: skillHandlers → `buildForSurface({ surfaceType: "runtime" })` 経由確認
- D-1: RuntimeSkillCreatorFacade → HandoffGuidance 型回帰確認

---

## 多角的チェック観点

| 観点               | 確認内容                                         | 該当テスト    |
| ------------------ | ------------------------------------------------ | ------------- |
| セキュリティ       | shell 特殊文字サニタイズが境界値でも機能するか   | A-3           |
| データ整合性       | 空文字列・超長文・マルチバイト文字で破綻しないか | A-1, A-2, A-4 |
| エラーハンドリング | 旧メソッドの後方互換性が維持されているか         | B-1           |

---

## サブタスク管理

Phase 実行開始時に以下のサブタスクを作成すること:

- [ ] 境界値テスト（A-1〜A-4）を追加する
- [ ] 旧メソッド回帰テスト（B-1）を追加する
- [ ] ハンドラー統合テスト（C-1〜C-3）を追加する
- [ ] RuntimeSkillCreatorFacade 回帰テスト（D-1）を追加する
- [ ] 全テストが Green であることを確認する

## タスク100%実行確認【必須】

- [ ] 全サブタスクが完了している
- [ ] 追加テストが既存16ケースと重複していない

## 次 Phase

Phase 7: カバレッジ確認 (`phase-7-coverage.md`)
