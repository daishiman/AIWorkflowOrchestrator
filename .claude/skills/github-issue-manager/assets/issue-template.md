# Issueテンプレート（task-specification-creator互換）

> **Progressive Disclosure**
>
> - 読み込みタイミング: createモード（Issue作成時）
> - 読み込み条件: タスク仕様書からIssueを作成するとき
> - 互換性: task-specification-creator/assets/unassigned-task-template.md
> - 構文: Handlebars（{{変数}}）

このテンプレートは、task-specification-creatorで作成されたタスク仕様書をGitHub Issueに変換するためのもの。
メタ情報テーブルは機械可読フォーマットで、スクリプトによる自動解析・ラベル付与に対応。

---

## 変数一覧

| 変数名                    | 説明              | 例                                                                |
| ------------------------- | ----------------- | ----------------------------------------------------------------- |
| `{{TASK_ID}}`             | タスク識別子      | `task-20260106-search-replace`                                    |
| `{{TASK_NAME}}`           | タスク名          | `検索・置換機能のUI改善`                                          |
| `{{TASK_CATEGORY}}`       | タスク分類        | `要件/改善/バグ修正/リファクタリング/セキュリティ/パフォーマンス` |
| `{{TARGET_FEATURE}}`      | 対象機能          | `検索・置換機能`                                                  |
| `{{PRIORITY}}`            | 優先度            | `高/中/低`                                                        |
| `{{SCALE}}`               | 見積もり規模      | `大規模/中規模/小規模`                                            |
| `{{STATUS}}`              | ステータス        | `未実施/進行中/完了`                                              |
| `{{SOURCE_PHASE}}`        | 発見元Phase       | `Phase 10/Phase 11/Phase 12/その他`                               |
| `{{CREATED_DATE}}`        | 作成日（ISO形式） | `2026-01-21`                                                      |
| `{{DEPENDENCIES}}`        | 依存タスク        | `#123, #124` または `なし`                                        |
| `{{SPEC_PATH}}`           | 仕様書パス        | `docs/30-workflows/unassigned-task/task-xxx.md`                   |
| `{{BACKGROUND}}`          | 背景              | タスクが必要になった背景                                          |
| `{{PROBLEM}}`             | 問題点・課題      | 解決すべき課題                                                    |
| `{{PURPOSE}}`             | 目的              | 達成すべき具体的な目的                                            |
| `{{FINAL_GOAL}}`          | 最終ゴール        | 達成すべき具体的な最終状態                                        |
| `{{SCOPE_IN}}`            | スコープ内        | 含むもの                                                          |
| `{{SCOPE_OUT}}`           | スコープ外        | 含まないもの                                                      |
| `{{OUTPUTS}}`             | 成果物            | 生成される成果物一覧                                              |
| `{{PREREQUISITES}}`       | 前提条件          | 開始前に満たすべき条件                                            |
| `{{COMPLETION_CRITERIA}}` | 完了条件          | 完了を判断する基準                                                |

---

## テンプレート本体

````markdown
## メタ情報

```yaml
task_id: { { TASK_ID } }
task_name: { { TASK_NAME } }
category: { { TASK_CATEGORY } }
target_feature: { { TARGET_FEATURE } }
priority: { { PRIORITY } }
scale: { { SCALE } }
status: { { STATUS } }
source_phase: { { SOURCE_PHASE } }
created_date: { { CREATED_DATE } }
dependencies: { { DEPENDENCIES_ARRAY } }
spec_path: { { SPEC_PATH } }
```
````

| 項目       | 内容          |
| ---------- | ------------- |
| タスクID   | {{TASK_ID}}   |
| タスク名   | {{TASK_NAME}} |
| 優先度     | {{PRIORITY}}  |
| 規模       | {{SCALE}}     |
| ステータス | {{STATUS}}    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

{{BACKGROUND}}

### 1.2 問題点・課題

{{PROBLEM}}

---

## 2. 何を達成するか（What）

### 2.1 目的

{{PURPOSE}}

### 2.2 最終ゴール

{{FINAL_GOAL}}

### 2.3 スコープ

**含むもの:**
{{SCOPE_IN}}

**含まないもの:**
{{SCOPE_OUT}}

### 2.4 成果物

{{OUTPUTS}}

---

## 3. 実行条件

### 3.1 前提条件

{{PREREQUISITES}}

### 3.2 依存タスク

{{DEPENDENCIES}}

---

## 4. 完了条件

{{COMPLETION_CRITERIA}}

---

## 5. 参照情報

- **仕様書**: [{{SPEC_PATH}}]({{SPEC_PATH}})

````

---

## ラベルマッピング

| メタ情報項目 | ラベル       | 値のマッピング                                                                                                                                                                  |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 優先度       | `priority:*` | 高→`priority:high`, 中→`priority:medium`, 低→`priority:low`                                                                                                                     |
| 見積もり規模 | `scale:*`    | 大規模→`scale:large`, 中規模→`scale:medium`, 小規模→`scale:small`                                                                                                               |
| 分類         | `type:*`     | 要件→`type:requirements`, 改善→`type:improvement`, バグ修正→`type:bugfix`, リファクタリング→`type:refactoring`, セキュリティ→`type:security`, パフォーマンス→`type:performance` |
| ステータス   | `status:*`   | 未実施→`status:unassigned`, 進行中→`status:in-progress`, 完了→`status:completed`                                                                                                |

---

## メタ情報解析ルール

スクリプトがIssueボディからメタ情報を抽出する際のルール:

1. **YAML検出**: ` ```yaml ` ～ ` ``` ` で囲まれたブロックを検出
2. **YAML解析**: `js-yaml`ライブラリでパース
3. **フォールバック**: YAMLがない場合はMarkdownテーブルから正規表現で抽出
4. **必須項目**: task_id, task_name, priority, scale, status

```javascript
// YAML解析例
const yamlMatch = content.match(/```yaml\n([\s\S]*?)```/);
if (yamlMatch) {
  const yaml = require('js-yaml');
  const metadata = yaml.load(yamlMatch[1]);
}
````

---

## 使用例

### 入力（仕様書メタ情報）

```yaml
task_id: task-20260121-ui-improvement
task_name: 検索機能のUI改善
category: 改善
target_feature: 検索機能
priority: 高
scale: 中規模
status: 未実施
source_phase: Phase 11
created_date: 2026-01-21
dependencies: []
```

### 出力（Issueラベル）

```
priority:high
scale:medium
type:improvement
status:unassigned
```

### 出力（Issueタイトル）

```
[task-20260121-ui-improvement] 検索機能のUI改善
```
