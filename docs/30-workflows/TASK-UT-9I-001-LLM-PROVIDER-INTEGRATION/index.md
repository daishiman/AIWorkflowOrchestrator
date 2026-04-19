# TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION - タスク実行仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| 機能名     | TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION            |
| タスクID   | UT-9I-001                                          |
| 作成日     | 2026-04-18                                         |
| ステータス | in_progress                                        |
| 総Phase数  | 13                                                 |
| タスク種別 | docs-only / NON_VISUAL                             |
| 関連Issue  | #2158 (調査レポート: TASK-05-SOURCE-INVESTIGATION) |
| 親タスク   | TASK-9I (完了)                                     |

---

## タスク概要

`SkillDocGenerator` の docs 生成経路を、`LLMDocQueryAdapter` → `LLMClient` → `AnthropicProvider` に置換し、本番品質のドキュメント生成経路を確立する。

Issue #2158（TASK-05-SOURCE-INVESTIGATION）の調査により以下が判明した課題を解決対象として扱う。

- `LLMDocQueryAdapter.ts` の stub 実装が本番で使用中（擬似レスポンスのみ返却）
- エラー分類コードが未定義（API_KEY_MISSING / RATE_LIMIT / SERVER_ERROR 等）
- LLM クライアントモジュールが未実装

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | completed  |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | completed  |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | completed  |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | completed  |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | completed  |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | completed  |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed  |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | completed  |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | blocked    |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | blocked    |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------ |
| 1     | 要件定義書、受け入れ基準、エラー分類コード表、プロバイダ選定結果                                                         |
| 2     | アーキテクチャ設計、LLMClientモジュール設計、DI注入設計、IPC契約設計                                                     |
| 3     | 設計レビュー結果、ゲート判定                                                                                             |
| 4     | テスト仕様書、TDD Red結果（LLMClient単体テスト、IPC統合テスト）                                                          |
| 5     | 実装サマリー、変更ファイル一覧                                                                                           |
| 6     | 拡張テストケース（リトライ、レート制限、タイムアウト）                                                                   |
| 7     | カバレッジレポート                                                                                                       |
| 8     | リファクタリング計画と実施結果                                                                                           |
| 9     | 品質保証レポート                                                                                                         |
| 10    | 最終レビュー結果、出荷準備チェック                                                                                       |
| 11    | 手動テスト結果（NON_VISUAL）                                                                                             |
| 12    | 実装ガイド、システム仕様更新サマリー、ドキュメント更新履歴、未タスク検出、スキルフィードバック、コンプライアンスチェック |
| 13    | PR情報、ローカル確認結果、変更サマリー、PR作成結果                                                                       |

---

## 実装サマリー（既知の実装対象）

- `apps/desktop/src/main/services/llm/LLMClient.ts` — タイムアウト・指数バックオフリトライを提供するLLM Facade
- `apps/desktop/src/main/services/llm/providers/AnthropicProvider.ts` — Anthropic Claude API への直接呼び出し
- `LLMDocQueryAdapter.ts` — stub 実装を本番 LLMClient 委譲に置換
- `SkillDocGenerator.ts` — 新アダプタへの接続
- IPC 層 (`skillHandlers.ts` / `index.ts`) — 薄い wiring 実装

---

_このファイルは task-specification-creator skill によって生成されました。_
_最終更新: 2026-04-18T10:30:00Z_
