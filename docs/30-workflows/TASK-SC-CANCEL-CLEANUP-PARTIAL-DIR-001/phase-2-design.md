# Phase 2: 設計

## メタ情報

| 項目     | 値                                                   |
| -------- | ---------------------------------------------------- |
| Phase    | 2                                                    |
| タスクID | TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001               |
| 前Phase  | [phase-1-requirements.md](phase-1-requirements.md)   |
| 次Phase  | [phase-3-design-review.md](phase-3-design-review.md) |

## 目的

既存コード実態に合わせて、task spec を `差分確認 + 回帰確認` 型へ再設計する。

## 設計方針

| 観点      | 方針                                                                  |
| --------- | --------------------------------------------------------------------- |
| 実装前提  | `cleanupCancelledSkillDir` と既存テストを正本として扱う               |
| spec 責務 | code patch 指示書ではなく、回帰確認 task と close-out 仕様書にする    |
| 並列化    | Lane A: skill準拠監査、Lane B: 30思考法分析、Lane C: phase spec 整流  |
| 命名      | 全 phase の artifact 名を `index.md` と `artifacts.json` に一本化する |

## SubAgent lane plan

| Lane | 対象                                                              | 出力                                   |
| ---- | ----------------------------------------------------------------- | -------------------------------------- |
| A    | `task-specification-creator` / `aiworkflow-requirements` 準拠監査 | `PASS/FAIL` 差分一覧                   |
| B    | 30思考法レビュー                                                  | 改善優先順位と破棄判断                 |
| C    | 仕様書再構成                                                      | phase spec と artifact registry の整流 |

## 検証導線

1. `SkillCreatorService.ts` と `SkillCreatorService.test.ts` を差分確認する
2. phase spec の命名と成果物パスを canonical 化する
3. Phase 11 を `NON_VISUAL code task` 用テンプレートへ寄せる
4. Phase 12 で Step 1-A〜1-C / Step 2 / mandatory 5 tasks を固定する

## 依存関係整合

| 依存          | 理由                                                        |
| ------------- | ----------------------------------------------------------- |
| Phase 1 → 2   | classification と artifact canonical が確定してから設計する |
| Phase 2 → 3   | 30思考法レビューで設計方針妥当性を確認する                  |
| Phase 10 → 11 | final-review-result が代替証跡の入力になる                  |
| Phase 11 → 12 | manual-test-result が NON_VISUAL close-out の根拠になる     |

## 成果物

| 成果物             | パス                                    |
| ------------------ | --------------------------------------- |
| solution design    | `outputs/phase-2/solution-design.md`    |
| subagent lane plan | `outputs/phase-2/subagent-lane-plan.md` |
| validation path    | `outputs/phase-2/validation-path.md`    |

## 完了条件

- [ ] 回帰確認型 task への転換方針が明記されている
- [ ] lane plan が定義されている
- [ ] validation path が定義されている
- [ ] 依存関係整合が説明されている
