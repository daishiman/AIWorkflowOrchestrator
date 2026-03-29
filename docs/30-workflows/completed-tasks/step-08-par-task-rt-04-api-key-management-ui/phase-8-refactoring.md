# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 8                     |
| 機能名     | api-key-management-ui |
| 作成日     | 2026-03-29            |
| ステータス | pending               |

## 目的

重複ロジック、命名の不整合、UI drift を削り、最小複雑性へ寄せる。

## 実行タスク

- UI責務の混在を解消する
- validation と status 表示の重複を削る
- 命名と test ID をそろえる

## 参照資料

| 資料名  | パス                        | 説明     |
| ------- | --------------------------- | -------- |
| Phase 5 | `phase-5-implementation.md` | 実装     |
| Phase 7 | `phase-7-coverage-check.md` | coverage |

## 実行手順

### ステップ1: 重複を見つける

1. UI状態判定
2. エラーメッセージ
3. CTA 文言

### ステップ2: drift を削る

1. Settings との差分
2. SkillLifecycle 内 naming drift
3. screenshot plan と UI の用語 drift

### ステップ3: regression を確認する

1. テスト再実行
2. 変更理由記録

## 統合テスト連携

- Phase 9 で lint / typecheck / parity を確認する前に回帰を潰す。

## 成果物

| 成果物             | パス                                    | 説明       |
| ------------------ | --------------------------------------- | ---------- |
| refactoring plan   | `outputs/phase-8/refactoring-plan.md`   | 対象一覧   |
| refactoring result | `outputs/phase-8/refactoring-result.md` | 実施結果   |
| regression log     | `outputs/phase-8/regression-log.md`     | 再確認結果 |

## 完了条件

- [ ] 重複ロジックが削減されている
- [ ] naming / status / CTA の drift が減っている
- [ ] テストが継続して通る
- [ ] **本Phase内の全タスクを100%実行完了**
