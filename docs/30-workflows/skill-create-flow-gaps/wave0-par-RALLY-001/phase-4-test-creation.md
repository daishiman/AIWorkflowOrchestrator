# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 4                                       |
| タスクID   | TASK-RALLY-001                          |
| 機能名     | skill-lifecycle-panel-dead-code-removal |
| 前提Phase  | Phase 3                                 |
| 後続Phase  | Phase 5                                 |
| 作成日     | 2026-04-21                              |
| ステータス | pending                                 |

## 目的

dead code 削除のためのテスト方針を確定し、既存テストが引き続き通過することを確認する計画を立てる。

## テスト方針

dead code 削除のため、新規テストの作成は原則不要。以下の既存テストが引き続き通過することを確認する。

```bash
# 既存テストの通過確認
pnpm --filter @repo/desktop test -- --reporter=verbose
```

## 確認ポイント

- `SkillLifecyclePanel` に関連する既存スナップショットテストがある場合、削除後も通過すること
- TypeScript の型エラーが発生していないこと
- `_handleSubmitWorkflowInput` / 旧 state 変数を参照するテストコードが存在しないことを確認する

```bash
# テストコード内にdead codeへの参照がないか確認
grep -rn "_handleSubmitWorkflowInput\|selectedOptionId\|textAnswer\|secretAnswer\|confirmAnswer" \
  apps/desktop/src/**/__tests__/
```

## テストシナリオ

| シナリオ                                    | 期待結果       | 優先度 |
| ------------------------------------------- | -------------- | ------ |
| SkillLifecyclePanel の既存テストが全通過    | テストグリーン | 必須   |
| typecheck がエラーなし                      | コンパイル通過 | 必須   |
| lint がエラーなし                           | ESLint通過     | 必須   |
| dead codeへの参照がテストコードに存在しない | grep結果が空   | 必須   |

## 参照資料

| 資料名         | パス                                    | 用途           |
| -------------- | --------------------------------------- | -------------- |
| 削除手順設計書 | `outputs/phase-2/deletion-procedure.md` | 検証対象の確認 |
| ゲート判定     | `outputs/phase-3/gate-decision.md`      | PASS確認       |

## 成果物

| 成果物                   | パス                                           | 説明                              |
| ------------------------ | ---------------------------------------------- | --------------------------------- |
| テスト仕様書             | `outputs/phase-4/test-specification.md`        | 既存テスト確認計画                |
| テストコード参照確認結果 | `outputs/phase-4/dead-code-reference-check.md` | テストコード内のdead code参照確認 |

## 完了条件

- [ ] 既存テストの確認計画を作成した
- [ ] テストコード内にdead codeへの参照がないことを確認した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 5: 実装
