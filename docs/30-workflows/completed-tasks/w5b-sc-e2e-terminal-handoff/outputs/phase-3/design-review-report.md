# Phase 3 設計レビュー報告書

## 判定結果: PASS

---

## レビュー概要

| 項目                 | 結果 | 詳細                                                      |
| -------------------- | ---- | --------------------------------------------------------- |
| テストシナリオ網羅性 | PASS | AC-1〜AC-8 全件カバー（AC-3 は w5a で検証済み）           |
| IPC レスポンス整合性 | PASS | P60 修正済み。error は string 型で実装と一致              |
| テストインフラ実現性 | PASS | 既存パターン（skillCreatorIpc.integration.test.ts）に準拠 |
| TerminalHandoff 検証 | PASS | HandoffGuidance 型がコードベースで確認済み                |
| 後方互換テスト       | PASS | skill:create ハンドラーが skillHandlers.ts に存在         |

---

## 1. テストシナリオ網羅性確認

### AC カバレッジ

| AC   | カバー状態 | 対応シナリオ            |
| ---- | ---------- | ----------------------- |
| AC-1 | カバー済み | シナリオA               |
| AC-2 | カバー済み | シナリオA               |
| AC-3 | w5a 担当   | w5a（ストリーミングUI） |
| AC-4 | カバー済み | シナリオB               |
| AC-5 | カバー済み | シナリオD               |
| AC-6 | カバー済み | シナリオA（verify）     |
| AC-7 | カバー済み | シナリオC               |
| AC-8 | カバー済み | シナリオE               |

結果: **全 AC カバー済み**

### NFR カバレッジ

| NFR   | カバー状態 | 検証方法                                               |
| ----- | ---------- | ------------------------------------------------------ |
| NFR-1 | カバー済み | セキュリティテスト（エラーレスポンスのサニタイズ検証） |
| NFR-2 | カバー済み | vi.useFakeTimers() によるタイムアウト検証              |
| NFR-3 | カバー済み | シナリオE（skill:create 後方互換）                     |
| NFR-4 | カバー済み | シナリオC（エラー後リトライ可能性）                    |

結果: **全 NFR カバー済み**

---

## 2. IPC レスポンス形式の整合性確認（P60 対策）

### 確認結果

コードベースの実装を直接確認した結果:

| ファイル                  | 行番号   | 確認内容                                                        |
| ------------------------- | -------- | --------------------------------------------------------------- |
| `skillCreatorHandlers.ts` | L39-43   | `IpcResult<T> = { success: boolean; data?: T; error?: string }` |
| `creatorHandlers.ts`      | L24-28   | 同一の `IpcResult<T>` 定義                                      |
| `creatorHandlers.ts`      | L118-126 | plan ハンドラーの catch 句: `sanitizeErrorMessage()` → string   |
| `creatorHandlers.ts`      | L172-181 | execute ハンドラーの catch 句: 同上                             |
| `creatorHandlers.ts`      | L220-228 | improve ハンドラーの catch 句: 同上                             |

**結論**: エラーレスポンスの `error` フィールドは `string` 型。Phase 2 設計書は実装と一致している。

### index.md との差異

`index.md` の IPC インベントリには `{ success: true, data: { steps: string[], estimatedTime: number } }` のようなレスポンス形式が記載されているが、実際の実装（`RuntimeSkillCreatorPlanResult`）は `{ planId, skillSpec, estimatedSteps, skillName, ... }` である。Phase 2 設計書ではコードベースの実装に準拠した正しい型を使用している。

---

## 3. テストインフラの実現可能性確認

### モックパターン

`skillCreatorIpc.integration.test.ts` で検証済みのパターンを使用:

- `vi.mock("electron")` + `handlerMap` パターン: **動作確認済み**
- `MockBrowserWindow` + `webContents.send` スパイ: **動作確認済み**
- `createMockEvent()` for `IpcMainInvokeEvent`: **動作確認済み**

### RuntimeSkillCreatorFacade モック

`creatorHandlers.ts` の `registerRuntimeSkillCreatorHandlers()` は `runtimeSkillCreatorService?: RuntimeSkillCreatorFacade` を受け取る。`vi.fn()` でモックしたオブジェクトを渡すことで Facade 層をモック可能。

**確認**: LLM アダプター（`ILLMAdapter`）を直接モックする必要はない。Facade 層で全ての LLM 呼び出しがラップされている。

### テスト実行環境

- 実行コマンド: `cd apps/desktop && pnpm vitest run src/test/e2e/`
- P40 対策: `apps/desktop` ディレクトリから実行
- P63 対策: インポートパスは `../../preload/channels` 等の相対パスを使用（既存テストと同一）

---

## 4. TerminalHandoff 検証確認

### HandoffGuidance 型の確認

`packages/shared/src/types/handoff.ts` にて定義:

```typescript
export interface HandoffGuidance {
  terminalCommand: string;
  contextSummary: string;
  reason: string;
}
```

### Plan レスポンスの TerminalHandoff 分岐

`packages/shared/src/types/skillCreator.ts` L408-413:

```typescript
export type RuntimeSkillCreatorPlanResponse =
  | RuntimeSkillCreatorPlanResult
  | { type: "terminal_handoff"; guidance: HandoffGuidance };
```

**確認済み**: 型定義がコードベースに存在し、テストでの検証が可能。

### 発火条件

`RuntimeSkillCreatorFacade.plan()` L108-122: `authMode: "api-key"` かつ `apiKey` が null/空の場合に `resolveDecision()` が `terminal_handoff` を返す。テストでは Facade をモックして `terminal_handoff` レスポンスを直接返却する方法と、Facade の内部ロジックをテストする方法の両方が可能。

---

## 5. 後方互換テスト確認

### skill:create ハンドラーの存在確認

- `skillHandlers.ts` に `IPC_CHANNELS.SKILL_CREATE` のハンドラーが登録されている
- `channels.ts` L185: `SKILL_CREATE: "skill:create"` が定義されている
- 新規の `skill-creator:plan` 等とはチャネル名が異なるため、共存可能

---

## 6. 指摘事項

### 指摘なし（PASS）

設計に重大な問題は検出されなかった。以下の点が適切に対処されている:

1. P60 修正: エラーレスポンスの `error` は `string` 型で統一
2. 既存テストパターンの踏襲: `handlerMap` パターンを使用
3. AC/NFR の網羅性: 全件カバー
4. TerminalHandoff 型: コードベースで確認済み

---

## 次フェーズへの引き継ぎ

Phase 4（テスト作成）に進む際の注意事項:

1. `skill-creator:verify` チャネルは未実装のため、Phase 5（実装）で追加するまでテストはスキップ（`.todo`）で記述する
2. `skill-creator:cancel` チャネルは本タスクのスコープ外
3. Facade モックは `plan` / `execute` / `improve` / `applyImprovement` の 4 メソッドをカバーする
4. テストファイルは `apps/desktop/src/test/e2e/` に配置する（既存の `apps/desktop/src/main/ipc/__tests__/` とは分離）
