# Phase 12 - レッスン・未タスク記録

## レッスン

### L-01: Visual validation はハーネスで再現状態を固定すると安定する

`value=` 注入で monthly の初期状態を固定したことで、スクリーンショットが再現可能になった。
direct input モードを混ぜないことで、visual contract の境界が明確になった。

### L-02: エラーテキストの文言は設計・実装・証跡で一致させる

`指定` と `入力` のような小さな揺れでも、後工程では別実装に見える。
今回のように、設計文言・テスト・スクリーンショット注記を同じ文面に揃えるべき。

### L-03: UI の微差は機能と分けて backlog 化する

weekly の `text-xs` と monthly の `text-sm` は機能不全ではない。
ただし見た目の一貫性としてはフォローアップ候補に残すのが適切。

## 未タスク

| ID                                    | 優先度 | 内容                                                      |
| ------------------------------------- | ------ | --------------------------------------------------------- |
| TASK-CRON-CUSTOM-VALIDATION-001       | MEDIUM | direct input / custom cron モードの同等月次バリデーション |
| TASK-CRON-ERROR-STYLE-UNIFICATION-001 | LOW    | weekly / monthly エラースタイルの統一                     |

## 完了確認

- Phase 11 のスクリーンショット 4 枚を保存済み
- Phase 12 の canonical output 7 ファイルを保存済み
- `outputs/artifacts.json` を追加し、root `artifacts.json` と同期済み
