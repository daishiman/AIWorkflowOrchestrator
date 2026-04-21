# [#2099] [UT-W3-ANALYTICS-AB-SWITCH-001] Analytics Provider A/B 切り替え機能

## メタ情報

```yaml
issue_number: 2099
title: [UT-W3-ANALYTICS-AB-SWITCH-001] Analytics Provider A/B 切り替え機能
state: OPEN
priority: 低
scale: 中規模
category: 改善
status: 未実施
created_date: 2026-04-11
updated_date: 2026-04-13
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2099
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

運用中に analytics provider を無停止で切り替え可能にする。複数の分析基盤を並行評価（A/B テスト）したり、緊急時にフォールバック先へ切り替えたりできる運用性を確保する。

## 起票元

- タスク: `UT-W3-ANALYTICS-ADAPTER-001` Phase 12 scope-out
- 優先度: P3（Low）
- 仕様書: `docs/30-workflows/unassigned-task/UT-W3-ANALYTICS-AB-SWITCH-001.md`
- 実装ガイド（Phase 12）: `docs/30-workflows/UT-W3-ANALYTICS-ADAPTER-001/outputs/phase-12/implementation-guide.md`

## 背景

UT-W3-ANALYTICS-ADAPTER-001 では provider は単一固定で十分として「scope out」判定した。
将来の運用要件として、分析基盤の移行・コスト比較・障害時のフォールバック切り替えが想定される。

## やること

- [ ] `AnalyticsProvider` インターフェース定義・抽象化
- [ ] provider 切り替え設定（electron-store or 環境変数）
- [ ] 並行送信モード（A/B 同時送信）のサポート
- [ ] ユニットテスト

## スコープ外

- 各 provider 向けの SDK 統合（別タスク）
- UI からのリアルタイム切り替え（初版は設定ファイルベース）

## 完了条件

- [ ] `AnalyticsProvider` インターフェースが実装されていること
- [ ] 既存の動作が変わらないこと（後方互換）
- [ ] `pnpm typecheck && pnpm lint && pnpm test` が PASS すること
