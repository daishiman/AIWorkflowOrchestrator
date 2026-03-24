# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 12                                     |
| 機能名   | ut-sc-03-004-skill-blueprint-migration |
| タスクID | UT-SC-03-004                           |
| 作成日   | 2026-03-24                             |
| 更新日   | 2026-03-24                             |

---

## 目的

SkillBlueprint 型追加・RuntimeSkillCreatorPlanResult の extends 化・LLM レスポンススキーマ拡張の実装内容を、実装ガイド・システム仕様書・変更履歴・未タスク検出レポートとしてドキュメント化する。Phase 12 は漏れが最も発生しやすい Phase であり（P1-P4, P25-P28, P43, P51 参照）、全チェックリストを逐次確認すること。

## 背景

UT-SC-03-004 は plan() の出力型を SkillBlueprint 互換に移行するタスクであり、後続タスク w3a（TASK-SC-04-OUTPUT-PERSISTENCE / SkillFileWriter）のブロッカー解消を目的とする。型定義変更・LLM プロンプト変更・バリデーション拡張の 3 軸の変更内容をシステム仕様書に反映する。

---

## 実行タスク

> 以下の 5 タスクを全て実行してください。省略不可。

| #   | タスク名                     | 必須 | 成果物                                           |
| --- | ---------------------------- | ---- | ------------------------------------------------ |
| 1   | 実装ガイド作成               | 必須 | `outputs/phase-12/implementation-guide.md`       |
| 2   | システム仕様書更新           | 必須 | `outputs/phase-12/system-spec-update-summary.md` |
| 3   | documentation-changelog      | 必須 | `outputs/phase-12/documentation-changelog.md`    |
| 4   | 未タスク検出レポート         | 必須 | `outputs/phase-12/unassigned-task-detection.md`  |
| 5   | スキルフィードバックレポート | 必須 | `outputs/phase-12/skill-feedback-report.md`      |

---

### Task 12-1: 実装ガイド作成

**目的**: SkillBlueprint 型追加と plan() 出力互換移行の概念および技術詳細をドキュメント化する。

**実行手順**:

1. **Part 1: 概念説明（中学生レベル）** を作成する:
   - 「引越しの見積もり書」に例える:
     - 旧形式（RuntimeSkillCreatorPlanResult）: 「段ボール何個、家具何個」だけのリスト。引越し業者は何をどこに置くか分からない
     - 新形式（SkillBlueprint）: 「1LDK の引越し（カテゴリ）で、こういう間取りにする（customizations）から、この荷物をこう配置する（files）、理由はこう（reasoning）」という設計図
   - なぜ必要か: 後続作業（SkillFileWriter = 引越し業者）が「どこに何を置くか」を知るために設計図が必要
   - カテゴリ（simple/standard/complex/automation/integration）を引越しの規模に例える:
     - simple = ワンルーム引越し（段ボール数個）
     - standard = 1LDK 引越し（家具あり）
     - complex = 一戸建て引越し（大量の荷物）
     - automation = 定期配送（毎週の荷物自動手配）
     - integration = 複数拠点の同時引越し（連携が必要）

2. **Part 2: 技術者向け実装詳細** を作成する:
   - **SkillBlueprint 型の全フィールド説明**:
     - `skillName: string` - スキルの識別名（kebab-case）
     - `description: string` - スキルの1行説明文
     - `category: SkillCategory` - テンプレートカテゴリ（`simple` | `standard` | `complex` | `automation` | `integration`）
     - `customizations: { additionalDirectories?: string[], additionalFiles?: PlannedFile[], excludedDefaults?: string[] }` - カテゴリテンプレートに対するカスタマイズ（追加ディレクトリ、追加ファイル、除外するデフォルト）
     - `files: PlannedFile[]` - 全生成予定ファイル一覧（テンプレート + カスタマイズの統合結果）
     - `reasoning: string` - カテゴリ・構造選択の理由
   - **RuntimeSkillCreatorPlanResult extends SkillBlueprint の設計意図**:
     - 構造的サブタイピングによる後方互換性の保証
     - 既存の `planId`, `skillSpec`, `estimatedSteps` 等の固有フィールドを保持
     - SkillFileWriter が SkillBlueprint インターフェースのみに依存可能
   - **Graceful degradation の仕組み**:
     - LLM が旧形式で返した場合のフォールバック: category → "standard", files → [], reasoning → ""
     - isValidPlanResponse() での新フィールドのオプショナルバリデーション
   - **CATEGORY_TEMPLATES の使い方**:
     - 各カテゴリに対応するディレクトリ構成テンプレート
     - simple が空配列（ファイル構成なし）、integration が最大構成

3. **API ドキュメント** を作成する:
   - `api-documentation.md` として以下を記載する:
     - SkillBlueprint インターフェースの型定義と各フィールドの説明
     - SkillCategory 列挙型の値と用途
     - PlannedFile インターフェースの型定義
     - CategoryTemplate インターフェースの型定義
     - CATEGORY_TEMPLATES 定数のカテゴリ別構成

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（Part 1 + Part 2）
- `outputs/phase-12/api-documentation.md`（型ドキュメント）

---

### Task 12-2: システム仕様書更新

**目的**: spec-update-workflow.md に準拠してシステム仕様書を更新する。

**実行手順**:

#### Step 1-A: タスク完了記録

- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加する
- [ ] `.claude/skills/task-specification-creator/LOGS.md` にタスク完了記録を追加する

> P1/P25 注意: LOGS.md は aiworkflow-requirements と task-specification-creator の**2 ファイル両方**を更新すること。

- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴にバージョンを追記する
- [ ] `.claude/skills/task-specification-creator/SKILL.md` の変更履歴にバージョンを追記する

#### Step 1-B: 実装状況テーブル更新

- [ ] 該当仕様書に「実装状況」テーブルがある場合、UT-SC-03-004 の行を `completed` に更新する
- [ ] `arch-execution-capability-contract.md` の SkillBlueprint 関連ステータスを更新する

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rl "UT-SC-03-004" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索する
- [ ] 該当する仕様書の関連タスクテーブルのステータスを更新する
- [ ] 以下のファイルを確認する:
  - `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md`
  - `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

#### Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する
- [ ] 再生成された topic-map.md に変更が正しく反映されていることを確認する

> P2/P27 注意: セクションの追加だけでなく、削除・更新も再生成トリガーに含める。仕様書に変更があれば必ず再生成を実行すること。

#### Step 1-E: 未タスク指示書作成・登録（Task 12-4 で検出した場合）

- [ ] 未タスク候補が 1 件以上の場合、`docs/30-workflows/unassigned-task/` に指示書を作成・配置する
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに新規未タスクを登録する
- [ ] 関連仕様書に参照リンクを追加する

> P3/P38 注意: 未タスク管理は 3 ステップ全完了が必要。指示書作成だけでは不十分。

#### Step 1-F: DevOps 関連ファイル更新

- [ ] 今回タスクに CI/CD・lint・typecheck・ビルドパイプライン変更が含まれる場合、`technology-devops.md` を更新する
- [ ] 今回タスクが DevOps 変更なしの場合、`documentation-changelog.md` と `system-spec-update-summary.md` に「Step 1-F: 該当なし（根拠: DevOps 変更なし）」を記録する

#### Step 1-G: 検証コマンド順次実行

以下を順番に実行する:

```bash
# 0. 未タスク参照リンク検証
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# 1. 索引再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js
git diff --stat -- .claude/skills/*/indexes/topic-map.md .claude/skills/*/indexes/keywords.json

# 2. SKILL検証（3スキル）
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done
```

- [ ] `quick_validate.js` の Warning を `許容 / 要監視 / 要対応` に分類し、`system-spec-update-summary.md` と `documentation-changelog.md` に同値で記録する
- [ ] `quick_validate.js` の Error が 0 件であることを確認する

#### Step 2: システム仕様更新

本タスクは SkillBlueprint 型を新規追加し、RuntimeSkillCreatorPlanResult の継承構造を変更しているため、Step 2 が必要:

| #   | 更新対象ファイル                                                                          | 更新内容                                                 |
| --- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md` | SkillBlueprint 型定義セクション追加・plan() 出力型の更新 |
| 2   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                      | 完了タスクセクション追加、残課題テーブル更新             |

> Step 2 不要と判断した場合でも、判断根拠を documentation-changelog.md と system-spec-update-summary.md に明記すること。

#### Step 3: IPC 契約検証

- [ ] 本タスクは IPC チャネル自体の変更なし（型変更のみ）のため、Step 3 は **N/A** とする
- [ ] N/A の根拠: skill-creator:plan チャネルのハンドラ登録・引数形式・チャネル名に変更はなく、レスポンスの data 内フィールドが拡張されるのみ

**期待される成果物**:

- `outputs/phase-12/system-spec-update-summary.md`（Step 1 / Step 2 / Step 3 の実施結果）

---

### Task 12-3: documentation-changelog.md 作成

**目的**: 変更した全仕様書の変更内容を記録する。

**実行手順**:

1. 更新した全ファイルの変更内容を記録する
2. 各 Step の完了結果を詳細に記録する
3. 検証コマンドの実行結果を記録する
4. `quick_validate.js` Warning の分類結果を `system-spec-update-summary.md` と同値で記録する

> P4/P51 注意: 全 Step 確認前に「完了」と記載しない。各 Step の実行結果は「事後記録」すること。

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### Task 12-4: 未タスク検出レポート

**目的**: Phase 1-11 の成果物から未タスク候補を検出し、レポートを作成する。0 件でも出力必須。

**実行手順**:

1. Phase 10 の MINOR 指摘がある場合、全て未タスク仕様書に変換する
2. Phase 11 の発見事項（Note カテゴリ）を未タスク候補として評価する
3. 以下の観点で未タスク候補を検出する:
   - Renderer 側で SkillBlueprint 型の新フィールド（category, files, reasoning）を活用する UI 変更が必要か
   - CATEGORY_TEMPLATES を使った SkillFileWriter のファイル生成ロジックに追加実装が必要か
   - SkillBlueprint 型を他のサービス（SkillImprover 等）で利用する際の型変更が必要か
4. 検出した未タスクは 3 ステップ全完了する（P3/P38 対策）:
   - `docs/30-workflows/unassigned-task/` に指示書作成
   - `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録
   - 関連仕様書に参照リンク追加
5. 検出件数が 0 件の場合も、「0 件: 検出なし」としてサマリーを残す
6. `unassigned-task-detection.md` の件数・ステータスを更新する

> P56 注意: 再評価クローズした未タスクがある場合、対応する GitHub Issue を `gh issue close` で同時に Close すること。

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

---

### Task 12-5: スキルフィードバックレポート

**目的**: Phase 1-12 のワークフロー実行を通じて得られたスキル改善の知見を記録する。改善点がなくても出力必須。

**実行手順**:

1. task-specification-creator スキルの改善点を検討する:
   - 型移行（extends 化）タスクの Phase テンプレートに改善点はあるか
   - Graceful degradation テスト設計のテンプレート化は有用か
   - LLM プロンプト変更タスクの Phase 11 手動テストガイドに改善の余地はあるか
2. aiworkflow-requirements スキルの改善点を検討する:
   - SkillBlueprint 関連の仕様書配置は適切か
   - 型継承変更時の仕様書更新パターンを標準化すべきか
3. 改善点がある場合は next action を記録する
4. 改善点がない場合は「改善点なし」と理由を明記する

> P28 注意: 「スキル改善なし」と即断しない。必ず改善検討を実施してから結論を出すこと。

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

## Phase 12 準拠チェック

Task 12-1 から Task 12-5 の全完了後、以下の準拠チェックを実施する:

- [ ] `outputs/phase-12/implementation-guide.md` が存在し、Part 1 / Part 2 の両方を含む
- [ ] `outputs/phase-12/api-documentation.md` が存在し、型ドキュメントを含む
- [ ] `outputs/phase-12/system-spec-update-summary.md` が存在し、Step 1 / Step 2 / Step 3 の結果を含む
- [ ] `outputs/phase-12/documentation-changelog.md` が存在し、全 Step の事後記録を含む
- [ ] `outputs/phase-12/unassigned-task-detection.md` が存在する（0 件でもサマリーあり）
- [ ] `outputs/phase-12/skill-feedback-report.md` が存在する（改善点なしでも理由あり）

---

## 参照資料

| 参照資料                     | パス                                                                             | 内容                         |
| ---------------------------- | -------------------------------------------------------------------------------- | ---------------------------- |
| Phase 10 成果物              | `outputs/phase-10/`                                                              | 最終レビュー判定結果         |
| Phase 11 成果物              | `outputs/phase-11/`                                                              | 手動テスト結果               |
| 正本 index.md                | `docs/30-workflows/skill-creator-llm-integration/index.md`                       | SkillBlueprint 正本定義      |
| skillCreator.ts              | `packages/shared/src/types/skillCreator.ts`                                      | 型定義ファイル               |
| RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`            | plan() 実装ファイル          |
| planPromptConstants.ts       | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`                  | LLM プロンプト定数           |
| spec-update-workflow         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`   | システム仕様更新ワークフロー |
| phase-template-phase12       | `.claude/skills/task-specification-creator/references/phase-template-phase12.md` | Phase 12 テンプレート        |

### システム仕様（aiworkflow-requirements）

| 参照資料                              | パス                                                                                      | 内容                    |
| ------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------- |
| arch-execution-capability-contract    | `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md` | SkillBlueprint 関連仕様 |
| task-workflow                         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                      | 完了/未タスク台帳       |
| LOGS.md (aiworkflow-requirements)     | `.claude/skills/aiworkflow-requirements/LOGS.md`                                          | タスク完了ログ（1/2）   |
| LOGS.md (task-specification-creator)  | `.claude/skills/task-specification-creator/LOGS.md`                                       | タスク完了ログ（2/2）   |
| SKILL.md (aiworkflow-requirements)    | `.claude/skills/aiworkflow-requirements/SKILL.md`                                         | 変更履歴（1/2）         |
| SKILL.md (task-specification-creator) | `.claude/skills/task-specification-creator/SKILL.md`                                      | 変更履歴（2/2）         |

---

## 成果物

| 成果物                       | パス                                             | 内容                                   |
| ---------------------------- | ------------------------------------------------ | -------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`       | Part 1（概念）+ Part 2（技術詳細）     |
| API ドキュメント             | `outputs/phase-12/api-documentation.md`          | 型定義ドキュメント                     |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md` | Step 1 / Step 2 / Step 3 の実施結果    |
| ドキュメント変更履歴         | `outputs/phase-12/documentation-changelog.md`    | 変更ファイル一覧と検証結果             |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`  | 未タスク候補の検出結果（0 件でも必須） |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`      | スキル改善の知見（なしでも必須）       |

---

## 統合テスト連携

| 連携先         | 連携内容                                                            |
| -------------- | ------------------------------------------------------------------- |
| Phase 11       | 手動テスト結果（発見事項）を Task 12-4 の未タスク検出の入力とする   |
| Phase 10       | MINOR 指摘を Task 12-4 で未タスク仕様書に変換する                   |
| 後続タスク w3a | Task 12-2 の仕様書更新は TASK-SC-04-OUTPUT-PERSISTENCE の入力となる |

---

## 多角的チェック観点

| #   | 観点                   | 確認内容                                                                     |
| --- | ---------------------- | ---------------------------------------------------------------------------- |
| 1   | LOGS.md 2 ファイル更新 | P1/P25: aiworkflow-requirements と task-specification-creator の両方更新済み |
| 2   | topic-map.md 再生成    | P2/P27: generate-index.js 実行済み                                           |
| 3   | 未タスク 3 ステップ    | P3/P38: 指示書 + テーブル + リンクの全ステップ完了                           |
| 4   | changelog 早期完了     | P4/P51: 全 Step 確認前に「完了」と記載していない                             |
| 5   | Step 3 N/A 根拠        | IPC チャネル自体の変更なしの根拠が明記されている                             |
| 6   | GitHub Issue 同期      | P56: 再評価クローズ時に gh issue close 実行済み                              |

---

## 完了条件

- [ ] Task 12-1: 実装ガイドが Part 1（概念説明）+ Part 2（技術詳細）を含む
- [ ] Task 12-1: API ドキュメントが作成されている
- [ ] Task 12-2: Step 1-A から 1-G と Step 2 が全て実施されている
- [ ] Task 12-2: LOGS.md が aiworkflow-requirements と task-specification-creator の 2 ファイル両方更新されている
- [ ] Task 12-2: topic-map.md が再生成されている
- [ ] Task 12-2: `quick_validate.js` Warning の分類が `system-spec-update-summary.md` と `documentation-changelog.md` で一致している
- [ ] Task 12-2: `quick_validate.js` の Error が 0 件である
- [ ] Task 12-3: documentation-changelog.md に全 Step の事後記録が含まれている
- [ ] Task 12-4: 未タスク検出レポートが作成されている（0 件でもサマリーあり）
- [ ] Task 12-4: 検出した未タスクの 3 ステップ（指示書 + テーブル + リンク）が全完了している
- [ ] Task 12-5: スキルフィードバックレポートが作成されている（改善点なしでも理由あり）
- [ ] Phase 12 準拠チェックが実施され、全 6 成果物が `outputs/phase-12/` に存在する

---

## サブタスク管理

1. Task 12-1: 実装ガイド作成（Part 1 + Part 2 + API ドキュメント）
2. Task 12-2: システム仕様書更新（Step 1-A から 1-G + Step 2 + Step 3）
3. Task 12-3: documentation-changelog.md 作成
4. Task 12-4: 未タスク検出レポート
5. Task 12-5: スキルフィードバックレポート

---

## タスク 100% 実行確認チェックリスト

- [ ] 本 Phase 内の全タスク（12-1 から 12-5）を 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て `outputs/phase-12/` に生成されていることを確認

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/phase-13-pr-creation.md`
