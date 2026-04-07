# Phase 4 テストマトリクス（TASK-UI-03）

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| 作成日     | 2026-04-06                                |
| ステータス | complete                                  |
| 対象タスク | TASK-UI-03 Skill Creator IPC 二重経路統合 |
| 採用方針   | B（明確な分離契約）                       |

---

## IPC レスポンス形式の事前合意

Phase 5 実装の前提として両経路のレスポンス形式を確定する。

| 経路        | API オブジェクト                | ハンドラーファイル         | レスポンス形式                                                     | エラー形式                                    |
| ----------- | ------------------------------- | -------------------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| Runtime IPC | `window.skillCreatorAPI`        | `creatorHandlers.ts`       | `{ success: true, data: T }` / `{ success: false, error: string }` | `{ success: false, error: string }` を return |
| Session IPC | `window.skillCreatorSessionAPI` | `SkillCreatorIpcBridge.ts` | 直接値（`void` / `UserInputQuestion` 等）                          | `throw new Error(...)` を throw               |

### MINOR-01 方針（Session IPC エラー形式）

Session IPC のエラーハンドリングは現状 `throw` 形式のままとする（Phase 5 スコープ内の低優先対応）。
テストでは「throw が伝播すること」を検証する形式を採用し、Runtime IPC の IpcResult パターンとは意図的に分けて検証する。

---

## 1. テストマトリクス全体

### 凡例

- **種別**: U = ユニットテスト / I = 統合テスト
- **ステータス**: new = 新規作成必要 / modify = 既存修正必要 / exists = 既存のまま pass する予定

| 仕様番号 | テスト名                                                                                                     | テストファイル                            | 種別 | AC 対応    | ステータス |
| -------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ---- | ---------- | ---------- |
| TC-I-01  | `electronAPI.skillCreator` が preload から削除されている                                                     | `index.ts` preload unit test              | U    | AC-3       | new        |
| TC-I-02  | `electronAPI.skillCreatorSession` が preload から削除されている                                              | `index.ts` preload unit test              | U    | AC-3       | new        |
| TC-I-03  | `window.skillCreatorAPI` が contextBridge 経由で公開されている                                               | `index.ts` preload unit test              | U    | AC-3       | exists     |
| TC-I-04  | `window.skillCreatorSessionAPI` が contextBridge 経由で公開されている                                        | `index.ts` preload unit test              | U    | AC-3       | exists     |
| TC-I-05  | `ElectronAPI` 型から `skillCreator` フィールドが除去されている                                               | TypeScript 型チェック                     | U    | AC-3       | new        |
| TC-I-06  | `ElectronAPI` 型から `skillCreatorSession` フィールドが除去されている                                        | TypeScript 型チェック                     | U    | AC-3       | new        |
| TC-I-07  | `GovernanceSummaryPanel` が `window.skillCreatorAPI.getGovernanceState` を使用する                           | `GovernanceSummaryPanel.test.tsx`         | U    | AC-3, AC-7 | modify     |
| TC-I-08  | `ImprovementProposalPanel` が `window.skillCreatorAPI.applyRuntimeImprovement` を使用する                    | `ImprovementProposalPanel.test.tsx`       | U    | AC-3, AC-7 | new        |
| TC-I-09  | `GovernanceSummaryPanel` で `window.electronAPI.skillCreator` が未定義でも動作する（後方互換テスト削除確認） | `GovernanceSummaryPanel.test.tsx`         | U    | AC-3, AC-7 | modify     |
| TC-I-10  | `SKILL_CREATOR_GET_ADAPTER_STATUS` ハンドラーが 1 回のみ登録される                                           | `creatorHandlers.adapterStatus.test.ts`   | U    | AC-4       | modify     |
| TC-I-11  | 重複ハンドラー除去後も `getAdapterStatus` の正常系レスポンスが変わらない                                     | `creatorHandlers.adapterStatus.test.ts`   | U    | AC-4, AC-7 | exists     |
| TC-I-12  | `registerRuntimeSkillCreatorHandlers` が `ipcMain.handle` を二重呼び出ししない                               | `ipc-double-registration.test.ts`         | I    | AC-4       | modify     |
| TC-I-13  | Session IPC チャネル（`startSession`/`sendAnswer`）が Runtime IPC と分離されている                           | `skillCreatorHandlers.runtime.test.ts`    | U    | AC-1, AC-2 | exists     |
| TC-I-14  | Runtime IPC チャネル全件が `ALLOWED_INVOKE_CHANNELS` に登録されている                                        | `creatorHandlers.test.ts`                 | U    | AC-5       | exists     |
| TC-I-15  | Session IPC チャネル全件が `ALLOWED_INVOKE_CHANNELS` に登録されている                                        | `skillCreatorHandlers.validation.test.ts` | U    | AC-5       | exists     |
| TC-I-16  | Runtime IPC の全ハンドラーで `validateSender` が呼ばれる                                                     | `creatorHandlers.test.ts`                 | U    | AC-6       | exists     |
| TC-I-17  | Session IPC の `assertSender` が `startSession` ハンドラーで呼ばれる                                         | `skillCreatorHandlers.security.test.ts`   | U    | AC-6       | exists     |
| TC-I-18  | Session IPC の `assertSender` が `sendAnswer` ハンドラーで呼ばれる                                           | `skillCreatorHandlers.security.test.ts`   | U    | AC-6       | exists     |
| TC-I-19  | 不正 sender による Runtime IPC 呼び出しが拒否される                                                          | `creatorHandlers.adapterStatus.test.ts`   | U    | AC-6       | exists     |
| TC-I-20  | 不正 sender による Session IPC 呼び出しが拒否される                                                          | `skillCreatorHandlers.security.test.ts`   | U    | AC-6       | exists     |
| TC-I-21  | `skillCreatorIpc.integration.test.ts` が全テスト pass する                                                   | `skillCreatorIpc.integration.test.ts`     | I    | AC-7       | exists     |
| TC-I-22  | `GovernanceSummaryPanel.test.tsx` の全テストが pass する                                                     | `GovernanceSummaryPanel.test.tsx`         | U    | AC-7       | modify     |
| TC-I-23  | Runtime IPC エラー時に `{ success: false, error: string }` が返る                                            | `creatorHandlers.test.ts`                 | U    | AC-1       | exists     |
| TC-I-24  | Session IPC エラー時に `throw new Error(...)` が伝播する（MINOR-01）                                         | `skillCreatorHandlers.security.test.ts`   | U    | AC-1       | exists     |
| TC-I-25  | `unregisterRuntimeSkillCreatorHandlers` で全ハンドラーが削除される                                           | `creatorHandlers.test.ts`                 | U    | AC-4, AC-7 | exists     |

---

## 2. 変更対象ファイル別テスト計画

### 2-1. `apps/desktop/src/preload/index.ts` — `electronAPI.skillCreator` / `skillCreatorSession` 削除

**変更内容**:

- `electronAPI` オブジェクトから `skillCreator: skillCreatorAPI` を削除
- `electronAPI` オブジェクトから `skillCreatorSession: skillCreatorSessionAPI` を削除
- `ElectronAPI` 型定義ファイルから対応するフィールドを削除

**テスト方針**:

| テスト番号 | 検証内容                                                                   | 検証方法                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-I-01    | 削除後、`window.electronAPI.skillCreator` が `undefined` になること        | preload unit test で `contextBridge.exposeInMainWorld` の呼び出し引数をスパイし、`electronAPI` オブジェクトに `skillCreator` キーが存在しないことを assert |
| TC-I-02    | 削除後、`window.electronAPI.skillCreatorSession` が `undefined` になること | 同上、`skillCreatorSession` キーが存在しないことを assert                                                                                                  |
| TC-I-03    | `window.skillCreatorAPI` が引き続き公開されていること                      | `contextBridge.exposeInMainWorld` が `"skillCreatorAPI"` 引数で呼ばれることを確認                                                                          |
| TC-I-04    | `window.skillCreatorSessionAPI` が引き続き公開されていること               | `contextBridge.exposeInMainWorld` が `"skillCreatorSessionAPI"` 引数で呼ばれることを確認                                                                   |
| TC-I-05    | `ElectronAPI` 型に `skillCreator` プロパティが存在しないこと               | TypeScript コンパイルエラーが出ないことを `tsc --noEmit` で確認（削除後に参照するコードがコンパイルエラーになること）                                      |
| TC-I-06    | `ElectronAPI` 型に `skillCreatorSession` プロパティが存在しないこと        | 同上                                                                                                                                                       |

**前提**: TC-I-07, TC-I-08 で対象コンポーネントを移行済みであること。

---

### 2-2. `GovernanceSummaryPanel.tsx` — `electronAPI.skillCreator` → `skillCreatorAPI` 移行後テスト

**変更内容** (`GovernanceSummaryPanel.tsx`):

- `getGovernanceApi()` 関数内の参照を `window.electronAPI?.skillCreator` から `window.skillCreatorAPI` に変更

**テスト方針**:

| テスト番号 | 検証内容                                                                           | 検証方法                                                                                                                            |
| ---------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| TC-I-07    | `window.skillCreatorAPI.getGovernanceState` が呼ばれること                         | `window.skillCreatorAPI` を vi.fn() でモックし、コンポーネントが `window.skillCreatorAPI.getGovernanceState` を呼ぶことを assert    |
| TC-I-09    | `window.electronAPI.skillCreator` の mock がなくても正常動作すること（修正後確認） | `window.electronAPI` を `{}` でセットし、`window.skillCreatorAPI` のみ mock した状態でレンダリングが成功することを確認              |
| TC-I-22    | 既存 TC-R-01 〜 TC-R-14 が全 pass すること                                         | `GovernanceSummaryPanel.test.tsx` の既存テストをそのまま実行し、全 pass を確認（mock 先を `window.skillCreatorAPI` に切り替えた後） |

**既存テストの修正箇所**（`GovernanceSummaryPanel.test.tsx`）:

```typescript
// 修正前（line 48-55 の setupMockApi 関数）
Object.defineProperty(window, "electronAPI", {
  value: { skillCreator: { getGovernanceState: mockFn } },
  writable: true,
  configurable: true,
});

// 修正後
Object.defineProperty(window, "skillCreatorAPI", {
  value: { getGovernanceState: mockFn },
  writable: true,
  configurable: true,
});
```

**TC-R-11 の修正**: `window.electronAPI.skillCreator が未定義の場合はローディング表示` のテストケースを、
`window.skillCreatorAPI が未定義の場合はローディング表示` に置き換える。

---

### 2-3. `ImprovementProposalPanel.tsx` — `electronAPI.skillCreator` → `skillCreatorAPI` 移行後テスト

**変更内容** (`ImprovementProposalPanel.tsx`):

- `handleApply` 内の `window.electronAPI.skillCreator.applyRuntimeImprovement(...)` を
  `window.skillCreatorAPI.applyRuntimeImprovement(...)` に変更

**テスト方針**:

| テスト番号 | 検証内容                                                        | 検証方法                                                                                                                   |
| ---------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| TC-I-08    | `window.skillCreatorAPI.applyRuntimeImprovement` が呼ばれること | `window.skillCreatorAPI` を vi.fn() でモックし、Apply ボタンクリック後に `applyRuntimeImprovement` が呼ばれることを assert |

**新規テストファイル**: `ImprovementProposalPanel.test.tsx`（`__tests__` ディレクトリ内）

```typescript
// テスト構造（推奨）
describe("ImprovementProposalPanel", () => {
  describe("API 移行後の IPC 経路確認", () => {
    it("TC-I-08: window.skillCreatorAPI.applyRuntimeImprovement が呼ばれる", async () => {
      // mock: window.skillCreatorAPI = { applyRuntimeImprovement: vi.fn() }
      // action: Apply ボタンクリック
      // assert: window.skillCreatorAPI.applyRuntimeImprovement が呼ばれたこと
    });

    it("applyRuntimeImprovement 成功時に onApplyComplete が呼ばれる", async () => {});
    it("applyRuntimeImprovement 失敗時にエラーが表示される", async () => {});
    it("window.skillCreatorAPI が未定義の場合 Apply ボタンがエラーになる", async () => {});
  });
});
```

---

### 2-4. `creatorHandlers.ts` — `SKILL_CREATOR_GET_ADAPTER_STATUS` 重複ハンドラー除去テスト

**変更内容** (`creatorHandlers.ts`):

- lines 254-287 の重複 `ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS, ...)` を除去

**テスト方針**:

| テスト番号 | 検証内容                                                                         | 検証方法                                                                                                            |
| ---------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| TC-I-10    | `ipcMain.handle` が `SKILL_CREATOR_GET_ADAPTER_STATUS` に対して 1 回のみ呼ばれる | `vi.mocked(ipcMain.handle)` の呼び出し回数を確認し、同チャネルへの登録が 1 回のみであることを assert                |
| TC-I-11    | 除去後も `getAdapterStatus` の正常系レスポンスが変わらない                       | 既存の T-IPC-02 (ready 状態), T-IPC-03 (failed 状態) が全 pass すること                                             |
| TC-I-12    | 二重登録テストファイルで重複登録が検出されないこと                               | `ipc-double-registration.test.ts` の `SKILL_CREATOR_GET_ADAPTER_STATUS` 関連テストが pass すること                  |
| TC-I-25    | `unregisterRuntimeSkillCreatorHandlers` で `removeHandler` が 1 回呼ばれる       | `vi.mocked(ipcMain.removeHandler)` で `SKILL_CREATOR_GET_ADAPTER_STATUS` への呼び出しが 1 回のみであることを assert |

**`creatorHandlers.adapterStatus.test.ts` への追加テストケース**:

```typescript
// TC-I-10 に対応する追加テスト
it("TC-I-10: SKILL_CREATOR_GET_ADAPTER_STATUS ハンドラーが 1 回のみ登録される", () => {
  registerRuntimeSkillCreatorHandlers(mainWindow, service);

  const handleCalls = vi
    .mocked(ipcMain.handle)
    .mock.calls.filter(
      ([channel]) => channel === IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
    );

  expect(handleCalls).toHaveLength(1);
});
```

---

## 3. テスト種別と対象ファイル一覧

| テスト種別 | テストファイル                                                                                       | 対象プロダクションファイル                                  | 主な検証対象               |
| ---------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------- |
| ユニット   | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/GovernanceSummaryPanel.test.tsx` | `GovernanceSummaryPanel.tsx`                                | IPC 移行後の API 参照      |
| ユニット   | `apps/desktop/src/renderer/components/skill/__tests__/ImprovementProposalPanel.test.tsx` (新規)      | `ImprovementProposalPanel.tsx`                              | IPC 移行後の API 参照      |
| ユニット   | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts`                          | `creatorHandlers.ts`                                        | 重複ハンドラー除去確認     |
| ユニット   | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`                                        | `creatorHandlers.ts`                                        | ハンドラー登録・解除       |
| 統合       | `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`                                | `creatorHandlers.ts` + `SkillCreatorIpcBridge.ts`           | 二重登録が発生しないこと   |
| ユニット   | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts`                          | `SkillCreatorIpcBridge.ts`                                  | Session IPC セキュリティ   |
| ユニット   | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts`                        | `SkillCreatorIpcBridge.ts`                                  | Session IPC バリデーション |
| ユニット   | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts`                           | `SkillCreatorIpcBridge.ts` / `creatorHandlers.ts`           | 経路分離の確認             |
| 統合       | `apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts`                            | `creatorHandlers.ts` + `SkillCreatorIpcBridge.ts` + preload | エンドツーエンドの IPC     |

---

## 4. IPC レスポンス形式の検証方針

### Runtime IPC（`creatorHandlers.ts`）— `{ success, data?, error? }` パターン

すべてのハンドラーが以下の形式で返ることを assert する:

```typescript
// 正常系
expect(result).toEqual({ success: true, data: expect.anything() });

// エラー系（バリデーションエラー）
expect(result).toMatchObject({ success: false, error: expect.any(String) });

// エラー系（サービス未初期化）
expect(result).toMatchObject({
  success: false,
  error: "Runtime Skill Creator は現在利用できません",
});
```

**例外**: `SKILL_CREATOR_EXECUTE_PLAN` のみ `{ accepted: true, planId: string }` を返す（fire-and-forget パターン）。

### Session IPC（`SkillCreatorIpcBridge.ts`）— throw パターン（MINOR-01）

Session IPC は `throw new Error(...)` を使用し、Renderer 側は try/catch で受け取る。
テストでは以下の形式で検証する:

```typescript
// Session IPC の不正呼び出し
await expect(handler(unauthorizedEvent)).rejects.toThrow(
  "[SkillCreatorIpcBridge] IPC sender does not match the active window",
);
```

---

## 5. AC 対応表（受入条件との対応）

| 受入条件 | 条件内容                                  | 対応テスト番号                                                         |
| -------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| AC-1     | IPC 経路が統一された設計方針を持つ        | TC-I-13, TC-I-23, TC-I-24                                              |
| AC-2     | 新機能開発者が IPC 経路を迷わず選択できる | TC-I-13                                                                |
| AC-3     | preload API surface が整理されている      | TC-I-01, TC-I-02, TC-I-03, TC-I-04, TC-I-05, TC-I-06, TC-I-07, TC-I-08 |
| AC-4     | creatorHandlers.ts のハンドラーが整合的   | TC-I-10, TC-I-11, TC-I-12, TC-I-25                                     |
| AC-5     | IPC 契約チェックリスト準拠                | TC-I-14, TC-I-15                                                       |
| AC-6     | セキュリティ要件が両経路で均一            | TC-I-16, TC-I-17, TC-I-18, TC-I-19, TC-I-20                            |
| AC-7     | 既存テストが pass                         | TC-I-09, TC-I-11, TC-I-21, TC-I-22, TC-I-25                            |

---

## 6. 完了条件チェックリスト

### Phase 4 成果物

- [x] テストマトリクス全体（TC-I-01 〜 TC-I-25）が定義されている
- [x] 変更対象ファイル別のテスト計画が記述されている
- [x] テスト種別（ユニット/統合）と対象ファイルが一覧化されている
- [x] IPC レスポンス形式（`{ success, data?, error? }` vs 直接値）の事前合意が文書化されている
- [x] AC-1 〜 AC-7 とテストの対応表が作成されている

### Phase 5 実装前の前提確認（Phase 4 で確認すべき事項）

- [ ] `GovernanceSummaryPanel.test.tsx` の `setupMockApi` を `window.skillCreatorAPI` mock に修正済み
- [ ] `ImprovementProposalPanel.test.tsx` の新規テストファイルが作成済み
- [ ] `creatorHandlers.adapterStatus.test.ts` に TC-I-10 用テストケースが追加済み
- [ ] `ipc-double-registration.test.ts` が `SKILL_CREATOR_GET_ADAPTER_STATUS` の二重登録を検出するテストを含む

### Phase 7 カバレッジ確認での検証対象

- [ ] `creatorHandlers.ts` の変更行カバレッジ 80% 以上
- [ ] `GovernanceSummaryPanel.tsx` の `getGovernanceApi()` 関数のカバレッジ 100%
- [ ] `ImprovementProposalPanel.tsx` の `handleApply` 関数のカバレッジ 80% 以上

---

## 7. テスト実行コマンド

```bash
# GovernanceSummaryPanel テスト単体実行
pnpm --filter @repo/desktop vitest run --reporter verbose src/renderer/components/organisms/AgentView/__tests__/GovernanceSummaryPanel.test.tsx

# ImprovementProposalPanel テスト単体実行（新規作成後）
pnpm --filter @repo/desktop vitest run --reporter verbose src/renderer/components/skill/__tests__/ImprovementProposalPanel.test.tsx

# creatorHandlers 関連テスト
pnpm --filter @repo/desktop vitest run --reporter verbose src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts
pnpm --filter @repo/desktop vitest run --reporter verbose src/main/ipc/__tests__/creatorHandlers.test.ts

# 二重登録テスト
pnpm --filter @repo/desktop vitest run --reporter verbose src/main/ipc/__tests__/ipc-double-registration.test.ts

# 統合テスト
pnpm --filter @repo/desktop vitest run --reporter verbose src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts

# 全 creator 関連テスト
pnpm --filter @repo/desktop vitest run --reporter verbose src/main/ipc/__tests__/creatorHandlers
pnpm --filter @repo/desktop vitest run --reporter verbose src/main/ipc/__tests__/skillCreatorHandlers
```

---

## 参照資料

| 資料名                          | パス                                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 設計書                          | `outputs/phase-2/design-document.md`                                                                 |
| 統合戦略書                      | `outputs/phase-2/ipc-unification-strategy.md`                                                        |
| creatorHandlers.ts              | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                                       |
| index.ts (preload)              | `apps/desktop/src/preload/index.ts`                                                                  |
| skill-creator-api.ts            | `apps/desktop/src/preload/skill-creator-api.ts`                                                      |
| skill-creator-session-api.ts    | `apps/desktop/src/preload/skill-creator-session-api.ts`                                              |
| GovernanceSummaryPanel.tsx      | `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx`                |
| ImprovementProposalPanel.tsx    | `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`                            |
| GovernanceSummaryPanel.test.tsx | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/GovernanceSummaryPanel.test.tsx` |
| adapterStatus テスト            | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts`                          |
