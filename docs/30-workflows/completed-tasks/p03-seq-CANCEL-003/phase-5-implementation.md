# Phase 5: 実装

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 5                                 |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 4                           |
| 後続Phase  | Phase 6                           |
| 作成日     | 2026-04-15                        |
| ステータス | pending                           |

## 目的

既存実装が AC を満たしているかを差分確認し、mismatch がある場合のみ最小補修を行う。

## 背景

現ブランチでは `currentAbortController`、`cancelCurrentOperation()`、`SKILL_CREATOR_CANCEL` handler が既に存在する可能性が高い。したがってこの Phase は新規実装フェーズではなく、現実装確認と必要最小限の修正に再定義する。

## 実行タスク

### タスク0: 差分確認

**目的**: AC と現実装の差分を洗い出す。

**実行手順**:

1. `SkillCreatorService.ts` で `AbortController` の保持、abort、finally reset を確認する。
2. `skillCreatorHandlers.ts` で `SKILL_CREATOR_CANCEL` の register/unregister を確認する。
3. AC と一致しない点だけを mismatch として記録する。

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

### タスク1: 最小補修

**目的**: mismatch がある場合だけ補修する。

**実行手順**:

1. 修正対象ファイルを `新規作成` と `修正` に分けて記録する。
2. mismatch を解消する最小差分だけを適用する。
3. 補修後に Phase 4 の targeted command suite を再実行する。

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

### タスク2: 回帰確認

**目的**: 補修の有無にかかわらず回帰確認を完了する。

**実行手順**:

1. service test と handler test を実行する。
2. `pnpm --filter @repo/desktop typecheck` を実行する。
3. 関連既存テストも追加で実行する。

**期待される成果物**:

- `outputs/phase-5/implementation-summary.md`

## 参照資料

| 参照資料                       | パス                                                                                | 内容                   |
| ------------------------------ | ----------------------------------------------------------------------------------- | ---------------------- |
| Phase 4 仕様                   | `docs/30-workflows/p03-seq-CANCEL-003/phase-4-test-creation.md`                     | targeted command suite |
| service 実装                   | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                       | 差分確認対象           |
| handler 実装                   | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                 | 差分確認対象           |
| system spec 正本               | `.claude/skills/aiworkflow-requirements/SKILL.md`                                   | current fact 反映判断  |
| テスト設計                     | `outputs/phase-4/test-design.md`                                                    | Phase 4 成果物         |
| SkillCreatorService回帰テスト  | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts` | Phase 4 成果物         |
| skillCreatorHandlers回帰テスト | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers-cancel.test.ts`           | Phase 4 成果物         |

## 成果物

| 成果物                            | パス                                                          | 内容                                      |
| --------------------------------- | ------------------------------------------------------------- | ----------------------------------------- |
| 差分確認サマリー                  | `outputs/phase-5/implementation-summary.md`                   | mismatch 一覧、修正有無、実行コマンド結果 |
| SkillCreatorService 実装確認対象  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 差分確認または最小補修                    |
| skillCreatorHandlers 実装確認対象 | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`           | 差分確認または最小補修                    |

## 統合テスト連携【必須】

| 判定項目                            | 基準 | 結果    |
| ----------------------------------- | ---- | ------- |
| AC との差分が明記されている         | 完了 | pending |
| mismatch がある場合のみ補修している | 完了 | pending |
| targeted regression が完了している  | 完了 | pending |

## 完了条件

- [ ] 現実装との差分を確認している
- [ ] 修正対象ファイル一覧を記録している
- [ ] mismatch がある場合のみ最小補修している
- [ ] targeted regression を実行している
