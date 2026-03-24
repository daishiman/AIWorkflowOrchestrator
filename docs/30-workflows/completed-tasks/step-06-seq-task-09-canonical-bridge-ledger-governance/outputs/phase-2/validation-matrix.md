# Phase 2 成果物: 検証マトリクス

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 2 - 設計

## 1. Phase 別検証観点

| Phase | 検証観点                | 検証コマンド / 手順                                         | PASS 条件                       |
| ----- | ----------------------- | ----------------------------------------------------------- | ------------------------------- |
| 3     | State Machine 整合性    | design-review-report.md で type 別遷移条件を照合            | L-1 全遷移パスに条件記載あり    |
| 3     | Bridge Rule 妥当性      | legacy register と canonical source table の cross-ref 確認 | 全旧パスに canonical 対応あり   |
| 3     | Sync Protocol 順序保証  | Step A→E の依存関係図を確認                                 | 循環依存なし + リカバリ手順あり |
| 4     | テスト設計網羅性        | FR-1〜5 の全検証方法に対応するテストケースが存在            | テストケース数 >= FR 数         |
| 10    | AC 照合                 | AC-1〜4 の検証条件を成果物と照合                            | 全 AC が PASS                   |
| 11    | 手動 walkthrough        | governance 仕様に基づく Phase 12 シミュレーション           | 全ステップ実行可能              |
| 12    | Same-Wave Sync 実行確認 | `git diff --stat -- .claude/skills/` で変更ファイル確認     | 期待ファイル数と一致            |
| 12    | Mirror 整合確認         | `diff -qr ./.claude/skills/ ./.agents/skills/`              | 差分0件                         |

## 2. AC 検証マトリクス

| AC   | FR     | 検証方法                                     | 自動化可否  | Phase |
| ---- | ------ | -------------------------------------------- | ----------- | ----- |
| AC-1 | FR-1.1 | canonical source table の table 存在確認     | 可（grep）  | 10    |
| AC-1 | FR-1.2 | canonical path の `ls` 検証                  | 可（bash）  | 10    |
| AC-1 | FR-1.3 | 責務・権限者・タイミング列の値確認           | 手動        | 10    |
| AC-1 | FR-2.1 | legacy register と source table の cross-ref | 可（grep）  | 10    |
| AC-1 | FR-2.2 | bridge rule 文書の存在確認                   | 可（ls）    | 10    |
| AC-1 | FR-2.3 | deprecation timeline の記載確認              | 手動        | 10    |
| AC-2 | FR-3.1 | 成果物ベース条件の記載確認                   | 手動        | 10    |
| AC-2 | FR-3.2 | type 別条件テーブルの存在確認                | 可（grep）  | 10    |
| AC-2 | FR-3.3 | MINOR 遷移パスの記載確認                     | 可（grep）  | 10    |
| AC-2 | FR-3.4 | rollback 手順の記載確認                      | 手動        | 10    |
| AC-3 | FR-4.1 | Phase 12 同期チェックリストの存在確認        | 可（grep）  | 10    |
| AC-3 | FR-4.2 | 同期対象ファイルリスト行数確認               | 可（wc -l） | 10    |
| AC-3 | FR-4.3 | 3ファイル/エージェント制約の記載確認         | 可（grep）  | 10    |
| AC-3 | FR-4.4 | rsync + diff コマンドの記載確認              | 可（grep）  | 10    |
| AC-4 | FR-5.1 | 3ステップ手順の記載確認                      | 可（grep）  | 10    |
| AC-4 | FR-5.2 | 設計タスク例外なし条件の記載確認             | 可（grep）  | 10    |
| AC-4 | FR-5.3 | current → baseline 移管条件の記載確認        | 手動        | 10    |
| AC-4 | FR-5.4 | gh issue close 手順の記載確認                | 可（grep）  | 10    |

## 3. Drift 検出コマンド一覧

Phase 10/11/12 で使用する drift 検出コマンド:

```bash
# 1. Canonical Source Table の path 存在確認
ls -la .claude/skills/aiworkflow-requirements/references/task-workflow*.md

# 2. Legacy Register と Canonical の cross-reference
grep -c "canonical" .claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md

# 3. Mirror Sync 差分検出
diff -qr ./.claude/skills/ ./.agents/skills/ 2>/dev/null | head -20

# 4. Index 鮮度確認（generate-index.js 最終実行時刻）
stat -f "%Sm" .claude/skills/aiworkflow-requirements/indexes/topic-map.md

# 5. LOGS.md 2ファイル整合確認
diff .claude/skills/aiworkflow-requirements/LOGS.md .claude/skills/task-specification-creator/LOGS.md 2>/dev/null | head -5 || echo "Files differ or missing"

# 6. Unassigned Task 配置確認
ls docs/30-workflows/unassigned-task/ 2>/dev/null | wc -l

# 7. documentation-changelog と unassigned-task-detection の件数照合
grep -c "検出件数" outputs/phase-12/documentation-changelog.md 2>/dev/null || echo "Not yet created"
```

## 4. 回帰防止ルール

governance 仕様で明示的に防止する Pitfall:

| Pitfall    | 防止ルール                                             | 検証タイミング   |
| ---------- | ------------------------------------------------------ | ---------------- |
| P1/P25     | LOGS.md 2ファイル同時更新                              | Phase 12 Step E  |
| P2/P27     | topic-map.md 再生成（変更有無に関わらず実行）          | Phase 12 Step D  |
| P3/P38/P58 | 未タスク3ステップ必須（設計タスクも例外なし）          | Phase 12 Task 4  |
| P4/P51     | documentation-changelog は全 Task 完了後に事後記録     | Phase 12 Task 3  |
| P26/P57    | 設計タスクでも Phase 12 完了時にシステム仕様書を実更新 | Phase 12 Step C  |
| P43        | サブエージェント 3ファイル/エージェント上限            | Phase 12 全 Step |
| P56        | 再評価クローズ時の GitHub Issue 同時 Close             | Phase 12 Task 4  |
| P59        | changelog はメインエージェントが統合（並列分担禁止）   | Phase 12 Task 3  |
