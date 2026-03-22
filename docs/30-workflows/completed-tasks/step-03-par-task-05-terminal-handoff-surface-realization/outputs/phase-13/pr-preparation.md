# Phase 13 成果物: PR 準備チェックリスト

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase      | 13                                                |
| 成果物種別 | PR 準備チェックリスト                             |
| 作成日     | 2026-03-22                                        |

---

## 1. PR Blocked 条件

### 1.1 絶対ブロック条件

**以下の条件が全て満たされるまで commit / PR 作成は行わない。**

| 条件                                            | 根拠                                 | 現在の状態                       |
| ----------------------------------------------- | ------------------------------------ | -------------------------------- |
| ユーザーの明示的な PR 作成指示があること        | CLAUDE.md / 07-git-and-tooling.md    | **Blocked（指示待ち）**          |
| 全 Phase（1〜13）成果物が `outputs/` に配置済み | artifacts.json の phase 定義         | 全 Phase 確認済み                |
| `artifacts.json` が全 Phase で status 同期済み  | GOV-3（ワークフロールール）          | `all_phases_complete` で同期済み |
| Phase 3 設計レビューが PASS 判定済み            | 05-task-execution.md Phase 3 ゲート  | PASS 確認済み                    |
| Phase 10 最終レビューが PASS 判定済み           | 05-task-execution.md Phase 10 ゲート | PASS 確認済み                    |

### 1.2 PR 作成前の最終確認コマンド

```bash
# ブランチ確認
git branch --show-current
# 期待値: design/terminal-handoff-surface-realization

# 全 Phase 成果物の存在確認
ls docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-{1,2,3,4,5,6,7,8,9,10,11,12,13}/

# artifacts.json の status 確認
cat docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/artifacts.json | grep '"status"'

# 変更ファイル確認（プロダクションコード変更がないことを確認）
git diff --stat main...HEAD -- apps/ packages/
# 期待値: 出力なし（設計タスクのため変更なし）
```

---

## 2. PR 作成時の確認項目

### 2.1 ブランチ情報

| 項目           | 値                                            |
| -------------- | --------------------------------------------- |
| ブランチ名     | `design/terminal-handoff-surface-realization` |
| ベースブランチ | `main`                                        |
| Worktree       | `task-20260322-104219-wt-3`                   |
| タイプ         | `docs` プレフィックス（設計ドキュメントのみ） |

### 2.2 PR タイトル案（70 文字以内）

```
docs(design): terminal handoff surface realization 設計確定
```

文字数: 46 文字（制限: 70 文字以内）

### 2.3 PR 本文 Summary（3 bullet points）

```markdown
## Summary

- manual terminal lane を first-class surface として成立させる設計を完了（Launcher / Handoff Card / Consumer Adapter の 3 concern 定義、HandoffGuidance 統一 DTO で全 consumer 共有）
- manual boundary（auto-send 禁止 / hidden injection 禁止 / headless execution 禁止）を設計仕様から TC-MAN-1〜8 + MB-1〜4 の screenshot 契約まで具体化
- Phase 3/10 レビュー PASS、未タスク 8 件（高優先度 3 件・中優先度 5 件）を検出・登録済み。後続実装タスク（Task03/04/06/07/08）への handover 情報を整備

## Test Plan

- 設計タスクのため自動テスト（lint / typecheck / unit test）への追加変更なし
- Phase 3 設計レビュー PASS（8 観点全項目 PASS）--- evidence: outputs/phase-3/gate-decision.md
- Phase 10 最終レビュー PASS（AC-1〜AC-4 全充足、MINOR 3 件の追跡先確定）--- evidence: outputs/phase-10/final-gate-decision.md
- Phase 11 walkthrough シナリオ（TC-MAN-1〜8）手順書作成済み（後続実装タスクで実行）
- Manual Boundary 検証（MB-1〜MB-4）チェックリスト作成済み（後続実装タスクで実行）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### 2.4 PR 作成コマンドテンプレート（実行はユーザー指示後）

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260322-104219-wt-3

git push -u origin design/terminal-handoff-surface-realization

gh pr create \
  --title "docs(design): terminal handoff surface realization 設計確定" \
  --base main \
  --body "$(cat <<'EOF'
## Summary

- manual terminal lane を first-class surface として成立させる設計を完了（Launcher / Handoff Card / Consumer Adapter の 3 concern 定義、HandoffGuidance 統一 DTO で全 consumer 共有）
- manual boundary（auto-send 禁止 / hidden injection 禁止 / headless execution 禁止）を設計仕様から TC-MAN-1〜8 + MB-1〜4 の screenshot 契約まで具体化
- Phase 3/10 レビュー PASS、未タスク 8 件（高優先度 3 件・中優先度 5 件）を検出・登録済み。後続実装タスク（Task03/04/06/07/08）への handover 情報を整備

## Test Plan

- 設計タスクのため自動テスト（lint / typecheck / unit test）への追加変更なし
- Phase 3 設計レビュー PASS（8 観点全項目 PASS）--- evidence: outputs/phase-3/gate-decision.md
- Phase 10 最終レビュー PASS（AC-1〜AC-4 全充足、MINOR 3 件の追跡先確定）--- evidence: outputs/phase-10/final-gate-decision.md
- Phase 11 walkthrough シナリオ（TC-MAN-1〜8）手順書作成済み（後続実装タスクで実行）
- Manual Boundary 検証（MB-1〜MB-4）チェックリスト作成済み（後続実装タスクで実行）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## 3. Evidence Bundle

Phase 1〜13 全成果物の絶対パス一覧。

### Phase 1: 要件定義（3 ファイル）

| 成果物                     | 絶対パス                                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| requirements-definition.md | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-1/requirements-definition.md` |
| scope-definition.md        | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-1/scope-definition.md`        |
| current-state-inventory.md | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-1/current-state-inventory.md` |

### Phase 2: 設計（3 ファイル）

| 成果物               | 絶対パス                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| design-summary.md    | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/design-summary.md`    |
| contract-matrix.md   | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/contract-matrix.md`   |
| validation-matrix.md | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/validation-matrix.md` |

### Phase 3: 設計レビュー（2 ファイル）- ゲート PASS

| 成果物                  | 絶対パス                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| design-review-report.md | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-3/design-review-report.md` |
| gate-decision.md        | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-3/gate-decision.md`        |

**判定: PASS（全 6 条件クリア）**

| 判定条件                          | 結果 |
| --------------------------------- | ---- |
| Concern 分解が 3 以下             | PASS |
| State/Action/Ownership 契約定義済 | PASS |
| Validation matrix 作成済          | PASS |
| Simpler alternative 記録済        | PASS |
| セキュリティ設計反映済            | PASS |
| MAJOR/CRITICAL 指摘なし           | PASS |

### Phase 4: テスト作成（2 ファイル）

| 成果物           | 絶対パス                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| test-matrix.md   | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-4/test-matrix.md`   |
| mock-strategy.md | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-4/mock-strategy.md` |

### Phase 5: 実装計画（2 ファイル）

| 成果物                 | 絶対パス                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| implementation-plan.md | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-5/implementation-plan.md` |
| file-change-scope.md   | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-5/file-change-scope.md`   |

### Phase 6: テスト拡充（2 ファイル）

| 成果物                       | 絶対パス                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| regression-expansion-plan.md | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-6/regression-expansion-plan.md` |
| edge-case-matrix.md          | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-6/edge-case-matrix.md`          |

### Phase 7: カバレッジ確認（2 ファイル）

| 成果物              | 絶対パス                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| coverage-targets.md | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-7/coverage-targets.md` |
| integration-gate.md | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-7/integration-gate.md` |

### Phase 8: リファクタリング（2 ファイル）

| 成果物                       | 絶対パス                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| refactor-boundaries.md       | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-8/refactor-boundaries.md`       |
| simplification-candidates.md | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-8/simplification-candidates.md` |

### Phase 9: 品質検証（2 ファイル）

| 成果物               | 絶対パス                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| quality-checklist.md | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-9/quality-checklist.md` |
| risk-register.md     | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-9/risk-register.md`     |

### Phase 10: 最終レビュー（2 ファイル）- ゲート PASS

| 成果物                 | 絶対パス                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| final-review-report.md | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-10/final-review-report.md` |
| final-gate-decision.md | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-10/final-gate-decision.md` |

**判定: PASS（全 7 条件クリア、MINOR 3 件の追跡先確定）**

| 判定条件                                                                     | 結果 |
| ---------------------------------------------------------------------------- | ---- |
| AC-1〜AC-4 が全て PASS                                                       | PASS |
| MINOR 3 件（MN-1〜MN-3）の追跡先 Phase が確定済み                            | PASS |
| MAJOR 指摘なし                                                               | PASS |
| CRITICAL 指摘なし                                                            | PASS |
| Phase 8/9 成果物が全て outputs/ に存在する                                   | PASS |
| 三位一体整合（design-summary / contract-matrix / validation-matrix）確認済み | PASS |
| 残余リスク（RSK-1〜8）が全て受容可能                                         | PASS |

### Phase 11: 手動テスト（3 ファイル）

| 成果物               | 絶対パス                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| manual-test-plan.md  | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-11/manual-test-plan.md`  |
| screenshot-plan.json | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-11/screenshot-plan.json` |
| discovered-issues.md | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-11/discovered-issues.md` |

**注記**: 設計タスクのため walkthrough シナリオ・screenshot 計画・MB チェックリストを作成。実際の手動テスト（TC-MAN-1〜8 / MB-1〜4）は後続実装タスクで実施。

### Phase 12: ドキュメント（6 ファイル）

| 成果物                                | 絶対パス                                                                                                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| implementation-guide.md               | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-12/implementation-guide.md`               |
| system-spec-update-summary.md         | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-12/system-spec-update-summary.md`         |
| documentation-changelog.md            | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-12/documentation-changelog.md`            |
| unassigned-task-detection.md          | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-12/unassigned-task-detection.md`          |
| phase12-task-spec-compliance-check.md | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-12/phase12-task-spec-compliance-check.md` |
| skill-feedback-report.md              | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-12/skill-feedback-report.md`              |

### Phase 13: PR 準備（本ファイル）

| 成果物            | 絶対パス                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| pr-preparation.md | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-13/pr-preparation.md` |

---

## 4. Handover Information

### 4.1 レビュー担当者が見るべきドキュメント

| 優先度 | ドキュメント                                    | 確認ポイント                                         |
| ------ | ----------------------------------------------- | ---------------------------------------------------- |
| 必須   | `outputs/phase-2/design-summary.md`             | Concern 分解（C-A/B/C）・State 設計・Ownership 定義  |
| 必須   | `outputs/phase-2/contract-matrix.md`            | IPC 通過型ルール・Manual Boundary 定義（MB-1〜MB-4） |
| 必須   | `outputs/phase-3/gate-decision.md`              | Phase 3 PASS 判定の根拠                              |
| 必須   | `outputs/phase-10/final-gate-decision.md`       | Phase 10 PASS 判定の根拠・MINOR 3 件の追跡先         |
| 推奨   | `outputs/phase-12/implementation-guide.md`      | 後続実装タスク向けの概念説明・開発者向け実装詳細     |
| 推奨   | `outputs/phase-12/unassigned-task-detection.md` | 未タスク 8 件の内容・優先度・後続タスクの依存関係    |
| 参考   | `outputs/phase-11/manual-test-plan.md`          | TC-MAN-1〜8 の手順書・MB-1〜4 のチェックリスト       |
| 参考   | `outputs/phase-9/risk-register.md`              | RSK-1〜8 の残余リスクと受容根拠                      |

### 4.2 後続タスクへの影響

本タスクの設計成果は、以下の後続タスクがブロック解除される条件となる。

| 後続タスク | 影響内容                                                     | 参照すべき成果物                                                 |
| ---------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| **Task03** | `TerminalHandoffCard` コンポーネント実装（Concern-B の実現） | `outputs/phase-2/design-summary.md` Concern-B                    |
| **Task04** | `persistent launcher` 実装（Concern-A の実現）               | `outputs/phase-2/design-summary.md` Concern-A                    |
| **Task06** | Transcript Provenance 実装（RSK-1 の前提条件）               | `outputs/phase-10/final-gate-decision.md` RSK-1                  |
| **Task07** | Consumer Adapter 実装（`toHandoffGuidance()` の配置確定）    | `outputs/phase-8/refactor-boundaries.md` § 1.2                   |
| **Task08** | Skill Docs terminal-handoff パス実装                         | `outputs/phase-12/unassigned-task-detection.md` UT-SKILLDOCS-... |

### 4.3 未解決の MINOR 指摘と追跡先

Phase 10 最終レビューで確認された MINOR 指摘は全件、未タスクとして登録済み。

| MINOR ID | 指摘内容                                                    | 未タスク ID                               | 優先度 | 追跡先 Phase           |
| -------- | ----------------------------------------------------------- | ----------------------------------------- | ------ | ---------------------- |
| MN-1     | `toHandoffGuidance()` adapter の配置先が未定義              | UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 | high   | Task07（Phase 5 相当） |
| MN-2     | Terminal Dock の `aborted` state が未定義                   | UT-TERMINAL-DOCK-ABORTED-STATE-001        | medium | Task04（Phase 6 相当） |
| MN-3     | GuidanceBlock vs TerminalHandoffCard の使い分けルールが曖昧 | UT-GUIDANCE-BLOCK-HANDOFF-CARD-RULE-001   | medium | Task03（Phase 5 相当） |

**注記**: 未タスク指示書ファイルは `docs/30-workflows/unassigned-task/` への実ファイル作成が必要（P58 対策）。本タスクのスコープ外として後続作業に分離済み。`outputs/phase-12/unassigned-task-detection.md` の 3 ステップ完了状況を参照。

### 4.4 既知リスクのサマリー

| リスク ID | 内容                                                         | 対応状態                                                        |
| --------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| RSK-1     | Terminal Dock session persistence は Task06 完了まで実装不可 | UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001 として未タスク登録済み |
| RSK-7     | P31 Zustand 無限ループの予防（後続実装者向け）               | 個別セレクタ設計を implementation-guide.md に明記済み           |
| P65 警告  | 後続実装で IPC namespace を追加する場合の dead-end 防止      | implementation-guide.md § 2.11 に記載済み                       |

---

## 5. CI/CD 要件

### 5.1 プロダクションコード変更なし

本タスクは**設計タスク**であり、以下の変更は一切含まない。

| カテゴリ                     | 変更有無 | 根拠                                                                                            |
| ---------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `apps/` 以下のコード変更     | なし     | 設計ドキュメントのみ作成                                                                        |
| `packages/` 以下のコード変更 | なし     | 設計ドキュメントのみ作成                                                                        |
| `.claude/skills/` の更新     | なし     | system-spec-update-summary.md に計画記録（P57 対策として実 .claude/skills/ 更新は後続PRで実施） |

### 5.2 自動検証への影響なし

| 検証項目        | 影響         | 理由                                 |
| --------------- | ------------ | ------------------------------------ |
| lint チェック   | 影響なし     | TypeScript / JS ファイル変更なし     |
| typecheck       | 影響なし     | 型定義ファイル変更なし               |
| unit test       | 影響なし     | テストファイル追加なし               |
| pre-commit hook | 影響なし     | lint-staged の対象外（.md のみ）     |
| pre-push hook   | ほぼ影響なし | `docs/` 配下変更はテストスキップ対象 |

### 5.3 pre-push フック動作の想定

pre-push フックの「ドキュメントのみの変更はテスト自動スキップ」条件（07-git-and-tooling.md）により、テスト実行はスキップされる見込み。ただし lint + Shared Build（Phase 1）は実行される。

---

## 6. 付記: artifacts.json との同期確認

`artifacts.json` の Phase 13 エントリが本ファイルを参照していることを確認。

```json
{
  "phase": 13,
  "name": "PR作成",
  "status": "blocked_awaiting_user_instruction",
  "note": "PR はユーザー指示があるまで作成しない",
  "file": "phase-13-pr-creation.md",
  "artifacts": ["outputs/phase-13/pr-preparation.md"]
}
```

`artifacts.json` の `status` は `"blocked_awaiting_user_instruction"` のままとする。ユーザーの指示で PR を作成後、`"complete"` に更新する。
