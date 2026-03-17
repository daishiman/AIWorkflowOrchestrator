# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 12                           |
| Phase名    | ドキュメント                 |
| 前提Phase  | Phase 11（手動テスト 完了）  |
| 後続Phase  | Phase 13（PR作成）           |
| ステータス | 完了（2026-03-17 再監査）    |
| 作成日     | 2026-03-16                   |
| 機能名     | スキル共有・公開・互換性統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-08      |
| タスク種別 | 設計（docs-only モード）     |

---

## docs-only モードフラグ

**このフェーズは docs-only モードで実行する。** 実装コードの生成・実行・テストの自動実行は行わない。全タスクはドキュメント作成・更新のみで完結する。

| 通常モードの項目            | docs-only タスクでの対応                   |
| --------------------------- | ------------------------------------------ |
| Step 1-G 検証コマンド       | 実行して結果を成果物へ記録する             |
| implementation-guide Part 2 | 型定義・配置ルール・使用例のドキュメント化 |
| Step 1-B 実装状況           | `spec_created` として記録                  |
| テスト実行・カバレッジ確認  | validator 実行で仕様整合を確認する         |

---

## 目的

公開レベル（`SkillVisibility`）・互換性ルール（`CompatibilityCheckResult`）・Skill Center 接続仕様（`SkillRegistryService`）・配布操作（`SkillDistributionService`）・公開判定ロジック（`PublishReadiness`）をシステム仕様に同期し、5つの必須タスクを全て完了する。

---

## 背景

TASK-SKILL-LIFECYCLE-08 は設計専用タスクであり、Phase 1〜10 を通じて以下の成果物が作成された:

- `outputs/phase-1/`: 要件定義書（5ファイル）
- `outputs/phase-2/`: 設計書（5ファイル）
- `outputs/phase-3/`: レビューレポート（5ファイル）
- `outputs/phase-4/`: テスト仕様書（設計タスクのためテスト設計書）
- `outputs/phase-10/`: 最終レビューレポート
- `outputs/phase-11/`: ウォークスルー結果

Phase 12 では、これらの設計成果物をシステム仕様書（aiworkflow-requirements）に同期し、実装フェーズに引き継ぐ。P57（設計タスクでも Phase 12 内でシステム仕様書を実更新する）・P26（Phase 12 完了時点でシステム仕様書を更新する）に従い、PR マージを待たずに実更新を実施する。

---

## 実行タスク

> **重要**: 全5タスクを順番に完了してから `documentation-changelog.md` に「完了」と記録する。P4対策として、全 Step 確認前に「完了」と記載しない。

### Task 1: 実装ガイドの作成（2パート構成）

**目的**: 後続の実装者と非エンジニアの読者がこの設計の意図を正確に理解できる2パートのガイドを作成する。

#### Part 1: 中学生レベル向け説明

**実行手順**:

1. `outputs/phase-12/implementation-guide.md` に Part 1 を以下の構成で作成する:
   - **なぜ必要か**: スキルを「自分だけのもの」から「チームや世界と共有できるもの」にする理由を日常例えで説明する
     - 例え: 「手書きのレシピを家族だけに共有する（team）か、料理本として出版する（public）か」
   - **何をするか**: 公開レベル・バージョン管理・安全性チェックの3つの概念を、専門用語を使わずに説明する
     - 公開レベル: 「鍵のかかったメモ帳（local）」「クラスの共有ノート（team）」「図書館の本（public）」
     - バージョン管理: 「本の第1版・第2版。大きく変わったら版数が増える」
     - 安全性チェック: 「図書館の本として出版する前に、中身が危険でないか確認する審査」
   - 専門用語（TypeScript、API、semver 等）を一切使わない

#### Part 2: 開発者向け説明

**実行手順**:

1. `outputs/phase-12/implementation-guide.md` に Part 2 を以下の構成で追記する:
   - **TypeScript 型定義**:
     - `SkillVisibility` 型（`"local" | "team" | "public"`）と各値の意味
     - `CompatibilityCheckResult` 型（`level`, `breakingChanges`, `warnings`, `suggestedBump` フィールド）
     - `PublishReadiness` 型（`"auto-approved" | "review-required" | "manual-approval-required" | "blocked"` の判別 union）
     - `SkillRegistryService` インターフェース（`register`, `update`, `deprecate`, `remove`, `getDependents` メソッド）
     - `SkillDistributionService` インターフェース（`importSkill`, `exportSkill`, `forkSkill`, `shareSkill` メソッド）
   - **配置先ファイル**:
     - 共有型: `packages/shared/src/agent/types.ts` または `packages/shared/src/skill/types.ts`（新規ファイル推奨）
     - サービスインターフェース: `packages/shared/src/skill/services.ts`（新規ファイル推奨）
     - IPC チャンネル定数: `apps/desktop/src/main/ipc/channels.ts`（既存ファイルに追記）
   - **使用例**: 各サービスの主要メソッドの呼び出し例（TypeScript コードブロック形式）
   - **エラーハンドリング**: 互換性チェック失敗時（`level: "breaking"`）と公開ブロック時（`status: "blocked"`）の処理パターン
   - **設定パラメータ一覧**: 公開レベル昇格閾値・後方互換保持世代数・30日間 grace period 等の設定値一覧

**期待される成果物**: `outputs/phase-12/implementation-guide.md`（Part 1 + Part 2 の両方を含む）

---

### Task 2: システム仕様書の更新

**目的**: 本タスクで設計した型定義・インターフェース・フローをシステム仕様書に反映し、仕様書と設計書の乖離を解消する。

#### Step 1-A: タスク完了記録（必須、2ファイル両方）

**実行手順**:

1. **aiworkflow-requirements の LOGS.md を更新する**:
   - ファイルパス: `.claude/skills/aiworkflow-requirements/LOGS.md`
   - 追記内容: TASK-SKILL-LIFECYCLE-08 の完了記録（日付: 2026-03-16、概要: スキル共有・公開・互換性統合の設計仕様書作成）

2. **task-specification-creator の LOGS.md を更新する**（P1対策・2ファイル目必須）:
   - ファイルパス: `.claude/skills/task-specification-creator/LOGS.md`
   - 追記内容: 同上

3. **aiworkflow-requirements の SKILL.md 変更履歴を更新する**:
   - ファイルパス: `.claude/skills/aiworkflow-requirements/SKILL.md`
   - 変更履歴テーブルに行を追加する（P29対策）

4. **task-specification-creator の SKILL.md 変更履歴を更新する**（P29対策・2ファイル目必須）:
   - ファイルパス: `.claude/skills/task-specification-creator/SKILL.md`
   - 変更履歴テーブルに行を追加する

#### Step 1-B: 実装状況テーブル更新

**実行手順**:

1. `interfaces-agent-sdk-skill.md` の実装状況テーブルに TASK-SKILL-LIFECYCLE-08 の設計完了を記録する:
   - 対象フィールド: `SkillVisibility`, `SkillPublishingMetadata`, `CompatibilityCheckResult`, `PublishReadiness`
   - ステータス: `spec_created`（設計タスクのため `implemented` ではない）
   - 記録内容: タスクID・完了日・設計書パスを明記する

#### Step 1-C: 関連タスクテーブル更新

**実行手順**:

1. `grep -rn "TASK-SKILL-LIFECYCLE-08" .claude/skills/aiworkflow-requirements/references/` を実行し、TASK-SKILL-LIFECYCLE-08 を参照している仕様書を全て特定する
2. 特定された仕様書の関連タスクテーブルに「完了」ステータスを更新する
3. `task-workflow.md` の残課題テーブルに TASK-SKILL-LIFECYCLE-08 の完了を記録する（完了セクションへ移動する）

#### Step 1-D: topic-map.md 再生成（P2/P27対策）

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/` ディレクトリで `node scripts/generate-index.js` を実行する
2. 実行後に `indexes/topic-map.md` が更新されたことを確認する（更新日時を確認する）
3. 注意: セクションの追加だけでなく、削除・更新も再生成トリガーとなる（P27対策）

#### Step 2: システム仕様の実更新（設計タスクでも必須・P57対策）

**SF-02対応: 2段階方式**

設計タスクでは `.claude/skills/` への実更新を Phase 12 内で完了する。以下の2段階方式を「計画作成→同ターン実更新」の順で適用する。

| ステージ          | タイミング    | 内容                                                                      | 必須 |
| ----------------- | ------------- | ------------------------------------------------------------------------- | ---- |
| Step 2A: 計画記録 | Task 2 開始時 | 更新予定ファイルと変更内容の計画を `system-spec-update-summary.md` に記録 | ✅   |
| Step 2B: 実更新   | Task 2 完了前 | 実際に `.claude/skills/` 配下の仕様書を更新し、planned wording を除去     | ✅   |

`仕様策定のみ` / `実行予定` / `保留として記録` 等の planned wording は Phase 12 完了前に全て実更新ログへ昇格すること。

**planned wording 残存確認コマンド（完了前に必ず実行）**:

```bash
rg -n "仕様策定のみ|実行予定|保留として記録" \
  docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/outputs/phase-12/ || echo "planned wording なし"
```

**実行手順**:

1. `interfaces-agent-sdk-skill.md` を更新する（新規型定義の追加のため必須）:
   - 追加セクション: 「TASK-SKILL-LIFECYCLE-08 設計型定義」
   - 追加内容:
     - `SkillVisibility` 型定義（`"local" | "team" | "public"`）
     - `SkillPublishingMetadata` インターフェース（全フィールド）
     - `CompatibilityCheckResult` インターフェース
     - `PublishReadiness` 判別 union 型
     - `SkillRegistryService` インターフェース
     - `SkillDistributionService` インターフェース
   - 参照先: `outputs/phase-2/publishing-metadata-design.md` 等の Phase 2 設計書

2. `workflow-skill-lifecycle-created-skill-usage-journey.md` を更新する（Skill Center 接続仕様の追加のため必要）:
   - 追加セクション: 「TASK-SKILL-LIFECYCLE-08: 公開・共有・互換性フロー」
   - 追加内容: 公開レベル遷移・Skill Center 登録フロー・互換性チェックのステップ概要

3. `security-skill-execution.md` を更新する（公開前安全性ゲート接続仕様の追加のため必要）:
   - 追加セクション: 「TASK-SKILL-LIFECYCLE-08: 公開判定マトリクス」
   - 追加内容: `PublishReadiness` と `ToolRiskLevel` の接続条件

**期待される成果物**: `outputs/phase-12/system-spec-update-summary.md`（更新した全仕様書・変更内容・確認コマンドの記録）

---

### Task 3: ドキュメント更新履歴の作成（P4対策）

**目的**: 全 Step の完了結果を詳細に記録し、漏れを可視化する。全 Step 確認前に「完了」と記載しない。

**実行手順**:

1. `outputs/phase-12/documentation-changelog.md` を作成する
2. 以下の形式で各 Step の実行結果を「事後記録」する（実行前に完了と書かない）:

   ```
   ## Task 2 実行結果

   ### Step 1-A: タスク完了記録
   - aiworkflow-requirements/LOGS.md: [更新済み]
   - task-specification-creator/LOGS.md: [更新済み]
   - aiworkflow-requirements/SKILL.md: [更新済み]
   - task-specification-creator/SKILL.md: [更新済み]

   ### Step 1-B: 実装状況テーブル
   - interfaces-agent-sdk-skill.md: [spec_created ステータス追記済み]

   ### Step 1-C: 関連タスクテーブル
   - grep 実行結果: [検出ファイル数]件
   - task-workflow.md: [更新済み]

   ### Step 1-D: topic-map.md 再生成
   - generate-index.js 実行: [実施済み]
   - topic-map.md 更新確認: [確認済み/未確認]

   ### Step 2: システム仕様実更新
   - interfaces-agent-sdk-skill.md: [更新済み]
   - workflow-skill-lifecycle-*.md: [更新済み]
   - security-skill-execution.md: [更新済み]
   ```

3. Task 4（未タスク検出）と Task 5（スキルフィードバック）の完了後に changelog を最終更新する

**期待される成果物**: `outputs/phase-12/documentation-changelog.md`

---

### Task 4: 未タスク検出レポートの作成（0件でも必須・P3/P38/P58対策）

**目的**: 設計タスク特有の4パターンで未タスクを検出し、0件の場合もレポートを作成する。

**設計タスク特有パターン（SF-03）の4チェック**:

1. **型定義→実装**: 以下の型を設計したが、ランタイム実装が未完了である
   - `SkillVisibility`, `SkillPublishingMetadata`, `CompatibilityCheckResult`, `PublishReadiness`
   - `SkillRegistryService`, `SkillDistributionService`, `PublishReadinessChecker`
   - これらは `packages/shared/` への配置と `apps/desktop/` での IPC 実装が別タスクとして必要である

2. **契約→テスト**: 以下の IPC 契約を設計したが、統合テストが未作成である
   - `SkillRegistryService.register()` の E2E テスト
   - `CompatibilityCheckResult` の breaking change 検出テスト
   - `PublishReadiness` の全判定ケーステスト（auto-approved/review-required/manual-approval-required/blocked）

3. **UI仕様→コンポーネント**: 以下の画面仕様を設計したが、React コンポーネントが未実装である
   - 公開レベルバッジ（グレー/ブルー/グリーン）の `VisibilityBadge` コンポーネント
   - Skill Center フィルタドロップダウン（全て/public/team）
   - 公開フロー 6ステップのダイアログ（`PublishFlowDialog` コンポーネント）
   - 互換性チェック結果の表示コンポーネント（breaking change の警告 UI）

4. **仕様書間差異→設計決定**: Phase 10 MINOR 指摘で追跡中の設計決定事項を確認する

**SF-03 チェック手順**:

1. Phase 1 要件定義の受入基準を再確認し「将来対応」とした項目を列挙する
2. Phase 2/3 設計・レビューの MINOR 判定事項をリストアップする
3. 上記4パターンと照合し、未タスク化対象を確定する
4. 0件でも `unassigned-task-detection.md` に「設計タスクパターン確認済み、0件」と明記する

**実行手順**:

1. 上記4パターンの各項目について「未タスク候補」を列挙する
2. 各候補に対して「Phase 12 内で解決できるか」を判断する:
   - 解決できる: 本 Task 内で仕様書の追記・修正を実施する
   - 解決できない: 独立した未タスク仕様書を作成する（P58対策: 設計タスクでも独立ファイルが必要）
3. 独立した未タスク仕様書を `docs/30-workflows/unassigned-task/` 配下に作成する（P3/P38対策: 3ステップ全完了）:
   - ステップ1: `docs/30-workflows/unassigned-task/UT-SKILL-LIFECYCLE-08-xxx.md` を作成する
   - ステップ2: `task-workflow.md` の残課題テーブルに登録する
   - ステップ3: 関連仕様書（`interfaces-agent-sdk-skill.md` 等）に参照リンクを追加する
4. `unassigned-task-detection.md` の件数・ステータスを更新する
5. Phase 10 MINOR で「再評価クローズ」したものは GitHub Issue を `gh issue close` で Close する（P56対策）

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`（0件でも必須）
- 必要な場合: `docs/30-workflows/unassigned-task/UT-SKILL-LIFECYCLE-08-*.md`（独立未タスク指示書）

---

### Task 5: スキルフィードバックレポートの作成（改善点なしでも必須・P28対策）

**目的**: TASK-SKILL-LIFECYCLE-08 のワークフロー実行を通じて得られた改善点を記録する。改善点がない場合も「改善点なし」として出力する。

**実行手順**:

1. `outputs/phase-12/skill-feedback-report.md` を作成する
2. 以下の観点で改善点を評価する:
   - **設計テンプレートの改善点**: Phase 1〜3 の設計仕様書テンプレートに追加すべきセクション・修正すべき記述形式
   - **レビューゲートの改善点**: Phase 3/10 のレビュー判定基準で曖昧な点・追加すべきチェック項目
   - **依存タスク連携の改善点**: Task06/07 との型契約の接続方法で改善できる点
   - **docs-only モードの改善点**: 設計タスクの Phase 12 実行フローで効率化できる点
3. 改善点が0件の場合は「本タスクのワークフローにおいて改善点は検出されなかった」と明記する
4. 改善点がある場合は、改善提案を1件ずつ記録する（改善の内容・理由・対象スキル・優先度）

**期待される成果物**: `outputs/phase-12/skill-feedback-report.md`

---

### Task 6: Phase 12 遵守チェックリストの作成（P4対策・最終確認）

**目的**: Task 1〜5 の全完了を1ファイルに集約し、Phase 13 での確認を容易にする。全 Task 完了後に最後に作成する（P4対策: 早期完了記載禁止）。

**実行手順**:

1. Task 1〜5 が全て完了したことを確認した後、`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する
2. 以下のチェックリスト形式で5タスクの完了状況を記録する:

   ```markdown
   # Phase 12 タスク遵守チェックリスト

   | Task | 内容                         | 成果物パス                                     | 完了状態 |
   | ---- | ---------------------------- | ---------------------------------------------- | -------- |
   | 1    | 実装ガイド（2パート）        | outputs/phase-12/implementation-guide.md       | 完了     |
   | 2    | システム仕様書更新           | outputs/phase-12/system-spec-update-summary.md | 完了     |
   | 3    | ドキュメント更新履歴         | outputs/phase-12/documentation-changelog.md    | 完了     |
   | 4    | 未タスク検出レポート         | outputs/phase-12/unassigned-task-detection.md  | 完了     |
   | 5    | スキルフィードバックレポート | outputs/phase-12/skill-feedback-report.md      | 完了     |
   ```

3. **planned wording 残存確認（P57対策）**: `documentation-changelog.md` に「計画」「予定」「TODO」等の未来形が残っていないことを確認する:
   - 確認コマンド: `grep -n "計画\|予定\|TODO\|will be\|を予定" outputs/phase-12/documentation-changelog.md`
   - 出力が0件であることを確認する（事後記録のみであること）

**期待される成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 未タスク配置先ディレクトリの明示（P38再発防止）

未タスク指示書は必ず以下のディレクトリに配置する。配置先の判断を省略しない。

| 条件                                  | 配置先                                                          |
| ------------------------------------- | --------------------------------------------------------------- |
| 未完了の未タスク（通常）              | `docs/30-workflows/unassigned-task/`                            |
| completed workflow 由来の継続 backlog | `docs/30-workflows/completed-tasks/<workflow>/unassigned-task/` |
| 完了済み standalone UT                | `docs/30-workflows/completed-tasks/*.md`                        |
| legacy                                | `docs/30-workflows/completed-tasks/unassigned-task/`            |

**確認コマンド（Phase 12 完了前に必ず実行）**:

```bash
# 未タスク指示書の物理ファイル存在を確認
ls docs/30-workflows/unassigned-task/
```

---

## 成果物ファイル名の照合チェック

Phase 12 の成果物ファイル名がテンプレートと一致していることを確認する。名前の不一致はバリデーションスクリプトの検出漏れを引き起こす。

| テンプレート上の名前  | 正しいファイル名                        |
| --------------------- | --------------------------------------- |
| 未タスク検出レポート  | `unassigned-task-detection.md`          |
| ドキュメント更新履歴  | `documentation-changelog.md`            |
| 実装ガイド            | `implementation-guide.md`               |
| スキルフィードバック  | `skill-feedback-report.md`              |
| 仕様書更新サマリー    | `system-spec-update-summary.md`         |
| Phase 12 遵守チェック | `phase12-task-spec-compliance-check.md` |

**注意**: `unassigned-task-report` のような類似名で作成しないこと。正式名称は `unassigned-task-detection.md` である。

---

## Phase 10 MINOR 追跡テーブル

Phase 10 の MINOR 判定事項は全て未タスク仕様書に変換するか、Phase 12 内で解決する（省略不可）。

| MINOR ID                  | 指摘内容 | 解決方法 | 解決 Phase | 解決確認 |
| ------------------------- | -------- | -------- | ---------- | -------- |
| （Phase 10 実施後に記入） |          |          |            |          |

---

## 参照資料

| 参照資料                    | パス                                     | 内容                             |
| --------------------------- | ---------------------------------------- | -------------------------------- |
| Phase 1 要件定義            | `./phase-1-requirements.md`              | 受入基準 AC-1〜AC-4              |
| Phase 2 設計                | `./phase-2-design.md`                    | 型定義・サービスインターフェース |
| Phase 3 設計レビュー        | `./phase-3-design-review.md`             | MINOR 追跡テーブル               |
| Phase 10 最終レビュー       | `./phase-10-final-review.md`             | 最終レビュー MINOR 指摘          |
| Phase 11 ウォークスルー結果 | `outputs/phase-11/manual-test-result.md` | 引き継ぎ情報・未タスク候補       |
| Phase 11 発見事項           | `outputs/phase-11/discovered-issues.md`  | Note 項目（Phase 12 で解決）     |

### Phase 4-10 成果物（ドキュメント作成の入力）

| 参照資料                         | パス                                                     | 内容                             |
| -------------------------------- | -------------------------------------------------------- | -------------------------------- |
| Phase 4 公開テスト仕様           | `outputs/phase-4/publishing-test-spec.md`                | 公開レベルテスト設計             |
| Phase 4 互換性テスト仕様         | `outputs/phase-4/compatibility-test-spec.md`             | 互換性チェックテスト設計         |
| Phase 4 Skill Center テスト仕様  | `outputs/phase-4/skill-center-test-spec.md`              | Skill Center フローテスト設計    |
| Phase 4 配布テスト仕様           | `outputs/phase-4/distribution-test-spec.md`              | 配布操作テスト設計               |
| Phase 4 公開判定テスト仕様       | `outputs/phase-4/publish-readiness-test-spec.md`         | 公開判定ロジックテスト設計       |
| Phase 5 型定義確定書             | `outputs/phase-5/type-definitions.md`                    | 確定した型定義                   |
| Phase 5 サービスインターフェース | `outputs/phase-5/service-interfaces.md`                  | サービス契約の確定               |
| Phase 5 IPC チャンネル定義       | `outputs/phase-5/ipc-channel-definitions.md`             | IPC チャンネル設計               |
| Phase 5 Zustand スライス設計     | `outputs/phase-5/zustand-slice-design.md`                | Store 設計                       |
| Phase 5 仕様配置マップ           | `outputs/phase-5/spec-placement-map.md`                  | ファイル配置計画                 |
| Phase 6 バージョン互換性境界     | `outputs/phase-6/version-compatibility-boundary-spec.md` | バージョン互換の境界テスト仕様   |
| Phase 6 スキーマドリフト検出     | `outputs/phase-6/schema-drift-detection-spec.md`         | スキーマドリフト検出テスト仕様   |
| Phase 6 廃止・再公開境界         | `outputs/phase-6/deprecation-republish-boundary-spec.md` | 廃止・再公開の境界テスト仕様     |
| Phase 6 同時操作競合             | `outputs/phase-6/concurrent-operation-conflict-spec.md`  | 同時操作の競合テスト仕様         |
| Phase 6 エラーハンドリング拡張   | `outputs/phase-6/error-handling-extended-spec.md`        | エラーハンドリング拡張テスト仕様 |
| Phase 7 カバレッジマトリクス     | `outputs/phase-7/coverage-matrix.md`                     | カバレッジ確認結果               |
| Phase 7 依存エッジカバレッジ     | `outputs/phase-7/dependency-edge-coverage.md`            | 依存関係のエッジカバレッジ       |
| Phase 7 型カバレッジ             | `outputs/phase-7/type-coverage.md`                       | 型定義のカバレッジ               |
| Phase 7 未カバー領域             | `outputs/phase-7/uncovered-areas.md`                     | 未カバー領域の特定               |
| Phase 8 重複排除計画             | `outputs/phase-8/dedup-plan.md`                          | 重複排除の計画                   |
| Phase 8 命名監査                 | `outputs/phase-8/naming-audit.md`                        | 命名規則の監査結果               |
| Phase 8 共通ユーティリティ設計   | `outputs/phase-8/common-utils-design.md`                 | 共通ユーティリティの設計         |
| Phase 8 ナビゲーションチェック   | `outputs/phase-8/navigation-check.md`                    | ナビゲーション整合性チェック     |
| Phase 9 型整合レポート           | `outputs/phase-9/type-integrity-report.md`               | 型整合性の検証結果               |
| Phase 9 仕様品質レポート         | `outputs/phase-9/spec-quality-report.md`                 | 仕様書品質の検証結果             |
| Phase 9 テストカバレッジレポート | `outputs/phase-9/test-coverage-report.md`                | テストカバレッジの検証結果       |
| Phase 9 セキュリティチェック     | `outputs/phase-9/security-check-report.md`               | セキュリティチェックの検証結果   |
| Phase 9 品質ゲート結果           | `outputs/phase-9/quality-gate-result.md`                 | 品質ゲートの総合判定             |
| Phase 10 受入基準最終確認        | `outputs/phase-10/acceptance-criteria-final.md`          | 受入基準の最終検証結果           |
| Phase 10 MINOR 追跡解決          | `outputs/phase-10/minor-tracking-resolution.md`          | MINOR 指摘の追跡・解決状況       |
| Phase 10 依存関係最終チェック    | `outputs/phase-10/dependency-final-check.md`             | 依存タスクとの最終整合確認       |
| Phase 10 最終レビュー判定        | `outputs/phase-10/final-review-decision.md`              | 最終レビューの PASS/MINOR 判定   |

### システム仕様（aiworkflow-requirements）

| 参照資料                            | パス                                                                                                        | 内容                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------- |
| interfaces-agent-sdk-skill          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                           | 型定義更新先（Step 2 対象）   |
| workflow-skill-lifecycle            | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md` | 公開フロー仕様（Step 2 対象） |
| security-skill-execution            | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                             | 安全性ゲート（Step 2 対象）   |
| aiworkflow-requirements LOGS.md     | `.claude/skills/aiworkflow-requirements/LOGS.md`                                                            | Step 1-A 更新先（1/2）        |
| task-specification-creator LOGS.md  | `.claude/skills/task-specification-creator/LOGS.md`                                                         | Step 1-A 更新先（2/2）        |
| aiworkflow-requirements SKILL.md    | `.claude/skills/aiworkflow-requirements/SKILL.md`                                                           | Step 1-A 変更履歴（1/2）      |
| task-specification-creator SKILL.md | `.claude/skills/task-specification-creator/SKILL.md`                                                        | Step 1-A 変更履歴（2/2）      |
| topic-map                           | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                               | Step 1-D 再生成対象           |
| task-workflow                       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                        | Step 1-C 関連タスク更新先     |
| unassigned-task-detection           | （プロジェクトルートに存在する場合）                                                                        | Task 4 更新先                 |

---

## 統合テスト連携

Phase 12 は docs-only モードのため、テストコードの作成・実行は行わない。ただし、Task 4 で作成した「契約→テスト」の未タスク指示書が、後続の実装タスクにおける統合テスト設計の入力となる。

---

## 成果物

| 成果物                       | パス                                                     | 内容                                           |
| ---------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| 実装ガイド（2パート）        | `outputs/phase-12/implementation-guide.md`               | Part 1: 中学生レベル、Part 2: 開発者レベル     |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | 更新した全仕様書・変更内容・確認コマンドの記録 |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 全 Step の実行結果記録                         |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 検出件数・各未タスクの処理状況                 |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | ワークフロー改善提案（改善点なしの場合も出力） |
| Phase 12 遵守チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 5タスク全完了の最終確認チェックリスト          |

---

## 完了条件

- [x] Task 1: `outputs/phase-12/implementation-guide.md` が作成されており、Part 1（中学生レベル）と Part 2（開発者レベル）の両方が含まれている
- [x] Task 1: Part 1 に専門用語が含まれていない（TypeScript, API, semver, IPC が含まれていない）
- [x] Task 1: Part 2 に5つの主要型定義（`SkillVisibility`, `CompatibilityCheckResult`, `PublishReadiness`, `SkillRegistryService`, `SkillDistributionService`）が全て含まれている
- [x] Task 2 Step 1-A: aiworkflow-requirements/LOGS.md が更新されている
- [x] Task 2 Step 1-A: task-specification-creator/LOGS.md が更新されている（P1対策: 2ファイル目）
- [x] Task 2 Step 1-A: aiworkflow-requirements/SKILL.md の変更履歴が更新されている（P29対策）
- [x] Task 2 Step 1-A: task-specification-creator/SKILL.md の変更履歴が更新されている（P29対策: 2ファイル目）
- [x] Task 2 Step 1-B: interfaces-agent-sdk-skill.md に `spec_created` ステータスが記録されている
- [x] Task 2 Step 1-C: task-workflow.md の関連タスクテーブルが更新されている
- [x] Task 2 Step 1-D: `node scripts/generate-index.js` が実行されており、topic-map.md が更新されている（P2対策）
- [x] Task 2 Step 2: interfaces-agent-sdk-skill.md に5つの型定義が追記されている（P57対策: docs-only でも実更新必須）
- [x] Task 3: `outputs/phase-12/documentation-changelog.md` が作成されており、全 Step の「事後記録」が含まれている（P4対策）
- [x] Task 4: `outputs/phase-12/unassigned-task-detection.md` が作成されている（0件でも必須）
- [x] Task 4: 独立未タスク指示書が必要な場合、`docs/30-workflows/unassigned-task/` に作成されており、3ステップ（指示書・残課題テーブル・参照リンク）が全て完了している（P3/P58対策）
- [x] Task 5: `outputs/phase-12/skill-feedback-report.md` が作成されている（改善点なしでも必須）
- [x] Task 6: `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成されており、5タスク全て「完了」と記録されている
- [x] Task 6: `documentation-changelog.md` に planned wording（「計画」「予定」「TODO」）が残っていないことを確認している（P57対策）
- [x] Phase 10 MINOR 追跡テーブルの全 MINOR が「解決済み」または「未タスク化済み」になっている

---

## タスク100%実行確認【必須】

| #   | 確認項目                                                | 確認方法                                                                                      | 合否基準                                                                                                                                                                                                              |
| --- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 成果物6ファイルが存在する                               | `ls outputs/phase-12/`                                                                        | `implementation-guide.md`, `system-spec-update-summary.md`, `documentation-changelog.md`, `unassigned-task-detection.md`, `skill-feedback-report.md`, `phase12-task-spec-compliance-check.md` の全6ファイルが存在する |
| 2   | LOGS.md の2ファイル両方が更新されている                 | `git diff --stat -- .claude/skills/` で LOGS.md の変更を確認                                  | aiworkflow-requirements/LOGS.md と task-specification-creator/LOGS.md の両方が変更されている                                                                                                                          |
| 3   | SKILL.md の2ファイル両方が更新されている                | `git diff --stat -- .claude/skills/` で SKILL.md の変更を確認                                 | aiworkflow-requirements/SKILL.md と task-specification-creator/SKILL.md の両方が変更されている                                                                                                                        |
| 4   | topic-map.md が再生成されている                         | `git diff --stat -- .claude/skills/aiworkflow-requirements/indexes/`                          | `indexes/topic-map.md` が変更されている                                                                                                                                                                               |
| 5   | interfaces-agent-sdk-skill.md が実更新されている        | `git diff -- .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 5つの型定義が追記されている                                                                                                                                                                                           |
| 6   | documentation-changelog.md に全 Step の事後記録がある   | `cat outputs/phase-12/documentation-changelog.md`                                             | Step 1-A〜1-D と Step 2 の実行結果が全て記録されており、未完了欄がない                                                                                                                                                |
| 7   | unassigned-task-detection.md が存在する                 | `ls outputs/phase-12/unassigned-task-detection.md`                                            | ファイルが存在する（0件でも可）                                                                                                                                                                                       |
| 8   | skill-feedback-report.md が存在する                     | `ls outputs/phase-12/skill-feedback-report.md`                                                | ファイルが存在する（改善点なしでも可）                                                                                                                                                                                |
| 9   | phase12-task-spec-compliance-check.md が存在する        | `ls outputs/phase-12/phase12-task-spec-compliance-check.md`                                   | ファイルが存在し、5タスク全て「完了」と記録されている                                                                                                                                                                 |
| 10  | planned wording が documentation-changelog に残存しない | `grep -n "計画\|予定\|TODO\|will be\|を予定" outputs/phase-12/documentation-changelog.md`     | 出力が0件である（事後記録のみ）                                                                                                                                                                                       |

---

## 多角的チェック観点（AIが判断）

- LOGS.md が2ファイル（aiworkflow-requirements と task-specification-creator）の両方で更新されているか（P1/P25対策）
- SKILL.md が2ファイルの両方で更新されているか（P29対策）
- topic-map.md が `node generate-index.js` で再生成されているか（P2/P27対策）
- documentation-changelog.md が事後記録のみで、planned wording が残存していないか（P4/P51対策）
- 未タスク検出の3ステップ（指示書+台帳+リンク）が全て完了しているか（P3/P38/P58対策）
- 再評価クローズした未タスクの GitHub Issue が Close されているか（P56対策）

---

## サブタスク管理

| #   | タスク名                           | ステータス | 完了基準                                           |
| --- | ---------------------------------- | ---------- | -------------------------------------------------- |
| 1   | 実装ガイドの作成（2パート構成）    | 完了       | Part 1 + Part 2 が作成済み                         |
| 2   | システム仕様書の更新               | 完了       | LOGS.md x2 + SKILL.md x2 + topic-map.md が更新済み |
| 3   | ドキュメント更新履歴の作成         | 完了       | 全 Step の事後記録が完了                           |
| 4   | 未タスク検出レポートの作成         | 完了       | 0件でもレポートが存在                              |
| 5   | スキルフィードバックレポートの作成 | 完了       | 改善点なしでもレポートが存在                       |
| 6   | Phase 12 遵守チェックリストの作成  | 完了       | 全タスクが「完了」と記録                           |

---

## 依存関係

- **前提**: Phase 11（手動テスト）が完了していること（Blocker が 0件）
- **後続**: Phase 13（PR 作成）へ進む

---

## Phase実行記録

### 実行タスク

- Task 1（実装ガイドの作成）: `implementation-guide.md` を validator 10/10 要件へ補強（APIシグネチャ/エッジケース追記）
- Task 2（システム仕様書の更新）: `.claude/skills/aiworkflow-requirements/references/*.md` を実更新し、LOGS/SKILL 同期を実施
- Task 3（ドキュメント更新履歴の作成）: `documentation-changelog.md` を計画記録から実績記録へ置換
- Task 4（未タスク検出レポートの作成）: 4件検出を `docs/30-workflows/unassigned-task/` に正式作成
- Task 5（スキルフィードバックレポートの作成）: docs-only運用の改善提案を「同ターン実更新必須」へ更新
- Task 6（Phase 12 遵守チェックリストの作成）: `phase12-task-spec-compliance-check.md` を新規作成

### 発見事項

- 良かった点: `validate-phase11-screenshot-coverage` と `validate-phase12-implementation-guide` を再実行し、両方 PASS へ回復できた
- 問題点: 初期成果物に planned wording が残存し、実更新済みの仕様書と矛盾していた
- 改善提案: Phase 12 完了条件に「planned wording 0件」を機械検証として固定する

### 次Phase への引き継ぎ事項

- Phase 13 は user 承認待ちのため `blocked` を維持する

---

## 次Phase

Phase 13: PR 作成

- 成果物パス: `./phase-13-pr-creation.md`
- 前提条件: Phase 12 完了条件が全てチェック済みであり、「タスク100%実行確認」テーブルの全 # が合格であること
- 主な活動:
  - Phase 12 の5タスク全完了確認
  - 全 Phase の成果物一覧最終確認
  - PR 本文ドラフトの作成（Summary + Test Plan + Breaking Changes）
  - git diff --stat による変更ファイル数確認
  - ユーザーの明示承認まで blocked 状態を維持
