# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 1                                                |
| タスクID   | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 |
| タスク種別 | NON_VISUAL / docs-only                           |
| ステータス | completed                                        |
| 前提Phase  | なし（本タスクが起点）                           |
| 後続Phase  | Phase 2（設計）                                  |
| 作成日     | 2026-04-21                                       |

## 目的

`evals-schema-spec.md` §3（方言スキーマ / snake_case v1 系）の現状を事実ベースで調査し、不足フィールドを特定する。曖昧な前提のまま設計・追記フェーズに進まず、このフェーズで追記すべき内容の要件を確定する。

具体的には以下を達成する。

- `levels.{N}` ツリー構造が §3 に記述されているか確認する
- `average_satisfaction` の型・範囲・意味・writer/reader が §3 に記述されているか確認する
- v1 固有フィールドで未定義のものを網羅的にリストアップする
- camelCase v2 との関係記述の現状を確認し、不足を特定する
- dual root（`.claude/skills` / `.agents/skills`）の差分状況を確認する

## Step 0: P50チェック（必須）

以下のコマンドを実行し、現状の正本ドキュメントの内容と差分を確認する。

```bash
# §3 の現状確認（snake_case / levels / average_satisfaction の記述有無）
rg -n "levels\|average_satisfaction\|snake_case" \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

# dual root 差分確認
diff \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md \
  .agents/skills/aiworkflow-requirements/references/evals-schema-spec.md

# git 履歴で直近の変更を確認
git log --oneline -- \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

# v1 固有フィールドが実際に使用されているスキルを確認
rg -rn "levels\|average_satisfaction" \
  .claude/skills/ .agents/skills/ \
  --include="EVALS.json" | head -40

# skill-creator / aiworkflow-requirements / skill-fixture-runner の EVALS.json 確認
rg -n "levels\|average_satisfaction\|current_level\|total_usage_count" \
  .claude/skills/skill-creator/EVALS.json \
  .claude/skills/aiworkflow-requirements/EVALS.json \
  .claude/skills/skill-fixture-runner/EVALS.json 2>/dev/null
```

## 実行タスク

### Step 1: 既存 §3 の内容精査

- `evals-schema-spec.md` §3 全体を読み込み、現在記述されている内容を確認する
- 以下の各項目について「記述あり / 記述なし / 不完全」を判定する
  - `levels` フィールドの説明（静的オブジェクトか、未保持か）
  - `levels.{N}` entry の型（各キー配下のフィールド名・型・意味）
  - `average_satisfaction` の型・観測値（0 や 4.5 のような実値）
  - `average_satisfaction` の意味（何を集計したものか）
  - `average_satisfaction` の writer（誰が書くか）
  - `average_satisfaction` の reader（誰が読むか）
  - v1 固有フィールドの完全型テーブル（camelCase 対応なしのフィールド一覧）
  - camelCase v2 との関係の正式な記述（断定なし / 両立スタイル）

### Step 2: 不足フィールドの特定

- Step 1 の判定結果を `outputs/phase-1/spec-extraction-map.md` にまとめる
- 「記述なし」または「不完全」のフィールドを「不足リスト」として明示する
- 各不足項目について、どの AC（AC-1〜AC-5）に対応するかをマッピングする

### Step 3: 実スキルの EVALS.json から型を推定

- `skill-creator/EVALS.json` / `aiworkflow-requirements/EVALS.json` / `skill-fixture-runner/EVALS.json` の実際の値から型・範囲を推定する
- `levels` フィールドの実際の構造（配列 or オブジェクト、各 entry のフィールド）を確認する
- `average_satisfaction` の実際の値の範囲を確認する（サンプル値から推定）
- 複数スキルで構造が一致しているか、揺れがあるかを記録する

### Step 4: AC 固定

- Phase 2 設計の入力として AC-1〜AC-5 の詳細要件を確定する
- 各 AC について「Phase 2 設計で決定すべき事項」と「Phase 5 実装で記述すべき内容」を分離する
- camelCase v2 との関係記述の方針（断定禁止 / 両立スタイル）を `requirements-summary.md` に明記する

## 参照資料

| 資料名                               | パス                                                                                            | 用途                       |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- | -------------------------- |
| EVALS スキーマ正本（canonical root） | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`                        | 追記対象・現状確認         |
| EVALS スキーマ正本（mirror root）    | `.agents/skills/aiworkflow-requirements/references/evals-schema-spec.md`                        | dual root 差分確認         |
| EVALS 消費者監査教訓                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned-evals-consumer-audit-001.md` | 既知問題・教訓の参照       |
| skill-creator EVALS.json             | `.claude/skills/skill-creator/EVALS.json`                                                       | v1 フィールドの実値確認    |
| aiworkflow-requirements EVALS.json   | `.claude/skills/aiworkflow-requirements/EVALS.json`                                             | v1 フィールドの実値確認    |
| skill-fixture-runner EVALS.json      | `.claude/skills/skill-fixture-runner/EVALS.json`                                                | v1 フィールドの実値確認    |
| evals-field-map.md                   | `docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md` | フィールド突合の参照       |
| GitHub Issue #2326                   | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2326                                 | タスク背景・苦戦箇所の確認 |

## 実行手順

1. `evals-schema-spec.md` を全文読み込む（§3 を重点的に確認）
2. Step 1 の判定表を埋め、`spec-extraction-map.md` を作成する
3. `skill-creator/EVALS.json` 等の実ファイルを読み込み、`levels` / `average_satisfaction` の実値から型を推定する
4. 不足リストを作成し、AC へのマッピングを行う
5. AC 詳細要件を `requirements-summary.md` に記述する
6. dual root の差分有無を確認し、差分がある場合はその内容を記録する

## 統合テスト連携

Phase 1 は調査・分析フェーズであるため、ドキュメントの変更は行わない（docs-only タスクだが、Phase 1 は read-only）。

既存スキーマとの整合確認：

- `evals-schema-spec.md` §2（camelCase v2）の内容と §3 の現状が矛盾していないかを確認する
- dual root の現在の差分状況を確認する（`diff` コマンドで 0 件なら問題なし）
- lessons-learned に記載の既知問題と今回の不足リストが整合しているかを確認する

## 多角的チェック観点

- **網羅性**: `levels.{N}` entry のフィールドが、実際の EVALS.json から漏れなく抽出されているか
- **型の揺れ**: `average_satisfaction` の値域が複数のスキルで一致しているか、揺れがある場合はその実態を記録する
- **断定禁止方針の適用**: v1 と v2 の「どちらが正本か」を本タスクの要件定義が断定していないか確認する
- **後続タスクとの境界**: 本タスクが `UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001` の作業範囲を侵食していないか確認する
- **dual root 差分**: `.claude/skills` と `.agents/skills` の現在の差分状況を把握し、Phase 5 の反映作業の範囲を明確にする

## サブタスク管理

| サブタスクID | 内容                       | 担当Step |
| ------------ | -------------------------- | -------- |
| ST-1-01      | §3 現状精査・判定表の作成  | Step 1   |
| ST-1-02      | 不足フィールドリストの作成 | Step 2   |
| ST-1-03      | 実 EVALS.json からの型推定 | Step 3   |
| ST-1-04      | AC 詳細要件の確定          | Step 4   |
| ST-1-05      | dual root 差分状況の記録   | Step 0   |

## 成果物

- `outputs/phase-1/requirements-summary.md`
  - 追記すべき内容の要件一覧（AC-1〜AC-5 の詳細）
  - camelCase v2 との関係記述の方針（断定禁止 / 両立スタイル）
  - dual root 現在の差分状況サマリ
- `outputs/phase-1/spec-extraction-map.md`
  - §3 の現状判定表（記述あり / 記述なし / 不完全）
  - 不足フィールドリスト（AC へのマッピング付き）
  - 実 EVALS.json から推定した型・値域の記録

## 完了条件

- [ ] `evals-schema-spec.md` §3 の全記述について「記述あり / 記述なし / 不完全」の判定が完了している
- [ ] `levels.{N}` entry の実際の構造が実 EVALS.json から確認されている
- [ ] `average_satisfaction` の型・範囲が実 EVALS.json から推定されている
- [ ] 不足フィールドリストと AC へのマッピングが `spec-extraction-map.md` に記載されている
- [ ] dual root の現在の差分状況が記録されている
- [ ] AC 詳細要件が `requirements-summary.md` に確定している

## タスク100%実行確認【必須】

以下を順番に確認すること:

1. `spec-extraction-map.md` の判定表に §3 の全フィールドが漏れなく記載されているか
2. 不足フィールドリストの各項目が AC-1〜AC-5 のいずれかにマッピングされているか
3. `levels.{N}` の実構造が複数の EVALS.json から確認されているか（1 件のみからの推定は不十分）
4. `average_satisfaction` の値域が実ファイルから確認されているか
5. dual root の差分状況が記録されているか

## 次Phase

Phase 2（設計）へ進む。`requirements-summary.md` と `spec-extraction-map.md` を入力として、§3 への追記内容の設計を行う。
