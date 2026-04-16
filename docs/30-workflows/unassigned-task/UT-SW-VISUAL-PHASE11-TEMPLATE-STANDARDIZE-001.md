# Phase 11 VISUAL証跡テンプレート標準化 - タスク指示書

## メタ情報

```yaml
issue_number: 2220
task_id: UT-SW-VISUAL-PHASE11-TEMPLATE-STANDARDIZE-001
status: open
priority: low
scale: small
task_type: PROCESS
```

| 項目         | 内容                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| タスクID     | UT-SW-VISUAL-PHASE11-TEMPLATE-STANDARDIZE-001                                 |
| タスク名     | Phase 11 VISUAL証跡テンプレート標準化（スクリーンショット成果物の構造固定化） |
| 分類         | プロセス改善（PROCESS）                                                       |
| 対象機能     | task-specification-creator / VISUAL タスク Phase 11 成果物構造                |
| 優先度       | 低（`priority:low`）                                                          |
| 見積もり規模 | 小規模（`scale:small`）                                                       |
| ステータス   | 未実施（`status:open`）                                                       |
| 発見元       | TASK-SW-UI-POLISH-001 Phase 12 Skill Feedback（2026-04-16）                   |
| 発見日       | 2026-04-16                                                                    |
| タスク分類   | PROCESS タスク（ワークフロー改善・テンプレート整備）                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SW-UI-POLISH-001（スキルウィザード UI仕上げ）の Phase 12 Skill Feedback において、VISUAL タスクにおける Phase 11 の証跡成果物（スクリーンショット・メタデータ）の構造が各タスクで異なることが指摘された。

TASK-SW-UI-POLISH-001 では `outputs/phase-11/` に以下の証跡を作成した：

- `screenshots/*.png`（4枚）
- `manual-test-result.md`
- `manual-test-checklist.md`
- `ui-sanity-visual-review.md`
- `discovered-issues.md`
- `evidence-index.md`
- `screenshot-coverage.md`
- `screenshot-plan.json`
- `phase11-capture-metadata.json`

この構造は前タスク（TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE など）でも類似するが、ファイル名や必須/任意の区別が明文化されていない。次の VISUAL タスクで担当者（またはAI）が変わった場合、証跡構造が不統一になるリスクがある。

### 1.2 問題点・課題

- Phase 11 VISUAL証跡の必須ファイル一覧が task-specification-creator のフォーマットに明記されていない
- `phase11-capture-metadata.json` が特定タスクでのみ使用されており、テンプレート化が遅れている
- スクリーンショットのファイル命名規則（`TASKID-COMPONENT-THEME.png` 等）が非公式ルールとして存在する
- `capture-metadata.json` の構造が各タスクで異なる可能性がある

### 1.3 放置した場合の影響

- VISUAL タスクを実行するたびに証跡構造を一から検討するコストが発生する
- 証跡が不完全なまま Phase 12 に進んだとき、ドキュメントの整合性確認が困難になる
- Phase 11 証跡の再現性（visual audit の再実行）が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

VISUAL タスクの Phase 11 証跡成果物の構造をテンプレート化・標準化し、再現性のある手動テスト証跡を効率的に作成できる環境を整える。

### 2.2 最終ゴール

1. `outputs/phase-11/` の必須ファイル一覧が task-specification-creator のフォーマットに文書化されていること
2. `phase11-capture-metadata.json` の構造（スキーマ）が標準化されていること
3. スクリーンショットのファイル命名規則が明文化されていること
4. テンプレートファイルが所定ディレクトリに配置されていること

### 2.3 スコープ

**含むもの**:

- `outputs/phase-11/` の必須/任意ファイル分類ドキュメント作成
- `phase11-capture-metadata.json` の JSON スキーマ定義（`schema/phase11-capture-metadata.schema.json`）
- スクリーンショット命名規則のドキュメント化
- task-specification-creator の Phase 11 仕様書テンプレートへの参照追加

**含まないもの**:

- 既存タスクの証跡ファイルのリネーム・再構成
- Playwright スクリプトのテンプレート化（別タスク UT-SW-VISUAL-REGRESSION-SNAPSHOT-001 で検討）
- Phase 12 成果物のテンプレート変更

### 2.4 成果物

- `docs/30-workflows/templates/phase11-visual-artifact-template.md`（必須/任意ファイル一覧）
- `docs/30-workflows/templates/phase11-capture-metadata.schema.json`（JSONスキーマ）
- `docs/30-workflows/templates/phase11-screenshot-naming-convention.md`（命名規則）
- task-specification-creator の Phase 11 仕様への参照追記

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SW-UI-POLISH-001 の Phase 11 成果物が確認可能な状態であること
- 過去の VISUAL タスク（TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE 等）の Phase 11 成果物が参照可能であること

### 3.2 依存タスク

なし（独立タスク）

### 3.3 必要な知識

- JSON Schema（draft-07 以降）の基本構造
- Playwright スクリーンショット成果物の構成
- task-specification-creator の Phase 11 仕様書フォーマット

### 3.4 推奨アプローチ

1. 過去3件以上の VISUAL タスク Phase 11 成果物を横断比較し、共通要素を抽出する
2. 必須/任意/推奨のカテゴリに分類する
3. `phase11-capture-metadata.json` の既存インスタンスを比較し、共通キーをスキーマ化する
4. 命名規則を `{TASK_ID}-{COMPONENT}-{THEME}.png` 形式で定式化する

---

## 4. 実行手順

### Phase 1: 要件定義

- 過去 VISUAL タスク（TASK-SW-UI-POLISH-001、TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE 等）の Phase 11 成果物を列挙する
- 共通ファイルと個別ファイルを分類する
- ステークホルダー（task-specification-creator）の要求を明確化する

### Phase 2: 設計

- テンプレートファイルの構造設計
- JSON スキーマの設計（必須フィールド・型定義）
- 命名規則の設計

### Phase 3: 設計レビュー

- 設計が過去タスクと矛盾しないか確認
- テンプレートの使いやすさをレビュー

### Phase 4: テスト作成

- テンプレートが正しい構造を持つかの検証スクリプト（任意）

### Phase 5: 実装

- テンプレートファイルの作成
- JSON スキーマファイルの作成
- 命名規則ドキュメントの作成

### Phase 6-10: テスト拡充・カバレッジ・リファクタリング・品質保証・最終レビュー

- 過去タスクの証跡ファイルに対してテンプレートを適用し、整合性を確認

### Phase 11: 手動テスト

- テンプレートを使って新規 VISUAL タスクの Phase 11 を模擬実行し、証跡が正しく作成されることを確認

### Phase 12: ドキュメント更新

- task-specification-creator の Phase 11 仕様書への参照追記
- 変更履歴記録

### Phase 13: PR 作成

ユーザーの明示的承認を得た後に実施する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `docs/30-workflows/templates/phase11-visual-artifact-template.md` が作成されていること
- [ ] `docs/30-workflows/templates/phase11-capture-metadata.schema.json` が作成されていること
- [ ] `docs/30-workflows/templates/phase11-screenshot-naming-convention.md` が作成されていること
- [ ] テンプレートが過去 VISUAL タスクの成果物と矛盾しないこと

### 品質要件

- [ ] JSON スキーマが valid であること（`ajv` 等で検証）
- [ ] 命名規則が明確で一意であること

### ドキュメント要件

- [ ] task-specification-creator の Phase 11 仕様書にテンプレート参照が追記されていること

---

## 6. 検証方法

| テストID | 対象               | 入力/操作                            | 期待結果                                     |
| -------- | ------------------ | ------------------------------------ | -------------------------------------------- |
| TC-01    | テンプレート完全性 | テンプレートと既存タスク成果物を比較 | 既存成果物がすべてテンプレートに含まれること |
| TC-02    | JSON スキーマ      | `ajv validate` でスキーマを検証      | valid 判定                                   |
| TC-03    | 命名規則           | 既存スクリーンショット名に規則を適用 | 全ファイルが命名規則に準拠していること       |

---

## 7. リスクと対策

| リスク                                               | 影響度 | 発生確率 | 対策                                                   |
| ---------------------------------------------------- | ------ | -------- | ------------------------------------------------------ |
| テンプレートが硬直化し、特殊タスクに対応できなくなる | 中     | 中       | 必須/任意/推奨の3分類で柔軟性を確保する                |
| 既存タスクとの後方互換性が破られる                   | 低     | 低       | 既存ファイルのリネームは含まない（新規タスクのみ適用） |

---

## 8. 参照情報

| 資料名                                | パス                                                                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| TASK-SW-UI-POLISH-001 Phase 11 成果物 | `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-11/`                                     |
| Skill Feedback レポート               | `docs/30-workflows/TASK-SW-UI-POLISH-001/outputs/phase-12/skill-feedback-report.md`             |
| TASK-FIX-CHATVIEW Phase 11 参照       | `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-11/` |

---

## 9. 備考

### 苦戦箇所

| 項目                                     | 内容                                                                                                                                                                                                                                |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 11 証跡の必須要件が未明文化        | TASK-SW-UI-POLISH-001 実行時、Phase 11 で作成すべきファイルの一覧が task-specification-creator に明記されていなかった。結果として証跡が過多になりがちで、何が必須かが不明確だった。テンプレート化によりこの問題を解消する必要がある |
| `capture-metadata.json` の設計判断の重複 | 複数の VISUAL タスクで `capture-metadata.json` の構造を個別に設計する工数が発生している。共通スキーマがあれば再設計コストを削減できる                                                                                               |

### 発見経緯

TASK-SW-UI-POLISH-001（スキルウィザード UI仕上げ）の Phase 12 Skill Feedback において、「Phase 11 のスクリーンショット成果物を標準化する」として改善候補に挙げられた。VISUAL タスクの証跡が分散しやすいという構造的問題に対処するため、タスク化した。
