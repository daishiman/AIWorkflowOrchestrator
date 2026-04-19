# Phase 11: 発見事項一覧

MT-01〜MT-05 および FAIL-01 補助観点の実測中に発見された事項を HIGH / MEDIUM / LOW に分類し、後続アクションへ振り分ける。

## 分類サマリー

| 分類   | 件数 | 後続アクション                                    |
| ------ | ---- | ------------------------------------------------- |
| HIGH   | 0    | （なし）                                          |
| MEDIUM | 1    | Phase 12 未タスク検出（Task 4）候補として申し送り |
| LOW    | 1    | 本ファイル補足に記載して閉じる                    |

## HIGH（マージ破損リスクなど致命的）

**該当なし**

- 本 Phase で実施した MT-01〜MT-05 および FAIL-01 でマージ破損は発生しなかった
- 構造化ファイルの conflict は設計意図通り（人手解決に委ねる）であり「破損」ではない
- driver 未登録状態でも静かに default 3-way へフォールバックし、データは保持される

## MEDIUM（挙動差異・追加検証候補）

### DISC-MED-01: driver 未登録時の stderr warning が実 Git では出力されない

**観察内容**:

- Phase 6 fail path（FAIL-01）では driver 未登録時に stderr へ `failed to resolve 'ours'` または `unknown merge driver 'ours'` が出力されることを想定していた
- Phase 11 実測（git 2.38.1 / Darwin）では stderr は**空**で、conflict だけが発生
- 挙動自体は仕様範囲内（default 3-way フォールバック）だが、「未登録を早期検知する手段が stderr 監視では働かない」

**影響**:

- `setup-merge-drivers.sh` 未実行の新規 clone 環境で driver 未登録に気づくまでに時間がかかる可能性
- ただし `SessionStart` フック（`session-init.sh`）が `(unset)` 検出で警告を出す仕組みは既存のため、実運用では補完されている

**推奨対応**:

- Phase 12 `implementation-guide.md` の Part 2 に「driver 未登録の検知は `SessionStart` hook または手動で `git config --get merge.ours.driver` で確認すべき（stderr 監視は不可）」と明記
- `scripts/check-gitattributes.sh`（REC-01）実装時は、driver 登録状態のチェックも組み込む

**Phase 12 への申し送り**:

- `outputs/phase-12/unassigned-task-detection.md` の候補リストへ追加
- 候補 A（`session-init.sh` → `setup-merge-drivers.sh` 自動呼び出し）の優先度を Low → Medium へ格上げ検討

**参考ログ**:

```
$ git config --get merge.ours.driver
(unset)

$ git merge idx-d --no-edit 2>stderr.log
Auto-merging .claude/skills/test-skill/indexes/topic-map.json
CONFLICT (content): Merge conflict in ...
Automatic merge failed; fix conflicts and then commit the result.

$ cat stderr.log
（空）
```

## LOW（補足情報のみ）

### DISC-LOW-01: `Merge made by the 'ort' strategy.` メッセージ

**観察内容**:

- MT-04 実行時、driver 登録状態でのマージ時に git が `Merge made by the 'ort' strategy.` を出力
- これは git 2.33+ のデフォルトマージ戦略 `ort`（Optimized Recursive with Three-way）によるもの
- `merge=ours` カスタムドライバーが `ort` 内で個別ファイル解決に呼び出されており、正常動作

**影響**: なし（情報メッセージのみ）

**対応**: `manual-test-result.md` §9.1 に補足し、本ファイルでクローズ。

## Linux / CI 委任事項（発見事項ではない）

以下は「発見事項」ではなく、本 Phase のスコープ外として CI ログに検証を委ねる:

- Linux 環境での `setup-merge-drivers.sh` 動作確認
- CI での `.gitattributes` 適用挙動
- git バージョン差異（2.30 未満、2.40 以上）での挙動確認

これらは Phase 10 final-review-result.md の「watch list」に既に記録されている。

## 完了条件

- [x] HIGH / MEDIUM / LOW の分類が完了している
- [x] HIGH は 0 件 → `unassigned-task/` への自動起票候補は不要
- [x] MEDIUM 1 件は Phase 12 への申し送り先を明記
- [x] LOW 1 件は本ファイル内で closure

## Phase 12 への申し送りチェックリスト

- [x] DISC-MED-01 を `outputs/phase-12/unassigned-task-detection.md` の候補リストに追加
- [x] 候補 A（session-init → setup-merge-drivers 自動呼び出し）の優先度再評価依頼
- [x] `implementation-guide.md` Part 2 への driver 検知方法記載依頼
