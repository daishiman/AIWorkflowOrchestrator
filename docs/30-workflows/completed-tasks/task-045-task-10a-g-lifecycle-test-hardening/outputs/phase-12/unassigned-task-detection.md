# Phase 12 Task 4: 未タスク検出レポート

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | TASK-10A-G |
| Phase    | 12         |
| 実施日   | 2026-03-10 |

## 検出結果

**新規未タスク: 1件**

## 判定理由

### 1. product backlog ではなく current workflow drift と判断した項目

今回の再監査で見つかった差分は以下だったが、いずれも新機能・不具合残件ではなく、Phase 11/12 の成果物同期漏れだったため未タスク化しなかった。

| 差分                                                                                | 判断               | 理由                                                                                                                  |
| ----------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| screenshot 証跡が current workflow に未配置                                         | in-place 修正      | ユーザー要求に対する Phase 11 成果物漏れであり、新規開発課題ではない                                                  |
| `outputs/artifacts.json` 欠落                                                       | in-place 修正      | 二重台帳同期漏れであり、新規 backlog 化より即時是正が妥当                                                             |
| LOGS の completed-tasks 移管前提                                                    | in-place 修正      | 文書上の誤記であり、要件追加ではない                                                                                  |
| `index.md` の全Phase `pending` 残置                                                 | in-place 修正      | artifacts との不整合であり、workflow 正本是正の範囲                                                                   |
| `generate-index.js --regenerate` が `index.md` を `undefined` / 全Phase未実施へ壊す | **新規未タスク化** | current workflow だけでなく task-specification-creator の generator / artifacts schema 互換問題であり、汎用改善が必要 |

### 2. 既存 backlog 継続項目

既知の後続課題に加え、今回の再監査で 1件だけ汎用改善タスクを追加した。

| 未タスク                                            | 内容                                                                | 判断         |
| --------------------------------------------------- | ------------------------------------------------------------------- | ------------ |
| `TASK-10A-G-SKILLEDITOR-FILEOPS-STORE-MIGRATION`    | SkillEditor の file operation 系 direct IPC 移行                    | 継続         |
| `UT-IMP-TASK-SPEC-GENERATE-INDEX-SCHEMA-COMPAT-001` | `generate-index.js` と workflow `artifacts.json` の schema 互換改善 | **新規追加** |

### 3. Phase 10 / Phase 11 判定

- Phase 10: PASS
- Phase 11: PASS
- screenshot coverage validator: PASS

## 3ステップ確認（P3/P38対策）

- [x] `unassigned-task/` に指示書作成: `docs/30-workflows/completed-tasks/task-045-task-10a-g-lifecycle-test-hardening/unassigned-task/task-imp-task-spec-generate-index-schema-compat-001.md`
- [x] `task-workflow.md` の TASK-10A-G 節へ関連未タスクとして記録
- [x] 関連仕様書に generator 互換性の教訓を追加

## 結論

今回の差分の大半は current workflow / system spec / skill log の同期漏れとして同ターンで是正した。一方で `generate-index.js` と workflow `artifacts.json` の schema 互換性問題は汎用改善が必要と判断し、未タスク 1件を追加した。
