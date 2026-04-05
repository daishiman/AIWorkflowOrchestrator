# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目      | 内容       |
| --------- | ---------- |
| Phase     | 6          |
| Phase名   | テスト拡充 |
| カテゴリ  | テスト     |
| 前提Phase | Phase 5    |
| 後続Phase | Phase 7    |

## 目的

fail path・ロールバック・パストラバーサルを統合レベルで網羅し、将来の変更によるリグレッションを防ぐ。
persist-integration の current facts は 22件（`F-01〜F-06`, `E-10〜E-16`, `E-21〜E-29`）。

## 実行タスク

### タスク1: パストラバーサル統合テスト（Facade -> Writer）

| テストケースID | テスト概要                       | 入力 skillName     |
| -------------- | -------------------------------- | ------------------ |
| E-21           | `"../malicious"` を reject       | `"../malicious"`   |
| E-22           | `"dir/subdir"` を reject         | `"dir/subdir"`     |
| E-23           | NULL バイトを含む name を reject | `"skill\\x00name"` |

### タスク2: ロールバック統合テスト

| テストケースID | テスト概要                              |
| -------------- | --------------------------------------- |
| E-24           | 部分失敗で rollback 実行が示唆される    |
| E-25           | rollback 自体が失敗した場合のエラー伝播 |

### タスク3: 回帰ガード

| テストケースID | テスト概要                                                        |
| -------------- | ----------------------------------------------------------------- |
| E-26           | executeResult に persistResult フィールドが常に存在する           |
| E-27           | executeResult に persistError フィールドが常に存在する            |
| E-28           | parse が null の場合 persist 未呼出（かつ persistResult は null） |
| E-29           | skillFileWriter 未注入でも execute は正常完了（例外にしない）     |

### タスク4: 異常系網羅の最終確認（Current Facts）

| 異常系カテゴリ     | 主なテストケース  |
| ------------------ | ----------------- |
| execute 失敗       | F-06              |
| コードブロックなし | F-05              |
| parse 例外         | E-15              |
| persist 失敗/例外  | F-03, E-10 ~ E-14 |
| DI 未注入          | F-04, E-16, E-29  |
| PATH_TRAVERSAL     | E-11, E-21 ~ E-23 |
| rollback           | E-24 ~ E-25       |
| 回帰ガード         | E-26 ~ E-29       |

## 実行コマンド

```bash
pnpm --filter @repo/desktop test -- --testPathPattern=persist-integration
```

## 完了条件

- [ ] persist-integration が 22件で Green（`F-01〜F-06`, `E-10〜E-16`, `E-21〜E-29`）
