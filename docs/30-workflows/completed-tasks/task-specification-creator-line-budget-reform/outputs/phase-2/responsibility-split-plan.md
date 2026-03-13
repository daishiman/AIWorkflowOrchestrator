# Phase 2 Output: Responsibility Split Plan

## target topology

| concern | current file              | target shape                                | 保持責務                                                      | 退避責務                                      |
| ------- | ------------------------- | ------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------- |
| C1      | `SKILL.md`                | `SKILL.md` + 既存 references 直リンク整理   | 概要、quick start、task nav、resource map、core command index | Phase 12 detail、長い判断表、詳細例           |
| C2      | `LOGS.md`                 | `LOGS.md` + archive refs                    | 直近 log、format、最新 replay に必要な履歴                    | 古い完了記録の全文                            |
| C3      | `patterns.md`             | index + pattern family files                | quick navigation、family index、最新必須 pattern              | family 別 detail                              |
| C4      | `phase-templates.md`      | index + template family files               | common variables、template navigation                         | 各 phase family の全文 template               |
| C5      | `spec-update-workflow.md` | index + step1/step2/validation files        | overall decision flow、entry links                            | checklist detail、validation matrix、examples |
| C6      | `phase-11-12-guide.md`    | guide index + phase11 guide + phase12 guide | 2 phase の分岐導線                                            | screenshot detail、documentation detail       |

## 予定ファイル

| current                              | planned file                                  |
| ------------------------------------ | --------------------------------------------- |
| `references/patterns.md`             | `references/patterns.md`                      |
| `references/patterns.md`             | `references/patterns-phase12-sync.md`         |
| `references/patterns.md`             | `references/patterns-validation-and-audit.md` |
| `references/patterns.md`             | `references/patterns-workflow-generation.md`  |
| `references/phase-templates.md`      | `references/phase-templates.md`               |
| `references/phase-templates.md`      | `references/phase-template-core.md`           |
| `references/phase-templates.md`      | `references/phase-template-execution.md`      |
| `references/phase-templates.md`      | `references/phase-template-phase11.md`        |
| `references/phase-templates.md`      | `references/phase-template-phase12.md`        |
| `references/phase-templates.md`      | `references/phase-template-phase13.md`        |
| `references/spec-update-workflow.md` | `references/spec-update-workflow.md`          |
| `references/spec-update-workflow.md` | `references/spec-update-step1-completion.md`  |
| `references/spec-update-workflow.md` | `references/spec-update-step2-domain-sync.md` |
| `references/spec-update-workflow.md` | `references/spec-update-validation-matrix.md` |
| `references/phase-11-12-guide.md`    | `references/phase-11-12-guide.md`             |
| `references/phase-11-12-guide.md`    | `references/phase-11-screenshot-guide.md`     |
| `references/phase-11-12-guide.md`    | `references/phase-12-documentation-guide.md`  |
| `LOGS.md`                            | `LOGS.md`                                     |
| `LOGS.md`                            | `references/logs-archive-2026-q1.md`          |

## split ルール

1. 新規 ref は flat path を使う。
2. `SKILL.md` から全 ref へ直リンクを張る。
3. 同じ説明を `SKILL.md` と ref の両方へ重複記載しない。
4. mirror 側 `.agents` には同名ファイルを同期作成する。
5. 新規 file も 500 行を超えない単位で設計する。

## dependency contract

| parent              | child / dependent                    | 保持する依存関係                          |
| ------------------- | ------------------------------------ | ----------------------------------------- |
| `SKILL.md`          | 新規 reference family files          | `SKILL.md` から各 family index へたどれる |
| `LOGS.md`           | `references/logs-archive-2026-q1.md` | rolling log から archive へたどれる       |
| family index files  | detail files                         | parent から child detail へたどれる       |
| `.claude` canonical | `.agents` mirror                     | 同名 file set と同一導線を持つ            |
