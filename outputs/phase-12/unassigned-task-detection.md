<<<<<<< Updated upstream

# Phase 12: 未タスク検出レポート - UT-SKILL-WIZARD-W2-seq-03a

||||||| Stash base

# Phase 12: 未タスク検出 - UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001

=======

# 未タスク検出 - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

> > > > > > > Stashed changes

## 検出結果: 未タスクなし

<<<<<<< Updated upstream
| 項目 | 内容 |
| -------- | -------------------------- |
| タスクID | UT-SKILL-WIZARD-W2-seq-03a |
| 作成日 | 2026-04-11 |

---

## 検出結果

未タスク件数: **1件**

| #   | タスクID                                  | タスク名                                                     | 優先度 | 規模   |
| --- | ----------------------------------------- | ------------------------------------------------------------ | ------ | ------ |
| 1   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 | SkillCreateWizard LLM生成フロー describe.skip クリーンアップ | 低     | 小規模 |

### 検出詳細

**UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001**

- **発見箇所**: `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` 行 144（`describe.skip`）
- **発見根拠**: W2-seq-03a で `generationMode` ラジオボタン UI を削除したことにより、旧 TASK-SC-07 の `planSkill`/`executePlan` フローに対する 30 テストが `describe.skip` でスキップ状態になっている。TODO コメントが明示的に本タスクの必要性を記録している。
- **仕様書パス**: `docs/30-workflows/unassigned-task/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001.md`
- **影響**: CI には現時点で影響なし。将来 `describe.skip` が外れた場合に 30 テストが一斉失敗するリスクあり。

## スコープ外として識別した項目

| 項目                                                   | 判断理由                                      |
| ------------------------------------------------------ | --------------------------------------------- | --- | --- | --- | --- | ---------- |
| `wizard/index.ts` の `GenerationMode` エクスポート削除 | W2-seq-03b の担当スコープ                     |
| `W3-seq-04` 計装タスクの実装                           | 別タスク（ready 状態）                        |
|                                                        |                                               |     |     |     |     | Stash base |
| 項目                                                   | 内容                                          |
| --------                                               | --------------------------------------------- | --- | --- | --- | --- | ---------- |
| タスクID                                               | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 作成日                                                 | 2026-04-11                                    |
|                                                        |                                               |     |     |     |     | Stash base |
| 項目                                                   | 内容                                          |
| --------                                               | ----------                                    |
| タスクID                                               | TASK-SC-07                                    |
| 作成日                                                 | 2026-04-09                                    |

---

| 項目     | 内容                                          |
| -------- | --------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 作成日   | 2026-04-11                                    |

---

## 判定結果

- 重大未タスク: 1 件
- 軽微な改善候補: 1 件

---

## 重大未タスク

| 対象        | 内容                                                                                         | 影響度 | 対応方針                                                             |
| ----------- | -------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| root ledger | repo root の `artifacts.json` と `outputs/artifacts.json` が current task に同期されていない | 高     | 次 wave で ledger sync を行い、Phase 12 の parity check を成立させる |

### 影響の整理

- Phase 12 の事前チェックにある parity 条件をそのままは満たせない
- canonical 6 成果物は current task 版に揃えたが、台帳側の正本が旧 task のまま残る
- 以降の close-out で「何が正本か」がぶれやすい

---

## 軽微な改善候補

| 対象                       | 内容                                                                    | 影響度 | 対応方針                                    |
| -------------------------- | ----------------------------------------------------------------------- | ------ | ------------------------------------------- | --- | --- | ---------- |
| UI shared label generation | `CATEGORY_VALUES` が `SkillInfoStep` / `DescribeStep` でまだ 2 箇所ある | 低     | 将来は 1 箇所へ寄せるか、共有順序定数を切る |
|                            |                                                                         |        |                                             |     |     | Stash base |

- 重大未タスク: 0 件
- 軽微な改善候補: 0 件

---

- 重大未タスク: 1 件
- 軽微な改善候補: 1 件

---

## 重大未タスク

| 対象        | 内容                                                                                         | 影響度 | 対応方針                                                             |
| ----------- | -------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| root ledger | repo root の `artifacts.json` と `outputs/artifacts.json` が current task に同期されていない | 高     | 次 wave で ledger sync を行い、Phase 12 の parity check を成立させる |

### 影響の整理

- Phase 12 の事前チェックにある parity 条件をそのままは満たせない
- canonical 6 成果物は current task 版に揃えたが、台帳側の正本が旧 task のまま残る
- 以降の close-out で「何が正本か」がぶれやすい

---

## 軽微な改善候補

| 対象                       | 内容                                                                    | 影響度 | 対応方針                                    |
| -------------------------- | ----------------------------------------------------------------------- | ------ | ------------------------------------------- |
| UI shared label generation | `CATEGORY_VALUES` が `SkillInfoStep` / `DescribeStep` でまだ 2 箇所ある | 低     | 将来は 1 箇所へ寄せるか、共有順序定数を切る |

---

## 確認観点

| 観点                       | 判定 | 根拠                                                                                       |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------ | --- | --- | --- | ---------- |
| shared label mapping       | PASS | `skillCreator.ts` の canonical helper に集約済み                                           |
| Step 0 UI                  | PASS | `SkillInfoStep` が canonical label を直接利用                                              |
| deprecated step            | PASS | `DescribeStep` も canonical label を利用し、`コード支援` drift を解消                      |
| テスト追加                 | PASS | union 固定テストと option 表示テストを追加                                                 |
| ledger parity              | FAIL | root ledger が current task に同期されていない                                             |
|                            |      |                                                                                            |     |     |     | Stash base |
| 観点                       | 判定 | 根拠                                                                                       |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------ |
| LLM 生成ルート             | PASS | `planSkill`、`executePlan(planId, skillSpec)`、`getWorkflowState(planId)` の接続が実装済み |
| テンプレートフローの非破壊 | PASS | `SkillInfoStep` と `ConversationRoundStep` の既存導線が維持されている                      |
| 進捗表示                   | PASS | `generationProgress` が `GenerateStep` に表示される                                        |
| 失敗時の復帰               | PASS | `terminal_handoff` / fail snapshot / blank description がそれぞれエラー処理される          |
| スクリーンショット参照     | PASS | Phase 11 証跡が `outputs/phase-11/screenshots/` に存在する                                 |
| 仕様書整合                 | PASS | `index.md` / `artifacts.json` / `arch-*` / logs が current facts に同期済み                |

---

## 未タスクに含めなかった項目

| 項目                      | 理由                                                                     |
| ------------------------- | ------------------------------------------------------------------------ |
| `DescribeStep.tsx` の削除 | deprecated ではあるが、現時点では互換維持のため残置が妥当                |
| `generationSlice` の分割  | TASK-SC-10 の後続構造変更として切り出すべきため                          |
| `topic-map` の再生成      | 現行の参照索引で current facts を追跡可能なため、今回の blocker ではない |

---

| 観点                 | 判定 | 根拠                                                                  |
| -------------------- | ---- | --------------------------------------------------------------------- |
| shared label mapping | PASS | `skillCreator.ts` の canonical helper に集約済み                      |
| Step 0 UI            | PASS | `SkillInfoStep` が canonical label を直接利用                         |
| deprecated step      | PASS | `DescribeStep` も canonical label を利用し、`コード支援` drift を解消 |
| テスト追加           | PASS | union 固定テストと option 表示テストを追加                            |
| ledger parity        | FAIL | root ledger が current task に同期されていない                        |

---

## 結論

実装を止めるべき未タスクは 1 件だけ残った。  
コードと UI の label drift は解消済みだが、台帳の同期が終わるまで Phase 12 の最終合格は保留とする。
=======
| 検出ソース | 確認内容 | 結果 | 補足 |
| ---------- | -------- | ---- | ---- |
| 元タスク仕様書のスコープ外事項 | バックエンド変更（`ScheduleStore` / `SkillScheduler`） | 対象外 | 本タスクでは変更不要 |
| 元タスク仕様書のスコープ外事項 | IPC チャンネルの変更 | 対象外 | 本タスクでは変更不要 |
| Phase 10 MINOR 指摘事項 | `cron-parser` の挙動差分 | 解決済み | Phase 5 で safe-side の判定に確定 |
| コードコメントの TODO/FIXME | `scheduleConfigValidator.ts` と関連テスト | 該当なし | 未タスク化不要 |
| 将来の拡張候補 | DOM/DOW の説明強化 | 保留 | 現時点では優先度低 |

## 結論

- 新規タスク化が必要な項目はありません
- `validateSkillWizardScheduleConfig` は呼び出し元判断で semantic を有効化する設計のままで問題ありません
- `options.semantic` の自動有効化は、現在の NON_VISUAL 範囲では不要です
  > > > > > > > Stashed changes
