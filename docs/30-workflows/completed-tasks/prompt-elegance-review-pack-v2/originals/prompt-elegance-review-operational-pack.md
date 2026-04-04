# Prompt Elegance Review Operational Pack

## Orchestrator Prompt

以下をそのまま SubAgent に切り分けて実行する。

### 共通前提

- 日本語で出力する
- `task-specification-creator` と `aiworkflow-requirements` を正本として扱う
- 変更分の skill 準拠を最優先にする
- 30種の思考法を分析に使う
- コミット、PR、push はしない

### SubAgent A: skill 準拠検証

目的:

- 変更分が 2 つの skill 定義に漏れなく準拠しているか検証する

確認項目:

- 必須項目の漏れ
- 参照切れ
- 4条件の矛盾
- path の canonicality
- channel 定義の整合

出力:

- file:line 付き findings
- 重大度
- 修正候補

### SubAgent B: 30思考法分析

目的:

- 変更分を 30種の思考法で多角的に分析する

分析視点:

- 論理
- 構造
- メタ
- 発想
- システム
- 戦略
- 問題解決

出力:

- 思考法別の短評
- エレガントな改善案
- patch か再構成かの仮説

### SubAgent C: 改善実行

目的:

- 検証結果と分析結果に基づき、最小複雑性の修正を実施する

実行ルール:

- 依存のないものは並列
- 依存があるものは直列
- 参照、名称、成果物を同じ wave で揃える
- 破棄再構成が必要なら、先に報告する

### 最終ゲート

- 矛盾なし
- 漏れなし
- 整合性あり
- 依存関係整合

### 期待する最終報告

1. 修正した内容
2. 残ったリスク
3. 実行した検証コマンド
4. 追加で必要な作業
