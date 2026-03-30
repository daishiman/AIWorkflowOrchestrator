# Phase 4: テスト作成

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 4                            |
| 機能名 | multi-select-user-input-kind |
| 作成日 | 2026-03-29                   |

## 目的

`multi_select` の shared type、engine validation、renderer host を TDD で先行固定し、既存 4 kind の回帰を同時に守る。

## 実行タスク

- shared type の export 変更を検知するテストを定義する
- engine validation の pass / fail ケースを定義する
- renderer checkbox host の描画と submit ケースを定義する
- 既存 4 kind の非破壊回帰ケースを定義する

## 参照資料

| 資料名        | パス                                                                                               | 説明                      |
| ------------- | -------------------------------------------------------------------------------------------------- | ------------------------- |
| Phase 2 設計  | `phase-2-design.md`                                                                                | 詳細設計                  |
| engine test   | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`              | 既存 engine テスト        |
| renderer test | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 既存 question host テスト |

## 実行手順

### テストマトリクス

| ID   | 対象        | 観点                                                                |
| ---- | ----------- | ------------------------------------------------------------------- |
| T4-1 | shared type | `SkillCreatorUserInputKind` に `multi_select` が含まれる            |
| T4-2 | engine      | `selectedOptionIds` が空配列なら fail する                          |
| T4-3 | engine      | 未知 option id を含むと fail する                                   |
| T4-4 | engine      | 既知 option id 配列なら pass する                                   |
| T4-5 | renderer    | checkbox 群が request options を描画する                            |
| T4-6 | renderer    | toggle 後に `selectedOptionIds` が submit payload へ入る            |
| T4-7 | regression  | `single_select` / `free_text` / `secret` / `confirm` が非破壊である |

## 統合テスト連携

- Phase 6 で edge case を追加するため、この matrix を baseline とする
- Phase 7 で AC との coverage 対応表へ転記する

## 成果物

| 成果物         | パス                             | 説明             |
| -------------- | -------------------------------- | ---------------- |
| テスト作成仕様 | `phase-4-test-creation.md`       | テスト対象と観点 |
| test matrix    | `outputs/phase-4/test-matrix.md` | ケース一覧       |

## 完了条件

- [ ] shared type、engine、renderer の 3 系統テストが定義されている
- [ ] 回帰ケースが定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
