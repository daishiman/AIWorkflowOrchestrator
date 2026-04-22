# Phase 1: 要件要約

## メタ情報

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| Phase    | 1                                               |
| タスクID | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 |
| 作成日   | 2026-04-21                                      |

## FR（機能要件）

| ID   | 要件                                                                  | 根拠                                                                                              |
| ---- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| FR-1 | 対象スキル群の 3組6フィールド方言を `snake_case v1` に統一する        | `currentLevel→current_level`, `totalUsageCount→total_usage_count`, `lastEvaluated→last_evaluated` |
| FR-2 | writer → fixture → reader → desktop test の順序で統一を実施する       | 伝播リスクを最小化するため                                                                        |
| FR-3 | `.claude/skills` 正本更新後、`.agents/skills` mirror を同期する       | root 契約を維持するため                                                                           |
| FR-4 | `apps/desktop` fixture / test / `SkillScanner` の consumer を壊さない | desktop 側 consumer が silent break の最終検知点になるため                                        |

## NFR（非機能要件）

| ID    | 要件                                                                    | 根拠             |
| ----- | ----------------------------------------------------------------------- | ---------------- |
| NFR-1 | grep / diff / test が対象ファイル限定で再実行可能な形で記録される       | 証跡の再現性担保 |
| NFR-2 | Phase 11 / 12 の成果物名が artifacts.json と一致する                    | 整合性担保       |
| NFR-3 | `implementation_mode` は `new` / `verify_existing` のいずれかに限定する | template 準拠    |

## AC（受け入れ基準）

| ID   | 基準                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------- |
| AC-1 | 対象3組6フィールドが正本・mirror・fixture・reader・desktop consumer で一貫して `snake_case v1` へ統一される   |
| AC-2 | `.claude/skills` と `.agents/skills` の対象差分が bit-for-bit で一致する                                      |
| AC-3 | 対象限定の旧方言残存確認、回帰テスト、依存ゲートが全て明示される                                              |
| AC-4 | Phase 11 は `manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md` の3点セットで閉じる |
| AC-5 | Phase 12 は必須6成果物と `artifacts.json` / `outputs/artifacts.json` の整合が取れている                       |

## 依存ゲート確認

| 依存タスク                                       | 状態                                               | Phase 5 着手可否 |
| ------------------------------------------------ | -------------------------------------------------- | ---------------- |
| UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 | 完了 (`docs/30-workflows/completed-tasks/` に存在) | **着手可能**     |

## 正本root / mirror root

- 正本root: `.claude/skills`
- mirror root: `.agents/skills`
- 方向: `.claude/skills` → `.agents/skills`（一方向同期）

## 完了条件チェック

- [x] AC-1〜AC-5 を requirement として固定した
- [x] 正本root / mirror root を明文化した
- [x] 依存ゲートを明文化した
- [x] `implementation_mode: new` を固定した
