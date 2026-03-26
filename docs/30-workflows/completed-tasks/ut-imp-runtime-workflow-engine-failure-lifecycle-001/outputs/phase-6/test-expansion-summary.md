# Test Expansion Summary

| 追加観点                     | 狙い                                           |
| ---------------------------- | ---------------------------------------------- |
| retry after execute failure  | failure から正常経路へ戻れることを固定する     |
| review resubmit              | `awaitingUserInput` が解消されることを固定する |
| artifact strategy regression | append / latest snapshot の選択を固定する      |
