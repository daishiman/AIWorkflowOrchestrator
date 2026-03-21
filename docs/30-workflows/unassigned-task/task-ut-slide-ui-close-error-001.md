# UT-SLIDE-UI-CLOSE-ERROR-001: closeProject エラー通知改善

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | UT-SLIDE-UI-CLOSE-ERROR-001        |
| 起源       | UT-SLIDE-UI-001 Phase 10 MINOR-003 |
| 優先度     | 低                                 |
| ステータス | 未着手                             |

## 指摘内容

`useSlideProject.ts` の `closeProject` と `cancelExecution` が失敗時に `console.error` のみで終了し、ユーザーへの UI 通知がない。

## 対応方針

1. `closeProject` の catch ブロックで `store.setError()` を呼び出し、UI にエラーを表示
2. `cancelExecution` も同じ方針で UI へ surfacing する
3. または toast 通知で一時的にエラーを表示

## 関連タスク

- UT-SLIDE-UI-001（起源）
