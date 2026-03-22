# Phase 1: 要件定義

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| Phase    | 1                               |
| タスクID | TASK-SC-08-E2E-TERMINAL-HANDOFF |
| 作成日   | 2026-03-22                      |

## 目的

Skill Creator LLM統合の全フローをE2Eテストするための要件を定義する。TerminalHandoff経路の動作検証と全AC（AC-1〜AC-7）充足確認のシナリオを確定する。

## 実行タスク

1. **E2Eテストシナリオの定義**（5シナリオ）
   - シナリオA: 正常フロー（plan → execute → スキル生成完了）
   - シナリオB: TerminalHandoff 経路（`suggestedCommand` 付きレスポンスの検証）
   - シナリオC: LLMエラー発生時の回復フロー
   - シナリオD: `improve` 機能（既存スキルの改善）
   - シナリオE: 後方互換（既存の `skill:create` チャンネルが引き続き動作すること）

2. **全AC検証マッピングの作成**
   - AC-1: スキルウィザードで LLM モデルを選択できること
   - AC-2: `skill-creator:plan` IPC が正しく動作すること
   - AC-3: 進捗がリアルタイムでUIに表示されること
   - AC-4: `skill-creator:execute` IPC が正しく動作すること
   - AC-5: 生成されたスキルがファイルシステムに保存されること
   - AC-6: エラー時に適切なメッセージが表示されること
   - AC-7: TerminalHandoff の `suggestedCommand` が正しく返却されること
   - シナリオA〜Eと各ACの対応表を作成する

3. **NFR（非機能要件）検証項目の定義**
   - NFR-1（セキュリティ）: IPC経由で機密情報が漏洩しないこと
   - NFR-2（パフォーマンス）: plan が 30秒以内、execute が 120秒以内に完了すること
   - NFR-3（後方互換）: 既存APIが破壊されないこと
   - NFR-4（エラー耐性）: LLMエラー後にアプリがクラッシュしないこと

4. **前提タスクの完了確認**
   - タスク04（スキル出力永続化）の完了確認
   - タスク05（improve LLM）の完了確認
   - タスク06（UI-Runtime接続）の完了確認

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/index.md`（全体仕様）
- `docs/30-workflows/skill-creator-llm-integration/04-sc-output-persistence/`
- `docs/30-workflows/skill-creator-llm-integration/05-sc-improve-llm/`
- `docs/30-workflows/skill-creator-llm-integration/06-sc-ui-runtime-connection/`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-skill-creator.md`

## 成果物

- 本ドキュメント（Phase 1 要件定義書）
- E2Eテストシナリオ一覧（5シナリオ × AC対応表）
- NFR検証項目一覧

## 完了条件

- [ ] 5つのE2Eテストシナリオ（A〜E）が定義されている
- [ ] シナリオと AC-1〜AC-7 の対応表が作成されている
- [ ] NFR-1〜NFR-4 の検証項目が定義されている
- [ ] パフォーマンス基準（plan 30秒以内 / execute 120秒以内）が明記されている
- [ ] 前提タスク（04/05/06）の完了確認方法が定義されている

## 次のPhase

Phase 2: 設計
