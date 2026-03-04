# Phase 1: 要件定義 — Phase 12 SubAgent成果物固定ガード

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 1                                          |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001 |
| タスク名   | Phase 12 SubAgent成果物固定ガード          |
| Issue      | #955                                       |
| 分類       | 改善（docs/chore）                         |
| 機能名     | phase12-subagent-artifact-guard            |
| 前提Phase  | -                                          |
| 後続Phase  | Phase 2                                    |
| 作成日     | 2026-03-03                                 |
| ステータス | pending                                    |

## 目的

Phase 12 の仕様同期における「SubAgent責務」と「検証証跡」の成果物標準化要件を抽出し、受け入れ基準を定義する。本タスクは新機能実装ではなく、Phase 12 運用品質の固定化が目的である。

## 背景

`UT-UI-05A-GETFILETREE-001` の Phase 12 追補で以下が確認された:

- `spec-update-summary.md` だけでは「誰がどの仕様書を同期したか」が追跡しにくい
- Step 2 判定は実施していても、三点突合が毎回手作業になりやすい
- 親タスクで顕在化した苦戦箇所が再発しやすい

これらを標準化し、同種課題の再確認を短時間で再現可能にする。

## SubAgent分担

| SubAgent | 担当                                                       |
| -------- | ---------------------------------------------------------- |
| A        | テンプレート・成果物構造の要件（summary/report/changelog） |
| B        | 三点突合ルール・監査基準の要件                             |
| C        | 運用手順・未タスク同期の要件                               |
| D        | aiworkflow-requirements 抽出要件（resource-map起点）       |

## 実行タスク

- Task 1-1 要件抽出: SubAgent責務固定と成果物整合の要件を抽出する
- Task 1-2 受け入れ基準作成: 各要件の検証可能な判定条件を定義する
- Task 1-3 FR/NFR分類: 機能要件と非機能要件を分類して優先度を付与する

### Task 1-1: 要件抽出

SubAgent責務固定、三点突合ルール、成果物整合手順の機能要件を未タスク指示書と既存テンプレートから抽出する。

#### 手順

1. `.claude/skills/aiworkflow-requirements/indexes/resource-map.md` を起点に、Phase 12運用改善タスクで参照すべき仕様カテゴリを特定する
2. `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` で該当セクションを特定し、対象仕様書の読み取り範囲を確定する
3. `node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "task-workflow" -C 2` と `search-spec.js "lessons-learned" -C 2` を実行し、抽出根拠を収集する
4. 未タスク指示書（`docs/30-workflows/unassigned-task/task-imp-phase12-subagent-artifact-guard-001.md`）のセクション2.2「最終ゴール」と3.4「推奨アプローチ」から要件候補を抽出する
5. 既存テンプレート2点を分析し、テンプレート構造要件を定義する:
   - `phase12-system-spec-retrospective-template.md` のセクション3「仕様書別SubAgent分担」
   - `phase12-spec-sync-subagent-template.md` のセクション2「SubAgent分担」
6. `spec-update-workflow.md` の Step 1-G「検証コマンド順次実行」から監査基準要件を抽出する
7. 親タスク教訓（Main/Preload契約差、成果物名ドリフト、メタ情報重複、SubAgent責務不残存）を要件化する

### Task 1-2: 受け入れ基準作成

各要件に対して検証可能な受け入れ基準を Given/When/Then 形式で定義する。

#### 手順

1. 各機能要件に対して判定条件を数値で定義する
2. 監査スクリプトの実行結果と紐づけた検証可能な基準を設定する
3. 「currentViolations=0」を合否基準として定式化する

### Task 1-3: FR/NFR分類

機能要件（テンプレート構造、監査スクリプト）と非機能要件（再利用性、保守性）を分類する。

#### 手順

1. FR（機能要件）: テンプレート準拠構造、SubAgent責務マトリクス、三点突合アルゴリズム、監査スクリプト連携
2. NFR（非機能要件）: テンプレート再利用性、運用手順の保守性、成果物名一貫性

## 参照資料

### 未タスク指示書

| 資料名         | パス                                                                                | 用途                   |
| -------------- | ----------------------------------------------------------------------------------- | ---------------------- |
| 未タスク指示書 | `docs/30-workflows/unassigned-task/task-imp-phase12-subagent-artifact-guard-001.md` | 要件・ゴール・教訓確認 |

### Phase 12テンプレート

| 資料名                         | パス                                                                                | 用途                          |
| ------------------------------ | ----------------------------------------------------------------------------------- | ----------------------------- |
| 仕様更新・苦戦箇所テンプレート | `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md` | summary構造・SubAgent分担確認 |
| SubAgent同期テンプレート       | `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`        | report構造・完了条件確認      |

### 運用ワークフロー

| 資料名                     | パス                                                                                 | 用途                 |
| -------------------------- | ------------------------------------------------------------------------------------ | -------------------- |
| spec-update-workflow       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`       | Step 1-G検証手順確認 |
| unassigned-task-guidelines | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 未タスク品質基準確認 |

### システム仕様（aiworkflow-requirements）

| 資料名          | パス                                                                   | 用途                 |
| --------------- | ---------------------------------------------------------------------- | -------------------- |
| task-workflow   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 完了台帳・残課題確認 |
| lessons-learned | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 再発防止知見確認     |

### 抽出インデックス（aiworkflow-requirements）

| 資料名         | パス                                                             | 用途                                   |
| -------------- | ---------------------------------------------------------------- | -------------------------------------- |
| resource-map   | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md` | タスク種別から参照先仕様書を逆引きする |
| topic-map      | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`    | 対象セクションを行単位で特定する       |
| search-spec.js | `.claude/skills/aiworkflow-requirements/scripts/search-spec.js`  | キーワードで仕様抽出結果を機械取得する |

### 既存成果物（参考）

| 資料名                | パス                                                                                              | 用途              |
| --------------------- | ------------------------------------------------------------------------------------------------- | ----------------- |
| getfiletree summary   | `docs/30-workflows/completed-tasks/getfiletree-ipc/outputs/phase-12/spec-update-summary.md`       | summary実例確認   |
| getfiletree report    | `docs/30-workflows/completed-tasks/getfiletree-ipc/outputs/phase-12/spec-sync-subagent-report.md` | report実例確認    |
| getfiletree changelog | `docs/30-workflows/completed-tasks/getfiletree-ipc/outputs/phase-12/documentation-changelog.md`   | changelog実例確認 |

## 統合テスト連携

本タスクはドキュメント改善タスクのため、コード実装の統合テストは対象外。以下の監査スクリプト実行結果検証を「統合テスト」として位置づける:

| 検証項目             | スクリプト                                   | 期待結果               |
| -------------------- | -------------------------------------------- | ---------------------- |
| 未タスクリンク整合   | `verify-unassigned-links.js`                 | `missing: 0`           |
| 未タスク形式監査     | `audit-unassigned-tasks.js --target-file`    | `currentViolations: 0` |
| 差分監査             | `audit-unassigned-tasks.js --diff-from HEAD` | `currentViolations: 0` |
| テンプレート構造検証 | summary/report/changelogの三点突合           | 全項目一致             |

## 多角的チェック観点

| 観点         | 確認内容                                              | 参照仕様                                        |
| ------------ | ----------------------------------------------------- | ----------------------------------------------- |
| テンプレート | summary/report/changelogの構造一貫性                  | `phase12-system-spec-retrospective-template.md` |
| 監査基準     | current/baselineの分離判定が明確か                    | `spec-update-workflow.md` Step 1-G              |
| 再利用性     | 別タスクで同じテンプレートを使って再現可能か          | `phase12-spec-sync-subagent-template.md`        |
| 教訓反映     | 親タスク4教訓が全て要件化されているか                 | 未タスク指示書 セクション3.5                    |
| 未タスク品質 | 10見出しフォーマット・メタ情報1件原則が守られているか | `unassigned-task-guidelines.md`                 |

## 成果物

| 成果物         | パス                                         | 内容                          |
| -------------- | -------------------------------------------- | ----------------------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | FR/NFR分類付き要件一覧        |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | Given/When/Then形式の判定条件 |
| スコープ定義書 | `outputs/phase-1/scope-definition.md`        | 含む/含まないの境界定義       |

## 完了条件

- [x] 4つの最終ゴールに対応する機能要件が全件抽出されている（FR-01〜FR-04）
- [x] 親タスク由来の4教訓が要件として反映されている（FR-05〜FR-08）
- [x] aiworkflow-requirements の resource-map/topic-map/search-spec を用いた抽出根拠が記録されている（requirements-definition.md §1）
- [x] 各要件に検証可能な受け入れ基準が紐づいている（acceptance-criteria.md AC-FR-01〜AC-NFR-04）
- [x] FR/NFR分類が完了し、優先度が付与されている（requirements-definition.md §2〜3）
- [x] スコープ（含む/含まない）が明確に定義されている（scope-definition.md §2〜3）
- [x] 依存タスク3件との関係が明記されている（scope-definition.md §5、requirements-definition.md §6）
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料を確認する（未タスク指示書 + テンプレート2点 + spec-update-workflow）
2. Task 1-1: 要件抽出を実施する
3. Task 1-2: 受け入れ基準を作成する
4. Task 1-3: FR/NFR分類を実施する
5. 成果物を `outputs/phase-1/` に配置する
6. 完了条件を確認する

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] Phase内で定義した成果物を全件記録
- [x] 引き継ぎ情報を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard
```

## Phase実行記録

| 項目         | 記録                                                                                                                                                                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 実行タスク   | Task 1-1（要件抽出）: 10FR + 4NFR = 計14件の要件を抽出・定義。Task 1-2（受け入れ基準）: AC-FR-01〜AC-FR-10 + AC-NFR-01〜AC-NFR-04 = 計14件のGiven/When/Then形式受け入れ基準を作成。Task 1-3（FR/NFR分類）: FR 10件・NFR 4件に分類し優先度を付与。                     |
| 発見事項     | resource-map.md起点の逆引きで task-workflow / lessons-learned を優先参照先と特定。getfiletree-ipc 実例成果物との比較でsummary/report両方の作成が必須であることを確認。親タスク4教訓（FR-05〜FR-08）はいずれも「記述パターンの明示」要件であり設計への引き継ぎが必要。 |
| 引き継ぎ事項 | Phase 2（設計）への引き継ぎ: FR-01〜FR-04（4ゴール対応要件）の設計実現方法を具体化する。FR-09（監査スクリプト順次実行）の順序を設計仕様書に明記する。依存タスク3件（UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001等）との境界をscope-definition.md §5に記録済み。       |

## 次のPhase

Phase 2: 設計
