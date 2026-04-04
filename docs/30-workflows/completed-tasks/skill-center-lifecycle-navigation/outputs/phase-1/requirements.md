# Phase 1 出力: 要件定義

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

### スコープ確認

| 項目                      | 確認結果                                                  |
| ------------------------- | --------------------------------------------------------- |
| ViewType 追加             | `"skillManagement"` を追加（既存 `"skillCreate"` は維持） |
| App.tsx 追加              | `renderView()` に `case "skillManagement"` + dock 正規化  |
| useSkillCenter 追加       | `navigateToSkillManagement` 関数を追加                    |
| SkillCenterView 変更      | 「スキル管理」ボタンを `header-row` 内に追加              |
| SkillManagementPanel 変更 | `onClose` + `skill-management-back-button` を追加         |

### 受入条件（AC）全 8 件確認

- AC-01: SkillCenterView が既存のまま開く ✅
- AC-02: 「作成を始める」→ skillCreate 維持 ✅
- AC-03: 「スキル管理」→ skillManagement 遷移 ✅
- AC-04: SkillManagementPanel の戻るで skillCenter に戻る ✅
- AC-05: ViewType に skillManagement 追加済み ✅
- AC-06: lifecycle/create 切替は既存テストで保証 ✅
- AC-07: /advanced/skill-create-wizard は維持 ✅
- AC-08: 新規 Unit Test が全 PASS ✅

### タスク種別

UI task（Renderer 層のみ変更・IPC 変更なし）
