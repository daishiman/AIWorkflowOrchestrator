# task-generate-index-determinism-guard-001: generate-index.js 決定性ガード（2回連続実行差分検査）

## 1. メタ情報

| 項目            | 値                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------- |
| task_id         | `task-generate-index-determinism-guard-001`                                               |
| issue_number    | [#2333](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2333)                  |
| name            | generate-index.js 決定性ガード（2回連続実行差分検査）                                     |
| category        | 改善（品質保証 / sync 信頼性）                                                            |
| priority        | 低 (LOW)                                                                                  |
| scale           | 小規模（推定 2時間）                                                                      |
| status          | unassigned                                                                                |
| source_phase    | TASK-AGENTS-SKILLS-FULL-SYNC-001 / Phase-12 `unassigned-task-detection.md`                |
| created_date    | 2026-04-19                                                                                |
| related_tasks   | TASK-AGENTS-SKILLS-FULL-SYNC-001（親）、TASK-CONFLICT-PREVENT-001（同系統の parity 保護） |
| owner           | 未割り当て                                                                                |
| estimated_hours | 2h                                                                                        |

### 位置づけ

本タスクは親タスク `TASK-AGENTS-SKILLS-FULL-SYNC-001` の Phase-12 で「未タスク（LOW）」として検出された改善項目である。`generate-index.js` が将来 non-deterministic になった場合、`sync-skills-mirror.sh` の最終 `diff -qr` が常に差分を出し、parity OK に到達しない恐れがあるため、早期検出のためのガードを追加する。

---

## 2. なぜ必要か（Why）

### 2.1 背景

AIWorkflowOrchestrator では canonical（`.claude/`）と mirror（`.agents/`）の 2 階層に同一内容を保持する運用を採用しており、`sync-skills-mirror.sh` がその同期を司る。sync の最終段は `diff -qr .claude/skills .agents/skills` による parity 検査であり、ここが 0 件でなければ CI は fail する。

一方、`.claude/skills/aiworkflow-requirements/scripts/generate-index.js` は `references/` 配下の Markdown を走査し `indexes/keywords.json` と `indexes/topic-map.md` を再生成する。このスクリプトは現在 deterministic（同じ入力に対して常に同じ出力）であることを前提に parity が成立している。

### 2.2 deterministic output の重要性

Parity 検査は「ファイルのバイト列完全一致」を求めるため、`generate-index.js` の出力が実行ごとに揺れると以下の連鎖障害が起きる:

1. `.claude/` 側で生成 → commit
2. `.agents/` 側で再生成 → 同じ入力でも微妙に異なる出力
3. `diff -qr` が差分検出 → sync exit 1
4. 再 sync しても同じ事象 → 収束しない

この症状は「原因が sync スクリプトなのか generator なのか切り分けしづらい」という副作用を生み、親タスクの Phase-12 苦戦箇所でも類似事例が共有されている。

### 2.3 非 deterministic 化しやすい要因

`generate-index.js` に以下のような変更が入ると容易に non-deterministic になる:

- 日付ヘッダを `new Date().toISOString()` で埋め込む（過去に実際に発生した）
- `fs.readdirSync` の戻り順を sort せずに使う（OS・FS 依存）
- `glob` のデフォルト順序に依存
- Map / Set のイテレーション順に依存（挿入順が入力順で揺れる）
- TZ 依存のタイムスタンプ
- キーワード抽出で `Math.random()` や `Date.now()` を使う

### 2.4 放置した場合の影響

- parity NG が「generator 側の揺れ」なのか「mirror の実反映漏れ」なのか判別できず、デバッグに時間を要する
- CI が恒常的に赤になり、他のタスクの merge がブロックされる
- 最悪の場合 mirror を手で書き換えて「揃えた」ように見せる運用ミスが発生し、canonical との論理的乖離を誘発する

### 2.5 HIGH にしない理由

現状、sync の exit 1 により非 deterministic 化は間接的に検知できる。また、`generate-index.js` は小規模で変更頻度も低いため、事故確率はそこまで高くない。したがって優先度は LOW に留め、実害が出た時または CI 強化フェーズで取り込む。

---

## 3. 何を達成するか（What）

### 3.1 目的

`generate-index.js` が deterministic である（同じ `references/` 入力に対して 2 回連続実行しても完全一致する）ことを、自動検査で保証する。

### 3.2 最終ゴール

- sync または CI から呼び出せる `verify-generate-index-determinism.sh`（または同等のチェック）を追加
- 2 回連続実行して `keywords.json` / `topic-map.md` の両方が完全一致することを検査
- 不一致時は exit 1 と差分サマリを出力
- ドキュメントにガードの使い方を追記

### 3.3 スコープ

**含む:**

- `generate-index.js` を 2 回連続実行し、出力を一時ディレクトリで比較するシェルスクリプト（または Node スクリプト）
- `keywords.json`（JSON、キー順/配列順も含め厳密比較）
- `topic-map.md`（行順・改行コード・末尾改行も含め厳密比較）
- sync スクリプトまたは pre-push / CI への組み込みポイントの提案（実装は任意）
- 意図的に non-deterministic にした回帰テスト（1 件）

**含まない:**

- `generate-index.js` 自体のリファクタリング（deterministic であれば触らない）
- `.claude/skills/` 配下の他 generator への適用（別タスクで取り込む）
- parity 検査ロジックそのものの再設計

### 3.4 成果物

| 成果物                                                              | パス                                                                                     |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 決定性ガードスクリプト                                              | `.claude/scripts/verify-generate-index-determinism.sh`                                   |
| 回帰テスト（擬似的に non-deterministic にして検出されることの確認） | `.claude/scripts/__tests__/verify-generate-index-determinism.test.sh` または Vitest 追加 |
| ドキュメント追記                                                    | 親タスクの lessons-learned もしくは `docs/30-workflows/` 内の該当ガイド                  |

---

## 4. どのように実行するか（How）

### 4.1 前提条件

- `.claude/skills/aiworkflow-requirements/scripts/generate-index.js` が存在し、`node scripts/generate-index.js` で実行可能であること
- `references/` 配下の Markdown が整備されていること
- Node.js 20+ / pnpm セットアップ済み

### 4.2 依存タスク

- **親**: `TASK-AGENTS-SKILLS-FULL-SYNC-001` 完了後に着手
- **前提**: `.claude/scripts/sync-skills-mirror.sh` および `verify-skills-parity.sh` が存在する状態

### 4.3 必要な知識

- **2回連続実行＆比較**: 同一入力に対して generator を 2 回実行し、出力のバイト列完全一致を確認するのが最もシンプルかつ堅牢な deterministic テスト手法
- `diff -q` による無言差分検査と、差分があった場合の `diff -u` 詳細出力
- JSON の安定比較（`jq -S . file1 | sha256sum` を用いた正規化比較も有効）
- シェルでの一時ディレクトリ管理（`mktemp -d`、`trap 'rm -rf "$TMPDIR"' EXIT`）

### 4.4 推奨アプローチ

1. `generate-index.js` を `--out-dir <path>` オプションで出力先を切り替えられるよう拡張（もし未対応なら）
   - 既に対応している場合はそのまま利用
2. 一時ディレクトリ A と B に 2 回出力
3. `diff -q A/keywords.json B/keywords.json` と `diff -q A/topic-map.md B/topic-map.md` を実行
4. いずれかに差分があれば、`diff -u` を出力し exit 1
5. 両方一致なら exit 0

出力先切替が困難な場合は、実行の都度 `.claude/skills/aiworkflow-requirements/indexes/` を退避コピー → 実行 → 比較 → 復元、の順で扱う（副作用を残さない）。

---

## 5. 実行手順（Phase 1-4）

### Phase 1: 調査・設計（30分）

1. `generate-index.js` の現行 CLI 仕様確認（`--out-dir` 相当のオプション有無）
2. 出力ファイル（`keywords.json`, `topic-map.md`）の現状バイナリ一致性確認（手動で 2 回実行してみる）
3. 一時ディレクトリ運用と比較手順の決定
4. 発動タイミングを決定:
   - 案A: **sync の毎回実行時**（重いが常時保証）
   - 案B: **parity NG 時のみ**（軽量だが発動頻度が稀）
   - 案C: **独立した CI ジョブ**（並列化しやすい）
   - 推奨は **案B + 案C の併用**（日常運用は parity NG トリガ、CI では毎回回す）

### Phase 2: 実装（45分）

1. `.claude/scripts/verify-generate-index-determinism.sh` を新規作成
   - `mktemp -d` で 2 つの作業ディレクトリを作成
   - `generate-index.js` を 2 回呼び出し
   - `diff -q` で `keywords.json` と `topic-map.md` を比較
   - 差分時は `diff -u` の冒頭 50 行を表示し exit 1
2. `sync-skills-mirror.sh` から「parity NG 時のみ」呼び出す分岐を追加（案B）
3. `pnpm run` スクリプトまたは CI ワークフローからの呼び出しポイントを追加

### Phase 3: 回帰テスト（30分）

1. `generate-index.js` を一時的に `Date.now()` をコメントで埋め込むよう改造し、ガードが exit 1 になることを確認
2. 改造を戻し、通常時は exit 0 になることを確認
3. スクリプトの標準テスト（BATS もしくは Vitest の shell-runner）を 1 件追加

### Phase 4: ドキュメント・クロージング（15分）

1. 親タスクの lessons-learned に「non-deterministic 化の予兆は 2 回連続実行で確実に検知できる」を追記
2. `README.md` または該当 skill の `SKILL.md` にガードの実行方法を短く追加
3. Phase 12 の「未タスク検出」項目から本タスクを解消扱いに更新

---

## 6. 完了条件チェックリスト

- [ ] `.claude/scripts/verify-generate-index-determinism.sh` が存在し、単体実行で exit 0 を返す
- [ ] `generate-index.js` を意図的に non-deterministic に改造した状態で exit 1 を返すことを手動確認
- [ ] `keywords.json` と `topic-map.md` の両方を比較対象に含めている
- [ ] 一時ディレクトリが必ず削除される（`trap EXIT` 実装確認）
- [ ] `.claude/skills/aiworkflow-requirements/indexes/` に副作用を残さない
- [ ] sync または CI からの呼び出しポイントが最低 1 箇所に追加済み
- [ ] lint / shellcheck が通る
- [ ] ドキュメント追記済み
- [ ] Phase 12 の未タスク一覧から削除（または「resolved」へ移動）

---

## 7. 検証方法

### 7.1 正常系

1. 現在の `main` ブランチで `bash .claude/scripts/verify-generate-index-determinism.sh` を実行
2. exit code が 0 であること
3. 標準出力に「deterministic OK」（または同等メッセージ）が出ること

### 7.2 異常系（意図的な non-deterministic 化）

以下のいずれかで一時的に `generate-index.js` を壊し、ガードが exit 1 を返すことを確認する:

**パターン A: 日付埋め込み**

```js
// topic-map.md 冒頭に追加
output.push(`<!-- generated at ${new Date().toISOString()} -->`);
```

**パターン B: ファイル列挙順をランダム化**

```js
files.sort(() => Math.random() - 0.5);
```

**パターン C: Map のイテレーション順依存を意図的に崩す**

```js
for (const [k, v] of Array.from(map.entries()).reverse()) { ... }
// ← 2 回目実行ではこの `reverse()` 呼び出し自体を片方だけスキップする条件を入れて揺らす
```

いずれのパターンでも `diff -u` の冒頭が表示され、exit 1 になることを確認。確認後は必ず改造を revert する。

### 7.3 回帰防止

回帰テスト（`__tests__/verify-generate-index-determinism.test.sh` 等）を pre-push もしくは CI に組み込み、generator 変更 PR では必ず走るようにする。

---

## 8. リスクと対策

| リスク                              | 影響                         | 対策                                                                         |
| ----------------------------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| 2 回連続実行によるビルド時間増      | CI が数秒〜十数秒遅くなる    | 親タスクの parity NG 時のみトリガ（案B）または別ジョブ並列化（案C）          |
| 一時ディレクトリ削除漏れ            | ディスク圧迫                 | `trap 'rm -rf "$TMPDIR"' EXIT` を必ず設置                                    |
| `indexes/` への書き戻し事故         | canonical の破壊             | 出力先を必ず一時ディレクトリに限定、`--out-dir` 対応 or 退避コピー方式       |
| 将来 generator が並列書き込みを導入 | 2 回連続実行だけでは検知不能 | 3 回実行や `--seed` 指定など拡張を検討（本タスクスコープ外）                 |
| OS 依存の FS 列挙順差異             | Mac と Linux CI で挙動差     | 比較は同一環境内の 2 回連続で行うため影響なし。ただし CI は Linux で走らせる |
| TZ 依存                             | ローカルとCIで差             | generator が `UTC` 固定でない箇所がないか Phase 1 で確認                     |

---

## 9. 参照情報

### 9.1 コード / スクリプト

- `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- `.claude/scripts/sync-skills-mirror.sh`
- `.claude/scripts/verify-skills-parity.sh`
- `.claude/skills/aiworkflow-requirements/indexes/keywords.json`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`

### 9.2 関連タスク

- `docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md`（親）
- `TASK-CONFLICT-PREVENT-001`（同系統の parity 保護）

### 9.3 運用規約

- canonical = `.claude/skills/`、mirror = `.agents/skills/`、merge policy は親タスク参照
- deterministic generate-index は AIWorkflowOrchestrator の sync 運用の前提

---

## 10. 苦戦箇所（必須・詳細）

本節は親タスク実装および過去の `TASK-CONFLICT-PREVENT-001` 実装で得られた知見を実担当者が即座に参照できるようにまとめたもの。着手前に必ず一読すること。

### 10.1 `generate-index.js` の日付ヘッダ non-deterministic 事例（実発生）

親タスク `TASK-AGENTS-SKILLS-FULL-SYNC-001` の実装初期に、一時的に `topic-map.md` の先頭へ `generated at <ISO8601>` を埋め込む変更を入れた PR が存在した。結果:

- canonical 側で生成 → commit
- CI 上で mirror 側を再生成 → ミリ秒レベルで時刻が異なる
- `diff -qr` が常に差分を検出 → 無限ループ的に parity NG
- revert するまで 40 分ほど PR が詰まった

**教訓**: 「生成物にその瞬間の状態（時刻・乱数・環境変数の値）を埋め込まない」のが最低限の規律。今回のガードはこの事象を 2 回実行差分で機械検出する目的を果たす。

### 10.2 2 回連続実行のコスト

`generate-index.js` は `references/` 配下 30〜50 ファイルを走査する軽量スクリプトで、ローカル実行で 1 秒未満、CI でも 2〜3 秒程度。したがって:

- 1 回あたり最大で +数秒 のコスト
- ただし **sync の毎回実行時** に呼ぶと PR ごとに積算されるため、parity NG トリガ（案B）が現実解

もし将来 generator が重くなった場合（LLM 埋め込みなど）、本ガードは「独立 CI ジョブ」への切り出しを再検討すること。

### 10.3 比較対象が複数ファイルにまたがる

`keywords.json`（JSON）と `topic-map.md`（Markdown）で比較方式が微妙に異なる:

- **JSON**: キー順が揺れると `diff` では差分に見えるが、意味的には等価。厳密運用上は `jq -S . | sha256sum` で正規化比較するのも一案だが、**本タスクではバイト列一致を強制** する（そもそも generator 側でキー順を固定すべきという思想）
- **Markdown**: 末尾改行・CRLF/LF・BOM 有無にも注意。`file` コマンドや `wc -l` での事前確認を推奨

比較漏れを防ぐため、比較ループは「`indexes/` 配下の全ファイル」を対象にすることが望ましい。決め打ちで `keywords.json` `topic-map.md` の 2 本だけを書くと、将来 index が増えた際にサイレントにガードが抜ける。

```bash
# 推奨: indexes/ 配下を全走査
for f in "$A"/*; do
  name=$(basename "$f")
  diff -q "$A/$name" "$B/$name" || fail=1
done
```

### 10.4 環境要因

以下は「同一マシンの 2 回連続実行」でも揺れる可能性がある点:

- **FS 列挙順**: APFS / ext4 / tmpfs で `readdir` の順序が異なる。同一 FS 内でも inode 配置で揺れることがある → generator 側で **必ず `sort()`** する
- **glob の sort 順序**: Node の `glob` パッケージはバージョンによりデフォルト挙動が異なる。`{ sort: true }` 明示を推奨（本タスクでは generator 側の是正は対象外だが発見したら別タスク化）
- **TZ**: `process.env.TZ` 依存があれば要修正。generator を grep して `Date` が出てこないことを確認しておくと安心
- **ロケール**: `String.prototype.localeCompare` は `LANG` 環境変数で結果が変わる → `{ sensitivity: 'base', numeric: true }` など明示指定が必須。generator に `localeCompare` を見つけたら注意

### 10.5 ガード発動条件の設計判断

2 つの選択肢がある:

| 方式                 | 利点                   | 欠点                                                                        |
| -------------------- | ---------------------- | --------------------------------------------------------------------------- |
| 全 sync 実行時に毎回 | 常時保証、回帰を即検知 | 毎回コスト積算、PR ごとに +数秒                                             |
| parity NG 時のみ     | 軽量、日常は透明       | non-deterministic で parity OK になる病理は検知不能（現実にはほぼ起きない） |

**推奨**: parity NG 時のみ（案B） + CI 独立ジョブ（案C）。

- 開発者の日常ループ（pre-push）は軽いまま
- CI では確実に毎回走る
- parity NG の原因切り分けが自動化される

ただし、generator に大きな変更（新しい index ファイル追加、LLM 呼び出し導入など）が入る PR では、CI ジョブが走る前に手動で `.claude/scripts/verify-generate-index-determinism.sh` をローカル実行することを README に明記しておくと、レビュー往復を減らせる。

### 10.6 `TASK-CONFLICT-PREVENT-001` との関係

同タスクでは「canonical と mirror の merge 競合を検知するガード」を扱った。本タスクは「generator 出力のゆらぎを検知するガード」であり、両者は **parity NG の原因を切り分けるための補完関係** にある:

1. parity NG 発生
2. まず本タスクのガード（決定性検査）を実行 → **OK なら mirror 反映漏れ**、**NG なら generator の揺れ**
3. 次に `TASK-CONFLICT-PREVENT-001` の merge ガードを実行 → canonical/mirror の意図せぬ分岐を検知

この切り分けフローを lessons-learned に書き残しておくと、将来の担当者が迷わない。

### 10.7 実装時の落とし穴（チェックリスト）

- [ ] `mktemp -d` を使い、`/tmp` 直書きしない
- [ ] `trap 'rm -rf "$TMPDIR"' EXIT` を必ず書く（`INT TERM` も含める）
- [ ] `generate-index.js` の実行前に `references/` を絶対に書き換えない（read-only 参照のみ）
- [ ] 出力先を `--out-dir` で切れない場合は、`indexes/` を退避コピーしてから 2 回実行 → 退避版を復元
- [ ] `diff -q` の exit code を確実に補足（`set -e` 環境下では `|| fail=1` の工夫が必要）
- [ ] ShellCheck を通す
- [ ] CI 実行は Linux コンテナ想定。macOS 固有の挙動（BSD `sed` / `diff`）に依存しない
- [ ] 実行ログに `sha256sum` を併記するとデバッグが容易（差分検知時も「どの程度違うか」が一目で分かる）

---

## 11. 完了後の後処理

- `docs/30-workflows/unassigned-task/` から本ファイルを `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/` 配下または完了ディレクトリへ移動
- 親タスク `TASK-AGENTS-SKILLS-FULL-SYNC-001` の Phase-12 `unassigned-task-detection.md` の該当項目を「resolved」に更新
- lessons-learned に本タスクで得た知見（特に 10.3 / 10.5 / 10.6）を追記

---

（本仕様書は task-specification-creator skill の構成に準拠し、AIWorkflowOrchestrator の既存規約（canonical=.claude、mirror=.agents、merge policy、deterministic generate-index）に従う。）
