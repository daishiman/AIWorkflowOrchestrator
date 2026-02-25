# task-013 Phase 12 アクションブリッジ（監査結果→次実行）

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | TASK-013E-PHASE12-ACTION-BRIDGE-001 |
| 分類       | 改善（運用）                        |
| 対象       | TASK-013 再監査結果の実行計画化     |
| ステータス | 実行準備完了                        |
| 作成日     | 2026-02-25                          |

## 1. 目的

TASK-013 で得た監査結果を「指摘一覧」で止めず、次に実行する順序・担当・完了条件まで固定する。

## 2. Phase 12 準拠確認（本ブランチ）

| Task   | 要件                                     | 判定 | 証跡                                                                                                     |
| ------ | ---------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| Task 1 | 実装ガイド（Part 1/Part 2）              | ✅   | `docs/30-workflows/completed-tasks/task-013-subagent-team/outputs/phase-12/implementation-guide.md`      |
| Task 2 | システム仕様更新（Step 1-A〜1-C/Step 2） | ✅   | `docs/30-workflows/completed-tasks/task-013-subagent-team/outputs/phase-12/documentation-changelog.md`   |
| Task 3 | 更新履歴作成                             | ✅   | `docs/30-workflows/completed-tasks/task-013-subagent-team/outputs/phase-12/documentation-changelog.md`   |
| Task 4 | 未タスク検出レポート（0件でも必須）      | ✅   | `docs/30-workflows/completed-tasks/task-013-subagent-team/outputs/phase-12/unassigned-task-detection.md` |
| Task 5 | スキルフィードバックレポート             | ✅   | `docs/30-workflows/completed-tasks/task-013-subagent-team/outputs/phase-12/skill-feedback-report.md`     |

## 3. 次アクション（優先順）

| 優先 | タスク                                       | 目的                                       | 実行方式               |
| ---- | -------------------------------------------- | ------------------------------------------ | ---------------------- |
| P1   | `UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001`  | task-9D〜9J の仕様ドリフト再発防止を CI 化 | 直列                   |
| P2   | `UT-FIX-SKILL-IPC-ARG-FORM-UNIFICATION-001`  | skill IPC 引数形式（object/bare）の統一    | 並列可能（テスト分離） |
| P3   | `UT-FIX-SKILL-IPC-ERROR-RESPONSE-001`        | skill IPC バリデーション失敗応答の統一     | 並列可能（P2後推奨）   |
| P4   | `UT-IMP-UNASSIGNED-FORMAT-NORMALIZATION-001` | 未タスク指示書フォーマット違反の収束       | 直列（全体整備）       |

## 4. 実行手順（SubAgent Team）

### Wave A（並列）

- SubAgent-A: P2 仕様策定（引数形式統一）
- SubAgent-B: P3 仕様策定（エラー応答統一）
- SubAgent-C: P4 対象棚卸し（違反一覧の current/baseline 分離）

### Wave B（直列）

- SubAgent-D: P1（CIガード）仕様と A成果物を統合
- Lead: `task-workflow.md` / `interfaces-agent-sdk-skill.md` / `lessons-learned.md` 反映

### Wave C（検証）

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js --scan docs/30-workflows/completed-tasks/task-013-subagent-team --output .tmp/task013-action-bridge-unassigned.json
```

## 5. 完了条件

- [ ] 上記 P1〜P4 の着手順序が `task-workflow.md` と一致
- [ ] Wave A/B/C の成果物リンクが参照切れ0件
- [ ] baseline違反と今回差分違反が別々に報告されている
- [ ] 次回実行者が「次に何をやるか」を本書のみで判断できる

## 5.1 再確認結果（2026-02-25）

- `verify-unassigned-links.js`: 97/97 PASS
- `detect-unassigned --scan docs/30-workflows/completed-tasks/task-013-subagent-team`: 0件
- `audit-unassigned-tasks.js`: format 67 / naming 5 / misplaced 0
- `completed-tasks/unassigned-task` 内の未実施混在: 0件（6件是正済み）

## 6. 参照

- `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-013-task9-ui-backend-consistency-improvements-001.md`
- `docs/30-workflows/completed-tasks/task-013-subagent-team/outputs/compliance-recheck-2026-02-25.md`
- `docs/30-workflows/completed-tasks/task-013-subagent-team/outputs/unassigned-task-detection-recheck-2026-02-25.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
