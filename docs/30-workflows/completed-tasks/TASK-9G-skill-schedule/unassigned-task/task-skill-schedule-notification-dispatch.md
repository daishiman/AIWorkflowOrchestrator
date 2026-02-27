# UT-9G-003: スケジュール実行通知（sendNotification）実装

## メタ情報

```yaml
issue_number: null
task_id: UT-9G-003
task_name: スケジュール実行通知（sendNotification）実装
category: 改善
target_feature: skill schedule（通知）
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-9G Phase 12 未タスク検出
created_date: 2026-02-27
```

| 項目         | 値                                           |
| ------------ | -------------------------------------------- |
| タスクID     | UT-9G-003                                    |
| タスク名     | スケジュール実行通知（sendNotification）実装 |
| 分類         | 改善                                         |
| 対象機能     | schedule notification                        |
| 優先度       | 中                                           |
| 見積もり規模 | 中規模                                       |
| ステータス   | 未実施                                       |
| 発見元       | TASK-9G Phase 12                             |
| 発見日       | 2026-02-27                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`NotificationSettings` は保存されるが、実行完了時に通知処理が存在しない。

### 1.2 問題点・課題

成功/失敗の通知設定が機能せず、実行結果の即時把握ができない。

### 1.3 放置した場合の影響

ユーザー体験が低下し、スケジュール運用の効果が下がる。

---

## 2. 何を達成するか（What）

### 2.1 目的

通知設定に応じて system/inApp/both の通知を送信する。

### 2.2 最終ゴール

成功/失敗時に設定どおりの通知が発火し、テストで保証される。

### 2.3 スコープ

#### 含むもの

- 通知ディスパッチロジック実装
- `NotificationSettings` に応じた分岐
- テスト追加

#### 含まないもの

- 通知UIの高度デザイン
- 通知履歴画面

### 2.4 成果物

- `SkillScheduler.ts` 通知実装
- 関連 IPC/Preload 調整（必要時）
- テスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Main で通知API利用可能
- inApp 通知チャンネル方針が確定

### 3.2 依存タスク

- UT-9G-005（push イベント）と連携推奨

### 3.3 必要な知識

- Electron Notification
- Main→Renderer 通知

### 3.4 推奨アプローチ

1. Scheduler 内に通知メソッド追加
2. 実行結果確定後に呼び出し
3. 設定別分岐をテスト

---

## 4. 実行手順

### Phase構成

- Phase A: 設計
- Phase B: 実装
- Phase C: 検証

### Phase A: 設計

#### 目的

通知方式とイベントデータを定義する。

#### 手順

1. 通知 payload を定義
2. `onSuccess`/`onFailure` 条件を明確化
3. inApp チャンネル名を確定

#### 成果物

- 通知仕様メモ

#### 完了条件

- 設定と挙動の対応が確定

### Phase B: 実装

#### 目的

通知処理を実装する。

#### 手順

1. sendNotification を実装
2. execute 完了時に呼び出し
3. 例外時も失敗通知分岐を適用

#### 成果物

- 実装差分

#### 完了条件

- 設定別通知が発火する

### Phase C: 検証

#### 目的

通知の正当性を確認する。

#### 手順

1. ユニットテスト追加
2. 手動通知確認
3. 仕様書更新

#### 成果物

- テストログ

#### 完了条件

- 通知関連テストが PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 成功通知が設定通り送信される
- [ ] 失敗通知が設定通り送信される

### 品質要件

- [ ] 通知失敗で主処理が落ちない
- [ ] エラー情報が過剰露出しない

### ドキュメント要件

- [ ] 仕様書に通知仕様を反映
- [ ] 台帳リンク更新

---

## 6. 検証方法

### テストケース

- success + onSuccess=true
- fail + onFailure=true
- both/system/inApp 切り替え

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run apps/desktop/src/main/services/skill/__tests__/SkillScheduler.test.ts
```

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                        |
| ------------------------------ | ------ | -------- | --------------------------- |
| 通知失敗で実行失敗扱いになる   | 中     | 低       | 通知処理は try/catch で隔離 |
| inApp と system 二重通知の過多 | 低     | 中       | ユーザー設定で制御          |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`

### 参考資料

- `apps/desktop/src/main/services/skill/SkillScheduler.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
NotificationSettings は保存されるが送信ロジックが未実装。
```

### 補足事項

- UI 側タスクと連携して段階導入してもよい。
