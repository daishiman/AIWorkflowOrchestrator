# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 12                             |
| Phase名    | ドキュメント更新               |
| 機能名     | refs-500line-split-maintenance |
| 前提Phase  | Phase 11                       |
| 次Phase    | Phase 13: PR作成               |
| ステータス | pending                        |
| 作成日     | 2026-04-07                     |

## 目的

Phase 12 の 6 タスク（Task 12-1〜12-6）を全て完了し、docs-only task の close-out を same-wave で同期する。

## Task 1: 実装ガイド作成（2パート構成）【必須】

成果物: `outputs/phase-12/implementation-guide.md`

### Part 1（中学生レベル）

要件:

- 日常生活での例え話を必ず含め、`たとえば` を最低 1 回明示する
- 専門用語は使わない（使う場合は即座に説明する）
- 「なぜ必要か」→「何をするか」の順で説明する

### Part 2（技術者レベル）

要件:

- 分離基準（499 行以内、H2/H3 境界、親ファイルは index 化）を明記する
- `current contract`（現状の構造）と `target delta`（今回の変更内容）を分けて書く
- 検証コマンド、エッジケース（1 セクションが 499 行超の場合の扱い）、設定値/定数（例: 行数閾値）を省略しない

検証コマンド（例）:

```bash
find .claude/skills/ -name "*.md" -exec wc -l {} \; | awk '$1 >= 500 {print "OVER:", $0}'
```

## Task 2: system spec update summary（Step 1/Step 2）

成果物: `outputs/phase-12/system-spec-update-summary.md`

### Step 1-A: 完了タスク記録

- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` に完了タスク追記
- [ ] LOGS.md × 2 更新（aiworkflow-requirements / task-specification-creator）
- [ ] SKILL.md × 2 更新（変更履歴追記）
- [ ] `.agents/skills/` mirror も同波で更新（SKILL.md / LOGS.md）
- [ ] `artifacts.json` / `outputs/artifacts.json` の同期結果を記録
- [ ] `indexes/topic-map.md` / `indexes/keywords.json` の再生成が含まれることを記録

### Step 1-B: 実装状況テーブル更新

- [ ] 本タスクを `spec_created` → `completed` へ更新

### Step 1-C: 関連タスクテーブル更新

- [ ] `task-imp-spec-500line-preemptive-split-guideline-001.md` のステータス更新

### Step 2: システム仕様更新判定

新規インターフェース追加はなし → Step 2 は **N/A**

## Task 3: documentation changelog

- [ ] `outputs/phase-12/documentation-changelog.md` に全更新記録

## Task 4: unassigned detection

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan .claude/skills/ \
  --output .tmp/unassigned-candidates.json
```

- [ ] `outputs/phase-12/unassigned-task-detection.md` 作成（0件でも必須）

## Task 5: skill feedback

- [ ] `outputs/phase-12/skill-feedback-report.md` 作成（改善点なしでも必須）

## Task 6: phase12-task-spec-compliance-check（最終確認）

成果物: `outputs/phase-12/phase12-task-spec-compliance-check.md`

確認要件:

- Task 1〜5 の成果物が全て揃っている（`outputs/phase-12/*.md`）
- Phase 11 が `NON_VISUAL` の場合でも、`outputs/phase-11/manual-test-checklist.md` の有無と根拠が `system-spec-update-summary.md` に記録されている
- `outputs/phase-11/manual-test-result.md` が `not_run` のままではない
- `indexes/topic-map.md` / `indexes/keywords.json` が `generate-index.js` により再生成されている
- `outputs/phase-12/*.md` に planned wording が残っていない（自己申告 PASS で閉じない）
- `artifacts.json` / `outputs/artifacts.json` の title / type / status / phase artifact 名 parity が一致している
- Phase 13 は user approval 未取得の場合 `blocked` を維持する

確認コマンド:

```bash
rg -n "計画|予定|TODO|will be|を予定|仕様策定のみ|保留として記録" \
  docs/30-workflows/task-refs-500line-split-maintenance-001/outputs/phase-12/*.md
```

## 成果物

| 成果物                       | パス                                                     | 説明                 |
| ---------------------------- | -------------------------------------------------------- | -------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1/2 必須        |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A/B/C         |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 全更新記録           |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも必須          |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも必須   |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 1〜6 の完了確認 |

## 完了条件

- [ ] Task 1〜6 が全て完了している
- [ ] LOGS.md × 2 が更新されている
- [ ] SKILL.md × 2 が更新されている
- [ ] `artifacts.json` / `outputs/artifacts.json` が同期されている
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成されている

## 次Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
