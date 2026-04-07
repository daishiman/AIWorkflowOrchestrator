# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 1                                                   |
| Phase名    | 要件定義                                            |
| 機能名     | refs-500line-split-maintenance                      |
| 対象機能   | TASK-REFS-500LINE-SPLIT-001 References ファイル分離 |
| 前提Phase  | -                                                   |
| 次Phase    | Phase 2: 設計                                       |
| ステータス | pending                                             |
| 作成日     | 2026-04-07                                          |

## 目的

500 行以上の References ファイルの全容を把握し、分離基準・命名規則・優先順位を確定する。

## タスク分類（重要）

**タスク分類: docs-only task**（コード変更なし）

- UI task 判定: NO
- コード変更: なし（Markdown ファイルの分離・更新のみ）
- Phase 11: NON_VISUAL（スクリーンショット不要）

## 実行タスク

### Task 1: 対象ファイルの全数把握

500 行以上のファイルを全て洗い出す。

```bash
# aiworkflow-requirements の 500 行超ファイル
find .claude/skills/aiworkflow-requirements/references/ -name "*.md" -exec wc -l {} \; | sort -rn | awk '$1 >= 500 {print $0}'

# task-specification-creator の 500 行超ファイル
find .claude/skills/task-specification-creator/references/ -name "*.md" -exec wc -l {} \; | sort -rn | awk '$1 >= 500 {print $0}'

# mirror 側との差異確認
diff -qr .claude/skills/aiworkflow-requirements/references/ .agents/skills/aiworkflow-requirements/references/ 2>/dev/null | head -20
diff -qr .claude/skills/task-specification-creator/references/ .agents/skills/task-specification-creator/references/ 2>/dev/null | head -20
```

### Task 2: 各ファイルの内部構造分析

500 行超ファイルについて、H2/H3 セクション構造を分析する。

```bash
# H2/H3 見出し一覧抽出（分割ポイントの特定。行番号付き）
find .claude/skills/aiworkflow-requirements/references/ -name "*.md" -exec wc -l {} \; \
  | sort -rn \
  | awk '$1 >= 500 {print $2}' \
  | while read -r f; do
      echo "=== $f ==="
      grep -nE '^(## |### )' "$f" | head -40
    done

find .claude/skills/task-specification-creator/references/ -name "*.md" -exec wc -l {} \; \
  | sort -rn \
  | awk '$1 >= 500 {print $2}' \
  | while read -r f; do
      echo "=== $f ==="
      grep -nE '^(## |### )' "$f" | head -40
    done
```

### Task 3: 既存の子ファイルパターンの調査

すでに子ファイルが存在する場合（`patterns-*.md` 等）を確認し、重複を避ける。

```bash
# task-specification-creator の patterns ファミリー確認
ls .claude/skills/task-specification-creator/references/patterns*.md

# aiworkflow-requirements の lessons-learned ファミリー確認
ls .claude/skills/aiworkflow-requirements/references/lessons-learned*.md
```

### Task 4: 分離基準の確定

以下の基準で分離方針を決定する:

| 基準           | 内容                                                            |
| -------------- | --------------------------------------------------------------- |
| サイズ制限     | 分離後の各ファイルは 499 行以内                                 |
| セクション原則 | H2 見出し単位で分離。1 H2 セクションが 499 行超の場合は H3 単位 |
| 命名規則       | 既存ファイル名から `-part1`/`-part2` または意味的なサフィックス |
| 親ファイル     | 目次・概要レベルに縮小（概要 + 各子ファイルへの参照リンク）     |
| SKILL.md 更新  | 新規ファイルを同時にリソース導線へ追加                          |

## 参照資料

| 資料名                        | パス                                                                                        | 説明                      |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| 設計原則                      | `.claude/skills/task-specification-creator/SKILL.md`                                        | 1 File = 1 Responsibility |
| 既存分離ガイドライン          | `docs/30-workflows/unassigned-task/task-imp-spec-500line-preemptive-split-guideline-001.md` | 先行ガイドライン          |
| aiworkflow-requirements SKILL | `.claude/skills/aiworkflow-requirements/SKILL.md`                                           | リソース導線の現行定義    |

## 成果物

| 成果物               | パス                                | 説明                                 |
| -------------------- | ----------------------------------- | ------------------------------------ |
| ファイルインベントリ | `outputs/phase-1/file-inventory.md` | 全 500 行超ファイルのセクション構造  |
| 分離基準書           | `outputs/phase-1/split-criteria.md` | 分離方針・命名規則・優先順位の確定版 |

## 完了条件

- [ ] 全対象ファイルの H2/H3 セクション構造が把握されている
- [ ] 既存の子ファイルパターンが確認されている
- [ ] 分離基準（サイズ・命名・親ファイル方針）が確定されている
- [ ] 優先順位（最高 → 高 → 中 → 低）が決定されている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
