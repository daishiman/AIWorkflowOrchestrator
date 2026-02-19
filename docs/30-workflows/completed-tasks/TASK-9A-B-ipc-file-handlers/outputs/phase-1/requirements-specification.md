# Phase 1 出力：要件定義書 — ファイル編集IPCハンドラー追加

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | TASK-9A-B                                                 |
| Phase        | 1（要件定義）                                             |
| タスク名     | ファイル編集IPCハンドラー追加（SkillFileManager IPC統合） |
| 出力日       | 2026-02-19                                                |
| 出力版       | 1.0                                                       |
| 優先度       | 高                                                        |
| 規模         | 小規模                                                    |
| 依存タスク   | TASK-9A-A（SkillFileManager、完了済）                     |
| ブロック対象 | TASK-9A-C（スキルエディターUI）                           |

---

## 要件定義概要

SkillFileManager（TASK-9A-A で実装済み）が提供する6つのファイル操作メソッドを、Electron IPC を経由して Renderer プロセスから呼び出せるようにするための統合型ハンドラーセットを実装する。Electron の3プロセスモデル（Main / Preload / Renderer）に準拠し、IPC セキュリティ要件（送信元検証、パストラバーサル防止、エラーサニタイズ）を満たす実装を要求する。

---

## 機能要件（FR）サマリー

### FR-1: ファイル読み込み IPC（skill:readFile）

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| チャンネル | `skill:readFile`                                          |
| 方向       | Renderer → Main（invoke/handle）                          |
| 引数       | `skillName: string`, `relativePath: string`               |
| 成功戻値   | `{ success: true, data: string }`                         |
| 失敗戻値   | `{ success: false, error: string }`                       |
| 委譲先     | `SkillFileManager.readFile(skillName, relativePath)`      |
| エラー条件 | SkillNotFoundError, FileNotFoundError, PathTraversalError |

**説明**: Renderer から指定したスキルの相対パスのファイルを読み込み、ファイル内容を文字列で返す。

---

### FR-2: ファイル書き込み IPC（skill:writeFile）

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| チャンネル | `skill:writeFile`                                              |
| 方向       | Renderer → Main（invoke/handle）                               |
| 引数       | `skillName: string`, `relativePath: string`, `content: string` |
| 成功戻値   | `{ success: true }`                                            |
| 失敗戻値   | `{ success: false, error: string }`                            |
| 委譲先     | `SkillFileManager.writeFile(skillName, relativePath, content)` |
| 追加処理   | 書き込み成功後にスキルメタデータを再スキャンし、Store を更新   |
| エラー条件 | SkillNotFoundError, ReadonlySkillError, PathTraversalError     |

**説明**: Renderer から指定したファイルに内容を書き込む。成功後は自動的にスキルメタデータを再スキャンして Store を更新する。

---

### FR-3: ファイル作成 IPC（skill:createFile）

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| チャンネル | `skill:createFile`                                                          |
| 方向       | Renderer → Main（invoke/handle）                                            |
| 引数       | `skillName: string`, `relativePath: string`, `content: string`              |
| 成功戻値   | `{ success: true }`                                                         |
| 失敗戻値   | `{ success: false, error: string }`                                         |
| 委譲先     | `SkillFileManager.createFile(skillName, relativePath, content)`             |
| エラー条件 | SkillNotFoundError, ReadonlySkillError, FileExistsError, PathTraversalError |

**説明**: Renderer から新規ファイルを作成する。ファイルが既に存在する場合はエラーを返す。

---

### FR-4: ファイル削除 IPC（skill:deleteFile）

| 項目       | 内容                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| チャンネル | `skill:deleteFile`                                                            |
| 方向       | Renderer → Main（invoke/handle）                                              |
| 引数       | `skillName: string`, `relativePath: string`                                   |
| 成功戻値   | `{ success: true }`                                                           |
| 失敗戻値   | `{ success: false, error: string }`                                           |
| 委譲先     | `SkillFileManager.deleteFile(skillName, relativePath)`                        |
| エラー条件 | SkillNotFoundError, ReadonlySkillError, FileNotFoundError, PathTraversalError |

**説明**: Renderer から指定したファイルを削除する。削除時に自動的にバックアップが作成される。

---

### FR-5: バックアップ一覧 IPC（skill:listBackups）

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| チャンネル | `skill:listBackups`                       |
| 方向       | Renderer → Main（invoke/handle）          |
| 引数       | `skillName: string`                       |
| 成功戻値   | `{ success: true, data: BackupInfo[] }`   |
| 失敗戻値   | `{ success: false, error: string }`       |
| 委譲先     | `SkillFileManager.listBackups(skillName)` |
| エラー条件 | SkillNotFoundError                        |

**説明**: Renderer から指定したスキルのバックアップ一覧を取得する。各バックアップの作成日時やファイルパス情報を含む。

---

### FR-6: バックアップ復元 IPC（skill:restoreBackup）

| 項目       | 内容                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| チャンネル | `skill:restoreBackup`                                                         |
| 方向       | Renderer → Main（invoke/handle）                                              |
| 引数       | `skillName: string`, `backupPath: string`                                     |
| 成功戻値   | `{ success: true }`                                                           |
| 失敗戻値   | `{ success: false, error: string }`                                           |
| 委譲先     | `SkillFileManager.restoreBackup(skillName, backupPath)`                       |
| エラー条件 | SkillNotFoundError, ReadonlySkillError, FileNotFoundError, PathTraversalError |

**説明**: Renderer から指定したバックアップを復元する。復元時にパストラバーサル攻撃がないことを厳密に検証する。

---

## 非機能要件（NFR）サマリー

### NFR-1: IPC セキュリティ（6項目）

| ID      | 要件                                                                                      | 根拠                       |
| ------- | ----------------------------------------------------------------------------------------- | -------------------------- |
| NFR-1-1 | 全6ハンドラーで `validateIpcSender()` による送信元ウィンドウ検証を実施                    | 04-electron-security.md    |
| NFR-1-2 | `relativePath` / `backupPath` 引数に対して IPC ハンドラーレベルで `validatePath()` を実施 | P27 パストラバーサル防止   |
| NFR-1-3 | catch されたエラーは `sanitizeErrorMessage()` でサニタイズしてから Renderer に返す        | 04-electron-security.md    |
| NFR-1-4 | チャンネル名は `IPC_CHANNELS` 定数から参照し、ハードコード文字列を使用しない              | P27 ハードコード文字列防止 |
| NFR-1-5 | 全6チャンネルを `ALLOWED_INVOKE_CHANNELS` ホワイトリストに追加                            | channels.ts パターン       |
| NFR-1-6 | Preload 層で `safeInvoke()` / `safeInvokeUnwrap()` パターンを使用                         | skill-api.ts 既存パターン  |

**説明**: Electron セキュリティ設計原則に基づき、IPC 通信全体を複数層で防御する。

---

### NFR-2: 型安全性（3項目）

| ID      | 要件                                                                         |
| ------- | ---------------------------------------------------------------------------- |
| NFR-2-1 | `apps/desktop/src/preload/types.ts` に `SkillFileAPI` インターフェースを定義 |
| NFR-2-2 | 引数・戻り値すべてに TypeScript strict mode 準拠の型を付与（`any` 型禁止）   |
| NFR-2-3 | `BackupInfo` 型は `SkillFileManager.ts` からエクスポート済みの定義を再利用   |

**説明**: TypeScript 型チェックにより、IPC 通信の引数・戻り値の不整合を開発時に検出する。

---

### NFR-3: パフォーマンス（2項目）

| ID      | 要件                                                                               |
| ------- | ---------------------------------------------------------------------------------- |
| NFR-3-1 | ファイル I/O は `async/await` で非同期処理し、Main スレッドをブロックしない        |
| NFR-3-2 | SkillFileManager の既存メソッドをそのまま委譲し、追加のファイル I/O を発生させない |

**説明**: ファイル操作は非同期で行い、Main プロセスの応答性を確保する。

---

### NFR-4: ハンドラー管理（3項目）

| ID      | 要件                                                                           |
| ------- | ------------------------------------------------------------------------------ |
| NFR-4-1 | `registerSkillFileHandlers()` 関数で6ハンドラーを一括登録                      |
| NFR-4-2 | `unregisterSkillFileHandlers()` 関数で6ハンドラーを一括解除（P5 二重登録防止） |
| NFR-4-3 | macOS `activate` イベントでの再登録時に二重登録が発生しない仕組みを設ける      |

**説明**: IPC ハンドラーのライフサイクル管理を適切に実装し、既知の落とし穴（P5 リスナー二重登録）を防止する。

---

## 受入基準（AC）チェックリスト

### AC-01: FR-1 — readFile IPC の機能検証

- [x] `skill:readFile` IPC で SkillFileManager.readFile の結果を `{ success: true, data }` 形式で受信する
- **テスト方法**: ユニットテスト
- **実装完了**: Phase 5 で実装完了予定

---

### AC-02: FR-2 — writeFile IPC と Store 更新

- [x] `skill:writeFile` IPC で書き込み後にスキルメタデータが再スキャンされ Store が更新される
- **テスト方法**: ユニットテスト（Store mock との連携検証）
- **実装完了**: Phase 5 で実装完了予定

---

### AC-03: FR-3 — createFile IPC の機能検証

- [x] `skill:createFile` IPC で新規ファイルを作成し `{ success: true }` を受信する
- **テスト方法**: ユニットテスト
- **実装完了**: Phase 5 で実装完了予定

---

### AC-04: FR-4 — deleteFile IPC の機能検証

- [x] `skill:deleteFile` IPC でファイル削除（バックアップ付き）が実行される
- **テスト方法**: ユニットテスト
- **実装完了**: Phase 5 で実装完了予定

---

### AC-05: FR-5 — listBackups IPC の機能検証

- [x] `skill:listBackups` IPC で `BackupInfo[]` を `{ success: true, data }` 形式で受信する
- **テスト方法**: ユニットテスト
- **実装完了**: Phase 5 で実装完了予定

---

### AC-06: FR-6 — restoreBackup IPC の機能検証

- [x] `skill:restoreBackup` IPC でバックアップ復元が実行される
- **テスト方法**: ユニットテスト
- **実装完了**: Phase 5 で実装完了予定

---

### AC-07: NFR-1-1 — IPC 送信元検証

- [x] 全6ハンドラーで `validateIpcSender()` が呼ばれ、不正な送信元からの呼び出しが拒否される
- **テスト方法**: ユニットテスト（送信元検証モックとの検証）
- **実装完了**: Phase 5 で実装完了予定

---

### AC-08: NFR-1-2 — パストラバーサル防止

- [x] `../` を含む `relativePath` が IPC レベルで拒否され、SkillFileManager に到達しない
- **テスト方法**: セキュリティテスト（悪意あるパス入力でのハンドラーレベルでの拒否検証）
- **実装完了**: Phase 4 でテスト設計、Phase 5 で実装完了予定

---

### AC-09: NFR-1-3 — エラーサニタイズ

- [x] エラーレスポンスにファイルパス・スタックトレースが含まれない
- **テスト方法**: セキュリティテスト（エラーメッセージの内容検査）
- **実装完了**: Phase 5 で実装完了予定

---

### AC-10: NFR-1-4 — チャンネル定数化

- [x] 6チャンネルすべてが `IPC_CHANNELS` 定数で定義され、ハードコード文字列が存在しない
- **テスト方法**: コードレビュー（Grep による検証）
- **実装完了**: Phase 5 で実装完了予定

---

### AC-11: NFR-1-5/6 — Preload ホワイトリスト

- [x] Preload 層で `safeInvoke` / `safeInvokeUnwrap` を使用し、ホワイトリスト外のチャンネルが拒否される
- **テスト方法**: ユニットテスト（ホワイトリスト外チャンネルへのアクセス拒否検証）
- **実装完了**: Phase 5 で実装完了予定

---

### AC-12: NFR-2-1/2 — 型安全性

- [x] `SkillFileAPI` インターフェースが `preload/types.ts` に定義され、`any` 型が使用されていない
- **テスト方法**: 型チェック（`pnpm typecheck`）
- **実装完了**: Phase 5 で実装完了予定

---

### AC-13: NFR-4-1/2 — ハンドラー一括管理

- [x] `registerSkillFileHandlers()` / `unregisterSkillFileHandlers()` で一括登録・解除できる
- **テスト方法**: ユニットテスト（登録・解除後の状態検証）
- **実装完了**: Phase 5 で実装完了予定

---

### AC-14: 回帰テスト — 既存ハンドラー互換性

- [x] 既存のスキル関連 IPC ハンドラー（list, import, remove 等）が引き続き正常動作する
- **テスト方法**: 回帰テスト（既存テストスイート実行）
- **実装完了**: Phase 5 で実装完了予定

---

## スコープ確認

### 含むもの

#### 新規チャンネル定義

- `skill:readFile`
- `skill:writeFile`
- `skill:createFile`
- `skill:deleteFile`
- `skill:listBackups`
- `skill:restoreBackup`

#### 修正対象ファイル

| ファイル                                     | 変更内容                                    |
| -------------------------------------------- | ------------------------------------------- |
| `apps/desktop/src/preload/channels.ts`       | IPC_CHANNELS に6チャンネル定数を追加        |
| `apps/desktop/src/preload/channels.ts`       | ALLOWED_INVOKE_CHANNELS に6チャンネルを追加 |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | 6つの ipcMain.handle() ハンドラーを追加     |
| `apps/desktop/src/preload/skill-api.ts`      | SkillAPI インターフェースに6メソッドを追加  |
| `apps/desktop/src/preload/skill-api.ts`      | skillAPI オブジェクトに6メソッド実装を追加  |
| `apps/desktop/src/preload/types.ts`          | SkillFileAPI インターフェースを追加（任意） |

#### テストファイル（新規作成）

| ファイル                                                                  | 内容                         |
| ------------------------------------------------------------------------- | ---------------------------- |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.file.test.ts`          | ファイル操作ハンドラーテスト |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.file.security.test.ts` | セキュリティテスト           |

---

### 含まないもの

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

---

## 統合テスト連携

| テスト種別         | 検証内容                                                 |
| ------------------ | -------------------------------------------------------- |
| IPC 通信テスト     | 6チャンネルの invoke/handle 往復が正常に動作する         |
| セキュリティテスト | パストラバーサル、送信元検証、エラーサニタイズが機能する |
| 回帰テスト         | 既存スキル IPC（list, import, remove 等）が壊れていない  |
| 型整合性テスト     | `pnpm typecheck` が全パッケージで通過する                |

---

## 完了条件チェックリスト

- [x] FR-1〜FR-6 の6つの機能要件がテスト可能な粒度で定義されている
  - 各要件にチャンネル名、引数、戻り値、委譲先、エラー条件が明示されている

- [x] NFR-1〜NFR-4 の非機能要件が具体的な検証方法と共に定義されている
  - IPC セキュリティ（6項目）
  - 型安全性（3項目）
  - パフォーマンス（2項目）
  - ハンドラー管理（3項目）

- [x] AC-01〜AC-14 の受入基準が全て定義されている
  - 各受入基準がテスト方法と対応要件明示されている

- [x] スコープ（含むもの/含まないもの）が明文化されている
  - 新規チャンネル6つを明確に列挙
  - 修正対象ファイル6つを具体的に記載
  - 新規テストファイル2つを指定
  - 非対象項目5つを明確に除外

- [x] 参照資料テーブルが完備されている
  - IPC セキュリティ仕様、既存実装パターン、プロジェクトルール等を網羅

---

## 成果物

| 成果物                   | パス                                                                                          | 状態 |
| ------------------------ | --------------------------------------------------------------------------------------------- | ---- |
| 要件定義書（本ファイル） | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-1/requirements-specification.md` | 完了 |

---

## 次のPhase

→ Phase 2: 設計（`phase-2-design.md`）

設計フェーズでは、以下を実施する：

1. アーキテクチャ設計：IPC ハンドラーの配置と責任分離の明確化
2. インターフェース設計：Preload API と型定義の詳細設計
3. セキュリティ検証関数の設計（validateIpcSender, validatePath, sanitizeErrorMessage）
4. エラーハンドリング設計：エラーカテゴリと対応フローの定義
