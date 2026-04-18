# `.gitattributes` `references/*.md` の `merge=union` 長期リスク再評価 - タスク指示書

## メタ情報

```yaml
issue_number: 2281
```

## メタ情報

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| タスクID     | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001                               |
| タスク名     | `.gitattributes` `references/*.md` の `merge=union` 長期リスク再評価    |
| 分類         | リファクタリング/設計見直し                                             |
| 対象機能     | Git マージ戦略 / `.gitattributes`                                       |
| 優先度       | 中                                                                      |
| 見積もり規模 | 小規模                                                                  |
| ステータス   | 未実施                                                                  |
| 発見元       | Phase 12（TASK-CONFLICT-PREVENT-001 の `unassigned-task-detection.md`） |
| 発見日       | 2026-04-18                                                              |
| Issue番号    | -（未作成）                                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-CONFLICT-PREVENT-001 で並列ブランチ開発時のコンフリクトを防ぐため、`.gitattributes` に
マージ戦略を明示した。その中で `references/*.md`（および `LOGS.md`、`SKILL-changelog.md`）に
対して `merge=union` を適用している。

`merge=union` は行レベルで「両ブランチの変更行を全て残す」戦略であり、追記のみを行う
ログファイルには適しているが、見出し・テーブル・箇条書きを含む **構造化ドキュメント** への
適用は長期的にドキュメント破損を引き起こすリスクがある。

### 1.2 問題点・課題

**`merge=union` の問題：**

- Markdown の ATX 見出し（`## Section`）が複数存在する場合、両ブランチで同一見出しを
  修正すると重複行が発生する
- Markdown テーブルの行が増減した際に `|` 区切りのズレが生じ、表が壊れる
- 箇条書きの順序を変更した場合、両バージョンの行が混在して意味不明なリストになる

**現在の `.gitattributes` の適用範囲（問題箇所）：**

```
.claude/skills/*/references/*.md  merge=union
.agents/skills/*/references/*.md  merge=union
```

`references/` 配下には以下のような **構造化ドキュメント** が含まれる：

- `task-workflow.md`（フェーズ定義・テーブル主体）
- `task-workflow-completed.md`（完了タスク記録・テーブル追記）
- `lessons-learned.md`（知識蓄積・箇条書き + テーブル混在）
- `phase-*-*.md`（フェーズガイド・多段階見出し構造）

これらのファイルは **append-only（末尾追記）ではなく、途中への挿入や既存行の修正** も
発生するため、`merge=union` を適用すると重複行や構造破損が起きる。

### 1.3 放置した場合の影響

- 複数の並列ブランチが `references/*.md` を修正した際に、マージ後のドキュメントが
  重複行・壊れたテーブル・混在する箇条書きを含む状態になる
- AIエージェントがスキル参照先ドキュメントを読んだ際に誤った情報を取得する
- コンフリクトなしにマージが成功してしまうため、破損に気づきにくい

---

## 2. 何を達成するか（What）

### 2.1 目的

`.gitattributes` 内の `merge=union` 適用ファイルを精査し、各ファイルパターンの
特性（append-only vs 構造化）に応じて最適なマージ戦略に修正する。

### 2.2 最終ゴール

- `references/*.md` のうち構造化ドキュメントに対して `merge=union` を適用しない方針を確定する
- ファイルパターン別のマージ戦略判断基準を文書化する
- 現在の `.gitattributes` を修正または注釈を追加して意図を明確化する
- `setup-merge-drivers.sh` で登録するカスタムドライバーが機能することを確認する

### 2.3 スコープ

#### 含むもの

- 現在の `.gitattributes` の全エントリのレビュー
- `references/*.md` 配下の代表的ファイルの構造分析（append-only か否かの判定）
- マージ戦略の修正提案（`merge=union` / `merge=ours` / `merge` 未指定 の使い分け）
- `.gitattributes` の修正と注釈の追加
- `setup-merge-drivers.sh` の動作確認

#### 含まないもの

- `indexes/` ファイルのマージ戦略（`merge=ours` で確定済み、本タスクではレビューのみ）
- `EVALS.json` のスキーマ変更（EVALS consumer 監査完了まで変更禁止）
- Git フックや CI の変更

### 2.4 成果物

- 修正済み `.gitattributes`
- `docs/30-workflows/unassigned-task/` 下に配置された本タスク仕様書（本ファイル）
- `outputs/phase-*/gitattributes-review.md`（修正内容の記録）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `.gitattributes` の現在の内容を把握していること
- `merge=union` / `merge=ours` / カスタムドライバーの動作を理解していること
- `.claude/scripts/setup-merge-drivers.sh` が存在し、`merge.ours.driver` の登録方法が
  ドキュメント化されていること

### 3.2 依存タスク

- TASK-CONFLICT-PREVENT-001（完了済み）：本タスクの前提となる `.gitattributes` 初期設定

### 3.3 必要な知識

**Git マージ戦略の基礎（中学生レベル説明）：**

Git のマージとは、2つのブランチの変更を1つにまとめる作業。通常は Git が自動的に
「どちらの変更を採用するか」を判断するが、同じ箇所が変更されていると「コンフリクト
（衝突）」が発生して手動で解決する必要がある。

`.gitattributes` でファイルごとにルールを決めておくと、コンフリクトなく自動でマージできる：

| 戦略                     | 動作                                              | 適切なファイル例                     |
| ------------------------ | ------------------------------------------------- | ------------------------------------ |
| `merge=union`            | 両ブランチの変更行をすべて残す                    | 追記専用ログ、行順不問なリスト       |
| `merge=ours`（カスタム） | 現ブランチの内容を優先し、相手の変更を無視        | 自動生成ファイル（マージ後に再生成） |
| 未指定（デフォルト）     | Git の3方向マージ（衝突時はコンフリクトマーカー） | 通常のソースコード                   |

**注意：** `merge=ours` は Git built-in ではなくカスタムドライバー名。
事前に `git config merge.ours.driver true` を実行しないと動作しない。

### 3.4 推奨アプローチ

1. `references/` 配下の各ファイルを分類する：
   - **append-only（末尾追記のみ）**：`LOGS.md`、完了記録（`task-workflow-completed.md` の末尾追記行のみ）
   - **構造化（途中挿入・修正あり）**：`task-workflow.md`、`lessons-learned.md`、ガイド系 `.md`
2. append-only ファイルには `merge=union` を維持する
3. 構造化ドキュメントには `merge=union` を**外す**（デフォルトマージ or `merge=ours`）
4. `merge=ours` を使う場合はカスタムドライバー登録の手順を `setup-merge-drivers.sh` に集約する

---

## 4. 実行手順

### Phase構成

| Phase | 内容                       | 目安 |
| ----- | -------------------------- | ---- |
| 1     | 現状調査・ファイル分類     | 1h   |
| 2     | `.gitattributes` 修正      | 1h   |
| 3     | 動作検証・ドキュメント記録 | 0.5h |

---

### Phase 1: 現状調査・ファイル分類

#### 目的

`references/` 配下の全ファイルを append-only か構造化かに分類し、適切なマージ戦略を決定する。

#### 手順

1. 現在の `.gitattributes` を読み、`merge=union` が適用されているファイルパターンを全て列挙する

   ```bash
   grep -n 'merge=' .gitattributes
   ```

2. `.claude/skills/*/references/` 配下の代表的なファイルを確認する

   ```bash
   ls .claude/skills/aiworkflow-requirements/references/
   ```

3. 各ファイルの先頭50行を読み、以下の基準で分類する：

   | 分類        | 判断基準                                                     |
   | ----------- | ------------------------------------------------------------ |
   | append-only | テーブルの末尾に行を追記するだけ、見出し構造が変わらない     |
   | 構造化      | 見出し・テーブル・箇条書きを含み、内容の更新・挿入が発生する |

4. 分類結果を以下の形式でまとめる：

   | ファイルパターン                        | 現在の戦略    | 推奨戦略      | 理由                             |
   | --------------------------------------- | ------------- | ------------- | -------------------------------- |
   | `references/task-workflow-completed.md` | `merge=union` | `merge=union` | 完了記録の追記専用               |
   | `references/task-workflow.md`           | `merge=union` | デフォルト    | フェーズ定義の構造化ドキュメント |
   | `references/lessons-learned.md`         | `merge=union` | デフォルト    | 知識蓄積・構造変更あり           |

#### 成果物

- ファイル分類表（メモまたは `outputs/phase-*/gitattributes-review.md`）

#### 完了条件

- `references/` 配下の全ファイルパターンに対して推奨マージ戦略が決定している

---

### Phase 2: `.gitattributes` 修正

#### 目的

分類結果に基づき `.gitattributes` を修正し、各エントリに注釈を追加して意図を明確化する。

#### 手順

1. Phase 1 の分類結果に従い、構造化ドキュメントから `merge=union` を外す

   修正前（問題箇所）：

   ```
   # リファレンス・記録ファイル（append-only）
   .claude/skills/*/references/*.md  merge=union
   .agents/skills/*/references/*.md  merge=union
   ```

   修正方針の選択肢：
   - **選択肢A（推奨）**：ファイルパターンをより細かく分割する

     ```
     # append-only な完了記録（末尾追記専用）
     .claude/skills/*/references/task-workflow-completed.md  merge=union
     .agents/skills/*/references/task-workflow-completed.md  merge=union
     # その他の references/*.md はデフォルトマージ（コンフリクト時は手動解決）
     # merge=union を外すことで構造化ドキュメントの重複行発生を防ぐ
     ```

   - **選択肢B**：コメントで注意書きを追加しつつ、ファイル個別指定に変更する

2. `LOGS.md` と `SKILL-changelog.md` は append-only のため `merge=union` を維持することを確認する

3. `merge=ours` が使われているエントリ（`indexes/*.json`, `indexes/*.md`）に対して
   `setup-merge-drivers.sh` の実行を促すコメントが既に記載されていることを確認する：

   ```
   # merge=ours はカスタムドライバー名（built-in ではない）。事前に以下を実行すること:
   #   bash .claude/scripts/setup-merge-drivers.sh
   ```

4. 修正後の `.gitattributes` を保存する

#### 成果物

- 修正済み `.gitattributes`

#### 完了条件

- `references/*.md` に対する `merge=union` の適用範囲が精緻化されている
- 各エントリに適用意図を示すコメントが記載されている

---

### Phase 3: 動作検証・ドキュメント記録

#### 目的

修正後の `.gitattributes` が正しく機能することを確認し、判断基準を記録する。

#### 手順

1. `setup-merge-drivers.sh` を実行して `merge.ours.driver` が登録されていることを確認する：

   ```bash
   bash .claude/scripts/setup-merge-drivers.sh
   git config merge.ours.driver
   # 期待値: true
   ```

2. テスト用の構造化ドキュメント変更でマージシミュレーションを行う（任意・可能であれば）：

   ```bash
   git stash
   # テストブランチを作成して変更を加え、マージ後のファイル状態を確認
   ```

3. `outputs/` 以下に修正内容の記録ファイルを作成する：

   ```
   outputs/phase-*/gitattributes-review.md
   ```

   記録内容：
   - 変更前後の `.gitattributes` 差分
   - ファイルパターン分類表と判断理由
   - `merge=union` を外したファイルパターン一覧

#### 成果物

- `outputs/phase-*/gitattributes-review.md`

#### 完了条件

- `merge.ours.driver` が `true` に設定されている
- 修正内容の記録ファイルが作成されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `references/*.md` の全ファイルパターンが append-only / 構造化のいずれかに分類されている
- [ ] 構造化ドキュメントから `merge=union` が外されている（またはより細かいパターンで回避されている）
- [ ] `LOGS.md`、`SKILL-changelog.md` への `merge=union` は維持されている
- [ ] `indexes/*.json`、`indexes/*.md` への `merge=ours` は維持されている
- [ ] `setup-merge-drivers.sh` 実行後に `git config merge.ours.driver` が `true` を返す

### 品質要件

- [ ] `.gitattributes` の各エントリに適用意図を示すコメントが記載されている
- [ ] `merge=ours` を使うエントリに `setup-merge-drivers.sh` 実行要件が明記されている
- [ ] ファイルパターン分類の判断基準が文書化されている

### ドキュメント要件

- [ ] `outputs/phase-*/gitattributes-review.md` に修正内容が記録されている
- [ ] `unassigned-task-detection.md` の `references/*.md merge=union 再評価` が対応済みになっている

---

## 6. 検証方法

### テストケース

| テストID | 内容                                                  | 確認方法                                        |
| -------- | ----------------------------------------------------- | ----------------------------------------------- |
| GIT-01   | `merge.ours.driver` が登録されている                  | `git config merge.ours.driver` → `true`         |
| GIT-02   | `LOGS.md` の `merge=union` が維持されている           | `grep 'LOGS.md' .gitattributes`                 |
| GIT-03   | `indexes/*.json` の `merge=ours` が維持されている     | `grep 'indexes' .gitattributes`                 |
| GIT-04   | 構造化ドキュメントへの `merge=union` が除去されている | `grep 'references/\*.md' .gitattributes` で確認 |
| GIT-05   | `.gitattributes` の各エントリにコメントが存在する     | 目視確認                                        |

### 検証手順

```bash
# 1. merge driver が登録済みか確認
bash .claude/scripts/setup-merge-drivers.sh
git config merge.ours.driver
# 期待値: true

# 2. .gitattributes の内容確認
cat .gitattributes

# 3. grep で merge 戦略の一覧を確認
grep -n 'merge=' .gitattributes
```

---

## 7. リスクと対策

| リスク                                                       | 影響度 | 発生確率 | 対策                                                                                   |
| ------------------------------------------------------------ | ------ | -------- | -------------------------------------------------------------------------------------- |
| `merge=union` を外したことで並列ブランチのコンフリクトが増加 | 中     | 中       | 構造化ドキュメントはそもそも同時編集が少ないため許容範囲。コンフリクト時は手動解決する |
| `merge=ours` ドライバー未登録でマージが誤作動する            | 高     | 低       | `setup-merge-drivers.sh` を `.claude/hooks/session-init.sh` から自動実行することを検討 |
| ファイルパターン分類が不正確で適切でない戦略が適用される     | 中     | 低       | Phase 1 の分類表をレビューアーが確認してから Phase 2 に進む                            |
| `references/` 配下に新規ファイルが追加された際に対応漏れ     | 低     | 中       | `.gitattributes` のコメントに「新規ファイル追加時はここを更新すること」と明記する      |

---

## 8. 参照情報

### 関連ファイル

| ファイル                                                                                      | 用途                                               |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `.gitattributes`                                                                              | 修正対象のマージ戦略設定ファイル                   |
| `.claude/scripts/setup-merge-drivers.sh`                                                      | `merge.ours.driver` 登録スクリプト                 |
| `docs/30-workflows/conflict-prevent-skills-001/`                                              | 本タスクの発見元となった TASK-CONFLICT-PREVENT-001 |
| `docs/30-workflows/conflict-prevent-skills-001/outputs/phase-12/unassigned-task-detection.md` | 本タスクが記録されている未タスク検出表             |

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`（`references/` 構造の理解）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`（過去の知見）

### 参考資料

- [Git Documentation: gitattributes - Merge Strategies](https://git-scm.com/docs/gitattributes#_merge)
- [Git `merge=union` driver](https://git-scm.com/docs/gitattributes#_built-in_merge_drivers)

---

## 9. 備考

### 苦戦箇所【記入必須】

TASK-CONFLICT-PREVENT-001 の実装中に以下の点で混乱・苦戦した：

1. **`merge=ours` は Git built-in ではない**
   - Git には built-in の `ours` マージ**戦略**（`git merge -s ours`）は存在するが、
     `.gitattributes` で指定する `merge=ours` は**カスタムドライバー名**である
   - `git config merge.ours.driver true` を事前に実行しなければ `.gitattributes` の
     `merge=ours` は無視され、デフォルトマージが適用される
   - この違いを認識せずに実装したため、後付けで `setup-merge-drivers.sh` を作成することになった

2. **`merge=union` の適用範囲の設計ミス**
   - 当初は「append-only ファイル = `merge=union`」という単純なルールで設計したが、
     `references/` 配下には append-only ではない構造化ドキュメントも多数含まれている
   - `merge=union` は行レベルで「両方残す」ため、ATX 見出しや Markdown テーブルが
     重複・破損するリスクを後から認識した
   - 本タスクはこの設計ミスを修正するために起票された

3. **ファイルパターンの粒度が粗すぎた**
   - `references/*.md` という glob パターンは append-only なファイルと構造化ドキュメントを
     一括で捕捉してしまう
   - ファイルの種類（完了記録 vs. ガイドドキュメント）によってマージ戦略を分けるべきだったが、
     初期設計では一律 `merge=union` を適用してしまった

### 補足事項

- `LOGS.md` は1行1エントリの追記専用ログであるため、`merge=union` は依然として適切
- `SKILL-changelog.md` も変更履歴の追記専用のため、`merge=union` を維持する
- `indexes/*.json`、`indexes/*.md` はスクリプトで自動生成されるため `merge=ours`（現ブランチ優先）
  が適切で、マージ後に `generate-index.js` で再生成する運用が確立されている
