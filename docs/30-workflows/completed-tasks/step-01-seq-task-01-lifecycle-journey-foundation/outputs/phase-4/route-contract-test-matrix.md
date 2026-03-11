# ルート契約マトリクス

| 対象                | 自動確認                  | 手動確認   | 期待値                           |
| ------------------- | ------------------------- | ---------- | -------------------------------- |
| App.tsx currentView | alias 正規化テスト        | shell 遷移 | nav に canonical view だけを渡す |
| navContract.ts      | shortcut / section テスト | nav 目視   | main/sub/footer が一意           |
| Skill Center        | view test                 | screenshot | journey panel 表示               |
| Settings            | reset helper test         | screenshot | bypass 維持                      |
