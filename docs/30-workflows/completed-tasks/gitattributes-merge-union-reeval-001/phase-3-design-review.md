# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 3                                         |
| タスクID   | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 |
| 機能名     | gitattributes-merge-union-reeval          |
| 前提Phase  | Phase 2                                   |
| 後続Phase  | Phase 4                                   |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

Phase 2 で確定した `.gitattributes` パッチ案・戦略選定基準・ドライバー設定戦略を 4 条件（価値性 / 実現性 / 整合性 / 運用性）でレビューし、PASS / MINOR / MAJOR を判定して Phase 4 以降への進行可否と戻り先を確定する。

## 背景

本タスクは `.gitattributes` の運用方針を変更する設計のため、誤った glob 指定や戦略の取り違えがあると、後続のマージ作業全体に副作用を及ぼす。設計レビューでは、価値性（破損リスク低減に寄与しているか）、実現性（パッチが適用可能か）、整合性（既完了タスク TASK-CONFLICT-PREVENT-001 と矛盾しないか）、運用性（運用者が判断基準を再現できるか）の 4 条件で gate を通す。

## 実行タスク

### タスク0: 設計レビュー観点の整理（4条件）

**目的**: 4 条件それぞれを採点可能な質問に分解する。

**実行手順**:

1. 価値性: 構造化ドキュメント破損リスクが排除され、append-only の利便性が維持されているかを確認する。
2. 実現性: パッチ案が `.gitattributes` 構文として有効であり、`setup-merge-drivers.sh` 実行で `merge.ours.driver` が解決可能であることを確認する。
3. 整合性: AC-1〜AC-5、Phase 1 の分類インベントリ、TASK-CONFLICT-PREVENT-001 の既存方針と矛盾していないかを確認する。
4. 運用性: append-only / 構造化 の判断順序が明文化され、新規ファイル追加時に運用者が再現できるかを確認する。

**期待される成果物**:

- `outputs/phase-3/gate-decision.md`

### タスク1: MAJOR / MINOR / PASS 判定

**目的**: 観点ごとに重大性を評価し、戻り先を確定する。

**実行手順**:

1. MAJOR 判定基準: 価値性または実現性に欠陥がある場合は MAJOR とし、Phase 2 へ戻す。
2. MAJOR（要件起因）判定基準: 分類インベントリ自体に誤りがある場合は Phase 1 へ戻す。
3. MINOR 判定基準: 整合性・運用性の軽微な wording 調整のみで済む場合は MINOR とし、Phase 4 へ進める。
4. PASS 判定基準: 4 条件すべてが基準を満たしている場合は PASS とし、Phase 4 へ進める。

**期待される成果物**:

- `outputs/phase-3/gate-decision.md`

### タスク2: 受入条件・スコープ・パッチ案の最終確認

**目的**: Phase 4 以降が参照する確定資料を固定する。

**実行手順**:

1. AC-1〜AC-5 が Phase 2 成果物で全て検証可能になっていることを確認する。
2. スコープ / 非スコープが Phase 2 で逸脱していないことを確認する。
3. パッチ案の推奨案（A or B）が明示されていることを確認する。
4. ドライバー設定戦略が「現状維持＋ドキュメント化」で確定していることを確認する。

**期待される成果物**:

- `outputs/phase-3/gate-decision.md`

## ゲート判定基準

| 観点   | 基準                                                               | MAJOR の例                               | MINOR の例             |
| ------ | ------------------------------------------------------------------ | ---------------------------------------- | ---------------------- |
| 価値性 | 構造化ドキュメント破損リスクが排除されている                       | 構造化ファイルに `merge=union` が残存    | コメントの表現が曖昧   |
| 実現性 | パッチが `.gitattributes` として有効、ドライバー登録手順が成立する | `merge=ours` 未登録で `git merge` が失敗 | コメント末尾の整形ズレ |
| 整合性 | AC・分類インベントリ・既完了タスク方針と矛盾しない                 | AC-2 と分類が衝突                        | 表記ゆれ（半角／全角） |
| 運用性 | 新規ファイル追加時に判断順序が再現可能                             | 判断順序が文章化されていない             | 例示ファイル数が不足   |

## 参照資料

| 参照資料                  | パス                                                                             | 内容                  |
| ------------------------- | -------------------------------------------------------------------------------- | --------------------- |
| Phase 1 仕様              | `docs/30-workflows/gitattributes-merge-union-reeval-001/phase-1-requirements.md` | taskType / scope / AC |
| Phase 2 仕様              | `docs/30-workflows/gitattributes-merge-union-reeval-001/phase-2-design.md`       | パッチ案 / 戦略選定   |
| 要件定義書                | `outputs/phase-1/requirements-definition.md`                                     | Phase 1 成果物        |
| 受け入れ基準              | `outputs/phase-1/acceptance-criteria.md`                                         | AC-1〜AC-5            |
| 分類インベントリ          | `outputs/phase-1/file-classification-inventory.md`                               | 分類根拠              |
| マージ戦略設計            | `outputs/phase-2/merge-strategy-design.md`                                       | 戦略選定基準          |
| `.gitattributes` パッチ案 | `outputs/phase-2/gitattributes-patch-proposal.md`                                | A/B 評価と推奨案      |
| ドライバー設定戦略        | `outputs/phase-2/driver-setup-strategy.md`                                       | 実行タイミング方針    |
| 解決策設計書              | `docs/30-workflows/00-task-spec-design-docs/phase-2-solution.md`                 | 原設計との整合確認    |

## 成果物

| 成果物           | パス                               | 内容                                              |
| ---------------- | ---------------------------------- | ------------------------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/gate-decision.md` | 4条件評価、PASS/MINOR/MAJOR、戻り先、最終確認結果 |

## 統合テスト連携【必須】

| 判定項目                                              | 基準 | 結果    |
| ----------------------------------------------------- | ---- | ------- |
| 4 条件評価が記録されている                            | 完了 | pending |
| PASS / MINOR / MAJOR の判定根拠がある                 | 完了 | pending |
| 戻り先（Phase 1 / Phase 2 / Phase 4）が定義されている | 完了 | pending |
| 推奨パッチ案が明示されている                          | 完了 | pending |

## 完了条件

- [ ] 4条件の評価を記録している
- [ ] gate 判定（PASS / MINOR / MAJOR）を記録している
- [ ] 戻り先を定義している
- [ ] AC・スコープ・パッチ案・ドライバー戦略を最終確認している
- [ ] Phase 4 へ進める条件を明示している
