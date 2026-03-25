# UT-IMP-SAFETY-GOV-PERF-MEASUREMENT-001: Approval Sheet パフォーマンス計測

```yaml
issue_number: 1610
task_id: UT-IMP-SAFETY-GOV-PERF-MEASUREMENT-001
task_name: Approval Sheet パフォーマンス計測
category: パフォーマンス
target_feature: ApprovalSheet
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 12
created_date: 2026-03-25
dependencies: []
```

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| タスクID | UT-IMP-SAFETY-GOV-PERF-MEASUREMENT-001          |
| 優先度   | 中                                              |
| 元タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 検出日   | 2026-03-25                                      |
| 由来     | Phase 11 DI-4 / Phase 12 UT-4                   |

---

## 概要

Approval Sheet の NFR-4（表示 200ms 以内）を定量的に計測・検証する基盤を構築する。現在はパフォーマンス要件が定義されているが、計測方法とテストが未実装。

## 背景・苦戦箇所

Phase 11 の発見事項 DI-4 で、NFR-4（Approval Sheet 表示 200ms 以内）の計測方法が未定義であることが指摘された。Approval Sheet は安全判断のインターフェースであり、遅延表示はユーザーの承認操作を阻害するリスクがある。

苦戦が予想される点:

- happy-dom 環境では `Performance.now()` の精度が限定的
- React コンポーネントの render 時間計測は `React Profiler` または `performance.mark/measure` の選択が必要
- CI 環境でのパフォーマンステスト安定性（マシン負荷による揺れ）

## 対応方針

1. `React.Profiler` の `onRender` コールバックで ApprovalSheet の render 時間を計測
2. Vitest の `performance.now()` を使い、render → DOM 完成までの時間を asserttion
3. 閾値は 200ms とし、CI の揺れを考慮して余裕値（250ms）で assertion

## 変更対象ファイル

| ファイル                                                                               | 変更種別 |
| -------------------------------------------------------------------------------------- | -------- |
| `apps/desktop/src/renderer/components/execution/__tests__/ApprovalSheet.perf.test.tsx` | 新規     |

## 完了条件

- [ ] Approval Sheet の render 時間計測テストが存在する
- [ ] NFR-4 の 200ms 閾値に対する assertion がある
- [ ] CI 環境で安定的に PASS する
