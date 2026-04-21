# Phase 4: テスト仕様書

## タスクID: TASK-RALLY-001

## テスト方針

dead code 削除タスクのため、新規テストを追加するよりも「削除対象への参照が残っていないこと」と「既存契約が維持されること」の targeted 検証を優先する。

## テストシナリオと検証コマンド

| シナリオ                                                          | 期待結果       | 優先度 | 対応AC      |
| ----------------------------------------------------------------- | -------------- | ------ | ----------- |
| SkillLifecyclePanelの既存テストが全通過                           | テストグリーン | 必須   | AC-3        |
| typecheck がエラーなし                                            | コンパイル通過 | 必須   | AC-3        |
| lint がエラーなし                                                 | ESLint通過     | 必須   | AC-4        |
| dead code参照が存在しない（`_handleSubmitWorkflowInput`）         | grep結果が空   | 必須   | AC-5        |
| dead code参照が存在しない（SkillLifecyclePanel.tsx内のstate変数） | grep結果が空   | 必須   | AC-2, AC-2b |

## targeted run コマンド

```bash
# dead code 参照残りの確認（ソースコードのみ対象）
rg -n "_handleSubmitWorkflowInput|selectedOptionId|textAnswer|secretAnswer|confirmAnswer" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# テストコード内にdead codeへの参照がないか確認（SkillLifecyclePanelのstateとして）
# 注意: selectedOptionId等はIPCペイロードのプロパティとしても存在するため、SkillLifecyclePanel.tsx内のみを対象とする

# SkillLifecyclePanelに関連するテストのみ実行
pnpm --filter @repo/desktop test -- --reporter=verbose SkillLifecyclePanel

# typecheck
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

## full run コマンド（補助）

```bash
pnpm --filter @repo/desktop test -- --reporter=verbose
```

## AC-検証コマンド対応表

| AC    | 検証コマンド                                                                                                                             | 期待結果             |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| AC-1  | `grep -n "_handleSubmitWorkflowInput" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | 空（0件）            |
| AC-2  | `grep -n "selectedOptionId\|textAnswer\|secretAnswer\|confirmAnswer" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 空（0件）            |
| AC-2b | AC-2と同様（companion useEffectも含む）                                                                                                  | 空（0件）            |
| AC-3  | `pnpm --filter @repo/desktop typecheck`                                                                                                  | エラーなし           |
| AC-4  | `pnpm --filter @repo/desktop lint`                                                                                                       | エラーなし           |
| AC-5  | `grep -rn "_handleSubmitWorkflowInput" apps/ packages/`                                                                                  | coverage/HTML以外0件 |

## targeted / full run 切替条件

| 条件                  | 実行範囲                                |
| --------------------- | --------------------------------------- |
| dead code 削除直後    | targeted run（SkillLifecyclePanelのみ） |
| typecheck/lint 通過後 | full run（全パッケージ）                |
| CI/Phase 9品質保証時  | full run                                |

## 完了確認

- [x] dead code 参照の静的確認コマンドを定義した
- [x] targeted run と全件実行の切替条件を確定した
- [x] AC-1〜AC-5 / AC-2b と検証コマンドの対応を固定した
