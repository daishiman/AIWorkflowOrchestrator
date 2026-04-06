# Phase 12: ドキュメント更新 - TASK-P0-07 ハードコードされた AGENT_NAMES の動的解決

## メタ情報

| 項目      | 値                                                      |
| --------- | ------------------------------------------------------- |
| Phase     | 12                                                      |
| Phase名   | ドキュメント更新                                        |
| 機能名    | TASK-P0-07-hardcoded-agent-names-dynamic-resolution     |
| 作成日    | 2026-04-06                                              |
| タスクID  | TASK-P0-07                                              |
| カテゴリ  | NON_VISUAL（UI変更なし、Main Process リファクタリング） |
| 前提Phase | Phase 11: 手動テスト検証                                |
| 後続Phase | Phase 13: PR作成                                        |

---

## 目的

TASK-P0-07 の実装内容を正式なプロジェクトドキュメントとして記録し、manifest を主正本としたエージェントリソース動的解決の設計・実装詳細を後続開発者向けに整備する。仕様書完了記録（LOGS.md / SKILL.md）の同時更新、未タスク検出、スキルフィードバックを行う。

---

## 実行タスク

- Task 12-1: 実装ガイド作成（2パート構成）
- Task 12-2: システムドキュメント更新
- Task 12-3: ドキュメント更新履歴作成
- Task 12-4: 未タスク検出レポート
- Task 12-5: スキルフィードバックレポート

---

## 参照資料

| 資料名                    | パス                                                                  | 説明                                   |
| ------------------------- | --------------------------------------------------------------------- | -------------------------------------- |
| Phase 1 要件定義          | `phase-1-requirements.md`                                             | FR/NFR/AC 定義                         |
| Phase 2 設計              | `phase-2-design.md`                                                   | 設計仕様・データフロー図               |
| Phase 3 設計レビュー      | `phase-3-design-review.md`                                            | レビュー判定結果                       |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | plan()/improve() の動的・静的パス実装  |
| manifestResourceResolver  | `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`  | buildPhaseResourceRequestsFromManifest |
| planPromptConstants       | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`       | PLAN_RESOURCE_REQUESTS 静的定義        |
| improvePromptConstants    | `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`    | IMPROVE_RESOURCE_REQUESTS 静的定義     |
| workflow-manifest.json    | `.claude/skills/skill-creator/workflow-manifest.json`                 | manifest 正本                          |
| Phase 11 テスト結果       | `outputs/phase-11/manual-test-result.md`                              | 自動テスト代替エビデンス               |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                                        | 内容                               |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Main Process サービス設計          |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | リファクタリングパターン           |
| インターフェース契約 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill Creator SDK インターフェース |
| 完了記録             | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`              | タスク完了記録                     |
| topic-map            | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                               | トピックマップ                     |

### LOGS.md / SKILL.md（同時更新対象）

| ファイル                                             | 説明                             |
| ---------------------------------------------------- | -------------------------------- |
| `.claude/skills/task-specification-creator/LOGS.md`  | タスク仕様書作成スキルの変更履歴 |
| `.claude/skills/task-specification-creator/SKILL.md` | タスク仕様書作成スキルの仕様     |
| `.claude/skills/aiworkflow-requirements/LOGS.md`     | 要件仕様スキルの変更履歴         |
| `.claude/skills/aiworkflow-requirements/SKILL.md`    | 要件仕様スキルの仕様             |

---

## 実行手順

### Task 12-1: 実装ガイド作成（2パート構成）

**目的**: TASK-P0-07 の実装詳細を後続開発者向けにドキュメント化する。中学生レベルの概念説明と技術者レベルの詳細を2パートで構成する。

#### Part 1: 中学生レベル概念説明

**「manifest = レシピ本」の例え話で動的解決を説明する**。

記載すべき内容:

1. **「動的解決」とは何か**
   - たとえば「お店の料理メニューを変えたいとき、今まではお店の壁のメニューを直接書き換えていたけど、これからはレシピ本を更新すればメニューが自動で変わるようにする」のような説明
   - 「ハードコード」= 壁に直接書いたメニュー（変えるのが大変）
   - 「manifest」= レシピ本（1つの本を更新すれば全部変わる）

2. **「フォールバック」とは何か**
   - レシピ本がなくなったり、ページが破れていたりしても、壁に書いてある古いメニューで料理は出せる（お店が止まらない）

3. **「リファクタリング」とは何か**
   - お店の仕組みを変えるけど、お客さんから見たらメニューは同じ。裏方の仕組みだけが良くなる

4. **この変更で何が嬉しいか**
   - 新しい料理人（エージェント）を追加したいとき、レシピ本に書き足すだけでOK。お店の壁を書き換えなくていい

#### Part 2: 技術者レベル詳細

記載すべき内容:

1. **`buildPhaseResourceRequestsFromManifest()` のシグネチャ**

   ```typescript
   function buildPhaseResourceRequestsFromManifest(
     manifest: LoadedWorkflowManifest,
     phaseId: string,
     fallback: readonly PhaseResourceRequest[],
   ): PhaseResourceRequest[];
   ```

2. **変換ロジック詳細**
   - manifest.phases → phaseId 一致検索
   - resourceIds → manifest.resources マッピング
   - path 変換ルール（`./` prefix 除去）
   - kind → tier マッピング（agent → required-core、reference/schema/asset → optional-quality）

3. **フォールバック条件一覧**（Phase 2 設計の 5 パターン）
   - manifest に対象 phaseId が存在しない
   - フェーズの resourceIds が undefined
   - フェーズの resourceIds が空配列
   - resourceIds の全 ID が resources に見つからない
   - hasDynamicResourcePipeline() が false

4. **データフロー図**（Phase 2 設計のフロー図を転記・補完）

5. **変更ファイル一覧と変更概要**

**出力先**: `outputs/phase-12/implementation-guide.md`

---

### Task 12-2: システムドキュメント更新

**目的**: プロジェクト全体のシステムドキュメントを TASK-P0-07 の完了に合わせて更新する。

#### Step 1-A: 仕様書完了記録（LOGS.md x2、SKILL.md x2 同時更新）

以下の4ファイルを**同一ターンで同時更新**し、`.agents/skills/...` mirror も同波で同期する（P1/P25/P29 対策）:

1. `.claude/skills/task-specification-creator/LOGS.md`
   - TASK-P0-07 Phase 12 close-out sync エントリを追加
   - `buildPhaseResourceRequestsFromManifest` 新規インターフェース追加を記録

2. `.claude/skills/task-specification-creator/SKILL.md`
   - 変更履歴テーブルに TASK-P0-07 エントリを追加
   - バージョン番号をインクリメント

3. `.claude/skills/aiworkflow-requirements/LOGS.md`
   - TASK-P0-07 Phase 12 close-out sync エントリを追加
   - manifest 動的解決パターンの追加を記録

4. `.claude/skills/aiworkflow-requirements/SKILL.md`
   - 変更履歴テーブルに TASK-P0-07 エントリを追加
   - バージョン番号をインクリメント

> 上記4ファイルは canonical の更新後、mirror parity を確認する。

#### Step 1-B: 実装状況テーブル更新

`task-workflow-completed.md` に TASK-P0-07 の完了記録を追加する:

| 項目                 | 値                                                        |
| -------------------- | --------------------------------------------------------- |
| タスクID             | TASK-P0-07                                                |
| タスク名             | ハードコードされた AGENT_NAMES の動的解決                 |
| ステータス           | completed                                                 |
| 完了日               | （Phase 13 完了時に記入）                                 |
| 主要変更ファイル     | manifestResourceResolver.ts, RuntimeSkillCreatorFacade.ts |
| 新規インターフェース | buildPhaseResourceRequestsFromManifest()                  |

#### Step 1-C: 関連タスクテーブル更新

TASK-P0-07 と関連するタスク（TASK-P0-03, TASK-P0-04, TASK-P0-05）の相互参照を更新する。

#### Step 1-D: topic-map.md / keywords.json 再生成

`.claude/skills/aiworkflow-requirements/indexes/topic-map.md` / `keywords.json` を再生成する:

- `buildPhaseResourceRequestsFromManifest` のエントリを追加
- `manifestResourceResolver` のエントリを追加
- manifest 動的解決パターンのトピックを追加
- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して indexes を再生成する

#### Step 2: 新規インターフェース追加

`buildPhaseResourceRequestsFromManifest` のインターフェース仕様を以下に追記する:

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
  - 関数シグネチャ
  - 入出力型
  - フォールバック仕様

**出力先**: `outputs/phase-12/system-spec-update-summary.md`（更新内容のサマリー）

---

### Task 12-3: ドキュメント更新履歴作成

**目的**: TASK-P0-07 で変更・追加された全ファイルの一覧を記録する。

**記載内容**:

| #   | ファイルパス                                                                                 | 変更種別 | 変更概要                                              |
| --- | -------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------- |
| 1   | `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`                         | 新規     | buildPhaseResourceRequestsFromManifest ユーティリティ |
| 2   | `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts`          | 新規     | ユーティリティのユニットテスト                        |
| 3   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                        | 変更     | plan()/improve() の動的パスで manifest 解決を使用     |
| 4   | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`    | 変更     | plan の manifest 動的解決テスト追加                   |
| 5   | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts` | 変更     | improve の manifest 動的解決テスト追加                |

**出力先**: `outputs/phase-12/documentation-changelog.md`

---

### Task 12-4: 未タスク検出レポート

**目的**: TASK-P0-07 の実装過程で検出された未タスク（Unassigned Task）を記録・追跡する。0件でも出力必須。

**確認対象**:

- Phase 1〜11 の全 Phase で検出された未タスクをリストアップ
- 新規の未タスクが発見された場合は ID を採番して記録

**出力形式**:

| 未タスクID                                                       | 内容 | 検出Phase | ステータス | 対応方針 |
| ---------------------------------------------------------------- | ---- | --------- | ---------- | -------- |
| （あれば記載、なければ「検出された未タスクはありません」と明記） | -    | -         | -          | -        |

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

---

### Task 12-5: スキルフィードバックレポート

**目的**: TASK-P0-07 の実装を通じて得られた改善点・知見を記録する。改善点なしでも出力必須。

**記載セクション**:

1. **タスク仕様書の改善点**
   - Phase 間の依存関係で不明確だった点
   - NON_VISUAL タスクにおける Phase 11 の運用に関するフィードバック

2. **技術的知見**
   - manifest 動的解決パターンの実装における学び
   - フォールバック設計のベストプラクティス
   - 純粋関数によるモジュール分離のメリット

3. **プロセス改善提案**
   - NON_VISUAL タスクの検証プロセスに関する提案
   - manifest ベースのリソース管理に関する将来の拡張可能性

**出力先**: `outputs/phase-12/skill-feedback-report.md`

---

### Phase 10/11 MINOR追跡テーブル

Phase 10（最終レビューゲート）および Phase 11（手動テスト検証）で検出された Minor 問題を追跡する。

| #   | 検出Phase                      | 問題ID                    | 内容 | 優先度 | 対応状況 | 対応先タスク |
| --- | ------------------------------ | ------------------------- | ---- | ------ | -------- | ------------ |
| 1   | Phase 10（最終レビューゲート） | （Phase 10 実行時に記入） | -    | Minor  | 未対応   | -            |
| 2   | Phase 11（手動テスト検証）     | （Phase 11 実行時に記入） | -    | Minor  | 未対応   | -            |

---

## 統合テスト連携

Phase 12 はドキュメント作成フェーズのため直接的な統合テストは実施しないが、以下の確認を行う:

- **Phase 11 自動テスト結果の記録確認**: T-01, T-02 の結果が `outputs/phase-11/manual-test-result.md` に記載されていることを確認
- **ドキュメント正確性**: `outputs/phase-12/implementation-guide.md` に記載した変換ロジック・フォールバック条件が、Phase 11 の自動テスト結果と整合していることを確認

---

## 成果物

| 成果物           | パス                                             | 説明                                                   |
| ---------------- | ------------------------------------------------ | ------------------------------------------------------ |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`       | 2パート構成（中学生レベル + 技術者レベル）             |
| 仕様同期サマリー | `outputs/phase-12/system-spec-update-summary.md` | LOGS.md/SKILL.md/topic-map/keywords 更新内容のサマリー |
| 変更ログ         | `outputs/phase-12/documentation-changelog.md`    | 変更ファイル一覧                                       |
| 未タスク検出     | `outputs/phase-12/unassigned-task-detection.md`  | 未タスク記録（0件でも出力必須）                        |
| 改善レポート     | `outputs/phase-12/skill-feedback-report.md`      | 改善点・知見（改善点なしでも出力必須）                 |

---

## 完了条件

### Task 12-1 完了条件

- [ ] `outputs/phase-12/implementation-guide.md` が作成されている
- [ ] Part 1 に中学生レベルの概念説明（「manifest = レシピ本」の例え話）が含まれている
- [ ] Part 1 に「動的解決」「フォールバック」「リファクタリング」の平易な説明が含まれている
- [ ] Part 2 に `buildPhaseResourceRequestsFromManifest()` のシグネチャが記載されている
- [ ] Part 2 に変換ロジック詳細（path変換・kind→tierマッピング）が記載されている
- [ ] Part 2 にフォールバック条件一覧（5パターン）が記載されている
- [ ] Part 2 にデータフロー図が記載されている

### Task 12-2 完了条件

- [ ] `.claude/skills/task-specification-creator/LOGS.md` に TASK-P0-07 エントリが追加されている
- [ ] `.claude/skills/task-specification-creator/SKILL.md` に TASK-P0-07 エントリが追加されている（P1 対策）
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` に TASK-P0-07 エントリが追加されている
- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md` に TASK-P0-07 エントリが追加されている（P2 対策）
- [ ] 上記4ファイルが同一ターンで同時更新され、`.agents` mirror parity が確認されている（P25 対策）
- [ ] `task-workflow-completed.md` に TASK-P0-07 の完了記録が追加されている（P27 対策）
- [ ] `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` / `keywords.json` が再生成されている（P29 対策）
- [ ] `interfaces-agent-sdk-skill.md` に `buildPhaseResourceRequestsFromManifest` のインターフェース仕様が追記されている
- [ ] `outputs/phase-12/system-spec-update-summary.md` に更新内容のサマリーが記載されている

### Task 12-3 完了条件

- [ ] `outputs/phase-12/documentation-changelog.md` が作成されている
- [ ] 変更ファイルが網羅的に列挙されている（新規ファイル・変更ファイル）

### Task 12-4 完了条件

- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている（0件でも出力必須）
- [ ] 全 Phase（1〜11）で検出された未タスクが記録されている

### Task 12-5 完了条件

- [ ] `outputs/phase-12/skill-feedback-report.md` が作成されている（改善点なしでも出力必須）
- [ ] タスク仕様書の改善点・技術的知見・プロセス改善提案の3セクションが含まれている

### 全体完了条件

- [ ] Phase 10/11 MINOR追跡テーブルが更新されている
- [ ] SKILL.md の漏れやすいポイント P1（task-specification-creator/SKILL.md）が更新されている
- [ ] SKILL.md の漏れやすいポイント P2（aiworkflow-requirements/SKILL.md）が更新されている
- [ ] SKILL.md の漏れやすいポイント P25（LOGS.md x2 + SKILL.md x2 同時更新）が実施されている
- [ ] SKILL.md の漏れやすいポイント P27（task-workflow-completed.md 更新）が実施されている
- [ ] SKILL.md の漏れやすいポイント P29（topic-map.md / keywords.json 再生成）が実施されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 13: PR作成に進む。Phase 12 の全成果物が完了条件を満たしていることを確認してから進行する。
