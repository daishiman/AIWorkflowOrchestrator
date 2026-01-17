# Task仕様書：Phaseファイル出力

> **読み込み条件**: タスク仕様書生成（generate-task-specs）完了後
> **相対パス**: `agents/output-phase-files.md`
> **実行パターン**: update-dependenciesと並列実行可能

## 1. メタ情報

| 項目     | 内容                |
| -------- | ------------------- |
| 名前     | File Output Handler |
| 専門領域 | ファイル生成・出力  |
| Task種別 | Script Task         |

> 注記: このTaskはScript Taskとして設計。決定論的なファイル出力処理を行う。

---

## 2. プロフィール

### 2.1 背景

タスク仕様書をファイルシステムに出力する責務を担う。
ディレクトリ構造の作成、ファイル命名規則の適用、出力の検証を行う。

### 2.2 目的

タスク仕様書一覧を元に、各Phaseを独立したMarkdownファイルとして出力する。

### 2.3 責務

| 責務               | 成果物                 |
| ------------------ | ---------------------- |
| ディレクトリ作成   | 出力ディレクトリ       |
| ファイル出力       | phase-\*.md ファイル群 |
| インデックス作成   | index.md               |
| 成果物格納場所作成 | outputs/ ディレクトリ  |
| レジストリ初期化   | artifacts.json         |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント | 適用方法         |
| ----------------- | ---------------- |
| POSIX標準         | ファイル命名規則 |

### 3.2 スキーマ参照

| スキーマ           | パス                            | 用途         |
| ------------------ | ------------------------------- | ------------ |
| 成果物定義スキーマ | schemas/artifact-definition.json | レジストリ管理 |

> Progressive Disclosure: artifacts.json生成時にスキーマを読み込む

---

## 4. 実行仕様

### 4.1 思考プロセス（スクリプト処理）

| ステップ | アクション                         |
| -------- | ---------------------------------- |
| 1        | 出力ディレクトリを作成             |
| 2        | outputs/ディレクトリを作成         |
| 3        | Phase 1〜13の各ファイルを生成      |
| 4        | 各ファイルにタスク定義を含める     |
| 5        | インデックスファイルを生成         |
| 6        | artifacts.jsonを初期化             |
| 7        | 出力結果を検証                     |

### 4.2 チェックリスト

| 項目         | 基準                           |
| ------------ | ------------------------------ |
| ディレクトリ | 出力先が正しく作成されている   |
| ファイル数   | 13ファイル + index.md が存在   |
| 命名規則     | phase-{N}-{name}.md 形式       |
| タスク定義   | 実行タスクが記載されている     |
| レジストリ   | artifacts.jsonが正しく初期化   |

### 4.3 ビジネスルール（制約）

| 制約       | 説明                                  |
| ---------- | ------------------------------------- |
| 出力先     | `docs/30-workflows/{{FEATURE_NAME}}/` |
| 上書き禁止 | 既存ファイルがある場合は確認を求める  |
| レジストリ | artifacts.jsonは常に最新状態を維持    |

---

## 5. インターフェース

### 5.1 入力

**実行パターン**: generate-task-specsの完了を待機。update-dependenciesとは**並列実行**可能。

| データ名       | 提供元              | 実行パターン | 検証ルール   | 欠損時処理     |
| -------------- | ------------------- | ------------ | ------------ | -------------- |
| タスク仕様書群 | generate-task-specs | seq          | 仕様書が存在 | 前Taskに再要求 |

### 5.2 出力

| 成果物名          | 受領先      | 内容                  |
| ----------------- | ----------- | --------------------- |
| Phase別ファイル群 | Phase実行時 | 13個のphase-\*.md     |
| インデックス      | Phase実行時 | index.md              |
| 成果物レジストリ  | 全Phase     | artifacts.json        |

#### 出力テンプレート（出力結果レポート）

```markdown
## 出力結果

### 生成されたファイル

| ファイル名              | パス                              |
| ----------------------- | --------------------------------- |
| index.md                | docs/30-workflows/{{FEATURE_NAME}}/ |
| phase-1-requirements.md | docs/30-workflows/{{FEATURE_NAME}}/ |
| phase-2-design.md       | docs/30-workflows/{{FEATURE_NAME}}/ |
| ...                     | ...                               |
| artifacts.json          | docs/30-workflows/{{FEATURE_NAME}}/ |

### 検証結果

- [ ] すべてのファイルが正常に出力された
- [ ] 命名規則に従っている
- [ ] インデックスからすべてのPhaseにリンクされている
- [ ] artifacts.jsonが正しく初期化された
```

### 5.3 出力検証（スクリプト）

```bash
#!/bin/bash
# scripts/validate_output.sh

FEATURE_NAME=$1
OUTPUT_DIR="docs/30-workflows/${FEATURE_NAME}"

# ディレクトリ存在確認
if [ ! -d "$OUTPUT_DIR" ]; then
  echo "Error: Output directory not found: $OUTPUT_DIR"
  exit 1
fi

# ファイル数確認
FILE_COUNT=$(ls -1 "$OUTPUT_DIR"/phase-*.md 2>/dev/null | wc -l)
if [ "$FILE_COUNT" -ne 13 ]; then
  echo "Error: Expected 13 phase files, found $FILE_COUNT"
  exit 1
fi

# index.md確認
if [ ! -f "$OUTPUT_DIR/index.md" ]; then
  echo "Error: index.md not found"
  exit 1
fi

# artifacts.json確認
if [ ! -f "$OUTPUT_DIR/artifacts.json" ]; then
  echo "Error: artifacts.json not found"
  exit 1
fi

echo "Validation passed!"
```

---

## 6. スクリプト実装

### 6.1 ファイル出力スクリプト

```bash
#!/bin/bash
# scripts/output_phase_files.sh

FEATURE_NAME=$1
OUTPUT_DIR="docs/30-workflows/${FEATURE_NAME}"
OUTPUTS_DIR="${OUTPUT_DIR}/outputs"

# ディレクトリ作成
mkdir -p "$OUTPUT_DIR"
mkdir -p "$OUTPUTS_DIR"

# Phase 1-13のサブディレクトリ作成
for i in {1..13}; do
  mkdir -p "${OUTPUTS_DIR}/phase-${i}"
done

echo "Directories created successfully"
```

### 6.2 artifacts.json初期化スクリプト

```javascript
// scripts/init_artifacts.js
import fs from 'fs';
import path from 'path';

const featureName = process.argv[2];
const outputDir = `docs/30-workflows/${featureName}`;

const artifacts = {
  feature: featureName,
  created: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  status: 'in_progress',
  phases: {},
  dependencies: {
    "2": ["1"], "3": ["2"], "4": ["3"], "5": ["4"],
    "6": ["5"], "7": ["6"], "8": ["7"], "9": ["8"],
    "10": ["9"], "11": ["10"], "12": ["11"], "13": ["12"]
  },
  metadata: {
    estimatedPhases: 13,
    actualPhases: 0
  }
};

// Phase 1-13の初期化
for (let i = 1; i <= 13; i++) {
  artifacts.phases[String(i)] = {
    status: 'pending',
    artifacts: []
  };
}

fs.writeFileSync(
  path.join(outputDir, 'artifacts.json'),
  JSON.stringify(artifacts, null, 2)
);

console.log('artifacts.json initialized');
```
