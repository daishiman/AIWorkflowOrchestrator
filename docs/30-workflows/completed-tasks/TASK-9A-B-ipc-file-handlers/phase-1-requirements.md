# Phase 1: 要件定義 — ファイル編集IPCハンドラー追加

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-9A-B                                                 |
| Phase    | 1                                                         |
| タスク名 | ファイル編集IPCハンドラー追加（SkillFileManager IPC統合） |
| 作成日   | 2026-02-19                                                |
| 優先度   | 高                                                        |
| 規模     | 小規模                                                    |
| 依存     | TASK-9A-A（SkillFileManager、完了済）                     |
| ブロック | TASK-9A-C（スキルエディターUI）                           |

## 目的

SkillFileManager（TASK-9A-A で実装済み）が提供する6つのファイル操作メソッド（readFile, writeFile, createFile, deleteFile, listBackups, restoreBackup）を、Electron IPC を経由して Renderer プロセスから呼び出せるようにするための要件を定義する。Electron の3プロセスモデル（Main / Preload / Renderer）に準拠し、IPC セキュリティ要件（送信元検証、パストラバーサル防止、エラーサニタイズ）を満たす。

## 実行タスク

- Task 1: 機能要件（FR）を定義する — 6つの IPC チャンネルの入出力仕様を確定する
- Task 2: 非機能要件（NFR）を定義する — セキュリティ・型安全性・パフォーマンスの要件を確定する
- Task 3: 受入基準（AC）を定義する — 各 FR/NFR に対するテスト可能な検証条件を確定する
- Task 4: スコープを確認する — 実施対象と非対象を明文化する

---

### Task 1: 機能要件（FR）

#### FR-1: ファイル読み込み IPC（skill:readFile）

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| チャンネル | `skill:readFile`                                          |
| 方向       | Renderer → Main（invoke/handle）                          |
| 引数       | `skillName: string`, `relativePath: string`               |
| 成功時戻値 | `{ success: true, data: string }`                         |
| 失敗時戻値 | `{ success: false, error: string }`                       |
| 委譲先     | `SkillFileManager.readFile(skillName, relativePath)`      |
| エラー条件 | SkillNotFoundError, FileNotFoundError, PathTraversalError |

#### FR-2: ファイル書き込み IPC（skill:writeFile）

| 項目       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| チャンネル | `skill:writeFile`                                                |
| 方向       | Renderer → Main（invoke/handle）                                 |
| 引数       | `skillName: string`, `relativePath: string`, `content: string`   |
| 成功時戻値 | `{ success: true }`                                              |
| 失敗時戻値 | `{ success: false, error: string }`                              |
| 委譲先     | `SkillFileManager.writeFile(skillName, relativePath, content)`   |
| 追加処理   | 書き込み成功後にスキルメタデータを再スキャンし、Store を更新する |
| エラー条件 | SkillNotFoundError, ReadonlySkillError, PathTraversalError       |

#### FR-3: ファイル作成 IPC（skill:createFile）

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| チャンネル | `skill:createFile`                                                          |
| 方向       | Renderer → Main（invoke/handle）                                            |
| 引数       | `skillName: string`, `relativePath: string`, `content: string`              |
| 成功時戻値 | `{ success: true }`                                                         |
| 失敗時戻値 | `{ success: false, error: string }`                                         |
| 委譲先     | `SkillFileManager.createFile(skillName, relativePath, content)`             |
| エラー条件 | SkillNotFoundError, ReadonlySkillError, FileExistsError, PathTraversalError |

#### FR-4: ファイル削除 IPC（skill:deleteFile）

| 項目       | 内容                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| チャンネル | `skill:deleteFile`                                                            |
| 方向       | Renderer → Main（invoke/handle）                                              |
| 引数       | `skillName: string`, `relativePath: string`                                   |
| 成功時戻値 | `{ success: true }`                                                           |
| 失敗時戻値 | `{ success: false, error: string }`                                           |
| 委譲先     | `SkillFileManager.deleteFile(skillName, relativePath)`                        |
| エラー条件 | SkillNotFoundError, ReadonlySkillError, FileNotFoundError, PathTraversalError |

#### FR-5: バックアップ一覧 IPC（skill:listBackups）

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| チャンネル | `skill:listBackups`                       |
| 方向       | Renderer → Main（invoke/handle）          |
| 引数       | `skillName: string`                       |
| 成功時戻値 | `{ success: true, data: BackupInfo[] }`   |
| 失敗時戻値 | `{ success: false, error: string }`       |
| 委譲先     | `SkillFileManager.listBackups(skillName)` |
| エラー条件 | SkillNotFoundError                        |

#### FR-6: バックアップ復元 IPC（skill:restoreBackup）

| 項目       | 内容                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| チャンネル | `skill:restoreBackup`                                                         |
| 方向       | Renderer → Main（invoke/handle）                                              |
| 引数       | `skillName: string`, `backupPath: string`                                     |
| 成功時戻値 | `{ success: true }`                                                           |
| 失敗時戻値 | `{ success: false, error: string }`                                           |
| 委譲先     | `SkillFileManager.restoreBackup(skillName, backupPath)`                       |
| エラー条件 | SkillNotFoundError, ReadonlySkillError, FileNotFoundError, PathTraversalError |

---

### Task 2: 非機能要件（NFR）

#### NFR-1: IPC セキュリティ

| ID      | 要件                                                                                          | 根拠                       |
| ------- | --------------------------------------------------------------------------------------------- | -------------------------- |
| NFR-1-1 | 全6ハンドラーで `validateIpcSender()` による送信元ウィンドウ検証を実施する                    | 04-electron-security.md    |
| NFR-1-2 | `relativePath` / `backupPath` 引数に対して IPC ハンドラーレベルで `validatePath()` を実施する | P27 パストラバーサル防止   |
| NFR-1-3 | catch されたエラーは `sanitizeErrorMessage()` でサニタイズしてから Renderer に返す            | 04-electron-security.md    |
| NFR-1-4 | チャンネル名は `IPC_CHANNELS` 定数から参照し、ハードコード文字列を使用しない                  | P27 ハードコード文字列防止 |
| NFR-1-5 | 全6チャンネルを `ALLOWED_INVOKE_CHANNELS` ホワイトリストに追加する                            | channels.ts パターン       |
| NFR-1-6 | Preload 層で `safeInvoke()` / `safeInvokeUnwrap()` パターンを使用する                         | skill-api.ts 既存パターン  |

#### NFR-2: 型安全性

| ID      | 要件                                                                             |
| ------- | -------------------------------------------------------------------------------- |
| NFR-2-1 | `apps/desktop/src/preload/types.ts` に `SkillFileAPI` インターフェースを定義する |
| NFR-2-2 | 引数・戻り値すべてに TypeScript strict mode 準拠の型を付与する（`any` 型禁止）   |
| NFR-2-3 | `BackupInfo` 型は `SkillFileManager.ts` からエクスポート済みの定義を再利用する   |

#### NFR-3: パフォーマンス

| ID      | 要件                                                                               |
| ------- | ---------------------------------------------------------------------------------- |
| NFR-3-1 | ファイル I/O は `async/await` で非同期処理し、Main スレッドをブロックしない        |
| NFR-3-2 | SkillFileManager の既存メソッドをそのまま委譲し、追加のファイル I/O を発生させない |

#### NFR-4: ハンドラー管理

| ID      | 要件                                                                               |
| ------- | ---------------------------------------------------------------------------------- |
| NFR-4-1 | `registerSkillFileHandlers()` 関数で6ハンドラーを一括登録する                      |
| NFR-4-2 | `unregisterSkillFileHandlers()` 関数で6ハンドラーを一括解除する（P5 二重登録防止） |
| NFR-4-3 | macOS `activate` イベントでの再登録時に二重登録が発生しない仕組みを設ける          |

---

### Task 3: 受入基準（AC）

| ID    | 受入基準                                                                                            | 対応要件  | テスト方法         |
| ----- | --------------------------------------------------------------------------------------------------- | --------- | ------------------ |
| AC-01 | `skill:readFile` IPC で SkillFileManager.readFile の結果を `{ success: true, data }` 形式で受信する | FR-1      | ユニットテスト     |
| AC-02 | `skill:writeFile` IPC で書き込み後にスキルメタデータが再スキャンされ Store が更新される             | FR-2      | ユニットテスト     |
| AC-03 | `skill:createFile` IPC で新規ファイルを作成し `{ success: true }` を受信する                        | FR-3      | ユニットテスト     |
| AC-04 | `skill:deleteFile` IPC でファイル削除（バックアップ付き）が実行される                               | FR-4      | ユニットテスト     |
| AC-05 | `skill:listBackups` IPC で `BackupInfo[]` を `{ success: true, data }` 形式で受信する               | FR-5      | ユニットテスト     |
| AC-06 | `skill:restoreBackup` IPC でバックアップ復元が実行される                                            | FR-6      | ユニットテスト     |
| AC-07 | 全6ハンドラーで `validateIpcSender()` が呼ばれ、不正な送信元からの呼び出しが拒否される              | NFR-1-1   | ユニットテスト     |
| AC-08 | `../` を含む `relativePath` が IPC レベルで拒否され、SkillFileManager に到達しない                  | NFR-1-2   | セキュリティテスト |
| AC-09 | エラーレスポンスにファイルパス・スタックトレースが含まれない                                        | NFR-1-3   | セキュリティテスト |
| AC-10 | 6チャンネルすべてが `IPC_CHANNELS` 定数で定義され、ハードコード文字列が存在しない                   | NFR-1-4   | コードレビュー     |
| AC-11 | Preload 層で `safeInvoke` / `safeInvokeUnwrap` を使用し、ホワイトリスト外のチャンネルが拒否される   | NFR-1-5/6 | ユニットテスト     |
| AC-12 | `SkillFileAPI` インターフェースが `preload/types.ts` に定義され、`any` 型が使用されていない         | NFR-2-1/2 | 型チェック         |
| AC-13 | `registerSkillFileHandlers()` / `unregisterSkillFileHandlers()` で一括登録・解除できる              | NFR-4-1/2 | ユニットテスト     |
| AC-14 | 既存のスキル関連 IPC ハンドラー（list, import, remove 等）が引き続き正常動作する                    | -         | 回帰テスト         |

---

### Task 4: スコープ確認

#### 含むもの

**新規追加ファイル:**

- なし（既存ファイルへの追加のみ）

**修正対象ファイル:**

| ファイル                                     | 変更内容                                      |
| -------------------------------------------- | --------------------------------------------- |
| `apps/desktop/src/preload/channels.ts`       | `IPC_CHANNELS` に6チャンネル定数を追加        |
| `apps/desktop/src/preload/channels.ts`       | `ALLOWED_INVOKE_CHANNELS` に6チャンネルを追加 |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | 6つの `ipcMain.handle()` ハンドラーを追加     |
| `apps/desktop/src/preload/skill-api.ts`      | `SkillAPI` インターフェースに6メソッドを追加  |
| `apps/desktop/src/preload/skill-api.ts`      | `skillAPI` オブジェクトに6メソッド実装を追加  |
| `apps/desktop/src/preload/types.ts`          | `SkillFileAPI` インターフェースを追加（任意） |

**テストファイル:**

| ファイル                                                                  | 内容                         |
| ------------------------------------------------------------------------- | ---------------------------- |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.file.test.ts`          | ファイル操作ハンドラーテスト |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.file.security.test.ts` | セキュリティテスト           |

#### 含まないもの

- SkillFileManager 本体のロジック変更（TASK-9A-A で完了済み）
- Renderer コンポーネント（React UI）の実装（TASK-9A-C で実施）
- `window.electronAPI` への統合（別途検討）
- 他の IPC ハンドラー（authMode, agent 等）の修正
- `contextBridge.exposeInMainWorld` の変更（既存パターンで対応）

---

## 参照資料

| 参照資料                 | パス                                                                              | 内容                    |
| ------------------------ | --------------------------------------------------------------------------------- | ----------------------- |
| IPC セキュリティ仕様     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | IPC通信セキュリティ要件 |
| IPC API仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | IPCチャンネル設計       |
| Electron APIセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | Preload API設計         |
| スキルインターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル関連型定義        |
| SkillFileManager 実装    | `apps/desktop/src/main/services/skill/SkillFileManager.ts`                        | ファイル操作サービス    |
| 既存 IPC ハンドラー      | `apps/desktop/src/main/ipc/skillHandlers.ts`                                      | 既存スキル IPC パターン |
| 既存 Preload API         | `apps/desktop/src/preload/skill-api.ts`                                           | 既存 Preload パターン   |
| チャンネル定義           | `apps/desktop/src/preload/channels.ts`                                            | IPC チャンネル一覧      |
| セキュリティルール       | `.claude/rules/04-electron-security.md`                                           | セキュリティ設計原則    |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                              | P5, P23, P27, P32 等    |
| TASK-9A-B タスク定義     | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/index.md`                          | タスク概要・完了条件    |

---

## 統合テスト連携

| テスト種別         | 検証内容                                                 |
| ------------------ | -------------------------------------------------------- |
| IPC 通信テスト     | 6チャンネルの invoke/handle 往復が正常に動作する         |
| セキュリティテスト | パストラバーサル、送信元検証、エラーサニタイズが機能する |
| 回帰テスト         | 既存スキル IPC（list, import, remove 等）が壊れていない  |
| 型整合性テスト     | `pnpm typecheck` が全パッケージで通過する                |

---

## 成果物

| 成果物                   | パス                                                                    |
| ------------------------ | ----------------------------------------------------------------------- |
| 要件定義書（本ファイル） | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/phase-1-requirements.md` |

---

## 完了条件

- [ ] FR-1〜FR-6 の6つの機能要件がテスト可能な粒度で定義されている
- [ ] NFR-1〜NFR-4 の非機能要件が具体的な検証方法と共に定義されている
- [ ] AC-01〜AC-14 の受入基準が全て定義されている
- [ ] スコープ（含むもの/含まないもの）が明文化されている
- [ ] 参照資料テーブルが完備されている

---

## 次のPhase

→ Phase 2: 設計（`phase-2-design.md`）
