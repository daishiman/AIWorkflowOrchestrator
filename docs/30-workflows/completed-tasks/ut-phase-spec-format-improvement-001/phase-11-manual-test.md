# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 11                                                                |
| Phase名    | 手動テスト                                                        |
| 対象機能   | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 Phase 仕様書テンプレート改修 |
| 前提Phase  | Phase 10: 最終レビュー（PASS）                                    |
| 次Phase    | Phase 12: ドキュメント更新                                        |
| ステータス | pending                                                           |
| 作成日     | 2026-04-06                                                        |
| 更新日     | 2026-04-06                                                        |

## 目的

docs-only / spec_created の canonical evidence ルールを検証し、SKILL.md family・LOGS.md archive・.claude ↔ .agents parity・validator rerun の整合を確認する。

## タスク種別と Evidence ルール

> **本タスクは docs-only / spec_created**
>
> - `manual-test-checklist.md` を正本として作成する
> - `manual-test-result.md` には `TC-ID ↔ evidence` を必ず残す
> - `discovered-issues.md` は 0 件でも作成する
> - primary evidence は `SKILL.md` family、`LOGS.md` archive、`.claude` ↔ `.agents` parity、validator rerun

| evidence 種別                | 必須 | 取得方法                                                                          |
| ---------------------------- | ---- | --------------------------------------------------------------------------------- |
| manual-test-checklist.md     | ✅   | TC-ID / evidence / result を一覧化                                                |
| manual-test-result.md        | ✅   | TC-ID ↔ evidence を 1:1 で記録                                                    |
| discovered-issues.md         | ✅   | Blocker / Note / Info で記録（0件でも作成）                                       |
| `SKILL.md` family            | ✅   | canonical family file を参照し、変更履歴と実体の一致を確認                        |
| `LOGS.md` archive            | ✅   | archive 側の変更記録を確認                                                        |
| `.claude` ↔ `.agents` parity | ✅   | `diff -qr` で canonical / mirror の差分を確認                                     |
| validator rerun              | ✅   | `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` を再実行 |
| screenshot / visual evidence | ❌   | 不要（docs-only タスクのため）                                                    |

> **注意**: placeholder-only の証跡は PASS 扱いにしない（docs-only でも同様）。

## 実行タスク

### Task 11-1: manual-test-checklist の作成

docs-only evidence を TC-ID 単位で記録する checklist を作成する。

**記録項目**:

- `TC-ID`
- `確認対象`
- `evidence`
- `判定`
- `備考`

**記録先**: `outputs/phase-11/manual-test-checklist.md`

### Task 11-2: docs-only テンプレートの evidence ルール確認

`phase-spec-template.md` と `unassigned-task-template.md` の改修内容が docs-only canonical に一致していることを確認する。

**確認手順**:

1. `phase-spec-template.md` の Phase 11 / Phase 12 ガイドラインを `rg` で確認する
2. `manual-test-checklist.md` に `TC-ID ↔ evidence` の対応があることを確認する
3. `manual-test-result.md` に docs-only / spec_created の判定根拠が残ることを確認する

**確認結果の記録先**: `outputs/phase-11/manual-test-result.md`

### Task 11-3: canonical file sync の確認

`SKILL.md` family、`LOGS.md` archive、`.claude` ↔ `.agents` parity を確認する。

**確認手順**:

1. `SKILL.md` の変更履歴が family file の実体と整合していることを確認する
2. `LOGS.md` が archive 側の更新履歴と一致していることを確認する
3. `.claude/skills/task-specification-creator` と `.agents/skills/task-specification-creator` の差分がないことを確認する
4. `task-specification-creator` と `aiworkflow-requirements` の同波更新が残っていることを確認する

**確認結果の記録先**: `outputs/phase-11/manual-test-result.md`

### Task 11-4: validator rerun の確認

以下の validator を再実行し、docs-only change が正しく検証されることを確認する。

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/ut-phase-spec-format-improvement-001 --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-phase-spec-format-improvement-001
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/ut-phase-spec-format-improvement-001/outputs/phase-11/manual-test-result.md
```

**記録項目**: 実行コマンド、結果、baseline/current の差、PASS/FAIL

### Task 11-5: 発見事項の記録

手動テスト中に発見した以下の問題を記録する:

| 分類    | 発見事項 | 対応                           |
| ------- | -------- | ------------------------------ |
| Blocker | -        | Phase 5 へ差し戻し             |
| Note    | -        | 未タスク化 + Phase 12 前に対応 |
| Info    | -        | `discovered-issues.md` に記録  |

**発見事項の記録先**: `outputs/phase-11/discovered-issues.md`（0件でも作成必須）

## 成果物

| 成果物                   | パス                                        | 説明                                  |
| ------------------------ | ------------------------------------------- | ------------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | TC-ID / evidence / result の一覧      |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | TC-ID ↔ evidence・docs-only 判定根拠  |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`     | テスト中の発見事項（0件でも作成必須） |

## 参照資料

| 資料名                      | パス                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------- |
| phase-spec-template.md      | `.claude/skills/task-specification-creator/assets/phase-spec-template.md`          |
| unassigned-task-template.md | `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`     |
| Phase 12 ドキュメント更新   | `docs/30-workflows/ut-phase-spec-format-improvement-001/phase-12-documentation.md` |

## 統合テスト連携

- Phase 12 の root evidence と outputs/artifacts.json の整合性を後続で確認する。
- Phase 13 で PR 作成へ進む前に、本 Phase の evidence がすべて記録済みであることを前提にする。

## 完了条件

- [ ] manual-test-checklist.md が作成されている
- [ ] SKILL.md family / LOGS.md archive / `.claude` ↔ `.agents` parity を確認した
- [ ] validator rerun の結果が記録されている
- [ ] docs-only Phase 11 の evidence ルールが明記されている
- [ ] `manual-test-result.md` が作成されている
- [ ] `discovered-issues.md` が作成されている（0件でも可）
- [ ] Blocker がない（または対応済み）
- [ ] placeholder-only 証跡で PASS にしていない
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
