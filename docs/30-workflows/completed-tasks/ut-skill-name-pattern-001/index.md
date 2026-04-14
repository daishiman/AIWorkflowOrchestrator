# UT-SKILL-NAME-PATTERN-001: `SKILL_NAME_PATTERN` の shared 定数化と現行整合確認

## メタ情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UT-SKILL-NAME-PATTERN-001                                                |
| タスク名     | SKILL_NAME_PATTERN の shared 定数化と現行整合確認                        |
| 種別         | unassigned-task / refactoring                                            |
| 優先度       | medium                                                                   |
| スケール     | small                                                                    |
| 依存タスク   | なし（独立タスク）                                                       |
| 発見元       | Phase 12（fix-creator-handler-duplicate-skill-name-validation）          |
| GitHub Issue | [#1965](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1965) |
| 作成日       | 2026-04-14                                                               |
| ステータス   | completed                                                                |

## 概要

現行コードでは、`packages/shared/src/constants/skillName.ts` と `packages/shared/src/constants/index.ts` に
`SKILL_NAME_PATTERN` と `MAX_SKILL_NAME_LENGTH` が既に定義されている。
また、`apps/desktop/src/main/claude-cli/SkillScanner.ts` と
`.claude/skills/skill-creator/scripts/init_skill.js` は `@repo/shared/constants` を参照している。

このタスクの本質は、実装を再作成することではなく、現行 state が skill 定義と一致しているかを監査し、
必要があれば最小差分だけ修正し、不要なら docs と証跡だけを整えることにある。

## 背景

過去の divergence は `SkillService.ts` と `init_skill.js` で観測されていたが、現在の本体では
shared constants への収束が進んでいる。残るリスクは、古い task spec が `packages/shared/src/index.ts` や
`SKILL_NAME_MAX_LENGTH` といった旧前提を引きずることによる spec drift である。

## 対象

| ファイル                                             | 役割           |
| ---------------------------------------------------- | -------------- |
| `packages/shared/src/constants/skillName.ts`         | 正本定義       |
| `packages/shared/src/constants/index.ts`             | barrel export  |
| `apps/desktop/src/main/claude-cli/SkillScanner.ts`   | 実利用側       |
| `.claude/skills/skill-creator/scripts/init_skill.js` | 実利用側       |
| `.agents/skills/skill-creator/scripts/init_skill.js` | mirror         |
| `docs/00-requirements/18-skills.md`                  | canonical spec |

`SkillService.ts` は historical context としてのみ参照する。今回の変更対象ではない。

## スコープ

### 含む

- current-state の監査
- drift があれば最小差分で修正
- 既存テスト・ビルド・型チェックの確認
- 必要な docs 同期と evidence 記録

### 含まない

- ルール自体の変更
- 新しい subpath export の追加
- `init_skill.js` の TypeScript 化
- `SkillService.ts` のロジック変更

## 受入基準

| ID   | 受入基準                                                                                                                                                |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `packages/shared/src/constants/skillName.ts` に `SKILL_NAME_PATTERN` と `MAX_SKILL_NAME_LENGTH` が定義されている                                        |
| AC-2 | `packages/shared/src/constants/index.ts` から上記定数が export されている                                                                               |
| AC-3 | `SkillScanner.ts` と `init_skill.js` が `@repo/shared/constants` を参照している                                                                         |
| AC-4 | `packages/shared/src/constants/skillName.test.ts` と `apps/desktop/src/main/claude-cli/__tests__/skill-scanner.test.ts` が current-state と整合している |
| AC-5 | current-state の主語は `packages/shared/src/constants/index.ts`、`MAX_SKILL_NAME_LENGTH`、`SkillScanner.ts` に統一されている                            |

## Phase リスト

| Phase | 名前             | 概要                                              |
| ----- | ---------------- | ------------------------------------------------- |
| 1     | 現状監査         | 実装・テスト・正本仕様の current facts を確認する |
| 2     | 解決方針         | patch / no-op / docs sync の分岐を決める          |
| 3     | 設計レビュー     | 4 条件で進行可否を判定する                        |
| 4     | テスト設計       | 既存テストの網羅性と追加の要否を定義する          |
| 5     | 実装/同期        | drift がある場合のみ最小差分を適用する            |
| 6     | テスト拡張       | 追加が必要な場合のみ edge case を増やす           |
| 7     | カバレッジ確認   | 変更箇所のみを対象に確認する                      |
| 8     | リファクタリング | 冗長な記述と古い前提を削る                        |
| 9     | 品質保証         | build / typecheck / lint / targeted test を通す   |
| 10    | 最終レビュー     | 受入基準を再確認する                              |
| 11    | 手動テスト       | NON_VISUAL の証跡を整理する                       |
| 12    | ドキュメント更新 | canonical docs と task spec を同期する            |
| 13    | PR 作成          | ユーザー承認後のみ実施する                        |

## 実行原則

- Phase 1 と Phase 4 は並列化してよい。
- Phase 5 以降は Phase 1-3 の結果で drift があるときだけ実施する。
- current state が skill 定義と一致しているなら、実装を増やさず証跡と docs のみを整える。
- `packages/shared/src/constants/index.ts` を正とし、`packages/shared/src/index.ts` は使わない。
