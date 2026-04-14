# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 11                                                |
| Phase名    | 手動テスト                                        |
| タスクID   | TASK-SW-FIX-FEEDBACK-001                          |
| 機能名     | current facts 同期・skill準拠検証・docs-only 改善 |
| タスク種別 | ドキュメント整理タスク（NON_VISUAL）              |
| 前提Phase  | Phase 10                                          |
| 次Phase    | Phase 12                                          |
| ステータス | pending                                           |
| 作成日     | 2026-04-14                                        |

## 目的

current facts と evidence が実際の UI 挙動と一致するかを手動で確認する。
docs-only であるため、UI キャプチャは CAPTURE_BLOCKED / N/A になり得るが、その場合でも既存テストを代替 evidence として用いる。

## タスク種別

**NON_VISUAL タスク**（current facts walkthrough）

- `SkillLifecyclePanel` の success / terminal_handoff を current facts として確認する
- `CompleteStep` の `skillPath=null` エラー表示・成功ヘッダー条件表示を current facts として確認する
- 画面キャプチャが取れない場合は existing tests を evidence として採用する

---

## 実行タスク

### Task 1: 環境チェック

- **preview 起動確認**: 可能な場合のみ `pnpm --filter @repo/desktop preview` を確認する
- **worktree環境の判定**: worktree 環境の場合は `CAPTURE_BLOCKED` として記録する
- **代替evidence有無**: Phase 9/10 のテスト結果と current facts を参照する

### Task 2: 手動テストシナリオ実行

#### シナリオ1: LLMモードでスキル生成 → スキル一覧更新（AC-1検証）

| ステップ | 操作                       | 期待結果                                 | 結果 |
| -------- | -------------------------- | ---------------------------------------- | ---- |
| 1        | SkillLifecyclePanel を開く | パネルが正常に表示される                 | -    |
| 2        | executePlan を実行する     | LLMによるスキル生成が開始される          | -    |
| 3        | 生成完了を待つ             | current facts の success path が完了する | -    |
| 4        | スキル一覧パネルを確認する | **生成したスキルが一覧に反映されている** | -    |

**検証ポイント**: `fetchSkills()` と `selectSkillByName()` が current flow で呼ばれること。

#### シナリオ2: terminal_handoff（AC-2検証）

| ステップ | 操作                          | 期待結果                                             | 結果 |
| -------- | ----------------------------- | ---------------------------------------------------- | ---- |
| 1        | terminal_handoff を発生させる | handoff guidance が表示される                        | -    |
| 2        | 生成後の一覧更新を確認する    | `fetchSkills()` / `selectSkillByName()` は呼ばれない | -    |

**検証ポイント**: terminal_handoff が early return し、current facts が保たれること。

#### シナリオ3: skillPath=null 時のエラー表示（AC-3, AC-4検証）

| ステップ | 操作                                                      | 期待結果                                       | 結果 |
| -------- | --------------------------------------------------------- | ---------------------------------------------- | ---- |
| 1        | `skillPath=null` を模したケースで CompleteStep を表示する | エラーメッセージが表示される                   | -    |
| 2        | エラーメッセージの内容を確認する                          | スキル生成に失敗した旨のメッセージが表示される | -    |
| 3        | retry UI が表示されるか確認する                           | retry 導線が表示される                         | -    |
| 4        | 成功ヘッダーを確認する                                    | **成功ヘッダーが表示されない**                 | -    |

**検証ポイント**: `skillPath === null` のみが error UI へ入ること。

#### シナリオ4: skillPath正常値時の成功画面（AC-5検証）

| ステップ | 操作                                          | 期待結果                                       | 結果 |
| -------- | --------------------------------------------- | ---------------------------------------------- | ---- |
| 1        | 正常な `skillPath` で CompleteStep を表示する | `skillPath` に有効な値が設定される             | -    |
| 2        | CompleteStep の成功ヘッダーを確認する         | **「スキルの骨格を生成しました」が表示される** | -    |
| 3        | スキルパスの表示を確認する                    | 生成されたスキルのパスが表示される             | -    |
| 4        | エラーメッセージが表示されないことを確認する  | エラーUI要素が非表示である                     | -    |

**検証ポイント**: `skillPath !== null` の場合にのみ成功 UI が表示されること。

### Task 3: 発見事項の分類

| 分類    | 定義                                      | 対応方針                            |
| ------- | ----------------------------------------- | ----------------------------------- |
| Blocker | Phase 12 に進めない致命的問題             | Phase 10 に差し戻し、修正後に再実行 |
| Note    | 改善余地があるが現Phase内で対処不要な問題 | `discovered-issues.md` に記録       |
| Info    | 参考情報・将来検討事項                    | `discovered-issues.md` に記録       |

### Task 4: スクリーンショット方針

- docs-only のため、スクリーンショットは CAPTURE_BLOCKED / N/A で記録可能
- 既存テストの PASS を代替 evidence として使用する
- follow-up で UI を変える場合のみ screenshot plan を再開する

---

## 必須成果物テーブル

| 成果物                        | パス                                             | 用途                                |
| ----------------------------- | ------------------------------------------------ | ----------------------------------- |
| manual-test-checklist.md      | `outputs/phase-11/manual-test-checklist.md`      | 手動確認項目の記録                  |
| manual-test-result.md         | `outputs/phase-11/manual-test-result.md`         | walkthrough結果（シナリオ別判定）   |
| manual-test-report.md         | `outputs/phase-11/manual-test-report.md`         | 実施概要と所見                      |
| discovered-issues.md          | `outputs/phase-11/discovered-issues.md`          | Blocker/Note/Info分類の発見事項     |
| screenshot-plan.json          | `outputs/phase-11/screenshot-plan.json`          | validator 互換の補助成果物          |
| phase11-capture-metadata.json | `outputs/phase-11/phase11-capture-metadata.json` | capture 実行時の evidence inventory |

---

## 参照資料テーブル

| 資料名                | パス                                                                                               | 用途                             |
| --------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 1 要件定義      | `phase-1-requirements.md`                                                                          | 受入条件AC-1〜AC-5の定義         |
| Phase 2 設計          | `phase-2-design.md`                                                                                | current contract・follow-up 分離 |
| Phase 10 最終レビュー | `phase-10-final-review.md`                                                                         | 最終レビュー結果・是正計画       |
| current facts         | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | LLM / terminal_handoff 確認      |
| current facts         | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                               | null guard / success header 確認 |
| 既存テスト            | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | evidence                         |
| 既存テスト            | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`                | evidence                         |

---

## 統合テスト連携

| 確認項目                                                | 観点                  | AC対応 |
| ------------------------------------------------------- | --------------------- | ------ |
| LLMモード executePlan → fetchSkills / selectSkillByName | Renderer → Store 接続 | AC-1   |
| terminal_handoff → early return                         | Renderer → Store 接続 | AC-2   |
| `skillPath=null` → CompleteStep エラー表示              | Props → UI表示 連携   | AC-3   |
| `skillPath=null` → 成功ヘッダー非表示                   | Props → UI条件分岐    | AC-4   |
| `skillPath` 正常値 → 成功画面表示                       | Props → UI表示 連携   | AC-5   |

---

## 成果物

`outputs/phase-11/` 配下の各ファイル:

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-report.md`
- `outputs/phase-11/discovered-issues.md`
- `outputs/phase-11/screenshot-plan.json`
- `outputs/phase-11/phase11-capture-metadata.json`
- `outputs/phase-11/screenshots/` (CAPTURE_BLOCKED時は空ディレクトリ + metadata 記録)
- `outputs/phase-11/screenshots/non-visual-placeholder.png` (validator 互換用 placeholder)

---

## 完了条件チェックリスト

- [ ] Task 1: 環境チェックが完了し、起動状態が記録されている
- [ ] Task 2: シナリオ1〜4の全手動テストが実行され、結果が記録されている
- [ ] Task 2: AC-1〜AC-5 の全項目が検証されている
- [ ] Task 3: 発見事項がBlocker/Note/Infoに分類されている
- [ ] Task 4: screenshot plan が N/A / CAPTURE_BLOCKED として整理されている
- [ ] 必須成果物テーブルの全ファイルが `outputs/phase-11/` に出力されている
- [ ] validator 互換の補助成果物（`manual-test-checklist.md` / `screenshot-plan.json` / placeholder PNG）が存在する
- [ ] Blockerが0件であること（0件でない場合はPhase 10に差し戻し）
- [ ] docs-only の evidence と current facts が一致している

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスク（Task 1〜Task 4）を100%実行完了
- [ ] Phase内で定義した成果物を全件出力
- [ ] 発見事項と引き継ぎ情報を明記
- [ ] CAPTURE_BLOCKED の場合は代替 evidence（既存テスト結果）を紐付け

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-SW-FIX-FEEDBACK-001
```

---

## Phase実行記録

| 項目         | 記録    |
| ------------ | ------- |
| 実行タスク   | pending |
| 発見事項     | pending |
| 引き継ぎ事項 | pending |

---

## 次Phase

Phase 12: ドキュメント更新
