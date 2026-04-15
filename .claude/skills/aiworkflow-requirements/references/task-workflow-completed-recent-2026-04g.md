# 完了タスク記録 — 2026-04-15

> 親ファイル: [task-workflow-completed.md](task-workflow-completed.md)

---

### タスク: TASK-SC-IMP-CREATE-WORKFLOW-001 createモード構造計画生成（2026-04-15）

| 項目       | 値                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------- |
| タスクID   | TASK-SC-IMP-CREATE-WORKFLOW-001                                                             |
| 完了日     | 2026-04-15                                                                                  |
| タスク種別 | implementation（NON_VISUAL / skill-creator workflow）                                      |
| 関連Issue  | -                                                                                           |
| Phase 13   | blocked（ユーザー承認待ち）                                                                |

#### 実施内容

- `SkillCreatorService.ts` の `runCreateWorkflow` を `Promise<StructurePlanJson | null>` に変更し、`extract-purpose` / `plan-structure` を読み込んで構造計画を組み立てるようにした
- `createSkill()` では `structurePlan` を local variable として受け取り、hidden property を使わない handoff に整理した
- `SkillCreatorService.test.ts` の `TC-04` を更新し、`runCreateWorkflow` の戻り値に `description` が入ることを直接検証するようにした
- `outputs/phase-12/` の 6 成果物を current facts として固定し、`outputs/artifacts.json` を追加して root と parity を揃えた

#### Phase 11/12 成果物

| 成果物                         | パス                                                              |
| ------------------------------ | ----------------------------------------------------------------- |
| 手動テスト結果                 | `outputs/phase-11/manual-test-result.md`                          |
| 手動テストチェックリスト       | `outputs/phase-11/manual-test-checklist.md`                       |
| 実装ガイド                     | `outputs/phase-12/implementation-guide.md`                        |
| システム仕様書更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`                  |
| 変更履歴                       | `outputs/phase-12/documentation-changelog.md`                     |
| 未タスク検出レポート           | `outputs/phase-12/unassigned-task-detection.md`                   |
| スキルフィードバックレポート   | `outputs/phase-12/skill-feedback-report.md`                       |
| Phase 12 準拠チェック          | `outputs/phase-12/phase12-task-spec-compliance-check.md`         |
| parity copy                    | `outputs/artifacts.json`                                          |

#### 検証証跡

- `pnpm --filter @repo/desktop exec vitest run apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`: PASS（63 tests）
- `outputs/phase-11/manual-test-result.md`: PASS（UI/UX変更なしのため screenshot N/A）
- `outputs/phase-12/phase12-task-spec-compliance-check.md`: PASS
- `artifacts.json` / `outputs/artifacts.json`: parity PASS

#### 苦戦箇所

| # | 苦戦箇所 | 解決策 |
| --- | --- | --- |
| 1 | `description` の edge case が型契約と衝突しやすい | 型上必須の `string` として整理し、`undefined` は入力破損として切り分けた |
| 2 | 接続待ちと完了を同じ文脈で書くと誤読されやすい | `generate_skill_md.js` 接続はタスクA、構造計画生成は本タスクと分離した |

#### lessons-learned

- Phase 12 は「できたこと」と「依存待ち」を同じファイルで混ぜずに書くとレビューしやすい
- `runCreateWorkflow` の観測可能性は、private method を直接検証すると高まる
- screenshot N/A は UI 変更なしのときだけでなく、根拠を `manual-test-result.md` に固定しておくと運用しやすい

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

---

### タスク: TASK-SC-FIX-GENERATE-SKILL-MD-001 generate_skill_md.js 引数ミスマッチ修正（2026-04-15）

| 項目       | 値                                                                    |
| ---------- | --------------------------------------------------------------------- |
| タスクID   | TASK-SC-FIX-GENERATE-SKILL-MD-001                                     |
| 完了日     | 2026-04-15                                                            |
| タスク種別 | bugfix（SkillCreatorService / script-argument-fix）                   |
| 関連Issue  | -                                                                     |
| Phase 13   | skipped（PR禁止）                                                     |

#### 実施内容

- `SkillCreatorService.ts` の `generate_skill_md.js` 呼び出し引数を `["--path", skillDir]` から `["--plan", tmpPlanPath, "--output", skillMdPath]` へ修正
- `os.tmpdir()` 配下に `skill-plan-{UUID}.json` として plan オブジェクトを一時書き込み、スクリプト完了後に `finally` でクリーンアップ
- plan オブジェクト構造（`skillName`, `workflow.summary/anchors/trigger/phases/tasks`, `directories`, `files`）を正しく組み立てる実装を追加
- フォールバック: `generate_skill_md.js` 失敗または出力ファイル不在の場合は `ensureSkillMdExists` を呼び出す

#### 検証証跡

- TC-01〜TC-07（generate_skill_md.js 引数検証テスト）: PASS
- BV-001〜BV-008（境界値・セキュリティテスト）: PASS
- SC-001〜SC-031（SkillCreatorService 統合テスト）: PASS

#### 苦戦箇所

| #   | 苦戦箇所                                                     | 解決策                                                                           |
| --- | ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| 1   | スクリプトが `--path <dir>` を期待していると思い込んでいた   | `generate_skill_md.js` の実際の仕様（`--plan <json> --output <path>`）を確認して修正 |
| 2   | plan オブジェクトをコマンドライン引数でどう渡すか            | コマンドライン引数の制限を避けるため temp JSON ファイル経由で渡すパターンを採用  |
| 3   | temp ファイルのクリーンアップタイミング                      | `finally` ブロック + `.catch(() => {})` で non-fatal として処理                  |

#### lessons-learned

- スクリプトの引数仕様は呼び出し側ではなくスクリプト本体のソースを確認してから実装する
- 外部スクリプトへ JSON データを渡す場合は temp ファイル経由が安全（引数文字数制限を回避）
- temp ファイルのクリーンアップは `finally` + `.catch(() => {})` パターンで常に non-fatal に扱う
