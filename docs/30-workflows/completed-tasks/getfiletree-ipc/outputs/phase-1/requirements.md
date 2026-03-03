# 要件定義書 — skill:getFileTree IPC実装

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| タスクID | UT-UI-05A-GETFILETREE-001                |
| Phase    | 1（要件定義）                            |
| 作成日   | 2026-03-03                               |
| Issue    | #948                                     |
| 優先度   | 高                                       |
| 規模     | 小規模                                   |
| 依存     | TASK-9A-A（完了済）、TASK-9A-B（完了済） |
| ブロック | SkillEditorView の useFileTree フック    |

## 1. 背景と目的

SkillEditorView は `useFileTree` フックで `skill:getFileTree` IPC 呼び出しを前提に設計されているが、Main/Preload の契約実装が不足している。本要件定義書は `skill:getFileTree` IPC チャンネルの機能要件・非機能要件・受入基準を確定し、以降の Phase の基盤とする。

## 2. 機能要件（FR）

### FR-1: ファイルツリー取得 IPC（skill:getFileTree）

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| チャンネル | `skill:getFileTree`                                       |
| 方向       | Renderer → Main（invoke/handle）                          |
| 引数       | `{ skillName: string }`                                   |
| 成功時戻値 | `{ success: true, data: SkillFileTreeNode[] }`            |
| 失敗時戻値 | `{ success: false, error: string }`                       |
| 委譲先     | `SkillFileManager.getFileTree(skillName)`（新規メソッド） |
| エラー条件 | SkillNotFoundError（スキルが見つからない場合）            |

### FR-1-1: SkillFileManager.getFileTree メソッド

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| メソッド名 | `getFileTree(skillName: string): Promise<SkillFileTreeNode[]>` |
| 配置先     | `apps/desktop/src/main/services/skill/SkillFileManager.ts`     |
| 入力       | `skillName` — スキル名                                         |
| 出力       | ディレクトリ構造を再帰的に表現した `SkillFileTreeNode[]`       |

#### 動作仕様

1. `findSkillDir(skillName)` でスキルディレクトリを解決する
2. ディレクトリを再帰走査し、ツリー構造の `SkillFileTreeNode[]` を構築する
3. バックアップファイル（`.backup.*`, `.deleted.*`）をフィルタリングで除外する
4. 各ノードの `path` はスキルディレクトリからの相対パス（POSIX形式: `/` 区切り）とする
5. ディレクトリノードは `children` フィールドに子ノードを含む
6. ファイル名でアルファベット順ソートし、ディレクトリをファイルより先に配置する

### FR-1-2: SkillFileTreeNode 型定義の共有化

| 項目     | 内容                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| 現在位置 | `apps/desktop/src/renderer/views/SkillEditorView/types.ts`                    |
| 移動先   | `packages/shared/src/types/skill-file.ts`                                     |
| 理由     | Main Process と Renderer の両方で同一型を参照するため共有パッケージに配置する |

```typescript
export interface SkillFileTreeNode {
  name: string; // ファイル名またはディレクトリ名
  path: string; // スキルディレクトリからの相対パス（POSIX形式: / 区切り）
  type: "file" | "directory";
  children?: SkillFileTreeNode[]; // type === "directory" の場合のみ存在
}
```

### FR-1-3: Preload API メソッド追加

| 項目             | 内容                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- |
| インターフェース | `SkillAPI` に `getFileTree` メソッドを追加                                               |
| シグネチャ       | `getFileTree(skillName: string): Promise<SkillFileTreeNode[]>`                           |
| 実装             | `safeInvokeUnwrap<SkillFileTreeNode[]>(IPC_CHANNELS.SKILL_GET_FILE_TREE, { skillName })` |

### FR-1-4: IPC チャンネル定義

| 項目                  | 内容                                                     |
| --------------------- | -------------------------------------------------------- |
| 定数名                | `SKILL_GET_FILE_TREE`                                    |
| 値                    | `"skill:getFileTree"`                                    |
| 配置先                | `apps/desktop/src/preload/channels.ts` の `IPC_CHANNELS` |
| ホワイトリスト        | `ALLOWED_INVOKE_CHANNELS` に追加                         |
| `ALLOWED_ON_CHANNELS` | 追加不要（invoke/handle パターンのため）                 |

## 3. 非機能要件（NFR）

### NFR-1: セキュリティ

| ID        | 要件                                                                                         |
| --------- | -------------------------------------------------------------------------------------------- |
| NFR-SEC-1 | `validateIpcSender()` で送信元ウィンドウを検証する                                           |
| NFR-SEC-2 | `skillName` に P42 準拠3段バリデーションを適用する（型チェック → 空文字列 → トリム空文字列） |
| NFR-SEC-3 | SkillFileManager 内部の `findSkillDir()` でパストラバーサルを防止する                        |
| NFR-SEC-4 | 未知エラーは "Internal error" に置換し、内部情報を漏洩しない                                 |
| NFR-SEC-5 | チャンネル名は `IPC_CHANNELS` 定数で参照し、文字列リテラルを使用しない                       |

### NFR-2: 型安全性

| ID        | 要件                                                                             |
| --------- | -------------------------------------------------------------------------------- |
| NFR-TYP-1 | `any` 型を使用しない                                                             |
| NFR-TYP-2 | `SkillFileTreeNode` 型を `@repo/shared` に配置し、Main/Renderer から共有する     |
| NFR-TYP-3 | IPC レスポンスは `{ success: boolean, data?: T, error?: string }` 形式を踏襲する |
| NFR-TYP-4 | Preload API は `safeInvokeUnwrap<T>()` で IPC レスポンスラッパーを展開する       |

### NFR-3: パフォーマンス

| ID         | 要件                                                               |
| ---------- | ------------------------------------------------------------------ |
| NFR-PERF-1 | ファイル数 100 以下のスキルディレクトリでは 500ms 以内に応答する   |
| NFR-PERF-2 | バックアップファイルをフィルタリングし、不要なデータ転送を抑制する |

### NFR-4: 既存パターンとの一貫性

| ID        | 要件                                                                       |
| --------- | -------------------------------------------------------------------------- |
| NFR-CON-1 | `skillFileHandlers.ts` の既存ハンドラーと同一の多層防御パターンを踏襲する  |
| NFR-CON-2 | `isKnownSkillFileError()` による既知エラー判定を再利用する                 |
| NFR-CON-3 | `registerSkillFileHandlers()` / `unregisterSkillFileHandlers()` に統合する |

## 4. 受入基準（AC）

### AC-1: 正常系

| ID    | 検証条件                                                                                   |
| ----- | ------------------------------------------------------------------------------------------ |
| AC-01 | `skill:getFileTree` に有効な `skillName` を渡すと `{ success: true, data: [...] }` が返る  |
| AC-02 | 返却されたツリーにファイルノード（`type: "file"`）が含まれる                               |
| AC-03 | 返却されたツリーにディレクトリノード（`type: "directory"`、`children` 配列付き）が含まれる |
| AC-04 | 各ノードの `path` がスキルディレクトリからの POSIX 形式相対パスである                      |
| AC-05 | バックアップファイル（`.backup.*`, `.deleted.*`）がツリーに含まれない                      |
| AC-06 | ディレクトリ内のノードがアルファベット順（ディレクトリ優先）でソートされている             |

### AC-2: 異常系

| ID    | 検証条件                                                                 |
| ----- | ------------------------------------------------------------------------ |
| AC-07 | 存在しないスキル名を渡すと `{ success: false, error: "..." }` が返る     |
| AC-08 | `skillName` が空文字列の場合、バリデーションエラーが返る                 |
| AC-09 | `skillName` がスペースのみの場合、バリデーションエラーが返る（P42 準拠） |
| AC-10 | `skillName` が `string` 型以外の場合、バリデーションエラーが返る         |

### AC-3: セキュリティ

| ID    | 検証条件                                         |
| ----- | ------------------------------------------------ |
| AC-11 | 不正な送信元ウィンドウからの呼び出しが拒否される |
| AC-12 | エラーメッセージに内部パス情報が含まれない       |

### AC-4: 型安全性

| ID    | 検証条件                                                             |
| ----- | -------------------------------------------------------------------- |
| AC-13 | `SkillFileTreeNode` が `@repo/shared` からインポート可能である       |
| AC-14 | Preload API の `getFileTree` メソッドが `SkillFileTreeNode[]` を返す |

## 実行結果

全完了条件を確認:

- [x] FR-1（skill:getFileTree チャンネルの入出力仕様）が確定している
- [x] FR-1-1（SkillFileManager.getFileTree メソッド仕様）が確定している
- [x] FR-1-2（SkillFileTreeNode 型の共有化方針）が確定している
- [x] FR-1-3（Preload API メソッド仕様）が確定している
- [x] FR-1-4（IPC チャンネル定義）が確定している
- [x] NFR-1〜4（非機能要件）が全て定義されている
- [x] AC-1〜4（受入基準）が全て定義されている
- [x] スコープ（含む / 含まない）が明文化されている
- [x] 曖昧表現が使用されていない

## 5. スコープ

### 含む

| 対象                      | 詳細                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| IPC チャンネル定義        | `channels.ts` に `SKILL_GET_FILE_TREE` を追加                        |
| Main Process ハンドラー   | `skillFileHandlers.ts` に `skill:getFileTree` ハンドラーを追加       |
| SkillFileManager メソッド | `getFileTree(skillName)` メソッドを新規追加                          |
| Preload API               | `skill-api.ts` の `SkillAPI` インターフェースに `getFileTree` を追加 |
| 共有型定義                | `SkillFileTreeNode` を `@repo/shared` に移動                         |
| ユニットテスト            | ハンドラー・サービスメソッド・Preload API のテスト                   |
| useFileTree フック更新    | 型安全な呼び出しへの移行                                             |

### 含まない

| 対象                       | 理由                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| キーボードナビゲーション   | UI タスクのスコープ（別タスク）                                              |
| モバイルドロワー UI        | UI タスクのスコープ（別タスク）                                              |
| UI アニメーション          | UI タスクのスコープ（別タスク）                                              |
| ファイル監視（watch）      | 別チャンネル（`file:watch-start` 等）で実装済み                              |
| ファイルツリーのキャッシュ | 初回実装ではキャッシュなしとする。パフォーマンス計測後に後続タスクで検討する |

## 6. 要件トレーサビリティ

| 受入基準 | 対応FR/NFR | 検証Phase |
| -------- | ---------- | --------- |
| AC-01    | FR-1       | Phase 4   |
| AC-02    | FR-1-1     | Phase 4   |
| AC-03    | FR-1-1     | Phase 4   |
| AC-04    | FR-1-1     | Phase 4   |
| AC-05    | FR-1-1     | Phase 4   |
| AC-06    | FR-1-1     | Phase 4   |
| AC-07    | FR-1       | Phase 4   |
| AC-08    | NFR-SEC-2  | Phase 4   |
| AC-09    | NFR-SEC-2  | Phase 4   |
| AC-10    | NFR-SEC-2  | Phase 4   |
| AC-11    | NFR-SEC-1  | Phase 4   |
| AC-12    | NFR-SEC-4  | Phase 4   |
| AC-13    | NFR-TYP-2  | Phase 4   |
| AC-14    | NFR-TYP-4  | Phase 4   |

## 7. 参照資料

| 資料名                 | パス                                                                              |
| ---------------------- | --------------------------------------------------------------------------------- |
| IPC セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      |
| IPC API仕様            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              |
| Agent SDK 型仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| IPC 契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                              |
| 既存 IPC ハンドラー    | `apps/desktop/src/main/ipc/skillFileHandlers.ts`                                  |
| 既存 Preload API       | `apps/desktop/src/preload/skill-api.ts`                                           |
| SkillFileManager 実装  | `apps/desktop/src/main/services/skill/SkillFileManager.ts`                        |
