# Phase 12: 実装ガイド — skill:getFileTree IPC実装

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| タスクID | UT-UI-05A-GETFILETREE-001 |
| Phase    | 12（ドキュメント）        |
| 作成日   | 2026-03-03                |
| Issue    | #948                      |

---

## Part 1: 概念説明（中学生レベル）

### ファイルツリーって何？

パソコンでフォルダを開くと、中にファイルやフォルダが並んでいますよね。フォルダの中にさらにフォルダがあって、その中にもファイルがある。これが「ツリー構造」です。木の枝が分かれていくように、フォルダの中にどんどん広がっていくからそう呼ばれます。

### 「引っ越し屋さんの荷物リスト」で考えよう

引っ越し屋さんが家の荷物を全部リストにするとしましょう：

- **リビング**（部屋 = フォルダ）
  - テレビ（荷物 = ファイル）
  - ソファ
  - **本棚**（部屋の中の棚 = サブフォルダ）
    - 漫画
    - 辞書

このリストを作るには、引っ越し屋さんは「全部の部屋を順番に回って、中にある物をメモする」必要があります。`getFileTree` がやっていることは、まさにこれです。

### 3つの「門番」

でも、誰でも家に入れちゃダメですよね。`getFileTree` には3人の門番がいます：

1. **身分証チェック（validateIpcSender）**: 「あなた、本当にこの家の人？」
2. **名前チェック（P42バリデーション）**: 「どの家の荷物リストが欲しいの？名前は？」（空白だけ言われても困る）
3. **道案内チェック（findSkillDir）**: 「その家、本当にある？変な場所に連れて行こうとしてない？」

---

## Part 2: 開発者向け実装詳細

### アーキテクチャ

```
Renderer (useFileTree)
    ↓ window.electronAPI.skill.getFileTree(skillName)
Preload (skill-api.ts)
    ↓ safeInvokeUnwrap<SkillFileTreeNode[]>(IPC_CHANNELS.SKILL_GET_FILE_TREE, { skillName })
Main Process (skillFileHandlers.ts)
    ↓ validateIpcSender → P42バリデーション → skillFileManager.getFileTree(skillName)
SkillFileManager (SkillFileManager.ts)
    ↓ findSkillDir → buildFileTree（再帰走査）
FileSystem
```

### 変更ファイル一覧

| ファイル                                                               | 変更種別 | 内容                                                     |
| ---------------------------------------------------------------------- | -------- | -------------------------------------------------------- |
| `apps/desktop/src/preload/channels.ts`                                 | 追加     | `SKILL_GET_FILE_TREE` チャンネル定義 + ホワイトリスト    |
| `apps/desktop/src/main/ipc/skillFileHandlers.ts`                       | 追加     | `skill:getFileTree` ハンドラ（登録 + 解除）              |
| `apps/desktop/src/main/services/skill/SkillFileManager.ts`             | 追加     | `getFileTree` + `buildFileTree` + `SkillFileTreeNode` 型 |
| `apps/desktop/src/preload/skill-api.ts`                                | 追加     | `getFileTree` メソッド（インターフェース + 実装）        |
| `apps/desktop/src/preload/types.ts`                                    | 追加     | `SkillFileTreeNode` 型定義                               |
| `apps/desktop/src/renderer/views/SkillEditorView/hooks/useFileTree.ts` | 変更     | `as` キャスト除去 → クリーンな直接呼び出し               |

### 主要実装パターン

#### 1. IPC ハンドラパターン（多層防御）

```typescript
ipcMain.handle(IPC_CHANNELS.SKILL_GET_FILE_TREE, async (event, args) => {
  // Layer 1: 送信元検証
  const validation = validateIpcSender(event, channel, {
    getAllowedWindows: () => [mainWindow],
  });
  if (!validation.valid) throw toIPCValidationError(validation);

  // Layer 2: P42 3段バリデーション
  if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
    return { success: false, error: "skillName must be a non-empty string" };
  }

  // Layer 3: ビジネスロジック（SkillFileManager 内部でパストラバーサル防止）
  try {
    const tree = await skillFileManager.getFileTree(args.skillName);
    return { success: true, data: tree };
  } catch (error) {
    if (isKnownSkillFileError(error))
      return { success: false, error: error.message };
    return { success: false, error: "Internal error" }; // エラーサニタイズ
  }
});
```

#### 2. buildFileTree（再帰走査 + フィルタ + ソート）

```typescript
private async buildFileTree(dir: string, basePath: string): Promise<SkillFileTreeNode[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  // 1. BACKUP_PATTERN でバックアップファイルを除外
  // 2. path.relative + POSIX 変換で相対パス算出
  // 3. ディレクトリは再帰呼び出し、ファイルはリーフノード
  // 4. ソート: ディレクトリ先頭 → 名前順
}
```

#### 3. 構造的部分型（SkillFileTreeNode の3箇所定義）

レイヤー分離を維持するため、同一構造の型を3箇所で独立定義：

- `SkillFileManager.ts`: Main Process 用
- `preload/types.ts`: Preload 用
- `SkillEditorView/types.ts`: Renderer 用（既存、変更なし）

### テスト構成

| テストファイル                         | テスト数 | テスト対象                                                 |
| -------------------------------------- | -------- | ---------------------------------------------------------- |
| `skillFileHandlers.test.ts`            | 50       | IPC ハンドラ（既存26 + getFileTree 12 + 拡充3 + P41対策9） |
| `SkillFileManager.getFileTree.test.ts` | 5        | サービスメソッド（実FS使用）                               |
| `skill-api.getFileTree.test.ts`        | 1        | Preload API                                                |
