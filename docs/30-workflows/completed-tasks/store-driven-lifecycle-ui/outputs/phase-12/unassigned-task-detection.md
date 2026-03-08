# TASK-10A-F 未タスク検出レポート

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-10A-F                                         |
| Phase      | 12 Task 4                                          |
| 実施日     | 2026-03-08                                         |
| open件数   | 5件                                                |
| 履歴ガード | 1件（完了済み）                                    |
| 検出方法   | コード grep + 既存 backlog 照合 + 物理ファイル確認 |

---

## open backlog（今回も継続して有効）

| タスクID                                            | 概要                                                                                | 優先度 | 指示書                                                                                                                               | 物理ファイル |
| --------------------------------------------------- | ----------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| `UT-10A-G-SKILL-EDITOR-IPC-STORE-MIGRATION`         | `SkillEditor.tsx` に残る 6 箇所の直接IPCを Store action へ移行する                  | 中     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-g-skill-editor-ipc-store-migration.md`         | 存在確認済み |
| `UT-10A-F-STORE-MOCK-PATTERN-STANDARDIZATION-GUARD` | Store 個別セレクタ mock の標準ヘルパーを導入し、テストパターンを統一する            | 中     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-f-store-mock-pattern-standardization-guard.md` | 存在確認済み |
| `UT-10A-F-IMPROVEMENT-RESULT-STORE-INTEGRATION`     | `improvementResult` を画面横断共有が必要になった時点で Store 統合する               | 低     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-f-improvement-result-store-integration.md`     | 存在確認済み |
| `UT-10A-F-SCREENSHOT-HARNESS-HARDENING`             | Screenshot Harness の待機条件を `data-testid` 基準で標準化し、UI 文言差分に強くする | 中     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-f-screenshot-harness-hardening.md`             | 存在確認済み |
| `UT-10A-F-2WORKFLOW-BASELINE-NORMALIZATION`         | 移管前 2workflow と移管後 completed 正本の正規化手順を自動化する                    | 中     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-f-2workflow-baseline-normalization.md`         | 存在確認済み |

---

## 履歴上の運用ガード（open ではない）

| タスクID                                                    | 概要                                          | 状態     | 参照                                                                                                                   |
| ----------------------------------------------------------- | --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `UT-IMP-TASK10A-F-PHASE11-FILENAME-EVIDENCE-SYNC-GUARD-001` | Phase 11 文書名と TC 証跡を同期する運用ガード | 完了済み | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-f-phase11-filename-and-evidence-sync-guard-001.md` |

---

## 判定メモ

1. `useSkillAnalysis` / `SkillCreateWizard` の実装 scope には新たな open backlog は増えていない。
2. raw な候補 ID（`UT-10A-F-001` など）は canonical backlog ID に変換して管理する。
3. `ApiKeysSection` / `AuthKeySection` / `NotificationCenter` / `FileSelector` の直接 IPC 残存は別系統タスク群で既に管理されており、TASK-10A-F 専用 backlog へ重複登録しない。

---

## 実施した確認

| 確認内容                              | 方法                                                                      | 結果                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Skill scope の直接IPC残存             | `rg -n "window\\.electronAPI" apps/desktop/src/renderer/components/skill` | `SkillEditor.tsx` の既知 6 箇所のみ                                      |
| backlog 指示書の実在                  | `test -f <path>` 相当で5件確認                                            | PASS                                                                     |
| リンク整合                            | `verify-unassigned-links.js`                                              | PASS                                                                     |
| 今回差分の未タスク監査                | `audit-unassigned-tasks.js --diff-from HEAD --json`                       | PASS                                                                     |
| 全体 baseline 監視                    | `audit-unassigned-tasks.js --json`                                        | `baselineViolations=110` を記録（current とは分離）                      |
| TASK-10A-F 由来 backlog 5件の形式監査 | 5文書の見出し・配置・物理ファイル確認                                     | PASS（親 workflow 配下 `unassigned-task/` へ移管済み・テンプレート準拠） |
| legacy 正規化ガード指示書             | `task-imp-unassigned-task-legacy-normalization-001.md` を再確認           | `## メタ情報` 重複を是正し、baseline 改善タスクとして維持                |
