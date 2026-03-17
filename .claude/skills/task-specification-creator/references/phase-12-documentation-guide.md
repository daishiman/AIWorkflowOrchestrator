# Phase 12 Documentation Guide

## Task 12-1: implementation guide

- `## Part 1`
- `## Part 2`
- Part 1 は「なぜ必要か」を先に書く
- Part 1 に日常の例えを入れる
- Part 2 に型、シグネチャ、使用例、エラー、エッジケース、設定を入れる

## Task 12-2: system spec update summary

- Step 1 の実施結果
- Step 2 の判定結果
- 更新した spec と理由
- canonical root / mirror policy

### 設計タスク（docs-only）での注意

設計タスクであっても Step 1-A〜Step 2 の**実ファイル更新は必須**である。
「設計タスク範囲外」として実更新を保留してはならない。

具体的に必須な更新:
- LOGS.md 2ファイル更新（aiworkflow-requirements + task-specification-creator）
- SKILL.md 2ファイルの変更履歴更新
- topic-map.md の再生成（`generate-index.js` 実行）
- 新規型定義がある場合は `interfaces-*.md` への型定義配置
- `task-workflow.md` の完了タスク記録

サブエージェントに委譲する場合も、「設計タスクだから更新不要」という判断を許容しない。

## Task 12-3: documentation changelog

- 変更した file 一覧
- validator 実行結果
- current / baseline の区別
- artifacts 同期結果

## Task 12-4: unassigned detection

- 0件でも summary を残す
- 1件以上なら formalize path を記録する

## Task 12-5: skill feedback

- 改善点があれば next action を書く
- 改善点なしでも「なし」と理由を書く

## Task 12-6: phase12-task-spec-compliance-check（P4対策・最終確認）

- Task 1〜5 の全完了を確認してから作成する（早期完了記載禁止）
- 全タスクが「完了」と記録されてから Phase 12 を閉じる
- `documentation-changelog.md` に planned wording（「計画」「予定」「TODO」）が残っていないことを確認する

**確認コマンド（docs-only タスクで特に必須）**:

```bash
grep -n "計画\|予定\|TODO\|will be\|を予定" outputs/phase-12/documentation-changelog.md
# 出力が0件であること
```

## 完了前チェック

- `implementation-guide.md`
- `system-spec-update-summary.md`
- `documentation-changelog.md`
- `unassigned-task-detection.md`
- `skill-feedback-report.md`
- `phase12-task-spec-compliance-check.md`

上記 6 ファイルが揃ってから Phase 12 を閉じる。
