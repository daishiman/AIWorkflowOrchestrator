# Phase 12: 未タスク / 申し送り検出レポート

本タスク実行中に発見された「今回のスコープ外だが将来対応すべき」項目を、タスク化候補として記録する。

## 1. 検出方針

以下 3 方向から「本タスクで対処しきれない項目」を洗い出した:

- **A. Phase 11 MT で発見された Issue**（`discovered-issues.md` 由来）
- **B. 対象外として非ゴール扱いにしたエッジケース**（Phase 3 設計時）
- **C. 本タスクで発見した隣接リファクタ余地**（スコープ外）

## 2. current（今回新規に formalize する候補）

### 2.1 候補 A: MEDIUM DISC-MED-01 → 独立タスク化推奨

| 項目             | 値                                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 発見元           | `outputs/phase-11/discovered-issues.md` MEDIUM                                                                                                                                 |
| 症状             | `.git/config` に `merge.ours.driver` が未登録の状態で `merge=ours` 指定ファイルをマージすると、Git 2.38 系は stderr に警告を出さず default 3-way conflict へフォールバックする |
| 再現条件         | 新規 clone 直後の開発者が `./claude/scripts/setup-merge-drivers.sh` を実行する前に pull/merge を行った場合                                                                     |
| 影響             | MEDIUM（driver 未登録でも期待動作と結果が一致するため実害はないが、誤構成が検出できず気付かないまま長期化するリスク）                                                          |
| 本タスクでの扱い | 範囲外（`.gitattributes` の glob 精緻化が本タスクの主眼で、driver bootstrap 検出は別タスク）                                                                                   |
| 推奨タスク       | **TASK-MERGE-DRIVER-BOOTSTRAP-GUARD-001**（仮称）                                                                                                                              |
| 推奨アクション   | post-merge hook / session-start hook で `git config --get merge.ours.driver` を実行し、未登録なら `setup-merge-drivers.sh` を自動起動 or 警告ログ                              |
| 優先度           | MEDIUM                                                                                                                                                                         |
| 見積             | 実装 0.5d / テスト 0.5d / Phase 11 再実施 0.5d                                                                                                                                 |

**申し送り先候補**:

- `aiworkflow-requirements` skill の `references/unassigned-task.md` に登録
- または `docs/30-workflows/unassigned-task/` 配下に task spec skeleton を作成

## 3. baseline（既知の非ゴール / 継続監視項目）

### 3.1 候補 B: Phase 3 非ゴール受容分（3 件）

| ID     | 項目                                           | 理由                                                                                | タスク化推奨度  |
| ------ | ---------------------------------------------- | ----------------------------------------------------------------------------------- | --------------- |
| NON-01 | `core.attributesfile`（グローバル attributes） | Git の個人設定に依存するため、プロジェクト .gitattributes の責務ではない            | ❌ タスク化不要 |
| NON-02 | サブモジュール内の `.gitattributes`            | 本プロジェクトにはサブモジュールなし（`git submodule status` 空）                   | ❌ 該当なし     |
| NON-03 | symlink 先ファイルの attributes 継承           | Git が symlink そのものに attributes を適用し、リンク先には適用しない挙動は仕様通り | ❌ タスク化不要 |

3 件とも **恒久的に非ゴール** とし、将来のタスク化候補には含めない。

### 3.2 候補 C: 隣接リファクタ余地（本タスクで触れなかった範囲）

| ID     | 項目                                                                         | 推奨度 | 備考                                                                                         |
| ------ | ---------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| ADJ-01 | `docs/` 配下の Markdown にも merge=union 適用の余地あるか再評価              | LOW    | 現状 default 3-way で運用できているため、conflict が頻発した段階で検討                       |
| ADJ-02 | `EVALS.json` の `merge=ours` 指定について、JSON マージ専用 driver 導入の検討 | LOW    | 現状 CI で再生成されるため支障なし                                                           |
| ADJ-03 | `.husky/_/` 配下の自動再生成ファイルを `merge=ours` 対象に追加することの是非 | LOW    | husky 側が install 時に毎回書き換えるため、現状 default 3-way でも conflict が自動解消される |

いずれも実害が顕在化するまでは **タスク化不要**（ウォッチ対象）。

## 4. 総合判定

| 分類         | 件数 | うち即タスク化推奨   |
| ------------ | ---- | -------------------- |
| A (MT 由来)  | 1    | **1（DISC-MED-01）** |
| B (非ゴール) | 3    | 0                    |
| C (隣接)     | 3    | 0                    |
| **合計**     | 7    | **1**                |

## 5. 推奨アクション

### 4.1 即時対応

- [ ] `aiworkflow-requirements` skill の `unassigned-task.md` に **TASK-MERGE-DRIVER-BOOTSTRAP-GUARD-001**（仮称）を登録
  - 内容: post-merge hook または session-start hook で `merge.ours.driver` の登録を検出し未登録なら自動登録 or 警告
  - 根拠: Phase 11 DISC-MED-01
  - 前駆: TASK-CONFLICT-PREVENT-001 / TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001

### 4.2 将来ウォッチ

- ADJ-01/02/03 は本タスク完了後 3〜6 ヶ月間 conflict 発生頻度を観察し、必要に応じて再評価

## 6. 本タスクでの完了範囲確認

| 観点                                                           | 達成                        |
| -------------------------------------------------------------- | --------------------------- |
| `.gitattributes` の `references/*.md merge=union` 一括適用削除 | ✅                          |
| append-only ファイルの個別 glob による `merge=union` 明示      | ✅                          |
| 構造化ファイルの default 3-way 切替                            | ✅                          |
| mirror parity 9/9 維持                                         | ✅                          |
| Phase 11 MT-01..05 全 PASS                                     | ✅                          |
| driver bootstrap 検出（DISC-MED-01）                           | ❌（候補 A として申し送り） |

上記のとおり、DISC-MED-01 以外は本タスク範囲で完結している。
