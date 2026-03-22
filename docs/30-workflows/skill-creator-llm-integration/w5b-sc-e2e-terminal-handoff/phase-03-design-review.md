# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| Phase    | 3                               |
| タスクID | TASK-SC-08-E2E-TERMINAL-HANDOFF |
| 作成日   | 2026-03-22                      |

## 目的

Phase 2 のE2Eテスト設計を多角的にレビューし、全AC/NFRのカバレッジ網羅性と技術的実現可能性を検証する。PASS / MINOR / MAJOR の判定を行う。

## 実行タスク

1. **テストシナリオの網羅性確認**
   - シナリオA〜Eが AC-1〜AC-7 を全て網羅しているか確認する
   - 各ACとシナリオのマッピングに抜けがないか確認する
   - NFR-1〜NFR-4 の検証方法が全て設計されているか確認する

2. **IPC レスポンス形式の整合性確認**（P60対策）
   - 設計した IPC レスポンス形式が実際の実装と一致するか確認する
   - テストのアサーション形式（`result.error.code` vs `result.code`）が一貫しているか確認する

3. **テストインフラの実現可能性確認**
   - LLMモックが E2Eレベルで使用可能か確認する
   - IPC統合テストが `apps/desktop` の vitest 環境で動作可能か確認する（P40対策）
   - タイムアウト設定（150,000ms）が Vitest で機能するか確認する

4. **TerminalHandoff 検証の完全性確認**
   - `suggestedCommand` の形式検証（CLI実行可能な文字列形式）の基準が明確か確認する
   - TerminalHandoff が返却されない場合（通常フロー）も正しくテストされているか確認する

5. **後方互換テストの妥当性確認**
   - 既存 `skill:create` チャンネルの動作確認テストが設計されているか確認する

6. **総合判定**
   - PASS: Phase 4 へ
   - MINOR: 指摘対応後 Phase 4 へ
   - MAJOR（設計問題）: Phase 2 へ戻る

## 参照資料

- Phase 2 設計書: `phase-02-design.md`
- `.claude/rules/06-known-pitfalls.md` (P40, P60)
- `.claude/rules/05-task-execution.md` (Phase 3 レビューゲート)

## 成果物

- 設計レビュー結果レポート（PASS / MINOR / MAJOR 判定と指摘事項）

## 完了条件

- [ ] シナリオA〜Eが AC-1〜AC-7 を全て網羅していることが確認されている
- [ ] NFR-1〜NFR-4 の検証方法が全て設計されていることが確認されている
- [ ] IPC レスポンス形式の整合性が確認されている（P60対策）
- [ ] テストインフラの実現可能性が確認されている
- [ ] TerminalHandoff 検証の完全性が確認されている
- [ ] PASS / MINOR / MAJOR の判定が記録されている

## 次のPhase

Phase 4: テスト作成
