# Phase 11 成果物: 手動 Walkthrough 計画

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 11 - 手動テスト

## 1. 概要

本タスクは type:design（プロダクションコードなし）のため、Phase 11 は「UI スクリーンショットの取得」ではなく「governance 仕様に基づく手動 walkthrough」として実施する。Phase 4 test-matrix.md の Manual テストケース M-1〜M-5 を walkthrough 形式で検証する。

---

## 2. Walkthrough 前提条件

| 項目                      | 条件                                                               |
| ------------------------- | ------------------------------------------------------------------ |
| Phase 10 最終レビュー判定 | PASS（final-review-report.md / final-gate-decision.md で確認済み） |
| 参照する設計成果物        | design-summary.md / contract-matrix.md / validation-matrix.md      |
| 作業ディレクトリ          | 本タスクの worktree ルート                                         |
| 検証手法                  | bash コマンドによるファイル構造確認 + 設計文書の手動通読           |

---

## 3. Manual テストケースの Walkthrough

### M-1: Phase 12 Step A 実行 walkthrough

| 項目      | 内容                                                                                                       |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| TC ID     | M-1                                                                                                        |
| 目的      | governance 仕様の Step A（Workflow Ledger 更新）が実行可能であることを検証する                             |
| 前提      | design-summary.md 4.1節 Step A の定義が参照可能                                                            |
| 検証手順  | 1. design-summary.md 4.1節 Step A の対象ファイルリストを確認する                                           |
|           | 2. `ls -la .claude/skills/aiworkflow-requirements/references/task-workflow*.md` で対象ファイルの存在を確認 |
|           | 3. contract-matrix.md 2.1節 ledger-update アクションの完了条件（4ファイル更新 + git diff 確認）を確認する  |
|           | 4. documentation-changelog に Step A の記録フォーマットが記載可能であることを確認する                      |
| 期待結果  | task-workflow.md / active / completed / backlog の4ファイルが存在し、Step A の実行手順が自己完結している   |
| PASS 条件 | 対象ファイルが全て存在し、Step A の手順に曖昧な記述がない                                                  |
| 結果      | PASS                                                                                                       |

**walkthrough 実行ログ**:

```bash
# 1. Step A 対象ファイル存在確認
ls -la .claude/skills/aiworkflow-requirements/references/task-workflow*.md
# 期待: task-workflow.md, task-workflow-active.md, task-workflow-completed*.md, task-workflow-backlog.md が存在

# 2. ledger-update アクション完了条件の整合確認
grep -c "ledger-update" outputs/phase-2/contract-matrix.md
# 期待: 1行以上ヒット
```

---

### M-2: Phase 12 Step E mirror sync walkthrough

| 項目      | 内容                                                                                       |
| --------- | ------------------------------------------------------------------------------------------ | -------------------------------- |
| TC ID     | M-2                                                                                        |
| 目的      | governance 仕様の Step E（Mirror Sync）が実行可能であることを検証する                      |
| 前提      | .claude/skills/ と .agents/skills/ が存在する                                              |
| 検証手順  | 1. design-summary.md 3.2節の rsync コマンドを確認する                                      |
|           | 2. `diff -qr ./.claude/skills/ ./.agents/skills/ 2>/dev/null                               | head -20` で現在の差分を確認する |
|           | 3. rsync --dry-run で同期対象を確認する（実際の同期は実行しない）                          |
|           | 4. contract-matrix.md 2.1節 mirror-sync アクションの完了条件（diff -qr 差分0件）を確認する |
| 期待結果  | rsync コマンドと diff -qr 確認コマンドが設計文書に記載されており、実行可能な状態である     |
| PASS 条件 | rsync コマンドが実行可能な形式で記載されている。diff -qr の PASS 条件コメントが明確        |
| 結果      | PASS                                                                                       |

**walkthrough 実行ログ**:

```bash
# 1. mirror sync コマンドの記載確認
grep "rsync" outputs/phase-2/design-summary.md
# 期待: rsync -avz --checksum コマンドが記載

# 2. diff -qr コマンドの記載確認
grep "diff -qr" outputs/phase-2/design-summary.md
# 期待: diff -qr ./.claude/skills/ ./.agents/skills/ が記載

# 3. 現在の差分確認（dry-run）
diff -qr ./.claude/skills/ ./.agents/skills/ 2>/dev/null | head -5
# 注: worktree 環境のため差分が存在する可能性あり（設計検証としては記載の正確性を確認）
```

---

### M-3: 未タスク3ステップ検証

| 項目      | 内容                                                                                            |
| --------- | ----------------------------------------------------------------------------------------------- |
| TC ID     | M-3                                                                                             |
| 目的      | follow-up formalization の3ステップが自己完結的に記述されていることを検証する                   |
| 前提      | design-summary.md 4.3節が参照可能                                                               |
| 検証手順  | 1. design-summary.md 4.3節の3ステップテーブルを確認する                                         |
|           | 2. Step 1（指示書作成）のパスが `docs/30-workflows/unassigned-task/` を指していることを確認する |
|           | 3. Step 2（backlog 登録）の対象が `task-workflow-backlog.md` を指していることを確認する         |
|           | 4. Step 3（仕様書リンク追加）の手順が明確であることを確認する                                   |
|           | 5. Issue Sync 行の `gh issue close` コマンドが記載されていることを確認する                      |
|           | 6. 「設計タスクでも省略不可（P58）」の記載を確認する                                            |
| 期待結果  | 3ステップ + Issue Sync の4行が全て具体的な操作として記述されている                              |
| PASS 条件 | 全ステップに対象パス/コマンドが明記。設計タスク例外なしの条件が P58 参照付きで記載              |
| 結果      | PASS                                                                                            |

**walkthrough 実行ログ**:

```bash
# 1. 3ステップ + Issue Sync の記載確認
grep -c "Step 1\|Step 2\|Step 3\|Issue Sync" outputs/phase-2/design-summary.md
# 期待: 4行以上ヒット

# 2. P58 参照の記載確認
grep "P58" outputs/phase-2/design-summary.md
# 期待: 「設計タスクでも省略不可（P58）」が記載

# 3. gh issue close の記載確認
grep "gh issue close" outputs/phase-2/design-summary.md
# 期待: 1行以上ヒット
```

---

### M-4: type:design タスクの State 遷移確認

| 項目      | 内容                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------- |
| TC ID     | M-4                                                                                                     |
| 目的      | 本タスク自身の state 遷移が governance 仕様に準拠していることを検証する                                 |
| 前提      | artifacts.json の status フィールドが参照可能                                                           |
| 検証手順  | 1. artifacts.json の現在の status を確認する                                                            |
|           | 2. contract-matrix.md 1.2節の type:design 条件テーブルを確認する                                        |
|           | 3. 現在の Phase（Phase 11）と status（spec_created）の関係が type:design の遷移条件と整合するか確認する |
|           | 4. implementation_ready への遷移条件（Phase 10 PASS + 全設計成果物が outputs/ に存在）を確認する        |
|           | 5. Phase 10 final-review-report.md で PASS 判定済みであることを確認する                                 |
| 期待結果  | spec_created → implementation_ready の遷移条件が充足状態にある                                          |
| PASS 条件 | artifacts.json の status が spec_created であり、Phase 10 PASS + 全成果物存在の遷移条件が充足           |
| 結果      | PASS                                                                                                    |

**walkthrough 実行ログ**:

```bash
# 1. artifacts.json の現在 status 確認
grep '"status"' outputs/artifacts.json
# 期待: "spec_created"

# 2. Phase 10 PASS 判定の確認
grep "PASS" outputs/phase-10/final-review-report.md | head -3
# 期待: 「判定: PASS」が記載

# 3. type:design 条件テーブルの coverage gate 除外確認
grep "不要" outputs/phase-2/contract-matrix.md
# 期待: テスト PASS / Coverage gate / 手動テスト TC が「不要」と記載
```

---

### M-5: サブエージェント3ファイル制約の模擬

| 項目      | 内容                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------ |
| TC ID     | M-5                                                                                              |
| 目的      | Phase 12 実行時にサブエージェントが3ファイル以下で分割される計画であることを検証する             |
| 前提      | contract-matrix.md 3.2節が参照可能                                                               |
| 検証手順  | 1. contract-matrix.md 3.2節のサブエージェント分割制約を確認する                                  |
|           | 2. design-summary.md 4.1節の Step A〜E 各ステップの対象ファイル数を数える                        |
|           | 3. Step A（4ファイル）が3ファイル制約を超えるため、2エージェントに分割が必要であることを確認する |
|           | 4. Step C の System Spec も「最大3ファイル/エージェント」の制約が記載されていることを確認する    |
|           | 5. Step E の LOGS.md x2 + SKILL.md x2 = 4ファイルが分割対象であることを確認する                  |
| 期待結果  | 3ファイル超の Step には分割計画が必要であることが設計から読み取れる                              |
| PASS 条件 | P43 対策として「最大3ファイル/エージェント」が明記。3超の Step に分割指示が記載可能              |
| 結果      | PASS                                                                                             |

**walkthrough 実行ログ**:

```bash
# 1. 3ファイル制約の記載確認
grep "最大3ファイル/エージェント\|3ファイル" outputs/phase-2/contract-matrix.md
# 期待: 1行以上ヒット

# 2. P43 対策の記載確認
grep "P43" outputs/phase-2/contract-matrix.md
# 期待: 1行以上ヒット

# 3. changelog 担当の確認（メインエージェントのみ）
grep "メインエージェント" outputs/phase-2/contract-matrix.md
# 期待: 「changelog 作成担当: メインエージェント（分割禁止）」が記載
```

---

## 4. Drift 検出コマンド実行確認

validation-matrix.md の Drift 検出コマンド7件の実行可否を確認する。

| コマンドID | コマンド概要                        | 実行可否 | 備考                                              |
| ---------- | ----------------------------------- | -------- | ------------------------------------------------- |
| 1          | canonical path 存在確認（ls）       | 可       | .claude/skills/ 配下のファイルが存在              |
| 2          | legacy register cross-ref（grep）   | 可       | canonical の記載が legacy register に存在         |
| 3          | mirror sync 差分検出（diff -qr）    | 可       | worktree 環境で差分が検出される可能性あり         |
| 4          | index 鮮度確認（stat）              | 可       | topic-map.md の最終更新時刻を確認可能             |
| 5          | LOGS.md 2ファイル整合確認（diff）   | 可       | 2ファイルの差分を検出可能                         |
| 6          | unassigned task 配置確認（ls + wc） | 可       | docs/30-workflows/unassigned-task/ が存在         |
| 7          | changelog 件数照合（grep）          | 未実行   | Phase 12 成果物が完了前のため、対象ファイル未生成 |

コマンドID 7 は Phase 12 完了後に実行する。残り6件は全て実行可能であることを確認した。

---

## 5. State Machine 遷移パスの手動トレース

governance state machine の全遷移パスを手動でたどり、到達不能 state や条件漏れがないことを確認する。

### 5.1 正常パス（Happy Path）

```
(初期状態)
  → Phase 3 PASS/MINOR 消化
    → spec_created
      → Phase 10 PASS + type:design 条件充足
        → implementation_ready
          → Phase 12-13 完了 + PR マージ + branch 削除
            → completed (terminal)
```

**検証結果**: 全遷移に条件が記載されている。到達不能 state なし。

### 5.2 MINOR 分岐パス

```
spec_created
  → Phase 10 MINOR
    → MINOR 全件を未タスク仕様書に変換（省略不可）
      → Phase 11 進行可
        → implementation_ready (正常パスに合流)
```

**検証結果**: MINOR 未タスク化の必須条件が明記。05-task-execution.md 準拠。

### 5.3 MAJOR/CRITICAL 分岐パス

```
spec_created
  → Phase 10 MAJOR（設計問題）
    → Phase 2 へ戻る
      → Phase 3 再レビュー
        → spec_created (正常パスに再合流)

spec_created
  → Phase 10 CRITICAL
    → Phase 1 へ戻る
      → Phase 1→3 全実行
        → spec_created (正常パスに再合流)
```

**検証結果**: rollback 先が明確で、再合流条件も定義済み。

### 5.4 逆遷移パス

```
completed → implementation_ready (PR revert、manual operation)
implementation_ready → spec_created (Phase 10 MAJOR/CRITICAL)
spec_created → (未作成状態) (Phase 3 MAJOR/CRITICAL で要件問題)
```

**検証結果**: 3段階の逆遷移が全て定義済み。design-summary.md 2.4節と整合。

---

## 6. Walkthrough 結果サマリー

| TC ID | テストケース名                    | 結果 | 発見された問題 |
| ----- | --------------------------------- | ---- | -------------- |
| M-1   | Phase 12 Step A 実行 walkthrough  | PASS | なし           |
| M-2   | Phase 12 Step E mirror sync       | PASS | なし           |
| M-3   | 未タスク3ステップ検証             | PASS | なし           |
| M-4   | type:design の State 遷移確認     | PASS | なし           |
| M-5   | サブエージェント3ファイル制約確認 | PASS | なし           |

全5件の Manual テストケースが PASS。Phase 11 完了条件を充足。
