# TASK-TSC-NON-VISUAL-PARITY-VALIDATOR-001

## メタ情報

```yaml
issue_number: 2274
```

## メタ情報

| 項目       | 値                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------- |
| タスクID   | TASK-TSC-NON-VISUAL-PARITY-VALIDATOR-001                                                       |
| 機能名     | tsc-non-visual-parity-validator                                                                |
| ステータス | open（未着手）                                                                                 |
| 作成日     | 2026-04-18                                                                                     |
| 親タスク   | なし                                                                                           |
| 優先度     | Low                                                                                            |
| タスク種別 | docs/skill-improvement（スキル改善）                                                           |
| 関連Issue  | #2274                                                                                          |
| ソース     | FB-TSC-002（TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001 Phase 12 skill-feedback-report） |

## 概要

`task-specification-creator` スキルの Phase 12 Step 6（準拠チェック）において、`artifacts.json` の `root / outputs` parity 確認は「存在確認」にとどまっており、存在時の `status` 差分を機械的に比較する手順が定義されていない。

NON_VISUAL タスクの close-out フローに、root と outputs の artifacts.json を validator で比較する標準手順を追加し、parity drift の見落とし防止を実現する。

## スコープ

### 含む

- Phase 12 Step 6 への parity validator 実行手順の追加
- `artifacts.json` の root/outputs status 比較コマンドまたはスクリプトの定義
- NON_VISUAL タスクの Phase 12 チェックリストへの「status 比較」項目追加

### 含まない

- artifacts.json のスキーマ変更
- Phase 12 以外のフェーズへの変更
- NON_VISUAL 以外のタスク種別への適用

## 受入基準

| ID   | 基準                                                                                   |
| ---- | -------------------------------------------------------------------------------------- |
| AC-1 | Phase 12 Step 6 に「root / outputs artifacts.json の status 比較」手順が明示されている |
| AC-2 | 比較コマンドまたはスクリプトの例がテンプレートに記載されている                         |
| AC-3 | parity drift を検出した場合の対処手順（どちらを正とするか）が記述されている            |

## 苦戦箇所（発見元コンテキスト）

`TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001` の close-out 作業で判明した課題:

1. **parity drift の遅延検知**: `outputs/artifacts.json` の status が root 側と一致しているか確認する際、ファイルの存在確認は自動化されているが、各 phase の `status` 値を比較する手順が標準化されていなかった。手動確認に依存していたため見落とし発生リスクがあった。
2. **解決策**: Phase 12 準拠チェックに validator 実行（例: `diff <(jq '.phases | to_entries[] | .value.status' artifacts.json) <(jq '.phases | to_entries[] | .value.status' outputs/artifacts.json)`）を標準手順として追加する。
