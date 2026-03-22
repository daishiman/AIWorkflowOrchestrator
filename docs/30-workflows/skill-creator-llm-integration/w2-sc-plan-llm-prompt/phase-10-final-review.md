# Phase 10: 最終レビュー

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 10                         |
| タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日   | 2026-03-22                 |

## 目的

多角的な品質・整合性検証を行い、AC-1（自然言語 → 構造計画）および AC-4（TerminalHandoff 非破壊）が充足されていることを確認する。PASS / MINOR / MAJOR / CRITICAL の判定を行う。

## 実行タスク

1. **AC-1 検証**
   - 自然言語入力テキストを受け取り、skillName / description / agents / scripts / triggers / anchors を含む構造計画が返ることを確認する
   - LLM 呼び出しが行われ、レスポンスが適切にパースされることをテストログで確認する
2. **AC-4 検証**
   - integrated_api モードが false の場合、plan() が terminal_handoff レスポンスを返すことを確認する
   - LLM 呼び出しが行われないことを確認する
   - 既存の terminal_handoff テストが全て Green であることを確認する
3. **FR-1 対応確認**
   - 機能要件 FR-1 の全項目と実装の対応を確認する
4. **セキュリティレビュー**
   - プロンプトに API キーや PII が含まれていないことを確認する（P33 対策）
   - ResourceLoader が読み込むファイルパスにパストラバーサルの余地がないことを確認する
5. **コード品質最終確認**
   - `any` 型・`@ts-ignore` の残存がないことを確認する
   - P19 / P49 の anti-pattern が残存していないことを確認する
   - DIP が遵守されている（AnthropicAdapter の引数型がインターフェース）ことを確認する（P61 対策）
6. 判定を記録し、MINOR 指摘は未タスク化する

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/03-phase-09-quality-verification.md`
- `packages/shared/src/types/skillCreator.ts`（型定義確認）
- `.claude/rules/04-electron-security.md`（セキュリティ確認）

## 成果物

- `docs/30-workflows/skill-creator-llm-integration/03-phase-10-review-output.md`（最終レビュー結果）
  - 判定: PASS / MINOR / MAJOR / CRITICAL
  - AC-1 / AC-4 充足確認
  - 指摘事項リスト（MINOR は未タスク化必須）

## 完了条件

- [ ] AC-1（自然言語 → 構造計画）が充足されていることを確認した
- [ ] AC-4（TerminalHandoff 非破壊）が充足されていることを確認した
- [ ] FR-1 の全項目と実装の対応を確認した
- [ ] セキュリティ（API キー非漏洩・パストラバーサル防止）を確認した
- [ ] `any` 型・P19・P49 の anti-pattern がないことを確認した
- [ ] DIP 遵守（インターフェース依存）を確認した（P61 対策）
- [ ] 判定（PASS / MINOR / MAJOR / CRITICAL）を記録した
- [ ] MINOR 指摘がある場合は未タスク化した

## 次のPhase

Phase 11: 手動テスト
