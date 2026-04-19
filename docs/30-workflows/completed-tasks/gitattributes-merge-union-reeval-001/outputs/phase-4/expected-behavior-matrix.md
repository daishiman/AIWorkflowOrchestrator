# Phase 4: 期待挙動マトリクス

`.gitattributes` のパターン × シナリオ × 期待結果 を一覧化。
セル末尾の `[C-N]` は `.gitattributes` のコメントブロック ID（Phase 5 で付与）。

## 1. マトリクス

| ファイルパターン                                                        | 並列追記（別行）       | 同一行編集             | 新規ファイル追加            | ドライバー未登録         |
| ----------------------------------------------------------------------- | ---------------------- | ---------------------- | --------------------------- | ------------------------ |
| `LOGS.md`（skill 直下）                                                 | union 結合 [C-1]       | conflict（稀）         | 命名合致で union 合流 [C-1] | 関係なし                 |
| `SKILL-changelog.md`（skill 直下）                                      | union 結合 [C-1]       | conflict（稀）         | 命名合致で union 合流 [C-1] | 関係なし                 |
| `references/LOGS.md`                                                    | union 結合 [C-2]       | conflict（稀）         | 命名合致で union 合流 [C-2] | 関係なし                 |
| `references/SKILL-changelog.md`                                         | union 結合 [C-2]       | conflict（稀）         | 命名合致で union 合流 [C-2] | 関係なし                 |
| `references/task-workflow-completed*.md`                                | union 結合 [C-2]       | conflict（稀）         | 命名合致で union 合流 [C-2] | 関係なし                 |
| `references/lessons-learned-*.md`                                       | union 結合 [C-2]       | conflict（稀）         | 命名合致で union 合流 [C-2] | 関係なし                 |
| `references/task-workflow.md`                                           | default 3-way conflict | default 3-way conflict | 未指定（default 継承）      | 関係なし                 |
| `references/task-workflow-rules.md` / `-phases.md` / `-active.md`       | default 3-way conflict | default 3-way conflict | 未指定（default 継承）      | 関係なし                 |
| `references/task-workflow-backlog*.md`                                  | default 3-way conflict | default 3-way conflict | 未指定（default 継承）      | 関係なし                 |
| `references/lessons-learned.md`（root）                                 | default 3-way conflict | default 3-way conflict | 未指定（default 継承）      | 関係なし                 |
| `references/api-*.md` / `arch-*.md` / `phase-template-*.md`             | default 3-way conflict | default 3-way conflict | 未指定（default 継承）      | 関係なし                 |
| `references/quick-reference*.md` / `resource-map*.md` / `topic-map*.md` | default 3-way conflict | default 3-way conflict | 未指定（default 継承）      | 関係なし                 |
| `indexes/*.json`                                                        | ours 採用 [C-3]        | ours 採用 [C-3]        | 命名合致で ours 合流 [C-3]  | warning + fallback 3-way |
| `indexes/*.md`                                                          | ours 採用 [C-3]        | ours 採用 [C-3]        | 命名合致で ours 合流 [C-3]  | warning + fallback 3-way |
| `EVALS.json`                                                            | ours 採用 [C-3]        | ours 採用 [C-3]        | 命名合致で ours 合流 [C-3]  | warning + fallback 3-way |

凡例:

- `union 結合`: 両ブランチの差分行が自動的に連結される。
- `default 3-way conflict`: 同じ区間を編集した場合、`<<<<<<<` マーカーが出現し人手解決が必要。
- `ours 採用`: カスタムドライバー（`git config merge.ours.driver true`）により自ブランチ側を採用。
- `warning + fallback 3-way`: ドライバー未登録で `failed to resolve 'ours'` 警告後、default 3-way。

## 2. コメント ID と `.gitattributes` の対応（Phase 5 で付与）

| ID  | カテゴリ                 | コメント要旨                                            |
| --- | ------------------------ | ------------------------------------------------------- |
| C-1 | append-only (skill root) | LOGS.md / SKILL-changelog.md は時系列追記・union 結合   |
| C-2 | append-only (references) | task-workflow-completed* / lessons-learned-* は追記統合 |
| C-3 | auto-generated           | indexes / EVALS は再生成可能・ours で main 側を保持     |

## 3. 未分類セル確認

| チェック                                          | 結果    |
| ------------------------------------------------- | ------- |
| 全セルに期待結果が記入されている                  | ✅ 完了 |
| 全セルに根拠コメント ID（または「関係なし」）付与 | ✅ 完了 |
| 「未分類」「TBD」が残っていない                   | ✅ 完了 |

## 4. Phase 5 / Phase 6 / Phase 11 への引き継ぎ

- Phase 5: 上表の `[C-1]` / `[C-2]` / `[C-3]` コメントを `.gitattributes` 各グループ見出しに追記
- Phase 6: FAIL-01（ドライバー未登録）→ `indexes/*.json` 行の挙動、FAIL-02（glob 漏れ）→ 構造化ファイル行の挙動、REG-01〜03 の追加
- Phase 11: MT-01〜MT-05 として上表の代表セル（LOGS.md, task-workflow.md, indexes/\*.json）を手動シミュレーションで検証

## 5. カバレッジ（パターン次元）

- 上表 15 行 × 4 列 = 60 セル 中、関係なしを除く **48 セル** に具体的期待結果を記入 → **100% カバー**
- Phase 7 カバレッジレポートでは、上表と `.gitattributes` の実エントリを 1:1 照合する。
