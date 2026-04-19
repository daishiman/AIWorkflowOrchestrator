# Phase 5: 実装サマリー

## 1. 変更概要

### 何を

- `.gitattributes` の `references/*.md` 一括 `merge=union` 指定を削除
- append-only ファイルを個別 glob で明示列挙（`merge=union` 維持）
- カテゴリ別グループ見出しコメント（C-1 / C-2 / C-3）を付与
- `.gitattributes` 冒頭に「関連リソース」セクションを追加
- `.claude/scripts/setup-merge-drivers.sh` 冒頭コメントを充実（ロジック不変）

### なぜ

- 構造化ドキュメント（`task-workflow.md`, `lessons-learned.md`, `api-*.md`, `arch-*.md`）への
  `merge=union` 誤適用を物理的に排除するため（AC-1）
- 長期運用での Markdown 破損リスク（見出し重複・テーブル破綻・順序不明な箇条書き）を回避
- 新規ファイル追加時に判断ガイドを参照できるようにする（AC-4）

### どう

- Phase 2 推奨案 A（glob 細分割）を採用
- Git の「最後にマッチしたパターン勝ち」ルールを利用し、旧広 glob を削除するだけで
  構造化ファイルをデフォルト挙動に戻した（明示的 reset は不要）

## 2. `git check-attr merge` 出力比較

| ファイル                                      | Before            | After                    | 期待    |
| --------------------------------------------- | ----------------- | ------------------------ | ------- |
| `references/LOGS.md`                          | `merge: union`    | `merge: union`           | 維持 ✅ |
| `references/SKILL-changelog.md`（スキル直下） | `merge: union`    | `merge: union`           | 維持 ✅ |
| `references/task-workflow-completed.md`       | `merge: union`    | `merge: union`           | 維持 ✅ |
| `references/lessons-learned-current.md`       | `merge: union`    | `merge: union`           | 維持 ✅ |
| `references/task-workflow.md`                 | `merge: union` ❌ | **`merge: unspecified`** | 除去 ✅ |
| `references/lessons-learned.md`（root）       | `merge: union` ❌ | **`merge: unspecified`** | 除去 ✅ |
| `references/api-core.md`                      | `merge: union` ❌ | **`merge: unspecified`** | 除去 ✅ |
| `references/arch-ipc-persistence.md`          | `merge: union` ❌ | **`merge: unspecified`** | 除去 ✅ |
| `skills/*/LOGS.md`（skill 直下）              | `merge: union`    | `merge: union`           | 維持 ✅ |
| `skills/*/SKILL-changelog.md`（skill 直下）   | `merge: union`    | `merge: union`           | 維持 ✅ |
| `skills/*/indexes/topic-map.json`             | `merge: ours`     | `merge: ours`            | 維持 ✅ |

❌ → ✅ で構造化ドキュメント 4 件の誤適用が排除されている。

## 3. Phase 4 テストケースとの対応表

| TC-ID | 期待挙動                                      | 本実装での扱い                                                         | 備考                           |
| ----- | --------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| TC-01 | `LOGS.md` 並列追記 → union 両方残る           | `.claude/skills/*/LOGS.md merge=union`（C-1）で継続 union              | Phase 11 MT-03 で実測          |
| TC-02 | `task-workflow.md` 並列追記 → conflict marker | glob 削除によりデフォルト 3-way へ切り替わり、conflict marker 出る想定 | Phase 11 MT-02 で Green 化確認 |
| TC-03 | `indexes/*.json` ドライバー登録時 → ours      | `.claude/skills/*/indexes/*.json merge=ours`（C-3）で継続              | Phase 11 MT-04 で実測          |
| TC-04 | `indexes/*.json` ドライバー未登録 → warning   | 変更なし（`setup-merge-drivers.sh` 未実行時の挙動は Git 依存）         | Phase 11 で挙動参照のみ        |
| TC-05 | `.gitattributes` 各エントリにコメント         | カテゴリ見出し C-1 / C-2 / C-3 + 「新規ファイル追加判断」コメント付与  | grep で確認（下記）            |

### TC-05 grep 実測

```bash
$ grep -cE '^# \[(C-[0-9]+|structured)' .gitattributes
4   # C-1 / C-2 / C-3 / structured
$ grep -cE '^# 新規ファイル追加判断' .gitattributes
4
```

## 4. 既存運用への影響

| 運用                                           | 影響                                                                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `LOGS.md` への並列追記（`-completed-*.md` 等） | **影響なし**。個別 glob に明示列挙されているため継続 union                                                                     |
| 構造化ドキュメントの並列編集                   | **改善**。誤 union が発生しない。同一区間衝突時に conflict で人手解決                                                          |
| `indexes/*.json` のマージ                      | **改善**。`setup-merge-drivers.sh` 実行で `merge=ours` が正式に機能                                                            |
| 新規 `references/<new>.md` 追加                | **影響あり**。命名が個別 glob（lessons-learned-\* 等）に合致しないと デフォルト 3-way となるため、判断ガイドを Phase 12 で周知 |

## 5. リスク・残課題

| リスク/課題                                 | 緩和策                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| `setup-merge-drivers.sh` 未登録環境の検出   | SessionStart hook が既に警告出力。Phase 12 で `implementation-guide.md` に記述 |
| 新規 append-only ファイル命名が規約外の場合 | Phase 12 Task 4 未タスク検出候補 B（front-matter で分類宣言）                  |
| `.gitattributes` の lint 不在               | Phase 12 Task 4 未タスク検出候補 C（`.gitattributes` lint スクリプト）         |

## 6. ファイル新規作成・修正・削除一覧（[Feedback RT-03]）

| 種別     | パス                                                      | 内容                                                  |
| -------- | --------------------------------------------------------- | ----------------------------------------------------- |
| 修正     | `.gitattributes`                                          | `merge=union` 適用範囲縮小 + 各エントリコメント付与   |
| 修正     | `.claude/scripts/setup-merge-drivers.sh`                  | 冒頭コメント拡充（ロジック変更なし）                  |
| 新規作成 | `outputs/phase-5/implementation-summary.md`               | 本ファイル                                            |
| 新規作成 | `outputs/phase-5/diff.patch`                              | `git diff` 出力（114 行）                             |
| 新規作成 | `outputs/phase-5/snapshots/gitattributes.before`          | 修正前 `.gitattributes`                               |
| 新規作成 | `outputs/phase-5/snapshots/setup-merge-drivers.sh.before` | 修正前スクリプト                                      |
| 新規作成 | `outputs/phase-5/snapshots/check-attr.before.txt`         | 修正前 `git check-attr` 実測                          |
| 新規作成 | `outputs/phase-5/snapshots/check-attr.after.txt`          | 修正後 `git check-attr` 実測                          |
| 新規作成 | `outputs/phase-5/setup-merge-drivers-verify.log`          | `setup-merge-drivers.sh` 実行ログ + `git config` 確認 |
| 削除     | （なし）                                                  | -                                                     |

- **コードファイルの新規作成: 0 件**
- **ロジック変更は `.gitattributes` のみ**（`setup-merge-drivers.sh` はコメントのみ）

## 7. 完了条件チェック

- [x] 修正前スナップショットを `outputs/phase-5/snapshots/` に保存
- [x] `.gitattributes` を Phase 2 設計通りに修正し、各エントリへコメントを付与
- [x] `setup-merge-drivers.sh` 冒頭にコメントのみ追記（ロジック変更なし）
- [x] `outputs/phase-5/diff.patch` と `outputs/phase-5/implementation-summary.md` を作成
- [x] ファイル新規作成・修正・削除一覧（[Feedback RT-03]）を summary に記載
- [x] `setup-merge-drivers.sh` 実行で `git config --get merge.ours.driver` が `true` を返すことを検証（AC-3）
