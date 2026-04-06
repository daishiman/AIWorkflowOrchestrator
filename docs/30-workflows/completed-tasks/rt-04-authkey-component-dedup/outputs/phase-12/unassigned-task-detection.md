# Phase 12: 未タスク検出レポート

## 未タスク: ApiKeySettingsPanel 廃止

- タスクID（仮）: TASK-RT-04-APIKEYPANEL-REMOVAL-001
- 由来: TECH-M-01（Phase 3 MINOR 指摘）
- 内容: ApiKeySettingsPanel を AuthKeySection への委譲実装後に削除する
- 前提条件: AuthKeySection への完全委譲が確認されていること（本タスクで確認済み）
- 呼び出し元変更が必要: SkillLifecyclePanel など ApiKeySettingsPanel を import している箇所
- ステータス: unassigned
- 参照 Issue: #1903
- タスク仕様書: `docs/30-workflows/unassigned-task/TASK-RT-04-APIKEYPANEL-REMOVAL-001.md`

## 検出サマリー

| MINOR ID  | 内容                         | 未タスク化                 |
| --------- | ---------------------------- | -------------------------- |
| TECH-M-01 | ApiKeySettingsPanel 廃止     | 要（上記）                 |
| TECH-M-02 | useAuthModeStatus store 依存 | 不要（Phase 5 で解決済み） |
