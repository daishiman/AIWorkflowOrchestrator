# [#1488] UT-ASSERT-NO-SILENT-FALLBACK-WIRING-001: assertNoSilentFallback の既存LLMエントリポイント結線

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| タスクID   | UT-ASSERT-NO-SILENT-FALLBACK-WIRING-001                       |
| 由来       | UT-EXECUTION-ENV-TERMINAL-001 30種思考法レビュー P62 結線検証 |
| 優先度     | 中                                                            |
| 関連仕様書 | apps/desktop/src/main/ipc/llmConfigProvider.ts                |

## 目的

`assertNoSilentFallback()` を既存 LLM 呼び出しエントリポイント（`aiHandlers.ts` 等）に結線し、P62 対策を全エントリポイントで統一的に適用する。

## 受入基準

- [ ] 全 LLM 呼び出しエントリポイントで `assertNoSilentFallback()` が使用されている
- [ ] 手動 null チェックが `assertNoSilentFallback()` に統一されている
- [ ] `LLMConfigNotSelectedError` のエラーハンドリングが呼び出し元で適切に処理されている
- [ ] 既存テストが更新・全 PASS

## タスク仕様書

`docs/30-workflows/unassigned-task/UT-ASSERT-NO-SILENT-FALLBACK-WIRING-001.md`
