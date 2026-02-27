# Phase 4 テスト仕様

## 対象

- UIユーティリティ: `getLanguage`, `buildFileTree`
- UIコンポーネント: `SkillCodeEditor`, `SkillEditor`
- 既存回帰: `SkillFileManager`, `skillFileHandlers`, `skill-api`

## 新規テストファイル

- `SkillEditor.test.tsx`（7 tests）
- `SkillCodeEditor.test.tsx`（3 tests）
- `buildFileTree.test.ts`（2 tests）
- `getLanguage.test.ts`（3 tests）

## テスト戦略

- happy-dom環境のため `fireEvent` 中心。
- IPCは `window.electronAPI.skill` をモック。
- 重要フロー（読み込み/保存/未保存警告/readonly/バックアップ）を優先。

## 判定

PASS
