# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目      | 内容                            |
| --------- | ------------------------------- |
| Phase     | 1                               |
| 機能名    | imp-layer12-check-id-script-006 |
| 作成日    | 2026-04-04                      |
| 前提Phase | なし                            |
| 後続Phase | Phase 2                         |

## 目的

grep 誤検知問題の根本原因を分析し、check ID 突き合わせスクリプトの要件を定義する。タスク分類（script + docs task）を明示的に記録する。

## タスク分類

| 項目          | 判定                       |
| ------------- | -------------------------- |
| タスク種別    | tooling（スクリプト）      |
| UI 変更       | なし                       |
| コード変更    | あり（スクリプト新規作成） |
| Phase 11 判定 | NON_VISUAL                 |

## 実行タスク

### タスク1: grep 誤検知問題の根本原因分析

**目的**: `lessons-learned.md` に記載の誤検知問題を再現し、根本原因を確認する

**手順**:

1. `interfaces-skill-verify-contract.md` を読み、check ID が登場する文脈を分類する
   - テーブル行に登場する check ID（正規の定義）
   - 拡張ガイドライン等の説明文・例示値に登場する check ID（誤検知候補）
2. 誤検知が発生するパターンを一覧化する:
   - ファイル全体スコープの `grep -oE "L[1-4]-[0-9]{3}"` で例示値がヒットする例
   - 何件が例示値として含まれているか数える
3. 誤検知の影響を評価する:
   - diff コマンドでの誤 FAIL の具体例を記録する
   - check ID が 30 件超になった場合の悪化シナリオを記述する

**期待される成果物**:

- `outputs/phase-1/false-positive-analysis.md` — 誤検知パターン分析結果

### タスク2: スクリプト要件の定義

**目的**: 突き合わせスクリプトが満たすべき要件を定義する

**手順**:

1. 以下の機能要件を定義する:
   - **FR-01**: 実装ファイル（`SkillCreatorVerificationEngine.ts`）から check ID を抽出する
   - **FR-02**: 仕様書（`interfaces-skill-verify-contract.md`）のテーブル行から check ID を抽出する（例示値を除外）
   - **FR-03**: 両者を突き合わせ、差分を検出する
   - **FR-04**: 差分 0 件のとき PASS、差分ありのとき FAIL と差分一覧を出力する
   - **FR-05**: check ID 数の増加（30 件超）に対応する（ハードコードなし）
2. 非機能要件を定義する:
   - Node.js スクリプトとして実装する（プロジェクトのエコシステムに合わせる）
   - 実行方法は `node scripts/verify-check-id-parity.js` のような単一コマンドとする
   - CI で組み込みやすいように終了コード（0=PASS, 1=FAIL）を返す

**期待される成果物**:

- `outputs/phase-1/script-requirements.md` — スクリプト機能要件・非機能要件一覧

### タスク3: 既存コードの命名規則分析

**目的**: スクリプト配置先と命名規則を既存プロジェクトに合わせて確認する

**手順**:

1. 既存の `scripts/` ディレクトリを確認し、命名規則（kebab-case 等）を分析する
2. 既存の検証スクリプト（`validate-phase-output.js` 等）の実装スタイルを参照する
3. テストファイルの配置パターン（`*.test.js` / `__tests__/` 等）を確認する

**期待される成果物**:

- `outputs/phase-1/naming-convention-analysis.md` — 命名規則・配置先分析

### タスク4: 受け入れ基準の詳細化

**目的**: AC-1〜AC-5 の検証方法を具体化する

**手順**:

1. 各 AC について、検証コマンドまたは確認手順を定義する:
   - AC-1: `node scripts/verify-check-id-parity.js` を実行し、全 19 件が突き合わせされることを確認
   - AC-2: 例示値 `L2-008` が出力に含まれないことを確認
   - AC-3: 差分あり・なしの両ケースで期待する出力形式を確認
   - AC-4: 実装から check ID を動的抽出しているかコードレビューで確認
   - AC-5: `--help` オプションまたはコメントによる実行方法の記載を確認

**期待される成果物**:

- 本 Phase の `script-requirements.md` に AC 検証方法を含める

## 参照資料

| 資料名                              | パス                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| interfaces-skill-verify-contract.md | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md`     |
| SkillCreatorVerificationEngine      | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                  |
| lessons-learned.md                  | `docs/30-workflows/unassigned-task/task-imp-layer12-check-id-script-006/lessons-learned.md` |
| 既存スクリプト群                    | `.claude/skills/task-specification-creator/scripts/`                                        |

## 成果物

| 成果物             | パス                                            |
| ------------------ | ----------------------------------------------- |
| 誤検知パターン分析 | `outputs/phase-1/false-positive-analysis.md`    |
| スクリプト要件     | `outputs/phase-1/script-requirements.md`        |
| 命名規則分析       | `outputs/phase-1/naming-convention-analysis.md` |

## 完了条件

- [ ] grep 誤検知問題の根本原因が分析・記録されている
- [ ] テーブル行スコープと例示値の区別が文書化されている
- [ ] スクリプト機能要件（FR-01〜FR-05）が定義されている
- [ ] スクリプト非機能要件（Node.js、終了コード等）が定義されている
- [ ] 既存スクリプトの命名規則・配置先が分析されている
- [ ] AC-1〜AC-5 の検証方法が具体化されている
- [ ] タスク分類（tooling / NON_VISUAL）が記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 2: 設計
