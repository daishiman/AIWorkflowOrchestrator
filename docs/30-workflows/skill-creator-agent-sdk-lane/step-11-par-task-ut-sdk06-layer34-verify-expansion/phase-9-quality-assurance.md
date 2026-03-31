# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 9                                 |
| 機能名 | ut-sdk06-layer34-verify-expansion |
| 作成日 | 2026-03-31                        |

## 目的

Layer3/4 テスト実装の型安全性・既存 Layer1/2 との整合性・AC 充足度を最終確認し、品質ゲートを通過させる。

## 実行タスク

- Code QA（型/静的解析/テスト）を実行し、Layer3/4 追加による不整合がないことを確認する
- Spec QA（task-spec 構造/Phase 12 guide/skill 準拠）を validator で検証し、PASS 基準を満たすことを確認する
- AC-1〜AC-8 への充足マトリクスを完成させる（実測値ベースで更新する）

## 参照資料

| 資料名             | パス                        | 説明                     |
| ------------------ | --------------------------- | ------------------------ |
| index.md 受入基準  | `index.md`                  | AC-1〜AC-8 の定義        |
| Phase 7 coverage   | `phase-7-coverage-check.md` | coverage 集計結果        |
| Phase 8 リファクタ | `phase-8-refactoring.md`    | リファクタリング後の状態 |

## Code QA 実行コマンド

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint

# テスト（全テスト）
pnpm --filter @repo/desktop vitest run

# coverage 確認
pnpm --filter @repo/desktop vitest run --coverage
```

## Spec QA（validator replay）

Phase 12 を閉じる前提として、task pack と 2 skill の構造検証を通す。

| 検証対象                                   | コマンド                                                                                                                                                                                                       | pass 条件                   | 記録先                          |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------- |
| `task-specification-creator` 構造          | `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator`                                                                                                        | error 0                     | `outputs/phase-9/qa-summary.md` |
| `task-specification-creator` 全体          | `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator`                                                                                                          | error 0                     | `outputs/phase-9/qa-summary.md` |
| `aiworkflow-requirements` 構造             | `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements`                                                                                                           | error 0                     | `outputs/phase-9/qa-summary.md` |
| `aiworkflow-requirements` 全体             | `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/aiworkflow-requirements`                                                                                                             | error 0                     | `outputs/phase-9/qa-summary.md` |
| workflow 構造                              | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-ut-sdk06-layer34-verify-expansion --json`               | error 0                     | `outputs/phase-9/qa-summary.md` |
| workflow phase 出力                        | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-ut-sdk06-layer34-verify-expansion`                            | error 0                     | `outputs/phase-9/qa-summary.md` |
| implementation guide                       | `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-ut-sdk06-layer34-verify-expansion` | Part 1 / Part 2 全項目 PASS | `outputs/phase-9/qa-summary.md` |
| `task-specification-creator` mirror parity | `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                                                                                 | diff 0                      | `outputs/phase-9/qa-summary.md` |
| `aiworkflow-requirements` mirror parity    | `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`                                                                                                                       | diff 0                      | `outputs/phase-9/qa-summary.md` |

### Spec QA 実行コマンド

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/aiworkflow-requirements
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-ut-sdk06-layer34-verify-expansion --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-ut-sdk06-layer34-verify-expansion
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/skill-creator-agent-sdk-lane/step-11-par-task-ut-sdk06-layer34-verify-expansion
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
diff -qr artifacts.json outputs/artifacts.json
```

## Artifact / boundary audit

| 観点           | 確認内容                                     | pass 条件                          | 記録先                          |
| -------------- | -------------------------------------------- | ---------------------------------- | ------------------------------- |
| contract drift | `layer` 型、check ID、validator contract     | drift 0                            | `outputs/phase-9/qa-summary.md` |
| boundary drift | task07/task08 の owner 境界                  | cross-owner 変更なし               | `outputs/phase-9/qa-summary.md` |
| artifact drift | `artifacts.json` と `outputs/artifacts.json` | diff 0 もしくは blocked 理由を記録 | `outputs/phase-9/qa-summary.md` |
| spec drift     | docs と `.claude` 正本の canonical path      | mismatch 0                         | `outputs/phase-9/qa-summary.md` |

## AC 充足マトリクス

| AC   | 基準                                                                | 対応テストケース             | 充足状態 |
| ---- | ------------------------------------------------------------------- | ---------------------------- | -------- |
| AC-1 | Layer3: output-schema.json の JSON Schema 準拠チェック              | T-L3-01〜T-L3-05             | 未確認   |
| AC-2 | Layer3: agent 責務記述の品質チェック                                | T-L3-06〜T-L3-07, T-L3-EC-03 | 未確認   |
| AC-3 | Layer4: Anchors リスト項目の存在チェック                            | T-L4-01〜T-L4-03             | 未確認   |
| AC-4 | Layer4: references/ の実在整合性チェック                            | T-L4-04〜T-L4-06             | 未確認   |
| AC-5 | 結合: verify→improve→reverify ループで Layer3/4 pass になるシナリオ | T-LOOP-01, T-LOOP-02         | 未確認   |
| AC-6 | 結合: WorkflowEngine + VerificationEngine 連携                      | T-LOOP-04                    | 未確認   |
| AC-7 | 既存 Layer1/2 テストのデグレなし                                    | T-ENG-01〜T-FAC-02           | 未確認   |
| AC-8 | 全テストが `pnpm vitest run` で pass する                           | 全テスト                     | 未確認   |

## 型整合性確認チェックリスト

- [ ] `RuntimeSkillCreatorVerifyCheck.layer` が `"layer3"` / `"layer4"` を受け入れる型になっている
- [ ] `createCheck()` 関数の型シグネチャが Layer3/4 の呼び出しと整合している
- [ ] `findCheck()` ヘルパーが Layer3/4 チェック ID で正しく動作する
- [ ] `Facade.verifySkill()` の戻り値型が Layer3/4 チェックを含む配列を返せる

## 品質ゲート判定

| 判定  | 条件                                                   |
| ----- | ------------------------------------------------------ |
| PASS  | 型エラーなし、全テスト green、AC-1〜AC-8 全充足        |
| MINOR | 軽微な型警告あり。Phase 10 でレビュー後に判断          |
| FAIL  | 型エラーあり、またはテスト失敗あり。Phase 8 へ差し戻し |

## 統合テスト連携

- PASS の場合、Phase 10 最終レビューへ進む
- FAIL の場合、Phase 8 へ差し戻す

## 成果物

| 成果物     | パス                            | 説明                          |
| ---------- | ------------------------------- | ----------------------------- |
| 品質保証書 | `phase-9-quality-assurance.md`  | AC 充足マトリクスと品質ゲート |
| QAサマリ   | `outputs/phase-9/qa-summary.md` | validator 実測値と監査結果    |

## 完了条件

- [ ] 型チェックが pass している
- [ ] lint が pass している
- [ ] 全テストが pass している
- [ ] AC-1〜AC-8 が全て充足している
- [ ] 品質ゲートの判定が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
