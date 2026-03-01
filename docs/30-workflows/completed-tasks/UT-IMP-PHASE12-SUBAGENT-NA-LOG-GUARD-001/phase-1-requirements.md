# Phase 1: 要件定義 — UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001

## メタ情報

| 項目       | 値                                          |
| ---------- | ------------------------------------------- |
| Phase      | 1 — 要件定義                                |
| 機能名     | Phase 12 仕様書別SubAgent N/A判定ログガード |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001    |
| 作成日     | 2026-03-01                                  |
| 依存タスク | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001   |
|            | UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001      |
| ステータス | Draft                                       |

## 目的

Phase 12 実行時に仕様書ごとの「更新」または「N/A」判定を必ず記録し、三点突合（成果物実体・artifacts.json status・phase-12-documentation.md チェックリスト）による機械確認で Phase 12 完了判定を一貫化する。

## 実行タスク

- 要件抽出: 達成目標3項目から機能要件・非機能要件を導出する。
- 受け入れ基準作成: 各FRに対して検証可能な受け入れ基準を定義する。
- FR/NFR分類: 機能要件4項目・非機能要件3項目を分類し、優先度を設定する。

| #   | タスク名         | 内容                                                     |
| --- | ---------------- | -------------------------------------------------------- |
| 1   | 要件抽出         | 達成目標3項目から機能要件・非機能要件を導出する          |
| 2   | 受け入れ基準作成 | 各FRに対して検証可能な受け入れ基準を定義する             |
| 3   | FR/NFR分類       | 機能要件4項目・非機能要件3項目を分類し、優先度を設定する |

## 参照資料

| #   | 資料名                                          | パス                                                                                 | 用途                              |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------- |
| 1   | 未タスク記録ガイドライン                        | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 未タスク管理3ステップの基準参照   |
| 2   | Phase 11/12 実行ガイド                          | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`          | Phase 12 必須5タスクの確認        |
| 3   | Phase 12 システム仕様レトロスペクティブテンプレ | `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`  | N/A管理ログ・三点突合ゲートの構造 |
| 4   | タスクワークフロー                              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | SubAgent分担マトリクスの構造参照  |
| 5   | 教訓集                                          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`               | P43等のPhase 12関連教訓の参照     |
| 6   | Phase テンプレート                              | `.claude/skills/task-specification-creator/references/phase-templates.md`            | 仕様書共通構造の準拠確認          |
| 7   | 既知の落とし穴                                  | `.claude/rules/06-known-pitfalls.md`                                                 | P1-P4, P43の再発防止策確認        |

## 実行手順

### Step 1: 現状課題の整理

Phase 12 実行監査で検出された3つの課題を整理する:

1. **N/A判定ログの不在**: 仕様書が更新対象外（N/A）の場合、その判定理由と代替証跡が記録されていない。監査時に「更新漏れ」と「意図的なN/A」の区別ができない
2. **三点突合の未定義**: 成果物実体の存在、`artifacts.json` のステータス、`phase-12-documentation.md` のチェックリスト同期が個別に確認されるが、三者の突合ルールが定義されていない
3. **current/baseline分離の未定義**: `currentViolations` と `baselineViolations` の分離基準が未定義で、監査結果の合否判定が実行者によって異なる

### Step 2: 機能要件（FR）の定義

#### FR-1: N/A判定ログテンプレートの定義

| フィールド名     | 型       | 必須 | 説明                                                                                                                  |
| ---------------- | -------- | ---- | --------------------------------------------------------------------------------------------------------------------- |
| specName         | string   | Yes  | 仕様書ファイル名（拡張子込み）                                                                                        |
| judgment         | enum     | Yes  | `updated` または `na`                                                                                                 |
| reason           | string   | Yes  | 判定理由（「今回のタスクはIPC変更を含まないため」のように具体的に記述）                                               |
| alternativeProof | string   | Yes  | 代替証跡（`na` の場合: 「該当チャネル未使用を grep で確認」のように検証手段を記述。`updated` の場合: 更新内容の要約） |
| updatedBy        | string   | Yes  | 更新担当SubAgent名（A〜E）または `lead`                                                                               |
| timestamp        | ISO 8601 | Yes  | 判定日時                                                                                                              |

**受け入れ基準**:

- AC-1-1: 全推奨5点セット仕様書（interfaces, api-ipc, security, task-workflow, lessons-learned）に対して、`updated` または `na` のいずれかが必ず記録される
- AC-1-2: `na` 判定のレコードに `reason` が空文字列のものが0件である
- AC-1-3: `na` 判定のレコードに `alternativeProof` が空文字列のものが0件である

#### FR-2: 三点突合の判定基準定義

三点突合は以下の3つのデータソースの整合性を検証する:

| #   | データソース                       | 検証内容                                             |
| --- | ---------------------------------- | ---------------------------------------------------- |
| 1   | 成果物実体                         | `outputs/phase-12/` 配下にファイルが物理的に存在する |
| 2   | artifacts.json の status           | 該当Phase 12エントリの status が `completed`         |
| 3   | phase-12-documentation.md チェック | 該当チェック項目が `[x]` でマークされている          |

**突合ルール**:

| 成果物実体 | artifacts.json | チェックリスト | 判定     | 対処                                                    |
| ---------- | -------------- | -------------- | -------- | ------------------------------------------------------- |
| 存在       | completed      | [x]            | PASS     | —                                                       |
| 存在       | completed      | [ ]            | FAIL     | チェックリストを更新する                                |
| 存在       | 未completed    | [x]            | FAIL     | artifacts.json を更新する                               |
| 存在       | 未completed    | [ ]            | FAIL     | artifacts.json とチェックリストを更新する               |
| 不在       | completed      | [x]            | CRITICAL | 虚偽記録の疑い — 成果物を作成するかステータスを取り消す |
| 不在       | completed      | [ ]            | FAIL     | artifacts.json を取り消す                               |
| 不在       | 未completed    | [x]            | FAIL     | チェックリストを取り消す                                |
| 不在       | 未completed    | [ ]            | N/A対象  | N/A判定ログに記録する                                   |

**受け入れ基準**:

- AC-2-1: 突合ルール表の8パターンが全て定義されている
- AC-2-2: 各パターンに対する対処手順が1文以上で記述されている
- AC-2-3: CRITICAL判定時のエスカレーション手順が定義されている

#### FR-3: current/baseline分離記録フォーマットの定義

| フィールド名       | 型     | 必須 | 説明                                                       |
| ------------------ | ------ | ---- | ---------------------------------------------------------- |
| currentViolations  | object | Yes  | 今回のタスクで新規発生した違反（`total`, `details[]`）     |
| baselineViolations | object | Yes  | タスク着手前から存在する既知の違反（`total`, `details[]`） |
| judgmentBasis      | enum   | Yes  | 合否判定基準: `currentViolations.total === 0` で PASS      |

**分離基準**:

- `baselineViolations`: タスク着手前の `main` ブランチで検出される違反。`git stash && node verify-all-specs.js` で取得
- `currentViolations`: タスクブランチで新規に発生した違反。全違反から baseline を差し引いた差分

**受け入れ基準**:

- AC-3-1: `currentViolations.total === 0` の場合に PASS、`> 0` の場合に FAIL と判定される
- AC-3-2: baseline 違反は PASS/FAIL 判定に影響しない
- AC-3-3: baseline 違反は記録され、未タスクとして別途管理される

#### FR-4: 仕様書別SubAgent分担表のテンプレート定義

| SubAgent | 担当仕様書         | 更新観点                        |
| -------- | ------------------ | ------------------------------- |
| A        | interfaces-\*.md   | 型/API契約の同期                |
| B        | api-ipc-\*.md      | IPCチャネル契約の同期           |
| C        | security-\*.md     | sender検証/P42/エラーサニタイズ |
| D        | task-workflow.md   | 完了台帳・検証証跡の同期        |
| E        | lessons-learned.md | 教訓の構造化記録                |

**受け入れ基準**:

- AC-4-1: 5つのSubAgent（A〜E）の担当仕様書と更新観点が定義されている
- AC-4-2: 各SubAgentの完了条件が明記されている
- AC-4-3: SubAgent間の依存関係（実行順序制約）が定義されている

### Step 3: 非機能要件（NFR）の定義

#### NFR-1: 再実行可能性

- 同一の入力（タスクID、ブランチ名）に対して、異なる実行者が同一の判定結果を得られる
- 検証コマンドは全てコピー&ペーストで実行可能な形式で提供する
- 手動判断を要するステップは0件とする

#### NFR-2: 明確性

- 各手順は「何を」「どこで」「どのコマンドで」の3要素を必ず含む
- 判定基準は数値（`=== 0`, `> 0`）または列挙値（`updated`, `na`）で表現する
- 実行条件が不明な表現を使わず、条件を具体的に書く

#### NFR-3: 既存監査スクリプト互換性

- `verify-all-specs.js` の出力フォーマット（violations配列）と互換性を持つ
- `audit-unassigned-tasks.js` の未タスク検出ロジックと干渉しない
- 既存の `artifacts.json` スキーマに破壊的変更を加えない

## 統合テスト連携

| #   | 接続先                                 | 連携内容                                                       |
| --- | -------------------------------------- | -------------------------------------------------------------- |
| 1   | 監査スクリプト連携                     | `verify-all-specs.js` の violations 出力を三点突合の入力とする |
| 2   | artifacts.json API                     | Phase 12 ステータスの読み書きインターフェースを利用する        |
| 3   | phase-12-documentation.md チェック同期 | チェックリストの `[x]`/`[ ]` 状態を三点突合の入力とする        |

## 多角的チェック観点

| 観点               | 確認内容                                                             |
| ------------------ | -------------------------------------------------------------------- |
| 既存運用との互換性 | 現行のPhase 12手順書で定義済みの手順を破壊しないこと                 |
| P43対策            | SubAgent分担は3ファイル以下/エージェントの制約を遵守すること         |
| P1/P25対策         | LOGS.md 2ファイル更新の手順がN/A判定ログに含まれること               |
| P4対策             | documentation-changelog への「完了」記載は全Step完了後のみとすること |

## 成果物

| #   | 成果物名                 | パス                                                                                                                |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 1   | 要件定義書（本ファイル） | `docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001/phase-1-requirements.md`                |
| 2   | FR/NFR一覧表             | `docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001/outputs/phase-1/fr-nfr-list.md`         |
| 3   | 受け入れ基準マトリクス   | `docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001/outputs/phase-1/acceptance-criteria.md` |

## 完了条件

- [ ] FR-1〜FR-4 の全フィールド定義が完了している
- [ ] NFR-1〜NFR-3 の検証可能な基準が定義されている
- [ ] 各FRに対する受け入れ基準（AC-x-x）が最低2項目以上定義されている
- [ ] 参照資料テーブルの全エントリが有効なパスである
- [ ] 統合テスト連携の3接続先が定義されている
- [ ] P43対策（SubAgent 3ファイル以下/エージェント）が要件に含まれている
- [ ] 曖昧表現（禁則語サンプルA/B/C）が0件である

## サブタスク管理

| #   | サブタスク               | 担当 | ステータス |
| --- | ------------------------ | ---- | ---------- |
| 1   | 現状課題の整理           | lead | 完了       |
| 2   | FR-1〜FR-4 定義          | lead | 完了       |
| 3   | NFR-1〜NFR-3 定義        | lead | 完了       |
| 4   | 受け入れ基準の網羅性確認 | lead | 完了       |

## タスク100%実行確認【必須】

| #   | 確認項目                                        | 結果 |
| --- | ----------------------------------------------- | ---- |
| 1   | FR-1〜FR-4 の全フィールドが型・必須・説明付きか | Yes  |
| 2   | NFR-1〜NFR-3 が数値基準で検証可能か             | Yes  |
| 3   | 受け入れ基準が FR ごとに2項目以上あるか         | Yes  |
| 4   | 依存タスク2件が明記されているか                 | Yes  |
| 5   | 曖昧表現が0件か                                 | Yes  |
| 6   | 統合テスト連携が3接続先全て定義されているか     | Yes  |

## 次のPhase

**Phase 2: 設計** — N/A判定ログテンプレートの構造設計、三点突合チェック手順のフロー設計、検証コマンドセットの設計を実施する。
