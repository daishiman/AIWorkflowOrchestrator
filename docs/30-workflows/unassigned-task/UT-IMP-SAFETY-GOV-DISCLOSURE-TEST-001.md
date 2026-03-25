# UT-IMP-SAFETY-GOV-DISCLOSURE-TEST-001: disclosureHandlers 独立テスト作成

```yaml
issue_number: 1612
task_id: UT-IMP-SAFETY-GOV-DISCLOSURE-TEST-001
task_name: disclosureHandlers 独立テスト作成
category: 改善
target_feature: ExecutionConsole
priority: 低
scale: 小規模
status: 未実施
source_phase: Phase 12
created_date: 2026-03-25
dependencies: []
```

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| タスクID | UT-IMP-SAFETY-GOV-DISCLOSURE-TEST-001           |
| 優先度   | 低                                              |
| 元タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 検出日   | 2026-03-25                                      |
| 由来     | Phase 12 UT-10 品質向上                         |

---

## 概要

`disclosureHandlers.ts` の独立した単体テストファイルを作成する。現在は結合テスト（disclosureIntegration.test.tsx）で間接的にカバーされているが、IPC handler レベルの個別テストが未作成。

## 背景・苦戦箇所

元タスクでは `approvalHandlers.test.ts` と `advancedConsoleIpc.test.ts` は作成したが、`disclosureHandlers.test.ts` は未作成。理由は disclosureHandlers が比較的シンプル（provider名・model名・destination を返すだけ）で、結合テストでカバレッジを確保していたため。

しかし、以下の観点で独立テストが望ましい:

- sender 検証の個別テスト
- DENY-5（API key / token 非含有）の直接検証
- provider 情報取得失敗時のフォールバック検証

苦戦が予想される点:

- disclosureHandlers の依存関数（getProviderName / getModelName / getDestinations）のモック設計
- DENY-5 準拠の negative テスト設計

## 対応方針

`advancedConsoleIpc.test.ts` と同様のパターンで:

1. Electron mock + channels import
2. handler の直接呼び出し
3. sender 検証、P42 バリデーション、レスポンス内容の検証

## 変更対象ファイル

| ファイル                                                         | 変更種別 |
| ---------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` | 新規     |

## 完了条件

- [ ] disclosureHandlers の独立テストファイルが存在する
- [ ] sender 検証テストがある
- [ ] DENY-5（API key 非含有）の検証テストがある
- [ ] provider 情報取得失敗時のフォールバックテストがある
- [ ] テストが PASS する
