---
name: fixture-orchestration-skill
description: テスト用オーケストレーションスキル
allowed-tools:
  - Bash
  - Read
---

# Orchestration Skill

テスト用オーケストレーションスキル。chain/parallel設定を持つ。

## オーケストレーション設定

| 設定ファイル                | 種別     | 説明         |
| --------------------------- | -------- | ------------ |
| assets/chain-config.yaml    | Chain    | 順次実行設定 |
| assets/parallel-config.yaml | Parallel | 並列実行設定 |
