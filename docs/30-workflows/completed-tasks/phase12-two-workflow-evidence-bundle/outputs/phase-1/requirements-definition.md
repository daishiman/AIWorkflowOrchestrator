# 要件定義まとめ — UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001

## メタ情報

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| タスクID   | UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 |
| Phase      | 1 — 要件定義                                    |
| 作成日     | 2026-03-03                                      |
| ステータス | 完了                                            |

## 目的の要約

Phase 12 で `spec_created` workflow と完了 workflow を同時監査する際に、検証証跡の記録先が分散し完了判定の一貫性が損なわれる問題を解決する。2workflow の監査結果を1フォーマットに集約し、Task 1/3/4/5 の成果物実体確認、UIスクリーンショット証跡の検証、current/baseline 分離判定を定型化・機械検証可能にする。

## 機能要件（FR）

### FR-1: 2workflow証跡集約フォーマット定義

2つの workflow（`spec_created` と `completed`）の監査結果を同一フォーマットで記録するテンプレートを定義する。

| フィールド名         | 型       | 必須 | 説明                                                             |
| -------------------- | -------- | ---- | ---------------------------------------------------------------- |
| taskId               | string   | Yes  | タスクID（例: UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001）  |
| workflowType         | enum     | Yes  | `spec_created` または `completed`                                |
| workflowPath         | string   | Yes  | workflowディレクトリの相対パス（`docs/30-workflows/` 起点）      |
| verifyAllSpecsResult | object   | Yes  | `verify-all-specs` の実行結果（`totalViolations`, `details[]`）  |
| validatePhaseResult  | object   | Yes  | `validate-phase-output` の実行結果（`totalErrors`, `details[]`） |
| auditTimestamp       | ISO 8601 | Yes  | 監査実行日時                                                     |
| auditor              | string   | Yes  | 監査実行者（SubAgent名または `lead`）                            |

### FR-2: Task 1/3/4/5 成果物実体確認チェックリスト

Phase 12 の Task 1（実装ガイド）、Task 3（documentation-changelog）、Task 4（未タスク検出）、Task 5（スキルフィードバック）の成果物が物理的に存在し、内容が最低要件を満たすかを確認するチェックリストを定義する。

| #   | チェック項目                   | 確認対象ファイル                                | 検証方法                                  |
| --- | ------------------------------ | ----------------------------------------------- | ----------------------------------------- |
| 1   | Task 1: Part 1 存在確認        | `outputs/phase-12/implementation-guide.md`      | ファイル実在 + `## Part 1` セクション存在 |
| 2   | Task 1: Part 2 存在確認        | `outputs/phase-12/implementation-guide.md`      | ファイル実在 + `## Part 2` セクション存在 |
| 3   | Task 1: API/IPC/Component文書  | `outputs/phase-12/api-documentation.md` 等      | ファイル実在（該当する文書種別のみ）      |
| 4   | Task 3: changelog 存在確認     | `outputs/phase-12/documentation-changelog.md`   | ファイル実在 + 変更記録が1件以上          |
| 5   | Task 4: 未タスクレポート確認   | `outputs/phase-12/unassigned-task-detection.md` | ファイル実在（0件でも必須）               |
| 6   | Task 5: フィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | ファイル実在（改善点なしでも必須）        |

### FR-3: UIスクリーンショット証跡検証手順

UIタスクでスクリーンショットが添付される場合に、取得日とファイル実在を同時に検証する手順を定義する。非UIタスクの場合は N/A としてスキップ可能とする。

| フィールド名   | 型       | 必須              | 説明                                                         |
| -------------- | -------- | ----------------- | ------------------------------------------------------------ |
| screenshotPath | string   | UIタスク時のみYes | スクリーンショットファイルの相対パス                         |
| captureDate    | ISO 8601 | UIタスク時のみYes | スクリーンショット取得日（ファイルメタデータまたは手動記録） |
| fileExists     | boolean  | UIタスク時のみYes | `ls -la` コマンドでファイルの物理的存在を確認した結果        |
| contentMatch   | boolean  | UIタスク時のみYes | スクリーンショットの内容が該当画面と一致するかの目視確認結果 |

**UI/非UI分岐ルール**:

- UIタスク（Renderer/コンポーネント実装を含む）: スクリーンショット検証を必須として実施する
- 非UIタスク（ワークフロー定義、スクリプト改善、仕様書整備のみ）: `N/A（UIタスクではないため）` としてスキップする

### FR-4: current/baseline分離判定

`currentViolations=0` を合否基準として固定し、`baselineViolations` は監視値として分離記録する。

| フィールド名       | 型     | 必須 | 説明                                                       |
| ------------------ | ------ | ---- | ---------------------------------------------------------- |
| currentViolations  | object | Yes  | 今回のタスクで新規発生した違反（`total`, `details[]`）     |
| baselineViolations | object | Yes  | タスク着手前から存在する既知の違反（`total`, `details[]`） |
| judgmentBasis      | string | Yes  | 固定値: `currentViolations.total === 0`                    |
| result             | enum   | Yes  | `PASS` または `FAIL`                                       |

**分離基準**:

- `baselineViolations`: タスク着手前の `main` ブランチで `verify-all-specs.js` を実行して取得する違反
- `currentViolations`: タスクブランチで新規に発生した違反。全違反から baseline を差し引いた差分
- PASS条件: `currentViolations.total === 0`
- `baselineViolations` は PASS/FAIL 判定に影響しない（監視値として記録・未タスク管理のみ）

## 非機能要件（NFR）

### NFR-1: 再監査時の再現性

- 同一の入力（タスクID、ブランチ名、2つのworkflowパス）に対して、異なる実行者が同一の判定結果を得られる
- 検証コマンドは全てコピー&ペーストで実行可能な形式で提供する
- 手動判断を要するステップは目視確認（UIスクリーンショットの内容確認）のみとし、判断基準を数値または列挙値で定義する

### NFR-2: 監査結果の機械検証可能性

- 証跡集約テンプレートの全フィールドが型付き（string, enum, object, boolean, ISO 8601）で定義される
- PASS/FAIL判定が `currentViolations.total === 0` の数値比較で決定される
- チェックリストの完了状態が `[x]` / `[ ]` のパターンマッチで機械的に読み取れる

### NFR-3: 既存監査スクリプト互換性

- `verify-all-specs.js` の出力フォーマット（violations配列）と互換性を持つ
- `validate-phase-output.js` の出力フォーマットと互換性を持つ
- 既存の `artifacts.json` スキーマに破壊的変更を加えない
- `audit-unassigned-tasks.js` の未タスク検出ロジックと干渉しない

## 統合テスト連携

| #   | 接続先                                 | 連携内容                                                                     |
| --- | -------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | verify-all-specs.js                    | 2workflow各々の violations 出力を証跡集約テンプレートの入力とする            |
| 2   | validate-phase-output.js               | Phase 12 成果物の存在検証結果を Task 1/3/4/5 チェックリストの入力とする      |
| 3   | artifacts.json API                     | Phase 12 ステータスと audit オブジェクトの読み書きインターフェースを利用する |
| 4   | phase-12-documentation.md チェック同期 | チェックリストの `[x]`/`[ ]` 状態を証跡集約テンプレートの入力とする          |

## 多角的チェック観点

| 観点                  | 確認内容                                                                          |
| --------------------- | --------------------------------------------------------------------------------- |
| 既存運用との互換性    | 現行のPhase 12手順書で定義済みの手順を破壊しないこと                              |
| P43対策               | 証跡集約テンプレートの記入がSubAgent 1体あたり3ファイル以下の制約内で完結すること |
| P1/P25対策            | LOGS.md 2ファイル更新の手順がチェックリストに含まれること                         |
| P4対策                | documentation-changelog への「完了」記載は全Step完了後のみとすること              |
| 2workflow横断の一貫性 | `spec_created` と `completed` の両方に同一チェック項目が適用されること            |
| UIタスク固有の検証    | スクリーンショット検証が非UIタスクで過剰な負荷を与えないこと                      |
