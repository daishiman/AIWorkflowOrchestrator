---
name: fixture-complete-skill
description: |
  テスト用完全構成スキル - skill-creator出力検証用フィクスチャ。
  全ディレクトリ（agents/, references/, scripts/, assets/, schemas/）を含む完全な構造。

  Anchors:
  * Clean Code (Robert C. Martin) / 適用: コード品質 / 目的: テスト可能な構造設計
  * Test-Driven Development (Kent Beck) / 適用: テスト駆動 / 目的: フィクスチャ検証

  Trigger:
  fixture validation, complete skill test, skill-creator output verification
version: 1.0.0
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Fixture Complete Skill

テスト用完全構成スキル。skill-creatorが生成するスキルの全ディレクトリ構造を再現する。

## ワークフロー

| Phase | タスク         | 実行パターン | 入力               | 出力       |
| ----- | -------------- | ------------ | ------------------ | ---------- |
| 1     | リクエスト分析 | Sequential   | ユーザーリクエスト | 構造化要件 |
| 2     | コード生成     | Sequential   | 構造化要件         | 生成コード |

## Task仕様ナビ

| エージェント     | ファイル                  | 呼び出し条件           |
| ---------------- | ------------------------- | ---------------------- |
| Request Analyzer | agents/analyze-request.md | リクエスト分析が必要時 |
| Code Generator   | agents/generate-code.md   | コード生成が必要時     |

## ベストプラクティス

| すべきこと   | 避けるべきこと     |
| ------------ | ------------------ |
| 入力の構造化 | 曖昧な要件での実行 |
| 段階的な検証 | 一括処理           |

## リソース参照

| リソース     | パス                            | 用途             |
| ------------ | ------------------------------- | ---------------- |
| 概要         | references/overview.md          | スキル全体像     |
| 品質基準     | references/quality-standards.md | 品質チェック     |
| テンプレート | assets/skill-template.md        | 出力テンプレート |
