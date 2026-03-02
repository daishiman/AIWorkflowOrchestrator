# UT-UI-05A-GETFILETREE-001: skill:getFileTree IPCチャネル追加

## メタ情報

| 項目         | 値                                                                   |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-UI-05A-GETFILETREE-001                                            |
| 優先度       | CRITICAL                                                             |
| 発見元       | TASK-UI-05A Phase 1 IPC連携要件（FR-1 ファイルツリー表示の前提条件） |
| 依存タスク   | なし（TASK-UI-05A 実装前に完了必須）                                 |
| ブロック対象 | TASK-UI-05A-SKILL-EDITOR-VIEW（FR-1 ファイルツリー表示）             |

---

## 概要

SkillEditorView のファイルツリー表示（FR-1）は `skill:getFileTree` IPCチャネルに依存するが、このチャネルは未実装である。SkillFileManager の `walkDir()` メソッドをベースに、新しいIPCチャネルを追加してRenderer側からファイルツリーを取得可能にする。

---

## 実装内容

### 1. SkillFileManager（Main Process）

- `walkDir()` を public 化するか、新メソッド `getFileTree(skillName: string): Promise<FileNode[]>` を追加する
- `FileNode` 型定義: `{ name: string, path: string, type: "file" | "directory", children?: FileNode[] }`

### 2. skillFileHandlers.ts（IPCハンドラ）

- `skill:getFileTree` ハンドラ追加
- P42準拠3段バリデーション:
  1. 型チェック: `typeof skillName !== "string"`
  2. 空文字列チェック: `skillName === ""`
  3. トリム空文字列チェック: `skillName.trim() === ""`
- 送信元ウィンドウ検証（validateIpcSender）

### 3. channels.ts（チャネル定義）

- `SKILL_GET_FILE_TREE: "skill:getFileTree"` を IPC_CHANNELS に追加
- ホワイトリストに追加

### 4. skill-api.ts（Preload API）

- `getFileTree(skillName: string): Promise<FileNode[]>` メソッド追加
- `safeInvoke(IPC_CHANNELS.SKILL_GET_FILE_TREE, skillName)` で呼び出し

### 5. preload/types.ts（型定義）

- `SkillAPI` インターフェースに `getFileTree` メソッドの型定義を追加

### 6. テスト追加

- ハンドラテスト: バリデーション成功/失敗、正常レスポンス、エラーハンドリング
- セキュリティテスト: validateIpcSender による送信元検証
- Preloadテスト: safeInvoke 呼び出し確認

---

## 受け入れ基準

- [ ] `channels.ts` に `SKILL_GET_FILE_TREE: "skill:getFileTree"` が定義されている
- [ ] ハンドラが P42 準拠 3段バリデーション（型チェック → 空文字列 → トリム空文字列）を実装している
- [ ] Preload API が `getFileTree(skillName: string): Promise<FileNode[]>` として公開されている
- [ ] テストカバレッジが Line 80% 以上、Branch 60% 以上を達成している
- [ ] `pnpm typecheck` が通ること
- [ ] `pnpm lint` が通ること
- [ ] 既存テストが全件 PASS すること

---

## 関連仕様書

- `docs/30-workflows/skill-editor-view/phase-1-requirements.md` — IPC連携要件テーブル（7チャネル目）
- `docs/30-workflows/skill-editor-view/phase-5-implementation.md` — タスク9: useFileTree フック実装
- `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` — IPC セキュリティ要件
- `.claude/rules/06-known-pitfalls.md#P42` — 3段バリデーション標準
- `.claude/rules/06-known-pitfalls.md#P44` — IPCインターフェース不整合防止
