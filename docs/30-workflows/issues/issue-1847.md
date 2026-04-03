# [#1847] "[UT-SAFETY-GOV-DISCLOSURE-PAYLOAD-RUNTIME-COMPLETION-001] disclosure payload の runtime 完全化"

## メタ情報

```yaml
task_id: UT-SAFETY-GOV-DISCLOSURE-PAYLOAD-RUNTIME-COMPLETION-001
task_name: disclosure payload の runtime 完全化
category: 改善
target_feature: ExecutionConsole disclosure payload
priority: 低
scale: 小規模
status: 未実施
source_phase: Phase 12
created_date: 2026-04-02
dependencies: [UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001]
spec_path: docs/30-workflows/unassigned-task/UT-SAFETY-GOV-DISCLOSURE-PAYLOAD-RUNTIME-COMPLETION-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

`UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001` で `aiServiceName` の runtime 注入は実装されたが、
`modelName` は `DISCLOSURE_MODEL_NAME = "claude-sonnet-4-6"` の固定値、
`externalDestinations` は空配列固定のままである。

この状態でも最低限の disclosure は成立するが、元要求の
`provider / model / destination` を runtime から反映する目標には未達であり、
実設定と UI 表示が再び乖離する余地が残る。

## 2. 何を達成するか（What）

disclosure payload のうち未固定部分である `modelName` と `externalDestinations` を
runtime / provider config / execution context から安全に解決できるようにする。

### 受入基準

- `modelName` が current runtime の selected model と一致する
- `externalDestinations` が current contract 上の送信先種別を返す
- API key / token / credential は引き続き返さない
- `disclosureHandlers.test.ts` または追加テストで新 payload を検証する
- implementation-guide / system spec に current facts を反映する

## 3. どのように実行するか（How）

1. `modelName` の正本となる runtime source を特定する
   - auth mode ではなく provider / model 選択状態の取得元を調査する
2. `externalDestinations` の current contract を定義する
   - 空配列を返している理由と、将来返すべき種別一覧を切り分ける
3. disclosure builder に必要な dependency を追加する
4. DENY-5 を維持したまま unit test / integration evidence を更新する
5. Phase 12 outputs と system spec を same-wave sync する

## 4. 苦戦箇所の記録

### `authMode` だけでは payload 全体の正本にならない

- 問題:
  `aiServiceName` は `authModeService` から導けるが、`modelName` と `externalDestinations` は別の state/source に分散している
- 難しさ:
  runtime source を増やすほど disclosure builder の依存が増え、DENY-5 を守りながらどこまで公開してよいかの境界設計が必要になる
- 将来の簡潔解法:
  disclosure payload を `provider summary` と `secret-bearing config` に分離し、前者だけを返す専用 resolver を導入する
