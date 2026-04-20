# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| Phase      | 1                                                    |
| タスクID   | TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001               |
| タスク種別 | NON_VISUAL code task                                 |
| 目的       | 既存実装の差分確認・回帰確認に耐える仕様へ再定義する |

## Phase 1 で固定する一次結論

| 観点               | 結論                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| 真の論点           | 未実装 bugfix ではなく、既存 cleanup 実装を正しく説明・検証できる task spec へ戻すこと          |
| 依存関係・責務境界 | 実コードの責務は `SkillCreatorService`、回帰根拠は既存テスト、仕様責務は workflow docs          |
| 価値とコスト       | 高価値なのは close-out 再利用性の確保。コストは spec 群の再構成であり、コード実装コストではない |
| 改善優先順位       | artifacts parity → task classification → Phase 11/12 → 命名統一                                 |
| 4条件評価          | 初期状態は 4条件すべて FAIL。Phase 1 で修正対象を確定する                                       |

## P50 チェック

### 実コード確認

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
  - `skillDirExistedBefore` を保持している
  - `catch` で `cleanupCancelledSkillDir(...)` を呼ぶ
  - `finally` では `currentAbortController` のリセットのみ行う
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`
  - `SC-CANCEL-001`: cancel 時に `fs.rm(...)` が呼ばれる
  - `SC-CANCEL-002`: 既存 dir では `fs.rm(...)` が呼ばれない

### 判断

- 本 task は新規コード設計よりも `既存実装との差分確認タスク` として扱う
- `finally + createdByThisRun` 前提の古い仕様は採用しない

## task classification【必須】

| 項目                 | 判定   | 理由                                                          |
| -------------------- | ------ | ------------------------------------------------------------- |
| UI task              | いいえ | Renderer 変更がない                                           |
| docs-only            | いいえ | 対象はコード behavior の回帰確認であり、spec_created ではない |
| NON_VISUAL code task | はい   | 変更の主対象は Main Process の service とその検証             |

## 受入基準

| ID   | 基準                                                                     | 検証方法       |
| ---- | ------------------------------------------------------------------------ | -------------- |
| AC-1 | 仕様書が `cleanupCancelledSkillDir` ベースの実装実態に一致する           | diff review    |
| AC-2 | 作業開始時点で既存だったディレクトリを削除しない前提が明記される         | code/spec 照合 |
| AC-3 | `task-specification-creator` の mandatory artifacts と phase gate が揃う | spec review    |
| AC-4 | `NON_VISUAL code task` として Phase 11/12 の代替証跡方針が整合する       | phase review   |
| AC-5 | `artifacts.json` と `outputs/artifacts.json` の parity が成立する        | file check     |

## Canonical Artifacts【必須】

| 成果物        | パス                                              |
| ------------- | ------------------------------------------------- |
| 要件定義      | `outputs/phase-1/requirements-definition.md`      |
| 実装監査      | `outputs/phase-1/current-implementation-audit.md` |
| artifact 一覧 | `outputs/phase-1/artifact-canonical-list.md`      |

## 参照資料

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`
- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`

## 完了条件

- [ ] P50 チェック結果を記録した
- [ ] task classification を確定した
- [ ] AC-1 から AC-5 を確定した
- [ ] artifact canonical 一覧を固定した
- [ ] Phase 2 に渡す真の論点と優先順位を確定した
