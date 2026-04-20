# Phase 2: 設計

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| Phase      | 2                                                    |
| タスクID   | TASK-SC-CANCEL-LOGS-SYNC-001                         |
| タスク種別 | NON_VISUAL                                           |
| 前Phase    | [phase-1-requirements.md](phase-1-requirements.md)   |
| 次Phase    | [phase-3-design-review.md](phase-3-design-review.md) |
| 作成日     | 2026-04-20                                           |

---

## 目的

Phase 1 で確定した受入基準・scope 境界・対象ファイル一覧に基づき、
**5ファイル更新の追記方針 / 既存エントリ形式整合方針 / lessons-learned 反映ポイント /
NON_VISUAL 代替証跡方針 / Phase 12 self-close-out 設計** を確定する。
コードを書かない docs-sync wave のため、設計の主軸は「追記マップ」と「形式整合」に置く。

---

## 設計方針

| 観点                | 方針                                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 追記原則            | **既存最新エントリの形式を完全に模倣**する。独自形式での追記禁止                                                           |
| 最小変更原則        | `topic-map.md` / `keywords.json` はファイル内容変更が発生する場合のみ再生成。ログ追記のみであれば再生成不要                |
| 並列化              | Lane A: 両 LOGS.md 追記 / Lane B: canonical spec（task-workflow / lessons-learned）更新 / Lane C: 親 index.md 完了宣言更新 |
| 完了宣言の最後置き  | 親タスク `index.md` の Phase 12 ステータス更新は、Lane A / Lane B の追記完了 **後**に Lane C で実施                        |
| NON_VISUAL 代替証跡 | Phase 11 で grep 出力スナップショットを `outputs/phase-11/manual-test-result.md` に貼り付け、TC-ID と紐付ける              |
| Phase 12 self-close | 本タスク自身の Phase 12 では、本タスクの完了エントリも両 LOGS.md に追記する（自己完結 close-out）                          |
| concern 数判定      | 5ファイル × 3 lane で **3 concern**（既存 phase-template-core.md 基準で 3〜4 concern → 同一ファイル内セクション分割）      |

> 親タスクと違い、本タスクは「コード差分確認」が無く「ファイル追記」が主役のため、
> 設計書は短く保ち、追記マップに重点を置く。

---

## 実行タスク

| Task | 内容                                                                | 主成果物                                            |
| ---- | ------------------------------------------------------------------- | --------------------------------------------------- |
| 1    | Lane A/B/C の責務と順序を 1 つの設計方針にまとめる                  | `outputs/phase-2/sync-design.md`                    |
| 2    | 対象 5 ファイルと補助確認対象を更新マップへ集約する                 | `outputs/phase-2/target-file-map.md`                |
| 3    | lessons-learned 反映方針と NON_VISUAL 証跡の正本を後続 phase へ渡す | `outputs/phase-2/lessons-learned-injection-plan.md` |

- Task 1: Lane A/B/C の責務と順序を設計方針へ落とし込む
- Task 2: 対象 5 ファイルと補助確認対象をマップ化する
- Task 3: lessons-learned 方針と NON_VISUAL 証跡方針を後続 phase へ渡す

---

## SubAgent lane plan

| Lane | 対象                                                                                                                  | 主要操作                                | 並列性             | 出力                                                   |
| ---- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------ | ------------------------------------------------------ |
| A    | `task-specification-creator/LOGS.md` / `aiworkflow-requirements/LOGS.md`                                              | 既存形式照合 + 末尾追記                 | 並列               | 両 LOGS への wave / close-out 記録エントリ             |
| B    | `task-workflow.md` / `task-workflow-active.md` / `task-workflow-completed*.md` / `lessons-learned-current-2026-04.md` | 完了記録追加 + 3知見反映                | 並列               | canonical spec への完了記録 + lessons-learned エントリ |
| C    | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`                                                   | フロントマター + Phase 一覧テーブル更新 | 直列（A/B 完了後） | 親タスク Phase 12 完了宣言                             |

### Lane 間の依存と順序

```
[Lane A]  両 LOGS 追記      ─┐
                              ├→  [Lane C]  親 index.md 完了宣言
[Lane B]  canonical spec 更新 ─┘
```

- Lane A / Lane B は **並列実行可** (異なるファイル群)
- Lane C は両 lane 完了後に **直列で1回のみ** 実行（順序保証のため）

---

## 対象ファイル詳細マップ

### File 1: `.claude/skills/task-specification-creator/LOGS.md`

| 項目     | 設計内容                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 既存形式 | 「コンテキスト・成果・結果」の3節構成（最新エントリを Phase 4 で fixture 化して Phase 5 で参照）                                                                                |
| 追記内容 | タスクID `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` / Phase 1〜12 完了 / Phase 13 blocked / 成果: 差分確認+回帰確認型仕様書再構成・mandatory 5 成果物・artifacts.json parity 確立 |
| 特記事項 | NON_VISUAL 代替証跡方針確立（Phase 11 `manual-test-result.md` 一次ソース）                                                                                                      |
| 苦戦事項 | branch 内 docs と repo-wide spec の同期対象不明確 → 本タスクへ移譲                                                                                                              |
| 結果     | branch 内 success / repo-wide sync は本タスク `TASK-SC-CANCEL-LOGS-SYNC-001` で完了                                                                                             |
| 配置位置 | LOGS.md 末尾（既存追記順を踏襲）                                                                                                                                                |

### File 2: `.claude/skills/aiworkflow-requirements/LOGS.md`

| 項目     | 設計内容                                                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 既存形式 | 表形式（タスクID / 操作 / 対象ファイル / 結果 / 備考）                                                                                 |
| 追記内容 | タスクID `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` / 操作 `close-out-wave-sync` / 対象ファイル: 親 index.md + 両 LOGS.md / 結果 success |
| 備考     | 「branch 内作業完了済み / repo-wide sync を本タスクで完了」                                                                            |
| 配置位置 | 表の末尾行（既存日付順を踏襲）                                                                                                         |

### File 3: `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

| 項目         | 設計内容                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| 確認手順     | Phase 5 開始時に `task-workflow.md` / `task-workflow-active.md` / `task-workflow-completed*.md` 全部を grep で検索       |
| 親タスク状態 | active 側に残っているなら completed 側へ移動。新規完了記録なら `task-workflow-completed-recent-2026-04*.md` の末尾に追加 |
| 追記内容     | 親タスクID + Phase 12 完了日（2026-04-20）+ 完了根拠（本タスクの Phase 5 で同期完了）                                    |
| 判断ルール   | active から completed への移動は最小変更原則。現状が `pending` のみなら active 側に新規エントリ追加で完了表示            |

### File 4: lessons-learned 系（`lessons-learned-current-2026-04.md` 等）

| 項目         | 設計内容                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 反映先候補   | `lessons-learned-current-2026-04.md` を第1候補。存在しない場合は `lessons-learned-current-2026-04-runtime-sdk.md` 等の同月ファイルを Phase 5 で確定      |
| 知見1        | **NON_VISUAL code task 代替証跡**: `outputs/phase-11/manual-test-result.md` を一次ソースとし、TC-ID ↔ grep スナップショットの対応を記録する方式          |
| 知見2        | **scope 境界明確化**: Phase 12 で「branch 内 docs」と「repo-wide spec sync」を分離管理することが wave 進捗感維持と完了判断速度向上の鍵                   |
| 知見3        | **repo-wide sync 持ち越し管理**: 同 wave 内で完了できない repo-wide sync は `unassigned-task-detection.md` で formalize し、別 wave として確実に引き継ぐ |
| エントリ形式 | 既存 lessons-learned ファイルの形式に揃える（h3 タイトル + 背景 / 学び / 適用箇所 等のフォーマットを Phase 4 で fixture 化）                             |

### File 5: `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`

| 項目              | 設計内容                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| 更新箇所 1        | フロントマター `status: in_progress` → `completed`（または `pending_pr`）                                          |
| 更新箇所 2        | フロントマター `current_phase: 13` は維持（Phase 13 は user 承認待ち blocked のまま）                              |
| 更新箇所 3        | Phase 一覧テーブルの Phase 12 行のステータス列を `completed` 化（既に `completed` の場合は確認のみ）               |
| 更新箇所 4 (任意) | 完了日記録（本タスク Phase 5 完了時の 2026-04-20 を備考として追加可）                                              |
| 注意              | 親タスクは `current_phase: 13` だが Phase 13 は user 承認待ち。本タスク完了で「Phase 12 までの完了宣言」を確定する |

---

## 追記方針の標準化（Lane A / Lane B 共通）

### Step 1: 既存形式の fixture 化（Phase 4 で実施予定）

各ファイルの **直近最新エントリ** を Phase 4 成果物 `format-fixture-snapshots.md` に貼り付け、
Phase 5 の追記時に逐次参照する fixture とする。

### Step 2: 追記の order rule

| ファイル                                          | order rule                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------ |
| `task-specification-creator/LOGS.md`              | 末尾追記（時系列降順なら冒頭追記。Phase 4 で確認）                 |
| `aiworkflow-requirements/LOGS.md`                 | 表の末尾行に追記                                                   |
| `task-workflow.md` / `task-workflow-active.md`    | active セクションから completed セクションへ移動（または新規追加） |
| `lessons-learned-current-2026-04.md`              | 既存末尾エントリの直後に新規エントリ追加                           |
| `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` | フロントマターと Phase 一覧テーブルを直接編集（追記ではなく更新）  |

### Step 3: 形式逸脱検知

Phase 6 で以下を確認：

- 各 LOGS エントリに必須キー（タスクID / 結果 / 日付）が含まれているか
- Markdown 構文が壊れていないか（テーブル列数 / コードブロック閉じ）
- 日付が `2026-04-20` 形式で正確か

---

## NON_VISUAL 代替証跡方針【必須】

本タスクは UI 変更を含まないため、Phase 11 でスクリーンショットは取得しない。
代替として以下の **grep 出力スナップショット** を一次証跡とする。

### TC-ID と検証コマンドの対応（Phase 11 で実施）

| TC-ID | 検証対象               | 検証コマンド                                                                                                               | 期待結果                  |
| ----- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| TC-01 | task-spec-creator LOGS | `grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/task-specification-creator/LOGS.md`                       | 1 件以上ヒット            |
| TC-02 | aiworkflow-req LOGS    | `grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/LOGS.md`                          | 1 件以上ヒット            |
| TC-03 | task-workflow.md       | `grep -rn "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/references/`                     | 1 件以上ヒット            |
| TC-04 | lessons-learned        | `grep -rn "NON_VISUAL\|scope.*境界\|repo-wide sync" .claude/skills/aiworkflow-requirements/references/lessons-learned*.md` | 3知見すべての該当行が存在 |
| TC-05 | 親 index.md            | `grep -n "Phase 12.*completed\|status.*completed" docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`       | 該当行が存在              |

各コマンドの **出力（行番号 + マッチ内容）を `outputs/phase-11/manual-test-result.md` に貼り付ける**ことで NON_VISUAL の代替証跡とする。
placeholder-only（ファイルが空、コマンド未実行）は PASS 扱いにしない。

---

## 統合テスト連携

| 引き渡し先 | 内容                                        | 目的                       |
| ---------- | ------------------------------------------- | -------------------------- |
| Phase 4    | fixture 取得対象、TC-01〜TC-05、AC 対応表   | 検証コマンドの正本化       |
| Phase 5    | Lane A/B/C の実行順、更新対象マップ         | 追記順序の固定             |
| Phase 11   | grep スナップショットを一次ソースとする方針 | placeholder-only PASS 防止 |

---

## 参照資料

| 資料                                                                                    | 用途                             |
| --------------------------------------------------------------------------------------- | -------------------------------- |
| [phase-1-requirements.md](phase-1-requirements.md)                                      | AC、scope 境界、対象ファイル一覧 |
| `.claude/skills/task-specification-creator/references/phase-template-core.md`           | concern 数と phase 骨格の確認    |
| `.claude/skills/task-specification-creator/references/phase-template-phase12-detail.md` | self-close-out 設計の基準        |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                                       | canonical spec 更新の正本原則    |
| `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`                  | references 更新時の整合ルール    |

---

## Phase 12 self-close-out 設計

本タスク自身も Phase 12 で repo-wide 同期を行う対象であるため、
`phase-template-phase12-detail.md` を踏まえて以下を設計に組み込む。

### 本タスクの Phase 12 で実施すること

| Step           | 内容                                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Step 1-A       | 本タスクの完了記録を **両 LOGS.md** に追記（task-spec-creator: 3節形式 / aiworkflow-req: 表行）                                   |
| Step 1-B       | 実装状況テーブル更新は不要（コード変更なし）                                                                                      |
| Step 1-C       | 関連タスクテーブル更新は不要（本タスクは親タスクの follow-up であり、新規 unassigned task は発生しない見込み。Phase 12 で再確認） |
| Step 2         | interface / API / IPC 契約変更なし → `system-spec-update-summary.md` に「更新不要」と理由を明記                                   |
| same-wave sync | `artifacts.json` parity 確認（本タスクの artifacts.json と outputs/\* の一致）                                                    |

### Part 1 / Part 2 構成（implementation-guide.md 用ヒント）

- **Part 1（中学生レベル）**: 「やり残しメモを片付ける作業」のたとえ話。`たとえば` を含む
- **Part 2（開発者向け）**: 5ファイルの追記マップ・grep 検証コマンド・既存エントリ形式整合の標準化方針

> 本タスクの Phase 12 仕様書本体は別エージェント（Phase 4-13 担当）が作成する。
> Phase 2 設計ではこの「本タスク自身の Phase 12 設計骨子」を方針として固定する。

---

## 検証導線（Phase 4 以降への引き継ぎ）

1. **Phase 4 (テスト作成)**: 既存最新エントリを `format-fixture-snapshots.md` に集約し、追記時の fixture とする。Phase 11 用 grep 検証コマンドを `verification-commands.md` に列挙する
2. **Phase 5 (実装)**: Lane A / B 並列実行 → Lane C 直列実行。各追記の前後 diff を `sync-execution-log.md` に記録
3. **Phase 6 (テスト拡充)**: 形式整合性・Markdown 構文・日付正確性を再確認し `format-regression-check.md` に記録
4. **Phase 7 (カバレッジ)**: Issue #2313 「未実施」6項目すべてが対応済かをチェックリスト化（`coverage-report.md`）
5. **Phase 8 (リファクタリング)**: 追記内容の重複・冗長表現を整理（`refactor-decision-log.md`）
6. **Phase 9 (品質保証)**: Markdown lint / 全 grep 検証 / 日付正確性の最終チェック
7. **Phase 10 (最終レビュー)**: 親タスク Phase 12 完了宣言の整合性確認（`final-review-result.md`）
8. **Phase 11 (手動テスト)**: 上記 5 つの grep コマンド出力スナップショットを `manual-test-result.md` に記録
9. **Phase 12 (本タスク close-out)**: mandatory 5 tasks 実施。本タスク自身の完了記録を両 LOGS に追記
10. **Phase 13 (PR 作成)**: ユーザー承認待ち blocked。本タスク内では実施しない

---

## 依存関係整合

| 依存          | 理由                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------- |
| Phase 1 → 2   | classification（NON_VISUAL）と AC、scope 境界、対象ファイル一覧が確定してから設計する    |
| Phase 2 → 3   | 追記方針が既存エントリ形式と整合するか 30思考法 + 4条件で監査する                        |
| Phase 4 → 5   | fixture と検証コマンドが揃ってから追記実行                                               |
| Phase 5 内    | Lane A / Lane B 並列 → Lane C 直列。Lane C で親 index.md の Phase 12 完了宣言            |
| Phase 10 → 11 | final-review-result が NON_VISUAL 代替証跡（grep）の入力                                 |
| Phase 11 → 12 | manual-test-result が本タスク close-out の根拠                                           |
| Phase 12 → 13 | 本タスク自身の LOGS 追記完了が PR 作成の前提（ただし Phase 13 は user 承認待ち blocked） |

---

## 成果物

| 成果物                         | パス                                                | 内容                                  |
| ------------------------------ | --------------------------------------------------- | ------------------------------------- |
| sync design                    | `outputs/phase-2/sync-design.md`                    | 5ファイル更新方針 + Lane 構成         |
| target file map                | `outputs/phase-2/target-file-map.md`                | 対象ファイル詳細マップ（File 1〜5）   |
| lessons-learned injection plan | `outputs/phase-2/lessons-learned-injection-plan.md` | 3知見の反映先・エントリ形式・配置順序 |

---

## 完了条件

- [ ] 5ファイル更新方針（Lane A/B/C 構成）が設計に明記されている
- [ ] 各ファイルの追記内容・既存形式整合方針が表で列挙されている
- [ ] NON_VISUAL 代替証跡方針（TC-01〜TC-05 と grep コマンド対応）が定義されている
- [ ] Phase 12 self-close-out 方針（本タスク自身の完了記録追加）が定義されている
- [ ] lessons-learned への 3 知見反映計画が定義されている
- [ ] Lane 間依存（A/B 並列 → C 直列）が明示されている
- [ ] 最小変更原則（topic-map.md / keywords.json 不要再生成）が明記されている
- [ ] 検証導線（Phase 4 以降への引き継ぎ）が記述されている
- [ ] 依存関係整合表が完成している
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次Phase

[phase-3-design-review.md](phase-3-design-review.md) — 30思考法 + 4条件 + 既存エントリ形式整合性の監査
