# System Spec 同期計画（Task01）

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| 作成日     | 2026-03-14                                   |
| 対象スキル | `aiworkflow-requirements`                    |
| 同期レベル | workflow 正本 + 台帳 + 教訓 + index          |

---

## Step 1-A: 完了タスク記録の同期

更新対象:

- `references/task-workflow.md`
- `references/lessons-learned.md`
- `LOGS.md`

同期内容:

1. Task01 foundation の完了記録（spec_created、実装未着手）を台帳へ追加
2. 設定画面3領域レビュー（TC-11-00）を証跡として明記
3. 後続9タスクへの参照反映を完了条件に含める

---

## Step 1-B: 実装状況テーブル更新

更新対象:

- `references/task-workflow.md`

同期内容:

- Task01 は `spec_created` として記録
- 実装完了タスクではなく、foundation 設計完了として状態を固定

---

## Step 1-C: 関連タスク/未タスク同期

更新対象:

- `references/task-workflow.md`
- `references/lessons-learned.md`

同期内容:

1. 後続タスク（Task02-Task10）の参照依存を明記
2. 未タスク検出は `currentViolations=0 / baselineViolations=134` で分離記録
3. `task-imp-ai-runtime-permission-resolver-placement-001.md` / `task-imp-ai-runtime-test-separation-criteria-001.md` / `task-imp-spec-only-phase-workflow-optimization-001.md` の3件を 9セクション形式へ是正
4. 「設定画面レビュー指摘は Task06 を中心に消化」の方針を明記

---

## Step 2: システム仕様更新（workflow正本）

更新対象:

- `references/workflow-ai-runtime-authmode-unification.md`（新規）
- `indexes/resource-map.md`
- `indexes/quick-reference.md`

同期内容:

1. auth/runtime 分離の foundation（Task01）と設定画面レビュー反映を統合仕様として新規文書化
2. quick-reference に検索語と読む順番を追加
3. resource-map に「ai-runtime-authmode unification」逆引きを追加

---

## Step 3: 再確認実行（2026-03-14）

実施内容:

1. `apps/desktop/scripts/capture-ai-runtime-authmode-review-board.mjs` を実行し、`TC-11-00-settings-authmode-review-board.png` を再取得
2. Task01-Task10 すべてで `verify-all-specs` / `validate-phase-output` を再実行
3. Step-01 で `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` を再実行
4. branch横断判定では Phase 11/12 validator を `phase-12-documentation=completed` workflow（Step-01）に限定し、他9件は `not_started` 由来の未適用として記録
5. `verify-unassigned-links=227/227`、`audit-unassigned-tasks --diff-from HEAD current=0 / baseline=134` を確認
6. `phase-12-documentation.md` の `ステータス=completed` と完了チェックを同期

---

## 完了判定

- [x] `generate-index.js` 実行で indexes 再生成済み
- [x] 4 validator（verify-all-specs / validate-phase-output / phase11 screenshot / phase12 guide）は Step-01 workflow で PASS
- [x] Task01 outputs と system spec 正本の記述が矛盾しない
- [x] 未タスク監査で `current=0` を維持したまま指定3ファイルをフォーマット準拠へ是正
