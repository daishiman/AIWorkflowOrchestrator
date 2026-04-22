# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 7                                                |
| タスクID   | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 |
| タスク種別 | docs-only / NON_VISUAL                           |
| ステータス | completed                                        |
| 前Phase    | 6                                                |
| 次Phase    | 8                                                |
| 作成日     | 2026-04-21                                       |

## 目的

AC-1〜AC-5 がどの成果物・どの確認手順で満たされるかを明示し、漏れのない traceability を作る。

## 実行タスク

### タスク1: AC 充足確認

- AC-1: `levels` 静的オブジェクト構造と未保持スキルの扱い
- AC-2: `average_satisfaction` の型・意味・観測値ベース説明
- AC-3: v1 / v2 関係の比較表現
- AC-4: 断定なし方針
- AC-5: parity

### タスク2: traceability matrix 作成

- AC と Phase 4〜6 の成果物を対応付ける
- PASS / FAIL / PARTIAL を定義する

### タスク3: ゲート判定

- FAIL または PARTIAL があれば Phase 5 に差し戻す
- 全 PASS のときだけ Phase 8 へ進む

## 参照資料

| 資料名              | パス                                                                     | 用途         |
| ------------------- | ------------------------------------------------------------------------ | ------------ |
| Phase 6 parity      | `outputs/phase-6/dual-root-verification.md`                              | AC-5         |
| Phase 6 impact note | `outputs/phase-6/consumer-impact-note.md`                                | AC-1〜AC-4   |
| canonical 正本      | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` | 充足確認対象 |

## 実行手順

1. AC ごとに確認観点を列挙する
2. `outputs/phase-7/traceability-matrix.md` を定義する
3. `outputs/phase-7/coverage-report.md` を定義する
4. PASS / FAIL / PARTIAL を記録する

## 統合テスト連携

- Phase 6 の結果を Phase 7 で受ける
- PARTIAL を PASS に寄せない

## 多角的チェック観点

- **論点思考**: AC ごとの論点が混ざっていないか
- **KJ法**: findings を AC 単位に束ねられているか
- **戦略的思考**: 後続 task のために必要な説明だけを残しているか

## サブタスク管理

| サブタスクID | 内容                     | ステータス |
| ------------ | ------------------------ | ---------- |
| ST-7-01      | AC 充足確認              | pending    |
| ST-7-02      | traceability matrix 作成 | pending    |
| ST-7-03      | ゲート判定               | pending    |

## 成果物

- `outputs/phase-7/coverage-report.md`
- `outputs/phase-7/traceability-matrix.md`

## 完了条件

- [ ] AC-1〜AC-5 の充足確認が終わっている
- [ ] traceability matrix を定義している
- [ ] ゲート判定を明記している

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] PASS / FAIL / PARTIAL の根拠を示した
- [ ] AC と成果物の対応が漏れていない

## 次Phase

Phase 8（リファクタリング）へ進む。
