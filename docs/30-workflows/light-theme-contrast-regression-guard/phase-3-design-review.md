# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 |
| Phase      | 3                                                  |
| Phase名    | 設計レビュー                                       |
| ステータス | not_started                                        |
| 前提Phase  | Phase 1, Phase 2                                   |
| 後続Phase  | Phase 4                                            |

## 目的

guard 設計が過不足なく、他 2 タスクを支えられるかをレビューする。

## 実行タスク

- タスク1: screenshot matrix 妥当性確認
- タスク2: audit / evidence policy 妥当性確認
- タスク3: ゲート判定

### レビュー観点

| 観点         | 判定基準                                           |
| ------------ | -------------------------------------------------- |
| 代表性       | 4 画面で今回問題の大半を再現できる                 |
| audit 有効性 | hardcoded drift と missing token drift を拾える    |
| 運用性       | current/baseline 分離が実務で使える                |
| 依存整合     | token task / migration task と矛盾しない           |
| ユーザー方針 | SubAgent、並列条件、commit/PR 禁止が記録されている |

### 判定

| 判定  | 条件                                         | 次アクション     |
| ----- | -------------------------------------------- | ---------------- |
| PASS  | 全観点 OK                                    | Phase 4 へ進む   |
| MINOR | 微修正のみ                                   | 修正後に Phase 4 |
| MAJOR | representative / audit / evidence 設計に欠落 | Phase 2 へ戻る   |

## 参照資料

| 参照資料       | パス                                                                       | 説明 |
| -------------- | -------------------------------------------------------------------------- | ---- |
| Phase 1 成果物 | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-1/` | 要件 |
| Phase 2 成果物 | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-2/` | 設計 |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                        | 内容       |
| -------------------- | --------------------------------------------------------------------------- | ---------- |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質観点   |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | 再利用知見 |

## 統合テスト連携

| 観点            | 連携内容                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------ |
| Gate to test    | PASS/MINOR になった screenshot / audit / evidence policy のみを Phase 4 へ渡す             |
| Dependency gate | token foundation / shared migration との整合が崩れる場合は Phase 2 へ戻す                  |
| Evidence        | `design-review-result.md` に representative 4 画面と current/baseline 判定ルールを固定する |

## 成果物

| 成果物               | パス                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| design-review-result | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-3/design-review-result.md` |

## 完了条件

- [ ] screenshot / audit / evidence policy がレビュー済みである
- [ ] PASS または MINOR 判定が記録されている
- [ ] Phase 4 以降の実行条件が明記されている

## 次Phase

Phase 4: テスト作成
