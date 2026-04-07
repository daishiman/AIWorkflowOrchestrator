# タスク実行仕様書生成ガイド / completed records

> 親仕様書: [task-workflow.md](task-workflow.md)
> 役割: completed records


## 完了タスク

### タスク: TASK-FIX-EXECUTE-PLAN-FF-001（2026-04-01）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-FIX-EXECUTE-PLAN-FF-001 |
| 完了日 | 2026-04-01 |
| ステータス | **完了** |
| タスク種別 | implementation / runtime IPC ack + snapshot relay |
| Phase | Phase 1-13 完了（Phase 13 blocked） |
| 対象 | `apps/desktop/src/preload/skill-creator-api.ts`, `apps/desktop/src/main/ipc/creatorHandlers.ts`, `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`, `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`, `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`, `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`, `packages/shared/src/types/skillCreator.ts` |

#### 成果物

| 成果物 | パス/内容 |
| --- | --- |
| ワークフロー | `docs/30-workflows/fix-step3-seq-execute-plan-nonblocking/` |
| 実装ガイド | `docs/30-workflows/fix-step3-seq-execute-plan-nonblocking/outputs/phase-12/implementation-guide.md` |
| 仕様更新サマリー | `docs/30-workflows/fix-step3-seq-execute-plan-nonblocking/outputs/phase-12/system-spec-update-summary.md` |
| 更新履歴 | `docs/30-workflows/fix-step3-seq-execute-plan-nonblocking/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出 | `docs/30-workflows/fix-step3-seq-execute-plan-nonblocking/outputs/phase-12/unassigned-task-detection.md` |
| スキルフィードバック | `docs/30-workflows/fix-step3-seq-execute-plan-nonblocking/outputs/phase-12/skill-feedback-report.md` |
| 準拠チェック | `docs/30-workflows/fix-step3-seq-execute-plan-nonblocking/outputs/phase-12/phase12-task-spec-compliance-check.md` |

#### 変更理由

- `skill-creator:execute-plan` の public response を `{ accepted: true, planId }` の ack に切り替え、preload の正本契約を `SkillCreatorExecutePlanAck` に寄せる必要があった。
- Renderer consumer は compat path と snapshot relay を同時に受けるため、ack の導入と consumer 差分の吸収を同一 wave で記録する必要があった。

#### 実装要点

- `skillCreatorAPI.executePlan()` は raw ack を `IpcResult<SkillCreatorExecutePlanAck>` へ変換し、`getWorkflowState()` / `onWorkflowStateChanged()` で snapshot relay を受ける。
- `RuntimeSkillCreatorFacade.executeAsync()` は fire-and-forget 実行 API として `skill-creator:execute-plan` から分離した。
- `SkillCreatorExecuteAsyncPhase` は内部 progress hook としてのみ扱い、Renderer public contract には持ち込まない。
- follow-up は `TASK-SKILL-CREATOR-EXECUTE-PLAN-CONSUMER-ALIGNMENT-001` などとして backlog 側に残す。

#### 検証結果

| 項目 | 結果 |
| --- | --- |
| `pnpm exec vitest run --config vitest.config.ts ...` | 10 files / 136 tests PASS |
| `pnpm --filter @repo/desktop exec tsc -p tsconfig.json --noEmit` | PASS |
| `manual-test-result.md` | NON_VISUAL |
| `phase12-task-spec-compliance-check.md` | PASS |

### タスク: UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 Runtime Skill Creator public IPC wiring（2026-03-21完了）

| 項目 | 内容 |
| --- | --- |
| タスクID | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| 完了日 | 2026-03-21 |
| ステータス | **完了** |
| タスク種別 | 実装 + テスト + workflow/doc sync |
| Phase | Phase 1-5 相当実施 / Phase 13 blocked（commit・PRは未実施） |
| 対象 | `apps/desktop/src/preload/channels.ts`, `apps/desktop/src/preload/skill-creator-api.ts`, `apps/desktop/src/main/ipc/creatorHandlers.ts`, `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`, `apps/desktop/src/main/ipc/index.ts`, `packages/shared/src/types/skillCreator.ts` |

#### 成果物

| 成果物 | パス/内容 |
| --- | --- |
| ワークフロー | `docs/30-workflows/completed-tasks/runtime-skill-creator-ipc-wiring/` |
| shared contract | `packages/shared/src/types/skillCreator.ts` |
| runtime helper test | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts` |
| preload runtime test | `apps/desktop/src/preload/__tests__/skill-creator-api.runtime.test.ts` |

#### 変更理由

- `RuntimeSkillCreatorFacade` が存在しても public `skill-creator:*` surface に接続されておらず、`creator:*` dead-end が残っていたため。
- preload/main 間の runtime contract が shared に存在せず、今後の IPC drift を誘発するため。

#### 実装要点

- public channel を `skill-creator:plan`, `skill-creator:execute-plan`, `skill-creator:improve-skill` の3本で追加した。
- `creatorHandlers.ts` は unregistered handler 群から internal runtime helper へ再構成し、`skillCreatorHandlers.ts` entrypoint から登録する形へ整理した。
- `RuntimeSkillCreatorFacade` の plan/improve 結果と `TerminalHandoffBundle` を `packages/shared/src/types/skillCreator.ts` に集約した。
- `getSkillExecutorInstance()` を `skillHandlers.ts` から export し、`ipc/index.ts` で `RuntimeSkillCreatorFacade` を DI するようにした。
- runtime service 不在時も channel missing にせず、graceful degradation で一定エラーを返す契約にした。

#### 検証結果

| 項目 | 結果 |
| --- | --- |
| `pnpm exec tsc -p apps/desktop/tsconfig.json --noEmit` | PASS |
| `verify-all-specs --workflow docs/30-workflows/completed-tasks/runtime-skill-creator-ipc-wiring` | PASS（errors=0） |
| `pnpm vitest run ...` | 環境要因で未完了（esbuild darwin-arm64 / darwin-x64 mismatch） |

#### 同種課題の簡潔解決手順

1. 先に public channel 名を確定し、main/preload 両方へ同時反映する。
2. public IPC の戻り値型は shared contract に寄せ、preload/main のローカル重複を減らす。
3. unregistered helper を増やさず、既存 entrypoint (`skillCreatorHandlers.ts`) から登録する。
4. DI 不在時は channel 不在ではなく graceful degradation で失敗契約を固定する。

### タスク: UT-TASK06-007 IPC契約ドリフト自動検出スクリプト（2026-03-18完了）

| 項目       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| タスクID   | UT-TASK06-007                                                        |
| 完了日     | 2026-03-18                                                           |
| ステータス | **完了**                                                             |
| タスク種別 | 実装 + テスト + Phase 9 診断ツール + 仕様同期                        |
| Phase      | Phase 1-12 完了 / Phase 13 blocked（commit・PRは未実施）             |
| 対象       | `apps/desktop/scripts/check-ipc-contracts.ts` / `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` |

#### 成果物

| 成果物         | パス/内容                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| ワークフロー   | `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/`                           |
| 実装スクリプト | `apps/desktop/scripts/check-ipc-contracts.ts`                                                                |
| テスト         | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`                                                |
| 仕様更新サマリー | `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/outputs/phase-12/system-spec-update-summary.md` |
| 更新履歴       | `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出   | `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/outputs/phase-12/unassigned-task-detection.md` |

#### 変更理由

- Main / Preload の IPC 契約ドリフトを機械検出し、Phase 9 品質ゲートで回帰を早期発見するため。
- R-01 〜 R-04 で `main-only` / `preload-only` / 引数形式不一致 / 文字列直書きを診断するため。
- 既存の実装実態は `scripts/lib/ipc-drift/` 分割案ではなく単一スクリプト `check-ipc-contracts.ts` なので、ledger もそれに合わせて正規化するため。

#### 実装要点

- `HandlerEntry` / `PreloadEntry` / `DriftEntry` / `OrphanEntry` / `DriftReport` を定義した。
- 検出ルールは `R-01` 〜 `R-04` の 4 本で、Phase 9 の診断ツールとして動作する。
- CLI オプションは `--report-only`, `--strict`, `--format json` を提供する。
- `quality-requirements.md`, `ipc-contract-checklist.md`, `architecture-implementation-patterns-reference-ipc-drift-detection.md`, `quick-reference.md`, `resource-map.md` へ必要仕様を同期した。
- 2026-03-19 再監査で generic/multiline preload 抽出、複数 const object 収集、representative screenshot audit を docs と台帳へ追補した。
- 将来拡張の未タスクは `UT-TASK06-007-EXT-001` 〜 `EXT-005` として別管理する。
- 2026-03-21 に `UT-TASK06-007-EXT-006` を完了済み拡張として追加し、direct helper tests 20件を反映した。

#### 2026-03-21 追補: UT-TASK06-007-EXT-006 テスト拡充完了

| 項目 | 内容 |
| --- | --- |
| タスクID | UT-TASK06-007-EXT-006 |
| ステータス | **完了（Phase 1-12 completed / Phase 13 blocked）** |
| ワークフロー | `docs/30-workflows/UT-TASK06-007-EXT-006-new-function-test-expansion/` |
| 対象 | `normalizeTypeAnnotation` / `isPrimitiveTypeAnnotation` / `mergeChannelMaps` / `CHANNEL_OBJECT_PATTERN` / `PRELOAD_CALL_START_PATTERN` |
| 追加成果 | direct unit tests 20件、総テスト69件、Line 95.79% / Branch 91.55% / Function 100% |
| Phase 12 追補 | `outputs/phase-12/implementation-guide.md`, `outputs/phase-12/system-spec-update-summary.md`, `outputs/phase-12/documentation-changelog.md` |
| 残未タスク | EXT-001〜EXT-005 のみ継続 |

#### Phase 12 再監査結果（2026-03-19）

| 項目 | 結果 |
| --- | --- |
| `validate-phase12-implementation-guide` | PASS（10/10） |
| `validate-phase-output` | Phase 11 PASS / Phase 12 PASS |
| `validate-phase11-screenshot-coverage` | PASS（5/5） |
| `verify-all-specs --workflow ... --json` | PASS |
| `verify-unassigned-links` | PASS（ALL_LINKS_EXIST） |
| `quick_validate` | aiworkflow / task-specification-creator / skill-creator すべて PASS |

#### 苦戦箇所と解決策

| 苦戦箇所 | 問題 | 解決策 |
| --- | --- | --- |
| preload 抽出の想定不足 | `safeInvoke<T>` / `safeOn<T>` や複数行呼び出しが旧 regex では拾えなかった | generic と multiline を許容する抽出パターンへ拡張し、回帰テストを追加した |
| system spec の過大主張 | P45 相当まで「完全検出済み」と読める記述が残っていた | 実装済み能力と residual scope を分離し、EXT-002 / EXT-005 へ役割を戻した |
| docs-heavy 画面検証の取りこぼし | user 要求があるのに `NON_VISUAL` 前提の記述が残っていた | representative screenshot audit を current workflow 配下へ追加し、template と手順を両方更新した |
| follow-up 指示書の stale | `EXT-002` 再定義後も旧スコープ説明や placeholder が残っていた | `docs/30-workflows/unassigned-task/` の5件を再監査し、残余スコープと実行手順を current facts に合わせた |

#### 同種課題の簡潔解決手順

1. まず code の実測値を取り、docs の数値や主張を後追いで直す。
2. `implementation-guide` / `documentation-changelog` / `phase12-task-spec-compliance-check` を planned wording ではなく実績ベースへそろえる。
3. `.claude` 正本更新後に index 再生成、validator、mirror parity を同じターンで閉じる。
4. follow-up は「配置済み」だけで終わらせず、current scope と実行手順まで再監査する。

#### 派生未タスク

| タスクID | 内容 | 参照先 |
| --- | --- | --- |
| UT-TASK06-007-EXT-001 | タプル配列経由ハンドラ抽出パターン拡張 | `docs/30-workflows/unassigned-task/ut-task06-007-ext-001-tuple-array-handler-extraction.md` |
| UT-TASK06-007-EXT-002 | エイリアス / 再export / 動的定数のチャンネル解決強化 | `docs/30-workflows/unassigned-task/ut-task06-007-ext-002-multi-channel-const-resolution.md` |
| UT-TASK06-007-EXT-003 | ipcMain.on パターン検証強化 | `docs/30-workflows/unassigned-task/ut-task06-007-ext-003-ipc-on-pattern-enhancement.md` |
| UT-TASK06-007-EXT-004 | check-ipc-contracts.ts モジュール分割 | `docs/30-workflows/unassigned-task/ut-task06-007-ext-004-script-modular-split.md` |
| UT-TASK06-007-EXT-005 | R-02 セマンティクスチェック精度向上 | `docs/30-workflows/unassigned-task/ut-task06-007-ext-005-r02-semantic-precision.md` |

### タスク: UT-FIX-SKILL-EXECUTE-INTERFACE-001 skill:execute IPCハンドラ・Preload契約整合（2026-02-25完了）

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| タスクID   | UT-FIX-SKILL-EXECUTE-INTERFACE-001                             |
| 完了日     | 2026-02-25                                                     |
| ステータス | **完了**                                                       |
| タスク種別 | 実装 + テスト + 仕様同期                                       |
| Phase      | Phase 1-12 完了（Phase 13 未実施）                             |
| コード変更 | `apps/desktop/src/main/ipc/skillHandlers.ts` + テスト3ファイル |

#### 成果物

| 成果物                | パス/内容                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 実行ワークフロー      | `docs/30-workflows/ut-fix-skill-execute-interface-001/`                                                           |
| Phase 12 実装ガイド   | `docs/30-workflows/ut-fix-skill-execute-interface-001/outputs/phase-12/implementation-guide.md`                   |
| Phase 12 更新履歴     | `docs/30-workflows/ut-fix-skill-execute-interface-001/outputs/phase-12/documentation-changelog.md`                |
| Phase 12 未タスク検出 | `docs/30-workflows/ut-fix-skill-execute-interface-001/outputs/phase-12/unassigned-task-detection.md`              |
| 完了タスク指示書      | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-014-ut-fix-skill-execute-interface-001.md` |

#### 変更理由

- `skill:execute` で Main が `skillId`、Preload/shared が `skillName` を扱っており契約ドリフトが残っていたため。
- 正式契約を `SkillExecutionRequest`（`skillName`, `prompt`）に合わせ、既存 `skillId` 経路は後方互換として維持したため。

#### 仕様書別SubAgent分担（今回の同期チーム）

| SubAgent   | 担当仕様書                      | 主担当作業                                            | 依存関係                                   |
| ---------- | ------------------------------- | ----------------------------------------------------- | ------------------------------------------ |
| SubAgent-A | `interfaces-agent-sdk-skill.md` | `skill:execute` 正式契約/後方互換契約の仕様同期       | コード実装差分（Main/Preload）確定後に更新 |
| SubAgent-B | `security-skill-ipc.md`         | sender検証 + `skillName/skillId` 入力検証ルール明文化 | SubAgent-A の契約定義を参照                |
| SubAgent-C | `task-workflow.md`              | 完了記録・検証証跡・未タスク監査結果を台帳化          | SubAgent-A/B の反映完了後に統合            |
| SubAgent-D | `lessons-learned.md`            | 苦戦箇所と簡潔解決手順を再利用可能形式で記録          | SubAgent-C の証跡値を参照                  |

#### Phase 12再確認結果（2026-02-25 再実行）

| 検証項目             | コマンド                                                                                                                                            | 結果                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase仕様書整合      | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/ut-fix-skill-execute-interface-001 --json` | PASS（13/13 Phase, errors=0）              |
| Phase出力構造        | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-fix-skill-execute-interface-001`              | PASS（28項目, error=0, warning=0）         |
| 未タスクリンク       | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                 | PASS（91/91 existing, missing=0）          |
| 未タスク監査（差分） | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                          | currentViolations=0, baselineViolations=75 |

#### 未タスク配置・フォーマット確認（今回関連3件）

| ファイル                                                    | 配置先                               | 判定                                           |
| ----------------------------------------------------------- | ------------------------------------ | ---------------------------------------------- |
| `task-imp-skill-ipc-response-contract-guard-001.md`         | `docs/30-workflows/unassigned-task/` | `--target-file` scoped監査で current=0（準拠） |
| `task-imp-phase12-implementation-guide-quality-gate-001.md` | `docs/30-workflows/unassigned-task/` | `--target-file` scoped監査で current=0（準拠） |
| `task-imp-ipc-preload-spec-sync-ci-guard-001.md`            | `docs/30-workflows/unassigned-task/` | `--target-file` scoped監査で current=0（準拠） |

#### 再確認時の苦戦箇所と解決策

| 苦戦箇所                                           | 原因                             | 解決策                                                               | 再発防止                                              |
| -------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------- |
| `--target-file` 実行時に baseline が大量出力される | 「対象のみが出る」と誤解しやすい | `scope.currentFiles` と `currentViolations.total` を判定の正本に固定 | 監査結果は `current` と `baseline` を分離して記録する |
| `validate-phase-output` 引数誤用                   | `--phase` 形式を想定しやすい     | `validate-phase-output.js <workflow-dir>` の位置引数で統一           | コマンドテンプレートをスキル側に固定化する            |

#### 同種課題の簡潔解決手順（再確認版・4ステップ）

1. `verify-all-specs --workflow` と `validate-phase-output <workflow-dir>` で Phase整合を先に固定する。
2. `audit-unassigned-tasks --diff-from HEAD` で current/baseline を分離し、今回差分の合否を確定する。
3. 関連未タスクは `--target-file` を使い、`currentViolations.total` を基準に個別確認する。
4. 仕様台帳（`task-workflow.md` / `lessons-learned.md`）へ同時追記して完了判定する。

---

### タスク: UT-IPC-DATA-FLOW-TYPE-GAPS-001 バックエンド型定義とUI Props間のデータフロー型ギャップ解消（2026-02-24完了）

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001   |
| 完了日     | 2026-02-24                       |
| ステータス | **完了**                         |
| タスク種別 | 仕様書修正のみ（`spec_created`） |
| Phase      | Phase 1-12 完了                  |
| コード変更 | なし（仕様書修正のみ）           |

#### テスト結果サマリー

| 指標                  | 結果                  |
| --------------------- | --------------------- |
| Phase 6 整合性検証    | 24/24 PASS            |
| Phase 7 網羅性確認    | 49/49 PASS (100%)     |
| Phase 8 品質改善      | 6/6 PASS              |
| Phase 9 品質保証      | 60/60 PASS            |
| Phase 10 最終レビュー | PASS（MINOR 1件付き） |
| Phase 11 手動検証     | 9/9 PASS              |
| 累計検証項目          | 173項目 ALL PASS      |

#### 成果物

| 成果物               | パス/内容                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/`                                            |
| 実装ガイド           | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-12/implementation-guide.md`    |
| 仕様更新サマリー     | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-12/spec-update-summary.md`     |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-12/unassigned-task-report.md`  |
| スキルフィードバック | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-12/skill-feedback-report.md`   |

#### 変更理由

バックエンド型定義（task-9 系仕様書）とフロントエンド UI Props（task-030, task-031b）間に6つの型ギャップが存在し、後続実装者が型不整合に直面するリスクがあった。7つの仕様書ファイルを修正し、IPC境界でのDate型シリアライズ方針統一、DebugSession.status idle追加、onExport引数明確化、ExportResult変換ロジック、safeOn購読パターン、IPC引数オブジェクト形式統一を実施。

#### 苦戦箇所と解決策

| 苦戦ポイント                     | 問題                                                            | 解決策                                                                    |
| -------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Phase 12成果物の不足             | `spec-update-summary.md` 未作成のまま完了扱いになりやすい       | 成果物表と `outputs/phase-12/` 実体を1対1で突合し、不足ファイルは即時作成 |
| `artifacts.json` 二重管理        | `artifacts.json` と `outputs/artifacts.json` が非同期化しやすい | 2ファイルを同一内容へ同期し、completed成果物の実在チェックを実行          |
| 未タスク指示書テンプレートの揺れ | 旧見出し形式（`## 1. メタ情報`）が残り監査で違反化              | Why/What/How必須見出しを含む最新テンプレートへ正規化                      |

#### 同種課題の簡潔解決手順（4ステップ）

1. `phase-12-documentation.md` の成果物一覧と `outputs/phase-12/` 実体を突合する
2. `artifacts.json` と `outputs/artifacts.json` を同時更新し、completed成果物の参照切れをゼロ化する
3. `generate-index.js` 実行結果を `documentation-changelog.md` に記録する
4. 未タスク指示書は `audit-unassigned-tasks.js` 単体監査で必須見出しを確認してから完了扱いにする

---

### タスク: UT-SKILL-IPC-PRELOAD-EXTENSION-001 task-9D-J 30チャネル IPC/Preload 拡張計画の策定（2026-02-25反映）

| 項目       | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| タスクID   | UT-SKILL-IPC-PRELOAD-EXTENSION-001                                                   |
| 完了日     | 2026-02-25                                                                           |
| ステータス | **完了（仕様書作成）**                                                               |
| タスク種別 | 仕様書修正のみ（`spec_created`）                                                     |
| Phase      | Phase 1-12 完了（Phase 13は未実施）                                                  |
| コード変更 | なし（`docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/` のみ） |

#### 成果物

| 成果物               | パス/内容                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/`                                                |
| 要件/設計/品質成果物 | `docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/outputs/phase-1` 〜 `phase-12`                   |
| 検証レポート         | `docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/outputs/verification-report.md`                  |
| 追補監査レポート     | `docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/outputs/phase-12/recheck-multithinking-audit.md` |
| 未タスク指示書       | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-ipc-preload-extension-spec-alignment-001.md`               |

#### 変更理由

- task-9D〜9Jで必要な30チャネル（handle 29 / on 1）の仕様計画を実装前に固定し、P32/P44/P45の契約ドリフトを予防するため。
- 仕様監査で検出した差分（`main/ipc/channels.ts` 記述残存、命名差分、参照切れ）を未タスクとして分離し、後続実装の手戻りを抑制するため。

---

