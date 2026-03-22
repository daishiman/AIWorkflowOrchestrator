# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 11                           |
| 機能名 | slide-runtime-alignment-impl |
| 作成日 | 2026-03-22                   |
| Issue  | #1363                        |

## 目的

Phase 10 で PASS した実装を、実際の動作観点から検証する。CLI 環境の制約を考慮した代替手段を用いて、slide IPC 経路の全シナリオを網羅的に確認する。

## CLI 環境の制約と代替手段

Electron GUI の直接操作は CLI 環境ではできないため、以下の代替手段を使用する。

| 代替手段                             | 用途                                               |
| ------------------------------------ | -------------------------------------------------- |
| Playwright E2E テスト                | UIシナリオの自動実行・アサーション                 |
| `webContents.capturePage()`          | 画面キャプチャの取得（必要な場合）                 |
| DevTools Console からの API 呼び出し | `window.slideApi` メソッドの手動実行（対話確認用） |
| Vitest 統合テスト                    | IPC 契約の自動検証                                 |

---

## テストシナリオ

### シナリオ MT-1: slide phase 実行（hearing）

**目的**: `slide:executePhase` ハンドラが `hearing` フェーズを正常に処理できることを確認する。

**検証方法（Playwright）**:

```typescript
// e2e/slide/execute-phase.spec.ts
test("hearing フェーズ実行", async ({ electronApp }) => {
  const window = await electronApp.firstWindow();

  // slide:executePhase を呼び出す
  const result = await window.evaluate(async () => {
    return await window.slideApi.executePhase("hearing", "/valid/project/path");
  });

  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
});
```

**DevTools Console 確認**:

```javascript
// Chrome DevTools Console で実行
const result = await window.slideApi.executePhase(
  "hearing",
  "/tmp/test-project",
);
console.log(JSON.stringify(result, null, 2));
```

**確認ポイント**:

- `result.success` が `true` （integrated モード）または `result.isHandoff` が `true`（handoff モード）
- handoff の場合 `result.guidance.command` が空でないこと

---

### シナリオ MT-2: slide phase 実行（structure）

**確認ポイント**:

- `hearing` フェーズと同様のレスポンス形式
- `result.phase` が `"structure"` であること

---

### シナリオ MT-3: slide phase 実行（html）

**確認ポイント**:

- `result.phase` が `"html"` であること

---

### シナリオ MT-4: slide phase 実行（modifier）

**目的**: `modifier-skill.ts` の統合が正しく動作することを確認する。

**確認ポイント**:

- `result.phase` が `"modifier"` であること
- integrated モードの場合、`buildModifierPrompt()` と `parseModifierResponse()` が呼ばれていること（ログで確認）

---

### シナリオ MT-5: watch start / stop

**目的**: `slide:watch-start` と `slide:watch-stop` が正常に動作することを確認する。

**DevTools Console 確認**:

```javascript
// watch 開始
const startResult = await window.slideApi.watchStart("/tmp/test-project");
console.log("Watch Start:", JSON.stringify(startResult));

// 少し待機
await new Promise((resolve) => setTimeout(resolve, 1000));

// watch 停止
const stopResult = await window.slideApi.watchStop("/tmp/test-project");
console.log("Watch Stop:", JSON.stringify(stopResult));
```

**確認ポイント**:

- `watchStart` 後に `slide:watch-status` push イベントが届くこと
- `watchStop` 後にイベントが停止すること
- 存在しないパスを渡した場合は `{ success: false, error: { code: "VALIDATION_ERROR" } }` が返ること（空文字・スペースのみでも同様）

---

### シナリオ MT-6: sync status 取得

**目的**: `slide:sync-status` が現在の同期状態を正しく返すことを確認する。

**DevTools Console 確認**:

```javascript
const status = await window.slideApi.getSyncStatus("/tmp/test-project");
console.log("Sync Status:", JSON.stringify(status));
```

**確認ポイント**:

- `result.success` が `true`
- `result.data.syncStatus` が `"synced" | "out-of-sync" | "syncing" | "error"` のいずれか

---

### シナリオ MT-7: reverse-sync（manual sync）実行

**目的**: `slide:reverse-sync`（旧 `manualSync`）が正しく機能することを確認する。

**確認ポイント**:

- 実行中に `slide:sync-progress` push イベントが届くこと
- 完了後に `slide:sync-status-changed` push イベントが届くこと
- エラー時に `slide:sync-error` push イベントが届くこと

---

### シナリオ MT-8: cancel 動作

**目的**: `slide:cancel` が実行中の処理を中断できることを確認する。

**検証方法（Playwright）**:

```typescript
test("実行中の phase を cancel できる", async ({ electronApp }) => {
  const window = await electronApp.firstWindow();

  // 実行開始（await しない）
  const executePromise = window.evaluate(async () => {
    return window.slideApi.executePhase("hearing", "/valid/project");
  });

  // 少し待ってから cancel
  await page.waitForTimeout(100);
  const cancelResult = await window.evaluate(async () => {
    return window.slideApi.cancel("/valid/project");
  });

  expect(cancelResult.success).toBe(true);
});
```

---

### シナリオ MT-9: handoff 時の guidance 表示確認

**目的**: handoff モード時に `HandoffGuidance` が適切に返されることを確認する。

**事前準備**: RuntimeResolver を `handoff` モードに設定した状態でテストを実行する。

**確認ポイント**:

- `result.isHandoff` が `true`
- `result.guidance.command` が空でなく、ターミナルで実行可能な形式
- `result.guidance.contextSummary` が具体的なプロジェクト状態を説明している
- `result.guidance.reason` が handoff の理由を平易な日本語で説明している

---

### シナリオ MT-10: エラー時のサニタイズ済みメッセージ確認

**目的**: エラー発生時に内部パス・スタックトレースが Renderer に漏洩しないことを確認する。

**テスト手法（Vitest 統合テスト）**:

```typescript
// src/main/slide/__tests__/error-sanitization.test.ts
it("内部パスがエラーメッセージに含まれない", async () => {
  // 意図的にエラーを発生させる
  const result = await ipcHandlerUnderTest.executePhase(
    "hearing",
    "/non-existent/path",
  );

  expect(result.success).toBe(false);
  expect(result.error.message).not.toContain("/Users/");
  expect(result.error.message).not.toContain("at "); // スタックトレース
  expect(result.error.code).toBeDefined();
});
```

---

### シナリオ MT-11: DevTools で `window.slideApi` の全メソッド確認

**目的**: Preload の contextBridge が全チャネルを正しく expose していることを確認する。

**DevTools Console 確認**:

```javascript
// slideApi が定義されていること
console.log("slideApi:", typeof window.slideApi);

// 全メソッドが定義されていること
const methods = [
  "executePhase",
  "watchStart",
  "watchStop",
  "getSyncStatus",
  "reverseSync",
  "cancel",
  "onSyncStatusChanged",
  "onSyncProgress",
  "onSyncError",
  "onExecutionProgress",
  "onStructureChanged",
  "onWatchStatus",
];

methods.forEach((method) => {
  const exists = typeof window.slideApi[method] === "function";
  console.log(`${method}: ${exists ? "OK" : "MISSING"}`);
});
```

**期待結果**: 全12メソッドが `"function"` と表示されること。

---

### シナリオ MT-12: P42 バリデーション確認

**目的**: 不正な入力がバリデーションで適切に拒否されることを確認する。

**DevTools Console 確認**:

```javascript
// 空文字
const r1 = await window.slideApi.executePhase("hearing", "");
console.log("空文字:", r1); // { success: false, error: { code: "VALIDATION_ERROR" } }

// スペースのみ（P42 対策）
const r2 = await window.slideApi.executePhase("hearing", "   ");
console.log("スペースのみ:", r2); // { success: false, error: { code: "VALIDATION_ERROR" } }

// パストラバーサル
const r3 = await window.slideApi.executePhase("hearing", "../../../etc/passwd");
console.log("パストラバーサル:", r3); // { success: false, error: { code: "SECURITY_ERROR" } }
```

---

## 実行コマンド

### Playwright E2E テスト実行

```bash
# E2E テストスイート実行
pnpm --filter @repo/desktop test:e2e

# slide 関連のみ
pnpm --filter @repo/desktop test:e2e -- --grep "slide"
```

### スクリーンショット取得（必要な場合）

```typescript
// Playwright でスクリーンショット
await page.screenshot({ path: "test-results/slide-handoff.png" });
```

または Electron の `webContents.capturePage()` を使用:

```typescript
const image = await mainWindow.webContents.capturePage();
require("fs").writeFileSync("test-results/slide-handoff.png", image.toPNG());
```

---

## 確認チェックリスト

| シナリオ | 確認内容                                                           | 結果 |
| -------- | ------------------------------------------------------------------ | ---- |
| MT-1     | hearing フェーズが正常に実行される                                 | -    |
| MT-2     | structure フェーズが正常に実行される                               | -    |
| MT-3     | html フェーズが正常に実行される                                    | -    |
| MT-4     | modifier フェーズが `skill-executor.ts` で処理される               | -    |
| MT-5     | watch start / stop が動作する                                      | -    |
| MT-6     | sync status が取得できる                                           | -    |
| MT-7     | reverse-sync が実行される                                          | -    |
| MT-8     | cancel が機能する                                                  | -    |
| MT-9     | handoff guidance が actionable な内容を返す                        | -    |
| MT-10    | エラー時に内部情報が漏洩しない                                     | -    |
| MT-11    | `window.slideApi` の全12メソッドが定義されている                   | -    |
| MT-12    | P42 バリデーション（空文字・スペース・パストラバーサル）が動作する | -    |

## 統合テスト連携

本 Phase のシナリオが全て確認済み（または代替手段による検証済み）となった場合に Phase 12 へ進む。

未確認項目は未タスク化して記録し、Phase 12 の未タスク検出レポートに含める。

## 成果物

| 成果物                           | パス                | 説明                                        |
| -------------------------------- | ------------------- | ------------------------------------------- |
| 手動テスト結果                   | Phase 11 テスト記録 | 全シナリオの PASS/FAIL 結果                 |
| スクリーンショット（可能な場合） | `outputs/phase-11/` | Playwright/capturePage による画面キャプチャ |

## 完了条件

- [ ] MT-1〜MT-4: 全 phase（hearing / structure / html / modifier）の実行が確認済み
- [ ] MT-5: watch start / stop の動作が確認済み
- [ ] MT-6: sync status 取得が確認済み
- [ ] MT-7: reverse-sync の動作が確認済み
- [ ] MT-8: cancel の動作が確認済み
- [ ] MT-9: handoff guidance の内容が actionable であることを確認済み
- [ ] MT-10: エラーサニタイズが機能していることを確認済み
- [ ] MT-11: `window.slideApi` の全12メソッドが定義されていることを確認済み
- [ ] MT-12: P42 バリデーションが全パターンで動作することを確認済み

## 次のPhase

Phase 12（ドキュメント更新）へ進む。
