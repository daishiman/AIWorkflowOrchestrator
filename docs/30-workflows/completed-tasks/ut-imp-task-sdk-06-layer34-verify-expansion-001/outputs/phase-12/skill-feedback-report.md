# Skill Feedback Report

## task-specification-creator

- Phase 5〜10 の outputs テンプレートに「設計時の仮説」と「実装後の実績」を切り替える欄があると、今回のような spec_created から implementation への更新で書き換え漏れを減らせる。
- Phase 11 に placeholder screenshot を許容する場合、`NON_VISUAL` の理由と actual artifact 参照先をセットで出力する定型があると後工程が安定する。

## aiworkflow-requirements

- canonical reference 更新が必要になったとき、`Step 2` を no-op と誤判定しないためのチェックリストがあるとよい。今回は public IPC/preload 契約の追加で Step 2 が実施対象になった。
- `.claude` / `.agents` の二重更新後に index 再生成までを 1 コマンドで閉じる薄い wrapper があると同期漏れを防げる。
