# 完了タスク記録 — 2026-04-14

> 親ファイル: [task-workflow-completed.md](task-workflow-completed.md)

---

### タスク: UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 notion-freetext-special-case-eliminate（2026-04-15）

| 項目       | 値                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------ |
| タスクID   | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001                                          |
| 完了日     | 2026-04-15                                                                                 |
| タスク種別 | implementation（NON_VISUAL / semantic-default special-case elimination）                   |
| 関連Issue  | [#2089](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2089)                  |
| Phase 13   | blocked（ユーザー承認待ち）                                                               |

#### 実施内容

- `packages/shared/src/types/skill-wizard-label-map.ts` に `SemanticLabelEntry` / `SemanticLabelResult` / `resolveLabelEntry()` を追加し、semantic default の変換を shared 側へ集約した
- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` から `notion` 専用のハードコード特別ケースを削除した
- `resolveLabelEntry()` のフォールバックで raw 値の表記を保持するように修正し、`Jira` / `Markdown` / `JSON` の原表記が壊れないようにした
- `packages/shared/src/types/__tests__/skill-wizard-label-map.test.ts` を拡張し、`notion` / `Jira` / `Markdown` の回帰を固定した
- `outputs/phase-11/manual-test-result.md` と `outputs/phase-12/*.md` を current facts に合わせて作成・更新した

#### Phase 11/12 成果物

| 成果物                                  | パス                                                                 |
| --------------------------------------- | -------------------------------------------------------------------- |
| 手動テスト結果                          | `outputs/phase-11/manual-test-result.md`                             |
| 手動テストレポート                      | `outputs/phase-11/manual-test-report.md`                             |
| 実装ガイド                              | `outputs/phase-12/implementation-guide.md`                           |
| システム仕様更新サマリー                | `outputs/phase-12/system-spec-update-summary.md`                     |
| ドキュメント更新履歴                    | `outputs/phase-12/documentation-changelog.md`                        |
| 未タスク検出レポート                    | `outputs/phase-12/unassigned-task-detection.md`                     |
| スキルフィードバックレポート            | `outputs/phase-12/skill-feedback-report.md`                         |
| Phase 12 準拠チェック                   | `outputs/phase-12/phase12-task-spec-compliance-check.md`            |

#### 検証証跡

- `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-wizard-label-map.test.ts`: PASS（16 tests）
- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx --maxWorkers 1`: PASS（93 tests）
- `pnpm --filter @repo/shared typecheck`: PASS
- `pnpm --filter @repo/desktop typecheck`: PASS
- `pnpm --filter @repo/shared build`: PASS
- `pnpm --filter @repo/desktop build`: PASS
- `grep -n "normalizedKey.*notion\\|notion.*その他\\|特別ケース" apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`: 出力なし

#### 苦戦箇所

- raw 値を正規化した後の fallback で小文字化してしまうと、`Jira` / `Markdown` / `JSON` の元表記が壊れる
- `resolveLabelEntry()` を shared に寄せたあとも、renderer 側の special case を残してしまうと source of truth が二重化する

#### lessons-learned

- `SemanticLabelEntry` のような union で「表示ラベル + 補足情報」を同時に持たせると、special case を shared に閉じやすい
- raw 値の fallback は原表記を優先し、正規化は lookup のためだけに使う
- 互換 wrapper を残すと、既存契約を壊さずに内部実装だけを改善できる

### タスク: TASK-SW-FIX-STATE-DETAIL-001 GenerateStep template cancel / answers reset / generationLockRef release（2026-04-14）

| 項目       | 値                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------ |
| タスクID   | TASK-SW-FIX-STATE-DETAIL-001                                                               |
| 完了日     | 2026-04-14                                                                                 |
| タスク種別 | implementation（VISUAL / state-detail recovery）                                           |
| 関連Issue  | -                                                                                          |
| Phase 13   | blocked（ユーザー承認待ち）                                                               |

#### 実施内容

- `SkillCreateWizard.tsx` の `catch` に stale guard を追加し、キャンセル後の遅延 reject が error を再表示しないようにした
- `SkillCreateWizard.tsx` の `finally` で `generationLockRef` を必ず解放するようにした
- `GenerateStep.tsx` に template mode recovery を接続し、`最初からやり直す` を template error 専用導線として固定した
- `ConversationRoundStep.tsx` で `answers` prop 変更時に `internalAnswers` を再初期化し、Step 1 の local state を親 state に再同期した
- `outputs/phase-11/` に screenshot bundle と metadata を保存し、template error cancel / step0 return / normal error no cancel の 3 状態を visual evidence として閉じた
- `outputs/phase-12/` の implementation guide / system-spec / changelog / unassigned-task / skill-feedback / compliance を current facts に同期した

#### Phase 11/12 成果物

| 成果物                                    | パス                                                              |
| ----------------------------------------- | ----------------------------------------------------------------- |
| スクリーンショット計画                    | `outputs/phase-11/screenshot-plan.json`                           |
| キャプチャメタデータ                      | `outputs/phase-11/phase11-capture-metadata.json`                  |
| 画面証跡 1                               | `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-03-template-error-cancel.png` |
| 画面証跡 2                               | `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-04-template-error-step0.png` |
| 画面証跡 3                               | `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-05-normal-error-no-cancel.png` |
| 手動テスト結果                            | `outputs/phase-11/manual-test-result.md`                          |
| 手動テストレポート                        | `outputs/phase-11/manual-test-report.md`                          |
| 発見事項記録                              | `outputs/phase-11/discovered-issues.md`                           |
| UI サニティレビュー                       | `outputs/phase-11/ui-sanity-visual-review.md`                     |
| スクリーンショットカバレッジ              | `outputs/phase-11/screenshot-coverage.md`                         |
| 実装ガイド                                | `outputs/phase-12/implementation-guide.md`                        |
| システム仕様書更新サマリー                | `outputs/phase-12/system-spec-update-summary.md`                  |
| 変更履歴                                  | `outputs/phase-12/documentation-changelog.md`                     |
| 未タスク検出レポート                      | `outputs/phase-12/unassigned-task-detection.md`                   |
| スキルフィードバックレポート              | `outputs/phase-12/skill-feedback-report.md`                       |
| Phase 12 準拠チェック（root evidence）    | `outputs/phase-12/phase12-task-spec-compliance-check.md`         |

#### 検証証跡

- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx --maxWorkers 1`: PASS（172 tests）
- `node apps/desktop/scripts/capture-task-sw-fix-state-detail-phase11.mjs`: PASS
- `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-03-template-error-cancel.png`: PASS
- `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-04-template-error-step0.png`: PASS
- `outputs/phase-11/screenshots/TC-SW-FIX-STATE-DETAIL-11-05-normal-error-no-cancel.png`: PASS
- `outputs/phase-12/phase12-task-spec-compliance-check.md`: PASS
- `artifacts.json` / `outputs/artifacts.json`: parity PASS

#### 苦戦箇所

| #   | 苦戦箇所                                               | 解決策                                                                 |
| --- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| 1   | キャンセル後の遅延 reject が error 表示を復活させる    | `catch` 側に stale guard を入れ、`finally` で lock 解除を確実にした     |
| 2   | template 失敗時の復帰導線が曖昧になりやすい            | `mode="template"` のときだけ `最初からやり直す` を出すように固定した   |
| 3   | `answers` の local state が親 state とずれる            | `ConversationRoundStep` で prop 変更時に `internalAnswers` を再初期化した |

#### lessons-learned

- 生成キャンセル後の UI は「エラーを消す」だけでなく「古い結果を再表示しない」ことまで含めて設計する
- template recovery は通常 error と分け、`retry` と `start over` の意味を UI で明確に分離する
- Step 1 の local state は親 state の再同期点を持たせると、再開・戻る・再生成の 3 経路で破綻しにくい
