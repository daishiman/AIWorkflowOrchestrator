# Phase 2 アーキテクチャ設計

## レイヤー設計

- Renderer: `SkillEditor` が UI状態をローカル管理（選択ファイル、バッファ、未保存、バックアップ表示）。
- Preload: `window.electronAPI.skill.*` 6メソッドを提供。
- Main: `skillFileHandlers.ts` が sender検証 + 引数検証 + `SkillFileManager` 委譲。

## データフロー

1. ファイル選択: Renderer `readFile(skillName, relativePath)`。
2. 保存: Renderer `writeFile(...)`。
3. 作成/削除: Renderer `createFile/deleteFile`。
4. 履歴: Renderer `listBackups/restoreBackup`。

## 状態設計（skillSlice代替）

- `filePaths: string[]`
- `selectedPath: string | null`
- `buffers: Record<string, {content, original}>`
- `pendingAction + showUnsavedDialog`
- `backups + showBackups`

## SoC観点の設計判断

- エディター局所状態はコンポーネント内で閉じる。
- グローバル実行状態（agent実行等）は既存 `agentSlice` を維持。
- 相互依存を切り、既存機能への副作用を最小化。

## 判定

PASS
