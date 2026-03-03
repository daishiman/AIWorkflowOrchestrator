# [#765] "[UT-FIX-5-4] AgentSDKAPI型定義不一致修正"

## メタ情報

```yaml
task_id: UT-FIX-5-4
task_name: AgentSDKAPI型定義不一致修正
category: バグ修正（型安全性）
target_feature: Agent SDK API
priority: 高
scale: 小規模
status: 未着手
source_phase: UT-FIX-5-3 Phase 12 アーキテクチャ検証
created_date: 2026-02-10
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-fix-5-4-agent-sdk-api-type-mismatch.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 小規模 |
| ステータス | 未着手 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-5-3（Preload Agent Abort セキュリティ修正）のPhase 12完了後、アーキテクチャ検証において
`agentSDKAPI.abort()` メソッドの型定義と実装の不一致が発見された。

### 1.2 問題点・課題

#### 型定義と実装の不一致

| 箇所                                     | 型                                  |
| ---------------------------------------- | ----------------------------------- |
| `apps/desktop/src/preload/types.ts:1175` | `abort: () => void;`                |
| `packages/shared/src/agent/types.ts:236` | `abort(): void;`                    |
| `apps/desktop/src/preload/index.ts:423`  | `safeInvoke()` → `Promise<unknown>` |

実装では `safeInvoke(IPC_CHANNELS.AGENT_ABORT)` を呼び出しているが、`safeInvoke` 関数は
`ipcRenderer.invoke()` を使用しており、戻り値は `Promise<unknown>` となる。

#### 具体的な問題

1. **TypeScriptコンパイラの誤った型推論**:
   - 型定義が `void` のため、`.then()` や `await` が使用できない
   - IDE（VSCode等）で補完候補にPromiseメソッドが表示されない

2. **エラーハンドリングの欠落**:
   - 呼び出し側でPromise rejectionをキャッチできない
   - IPC通信エラーが無視される可能性がある

3. **一貫性の欠如**:
   - 同じAPIの他のメソッド（`createSession`, `destroySession`等）は正しく `Promise` を返す
   - `abort` のみが `void` として定義されており、API設計の一貫性を損なっている

### 1.3 放置した場合の影響

| 影響                   | 深刻度 | 説明                                                  |
| ---------------------- | ------ | ----------------------------------------------------- |
| エラーハンドリング不足 | 高     | IPC通信失敗時にエラーが検出されず、サイレント障害発生 |
| デバッグ困難           | 中     | Promiseの実際の動作と型定義が一致せず問題特定が困難   |
| 保守性低下             | 中     | 将来の開発者がAPIの動作を誤解する                     |
| 型安全性の破綻         | 中     | TypeScriptの静的解析が正しく機能しない                |

---

## 2. 何を達成するか（What）

### 2.1 目的

`agentSDKAPI.abort()` メソッドの型定義を実装と一致させ、型安全性を確保する。

### 2.2 最終ゴール

- 型定義を `abort: () => void` から `abort: () => Promise<void>` に修正
- 2箇所の型定義（`preload/types.ts` と `packages/shared/agent/types.ts`）を両方更新
- 呼び出し側でPromise処理が正しく行われることを確認

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/preload/types.ts` の `AgentSDKAPI.abort` 型修正
- `packages/shared/src/agent/types.ts` の `AgentAPI.abort` 型修正
- 既存の呼び出し箇所の確認とPromise処理追加（必要に応じて）
- 型修正に対応するテストケースの追加

#### 含まないもの

- `abort` メソッドの機能変更
- Main Process側のハンドラー修正（UT-FIX-5-3で完了済み）
- 他のAgentSDKAPIメソッドの修正

### 2.4 成果物

| 成果物       | 説明                                                        |
| ------------ | ----------------------------------------------------------- |
| 型定義修正   | `preload/types.ts` の `AgentSDKAPI.abort` 型更新            |
| 正本型修正   | `packages/shared/agent/types.ts` の `AgentAPI.abort` 型更新 |
| テスト追加   | 型互換性と非同期動作を検証するテストケース                  |
| ドキュメント | 仕様書更新（`api-ipc-agent.md` 等）                         |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-FIX-5-3（Preload Agent Abort セキュリティ修正）が完了していること
- `safeInvoke` 関数の戻り値が `Promise<T>` であることを理解していること

### 3.2 依存タスク

| タスクID   | タスク名                             | ステータス |
| ---------- | ------------------------------------ | ---------- |
| UT-FIX-5-3 | Preload Agent Abort セキュリティ修正 | 完了       |

### 3.3 必要な知識

- TypeScript型システム（Promise型、async/await）
- Electron IPC通信パターン（`ipcRenderer.invoke` / `ipcMain.handle`）
- `safeInvoke` ユーティリティ関数の動作

### 3.4 システム仕様書参照（aiworkflow-requirements）

| 仕様書                   | パス                                  | 参照理由                      |
| ------------------------ | ------------------------------------- | ----------------------------- |
| Agent IPC仕様            | `references/api-ipc-agent.md`         | IPCチャネル設計と型定義       |
| Electron IPCセキュリティ | `references/security-electron-ipc.md` | IPCパターンとセキュリティ原則 |
| APIセキュリティ          | `references/security-api-electron.md` | 完了タスク記録                |
| 型安全ルール             | `.claude/rules/02-code-quality.md`    | TypeScript型安全の原則        |

### 3.5 推奨アプローチ

1. **型定義の統一修正**:
   - `preload/types.ts` と `packages/shared/agent/types.ts` の両方を更新
   - `abort: () => void` → `abort: () => Promise<void>` に変更

2. **呼び出し箇所の確認**:
   - `agentSDKAPI.abort()` の呼び出し箇所を検索
   - Promise処理（`.then()` / `.catch()` または `await`）が必要か判断

3. **テスト追加**:
   - 型定義と実装の一致を確認するテスト
   - Promise rejectionのハンドリングテスト

---

## 4. 実行手順

### Phase 1: 影響範囲調査

1. `agentSDKAPI.abort()` の呼び出し箇所を全て特定
   ```bash
   grep -rn "\.abort\(\)" apps/desktop/src/
   grep -rn "abort" apps/desktop/src/renderer/
   ```
2. 各呼び出し箇所でのPromise処理の有無を確認
3. 修正が必要な箇所をリストアップ

### Phase 2: 型定義修正

1. `apps/desktop/src/preload/types.ts` の修正:

   ```typescript
   // Before
   abort: () => void;

   // After
   abort: () => Promise<void>;
   ```

2. `packages/shared/src/agent/types.ts` の修正:

   ```typescript
   // Before
   abort(): void;

   // After
   abort(): Promise<void>;
   ```

3. `pnpm typecheck` で型エラーを確認

### Phase 3: 呼び出し箇所修正

1. TypeScriptコンパイラが検出した型エラーを確認
2. 必要に応じて呼び出し箇所にPromise処理を追加:

   ```typescript
   // Option A: async/await
   await agentSDKAPI.abort();

   // Option B: Promise chain
   agentSDKAPI.abort().catch(console.error);

   // Option C: Fire-and-forget (意図的な場合)
   void agentSDKAPI.abort();
   ```

### Phase 4: テスト追加

1. 型互換性テストの追加:

   ```typescript
   describe("AgentSDKAPI.abort", () => {
     it("should return Promise<void>", async () => {
       const result = agentSDKAPI.abort();
       expect(result).toBeInstanceOf(Promise);
       await expect(result).resolves.toBeUndefined();
     });
   });
   ```

2. エラーハンドリングテストの追加

### Phase 5: ドキュメント更新

1. `api-ipc-agent.md` の型定義セクション更新
2. 変更履歴に本タスク完了を記録

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `preload/types.ts` の `AgentSDKAPI.abort` が `Promise<void>` を返す型に修正されている
- [ ] `packages/shared/agent/types.ts` の `AgentAPI.abort` が `Promise<void>` を返す型に修正されている
- [ ] 全ての呼び出し箇所でPromise処理が適切に行われている
- [ ] TypeScriptコンパイルエラーがない

### 品質要件

- [ ] `pnpm typecheck` がパス
- [ ] `pnpm lint` がパス
- [ ] 既存テストが全てパス
- [ ] 新規テストケースが追加されている

### ドキュメント要件

- [ ] `api-ipc-agent.md` の型定義が更新されている
- [ ] `security-api-electron.md` の完了タスクに記録されている
- [ ] `LOGS.md`（2ファイル）が更新されている

---

## 6. 検証方法

### テストケース

| #   | テストケース                          | 期待結果                       |
| --- | ------------------------------------- | ------------------------------ |
| 1   | `abort()` を呼び出す                  | `Promise<void>` が返される     |
| 2   | `await abort()` でエラーなく待機      | 正常に解決                     |
| 3   | IPC通信失敗時にPromise rejection      | 適切にエラーがキャッチされる   |
| 4   | 型定義と実装の一致確認                | TypeScriptコンパイルエラーなし |
| 5   | 他のAgentSDKAPIメソッドとの一貫性確認 | 全メソッドがPromiseを返す      |

### 検証手順

1. `pnpm typecheck` でコンパイルエラーがないことを確認
2. `pnpm --filter @repo/desktop test` で関連テストがパスすることを確認
3. 開発環境でAbort機能の動作確認:
   - クエリ実行中に中断ボタンをクリック
   - コンソールでPromise解決を確認
   - エラー時のハンドリングを確認

---

## 7. リスクと対策

| リスク                      | 影響度 | 発生確率 | 対策                                           |
| --------------------------- | ------ | -------- | ---------------------------------------------- |
| 呼び出し箇所の修正漏れ      | 中     | 低       | TypeScriptコンパイラで全箇所を検出             |
| 破壊的変更による回帰        | 中     | 低       | 既存テストの完全実行で検証                     |
| packages/sharedの型更新漏れ | 高     | 中       | 2箇所の型定義を同時に修正、checklist確認       |
| void意図的使用箇所の誤修正  | 低     | 低       | 各呼び出し箇所のコンテキストを確認してから修正 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント             | パス                                                          |
| ------------------------ | ------------------------------------------------------------- |
| Agent IPC仕様            | `aiworkflow-requirements/references/api-ipc-agent.md`         |
| Electron IPCセキュリティ | `aiworkflow-requirements/references/security-electron-ipc.md` |
| APIセキュリティ          | `aiworkflow-requirements/references/security-api-electron.md` |
| 型安全ルール             | `.claude/rules/02-code-quality.md`                            |
| UT-FIX-5-3成果物         | `docs/30-workflows/UT-FIX-5-3-PRELOAD-AGENT-ABORT/`           |

### 関連コードファイル

| ファイル                                       | 役割                    |
| ---------------------------------------------- | ----------------------- |
| `apps/desktop/src/preload/types.ts`            | Preload API型定義       |
| `apps/desktop/src/preload/index.ts`            | Preload API実装         |
| `packages/shared/src/agent/types.ts`           | 共有型定義（正本）      |
| `apps/desktop/src/main/agent/agent-handler.ts` | Main Process ハンドラー |

### 関連タスク

| タスクID   | 関係 | 説明                                 |
| ---------- | ---- | ------------------------------------ |
| UT-FIX-5-3 | 先行 | Preload Agent Abort セキュリティ修正 |

---

## 9. 備考

### 発見の経緯

Phase 12完了後のアーキテクチャ検証において、型定義と実装の整合性チェックを実施した際に発見された。

### 発見元の原文

```
問題の詳細:
- 型定義 (types.ts:1175): `abort: () => void;`
- 実装 (preload/index.ts:423): `abort: () => safeInvoke(IPC_CHANNELS.AGENT_ABORT)` → `Promise<unknown>` を返す
```

### 苦戦箇所

1. **Phase 12完了後の追加検証で発見された**:
   - 通常のPhase 1-11では検出されにくい型不一致問題
   - アーキテクチャレベルの整合性検証が重要

2. **型定義と実装の不一致によるTypeScript静的解析の限界**:
   - TypeScriptコンパイラは型定義を信頼するため、実装との不一致を検出しない
   - `.then()` や `await` が使用できず、IDE補完も機能しない

3. **Promise rejection をキャッチできない問題**:
   - 型定義が `void` のため、呼び出し側でエラーハンドリングを行う動機が生まれない
   - IPC通信エラーがサイレントに無視される可能性がある

### 補足事項

- `safeInvoke` 関数は `ipcRenderer.invoke()` をラップしており、常に `Promise` を返す
- 他のAgentSDKAPIメソッド（`createSession`, `destroySession`等）は正しく `Promise` を返す型定義になっている
- 本修正は破壊的変更ではなく、型の厳密化である（実装は既にPromiseを返している）

---

## 変更履歴

| 日付       | 変更内容                                                                     |
| ---------- | ---------------------------------------------------------------------------- |
| 2026-02-10 | 初版作成（UT-FIX-5-3 Phase 12検証で発見）                                    |
| 2026-02-10 | 9セクション構成テンプレート準拠に修正、packages/shared型定義修正も含め詳細化 |
