# Phase 12: 未タスク検出レポート

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 目的

Phase 3のMINOR指摘および設計フェーズ全体を通じて発見した未タスクを検出・記録する。

> **P3/P38対策**: 0件でも本レポートの作成は必須。未タスク指示書は `docs/30-workflows/unassigned-task/` に配置すること（P58対策）。

---

## 検出件数サマリー

| カテゴリ                     | 検出件数           |
| ---------------------------- | ------------------ |
| Phase 3 MINOR指摘由来        | 3件（M-1/M-2/M-3） |
| 設計フェーズ全体での新規発見 | 0件                |
| **合計**                     | **3件**            |

**うち未タスク化が必要なもの**: 2件（M-3は実装時に対応するため別途未タスク化不要）

---

## 未タスク一覧

### UT-TRANSCRIPT-M-1: SelectedFile source対応

| 項目       | 内容                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| 発見元     | Phase 3 MINOR指摘 M-1                                                                                              |
| 概要       | `TranscriptProvenance.sourceType` に `'file'` を追加し、選択ファイルをsourceとしてprovenanceに記録できるようにする |
| 優先度     | MEDIUM                                                                                                             |
| スコープ   | 設計フェーズ完了後の実装タスク                                                                                     |
| 関連リスク | R-05（risk-register.md）                                                                                           |
| 指示書パス | `docs/30-workflows/unassigned-task/ut-transcript-m1-selected-file-source.md`                                       |
| ステータス | UNASSIGNED                                                                                                         |

**3ステップ管理状況（P3対策）**:

- [x] Step 1: 指示書作成（`unassigned-task/` に配置）→ `docs/30-workflows/unassigned-task/ut-transcript-m1-selected-file-source.md` 作成済み
- [x] Step 2: `task-workflow-backlog.md` の残課題テーブルに登録済み（2026-03-22）
- [x] Step 3: `workflow-ai-runtime-execution-responsibility-realignment.md` Follow-up Backlog に参照リンク追加済み（2026-03-22）

---

### UT-TRANSCRIPT-M-2: TranscriptSession型の追加

| 項目       | 内容                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| 発見元     | Phase 3 MINOR指摘 M-2                                                                                                  |
| 概要       | `TranscriptSession` 型を独立させ、OP-3専用のメタデータ（セッション全体の行数・期間・参加者数等）を格納できるようにする |
| 優先度     | LOW                                                                                                                    |
| スコープ   | 設計フェーズ完了後の実装タスク（YAGNI原則により後回し）                                                                |
| 関連リスク | R-07（risk-register.md）                                                                                               |
| 指示書パス | `docs/30-workflows/unassigned-task/ut-transcript-m2-session-type.md`                                                   |
| ステータス | UNASSIGNED                                                                                                             |

**3ステップ管理状況（P3対策）**:

- [x] Step 1: 指示書作成（`unassigned-task/` に配置）→ `docs/30-workflows/unassigned-task/ut-transcript-m2-session-type.md` 作成済み
- [x] Step 2: `task-workflow-backlog.md` の残課題テーブルに登録済み（2026-03-22）
- [x] Step 3: `workflow-ai-runtime-execution-responsibility-realignment.md` Follow-up Backlog に参照リンク追加済み（2026-03-22）

---

### M-3: truncation上限の定量化（未タスク化不要）

| 項目             | 内容                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| 発見元           | Phase 3 MINOR指摘 M-3                                                                             |
| 状態             | 実装時に対応                                                                                      |
| 対応方針         | implementation-guide.md Part 2 にて10,000文字をデフォルト上限として定義済み。実装時に直接反映する |
| 未タスク化の要否 | 不要（実装仕様として確定済み）                                                                    |

---

## 未タスク指示書の作成ステータス

| 未タスクID        | 指示書ファイル                                             | 作成状態                                                                    |
| ----------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| UT-TRANSCRIPT-M-1 | `unassigned-task/ut-transcript-m1-selected-file-source.md` | 作成済み（`docs/30-workflows/unassigned-task/` に配置、P3 3ステップ全完了） |
| UT-TRANSCRIPT-M-2 | `unassigned-task/ut-transcript-m2-session-type.md`         | 作成済み（`docs/30-workflows/unassigned-task/` に配置、P3 3ステップ全完了） |

> **P58対策**: 設計タスクの未タスクであっても独立した指示書ファイルを作成すること。「本レポート内で完了」は禁止。

---

## 今後の対応指針

### UT-TRANSCRIPT-M-1（優先）

`TranscriptProvenanceChip` に未知sourceTypeのフォールバック表示（R-05対策）が既に設計済みのため、`'file'` sourceの追加は既存のUI設計に大きな変更を加えずに実装できる見込み。実装フェーズの初期段階で着手を推奨。

### UT-TRANSCRIPT-M-2（低優先）

OP-3（セッションを貼り付ける）のメタデータ要件が明確になった段階で設計・実装する。現状では `TranscriptProvenance.sessionTitle` と `originalContent` で十分な情報を伝達できるため、機能上の問題はない。
