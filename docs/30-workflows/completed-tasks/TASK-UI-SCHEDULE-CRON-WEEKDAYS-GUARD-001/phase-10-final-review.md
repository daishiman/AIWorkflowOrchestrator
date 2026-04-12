# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 10                                       |
| タスクID   | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 |
| タスク名   | cronConverter 空曜日ガード処理追加       |
| 前提Phase  | Phase 9                                  |
| 後続Phase  | Phase 11                                 |
| 作成日     | 2026-04-12                               |
| ステータス | 未実施                                   |

## 目的

acceptance criteria と blocker を最終判定し、
Phase 11（手動テスト）へ進めるかを判断する。

## 実行タスク

- AC-1〜AC-5 の最終照合を行う
- コードレビュー観点のチェックを行う
- PASS/MINOR/MAJOR を判定する
- 最終レビュー結果と AC 検証結果を記録する

## 統合テスト連携

Phase 9 の品質ゲート結果と AC 照合結果を突き合わせ、回帰と未達がないことを確認する。
Phase 11 は NON_VISUAL のため、最終レビューの判定は source-level の証跡に接続する。

## レビュー観点

1. AC-1〜AC-5 が全て満たされているか
2. 既存テストへの回帰がないか
3. コード品質（型安全・JSDoc記述）が基準を満たしているか
4. MAJORブロッカーが存在しないか

## AC検証テーブル

| AC番号 | 基準                                                                                                | 判定   | 証跡                                                                                           |
| ------ | --------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| AC-1   | `{ frequency: "weekly", weekdays: [] }` で不正なcron式（`"0 9 * * "` 等）が生成されず、空文字が返る | 未確認 | `pnpm vitest run` で空曜日テストケースがPASS                                                   |
| AC-2   | 正常ケース（weekdaysに値あり）は引き続きPASS                                                        | 未確認 | `pnpm vitest run` で既存テストケースがPASS                                                     |
| AC-3   | 既存テスト全件PASS                                                                                  | 未確認 | `pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter` 全件PASS                      |
| AC-4   | 空曜日ケースの追加テストケースが `cronConverter.edge.test.ts` に存在する                            | 未確認 | `grep -n "weekdays.*\[\]" apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`         |
| AC-5   | `cronConverter.ts` のJSDocにガード処理仕様が記載されている                                          | 未確認 | `grep -n "JSDoc\|@param\|@returns\|@remarks" apps/desktop/src/renderer/utils/cronConverter.ts` |

## PASS/MINOR/MAJOR 判定基準

### PASS 判定条件

- AC-1〜AC-5 が全て満たされている
- 既存テストが全件PASS
- TypeScript型チェックPASS
- ESLint PASS
- MAJORブロッカーが 0 件

### MINOR 候補

以下の場合はMINORとして記録し、Phase 12の未タスクとして追跡する:

| MINOR ID | 内容                                                        | 対処方針                    |
| -------- | ----------------------------------------------------------- | --------------------------- |
| M-01     | JSDocの記述が不完全（@returns/@remarks の記述が簡易な場合） | Phase 12 未タスクとして記録 |
| M-02     | 他のfrequency種別（monthly等）で同様のガード漏れの可能性    | Phase 12 未タスクとして記録 |
| M-03     | エラーメッセージ文言の国際化対応が未実施                    | スコープ外として記録        |

### MAJOR 判定（Phase 13 ブロック）

以下のいずれかに該当する場合、Phase 13（PR作成）をブロックする:

| MAJOR ID | 内容                                       | 対処                       |
| -------- | ------------------------------------------ | -------------------------- |
| MAJ-01   | ガード処理が実装されていない（AC-1未達）   | Phase 5〜8に戻り実装       |
| MAJ-02   | 既存テストがFAILした（AC-3未達、回帰発生） | Phase 5〜6に戻り修正       |
| MAJ-03   | TypeScript型エラーが発生している           | Phase 5に戻り型定義修正    |
| MAJ-04   | 追加テストケースが存在しない（AC-4未達）   | Phase 4〜6に戻りテスト追加 |

## MINOR 追跡テーブル

| MINOR ID | 指摘内容 | 解決Phase | 解決状態 |
| -------- | -------- | --------- | -------- |
| -        | 未確認   | -         | -        |

## ブロッカー確認

| ID   | 内容                | 状態   |
| ---- | ------------------- | ------ |
| B-01 | 既存テストへの回帰  | 未確認 |
| B-02 | TypeScript 型エラー | 未確認 |
| B-03 | ESLint エラー       | 未確認 |
| B-04 | ガード処理未実装    | 未確認 |

## Phase 11 開始条件

Phase 11 を開始するためには以下が全て満たされている必要がある:

- [ ] AC-1〜AC-5 の検証が全てPASS
- [ ] MAJORブロッカーが 0 件
- [ ] `outputs/phase-10/final-review-result.md` が作成済み
- [ ] `outputs/phase-10/ac-verification.md` が作成済み

## 参照資料

| 資料名           | パス                                      | 用途                   |
| ---------------- | ----------------------------------------- | ---------------------- |
| Phase 2 設計     | `phase-2-design.md`                       | 変換ロジック設計の前提 |
| 品質チェック結果 | `outputs/phase-9/quality-check-result.md` | Phase 9 成果物         |
| テスト設計書     | `phase-4-test-creation.md`                | AC-4 テストケース確認  |

## 成果物

| 成果物           | パス                                      | 説明                                      |
| ---------------- | ----------------------------------------- | ----------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | AC最終確認・ブロッカー判定・PASS/FAIL判定 |
| AC検証詳細       | `outputs/phase-10/ac-verification.md`     | AC-1〜AC-5の証跡コマンド出力を記録        |

## 完了条件

- [ ] AC-1〜AC-5 の最終判定が完了している
- [ ] PASS/MINOR/MAJOR の分類が記録されている
- [ ] ブロッカーが 0 件（または全て解消済み）
- [ ] Phase 11 開始条件が PASS

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001
```

## 次Phase

Phase 11: 手動テスト
