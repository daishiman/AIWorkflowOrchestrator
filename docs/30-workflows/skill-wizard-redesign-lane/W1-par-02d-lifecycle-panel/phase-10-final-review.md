# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 10                                                       |
| Phase名    | 最終レビュー                                             |
| タスクID   | UT-SKILL-WIZARD-W1-par-02d                               |
| 機能名     | SkillLifecyclePanel テキストエリア削除・ウィザード遷移化 |
| 前提Phase  | Phase 9: QA                                              |
| 次Phase    | Phase 11: 手動テスト                                     |
| ステータス | pending                                                  |
| 作成日     | 2026-04-07                                               |

## 目的

Phase 1〜9 の全成果物を総合的にレビューし、手動テストおよび PR 準備（blocked）への通過判定を行う。
あわせて、Phase 3 で適用した 30 思考法の結論が Phase 10 の判定と矛盾しないかを確認する。

## 実行タスク

### Task 1: 要件充足の最終確認

Phase 1 の要件定義に対する充足状況を確認する。

| 要件ID | 要件内容                                                    | 実装状況 | 確認方法                                                 |
| ------ | ----------------------------------------------------------- | -------- | -------------------------------------------------------- |
| FR-01  | `onOpenSkillWizard: () => void` を Props に追加する         | -        | インターフェース定義の確認                               |
| FR-02  | ウィザードボタンクリックで onOpenSkillWizard を呼び出す     | -        | クリックテストの確認                                     |
| FR-03  | 旧テキストエリアが DOM に存在しなくなる                     | -        | queryByTestId("skill-lifecycle-request-input") が null   |
| FR-04  | 旧「スキルを生成する」ボタンが DOM に存在しなくなる         | -        | queryByTestId("skill-lifecycle-create-button") が null   |
| FR-05  | 旧「方針を決める」ボタンが DOM に存在しなくなる             | -        | queryByTestId("skill-lifecycle-prepare-button") が null  |
| FR-06  | data-testid="skill-lifecycle-open-wizard-button" を付与する | -        | getByTestId("skill-lifecycle-open-wizard-button") の存在 |

### Task 2: 変更最小化原則の最終確認

このタスクの「最小変更」原則が守られているかを最終確認する。

| 確認項目                                             | 確認結果 |
| ---------------------------------------------------- | -------- |
| 「2. スキルを確認する」以降のセクションが無変更      | -        |
| `onClose` Props が保持されている                     | -        |
| `lifecycleButtonStyles` 等の既存定数が保持されている | -        |
| 変更行数が最小限に抑えられている                     | -        |

### Task 3: コード品質の最終確認

```bash
pnpm --filter @repo/desktop vitest run -- SkillLifecyclePanel --coverage
pnpm --filter @repo/desktop tsc --noEmit
pnpm --filter @repo/desktop eslint apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### Task 4: 設計との整合性確認

Phase 2 の設計書と最終実装を比較し、乖離がないかチェックする。

| 設計項目                     | 設計値                               | 実装値 | 一致 |
| ---------------------------- | ------------------------------------ | ------ | ---- |
| 追加Props                    | `onOpenSkillWizard: () => void`      | -      | -    |
| ウィザードボタン data-testid | `skill-lifecycle-open-wizard-button` | -      | -    |
| セクション見出し             | 「1. スキルを作成する」              | -      | -    |
| ボタンスタイル               | `lifecycleButtonStyles.primary`      | -      | -    |

### Task 5: 30思考法の総括

- Phase 3 の 7 群レビューと Phase 10 の最終判定が一致していることを確認する
- 変更の主張・証跡・設計・テストのいずれにも矛盾がないことを確認する
- 30 思考法の適用結果を `outputs/phase-10/final-review-result.md` に要約する

### Task 6: 最終レビュー判定

| 判定基準                       | 結果 |
| ------------------------------ | ---- |
| 全要件が充足されている         | -    |
| 変更最小化原則が守られている   | -    |
| 全テストがpassしている         | -    |
| カバレッジ目標値を達成している | -    |
| 型エラー・Lintエラーなし       | -    |
| 設計との整合性あり             | -    |
| 30思考法の総括が一貫している   | -    |

**最終判定**: 承認 / 要修正

## 参照資料

| 資料名     | パス                              | 説明         |
| ---------- | --------------------------------- | ------------ |
| 要件定義書 | `outputs/phase-1/requirements.md` | 要件充足確認 |
| 設計書     | `outputs/phase-2/design.md`       | 整合性確認   |
| QAレポート | `outputs/phase-9/qa-report.md`    | 品質確認     |

## 成果物

| 成果物           | パス                                      | 説明                       |
| ---------------- | ----------------------------------------- | -------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 要件充足・判定・残課題一覧 |

## 完了条件

- [ ] 全要件（FR-01〜FR-06）の充足状況が確認されている
- [ ] 変更最小化原則の確認が完了している
- [ ] 最終テスト・型チェック・Lintが全て通過している
- [ ] 設計との整合性が確認されている
- [ ] 30思考法の総括が記録されている
- [ ] 最終判定（承認 / 要修正）が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 11: 手動テスト](./phase-11-manual-test.md)
