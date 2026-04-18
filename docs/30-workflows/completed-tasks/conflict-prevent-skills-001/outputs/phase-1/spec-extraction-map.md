# Phase 1 Output: 仕様抽出マップ

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| タスクID | TASK-CONFLICT-PREVENT-001 |
| Phase    | 1                         |
| 作成日   | 2026-04-18                |

## 概要

`task-specification-creator` と `aiworkflow-requirements` の2スキルから、本タスクの設計に必要なルールを抽出し、適用方針を整理する。

---

## 抽出元 1: task-specification-creator

### 抽出した主要ルール

#### Phase 骨格（必須セクション）

各 Phase ファイルには以下のセクションが必須である。

| セクション         | 内容                          |
| ------------------ | ----------------------------- |
| メタ情報           | タスクID、Phase番号、作成日   |
| 目的               | この Phase で達成すること     |
| 実行タスク         | 番号付きリスト                |
| 参照資料           | パスと用途を表で              |
| 実行手順           | ステップ形式                  |
| 統合テスト連携     | 下流 Phase への接続           |
| 多角的チェック観点 | AI判断観点                    |
| サブタスク管理     | SubTask/担当/並列可否         |
| 成果物             | outputs/ 以下のファイルリスト |
| 完了条件           | チェックボックス形式          |
| タスク100%実行確認 | チェックボックス形式          |
| 次Phase            | 次の Phase の概要             |

#### Phase 11 / 12 / 13 固有ルール

| Phase    | ルール                                                                                                                                                                                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 11 | タスク種別が `VISUAL` の場合のみスクリーンショット取得を実施。`NON_VISUAL` では `manual-test-result.md` の記述のみで可                                                                                                                                            |
| Phase 12 | 成果物は6点固定：`implementation-guide.md`、`system-spec-update-summary.md`、`documentation-changelog.md`、`handover-summary.md`、`unassigned-task-detection.md`、`skill-feedback-report.md`。artifacts parity（root / outputs の両 `artifacts.json` 同期）が必須 |
| Phase 13 | PR 作成は user approval 取得まで `blocked` を維持する                                                                                                                                                                                                             |

#### 本タスクへの適用

- 本タスクは `NON_VISUAL / docs-only` であるため、Phase 11 のスクリーンショット取得は不要
- Phase 12 の 6成果物と artifacts parity は本 wave での実施対象
- Phase 13 は user approval まで `blocked` を維持する

---

## 抽出元 2: aiworkflow-requirements

### 抽出した主要ルール

#### canonical root ルール

| ルール          | 内容                                                                     |
| --------------- | ------------------------------------------------------------------------ |
| canonical       | `.claude/skills/` が正本。変更はすべてここで行う                         |
| mirror          | `.agents/skills/` は canonical の mirror。直接変更禁止                   |
| sync            | canonical 更新後に sync スクリプト（または手動手順）で mirror へ伝播する |
| parity チェック | Phase 12 close-out 時に canonical / mirror の parity を確認する          |

#### regenerate 原則

| ルール                          | 内容                                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| generated file は手マージしない | generated index はソースから再生成することで正しい状態に戻す                                         |
| non-deterministic 要因の除去    | `generate-index.js` の出力に含まれる日付ヘッダー等を除去し、同じ入力から同じ出力が得られるようにする |
| regenerate 導線                 | post-merge hook または Phase 12 close-out 手順に regenerate ステップを明記する                       |
| 索引契約の維持                  | `topic-map.md` の行番号索引（discoverability 契約）は削除しない                                      |

#### mirror policy

| ルール             | 内容                                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| keep-ours 優先     | mirror ファイルのコンフリクト時は canonical 側（現ブランチ）を保持する                                            |
| custom driver 必須 | `.gitattributes` の `merge=ours` は custom driver 登録（`git config merge.ours.driver true`）がなければ機能しない |
| schema 不変        | `EVALS.json` の schema はこの task で変更しない                                                                   |

---

## 抽出結果のマッピング

| 抽出元                     | 抽出ルール                   | 本タスクの受入基準への対応         |
| -------------------------- | ---------------------------- | ---------------------------------- |
| task-specification-creator | Phase 骨格（必須セクション） | AC-1                               |
| task-specification-creator | Phase 11 NON_VISUAL ルール   | スコープ外（docs-only のため）     |
| task-specification-creator | Phase 12 6成果物 + parity    | Phase 12 成果物設計に反映          |
| task-specification-creator | Phase 13 blocked ルール      | AC-7（index.md の `blocked` 維持） |
| aiworkflow-requirements    | canonical root               | AC-3                               |
| aiworkflow-requirements    | regenerate 原則              | AC-4、AC-5                         |
| aiworkflow-requirements    | custom driver 必須           | AC-2                               |
| aiworkflow-requirements    | schema 不変                  | AC-6                               |

---

## 初期仕様との差分（是正済み）

| 項目                     | 初期状態                                                         | 是正後                                                |
| ------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------- |
| `merge=ours` の説明      | built-in として誤記                                              | custom driver 登録前提と明記                          |
| `indexes/*.md` の policy | `merge=union`（不適切）                                          | `merge=ours`（custom）に修正し、regenerate 導線を追加 |
| `topic-map.md` の日付    | 除去対象として記述されているが行番号索引も除去対象に含まれていた | 日付ヘッダーのみ除去し、行番号索引は維持              |
| `EVALS.json`             | schema 変更案が混在                                              | 本 task では schema 不変を明文化                      |
| mirror policy            | policy と parity 判定が曖昧                                      | canonical / mirror / parity を明記                    |
