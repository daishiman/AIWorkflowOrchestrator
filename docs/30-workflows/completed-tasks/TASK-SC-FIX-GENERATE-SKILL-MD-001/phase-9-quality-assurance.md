# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 9                                 |
| Phase名    | 品質保証                          |
| 対象機能   | TASK-SC-FIX-GENERATE-SKILL-MD-001 |
| 前提Phase  | Phase 8: リファクタリング         |
| 次Phase    | Phase 10: 最終レビュー            |
| ステータス | pending                           |
| 作成日     | 2026-04-14                        |

## 目的

lint / typecheck / test の全パスを品質ゲートとして確認し、
Phase 10の最終レビューに渡せる状態を整える。

## 実行タスク

### Task 1: lint実行

以下のコマンドを実行し、エラーが0件であることを確認する。

```bash
pnpm --filter @repo/desktop lint
```

- ESLintエラーがないことを確認する
- `finally`節の追加や定数化によるlint警告が発生していないことを確認する
- 警告が残る場合は抑制の是非を判断し、判断結果を記録する

### Task 2: typecheck実行

以下のコマンドを実行し、型エラーが0件であることを確認する。

```bash
pnpm --filter @repo/desktop typecheck
```

- `fs.unlink`の戻り値型・`tmpPath`の型が正しいことを確認する
- `scriptExecutor.execute` の引数型が string[] に適合していることを確認する
- `generateSkillMd`メソッドの戻り値型が変わっていないことを確認する

### Task 3: test実行

以下のコマンドを実行し、全テストがpassすることを確認する。

```bash
pnpm --filter @repo/desktop test
```

- Phase 4で作成したテストがすべてpassすることを確認する
- Phase 6で追加した境界ケーステストがpassすることを確認する
- 既存テストへの回帰がないことを確認する

### Task 4: ブロッカーの洗い出し

- Phase 10に持ち込むべきブロッカーをここで出し切る
- 未解決の懸念事項をPhase 10最終レビューの入力として記録する

## 参照資料

| 資料名               | パス                                                 | 説明             |
| -------------------- | ---------------------------------------------------- | ---------------- |
| 実装記録             | `outputs/phase-5/implementation-record.md`           | 品質ゲートの根拠 |
| リファクタリング記録 | `phase-8-refactoring.md`                             | 品質ゲート対象   |
| 仕様skill            | `.claude/skills/task-specification-creator/SKILL.md` | 準拠基準         |

## 統合テスト連携

- lint / typecheck / test の3コマンドが全PASSであることをPhase 10の入力とする
- Phase 10へ渡すblockerをここで出し切る

## 成果物

| 成果物           | パス                                | 説明           |
| ---------------- | ----------------------------------- | -------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 品質ゲート結果 |

## 完了条件

- [ ] `pnpm --filter @repo/desktop lint` がエラー0件でpassしている
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー0件でpassしている
- [ ] `pnpm --filter @repo/desktop test` が全テストpassしている
- [ ] 実装品質のblockerが整理されている
- [ ] Phase 10に渡すgate材料が揃っている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
