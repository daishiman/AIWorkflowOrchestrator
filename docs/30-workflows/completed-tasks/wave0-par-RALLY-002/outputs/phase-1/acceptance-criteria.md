# Phase 1 受け入れ基準

## TASK-RALLY-002 受け入れ基準定義

| ID   | 基準                                                                                          | 検証方法                          |
| ---- | --------------------------------------------------------------------------------------------- | --------------------------------- |
| AC-1 | `RALLY-002` は verify_existing タスクとして定義され、Phase 4/5 がその前提で書かれている       | phase-4, phase-5 仕様書の内容確認 |
| AC-2 | `restoredPendingRequest` 優先規則と `workflowSnapshot` 到着後のクリア条件が仕様書で説明される | コメント追加後のコードレビュー    |
| AC-3 | `RALLY-002` が `ConversationalInterview.tsx` に閉じた責務であることが明記される               | 本仕様書・設計書の確認            |
| AC-4 | `RALLY-010` 以降への依存が index / artifacts / 本文で一致している                             | index.md の依存関係記述確認       |
| AC-5 | Phase 11 は NON_VISUAL、Phase 13 は approval-blocked 原則に整合している                       | phase-11, phase-13 仕様書確認     |

## 確認結果

### AC-1: verify_existing タスク定義

- ✅ Phase 5 仕様書に「diff check が主、コード修正は従」と明記
- ✅ Phase 4 仕様書に「RED ではなく既存挙動固定」と明記
- **判定: PASS**

### AC-2: 優先規則とクリア条件の仕様化

- ✅ rally-phase-2-solution.md に設計コメントが定義済み
- ✅ Phase 5 実装でコメント追加により達成予定
- **判定: Phase 5 完了後に PASS**

### AC-3: 責務の境界明記

- ✅ index.md に「ConversationalInterview.tsx に限定し、SkillLifecyclePanel.tsx や IPC 契約変更を含めない」と記載
- **判定: PASS**

### AC-4: RALLY-010 以降への依存整合

- ✅ index.md の依存関係セクションに `RALLY-002 -> RALLY-010 -> RALLY-011 -> RALLY-012 -> RALLY-013` が明記
- ✅ rally-phase-2-solution.md の依存グラフと一致
- **判定: PASS**

### AC-5: Phase 11 NON_VISUAL / Phase 13 approval-blocked

- ✅ phase-11 仕様書に `NON_VISUAL として semantic behavior のみを監査する` と明記
- ✅ index.md に「Phase 13 はユーザー明示承認があるまで blocked 扱い」と明記
- **判定: PASS**
