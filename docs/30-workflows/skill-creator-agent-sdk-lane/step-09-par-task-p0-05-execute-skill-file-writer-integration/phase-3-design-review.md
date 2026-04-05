# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目      | 内容               |
| --------- | ------------------ |
| Phase     | 3                  |
| Phase名   | 設計レビューゲート |
| カテゴリ  | ゲート             |
| 前提Phase | Phase 2            |
| 後続Phase | Phase 4            |

## 目的

Phase 2 の設計（統合トポロジー/責務境界/skillName方針）が、現行実装とテスト構成に一致していることを確認する。
不一致がある場合は Phase 2 に差し戻す。

## レビュー観点（Current Facts）

### 1. 統合トポロジーの一致

- `RuntimeSkillCreatorFacade.execute()` 内の正式パスは `parseLlmResponseToContent + SkillFileWriter.persist`
- `persist-integration.test.ts` は 22件（`F-01〜F-06`, `E-10〜E-16`, `E-21〜E-29`）で、この統合パスを保護する

### 2. skillName 方針の一致

- Decision: `planResult.skillName` は **raw pass-through**
- バリデーション（空/パストラバーサル/NULLバイト等）は Writer 側で拒否する前提

### 3. OutputHandler の責務境界

- `SkillCreatorOutputHandler` は `SkillCreatorIpcBridge` 経由の別系統パイプライン
- `toSlug()` は path-safe 前提（`/` `\\` `..` `\\0` 無効化、空は `unnamed-skill`）
- 本タスク（TASK-P0-05）は OutputHandler を「統合先」とは扱わず、誤解防止のための明文化のみ対象

## 判定基準

| 判定     | 条件                                                                     |
| -------- | ------------------------------------------------------------------------ |
| PASS     | 設計と実装/テストが整合し、Phase 4 に進行可能                            |
| MINOR    | 文言/ドキュメント上の軽微な不足のみ（Phase 4 へ進行し、Phase 12 で補正） |
| MAJOR    | 設計と実装/テストが不一致（Phase 2 へ差し戻し）                          |
| CRITICAL | 要件レベルの矛盾（Phase 1 へ差し戻し）                                   |

## 成果物

| 成果物             | 配置先                                     | 形式     |
| ------------------ | ------------------------------------------ | -------- |
| ゲート判定（簡易） | `outputs/phase-3/gate-decision.md`（任意） | Markdown |
