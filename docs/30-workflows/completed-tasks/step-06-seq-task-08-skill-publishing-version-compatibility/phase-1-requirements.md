# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                      |
| ---------- | ------------------------------------------------------------------------- |
| Phase      | 1                                                                         |
| Phase名    | 要件定義                                                                  |
| 前提Phase  | なし（初回Phase）                                                         |
| 後続Phase  | Phase 2（設計）                                                           |
| ステータス | 完了（2026-03-17 再監査）                                                 |
| 作成日     | 2026-03-16                                                                |
| 機能名     | スキル共有・公開・互換性統合                                              |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                   |
| タスク種別 | 設計                                                                      |
| 依存タスク | TASK-SKILL-LIFECYCLE-05, TASK-SKILL-LIFECYCLE-06, TASK-SKILL-LIFECYCLE-07 |

---

## 目的

スキルをローカル利用から共有/公開可能な資産へ昇格させるために、公開レベル、互換性、配布境界、および検証条件を定義する。Skill Center を資産流通の場として成立させることを目的とする。

---

## スコープ定義

### 含まれるもの

- 公開レベル（`local`/`team`/`public`）の定義・遷移条件・権限マトリクス
- semver ルールとスキル schema 互換性チェック仕様
- Task-06（安全性ゲート）・Task-07（観測指標）から公開可否判定への接続定義
- Skill Center への登録・更新・取り下げ（通常/緊急）フロー定義
- import/export/fork/share の4操作の整合方針と `visibility` 状態遷移
- カテゴリ/タグ体系の定義

### 含まれないもの

- TypeScript 実装コードの生成（設計タスクのため Phase 5 以降で実施）
- Skill Center の UI コンポーネント実装（UI 実装は後続タスクで対応）
- IPC チャンネルの実装・ハンドラ登録（Phase 5 で実施）
- Zustand Store スライスの実装（Phase 5 で実施）
- Task-06/07 側の実装変更（Task-06/07 は完了済みであり、本タスクはそれらの出力を入力として受け取るのみ）
- 課金・サブスクリプション連携（スコープ外）

---

## 背景

TASK-SKILL-LIFECYCLE-05（利用導線）で「スキルを使う」導線が確立され、TASK-SKILL-LIFECYCLE-06（安全性ゲート）で公開前の危険操作チェックの仕組みが定義された。TASK-SKILL-LIFECYCLE-07（観測指標）でスキルの品質・利用状況のメトリクスが定義された。

これら3タスクが揃ったことで「スキルが安全か」「スキルの品質が十分か」の判定材料が揃った。Task-08 はこれらの判定結果を受け取り、「どのレベルで誰と共有するか」「どのバージョン管理ルールで互換性を保証するか」「Skill Center にどう登録・配布・取り下げするか」を決定する流通レイヤを設計する。

Task-06 が定義した安全性評価結果と Task-07 が定義した観測指標を公開可否の入力として受け取る。このタスクは **設計仕様・インターフェース契約・判断基準の文書化** を成果物とし、実装コードを生成しない。

### 依存タスク型マッピング（M-1/m-1 整合注記）

> **重要**: 本仕様書で使用する `SkillSafetyContract` は Task-08 独自の中間型であり、Task-06 が実装した `SafetyGateResult` から合成する。`AggregateView` は Task-07 が実装した `SkillAggregateView` / `PublishReadinessMetrics` に対応する。

| 本仕様書での型名                      | 本仕様書でのフィールド                      | Task-06/07 実装型                      | 実装型でのフィールド   | マッピング方法                               |
| ------------------------------------- | ------------------------------------------- | -------------------------------------- | ---------------------- | -------------------------------------------- |
| `SkillSafetyContract.maxRiskLevel`    | `"low" \| "medium" \| "high" \| "critical"` | `SafetyGateResult.overallGrade`        | `SafetyGrade`          | `overallGrade` を `ToolRiskLevel` に変換     |
| `SkillSafetyContract.deniedRatio`     | `number (0〜1)`                             | `SafetyGateResult.details[]`           | `SafetyCheckDetail[]`  | `details` の `passed: false` 比率から算出    |
| `SkillSafetyContract.hasOnlyOncePerm` | `boolean`                                   | `PermissionStore`                      | セッション権限エントリ | セッション権限に `once` のみ存在するかを判定 |
| `AggregateView.testPassRate`          | `number (0〜1)`                             | `PublishReadinessMetrics.success_rate` | `number`               | 直接マッピング（フィールド名の違いのみ）     |
| `AggregateView.avgScore`              | `number`                                    | `SkillAggregateView.recommendScore`    | `number`               | 直接マッピング（フィールド名の違いのみ）     |

Phase 5（実装）で `SkillSafetyContract` を `SafetyGateResult` + `PermissionStore` から合成するアダプタ関数を設計する。

---

## aiworkflow-requirements 仕様抽出トレース

### 4ステップ抽出テーブル

| ステップ | 起点                                                                | 抽出結果                                                                                                                                                                                  |
| -------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`    | Skill Center導線、security-skill-execution、公開安全性を一次候補として固定。「設計仕様（Skill Lifecycle 作成済みスキル利用導線）」行で workflow-skill-lifecycle-\* 系を追加候補として確認 |
| 2        | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md` | 共有/公開レベル、互換性、Skill Center接続の分割検索クエリを採用                                                                                                                           |
| 3        | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`       | workflow-skill-lifecycle-created-skill-usage-journey、workflow-skill-lifecycle-evaluation-scoring-gate、security-skill-execution、ui-ux-navigation の実体見出しを確認                     |
| 4        | `.claude/skills/aiworkflow-requirements/indexes/keywords.json`      | publish、version、compatibility、share、import、fork、useShallow（P48対策）、architecture-implementation-patterns の関連キーを逆引き                                                      |

### 必須仕様セット

| 関心ごと               | 仕様書                                                                                                                                                                                                                                     | 抽出理由                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 公開安全性             | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                                                                                                                                                            | 公開前安全性チェック要件を固定するため                                                                                                            |
| Skill Center導線       | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                                                                                                                                                    | Skill Center公開・閲覧の導線を合わせるため                                                                                                        |
| 共有先行事例           | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                                                                                                                                             | import/share drift教訓を引き継ぐため                                                                                                              |
| Task06依存             | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/phase-2-design.md`（完了済みタスク。代替参照: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` の Task-06 型サマリー） | 安全性ゲート判定ロジックの依存境界を固定                                                                                                          |
| Task07依存             | `docs/30-workflows/completed-tasks/TASK-SKILL-LIFECYCLE-07-lifecycle-history-feedback/phase-2-design.md`（代替参照: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` の Task-07 型サマリー）              | 観測指標・メトリクスの依存境界を固定                                                                                                              |
| 型/IPC契約（正本）     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                                                                                                                          | 型追加時の更新先を先に固定するため（familyファイルへの入口）                                                                                      |
| 型/IPC契約（共有型）   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md`                                                                                                                          | TASK-9Fで実装済みの共有型（ShareTarget/ShareImportResult/ShareExportResult等）を確認するため（Task 5のimport/export/fork/shareの前提）            |
| スキルIPCセキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                                                                                                                                                  | 配布操作IPCのセキュリティ要件（CLI連携・Preload API・Permission制御）を確認するため                                                               |
| 正本反映先（サービス） | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-core.md`                                                                                                                                                         | SkillRegistryService/SkillDistributionServiceの追加先を設計初期に把握するため（Phase 5配置計画の前提）                                            |
| 正本反映先（IPC）      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                                                                                                                                                                  | skill:publishing:*/skill:distribution:*チャンネル定数の追加先を設計初期に把握するため                                                             |
| 正本反映先（Store）    | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                                                                                                                                                          | publishingSliceの追加先を設計初期に把握するため                                                                                                   |
| 台帳/教訓              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                                                                                       | Phase 12同期先を確定するため                                                                                                                      |
| 利用導線先行仕様       | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`                                                                                                                                | Task-05との重複・矛盾を防ぐため（CTA制御マトリクス）                                                                                              |
| 評価・採点ゲート先行   | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`                                                                                                                                    | Task-07との閾値定義の整合性を確保するため                                                                                                         |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                                                                                                                                                | P48(useShallow)・P31(合成Hook)対策を設計に反映するため                                                                                            |
| fork型契約（TASK-9E）  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`                                                                                                                                                | `SkillForkOptions`/`SkillForkResult`/`SkillForkMetadata` 型と `skill:fork`/`skill-creator:fork` 責務境界を Task 5（fork操作定義）で整合させるため |
| インシデント対応       | `.claude/skills/aiworkflow-requirements/references/security-operations.md`                                                                                                                                                                 | セキュリティ脆弱性発見時の緊急取り下げフローを Task 4（取り下げフロー）に接続するため                                                             |
| エラーコード体系       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                                                                                                      | 公開・配布操作の新規エラーコード（2000-2999/3000-3999帯）を既存体系に整合させるため                                                               |

---

## 受入基準

| ID   | 基準名                                  | 概要                                                                                                    |
| ---- | --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| AC-1 | 共有/公開レベルが定義されている         | `local`/`team`/`public` の3レベル、各レベルの metadata 必須フィールド、遷移条件、権限マトリクスが文書化 |
| AC-2 | バージョン/互換性ルールが定義されている | semver の major/minor/patch 定義、breaking change 判定条件、後方互換保持世代数が文書化                  |
| AC-3 | 公開前安全性と観測指標が接続されている  | Task-06 `SkillSafetyContract` と Task-07 `AggregateView` から公開可否判定への接続、数値閾値が定義       |
| AC-4 | Skill Center との接続方針がある         | 登録・更新・取り下げ（通常/緊急）の各フロー、カテゴリ/タグ体系が定義                                    |

---

## 実行タスク

### Task 1: 公開レベルの定義

**目的**: スキルが「誰に見えるか」「誰が実行できるか」を3段階のレベルで明確に定義し、各レベルへの昇格条件と権限マトリクスを確立する。

**実行手順**:

1. `security-skill-execution.md` を読み込み、既存の公開制御に関する記述を全件確認する
2. `ui-ux-navigation.md` を読み込み、Skill Center の公開スキル一覧 UI の現行仕様を確認する
3. 3つの公開レベルを以下の観点で定義する:
   - `local`: 作成者のローカル環境のみで実行可能。Skill Center に表示されない。metadata に `visibility: "local"` を設定する
   - `team`: 作成者が指定したワークスペースメンバーに表示・実行可能。metadata に `visibility: "team"` と `shared_with: string[]`（ユーザーIDリスト）を設定する
   - `public`: Skill Center の公開カタログに掲載。全ユーザーが検索・インポート可能。metadata に `visibility: "public"`、`author`、`license`、`tags: string[]`（最大10件）を設定する
4. 各レベルの遷移条件を定義する:
   - `local` → `team`: 作成者が明示的に共有操作を実行し、共有先ユーザーIDを1件以上指定した場合
   - `team` → `public`: Task-06 の `SkillSafetyContract.maxRiskLevel` が `"medium"` 以下であり、かつ Task-07 の `AggregateView.testPassRate` が80%以上の場合のみ昇格ボタンが活性化する
   - 降格（`public` → `team`、`team` → `local`）: 作成者または管理者が取り下げ操作を実行した場合に即時反映する
5. デフォルトレベルは `local` とし、新規作成スキルは全て `local` から開始する
6. 権限マトリクスを定義する（誰がどのフィールドを変更できるか）:
   - `visibility` フィールド: 作成者（`author`）のみ変更可能
   - `shared_with` フィールド: 作成者のみ追加・削除可能
   - `tags` フィールド: 作成者は自由に編集可能。`public` レベルでは管理者も追加可能（削除不可）
   - `license` フィールド: 一度 `public` に昇格した後は変更不可（取り下げ後の再公開時に変更可能）
7. 成果物として `outputs/phase-1/publishing-levels.md` を作成する

**期待される成果物**: `outputs/phase-1/publishing-levels.md`（3レベルの定義・遷移条件・metadata必須フィールド・権限マトリクスを含む）

---

### Task 2: バージョン・互換性要件の定義

**目的**: スキルの更新が既存の依存関係を壊さないよう、semver ルールと schema 互換性チェックの仕様を確立する。

**実行手順**:

1. `interfaces-agent-sdk-skill.md` を読み込み、スキルの現行型定義（`SkillMetadata`、`SkillConfig` 等）を全件確認する
2. semver ルールをスキルのコンテキストで定義する:
   - `major` バージョン増加（breaking change）: `SkillConfig` の入力パラメータの削除・型変更・必須フィールド追加、出力フォーマットの非互換変更のいずれかを行った場合
   - `minor` バージョン増加（後方互換の追加）: 入力パラメータの任意フィールド追加、出力フィールドの追加のいずれかを行った場合
   - `patch` バージョン増加（バグ修正）: プロンプト文章の修正・最適化のみで、入出力インターフェースを変更しない場合
3. schema 互換性チェック仕様を定義する:
   - 互換性チェックは新バージョン公開時に自動実行する
   - チェック対象: `SkillConfig.inputSchema`（JSONSchema形式）の diff を解析し、フィールドの削除・型変更・`required` 追加を検出する
   - `major` バージョン増加なしに breaking change を含む場合、公開操作をブロックし「breaking changeが検出されました。majorバージョンを増加してください」というエラーメッセージを表示する
4. 依存スキル間のバージョン制約を定義する:
   - スキルAがスキルBを fork した場合、`dependencies` フィールドに `{ skillId: string, minVersion: string, maxVersion: string }` を記録する
   - `minVersion` は fork 時点のバージョン、`maxVersion` は fork 元の次の `major` バージョン未満とする（例: fork 時点が `1.2.0` なら `maxVersion: "<2.0.0"`）
5. 後方互換性の保証範囲を定義する:
   - `public` レベルのスキルは `major` バージョンを過去2世代まで保持する（例: v3.x が最新なら v2.x まで保持）
   - `team` レベルのスキルは過去1世代まで保持する
   - `local` レベルのスキルは旧バージョンを保持しない
6. 成果物として `outputs/phase-1/compatibility-requirements.md` を作成する

**期待される成果物**: `outputs/phase-1/compatibility-requirements.md`（semver定義・breaking changeチェック仕様・依存バージョン制約・後方互換保証範囲を含む）

---

### Task 3: 安全性ゲート・観測指標の接続定義

**目的**: Task-06 の `SkillSafetyContract` と Task-07 の `AggregateView` を公開可否判定の入力として接続し、公開前チェックリストの条件を数値で定義する。

**実行手順**:

1. Task-06 の `phase-2-design.md` を読み込み、`SkillSafetyContract` の全フィールドとその算出ロジックを確認する
2. Task-07 の `phase-2-design.md` を読み込み、`AggregateView`（`testPassRate`、`avgScore`、利用統計）の全フィールドを確認する
3. 公開可否の判定ロジックを以下の条件で定義する:
   - **公開ブロック条件**（全て AND 条件）: `SkillSafetyContract.maxRiskLevel` が `"critical"` または `"high"` である場合、公開操作を完全にブロックする
   - **公開警告条件**（いずれかが TRUE でも警告を表示する）:
     - `SkillSafetyContract.deniedRatio` が `0.5` 以上の場合（50%以上の実行で権限が拒否された）
     - `SkillSafetyContract.hasOnlyOncePerm` が `true` の場合（未検証スキルとして警告）
     - `AggregateView.testPassRate` が `0.8` 未満の場合（テスト通過率80%未満）
   - **公開推奨条件**（全てを満たす場合に推奨バッジを付与する）:
     - `SkillSafetyContract.maxRiskLevel` が `"low"` である
     - `AggregateView.testPassRate` が `0.95` 以上である
     - `AggregateView.avgScore` が `4.0` 以上（5点満点）である
4. 公開前チェックリストの項目を定義する（チェック自体は自動実行し、結果をUIに表示する）:
   - [ ] `SkillSafetyContract.maxRiskLevel` が `"medium"` 以下であること
   - [ ] `AggregateView.testPassRate` が `0.8` 以上であること
   - [ ] `license` フィールドが空でないこと
   - [ ] `tags` フィールドに1件以上の値が設定されていること
   - [ ] スキルの説明文（`description`）が20文字以上であること
5. `SkillSafetyContract` から公開可否判定への入力マッピングを型として定義する:
   ```
   PublishEligibility {
     isBlocked: boolean           // true: 公開ブロック
     blockReasons: string[]       // ブロック理由の一覧（空配列は isBlocked=false 時のみ）
     warnings: string[]           // 警告メッセージの一覧
     isRecommended: boolean       // 公開推奨バッジを付与するか
     checklistResults: {
       item: string
       passed: boolean
     }[]
   }
   ```
6. 成果物として `outputs/phase-1/safety-gate-connection.md` を作成する

**期待される成果物**: `outputs/phase-1/safety-gate-connection.md`（Task-06/07との接続条件・公開ブロック/警告/推奨の数値閾値・`PublishEligibility` 型定義を含む）

---

### Task 4: Skill Center 登録・配布・取り下げ要件

**目的**: スキルを Skill Center に公開・更新・取り下げする各フローの入力条件、実行ステップ、エラー条件を定義する。

**実行手順**:

1. `ui-ux-navigation.md` を読み込み、Skill Center の現行ナビゲーション構造と表示仕様を確認する
2. 登録フロー（新規公開）を定義する:
   - Step 1: 作成者が「公開する」ボタンをクリックする（`team` または `local` からのみ操作可能）
   - Step 2: Task-03 の `PublishEligibility` チェックを自動実行する。`isBlocked=true` の場合はStep 3に進まずブロック理由をUIに表示する
   - Step 3: metadata フォーム（`license`、`tags`、`description`）の入力画面を表示する。全必須フィールドが入力済みの場合はスキップする
   - Step 4: warnings が1件以上ある場合、警告内容と「理解した上で公開する」チェックボックスを表示する
   - Step 5: 確認ダイアログ（「公開するとすべてのユーザーが検索・インポートできます。取り消すには取り下げ操作が必要です」）を表示し、作成者が「公開する」を選択した場合に登録を実行する
   - Step 6: `visibility` を `"public"` に変更し、Skill Center カタログへの反映を行う
3. 更新フロー（新バージョン公開）を定義する:
   - Step 1: 作成者が変更を保存し、バージョン番号を変更する（semver ルールに従う）
   - Step 2: Task-02 で定義した互換性チェックを自動実行する。breaking change が検出された場合は `major` バージョン増加を要求する
   - Step 3: Task-03 の `PublishEligibility` チェックを自動実行する
   - Step 4: 旧バージョンの保持ポリシー（`major` 過去2世代）に従い、削除対象バージョンをUIに表示して作成者に確認する
   - Step 5: 確認後に新バージョンを公開し、旧バージョンを `deprecated` 状態に変更する
4. 取り下げフロー（deprecation → removal）を定義する:
   - 取り下げ（deprecation）: `visibility` を `"public"` から `"team"` に変更する。Skill Center の検索結果に「取り下げ済み」ラベルを表示する。既にインポート済みのユーザーのローカルコピーには影響しない
   - 削除（removal）: 取り下げ後30日が経過した後、作成者が明示的な削除操作を実行した場合のみ Skill Center カタログから完全削除する。削除前に「インポート済みユーザー数：N人」を表示し確認を求める
   - 緊急取り下げ（emergency withdrawal）: セキュリティ脆弱性が発見された場合、`security-operations.md` のインシデント対応フロー（P1/P2レベル）に従い、30日猶予なしで即時非公開化する。管理者が `visibility` を強制的に `"local"` に変更し、インポート済みユーザーにアプリ内通知（「スキル X にセキュリティ上の問題が発見されたため、公開が停止されました」）を送信する。作成者には修正要請と再公開手順を通知する
5. カテゴリ/タグ体系を定義する:
   - カテゴリ（固定値、作成者は選択のみ）: `automation`、`analysis`、`writing`、`coding`、`research`、`other` の6種類
   - タグ（自由入力、最大10件）: 各タグは1文字以上50文字以下の文字列。タグのオートコンプリートは既存の公開スキルのタグ一覧から提案する
6. 成果物として `outputs/phase-1/skill-center-registration.md` を作成する

**期待される成果物**: `outputs/phase-1/skill-center-registration.md`（登録・更新・取り下げの各フロー・カテゴリ/タグ体系を含む）

---

### Task 5: import/export/fork/share の整合方針

**目的**: スキルの4つの配布操作（import/export/fork/share）それぞれの定義・依存解決方法・メタデータ付与・アクセス制御を整合させる。

**実行手順**:

1. `lessons-learned-current.md` を読み込み、import/share の過去の失敗事例（drift 教訓）を全件確認する
2. `interfaces-agent-sdk-skill-reference.md` の「スキルフォーク 型定義（TASK-9E）」セクションを読み込み、既存の `SkillForkOptions`/`SkillForkResult`/`SkillForkMetadata` 型契約と `skill:fork`/`skill-creator:fork` の責務境界を確認する
3. 4つの操作を定義する:
   - **import（公開スキルをローカルに取り込む）**:
     - 対象: `visibility="public"` のスキルのみ（`team` は直接インポート不可、共有招待経由でのみ可）
     - 実行時の依存解決: スキルが `dependencies` フィールドに依存スキルを含む場合、インポート先に依存スキルが存在するかチェックし、不足している場合は「依存スキル X もインポートしますか？」のダイアログを表示する
     - インポート後のバージョン固定: インポート時のバージョンを `importedVersion` としてローカルメタデータに記録し、自動更新は行わない（手動更新は別操作）
     - インポート後の `visibility`: 自動的に `local` に設定する（インポートしたスキルをそのまま再公開することはできない。fork してから公開する）
   - **export（ローカルスキルをパッケージ化する）**:
     - 対象: `visibility` の値に関係なく全スキルで実行可能
     - 出力形式: `skill-name@version.skillpkg`（JSON形式のzip）。含まれるフィールド: `metadata`（`visibility` は除く）、`promptTemplate`、`config`、`inputSchema`、`outputSchema`
     - `visibility` フィールドは export パッケージに含めない（インポート先でデフォルトの `local` が設定される）
   - **fork（既存スキルから派生スキルを作成する）**:
     - 対象: `visibility="public"` のスキル、または `team` で自分が共有先に含まれるスキル
     - fork 後のメタデータ: `forkedFrom: { skillId: string, version: string, author: string }` を設定する
     - fork 後の `visibility`: 自動的に `local` に設定する
     - fork 元のバージョン関係: Task-02 で定義した依存バージョン制約（`minVersion`/`maxVersion`）を `dependencies` に設定する
     - fork 後の公開: fork スキルは独立したスキルとして扱われ、fork 元の `SkillSafetyContract` は引き継がない（新規公開フローを実行する）
   - **share（チーム内共有時のアクセス制御）**:
     - 操作: 作成者が `shared_with` フィールドにユーザーIDを追加する
     - 共有先ユーザーへの通知: 共有時にアプリ内通知を送信する（通知内容: 「ユーザーX がスキル Y をあなたと共有しました」）
     - 共有解除: 作成者が `shared_with` からユーザーIDを削除する。削除後、共有先ユーザーの Skill Center からスキルが非表示になる（ローカルにインポート済みのコピーには影響しない）
4. 4操作の整合確認: import した `local` スキルを fork して公開するフローが完結することを確認し、各操作の入出力の `visibility` 状態遷移図を成果物に含める
5. 成果物として `outputs/phase-1/distribution-alignment.md` を作成する

**期待される成果物**: `outputs/phase-1/distribution-alignment.md`（import/export/fork/share の4操作定義・依存解決・`visibility` 状態遷移図を含む）

---

## 参照資料

| 参照資料            | パス                                                                                                               | 説明               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------ |
| task-9f skill-share | `docs/30-workflows/completed-tasks/skill-import-agent-system/tasks/completed-task/task-022-task-9f-skill-share.md` | 共有仕様の先行事例 |
| task-05設計         | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/phase-2-design.md`              | 利用導線           |
| task-06設計         | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/phase-2-design.md`              | 安全性ゲート       |
| task-07設計         | `docs/30-workflows/completed-tasks/TASK-SKILL-LIFECYCLE-07-lifecycle-history-feedback/phase-2-design.md`           | 観測指標           |

### システム仕様（aiworkflow-requirements）

| 参照資料                               | パス                                                                                                              | 内容                                                      |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| security-skill-execution               | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                                   | 公開前安全性                                              |
| ui-ux-navigation                       | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                           | Skill Center 導線                                         |
| lessons-learned                        | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                    | import/share drift 教訓                                   |
| interfaces-agent-sdk-skill             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                 | 型定義正本（インデックス）                                |
| interfaces-agent-sdk-skill-share       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | TASK-9F共有型正本（ShareTarget/ShareImportResult等）      |
| security-skill-ipc                     | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                         | スキルIPCセキュリティ（配布操作のIPC設計前提）            |
| arch-electron-services-core            | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-core.md`                                | SkillRegistryService/SkillDistributionServiceの追加先     |
| api-ipc-agent-core                     | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                                         | skill:publishing:*/skill:distribution:*チャンネルの追加先 |
| arch-state-management-core             | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                                 | publishingSliceの追加先                                   |
| workflow-skill-lifecycle-usage-journey | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`       | 作成済みスキル利用導線・CTA制御の先行仕様                 |
| workflow-skill-lifecycle-eval-gate     | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`           | 評価・採点ゲートの先行仕様                                |
| architecture-implementation-patterns   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                       | S18(useShallow)等パターン参照先                           |
| interfaces-agent-sdk-skill-reference   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`                       | SkillForkOptions/Result/Metadata型、skill:fork責務境界    |
| security-operations                    | `.claude/skills/aiworkflow-requirements/references/security-operations.md`                                        | インシデント対応フロー、緊急取り下げの根拠                |
| error-handling                         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                             | エラーカテゴリ体系（1000-5999帯）                         |

---

## 統合テスト連携

本タスクは設計専用タスクのため、実装テストコードは生成しない。ただし、以下の検証可能性の観点を成果物に含める。

- **公開レベル遷移の検証可能性**: 各遷移条件を「テスト可能な条件式」で記述する（「安全なスキルの場合」ではなく「`SkillSafetyContract.maxRiskLevel` が `"medium"` 以下かつ `AggregateView.testPassRate` が `0.8` 以上の場合」と記述する）
- **semver 互換性チェックの検証可能性**: breaking change の検出条件を「`inputSchema` の必須フィールドが1件以上削除された場合、または既存フィールドの型定義が変更された場合」と具体的に記述する
- **公開ブロック条件の検証可能性**: ブロック条件を「`SkillSafetyContract.maxRiskLevel === "critical" || SkillSafetyContract.maxRiskLevel === "high"` が true の場合」と条件式で記述する
- **import 依存解決の検証可能性**: 依存解決の成功条件を「`dependencies` フィールドの全エントリについて、インポート先に `skillId` が存在し `minVersion <= installedVersion < maxVersion` を満たす場合」と記述する

---

## 成果物

| 成果物                           | パス                                            | 内容                                                                                  |
| -------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| 公開レベル定義書                 | `outputs/phase-1/publishing-levels.md`          | 3レベルの定義・遷移条件・metadata必須フィールド・権限マトリクス                       |
| 互換性要件書                     | `outputs/phase-1/compatibility-requirements.md` | semver定義・breaking changeチェック仕様・依存バージョン制約・後方互換保証範囲         |
| 安全性接続仕様                   | `outputs/phase-1/safety-gate-connection.md`     | Task-06/07との接続条件・公開ブロック/警告/推奨の数値閾値・`PublishEligibility` 型定義 |
| Skill Center登録要件             | `outputs/phase-1/skill-center-registration.md`  | 登録・更新・取り下げの各フロー・カテゴリ/タグ体系                                     |
| import/export/fork/share整合方針 | `outputs/phase-1/distribution-alignment.md`     | 4操作定義・依存解決・`visibility` 状態遷移図                                          |

---

## 完了条件

- [ ] **AC-1対応**: `outputs/phase-1/publishing-levels.md` に `local`/`team`/`public` の3レベルの定義、各レベルの metadata 必須フィールド、遷移条件（数値閾値含む）、権限マトリクスが含まれている
- [ ] **AC-1対応**: `visibility` のデフォルト値が `local` であることが明記されている
- [ ] **AC-2対応**: `outputs/phase-1/compatibility-requirements.md` に semver の major/minor/patch それぞれのスキルコンテキストでの定義が含まれている
- [ ] **AC-2対応**: breaking change の判定条件が「`inputSchema` の変更内容」として具体的に記述されている
- [ ] **AC-2対応**: 後方互換性の保持世代数（`public` は2世代、`team` は1世代）が明記されている
- [ ] **AC-3対応**: `outputs/phase-1/safety-gate-connection.md` に `SkillSafetyContract` の全フィールドの公開可否への接続方法が含まれている
- [ ] **AC-3対応**: 公開ブロック条件（`maxRiskLevel` が `"critical"` または `"high"`）、公開警告条件（`deniedRatio >= 0.5`、`hasOnlyOncePerm=true`、`testPassRate < 0.8`）、推奨条件（全3条件）が数値で定義されている
- [ ] **AC-3対応**: `PublishEligibility` 型の全フィールドが定義されている
- [ ] **AC-4対応**: `outputs/phase-1/skill-center-registration.md` に登録（6ステップ）・更新（5ステップ）・取り下げ（deprecation/removal 2段階）・緊急取り下げ（emergency withdrawal）の各フローが定義されている
- [ ] **AC-4対応**: 緊急取り下げフローが `security-operations.md` のP1/P2インシデントレベルと接続されており、30日猶予免除・即時非公開化・インポート済みユーザーへの通知が定義されている
- [ ] **AC-4対応**: カテゴリ6種類（固定値）とタグの制約（最大10件、1〜50文字）が定義されている
- [ ] `outputs/phase-1/distribution-alignment.md` に import/export/fork/share の4操作それぞれの対象条件・実行後の `visibility` 変化・依存解決方法が定義されている
- [ ] `outputs/phase-1/distribution-alignment.md` の fork 操作定義が `interfaces-agent-sdk-skill-reference.md` の `SkillForkOptions`/`SkillForkResult`/`SkillForkMetadata` 型契約と整合しており、`skill:fork`/`skill-creator:fork` の責務境界が明記されている
- [ ] 全5成果物ファイルが `outputs/phase-1/` 配下に存在する
- [ ] 各成果物に「テスト可能な条件式」での記述が含まれている（02-code-quality.md で禁止された曖昧表現が含まれていない）

---

## タスク100%実行確認【必須】

Phase 1 完了前に以下を必ず確認する。

1. **成果物5件の存在確認**: `ls outputs/phase-1/` を実行し、`publishing-levels.md`、`compatibility-requirements.md`、`safety-gate-connection.md`、`skill-center-registration.md`、`distribution-alignment.md` の全5ファイルが存在することを確認する
2. **曖昧表現の排除確認**: 各成果物ファイルで 02-code-quality.md の品質ルールに抵触する記述が0件であることを `node .agents/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility --json` の quality warning で確認する
3. **受入基準の充足確認**: AC-1〜AC-4 それぞれに対して完了条件チェックボックスが全てチェック済みであることを確認する
4. **Task-06/07 依存契約の整合確認**: `safety-gate-connection.md` 内の `SkillSafetyContract` フィールド定義が Task-06 phase-2-design.md の定義と一致していることを確認する。`AggregateView` フィールド参照が Task-07 phase-2-design.md の定義と一致していることを確認する
5. **semver 定義の完全性確認**: `compatibility-requirements.md` 内の major/minor/patch 定義が `interfaces-agent-sdk-skill.md` の `SkillConfig.inputSchema` と整合していることを確認する
6. **TASK-9E fork型契約の整合確認**: `distribution-alignment.md` の fork 操作が `interfaces-agent-sdk-skill-reference.md` の `SkillForkOptions`/`SkillForkResult`/`SkillForkMetadata` 型定義と整合していることを確認する
7. **緊急取り下げフローの確認**: `skill-center-registration.md` に `security-operations.md` のP1/P2インシデントレベルに基づく緊急取り下げフロー（30日猶予免除、即時非公開化、通知）が含まれていることを確認する

---

## 多角的チェック観点（AIが判断）

- 受入基準 AC-1〜AC-4 の各成果物が「テスト可能な条件式」で記述されており、曖昧表現が排除されているか
- Task-05/06/07 の依存契約との整合性（型名・フィールド名・制約値）が成果物に正確に反映されているか
- 公開レベル（local/team/public）の定義が排他的かつ網羅的であるか（状態遷移に漏れがないか）
- semver 互換性要件が既存の `SkillConfig.inputSchema` と矛盾しないか
- Skill Center 登録フローが既存の import/export/fork 操作と競合しないか

---

## サブタスク管理

| #   | タスク名                              | ステータス | 完了基準                                          |
| --- | ------------------------------------- | ---------- | ------------------------------------------------- |
| 1   | 公開レベルの定義                      | 完了       | 3レベルの定義・遷移条件・権限マトリクスが文書化   |
| 2   | バージョン・互換性要件の定義          | 完了       | semver定義・breaking changeチェック仕様が文書化   |
| 3   | 安全性ゲート・観測指標の接続定義      | 完了       | Task-06/07接続条件・PublishEligibility型が定義    |
| 4   | Skill Center 登録・配布・取り下げ要件 | 完了       | 登録・更新・取り下げの各フローが文書化            |
| 5   | import/export/fork/share の整合方針   | 完了       | 4操作定義・依存解決・visibility状態遷移図が文書化 |

---

## 依存関係

- **前提**: なし（初回Phase）。ただし TASK-SKILL-LIFECYCLE-05, 06, 07 が完了していること
- **後続**: Phase 2（設計）へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
### 実行タスク

- タスク1（公開レベルの定義）: （結果を記録）
- タスク2（バージョン・互換性要件の定義）: （結果を記録）
- タスク3（安全性ゲート・観測指標の接続定義）: （結果を記録）
- タスク4（Skill Center 登録・配布・取り下げ要件）: （結果を記録）
- タスク5（import/export/fork/share の整合方針）: （結果を記録）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## Phase 4 開始ゲート

Phase 4（テスト作成）は、Phase 3（設計レビュー）の総合判定が PASS または MINOR（追跡テーブル作成後）の場合にのみ開始できる。Phase 1 完了だけでは Phase 4 に進めない。

---

## 次Phase

Phase 2: 設計

- 成果物パス: `phase-2-design.md`
- 前提条件: Phase 1 完了条件が全てチェック済みであること
- 主な活動:
  - `PublishEligibility` インターフェースの正式 TypeScript 型定義の設計
  - `SkillMetadata` への `visibility`/`shared_with`/`forkedFrom`/`dependencies` フィールド拡張設計（後方互換性を維持）
  - Skill Center 登録フロー（6ステップ）の IPC チャンネル設計
  - import 時の依存解決アルゴリズムの設計
  - Task-06 の `SkillSafetyContract` と Task-07 の `AggregateView` を受け取る `PublishCheckService` インターフェース設計

---

## 差し戻し時の再実行手順

Phase 3（設計レビュー）で MAJOR（要件問題）判定、または Phase 10（最終レビュー）で CRITICAL 判定により Phase 1 へ差し戻された場合、以下の手順で再実行する:

1. 差し戻し元の指摘事項レポート（`outputs/phase-3/review-result.md` または `outputs/phase-10/final-review-decision.md`）を確認する
2. 指摘事項に該当する受入基準（AC-1〜AC-4）または機能要件を修正する
3. 修正箇所を `outputs/phase-1/` 配下の成果物に反映する
4. 完了条件を再確認し、Phase 2 へ進む
