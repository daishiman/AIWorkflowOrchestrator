# 仕様エレガンス・整合性監査ガイド

> 最終更新日: 2026-03-13
> 目的: system spec が同じ粒度で再生成できるか、漏れ・矛盾・依存関係崩れなく維持できているかを、多角的に監査する

## 概要

このガイドは、「今回の内容はエレガントか」「この skill だけで同じ粒度を再現できるか」「漏れなく依存関係を閉じているか」を判定するための正本である。

監査対象は 4 層に分ける。

1. skill 本体が再現手順を持っているか
2. canonical set / inventory / register / workflow 実体が揃っているか
3. parent / child / history / archive / discovery の依存関係が閉じているか
4. 次回利用者が 2-3 手で正しい資料へ到達できるか

## 期待する出力

| 出力 | 内容 |
| --- | --- |
| reproducibility verdict | この skill だけで同粒度を再現できるか |
| coverage verdict | canonical files / legacy family / workflow evidence の漏れがないか |
| consistency verdict | 依存関係、命名、導線、監査値に矛盾がないか |
| elegance verdict | 構造が過剰でも不足でもなく、責務分離として妥当か |
| action log | 今回直したこと、残課題、blocked follow-up |

## SubAgent-Lane 分割

Agent Team 専用機能がなくても、以下の lane で同じ関心分離を再現する。

| Lane | 関心ごと | 主な確認対象 |
| --- | --- | --- |
| Lane-A | 再現性 | `SKILL.md`, `resource-map.md`, `quick-reference.md` |
| Lane-B | canonical coverage | `workflow-*.md`, inventory, register, completed workflow outputs |
| Lane-C | 依存関係と矛盾 | parent docs, legacy family, link 実在, generated/manual 判定 |
| Lane-D | 利用価値とエレガンス | 初動導線、引用しやすさ、責務分離、follow-up 切り出し |

## 多角的監査マトリクス

| 観点 | 主質問 | 検出したい欠陥 | 証拠 |
| --- | --- | --- | --- |
| 水平思考 | ほかの入口や代替構造の方が短く辿れないか | `resource-map` 1 枚に詰め込みすぎる、逆に入口が不足する | `resource-map`, `quick-reference`, workflow 正本 |
| 逆説思考 | 逆の設計を取ると何が壊れるか | 全部入り台帳化、名前先行 rename、inventory 省略 | workflow 正本, splitting guide |
| システム思考 | parent / child / history / archive / discovery が循環なく閉じているか | 入口だけ更新、history 置き去り、mirror drift | parent docs, `diff -qr` |
| 垂直思考 | 具体的にどの file / line / command が根拠か | ふわっとした結論、引用不能 | `topic-map`, line refs, command logs |
| 類推思考 | 既に成功した workflow と同じ型に乗っているか | 今回だけ特例の ad-hoc 構造 | workflow 系正本, lessons |
| if 思考 | もし 1 ファイル消えたら何が困るか | single point of failure が見えていない | canonical set, inventory |
| 素人思考 | 初見の人が 2-3 手で正本へ着けるか | register や inventory が暗黙知 | `SKILL.md`, `quick-reference.md` |
| トレードオン思考 | 読みやすさのために何を犠牲にし、何を守ったか | 分割し過ぎ / 集約し過ぎ | splitting guide, workflow 正本 |
| プラスサム思考 | 引用しやすさと保守性を同時に上げられているか | 片方だけ良い構造 | canonical set + inventory + register |
| 2軸思考 | 重要な二層判定を分離しているか | `current` / `baseline` 混同、manual / generated 混同 | lessons, task workflow, retrospective |
| 価値提案思考 | 次回利用者の作業時間を本当に短くするか | 管理者だけ分かる構造 | quick-reference, 5分解決カード |
| why 思考 | 今回の複雑さの根因は何か | rename 問題を naming の話だけにする | workflow 正本, lessons |
| 改善思考 | 最小変更で最大効果を出せているか | 大規模 rename を先に始める | register, guidelines |
| 戦略的思考 | wave 順序は依存関係に合っているか | 直列にすべき所まで並列にする | workflow 正本, close-out |
| ダブル・ループ思考 | 個別修正だけでなくルールまで更新したか | 今回だけ直して次回再発 | SKILL, guide, resource-map |
| 抽象化思考 | case-specific な知見を再利用ルールへ昇格できたか | 事例だけ残して一般化しない | workflow 正本, audit guide |
| プロセス思考 | 読む順番、編集順、検証順が固定されているか | 再現不能な属人プロセス | SKILL, quick-reference |
| 仮説思考 | まだ隠れた漏れがあるとしたらどこか | logs / parent note / inventory 漏れ | register, link audit |
| 論点思考 | 最初に決めるべき問いが定義されているか | naming から入ってしまう | splitting guide, audit guide |
| 因果関係ループ | stale index が stale citation を生む循環を断てているか | outdated map -> wrong source -> more drift | generate-index, current canonical set |

## 監査順序

1. Lane-A で `SKILL.md` に current canonical set と audit route があるか確認する。
2. Lane-B で workflow 正本、inventory、register、completed workflow outputs の 4 点が揃っているか確認する。
3. Lane-C で legacy family が parent docs から辿れるか、link 実在、manual/generated の 2 軸判定、mirror parity を確認する。
4. Lane-D で「初見利用者が正本に着けるか」「引用前チェックだけで迷わないか」を確認する。
5. 不足があれば rule / index / workflow / log を同一 wave で更新する。

## 必須コマンド

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js .claude/skills/aiworkflow-requirements
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
node .claude/skills/aiworkflow-requirements/scripts/list-specs.js --topics
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "line budget reform" -C 3
```

追加監査:

```bash
rg -n "legacy-ordinal-family-register|Current Canonical Set|classification-first" .claude/skills/aiworkflow-requirements
python3 - <<'PY'
from pathlib import Path
import re
root = Path('.claude/skills/aiworkflow-requirements/references')
ordinal = sorted(p.name for p in root.glob('*.md') if re.search(r'-(?:[a-z]|[1-9][0-9]*)\\.md$', p.name))
text = (root / 'legacy-ordinal-family-register.md').read_text()
missing = [name for name in ordinal if name not in text]
print({'ordinal_count': len(ordinal), 'missing_in_register': len(missing)})
PY
```

## 完了判定

以下が全部 `yes` なら、「同じ粒度で生成できる skill」と判定してよい。

| 判定 | yes 条件 |
| --- | --- |
| reproducibility | `SKILL.md` と `quick-reference.md` だけで current canonical set と監査順序が分かる |
| coverage | inventory、register、workflow 実体、follow-up が current canonical set に含まれる |
| consistency | parent note、line refs、generated/manual 判定、mirror parity に矛盾がない |
| elegance | 入口が薄く、完全一覧は別正本に逃がし、rename は分類結果として扱っている |

## 失敗時の処理

| 失敗類型 | 対応 |
| --- | --- |
| 再現手順不足 | `SKILL.md` / `quick-reference.md` / `resource-map.md` を更新する |
| canonical coverage 不足 | inventory / register / workflow 正本を更新する |
| 依存関係崩れ | parent note / current canonical set / mirror sync を更新する |
| docs-only で解決不能 | backlog / unassigned task として切り出す |

## 今後追加時の反映境界

この skill は、追加内容を「どこまで自動で反映できるか」と「どこを同一 wave で手動同期すべきか」を分けて扱う。

| 区分 | 対象 | 反映方法 |
| --- | --- | --- |
| 自動生成 | `topic-map.md`, `keywords.json` | `generate-index.js` を再実行する |
| 半自動同期 | `.agents` mirror | `.claude` を正本に更新し、最後に `rsync` と `diff -qr` を実行する |
| 手動同期必須 | `resource-map.md` current canonical set, `quick-reference.md`, inventory, register, parent docs, workflow 正本, `task-workflow.md`, `lessons-learned.md`, `LOGS.md` | classification-first で変更範囲を決め、同一 wave で更新する |

つまり、「この skill を使えば勝手に全部反映される」ではなく、「この skill の current canonical set と同一 wave checklist に従えば、漏れなく再現できる」が正しい。

## 今後追加時の同一 wave checklist

1. `.claude` 側だけを正本として編集する。
2. 新規追加か既存更新かを決め、`spec-splitting-guidelines.md` の classification-first で対象 family と parent を決める。
3. 新しい正本や更新済み正本を `workflow-*` 正本、inventory、必要なら register に反映する。
4. 入口導線として `resource-map.md` の current canonical set と `quick-reference.md` の読む順番を更新する。
5. domain ledger として `task-workflow.md`、`lessons-learned.md`、必要なら `LOGS.md` を更新する。
6. `generate-index.js` を実行して `topic-map.md` / `keywords.json` を再生成する。
7. `validate-structure.js`、link 実在確認、必要な grep 監査を実行する。
8. 最後に `.agents` へ mirror sync し、`diff -qr` 差分 0 を確認する。
9. docs-only で閉じない残課題は backlog / unassigned task へ切り出す。

## ユーザー依頼テンプレ

### 推奨テンプレ

```text
aiworkflow-requirements スキルを使って、今回の変更を system spec に反映してください。
classification-first で責務を分け、必要なら semantic filename で分割・rename してください。
新規追加・更新した内容は、resource-map の current canonical set、quick-reference、artifact inventory、必要な parent docs、task-workflow、lessons-learned、LOGS まで同一 wave で同期してください。
generate-index.js、validate-structure.js、mirror sync、diff -qr まで実行して、漏れ・矛盾・依存関係崩れがないか確認してください。
並列化できる監査は並列で、編集は直列で進めてください。コミットと PR はしないでください。
```

### rename を含む場合の追記

```text
旧 filename がある場合は legacy-ordinal-family-register.md も更新し、旧名から current semantic filename へ引き直せる状態にしてください。
```

### 引用資料を整えたい場合の追記

```text
引用前提で使えるように、current canonical set、artifact inventory、topic-map まで整備してください。
```
