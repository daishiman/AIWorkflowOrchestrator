# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 内容                                  |
| --------- | ------------------------------------- |
| Phase     | 12                                    |
| Phase名   | ドキュメント更新                      |
| カテゴリ  | 文書化                                |
| 機能名    | task-imp-permission-tool-metadata-001 |
| Issue     | #606                                  |
| 前提Phase | Phase 11（手動テスト検証）            |
| 次Phase   | Phase 13（PR作成）                    |

---

## 目的

実装ガイド（Part 1: 中学生レベル + Part 2: 技術者レベル）を作成し、システム仕様書を更新し、ドキュメント変更履歴を記録し、未タスクを検出する。4つの必須タスク全てを完了する。

---

## 実行タスク

### Task 1: 実装ガイド作成（2パート構成）

**目的**: 本タスクの実装内容を初学者と技術者の両方が理解できるドキュメントとして作成する。

**手順**:

#### Part 1: 初学者・中学生レベルの概念説明

1. 以下の構成で概念説明を書く：
   - **なぜ必要か**: 日常生活での例え話で説明する
     - 例: 「スマホのアプリがカメラや位置情報へのアクセスを求めるとき、『この操作はどれくらい危険か』を色で教えてくれる信号機のようなもの」
   - **何をするか**: 専門用語を使わず説明する
     - 例: 「AIが使うツールごとに『安全度』のラベルを付けて、ユーザーが『許可していいかどうか』を判断しやすくする」
   - **どう動くか**: 図や箇条書きで説明する
     - 緑（安全）: ファイルを読むだけ
     - 黄色（注意）: ファイルを書き換える
     - オレンジ（危険）: コンピューターにコマンドを送る
     - 赤（非常に危険）: 何でもできてしまう操作

2. 専門用語を使う場合は即座に説明を付ける（例: 「リスクレベル（危険度のランク）」）

#### Part 2: 技術者レベルの詳細説明

1. 以下の内容を含める：
   - **インターフェース/型定義**:

     ```typescript
     export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
     export interface ToolMetadata {
       riskLevel: RiskLevel;
       securityImpact: string;
     }
     ```

   - **公開API**:

     ```typescript
     getRiskLevel(toolName: string): RiskLevel
     getSecurityImpact(toolName: string): string
     getToolMetadata(toolName: string): ToolMetadata
     ```

   - **使用例**:

     ```typescript
     import { getRiskLevel, getSecurityImpact } from "./toolMetadata";
     const level = getRiskLevel("Bash"); // 'High'
     const impact = getSecurityImpact("Bash"); // 'システムコマンドを実行します...'
     ```

   - **デフォルト値**: 未定義ツール → `{ riskLevel: 'Medium', securityImpact: 'ツールを実行します' }`

   - **Tailwind CSSクラスマッピング**: RISK_LEVEL_STYLESの各レベル別クラス

   - **エラーハンドリング**: 未定義ツールに対するフォールバック動作

   - **設定可能なパラメータ**: TOOL_METADATAマッピング（12ツール定義）

**期待される成果物**: `outputs/phase-12/implementation-guide.md`（Part 1 + Part 2）

### Task 2: システム仕様書更新（4サブステップ）

**目的**: aiworkflow-requirementsの仕様書を更新し、タスク完了記録を残す。

**手順**:

#### Step 1-A: タスク完了記録（必須）

1. 元タスク仕様書（`docs/30-workflows/unassigned-task/task-imp-permission-tool-metadata-001.md`）のステータスを「完了」に更新する
2. 関連ドキュメントリンクを追加する（実装ガイド、テスト結果等）
3. 変更履歴を追記する
4. 以下の2つのLOGS.mdを更新する：
   - `.claude/skills/aiworkflow-requirements/LOGS.md`
   - `.claude/skills/task-specification-creator/LOGS.md`
5. `topic-map.md`を確認し、新規セクション追加があればエントリを追加する

#### Step 1-B: 実装状況テーブル更新（必須）

1. `ui-ux-agent-execution.md`にtoolMetadata.ts関連の仕様を追記する（該当する場合）
2. 関連する実装状況テーブルの「未実装」→「完了」ステータス更新

#### Step 1-C: 関連タスクテーブル更新（必須）

以下の仕様書内の「関連タスク」「未タスク候補」テーブルを確認し、本タスクのステータスを更新する：

| 確認対象の仕様書ファイル    | 確認するセクション               |
| --------------------------- | -------------------------------- |
| ui-ux-agent-execution.md    | 関連タスク・未タスク候補テーブル |
| security-skill-execution.md | 関連タスク・未タスク候補テーブル |

キーワード: `toolMetadata`, `リスクレベル`, `PermissionDialog`, `セキュリティメタデータ`, `task-imp-permission-tool-metadata-001`

#### Step 2: システム仕様更新（条件付き）

本タスクでは新規型（`RiskLevel`, `ToolMetadata`）と新規関数（`getRiskLevel`, `getSecurityImpact`, `getToolMetadata`）を追加するため、以下の更新が必要：

1. `ui-ux-agent-execution.md`にtoolMetadata.tsモジュール仕様を追記：
   - 公開API定義
   - リスクレベル定義テーブル
   - PermissionDialogへの統合仕様（リスクバッジ表示位置、色分け仕様）

**期待される成果物**: 更新されたシステム仕様書

### Task 3: ドキュメント更新履歴作成

**目的**: 本Phase 12で行った全ドキュメント変更を記録する。

**手順**:

1. `outputs/phase-12/documentation-changelog.md`を作成する
2. Step 1-A/1-B/1-C/Step 2の各結果を個別に記載する（「該当なし」も記録）
3. artifacts.jsonを更新し、Phase 12のステータスを`completed`にする

**期待される成果物**: `outputs/phase-12/documentation-changelog.md`

### Task 4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: 本タスクの実装過程で発見された残課題・改善候補を未タスク指示書として出力する。

**手順**:

1. 以下のソースから未タスク候補を検出する：

   | ソース                         | 確認項目                                     |
   | ------------------------------ | -------------------------------------------- |
   | 元タスク仕様書のスコープ外項目 | リスクレベルの動的変更機能                   |
   | 元タスク仕様書のスコープ外項目 | リスクレベルに基づく自動拒否ロジック         |
   | 元タスク仕様書のスコープ外項目 | PermissionSettingsページへのリスクレベル表示 |
   | Phase 3/10レビュー結果         | MINOR判定の指摘事項                          |
   | Phase 11手動テスト             | スコープ外の発見事項・改善提案               |
   | コードコメント                 | TODO/FIXME/HACK/XXX                          |

2. コードベースのTODO/FIXMEを検索する：

   ```bash
   node scripts/detect-unassigned-tasks.js --scan apps/desktop/src/renderer/components/skill --output .tmp/unassigned-candidates.json
   ```

3. 検出結果を`outputs/phase-12/unassigned-task-detection.md`に記録する（0件の場合も「検出結果: 0件」と明記）

4. 検出された未タスクがある場合は`docs/30-workflows/unassigned-task/`に未タスク指示書を作成する

**期待される成果物**: `outputs/phase-12/unassigned-task-detection.md`

---

## Phase 12でよくある漏れパターン

| 漏れパターン                           | 防止方法                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| Step 1-C（関連タスクテーブル）を未実行 | 本仕様書の「確認対象の仕様書ファイル」表を実行前に必ず読む                        |
| topic-map.md 未更新                    | 仕様書に新規セクション追加時は必ず topic-map.md のエントリも追加                  |
| documentation-changelog.md が不完全    | 全Step（1-A/1-B/1-C/Step 2）の結果を個別に明記する（「該当なし」も記録）          |
| LOGS.md が1ファイルのみ更新            | 必ず aiworkflow-requirements/LOGS.md と task-specification-creator/LOGS.md の両方 |
| 完了タスクセクションが簡略形式         | spec-update-workflow.md のテンプレートに従う                                      |

---

## Task 1 vs Task 2 の境界

| 活動                             | Task 1（実装ガイド） | Task 2（仕様更新） |
| -------------------------------- | -------------------- | ------------------ |
| Part 1/2 実装ガイド作成          | メイン責務           | 対象外             |
| aiworkflow-requirements 仕様更新 | 対象外               | Step 2             |
| タスク完了記録（仕様書内）       | 対象外               | Step 1-A 必須      |
| LOGS.md更新（2ファイル）         | 対象外               | Step 1-A 必須      |

---

## 参照資料

| 資料名                      | パス                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------ |
| Phase 11テストレポート      | `outputs/phase-11/manual-test-report.md`                                             |
| Phase 12ガイド              | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`          |
| 仕様更新ワークフロー        | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`       |
| 未タスクガイドライン        | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` |
| 元タスク仕様書              | `docs/30-workflows/unassigned-task/task-imp-permission-tool-metadata-001.md`         |
| ui-ux-agent-execution.md    | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`         |
| security-skill-execution.md | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`      |

---

## 統合テスト連携アクション

- ドキュメント更新がコード変更と整合していることを確認する
- 未タスク検出結果が`docs/30-workflows/unassigned-task/`に正しく配置されていることを確認する

---

## 成果物

| 成果物名             | パス                                            | 種別     |
| -------------------- | ----------------------------------------------- | -------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | document |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | document |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | document |

---

## 完了条件

- [ ] Task 1: 実装ガイドPart 1（中学生レベル）が日常の例え話を含んで作成されている
- [ ] Task 1: 実装ガイドPart 2（技術者レベル）が型定義・API・使用例を含んで作成されている
- [ ] Task 2 Step 1-A: タスク完了記録が作成されている
- [ ] Task 2 Step 1-A: aiworkflow-requirements/LOGS.mdが更新されている
- [ ] Task 2 Step 1-A: task-specification-creator/LOGS.mdが更新されている
- [ ] Task 2 Step 1-B: 実装状況テーブルが更新されている（該当する場合）
- [ ] Task 2 Step 1-C: 関連タスクテーブルのステータスが更新されている
- [ ] Task 2 Step 2: ui-ux-agent-execution.mdにtoolMetadata仕様が追記されている
- [ ] Task 3: documentation-changelog.mdが全Stepの結果を含んで作成されている
- [ ] Task 4: 未タスク検出レポートが作成されている（0件の場合も「検出結果: 0件」と明記）
- [ ] artifacts.jsonが更新されている

---

## 次Phase

Phase 13（PR作成）: ユーザーの明示的な許可を得た上で、`/ai:diff-to-pr`でPRを作成する。
