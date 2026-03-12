# Phase 1 スコープ定義

## In Scope

- `SkillManagementPanel` への単一セッション導線追加
- `skillCreatorAPI.detectMode` / `validateSkill` を内部エンジンとして再利用する設計
- `useCreateSkill` / `useExecuteSkill` / `useAnalyzeSkill` / `useAutoImproveSkill` の handoff 接続
- `SkillCreateWizard` の補助 UI 化
- Task03 向けテスト、手動検証、system spec 同期

## Out of Scope

- Task02 の共通会話基盤そのものの全面実装や置換
- 新規 IPC チャネル追加による大規模契約拡張
- `skillCreatorAPI.improveSkill` など未整備 script 群を本 task で本格実装すること
- `Skill Center` / Global Navigation の再設計

## 依存関係

| 依存                                                  | 使い方                                                 |
| ----------------------------------------------------- | ------------------------------------------------------ |
| TASK-SKILL-LIFECYCLE-01                               | primary entry / handoff / surface ownership を流用する |
| TASK-SKILL-LIFECYCLE-02                               | 単一セッション・mode 差分内部吸収の前提として扱う      |
| `skill:create`                                        | 名前生成・再スキャン込み create facade として使う      |
| `skillCreatorAPI`                                     | mode 判定・検証の内部エンジンとして使う                |
| `skill:execute`, `skill:analyze`, `skill:autoImprove` | execute / improve handoff に使う                       |

## リスクと先回り

| リスク                                   | 先回り策                                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `skillCreatorAPI` の一部 script が未実装 | Task03 では `detectMode` / `validateSkill` までに用途を絞る                                                  |
| 既存テストの store mock 破壊             | セレクタ追加時に既存 test mock を同時更新する                                                                |
| create した skill 名の選択同期漏れ       | path から skill 名を導出し、`selectSkillByName()` を明示的に呼ぶ                                             |
| 実行中 UI と分析 UI の責務衝突           | session card は summary + handoff に留め、詳細は既存 `SkillStreamingView` / `SkillAnalysisView` を再利用する |
