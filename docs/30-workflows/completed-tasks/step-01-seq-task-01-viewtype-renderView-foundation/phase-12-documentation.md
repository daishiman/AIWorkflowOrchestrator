# Phase 12: ドキュメント

## メタ情報

| 項目      | 内容                                        |
| --------- | ------------------------------------------- |
| Phase番号 | 12                                          |
| 機能名    | viewtype-renderView-foundation              |
| タスクID  | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 |
| 作成日    | 2026-03-17                                  |

## 目的

`implementation-guide`（Part 1 / Part 2）、システム仕様書更新（`.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` 等 + `outputs/phase-12/spec-update-summary.md`）、`documentation-changelog`、未タスク検出（`outputs/phase-12/unassigned-task-detection.md`）、スキルフィードバックレポートを作成する。P43 対策として、仕様書更新は 3 ファイル以下 / エージェントに分割し、`outputs/phase-12/documentation-changelog.md` への「完了」記録は全 Step 完了後の最終ステップとする。

## 実行タスク

| #   | タスク名                         | 説明                                                                |
| --- | -------------------------------- | ------------------------------------------------------------------- |
| 1   | 技術ドキュメント作成             | 実装ガイド Part 1（概念説明）/ Part 2（技術詳細）                   |
| 2   | システムドキュメント更新         | Step 1: 完了記録、Step 2: システム仕様更新                          |
| 3   | ドキュメント更新履歴             | documentation-changelog.md作成 & artifacts.json更新                 |
| 4   | 未タスク検出                     | `outputs/phase-12/unassigned-task-detection.md` 作成（0件でも必須） |
| 5   | スキルフィードバックレポート作成 | skill-feedback-report.md作成（改善点なしでも必須）                  |

- Task 12-1: 技術ドキュメント作成（実装ガイド - Part 1/Part 2）
- Task 12-2: システムドキュメント更新（Step 1: 完了記録, Step 2: システム仕様更新）
- Task 12-3: ドキュメント更新履歴 & artifacts.json更新
- Task 12-4: 未タスク検出
- Task 12-5: スキルフィードバックレポート作成

## 参照資料

### タスク関連

| 資料名                      | パス                                                                           | 説明                              |
| --------------------------- | ------------------------------------------------------------------------------ | --------------------------------- |
| Phase 2 設計仕様書          | `phase-2-design.md`                                                            | システム仕様へ反映すべき設計意図  |
| Phase 5 実装仕様書          | `phase-5-implementation.md`                                                    | 実装内容の記録対象整理            |
| Phase 6 テスト拡充          | `phase-6-test-expansion.md`                                                    | 検証観点の反映内容整理            |
| Phase 7 カバレッジ結果      | `outputs/phase-7/coverage-report.md`                                           | 品質指標の記録                    |
| Phase 8 リファクタリング    | `outputs/phase-8/refactoring-log.md`                                           | 変更点・改善点の反映              |
| Phase 9 品質検証結果        | `outputs/phase-9/qa-results.md`                                                | lint/typecheck/test 実績          |
| Phase 10 最終レビュー結果   | `outputs/phase-10/final-review-report.md`                                      | 最終判定と未タスク化対象の確認    |
| Phase 11 手動テスト結果     | `outputs/phase-11/manual-test-result.md`                                       | 手動テスト結果                    |
| Phase 12 必須チェックリスト | `.claude/rules/05-task-execution.md`                                           | Phase 12チェックリスト            |
| 既知の落とし穴              | `.claude/rules/06-known-pitfalls.md`                                           | P1-P4, P25-P29, P43, P51, P57-P59 |
| システム仕様書更新手順      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 仕様書更新ワークフロー            |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                     | 説明                                |
| -------------------- | -------------------------------------------------------- | ----------------------------------- |
| ナビゲーションUI設計 | `aiworkflow-requirements: ui-ux-navigation.md`           | ViewType一覧・Global Navigation設計 |
| 状態管理             | `aiworkflow-requirements: arch-state-management-core.md` | Zustand Store・ViewType状態管理     |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                       | カバレッジ基準・TDD設計             |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                     | P1-P4/P25-P29/P43/P51/P57-P59       |

## 事前チェック【必須】

Phase 12 開始前に、以下の落とし穴を確認すること:

| Pitfall | 内容                                        | 対策                                                          |
| ------- | ------------------------------------------- | ------------------------------------------------------------- |
| P1      | LOGS.md 2ファイル更新漏れ                   | aiworkflow-requirements + task-specification-creator 両方更新 |
| P2      | topic-map.md 再生成忘れ                     | `node generate-index.js` を必ず実行                           |
| P3      | 未タスク管理の3ステップ不完全               | 指示書→残課題テーブル→仕様書リンク 全実施                     |
| P4      | documentation-changelogへの早期「完了」記載 | 全Step完了後に記録                                            |
| P25     | LOGS.md 2ファイル更新漏れ（再発）           | P1と同じ対策                                                  |
| P26     | システム仕様書更新遅延                      | Phase 12完了時点で実更新                                      |
| P27     | topic-map再生成トリガー判断ミス             | 追加/削除/更新いずれでも再生成                                |
| P28     | スキルフィードバックレポート未作成          | 改善点なしでもレポート作成必須                                |

## 漏れやすいポイント（06-known-pitfalls.md参照）

| Pitfall | 要約                                      | Phase 12 での確認アクション                  |
| ------- | ----------------------------------------- | -------------------------------------------- |
| P43     | サブエージェントのrate limit中断          | 仕様書更新は3ファイル以下/エージェントに分割 |
| P51     | サブエージェントのchangelog早期完了記載   | changelog作成は全Task完了後の最終ステップ    |
| P57     | 設計タスクでのシステム仕様書更新先送り    | 設計タスクでもPhase 12で実更新               |
| P58     | 設計タスクでの未タスク指示書の配置省略    | 設計タスクでもunassigned-task/に指示書作成   |
| P59     | 並列エージェントによるchangelog件数不整合 | 最後に件数照合してからchangelog記録          |

## 実行手順

### Task 1: 実装ガイド作成

#### Part 1: 中学生レベル概念説明（日常例え必須）

`outputs/phase-12/implementation-guide.md` の Part 1 として以下を記載する:

**テーマ**: 「アプリの画面を増やす仕組み」

例え: ショッピングモールの案内板（ViewType）と各テナント（コンポーネント）の関係。新しいテナントが入るとき、案内板に追加して、店への道順（renderView の case）を増やすだけでよい。既存のテナントには影響しない。

- `ViewType` = 「どの画面を見せるか」の名前リスト
- `renderView()` = 「その名前に対応する画面を実際に表示する係」
- `onAction` = 「何かアクションが起きたときに呼ぶ電話番号（オプション）」

#### Part 2: 開発者向け実装詳細

`outputs/phase-12/implementation-guide.md` の Part 2 として以下を記載する:

1. **変更ファイル一覧と変更内容**
   - `store/types.ts`: ViewType ユニオン型に `"skillAnalysis"` `"skillCreate"` を追加
   - `skillLifecycleJourney.ts`: 対象インターフェースに `onAction?: () => void` を追加
   - `App.tsx`: `renderView()` に 2 case を追加

2. **実装パターン**
   - 型定義の依存方向に沿った実装順序（型 → ビジネスロジック → UI）
   - `Record<ViewType, Config>` を使用している箇所は新メンバーを網羅する必要がある

3. **注意点**
   - `onAction?.()` の optional chaining による安全な呼び出し
   - 既存 ViewType への後方互換性の維持

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

> P57 対策: 設計タスクでも Phase 12 完了時点で実ファイルを更新する。計画メモではなく実績ログのみ残す。

#### Step 1-A: タスク完了記録

以下のファイルを更新する（P43 対策: 3ファイル以下/エージェント に分割）:

**更新対象ファイル**:

1. `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` または同等の仕様書（ViewType 追加の記録）
2. `.claude/skills/aiworkflow-requirements/LOGS.md`（完了記録）
3. `.claude/skills/task-specification-creator/LOGS.md`（完了記録）— P1/P25 対策: 2ファイル両方必須

> 上記 3 ファイルを第 1 エージェントで更新する。

4. `.claude/skills/aiworkflow-requirements/SKILL.md`（変更履歴）— P29 対策
5. `.claude/skills/task-specification-creator/SKILL.md`（変更履歴）— P29 対策

> 上記 2 ファイルを第 2 エージェントで更新する（または第 1 エージェントと合計 3 ファイル以内に収める）。

各 LOGS.md への記録フォーマット:

```markdown
## TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 完了（2026-03-17）

### 変更内容

- store/types.ts: ViewType に "skillAnalysis" / "skillCreate" を追加
- skillLifecycleJourney.ts: onAction?: () => void を追加
- App.tsx: renderView() に 2 case を追加

### AC-1〜AC-6 全達成
```

#### Step 1-B: 実装状況テーブル更新

`ui-ux-navigation.md` 等の ViewType 一覧テーブルに `skillAnalysis` / `skillCreate` を追加する。

#### Step 1-C: 関連タスクテーブル確認

```bash
grep -rn "TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001" .claude/skills/
```

関連する仕様書が見つかった場合は参照リンクを追加する。

#### Step 1-D: topic-map.md 再生成

> P2/P27 対策: セクションの追加・削除・更新のいずれの場合も再生成を実行する。

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js 2>&1
```

実行ログを記録し、`outputs/phase-12/topic-map-regeneration.log` として保存する。

#### Step 2: システム仕様更新

`ui-ux-navigation.md`（または該当仕様書）に以下を追加する:

- ViewType `skillAnalysis`: スキル分析画面
- ViewType `skillCreate`: スキル作成画面
- `onAction?: () => void`: スキルライフサイクルジャーニーのアクションコールバック

### Task 3: documentation-changelog.md 作成

> P4/P51 対策: 全 Step 完了を確認してから「完了」と記載する。

`outputs/phase-12/documentation-changelog.md` を作成する:

```markdown
## TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 ドキュメント変更記録

### Step 1-A: タスク完了記録

- [ ] ui-ux-navigation.md 更新: 実行結果を記録
- [ ] aiworkflow-requirements/LOGS.md 更新: 実行結果を記録
- [ ] task-specification-creator/LOGS.md 更新: 実行結果を記録（P1/P25対策）
- [ ] aiworkflow-requirements/SKILL.md 更新: 実行結果を記録
- [ ] task-specification-creator/SKILL.md 更新: 実行結果を記録（P29対策）

### Step 1-B: 実装状況テーブル

- [ ] ViewType テーブルに skillAnalysis / skillCreate 追加: 実行結果を記録

### Step 1-C: 関連タスクテーブル確認

- [ ] grep 実行結果: 0件 / N件（該当ファイル名を記録）

### Step 1-D: topic-map.md 再生成

- [ ] node generate-index.js 実行: 実行ログを記録（P2/P27対策）

### Step 2: システム仕様更新

- [ ] ui-ux-navigation.md に ViewType 追加記録

### Task 1: 実装ガイド

- [ ] outputs/phase-12/implementation-guide.md 作成完了

### Task 3 全Step完了確認

- [ ] 上記全Stepの完了を確認してから「完了」と記録する（P4対策）
```

### Task 4: 未タスク検出

> P3/P38 対策: 0 件でも必須。独立した指示書ファイルを `docs/30-workflows/unassigned-task/` に作成する。

`outputs/phase-12/unassigned-task-detection.md` を作成し、以下を確認する:

1. Phase 10 の MINOR 指摘（未タスク変換済みのもの）
2. 実装中に発見した改善点
3. スコープ外だが後続タスクで対応すべき事項

検出した未タスクに対して 3 ステップを実行する:

1. `docs/30-workflows/unassigned-task/` に指示書ファイルを作成（P58対策: 設計タスクでも省略不可）
2. `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle.md` 残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

P59 対策: 検出件数は `outputs/phase-12/unassigned-task-detection.md` と照合し、不整合がないことを確認する。

### Task 5: スキルフィードバックレポート

> P28 対策: 改善点がなくても「改善点なし」としてレポートを作成する。

`outputs/phase-12/skill-feedback-report.md` を作成する:

```markdown
## スキルフィードバックレポート

### 改善点

（改善点がある場合は記載する。なければ「改善点なし」と記載する）

### 再発防止策

（P番号参照があれば記載する）
```

## 苦戦箇所の記録【推奨】

Phase 12 実行中に苦戦した箇所を記録する。後続タスクの Phase 12 効率化に活用する。

| 箇所 | 苦戦内容 | 解決方法 | 所要時間 |
| ---- | -------- | -------- | -------- |
| -    | -        | -        | -        |

## フォールバック手順

Phase 12 の各タスクが失敗した場合の対処:

| タスク | 失敗パターン                   | フォールバック                                                              |
| ------ | ------------------------------ | --------------------------------------------------------------------------- |
| Task 1 | 実装ガイド作成でブロック       | Part 1/Part 2 を分割して個別に作成                                          |
| Task 2 | 仕様書更新でrate limit到達     | 3ファイル以下/エージェントに再分割（P43対策）                               |
| Task 3 | changelog作成で件数不整合      | `outputs/phase-12/unassigned-task-detection.md` と照合後に再作成（P59対策） |
| Task 4 | 未タスク検出でgrepが大量ヒット | 関連性の高いものに絞り込み、残りは後続タスクへ                              |
| Task 5 | フィードバック内容が不明確     | 「改善点なし」として最低限のレポートを作成                                  |

## 統合テスト連携

| 連携対象                  | 確認内容                                             | 確認結果 |
| ------------------------- | ---------------------------------------------------- | -------- |
| Phase 11 手動テスト結果   | 手動テストで発見された課題が未タスク化されていること | -        |
| Phase 10 最終レビュー指摘 | MINOR指摘が全て未タスク仕様書に変換されていること    | -        |
| artifacts.json            | Phase 12のステータスが更新されていること             | -        |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | DB操作の場合                       | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | 必須 | 概念+技術ドキュメント     |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | 必須 | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 必須 | 検出結果（0件でも出力）   |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 必須 | 改善点（0件でも作成必須） |
| topic-map再生成ログ  | `outputs/phase-12/topic-map-regeneration.log`   | 必須 | 再生成実行ログ            |

## 完了条件

### Task 1: 実装ガイド

- [ ] `implementation-guide.md` Part 1（中学生レベル・日常例え）が記載されている
- [ ] `implementation-guide.md` Part 2（開発者向け実装詳細）が記載されている

### Task 2: システム仕様書更新

- [ ] `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`（または同等仕様書）に ViewType 追加が記録されている
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` が更新されている（P1/P25対策）
- [ ] `.claude/skills/task-specification-creator/LOGS.md` が更新されている（P1/P25対策、2ファイル両方）
- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md` 変更履歴が更新されている（P29対策）
- [ ] `.claude/skills/task-specification-creator/SKILL.md` 変更履歴が更新されている（P29対策）
- [ ] 関連タスクテーブルの grep 確認が完了している（Step 1-C）
- [ ] `node generate-index.js` を実行し topic-map.md が再生成されている（P2/P27対策）

### Task 3: documentation-changelog

- [ ] `documentation-changelog.md` が作成されている
- [ ] 全 Step の完了を確認してから「完了」と記録されている（P4対策）
- [ ] 検出件数が `outputs/phase-12/unassigned-task-detection.md` と一致している（P59対策）

### Task 4: 未タスク検出

- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている（0件でも必須）
- [ ] 検出した未タスクの 3 ステップが全て完了している（P3/P38/P58対策）
- [ ] `outputs/phase-12/unassigned-task-detection.md` の件数・ステータスが更新されている

### Task 5: スキルフィードバック

- [ ] `skill-feedback-report.md` が作成されている（改善点なしでも必須、P28対策）

- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 事前チェック（落とし穴確認）
3. Task 12-1: 技術ドキュメント作成（実装ガイド Part 1/Part 2）
4. Task 12-2: システムドキュメント更新（Step 1-A〜Step 2）
5. Task 12-3: ドキュメント更新履歴 & artifacts.json更新
6. Task 12-4: 未タスク検出
7. Task 12-5: スキルフィードバックレポート作成
8. 統合テスト連携の確認
9. 成果物の作成・配置
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation
```

## 次Phase

Phase 13: 完了（phase-13-pr-creation.md）
