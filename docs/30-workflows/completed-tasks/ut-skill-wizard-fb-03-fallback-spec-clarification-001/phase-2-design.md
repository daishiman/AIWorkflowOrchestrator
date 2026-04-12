# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| Phase      | 2                                                                |
| タスクID   | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001            |
| 機能名     | SmartDefault AC-4 フォールバック仕様のフィールド独立推論性明示化 |
| 前提Phase  | Phase 1（要件定義完了）                                          |
| 後続Phase  | Phase 3                                                          |
| 作成日     | 2026-04-11                                                       |
| ステータス | pending                                                          |

## 目的

フィールド間独立推論性をAC-4定義とフォールバックテンプレートに追記するための
具体的な変更内容・変更箇所を設計する。

## 変更対象ファイル一覧

| 対象ファイル                                         | 変更種別 | 変更概要                                |
| ---------------------------------------------------- | -------- | --------------------------------------- |
| `.claude/skills/task-specification-creator/SKILL.md` | 修正     | AC-4定義にフィールド独立性の説明を追記  |
| フォールバック仕様書テンプレート（調査で特定）       | 修正     | 「フィールド間独立性」セクション追加    |
| SmartDefault関連テストファイル（調査で特定）         | 修正     | purpose空・category有効テストケース追加 |

## フィールド独立推論性の定義設計

### 独立推論の原則

各フィールドは以下のルールで**独立して**推論される：

```
フィールド推論独立性ルール:
1. 各フィールドは独自の推論ロジックを持つ
2. あるフィールドがnullになっても、他フィールドの推論には影響しない
3. フィールド間に明示的な依存関係がない限り、独立して評価する
```

### フィールド別推論仕様（設計）

| フィールド | 推論ソース         | purpose空時の動作 | category有効時の動作 |
| ---------- | ------------------ | ----------------- | -------------------- |
| purpose    | ユーザー入力のみ   | null（推論不可）  | 独立（影響なし）     |
| category   | コンテキスト・履歴 | 独立して推論可能  | 推論済み             |
| format     | category           | 独立して推論可能  | categoryからのみ推論 |

### 誤解パターンと正解パターン

```
【誤解パターン】連鎖nullモデル
purpose = "" → purpose=null → category=null → format=null  ← 誤り

【正解パターン】独立推論モデル
purpose = "" → purpose = null（purposeのみnull）
category = "code-support" → category = "code-support"（独立して有効）
format = "code" → format = "code"（categoryからのみ独立推論）
```

## AC-4定義への追記設計

### 追記箇所

task-specification-creator スキルのAC-4定義箇所（フォールバック仕様のテンプレート部分）に
以下の内容を追記する：

```markdown
#### フィールド間独立推論性（AC-4補足）

SmartDefaultの各フィールドは独立して推論される。あるフィールドの値が空・null・
推論不可であっても、他フィールドの推論には影響しない。

| フィールド | 空白時の動作     | 他フィールドへの影響 |
| ---------- | ---------------- | -------------------- |
| purpose    | null（推論不可） | なし                 |
| category   | 独立推論継続     | なし                 |
| format     | 独立推論継続     | なし                 |

**誤用例**: purpose空 → 全フィールドnullとみなす（誤り）
**正用例**: purpose空 → purposeのみnull、他フィールドは独立推論継続
```

## テストケース設計

### TC-FB03-01: purpose空・category有効・format推論可（categoryから）

```
入力:
  purpose: ""
  category: "code-support"
期待:
  smartDefaults.purpose: null
  smartDefaults.category: "code-support"
  smartDefaults.tool: null
  smartDefaults.timing: null
  smartDefaults.format: "code"
検証観点: フィールド独立推論性の確認
```

### TC-FB03-02: purpose空・category空・format推論不可

```
入力:
  purpose: ""
  category: ""
期待:
  smartDefaults.purpose: null
  smartDefaults.category: null
  smartDefaults.format: null（推論ソースなし）
検証観点: 推論ソースがない場合の正常系確認
```

### TC-FB03-03: purpose有効・category空・formatはnull（purposeはformatに影響しない）

```
入力:
  purpose: "GitHubのPRレビューを支援するスキル"
  category: ""
期待:
  smartDefaults.purpose: "GitHubのPRレビューを支援するスキル"
  smartDefaults.category: null
  smartDefaults.tool: "github"
  smartDefaults.timing: null
  smartDefaults.format: null
検証観点: purpose有効でもformatはcategory未選択ならnullのまま
```

## 設計判断・トレードオフ

| 判断事項                         | 採用案                     | 理由                                            |
| -------------------------------- | -------------------------- | ----------------------------------------------- |
| AC-4への追記方式                 | 既存セクション内に補足追加 | 破壊的変更を避け、既存参照との整合を保つ        |
| テストケース追加場所             | 既存テストファイルに追加   | 新規ファイル作成よりも関連性が明確              |
| フォールバックテンプレートの変更 | 専用セクションを新設       | 独立した参照が容易になり、Phase 1でのAC確認が楽 |

## 参照資料

| 資料名                           | パス                                                                      | 用途             |
| -------------------------------- | ------------------------------------------------------------------------- | ---------------- |
| Phase 1 成果物                   | `outputs/phase-1/`                                                        | 要件定義の参照   |
| task-specification-creator SKILL | `.claude/skills/task-specification-creator/SKILL.md`                      | AC-4現行定義確認 |
| フォールバックテンプレート       | `.claude/skills/task-specification-creator/references/phase-templates.md` | 変更箇所特定     |

## 成果物

| 成果物                     | パス                                                       | 説明                       |
| -------------------------- | ---------------------------------------------------------- | -------------------------- |
| 設計仕様書                 | `outputs/phase-2/design-spec.md`                           | 変更内容・設計根拠の詳細   |
| 変更対象ファイル一覧       | `outputs/phase-2/change-target-files.md`                   | 具体的な変更対象とdiff設計 |
| フィールド独立性記述設計書 | `outputs/phase-2/field-independence-description-design.md` | AC-4追記内容の詳細設計     |

## 完了条件

- [ ] 変更対象ファイルが全件特定されていること
- [ ] AC-4への追記内容が具体的に設計されていること
- [ ] テストケース設計（TC-FB03-01〜03）が完成していること
- [ ] 既存仕様との矛盾がないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビュー
