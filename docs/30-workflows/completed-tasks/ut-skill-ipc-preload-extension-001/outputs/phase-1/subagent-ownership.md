# Phase 1 SubAgent責務表

## 責務境界

| SubAgent   | 主責務          | 入力                                                | 出力                             |
| ---------- | --------------- | --------------------------------------------------- | -------------------------------- |
| SubAgent-A | IPC契約監査     | task-9D〜9Jのチャネル定義                           | 30チャネル分類表                 |
| SubAgent-B | Preload設計監査 | `security-skill-ipc.md`, `security-api-electron.md` | safeInvoke/safeOn境界要件        |
| SubAgent-C | 型体系監査      | `ipc-contract-checklist.md`, task型定義             | P32同期要件                      |
| SubAgent-D | 仕様統合監査    | A/B/C成果物                                         | 統合要件、受け入れ基準、依存順序 |

## フェーズ責任マッピング

| フェーズ     | A        | B        | C        | D        |
| ------------ | -------- | -------- | -------- | -------- |
| 1 要件定義   | 主担当   | 分担     | 分担     | 最終統合 |
| 2 設計       | 共同     | 主担当   | 主担当   | 最終統合 |
| 3 レビュー   | 主担当   | 主担当   | 主担当   | 最終判定 |
| 4 テスト作成 | 主担当   | 分担     | 主担当   | 主担当   |
| 5-12         | 監査支援 | 監査支援 | 監査支援 | 主担当   |

## 重複防止ルール

- チャネル命名の最終決定権はSubAgent-A。
- Preload公開境界の最終決定権はSubAgent-B。
- shared型配置の最終決定権はSubAgent-C。
- フェーズ完了判定とGo/No-GoはSubAgent-Dのみ実施。

## 完了状態

- Phase 1責務定義: Completed
