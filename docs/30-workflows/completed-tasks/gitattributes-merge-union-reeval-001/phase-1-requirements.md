# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 1                                         |
| タスクID   | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 |
| 機能名     | gitattributes-merge-union-reeval          |
| 前提Phase  | -（TASK-CONFLICT-PREVENT-001 完了が前提） |
| 後続Phase  | Phase 2                                   |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

`.gitattributes` で `references/*.md` 全体に適用されている `merge=union` を、append-only ファイルと構造化ドキュメントに分類して再適用範囲を絞り込み、長期的な構造化ドキュメント破損リスクを排除するための要件を確定する。

## 背景

`merge=union` は両ブランチの差分行を順序を保たず単純連結するため、見出し階層・表・箇条書き・コードフェンスを含む構造化 Markdown に適用すると、構造そのものが壊れる。現在の `.gitattributes` は `references/*.md` をひとまとめに `merge=union` 指定しており、`task-workflow.md` や `lessons-learned.md` のような構造化ドキュメントもこの対象になっている。本タスクでは、append-only と構造化を切り分け、glob を精緻化する判断軸を要件として固定する。

## 実行タスク

### タスク0: P50チェックと task 種別確定

**目的**: task を `NON_VISUAL` かつ「設定ファイル再分類」モードとして固定する。

**実行手順**:

1. 現状の `.gitattributes` の `references/` 関連パターンを取得して outputs に記録する。
2. `.claude/scripts/setup-merge-drivers.sh` で `merge.ours.driver` の登録状況を確認する。
3. UI 変更がないことを確認し、`taskType=NON_VISUAL` を確定する。

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-1/current-gitattributes-snapshot.md`

### タスク1: スコープと非スコープの固定

**目的**: 本タスクの責務を `.gitattributes` 再分類と判断基準ドキュメント化に限定する。

**実行手順**:

1. スコープを `references/*.md` の append-only / 構造化 分類、`.gitattributes` の glob 修正、`setup-merge-drivers.sh` 動作確認、判断基準ドキュメント化に限定する。
2. 非スコープを `indexes/*` の戦略変更、`EVALS.json` のスキーマ変更、Git フック追加、CI ワークフロー変更として明記する。
3. 既存 `merge=ours` カスタムドライバーは仕様変更せず維持することを明記する。

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`

### タスク2: ファイル分類インベントリ作成

**目的**: `references/` 配下の全 `.md` を append-only と構造化に分類し、判断根拠を残す。

**実行手順**:

1. `references/` 配下の `.md` を列挙し、ファイルごとに「append-only / 構造化」を分類する。
2. append-only の代表として `LOGS.md`, `SKILL-changelog.md`, `task-workflow-completed.md` を列挙する。
3. 構造化の代表として `task-workflow.md`, `lessons-learned.md`, `phase-*-*.md` ガイド系を列挙する。
4. 判断根拠（末尾追記中心か、見出し・表を持つか）を分類列に併記する。

**期待される成果物**:

- `outputs/phase-1/file-classification-inventory.md`

### タスク3: 受け入れ基準（AC）の固定

**目的**: 後続 Phase で機械的に判定可能な AC を確定する。

**実行手順**:

1. AC-1: 構造化ドキュメントから `merge=union` 指定が除去されていることを定義する。
2. AC-2: append-only ファイルは `merge=union` を維持していることを定義する。
3. AC-3: `setup-merge-drivers.sh` 実行後に `git config merge.ours.driver` が `true` を返すことを定義する。
4. AC-4: `.gitattributes` の各エントリに用途コメントが付与されていることを定義する。
5. AC-5: append-only / 構造化 の判断基準が `references/` 配下のドキュメントに明記されていることを定義する。

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

## 参照資料

| 参照資料                     | パス                                                             | 内容                         |
| ---------------------------- | ---------------------------------------------------------------- | ---------------------------- |
| `.gitattributes` 現状        | `.gitattributes`                                                 | 現在の merge 指定パターン    |
| マージドライバ登録スクリプト | `.claude/scripts/setup-merge-drivers.sh`                         | `merge.ours.driver` 登録手順 |
| 既完了タスク                 | TASK-CONFLICT-PREVENT-001                                        | 前段で導入した競合予防方針   |
| references 仕様群            | `.claude/skills/aiworkflow-requirements/references/`             | 分類対象ファイル群           |
| 解決策設計書                 | `docs/30-workflows/00-task-spec-design-docs/phase-2-solution.md` | 解決方針の根拠               |

## 成果物

| 成果物                         | パス                                                | 内容                                   |
| ------------------------------ | --------------------------------------------------- | -------------------------------------- |
| 要件定義書                     | `outputs/phase-1/requirements-definition.md`        | scope / non-scope / taskType / P50判定 |
| 受け入れ基準                   | `outputs/phase-1/acceptance-criteria.md`            | AC-1〜AC-5                             |
| 現状 `.gitattributes` スナップ | `outputs/phase-1/current-gitattributes-snapshot.md` | 取得時点のパターン一覧                 |
| ファイル分類インベントリ       | `outputs/phase-1/file-classification-inventory.md`  | append-only / 構造化 の分類表と根拠    |

## 統合テスト連携【必須】

| 判定項目                                                  | 基準 | 結果    |
| --------------------------------------------------------- | ---- | ------- |
| `taskType=NON_VISUAL` が outputs に記録されている         | 完了 | pending |
| AC-1〜AC-5 が outputs に記録されている                    | 完了 | pending |
| 分類インベントリで全 `references/*.md` がカバーされている | 完了 | pending |

## 完了条件

- [ ] P50チェック結果と `NON_VISUAL` 判定を outputs に記録している
- [ ] スコープと非スコープを固定している
- [ ] `references/` 配下のファイル分類インベントリを作成している
- [ ] AC-1〜AC-5 を確定している
- [ ] `merge.ours.driver` 登録状況の確認結果を記録している
