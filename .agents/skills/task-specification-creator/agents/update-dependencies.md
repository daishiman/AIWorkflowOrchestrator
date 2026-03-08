# Task仕様書：依存関係更新

> **読み込み条件**: タスク仕様書生成（generate-task-specs）完了後
> **相対パス**: `agents/update-dependencies.md`
> **実行パターン**: output-phase-filesと並列実行可能

## 1. メタ情報

| 項目     | 内容                   |
| -------- | ---------------------- |
| 名前     | Dependency Coordinator |
| 専門領域 | 依存関係管理           |
| Task種別 | Script Task            |

> 注記: このTaskはScript Taskとして設計。決定論的な依存関係設定を行う。

---

## 2. プロフィール

### 2.1 背景

ソフトウェアアーキテクチャにおける依存関係管理の原則を適用し、
Phase間の参照関係を正確に設定する。
循環依存を防ぎ、明確な依存フローを構築する。

### 2.2 目的

タスク仕様書一覧を元に、各Phaseファイル間の依存関係を更新し、参照資料を正しく設定する。

### 2.3 責務

| 責務               | 成果物                |
| ------------------ | --------------------- |
| 依存関係マップ作成 | 依存関係マップ        |
| 参照資料更新       | 更新済みPhaseファイル |
| 循環依存チェック   | 検証レポート          |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント   | 適用方法                 |
| ------------------- | ------------------------ |
| Clean Architecture  | 依存関係の方向性制御     |
| Continuous Delivery | パイプラインの依存フロー |

### 3.2 スキーマ参照

| スキーマ           | パス                            | 用途           |
| ------------------ | ------------------------------- | -------------- |
| 成果物定義スキーマ | schemas/artifact-definition.json | 依存関係マップ |

> Progressive Disclosure: 依存関係更新時にスキーマを読み込む

---

## 4. 実行仕様

### 4.1 思考プロセス（スクリプト処理）

| ステップ | アクション                                |
| -------- | ----------------------------------------- |
| 1        | 各Phaseの参照すべき前Phase成果物を整理    |
| 2        | 依存関係マップを作成                      |
| 3        | 各Phaseファイルの参照資料セクションを更新 |
| 4        | 循環依存がないことを検証                  |
| 5        | 依存関係ドキュメントを生成                |

### 4.2 チェックリスト

| 項目         | 基準                              |
| ------------ | --------------------------------- |
| 依存マップ   | 全Phaseの依存関係が定義されている |
| 参照資料更新 | 各ファイルの参照が正しく設定      |
| 循環依存     | 循環依存がないことを確認          |
| 戻りフロー   | レビューゲートの戻り先が明確      |

### 4.3 ビジネスルール（制約）

| 制約       | 説明                                   |
| ---------- | -------------------------------------- |
| 一方向依存 | 依存は前Phaseから後Phaseへの方向のみ   |
| 修正ループ | レビューゲートからの戻りは循環ではない |

---

## 5. インターフェース

### 5.1 入力

**実行パターン**: generate-task-specsの完了を待機。output-phase-filesとは**並列実行**可能。

| データ名       | 提供元              | 実行パターン | 検証ルール   | 欠損時処理     |
| -------------- | ------------------- | ------------ | ------------ | -------------- |
| タスク仕様書群 | generate-task-specs | seq          | 仕様書が存在 | 前Taskに再要求 |

### 5.2 出力

| 成果物名         | 受領先             | 内容                       |
| ---------------- | ------------------ | -------------------------- |
| 依存関係マップ   | output-phase-files | Phase間の依存関係          |
| 更新済みファイル | output-phase-files | 参照資料セクション更新済み |

#### 出力テンプレート（依存関係マップ）

```json
{
  "normalFlow": {
    "1": [],
    "2": ["1"],
    "3": ["1", "2"],
    "4": ["1", "2", "3"],
    "5": ["4"],
    "6": ["5"],
    "7": ["6"],
    "8": ["7"],
    "9": ["8"],
    "10": ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    "11": ["10"],
    "12": ["11"],
    "13": ["12"]
  },
  "reviewLoops": {
    "3": {
      "MAJOR_requirements": 1,
      "MAJOR_design": 2
    },
    "10": {
      "MAJOR_implementation": 5,
      "MAJOR_test": 4,
      "CRITICAL": 1
    }
  },
  "coverageLoop": {
    "7": {
      "coverage_not_met": 6
    }
  }
}
```

### 5.3 出力検証（スクリプト）

```bash
#!/bin/bash
# scripts/validate_dependencies.sh

FEATURE_NAME=$1
OUTPUT_DIR="docs/30-workflows/${FEATURE_NAME}"

# artifacts.jsonの依存関係検証
node -e "
const fs = require('fs');
const artifacts = JSON.parse(fs.readFileSync('${OUTPUT_DIR}/artifacts.json'));

// 循環依存チェック
function hasCycle(deps) {
  const visited = new Set();
  const stack = new Set();

  function dfs(node) {
    if (stack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    stack.add(node);

    const neighbors = deps[node] || [];
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) return true;
    }

    stack.delete(node);
    return false;
  }

  for (const node of Object.keys(deps)) {
    if (dfs(node)) return true;
  }
  return false;
}

if (hasCycle(artifacts.dependencies)) {
  console.error('Error: Circular dependency detected!');
  process.exit(1);
}

console.log('Dependencies validated: No circular dependencies');
"
```

---

## 6. 依存関係ドキュメント

### 6.1 正常フロー

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8 → Phase 9 → Phase 10 → Phase 11 → Phase 12 → Phase 13
```

### 6.2 修正ループ（レビューゲート）

#### Phase 3（設計レビュー）での戻り

| 判定  | 戻り先  | 理由     |
| ----- | ------- | -------- |
| MAJOR | Phase 1 | 要件問題 |
| MAJOR | Phase 2 | 設計問題 |

#### Phase 10（最終レビュー）での戻り

| 判定     | 戻り先  | 理由       |
| -------- | ------- | ---------- |
| MAJOR    | Phase 5 | 実装問題   |
| MAJOR    | Phase 4 | テスト問題 |
| CRITICAL | Phase 1 | 根本的問題 |

### 6.3 カバレッジループ

#### Phase 7（テストカバレッジ確認）での戻り

| 条件             | 戻り先  | 理由             |
| ---------------- | ------- | ---------------- |
| カバレッジ未達成 | Phase 6 | テスト追加が必要 |
