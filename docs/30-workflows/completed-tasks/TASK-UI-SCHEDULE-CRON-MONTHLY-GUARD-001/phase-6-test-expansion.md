# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 6                                       |
| Phase名    | テスト拡充                              |
| 前提Phase  | Phase 5（実装・Green確認）              |
| 後続Phase  | Phase 7                                 |
| ステータス | 未実施                                  |
| 作成日     | 2026-04-13                              |
| 機能名     | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 |

---

## 目的

Phase 4〜5 の TDD サイクルで作成した基本テスト（TC-11〜TC-15）に加え、
エッジケース・境界値・異常系のテストを追加してテスト網羅性を高める。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 追加テストケース検討

**目的**: TC-11〜TC-15 以外の追加すべきテストケースを特定する

**実行手順**:

1. 以下の追加テストケース候補を検討する:

   | TC番号 | 入力                      | 期待値         | 理由               |
   | ------ | ------------------------- | -------------- | ------------------ |
   | TC-16  | `dayOfMonth=NaN`          | `""`           | 非整数値チェック   |
   | TC-17  | `dayOfMonth=15.5`         | `""`           | 小数値の拒否確認   |
   | TC-18  | `dayOfMonth=15`（中間値） | `"0 9 15 * *"` | 正常系・中間値確認 |
   | TC-19  | `dayOfMonth=0.5`          | `""`           | 小数値の拒否確認   |

2. 実装コード `Number.isInteger(dayOfMonth)` が非整数値をまとめて拒否することを確認する
3. 追加するテストケースを確定する

**期待される成果物**:

- 追加テストケース一覧（`outputs/phase-6/expanded-test-cases.md` に記録）

---

### タスク2: 追加テストケース実装

**目的**: 確定した追加テストケースを `cronConverter.edge.test.ts` に追加する

**実行手順**:

1. 確定した追加テストケースを `cronConverter.edge.test.ts` に追加する
2. ファイルを保存する

**期待される成果物**:

- `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` への追加（コード成果物）

---

### タスク3: 回帰テスト確認

**目的**: 拡充後もテスト全件グリーンであることを確認する

**実行手順**:

1. テストを実行する:
   ```bash
   pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
   ```
2. 全テストケース（TC-1〜TC-15 以上）がグリーンであることを確認する
3. 結果を記録する

**期待される成果物**:

- `outputs/phase-6/regression-test-result.md`（回帰テスト結果）

---

### タスク4: テスト拡充サマリー

**目的**: テスト拡充の内容をまとめる

**実行手順**:

1. 追加したテストケース数と内容を記録する
2. 全テストケース一覧（TC番号・説明・AC対応）を整理する
3. `outputs/phase-6/expanded-test-cases.md` を作成する

**期待される成果物**:

- `outputs/phase-6/expanded-test-cases.md`（拡充テストケース一覧）
- `outputs/phase-6/regression-test-result.md`（回帰テスト結果）

---

## 参照資料

| 参照資料       | パス                                                          | 内容           |
| -------------- | ------------------------------------------------------------- | -------------- |
| テストファイル | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | 追加対象       |
| Phase 4 成果物 | `outputs/phase-4/test-spec.md`                                | 基本テスト仕様 |
| Phase 5 成果物 | `outputs/phase-5/test-green-result.md`                        | Green状態確認  |

---

## 成果物

| 成果物               | パス                                                          | 内容                       |
| -------------------- | ------------------------------------------------------------- | -------------------------- |
| 拡充テストコード     | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | 追加テスト（コード成果物） |
| 拡充テストケース一覧 | `outputs/phase-6/expanded-test-cases.md`                      | TC-16〜 仕様               |
| 回帰テスト結果       | `outputs/phase-6/regression-test-result.md`                   | 全件グリーン確認           |

---

## 統合テスト連携

- 拡充後も全テストケースがグリーンであることを確認する
- 追加したエッジケーステストが Phase 7 のカバレッジ計測に含まれることを確認する

---

## 完了条件

- [ ] 追加テストケース候補が検討されている
- [ ] 確定した追加テストケースが実装されている
- [ ] 全テスト（TC-1〜拡充分）がグリーンである
- [ ] `outputs/phase-6/expanded-test-cases.md` が作成されている
- [ ] `outputs/phase-6/regression-test-result.md` が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜4）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了し、Green 状態が確認されていること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001/phase-7-coverage-check.md`
