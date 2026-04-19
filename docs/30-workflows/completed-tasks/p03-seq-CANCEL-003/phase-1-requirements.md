# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 1                                  |
| タスクID   | TASK-SW-CANCEL-003                 |
| 機能名     | skill-creator-cancel-main-handler  |
| 前提Phase  | -（TASK-SW-CANCEL-002 完了が前提） |
| 後続Phase  | Phase 2                            |
| 作成日     | 2026-04-15                         |
| ステータス | pending                            |

## 目的

`SKILL_CREATOR_CANCEL` の Main 層実装について、現ブランチ上の実装有無を確認し、既実装差分確認モードで進めるか、補修実装モードで進めるかを判定する。

## 背景

この workflow は初版では新規実装タスクとして書かれていたが、現ブランチには既に `SkillCreatorService` と `skillCreatorHandlers` の cancel 系コードが存在する可能性が高い。したがって本 task では、実装前提ではなく「現状確認 → 差分確認 → 必要時のみ補修」という流れを明示する。

## 実行タスク

### タスク0: P50チェックと task 種別確定

**目的**: task を `NON_VISUAL` かつ「既実装差分確認」モードとして固定する。

**実行手順**:

1. `SkillCreatorService.ts` と `skillCreatorHandlers.ts` に cancel 系実装があるか確認する。
2. `useCancelGeneration.startGeneration()` の `AbortSignal` 利用箇所を確認する。
3. 既実装ありなら Phase 5 を「差分確認・回帰確認」モードに切り替える。

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-1/abort-signal-usage-report.md`

### タスク1: スコープと非スコープの固定

**目的**: CANCEL-003 の責務境界を、Main 層完了確認に限定する。

**実行手順**:

1. 本 task の責務を `SkillCreatorService` と `skillCreatorHandlers` に限定する。
2. Renderer 側接続と E2E 完了は CANCEL-004 側の責務として明記する。
3. 半作成ディレクトリ cleanup のような別論点を scope 外に分離する。

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`

### タスク2: 受け入れ基準の固定

**目的**: 実装有無ではなく、差分確認で判定できる AC を固定する。

**実行手順**:

1. `currentAbortController` の保持、abort、reset を AC にする。
2. `SKILL_CREATOR_CANCEL` の登録と unregister 対応を AC にする。
3. `AbortSignal` 調査結果を AC に紐づける。
4. targeted test と `typecheck` の実行を AC に含める。

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

## 参照資料

| 参照資料          | パス                                                             | 内容                             |
| ----------------- | ---------------------------------------------------------------- | -------------------------------- |
| Main service 実装 | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`    | cancel 実装の存在確認            |
| IPC handler 実装  | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`              | handler 登録と unregister の確認 |
| Renderer hook     | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`         | `AbortSignal` 利用箇所の確認     |
| 解決策設計書      | `docs/30-workflows/00-task-spec-design-docs/phase-2-solution.md` | CANCEL-003 の設計根拠            |
| 設計レビュー      | `docs/30-workflows/00-task-spec-design-docs/phase-3-review.md`   | scope 補足の根拠                 |
| system spec 正本  | `.claude/skills/aiworkflow-requirements/SKILL.md`                | current fact と仕様更新判断      |

## 成果物

| 成果物                       | パス                                           | 内容                                   |
| ---------------------------- | ---------------------------------------------- | -------------------------------------- |
| 要件定義書                   | `outputs/phase-1/requirements-definition.md`   | scope / non-scope / taskType / P50判定 |
| 受け入れ基準                 | `outputs/phase-1/acceptance-criteria.md`       | AC-1〜AC-6                             |
| AbortSignal 利用調査レポート | `outputs/phase-1/abort-signal-usage-report.md` | consumer 調査と CANCEL-004 境界        |

## 統合テスト連携【必須】

| 判定項目                                           | 基準 | 結果    |
| -------------------------------------------------- | ---- | ------- |
| taskType が `NON_VISUAL` と判定されている          | 完了 | pending |
| 既実装差分確認モードか補修モードかが固定されている | 完了 | pending |
| AC-1〜AC-6 が outputs に記録されている             | 完了 | pending |

## 完了条件

- [ ] P50チェック結果を outputs に記録している
- [ ] `NON_VISUAL` と既実装差分確認モードを明記している
- [ ] スコープと非スコープを固定している
- [ ] AC-1〜AC-6 を確定している
- [ ] `AbortSignal` 調査結果を記録している
