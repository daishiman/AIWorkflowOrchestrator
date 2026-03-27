# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                                                |
| ------ | ----------------------------------------------------------------- |
| Phase  | 4                                                                 |
| 機能名 | task-imp-runtime-policy-centralization-implementation-closure-001 |
| 作成日 | 2026-03-27                                                        |

## 目的

centralization close-out を証明する unit / integration / regression test の最小セットを先に固定し、実装と同時に検証可能な状態を作る。

## 実行タスク

- main ipc consumer 単体テストケースを定義する
- facade / resolver / legacy route の回帰ケースを定義する
- preload / shared transport の契約テストを定義する
- cleanup task 着手判定用の確認項目を定義する

## 参照資料

| 資料名  | パス                       | 説明               |
| ------- | -------------------------- | ------------------ |
| Phase 1 | `phase-1-requirements.md`  | AC と scope        |
| Phase 2 | `phase-2-design.md`        | wiring / sync plan |
| Phase 3 | `phase-3-design-review.md` | 着手ゲート         |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容                      |
| ----------------------- | ------------------------------------------------------------------------------ | ------------------------- |
| quality requirements    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | テスト品質基準            |
| api ipc core            | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`     | IPC 契約テスト基準        |
| lessons learned current | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` | same-wave test drift 防止 |

## 成果物

| 成果物      | パス                             | 説明                                 |
| ----------- | -------------------------------- | ------------------------------------ |
| test matrix | `outputs/phase-4/test-matrix.md` | test case 一覧、対象ファイル、期待値 |

## 統合テスト連携

- `skillHandlers.ts` / `agentHandlers.ts` / `aiHandlers.ts` / `creatorHandlers.ts` は handler 単位で必ず 1 ケース以上持つ。
- `RuntimeSkillCreatorFacade.execute()` は integrated / terminal_handoff / legacy cleanup guard の 3 系統を分けて記述する。
- preload / shared 契約は type drift を防ぐため contract test を 1 セット以上含める。

## 完了条件

- [ ] unit / integration / regression の区分がある
- [ ] 4 surface と facade / preload / shared の対象が網羅されている
- [ ] cleanup 条件確認ケースが分離されている
- [ ] 実装前に必要な期待値が文章で固定されている
- [ ] **本Phase内の全タスクを100%実行完了**
