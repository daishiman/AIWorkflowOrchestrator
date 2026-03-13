# Phase 3 Output: aiworkflow-requirements Extraction Audit

## entrypoint

| 経路                         | 使い方                                             |
| ---------------------------- | -------------------------------------------------- |
| `indexes/resource-map.md`    | task type から skill 系仕様の起点を選定            |
| `indexes/quick-reference.md` | skill / line budget / mirror sync の検索語彙を補強 |
| `scripts/search-spec.js`     | `mirror sync`、`Claude Code skills` で局所検索     |

## 抽出した仕様

| 仕様                              | 用途                                                |
| --------------------------------- | --------------------------------------------------- |
| `claude-code-skills-overview.md`  | Skill の責務境界、Task 分離、Progressive Disclosure |
| `claude-code-skills-structure.md` | SKILL、references、agents の構造                    |
| `claude-code-skills-resources.md` | 直リンク、flat refs、navigation                     |
| `claude-code-skills-process.md`   | line budget、refs link、validate 手順               |
| `spec-splitting-guidelines.md`    | 500 行超 file の split threshold                    |
| `task-workflow.md`                | `spec_created` と台帳同期                           |
| `task-workflow-phases.md`         | phase gate と段階遷移                               |
| `task-workflow-rules.md`          | 単一責務、品質ゲート、更新ルール                    |
| `quality-requirements.md`         | docs quality と検証観点                             |
| `lessons-learned.md`              | canonical root、mirror sync、dual root drift        |

## 監査結果

| 項目                             | 初回             | 改善後                      |
| -------------------------------- | ---------------- | --------------------------- |
| skill overview の参照            | なし             | index / phase 参照へ追加    |
| task-workflow phase/rules の参照 | なし             | index / phase 参照へ追加    |
| mirror sync 根拠                 | cross-skill のみ | `lessons-learned.md` と併記 |
| extraction evidence              | index のみ       | phase-3 audit file を追加   |

## 残課題

- 実装 turn では `task-workflow.md` と `lessons-learned.md` の actual sync が必要
- 実 split 後は `claude-code-skills-process.md` の validation command を再実行して再監査する必要がある
