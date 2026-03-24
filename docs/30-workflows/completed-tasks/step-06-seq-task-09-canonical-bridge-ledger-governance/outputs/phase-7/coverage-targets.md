# Phase 7 成果物: カバレッジ計画

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 7 - カバレッジ確認

## 1. カバレッジ目標の前提

このタスクは type:design のため、コードカバレッジ（line/branch/function）の計測は対象外。
ここで定義するカバレッジは「設計仕様の網羅率」を指す成果物カバレッジである。

| カバレッジ種別     | 適用判断                                     | 計測方法                             |
| ------------------ | -------------------------------------------- | ------------------------------------ |
| Line Coverage      | 不要（コードなし）                           | N/A                                  |
| Branch Coverage    | 不要（コードなし）                           | N/A                                  |
| Function Coverage  | 不要（コードなし）                           | N/A                                  |
| FR Coverage        | 必須（FR-1.1〜5.4 全16項目）                 | validation-matrix.md の行数カウント  |
| AC Coverage        | 必須（AC-1〜4 全4項目）                      | contract-matrix.md との照合          |
| Test Case Coverage | 必須（Unit/Integration/Contract/Manual）     | test-matrix.md の TC 数カウント      |
| Pitfall Coverage   | 必須（P1/P25/P43/P56/P59 を含む必須Pitfall） | validation-matrix.md の Pitfall 行数 |
| Edge Case Coverage | 推奨（BC-1〜17 のうち RISK-HIGH 5件）        | edge-case-matrix.md との照合         |

## 2. FR カバレッジ目標

| 要件グループ           | FR 数  | 目標カバレッジ | 最低基準 | 測定コマンド                                                 |
| ---------------------- | ------ | -------------- | -------- | ------------------------------------------------------------ |
| FR-1（Source Table）   | 3      | 100%           | 100%     | `grep -c "FR-1\." outputs/phase-2/validation-matrix.md` >= 3 |
| FR-2（Bridge Rule）    | 3      | 100%           | 100%     | `grep -c "FR-2\." outputs/phase-2/validation-matrix.md` >= 3 |
| FR-3（State 遷移）     | 4      | 100%           | 100%     | `grep -c "FR-3\." outputs/phase-2/validation-matrix.md` >= 4 |
| FR-4（Same-Wave Sync） | 4      | 100%           | 100%     | `grep -c "FR-4\." outputs/phase-2/validation-matrix.md` >= 4 |
| FR-5（Follow-up）      | 4      | 100%           | 100%     | `grep -c "FR-5\." outputs/phase-2/validation-matrix.md` >= 4 |
| **合計**               | **18** | **100%**       | **100%** | 全 FR が validation-matrix.md に行として存在                 |

**設計タスク固有の根拠**: type:design では FR カバレッジ 100% が必須。テスト実行ではなく成果物存在確認で計測する。

## 3. AC カバレッジ目標

| AC ID | 対応 FR     | 目標カバレッジ | 測定コマンド                                               |
| ----- | ----------- | -------------- | ---------------------------------------------------------- |
| AC-1  | FR-1.1〜2.3 | 100%           | `grep -c "AC-1" outputs/phase-2/validation-matrix.md` >= 1 |
| AC-2  | FR-3.1〜3.4 | 100%           | `grep -c "AC-2" outputs/phase-2/validation-matrix.md` >= 1 |
| AC-3  | FR-4.1〜4.4 | 100%           | `grep -c "AC-3" outputs/phase-2/validation-matrix.md` >= 1 |
| AC-4  | FR-5.1〜5.4 | 100%           | `grep -c "AC-4" outputs/phase-2/validation-matrix.md` >= 1 |

## 4. テストケースカバレッジ目標

| テスト種別  | Phase 4 定義数     | Phase 6 追加数  | 合計     | 目標達成条件                                |
| ----------- | ------------------ | --------------- | -------- | ------------------------------------------- |
| Unit        | 14（U-1-1〜U-3-8） | 9（E-1〜E-9）   | 23件     | 全 FR に対応する TC が1件以上存在する       |
| Integration | 6（I-1〜I-6）      | 8（ER-1〜ER-8） | 14件     | Step A→E の全 Step に対応する TC が存在する |
| Contract    | 12（C-1〜C-12）    | 5（F-1〜F-5）   | 17件     | 全 AC に対応する検証コマンドが存在する      |
| Manual      | 5（M-1〜M-5）      | 4（S-1〜S-4）   | 9件      | Phase 11 walkthrough が全シナリオをカバー   |
| **合計**    | **37件**           | **26件**        | **63件** | **全テスト種別に TC が存在する**            |

## 5. Pitfall カバレッジ目標

governance 仕様で明示的に防止すべき Pitfall の網羅:

| Pitfall    | 内容                                | 対応 TC ID      | カバレッジ目標 |
| ---------- | ----------------------------------- | --------------- | -------------- |
| P1         | LOGS.md 2ファイル更新漏れ           | C-7, ER-8       | 100%           |
| P2/P27     | topic-map.md 再生成忘れ             | C-5相当, F-3    | 100%           |
| P3/P38/P58 | 未タスク3ステップ不完全             | M-3, F-5, BC-16 | 100%           |
| P4/P51     | documentation-changelog 早期記録    | ER-5, BC-9      | 100%           |
| P25        | LOGS.md 2ファイル更新漏れ（再発）   | C-7, ER-8       | 100%           |
| P43        | サブエージェント rate limit 中断    | E-6, ER-1       | 100%           |
| P56        | 再評価クローズ時の Issue Close 漏れ | C-6, ER-4       | 100%           |
| P59        | 並列 SA の changelog 件数不整合     | ER-7            | 100%           |
| P26/P57    | 設計タスクの仕様書更新遅延          | M-4             | 100%           |

## 6. Edge Case カバレッジ目標

RISK-HIGH の境界ケース（BC-2/BC-5/BC-8/BC-10/BC-11）は Phase 9-11 までに対処方針を確定する:

| BC ID | RISK | 対処期限 Phase | カバレッジ達成条件                            |
| ----- | ---- | -------------- | --------------------------------------------- |
| BC-2  | HIGH | Phase 2 再確認 | type フィールドの enum 制約が設計書に追記済み |
| BC-5  | HIGH | Phase 11       | du -sh チェック手順が Manual TC に追加済み    |
| BC-8  | HIGH | Phase 9        | ファイルロック回避の QA コマンドが追加済み    |
| BC-10 | HIGH | Phase 11       | wave 完了判定の単一エージェント制約が確認済み |
| BC-11 | HIGH | Phase 11       | Issue 存在確認フローが Manual TC に追加済み   |

## 7. カバレッジ達成チェックリスト

Phase 7 完了時点で以下を確認する:

| チェック項目                          | 検証コマンド / 確認方法                                   | 達成条件    |
| ------------------------------------- | --------------------------------------------------------- | ----------- |
| FR カバレッジ 100%（16項目）          | `grep -c "FR-" outputs/phase-2/validation-matrix.md`      | >= 16       |
| AC カバレッジ 100%（4項目）           | `grep -c "AC-[1-4]" outputs/phase-2/validation-matrix.md` | >= 4        |
| Pitfall カバレッジ（必須9件）         | `grep -c "P[0-9]" outputs/phase-2/validation-matrix.md`   | >= 9        |
| Contract TC 数（12件以上）            | Phase 4 test-matrix.md の C- 行数カウント                 | >= 12       |
| Edge TC 数（Phase 6 追加後）          | Phase 6 regression-expansion-plan.md の E/ER/F/S 行数     | >= 20       |
| RISK-HIGH BC 対処方針確定（5件）      | edge-case-matrix.md の RISK-HIGH セクション確認           | 5件全件     |
| Phase 4-6 成果物（6ファイル）存在確認 | `ls outputs/phase-4/ outputs/phase-5/ outputs/phase-6/`   | 各2ファイル |
