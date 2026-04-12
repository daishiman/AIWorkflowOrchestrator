# 未タスク指示書: UT-W2-03B-ROOT-LEDGER-SYNC-001

## メタ情報

```yaml
issue_number: 2095
task_id: UT-W2-03B-ROOT-LEDGER-SYNC-001
task_name: W2-seq-03b 完了後の root ledger 同期
category: 改善
target_feature: artifacts.json/ledger-sync
priority: 高
scale: 小規模
status: 未実施
created_date: 2026-04-11
dependencies: [UT-SKILL-WIZARD-W2-seq-03b]
```

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| タスクID   | UT-W2-03B-ROOT-LEDGER-SYNC-001                           |
| 由来       | UT-SKILL-WIZARD-W2-seq-03b Phase 12 未タスク検出レポート |
| ステータス | 未実施                                                   |
| 優先度     | 高                                                       |
| 作成日     | 2026-04-11                                               |
| 関連仕様書 | `outputs/phase-12/unassigned-task-detection.md`          |

## 目的

`artifacts.json`（repo root）と `outputs/artifacts.json`（worktree root）を UT-SKILL-WIZARD-W2-seq-03b の実装完了状態に同期させ、Phase 12 の parity check を完全合格させる。

## 背景

W2-seq-03b の Phase 12 完了時、`unassigned-task-detection.md` にて下記の `ledger parity: FAIL` が記録された。

| 観点          | 判定 | 根拠                                           |
| ------------- | ---- | ---------------------------------------------- |
| ledger parity | FAIL | root ledger が current task に同期されていない |

具体的には以下の2ファイルが current task の実装内容を反映していない状態:

- `{repo_root}/artifacts.json` — トップレベル台帳。current task のエントリが旧 task のまま
- `outputs/artifacts.json` — worktree root 台帳。Phase 1〜12 の status が未更新

この状態が続くと、以降の close-out 時に「何が正本か」がぶれ、自動判定ツールや CI の誤検知を招く。

### 苦戦箇所（W2-seq-03b より引き継ぎ）

- stash pop コンフリクトにより `unassigned-task-detection.md` にテーブルが重複記載された。root ledger 同期漏れは同コンフリクト解消時（ours 採用）に台帳側の更新が欠落したことが原因と推測される
- `outputs/artifacts.json` と `docs/30-workflows/W2-seq-03b-wizard-exports/artifacts.json` の二重管理が生じており、どちらを正本とするか判断が必要

## 実行タスク

1. `{repo_root}/artifacts.json` 内の UT-SKILL-WIZARD-W2-seq-03b エントリを確認する
2. エントリが存在しない場合は Phase 1〜12 の status を `confirmed` で新規追加する
3. `outputs/artifacts.json` の全 Phase status を `confirmed` に更新する
4. `docs/30-workflows/W2-seq-03b-wizard-exports/artifacts.json` と `outputs/artifacts.json` の parity を確認する
5. 3ファイル間の parity check を実行し、全項目が一致することを確認する
6. `outputs/phase-12/unassigned-task-detection.md` の `ledger parity` 観点を PASS に更新する

## 参照資料

| 参照資料                      | パス                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| Phase 12 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`                                       |
| outputs/artifacts.json        | `outputs/artifacts.json`                                                              |
| タスク artifacts.json         | `docs/30-workflows/W2-seq-03b-wizard-exports/artifacts.json`                          |
| FB-04 三者同期チェックリスト  | `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001.md` |

## 受入基準

- [ ] `{repo_root}/artifacts.json` に UT-SKILL-WIZARD-W2-seq-03b のエントリが存在する
- [ ] `outputs/artifacts.json` の Phase 1〜12 status がすべて `confirmed`
- [ ] `docs/30-workflows/W2-seq-03b-wizard-exports/artifacts.json` と parity が一致する
- [ ] `outputs/phase-12/unassigned-task-detection.md` の `ledger parity` 観点が PASS
- [ ] 3ファイル間で task_id / phase status / completion_date が整合する

## 注意事項

- **コミット・PR禁止**: ユーザー指示があるまで git commit / push は実施しないこと
- `outputs/artifacts.json` の stash pop 重複記載（同テーブルが2回）は本タスクで整理してよい
- FB-04（UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001）は Phase 12 テンプレートへのチェックリスト追加タスクであり、本タスクとは別目的。混同しないこと
