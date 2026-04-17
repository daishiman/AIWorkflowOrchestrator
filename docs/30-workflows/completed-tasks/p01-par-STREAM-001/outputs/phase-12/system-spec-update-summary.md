# システム仕様更新サマリー: TASK-SW-STREAM-001

## 変更ファイル

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

## 変更内容

- `createSkill()` シグネチャへのオプショナルコールバック引数追加
- `SkillCreatorProgressData` 型追加（local定義）
- `SkillCreatorProgressCallback` 型追加（local定義）
- 5段階のprogress通知実装（emitProgressヘルパー経由）

## 影響範囲

- `skillCreatorHandlers.ts`（TASK-SW-STREAM-002で変更予定）
- テスト: `SkillCreatorService.progress.test.ts`（新規追加）

## 後続タスク

- TASK-SW-STREAM-002: IPC配線（`sendSkillCreatorProgress` との接続）
- FUP-01: `SkillCreatorProgressData` のshared移動
- FUP-02: progress定数化
- FUP-03: モード別進捗フロー詳細化
