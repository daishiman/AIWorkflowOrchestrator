# Phase 3: 設計レビューゲート - UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 3                                           |
| Phase名    | 設計レビューゲート                          |
| 前提Phase  | Phase 2（設計）                             |
| 後続Phase  | Phase 4（N/A）→ Phase 9（品質保証チェック） |
| ステータス | complete                                    |
| 作成日     | 2026-04-06                                  |
| 機能名     | ut-sdk-07-phase11-screenshot-evidence-001   |

---

## 目的

Phase 2 設計の妥当性を確認し、Phase 9 以降（実質 Phase 11 手動テスト）へ進行可否を判定する。

---

## 実行タスク

### タスク1: 設計レビューチェックリスト

**目的**: Phase 2 設計が Phase 11 手動テストを迷いなく実施できる品質か確認する。

#### スコープ整合性チェック

| チェック項目                                                          | 結果 |
| --------------------------------------------------------------------- | ---- |
| Phase 1 の AC-1〜AC-6 が Phase 2 の操作シナリオで全て網羅されているか | □    |
| capture ID が screenshot-plan.json のものと対応しているか             | □    |
| evidence 保存先パスが TASK-SDK-07 の Phase 11 output と一致しているか | □    |
| 含まないスコープ（Approval request surface）が設計に混入していないか  | □    |

#### docs-only 設計チェック

| チェック項目                                                                                                                                                                                       | 結果 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| Phase 4〜8 の N/A 根拠が明記されているか                                                                                                                                                           | □    |
| コード変更が一切発生しない設計になっているか                                                                                                                                                       | □    |
| Phase 11 が VISUAL タスクとして扱われているか                                                                                                                                                      | □    |
| `manual-test-checklist.md` / `manual-test-report.md` / `discovered-issues.md` / `ui-sanity-visual-review.md` / `screenshot-coverage.md` / `phase11-capture-metadata.json` の作成が設計されているか | □    |
| capture ID が `TC-11-01` / `TC-11-02` / `TC-11-03` で統一されているか                                                                                                                              | □    |

#### 環境前提チェック

| チェック項目                                                                            | 結果 |
| --------------------------------------------------------------------------------------- | ---- |
| terminal_handoff 状態の再現方法（API key なし）が明確か                                 | □    |
| integrated_api 成功状態の再現方法（有効 API key）が明確か                               | □    |
| desktop app 起動コマンドが記載されているか                                              | □    |
| screenshot-plan.json と screenshot-coverage.md の両方が必要であることが記載されているか | □    |

---

### タスク2: 設計レビュー判定

**判定基準**:

| 判定     | 条件                                          |
| -------- | --------------------------------------------- |
| PASS     | 全チェック項目が OK。Phase 9 へ進行           |
| MINOR    | 軽微な修正で対応可能（修正後 Phase 9 へ進行） |
| MAJOR    | 設計の根本的な問題あり。Phase 2 へ差し戻し    |
| CRITICAL | Phase 1 の前提に問題あり。Phase 1 へ差し戻し  |

**よくある MAJOR 判定の例**:

- TASK-SDK-07 の実装が完了していないことが判明した場合
- screenshot-plan.json が存在せず capture ID が未定義の場合
- terminal_handoff 状態の再現方法が不明確な場合

---

## 参照資料

| 参照資料       | パス                      | 内容             |
| -------------- | ------------------------- | ---------------- |
| Phase 1 設計書 | `phase-1-requirements.md` | 要件・AC 定義    |
| Phase 2 設計書 | `phase-2-design.md`       | 操作シナリオ設計 |

---

## 成果物

| 成果物           | パス                               | 内容               |
| ---------------- | ---------------------------------- | ------------------ |
| 設計レビュー結果 | `outputs/phase-3/design-review.md` | チェック結果・判定 |

---

## 統合テスト連携

- Phase 9 で前提条件を確認し、Phase 10 で PASS 判定を受けた後に Phase 11 へ進める
- Phase 11 で capture ID と screenshot を取得し、Phase 12 で evidence bundle に同期する

## 完了条件

- [ ] 全チェック項目を確認した
- [ ] PASS / MINOR / MAJOR / CRITICAL の判定を明記した
- [ ] MINOR 以上の指摘事項は対応方針が記録されている

## タスク100%実行確認【必須】

全完了条件を確認し、Phase 3 が完了したことを記録すること。

## 次Phase

Phase 4（N/A） → Phase 9: 品質保証
