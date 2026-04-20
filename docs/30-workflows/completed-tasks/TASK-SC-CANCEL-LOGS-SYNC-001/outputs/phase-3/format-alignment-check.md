---
phase: 3
task_id: TASK-SC-CANCEL-LOGS-SYNC-001
artifact: format-alignment-check
created_date: 2026-04-20
status: completed
---

# Phase 3 成果物: 形式整合性チェック

## 対象ファイルの既存形式（fixture 抽出）

### task-specification-creator/LOGS.md

末尾エントリ（2026-04-19 `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 Phase 12 close-out sync`）の形式を基準 fixture とする。

```text
## YYYY-MM-DD - TASK-ID <title>

### 変更内容

- bullet1
- bullet2

### 背景

短文段落

| 項目     | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| 種別     | ...                                                              |
| 変更対象 | ...                                                              |
| 結果     | ...                                                              |
| 検証     | ...                                                              |
```

| 項目 | 値                                                    |
| ---- | ----------------------------------------------------- |
| h2   | `## YYYY-MM-DD - TASK-ID <title>`                     |
| h3   | `### 変更内容` / `### 背景` の 2 節構成（背景は任意） |
| 表   | 種別 / 変更対象 / 結果 / 検証 の 4 行                 |

### aiworkflow-requirements/LOGS.md

末尾エントリ（2026-04-19 `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 Phase 12 close-out sync`）を基準 fixture とする。

```text
## YYYY-MM-DD — TASK-ID <title>

- bullet1
- bullet2

| 項目     | 内容                            |
| -------- | ------------------------------- |
| 種別     | ...                             |
| 変更対象 | ...                             |
| 結果     | ...                             |
| 検証     | ...                             |
```

| 項目 | 値                                                       |
| ---- | -------------------------------------------------------- |
| h2   | `## YYYY-MM-DD — TASK-ID <title>`（emダッシュ `—` 使用） |
| 先頭 | 箇条書き bullet（3節構成ではなく単節）                   |
| 表   | 種別 / 変更対象 / 結果 / 検証 の 4 行                    |

> **差異注意**: `task-specification-creator/LOGS.md` は h2 ハイフン `-`、`aiworkflow-requirements/LOGS.md` は em ダッシュ `—`。混用不可。

### task-workflow-active.md

| 項目       | 値                      |
| ---------- | ----------------------- |
| h2         | `## <TASK-ID>: <title>` |
| 直下       | メタ情報テーブル        |
| ステータス | `in_progress`           |

### task-workflow-completed-recent-2026-04g.md

| 項目 | 値                                                                           |
| ---- | ---------------------------------------------------------------------------- |
| h2   | `## <TASK-ID>: <title>（YYYY-MM-DD）`                                        |
| 直下 | メタ情報テーブル                                                             |
| 節   | `#### 実施内容` / `#### 検証証跡` / `#### 苦戦箇所` / `#### lessons-learned` |

### lessons-learned-current-2026-04.md

| 項目 | 値                                                              |
| ---- | --------------------------------------------------------------- |
| h2   | `## TASK-ID 教訓（YYYY-MM-DD）`                                 |
| h3   | `### L-<TASK-ID>-<NNN>: <summary>`                              |
| 表   | 症状 / 原因 / 解決策 / 設計原則 / 適用条件 / 関連タスク の 6 行 |

### 親 index.md

| 項目               | 値                                                                    |
| ------------------ | --------------------------------------------------------------------- | ----- | ---- | ---- | ---- | --------- |
| フロントマター     | `status` / `current_phase` / `task_id` / `created_date` の既定 4 キー |
| Phase 一覧テーブル | `                                                                     | Phase | 名称 | 状態 | 備考 | ` の 4 列 |

## 整合性判定

| 対象                                  | 既存形式との整合                            | 判定 |
| ------------------------------------- | ------------------------------------------- | ---- |
| task-spec-creator/LOGS.md 追記計画    | h2 `-`、3 節（変更内容 + 背景 + 表）        | PASS |
| aiworkflow-req/LOGS.md 追記計画       | h2 `—`、bullet + 表                         | PASS |
| task-workflow-active.md エントリ削除  | エントリ 1 件削除、他は触れない             | PASS |
| task-workflow-completed\*.md 追記計画 | h2 + メタ表 + 4 節                          | PASS |
| lessons-learned 3 知見追記計画        | h2 教訓 + 3 × h3 L-\*\*\*、6 列表           | PASS |
| 親 index.md 更新計画                  | フロントマター + Phase 一覧テーブル更新のみ | PASS |

## 形式逸脱リスク（Phase 5 で要注意）

| リスク                     | 対象                    | 予防策                                                            |
| -------------------------- | ----------------------- | ----------------------------------------------------------------- |
| em ダッシュ / ハイフン混用 | 両 LOGS                 | Phase 5 の template 化で明示的に `-` と `—` を分離                |
| active エントリ削除漏れ    | task-workflow-active.md | Phase 6 の形式回帰で削除確認                                      |
| h3 命名ゆらぎ              | lessons-learned         | L-SC-CANCEL-XXX-001 の 3 桁連番形式で統一                         |
| 表の列数不一致             | 全表形式                | Phase 4 の fixture snapshot で事前比較                            |
| 日付形式ゆらぎ             | 全対象                  | `2026-04-20` ISO 形式で統一、`2026/04/20` / `April 20, 2026` 禁止 |

## 判定

**PASS** — Phase 4（検証コマンド設計 / fixture 採取）へ進行可。

## 参照資料

- [design-review-result.md](design-review-result.md)
- [../phase-2/target-file-map.md](../phase-2/target-file-map.md)
- [../../phase-3-design-review.md](../../phase-3-design-review.md)
