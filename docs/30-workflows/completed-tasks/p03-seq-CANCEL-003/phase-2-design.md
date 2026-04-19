# Phase 2: 設計

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 2                                 |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 1                           |
| 後続Phase  | Phase 3                           |
| 作成日     | 2026-04-15                        |
| ステータス | pending                           |

## 目的

既実装差分確認を前提に、Main service / IPC handler / Renderer 調査の責務境界、検証順序、補修条件を設計する。

## 背景

この task は `SkillCreatorService.ts` と `skillCreatorHandlers.ts` という共有書き込み面を持つため、本来は直列実行が前提である。一方、現ブランチでは既実装が存在するため、実装作業より「仕様との差分確認」と「不足テストの設計」を主目的に再構成する必要がある。

## 実行タスク

### タスク0: 責務境界の設計

**目的**: CANCEL-003 単体完了と CANCEL-004 依存事項を分離する。

**実行手順**:

1. Main 層の責務を `AbortController` 管理と IPC handler 登録に限定する。
2. Renderer からの発火完了は CANCEL-004 依存として別扱いにする。
3. 「層別完了」と「E2E完了」を別の判定として定義する。

**期待される成果物**:

- `outputs/phase-2/design.md`

### タスク1: 差分確認フローの設計

**目的**: 実装の有無ではなく、仕様準拠と回帰確認を中心に据える。

**実行手順**:

1. Phase 4 は targeted test 設計に置き換える。
2. Phase 5 は新規実装ではなく差分確認・最小補修に置き換える。
3. mismatch が見つかった場合だけ補修へ遷移する条件を明記する。

**期待される成果物**:

- `outputs/phase-2/design.md`

### タスク2: Phase 11/12 の NON_VISUAL 設計

**目的**: screenshot 前提の drift を防ぐ。

**実行手順**:

1. Phase 11 の primary evidence を `TASK-SW-CANCEL-003-manual-test-report.md` に集約する。
2. `manual-test-checklist.md` と `discovered-issues.md` を補助成果物として定義する。
3. Phase 12 では canonical 6成果物と spec update judgment を必須化する。

**期待される成果物**:

- `outputs/phase-2/design.md`

## 参照資料

| 参照資料                    | パス                                                                                  | 内容                          |
| --------------------------- | ------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 11 テンプレート       | `.claude/skills/task-specification-creator/references/phase-template-phase11.md`      | NON_VISUAL 設計               |
| Phase 12 テンプレート       | `.claude/skills/task-specification-creator/references/phase-template-phase12.md`      | 6成果物と validation          |
| Phase 13 テンプレート       | `.claude/skills/task-specification-creator/references/phase-template-phase13.md`      | blocked Phase 骨格            |
| artifact 命名規則           | `.claude/skills/task-specification-creator/references/artifact-naming-conventions.md` | outputs 命名と artifacts.json |
| system spec 正本            | `.claude/skills/aiworkflow-requirements/SKILL.md`                                     | Step 2 更新判断               |
| 要件定義書                  | `outputs/phase-1/requirements-definition.md`                                          | Phase 1 成果物                |
| 受け入れ基準                | `outputs/phase-1/acceptance-criteria.md`                                              | Phase 1 成果物                |
| AbortSignal利用調査レポート | `outputs/phase-1/abort-signal-usage-report.md`                                        | Phase 1 成果物                |

## 成果物

| 成果物       | パス                        | 内容                                             |
| ------------ | --------------------------- | ------------------------------------------------ |
| 差分確認設計 | `outputs/phase-2/design.md` | 責務境界、判定フロー、補修条件、Phase 11/12 方針 |

## 統合テスト連携【必須】

| 判定項目                                         | 基準 | 結果    |
| ------------------------------------------------ | ---- | ------- |
| Main 層完了と E2E 完了が分離されている           | 完了 | pending |
| 既実装差分確認モードへの切替条件が定義されている | 完了 | pending |
| Phase 11/12 の NON_VISUAL 方針が定義されている   | 完了 | pending |

## 完了条件

- [ ] 責務境界を設計している
- [ ] 差分確認フローと補修条件を設計している
- [ ] Phase 11/12 の NON_VISUAL 方針を設計している
- [ ] outputs に設計結果を記録している
