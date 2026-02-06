# オフライン時リフレッシュ失敗処理

## メタ情報

```yaml
issue_number: 721
task_id: UT-OFFLINE-REFRESH-001
task_name: オフライン時リフレッシュ失敗処理
category: 改善
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-AUTH-SESSION-REFRESH-001 Phase 12
created_date: 2026-02-06
dependencies:
  - TASK-AUTH-SESSION-REFRESH-001
```

## 1. メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| タスクID   | UT-OFFLINE-REFRESH-001                                   |
| タスク名   | オフライン時リフレッシュ失敗処理                         |
| 発見元     | TASK-AUTH-SESSION-REFRESH-001 Phase 12（スコープ外項目） |
| 優先度     | 中                                                       |
| 推定工数   | 4-6時間                                                  |
| 前提タスク | TASK-AUTH-SESSION-REFRESH-001（完了）                    |

## 2. 概要

ネットワーク切断中にリフレッシュタイミングが到来した場合の処理を実装する。現状はリトライ3回失敗→ログアウトフローとなるが、オフライン検出時はリトライ間隔を延長し、オンライン復帰時にリフレッシュを再開する仕組みを追加する。

## 3. 背景

TokenRefreshSchedulerは現在、オフライン状態の検出を行わずにリフレッシュを試行する。ネットワーク切断時に3回リトライが全て失敗すると不要なログアウトが発生し、オンライン復帰後にユーザーが再ログインを強いられる。

### 3.1 現状の動作

| 状態             | 動作                        | 問題             |
| ---------------- | --------------------------- | ---------------- |
| オフライン時     | リトライ3回→失敗→ログアウト | 不要なログアウト |
| オンライン復帰後 | 再ログインが必要            | UXが悪い         |

### 3.2 期待する動作

| 状態             | 期待動作                                                                              |
| ---------------- | ------------------------------------------------------------------------------------- |
| オフライン検出時 | リフレッシュをスキップ/延長、`navigator.onLine`またはElectron `net.isOnline()` で判定 |
| オンライン復帰時 | 即座にリフレッシュ再開                                                                |

### 3.5 実装課題と解決策（TASK-AUTH-SESSION-REFRESH-001からの学び）

以下はセッション自動リフレッシュ実装で得た知見。オフライン処理実装時に参考にすること。

| 苦戦箇所                 | 問題                                                                                         | 解決策                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Supabase SDK競合         | `autoRefreshToken: true`（デフォルト）とカスタムスケジューラーが同時にリフレッシュを試み競合 | `supabaseClient.ts`で`autoRefreshToken: false`を設定し、カスタムスケジューラーに完全委譲 |
| タイマーテスト無限ループ | `vi.runAllTimersAsync()`でリフレッシュ成功→新タイマー→再発火の無限ループ                     | `vi.advanceTimersByTime(ms)` + `flushPromises()`で段階的制御                             |
| setTimeout再帰パターン   | setIntervalでは動的な有効期限変更に対応不可                                                  | setTimeout + `reset(newExpiresAt)`で毎回新タイマー設定                                   |

**システム仕様書参照**:

- [error-handling.md](../../.claude/skills/aiworkflow-requirements/references/error-handling.md) — TokenRefreshSchedulerリトライ戦略
- [interfaces-auth.md](../../.claude/skills/aiworkflow-requirements/references/interfaces-auth.md) — TokenRefreshCallbacks/Config型定義
- [architecture-auth-security.md](../../.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md) — セッション自動リフレッシュ全体設計

## 4. 実行手順

1. TokenRefreshSchedulerにオフライン検出ロジック追加（`net.isOnline()` 使用）
2. オフライン時はリフレッシュをスキップし、`online`イベントでリフレッシュ再開
3. テストケース追加（オフライン→オンライン遷移シナリオ）
4. Phase 12ドキュメント更新

## 5. 受入基準

- [ ] オフライン時にリフレッシュリトライが実行されないこと
- [ ] オンライン復帰時に自動でリフレッシュが再開されること
- [ ] 不要なログアウトが発生しないこと
- [ ] テストカバレッジ80%以上を維持

## 6. 検証方法

- ユニットテスト: net.isOnline()モックによるオフライン/オンラインシナリオ
- 手動テスト: ネットワーク切断→復帰時の動作確認

## 7. リスクと対策

| リスク               | 対策                                                               |
| -------------------- | ------------------------------------------------------------------ |
| オフライン検出の精度 | Electronの`net.isOnline()`と`online`/`offline`イベントの両方を使用 |
| トークン有効期限切れ | オンライン復帰時に即座にリフレッシュを試行                         |

## 8. 関連仕様書

- [architecture-auth-security.md](../../.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md)
- [api-ipc-auth.md](../../.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md)

## 9. 関連タスク

| タスクID                      | 関係             |
| ----------------------------- | ---------------- |
| TASK-AUTH-SESSION-REFRESH-001 | 親タスク（完了） |
| UT-REFRESH-NOTIFICATION-001   | 関連（通知UI）   |
