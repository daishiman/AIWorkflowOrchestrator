# Guided Execution Console UI/UX 正本

## 概要

`実行コンソール` は、terminal を front の主役にしない AI 実行 surface である。  
ユーザーには `何をするか` `今どこまで進んだか` `何ができあがったか` を先に見せ、raw terminal は `高度な表示` として後段に置く。

## front naming

| 用語           | 固定意味                                 | front で使わない意味    |
| -------------- | ---------------------------------------- | ----------------------- |
| 実行コンソール | guided execution の primary surface      | raw terminal 全体の別名 |
| 端末で続ける   | manual terminal lane へ handoff する操作 | 自動実行                |
| 高度な表示     | raw terminal / 詳細ログ / 低レベル操作   | 初心者向け主導線        |
| 実行サマリー   | AI がこれから行うこと / 行ったことの要約 | 生ログ全量              |
| 成果物         | 生成ファイル、差分、次アクション         | transcript 全文         |

## 必須コンポーネント

| コンポーネント    | 役割               | 必須要素                                               |
| ----------------- | ------------------ | ------------------------------------------------------ |
| Action Card       | 実行内容の説明     | 目的、期待成果物、作業ディレクトリ、主CTA              |
| Runtime Banner    | 実行レーンの表示   | `APIで実行` / `端末で続ける` / `案内のみ`              |
| Approval Sheet    | 実行前確認         | 外部送信、危険操作、停止方法、承認CTA                  |
| Session Dock      | 実行中と履歴の表示 | status、timeline、transcript preview、再開導線         |
| Artifact Summary  | 結果の主表示       | 生成ファイル、差分、次アクション                       |
| Manual Share Rail | chat への手動共有  | `選択範囲を送る`、`直近出力を添付`、`セッションを貼る` |
| Provenance Chip   | 共有元表示         | source、sharedAt、inspect                              |
| Advanced Console  | 詳細確認           | raw terminal、詳細ログ、copy command                   |

## state 契約

| state         | 表示                         | primary CTA    | 禁止事項                |
| ------------- | ---------------------------- | -------------- | ----------------------- |
| ready         | 何を実行するかを1文で見せる  | `実行する`     | 前提条件を隠す          |
| handoff       | 端末へ引き継ぐ理由を見せる   | `端末で続ける` | 自動送信する            |
| running       | timeline と停止手段を見せる  | `停止`         | spinner だけにする      |
| done          | 成果物を先に見せる           | `結果を見る`   | transcript を主役にする |
| aborted       | 中止理由と再開導線を見せる   | `やり直す`     | blank state にする      |
| unavailable   | セットアップ不足を一文で示す | `設定を見る`   | no-op CTA を出す        |
| guidance-only | 実行不可理由と代替案を示す   | `案内を見る`   | retry を主CTAにする     |

## CTA 契約

- primary CTA は常に 1 個に絞る
- `端末で続ける` は handoff 状態の primary CTA のみで使う
- `高度な表示` は secondary か tertiary へ置く
- `terminal を開く` を front 主導線のラベルにしない
- raw command の copy は `高度な表示` 内で許可する

## placement

| surface          | ルール                                                      |
| ---------------- | ----------------------------------------------------------- |
| App Shell        | 常設入口は `実行コンソール` で統一する                      |
| Chat / Workspace | composer 付近に lane-aware CTA を置く                       |
| Skill Creator    | plan / execute / artifact の近傍に同じ入口を使う            |
| dock             | bottom dock か side panel とし、閉じても session を保持する |

## safety / compliance

- no auto-send
- no hidden parsing
- no hidden prompt injection
- transcript は自動で message 化しない
- 各セッションの開始時に AI 利用を明示する
- 外部送信や危険操作は approval sheet で明示承認を取る
- `claude.ai` consumer 認証をアプリの統合実行レーンへ流用しない

## non-goal

- terminal emulator の再現を front の目的にしない
- shell prompt 直接入力を一般ユーザーへ強制しない
- ログ全文を最初の情報面にしない
