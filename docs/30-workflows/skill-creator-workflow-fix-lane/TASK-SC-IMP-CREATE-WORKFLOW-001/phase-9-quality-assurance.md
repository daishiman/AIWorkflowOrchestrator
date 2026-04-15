# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 9                               |
| Phase名    | 品質保証                        |
| 対象機能   | TASK-SC-IMP-CREATE-WORKFLOW-001 |
| 前提Phase  | Phase 8: リファクタリング       |
| 次Phase    | Phase 10: 最終レビュー          |
| ステータス | pending                         |
| 作成日     | 2026-04-14                      |

## 目的

lint / typecheck / test の全パスを品質ゲートとして確認し、
Phase 10の最終レビューに渡せる状態を整える。
**前提**: タスクA（TASK-SC-FIX-GENERATE-SKILL-MD-001）の修正が完了していること。

## 実行タスク

### Task 1: lintチェック

以下のコマンドを実行し、ESLintエラーが0件であることを確認する:

```bash
pnpm --filter @repo/desktop lint
```

- `SkillCreatorService.ts` の変更箇所でlintエラーがないことを確認する
- `SkillCreatorService.test.ts` の変更箇所でlintエラーがないことを確認する
- `StructurePlanJson` 型のimport/exportに関するlintエラーがないことを確認する

### Task 2: typecheckチェック

以下のコマンドを実行し、TypeScript型エラーが0件であることを確認する:

```bash
pnpm --filter @repo/desktop typecheck
```

- `runCreateWorkflow` の戻り型 `StructurePlanJson | null` が呼び出し元と一致していることを確認する
- `createSkill()` のswitch文で戻り値の受け取りが型安全であることを確認する
- タスクAとの接続部分（tmp JSON受け渡し）で型エラーがないことを確認する

### Task 3: テスト全通過確認

以下のコマンドを実行し、全テストがパスすることを確認する:

```bash
pnpm --filter @repo/desktop test
```

- `SkillCreatorService.test.ts` の新規追加テストがパスすることを確認する
- collaborative モードの既存テストが引き続きパスすることを確認する（AC-5）
- Phase 6で拡充した境界ケーステストがパスすることを確認する

### Task 4: タスクA接続の確認

- タスクA（TASK-SC-FIX-GENERATE-SKILL-MD-001）の修正が完了していない場合は blocked として記録する
- タスクAが完了済みの場合、`runCreateWorkflow` の戻り値がtmp JSONとして正しく渡されることをintegration観点で確認する
- ブロッカーをPhase 10最終レビューの入力として記録する

## 参照資料

| 資料名               | パス                                                 | 説明             |
| -------------------- | ---------------------------------------------------- | ---------------- |
| 実装記録             | `outputs/phase-5/implementation-record.md`           | 品質ゲートの根拠 |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`              | 品質ゲート対象   |
| 仕様skill            | `.claude/skills/task-specification-creator/SKILL.md` | 準拠基準         |

## 統合テスト連携

- validator前提のファイル命名をここで固定する
- Phase 10へ渡すblockerをここで出し切る

## 成果物

| 成果物           | パス                                | 説明           |
| ---------------- | ----------------------------------- | -------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 品質ゲート結果 |

## 完了条件

- [ ] lint・typecheck・testの全コマンドが0エラーでパスしている
- [ ] タスクAとの接続確認結果が記録されている
- [ ] 仕様書品質のdriftが解消されている
- [ ] artifactsと実ファイル名が揃っている
- [ ] Phase 10に渡すgate材料が揃っている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
