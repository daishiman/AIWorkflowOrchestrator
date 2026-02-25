# Phase 1: 要件定義 - Phase 12 仕様更新リンク同期ガード強化

## メタ情報

| 項目         | 値                                                 |
| ------------ | -------------------------------------------------- |
| Phase        | 1                                                  |
| タスクID     | UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001          |
| タスク名     | Phase 12 仕様更新リンク同期ガード強化              |
| 機能名       | ut-imp-aiworkflow-spec-reference-sync-001          |
| 種別         | 改善 (improvement) ※仕様書修正のみ、コード変更なし |
| GitHub Issue | #903                                               |
| 作成日       | 2026-02-25                                         |

## 目的

Phase 12 でシステム仕様書を更新する際に発生する3つの問題（baseline/current 判定混同、未タスク完了後の参照リンク漏れ、fallback 経路の片側修正残り）を解消するための機能要件・非機能要件を抽出し、検証可能な受け入れ基準を定義する。

## 実行タスク

- 問題パターン分析: Phase 12 の失敗パターンを FR 定義へ落とし込む
- 同期チェックリスト要件定義: 3点同期の更新順序と検証条件を定義する
- 苦戦箇所転記要件定義: P3 準拠の3ステップを標準化する
- 受入基準作成: FR/NFR ごとの Gherkin シナリオを定義する

### Task 1: 問題パターンの分析と要件抽出

- 過去の Phase 12 実行で発生した問題（P1-P4, P25-P28, P43）の具体的な再現条件を特定する
- 各問題パターンを FR（機能要件）として定式化する
- `baseline` 監査結果と `current` 変更差分の判定フロー内で混同が発生する箇所を特定する

### Task 2: 同期チェックリストの要件定義

- `task-workflow.md` / `SKILL.md` / `LOGS.md` の3点同期が必要な場面を列挙する
- 各同期ポイントで検証すべき項目を受入基準として定義する
- 検証コマンド（`verify-unassigned-links.js`、`generate-index.js`、SKILL validator）の期待動作を明文化する

### Task 3: 苦戦箇所転記手順の標準化要件

- Phase 12 の苦戦箇所セクションから未タスク指示書への転記が漏れる原因を特定する
- 転記手順を P3 準拠の3ステップ（指示書作成 → 残課題テーブル登録 → 関連仕様書リンク追加）で標準化する要件を定義する

### Task 4: 受入基準の作成

- 各 FR/NFR に対して検証可能な受入基準を Gherkin 形式で記述する

## 参照資料

| 資料名                     | パス                                                                               | 説明                               |
| -------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------- |
| 未タスク指示書             | `docs/30-workflows/completed-tasks/task-imp-aiworkflow-spec-reference-sync-001.md` | 本タスクの発見元指示書             |
| task-workflow.md           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`               | 未タスク管理・残課題テーブルの正本 |
| lessons-learned.md         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`             | 過去タスクの教訓集                 |
| spec-update-workflow.md    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`     | Phase 12 仕様更新手順の正本        |
| phase-11-12-guide.md       | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`        | Phase 11-12 実行ガイド             |
| verify-unassigned-links.js | `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`     | 未タスク参照リンク検証スクリプト   |
| generate-index.js          | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`                 | topic-map.md 再生成スクリプト      |
| 06-known-pitfalls.md       | `.claude/rules/06-known-pitfalls.md`                                               | P1-P4, P25-P28, P43 の教訓         |
| 05-task-execution.md       | `.claude/rules/05-task-execution.md`                                               | Phase 12 必須チェックリスト        |
| 依存タスク（完了）         | UT-IPC-AUTH-HANDLE-DUPLICATE-001                                                   | 教訓の発見元タスク                 |
| 依存タスク（前提）         | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001                                          | 監査判定分離の前提タスク           |

### aiworkflow-requirements 仕様参照テーブル

| 仕様書                  | 参照セクション                  | 参照目的                         |
| ----------------------- | ------------------------------- | -------------------------------- |
| indexes/resource-map.md | ガイドライン / task-workflow    | 参照開始点の特定                 |
| indexes/topic-map.md    | task-workflow / lessons-learned | 参照対象セクションの特定         |
| task-workflow.md        | 残課題テーブル                  | 未タスク参照同期ルールの現状確認 |
| lessons-learned.md      | Phase 12 関連教訓               | 再発パターンと防止策の抽出       |
| patterns.md             | Phase 12 漏れ                   | 実装パターン/失敗パターンの抽出  |

### task-specification-creator 仕様参照テーブル

| 仕様書                  | 参照セクション        | 参照目的                               |
| ----------------------- | --------------------- | -------------------------------------- |
| spec-update-workflow.md | Step 1-A ~ Step 1-D   | 仕様書更新手順の現行定義確認           |
| phase-templates.md      | Phase 12 テンプレート | 完了条件・チェックリストの現行構造確認 |

### aiworkflow-requirements 抽出ログ（Progressive Disclosure）

1. `indexes/resource-map.md` で「ガイドライン」「task-workflow」を起点に候補仕様を特定。
2. `indexes/topic-map.md` で該当セクションを絞り込み、読み込み範囲を限定。
3. `task-workflow.md` / `lessons-learned.md` / `patterns.md` を要件抽出対象として採用。

### aiworkflow-requirements 抽出完全性チェック

| カテゴリ                   | 参照仕様                                                                                               | 判定   | 要件反映先                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------ | ------ | ------------------------------ |
| タスク運用ルール           | `references/task-workflow.md`                                                                          | 必須   | FR-1, FR-2                     |
| 教訓・再発防止             | `references/lessons-learned.md`, `references/patterns.md`                                              | 必須   | FR-3, FR-4                     |
| 品質ゲート                 | `references/quality-requirements.md`                                                                   | 必須   | NFR-1, NFR-2, NFR-3            |
| 探索インデックス           | `indexes/resource-map.md`, `indexes/topic-map.md`                                                      | 必須   | 参照資料, 抽出ログ             |
| 仕様作成規約               | `references/spec-guidelines.md`                                                                        | 必須   | AC, 完了条件の記述粒度         |
| API/UI/DB/セキュリティ個別 | `references/api-*.md`, `references/ui-ux-*.md`, `references/database-*.md`, `references/security-*.md` | 非該当 | コード変更なし（仕様書タスク） |

## 実行手順

### ステップ 1: 既存問題パターンの収集

1. `06-known-pitfalls.md` から Phase 12 関連の Pitfall（P1-P4, P25-P28, P43）を読み込む
2. UT-IPC-AUTH-HANDLE-DUPLICATE-001 の Phase 12 実行記録から発生した具体的な問題を抽出する
3. `baseline` 監査結果と `current` 変更差分の判定で混同が発生した具体的なケースを記録する

### ステップ 2: 機能要件（FR）の定義

以下の FR を定義する:

- FR-1: `verify-unassigned-links.js` 実行で参照切れ 0 件を達成できる同期ルール
- FR-2: `task-workflow.md` / `SKILL.md` / `LOGS.md` の3点同期チェックリスト
- FR-3: 苦戦箇所の未タスク指示書への転記手順標準化
- FR-4: `baseline` / `current` 判定の分離ルール明文化

### ステップ 3: 非機能要件（NFR）の定義

以下の NFR を定義する:

- NFR-1: 同種課題を 20 分以内に再現可能な形で解決可能
- NFR-2: 検証コマンドの実行が 5 分以内に完了
- NFR-3: チェックリスト項目が曖昧表現なしで 100% 具体的

### ステップ 4: 受入基準の作成

各 FR/NFR に対して検証可能な受入基準を Gherkin 形式で定義する。

---

## 機能要件（FR）

### FR-1: 未タスク参照リンク同期ルール

| ID     | 要件                                                                                                               | 優先度 |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------ |
| FR-1.1 | `verify-unassigned-links.js` 実行時に `unassigned-task/` 配下の参照リンクが全て有効であること                      | 高     |
| FR-1.2 | 未タスク完了時に `task-workflow.md` の残課題テーブルから該当行が削除（またはステータス「完了」に更新）されること   | 高     |
| FR-1.3 | 未タスク完了時に関連仕様書内の参照リンクが「完了タスク」セクションに移動されること                                 | 中     |
| FR-1.4 | `unassigned-task/` ディレクトリ内に存在するファイルと `task-workflow.md` 残課題テーブルの行が 1:1 対応していること | 高     |

### FR-2: 3点同期チェックリスト

| ID     | 要件                                                                                                                                      | 優先度 |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-2.1 | Phase 12 Task 2 Step 1-A の実行順序として `task-workflow.md` → `SKILL.md`（2ファイル） → `LOGS.md`（2ファイル）の順が明文化されていること | 高     |
| FR-2.2 | 各ファイルの更新完了をチェックボックスで個別に記録できる形式であること                                                                    | 高     |
| FR-2.3 | `LOGS.md` は `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の2ファイルが明示的にリストされていること          | 高     |
| FR-2.4 | `SKILL.md` は `aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` の2ファイルが明示的にリストされていること       | 高     |

### FR-3: 苦戦箇所の未タスク転記手順

| ID     | 要件                                                                                                       | 優先度 |
| ------ | ---------------------------------------------------------------------------------------------------------- | ------ |
| FR-3.1 | Phase 12 の苦戦箇所セクションで検出された課題を未タスク指示書に転記する手順が3ステップで定義されていること | 高     |
| FR-3.2 | 転記の3ステップは P3 準拠（指示書作成 → 残課題テーブル登録 → 関連仕様書リンク追加）であること              | 高     |
| FR-3.3 | 苦戦箇所が「0 件」の場合でも「苦戦箇所なし」と明記する手順が定義されていること                             | 中     |

### FR-4: baseline/current 判定分離ルール

| ID     | 要件                                                                                                             | 優先度 |
| ------ | ---------------------------------------------------------------------------------------------------------------- | ------ |
| FR-4.1 | `baseline` 監査結果（既存の問題）と `current` 変更差分（今回の変更で生じた問題）の判定基準が明文化されていること | 高     |
| FR-4.2 | `baseline` の問題は「既存課題として記録するが今回のスコープ外」と判定するルールが定義されていること              | 高     |
| FR-4.3 | `current` の問題は「今回のタスクで修正必須」と判定するルールが定義されていること                                 | 高     |

---

## 非機能要件（NFR）

### NFR-1: 再現性

| ID      | 要件                                                                                               | 優先度 |
| ------- | -------------------------------------------------------------------------------------------------- | ------ |
| NFR-1.1 | 同種の参照リンク切れ課題が発生した場合、チェックリストに従って 20 分以内に問題箇所を特定できること | 高     |
| NFR-1.2 | チェックリストの各ステップが「実行コマンド」または「確認対象ファイルパス」を含んでいること         | 高     |

### NFR-2: 検証効率

| ID      | 要件                                                                       | 優先度 |
| ------- | -------------------------------------------------------------------------- | ------ |
| NFR-2.1 | `verify-unassigned-links.js` の実行が 3 分以内に完了すること               | 中     |
| NFR-2.2 | `generate-index.js` による topic-map.md 再生成が 2 分以内に完了すること    | 中     |
| NFR-2.3 | 3つの検証コマンドを順次実行する手順が 1 つのセクションにまとまっていること | 高     |

### NFR-3: 明確性

| ID      | 要件                                                                                      | 優先度 |
| ------- | ----------------------------------------------------------------------------------------- | ------ |
| NFR-3.1 | チェックリスト項目に禁止曖昧語（`.claude/rules/02-code-quality.md` 定義）が含まれないこと | 高     |
| NFR-3.2 | 各チェック項目が「何を」「どのファイルで」「どう確認するか」の3要素を含むこと             | 高     |
| NFR-3.3 | 検証コマンドの期待出力（正常時・異常時）が明記されていること                              | 中     |

---

## 受入基準（AC）

### AC-1: 参照リンク検証ゼロエラー

```gherkin
Scenario: verify-unassigned-links.js の実行で参照切れが 0 件
  Given Phase 12 Task 2 の全ステップが完了している
  And   未タスク指示書が unassigned-task/ に配置されている
  When  node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js を実行する
  Then  参照切れエラーが 0 件であること
  And   全リンクが有効なファイルパスを指していること
```

### AC-2: 3点同期チェックリスト完全実行

```gherkin
Scenario: task-workflow.md / SKILL.md / LOGS.md の3点同期が完了する
  Given Phase 12 の仕様書更新を実行する
  When  3点同期チェックリストの全項目を順番に実行する
  Then  task-workflow.md の残課題テーブルが更新されていること
  And   aiworkflow-requirements/SKILL.md の変更履歴テーブルが更新されていること
  And   task-specification-creator/SKILL.md の変更履歴テーブルが更新されていること
  And   aiworkflow-requirements/LOGS.md にタスク完了エントリが追加されていること
  And   task-specification-creator/LOGS.md にタスク完了記録が追加されていること
```

### AC-3: 苦戦箇所の未タスク転記

```gherkin
Scenario: 苦戦箇所が検出された場合に未タスク指示書に転記される
  Given Phase 12 の苦戦箇所セクションに課題が記録されている
  When  転記手順（3ステップ）を実行する
  Then  unassigned-task/ に指示書ファイルが作成されていること
  And   task-workflow.md の残課題テーブルに行が追加されていること
  And   関連仕様書に参照リンクが追加されていること
```

### AC-4: baseline/current 判定の分離

```gherkin
Scenario: baseline 監査結果と current 変更差分が区別される
  Given 監査スクリプトが既存の問題（baseline）と今回の変更による問題（current）を出力する
  When  判定ルールに従って分類する
  Then  baseline の問題が「スコープ外・既存課題」として記録されること
  And   current の問題が「修正必須」として記録されること
  And   両者が混同されないこと
```

### AC-5: 曖昧表現の排除

```gherkin
Scenario: チェックリスト全項目が具体的である
  Given 強化後のチェックリストが作成されている
  When  全項目を grep で「[適][切]に|[必][要]に応じて|等$|[な][ど]$」を検索する
  Then  該当する曖昧表現が 0 件であること
```

---

## スコープ定義

### 含むもの

| 対象                                 | 変更内容                                           |
| ------------------------------------ | -------------------------------------------------- |
| `task-workflow.md`                   | 未タスク参照同期ルールの強化セクション追加         |
| `spec-update-workflow.md`            | 3点同期チェックリスト・baseline/current 判定の追記 |
| `phase-11-12-guide.md`               | 検証コマンド実行手順の整備                         |
| `phase-templates.md`（Phase 12部分） | 完了条件への同期ガード項目追加                     |

### 含まないもの

| 対象                               | 除外理由                               |
| ---------------------------------- | -------------------------------------- |
| 既存全未タスク指示書の一括リライト | スコープ肥大化防止。個別タスクで対応   |
| `apps/` / `packages/` のコード変更 | 本タスクは仕様書修正のみ               |
| 検証スクリプト本体の機能追加       | スクリプト改修は別タスクとして切り出す |

---

## 統合テスト連携【必須】

本タスクは仕様書修正のみのため、自動テスト（ユニット/統合/E2E）の変更は発生しない。
統合テスト連携として、以下の検証コマンドの実行可能性確認を要件に含める:

| 検証コマンド                   | 検証内容                          | 期待結果                                 |
| ------------------------------ | --------------------------------- | ---------------------------------------- |
| `verify-unassigned-links.js`   | 未タスク参照リンクの整合性        | 参照切れ 0 件（exit code 0）             |
| `generate-index.js`            | topic-map.md の索引整合性         | 再生成完了（exit code 0）                |
| SKILL.md validator（手動確認） | SKILL.md 変更履歴テーブルの整合性 | 全タスクの変更履歴エントリが存在すること |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断     | 仕様参照先                                                       |
| ------------------ | ------------ | ---------------------------------------------------------------- |
| アーキテクチャ     | **該当する** | ドキュメント構造間の依存関係（仕様書間の相互参照整合性）         |
| セキュリティ       | 該当しない   | -                                                                |
| UI/UX              | 該当しない   | -                                                                |
| エラーハンドリング | **該当する** | 検証スクリプトのエラー検出（リンク切れ・索引不整合の検出と報告） |
| データ整合性       | **該当する** | 仕様書間の参照整合性が主要な検証対象                             |
| パフォーマンス     | 該当しない   | -                                                                |

## 成果物

| 成果物       | パス                                         | 説明                    |
| ------------ | -------------------------------------------- | ----------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | FR/NFR の実行結果を記録 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC の詳細定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲の詳細          |

## 完了条件

- [ ] 問題パターン（baseline/current 混同、参照リンク漏れ、fallback 片側修正）の具体的な再現条件が記録されている
- [ ] FR-1（参照リンク同期）の全要件（FR-1.1 ~ FR-1.4）が抽出されている
- [ ] FR-2（3点同期チェックリスト）の全要件（FR-2.1 ~ FR-2.4）が抽出されている
- [ ] FR-3（苦戦箇所転記手順）の全要件（FR-3.1 ~ FR-3.3）が抽出されている
- [ ] FR-4（baseline/current 判定分離）の全要件（FR-4.1 ~ FR-4.3）が抽出されている
- [ ] NFR-1（再現性）の全要件（NFR-1.1 ~ NFR-1.2）が抽出されている
- [ ] NFR-2（検証効率）の全要件（NFR-2.1 ~ NFR-2.3）が抽出されている
- [ ] NFR-3（明確性）の全要件（NFR-3.1 ~ NFR-3.3）が抽出されている
- [ ] AC-1 ~ AC-5 の受入基準が検証可能な Gherkin 形式で定義されている
- [ ] スコープ定義（含む/含まない）が明確に記載されている
- [ ] 依存タスク（UT-IPC-AUTH-HANDLE-DUPLICATE-001, UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001）との関係が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 2: 設計（`phase-2-design.md`）
