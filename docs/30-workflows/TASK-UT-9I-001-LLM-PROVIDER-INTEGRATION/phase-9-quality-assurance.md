# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 9                                           |
| 機能名     | TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION     |
| タスク名   | SkillDocGenerator の LLM プロバイダ連携実装 |
| 前提Phase  | Phase 8 完了（リファクタリング）            |
| 後続Phase  | Phase 10                                    |
| 作成日     | 2026-04-17                                  |
| ステータス | completed                                   |

## 目的

出荷品質を確認する。型チェック・lint・全テスト・カバレッジ・MINOR 指摘解決を一括判定する。

## 実行タスク

1. 型チェックを実行する
2. lint を実行する
3. 全テストを実行する
4. カバレッジ最終確認をする
5. Phase 3 の MINOR 指摘が全て解決されていることを確認する
6. `LLMDocQueryAdapter` の stub 実装が完全に排除されていることを確認する
7. セキュリティチェック（APIキー漏洩）を実施する

## 品質チェックコマンド

```bash
# 型チェック
pnpm --filter @repo/desktop exec tsc --noEmit

# Lint
pnpm --filter @repo/desktop exec eslint src/main/services/llm/ src/main/ipc/

# 全テスト実行
pnpm --filter @repo/desktop exec vitest run

# カバレッジ確認
pnpm --filter @repo/desktop exec vitest run --coverage

# stub 実装排除確認
grep -rn "Generated content for:" apps/desktop/src/main/services/skill/
# 期待: マッチなし（0件）

# APIキー漏洩チェック
grep -rn "api-key\|apiKey" apps/desktop/src/main/ipc/
# 確認: エラーメッセージ・ログに APIキー値が含まれないことを確認
```

## 品質ゲート

| チェック項目                                                              | 合格基準      | 結果 |
| ------------------------------------------------------------------------- | ------------- | ---- |
| `pnpm --filter @repo/desktop exec tsc --noEmit`                           | エラー0       | [ ]  |
| `pnpm --filter @repo/desktop exec eslint src/main/services/llm/`          | エラー0       | [ ]  |
| `pnpm --filter @repo/desktop exec vitest run`                             | 全テスト PASS | [ ]  |
| 新規コードカバレッジ                                                      | 80%以上       | [ ]  |
| `grep -rn "Generated content for:" apps/desktop/src/main/services/skill/` | 0件           | [ ]  |
| Phase 3 MINOR 指摘                                                        | 全解決        | [ ]  |

## リスク台帳

| リスク                    | 発生確率 | 影響度 | 対策                                         |
| ------------------------- | -------- | ------ | -------------------------------------------- |
| Anthropic API 到達不能    | 低       | 高     | タイムアウト30秒 + リトライ3回で対応         |
| APIキー環境変数の設定漏れ | 中       | 高     | `API_KEY_MISSING` エラーコードで明示的に通知 |
| レート制限による連続失敗  | 中       | 中     | 指数バックオフ（1s/2s/4s）で自動回復         |
| 型定義ドリフト（P32）     | 低       | 中     | Phase 8 で単一定義を確認済み                 |

## 統合テスト連携

- SubAgent-D が全チェック項目を最終確認し、品質レポートを生成する

## 多角的チェック観点（AIが判断）

| 観点           | チェック内容                                                            |
| -------------- | ----------------------------------------------------------------------- |
| セキュリティ   | `sanitizeErrorMessage()` が APIキー・スタックトレースをマスクしているか |
| IPC 後方互換性 | 成功パスの IPC 返却形式が変更されていないか                             |
| パフォーマンス | タイムアウト30秒が適切か（LLM生成は5〜30秒が一般的）                    |
| 因果ループ     | エラー→リトライ→過負荷 の強化ループが上限（3回）で抑止されているか      |

## 参照資料

- `phase-3-design-review.md`: MINOR 指摘
- `phase-7-coverage-check.md`: カバレッジ目標
- `phase-8-refactoring.md`: 変更記録と drift 修正方針

## 成果物

- `outputs/phase-9/quality-assurance-report.md`: 品質レポート（全チェック結果・リスク台帳含む）

## 完了条件

- [ ] 型チェック・lint・全テストが PASS
- [ ] `LLMDocQueryAdapter` の stub 実装が完全排除されている
- [ ] Phase 3 の MINOR 指摘が全て解決されている
- [ ] リスク台帳が完成している

## タスク100%実行確認【必須】

- [ ] 型チェック PASS
- [ ] Lint PASS
- [ ] 全テスト PASS
- [ ] カバレッジ 80%以上
- [ ] stub 実装排除確認（0件）
- [ ] Phase 3 MINOR 指摘全解決確認
- [ ] セキュリティチェック（APIキー漏洩なし）確認
- [ ] 品質レポート出力完了

## 次Phase

Phase 10（最終レビューゲート）へ進む。
