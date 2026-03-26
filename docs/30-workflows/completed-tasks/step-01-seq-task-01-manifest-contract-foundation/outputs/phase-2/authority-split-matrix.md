# Authority Split Matrix

| concern                 | manifest       | loader             | engine / downstream              | runtime facade / IPC |
| ----------------------- | -------------- | ------------------ | -------------------------------- | -------------------- |
| phase topology          | 定義する       | 検証する           | 実行順を解釈する                 | 解釈しない           |
| resource descriptor     | 定義する       | 正規化する         | 読み分ける                       | 解釈しない           |
| entry / exit hook       | 参照関係を持つ | 参照整合を検証する | 実行ルールを後続 task が定義する | authority を持つ     |
| `authMode` / permission | 持たない       | 持たない           | 持たない                         | owner                |
| IPC / preload           | 持たない       | 持たない           | 持たない                         | owner                |
| session / verify        | 持たない       | 持たない           | 後続 task                        | owner は後続 task    |
