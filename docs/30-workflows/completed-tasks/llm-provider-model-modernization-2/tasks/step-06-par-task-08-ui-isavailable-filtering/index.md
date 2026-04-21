# Task08: UI isAvailable フィルタリング実装

## メタ情報

| 項目         | 値                                              |
| ------------ | ----------------------------------------------- |
| タスクID     | TASK-LLM-MOD-08                                 |
| 責務         | UI lane（Renderer コンポーネント）              |
| 実行順序     | step-06-par（step-05 完了後、step-07 と並列可） |
| 依存先       | TASK-LLM-MOD-06（OpenAICompatibleAdapter）      |
| ブロック対象 | なし                                            |
| ステータス   | 実装済み                                        |

## 目的

チャット画面のモデル選択ドロップダウン（`InlineModelSelector`）で、APIキー未設定プロバイダーを非表示にする。設定画面（`ProviderSelector`）は全プロバイダーを表示（グレーアウト+「APIキー未設定」バッジ）する既存動作を維持する。P62（DEFAULT_CONFIG fallback 禁止）の精神を継承し、ユーザーが明示的に選択していないプロバイダー/モデルでリクエストが送信されることを防止する。

## 対象ファイル

| ファイル                                                           | 変更内容                 |
| ------------------------------------------------------------------ | ------------------------ |
| `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` | isAvailable フィルタ追加 |

## UI 動作の使い分け

| コンポーネント      | 用途                 | APIキー未設定の扱い                          |
| ------------------- | -------------------- | -------------------------------------------- |
| InlineModelSelector | チャット画面ヘッダー | 完全非表示                                   |
| ProviderSelector    | 設定画面             | グレーアウト表示（設定できるようにするため） |
| LLMSelectorPanel    | LLM設定パネル        | ProviderSelector に委譲（グレーアウト）      |

## 受入基準

| ID    | 受入基準                                                           |
| ----- | ------------------------------------------------------------------ |
| AC-01 | APIキー設定済みプロバイダーのみが InlineModelSelector に表示される |
| AC-02 | APIキー未設定プロバイダーのモデルが選択不可                        |
| AC-03 | 設定画面では全プロバイダーが表示される（未設定はグレーアウト）     |
| AC-04 | プロバイダーがゼロの場合「モデルを選択」が表示される               |
| AC-05 | TypeScript コンパイルエラー 0 件                                   |

## 完了条件

- [x] `InlineModelSelector.tsx` に `allProviders.filter((p) => p.isAvailable)` を追加した
- [x] チャット画面からAPIキー未設定プロバイダーが非表示になった
- [x] 設定画面の表示は変更されていない
- [x] TypeScript コンパイルが通る
