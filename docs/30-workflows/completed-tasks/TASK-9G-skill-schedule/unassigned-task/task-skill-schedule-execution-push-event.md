# UT-9G-005: スケジュール実行結果の Renderer push 通知追加

## メタ情報

```yaml
issue_number: null
task_id: UT-9G-005
task_name: スケジュール実行結果の Renderer push 通知追加
category: 改善
target_feature: skill schedule（Main→Renderer 通知）
priority: 低
scale: 中規模
status: 未実施
source_phase: TASK-9G Phase 12 未タスク検出
created_date: 2026-02-27
```

| 項目         | 値                                            |
| ------------ | --------------------------------------------- |
| タスクID     | UT-9G-005                                     |
| タスク名     | スケジュール実行結果の Renderer push 通知追加 |
| 分類         | 改善                                          |
| 対象機能     | schedule execution event                      |
| 優先度       | 低                                            |
| 見積もり規模 | 中規模                                        |
| ステータス   | 未実施                                        |
| 発見元       | TASK-9G Phase 12                              |
| 発見日       | 2026-02-27                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在は `scheduleList()` の取得型 pull のみで、実行完了を即時通知する push チャンネルがない。

### 1.2 問題点・課題

Renderer はポーリング依存となり、更新遅延や不要通信が発生する。

### 1.3 放置した場合の影響

リアルタイム性が不足し、将来の通知UI実装コストが増える。

---

## 2. 何を達成するか（What）

### 2.1 目的

スケジュール実行完了イベントを Main から Renderer へ push 送信する。

### 2.2 最終ゴール

`onScheduleExecuted` API で実行結果をリアルタイム受信できる。

### 2.3 スコープ

#### 含むもの

- チャンネル定数追加（on系）
- Main 送信実装
- Preload `safeOn` 公開
- テスト追加

#### 含まないもの

- 通知UIの最終表示デザイン

### 2.4 成果物

- channels/skill-api/handler 更新
- テスト更新
- 仕様更新

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `safeOn` パターンが既存仕様で利用可能

### 3.2 依存タスク

- UT-9G-003 と連携推奨

### 3.3 必要な知識

- Electron IPC event（Main→Renderer）
- Preload bridge 設計

### 3.4 推奨アプローチ

1. `SKILL_SCHEDULE_EXECUTED` を追加
2. `executeScheduledSkill()` 完了時に送信
3. Preload API と購読解除関数を追加

---

## 4. 実行手順

### Phase構成

- Phase A: 設計
- Phase B: 実装
- Phase C: 検証

### Phase A: 設計

#### 目的

イベント payload 契約を定義する。

#### 手順

1. event 名と payload 型を定義
2. セキュリティ方針（許可チャンネル）確認
3. UI 側購読ライフサイクル方針を決定

#### 成果物

- 契約定義

#### 完了条件

- 型契約が明文化される

### Phase B: 実装

#### 目的

Main→Renderer push 連携を実装する。

#### 手順

1. `IPC_CHANNELS` と `ALLOWED_ON_CHANNELS` 更新
2. Main 送信追加
3. Preload で `onScheduleExecuted` を公開

#### 成果物

- 実装差分

#### 完了条件

- 実行完了でイベント受信できる

### Phase C: 検証

#### 目的

イベント契約の整合と回帰を確認する。

#### 手順

1. ハンドラー/Preload テスト追加
2. 手動確認
3. 仕様書更新

#### 成果物

- テスト記録

#### 完了条件

- イベント受信テスト PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] schedule 実行完了イベントが送信される
- [ ] Renderer 側で購読/解除できる

### 品質要件

- [ ] 送信 payload 型が shared 定義に準拠
- [ ] 既存 on チャンネルに回帰なし

### ドキュメント要件

- [ ] IPC/API仕様を更新
- [ ] 台帳に反映

---

## 6. 検証方法

### テストケース

- 実行成功イベント
- 実行失敗イベント
- unsubscribe 後の未受信

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run apps/desktop/src/preload/__tests__/skill-api.test.ts apps/desktop/src/main/ipc/__tests__/skillScheduleHandlers.test.ts
```

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                          |
| -------------------------- | ------ | -------- | ----------------------------- |
| イベント多発で UI 負荷増加 | 中     | 中       | payload 最小化とバッチ/間引き |
| 契約ドリフト               | 中     | 低       | shared 型を正本化             |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`

### 参考資料

- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/preload/skill-api.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
スケジュール実行完了の Main→Renderer push 通知が未実装で、ポーリング依存になっている。
```

### 補足事項

- task-031b（UI）と同時実施すると効率が高い。
