# Phase 12 Documentation Guide

## Task 12-1: 実装ガイド作成【必須・2パート構成】

| パート | 対象読者 | 内容 |
| ------ | -------- | ---- |
| **Part 1** | **初学者・中学生レベル** | **概念的説明（日常の例え話、専門用語なし）** |
| Part 2 | 開発者・技術者 | 技術的詳細（型、シグネチャ、使用例、エラー、エッジケース、設定） |

**Part 1 記述ルール**:
- 日常生活での例え話を**必ず**含め、`たとえば` を最低1回明示する
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明
- 作成後に `references/phase12-checklist-definition.md` と `validate-phase12-implementation-guide.js` で内容要件を確認する

**Part 2 追補ルール**:
- `spec_created` workflow では「実装済み」と書かず、`current contract` と `target delta` を分けて書く
- API シグネチャだけで閉じず、型定義、使用例、エラーハンドリング、エッジケース、設定可能パラメータ/定数一覧を省略しない
- `future sync target` の列挙だけで終わらせず、今回 wave で何を更新し、何を no-op 判定したかを対応する成果物へ残す
- screenshot fallback を完了根拠に使う場合は、placeholder-only の証跡を PASS 扱いにせず、coverage / metadata / fallback reason / source evidence まで current workflow に揃えた実測値で書く

**Part 1 テンプレート**:
```markdown
### X.X [機能名]とは何か

#### 日常生活での例え

[日常の具体的なシーン]に似ています。

例えば、[身近な例]のようなものです。

#### この機能でできること

| 機能 | 説明 | 例 |
|------|------|-----|
| 機能A | 簡単な説明 | 具体例 |
```

詳細: `references/technical-documentation-guide.md`、`references/phase12-checklist-definition.md`

## Task 12-2: system spec update summary

- Step 1 の実施結果
- Step 2 の判定結果
- 更新した spec と理由
- canonical root / mirror policy
- canonical filename は `system-spec-update-summary.md`
- `artifacts.json` と `outputs/artifacts.json` の同期結果も書く
- Phase 11 が NON_VISUAL の場合でも `manual-test-checklist.md` など補助成果物の有無を記録する

### 設計タスク（docs-only）での注意

設計タスクであっても Step 1-A〜Step 2 の**実ファイル更新は必須**である。
「設計タスク範囲外」として実更新を保留してはならない。

具体的に必須な更新:
- LOGS.md 2ファイル更新（aiworkflow-requirements + task-specification-creator）
- SKILL.md 2ファイルの変更履歴更新
- topic-map.md の再生成（`generate-index.js` 実行）
- 新規型定義がある場合は `interfaces-*.md` への型定義配置
- `task-workflow.md` の完了タスク記録
- docs-only 前提で作成した follow-up に後からコード変更が入った場合は、`phase-*.md` と `outputs/phase-12/*.md` の narrative も同じターンで current facts に戻す

サブエージェントに委譲する場合も、「設計タスクだから更新不要」という判断を許容しない。

## Task 12-3: documentation changelog

- 変更した file 一覧
- validator 実行結果
- current / baseline の区別
- artifacts 同期結果
- human-authored な Phase 12 成果物は task root 直下ではなく `outputs/phase-12/` に置く
- `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の4点同期結果
- Step 1-A で更新した `aiworkflow-requirements` / `task-specification-creator` の `SKILL.md` / `LOGS.md` を canonical path で列挙する
- `skill-creator` を改善した場合は、`skill-creator/SKILL.md` / `LOGS.md` / 変更した template or reference も同じ changelog に列挙する
- `更新予定` / `計画済み` / `PR マージ後に実施` のような future wording を残さない

## Task 12-4: unassigned detection

- 0件でも summary を残す
- 1件以上なら formalize path を記録する
- raw メモで終わらせず、`audit-unassigned-tasks.js --target-file` が通る full template まで昇格させる
- repo 全体の baseline 違反が多い場合は `current` と `baseline` を分離して記録する

## Task 12-5: skill feedback

- 改善点があれば next action を書く
- 改善点なしでも「なし」と理由を書く

## Task 12-6: phase12-task-spec-compliance-check（P4対策・最終確認）

- Task 1〜5 の全完了を確認してから作成する（早期完了記載禁止）
- 全タスクが「完了」と記録されてから Phase 12 を閉じる
- `documentation-changelog.md` だけでなく `outputs/phase-12/*.md` 全体に planned wording（「計画」「予定」「TODO」）が残っていないことを確認する
- `spec_created` workflow は root path と status の整合も確認し、`completed-tasks/` 配下にあることを理由に `completed` へ上げない
- `計画済み` / `更新予定` / `作成待` / `完了または計画済み` は未完了扱いとし、compliance-check を PASS にしない
- `outputs/phase-11/manual-test-result.md` が `not_run` のままなら Phase 11 / 12 を completed にしない
- internal adapter の実装だけで public IPC / preload contract 更新済みとは記録しない
- Phase 13 は user approval 未取得なら `blocked` を維持し、completed へ進めない
- skill を更新した場合は canonical `.claude/skills/...` と mirror `.agents/skills/...` の parity も記録する
- compliance-check は自己申告 PASS で閉じず、validator 実測値、artifact existence、mirror parity、Phase 11 evidence の実ファイル根拠を結び付けて記録する

**確認コマンド（docs-only / UI task 共通で必須）**:

```bash
rg -n "計画|予定|TODO|will be|を予定|仕様策定のみ|保留として記録" \
  outputs/phase-12/*.md
# 出力が 0 件であること
```

## 完了前チェック

- `implementation-guide.md`
- `system-spec-update-summary.md`
- `documentation-changelog.md`
- `unassigned-task-detection.md`
- `skill-feedback-report.md`
- `phase12-task-spec-compliance-check.md`

上記 6 ファイルが揃ってから Phase 12 を閉じる。
配置先はすべて `outputs/phase-12/` とし、task root 直下の `phase-12-documentation.md` は集約サマリーだけを持つ。
