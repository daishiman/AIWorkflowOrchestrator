# UT-W3-ANALYTICS-AB-SWITCH-001: Analytics Provider A/B 切り替え機能

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-W3-ANALYTICS-AB-SWITCH-001                     |
| 優先度     | 低                                                |
| 依存       | UT-W3-ANALYTICS-HTTP-PROVIDER-001（HTTP送信実装） |
| 関連タスク | UT-W3-ANALYTICS-ADAPTER-001（完了済み）           |
| 作成日     | 2026-04-12                                        |
| issue番号  | #2099                                             |

---

## 目的

運用中に analytics provider を無停止で切り替え可能にする。複数の分析基盤を並行評価（A/B テスト）したり、緊急時にフォールバック先へ切り替えたりできる運用性を確保する。

---

## 背景

UT-W3-ANALYTICS-ADAPTER-001 では、provider は単一固定で十分として「scope out」判定した。
ただし将来の運用要件として、以下のシナリオが想定される：

- 分析基盤の移行（旧 provider → 新 provider）
- コスト・精度比較のための並行送信
- 障害時のフォールバック切り替え

本タスクは UT-W3-ANALYTICS-ADAPTER-001 の Phase 12 で scope out と判定されたため、独立タスクとして管理する。

---

## スコープ

### 含む

- `analyticsHandler.ts` への複数 provider 対応（provider インターフェース抽象化）
- provider 切り替え設定（electron-store or 環境変数）
- 並行送信モード（A/B 同時送信）のサポート
- ユニットテスト

### 含まない

- 各 provider 向けの SDK 統合（各 provider の詳細実装は個別タスク）
- UI からのリアルタイム切り替え（初版は設定ファイルベース）

---

## 受入基準

- [ ] `AnalyticsProvider` インターフェースが定義されていること
- [ ] 設定で複数 provider を有効化できること
- [ ] 並行送信時、一方が失敗しても他方の送信に影響しないこと
- [ ] `pnpm typecheck && pnpm lint && pnpm test` が PASS すること

---

## 苦戦箇所（予測）

- **provider 抽象化**: `analyticsHandler.ts` の現在のベタ書き実装を、プラグイン可能な provider インターフェースへリファクタリングする際の後方互換性の維持
- **エラー独立性**: 複数 provider への並行送信で、一方のエラーが他方をキャンセルしない `Promise.allSettled` ベースの設計が必要

---

## 完了条件

- [ ] `AnalyticsProvider` インターフェースが実装されていること
- [ ] 既存の動作が変わらないこと（後方互換）
- [ ] 全テストが PASS すること
