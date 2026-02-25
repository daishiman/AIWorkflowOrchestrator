# Phase 2 テスト設計マトリクス

| レイヤ         | テスト対象                          | 期待値                   | 種別           |
| -------------- | ----------------------------------- | ------------------------ | -------------- |
| shared         | `SkillId` と `SkillName` の相互代入 | コンパイルエラー         | 型テスト       |
| shared         | `toSkillId` / `toSkillName`         | 文字列値を保持           | ユニット       |
| renderer       | `SkillImportDialog.onImport`        | `SkillName[]` が渡る     | コンポーネント |
| renderer/store | `importedSkillIds` 判定             | `SkillId` で照合維持     | ユニット       |
| preload        | `skillAPI.import/remove`            | `SkillName` 受け口維持   | ユニット       |
| main           | `skill:import` バリデーション       | 空文字拒否・trim拒否維持 | IPC統合        |

## 実行順

1. 型テスト（Red）
2. 既存SkillImportDialogテスト（Red/Green確認）
3. 実装後 `pnpm typecheck` と `pnpm --filter @repo/desktop test:run`
4. 必要に応じてカバレッジ測定
