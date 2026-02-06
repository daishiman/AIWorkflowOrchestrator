# セッションリフレッシュ通知UI

## メタ情報

```yaml
issue_number: 722
task_id: UT-REFRESH-NOTIFICATION-001
task_name: セッションリフレッシュ通知UI
category: 改善
priority: 低
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
| タスクID   | UT-REFRESH-NOTIFICATION-001                              |
| タスク名   | セッションリフレッシュ通知UI                             |
| 発見元     | TASK-AUTH-SESSION-REFRESH-001 Phase 12（スコープ外項目） |
| 優先度     | 低                                                       |
| 推定工数   | 3-5時間                                                  |
| 前提タスク | TASK-AUTH-SESSION-REFRESH-001（完了）                    |

## 2. 概要

リフレッシュ失敗→ログアウト時のユーザーへのフィードバックUIを実装する。現状は認証状態がfalseに変更されるのみで、理由の表示やトースト通知がない。

## 3. 背景

現在のセッション自動リフレッシュ実装では、リフレッシュ失敗時に無言でログアウト画面に遷移する。ユーザーは「なぜ突然ログアウトされたのか」を理解できず、UXが損なわれる。

### 3.1 現状の動作

| イベント                    | 表示                               |
| --------------------------- | ---------------------------------- |
| リフレッシュ失敗→ログアウト | ログイン画面に遷移（理由表示なし） |

### 3.2 期待する動作

| イベント           | 期待表示                                                                   |
| ------------------ | -------------------------------------------------------------------------- |
| リフレッシュ失敗   | トースト通知「セッションの有効期限が切れました。再ログインしてください。」 |
| リフレッシュ試行中 | （オプション）ステータスバーに「セッション更新中...」                      |

### 3.5 実装課題と解決策（TASK-AUTH-SESSION-REFRESH-001からの学び）

以下はセッション自動リフレッシュ実装で得た知見。通知UI実装時に参考にすること。

| 苦戦箇所              | 問題                                                                           | 解決策                                                                         |
| --------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| IPC経由エラー情報伝達 | Main Processのエラー詳細をRendererに伝える手段がなかった                       | `AUTH_STATE_CHANGED`イベントのペイロードに`error`, `errorCode`フィールドを追加 |
| リスナー二重登録      | React StrictModeで`useEffect`が2回実行され、`onAuthStateChanged`リスナーが重複 | モジュールスコープのフラグ変数`authListenerRegistered`でガード                 |
| タイムスタンプ単位    | Supabaseは秒、Date.now()はミリ秒で混在                                         | expiresAtは秒単位で統一、Scheduler渡し時にミリ秒変換                           |

**システム仕様書参照**:

- [ui-ux-components.md](../../.claude/skills/aiworkflow-requirements/references/ui-ux-components.md) — UIコンポーネント設計
- [interfaces-auth.md](../../.claude/skills/aiworkflow-requirements/references/interfaces-auth.md) — AuthState型、TokenRefreshCallbacks型
- [api-ipc-auth.md](../../.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md) — AUTH_STATE_CHANGEDイベント仕様

## 4. 実行手順

1. トースト通知コンポーネント設計（既存UIパターンに準拠）
2. authSliceにlogoutReason状態を追加
3. ログアウト時の理由をauth:state-changedイベントに含める
4. AuthViewコンポーネントでlogoutReasonを表示
5. テストケース追加

## 5. 受入基準

- [ ] リフレッシュ失敗によるログアウト時にトースト通知が表示されること
- [ ] 通知メッセージが日本語で表示されること
- [ ] 手動ログアウト時には通知が表示されないこと
- [ ] テストカバレッジ80%以上

## 6. 検証方法

- コンポーネントテスト: トースト通知の表示/非表示
- E2Eテスト: ログアウト理由に応じた通知の表示

## 7. リスクと対策

| リスク                 | 対策                                                   |
| ---------------------- | ------------------------------------------------------ |
| 通知が頻繁に表示される | リフレッシュ失敗時のみ表示（手動ログアウト時は非表示） |
| 通知の消失タイミング   | 5秒後に自動消失、または再ログイン成功時に消去          |

## 8. 関連仕様書

- [ui-ux-components.md](../../.claude/skills/aiworkflow-requirements/references/ui-ux-components.md)
- [architecture-auth-security.md](../../.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md)

## 9. 関連タスク

| タスクID                      | 関係                   |
| ----------------------------- | ---------------------- |
| TASK-AUTH-SESSION-REFRESH-001 | 親タスク（完了）       |
| UT-OFFLINE-REFRESH-001        | 関連（オフライン処理） |
| UT-AUDIT-001                  | 関連（監査ログ）       |
