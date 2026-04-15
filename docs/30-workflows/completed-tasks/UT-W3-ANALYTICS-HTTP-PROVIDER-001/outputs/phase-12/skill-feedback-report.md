# スキルフィードバックレポート - UT-W3-ANALYTICS-HTTP-PROVIDER-001

## 結論

改善点はある。`aiworkflow-requirements` と `task-specification-creator` の両方で、Phase 12 close-out の current facts と成果物数をもっと機械的に揃えられる。

## フィードバック

| 対象スキル                   | 観察                                                                                                | next action                                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `aiworkflow-requirements`    | analytics IPC の current contract が `analytics:send` のみだと、stats API と count state が見落ちる | `api-ipc-system-core.md` の current contract に `analytics:get-stats` と `AnalyticsHttpProvider` を必ず並記する |
| `aiworkflow-requirements`    | `ANALYTICS_ENDPOINT_URL` の扱いが production-only 前提だと current implementation とずれる          | `environment-variables.md` を「設定があれば送る、なければ no-op」に揃える                                       |
| `task-specification-creator` | Phase 12 の成果物チェックは 6 件固定だが、root/outputs の parity 失念が起こりやすい                 | `artifacts.json` と `outputs/artifacts.json` の両方を必須チェックにする                                         |
| `task-specification-creator` | `planned wording` の残存チェックは有効だが、analytics 系の current contract drift も見たい          | `implementation-guide.md` に `skipped` / `sentCount` / `failedCount` の確認項目を追加する                       |

## 改善方針

- current facts は「送信」「stats」「counts」の 3 点をセットで扱う
- Phase 12 の完了判定は、成果物 6 件に加えて artifacts parity を必須にする
- stats API があるタスクでは、change log と lesson file にも明示する

## skill-creator への反映

なし。今回は新しいスキル構造は導入していない。
