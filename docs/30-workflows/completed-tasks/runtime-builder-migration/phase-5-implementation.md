# Phase 5: 実装

## メタ情報

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| タスクID   | UT-RUNTIME-BUILDER-MIGRATION-001                |
| Phase      | 5                                               |
| 担当       | Claude Code                                     |
| 前提成果物 | phase-4-test-creation.md（テスト Red 確認済み） |
| 作成日     | 2026-03-23                                      |

## 目的

`TerminalHandoffBuilder.buildForSurface()` を実装し、Phase 4 で作成した 16 ケースのテストを全て Green にする。あわせて、呼び出し元ハンドラーを `buildForSurface()` 経由に移行する。

## 実行タスク

以下 7 ステップを順序どおりに実施する。

## 参照資料

| 参照資料                 | パス                                                                   |
| ------------------------ | ---------------------------------------------------------------------- |
| Phase 2 設計書           | `docs/30-workflows/runtime-builder-migration/phase-2-design.md`        |
| Phase 4 テストケース仕様 | `docs/30-workflows/runtime-builder-migration/phase-4-test-creation.md` |
| P62 対策                 | `.claude/rules/06-known-pitfalls.md#P62`                               |
| P55 対策                 | `.claude/rules/06-known-pitfalls.md#P55`                               |
| P44 対策                 | `.claude/rules/06-known-pitfalls.md#P44`                               |
| P45 対策                 | `.claude/rules/06-known-pitfalls.md#P45`                               |

## ファイル変更スコープ

| #   | ファイルパス                                                          | 変更内容                                                              |
| --- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`    | `buildForSurface()` 追加、型定義追加、旧メソッドに `@deprecated` 付与 |
| 2   | `apps/desktop/src/main/ipc/chatEditHandlers.ts`                       | import 変更 + `buildForSurface()` 呼び出しに移行                      |
| 3   | `apps/desktop/src/main/ipc/agentHandlers.ts`                          | `buildForSurface()` 呼び出しに移行                                    |
| 4   | `apps/desktop/src/main/ipc/skillHandlers.ts`                          | `buildForSurface()` 呼び出しに移行                                    |
| 5   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `buildForSurface()` 呼び出しに移行 + 戻り値型調整                     |
| 6   | `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts`  | `build()` に `@deprecated` 付与                                       |

## 実装手順

### Step 1: 型定義追加

**対象ファイル**: `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`

Phase 2 設計書（Section 1.2）で定義された以下の型を追加する。

```typescript
/** buildForSurface() に渡す surface の種別 */
export type SurfaceType = "chat-edit" | "runtime" | "skill-docs";

/** buildForSurface() へのリクエスト型（discriminated union） */
export type BuildForSurfaceRequest =
  | ChatEditSurfaceRequest
  | RuntimeSurfaceRequest
  | SkillDocsSurfaceRequest;

export interface ChatEditSurfaceRequest {
  surfaceType: "chat-edit";
  /** 編集コマンドタイプ */
  commandType: string;
  /** 対象ファイルパスの配列 */
  filePaths: string[];
  /** ユーザーメッセージ（任意） */
  message?: string;
  /** ワークスペースパス（任意） */
  workspacePath?: string;
}

export interface RuntimeSurfaceRequest {
  surfaceType: "runtime";
  /** "agent" または "skill" のサブタイプ */
  runtimeType: "agent" | "skill";
  /** スキルID（任意） */
  skillId?: string;
  /** スキル名（任意） */
  skillName?: string;
  /** プロンプト（任意） */
  prompt?: string;
  /** 作業ディレクトリ（任意） */
  workingDirectory?: string;
}

export interface SkillDocsSurfaceRequest {
  surfaceType: "skill-docs";
  /** クエリテキスト */
  queryText?: string;
  /** スキル名（任意） */
  skillName?: string;
}
```

> **注意**: `HandoffGuidance` 型は `packages/shared/src/types/handoff.ts` からインポートする。ローカルで再定義しない。

**注意**:

- `surfaceType` は discriminated union の discriminant として使用し、exhaustive check を有効にする
- `HandoffGuidance` は `packages/shared/src/types/handoff.ts` の正本定義をインポートする

### Step 2: buildForSurface() メソッド実装

**対象ファイル**: `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`

実装要件:

1. **P62 対策（exhaustive check）**: `switch (request.surfaceType)` の `default` 節で `never` 型を使い、未知 surface 時にエラーをスローする

```typescript
switch (request.surfaceType) {
  // ...
  default: {
    const _exhaustiveCheck: never = request;
    throw new Error(
      `未知の surfaceType: ${(_exhaustiveCheck as { surfaceType: string }).surfaceType}`,
    );
  }
}
```

2. **P55 対策（sanitizePrompt）**: 全 surface で `sanitizePrompt()` を呼び出してシェル特殊文字をエスケープする

```typescript
function sanitizePrompt(prompt: string): string {
  // 二重引用符・バッククォート・$(...) をエスケープ
  return prompt
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/`/g, "\\`")
    .replace(/\$\(/g, "\\$(");
}
```

3. **デフォルト prompt**: `prompt` が `undefined` の場合は `""` または surface 固有のデフォルト文字列を使用する

4. **terminalCommand フォーマット**: `claude -p "<sanitized prompt>"` 形式で生成する

5. **contextSummary フォーマット**: surface ごとに異なるフォーマットで生成する（Phase 2 Section 2.3 準拠）
   - `chat-edit`: `"[chat-edit] command={commandType} files={filePaths.join(',')}"` 形式
   - `runtime`: `"[runtime] surface={runtimeType} skill={skillId||skillName||'unknown'}"` 形式
   - `skill-docs`: `"[skill-docs] query={queryText||'none'}"` 形式

### Step 3: 旧メソッドに @deprecated 付与

**対象ファイル**: `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`

旧メソッド（`build()` 等）に以下の JSDoc を付与する。

```typescript
/**
 * @deprecated buildForSurface() を使用してください。
 * このメソッドは後方互換性のため残存していますが、将来のバージョンで削除されます。
 * 移行先: TerminalHandoffBuilder.buildForSurface()
 */
```

### Step 4: chatEditHandlers.ts 移行

**対象ファイル**: `apps/desktop/src/main/ipc/chatEditHandlers.ts`

変更内容:

1. import 文を `chat-edit/TerminalHandoffBuilder` から `../services/runtime/TerminalHandoffBuilder` に変更する
2. `build()` の呼び出しを `buildForSurface({ surfaceType: "chat-edit", commandType: args.command.type, filePaths: args.contexts.map(ctx => ctx.filePath), message: args.message, workspacePath: args.workspacePath }, resolution.reason)` に変更する
3. `HandoffGuidance` 型を使用するよう戻り値の参照を更新する

**注意**: P44/P45 対策として、引数名と実際の値のセマンティクスが一致していることを確認すること。

### Step 5: agentHandlers.ts 移行

**対象ファイル**: `apps/desktop/src/main/ipc/agentHandlers.ts`

変更内容:

1. `runtime/TerminalHandoffBuilder` から `buildForSurface` をインポートする
2. ハンドオフガイダンス生成箇所を `buildForSurface({ surfaceType: "runtime", ... }, reason)` に変更する
3. `HandoffGuidance` 型を使用するよう戻り値の参照を更新する

### Step 6: skillHandlers.ts 移行

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`

変更内容:

1. `runtime/TerminalHandoffBuilder` から `buildForSurface` をインポートする
2. ハンドオフガイダンス生成箇所を `buildForSurface({ surfaceType: "runtime", runtimeType: "skill", ... }, reason)` に変更する（**重要**: `"skill-docs"` ではなく `surfaceType: "runtime"` + `runtimeType: "skill"` であること）
3. `HandoffGuidance` 型を使用するよう戻り値の参照を更新する

### Step 7: RuntimeSkillCreatorFacade.ts 移行

**対象ファイル**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

変更内容:

1. `buildForSurface` を使用するよう呼び出し箇所を更新する
2. 戻り値型を `HandoffGuidance` に調整する
3. Facade のパブリックインターフェースが変わる場合は、型定義ファイル（`types.ts` / `types.d.ts`）も同時に更新する（P23/P32 対策）

**注意**: `RuntimeSkillCreatorFacade` の戻り値型変更は、Preload 側の型定義にも影響する可能性がある。変更前に以下を確認すること:

```bash
grep -rn "RuntimeSkillCreatorFacade\|HandoffGuidance" apps/desktop/src/preload/
```

### Step 6b（完了後確認）: chat-edit/TerminalHandoffBuilder.ts への @deprecated 付与

**対象ファイル**: `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts`

`build()` メソッドに以下の JSDoc を付与する。

```typescript
/**
 * @deprecated buildForSurface() を使用してください。
 * このメソッドは後方互換性のため残存していますが、将来のバージョンで削除されます。
 * 移行先: runtime/TerminalHandoffBuilder.buildForSurface()
 */
```

## P62 対策チェックリスト

- [ ] `switch (request.surfaceType)` に `default` 節があること
- [ ] `default` 節で `never` 型による exhaustive check が実装されていること
- [ ] 未知 surface 時に明示的なエラーメッセージがスローされること
- [ ] `DEFAULT_CONFIG` への暗黙 fallback が存在しないこと

## P55 対策チェックリスト

- [ ] `sanitizePrompt()` 関数が実装されていること
- [ ] 二重引用符（`"`）がエスケープされること
- [ ] バッククォート（`` ` ``）がエスケープされること
- [ ] `$(...)` コマンド置換がエスケープされること
- [ ] バックスラッシュ（`\`）が最初にエスケープされること（順序が重要）

## 成果物

| ファイルパス                                                          | 変更種別                                 |
| --------------------------------------------------------------------- | ---------------------------------------- |
| `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`    | 新規追加（型定義 + `buildForSurface()`） |
| `apps/desktop/src/main/ipc/chatEditHandlers.ts`                       | 変更（import + 呼び出し移行）            |
| `apps/desktop/src/main/ipc/agentHandlers.ts`                          | 変更（呼び出し移行）                     |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                          | 変更（呼び出し移行）                     |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 変更（呼び出し移行 + 型調整）            |
| `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts`  | 変更（`@deprecated` 付与）               |

## 完了条件

- [ ] Phase 4 の 16 ケースが全て Green（PASS）になること
- [ ] `pnpm typecheck` がエラーなく通ること
- [ ] `pnpm lint` がエラーなく通ること
- [ ] P62 対策チェックリストが全て完了していること
- [ ] P55 対策チェックリストが全て完了していること
- [ ] 旧メソッドに `@deprecated` が付与されていること
- [ ] 呼び出し元 4 ファイルが全て `buildForSurface()` 経由に移行されていること

---

## 統合テスト連携

本 Phase の実装完了後、Phase 6（テスト拡充）でハンドラー統合テスト（C-1〜C-3）を追加する。Phase 4 の単体テストが全 Green であることを確認してから Phase 6 へ進むこと。

---

## 多角的チェック観点

| 観点                      | 確認内容                                                                                 | 確認方法         |
| ------------------------- | ---------------------------------------------------------------------------------------- | ---------------- |
| 型安全性                  | `surfaceType` discriminant が全 surface で一致しているか                                 | `pnpm typecheck` |
| セキュリティ（P55）       | `sanitizePrompt()` が全 surface で呼び出されているか                                     | コードレビュー   |
| エラーハンドリング（P62） | `switch (request.surfaceType)` に `default` 節があるか                                   | コードレビュー   |
| バグ防止（Step 6）        | `skillHandlers.ts` が `surfaceType: "runtime"` + `runtimeType: "skill"` を使用しているか | コードレビュー   |
| IPC 契約（P44/P45）       | 引数名のセマンティクスが実際の値と一致しているか                                         | コードレビュー   |

---

## サブタスク管理

- [ ] Step 1: 型定義追加（`TerminalHandoffBuilder.ts`）
- [ ] Step 2: `buildForSurface()` メソッド実装
- [ ] Step 3: 旧メソッドに `@deprecated` 付与
- [ ] Step 4: `chatEditHandlers.ts` 移行（`ipc/` パスで実施）
- [ ] Step 5: `agentHandlers.ts` 移行（`ipc/` パスで実施）
- [ ] Step 6: `skillHandlers.ts` 移行（`surfaceType: "runtime"` + `runtimeType: "skill"` で実施）
- [ ] Step 7: `RuntimeSkillCreatorFacade.ts` 移行
- [ ] Step 6b: `chat-edit/TerminalHandoffBuilder.ts` に `@deprecated` 付与
- [ ] P62 対策チェックリスト全件確認
- [ ] P55 対策チェックリスト全件確認
- [ ] `pnpm typecheck` と `pnpm lint` が通ること

## タスク100%実行確認【必須】

- [ ] 全サブタスクが完了している
- [ ] Phase 4 の 16 ケースが全て Green になっている

---

## 次 Phase

Phase 6: テスト拡充 (`phase-6-test-expansion.md`)
