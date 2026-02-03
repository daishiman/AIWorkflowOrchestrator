# TASK-9B-G テスト仕様書

## メタ情報

| 項目     | 値                    |
| -------- | --------------------- |
| タスクID | TASK-9B-G             |
| 機能名   | skill-creator-service |
| Phase    | 4                     |
| 作成日   | 2026-02-03            |

---

## 1. テスト方針

### 1.1 TDDアプローチ

| フェーズ | 状態  | 説明                   |
| -------- | ----- | ---------------------- |
| Phase 4  | Red   | テスト作成（失敗状態） |
| Phase 5  | Green | 実装（テスト成功）     |
| Phase 8  | Green | リファクタリング       |

### 1.2 テストレベル

| レベル   | 対象               | ツール |
| -------- | ------------------ | ------ |
| ユニット | 各クラスの単体動作 | Vitest |
| 統合     | クラス間連携       | Vitest |
| 境界値   | エッジケース       | Vitest |
| エラー系 | 例外・失敗ケース   | Vitest |

### 1.3 カバレッジ目標

| 指標     | 目標値 |
| -------- | ------ |
| Line     | 80%+   |
| Branch   | 60%+   |
| Function | 80%+   |

---

## 2. テスト対象クラス

### 2.1 ScriptExecutor

| 責務           | テスト観点                     |
| -------------- | ------------------------------ |
| スクリプト実行 | 正常実行、失敗実行、エラー処理 |
| JSON出力パース | 正常パース、不正JSON           |
| パス構築       | scriptsDir基準の相対パス       |

### 2.2 ResourceLoader

| 責務               | テスト観点                       |
| ------------------ | -------------------------------- |
| リソース読み込み   | ファイル読み込み、存在チェック   |
| キャッシュ         | キャッシュヒット、キャッシュミス |
| カテゴリ別読み込み | agents, schemas, references等    |

### 2.3 SkillCreatorService

| 責務           | テスト観点               |
| -------------- | ------------------------ |
| モード判定     | 5モードの判定ロジック    |
| スキル作成     | モード別ワークフロー     |
| タスク実行     | 依存関係解決、並列実行   |
| バリデーション | スキル検証、スキーマ検証 |

---

## 3. モック戦略

### 3.1 外部依存モック

| 依存先         | モック方法               |
| -------------- | ------------------------ |
| child_process  | vi.mock('child_process') |
| fs/promises    | vi.mock('fs/promises')   |
| ScriptExecutor | vi.fn()でメソッドモック  |
| ResourceLoader | vi.fn()でメソッドモック  |

### 3.2 テストフィクスチャ

| フィクスチャ        | 用途                 |
| ------------------- | -------------------- |
| mockScriptResult    | スクリプト実行結果   |
| mockResourceContent | リソースファイル内容 |
| mockTaskSpec        | タスク仕様書         |
| mockInterviewResult | インタビュー結果     |

---

## 4. テストファイル構成

```
apps/desktop/src/main/services/skill/__tests__/
├── ScriptExecutor.test.ts      # ScriptExecutorユニットテスト
├── ResourceLoader.test.ts      # ResourceLoaderユニットテスト
└── SkillCreatorService.test.ts # SkillCreatorServiceユニットテスト
```

---

## 5. テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 特定ファイルのみ
pnpm --filter @repo/desktop test ScriptExecutor.test.ts

# カバレッジ付き
pnpm --filter @repo/desktop test --coverage

# ウォッチモード
pnpm --filter @repo/desktop test --watch
```

---

## 6. 前提条件

### 6.1 テスト実行環境

- Node.js 18+
- Vitest 1.x
- TypeScript 5.x

### 6.2 テストデータ

| データ                | 配置先                                |
| --------------------- | ------------------------------------- |
| skill-creatorリソース | `~/.aiworkflow/skills/skill-creator/` |
| テストフィクスチャ    | テストファイル内でインライン定義      |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-02-03 | 初版作成 |
