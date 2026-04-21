# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Phase      | 12                                                 |
| タスクID   | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID              |
| タスク種別 | NON_VISUAL code task                               |
| 前Phase    | [phase-11-manual-test.md](phase-11-manual-test.md) |
| 次Phase    | [phase-13-pr-creation.md](phase-13-pr-creation.md) |

## 目的

`SkillCreatorProgress` への `planId` / `requestId` 付与と `useStreamingProgress` フィルタ追加について、mandatory 5 tasks を完了し、system spec sync と close-out evidence を揃える。

## 事前チェック【必須】

- `outputs/phase-11/manual-test-result.md` が存在し NV-01 〜 NV-05 の結果欄が更新されている
- `outputs/phase-10/final-review-result.md` の blocker が 0 件
- `artifacts.json` と `outputs/artifacts.json` の Phase 11 / 12 成果物名 parity がある

## 実行タスク

| Task      | 内容                                      | 主成果物                                                                                              |
| --------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Task 12-1 | 実装ガイド作成（中学生レベル + 技術詳細） | `outputs/phase-12/implementation-guide.md`                                                            |
| Task 12-2 | system spec update summary                | `outputs/phase-12/system-spec-update-summary.md`                                                      |
| Task 12-3 | documentation changelog                   | `outputs/phase-12/documentation-changelog.md`                                                         |
| Task 12-4 | unassigned task detection                 | `outputs/phase-12/unassigned-task-detection.md`                                                       |
| Task 12-5 | skill feedback と compliance check        | `outputs/phase-12/skill-feedback-report.md`, `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 実装ガイドを Part 1 / Part 2 の 2 パート構成で作成
- Task 12-2: Step 1-A 〜 1-C と Step 2 の要否判断を記録
- Task 12-3: documentation changelog を作成
- Task 12-4: 未タスクを検出（0 件でもレポート出力）
- Task 12-5: skill feedback と compliance check を記録

## Task 12-1: 実装ガイド【必須】

| パート | 対象読者             | 必須内容                                                                                                  |
| ------ | -------------------- | --------------------------------------------------------------------------------------------------------- |
| Part 1 | 初学者・中学生レベル | なぜ必要か → 何をするか。`たとえば` を含む日常例え話を入れる                                              |
| Part 2 | 開発者・技術者       | TypeScript 型シグネチャ、呼び出し例、差分確認コマンド、エラーハンドリング、エッジケース、後方互換ポリシー |

### Part 1 概念説明の必須例え話（broadcast channel + filter by id）

- `たとえば` 学校の放送で全教室にアナウンスが流れるとき「3 年 A 組の人だけ聞いてね」と宛先札を付ける仕組みと同じ
- progress payload は校内放送、`planId` は宛先札、`useStreamingProgress` は「自分宛以外は無視する」受信係
- 複数スキルを同時に生成しても、各 Renderer は自分の planId に一致する放送だけ反映する

### NON_VISUAL 視覚証跡【必須】

`implementation-guide.md` に `## 視覚証跡` を設け、UI / UX 変更なしのため Phase 11 スクリーンショット不要であることと、代替証跡が `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`（NV-01 〜 NV-05）である旨を明記する。

## Task 12-2: system spec update summary【必須】

- **Step 1-A（branch 内 artifacts refresh）**: Phase 1 〜 11 artifacts の最新化、`LOGS.md` x 2（aiworkflow-requirements + task-specification-creator）の更新要否を記録
- **Step 1-B（system spec sync）**: `api-ipc-system-skill-creator.md` の `skill-creator:progress` payload への `planId?` / `requestId?` 追記と `lessons-learned-stream-001-progress-callback.md` への filter-by-planId 契約追記の要否を記録
- **Step 1-C（関連 task / unassigned 同期）**: `docs/30-workflows/unassigned-task/TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID.md` の完了扱いと `TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE` 側参照関係を同期
- **Step 2（interface 変更要否）**: `SkillCreatorProgress` に optional field を追加する interface 変更のため `api-ipc-system-skill-creator.md` / `lessons-learned-stream-001-progress-callback.md` を **更新あり** と判定。将来 required 化は Task 12-4 に記録
- **same-wave sync**: `artifacts.json` / `outputs/artifacts.json` / Phase 12 成果物名 / `index.md` の Phase 12 ステータス

## Task 12-3: documentation changelog【必須】

- phase spec 再構成内容（Phase 11 を NON_VISUAL に固定）
- artifact 名統一（Phase 11 / 12 / 13 全成果物）
- `api-ipc-system-skill-creator.md` / `lessons-learned-stream-001-progress-callback.md` 更新内容の要約

## Task 12-4: unassigned task detection【必須】

- 0 件でも出力する
- 将来タスク候補:
  - `planId` を将来 required 化する migration task（`docs/30-workflows/unassigned-task/` へ formalize）
  - `useStreamingProgress` 以外の progress 受信系（もし存在すれば）への filter 水平展開

## Task 12-5: skill feedback【必須】

- `task-specification-creator` への改善点（Phase 11 NON_VISUAL 代替証跡テンプレートの再利用性と close-out 方針）
- 改善点がなければ `改善点なし` を記録
- あわせて `phase12-task-spec-compliance-check.md` を作り、Phase 1 〜 11 artifacts parity と artifacts.json / outputs/artifacts.json 同期を記録

## 成果物

| 成果物                     | パス                                                     |
| -------------------------- | -------------------------------------------------------- |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            |
| unassigned task detection  | `outputs/phase-12/unassigned-task-detection.md`          |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              |
| phase12 compliance check   | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 参照資料

- `.claude/skills/task-specification-creator/references/phase-12-guide.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-stream-001-progress-callback.md`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management-skill-creator.md`

## 完了条件

- [ ] 実行タスク 5 件を表と箇条書きの両方で記載している
- [ ] Part 1（中学生レベル・`たとえば` 例え話）と Part 2（技術詳細）の要件が明記されている
- [ ] Step 1-A 〜 1-C と Step 2 の要否判断が定義されている
- [ ] NON_VISUAL 代替証跡（`phase-10` / `phase-11` 参照）が明記されている
- [ ] skill feedback と compliance check が成果物に含まれている
- [ ] `artifacts.json` と `outputs/artifacts.json` の parity を確認対象に含めている
- [ ] `api-ipc-system-skill-creator.md` / `lessons-learned-stream-001-progress-callback.md` の更新要否が記録されている
- [ ] 将来 required 化タスクの未タスク化方針が記録されている
