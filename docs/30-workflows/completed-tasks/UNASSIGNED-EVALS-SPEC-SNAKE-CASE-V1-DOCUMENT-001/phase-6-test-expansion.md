# Phase 6: テスト拡張

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 6                                                |
| タスクID   | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 |
| タスク種別 | docs-only / NON_VISUAL                           |
| ステータス | completed                                        |
| 前Phase    | 5                                                |
| 次Phase    | 7                                                |
| 作成日     | 2026-04-21                                       |

## 目的

Phase 5 の追記結果を実データ観点と parity 観点の両面から再確認し、誤った定義を close-out へ持ち込まないようにする。

## 実行タスク

### タスク1: 実データ整合確認

- `levels` が静的オブジェクトとして説明されているかを確認する
- `average_satisfaction` が固定値域ではなく観測値ベースで説明されているかを確認する
- 非保持スキルの扱いが記述されているかを確認する

### タスク2: parity 確認

- `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` を実行する
- canonical と mirror の差分がゼロであることを確認する

### タスク3: 回帰確認

- §2 以降の既存節が壊れていないかを確認する
- `consumer-audit-report.md`、`evals-field-map.md` への参照が残っているかを確認する

## 参照資料

| 資料名           | パス                                      | 用途           |
| ---------------- | ----------------------------------------- | -------------- |
| Phase 4 シナリオ | `outputs/phase-4/test-scenarios.md`       | 確認観点の参照 |
| Phase 5 結果     | `outputs/phase-5/spec-addition-result.md` | 追記内容の要約 |
| Phase 5 差分     | `outputs/phase-5/section-diff-report.md`  | 変更箇所の確認 |

## 実行手順

1. Phase 5 成果物を読む
2. 実データ整合確認を行う
3. parity 確認を行う
4. 回帰確認を行う
5. `outputs/phase-6/dual-root-verification.md` と `outputs/phase-6/consumer-impact-note.md` を定義する

## 統合テスト連携

- docs-only task なので、ここでの主テストはコマンド再現性と参照整合である
- FAIL が出たら Phase 5 に戻す

## 多角的チェック観点

- **演繹思考**: AC に必要な説明が実際に存在するか
- **MECE**: 実データ確認、parity、回帰確認が重複なく揃っているか
- **因果関係分析**: 誤定義が後続 task へどう波及するかを見ているか

## サブタスク管理

| サブタスクID | 内容              | ステータス |
| ------------ | ----------------- | ---------- |
| ST-6-01      | 実データ整合確認  | pending    |
| ST-6-02      | parity 確認       | pending    |
| ST-6-03      | 回帰確認          | pending    |
| ST-6-04      | 成果物 2 件の定義 | pending    |

## 成果物

- `outputs/phase-6/dual-root-verification.md`
- `outputs/phase-6/consumer-impact-note.md`

## 完了条件

- [ ] 実データ整合確認が終わっている
- [ ] parity 確認が終わっている
- [ ] 既存節の回帰確認が終わっている
- [ ] 成果物 2 件を定義している

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] FAIL 時の差し戻し条件を明記
- [ ] 事実と推測を混同していない

## 次Phase

Phase 7（カバレッジ確認）へ進む。
