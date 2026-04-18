# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 12                    |
| Phase名    | ドキュメント更新      |
| 対象機能   | TASK-SW-STREAM-FUP-03 |
| 前提Phase  | Phase 11: 手動テスト  |
| 次Phase    | Phase 13: PR作成      |
| ステータス | 完了                  |
| 作成日     | 2026-04-17            |

## 目的

Phase 11 の検証結果と task-local manifest を同期し、documentation outputs と台帳の整合を固定する。

## 実行タスク

- implementation guide を作成する。
- system-spec update summary を作成する。
- documentation changelog と skill feedback を記録する。
- unassigned task detection と compliance check を作成する。

## 参照資料

- `phase-11-manual-test.md`
- `artifacts.json`
- `outputs/artifacts.json`
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

## 必須タスク（6タスク）

| Task | 名称                             | 状態 |
| ---- | -------------------------------- | ---- |
| 12-1 | 実装ガイド作成（2パート構成）    | 完了 |
| 12-2 | システム仕様更新サマリー         | 完了 |
| 12-3 | ドキュメント更新履歴作成         | 完了 |
| 12-4 | 未タスク検出レポート作成         | 完了 |
| 12-5 | スキルフィードバックレポート作成 | 完了 |
| 12-6 | Phase 12 準拠チェック            | 完了 |

---

## Task 12-1: 実装ガイド作成（2パート構成）

### Part 1

- なぜ必要かを先に説明する
- 日常生活の例え話を含め、`たとえば` を最低 1 回明示する
- 専門用語は使いすぎない

### Part 2

- `SkillCreatorProgressCallback` 型を含める
- 各 mode の progress flow と percentage 値を一覧化する
- `createSkill()` を orchestration point として説明する
- `emitProgress`（`emitProgressStep` 相当）の責務を説明する
- `onProgress` が `undefined` のときの安全動作を明記する
- `## 視覚証跡` に「UI/UX変更なしのため Phase 11 スクリーンショット不要」と明記する

### Phase 11 参照

- 実ファイル名: `outputs/phase-11/TASK-SW-STREAM-FUP-03-manual-test-report.md`

---

## Task 12-2: システム仕様更新サマリー

### Step 1-A: タスク完了記録

task-local scope で更新したもの:

| 更新先                      | 内容                                                 |
| --------------------------- | ---------------------------------------------------- |
| `phase-12-documentation.md` | completed 状態と canonical short names を反映        |
| `index.md`                  | Phase 12 完了 / Phase 13 blocked に同期              |
| `artifacts.json`            | Phase 11 の actual file 名と Phase 12 outputs を同期 |
| `outputs/artifacts.json`    | root と同一内容に同期                                |

### Step 1-B: 実装状況テーブル更新

- local manifest では `completed` を記録
- `spec_created` は未使用
- 理由: progress flow の本体は `SkillCreatorService.ts` にあり、この Phase 12 はその結果を文書化する closing wave だから

### Step 1-C: 関連タスクテーブル更新

| 関連項目                                      | 更新内容                         |
| --------------------------------------------- | -------------------------------- |
| `TASK-SW-STREAM-001`                          | 依存元として継続                 |
| `FUP-02`                                      | 推奨前提として継続               |
| `TASK-SW-STREAM-FUP-03-manual-test-report.md` | Phase 11 の actual file 名に統一 |

### Step 2: システム仕様更新

- N/A
- 新規 public interface / shared type / IPC contract は追加していない
- `PROGRESS_FLOWS` と `emitProgress` は `SkillCreatorService.ts` 内部の責務であり、外部 system spec への波及がない

---

## Task 12-3: ドキュメント更新履歴作成

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/TASK-SW-STREAM-FUP-03
```

---

## Task 12-4: 未タスク検出

- 件数を明記して出力する
- TODO / FIXME / HACK の新規追加は scope 内でなし
- Phase 11 は NON_VISUAL のためスクリーンショット要件なし
- renderer 側の mode-specific phase mapping は別タスクとして formalize 済み

---

## Task 12-5: スキルフィードバックレポート

- workflow 改善: canonical output 名の単一ソース化
- workflow 改善: Phase 11 evidence 名の明示化
- skill 改善: NON_VISUAL 文言の固定化
- skill 改善: 検証順（Part 1 / Part 2 / Step 1-A/B/C / Step 2 / parity）の固定化
- workflow 改善: renderer 側の unknown phase fallback を別責務へ分離

---

## Task 12-6: Phase 12 準拠チェック

- 6 成果物はすべて `outputs/phase-12/` に存在する
- `artifacts.json` と `outputs/artifacts.json` は同一内容
- Phase 11 参照は actual file に統一済み
- 計画系文言 は残っていない

---

## 成果物

| 成果物                                | パス                                                     |
| ------------------------------------- | -------------------------------------------------------- |
| implementation-guide.md               | `outputs/phase-12/implementation-guide.md`               |
| system-spec-update-summary.md         | `outputs/phase-12/system-spec-update-summary.md`         |
| documentation-changelog.md            | `outputs/phase-12/documentation-changelog.md`            |
| unassigned-task-detection.md          | `outputs/phase-12/unassigned-task-detection.md`          |
| skill-feedback-report.md              | `outputs/phase-12/skill-feedback-report.md`              |
| phase12-task-spec-compliance-check.md | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 完了条件

- [x] Task 12-1（実装ガイド Part 1/Part 2）を作成した
- [x] Task 12-2（Step 1-A/B/C・Step 2 N/A確認）を実行した
- [x] Task 12-3（changelog）を生成した
- [x] Task 12-4（未タスク検出）を実行した（1件を formalize）
- [x] Task 12-5（skillフィードバック）を作成した（renderer follow-up を含めて出力）
- [x] Task 12-6（準拠チェック）を実行した
- [x] `artifacts.json` と `outputs/artifacts.json` が一致している

## タスク100%実行確認【必須】

- [x] 6成果物が全て `outputs/phase-12/` に存在する
- [x] `index.md` を同期した
- [x] `artifacts.json` が更新されている
- [x] Phase 11 の actual file 名に揃えた

## 次 Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)（`blocked`）
