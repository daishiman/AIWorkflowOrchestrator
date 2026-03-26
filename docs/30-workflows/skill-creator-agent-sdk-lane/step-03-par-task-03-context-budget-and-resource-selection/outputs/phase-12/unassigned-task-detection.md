# Unassigned Task Detection

## SF-03 判定パターン

| パターン             | 判定質問                                                                          | owner                                 | 結果     |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------------- | -------- |
| public contract 拡張 | `WorkflowManifest` / IPC response の公開形状を今ここで増やす必要があるか          | Task03 ではなく canonical spec update | 該当なし |
| system spec drift    | `aiworkflow-requirements` の canonical docs を今 wave で更新しないと矛盾が出るか  | Phase 12 Step 2                       | 該当なし |
| governance concern   | custom root の trust scoring / disclosure / approval を新規 task 化すべきか       | Task07                                | 該当なし |
| persistence concern  | provenance snapshot の invalidation / resume compatibility を新規 task 化すべきか | Task08                                | 該当なし |

## 判定

0 件

## 0件の根拠

- public contract は既存の `WorkflowManifestPhase.resourceIds`、`LoadedWorkflowManifest`、`RuntimeSkillCreatorExecuteResponse` を再利用すれば足り、Task03 で新しい公開型を増やす必要がない。
- system spec は既存 canonical docs と現ブランチ実装が整合しており、今回は task spec の再表現なので Step 2 は no-op で成立する。
- custom root の trust / disclosure は Task07 の governance scope に属しており、Task03 から独立新設すると owner が重複する。
- invalidation / resume compatibility は Task08 の persistence scope に属しており、Task03 で切り出すと依存関係が逆転する。

## follow-up を起こす条件

- public field や IPC 形状が追加され、canonical docs 未更新では 4条件の「矛盾なし」が崩れる場合
- trust scoring や resume invalidation が Task07 / Task08 だけでは処理しきれないと判明した場合
