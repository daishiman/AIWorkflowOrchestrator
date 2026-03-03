# 要件定義書: TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| タスクID   | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 |
| タスク名   | skill:chain:\* IPCハンドラ登録漏れの修正      |
| Phase      | 1 — 要件定義                                  |
| 作成日     | 2026-03-03                                    |
| ステータス | completed                                     |

## 1. エラー事象

### 1.1 再現手順

1. アプリケーションを起動する（Electron Main Process が `registerAllIpcHandlers()` を呼び出す）
2. SkillChainBuilder 画面へ遷移する
3. `useChainList` フックが `window.electronAPI.skill.chainList()` を呼び出す
4. Preload 層が `safeInvoke(IPC_CHANNELS.SKILL_CHAIN_LIST)` を実行する
5. Main Process に `skill:chain:list` ハンドラが登録されていないため「No handler registered for 'skill:chain:list'」エラーが発生する

### 1.2 根本原因

`registerSkillChainHandlers()` 関数は `skillHandlers.ts`（行1194-1343）に定義されているが、`registerAllIpcHandlers()`（`index.ts` 行412-639）から呼び出されていない。Preload 層のホワイトリスト（`channels.ts` 行497-501）およびテスト（`skillHandlers.chain.test.ts` 21件）は整備済みだが、Main Process 側の配線が欠落している。

### 1.3 影響範囲

| レイヤー | 影響ファイル                                                   | 状態                     |
| -------- | -------------------------------------------------------------- | ------------------------ |
| Main     | `apps/desktop/src/main/ipc/index.ts`                           | 配線欠落（修正対象）     |
| Main     | `apps/desktop/src/main/ipc/skillHandlers.ts`                   | 実装済み（変更不要）     |
| Preload  | `apps/desktop/src/preload/channels.ts`                         | 定義・ホワイトリスト済み |
| Renderer | `src/renderer/views/SkillChainBuilder/hooks/useChainList.ts`   | 呼び出し側（変更不要）   |
| Renderer | `src/renderer/views/SkillChainBuilder/hooks/useChainEditor.ts` | 呼び出し側（変更不要）   |
| Service  | `src/main/services/skill/SkillChainStore.ts`                   | 依存注入対象（変更不要） |
| Service  | `src/main/services/skill/SkillChainExecutor.ts`                | 依存注入対象（変更不要） |

### 1.4 影響チャンネル

| チャンネル定数        | 実値                  | 行（channels.ts） |
| --------------------- | --------------------- | ----------------- |
| `SKILL_CHAIN_LIST`    | `skill:chain:list`    | 215               |
| `SKILL_CHAIN_GET`     | `skill:chain:get`     | 216               |
| `SKILL_CHAIN_SAVE`    | `skill:chain:save`    | 217               |
| `SKILL_CHAIN_DELETE`  | `skill:chain:delete`  | 218               |
| `SKILL_CHAIN_EXECUTE` | `skill:chain:execute` | 219               |

## 2. 機能要件 (FR)

### FR-01: registerAllIpcHandlers 内での registerSkillChainHandlers 呼び出し

- `registerAllIpcHandlers()` の関数本体内で `registerSkillChainHandlers(mainWindow, chainStore, chainExecutor)` を呼び出す
- 呼び出し位置は既存の skill 系ハンドラ登録群（`registerSkillHandlers`, `registerSkillFileHandlers` 等）の直後とする
- `registerAllIpcHandlers()` のパラメータに `SkillChainStore` と `SkillChainExecutor` のインスタンスを追加する（または既存の依存注入パターンに従って取得する）

### FR-02: SkillChainStore と SkillChainExecutor の依存注入

- `registerSkillChainHandlers()` は以下のシグネチャで依存を受け取る:
  ```typescript
  registerSkillChainHandlers(
    mainWindow: BrowserWindow,
    chainStore: SkillChainStore,
    chainExecutor: SkillChainExecutor,
  ): void
  ```
- `registerAllIpcHandlers()` の呼び出し元（`main/index.ts` 等）で `SkillChainStore` と `SkillChainExecutor` のインスタンスを生成し、引数として渡す
- インスタンス生成の順序は依存関係に従う（`SkillChainExecutor` は `SkillChainStore` に依存する可能性がある）

### FR-03: unregisterAllIpcHandlers での skill:chain チャンネル解除

- 現行の `unregisterAllIpcHandlers()` は `Object.values(IPC_CHANNELS)` で全チャンネルを一括解除するため、`skill:chain:*` チャンネルは既に解除対象に含まれている
- 追加実装は不要だが、解除が確実に動作することをテストで検証する

### FR-04: 二重登録防止パターン（P5対策）

- `ipcMain.handle()` は同一チャンネルへの二重登録で例外を送出する（P5参照）
- `registerAllIpcHandlers()` の呼び出し前に `unregisterAllIpcHandlers()` が実行される既存パターンに従い、二重登録を防止する
- macOS `activate` イベント等での再登録シナリオでも安全に動作する

## 3. 非機能要件 (NFR)

### NFR-01: 登録漏れの静的検証手段

- Preload ホワイトリスト（`ALLOWED_INVOKE_CHANNELS`）に含まれる全チャンネルが、`registerAllIpcHandlers()` 経由で登録されることを検証するテストを追加する
- 検証方法: `ALLOWED_INVOKE_CHANNELS` の要素数と、`registerAllIpcHandlers()` 実行後に `ipcMain.handle` で登録されたチャンネル数を比較する
- 将来の配線漏れを防止するための回帰テストとして機能させる

### NFR-02: P42 準拠の3段バリデーション維持

- `registerSkillChainHandlers()` 内の既存バリデーションを変更しない
- 既存の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が各ハンドラで動作していることを確認する
- 対象ハンドラ: `skill:chain:get`（chainId）, `skill:chain:delete`（chainId）, `skill:chain:execute`（chainId）

### NFR-03: validateIpcSender によるセキュリティ検証維持

- `registerSkillChainHandlers()` 内の全ハンドラで `validateIpcSender(event, mainWindow)` が呼び出されていることを確認する
- 送信元ウィンドウの検証が 5 チャンネル全てで動作することをテストで検証する

## 4. スコープ外

以下は本タスクのスコープ外とする:

- `registerSkillChainHandlers()` 関数本体の変更（既に正しく実装済み）
- Preload 層のチャンネル定義・ホワイトリスト変更（既に正しく設定済み）
- Renderer 層のフック変更（`useChainList`, `useChainEditor` は変更不要）
- `SkillChainStore`, `SkillChainExecutor` サービスの実装変更
- 既存ユニットテスト（`skillHandlers.chain.test.ts` 21件）の修正

## 5. 既知の落とし穴との関連

| Pitfall                           | 関連性                                      | 対策                                                                   |
| --------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------- |
| P5（リスナー二重登録）            | 直接関連 — ハンドラ登録時の二重登録防止     | `unregisterAllIpcHandlers()` → `registerAllIpcHandlers()` の順序を維持 |
| P42（trim バリデーション）        | 間接関連 — 既存ハンドラのバリデーション維持 | 既存実装を変更しない                                                   |
| P44（IPC インターフェース不整合） | 間接関連 — Preload⇔Main の引数一致確認      | IPC契約チェックリストで検証                                            |
| P45（引数命名の契約ドリフト）     | 間接関連 — chainId の命名一貫性             | 既存命名を維持                                                         |

## 6. 依存関係

### 入力依存

- `SkillChainStore` インスタンスの生成タイミング
- `SkillChainExecutor` インスタンスの生成タイミング
- `mainWindow` (BrowserWindow) の生成タイミング

### 出力依存

- Phase 2（設計）: 本要件定義を基に `index.ts` の修正設計を行う
- Phase 4（テスト作成）: FR/NFR を基にテストケースを設計する
