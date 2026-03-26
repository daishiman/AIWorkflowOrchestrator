# Checkpoint Topology

## checkpoint 種別

| checkpoint type    | 生成タイミング                 | 含む情報                                                            | restore 可否          |
| ------------------ | ------------------------------ | ------------------------------------------------------------------- | --------------------- |
| `review-ready`     | `plan()` 完了後                | plan result、`awaitingUserInput`、route snapshot、source provenance | 可                    |
| `execute-complete` | integrated execute 成功後      | execute result、verify pending、phase artifacts                     | 可                    |
| `verify-fail`      | verify fail 後                 | verify result、nextAction、phase artifacts                          | 可                    |
| `handoff-ready`    | terminal handoff bundle 生成後 | handoff bundle、route snapshot、source provenance                   | 可。bundle 再表示のみ |

## restore flow

1. repository が latest checkpoint を読み込む。
2. compatibility evaluator が version / route / hash / lease / revision を判定する。
3. `compatible` / `compatible_with_warning` の場合のみ hydrate を許可する。
4. engine へ `currentPhase` / `awaitingUserInput` / `verifyResult` / `phaseArtifacts` / `resumeTokenEnvelope` を戻す。
5. `compatible_with_warning` の場合は warning payload を UI へ渡す。
6. `incompatible` / `conflict` の場合は restore を拒否し、explicit reason を返す。

## restore しないもの

- mid-stream tool 実行途中の一時状態
- network retry queue
- external CLI の進行中状態
- raw terminal buffer の完全再構成
- rewind / fork 系の branch state

## stale write guard

| 項目              | ルール                                 |
| ----------------- | -------------------------------------- |
| `revision`        | save 時に expected revision を要求する |
| `ownerInstanceId` | 現 writer を識別する                   |
| `leaseExpiresAt`  | TTL 超過時のみ lease 回収を許可する    |
| `updatedAt`       | 手動監査と cleanup の基準に使う        |

## 推奨保持数

| 項目               | 初回方針         |
| ------------------ | ---------------- |
| latest checkpoint  | 必須 1 件        |
| checkpoint history | optional 0〜2 件 |
| warning history    | optional 0 件    |
| rollback snapshot  | scope 外         |
