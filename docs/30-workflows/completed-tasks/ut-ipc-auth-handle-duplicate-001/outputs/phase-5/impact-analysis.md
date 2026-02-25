# Phase 5 影響範囲分析

## 影響あり

- Main Process の AUTH IPC登録実装
  - `authHandlers.ts`
  - `ipc/index.ts` fallback経路

## 影響なし（互換維持）

- Preload API (`apps/desktop/src/preload/index.ts`)
- チャネル定義 (`apps/desktop/src/preload/channels.ts`)
- Renderer 呼び出しシグネチャ
- OAuth/Session の業務ロジック

## 回帰リスク評価

| 観点         | 評価 | 根拠                                             |
| ------------ | ---- | ------------------------------------------------ |
| 契約互換     | 低   | チャネル名・戻り値・エラーコードを変更していない |
| セキュリティ | 低   | `withValidation` 維持                            |
| 起動時登録   | 低   | fallback含め5チャネル一括登録で漏れ検知しやすい  |

## 結論

機能差分なしの構造改善であり、回帰リスクは低い。
