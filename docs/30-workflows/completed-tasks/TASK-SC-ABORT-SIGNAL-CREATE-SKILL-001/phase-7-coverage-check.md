# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 7                                     |
| 機能名 | TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 |
| 作成日 | 2026-04-19                            |

## 目的

変更面に対する traceability と targeted coverage を確認する。

## 実行タスク

1. targeted test 実行コマンドを固定する
2. AC と TC/EX の対応表を作る
3. 変更面の未到達 gap を列挙する

## 参照資料

| 資料    | パス                        | 用途    |
| ------- | --------------------------- | ------- |
| Phase 4 | `phase-4-test-creation.md`  | TC 一覧 |
| Phase 6 | `phase-6-test-expansion.md` | EX 一覧 |

## 実行手順

```bash
pnpm --filter @repo/desktop test:run --coverage -- \
  apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts \
  apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts
```

## 統合テスト連携

- Phase 8 は gap を refactor 候補へ渡す
- Phase 10 は coverage traceability を最終レビューへ再掲する

## 成果物

- `outputs/phase-7/coverage-matrix.md`
- `outputs/phase-7/gap-list.md`
- `outputs/phase-7/traceability-report.md`

## 完了条件

- [ ] targeted coverage コマンドが固定されている
- [ ] AC / TC / EX の対応が追える
- [ ] 未到達 gap の扱いが明記されている
