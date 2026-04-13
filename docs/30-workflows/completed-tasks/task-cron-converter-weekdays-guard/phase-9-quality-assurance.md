# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 9                                        |
| タスクID   | TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001   |
| 機能名     | cronConverter weekdays=[] ガード処理追加 |
| 前提Phase  | Phase 8                                  |
| 後続Phase  | Phase 10                                 |
| 作成日     | 2026-04-12                               |
| ステータス | completed                                |

## 目的

静的解析・リスク評価・因果ループ監査を実施し、リリース可能な品質水準を確認する。

## 静的解析チェック

```bash
# ESLint チェック
pnpm --filter @repo/desktop lint

# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# Prettier フォーマット確認
pnpm exec prettier --check \
  docs/30-workflows/task-cron-converter-weekdays-guard/*.md \
  apps/desktop/src/renderer/utils/cronConverter.ts \
  apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts
```

### 確認観点

| 観点              | 確認内容                                              |
| ----------------- | ----------------------------------------------------- |
| ESLint エラー     | 0件であること                                         |
| TypeScript エラー | 0件であること                                         |
| `any` 型の使用    | 新規 `any` が追加されていないこと                     |
| 未使用インポート  | `InvalidConfigError` が正しくインポートされていること |
| throw の型安全性  | `throw` の対象が `Error` サブクラスであること         |

## リスク評価

| リスク                                        | 発生確率 | 影響度 | 対策                                              |
| --------------------------------------------- | -------- | ------ | ------------------------------------------------- |
| ガード処理が他の frequency に誤発動する       | 低       | 高     | `frequency === "weekly"` 条件内にのみガードを配置 |
| `InvalidConfigError` が既存エラー型と競合する | 低       | 中     | 既存 Error クラス体系を調査済み                   |
| 既存テストへの回帰影響                        | 低       | 中     | Phase 6 回帰テストで確認済み                      |
| `weekdays` が null/undefined のケース漏れ     | 低       | 低     | TypeScript 型で防止済み（型定義に依存）           |

## 因果ループ監査

```
weekdays=[] ガード追加
  → frequency==="weekly" かつ weekdays=[] の場合にエラーをスロー
  → 既存の正常系（weekdays=[0] 等）には影響なし
  → VisualCronPicker は引き続き UI 側でバリデーションを行う
  → 二重チェックになるが、API 契約として必要（単一責任原則）
  → 循環なし ✓

InvalidConfigError 定義追加
  → cronConverter.ts から export される
  → テストファイルが import して使用する
  → 他のモジュールへの影響: 将来 shared/public contract に昇格する場合は import パスが変わる
  → TypeScript 型チェックで検出可能 ✓
```

## 多角的チェック観点

| 思考法         | 確認内容                                                           |
| -------------- | ------------------------------------------------------------------ |
| 逆説思考       | ガードが追加されていない場合どうなるか（不正 cron 式が生成される） |
| システム思考   | VisualCronPicker との二重チェック関係を確認する                    |
| if 思考        | `frequency === "weekly"` の境界条件を確認する                      |
| 改善思考       | 将来の TASK-CRON-SEMANTIC-VALIDATION-001 との整合性を確認          |
| 因果関係ループ | 修正が新たな障害を生む循環がないか確認する                         |

## 参照資料

| 資料名         | パス                                         | 用途           |
| -------------- | -------------------------------------------- | -------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`        | Phase 8 成果物 |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md` | Phase 8 成果物 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |

## 成果物

| 成果物         | パス                                   | 説明                     |
| -------------- | -------------------------------------- | ------------------------ |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | 静的解析結果・品質評価   |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | リスク一覧と対策         |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md` | 循環問題がないことの確認 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 静的解析がエラー 0 件であること
- [ ] リスク評価が完了していること
- [ ] 因果ループ監査が完了していること
- [ ] 矛盾・漏れがないこと
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 8 成果物確認
2. 静的解析実行
3. リスク評価実施
4. 因果ループ監査実施
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 10: 最終レビュー
