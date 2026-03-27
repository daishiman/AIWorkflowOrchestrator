# Risk Register

| id  | risk                                 | mitigation                          |
| --- | ------------------------------------ | ----------------------------------- |
| R-1 | stale path へ誤着手                  | target-path-decision を正本にする   |
| R-2 | duplicate source に引っ張られる      | richer source + current target 優先 |
| R-3 | existing row を壊す                  | grep / diff で preservation を確認  |
| R-4 | ID collision を task skip 理由にする | path 主キーで実行する               |
