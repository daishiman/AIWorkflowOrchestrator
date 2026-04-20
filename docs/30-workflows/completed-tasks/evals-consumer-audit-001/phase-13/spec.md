# Phase 13: 承認・PR段取り - タスク仕様書

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | TASK-EVALS-CONSUMER-AUDIT-001                                |
| Phase        | 13                                                           |
| Phase名      | 承認・PR段取り（blocked / user approval 待ち）               |
| 前提Phase    | Phase 12                                                     |
| 後続Phase    | -                                                            |
| ステータス   | blocked（user 明示承認まで blocked 維持）                    |
| 作成日       | 2026-04-19                                                   |
| 機能名       | evals-consumer-audit                                         |
| taskType     | NON_VISUAL / 監査タスク（コード実装なし・docs-only）         |
| issue_number | 2279                                                         |
| issue_status | CLOSED（再オープンせず fix-forward 記録のみ）                |
| PR 実行禁止  | 本 Phase は PR / commit の実行を行わず、段取り文書のみを扱う |

---

## 1. 目的（Why）

本 Phase は、ユーザー承認前提の PR 段取りを文章として確定するためのもの。  
実際の commit / push / PR 作成は行わない。blocked 状態を維持しつつ、承認後に迷わず実行できる材料を揃える。

---

## 2. 入力（前Phase成果物・参照資料）

### 2.1 前Phase成果物

| 成果物                                                   | 用途                              |
| -------------------------------------------------------- | --------------------------------- |
| `outputs/phase-5/consumer-audit-report.md`               | canonical 最終成果物 1            |
| `outputs/phase-5/evals-field-map.md`                     | canonical 最終成果物 2            |
| `outputs/phase-6/dual-root-parity.md`                    | canonical 最終成果物 3            |
| `outputs/phase-8/schema-change-guide.md`                 | canonical 最終成果物 4            |
| `outputs/phase-10/ac6-release-verdict.md`                | AC-6 判定転記                     |
| `outputs/phase-11/manual-test-result.md`                 | Phase 11 の正本証跡               |
| `outputs/phase-12/implementation-guide.md`               | Reviewer primer と close-out 説明 |
| `outputs/phase-12/system-spec-update-summary.md`         | spec sync impact                  |
| `outputs/phase-12/documentation-changelog.md`            | 変更サマリー                      |
| `outputs/phase-12/unassigned-task-detection.md`          | follow-up 候補                    |
| `outputs/phase-12/skill-feedback-report.md`              | skill 改善観点                    |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | close-out 準拠確認                |

### 2.2 参照資料

| 資料                                                                                    | 用途                           |
| --------------------------------------------------------------------------------------- | ------------------------------ |
| `.claude/skills/task-specification-creator/references/phase-template-phase13.md`        | blocked / user approval ルール |
| `.claude/skills/task-specification-creator/references/phase-template-phase13-detail.md` | PR 段取り詳細                  |
| `.claude/skills/task-specification-creator/references/review-gate-criteria.md`          | マージゲート判断               |
| `.claude/skills/task-specification-creator/references/commands.md`                      | 実行時の参考コマンド           |

---

## 3. 実行手順

### Step 0: blocked 維持確認

1. user 明示承認が未取得であることを確認する。
2. Phase 12 必須 6 成果物が揃っていることを確認する。
3. AC-6 判定が `可` / `不可` のどちらかで明示済みであることを確認する。

### Step 1: `pr-description.md` を作成する

**配置先**: `outputs/phase-13/pr-description.md`

必須セクション:

1. Overview
2. Background
3. Deliverables
4. AC-6 解除判定結果
5. Reproduction
6. Spec sync impact
7. Follow-up tasks
8. Reviewer primer
9. Files changed summary
10. Test plan
11. Blocked condition / Merge gate
12. Issue linkage

`Deliverables` は **Phase 5 / 6 / 8 の canonical 4 成果物** を列挙し、Phase 12 に複製パスは置かない。

### Step 2: `approval-checklist.md` を作成する

**配置先**: `outputs/phase-13/approval-checklist.md`

観点:

- canonical 4 成果物を確認したか
- AC-6 判定根拠を理解したか
- Phase 11 再現性を確認したか
- follow-up を理解したか
- PR 実行が別ターンであることを確認したか

### Step 3: 補助文書を作成する

必要に応じて以下を出力する。

- `change-summary.md`
- `commit-strategy.md`
- `reviewer-criteria.md`
- `merge-gate.md`
- `local-check-result.md`

### Step 4: 実行禁止事項を明記する

本 Phase 本文と `approval-checklist.md` に次を明記する。

- `--no-verify` 使用禁止
- `git commit --amend` 禁止
- force push 禁止
- Issue #2279 の再オープン禁止
- PR 作成 / commit 実行は別ターン

---

## 4. 成果物（パス・フォーマット・スキーマ）

| 成果物名           | パス                                     | 必須 | 説明                 |
| ------------------ | ---------------------------------------- | ---- | -------------------- |
| PR description     | `outputs/phase-13/pr-description.md`     | ✅   | 承認後に流用する本文 |
| 承認チェックリスト | `outputs/phase-13/approval-checklist.md` | ✅   | ユーザー確認項目     |
| 変更サマリー       | `outputs/phase-13/change-summary.md`     | 任意 | 変更領域要約         |
| コミット戦略       | `outputs/phase-13/commit-strategy.md`    | 任意 | 実行時の分割方針     |
| レビュアー基準     | `outputs/phase-13/reviewer-criteria.md`  | 任意 | 必要レビュアー属性   |
| マージゲート       | `outputs/phase-13/merge-gate.md`         | 任意 | blocked / merge 条件 |
| ローカル確認結果   | `outputs/phase-13/local-check-result.md` | 任意 | 承認後実行時の記録枠 |

---

## 5. 完了条件チェックリスト

- [ ] `pr-description.md` が canonical 4 成果物を Phase 5 / 6 / 8 パスで列挙している
- [ ] `approval-checklist.md` が作成されている
- [ ] Phase 12 必須 6 成果物を入力として参照している
- [ ] blocked / approval 待ちの条件が明記されている
- [ ] commit / PR 実行禁止が明記されている
- [ ] Issue #2279 を再オープンしない方針が明記されている

---

## 6. 検証方法

### 6.1 誤った canonical パス検出

```bash
rg -n 'outputs/phase-12/(consumer-audit-report|evals-field-map|schema-change-guide|dual-root-parity)\\.md' \
  docs/30-workflows/evals-consumer-audit-001/phase-13/spec.md \
  docs/30-workflows/evals-consumer-audit-001/outputs/phase-13
```

### 6.2 blocked 記載確認

```bash
rg -n 'blocked|承認|approval' \
  docs/30-workflows/evals-consumer-audit-001/phase-13/spec.md
```

### 6.3 実行禁止事項確認

```bash
rg -n 'no-verify|amend|再オープン禁止|別ターン' \
  docs/30-workflows/evals-consumer-audit-001/phase-13/spec.md
```

---

## 7. リスクと対策

| ID     | リスク                                                       | 対策                                       |
| ------ | ------------------------------------------------------------ | ------------------------------------------ |
| P13-R1 | PR description が誤って Phase 12 複製パスを canonical と扱う | Deliverables を Phase 5 / 6 / 8 パスへ固定 |
| P13-R2 | blocked 条件が弱く、実行してはいけない操作が曖昧になる       | 実行禁止事項を明文化                       |
| P13-R3 | close-out 根拠と PR 段取りの参照がずれる                     | Phase 12 必須 6 成果物を入力へ固定         |

---

## 8. 前後 Phase との依存

- 前 Phase から受け取るもの: canonical 4 成果物、Phase 11 正本証跡、Phase 12 必須 6 成果物
- 後続: user 承認後の別ターン実行

---

## タスク100%実行確認【必須】

- [ ] Step 0 blocked 維持確認完了
- [ ] Step 1 `pr-description.md` 作成完了
- [ ] Step 2 `approval-checklist.md` 作成完了
- [ ] Step 3 補助文書の必要有無を判断
- [ ] Step 4 実行禁止事項の明記完了

---

## 次Phase

なし。実行は user 明示承認後の別ターンで扱う。
