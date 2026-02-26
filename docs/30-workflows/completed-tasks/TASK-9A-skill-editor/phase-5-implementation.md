# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目      | 値                                                        |
| --------- | --------------------------------------------------------- |
| Phase     | 5                                                         |
| 機能名    | TASK-9A-skill-editor                                      |
| 作成日    | 2026-02-26                                                |
| 前提Phase | Phase 4（テスト作成）完了                                 |
| 目的      | Phase 4 で作成したテストを Green にする最小限の実装を行う |

## 目的

Phase 4 で作成した67テスト（Red）を全て Green にするための実装を行う。TDD の Green フェーズとして、テストを通す最小限の実装に集中する。3つのサブタスク（TASK-9A-A: SkillFileManager、TASK-9A-B: IPCハンドラー、TASK-9A-C: UIコンポーネント）を下位レイヤーから順に実装する。

## 実行タスク

- Task 1: SkillFileManager 実装（Main Process サービス層）
- Task 2: IPC ハンドラー実装（skillFileHandlers.ts）
- Task 3: Preload API 拡張（skill-api.ts）
- Task 4: Store 拡張（skillSlice エディター状態）
- Task 5: UI コンポーネント実装（SkillEditor, SkillCodeEditor）

## 参照資料

| 資料名                 | パス                                                                                        | 説明                                   |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 2 設計成果物     | `outputs/phase-2/`                                                                          | クラス設計・型定義・メソッド設計       |
| Phase 4 テスト成果物   | `outputs/phase-4/`                                                                          | テストコード（Green にする対象）       |
| セキュリティAPI仕様    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | validateIpcSender、IPC通信セキュリティ |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ(1000-5999)              |
| アーキテクチャ概要     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | レイヤー構成、IPCハンドラー登録一覧    |
| IPC契約チェックリスト  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約ドリフト防止手順                |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI、Setter Injection                   |

## 実行手順

### Task 1: SkillFileManager 実装

**実装ファイル**: `apps/desktop/src/main/services/skill/SkillFileManager.ts`（新規作成）

#### 1.1 Step 1: エラークラス定義

**ファイル**: `apps/desktop/src/main/services/skill/errors.ts`（新規作成）

| エラークラス       | 条件                                     | 用途                              |
| ------------------ | ---------------------------------------- | --------------------------------- |
| SkillNotFoundError | 指定スキルのディレクトリが見つからない   | readFile, writeFile 等全操作      |
| ReadonlySkillError | `~/.claude/skills/` 配下のスキル         | writeFile, createFile, deleteFile |
| PathTraversalError | `../` やスキルディレクトリ外へのアクセス | 全ファイル操作                    |
| FileExistsError    | createFile 時にファイルが既存            | createFile                        |
| FileNotFoundError  | 対象ファイルが存在しない                 | readFile, deleteFile              |

#### 1.2 Step 2: 型定義

```typescript
// apps/desktop/src/main/services/skill/SkillFileManager.ts

export interface SkillDirInfo {
  path: string; // スキルディレクトリの絶対パス
  readonly: boolean; // ~/.claude/skills は true、~/.aiworkflow/skills は false
}

export interface SkillFileManagerOptions {
  aiworkflowSkillsDir?: string; // デフォルト: ~/.aiworkflow/skills
  claudeSkillsDir?: string; // デフォルト: ~/.claude/skills
}

export interface BackupInfo {
  filename: string; // "SKILL.md.backup.1700000000000"
  relativePath: string; // スキルディレクトリ相対パス
  originalPath: string; // 元ファイルパス（接尾辞除外）
  type: "backup" | "deleted";
  timestamp: number; // ミリ秒単位タイムスタンプ
  createdAt: Date;
}
```

#### 1.3 Step 3: コンストラクタ・スキルディレクトリ検索

```
処理フロー:
1. コンストラクタで aiworkflowSkillsDir, claudeSkillsDir を初期化
2. findSkillDir(skillName):
   a. ~/.aiworkflow/skills/{skillName} を検索 → readonly=false
   b. ~/.claude/skills/{skillName} を検索 → readonly=true
   c. 見つからない場合 → SkillNotFoundError
3. validatePath(basePath, relativePath):
   a. path.resolve で絶対パス化
   b. basePath からの相対位置を検証
   c. 外部アクセス → PathTraversalError
```

#### 1.4 Step 4: readFile 実装

```
処理フロー:
1. findSkillDir(skillName) でスキルディレクトリを取得
2. validatePath(skillDir, relativePath) でパス安全性を検証
3. fs.readFile で内容を読み込み
4. ファイル不存在 → FileNotFoundError
```

対応テスト: M-01 ~ M-05

#### 1.5 Step 5: writeFile 実装

```
処理フロー:
1. findSkillDir(skillName) でスキルディレクトリを取得
2. readonly チェック → ReadonlySkillError
3. validatePath(skillDir, relativePath) でパス安全性を検証
4. 既存ファイルのバックアップ作成: {filePath}.backup.{Date.now()}
5. fs.writeFile で内容を書き込み
```

対応テスト: M-06 ~ M-08

#### 1.6 Step 6: createFile 実装

```
処理フロー:
1. findSkillDir(skillName) でスキルディレクトリを取得
2. readonly チェック → ReadonlySkillError
3. validatePath(skillDir, relativePath) でパス安全性を検証
4. ファイル存在チェック → FileExistsError
5. fs.mkdir(recursive: true) で親ディレクトリ作成
6. fs.writeFile で新規作成（wx フラグ）
```

対応テスト: M-09 ~ M-10

#### 1.7 Step 7: deleteFile 実装

```
処理フロー:
1. findSkillDir(skillName) でスキルディレクトリを取得
2. readonly チェック → ReadonlySkillError
3. validatePath(skillDir, relativePath) でパス安全性を検証
4. ファイル存在チェック → FileNotFoundError
5. 削除バックアップ作成: {filePath}.deleted.{Date.now()}
6. fs.rename で元ファイルをバックアップにリネーム
```

対応テスト: M-11 ~ M-12

#### 1.8 Step 8: listBackups・restoreBackup 実装

```
listBackups 処理フロー:
1. findSkillDir(skillName) でスキルディレクトリを取得
2. walkDir で再帰的にファイル一覧取得
3. .backup.{timestamp} / .deleted.{timestamp} パターンでフィルタ
4. BackupInfo[] に変換して返却

restoreBackup 処理フロー:
1. findSkillDir(skillName) でスキルディレクトリを取得
2. validatePath で バックアップパスを検証
3. バックアップファイル存在チェック → FileNotFoundError
4. 復元先の現在のファイルをバックアップ
5. バックアップ内容を復元先にコピー
```

対応テスト: M-13 ~ M-15

### Task 2: IPC ハンドラー実装

**実装ファイル**: `apps/desktop/src/main/ipc/skillFileHandlers.ts`（新規作成）

#### 2.1 ハンドラー登録関数

```typescript
// 登録関数のシグネチャ
export function registerSkillFileHandlers(
  skillFileManager: SkillFileManager,
  skillService: SkillService | null,
  mainWindow: BrowserWindow | null,
): void;

export function unregisterSkillFileHandlers(): void;
```

#### 2.2 共通パターン: バリデーション + エラーハンドリング

```
各ハンドラー共通処理:
1. validateIpcSender(event, mainWindow, { getAllowedWindows }) で送信元検証
2. 引数の3段バリデーション（P42準拠）:
   a. typeof チェック
   b. === "" チェック
   c. .trim() === "" チェック
3. SkillFileManager メソッド呼び出し
4. エラーハンドリング:
   a. isKnownSkillFileError → error.message を返却
   b. 予期しないエラー → "Internal error" を返却
5. 成功時: { success: true, data?: T }
6. 失敗時: { success: false, error: string }
```

#### 2.3 6チャンネルの実装

| チャンネル          | ハンドラー引数                         | SkillFileManager メソッド                      | 副作用                  |
| ------------------- | -------------------------------------- | ---------------------------------------------- | ----------------------- |
| skill:readFile      | `{ skillName, relativePath }`          | `readFile(skillName, relativePath)`            | なし                    |
| skill:writeFile     | `{ skillName, relativePath, content }` | `writeFile(skillName, relativePath, content)`  | `scanAvailableSkills()` |
| skill:createFile    | `{ skillName, relativePath, content }` | `createFile(skillName, relativePath, content)` | なし                    |
| skill:deleteFile    | `{ skillName, relativePath }`          | `deleteFile(skillName, relativePath)`          | なし                    |
| skill:listBackups   | `{ skillName }`                        | `listBackups(skillName)`                       | なし                    |
| skill:restoreBackup | `{ skillName, backupPath }`            | `restoreBackup(skillName, backupPath)`         | なし                    |

対応テスト: I-01 ~ I-23, S-01 ~ S-05

#### 2.4 IPC チャンネル定数登録

以下のファイルに6チャンネルを追加:

| ファイル                               | 追加内容                                     |
| -------------------------------------- | -------------------------------------------- |
| `packages/shared/src/ipc/channels.ts`  | SKILL_READ_FILE 等6定数の定義                |
| `apps/desktop/src/preload/channels.ts` | 同6定数の複製 + ALLOWED_INVOKE_CHANNELS 追加 |

### Task 3: Preload API 拡張

**実装ファイル**: `apps/desktop/src/preload/skill-api.ts`（修正）

#### 3.1 SkillAPI インターフェース拡張

```typescript
// 追加する6メソッド
interface SkillAPI {
  // ...既存メソッド...
  readFile(skillName: string, relativePath: string): Promise<string>;
  writeFile(
    skillName: string,
    relativePath: string,
    content: string,
  ): Promise<void>;
  createFile(
    skillName: string,
    relativePath: string,
    content: string,
  ): Promise<void>;
  deleteFile(skillName: string, relativePath: string): Promise<void>;
  listBackups(skillName: string): Promise<BackupInfo[]>;
  restoreBackup(skillName: string, backupPath: string): Promise<void>;
}
```

#### 3.2 safeInvoke パターンで実装

```
各メソッド:
1. safeInvoke(IPC_CHANNELS.SKILL_XXX, { ...args }) で Main Process に送信
2. safeInvokeUnwrap でレスポンスの data フィールドを抽出
3. 失敗時は Error をスロー
```

### Task 4: Store 拡張（skillSlice エディター状態）

**実装ファイル**: `apps/desktop/src/renderer/store/slices/skillSlice.ts`（修正）

#### 4.1 エディター状態の追加

```typescript
// skillSlice に追加する状態
interface SkillEditorState {
  openFile: { skillName: string; relativePath: string } | null;
  content: string;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
}

// 追加するアクション
interface SkillEditorActions {
  openFile: (skillName: string, relativePath: string) => Promise<void>;
  setEditorContent: (content: string) => void;
  saveFile: () => Promise<void>;
  closeFile: () => void;
}
```

#### 4.2 個別セレクタの追加（P31準拠）

```typescript
// 個別セレクタ（P31対策: 合成Hookではなく個別セレクタ）
export const useEditorOpenFile = () => useStore((s) => s.openFile);
export const useEditorContent = () => useStore((s) => s.content);
export const useEditorIsDirty = () => useStore((s) => s.isDirty);
export const useEditorIsLoading = () => useStore((s) => s.isLoading);
export const useEditorError = () => useStore((s) => s.error);
export const useOpenFile = () => useStore((s) => s.openFile);
export const useSetEditorContent = () => useStore((s) => s.setEditorContent);
export const useSaveFile = () => useStore((s) => s.saveFile);
export const useCloseFile = () => useStore((s) => s.closeFile);
```

対応テスト: E-01 ~ E-05

### Task 5: UI コンポーネント実装

#### 5.1 SkillCodeEditor コンポーネント

**実装ファイル**: `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx`（新規作成）

```
Props:
- content: string          — テキストエリアに表示する内容
- onChange: (content: string) => void — テキスト変更時コールバック
- onSave: () => void       — Ctrl+S / Cmd+S 時コールバック
- readOnly?: boolean       — 読み取り専用フラグ

実装:
1. <textarea> ベースのシンプルなコードエディター
2. onChange イベントで props.onChange を呼び出し
3. onKeyDown で Ctrl+S / Cmd+S を検出して props.onSave を呼び出し
4. readOnly=true 時は textarea を disabled に
5. aria-label 付与（アクセシビリティ）
```

対応テスト: C-07 ~ C-10

#### 5.2 SkillEditor コンポーネント

**実装ファイル**: `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`（新規作成）

```
Props:
- skillName: string        — 表示するスキル名
- isReadonly?: boolean     — 読み取り専用フラグ

レイアウト:
┌─ SkillEditor ─────────────────────────────────┐
│ ┌─ ファイルツリー（左）─┐ ┌─ エディター（右）─┐ │
│ │ SKILL.md              │ │                    │ │
│ │ agents/               │ │ <SkillCodeEditor   │ │
│ │   agent-1.md          │ │   content={...}    │ │
│ │ references/           │ │   onChange={...}   │ │
│ │   ref-1.md            │ │   onSave={...}    │ │
│ │                       │ │   readOnly={...}  │ │
│ └───────────────────────┘ │ />                 │ │
│                           └────────────────────┘ │
│ [未保存インジケーター]           [保存ボタン]     │
└──────────────────────────────────────────────────┘

実装フロー:
1. skillAPI を使ってファイルツリーを構築
2. ファイル選択で skillAPI.readFile → content 表示
3. 編集で isDirty=true、未保存インジケーター表示
4. 保存で skillAPI.writeFile → isDirty=false
5. エラー時はトーストメッセージ表示
6. 個別セレクタ（useEditorContent 等）で Store と連携（P31準拠）
```

対応テスト: C-01 ~ C-06

## 統合テスト連携【必須】

| 接続要件カテゴリ     | 実装での対応                                                                        |
| -------------------- | ----------------------------------------------------------------------------------- |
| IPC チャンネル契約   | skillFileHandlers.ts で6チャンネルを ipcMain.handle で登録、channels.ts に定数定義  |
| セキュリティ境界     | 全ハンドラーで validateIpcSender + P42準拠3段バリデーション実施                     |
| Preload-Main 契約    | skill-api.ts の safeInvoke 引数と skillFileHandlers.ts のハンドラー引数を一致させる |
| Store-Component 連携 | 個別セレクタ経由でエディター状態を取得（P31対策）                                   |
| writeFile 副作用     | writeFile 成功後に skillService.scanAvailableSkills() を呼び出してスキル一覧を更新  |

> **注記**: IPC契約チェックリスト（ipc-contract-checklist.md）Phase 1-6 を全チャンネルで実施すること。

## アーキテクチャ層別実装

| 層           | 実装ファイル                                                     | Task |
| ------------ | ---------------------------------------------------------------- | ---- |
| Main Process | `apps/desktop/src/main/services/skill/SkillFileManager.ts`       | 1    |
| Main Process | `apps/desktop/src/main/services/skill/errors.ts`                 | 1    |
| IPC          | `apps/desktop/src/main/ipc/skillFileHandlers.ts`                 | 2    |
| Shared       | `packages/shared/src/ipc/channels.ts`                            | 2    |
| Preload      | `apps/desktop/src/preload/channels.ts`                           | 2    |
| Preload      | `apps/desktop/src/preload/skill-api.ts`                          | 3    |
| Store        | `apps/desktop/src/renderer/store/slices/skillSlice.ts`           | 4    |
| Renderer     | `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx` | 5    |
| Renderer     | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`     | 5    |

## 設計変更記録

| 変更ID           | 変更内容 | 理由 | 影響範囲 |
| ---------------- | -------- | ---- | -------- |
| （実装時に記録） | —        | —    | —        |

> Phase 5 実装中に Phase 2 設計からの変更が発生した場合、このセクションに記録する。変更があった場合は Phase 3 設計レビューの再実施を検討する。

## Pitfall 対策チェックリスト

| Pitfall ID | 対策                                                                 | 適用箇所       |
| ---------- | -------------------------------------------------------------------- | -------------- |
| P23        | 型定義を packages/shared と preload/types.ts で同時更新              | Task 2, Task 3 |
| P32        | channels.ts の2ファイル同時更新                                      | Task 2         |
| P42        | 全 IPC 引数に3段バリデーション                                       | Task 2         |
| P44        | ハンドラー引数形式と Preload 側引数形式を一致させる                  | Task 2, Task 3 |
| P45        | 引数名のセマンティクスを実際の値と一致させる（skillName統一）        | Task 1, Task 2 |
| P31        | 個別セレクタ使用、合成Hook避ける                                     | Task 4         |
| P5         | registerSkillFileHandlers/unregisterSkillFileHandlers で二重登録防止 | Task 2         |
| P34        | SkillFileManager は Constructor Injection で注入                     | Task 2         |

## 成果物

| 成果物                    | パス                                                             | 説明                                   |
| ------------------------- | ---------------------------------------------------------------- | -------------------------------------- |
| エラークラス定義          | `apps/desktop/src/main/services/skill/errors.ts`                 | 5つのカスタムエラークラス              |
| SkillFileManager          | `apps/desktop/src/main/services/skill/SkillFileManager.ts`       | ファイル操作サービス（6メソッド）      |
| IPC ハンドラー            | `apps/desktop/src/main/ipc/skillFileHandlers.ts`                 | 6チャンネルのIPCハンドラー             |
| チャンネル定数（shared）  | `packages/shared/src/ipc/channels.ts`                            | 6チャンネル定数追加                    |
| チャンネル定数（preload） | `apps/desktop/src/preload/channels.ts`                           | 6チャンネル定数複製                    |
| Preload API               | `apps/desktop/src/preload/skill-api.ts`                          | 6メソッド追加                          |
| Store 拡張                | `apps/desktop/src/renderer/store/slices/skillSlice.ts`           | エディター状態 + 個別セレクタ追加      |
| SkillCodeEditor           | `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx` | テキストエリアベースのコードエディター |
| SkillEditor               | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`     | ファイルツリー + エディター統合UI      |

## 完了条件

- [ ] Phase 4 の67テストが全て Green（PASS）になっている
- [ ] SkillFileManager の6メソッドが全て実装されている
- [ ] 6つの IPC チャンネルが登録・動作している
- [ ] channels.ts の2ファイル（shared, preload）が同期している
- [ ] P42準拠3段バリデーションが全ハンドラーに実装されている
- [ ] 個別セレクタが skillSlice に追加されている（P31対策）
- [ ] SkillEditor が読み取り専用スキルを正しく処理している
- [ ] 設計変更がある場合、設計変更記録セクションに記録済み
- [ ] `pnpm typecheck` が通る
- [ ] `pnpm lint` が通る

## TDD 検証

```bash
# 全テストが Green であることを確認
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/skillSlice.editor

# 型チェック
pnpm typecheck

# Lint
pnpm lint
```

## 次のPhase

Phase 6: テスト拡充 — カバレッジ不足箇所のテストを追加する
