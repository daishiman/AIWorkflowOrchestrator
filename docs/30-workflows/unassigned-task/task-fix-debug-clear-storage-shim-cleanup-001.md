# UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001: debug-clear-storage shim / stale comment / screenshot preflight のクリーンアップ

## メタ情報

```yaml
issue_number: 1127
task_id: UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001
task_name: debug-clear-storage shim / stale comment / screenshot preflight のクリーンアップ
category: 改善
target_feature: debug-clear-storage 関連の repo-wide 後始末
priority: 低
scale: 中規模
status: 未実施
source_phase: TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 Phase 12
created_date: 2026-03-10
```

| 項目         | 値                                                                               |
| ------------ | -------------------------------------------------------------------------------- |
| タスクID     | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001                                      |
| タスク名     | debug-clear-storage shim / stale comment / screenshot preflight のクリーンアップ |
| 分類         | 改善                                                                             |
| 対象機能     | debug-clear-storage 周辺の補助コードと文書                                       |
| 優先度       | 低                                                                               |
| 見積もり規模 | 中規模                                                                           |
| ステータス   | 未実施                                                                           |
| 発見元       | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 Phase 12                               |
| 発見日       | 2026-03-10                                                                       |

## 1. なぜこのタスクが必要か（Why）

`debug-clear-storage` 修正後も repo 全体に shim 前提のコメント、スクリーンショット前処理、暫定コードが残っていると、実装とドキュメントが再び乖離する。

## 2. 何を達成するか（What）

- `debug-clear-storage` workaround の残骸を棚卸しする
- 不要な shim / comment / preflight を削除または現行仕様へ更新する
- task-workflow と lessons-learned に後始末完了を反映する

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001` の完了証跡を参照できること
- screenshot harness / debug utility の配置を把握していること

### 3.2 依存タスク

- `TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001`

### 3.3 推奨アプローチ

1. `rg` で `debug-clear-storage` と関連コメントを横断検索する
2. 実装依存の残骸と、仕様説明として必要な記述を分離する
3. 不要なものだけを除去し、必要なものは現行仕様へ書き換える

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                     | 解決策                           | 教訓                                                        |
| ---------------------------------------- | -------------------------------- | ----------------------------------------------------------- |
| 一時対応の痕跡が複数レイヤに散在しやすい | 実装・テスト・文書を一括監査する | fix 完了後に cleanup 専用の未タスクを切ると取りこぼしが減る |

## 4. 実行手順

1. `rg -n "debug-clear-storage|clear storage shim|preflight"` で候補を洗い出す
2. 残すべき説明と削除対象を分類する
3. コード・ドキュメント・スクリーンショット補助スクリプトを更新する
4. workflow / lessons-learned / LOGS を同期する

## 5. 完了条件チェックリスト

- [ ] repo-wide の `debug-clear-storage` 残骸が棚卸し済み
- [ ] 不要な shim / comment / preflight が整理済み
- [ ] 仕様書とタスク記録が現行状態に同期済み

## 6. 検証方法

```bash
rg -n "debug-clear-storage|clear storage shim|preflight" .
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <target-workflow>
```

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                   |
| -------------------------------- | ------ | -------- | -------------------------------------- |
| まだ必要な補助コードまで削除する | 中     | 中       | 実行経路を確認してから削除する         |
| 文書だけ古いまま残る             | 中     | 高       | system spec と workflow を同時更新する |

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/`

## 9. 備考

cleanup 専用タスクとして扱い、元 fix タスクの完了証跡とは分離して追跡する。
