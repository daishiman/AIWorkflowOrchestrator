# Blocker Handling Cases

| situation                   | handling                                  |
| --------------------------- | ----------------------------------------- |
| Issue が CLOSED             | 実行継続。status を記録だけする           |
| source path が存在しない    | stale path として除外する                 |
| duplicate source が食い違う | richer source + current target を優先する |
