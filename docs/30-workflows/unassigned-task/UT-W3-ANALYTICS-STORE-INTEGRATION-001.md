# UT-W3-ANALYTICS-STORE-INTEGRATION-001: SkillAnalytics / AnalyticsStore への直接統合

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| タスクID   | UT-W3-ANALYTICS-STORE-INTEGRATION-001            |
| 優先度     | 中                                               |
| 依存       | UT-W3-ANALYTICS-ADAPTER-001（Phase 12 完了済み） |
| 関連タスク | UT-W3-ANALYTICS-HTTP-PROVIDER-001                |
| 作成日     | 2026-04-12                                       |
| issue番号  | #2100                                            |

---

## 目的

`SkillAnalytics` / `AnalyticsStore` 等の execution-centric なストアから analytics イベントを直接発火できるようにし、スキル実行の統計データ収集を自動化する。

---

## 背景

UT-W3-ANALYTICS-ADAPTER-001 では、`analyticsAdapter` を renderer-local adapter に閉じ、
`SkillAnalytics` / `AnalyticsStore` への直接統合は「責務が異なる」として scope out 判定した。

現状の `trackEvent` は明示的に呼び出す必要があり、スキル実行フロー内での自動計装がない。
今後、スキル実行の開始・完了・エラーなどを自動的に analytics イベントとして記録するには、
Store レイヤーとの統合が必要になる。

本タスクは UT-W3-ANALYTICS-ADAPTER-001 の Phase 12 で scope out と判定されたため、独立タスクとして管理する。

---

## スコープ

### 含む

- `SkillAnalytics` または専用 `AnalyticsStore`（Zustand slice）の設計・実装
- スキル実行ライフサイクル（start / complete / error）への自動計装
- `trackEvent` との統合（AnalyticsStore 内から `trackEvent` を呼び出す）
- ユニットテスト

### 含まない

- 既存の `trackEvent` / `analyticsAdapter` の変更（呼び出し側 API は不変を維持）
- ダッシュボード UI への集計表示（→ UT-W3-ANALYTICS-DASHBOARD-001）

---

## 受入基準

- [ ] スキル実行の開始・完了・エラーが自動的に analytics イベントとして記録されること
- [ ] `AnalyticsStore` が Zustand slice として実装されていること
- [ ] 既存の `trackEvent` 公開 API シグネチャが変更されないこと（AC-5 維持）
- [ ] `pnpm typecheck && pnpm lint && pnpm test` が PASS すること

---

## 苦戦箇所（予測）

- **責務境界**: `SkillAnalytics`（execution-centric）と `analyticsAdapter`（transport-centric）の責務を明確に分離しつつ統合するアーキテクチャ設計が難しい
- **副作用の管理**: Zustand store action 内で analytics 送信という副作用を起こすと、テスト時のモック設計が複雑になる。`middleware` パターンの採用を検討すること
- **循環依存リスク**: `AnalyticsStore` → `analyticsAdapter` → `trackEvent` の依存チェーンで循環が発生しないよう依存方向を一方向に固定すること

---

## 完了条件

- [ ] `SkillAnalytics` / `AnalyticsStore` が実装されていること
- [ ] スキル実行の自動計装が動作していること
- [ ] 全テストが PASS すること
