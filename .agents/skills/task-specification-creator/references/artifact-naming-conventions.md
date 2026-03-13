# 成果物命名規則と依存関係管理

> **Progressive Disclosure**
> - 読み込みタイミング: Phase完了時の成果物登録・依存更新実行時
> - 読み込み条件: 成果物パス命名やartifacts.json更新が必要なとき
> - 関連スキーマ: schemas/artifact-definition.json
> - 関連スクリプト: scripts/init-artifacts.js, scripts/complete-phase.js, scripts/validate-phase-output.js

## 概要

各Phase/Taskの実行時に生成される成果物の命名規則と、
依存タスクへの成果物パス反映の仕組みを定義する。

---

## 0. 成果物タイプの区別（重要）

**成果物には2種類あり、配置先が異なる。**

| 成果物タイプ           | 配置先                                  | 説明                             |
| ---------------------- | --------------------------------------- | -------------------------------- |
| **ドキュメント成果物** | `docs/30-workflows/{{FEATURE_NAME}}/outputs/` | 設計書、仕様書、レビュー結果など |
| **コード成果物**       | プロジェクトの該当ディレクトリ          | 実装コード、テストコード         |

### コード成果物の配置ルール

**コード成果物は絶対に `outputs/` 配下に配置しない。**

```
# ✅ 正しい配置
packages/shared/src/{{feature}}/index.ts          # 実装コード
packages/shared/src/{{feature}}/*.test.ts         # テストコード
apps/desktop/src/{{feature}}/component.tsx        # Electron実装

# ❌ 誤った配置
docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-5/index.ts  # ダメ！
```

### Phase別の成果物タイプ

| Phase              | ドキュメント成果物          | コード成果物                         |
| ------------------ | --------------------------- | ------------------------------------ |
| 1 要件定義         | ✅ 要件定義書、受け入れ基準 | -                                    |
| 2 設計             | ✅ 設計書、API仕様          | -                                    |
| 3 設計レビュー     | ✅ レビュー結果             | -                                    |
| 4 テスト作成         | ✅ テスト仕様書             | ✅ テストコード（※プロジェクト配置） |
| 5 実装               | ✅ 実装サマリー             | ✅ 実装コード（※プロジェクト配置）   |
| 6 テスト拡充         | ✅ カバレッジ/統合テスト結果 | ✅ 追加テストコード（※プロジェクト配置） |
| 7 テストカバレッジ確認 | ✅ 検証レポート             | -                                    |
| 8 リファクタリング   | ✅ リファクタ記録           | ✅ 改善コード（※プロジェクト配置）   |
| 9 品質保証           | ✅ 品質レポート             | -                                    |
| 10 最終レビュー      | ✅ レビュー結果             | -                                    |
| 11 手動テスト        | ✅ テスト結果               | -                                    |
| 12 ドキュメント      | ✅ 更新記録                 | -                                    |
| 13 PR作成            | ✅ PR情報                   | -                                    |

---

## 1. 成果物命名規則（ドキュメント成果物）

### 1.1 ディレクトリ構造

```
docs/30-workflows/{{FEATURE_NAME}}/
├── index.md                           # ワークフローインデックス
├── artifacts.json                     # 成果物レジストリ（動的更新）
├── phase-1-requirements.md            # Phase 1 仕様書
├── phase-2-design.md                  # Phase 2 仕様書
├── ...
├── phase-13-pr-creation.md            # Phase 13 仕様書
└── outputs/                           # 各Phase成果物格納
    ├── phase-1/                       # Phase 1 成果物
    │   ├── requirements-definition.md
    │   ├── acceptance-criteria.md
    │   └── scope-definition.md
    ├── phase-2/                       # Phase 2 成果物
    │   ├── architecture-design.md
    │   ├── api-specification.md
    │   └── database-schema.md
    └── ...
```

### 1.2 ファイル命名規則

| カテゴリ     | パターン                                 | 例                                           |
| ------------ | ---------------------------------------- | -------------------------------------------- |
| Phase仕様書  | `phase-{N}-{kebab-case-name}.md`         | `phase-3-test-creation.md`                   |
| 成果物       | `outputs/phase-{N}/{kebab-case-name}.md` | `outputs/phase-1/requirements-definition.md` |
| レジストリ   | `artifacts.json`                         | -                                            |
| インデックス | `index.md`                               | -                                            |

### 1.3 成果物タイプ別命名

| Phase | 成果物タイプ         | 命名パターン                  |
| ----- | -------------------- | ----------------------------- |
| 1     | 要件定義書           | `requirements-definition.md`  |
| 1     | 受け入れ基準         | `acceptance-criteria.md`      |
| 1     | スコープ定義         | `scope-definition.md`         |
| 2     | アーキテクチャ設計   | `architecture-design.md`      |
| 2     | API仕様              | `api-specification.md`        |
| 2     | DB設計               | `database-schema.md`          |
| 3     | 設計レビュー結果     | `design-review-result.md`     |
| 4     | テスト仕様書         | `test-specification.md`       |
| 4     | テストケース         | `test-cases.md`               |
| 5     | 実装サマリー         | `implementation-summary.md`   |
| 6     | カバレッジレポート   | `coverage-report.md`          |
| 6     | 統合テスト結果       | `integration-test.md`         |
| 7     | カバレッジ検証結果   | `coverage-report.md`          |
| 8     | リファクタリング記録 | `refactoring-log.md`          |
| 9     | 品質レポート         | `quality-report.md`           |
| 10    | 最終レビュー結果     | `final-review-result.md`      |
| 11    | 手動テスト結果       | `manual-test-result.md`       |
| 12    | 実装ガイド           | `implementation-guide.md`     |
| 12    | ドキュメント更新記録 | `documentation-changelog.md` |
| 12    | 未タスク検出レポート | `unassigned-task-detection.md`   |
| 13    | PR情報               | `pr-info.md`                  |

---

## 2. 成果物レジストリ（artifacts.json）

各Phaseの実行完了時に更新される成果物追跡ファイル。

### 2.1 スキーマ

```json
{
  "feature": "{{FEATURE_NAME}}",
  "created": "2024-01-15T10:00:00Z",
  "lastUpdated": "2024-01-15T15:30:00Z",
  "phases": {
    "1": {
      "status": "completed",
      "completedAt": "2024-01-15T11:00:00Z",
      "artifacts": [
        {
          "type": "document",
          "path": "outputs/phase-1/requirements-definition.md",
          "description": "要件定義書"
        },
        {
          "type": "document",
          "path": "outputs/phase-1/acceptance-criteria.md",
          "description": "受け入れ基準"
        }
      ]
    },
    "2": {
      "status": "in_progress",
      "artifacts": []
    }
  },
  "dependencies": {
    "1": [],
    "2": ["1"],
    "3": ["1", "2"],
    "4": ["1", "2", "3"],
    "5": ["4"],
    "6": ["5"],
    "7": ["5", "6"],
    "8": ["1", "2", "5", "6", "7"],
    "9": ["5"],
    "10": ["1", "2", "5"],
    "11": ["1", "2", "5", "6", "7", "8", "9", "10"]
  }
}
```

### 2.2 互換ルール

- 新規 workflow では `{ type, path, description }` の object 形式を推奨する。
- 既存 workflow の `artifacts` にある文字列パス配列も validator / changelog generator 互換の legacy 形式として許容する。
- Phase が user 指示や外部依存で停止している場合は `status: "blocked"` を使用してよい。
- `metadata.taskType` は `feat` / `fix` / `refactor` / `docs` / `test` / `chore` / `improvement` を推奨しつつ、既存 workflow の kebab_case / snake_case 派生値も互換対象として扱う。

---

## 3. 依存タスクへの反映プロセス

### 3.1 フロー

```
Phase N 実行完了
        ↓
成果物をartifacts.jsonに登録
        ↓
依存関係から後続Phaseを特定
        ↓
後続PhaseのMDファイルの「参照資料」セクションを更新
        ↓
具体的なファイルパスをリストとして追記
```

### 3.2 反映ルール

| 条件           | アクション                                       |
| -------------- | ------------------------------------------------ |
| 新規成果物作成 | artifacts.jsonに追加 + 後続Phaseの参照資料を更新 |
| 成果物更新     | artifacts.jsonのtimestampを更新                  |
| 成果物削除     | artifacts.jsonから削除 + 後続Phaseの参照を削除   |

### 3.3 参照資料セクションの更新形式

更新前:

```markdown
## 参照資料

| 参照資料      | パス               | 説明            |
| ------------- | ------------------ | --------------- |
| 前Phase成果物 | `outputs/phase-1/` | Phase 1の成果物 |
```

更新後:

```markdown
## 参照資料

| 参照資料     | パス                                         | 説明                       |
| ------------ | -------------------------------------------- | -------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件の定義 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 各要件の受け入れ条件       |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲の明確化           |
```

---

## 4. 更新スクリプト使用方法

### 4.1 Phase完了処理（成果物登録＋依存更新を一括実行）

```bash
# scripts/complete-phase.js を使用（推奨）
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow "docs/30-workflows/{{FEATURE_NAME}}" \
  --phase 1 \
  --artifacts "outputs/phase-1/requirements-definition.md:要件定義書,outputs/phase-1/acceptance-criteria.md:受け入れ基準"
```

### 4.2 ワークフロー初期化

```bash
# 新規ワークフロー作成時に artifacts.json を初期化
node .claude/skills/task-specification-creator/scripts/init-artifacts.js \
  --workflow "docs/30-workflows/{{FEATURE_NAME}}"
```

### 4.3 Phase出力検証

```bash
# Phase出力の検証
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  "docs/30-workflows/{{FEATURE_NAME}}" \
  --phase 1
```

---

## 5. 重要原則

1. **明示的なパス**: 曖昧なパス（`phase-1/*`）ではなく、具体的なファイルパスを記載
2. **自動更新**: 成果物作成時に自動的に依存タスクを更新
3. **トレーサビリティ**: artifacts.jsonで全成果物を追跡可能
4. **相対パス**: すべてのパスはワークフローディレクトリからの相対パス
5. **説明付き**: 各成果物には用途の説明を付与
