# Phase 1 受け入れ基準

## Phase 11 連動チェック

| ID    | 条件                                                                           | 検証方法           |
| ----- | ------------------------------------------------------------------------------ | ------------------ |
| AC-01 | 初期表示で `chat-only` レイアウトが見える                                      | TC-11-01           |
| AC-02 | file toggle ON で file panel が表示される                                      | TC-11-04 / UI test |
| AC-03 | preview toggle ON で preview placeholder が表示される                          | TC-11-04 / UI test |
| AC-04 | 1440px 以上かつ両トグル ON で 3-pane + resize handle が表示される              | TC-11-02, TC-11-03 |
| AC-05 | 1023px 以下では panel が overlay で開き、Escape と overlay click で閉じる      | TC-11-05           |
| AC-06 | tree の Arrow / Enter / Space で file select ができる                          | TC-11-06           |
| AC-07 | file select 後に status bar が path / name / extension / size を表示する       | TC-11-07           |
| AC-08 | 選択ファイル変更時に watcher が再接続され、`file:changed` 後に内容を再取得する | TC-11-08           |
| AC-09 | reload 後も layout mode と panel size が復元される                             | unit / manual      |
| AC-10 | add folder 失敗、file read 失敗、watch start 失敗時に error surface が崩れない | unit / QA / manual |

## 不合格条件

- 新規 slice を追加している
- `workspace:*` / `file:*` 以外の新規 IPC 追加が必要になっている
- mobile で panel が inline 表示される
- watcher cleanup がなく listener が増殖する
