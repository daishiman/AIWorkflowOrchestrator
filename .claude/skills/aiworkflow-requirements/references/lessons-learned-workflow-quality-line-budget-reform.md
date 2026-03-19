# Lessons Learned（教訓集） / workflow / quality lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: workflow / quality lessons

## TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001: Phase 12 root evidence 再監査（2026-03-13）

### 苦戦箇所: shallow PASS 表では Phase 12 漏れを見逃す

| 項目 | 内容 |
| --- | --- |
| 課題 | `phase12-task-spec-compliance-check.md` が成果物存在の浅い表だけだと、implementation guide の型/API不足や active 未タスクの10見出し欠落を見逃しやすい |
| 再発条件 | docs-heavy task や spec-only task で「成果物がある」ことだけを根拠に PASS 判定する場合 |
| 対処 | root evidence 1ファイルに `phase-12-documentation.md` / outputs 実体 / implementation guide 必須要素 / 未タスク配置 / current-baseline 分離 / system spec 同期を集約する |
| 教訓 | Phase 12 の完了判定は shallow summary ではなく、Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 を 1 ファイルへ束ねた root evidence で閉じる |

### 苦戦箇所: split 親だけの link audit では backlog child を取りこぼす

| 項目 | 内容 |
| --- | --- |
| 課題 | `verify-unassigned-links` を親 `task-workflow.md` の本文だけで実行すると、`task-workflow-backlog.md` に残る active 未タスクリンクを拾えない |
| 再発条件 | `task-workflow.md` を parent index + child companion に分割済みの skill を監査する場合 |
| 対処 | 親 `task-workflow.md` 指定時は sibling `task-workflow*.md` も一括走査し、`existing=222 / missing=0` を task-workflow / outputs / feedback に同値転記する |
| 教訓 | split 後の ledger 監査は parent entrypoint 基準で sibling aware に設計する |

### 苦戦箇所: `current` と `baseline` の意味が混線しやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | `currentViolations=0` でも `baselineViolations=134` が残るため、今回タスクが未完了に見えやすい |
| 再発条件 | active 未タスクは正しく配置できていても、repo 全体の legacy backlog が残る場合 |
| 対処 | 合否は `currentViolations`、repo 全体健全性は `baselineViolations` と固定し、既存 remediation task を detection report へ併記する |
| 教訓 | current は今回差分、baseline は既存負債、という二軸記録を省略しない |

### 苦戦箇所: current canonical set と ledger を別ターンで直すと same-wave drift が残る

| 項目 | 内容 |
| --- | --- |
| 課題 | `resource-map` / `quick-reference` は current state でも、`task-workflow-backlog` / completed record / `LOGS.md` の follow-up が古いまま残りやすい |
| 再発条件 | aiworkflow skill に新規 file、semantic rename、follow-up formalize を追加し、entrypoint だけ先に直す場合 |
| 対処 | current canonical set、artifact inventory、legacy register、parent docs、ledger、mirror を same-wave target として inventory 化し、`.claude` 編集 -> generated index -> mirror の順で閉じる |
| 教訓 | 入口更新だけでは不十分で、entrypoint・ledger・mirror を 1 wave で閉じる guard が必要 |

### 同種課題の5分解決カード

| 課題パターン | 解決コマンド/手順 |
| --- | --- |
| root evidence 化 | `phase12-task-spec-compliance-check.md` に 4点突合、implementation guide 必須要素、未タスク10見出し、current / baseline を集約する |
| split-aware link audit | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md` |
| active 未タスク個別合否 | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-aiworkflow-requirements-generated-index-sharding-001.md` |
| workflow 差分合否 | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` |
| generated blocker 判定 | `wc -l .claude/skills/aiworkflow-requirements/indexes/topic-map.md` で raw 値を取り、manual docs gate と別レイヤーで扱う |
| same-wave sync | `spec-elegance-consistency-audit.md` の同一 wave checklist に従い、current canonical set / inventory / register / ledger / mirror を同一ターンで同期する |

---

## UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001: 検証ゲート整合化（2026-02-26）

### タスク概要

| 項目       | 内容                                                                               |
| ---------- | ---------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                         |
| 目的       | `quick_validate.js` を正規経路に統一し、Phase 11/12 で同一入力・同一判定を保証する |
| 完了日     | 2026-02-26                                                                         |
| ステータス | **完了**                                                                           |

### 苦戦箇所と解決策

#### 1. 参照リンクの既存ドリフトが手動テストを阻害

| 項目   | 内容                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------- |
| 課題   | `verify-unassigned-links.js` が `task-workflow.md` の2リンク欠落で FAIL し、Phase 11 が完了不可になった |
| 原因   | 未タスクから完了タスクへ移管済みなのに、`unassigned-task/` 側の旧パスが残存していた                     |
| 解決策 | `task-workflow.md` の2リンクを `completed-tasks` の実在パスへ修正し、直後に再検証                       |
| 教訓   | 仕様更新前に `verify-unassigned-links.js` を先行実行し、リンク整合を早期に回収する                      |

#### 2. 曖昧語の機械判定が通らない

| 項目   | 内容                                                                                                            |
| ------ | --------------------------------------------------------------------------------------------------------------- |
| 課題   | 指定grep（`基準どおりに/条件該当時に/等/...`）で `spec-update-workflow.md` がヒットし、完了条件を満たせなかった |
| 原因   | 例示文に `等` が残存し、運用上は問題なくても機械判定が FAIL になる                                              |
| 解決策 | `等` を `など` に置換し、判定コマンドを再実行してヒット0件を確認                                                |
| 教訓   | Phase 12仕様に「grep判定語彙の禁止リスト」を維持し、更新時に自動検査する                                        |

#### 3. baseline違反とcurrent違反の誤読リスク

| 項目   | 内容                                                                                                   |
| ------ | ------------------------------------------------------------------------------------------------------ |
| 課題   | `audit-unassigned-tasks --json` 全体実行は既存baseline違反で exit 1 となり、今回差分失敗と誤認しやすい |
| 原因   | `--target-file` / `--diff-from` と scope未指定実行の役割差が曖昧になりやすい                           |
| 解決策 | current判定は `--target-file` / `--diff-from` で実施し、全体実行は baseline監視として別記録            |
| 教訓   | Phase 11/12 のレポートには `currentViolations` と `baselineViolations` を必ず並記する                  |

### 同種課題向け簡潔解決手順（4ステップ）

1. `verify-unassigned-links.js` を最初に実行し、参照切れを先に解消する。
2. 曖昧語grepを実行し、ヒット語（特に `等`）を修正する。
3. `audit-unassigned-tasks` は `target/diff` で current 判定し、全体実行は baseline 監視として分離する。
4. 修正後に `quick_validate.js` 3スキル実行 + 再現性diff確認を行い、Phase 11 完了判定へ進む。

### 成果物

| 成果物                      | パス                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| Phase 11 手動テスト結果     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-11/manual-test-result.md`   |
| Phase 11 ウォークスルーログ | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-11/walkthrough-log.md`      |
| Phase 12 実装ガイド         | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/implementation-guide.md` |

---

## TASK-10A-F ワークフロー教訓（2026-03-09 P50検証実行）

### 苦戦箇所テーブル

| # | 苦戦箇所 | 再発条件 | 対処 |
|---|---|---|---|
| 1 | P50モード判定の遅延 | 実装済みタスクのPhase仕様書がP50を前提としていない場合、Phase 4-5で初めて「既存テストが全て存在する」と気付く | Phase 1のStep 0でgit log + コード確認を必須化。既実装発見時はPhase全体を「検証・補完」モードに切り替え |
| 2 | カバレッジ計測のP40再発 | `pnpm vitest run --coverage` をプロジェクトルートから実行するとhappy-dom設定が読み込まれない | `cd apps/desktop && pnpm vitest run --coverage` で必ずパッケージディレクトリから実行 |
| 3 | SkillImportDialogとuseSkillAnalysisの責務混同 | 仕様書がSkillImportDialogのSelector移行をTASK-10A-Fの責務として誤記 | API系統（ライフサイクル系 vs ファイル操作系 vs インポート系）で明確にスコープを分離 |
| 4 | Phase 12の仕様書更新が「既に完了済み」のケース | completed-tasks workflowに成果物が集約済みで、current workflowのoutputs/が空 | Phase 12開始前にcompleted-tasks workflowの存在を確認し、差分更新のみ実施 |
| 5 | グローバルカバレッジ閾値の誤判定 | --coverage実行時にグローバル閾値が全ファイルに適用され、対象外ファイルの0%でERRORになる | 対象ファイル個別のカバレッジ行を確認し、グローバル閾値のERRORは対象外ファイル由来として判定 |

### 再利用手順

1. **P50チェック**: `rg -n 'window\.electronAPI' 対象ディレクトリ` で移行済みか確認
2. **テスト棚卸し**: `ls */__tests__/*.test.{ts,tsx}` + `grep -c 'it(' *.test.*` でテスト数を把握
3. **カバレッジ計測**: `cd apps/desktop && pnpm vitest run --coverage` でパッケージ内から実行
4. **Store移行確認**: `grep -n 'use[A-Z].*Skill' store/index.ts` で個別セレクタの公開を確認

### 関連パターン

- [S26: 直接IPC→Store個別セレクタ移行パターン](./architecture-implementation-patterns.md#s26)
- P31: Zustand Store Hooks 無限ループ（06-known-pitfalls.md）
- P40: テスト実行ディレクトリ依存（06-known-pitfalls.md）
- P42: 文字列引数の .trim() バリデーション漏れ（06-known-pitfalls.md）
- P48: useShallow未適用による派生セレクタ無限ループ（06-known-pitfalls.md）
- P50: 既実装防御の発見による Phase 転換（06-known-pitfalls.md）

---

## TASK-10A-G: ライフサイクルテストハードニング（2026-03-09）

### タスク概要

| 項目       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| タスクID   | TASK-10A-G                                                           |
| 目的       | `skillHandlers.ts` の `skill:create` ハンドラに対する3層テスト構成の追加 |
| 完了日     | 2026-03-09                                                           |
| ステータス | **完了**                                                             |

### 苦戦箇所と解決策

#### 1. テスト専用タスクにおける Phase 4/5 境界の曖昧さ

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | TASK-10A-G はテストコードのみの追加タスクで、Phase 4（テスト作成/Red）と Phase 5（実装/Green）の区分が通常の実装タスクと異なる |
| **原因**   | テスト対象のプロダクションコードは TASK-10A-E/F で既に実装済みで、Phase 4 で書いたテストが最初から Green になり得る |
| **解決策** | Phase 4-5 を統合実行し、テスト作成とモック調整で Green 確認までを一続きの工程として扱った |
| **教訓**   | テスト専用タスクでは Phase 4-5 を「テスト作成 + Green 確認」の統合ステップとして運用してよい |

- **再発条件**: 既実装コードに対するテスト追加タスク
- **関連Pitfall**: P50（既実装防御の発見による Phase 転換）

#### 2. skillHandlers.ts の巨大ファイルによるカバレッジ計測の誤解

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | Layer 1 テストは `skill:create` のみが対象なのに、coverage は `skillHandlers.ts` 全体の未実行コードにも引きずられる |
| **原因**   | v8 coverage はファイル単位で集計され、他ハンドラが Line/Function Coverage を押し下げる |
| **解決策** | workflow / system spec に `handler-scope coverage` を明記し、対象範囲付きで記録した |
| **教訓**   | coverage 数値を残すときは「対象範囲」と「ファイル全体」を分けて書く |

- **再発条件**: 巨大ファイルの一部ハンドラのみを対象とするテストタスク

#### 3. 3層テスト構成における Layer 間のモック整合性維持

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | Layer 1/2/3 で異なるモック戦略を使うため、一方の変更が他方を壊しやすい |
| **原因**   | Main IPC、Store 統合、既存 UI テスト拡張で前提と責務が異なる |
| **解決策** | 各テストファイルでモックを自己完結させ、Layer 3 は既存 `describe` ブロック末尾へ追記するだけに留めた |
| **教訓**   | 多層テストでは Layer ごとにモック責務を明示し、グローバルモック汚染を避ける |

#### 4. 並列エージェントによる Phase 12 仕様書更新の分割戦略

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | Phase 12 で更新対象ファイルが多く、1エージェントに集約すると中断リスクが高い |
| **原因**   | LOGS/SKILL 4ファイル同時更新や supporting artifact 群の同期が必要だった |
| **解決策** | 実装ガイド、仕様書更新、レポート群の 3 系統に分け、依存するファイルだけ同一担当へ集約した |
| **教訓**   | Phase 12 は「3ファイル以下/エージェント」を目安に分割し、相互依存ファイルは同一エージェントへ集約する |

#### 5. テスト独立性検証（`--sequence.shuffle`）の有効性

| 項目       | 内容 |
| ---------- | ---- |
| **課題**   | テスト追加後、Store 状態やモジュールスコープ変数の依存が混入していないか確認が必要だった |
| **原因**   | Layer 2 / Layer 3 は状態保持や既存モックに依存しやすい |
| **解決策** | `beforeEach` のモック初期化に加え、`--sequence.shuffle` と単独実行でランダム順序を確認した |
| **教訓**   | 状態を扱うテスト追加後は、shuffle 実行で順序依存を必ず検証する |

### 同種課題の5分解決カード

| 課題パターン | 解決コマンド/手順 |
| --- | --- |
| テスト専用タスクの Phase 4-5 境界 | Phase 4-5 を統合実行し、テスト作成→モック調整→Green 確認を 1 ステップで閉じる |
| 巨大ファイルの handler-scope coverage | `pnpm exec tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --target skill:create` |
| Layer 間モック汚染の防止 | 各テストファイルでモックを自己完結させ、Layer 3 は既存 `describe` 末尾へ追加する |
| Phase 12 並列分割 | 3ファイル以下/エージェント + 相互依存ファイルは同一エージェントに集約 |
| テスト独立性検証 | `pnpm exec vitest run --sequence.shuffle <test-file>` でランダム順序を確認する |

---

## 2026-03-12: TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001
- 苦戦した点: `verify-all-specs` 系の結果で `current=0` でも`baseline=134`が残る状態は、「未完了がない」と誤認しやすい。`current` と `baseline`、`format`/`naming`/`misplaced` は別指標で読む必要がある。
- 苦戦した点: `verify-unassigned-links` が全リンク有効でも、phase12の成果物未作成（`outputs/phase-12`欠如）を捕捉できないため、Phase検査（成果物存在）とリンク検査を分けて確認する必要があった。
- 苦戦した点: `aiworkflow-requirements`と`task-specification-creator`で同名/同趣旨の改善タスクが並走しており、どちらの配下に成果物を追加するかの境界整理に時間を要した。
- 苦戦した点: workflow 本体の `currentPhase` と branch-level documentation shell を同じ「phase完了」として記録したまま close-out すると、`SKILL.md` / `LOGS.md` / `task-workflow` に stale state が残る。
- 苦戦した点: generated `topic-map.md` の行数を literal で current docs に転記すると、workflow 正本追加後の `generate-index.js` 再実行で `3504 -> 3520` のように変動し、system spec と未タスク仕様書の値がすぐ stale になる。
- 対処: 中間段階では documentation shell と execution progress を分けてよいが、close-out 前に `artifacts.json` / workflow outputs / `SKILL.md` / `LOGS.md` / `task-workflow` を final state へ一括再同期する。さらに `verify-all-specs`、phase成果物存在確認、`validate_all.js`、`diff -qr` を同じ turn で回してから完了扱いにする。

### 同種課題の5分解決カード

1. line budget 改修は family-wave で切り、1 wave で parent / child / history / archive / discovery を閉じる。
2. manual docs と generated artifact を分離し、`topic-map.md` の oversized は docs patch で無理に潰さない。
3. `generate-index.js` 後の実測値を literal で持つ current docs を `rg` で洗い、必要箇所だけ再同期する。
4. `current` / `baseline`、`links` / `phase outputs` / `validator` の bucket を分けて close-out する。
5. `.claude` 正本更新後に `.agents` mirror を同期し、`diff -qr` を最後に通す。
6. workflow outputs、`SKILL.md`、`LOGS.md`、`task-workflow`、`lessons-learned` を final state へ同一ターンで再同期する。

### 関連ドキュメント

- [workflow-aiworkflow-requirements-line-budget-reform.md](./workflow-aiworkflow-requirements-line-budget-reform.md)
- [phase-12-documentation-retrospective.md](./phase-12-documentation-retrospective.md)
- [task-imp-aiworkflow-generated-index-metric-sync-guard-001.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260312-162304-201123451/docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/unassigned-task/task-imp-aiworkflow-generated-index-metric-sync-guard-001.md)
