# Phase 4 統合テスト一覧

## UI統合

- IT-UI-01: `SkillImportDialog` 単一選択時に `skill.name` が `onImport` へ渡る
  - 参照: `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx`
- IT-UI-02: `importedSkillIds` 判定は `skill.id` ベースを維持
  - 同上

## IPC統合

- IT-IPC-01: `skill:import` が空文字/trim空文字を拒否
  - 参照: `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`
- IT-IPC-02: `skill:import` は有効skillNameで import 実行できる
  - 参照: `apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts`

## Red時点の判断

- 統合テスト観点は既存で揃っており、Phase 5 では型シグネチャ変更後の回帰確認を実施する。
