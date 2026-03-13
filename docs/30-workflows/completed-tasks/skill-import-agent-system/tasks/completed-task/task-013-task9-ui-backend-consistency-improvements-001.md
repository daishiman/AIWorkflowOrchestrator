# task-9 UI/バックエンド整合再監査と依存順序再設計 - タスク指示書

## メタ情報

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | TASK-IMP-TASK9-UI-BE-CONSISTENCY-001                                        |
| タスク名     | task-9 UI/バックエンド整合再監査と依存順序再設計                            |
| 分類         | 改善                                                                        |
| 対象機能     | task-9（9A, 9D-9J）/ UI-05（task-030, task-031a, task-031b）/ TASK-10A 統合 |
| 優先度       | 高                                                                          |
| 見積もり規模 | 中規模                                                                      |
| ステータス   | 再監査完了（次アクション定義済み）                                          |
| 発見元       | Phase 12 相当レビュー（仕様整合監査）                                       |
| 発見日       | 2026-02-25                                                                  |

---

## 目的

### 背景

task-9 系仕様（9A, 9D-9J）と UI-05 系仕様（task-030, task-031a, task-031b）は、同じ Skill 機能を扱う一方で、IPC 契約・型境界・実装順序の記述が分散しやすい。
直近の仕様更新で `skill:importFromSource` への分離、`ISO 8601` 方針、`safeOn + cleanup` パターンは整理されたが、実行順序と責務境界を 1 つの実行仕様として固定するドキュメントが必要。

### 問題点・課題

- 参照パスのドリフト（完了済み UT の参照先が旧配置のまま）により、前提仕様の追跡コストが高い。
- `skill:import`（ローカル）と `skill:importFromSource`（外部ソース）の使い分けが、タスク間依存順序まで含めて固定されていない。
- Date 境界ルール（IPC は `string; // ISO 8601`）と UI 側 Props の整合確認が、実行手順として明文化されていない。
- Debug イベント購読（`skill:debug:event`）の `safeOn` パターン確認が、UI 実装前提として順序化されていない。

### 放置した場合の影響

- P44/P45 系の IPC 契約ドリフト再発により、実装時に Main/Preload/Renderer の期待値が分裂する。
- UI 側先行実装時のモックとバックエンド仕様がずれ、手戻りが増える。
- TASK-10A 統合で依存順序の破綻が顕在化し、統合フェーズの遅延要因になる。

## 実行タスク

### 到達目標

task-9（9A, 9D-9J）と UI-05（task-030, task-031a, task-031b）を、aiworkflow-requirements 正本に準拠した単一の契約体系へ再整列し、TASK-10A 前に実行順序を固定する。

### 最終ゴール

- 参照タスク 12 ファイル（task-9 8件 + UI-05 3件 + 統合1件）の依存順序が、直列/並列付きで矛盾なく定義される。
- IPC 契約（チャネル名/引数/戻り値/イベント購読）が `aiworkflow-requirements` 正本と一致する。
- SubAgent 分担仕様が作成済みで、並列実行可能な監査観点が分離される。

### スコープ

#### 含むもの

- task-9（9A, 9D-9J）と UI-05（task-030, task-031a, task-031b）の契約整合監査手順定義
- TASK-10A（041a/041b/041c/042）へ接続する依存順序再設計
- SubAgent Team を想定した SubAgent 分担仕様書の作成

#### 含まないもの

- 実装コード変更（Main/Preload/Renderer）
- テスト実行や挙動確認の実施
- Phase 実行（本依頼は仕様書作成に限定）

## 成果物

| 成果物                                | パス                                                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| メイン仕様書                          | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-013-task9-ui-backend-consistency-improvements-001.md`   |
| SubAgent インデックス                 | `docs/30-workflows/completed-tasks/task-013-subagent-team/index.md`                                                            |
| SubAgent-A 仕様書（契約監査）         | `docs/30-workflows/completed-tasks/task-013-subagent-team/task-013a-contract-audit.md`                                         |
| SubAgent-B 仕様書（データフロー監査） | `docs/30-workflows/completed-tasks/task-013-subagent-team/task-013b-dataflow-audit.md`                                         |
| SubAgent-C 仕様書（UI責務監査）       | `docs/30-workflows/completed-tasks/task-013-subagent-team/task-013c-ui-boundary-audit.md`                                      |
| SubAgent-D 仕様書（順序設計）         | `docs/30-workflows/completed-tasks/task-013-subagent-team/task-013d-sequence-redesign.md`                                      |
| 次アクション実行計画                  | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-013e-phase12-action-bridge.md` |
| Phase 12 証跡（必須5成果物）          | `docs/30-workflows/completed-tasks/task-013-subagent-team/outputs/phase-12/`                                                   |

## 3. 補足設計情報（How）

### 3.1 前提条件

- 完了済み UT 仕様（010a/011/012）が参照可能であること。
- `aiworkflow-requirements/references/` を仕様正本として参照すること。
- 本タスクは「仕様策定タスク」であり、実装やテスト実行を行わないこと。

### 3.2 依存タスク

| タスク                               | 関係     | 参照先                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 | 先行必須 | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-010a-ut-skill-import-channel-conflict-001.md`                                                                                                                                                                                                                                                                                                                                                                                                                       |
| UT-IPC-DATA-FLOW-TYPE-GAPS-001       | 先行必須 | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-011-ut-ipc-data-flow-type-gaps-001.md`                                                                                                                                                                                                                                                                                                                                                                                                                              |
| UT-SKILL-IPC-PRELOAD-EXTENSION-001   | 先行必須 | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-012-ut-skill-ipc-preload-extension-001.md`                                                                                                                                                                                                                                                                                                                                                                                                                          |
| TASK-9B / TASK-9A / TASK-9F          | 整合対象 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-020a-task-9b-skill-creator.md`, `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-020b-task-9a-skill-editor.md`, `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`                                                                                                                                                 |
| TASK-10A-A/B/C/D                     | 後続統合 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-041a-task-10a-a-management-panel.md`, `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-041b-task-10a-b-analysis-view.md`, `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-041c-task-10a-c-create-wizard.md`, `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-042-task-10a-d-integration.md` |

### 3.3 必要な知識

- IPC 契約: `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- UI 契約: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- セキュリティ検証: `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`, `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`（P42/P44/P45）
- 実装パターン: `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`（S19-S21, safeOn/safeInvoke）
- 運用履歴: `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 3.4 推奨アプローチ（SubAgent Team / SubAgent 編成）

| SubAgent   | 担当                                   | 実行方式        | 出力                     |
| ---------- | -------------------------------------- | --------------- | ------------------------ |
| SubAgent-A | IPC 契約監査（チャネル名/引数/戻り値） | 並列            | 契約差分テーブル         |
| SubAgent-B | Date/イベント/境界型監査               | 並列            | IPC 境界型ルール表       |
| SubAgent-C | UI-Backend 責務境界監査                | 並列            | Props-DTO 対応マトリクス |
| SubAgent-D | 依存順序再設計                         | 直列（A/B/C後） | 実装順序表（直列/並列）  |

### 3.5 実装課題と解決策（親タスクからの教訓反映）

| 課題                                          | 発見経緯                   | 解決策                                           | 教訓                                              |
| --------------------------------------------- | -------------------------- | ------------------------------------------------ | ------------------------------------------------- |
| `skill:import` と外部インポートのチャネル衝突 | task-9F 横断監査           | 外部ソースは `skill:importFromSource` に分離     | 既存チャネル流用時は全仕様書横断検索を必須化      |
| Date 境界方針のドリフト                       | task-9I で `Date` 記述残存 | IPC 境界は `string; // ISO 8601` に統一          | 型修正と方針文章をセットで更新する                |
| Debug 購読の実装差分                          | 05B 側 `safeOn` 手順不足   | `safeOn` の解除関数を `useEffect` cleanup で明記 | 購読系は StrictMode 前提で cleanup まで仕様化する |

### 3.6 aiworkflow-requirements 反映ルール

- 仕様根拠は `aiworkflow-requirements/references/` を正本として記載する。
- 「実装詳細」ではなく「契約境界（API/IPC/型/セキュリティ）」を優先して定義する。
- 参照ファイルは実在パスのみを採用し、旧配置参照を残さない。

### 3.7 必要仕様の抽出手順（aiworkflow-requirements）

1. `.claude/skills/aiworkflow-requirements/indexes/resource-map.md` でタスク種別（IPC契約監査 / UI境界監査 / 順序設計）ごとの必読仕様を特定する。
2. `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md` でチャネル・型・安全パターンの要点を先に確認する。
3. `.claude/skills/aiworkflow-requirements/scripts/search-spec.js` でキーワード（`skill:get-detail`, `skill:importFromSource`, `safeOn`, `P44`, `P45`, `ISO 8601`, `security-skill-ipc`）を横断検索する。
4. 抽出された仕様を SubAgent-A/B/C の入力資料・参照資料へ反映する。
5. 抽出漏れ防止として `ipc-contract-checklist.md` と `ipc-type-resolution-guide.md` を必須参照に固定する。
6. `quick-reference.md` は入口情報として扱い、最終契約は `interfaces-agent-sdk-skill.md` / `api-ipc-agent.md` / `security-skill-ipc.md` を正本として確定する。

### 3.8 task-specification-creator 準拠確認

- メタ情報: `## メタ情報`
- 目的: `## 目的`
- 実行タスク: `## 実行タスク`（SubAgent 分担 + Wave 実行単位）
- 参照資料: `## 8. 参照資料`
- 実行手順: `## 4. 実行手順`
- 成果物: `## 成果物`
- 完了条件: `## 5. 完了条件チェックリスト`

---

## 4. 実行手順

> **最終確定版**: SubAgent-D 統合分析結果に基づく（2026-02-25確定）
> 詳細は `docs/30-workflows/completed-tasks/task-013-subagent-team/outputs/final-execution-sequence.md` を参照。

### Wave 0: CRITICAL/MAJOR仕様是正（直列）

**目的**: 後続Wave全てに影響するチャネル名不一致とファントムチャネルを是正し、実装前提を確立する。

1. AUDIT-001: task-030の`skill:detail`を`skill:get-detail`に修正（CRITICAL）
2. AUDIT-002: task-030の`skill:readMarkdown`を削除し`skill:readFile`代替記載（CRITICAL）
3. AUDIT-003: `skill:get-detail`命名ドリフトの未タスク登録（MAJOR）
4. AUDIT-004: `.trim()`チェック有無の確認（MINOR、AUDIT-003と同時対応）

- **開始条件**: task-012完了済み
- **完了条件**: task-030のチャネル名が正本と一致し、ファントムチャネルが除去されている

### Wave 1: バックエンド基幹仕様（部分並列）

**目的**: Skill Creator/Editorの基幹仕様を確定し、Skill Shareの前提を整える。

1. `task-020a-task-9b-skill-creator.md` ∥ `task-020b-task-9a-skill-editor.md`（並列可能）
2. `task-022-task-9f-skill-share.md`（020a/020b完了後に直列）

- **開始条件**: Wave 0完了
- **完了条件**: 3仕様書が正本準拠で確定

### Wave 2: バックエンド拡張仕様（全並列 + 監査是正統合）

**目的**: task-9D〜9Jの6タスクを全並列実行し、SubAgent-B検出のMEDIUM/LOW指摘を各タスク内で同時是正する。

- `task-023a-task-9g-skill-schedule.md`（是正なし）
- `task-023b-task-9h-skill-debug.md`（E-1: DebugEvent型追加）
- `task-023c-task-9i-skill-docs.md`（是正なし）
- `task-023d-task-9j-skill-analytics.md`（M-1/C-1修正）
- `task-023e-task-9d-skill-chain.md`（M-2/M-3/S-1追加）
- `task-023f-task-9e-skill-fork.md`（T-1: ForkMetadata追加）

- **開始条件**: Wave 1のtask-020a/020b完了（task-022完了は不要）
- **完了条件**: 6タスク全ての仕様が正本準拠で確定し、統合是正が完了

### Wave 3: UI-05仕様（030先行 → 031a/031b並列）

**目的**: SkillCenterViewのUI入口仕様を先行確定し、Editor/AdvancedViewsを並列実行する。

1. `task-030-ui-05-skill-center-view.md`（先行、直列）
2. `task-031a-ui-05a-skill-editor-view.md` ∥ `task-031b-ui-05b-skill-advanced-views.md`（並列）

- **開始条件**: Wave 2の全6タスク完了
- **完了条件**: 全3ビューの仕様が正本準拠で確定し、Props-DTO対応が検証済み

### Wave 4: TASK-10A統合（部分並列 + 直列）

**目的**: 管理パネル/分析ビュー/作成ウィザードを並列確定し、最終統合で全体整合を保証する。

1. `task-041a-task-10a-a-management-panel.md` ∥ `task-041b-task-10a-b-analysis-view.md` ∥ `task-041c-task-10a-c-create-wizard.md`（並列）
2. `task-042-task-10a-d-integration.md`（041a/b/c完了後に直列）

- **開始条件**: Wave 3全完了
- **完了条件**: task-042の統合仕様が全前提タスクとの整合を確認済み
- **統合検証**: R-1〜R-5ルール適用（`final-execution-sequence.md` セクション3参照）

### Wave 5: SubAgent成果物統合（直列）— 完了済み

1. ✅ SubAgent-A/B/C の監査成果を統合（16件を統一分類）
2. ✅ SubAgent-D が最終順序表を確定（Wave 0〜5構成）
3. ✅ task-013 本文へ最終反映（本セクション）

---

## 5. 完了条件チェックリスト

### 機能要件

- [x] task-9 8ファイルと UI-05 3ファイルの整合観点が明示されている
- [x] `skill:import` と `skill:importFromSource` の役割分離が明記されている
- [x] `safeOn + cleanup` パターンの監査観点が含まれている

### 品質要件

- [x] Date 境界方針（ISO 8601）が仕様内で一貫している
- [x] 直列/並列の境界が依存関係と矛盾しない
- [x] 参照仕様が aiworkflow-requirements 正本へ紐づいている

### ドキュメント要件

- [x] SubAgent 仕様ディレクトリが作成されている
- [x] SubAgent 4仕様書 + index が存在する
- [x] 旧配置の参照パス（非実在）が除去されている

### 監査結果要件（SubAgent-D 追加）

- [x] A/B/C全検出結果（16件）が統一分類テーブルに統合されている
- [x] CRITICAL 2件とMAJOR 2件の是正タイミングがWaveに配置されている
- [x] 並列化境界の判断根拠テーブルが作成されている
- [x] TASK-10A統合への接続ルール（R-1〜R-5）が定義されている
- [x] 最終実行順序表（`final-execution-sequence.md`）が確定版で作成されている
- [x] 並列化境界定義書（`parallelization-boundary.md`）が確定版で作成されている

### Phase 12 準拠要件（再監査時）

- [x] Task 1: 実装ガイド（Part 1/Part 2）を出力済み
- [x] Task 2: システム仕様更新（Step 1-A〜1-C/Step 2）を記録済み
- [x] Task 3: documentation-changelog を出力済み
- [x] Task 4: 未タスク検出レポート（0件可）を出力済み
- [x] Task 5: skill-feedback-report を出力済み

---

## 6. 検証方法

### テストケース（仕様整合の確認）

- Case 1: 先行 UT 3件（010a/011/012）の参照先が全て実在する
- Case 2: task-9 8件の仕様ファイルが全て実在する
- Case 3: UI-05 側に `skill:importFromSource` / `onExport` / `safeOn` 関連記述がある
- Case 4: SubAgent 4仕様書が揃っている
- Case 5: SubAgent-D 出力ファイル3件が存在する
- Case 6: 監査検出結果16件が統合テーブルに含まれている

### 検証手順

```bash
# 先行UT参照の実在確認
for f in \
  task-010a-ut-skill-import-channel-conflict-001.md \
  task-011-ut-ipc-data-flow-type-gaps-001.md \
  task-012-ut-skill-ipc-preload-extension-001.md
  do
  test -f "docs/30-workflows/skill-import-agent-system/tasks/completed-task/$f" || echo "missing: $f"
done

# task-9 8ファイルの実在確認
for f in \
  task-020b-task-9a-skill-editor.md \
  task-023e-task-9d-skill-chain.md \
  task-023f-task-9e-skill-fork.md \
  task-022-task-9f-skill-share.md \
  task-023a-task-9g-skill-schedule.md \
  task-023b-task-9h-skill-debug.md \
  task-023c-task-9i-skill-docs.md \
  task-023d-task-9j-skill-analytics.md
  do
  test -f "docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/$f" || echo "missing: $f"
done

# UI契約の重要キーワード確認
rg -n 'skill:importFromSource|onExport|safeOn|skill:debug:event' \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-031b-ui-05b-skill-advanced-views.md

# SubAgent仕様の存在確認
ls -1 docs/30-workflows/completed-tasks/task-013-subagent-team/*.md

# SubAgent-D 出力ファイルの存在確認
for f in \
  final-execution-sequence.md \
  parallelization-boundary.md \
  subagent-audit-report-2026-02-25.md
  do
  test -f "docs/30-workflows/completed-tasks/task-013-subagent-team/outputs/$f" || echo "missing: $f"
done

# 監査検出結果16件の統合確認
rg -c 'AUDIT-|E-1|T-1|M-[123]|S-1|C-1|C-BOUNDARY' \
  docs/30-workflows/completed-tasks/task-013-subagent-team/task-013d-sequence-redesign.md
```

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                        |
| ---------------------------- | ------ | -------- | ------------------------------------------- |
| 旧参照パスが再混入する       | 高     | 中       | 参照追加時に `test -f` を必須化             |
| 並列監査結果の統合漏れ       | 中     | 中       | SubAgent-D を統合責任者に固定               |
| UI先行で契約が再ドリフトする | 高     | 中       | Wave 1/2 完了前に UI 更新しないルールを明記 |
| Date 方針の表記ゆれ          | 中     | 中       | `ISO 8601` 文字列表記を統一ルール化         |

---

## 8. 参照資料

### 関連ドキュメント

- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-020a-task-9b-skill-creator.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-020b-task-9a-skill-editor.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023a-task-9g-skill-schedule.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023b-task-9h-skill-debug.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023c-task-9i-skill-docs.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023d-task-9j-skill-analytics.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023e-task-9d-skill-chain.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023f-task-9e-skill-fork.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-031a-ui-05a-skill-editor-view.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-031b-ui-05b-skill-advanced-views.md`

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                                        | 内容                                           |
| ------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Skill IPC 契約            | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | `safeInvoke/safeOn` と Skill API 契約の正本    |
| Skill UI 契約             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`              | Renderer 側 API/型契約の正本                   |
| Agent IPC API             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC チャネル/引数/戻り値の仕様                 |
| Electron IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | P42/P44/P45 の検証ルール                       |
| Skill IPC セキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | Skill専用 IPC の検証ルール                     |
| 実装パターン              | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S19-S21（Date/引数object/ギャップ検出）        |
| IPC 契約チェックリスト    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC 3層契約（Main/Preload/Renderer）の監査手順 |
| IPC 型解決ガイド          | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`            | Date/引数形式/safeOn 購読の解決パターン        |
| UI 機能コンポーネント     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillCenter/SkillEditor など UI 責務の参照元   |
| タスク台帳                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 依存関係と残課題の正本                         |
| 教訓集                    | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再発防止パターンと苦戦箇所                     |
| 早見表                    | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | IPC/型/運用ルールのクイック参照                |
| リソースマップ            | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 要件別の参照先特定起点                         |
| 仕様記述ガイド            | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`                      | 仕様書の命名・記述ルール                       |
| タスク運用ルール          | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | タスク進行時の運用制約と整合ルール             |

---

## 9. 備考

### レビュー指摘の要約

```text
task-9 の8ファイルを漏れなく確認し、UI/バックエンドの依存順序とデータ受け渡しの矛盾をなくすこと。
仕様策定時は実装を行わず、SubAgent 分担と参照正本の明示を優先すること。
```

### 補足事項

- 本タスクは「仕様書作成」専用。実装フェーズ移行時はこの順序表をそのまま実行計画に転用する。
- SubAgent 仕様書は SubAgent Team の役割分担テンプレートとして再利用可能。
