# Phase 2: 設計 — Phase 12 SubAgent成果物固定ガード

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 2                                          |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001 |
| タスク名   | Phase 12 SubAgent成果物固定ガード          |
| Issue      | #955                                       |
| 分類       | 改善（docs/chore）                         |
| 機能名     | phase12-subagent-artifact-guard            |
| 前提Phase  | Phase 1                                    |
| 後続Phase  | Phase 3                                    |
| 作成日     | 2026-03-03                                 |
| ステータス | completed                                  |

## 目的

Phase 1 で抽出した要件に基づき、SubAgent責務固定と三点突合の運用設計を行う。テンプレート構造、監査基準、運用手順の具体的な設計を確定する。

## 背景

Phase 1 の要件定義（FR/NFR）を、実行可能なテンプレート構造・突合アルゴリズム・監査判定ルールに落とし込む。設計の焦点は「再利用可能性」と「機械検証可能性」にある。

## SubAgent分担

| SubAgent | 担当                                         |
| -------- | -------------------------------------------- |
| A        | SubAgent責務マトリクス・テンプレート構造設計 |
| B        | 三点突合ルール・Step 2 判定設計              |
| C        | 監査基準・current/baseline分離判定設計       |

## 実行タスク

- Task 2-0 抽出スコープ設計: aiworkflow 仕様の必須/条件付き/対象外を定義する

### Task 2-0: 抽出スコープ設計

Phase 12 Step 0 で使う aiworkflow 仕様抽出の判定軸を設計する。

#### 手順

1. `resource-map.md` で「今回タスク種別（Phase 12運用改善）」に対応するカテゴリを抽出する
2. `topic-map.md` の該当行を確認し、候補仕様書を列挙する
3. 候補仕様書を `必須` / `条件付き` / `対象外` に分類する
4. 各仕様書を 1仕様書=1SubAgent 原則で担当割当する
5. 対象外（破棄）判定の除外理由を必ず記録する

### Task 2-1: SubAgent責務マトリクス設計

1仕様書=1SubAgentの責務・依存・完了条件テーブルを設計する。

#### 手順

1. 既存テンプレートの SubAgent 分担パターンを分析する:
   - 標準5仕様書プロファイル（interfaces/api-ipc/security/task-workflow/lessons）
   - UI機能6仕様書プロファイル（ui-ux-components/ui-ux-feature/arch-ui/arch-state/task/lessons）
   - 再確認プロファイル（task-workflow/lessons/unassigned-task/検証）
2. 各プロファイルに対し、SubAgent単位の責務・依存関係・完了条件を一意に定義する
3. プロファイル選択基準（どのタスク種別でどのプロファイルを適用するか）を明文化する
4. SubAgent間の依存チェーン（A完了→B開始）を設計する

#### 設計判断

- SubAgent粒度: 仕様書単位（1仕様書=1SubAgent）を原則とする
- 依存方向: 実装系（interfaces/api-ipc/security）→ 台帳系（task-workflow）→ 教訓系（lessons）の一方向チェーン
- 完了条件: 各SubAgentが自律的に判定可能な条件を設定する

### Task 2-2: テンプレート構造設計

spec-update-summary、spec-sync-subagent-report、documentation-changelogの整合構造を設計する。

#### 手順

1. 3成果物間のデータフロー（どの情報がどこに記載され、どこから参照されるか）を設計する:
   - `spec-update-summary.md`: 更新対象仕様書一覧 + 反映内容 + SubAgent分担 + 苦戦箇所
   - `spec-sync-subagent-report.md`: SubAgent単位の責務/依存/完了条件/実行結果
   - `documentation-changelog.md`: Step判定結果 + 各Step完了証跡
2. 3成果物間の必須参照ポイント（相互リンク）を定義する
3. テンプレート準拠チェック項目を列挙する

#### テンプレート整合設計

| 情報項目         | summary       | report      | changelog | 整合ルール                                     |
| ---------------- | ------------- | ----------- | --------- | ---------------------------------------------- |
| SubAgent分担     | セクション3   | セクション2 | -         | summary.SubAgent = report.SubAgent（名称一致） |
| 更新対象仕様書   | セクション4   | -           | Step 2    | summary.仕様書一覧 ⊇ changelog.Step2更新対象   |
| Step 2 判定      | セクション3.3 | -           | Step 2    | summary.Step2判定 = changelog.Step2判定        |
| 苦戦箇所         | セクション5   | -           | -         | lessons-learned.mdと整合                       |
| 完了条件         | -             | セクション2 | -         | Phase仕様書の完了条件と対応                    |
| 検証コマンド結果 | セクション7   | セクション5 | -         | 両方に記載された結果が一致                     |

### Task 2-3: 三点突合ルール設計

phase-12-documentation.md / documentation-changelog.md / spec-update-summary.md の突合アルゴリズムを設計する。

#### 手順

1. 三点突合の定義を明確化する:
   - **点1**: `phase-12-documentation.md` の更新対象テーブル（何を更新すべきか）
   - **点2**: `documentation-changelog.md` の Step 2 判定（何を更新したか）
   - **点3**: `spec-update-summary.md` の更新対象一覧（実際に何を更新したか）
2. 突合アルゴリズムを設計する:
   ```
   突合ルール:
   (1) 点1に「arch-*/api-*/interfaces-*/security-*」が含まれる → 点2のStep 2は「完了」であること
   (2) 点2のStep 2で更新した仕様書 ⊆ 点3の更新対象一覧
   (3) 点3の更新対象一覧の各仕様書に反映内容が記載されていること
   ```
3. 突合結果の判定パターンを定義する:
   - PASS: 三点が整合
   - DRIFT: 点間で不一致があり、修正が必要
   - N/A: Step 2 該当なし（ドキュメントのみタスク）

#### 機械検証コマンド

```bash
# 点1: phase-12-documentation.md の更新対象確認
rg -n 'arch-|api-|interfaces-|security-' <workflow>/phase-12-documentation.md

# 点2: changelog の Step 2 判定確認
rg -n '^\| 2\s+\|' <workflow>/outputs/phase-12/documentation-changelog.md

# 点3: summary の更新対象一覧確認
rg -n '^\|.*references/' <workflow>/outputs/phase-12/spec-update-summary.md
```

### Task 2-4: 監査基準設計

currentViolations/baselineViolationsの分離判定ルールを設計する。

#### 手順

1. 判定軸の定義:
   - **current**: 今回タスクの変更で新規発生した違反。合否判定に使用
   - **baseline**: 着手前から存在する違反。監視値として別記録
2. 合否基準:
   - `currentViolations.total = 0` → PASS
   - `currentViolations.total > 0` → FAIL（今回タスク内で修正必須）
3. 記録フォーマット:
   ```
   audit-unassigned-tasks: 全体 <PASS/FAIL>（baseline: N件, current: M件）→ current <PASS/FAIL>
   ```
4. 判定に使用するスクリプトと引数の対応表を設計する:

| スクリプト                                       | 引数         | 用途         | 判定対象    |
| ------------------------------------------------ | ------------ | ------------ | ----------- |
| `audit-unassigned-tasks.js --json`               | （なし）     | 全体監査     | baseline    |
| `audit-unassigned-tasks.js --json --target-file` | 対象ファイル | 対象ファイル | current抽出 |
| `audit-unassigned-tasks.js --json --diff-from`   | HEAD         | 差分監査     | current確認 |

### Task 2-5: エレガンス判定（破棄案 vs 改善案）

「既存方式を破棄して全面作り直す」案と「既存方式を活かしガードを追加する」案を比較し、採用方針を確定する。

#### 手順

1. 比較軸を定義する: 再利用性、移行コスト、検証可能性、後方互換性、運用リスク
2. 案A（全面破棄）と案B（増分改善）を同一軸で評価する
3. 差分を `トレードオン` として整理し、どこを捨てて何を得るかを明記する
4. 採用案を決定し、却下案の却下理由を記録する
5. 判定結果を Phase 10 の最終レビューゲート入力にする

## 参照資料

### Phase 1 成果物

| 資料名         | パス                                         | 用途               |
| -------------- | -------------------------------------------- | ------------------ |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | FR/NFR確認         |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | 設計の判定条件確認 |
| スコープ定義書 | `outputs/phase-1/scope-definition.md`        | 設計範囲確認       |

### テンプレート

| 資料名                         | パス                                                                                | 用途                     |
| ------------------------------ | ----------------------------------------------------------------------------------- | ------------------------ |
| 仕様更新・苦戦箇所テンプレート | `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md` | summary構造設計の基盤    |
| SubAgent同期テンプレート       | `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`        | report構造設計の基盤     |
| spec-update-workflow           | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`      | Step判定ルール設計の基盤 |

### システム仕様

| 資料名          | パス                                                                   | 用途         |
| --------------- | ---------------------------------------------------------------------- | ------------ |
| task-workflow   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 台帳構造確認 |
| lessons-learned | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 教訓構造確認 |

## 統合テスト連携

テンプレート・スクリプト間の整合ポイント設計:

| 整合ポイント                         | 検証方法                                      | 期待結果               |
| ------------------------------------ | --------------------------------------------- | ---------------------- |
| summary ↔ report のSubAgent名一致    | summary.セクション3とreport.セクション2を比較 | SubAgent名が完全一致   |
| summary ↔ changelog のStep 2判定一致 | summary.セクション3.3とchangelog.Step 2を比較 | 判定が一致             |
| report完了条件 ↔ Phase仕様書完了条件 | report各SubAgentの完了条件を仕様書と照合      | 対応関係が明確         |
| 監査スクリプト ↔ 合否基準            | audit実行結果とcurrentViolations基準を照合    | `currentViolations: 0` |

## 多角的チェック観点

| 観点         | 確認内容                                       | 参照仕様                                        |
| ------------ | ---------------------------------------------- | ----------------------------------------------- |
| テンプレート | 3成果物間のデータフローに矛盾がないか          | `phase12-system-spec-retrospective-template.md` |
| 整合性       | 三点突合ルールが機械的に検証可能か             | `spec-update-workflow.md` Step 1-G              |
| 監査基準     | current/baseline分離が誤判定を防止できるか     | `spec-update-workflow.md` Step 1-G.1            |
| 再利用性     | プロファイル選択基準が一意に決定可能か         | テンプレート2点                                 |
| 教訓反映     | 親タスク教訓4件が設計に反映されているか        | 未タスク指示書 セクション3.5                    |
| 保守性       | テンプレート更新時の影響範囲が限定されているか | テンプレート2点                                 |
| エレガンス   | 破棄案より採用案の説明可能性と再利用性が高いか | `outputs/phase-2/elegance-decision-record.md`   |

## 成果物

| 成果物               | パス                                           | 内容                                   |
| -------------------- | ---------------------------------------------- | -------------------------------------- |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`       | SubAgent責務マトリクス + 監査基準設計  |
| テンプレート構造設計 | `outputs/phase-2/template-structure-design.md` | 3成果物整合構造 + 三点突合アルゴリズム |
| 抽出・判定設計記録   | `outputs/phase-2/elegance-decision-record.md`  | 抽出スコープ設計 + 破棄案比較結果      |

## 完了条件

- [ ] aiworkflow 仕様抽出の判定軸（必須/条件付き/対象外）が定義されている
- [ ] SubAgent責務マトリクスが3プロファイル分設計されている
- [ ] プロファイル選択基準が明文化されている
- [ ] 3成果物間のデータフローが矛盾なく設計されている
- [ ] 三点突合アルゴリズムが機械検証コマンド付きで定義されている
- [ ] current/baseline分離判定ルールが設計されている
- [ ] 合否基準（currentViolations=0）が定式化されている
- [ ] 破棄案 vs 改善案の比較結果と採用理由が記録されている
- [ ] 親タスク教訓4件が設計に反映されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 1 成果物を確認する
2. Task 2-0: 抽出スコープ設計を実施する
3. Task 2-1: SubAgent責務マトリクス設計を実施する
4. Task 2-2: テンプレート構造設計を実施する
5. Task 2-3: 三点突合ルール設計を実施する
6. Task 2-4: 監査基準設計を実施する
7. Task 2-5: エレガンス判定を実施する
8. 成果物を `outputs/phase-2/` に配置する
9. 完了条件を確認する

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] Phase内で定義した成果物を全件記録
- [ ] 引き継ぎ情報を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard
```

## Phase実行記録

| 項目         | 記録                                                                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 実行タスク   | Task 2-0〜2-5 全件完了（2026-03-03）                                                                                                                                    |
| 発見事項     | resource-mapに「Phase 12運用改善」タスク種別が未定義（§9 Claude Code + §11 ガイドラインを近似カテゴリとして使用）。将来はクイックルックアップへ追加することを推奨       |
| 引き継ぎ事項 | Phase 3設計レビューでは architecture-design.md §1.2の判定木・template-structure-design.md §2.2の三点突合ルール・elegance-decision-record.md §2の5軸評価を中心にレビュー |

## 次のPhase

Phase 3: 設計レビュー
