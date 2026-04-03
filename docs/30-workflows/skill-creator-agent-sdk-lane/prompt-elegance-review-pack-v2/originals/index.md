# Prompt Elegance Review Pack v2

## 目的

`skill-creator-agent-sdk-lane` の変更分を、30種の思考法で検証し、SubAgent に分割して実行できる形へ落とし込むための原本パック。

## 構成

| ファイル                                                                                   | 役割                                      |
| ------------------------------------------------------------------------------------------ | ----------------------------------------- |
| [prompt-elegance-review-summary.md](./prompt-elegance-review-summary.md)                   | 変更差分の要点と改善論点の統合サマリー    |
| [prompt-elegance-review-improved.md](./prompt-elegance-review-improved.md)                 | そのまま実行に渡せる改善版プロンプト      |
| [prompt-elegance-review-operational-pack.md](./prompt-elegance-review-operational-pack.md) | SubAgent 分割と並列実行を前提にした運用版 |

## 読み方

1. まず summary で論点を固定する
2. 次に improved で要求とフェーズを整える
3. 最後に operational pack を SubAgent へ渡す

## 使い方

- 変更分の skill 準拠検証は `task-specification-creator` の観点で確認する
- 正本仕様との突合は `aiworkflow-requirements` の current facts で確認する
- 30思考法は並列分析に集約し、改善実行は結果消費に限定する
