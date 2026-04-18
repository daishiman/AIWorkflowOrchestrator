# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                            |
| ------ | --------------------------------------------- |
| Phase  | 6                                             |
| 機能名 | task-ut-rt-01-notify-helper-consolidation-001 |
| 作成日 | 2026-04-18                                    |

## 目的

Phase 4 では網羅できなかったエッジケースのテストを追加する。

## 追加テスト

| テストID | シナリオ                                           | 優先度 |
| -------- | -------------------------------------------------- | ------ |
| T-HC-07  | 複数回呼び出した場合の独立性確認                   | LOW    |
| T-HC-08  | `notify()` の引数の型チェック（string であること） | LOW    |

## 実行コマンド

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="notification"
```

## 完了条件

- [ ] T-HC-07〜08 が作成・PASS している
- [ ] Phase 7 開始条件が整っている

## 次Phase

→ [Phase 7: カバレッジ確認](phase-7-coverage-check.md)
