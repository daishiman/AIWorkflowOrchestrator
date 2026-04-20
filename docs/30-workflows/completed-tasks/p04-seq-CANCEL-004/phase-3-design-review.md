# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 3                                  |
| タスクID   | TASK-SW-CANCEL-004                 |
| 機能名     | skill-creator-cancel-renderer-hook |
| 前提Phase  | Phase 2                            |
| 後続Phase  | Phase 4                            |
| 作成日     | 2026-04-20                         |
| ステータス | completed                          |

## 目的

設計が skill ルールと current fact に整合しているかを判定し、次 Phase へ進む条件を固定する。

## 実行タスク

1. `verify_existing` と `new implementation` の記述が混在していないか確認する
2. `await + try/catch` が Phase 2 / 4 / 5 / 6 で一貫しているか確認する
3. Phase 11 / 12 の NON_VISUAL と parity 要件が落ちていないか確認する
4. PASS / MINOR / MAJOR を判定する

## 参照資料

| 資料       | パス                                                 | 用途               |
| ---------- | ---------------------------------------------------- | ------------------ |
| Phase 2    | `phase-2-design.md`                                  | レビュー対象       |
| index      | `index.md`                                           | metadata / AC 整合 |
| skill 基準 | `.agents/skills/task-specification-creator/SKILL.md` | レビュー観点       |

## 統合テスト連携

| 判定項目                  | 基準     | 結果      |
| ------------------------- | -------- | --------- |
| 設計レビュー完了          | 完了     | completed |
| PASS / MINOR / MAJOR 判定 | 判定済み | completed |

## 成果物

| 成果物       | パス                               | 説明         |
| ------------ | ---------------------------------- | ------------ |
| レビュー判定 | `outputs/phase-3/gate-decision.md` | 判定と残課題 |

## 完了条件

- [ ] 設計の矛盾有無を確認した
- [ ] 判定を記録した
- [ ] Phase 4 の開始条件を明記した
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 4: テスト作成
