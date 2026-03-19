# Lessons Learned（教訓集） / skill domain lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: skill domain lessons

## TASK-FIX-SKILL-IMPORT 3連続是正（2026-03-04）

### 苦戦箇所: `skill:getImported` の保存キー互換（id/name）を前提にしていなかった

| 項目       | 内容                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------- |
| 課題       | 旧保存データが `skill.name` キーの場合、`cache.get(id)` 前提の復元ロジックだと imported 状態を失う  |
| 再発条件   | 保存形式を `id` へ移行した後に、過去ストレージ互換を仕様へ反映しない場合                            |
| 対処       | `SkillService.getImportedSkills()` で `id` 解決を優先し、未一致時は `name` フォールバック探索を追加 |
| 標準ルール | 永続データのキー移行時は「新形式優先 + 旧形式フォールバック」を明文化する                           |

### 苦戦箇所: `skill:import` 成功判定を `importedCount` に依存していた

| 項目       | 内容                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| 課題       | 既にインポート済みの正常系で `importedCount=0` となり、失敗扱いされる契約ドリフトが発生した                      |
| 再発条件   | idempotent 操作で「新規件数」を成功条件に使う場合                                                                |
| 対処       | Main IPC の成功判定を `result.success && result.errors.length===0` へ統一し、既存ケースも `ImportedSkill` を返却 |
| 標準ルール | 冪等操作の成功判定は「エラーなし」を基準にし、件数は監視値として扱う                                             |

### 苦戦箇所: SkillCenter で欠損メタデータを想定していなかった

| 項目       | 内容                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `description.toLowerCase()` や `agents.length` などが nullish データで例外を起こし、画面が不安定化した                      |
| 再発条件   | 外部生成データ/旧データを UI 入力に含むのに、nullish 防御を入れない場合                                                     |
| 対処       | `String(value ?? "")` / `Array.isArray(value)` の防御関数を Hook+Component 両方へ適用し、TC-01〜04 スクリーンショットで確認 |
| 標準ルール | UIは「文字列正規化」「配列正規化」を境界で必ず実施する                                                                      |

### 同種課題の簡潔解決手順（5ステップ）

1. 契約を IPC/型/状態/UI の4層に分離し、各層で成功条件を明文化する。
2. 永続データ互換は `current` 形式だけでなく `legacy` 形式の復元経路を先に実装する。
3. 冪等APIは「件数」ではなく「エラーなし」を成功判定に固定する。
4. UIは nullish 入力を前提に `String`/`Array` 正規化関数を共通化する。
5. `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` / `audit(current)` を同一ターンで記録する。

### Phase 12再確認追補（2026-03-04）

### 苦戦箇所: 3workflow 同時再監査で証跡転記がドリフトしやすい

| 項目       | 内容                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| 課題       | `verify-all-specs` / `validate-phase-output` を workflow ごとに個別転記すると、件数・実行時刻・判定が台帳間でずれやすい |
| 再発条件   | 複数workflowの再監査結果を別ターンで `task-workflow` と `lessons` に反映する場合                                        |
| 対処       | 3workflow を同一ターンで再実行し、`13/13` と `28項目` をバンドル値として固定してから台帳へ同期                          |
| 標準ルール | 複数workflow再監査は「実行 → 集約表作成 → 台帳/教訓同時転記」の順で完了させる                                           |

### 苦戦箇所: `audit-unassigned-tasks --target-file` の判定軸を誤読しやすい

| 項目       | 内容                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| 課題       | 出力に baseline 情報が含まれるため、対象ファイルが失敗したように誤解しやすい                               |
| 再発条件   | `target-file` 実行結果を `current` と `baseline` に分けずに読む場合                                        |
| 対処       | `scope.currentFiles` が対象ファイルと一致することを先に確認し、合否は `currentViolations=0` のみで判定     |
| 標準ルール | 未タスク個別監査は `scope.currentFiles` / `currentViolations` / `baselineViolations` を3点セットで記録する |

### 苦戦箇所: UI再撮影の前に preview preflight を固定していなかった

| 項目       | 内容                                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `capture-skill-center-phase11.mjs` 実行時に `ERR_CONNECTION_REFUSED` が発生し、`Rollup failed to resolve import "@repo/shared/types/skill"` で再撮影が停止した |
| 再発条件   | `pnpm --filter @repo/desktop preview` の build成否と `127.0.0.1:4173` 疎通確認を省略して撮影を開始する場合                                                     |
| 対処       | TC-01〜TC-04 証跡を 2026-03-04 16:50 JST に再取得して視覚検証を継続し、運用ギャップは `UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001` で管理後に完了移管した     |
| 標準ルール | UI再撮影は「preview preflight（build + 疎通）→再撮影→TCカバレッジ→台帳同期」の4段を必須化する                                                                  |

### 同種課題向け簡潔解決手順（5ステップ）

1. `verify-all-specs --workflow` と `validate-phase-output` を対象workflow分まとめて実行する。
2. `validate-phase11-screenshot-coverage`（UI workflow）と `verify-unassigned-links` を同ターンで実行する。
3. `audit-unassigned-tasks --diff-from HEAD` で全体合否を `currentViolations=0` で確定する。
4. UI再撮影前に `preview` preflight（build成功 + `127.0.0.1:4173` 疎通）を実行し、失敗時は未タスク化する。
5. `audit-unassigned-tasks --target-file` は `scope.currentFiles` 一致を確認してから記録し、`task-workflow.md` と同時反映する。

### 関連未タスク（2026-03-04 追補）

| タスクID                                              | 概要                                                                                                                   | 参照                                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| UT-IMP-SKILL-CENTER-HOTFIX-COVERAGE-INCLUDE-GUARD-001 | SkillCenter hotfix 対象カバレッジの include path ガード（実在パス検証 + `3 files / 30 tests` 固定）                    | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-skill-center-hotfix-coverage-include-guard-001.md`               |
| UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001            | 3workflow再監査のSubAgent成果物突合を固定し、仕様書別実行ログの欠落を防ぐ（完了: 2026-03-04）                          | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-subagent-artifact-guard-001.md`          |
| UT-IMP-PHASE12-SYSTEM-SPEC-EXTRACTION-GUARD-001       | `aiworkflow-requirements` からの必要仕様抽出と台帳同期を同一ターンで固定する（完了: 2026-03-04）                       | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-system-spec-extraction-guard-001.md`     |
| UT-IMP-PHASE12-THREE-WORKFLOW-AUDIT-SCOPE-GUARD-001   | 3workflow再監査で `scope.currentFiles` / `currentViolations` / `baselineViolations` を分離記録する（完了: 2026-03-04） | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-three-workflow-audit-scope-guard-001.md` |
| UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001           | SkillCenter 再撮影前の preview preflight と失敗時未タスク化を標準化する（完了: 2026-03-04）                            | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-center-preview-build-guard-001.md`         |

### 苦戦箇所: 削除リクエスト状態と確認ダイアログ描画が分離し、削除が実行されなかった

| 項目       | 内容                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `handleRequestDelete` で状態は更新されるのに、確認ダイアログ未描画のため `handleConfirmDelete` が呼ばれず削除できなかった |
| 再発条件   | 「削除要求状態（isDeleteConfirmOpen）」を持つ Hook と、実際の確認UI描画コンポーネントが別責務なのに結線確認を省略した場合 |
| 対処       | `SkillCenterView/index.tsx` に削除確認ダイアログを追加し、`confirm/cancel/Escape` を `useSkillCenter` アクションへ接続    |
| 標準ルール | 「request 系 state を持つなら、対応する confirm UI と confirm action 呼び出しテストを必須化」する                         |

### 同種課題向け簡潔解決手順（5ステップ）

1. 不具合を UI層/Hook層/Store層で分解し、「どの層まで呼ばれているか」をログ/テストで切り分ける。
2. request state（例: `isDeleteConfirmOpen`）を持つHookは、対応する描画UIの存在を先に確認する。
3. confirm action（例: `handleConfirmDelete`）が呼ばれる経路をテストで固定する。
4. 既存回帰（関連ビュー + hook）を再実行し、導線追加での退行を確認する。
5. 対象範囲カバレッジを再計測し、80%以上を維持できていることを記録する。

### 苦戦箇所: 対象カバレッジの include path を誤指定すると実測値が歪む

| 項目       | 内容                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | カバレッジ再計測で `--coverage.include` の対象パスを誤ると、想定3ファイルのうち一部しか計測されず、回帰判断が不安定になった                                                         |
| 再発条件   | `views/SkillCenterView/hooks/*` を `src/renderer/hooks/*` として指定するようなパス取り違えがある場合                                                                                |
| 対処       | `--coverage.include` を `index.tsx` / `hooks/useSkillCenter.ts` / `hooks/useFeaturedSkills.ts` の実在3パスへ固定し、`3 files / 30 tests`・coverage `86.89/84.61/88.88` を再確定した |
| 標準ルール | 対象カバレッジ計測の前に `rg --files` で include パス実在を確認し、計測対象ファイル数をログへ明記する                                                                               |

### 今回実装した内容（Phase 12テンプレート最適化）

- `skill-creator` の `phase12-system-spec-retrospective-template.md` に preview preflight と失敗時未タスク化を追加。
- `phase12-spec-sync-subagent-template.md` に preflight と screenshot coverage 検証の必須化を追加。
- 未タスク配置先判定（未完了=`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` / 完了移管=`docs/30-workflows/completed-tasks/unassigned-task/`）をテンプレートへ追補。
- `resource-map.md` と `patterns.md` の説明をテンプレート更新に合わせて同期。

### 苦戦箇所: パターンとテンプレート本体が同期しないと再利用時に漏れが出る

| 項目       | 内容                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 成功/失敗パターンには preflight 失敗時の対処があるのに、テンプレート本体のチェック項目に同条件と未タスク配置先判定がなく、仕様更新時に転記漏れが発生しやすかった |
| 再発条件   | `patterns.md` のみ更新して `assets/phase12-*.md` のコマンド・完了チェックを更新しない場合                                                                        |
| 対処       | template本体（2ファイル） + resource-map + patterns を同一ターンで更新し、UI再撮影の前提条件と未タスク配置先判定を一貫化した                                     |
| 標準ルール | 「パターン更新時はテンプレート本体と資源マップも同時更新」を必須にする                                                                                           |

### 同種課題向け簡潔解決手順（5ステップ・テンプレート同期版）

1. まず `patterns.md` の成功/失敗パターンから再発条件を抽出する。
2. `assets/phase12-system-spec-retrospective-template.md` と `assets/phase12-spec-sync-subagent-template.md` の「手順・コマンド・完了チェック（未タスク配置先判定を含む）」を同時更新する。
3. `resource-map.md` のテンプレート説明を同一ターンで同期し、参照面のドリフトを防ぐ。
4. `task-workflow.md` と `lessons-learned.md` に「実装内容 + 苦戦箇所 + 再利用手順」を同時転記する。
5. `quick_validate` で `aiworkflow-requirements` と `skill-creator` の両方を検証し、失敗時は未タスクへ分離する。

### 苦戦箇所: screenshot再取得スクリプトが `run` 一覧へ公開されていないと運用が人依存になる

| 項目       | 内容                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `capture-skill-import-idempotency-guard-screenshots.mjs` は存在していたが、`apps/desktop/package.json` scripts 未登録のため実行経路が統一されていなかった |
| 再発条件   | 「スクリプト実体がある」ことのみを完了扱いにして、`pnpm run screenshot:*` 公開を省略した場合                                                              |
| 対処       | `screenshot:skill-import-idempotency-guard` を scripts へ追加し、workflow02 Phase 11/12 文書の実行コマンドを同一表記へ統一した                            |
| 標準ルール | UI証跡運用は「スクリプト実体 + run公開 + 文書同期 + coverage検証」の4点が揃って初めて完了扱いにする                                                       |

### 同種課題向け簡潔解決手順（4ステップ・screenshot公開版）

1. `pnpm --filter @repo/desktop run | rg screenshot` で公開コマンド有無を先に確認する。
2. 未公開なら `package.json` scripts に `screenshot:<feature>` を追加して実体スクリプトへ接続する。
3. Phase 11/12 文書の実行例を `pnpm --filter @repo/desktop run screenshot:<feature>` へ統一し、旧コマンド残存を `rg` で検査する。
4. `validate-phase11-screenshot-coverage` と `verify-all-specs` を同一ターンで実行して結果を台帳へ転記する。

### 苦戦箇所: screenshot 実行時の `Port 5174` 競合で成功/警告が混在する

| 項目       | 内容                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `screenshot:skill-import-idempotency-guard` 実行で証跡は取得できるが、`Port 5174 is already in use` が同時出力され判定が揺れた |
| 再発条件   | 並列作業で既存 dev server が残った状態で screenshot コマンドを再実行する場合                                                   |
| 対処       | 実行前に `lsof -nP -iTCP:5174 -sTCP:LISTEN` を固定実行し、競合時は停止/再利用の分岐結果を `spec-update-summary.md` へ記録した  |
| 標準ルール | UI再撮影は「ポート検査→再撮影→coverage検証→台帳同期」を1セットで完了する                                                       |

### 同種課題向け簡潔解決手順（4ステップ・port競合版）

1. `lsof -nP -iTCP:5174 -sTCP:LISTEN || true` で占有有無を先に確定する。
2. 競合ありの場合は「既存プロセス停止」か「既存サーバー再利用」のどちらかに分岐し、選択理由を記録する。
3. `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard` 実行後に `validate-phase11-screenshot-coverage` を実施する。
4. 実行結果を `task-workflow.md` と `spec-update-summary.md` へ同一ターンで転記し、未解決なら未タスク化する。

### 苦戦箇所: Phase 11 証跡を別workflow参照のまま残すと coverage validator が失敗する

| 項目       | 内容                                                                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `manual-test-result.md` の証跡列が別workflowのパスのみを参照し、対象workflow配下に `outputs/phase-11/screenshots` が存在しなかったため、`validate-phase11-screenshot-coverage` が `covered=0` で失敗した |
| 再発条件   | 画面証跡を「参照文字列の更新のみ」で完了扱いにし、対象workflow配下へ証跡実体を配置しない場合                                                                                                             |
| 対処       | 対象workflow配下へ screenshot 証跡を正規配置し、視覚TCは `screenshots/*.png` で明示。非視覚TCは `NON_VISUAL:` 記法へ統一して validator の許容条件を固定した                                              |
| 標準ルール | UI証跡は「対象workflow配下の実体 + TC証跡記法 + validator PASS」の3点を同時に満たして完了判定する                                                                                                        |

### 同種課題向け簡潔解決手順（4ステップ・証跡配置版）

1. `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow <workflow-path>` を先に実行して欠落を検知する。
2. `outputs/phase-11/screenshots` が空なら、再取得または同一証跡を対象workflow配下へ正規配置する。
3. `manual-test-result.md` の視覚TCは `screenshots/*.png`、非視覚TCは `NON_VISUAL:` を必須化する。
4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` と合わせて結果を `task-workflow.md` と `spec-update-summary.md` へ同一ターンで転記する。

### 苦戦箇所: `phase-11-manual-test.md` の画面カバレッジマトリクス欠落 warning が残る

| 項目       | 内容                                                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `validate-phase11-screenshot-coverage` の判定は PASS でも、`phase-11-manual-test.md` に画面カバレッジマトリクスがなく warning が継続し、設計意図の確認が人依存になった |
| 再発条件   | `manual-test-result.md` の証跡記法のみ更新し、Phase 11 仕様書側へ TC設計（視覚/非視覚区分）を記録しない場合                                                            |
| 対処       | 未タスク `UT-IMP-PHASE11-SCREENSHOT-COVERAGE-MATRIX-GUARD-001` を追加し、matrix 必須列（TC-ID/区分/期待証跡/理由）の標準化を分離して管理する方針へ変更                 |
| 標準ルール | UI証跡は「画像実体」「証跡記法」「カバレッジマトリクス」の3層を同時に満たして完了判定する                                                                              |

### 同種課題向け簡潔解決手順（4ステップ・matrix版）

1. `phase-11-manual-test.md` に「画面カバレッジマトリクス」節があるか `rg` で機械確認する。
2. matrix へ `TC-ID` / `視覚or非視覚` / `期待証跡` / `理由` を必須列として記録する。
3. `manual-test-result.md` の `screenshots/*.png` / `NON_VISUAL:` 記法と matrix の行対応を突合する。
4. `validate-phase11-screenshot-coverage` の結果と合わせて `task-workflow.md` / `ui-ux-feature-components.md` に同一ターンで同期する。

---

## TASK-10A-B: SkillAnalysisView 再監査（2026-03-02）

### 苦戦箇所: Phase 11 がコード分析ベースのまま残る

| 項目             | 内容                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| 課題             | `manual-test-result.md` が実画面証跡ではなくコード読解結果中心で記録され、UI検証の再現性が低下した |
| 再発条件         | Electron起動制約を理由に、スクリーンショット再取得を省略する場合                                   |
| 原因             | Phase 11 完了条件の「画面証跡必須」が運用で弱かった                                                |
| 対処             | 専用スクリプトで `TC-01`〜`TC-04` を再撮影し、手動テスト結果を実証跡ベースへ更新                   |
| 今後の標準ルール | UIタスクのPhase 11は「実画面スクリーンショット + 結果文書」の2点同時成立を必須化する               |

### 苦戦箇所: `phase-11-manual-test.md` の必須節不足で検証落ち

| 項目             | 内容                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------- |
| 課題             | `validate-phase-output` で「統合テスト連携」節不足がエラー化した                      |
| 再発条件         | 既存文書を簡略更新し、テンプレート必須章の確認を省略する場合                          |
| 原因             | 画面証跡更新に寄り、Phase仕様テンプレートの章立て検証が後回しになった                 |
| 対処             | 「統合テスト連携」を追記して再検証し、28項目PASSへ復帰                                |
| 今後の標準ルール | Phase 11/12 文書更新後は `validate-phase-output` を即実行し、章不足をその場で解消する |

### 苦戦箇所: 未タスク件数が 7 件のまま残るドリフト

| 項目             | 内容                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題             | 修正済み D1/D2（aria-label、text token）が未タスクとして残り、台帳が実態と不一致になった                                                   |
| 再発条件         | 修正実施後に `unassigned-task-detection.md` と `task-workflow.md` を同時更新しない場合                                                     |
| 原因             | Phase 11修正と Phase 12台帳更新が別ターンで進みやすい                                                                                      |
| 対処             | 修正完了後の completed 集合（001/003/008）と current active set（002/004/005/006/007/009）を分離し、台帳・仕様書・成果物を同一ターンで更新 |
| 今後の標準ルール | 未タスクは fixed range でなく canonical ledger から active/completed を再計算し、検出レポートと台帳を同時更新する                          |

### 同種課題の簡潔解決手順（5ステップ）

1. `capture-*.mjs` などで画面証跡を再取得し、状態別ファイルを確定する。
2. `manual-test-result.md` と `discovered-issues.md` を実証跡ベースへ更新する。
3. `verify-all-specs` と `validate-phase-output` を連続実行し、warning/error をゼロ化する。
4. 未タスク件数を再計算し、`unassigned-task-detection.md` と `task-workflow.md` を同一ターン同期する。
5. 苦戦箇所を `lessons-learned.md` に再発条件付きで残し、次回の初動手順を固定する。

### 関連未タスク（再発防止ガード）

| 未タスクID        | 目的                                                         | タスク仕様書                                                                                 |
| ----------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| UT-TASK-10A-B-006 | Phase 11 必須セクション検証ガード（統合テスト連携/完了条件） | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-10a-b-phase11-required-sections-validation-guard.md` |
| UT-TASK-10A-B-007 | Phase 11 画面証跡鮮度ガード（再撮影 + 更新時刻確認）         | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-10a-b-phase11-screenshot-freshness-guard.md`         |
| UT-TASK-10A-B-009 | 完了済みUT配置ポリシー統一ガード（3分類 + target監査境界）   | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-10a-b-completed-ut-placement-policy-guard.md`        |

### 追補: UT-TASK-10A-B-001 完了（2026-03-05）

| 項目             | 内容                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| タスク           | 自動修正可能フィルタボタン実装                                                   |
| 実装分離         | UI責務（`SuggestionList`）と状態責務（`useSkillAnalysis`）を分離して変更         |
| 有効だった進め方 | Phase 4 で Red テストを先に追加し、導線未実装を明示してから Phase 5 で Green 化  |
| UI検証学び       | dark/light/mobile の3観点を同一ターンで撮影すると、見落としが減る                |
| 成果物           | `docs/30-workflows/completed-tasks/ut-task-10a-b-001-autofixable-filter-button/` |

### 再監査追補（2026-03-05 11:00 JST）

| 項目       | 内容                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------- |
| 課題       | TC-11-04（light想定）の証跡がdark表示で保存されていた                                           |
| 原因       | 撮影スクリプトの theme mock が `dark` 固定値を返していた                                        |
| 対処       | `capture-ut-task-10a-b-001-screenshots.mjs` を `prefers-color-scheme` 連動へ修正し、5枚を再取得 |
| 検証       | `validate-phase11-screenshot-coverage --workflow ...ut-task-10a-b-001...` で 5/5 PASS           |
| 標準ルール | テーマ検証は「ブラウザ配色設定」と「モックテーマ応答」の整合をセットで確認する                  |

### 最終再監査追補（2026-03-05）

| 項目       | 内容                                                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 完了済み `UT-TASK-10A-B-001` 指示書と未実施 `UT-TASK-10A-B-002〜008` 指示書が `completed-tasks/unassigned-task` に混在し、未タスク管理の配置規則とドリフトした                                                  |
| 原因       | 完了移管と未実施管理の境界をファイル配置ルールで固定せず、参照更新だけで完了判定した                                                                                                                            |
| 対処       | `UT-TASK-10A-B-001` は `docs/30-workflows/completed-tasks/task-10a-b-autofixable-filter-button.md` へ移管し、`UT-TASK-10A-B-002〜008` の7件を `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` へ再配置。関連参照を一括修正 |
| 検証       | `verify-unassigned-links` = 102/102、`audit --json --diff-from HEAD` = `currentViolations=0`, `baselineViolations=90`                                                                                           |
| 標準ルール | 指示書運用は「完了=completed-tasks」「未実施=unassigned-task」で物理分離し、監査は `current` と `baseline` を分けて記録する                                                                                     |

#### クイック解決カード（UT-TASK-10A-B-001）

1. 配置判定を先に確定する。未実施UTは `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/`、完了済みUT指示書は `docs/30-workflows/completed-tasks/` 直下へ置く。`completed-tasks/unassigned-task` は legacy のみを許容する。
2. `audit-unassigned-tasks --target-file` は未実施UTにのみ適用し、完了済みUT指示書には適用しない。
3. UI証跡は `TC-11-01`〜`TC-11-05` を同時刻で再取得し、`validate-phase11-screenshot-coverage` を 5/5 PASS で固定する。
4. 監査結果は `verify-unassigned-links`（参照整合）と `audit --diff-from HEAD`（`current`=合否 / `baseline`=監視）を分離して記録する。

固定コマンド:

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD | jq '{current: .totals.currentViolations, baseline: .totals.baselineViolations}'
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/ut-task-10a-b-001-autofixable-filter-button
test -f docs/30-workflows/completed-tasks/task-10a-b-autofixable-filter-button.md
find docs/30-workflows/unassigned-task -maxdepth 1 -name 'task-10a-b-*.md' | wc -l
```

#### 追加未タスク化（UT-TASK-10A-B-009）

| 項目       | 内容                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| 課題       | 配置先ルール（完了済みUT/未実施UT/legacy）が資料ごとに揺れ、`target-file` 適用境界が誤解される           |
| 未タスク化 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-10a-b-completed-ut-placement-policy-guard.md`                    |
| 目的       | 配置先3分類と監査境界を1つの運用ガードへ統合し、再監査の手戻りを削減する                                 |
| 完了判定   | `verify-unassigned-links` PASS + `audit --target-file`/`audit --diff-from HEAD` の `currentViolations=0` |

### 追補: UT-TASK-10A-B-008 完了（2026-03-06）

| 項目       | 内容                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `task-workflow` / `ui-ux-feature-components` / parent `unassigned-task-detection` の active/completed 集合が日付更新ごとにずれ、固定レンジ参照が混入した                               |
| 原因       | canonical（task-workflow）と derived（ui-ux / detection）の責務分離が弱く、completed 集合を active 集合から除外しきれていなかった                                                      |
| 対処       | completed 集合を `001 / 003 / 008`、current active set を `002 / 004 / 005 / 006 / 007 / 009` として再確定し、3台帳を同一ターンで同期。あわせて `validate-task10ab-ledger-sync` を追加 |
| 標準ルール | active/completed は固定レンジでなく canonical ledger 起点で求め、derived ledger は必ず機械検証で整合確認する                                                                           |

#### 追補2: 明示 screenshot 要求時の再監査（2026-03-06）

| 項目       | 内容                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 「ドキュメント修正中心だから UI差分なし」と判断して `NON_VISUAL` のまま閉じると、関連UIの実不具合を取りこぼす                                      |
| 原因       | ユーザーの明示要求よりタスク種別判定を優先し、Phase 11 証跡方式の切替が遅れた                                                                      |
| 対処       | SkillAnalysisView の実スクリーンショット 8 ケースを再取得し、`useSkillAnalysis` の StrictMode ローディング固着と light-theme mock 不整合を修正した |
| 標準ルール | ユーザーがスクリーンショット検証を明示要求したら、UI差分の大小に関係なく `SCREENSHOT + Apple review` を優先する                                    |

#### 追補3: Phase 12 実装ガイドの内容不足是正（2026-03-06）

| 項目       | 内容                                                                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `implementation-guide.md` が Part 1/Part 2 の見出しだけ満たし、TypeScript 型・API/CLI シグネチャ・設定一覧など Task 12-1 の必須内容が薄いまま完了扱いになりやすい                                                       |
| 原因       | `validate-phase-output` は構造中心で、Task 12-1 の内容要件までは直接検証していなかった                                                                                                                                  |
| 対処       | `outputs/phase-12/implementation-guide.md` を補強し、`validate-phase12-implementation-guide.js` を追加して理由先行 / 日常例え / 型 / API・CLI / 使用例 / エラー処理 / エッジケース / 設定一覧の 10 項目を機械検証化した |
| 標準ルール | Phase 12 Task 1 は「Part 1/2 がある」ではなく「内容要件 validator が PASS」で完了判定する                                                                                                                               |

#### 追補4: skill-creator の参照導線不足是正（2026-03-06）

| 項目       | 内容                                                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `skill-creator` の reference 群が `resource-map.md` には載っていても `SKILL.md` から直接辿れず、`quick_validate` warning 26件が残っていた                                         |
| 原因       | 詳細台帳を `resource-map.md` へ寄せた一方で、日常運用の入口である `SKILL.md` の導線更新を同じターンで実施していなかった                                                           |
| 対処       | `SKILL.md` を「基礎設計・更新導線 / ヒアリング・抽象化 / 実装・ランタイム / 統合・オーケストレーション / 品質・運用」の5カテゴリで再編し、未リンク reference を直接参照可能にした |
| 標準ルール | reference を追加・増補したら `resource-map.md` と `SKILL.md` の両方から辿れることを `quick_validate` warning=0 で確認する                                                         |

#### 追補5: aiworkflow-requirements の入口導線未整備（2026-03-06）

| 項目       | 内容                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `aiworkflow-requirements` は `quick_validate` で warning 145件が残るが、これを `SKILL.md` への全 reference 直列挙だけで解消すると 500行制限と Progressive Disclosure を壊しやすい          |
| 原因       | `quick_validate.js` が `SKILL.md` 内の直接リンク文字列だけを見ており、`indexes/quick-reference.md` や `indexes/resource-map.md` を入口とする大規模仕様スキルの設計を評価できない           |
| 対処       | 未タスク `UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001` を作成し、`SKILL.md` / `quick-reference.md` / `resource-map.md` の三層入口と validator 整合を一体で見直す方針を切り出した |
| 標準ルール | 大規模 reference スキルでは「warning 0」だけを目的に直列挙せず、入口設計と validator 前提を同時に設計する                                                                                  |

#### クイック解決カード（UT-TASK-10A-B-008）

1. `task-workflow.md` の残課題表を canonical として active/completed 集合を切り出す。
2. `ui-ux-feature-components.md` と parent `unassigned-task-detection.md` を同じ集合へ同期する。
3. 完了済み指示書は `completed-tasks/`、継続UTは `unassigned-task/` へ物理配置を揃える。
4. `validate-task10ab-ledger-sync` と `verify-unassigned-links` と `audit --diff-from HEAD` を順に実行し、`currentViolations=0` だけを合否に使う。
5. `validate-phase12-implementation-guide.js` で Task 12-1 の内容要件を確認する。
6. ユーザーが画面検証を要求した場合は `outputs/phase-11/screenshots` を再生成し、targeted UI test と Appleレビューを同一ターンで記録する。
7. `resource-map.md` だけでなく `skill-creator/SKILL.md` からも関連 reference が辿れるか、`quick_validate .claude/skills/skill-creator` の warning=0 で閉じる。
8. 大規模仕様スキルで warning が残る場合は、`SKILL.md` 全列挙で押し切らず、入口設計と validator 整合を独立未タスクとして切り出す。

### 関連未タスク（2026-03-06 追補）

| 未タスクID                                            | 目的                                                                                                                        | タスク仕様書                                                                                                                                                   |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001 | `aiworkflow-requirements` の入口三層（`SKILL.md` / `quick-reference` / `resource-map`）と `quick_validate` 判定を両立させる | `docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard/unassigned-task/task-imp-aiworkflow-skill-entrypoint-coverage-guard-001.md` |

---

