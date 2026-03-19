# UT-IMP-QUICK-REFERENCE-SEARCH-PATTERNS-SPLIT-001: quick-reference-search-patterns.md 500行超過分割

## メタ情報

```yaml
issue_number: 1344
task_id: UT-IMP-QUICK-REFERENCE-SEARCH-PATTERNS-SPLIT-001
task_name: quick-reference-search-patterns.md 500行超過分割
category: 改善（仕様書品質）
target_feature: indexes/quick-reference-search-patterns.md の classification-first 分割
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 Phase 12 spec-verifier 検出
created_date: 2026-03-17
dependencies: []
```

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| タスクID     | UT-IMP-QUICK-REFERENCE-SEARCH-PATTERNS-SPLIT-001                        |
| タスク名     | quick-reference-search-patterns.md 500行超過分割                        |
| 分類         | 改善（仕様書品質）                                                      |
| 対象機能     | indexes/ 配下の検索パターン集の行数制限準拠                             |
| 優先度       | 中                                                                      |
| 見積もり規模 | 小規模（1-2時間）                                                       |
| ステータス   | 未実施                                                                  |
| 発見元       | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 Phase 12 spec-verifier 検出 |
| 発見日       | 2026-03-17                                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`.claude/skills/aiworkflow-requirements/indexes/quick-reference-search-patterns.md` はタスク種別ごとの検索パターン（grep/search コマンド集）を集約したクイックリファレンスファイルである。タスク完了のたびに新しい検索カテゴリが追加されるため、行数が単調増加する構造を持つ。2026-03-17 時点で 513 行となり、`spec-splitting-guidelines.md` で定められた 500 行制限を超過した。

### 1.2 問題点・課題

1. 513 行で 500 行制限を超過しており、`spec-verifier` が警告を出す状態にある
2. 今後もタスク追加のたびに行数が増加するため、放置すると 700 行超（要分割ライン）に到達する
3. 現在のファイルは「タスク種別別検索パターン」と「コードパターン早見」の2つの異なる関心事が1ファイルに混在している

### 1.3 放置した場合の影響

- `spec-verifier` が毎回警告を出し、他の真に対応が必要な警告が埋もれる
- タスク追加のたびに行数制限違反が拡大し、後で分割するコストが増大する
- 検索パターンの分類が不明確になり、新規参入者が目的のパターンに到達しにくくなる

---

## 2. 何を達成するか（What）

### 2.1 目的

`quick-reference-search-patterns.md` を classification-first で検索パターンカテゴリごとに分割し、全ファイルが 500 行以下に収まる状態にする。

### 2.2 最終ゴール

1. 分割後の全ファイルが 500 行以下
2. `generate-index.js` 再実行後に `topic-map.md` が正常に再生成される
3. 既存の検索パターン参照リンクが全て有効である
4. `spec-verifier` が行数制限警告を出さない

### 2.3 スコープ

#### 含むもの

- `quick-reference-search-patterns.md` の分割（インデックス + カテゴリ別ファイル）
- `topic-map.md` の再生成
- `resource-map.md` への分割後ファイル導線追記（該当する場合）
- 分割後のリンク整合性検証

#### 含まないもの

- 検索パターンの内容変更・追加
- `quick-reference.md`（早見表側）の変更
- `generate-index.js` スクリプト自体の改修
- 他の indexes/ ファイルの分割

### 2.4 成果物

- 分割後のインデックスファイル: `indexes/quick-reference-search-patterns.md`（導線のみ）
- 分割後のカテゴリ別ファイル（2-3 ファイル）
- 更新済み `topic-map.md`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `spec-splitting-guidelines.md` の分割基準・命名ポリシーを理解している
- `generate-index.js` と `check-links.js` スクリプトが実行可能
- `lessons-learned-current.md` の 651行 -> 4分割実績パターンを参照可能

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識

- `spec-splitting-guidelines.md` の classification-first ルールと semantic filename ポリシー
- `lessons-learned-current.md` の分割実績（651行 -> 4ファイル分割 + インデックス）

### 3.4 推奨アプローチ

現在のファイル構造を分析すると、以下の2つの関心事に分割できる:

| 関心事                   | 行範囲（目安） | 内容                                                                                          |
| ------------------------ | -------------- | --------------------------------------------------------------------------------------------- |
| タスク種別別検索パターン | L1-317         | Skill Lifecycle / Permission / Preload / Theme 等のタスク別 search-spec.js コマンドと読む順番 |
| コードパターン早見       | L320-513       | Electron IPC / Result Pattern / Zustand / Store selector 等のコードスニペット集               |

推奨分割構成:

| ファイル名                                | 役割                                                         | 想定行数  |
| ----------------------------------------- | ------------------------------------------------------------ | --------- |
| `quick-reference-search-patterns.md`      | インデックス（導線 + 分割ルール）                            | 50-80行   |
| `quick-reference-search-patterns-task.md` | タスク種別別検索パターン（search-spec コマンド + 読む順番）  | 250-320行 |
| `quick-reference-search-patterns-code.md` | コードパターン早見（IPC / Zustand / Store 等のスニペット集） | 150-200行 |

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                 | 発見経緯                                        | 解決策                                                                                                         | 教訓                                                                   |
| ------------------------------------ | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 500行制限の監視漏れ                  | spec-verifier が Phase 12 で初めて検出          | `generate-index.js` 実行後に `wc -l` で全 indexes/ ファイルの行数を確認する運用を追加                          | indexes/ は generated artifact ではなく manual docs なので行数監査対象 |
| lessons-learned 分割パターンの再利用 | 651行 -> 4分割 + インデックス（76行）の実績あり | インデックス + カテゴリ別ファイルの同一パターンを適用                                                          | family-wave で入口・本体を同一ターンで閉じる                           |
| P40 テスト実行ディレクトリ依存       | `vitest.config.ts` のパスエイリアス解決失敗     | 本タスクはドキュメントのみの変更のためテスト影響なし。ただし `check-links.js` は正しいディレクトリから実行する | スクリプト実行時はカレントディレクトリを確認する                       |

---

## 4. 実行手順

### Phase構成

- Phase A: 分割設計
- Phase B: 分割実行
- Phase C: 検証と台帳同期

### Phase A: 分割設計

#### 目的

分割境界とファイル命名を確定する。

#### 手順

1. `quick-reference-search-patterns.md` の現在のセクション構造を確認する
2. `spec-splitting-guidelines.md` の classification-first ルールに従い、関心事ごとの分割境界を決定する
3. semantic filename を確定する（`-task` / `-code` または内容に応じた名称）
4. インデックスファイルの構成を設計する

#### 成果物

- 分割設計メモ（セクション -> ファイルのマッピング）

#### 完了条件

- 全分割ファイルが 500 行以下に収まる設計である
- `-a` / `-b` / `-part1` のような順序 suffix を使っていない

### Phase B: 分割実行

#### 目的

設計に基づいてファイルを分割する。

#### 手順

1. インデックスファイル（`quick-reference-search-patterns.md`）を導線のみに書き換える
2. カテゴリ別ファイルを作成する
3. 各ファイルの相互参照リンクを記載する
4. `node scripts/generate-index.js` で `topic-map.md` を再生成する

#### 成果物

- 分割後の全ファイル
- 再生成済み `topic-map.md`

#### 完了条件

- 全ファイルが 500 行以下
- `topic-map.md` が正常に再生成されている

### Phase C: 検証と台帳同期

#### 目的

分割後の整合性を確認し、台帳を更新する。

#### 手順

1. `node scripts/check-links.js` でリンク切れがないことを確認する
2. `wc -l` で全分割ファイルの行数を確認する
3. `task-workflow-backlog.md` の本タスク行を完了に更新する
4. `lessons-learned-current.md` に分割実績を記録する（該当する場合）

#### 成果物

- 検証ログ
- 更新済み台帳

#### 完了条件

- リンク切れ 0 件
- 全ファイル 500 行以下
- 台帳が更新済み

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `quick-reference-search-patterns.md` がインデックス化され 500 行以下
- [ ] 分割後のカテゴリ別ファイルが全て 500 行以下
- [ ] 既存の全検索パターンが分割後のいずれかのファイルに含まれている（情報欠落なし）
- [ ] インデックスから各カテゴリファイルへの導線が記載されている

### 品質要件

- [ ] `node scripts/check-links.js` でリンク切れ 0 件
- [ ] `node scripts/generate-index.js` が正常完了し `topic-map.md` が再生成されている
- [ ] `wc -l` で全ファイルが 500 行以下であることを確認済み
- [ ] semantic filename ポリシーに準拠している（`-a` / `-b` / `-part1` 不使用）

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow-backlog.md` に登録されている
- [ ] 分割実績が `lessons-learned-current.md` に記録されている（該当する場合）

---

## 6. 検証方法

### テストケース

- Case 1: 全分割ファイルの行数が 500 行以下である
- Case 2: リンク切れが 0 件である
- Case 3: `topic-map.md` が正常に再生成される
- Case 4: 分割前後で検索パターンの総数が一致する

### 検証コマンド

```bash
# 行数確認
wc -l .claude/skills/aiworkflow-requirements/indexes/quick-reference-search-patterns*.md

# リンク切れチェック
node scripts/check-links.js

# topic-map 再生成
node scripts/generate-index.js

# 検索パターン数の前後比較（分割前にカウントしておく）
grep -c "^## \|^### " .claude/skills/aiworkflow-requirements/indexes/quick-reference-search-patterns*.md

# spec-verifier で行数制限違反確認
wc -l .claude/skills/aiworkflow-requirements/indexes/*.md | sort -rn | head -20
```

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                                                                 |
| -------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------ |
| 分割後のリンク切れ                     | 中     | 中       | `check-links.js` で自動検証。他仕様書からの参照がある場合はリダイレクト導線を残す    |
| topic-map 再生成で差分が大きくなる     | 低     | 中       | `generate-index.js` の出力を `git diff` で確認し、意図しない変更がないことを検証     |
| 分割境界の判断ミスで再分割が必要になる | 低     | 低       | classification-first ルールに従い、関心事ベースで分割する。量ベースの分割は行わない  |
| 他タスクと同時編集でコンフリクト       | 低     | 低       | indexes/ は他タスクとの同時編集頻度が低い。worktree 環境で作業し、マージ時に確認する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` - 分割基準・命名ポリシー・family-wave ルール
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` - インデックス分割の実績パターン（651行 -> 4分割）
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference-search-patterns.md` - 分割対象ファイル（513行）

### 参考資料

- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md` - 早見表（分割対象外だが関連する索引ファイル）
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` - 再生成対象
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md` - 導線更新の可能性あり

---

## 9. 備考

### spec-verifier の検出内容

```
quick-reference-search-patterns.md: 513 lines (exceeds 500-line limit)
```

### 補足事項

- 本タスクはドキュメントのみの変更であり、プロダクションコードの変更は含まない
- `lessons-learned-current.md` の分割実績（2026-03-17、651行 -> 4ファイル + 76行インデックス）を参考パターンとして再利用できる
- 分割後もタスク追加のたびにカテゴリ別ファイルの行数は増加するため、将来的に再分割が必要になる可能性がある。その際は関心事をさらに細分化する（例: Skill Lifecycle 系 / Infrastructure 系 / UI 系）
