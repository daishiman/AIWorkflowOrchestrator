# TASK-UI-05A 仕様整合レビュー（task-specification-creator / aiworkflow-requirements）

## 1. 実行概要

- 対象: `docs/30-workflows/skill-editor-view/`
- 目的:
  - `task-specification-creator` 準拠（Phase 1-13 構造・品質）
  - `aiworkflow-requirements` からの必要仕様抽出の妥当性確認
  - 関心ごと分離（仕様書別 SubAgent 分担）の明確化
  - 本ブランチ差分の反映漏れ防止（差分トレーサビリティ）

## 2. 機械検証結果

### 2-1. Phase 出力検証

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-editor-view
```

- 結果: **28項目 PASS / 0エラー / 0警告**
- 改善反映:
  - Phase 8/9 の `実行タスク` 記法をテンプレート準拠に補正
  - Phase 11 ファイル名を推奨形式へ統一（`phase-11-manual-test.md`）
  - `index.md` の Phase リンク不整合を是正

### 2-2. 全仕様整合検証

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-editor-view --json
```

- 結果サマリー:
  - `errors: 0`
  - `warnings: 0`
  - `passed: true`
- 追加整合:
  - `artifacts.json` の Phase 名称（9/13）を `index.md` と一致させた
  - `artifacts.json` の `dependencies` を Phase 仕様書の依存関係と一致する union へ再編成した

### 2-3. ブランチ差分反映検証

- 参照: `branch-diff-reflection-matrix.md`
- 判定: **22/22 反映済み（N/A なし）**
- 目的: 「変更したが仕様に書かれていない」を機械検証前に排除

## 3. aiworkflow-requirements 抽出妥当性

### 3-1. 抽出元（resource-map 起点）

- `indexes/resource-map.md`
- `indexes/quick-reference.md`
- `scripts/search-spec.js`

### 3-2. 抽出コマンド（再現用）

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "ui-ux-components" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill:readFile" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill:getFileTree" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "security-electron-ipc" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "quality-requirements" -C 2
```

### 3-3. 今回実装で必要な仕様（抽出済み）

- UI/UX:
  - `ui-ux-components.md`
  - `ui-ux-design-principles.md`
  - `ui-ux-feature-components.md`
- IPC/API:
  - `api-ipc-agent.md`
  - `api-endpoints.md`
  - `interfaces-agent-sdk-skill.md`
  - `skill:getFileTree` チャネル（未実装・UT-UI-05A-GETFILETREE-001 管理）を抽出対象として固定
- セキュリティ:
  - `security-electron-ipc.md`
  - `security-skill-ipc.md`
  - `error-handling.md`
- 品質/テスト:
  - `quality-requirements.md`
  - `testing-component-patterns.md`
  - `testing-accessibility.md`

## 4. SubAgent 分担（関心ごと分離）

| SubAgent | 関心ごと      | 担当仕様書                                                                             |
| -------- | ------------- | -------------------------------------------------------------------------------------- |
| A        | UI/UX         | `ui-ux-components.md`, `ui-ux-design-principles.md`, `ui-ux-feature-components.md`     |
| B        | IPC/API契約   | `api-ipc-agent.md`, `api-endpoints.md`, `interfaces-agent-sdk-skill.md`                |
| C        | セキュリティ  | `security-electron-ipc.md`, `security-skill-ipc.md`, `error-handling.md`               |
| D        | 品質/テスト   | `quality-requirements.md`, `testing-component-patterns.md`, `testing-accessibility.md` |
| E        | 台帳/先行整合 | `task-workflow.md`, `TASK-UI-05-SKILL-CENTER-VIEW` 関連仕様                            |

## 5. 反映した改善点

- `index.md`
  - 全 Phase リンクを整合
  - 成果物マトリクスの実ファイル名へ同期
  - 仕様抽出と SubAgent 分担を明記
- `phase-1-requirements.md`
  - 先行タスク参照パスの正規化
  - aiworkflow 抽出トレーサビリティ追記
- `phase-2-design.md`
  - resource-map / quick-reference 参照を追加
- `phase-3-design-review.md`
  - 完了条件の曖昧語チェックを明確化
- `phase-7-coverage-check.md`
  - Phase 5 依存成果物参照を追加
  - aiworkflow 品質/試験仕様の参照を追加
- `phase-8-refactoring.md`, `phase-9-quality-assurance.md`
  - 実行タスク記法をテンプレート準拠に補正
- `phase-10-final-review.md`
  - 曖昧語（「適切に」）を検証可能な表現へ置換
- `phase-11-manual-test.md`
  - ファイル名推奨形式へ統一
  - 参照成果物名の整合修正
- `phase-12-documentation.md`
  - 抽出トレーサビリティ（再現コマンド）を追加
  - バッチ分割を 3ファイル以下/エージェントに厳密化
  - 参照成果物名の整合修正
  - `skill:getFileTree` を IPC 契約確認対象へ追加
  - `api-ipc-agent.md` を参照資料に追加
  - 抽出マトリクス参照を追加
- `phase-13-pr-creation.md`
  - 参照成果物名の整合修正
  - 見出し表記を `次の Phase` へ統一
- `branch-diff-reflection-matrix.md`
  - 本ブランチ差分 22 ファイルを関心ごと別にトレース
  - 仕様反映先を 1:1 で固定化（反映漏れ検知）
- `aiworkflow-requirements-extraction-matrix.md`
  - resource-map起点の抽出ポリシーを明文化
  - SubAgent（A-E）と Phase別適用先を固定化し、抽出漏れガードを追加
  - `skill:getFileTree` 抽出と未実装管理確認をチェックリストへ追加
  - 必須仕様セット / 条件付き仕様セットを追加（security-api-electron, ipc-contract-checklist を含む）

## 6. 未解決事項

- `verify-all-specs` の `info` は、未生成の `outputs/phase-*` 成果物の存在確認メッセージであり、仕様書整合上の警告/エラーではない。
