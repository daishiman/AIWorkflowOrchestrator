# [#2360] "[TASK-MARKDOWNLINT-CLI2-INTRODUCTION-001] markdownlint-cli2 導入による Markdown 品質ゲート自動化"

## メタ情報

```yaml
task_id: TASK-MARKDOWNLINT-CLI2-INTRODUCTION-001
task_name: markdownlint-cli2 導入による Markdown 品質ゲート自動化
category: 改善（品質ゲート自動化）
target_feature: docs-sync wave / Phase 9 品質ゲート
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 12 / TASK-SC-CANCEL-LOGS-SYNC-001 未タスク検出
created_date: 2026-04-20
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-markdownlint-cli2-introduction-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-SC-CANCEL-LOGS-SYNC-001` の Phase 12 成果物（`outputs/phase-12/implementation-guide.md`・構造・未来形語・固定フレーズ）の検証は、目視による手作業で行われた。NON_VISUAL repo-wide sync wave では Markdown ファイルが多数更新されるが、品質確認のコマンドが存在しないため、担当者が手動で全ファイルを確認する作業負荷が高かった。

具体的に苦戦した点は以下のとおり：

- `outputs/phase-12/implementation-guide.md` の Part 1 / Part 2 分割構成の整合を手作業で逐一チェックした
- LOGS.md 追記フォーマット（`-` プレフィックスの有無、見出しレベル）が skill ごとに微妙に異なり、目視での統一確認が難しかった
- `.claude` / `.agents` mirror parity の確認も手動 `diff` に頼っており、漏れが起きやすかった

### 1.2 問題点・課題

- Markdown 品質確認（構造整合、フォーマット、空白）を自動化するコマンドが存在しない
- Phase 9 品質ゲートに Markdown lint が含まれておらず、docs-sync wave 完了後に品質問題が発見されやすい
- `pnpm lint:md` コマンドが未定義のため、CI / Phase 9 での機械的検証ができない

### 1.3 放置した場合の影響

- docs-sync wave のたびに手動 Markdown 確認が必要になり、作業コストが増加し続ける
- LOGS.md / implementation-guide.md のフォーマット乱れが蓄積し、後続タスクの参照精度が下がる
- Phase 9 品質ゲートの「docs を機械的に検証する」原則が実現できないまま残る

---

## 2. 何を達成するか（What）

### 2.1 目的

`markdownlint-cli2` を devDependency に追加し、`pnpm lint:md` コマンドで Markdown ファイルの品質を機械的に検証できるようにする。

### 2.2 最終ゴール

- `pnpm lint:md` を実行すると `.claude/`, `docs/30-workflows/`, `packages/` 配下の Markdown ファイルに対して lint が走る
- Phase 9 品質ゲートに `pnpm lint:md` が組み込まれ、docs-sync wave の品質確認が自動化されている
- 既存 Markdown ファイルが lint ルールを満たしている（または `.markdownlint-cli2.jsonc` で許容ルールを明示している）

### 2.3 スコープ

#### 含むもの

- `markdownlint-cli2` の devDependency 追加（ルートまたは対象パッケージ）
- `.markdownlint-cli2.jsonc` の作成（基本ルール定義）
- `pnpm lint:md` スクリプト定義
- Phase 9 品質ゲートへの `pnpm lint:md` 追加方針のドキュメント化

#### 含まないもの

- 既存 Markdown ファイルの全面的なフォーマット修正（別タスク）
- CI パイプラインへの組み込み（別タスク）
- `markdownlint-cli2` のカスタムルール作成

### 2.4 成果物

| 成果物                           | 説明                                                     |
| -------------------------------- | -------------------------------------------------------- |
| `package.json` の変更（devDeps） | `markdownlint-cli2` の追加                               |
| `.markdownlint-cli2.jsonc`       | Markdown lint ルール設定（プロジェクトルート）           |
| `pnpm lint:md` スクリプト定義    | `package.json` または `pnpm-workspace.yaml` のスクリプト |
| Phase 9 ゲート更新ドキュメント   | docs-sync wave での利用方針を記載した仕様書              |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `pnpm install` が正常に動作していること
- プロジェクトルートに `pnpm-workspace.yaml` が存在すること
- Node.js 18 以上（`markdownlint-cli2` の要件）

### 3.2 依存タスク

- 特になし（独立して実施可能）

### 3.3 必要な知識

- `markdownlint-cli2` の基本的な設定方法（`.markdownlint-cli2.jsonc` の書き方）
- pnpm workspace のスクリプト定義方法
- CommonMark / Markdown の基本仕様

### 3.4 推奨アプローチ

1. `pnpm add -D markdownlint-cli2` でインストール
2. `.markdownlint-cli2.jsonc` を作成し、最小限のルールセット（MD013 行長緩和など）を設定
3. `package.json` に `"lint:md": "markdownlint-cli2 '**/*.md' '#node_modules'"` スクリプトを追加
4. `pnpm lint:md` を実行して既存ファイルの違反数を把握
5. 許容するルールを `.markdownlint-cli2.jsonc` で disable し、違反ゼロを達成
6. Phase 9 品質ゲートの仕様書に `pnpm lint:md` の実行タイミングを追記

---

## 4. 実行手順

### Phase 構成

| Phase | 名称             | 目的                                                         |
| ----- | ---------------- | ------------------------------------------------------------ |
| 1     | 要件定義         | 対象ファイル範囲・ルール方針・Phase 9 組み込み基準を固定する |
| 2     | 設計             | ルール設定ファイル・スクリプト定義・除外パターンを設計する   |
| 3     | 設計レビュー     | 4 条件で設計を確認し Phase 4 へ進む判断をする                |
| 4     | テスト作成       | `pnpm lint:md` が期待どおりに動作する検証コマンドを用意する  |
| 5     | 実装             | devDep 追加・設定ファイル作成・スクリプト定義を実施する      |
| 6     | テスト拡充       | 既存ファイルの違反ゼロ達成・エッジケース確認                 |
| 7     | カバレッジ確認   | lint 対象範囲の網羅性確認                                    |
| 8     | リファクタリング | 設定ファイルの簡潔化・コメント追加                           |
| 9     | 品質保証         | `pnpm lint:md` PASS・Phase 9 ゲート更新確認                  |
| 10    | 最終レビュー     | AC と全成果物の最終確認                                      |
| 11    | 手動テスト       | NON_VISUAL として grep スナップショットで代替証跡を作成      |
| 12    | ドキュメント更新 | 実装ガイド・仕様書更新・未タスク検出・フィードバック作成     |
| 13    | PR 作成          | ユーザー承認後に実施                                         |

### Phase 1: 要件定義

#### 目的

対象 Markdown ファイルの範囲・適用ルール・Phase 9 組み込み判定基準を固定する。

#### 手順

1. `markdownlint-cli2` の対象ファイルパターンを決定（`.claude/`, `docs/30-workflows/`, `packages/` 等）
2. 除外パターンを決定（`node_modules`, `.pnpm`, `dist`, `build`）
3. Phase 9 品質ゲートへの組み込み方針を確定（PASS/FAIL 基準）

#### 成果物

- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-1/acceptance-criteria.md`

#### 完了条件

- [ ] 対象ファイル範囲が決定し文書化されている
- [ ] Phase 9 組み込み方針が確定している

### Phase 5: 実装

#### 目的

`markdownlint-cli2` の実際の追加・設定・スクリプト定義を行う。

#### 手順

1. `pnpm add -D markdownlint-cli2` の実行
2. `.markdownlint-cli2.jsonc` の作成
3. `package.json` への `lint:md` スクリプト追加
4. `pnpm lint:md` の初回実行と違反確認
5. 必要に応じてルール緩和を設定ファイルに追記

#### 成果物

- `package.json`（devDep 追加）
- `.markdownlint-cli2.jsonc`
- `outputs/phase-5/implementation-log.md`

#### 完了条件

- [ ] `pnpm lint:md` が正常に実行できる
- [ ] 既存ファイルの違反が 0 件または許容済みである

### Phase 12: ドキュメント更新

#### 目的

実装ガイド（Part 1 中学生レベル + Part 2 技術者レベル）・仕様書更新・未タスク検出・スキルフィードバックを完了する。

#### 中学生レベル概念説明（Part 1 必須内容）

**なぜ必要か（日常の例え話）**

Markdown は文章をきれいに書くためのルールブックのようなものです。このルールを自動でチェックするのが `markdownlint-cli2` です。

例えば、学校のレポートに「見出しの後は必ず空行を入れる」というルールがあるとします。もし毎回先生が手で全部確認しなければならないとしたら、大変な手間がかかります。`markdownlint-cli2` は、このチェックを自動でやってくれるツールです。`pnpm lint:md` というコマンドを打つだけで、プロジェクト内の全 Markdown ファイルをチェックし、ルール違反があれば教えてくれます。

**何をするか**

このタスクでは、以下の 3 つのことをします。

1. `markdownlint-cli2` をプロジェクトに追加する（開発用ツールとして登録する）
2. どのルールを使うかを設定ファイル（`.markdownlint-cli2.jsonc`）に書く
3. `pnpm lint:md` というコマンドで実行できるようにする

#### 手順

1. `outputs/phase-12/implementation-guide.md` 作成（Part 1 + Part 2）
2. `outputs/phase-12/system-spec-update-summary.md` 作成（仕様書更新サマリー）
3. `outputs/phase-12/documentation-changelog.md` 作成（変更履歴）
4. `outputs/phase-12/unassigned-task-detection.md` 作成（未タスク 0 件でも出力必須）
5. `outputs/phase-12/skill-feedback-report.md` 作成（改善点なしでも出力必須）
6. `outputs/phase-12/phase12-task-spec-compliance-check.md` 作成

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `pnpm lint:md` がルートで実行できる
- [ ] lint 対象範囲（`.claude/`, `docs/`, `packages/`）が明示的に設定されている
- [ ] 既存 Markdown ファイルで lint PASS（または許容ルール明示）

### 品質要件

- [ ] `.markdownlint-cli2.jsonc` に無効化ルールの理由コメントがある
- [ ] `pnpm lint:md` の実行時間が合理的（30 秒以内）

### ドキュメント要件

- [ ] Phase 9 品質ゲート仕様書に `pnpm lint:md` の使い方が記載されている
- [ ] Phase 12 成果物 6 点（implementation-guide / system-spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback-report / phase12-task-spec-compliance-check）が揃っている

---

## 6. 検証方法

### テストケース

| TC  | 操作                                      | 期待結果                          |
| --- | ----------------------------------------- | --------------------------------- |
| 01  | `pnpm lint:md` を実行する                 | exit code 0（PASS）               |
| 02  | 意図的に壊した `.md` ファイルを lint する | 違反が検出され exit code 1 になる |
| 03  | `node_modules` 配下が除外されているか確認 | lint 対象外になっている           |

### 検証手順

```bash
# TC-01: 正常実行
pnpm lint:md

# TC-02: 違反検出確認
echo "##見出し（スペースなし）" > /tmp/test_lint.md
pnpm markdownlint-cli2 /tmp/test_lint.md

# TC-03: 除外確認
# node_modules 配下のファイルが出力に含まれないことを確認
pnpm lint:md 2>&1 | grep -v "node_modules"
```

---

## 7. リスクと対策

| リスク                                                   | 影響度 | 発生確率 | 対策                                                                     |
| -------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------ |
| 既存ファイルの違反件数が多く修正工数が膨らむ             | 高     | 中       | まず `.markdownlint-cli2.jsonc` でルール緩和から始め、段階的に厳格化する |
| `markdownlint-cli2` のバージョン互換性                   | 低     | 低       | 既存の pnpm lock file に従い固定バージョンで管理する                     |
| Phase 9 ゲートへの組み込みで CI が遅くなる               | 中     | 低       | `--no-stdin` オプションや対象ファイル絞り込みで対応する                  |
| `.markdownlint-cli2.jsonc` と既存 `.editorconfig` の衝突 | 低     | 低       | 設定ファイル同士の優先順位を確認してから適用する                         |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/phase-template-core.md` - Phase 1-3 共通骨格
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` - Phase 12 成果物作成ガイド
- `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md` - 現行タスクワークフロー仕様
- `docs/30-workflows/TASK-SC-CANCEL-LOGS-SYNC-001/outputs/phase-12/unassigned-task-detection.md` - 発見元の未タスク検出レポート

### 参考資料

- [markdownlint-cli2 GitHub](https://github.com/DavidAnson/markdownlint-cli2) - 公式ドキュメント・設定例
- [markdownlint ルール一覧](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md) - 有効化可能なルール

---

## 9. 備考

### 苦戦箇所【記入必須】

> 親タスク TASK-SC-CANCEL-LOGS-SYNC-001 の Phase 12 で Markdown 品質確認に手間がかかった点を記録する。

| 項目     | 内容                                                                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | NON_VISUAL repo-wide sync wave で多数の Markdown ファイルを更新した後、`outputs/phase-12/implementation-guide.md` の Part 1 / Part 2 構成の整合を手動で目視チェックした |
| 原因     | `pnpm lint:md` に相当するコマンドが存在せず、Markdown フォーマットの自動検証手段がなかった。LOGS.md の見出しレベルや `-` プレフィックスの統一も目視頼みだった           |
| 対応     | 手動で全ファイルを読み込み、見出し構造・空行・プレフィックス形式を確認した。ミラー parity は `diff -qr` で手動確認した                                                  |
| 再発防止 | 本タスクで `pnpm lint:md` を導入し、Phase 9 の品質ゲートに自動 lint を組み込む。次回の repo-wide sync wave からは機械的に品質を担保する                                 |

証拠ファイル:

- `docs/30-workflows/TASK-SC-CANCEL-LOGS-SYNC-001/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/TASK-SC-CANCEL-LOGS-SYNC-001/outputs/phase-12/skill-feedback-report.md`

### レビュー指摘の原文（該当する場合）

```
TASK-SC-CANCEL-LOGS-SYNC-001 Phase 12 / unassigned-task-detection.md より検出。
Markdown lint の自動化が Phase 9 品質ゲートに含まれていないことが課題として記録された。
```

### 補足事項

- このタスクは単独で完結する小規模改善タスクであり、他タスクへの依存はない
- `markdownlint-cli2` 導入後は、将来の docs-sync wave（NON_VISUAL repo-wide sync）でも再利用できる
- Phase 11 は NON_VISUAL タスクとして扱い、grep スナップショットを代替証跡とする
