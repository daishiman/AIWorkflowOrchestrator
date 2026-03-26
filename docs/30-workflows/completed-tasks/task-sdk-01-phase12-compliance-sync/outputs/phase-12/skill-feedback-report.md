# Phase 12 Skill Feedback Report

## aiworkflow-requirements

- backlog 完了移管と completed ledger 追加を 1 セットで扱うテンプレートがあると close-out follow-up の判断が速い
- lessons に「解消済み follow-up / 継続中 follow-up / blocker reuse」を分ける表があると再利用しやすい
- runtime hardening を system spec に書く時は「新仕様追加」ではなく「existing contract の current facts 追記」として書き分けると判断しやすい

## task-specification-creator

- `generate-index.js` の phases 配列 / オブジェクト両対応は実コードと test で固定した
- docs-only Phase 11 の placeholder 運用を Phase 11 ガイドに展開すると warning 再発を防ぎやすい
- docs-only follow-up に後からコード変更が入った場合、workflow 本文と `outputs/phase-12/*.md` の narrative を同一ターンで current facts に戻すチェックが必要

## next action

- compile gate PASS と env-blocked test の分離記録を、他の Phase 12 close-out workflow にも横展開する
