# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 6                       |
| Phase名    | テスト拡充              |
| 対象機能   | TASK-SW-STRUCT-002      |
| 前提Phase  | Phase 5: 実装           |
| 次Phase    | Phase 7: カバレッジ確認 |
| ステータス | 未実施                  |
| 作成日     | 2026-04-16              |

## 目的

Phase 4 で作成した基本テストケース（TC-01〜TC-05）に加え、境界条件・フォールバック回帰・
エッジケースのテストを追加して網羅性を高める。
`generateSkillMd` の3段階フォールバックと `structurePlan` の各フィールドの境界値を重点的に確認する。

## 実行タスク

### Task 1: 境界条件テストの追加

AC-1〜AC-5 の境界条件を洗い出し、追加テストケースを設計する。

**境界条件一覧**:

| 境界条件                                        | 期待動作                                                             |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| `structurePlan.purpose` が空文字列              | `triggerDescription` が短縮形（Purpose: なし）になる                 |
| `structurePlan.triggers` が空配列               | `triggerKeywords` が `[skillName]` にフォールバックされる            |
| `structurePlan.anchors` が未定義                | `plan.workflow.anchors` が `[]` になる                               |
| `structurePlan.purpose` が非常に長い文字列      | `triggerDescription` にそのまま設定される（エラーにならない）        |
| `generate_skill_md.js` が stderr を出力して失敗 | `ensureSkillMdExists` にフォールバックし `createSkill()` が成功する  |
| SKILL.md が生成されるが空ファイル               | `fs.access` は成功するため、フォールバックは発生しない（設計どおり） |

### Task 2: 追加テストケース一覧

| TC ID | テストタイトル                                                                  | 期待結果                                                |
| ----- | ------------------------------------------------------------------------------- | ------------------------------------------------------- |
| TC-06 | purpose が空文字列の場合 triggerDescription が短縮形になる                      | `trigger.description` が `Use when {name} is requested` |
| TC-07 | triggers が空配列の場合 triggerKeywords が skillName のみになる                 | `trigger.keywords` が `[skillName]`                     |
| TC-08 | anchors が未定義の場合 plan.workflow.anchors が空配列になる                     | `plan.workflow.anchors` が `[]`                         |
| TC-09 | generate_skill_md.js が stderr を出力して失敗しても createSkill() が成功する    | 例外なし、SKILL.md が生成される（フォールバック経由）   |
| TC-10 | generateSkillMd が例外をスローした場合 ensureSkillMdExists にフォールバックする | `createSkill()` が例外をスローしない                    |
| TC-11 | structurePlan.skillName が plan.skillName に正しく反映される                    | `plan.skillName === structurePlan.skillName`            |
| TC-12 | structurePlan.description が plan.workflow.summary に反映される                 | `plan.workflow.summary === structurePlan.description`   |

### Task 3: 回帰テスト追加実行確認

Phase 5 実装後の状態で回帰テストを追加実行し、全て Green であることを確認する。

```bash
# 拡充テスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"

# カバレッジ確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --coverage
```

## 参照資料

- `outputs/phase-4/TASK-SW-STRUCT-002-test-design.md` — 基本テストケース（TC-01〜TC-05）
- `outputs/phase-5/TASK-SW-STRUCT-002-implementation-plan.md` — 実装内容

## 統合テスト連携

- 拡充テストはユニットテストの範囲内で実施する
- `generate_skill_md.js` スクリプト自体のテストは本タスクのスコープ外

## 成果物

| 成果物                                     | パス                                                         |
| ------------------------------------------ | ------------------------------------------------------------ |
| TASK-SW-STRUCT-002-extended-test-record.md | `outputs/phase-6/TASK-SW-STRUCT-002-extended-test-record.md` |

## 完了条件

- [ ] TC-06〜TC-12 の境界条件テストが追加されている
- [ ] 全テストケース（TC-01〜TC-12、TC-R01〜TC-R03）が Green である
- [ ] TASK-SW-STRUCT-002-extended-test-record.md に追加テストの記録がある

## タスク100%実行確認【必須】

- [ ] Task 1（境界条件テストの追加）を100%実行した
- [ ] Task 2（追加テストケース一覧の確定）を100%実行した
- [ ] Task 3（回帰テスト追加実行確認）を100%実行した
- [ ] 成果物（TASK-SW-STRUCT-002-extended-test-record.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
