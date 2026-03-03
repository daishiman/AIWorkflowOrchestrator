# Phase 1: 要件定義 — UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001

## メタ情報

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| Phase      | 1 — 要件定義                                    |
| 機能名     | Phase 12 2workflow同時監査の証跡集約ガード      |
| タスクID   | UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 |
| 作成日     | 2026-03-03                                      |
| 依存タスク | UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001          |
|            | UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001    |
|            | UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001     |
| ステータス | Draft                                           |

## 目的

Phase 12 で `spec_created` workflow と完了 workflow を同時監査する際に、検証証跡の記録先が分散して完了判定の一貫性が損なわれる問題を解決する。2workflow の監査結果を1フォーマットに集約し、Task 1/3/4/5 の成果物実体確認・UIスクリーンショット証跡の検証・current/baseline分離判定を定型化・機械検証可能にする。

## 実行タスク

- 要件抽出: 達成目標4項目から機能要件・非機能要件を導出する。
- 受け入れ基準作成: 各FRに対して検証可能な受け入れ基準を定義する。
- FR/NFR分類: 機能要件4項目・非機能要件3項目を分類し、優先度を設定する。

| #   | タスク名         | 内容                                                     |
| --- | ---------------- | -------------------------------------------------------- |
| 1   | 要件抽出         | 達成目標4項目から機能要件・非機能要件を導出する          |
| 2   | 受け入れ基準作成 | 各FRに対して検証可能な受け入れ基準を定義する             |
| 3   | FR/NFR分類       | 機能要件4項目・非機能要件3項目を分類し、優先度を設定する |

## 参照資料

| #   | 資料名                     | パス                                                                                 | 用途                               |
| --- | -------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------- |
| 1   | タスクワークフロー         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | 残課題テーブル・完了台帳の構造参照 |
| 2   | 教訓集                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`               | Phase 12関連の過去教訓の参照       |
| 3   | 仕様更新フロー             | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`       | Phase 12更新手順の参照             |
| 4   | Phase 11/12ガイド          | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`          | Phase 12必須5タスクの確認          |
| 5   | 未タスクガイドライン       | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 未タスク管理3ステップの基準参照    |
| 6   | Phase テンプレート         | `.claude/skills/task-specification-creator/references/phase-templates.md`            | 仕様書共通構造の準拠確認           |
| 7   | 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                 | P1-P4, P43の再発防止策確認         |
| 8   | Phase 12レトロテンプレート | `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`  | 既存テンプレート構造の参照         |
| 9   | aiworkflowクイック参照     | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                  | 仕様探索の初期導線                 |
| 10  | aiworkflowリソースマップ   | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                     | 必要仕様の絞り込み                 |
| 11  | aiworkflowトピックマップ   | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                        | 参照セクションの行位置特定         |

## 実行手順

### Step 0: aiworkflow-requirements から必要仕様を抽出

`resource-map.md` を起点に、`task-workflow.md` と `lessons-learned.md` を優先読込対象として特定し、`topic-map.md` で該当セクションの行位置を確認する。

### Step 1: 現状課題の整理

Phase 12 で2つの workflow を同時監査した際に検出された4つの課題を整理する:

1. **証跡記録先の分散**: `spec_created` workflow と完了 workflow の `verify-all-specs` / `validate-phase-output` 結果がそれぞれのワークフローディレクトリに分散して記録され、同時監査時の横断比較が困難である
2. **Task 1/3/4/5 成果物実体確認の未定型化**: `implementation-guide.md` の Part 1/Part 2 確認、`documentation-changelog.md` 確認、`unassigned-task-detection.md` 確認、スキルフィードバックレポート確認が個々の実行者の判断に依存しており、チェック項目が固定されていない
3. **UIスクリーンショット証跡の検証不足**: UIタスクで添付されるスクリーンショットの取得日とファイル実在が体系的に検証されていない。スクリーンショットパスの記載はあるが、ファイルの物理的存在確認が手順化されていない
4. **current/baseline分離の合否基準未統一**: `currentViolations` と `baselineViolations` を区別する基準はあるが、2workflow同時監査時に合否判定基準が `currentViolations=0` として固定されておらず、`baseline` を含めた総数で判断される場合がある

### Step 2: 機能要件（FR）の定義

#### FR-1: 2workflow証跡集約フォーマットの定義

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

**受け入れ基準**:

- AC-1-1: 2つの workflow の監査結果が同一テーブル内に横並びで記録され、差異が一目で比較できる
- AC-1-2: `workflowType` フィールドで `spec_created` と `completed` が区別される
- AC-1-3: 各 workflow に対して `verifyAllSpecsResult` と `validatePhaseResult` の両方が記録される

#### FR-2: Task 1/3/4/5 成果物実体確認チェックリストの定義

Phase 12 の Task 1（実装ガイド）、Task 3（documentation-changelog）、Task 4（未タスク検出）、Task 5（スキルフィードバック）の成果物が物理的に存在し、内容が最低要件を満たすかを確認するチェックリストを定義する。

| チェック項目                   | 確認対象ファイル                                | 検証方法                                  |
| ------------------------------ | ----------------------------------------------- | ----------------------------------------- |
| Task 1: Part 1 存在確認        | `outputs/phase-12/implementation-guide.md`      | ファイル実在 + `## Part 1` セクション存在 |
| Task 1: Part 2 存在確認        | `outputs/phase-12/implementation-guide.md`      | ファイル実在 + `## Part 2` セクション存在 |
| Task 1: API/IPC/Component文書  | `outputs/phase-12/api-documentation.md` 等      | ファイル実在（該当する文書種別のみ）      |
| Task 3: changelog 存在確認     | `outputs/phase-12/documentation-changelog.md`   | ファイル実在 + 変更記録が1件以上          |
| Task 4: 未タスクレポート確認   | `outputs/phase-12/unassigned-task-detection.md` | ファイル実在（0件でも必須）               |
| Task 5: フィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | ファイル実在（改善点なしでも必須）        |

**受け入れ基準**:

- AC-2-1: 6項目のチェック項目が全て定義されている
- AC-2-2: 各チェック項目に具体的な検証方法（コマンドまたは確認手順）が記載されている
- AC-2-3: Part 1 のセクション内に日常例えが含まれることを検証する手順が定義されている

#### FR-3: UIスクリーンショット証跡の検証手順定義

UIタスクでスクリーンショットが添付される場合に、取得日とファイル実在を同時に検証する手順を定義する。

| フィールド名   | 型       | 必須              | 説明                                                         |
| -------------- | -------- | ----------------- | ------------------------------------------------------------ |
| screenshotPath | string   | UIタスク時のみYes | スクリーンショットファイルの相対パス                         |
| captureDate    | ISO 8601 | UIタスク時のみYes | スクリーンショット取得日（ファイルメタデータまたは手動記録） |
| fileExists     | boolean  | UIタスク時のみYes | `ls -la` コマンドでファイルの物理的存在を確認した結果        |
| contentMatch   | boolean  | UIタスク時のみYes | スクリーンショットの内容が該当画面と一致するかの目視確認結果 |

**受け入れ基準**:

- AC-3-1: UIタスクの場合にスクリーンショット検証が必須として定義されている
- AC-3-2: 非UIタスクの場合にスクリーンショット検証が「N/A（UIタスクではないため）」としてスキップ可能である
- AC-3-3: ファイル実在確認コマンド（`ls -la`）がコピー&ペースト実行可能な形式で提供される

#### FR-4: current/baseline分離判定の合否基準固定

`currentViolations=0` を合否基準として固定し、`baselineViolations` は監視値として分離記録するフォーマットを定義する。

| フィールド名       | 型     | 必須 | 説明                                                       |
| ------------------ | ------ | ---- | ---------------------------------------------------------- |
| currentViolations  | object | Yes  | 今回のタスクで新規発生した違反（`total`, `details[]`）     |
| baselineViolations | object | Yes  | タスク着手前から存在する既知の違反（`total`, `details[]`） |
| judgmentBasis      | string | Yes  | 固定値: `currentViolations.total === 0`                    |
| result             | enum   | Yes  | `PASS` または `FAIL`                                       |

**分離基準**:

- `baselineViolations`: タスク着手前の `main` ブランチで `verify-all-specs.js` を実行して取得する違反
- `currentViolations`: タスクブランチで新規に発生した違反。全違反から baseline を差し引いた差分

**受け入れ基準**:

- AC-4-1: `currentViolations.total === 0` の場合に PASS、`> 0` の場合に FAIL と判定される
- AC-4-2: `baselineViolations` が PASS/FAIL 判定に影響しない
- AC-4-3: `baselineViolations` は記録され、未タスクとして管理される旨が明記されている
- AC-4-4: 2workflow同時監査時に、各workflowで独立して current/baseline 分離を実施する手順が定義されている

### Step 3: 非機能要件（NFR）の定義

#### NFR-1: 再監査時の再現性

- 同一の入力（タスクID、ブランチ名、2つのworkflowパス）に対して、異なる実行者が同一の判定結果を得られる
- 検証コマンドは全てコピー&ペーストで実行可能な形式で提供する
- 手動判断を要するステップは目視確認（UIスクリーンショットの内容確認）のみとし、判断基準を数値または列挙値で定義する

#### NFR-2: 監査結果の機械検証可能性

- 証跡集約テンプレートの全フィールドが型付きで定義される
- PASS/FAIL判定が `currentViolations.total === 0` の数値比較で決定される
- チェックリストの完了状態が `[x]` / `[ ]` のパターンマッチで機械的に読み取れる

#### NFR-3: 既存監査スクリプト互換性

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

## 成果物

| #   | 成果物名                 | パス                                                                                                                |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 1   | 要件定義書（本ファイル） | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/phase-1-requirements.md`                    |
| 2   | 要件定義まとめ           | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-1/requirements-definition.md` |
| 3   | 受け入れ基準一覧         | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-1/acceptance-criteria.md`     |
| 4   | スコープ定義             | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-1/scope-definition.md`        |

## 完了条件

- [ ] FR-1〜FR-4 の全フィールド定義が完了している
- [ ] NFR-1〜NFR-3 の検証可能な基準が定義されている
- [ ] 各FRに対する受け入れ基準（AC-x-x）が最低2項目以上定義されている
- [ ] 参照資料テーブルの全8エントリが有効なパスである
- [ ] 統合テスト連携の4接続先が定義されている
- [ ] 2workflow横断（`spec_created` + `completed`）の監査要件が明記されている
- [ ] UIタスク/非UIタスクの分岐条件がFR-3に含まれている
- [ ] P43対策（SubAgent 3ファイル以下/エージェント）が要件に含まれている
- [ ] 曖昧語チェック（禁止語リスト3件）が0件である

## サブタスク管理

| #   | サブタスク               | 担当 | ステータス |
| --- | ------------------------ | ---- | ---------- |
| 1   | 現状課題の整理           | lead | 完了       |
| 2   | FR-1〜FR-4 定義          | lead | 完了       |
| 3   | NFR-1〜NFR-3 定義        | lead | 完了       |
| 4   | 受け入れ基準の網羅性確認 | lead | 完了       |

## タスク100%実行確認【必須】

| #   | 確認項目                                         | 結果 |
| --- | ------------------------------------------------ | ---- |
| 1   | FR-1〜FR-4 の全フィールドが型・必須・説明付きか  | Yes  |
| 2   | NFR-1〜NFR-3 が数値基準で検証可能か              | Yes  |
| 3   | 受け入れ基準が FR ごとに2項目以上あるか          | Yes  |
| 4   | 依存タスク3件が明記されているか                  | Yes  |
| 5   | 曖昧表現が0件か                                  | Yes  |
| 6   | 統合テスト連携が4接続先全て定義されているか      | Yes  |
| 7   | 2workflow同時監査の要件がFR-1に含まれているか    | Yes  |
| 8   | UIスクリーンショット検証の要件がFR-3に含まれるか | Yes  |

## 次のPhase

**Phase 2: 設計** — 証跡集約テンプレートのフォーマット設計（2workflow結果を1表に記録）、Task 1/3/4/5 実体確認チェックリストの構造設計、UIスクリーンショット存在確認手順の設計、current/baseline分離記録フォーマットの設計、`task-workflow.md`/`lessons-learned.md`同期手順の設計を実施する。
