# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 1                               |
| タスクID   | TASK-SC-SHARED-TYPE-PROMOTE-001 |
| 機能名     | shared-type-promote             |
| 前提Phase  | -                               |
| 後続Phase  | Phase 2（昇格必要の場合）       |
| 作成日     | 2026-04-16                      |
| ステータス | completed                       |

## 目的

`StructurePlanJson` インタフェースの**実装コード参照箇所**を棚卸しし、
1箇所のみならその場でローカル維持・クローズ、2箇所以上なら `@repo/shared/types` への昇格へ進む。

> 注: 参照箇所数の判定対象は `apps/` と `packages/` の実装コードのみ。`docs/` や `.claude/` 内の言及はカウントしない。

判断基準:

- 1箇所のみ → ローカル定義維持・このタスクを即クローズ
- 2箇所以上 → 昇格実施（Phase 2以降に進む）

## 実行タスク

- [ ] P50チェック: `StructurePlanJson` の実装コード参照箇所を調査（`grep -rn "StructurePlanJson" apps/ packages/`）
- [ ] 参照箇所が 1 箇所のみなら、その場でローカル維持・クローズを記録する
- [ ] 2 箇所以上なら、`packages/shared/src/types/skillCreator.ts` への昇格案を記録する
- [ ] `packages/shared/src/types/index.ts` / `packages/shared/index.ts` の barrel 整合を確認する
- [ ] 受け入れ基準 AC-1〜AC-5 を検証可能な形で固定
- [ ] タスク分類宣言: 本タスクは **リファクタリングタスク / NON_VISUAL**

## 参照資料

| 資料名                                    | パス                                                                     | 用途                               |
| ----------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------- |
| SkillCreatorService.ts                    | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`            | StructurePlanJson ローカル定義確認 |
| packages/shared/src/types/skillCreator.ts | `packages/shared/src/types/skillCreator.ts`                              | 昇格先候補の型定義確認             |
| packages/shared/src/types/index.ts        | `packages/shared/src/types/index.ts`                                     | `@repo/shared/types` barrel 確認   |
| packages/shared/index.ts                  | `packages/shared/index.ts`                                               | root barrel 整合確認               |
| @repo/shared/types                        | `@repo/shared/types`                                                     | 昇格後の正規 import パス確認       |
| GitHub Issue #2182                        | [#2182](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2182) | 要件原本・苦戦箇所参照             |
| TASK-SC-07 苦戦箇所 C-4                   | `.claude/skills/aiworkflow-requirements/references/`                     | PlanResult型二重定義の教訓参照     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料   | パス                                                 | 内容                     |
| ---------- | ---------------------------------------------------- | ------------------------ |
| 型定義仕様 | `.claude/skills/aiworkflow-requirements/references/` | shared型定義パターン確認 |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# StructurePlanJson の全参照箇所を調査
grep -rn "StructurePlanJson" apps/
grep -rn "StructurePlanJson" packages/

# SkillCreatorService.ts での定義確認
grep -n "interface StructurePlanJson" apps/desktop/src/main/services/skill/SkillCreatorService.ts

# barrel 候補の確認
sed -n '1,220p' packages/shared/src/types/index.ts
sed -n '1,240p' packages/shared/index.ts
```

### 1. 参照箇所棚卸し

棚卸し結果を `outputs/phase-1/reference-inventory.md` に記録する。

記録フォーマット:

```markdown
## StructurePlanJson 参照箇所棚卸し

| ファイル                                                    | 行番号 | 用途                 |
| ----------------------------------------------------------- | ------ | -------------------- |
| apps/desktop/src/main/services/skill/SkillCreatorService.ts | L??    | インターフェース定義 |
| ...                                                         | ...    | ...                  |

## 判断結果

- 参照箇所数: X箇所
- 昇格判断: [1箇所のみならローカル維持・即クローズ / 2箇所以上なら昇格実施]
- 理由: ...
```

### 2. 受け入れ基準の定義

以下の AC を `outputs/phase-1/acceptance-criteria.md` に固定する:

**AC-1 (棚卸し完了)**: `StructurePlanJson` の全参照箇所が `reference-inventory.md` に記録されていること。
**AC-2 (初手判断)**: 参照箇所が 1 箇所のみなら、その場でローカル維持・クローズを記録し、Phase 2 以降へ進まないこと。
**AC-3 (昇格条件)**: 参照箇所が 2 箇所以上なら、`packages/shared/src/types/skillCreator.ts` への昇格判断が理由とともに記録されること。
**AC-4 (Single Source of Truth)**: 昇格実施の場合、ローカル定義が削除されており、`StructurePlanJson` の定義が `packages/shared/src/types/skillCreator.ts` のみに存在すること。
**AC-5 (テスト全PASS)**: 昇格実施の場合、既存の全テストが PASS すること。昇格しない場合は変更なし。

## 統合テスト連携

| 観点                  | 内容                                                                          |
| --------------------- | ----------------------------------------------------------------------------- |
| 型参照確認            | `StructurePlanJson` を使用する全ファイルで型エラーが発生しないこと            |
| ビルド順序            | `@repo/shared` → `@repo/desktop` の順でビルドが成功すること（昇格実施の場合） |
| import シャドウイング | ローカル定義と shared 定義が共存しないこと（昇格実施の場合）                  |

## 多角的チェック観点（AIが判断）

- **早期昇格リスク**: TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 が未完了の場合、参照箇所が増える前に棚卸しを実施しても意味がない。完了状態を確認してから実施する。
- **シャドウイングリスク**: 過去の C-4 問題（PlanResult 型の二重定義）を教訓に、昇格時はローカル定義を即時削除すること。
- **ビルド依存**: `@repo/shared` の変更は `@repo/desktop` のビルドに影響するため、ビルド順序を事前確認する。

## サブタスク管理

| サブタスクID | 名称                        | ステータス |
| ------------ | --------------------------- | ---------- |
| T-01-1       | P50チェック・全参照箇所調査 | completed  |
| T-01-2       | 依存タスク完了状態確認      | completed  |
| T-01-3       | 昇格判断・AC定義            | completed  |

## 成果物

| 成果物名                         | パス                                     | 種別         |
| -------------------------------- | ---------------------------------------- | ------------ |
| 参照箇所棚卸し結果・昇格判断記録 | `outputs/phase-1/reference-inventory.md` | ドキュメント |
| 受け入れ基準（AC-1〜AC-5）       | `outputs/phase-1/acceptance-criteria.md` | ドキュメント |

## 完了条件

- [ ] `StructurePlanJson` の全参照箇所が調査・記録されていること（AC-1）
- [ ] 参照箇所が 1 箇所のみの場合、その場でローカル維持・クローズが記録されていること（AC-2）
- [ ] 参照箇所が 2 箇所以上の場合、昇格判断が理由とともに記録されていること（AC-3）
- [ ] `outputs/phase-1/reference-inventory.md` が作成されていること
- [ ] `outputs/phase-1/acceptance-criteria.md` が作成されていること
- [ ] 昇格不要の場合: このタスクをクローズして完了
- [ ] 昇格必要の場合: Phase 2 の設計へ進む

## タスク100%実行確認【必須】

- [ ] P50チェック実施・全参照箇所の調査完了
- [ ] TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 完了状態確認
- [ ] 参照箇所棚卸し結果の記録完了
- [ ] 昇格判断の確定と記録完了
- [ ] AC-1〜AC-5 の定義完了

## 次Phase

- **昇格不要と判断した場合**: タスクをクローズして完了。Phase 2以降は不要。
- **昇格必要と判断した場合**: [Phase 2: 設計](phase-2-design.md)に進む。
- **Phase 1→2 ゲート**: 参照箇所棚卸し結果と昇格判断が記録されるまでPhase 2に進まない。
