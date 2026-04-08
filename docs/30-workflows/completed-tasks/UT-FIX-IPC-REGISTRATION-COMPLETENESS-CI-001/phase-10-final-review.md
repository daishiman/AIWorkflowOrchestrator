# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 10                                          |
| Phase名    | 最終レビューゲート                          |
| 前提Phase  | Phase 9                                     |
| 後続Phase  | Phase 11                                    |
| ステータス | 未実施                                      |
| 作成日     | 2026-04-07                                  |
| 機能名     | UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001 |

---

## 目的

受入基準を全項目確認し、BLOCKER がないことを確認して Phase 11 へ進む。

## 背景

実装・テスト・品質保証が全て完了した時点で、受入基準に対する最終確認を行う。BLOCKER がある場合は適切な Phase へ戻る。

---

## 実行タスク

### タスク1: 受入基準チェックリストの確認

**目的**: 全受入基準を確認し、BLOCKER 有無を判定する

**実行手順**:

1. 以下の受入基準チェックリストを全項目確認する
2. BLOCKER・MINOR を記録する
3. BLOCKER が 0 件であれば Phase 11 へ進む判定を行う

**受入基準チェックリスト**:

| 項目                                                                                                      | 判定 |
| --------------------------------------------------------------------------------------------------------- | ---- |
| スナップショットテストが CI で実行される                                                                  | -    |
| 重複登録・欠損が発生した場合に CI が FAIL する                                                            | -    |
| 全テスト PASS（TC-01〜TC-03）                                                                             | -    |
| `pnpm typecheck` PASS                                                                                     | -    |
| `pnpm lint` PASS（警告 0 件）                                                                             | -    |
| スナップショットファイルがリポジトリにコミット予定である                                                  | -    |
| `registerRuntimeSkillCreatorHandlers` の 18 チャネル（16 public runtime + 2 auxiliary）がカバーされている | -    |
| line カバレッジ 90% 以上（`creatorHandlers.ts`）                                                          | -    |

**BLOCKER 定義**:

- 全テスト PASS でない → BLOCKER
- `pnpm typecheck` / `pnpm lint` FAIL → BLOCKER
- スナップショットテストが CI で実行されない → BLOCKER
- 重複登録・欠損の検出が機能しない → BLOCKER

**戻り先判定**:

| 判定                | アクション                |
| ------------------- | ------------------------- |
| BLOCKER（実装系）   | Phase 5 へ戻り実装修正    |
| BLOCKER（テスト系） | Phase 4 へ戻りテスト修正  |
| BLOCKER（設計系）   | Phase 2 へ戻り設計修正    |
| MINOR               | 記録のみ、Phase 11 へ進む |
| PASS                | Phase 11 へ進む           |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-10/acceptance-checklist.md`

---

## 参照資料

| 参照資料           | パス                                 | 内容                 |
| ------------------ | ------------------------------------ | -------------------- |
| 品質レポート       | `outputs/phase-9/quality-report.md`  | Phase 9 品質確認結果 |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ確認結果   |

---

## 成果物

| 成果物                 | パス                                       | 説明                       |
| ---------------------- | ------------------------------------------ | -------------------------- |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md`  | レビュー結果・BLOCKER 記録 |
| 受入基準チェックリスト | `outputs/phase-10/acceptance-checklist.md` | 全項目の判定結果           |

---

## 完了条件

- [ ] BLOCKER 0 件でレビュー完了している
- [ ] 受入基準チェックリストが全項目確認されている
- [ ] `outputs/phase-10/` 配下に成果物が配置されている

---

## Phase実行記録

> 実行時にこのセクションへ結果を記録する。

| 項目       | 内容 |
| ---------- | ---- |
| 実行日時   | -    |
| 実行者     | -    |
| 完了判定   | -    |
| BLOCKER 数 | -    |
| MINOR 数   | -    |
| 特記事項   | -    |
