# Phase 8 命名・型統一

## 統一事項

- `skillName`, `relativePath`, `backupPath` 命名を IPC 契約に一致。
- UI側カテゴリ型 `FileTreeCategory` を明示。
- `getLanguage`, `buildFileTree` を pure utility として export。

## 整合確認

- Preload `SkillAPI` シグネチャと呼び出し引数を一致確認。
- テストで引数一致（toHaveBeenCalledWith）を検証。

## 結論

統一完了（PASS）。
