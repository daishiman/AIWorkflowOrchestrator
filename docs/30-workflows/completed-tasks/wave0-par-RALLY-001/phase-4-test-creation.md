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
| ステータス | completed                               |

## 目的

dead code 削除のためのテスト方針を確定し、既存テストが引き続き通過することを確認する計画を立てる。

## 実行タスク

- タスク1: dead code 参照残りを検出する static check を定義する
- タスク2: targeted run と full run の使い分けを決める
- タスク3: AC-1〜AC-5 / AC-2b と検証コマンドの対応を固定する

## テスト方針

dead code 削除 task のため、新規 UI テストを増やすよりも「削除対象へ参照が残っていないこと」と「既存契約が維持されること」の targeted 検証を優先する。全件実行は補助とし、まず対象に近いチェックを固定する。

```bash
# dead code 参照残りの確認
rg -n "_handleSubmitWorkflowInput|selectedOptionId|textAnswer|secretAnswer|confirmAnswer" \
  apps/desktop/src apps/desktop/test packages

# 既存テストの targeted run（対象ファイル名は Phase 1 調査で確定する）
pnpm --filter @repo/desktop test -- --reporter=verbose SkillLifecyclePanel
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
| 必要なら全件テストに拡張できる              | 追加実行可能   | 推奨   |

## 統合テスト連携

- Phase 5 は本Phaseで確定したコマンド順序に従って実施する
- Phase 6/7 は本Phaseの test matrix を根拠に不足分だけ追加確認する

## 参照資料

| 資料名         | パス                                    | 用途           |
| -------------- | --------------------------------------- | -------------- |
| 削除手順設計書 | `outputs/phase-2/deletion-procedure.md` | 検証対象の確認 |
| ゲート判定     | `outputs/phase-3/gate-decision.md`      | PASS確認       |

## 成果物

| 成果物                   | パス                                           | 説明                              |
| ------------------------ | ---------------------------------------------- | --------------------------------- |
| テスト仕様書             | `outputs/phase-4/test-specification.md`        | targeted run と全件実行の切替条件 |
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
