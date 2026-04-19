# Phase 12: 実装ガイド

本ガイドは 2 部構成。Part 1 は直感的な例え話で理解し、Part 2 で実装者向けの厳密仕様を押さえる。

## 視覚証跡

**UI/UX変更なしのため Phase 11 スクリーンショット不要**（NON_VISUAL タスク）。

代替証跡:

- [`outputs/phase-10/final-review-result.md`](../phase-10/final-review-result.md)
- [`outputs/phase-11/manual-test-result.md`](../phase-11/manual-test-result.md)

---

# Part 1: お家の引っ越しにたとえて理解する `.gitattributes`

## 1. Git のマージは「お家の引っ越し」

チームでコードを書くとき、何人かが同じファイルを同時にいじる場面があります。そのとき Git は「マージ（合体）」という作業で複数人の変更を一つにまとめます。

これを **お家の引っ越し** にたとえてみましょう。

- 同じ部屋（ファイル）に、2 人がそれぞれ別の家具（変更）を運び込もうとしている
- 1 人はベッドを置きたい、もう 1 人は机を置きたい
- 同じスペースに 2 つ入れたら、**誰の荷物がどこにあるか分からなくなる**（= 衝突 / conflict）

Git は普段、賢く自動で合体しようとしますが、同じ場所を同時に変更すると「どっちを優先すればいいか分からん！」と止まります。そのときユーザーが手で決めるのが conflict 解決です。

## 2. `.gitattributes` は「この部屋は誰の荷物を優先するか」のメモ

お家の玄関に **メモ** を貼っておくと、引っ越し屋さんはそのメモを見て「この部屋はこうしてね」と分かります。

`.gitattributes` はまさにそのメモです。どのファイル（部屋）にどんなマージのやり方を使うかを Git に教えます。

## 3. マージ戦略 3 種類：ユニオン / アワーズ / デフォルト

本タスクで扱う 3 つの作戦を、引っ越しの例えで整理します。

| 作戦名（Git 名）          | たとえ                                                  | 向いているファイル                                 |
| ------------------------- | ------------------------------------------------------- | -------------------------------------------------- |
| `merge=union`（ユニオン） | **「どっちの荷物も全部置いておく」** 作戦               | 日記帳のように後ろに追記していくファイル           |
| `merge=ours`（アワーズ）  | **「今いる人の荷物を優先」** 作戦                       | 自動生成される目次みたいに、後で作り直せるファイル |
| デフォルト（3-way）       | **「同じ場所は人に決めてもらう」** 作戦（普通のマージ） | 見出しや表があるちゃんとした文章                   |

### 3.1 ユニオン（`merge=union`）= 日記帳

日記帳は毎日 **後ろに追記** するだけ。A さんが「今日の日記」を書き、B さんが「僕の日記」を書いたとき、両方とも残してほしいですよね。順番が入れ替わっても、内容は全部あるのが大事。

`merge=union` はまさにこれ。両方の変更を「上から順に両方とも残す」作戦です。

**向くファイル**: `LOGS.md`（ログ）、`SKILL-changelog.md`（変更履歴）、`task-workflow-completed.md`（完了リスト）、`lessons-learned-*.md`（日付付きの学びメモ）

### 3.2 アワーズ（`merge=ours`）= 自動生成の目次

本の目次は、本文が決まったら **自動で作り直せる** ものです。A さんが作った目次と B さんが作った目次が食い違っていても、**今の本（main ブランチ）に合う方だけ残し**、あとでプログラムに目次を再生成させればいい。

`merge=ours` はこれ。**自ブランチ（統合先）側の内容を採用** し、相手側は捨てる。あとでスクリプトで作り直します。

**向くファイル**: `EVALS.json`（評価結果）、`indexes/*.json` / `indexes/*.md`（検索用インデックス）

### 3.3 デフォルト（3-way）= ちゃんとした文章

章立ての本や設計書は、同じ段落に 2 人が別々の文章を書くと **内容がぐちゃぐちゃ** になります。勝手にくっつけちゃうと意味が通らない。

こういうファイルは、同じ場所を同時に変更されたら「ユーザーさん、どっちがいいか手で決めてください」と **一時停止** する方が安全です。これが Git のデフォルト（3-way マージ）。

**向くファイル**: `references/task-workflow.md`（公式の手順書）、`lessons-learned.md`（root の総合まとめ）、`api-*.md` / `arch-*.md`（API や設計ドキュメント）

## 4. 本タスクで何を直したか

Before:

```
references/*.md   merge=union   # 全部まとめてユニオン（日記帳作戦）
```

→ でも `references/task-workflow.md` のような **ちゃんとした文章** までユニオンにされて、見出しが 2 個になったり、表が壊れたりする危険があった。

After:

```
LOGS.md や task-workflow-completed*.md などは個別に union（日記帳のまま）
task-workflow.md や api-*.md は指定なし（= デフォルトでちゃんと止まる）
```

→ 日記帳は日記帳のまま、ちゃんとした文章はちゃんと手で解決、の分け方を明確にしました。

## 5. 新しいファイルを追加するとき

`.claude/skills/<何か>/references/` に新しい `.md` ファイルを追加するときは、自分に聞いてみます。

- そのファイルは **後ろに追記していくだけ** ですか？ → YES → グループA（ユニオン）
- そのファイルは **見出しや表がある、ちゃんとした文章** ですか？ → YES → グループB（デフォルト）
- そのファイルは **スクリプトで自動生成され、いつでも作り直せる** ですか？ → YES → グループC（アワーズ）

分からなかったら **デフォルト（= 何も書かない）** が安全です。あとで困ったら変えればいい。

---

# Part 2: 技術者向け厳密仕様

## 1. 本タスクの変更範囲

| ファイル                                 | 変更内容                                                                           |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| `.gitattributes`                         | `references/*.md merge=union` を削除し、append-only ファイルを個別 glob で明示列挙 |
| `.claude/scripts/setup-merge-drivers.sh` | 冒頭コメント拡充（ロジック変更なし）                                               |

挙動上の正味変更は `.gitattributes` 1 ファイルのみ。

## 1.1 インターフェース / 型定義（TypeScript）

このタスクは実アプリの公開 API を増やしていないが、保守判断を固定するために「分類ルールの契約」を型として表すと次のようになる。

```ts
type MergeStrategyGroup =
  | "append_only_union"
  | "structured_default"
  | "generated_ours";

interface MergeClassificationRule {
  group: MergeStrategyGroup;
  pathPattern: string;
  rationale: string;
  examples: string[];
}

interface MergeDriverCheckResult {
  driverRegistered: boolean;
  gitCheckAttr: "union" | "ours" | "unspecified";
  remediationCommand?: string;
}
```

```ts
const RULES: MergeClassificationRule[] = [
  {
    group: "append_only_union",
    pathPattern: ".claude/skills/*/references/task-workflow-completed*.md",
    rationale: "末尾追記が支配的で、両ブランチの追記を落としたくない",
    examples: ["LOGS.md", "SKILL-changelog.md", "lessons-learned-2026-04.md"],
  },
  {
    group: "structured_default",
    pathPattern: ".claude/skills/*/references/task-workflow.md",
    rationale: "見出しや表の構造を持つため、衝突時は人手解決が安全",
    examples: ["task-workflow.md", "api-core.md", "arch-*.md"],
  },
  {
    group: "generated_ours",
    pathPattern: ".claude/skills/*/indexes/*.md",
    rationale: "自動生成物なので自ブランチ側を採用し、後で再生成する",
    examples: ["indexes/topic-map.md", "indexes/keywords.json", "EVALS.json"],
  },
];
```

## 1.2 API シグネチャと使用例

このタスクの運用 API は shell command ベースで、確認と復旧に使うシグネチャは次の 4 本に集約される。

```ts
type CheckAttr = (path: string) => "union" | "ours" | "unspecified";
type RegisterMergeDriver = () => void;
type RebuildIndexes = () => void;
type EvaluateReferenceFile = (path: string) => MergeStrategyGroup;
```

使用例:

```bash
# 属性確認
git check-attr merge -- .claude/skills/foo/references/task-workflow.md

# merge=ours ドライバー登録
bash .claude/scripts/setup-merge-drivers.sh

# generated index の再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

## 1.3 設定可能なパラメータと定数

| 項目                  | 値 / 例                                                                 | 用途                            |
| --------------------- | ----------------------------------------------------------------------- | ------------------------------- |
| `MergeStrategyGroup`  | `append_only_union` / `structured_default` / `generated_ours`           | ファイル分類の canonical 値     |
| `pathPattern`         | `.claude/skills/*/references/task-workflow-completed*.md`               | `.gitattributes` へ書く glob    |
| `remediationCommand`  | `bash .claude/scripts/setup-merge-drivers.sh`                           | `merge=ours` 未登録時の復旧手順 |
| `verificationCommand` | `git check-attr merge -- <path>`                                        | 実際の attribute 解決確認       |
| `rebuildCommand`      | `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` | generated index の再生成        |

## 1.4 エラーハンドリングとエッジケース

| ケース                                   | 症状                                                              | 対応                                                                        |
| ---------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `merge.ours.driver` 未登録               | `merge=ours` が解決されず default 3-way conflict へフォールバック | `git config --get merge.ours.driver` で確認し、未登録なら setup script 実行 |
| 構造化ファイルへ `merge=union` 誤適用    | 重複見出し、表破損、順序崩れ                                      | Group B として default 3-way に戻す                                         |
| append-only だが命名規約外               | 既存 glob で保護されない                                          | Part 2 の再評価フローに従って分類・必要なら `.gitattributes` 追記           |
| generated index を ours 採用後に差分喪失 | index 内容が古い                                                  | generator 再実行で復旧                                                      |

## 2. `merge=union` の挙動と適用基準

### 2.1 ラインベース挙動

`merge=union` は Git 組み込みの built-in merge driver で、両側の変更行を **重複排除せず** そのまま連結する。

- 並列追記（base → A で +line_a / base → B で +line_b）: 両 line が保持される
- 同一区間の書き換え（base "line_x" → A で "line_a" / B で "line_b"）: 両方が保持され、両方が残る（= ユーザー視点では **重複行のように見える**）
- 削除の扱いも同様で、削除と追記が並行すると追記側が勝つ形で残る

### 2.2 適用条件

append-only ファイル、すなわち「**末尾追記が支配的** で、行順序が意味を持たない」ファイル **のみ** に適用する。例:

- `LOGS.md`（時系列 log）
- `SKILL-changelog.md`（append-only changelog）
- `task-workflow-completed*.md`（完了タスク list）
- `lessons-learned-*.md`（日付付きのバージョン別 lessons）

### 2.3 不適用条件（重要）

以下には **適用しない**（Phase 5 で除外済み）:

- 見出しツリーを持つ構造化ドキュメント（`task-workflow.md` / `lessons-learned.md`(root) / `api-*.md` / `arch-*.md` 等）
- 表（Markdown table）を含むファイル
- front-matter を解析対象とする静的サイトの source

理由: `merge=union` は行単位の集合操作であり、見出しや表構造の整合性を保証しない。重複見出しや壊れた表カラムを発生させる。

## 3. カスタム merge driver `merge=ours` の登録

### 3.1 登録コマンド

```bash
$ bash .claude/scripts/setup-merge-drivers.sh
[setup-merge-drivers] merge.ours.driver = true を設定しました

$ git config --get merge.ours.driver
true
```

内部的には `git config merge.ours.driver true` を実行。`true` は「何もせず自ブランチ側を採用する」Unix コマンド `true` を指し、`merge=ours` 指定ファイルに対して Git はこのコマンドを呼び出して「競合なし」扱いで処理する。

### 3.2 未登録時のフォールバック挙動

driver 未登録時、Git は `merge=ours` を解決できず以下の挙動になる:

- Git 2.38 実測（本タスク Phase 11 MT / FAIL-01）: **stderr warning は出ず、黙って default 3-way へフォールバック**し、同一箇所変更なら conflict marker 付きで停止
- 警告テキスト `failed to resolve 'ours'` は古い Git バージョン / 特定条件下でのみ出力される可能性

### 3.3 未登録の検知方法

stderr 監視では検知不能なため、以下を併用:

- **SessionStart hook**: `session-init.sh` が起動時に `(unset)` を検知して警告
- **手動確認**: `git config --get merge.ours.driver` を `true` で返ることを確認
- **将来の CI check**: `scripts/check-gitattributes.sh` (REC-01) で自動化

## 4. `.gitattributes` glob 構文と採用方針

### 4.1 Git の glob セマンティクス（抜粋）

| パターン    | マッチ範囲                                   | 備考                                    |
| ----------- | -------------------------------------------- | --------------------------------------- |
| `*`         | スラッシュを含まない任意の文字列             | 1 階層内のみ                            |
| `**`        | パスセパレータを含む任意の文字列             | `.gitattributes` 内では特殊扱いされない |
| `a/b/*`     | `a/b/X` にマッチ、`a/b/c/X` にはマッチしない | 2 階層下はマッチしない                  |
| `a/**/*.md` | `a/X.md`, `a/b/X.md` 両方にマッチ            | 任意深度                                |

### 4.2 本タスクでの採用パターン

「最後にマッチしたパターンが勝つ」Git ルールに従い、**広い glob を削り狭い glob だけを残す** ことで「必要なファイルだけに戦略を適用する」方針を採用。明示的 reset（`-merge`）は使用しない。

```
# append-only のみ union を明示
.claude/skills/*/LOGS.md                                   merge=union
.claude/skills/*/references/LOGS.md                        merge=union
.claude/skills/*/references/task-workflow-completed*.md    merge=union
...
# 構造化ファイルは何も書かない → default
```

## 5. 属性検証手順（`git check-attr`）

### 5.1 単一ファイル確認

```bash
$ git check-attr merge -- .claude/skills/foo/LOGS.md
.claude/skills/foo/LOGS.md: merge: union

$ git check-attr merge -- .claude/skills/foo/references/task-workflow.md
.claude/skills/foo/references/task-workflow.md: merge: unspecified
```

`unspecified` が返れば default 3-way マージ。

### 5.2 一括確認（レビュー時）

```bash
$ find .claude/skills -name "*.md" -print0 \
    | xargs -0 git check-attr merge -- \
    | grep -v 'merge: unspecified'
```

`unspecified` 以外が一覧化される。期待と一致するかを目視確認。

### 5.3 マージ実測（シミュレーション）

本タスク Phase 11 の MT-01〜MT-05 形式を参照（`outputs/phase-11/manual-test-result.md`）。
一時 repo に `.gitattributes` をコピーし、2 ブランチから並列変更 → マージで挙動確認。

## 6. 新規 `references/` ファイル追加時の再評価フロー

```
新規 references/<name>.md を追加する
           │
           ▼
  「末尾追記が支配的？」 ── YES ──▶ グループA（union）
           │                              │
           │ NO                           ▼
           ▼                       `.gitattributes` にペア追記（.claude/ と .agents/）
  「見出し / 表 / 節がある？」── YES ──▶ グループB（default）
           │                              │
           │ NO                           ▼
           ▼                       何も書かない（default に任せる）
  「スクリプトで再生成可能？」── YES ──▶ グループC（ours）
                                          │
                                          ▼
                              `.gitattributes` にペア追記（ours）
```

### 6.1 命名規約で判定できるパターン

| ファイル名パターン                                           | 推奨グループ | 根拠                                        |
| ------------------------------------------------------------ | ------------ | ------------------------------------------- |
| `LOGS.md`                                                    | A            | 時系列 log                                  |
| `SKILL-changelog.md`                                         | A            | append-only changelog                       |
| `task-workflow-completed*.md`                                | A            | 完了タスク list                             |
| `lessons-learned-<date>.md`                                  | A            | 日付付き lesson（root の総合版は B に注意） |
| `task-workflow.md`                                           | B            | 公式手順書（構造化）                        |
| `lessons-learned.md`（root）                                 | B            | 総合 lesson（構造化）                       |
| `api-*.md` / `arch-*.md`                                     | B            | 設計ドキュメント                            |
| `quick-reference*.md` / `resource-map*.md` / `topic-map*.md` | B            | 構造化参照ファイル                          |
| `phase-template-*.md`                                        | B            | テンプレート                                |
| `unassigned-task-*.md`                                       | B            | 候補 list                                   |
| `EVALS.json`                                                 | C            | 評価結果（再生成可能）                      |
| `indexes/*.json` / `indexes/*.md`                            | C            | 自動生成インデックス                        |

### 6.2 命名規約外の新規ファイルが出た場合

1. Phase 12 未タスク検出 候補 B（front-matter による分類宣言）を起票候補として確認
2. 暫定対応として `.gitattributes` にペア追記（`.claude/` と `.agents/` の両側）
3. `outputs/phase-9/quality-report.md` の mirror parity チェックを再実行

## 7. ロールバック手順

挙動を Phase 5 以前に戻す必要がある場合:

```bash
# Phase 8 リファクタ後の .gitattributes を Phase 4 以前に戻す例
$ git show <commit_before_phase5>:.gitattributes > .gitattributes
$ git check-attr merge -- <代表ファイル>  # 挙動を再確認
```

または特定グループだけ除外する場合は、該当 glob 行を削除（= default に戻す）すれば良い。

## 8. 関連資料

| 資料                                        | 用途                               |
| ------------------------------------------- | ---------------------------------- |
| `.gitattributes`                            | 本タスクの設定本体                 |
| `.claude/scripts/setup-merge-drivers.sh`    | `merge=ours` driver 登録スクリプト |
| `outputs/phase-5/implementation-summary.md` | 挙動変更の要約                     |
| `outputs/phase-8/refactoring-log.md`        | コスメティック整形の記録           |
| `outputs/phase-11/manual-test-result.md`    | 実マージ挙動の検証ログ             |
| Issue #2281                                 | 元の問題定義                       |
