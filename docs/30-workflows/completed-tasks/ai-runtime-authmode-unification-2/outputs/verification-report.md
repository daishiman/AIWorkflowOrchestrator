# 互換ブリッジ検証メモ

> 更新日: 2026-03-20
> 対象: `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification-2/`

## 状態

このディレクトリは current workflow ではない。旧 `ai-runtime-authmode-unification` 参照の互換維持を目的とした bridge であり、`verify-all-specs.js` の対象 root としては扱わない。

## 現行 canonical

- parent pack: `docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md`
- standalone Task01: `docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/README.md`
- system spec entrypoint: `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md`

## 今回の是正内容

- bridge 配下の README / index / phase-3 / phase-4 / phase-6 / phase-10 から、削除済み旧 authmode root への参照を除去した
- current parent pack と standalone Task01 を参照する互換導線へ更新した
- 旧 FAIL レポートは stale だったため、bridge 用の案内メモへ置換した

## 運用ルール

1. bridge ディレクトリは validator の current 対象にしない。
2. current 実体の確認は standalone Task01 と parent pack で行う。
3. 旧パス互換が不要になった時点で bridge 全体を整理対象とする。
