# TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001: ライトテーマ token 基盤是正

## ユーザーからの元の指示

```text
ライトモードで今設定していますが、ライトモードの白がきつすぎてチカチカして見にくいです。あと文字に関しても、ライトモードの白色と背景の色と文字の色が同じような色を使っていて、現状文字が見えないという状況になっています。この辺調査して対策を行ってください。全てのライトモードの機能全て共通です。実装は不要なので、まずプラモードで設定してください。調査してください。

/.claude/skills/task-specification-creator/ スキルのタスク仕様書作成の内容を本ワークツリーの本ブランチの変更分に、漏れなくすべて反映させることを最優先とする。/.claude/skills/aiworkflow-requirements/ から今回の実装で必要な情報を漏れなく抽出すること。今はタスク実行は不要で、仕様書作成に専念すること。Phase 1-3 の設計書関係が先で、commit / PR は禁止。仕様書ごとに SubAgent に切り分け、並列化可能な関心ごとは分離して進めること。
```

## タスク概要

### 目的

ライトテーマ全体で発生している「白が強すぎる」「文字が見えない」「テーマ依存の色が継承に落ちる」問題のうち、**token 基盤の是正**に単一責務で対処する。対象は `tokens.css` のライトテーマ semantic token と未定義 token の整理であり、個別画面の色直書き修正は別タスクへ分離する。

### 背景

- 調査時点で `tokens.css` のライトテーマが純白依存で、全画面のまぶしさとコントラスト不足の起点になっていた
- `--text-tertiary` / `--border-primary` / `--accent-primary` の未定義参照があり、継承 fallback に依存する不安定さが残っていた
- component 側の直書き色問題まで同一タスクに含めると責務が肥大化するため、token 基盤のみを独立 task とする

### 最終ゴール

- ライトテーマの semantic token 契約を単独で見直せる
- 後続 task が「token 基盤」「component 移行」「回帰 guard」を独立に実行できる
- `task-specification-creator` / `aiworkflow-requirements` の正本に照らして、Phase 1-13 を迷わず実行できる

### 成果物一覧

| 種別              | 成果物                       | 配置先                                                                           |
| ----------------- | ---------------------------- | -------------------------------------------------------------------------------- |
| workflow          | メイン task 仕様書           | `docs/30-workflows/completed-tasks/light-theme-token-foundation/index.md`        |
| phase specs       | Phase 1-13 仕様書            | `docs/30-workflows/completed-tasks/light-theme-token-foundation/phase-*.md`      |
| artifact registry | canonical artifacts registry | `docs/30-workflows/completed-tasks/light-theme-token-foundation/artifacts.json`  |
| phase outputs     | Phase別成果物置き場          | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-*` |

## メタ情報

| 項目         | 内容                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001                                                           |
| タスク種別   | 修正                                                                                                |
| 優先度       | 高                                                                                                  |
| ステータス   | in_progress（Phase 1-12 completed / Phase 13 blocked）                                              |
| 依存タスク   | なし                                                                                                |
| 関連タスク   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001, TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 |
| 発見元       | 2026-03-11 ライトモード調査                                                                         |
| 作成ブランチ | `task-20260311-light-theme-specs`                                                                   |

## 参照ファイル

- `apps/desktop/src/renderer/styles/tokens.css`
- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/task-specification-creator/references/create-workflow.md`
- `.claude/skills/task-specification-creator/references/phase-templates.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`

## 受入基準

| ID   | 基準                                                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------------- |
| AC-1 | `apps/desktop/src/renderer/styles/tokens.css` のライトテーマで純白依存を緩和した surface 階層が定義される        |
| AC-2 | `--text-tertiary` / `--border-primary` / `--accent-primary` の扱いが「正式定義」または「参照廃止」で一貫化される |
| AC-3 | ライトテーマ text / border / accent token の役割表が仕様書内で明文化される                                       |
| AC-4 | 既存 backlog の token 系 light contrast 課題を本タスクへ束ねる判断根拠が記録される                               |
| AC-5 | 後続タスクが token 契約を前提に実装できる状態になる                                                              |

## スコープ

**含む**:

- `apps/desktop/src/renderer/styles/tokens.css` のライトテーマ semantic token 再設計
- 未定義 token の是正方針確定
- token 役割表、contrast 目標、命名境界の文書化
- 既存 light contrast backlog の token 起因分の統合整理

**含まない**:

- `text-white` / `bg-slate-*` / `bg-zinc-*` など個別 component の置換
- screenshot 再取得そのもの
- commit / PR / 実装実行

## Atent Team / SubAgent 実行方針

| Lane | 担当関心ごと                                                      | 実行タイミング | 並列可否                       |
| ---- | ----------------------------------------------------------------- | -------------- | ------------------------------ |
| A    | `aiworkflow-requirements` に基づく system spec 参照・同期対象整理 | Phase 1-2      | Phase 1 は直列                 |
| B    | light theme token 設計、missing token 境界定義                    | Phase 2        | Phase 2 で Lane A 完了後に着手 |
| C    | contrast 目標・検証観点設計                                       | Phase 2-3      | Lane B と部分並列可            |
| D    | Codex 実装 lane（将来）                                           | Phase 5以降    | Phase 3 PASS 後のみ            |

## ユーザー指定ポリシー

- Phase 1-3 の設計書が完了し、レビューゲートを通過するまで Phase 4 以降へ進まない
- 実装は現時点で行わず、仕様書作成に専念する
- commit / PR はユーザー明示承認があるまで実行しない
- 必要な箇所は Codex 実装 lane を使う想定だが、本タスク仕様書では設計までを先に固定する
- `aiworkflow-requirements` の system spec を全 Phase の参照資料に反映する

## 正本 skill 参照

| 種別                       | パス                                                                        | 用途                               |
| -------------------------- | --------------------------------------------------------------------------- | ---------------------------------- |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md`                        | Phase 1-13 骨格と validator の正本 |
| phase templates            | `.claude/skills/task-specification-creator/references/phase-templates.md`   | 必須セクション確認                 |
| phase 11/12 guide          | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | Phase 11/12 の必須運用確認         |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/SKILL.md`                           | resource-map 起点の仕様抽出正本    |
| resource map               | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`            | 今回必要な system spec の入口      |

## aiworkflow-requirements 抽出セット

| 関心ごと             | 正本仕様                                                                          | 抽出理由                                |
| -------------------- | --------------------------------------------------------------------------------- | --------------------------------------- |
| token 契約           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | surface/text/border/accent の正本       |
| 可読性原則           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | light theme の階層・視認性基準          |
| component 原則       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | token を component 責務へ漏らさない基準 |
| frontend 制約        | `.claude/skills/aiworkflow-requirements/references/technology-frontend.md`        | renderer / Tailwind 前提の整理          |
| テスト品質           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | Phase 4-11 の品質基準                   |
| component test       | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | token test 設計の正本                   |
| accessibility test   | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | contrast / readable text の最低観点     |
| implementation guard | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`     | 実装境界と drift 防止の一般方針         |
| task 台帳            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | backlog / `spec_created` の同期先       |
| 教訓                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | 再発防止知見の同期先                    |

## 分解戦略

| 思考軸         | 判断                                    | 採用理由                                                 |
| -------------- | --------------------------------------- | -------------------------------------------------------- |
| 因果関係       | まず token 契約を直す                   | 原因層を固定しないと downstream 修正がぶれる             |
| 論点分離       | component 修正を別 task に分離          | token 基盤と画面改修を混ぜると責務が壊れる               |
| 逆説思考       | 先に全部直さない                        | 大規模一括修正よりも contract 固定の方が失敗コストが低い |
| システム思考   | guard task をさらに分離                 | 再発防止を実装修正と別に運用できる                       |
| エレガンス判定 | 3 task のうち本 task は原因層のみを保持 | 単一責務で再利用しやすい                                 |

## create-mode 完了条件

- `task-specification-creator` create-mode の Phase 1-5 を反映し、`artifacts.json` は canonical schema に合わせる
- `outputs/phase-1` から `outputs/phase-13` までの成果物置き場を事前作成する
- `validate-phase-output.js` と `verify-all-specs.js` を通してから仕様書完成とみなす
- `aiworkflow-requirements` は resource-map / quick-reference 起点で必要仕様だけを抽出する

## 既存 backlog との関係

| 既存指示書                                                                                                                                     | 位置づけ                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/unassigned-task/task-ut-ui-03-light-secondary-text-contrast-001.md`       | `--text-secondary` 系の token 観点を本タスクへ継承 |
| `docs/30-workflows/completed-tasks/unassigned-task/task-ui-design-foundation-light-border-contrast-improvement.md`                             | light border token 観点を本タスクへ継承            |
| `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-imp-auth-timeout-fallback-light-contrast-guard-001.md` | `--accent-primary` の視認性問題を参照              |

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked    |
