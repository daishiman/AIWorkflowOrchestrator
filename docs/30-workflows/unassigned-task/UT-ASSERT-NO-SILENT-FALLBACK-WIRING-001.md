# 未タスク指示書: UT-ASSERT-NO-SILENT-FALLBACK-WIRING-001

```yaml
issue_number: 1488
```

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| タスクID   | UT-ASSERT-NO-SILENT-FALLBACK-WIRING-001                                     |
| 由来       | UT-EXECUTION-ENV-TERMINAL-001 30種思考法レビュー P62 結線検証（2026-03-23） |
| ステータス | unassigned                                                                  |
| 優先度     | 中                                                                          |
| 作成日     | 2026-03-23                                                                  |
| 関連仕様書 | apps/desktop/src/main/ipc/llmConfigProvider.ts                              |

## 目的

`assertNoSilentFallback()` を既存 LLM 呼び出しエントリポイント（`aiHandlers.ts` 等）に結線し、P62 対策を全エントリポイントで統一的に適用する。

## 背景

UT-EXECUTION-ENV-TERMINAL-001 で `assertNoSilentFallback()` 関数を実装・テストしたが、既存の LLM 呼び出しエントリポイント（`aiHandlers.ts` の `AI_CHAT` ハンドラ等）には適用されていない。`aiHandlers.ts` は手動 null チェックで代替しており機能的な fallback は発生しないが、P62 対策の設計意図（全エントリポイントで `assertNoSilentFallback` を呼び出す）は満たされていない。

## 実行タスク

1. `grep -rn "getSelectedLLMConfig" apps/desktop/src/main/` で全 LLM 設定取得箇所を特定
2. 手動 null チェックを `assertNoSilentFallback()` 呼び出しに置換
3. `LLMConfigNotSelectedError` のエラーハンドリングが呼び出し元で適切に処理されることを確認
4. 既存テストを更新

## 受入基準

- [ ] 全 LLM 呼び出しエントリポイントで `assertNoSilentFallback()` が使用されている
- [ ] 手動 null チェックが `assertNoSilentFallback()` に統一されている
- [ ] `LLMConfigNotSelectedError` のエラーハンドリングが呼び出し元で適切に処理されている
- [ ] 既存テストが更新・全 PASS

## 苦戦箇所・知見（親タスクからの引き継ぎ）

- `assertNoSilentFallback()` は同期関数だが `getSelectedLLMConfig()` は async。両者は in-memory 変数 `currentConfig` を参照するため実質的に同期だが、呼び出し元が `await` を使うか否かで使い分けが必要。将来 `getSelectedLLMConfig` が永続化ストアを参照するように変更された場合、`assertNoSilentFallback` も async 化が必要
- `aiHandlers.ts` の既存 null チェックは `getSelectedLLMConfig()` の戻り値を直接検査しているが、`assertNoSilentFallback()` に置換する際は try-catch でのエラーハンドリングパターンに移行する必要がある。IPC レスポンスのエラーフォーマット（`{ success: false, error: { code, message } }`）との整合性に注意
- P62 対策として DEFAULT_CONFIG のコメントアウトを削除済み（親タスクで対応）。fallback 先の定数が存在しないことが最も強い保証となる
