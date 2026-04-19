# Phase 1: 受け入れ基準 (AC-1〜AC-5)

| ID   | 受け入れ基準                                                                                                      | 検証方法                                                                                                                                 | 検証 Phase  |
| ---- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| AC-1 | 構造化ドキュメントから `merge=union` 指定が除去されていること                                                     | `git check-attr merge <file>` で `merge` attribute が返らないこと                                                                        | Phase 5, 11 |
| AC-2 | append-only ファイルは `merge=union` を維持していること                                                           | 代表ファイル `LOGS.md` / `SKILL-changelog.md` / `task-workflow-completed.md` / `lessons-learned-current.md` で `merge: union` が返ること | Phase 5, 11 |
| AC-3 | `setup-merge-drivers.sh` 実行後に `git config --get merge.ours.driver` が `true` を返すこと                       | シェル実測                                                                                                                               | Phase 5, 11 |
| AC-4 | `.gitattributes` の各エントリに用途コメントが付与されていること                                                   | エントリ行数 ≤ コメントグループ数（grep で確認）                                                                                         | Phase 5, 8  |
| AC-5 | append-only / 構造化 の判断基準が `references/` または Phase 12 の `implementation-guide.md` に明記されていること | ファイル存在 + Part 2 内の該当セクション確認                                                                                             | Phase 12    |

## 詳細基準

### AC-1: 構造化ドキュメントから `merge=union` が除去されている

**対象ファイル（代表）**:

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`
- `.claude/skills/aiworkflow-requirements/references/api-core.md`
- `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`
- `.claude/skills/task-specification-creator/references/phase-template-core.md`
- mirror: `.agents/skills/*/references/<same>`

**実測期待**: `git check-attr merge <file>` が `<file>: merge: unspecified` を返すこと。

### AC-2: append-only ファイルは `merge=union` を維持

**対象ファイル（代表）**:

- `.claude/skills/*/LOGS.md`
- `.claude/skills/*/SKILL-changelog.md`
- `.claude/skills/*/references/task-workflow-completed*.md`
- `.claude/skills/*/references/lessons-learned-*.md`（root `lessons-learned.md` は除外）
- mirror: `.agents/skills/*/<same>`

**実測期待**: `git check-attr merge <file>` が `<file>: merge: union` を返すこと。

### AC-3: カスタム `merge=ours` ドライバーが機能する

**手順**:

1. `bash .claude/scripts/setup-merge-drivers.sh` を実行。
2. `git config --get merge.ours.driver` が `true` を返すこと。
3. Phase 11 の MT-04 で `indexes/*.json` の並列編集マージが ours 側優先となること。

### AC-4: `.gitattributes` 各エントリにコメント

**形式**:

```
# [<カテゴリ>] <意図>
# 新規ファイル追加判断: <append-only か構造化かの判断基準>
<pattern> <attr>
```

**基準**: 各マージ戦略エントリの直前に少なくとも 1 行の意図コメントがある。

### AC-5: 判断基準ドキュメント化

**記載場所**: `outputs/phase-12/implementation-guide.md` の Part 2「新規 `references/` ファイル追加時の再評価フロー」セクション。

**内容**:

- append-only / 構造化 判定フローチャート
- 該当する場合の `.gitattributes` 更新手順
- 再評価の起票先（`unassigned-task/` 候補 B 参照）

## 完了条件チェックリスト（Phase 1）

- [x] `taskType=NON_VISUAL` を outputs/phase-1/requirements-definition.md に明記
- [x] AC-1〜AC-5 を明示（本ファイル）
- [x] ファイル分類インベントリで全 `references/*.md` カバレッジ確認
- [x] `merge.ours.driver` 登録状況（未登録）を記録
- [x] スコープ / 非スコープを固定
