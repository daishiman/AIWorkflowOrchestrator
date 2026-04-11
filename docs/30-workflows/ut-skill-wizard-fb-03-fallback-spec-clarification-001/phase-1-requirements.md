# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| Phase      | 1                                                                |
| タスクID   | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001            |
| 機能名     | SmartDefault AC-4 フォールバック仕様のフィールド独立推論性明示化 |
| タスク種別 | docs-only                                                        |
| 前提Phase  | -                                                                |
| 後続Phase  | Phase 2                                                          |
| 作成日     | 2026-04-11                                                       |
| ステータス | pending                                                          |

## 目的

SmartDefault推論のフィールド間独立性（各フィールドは独立して推論される）を仕様書に明示し、
purpose空時のformat推論に関する仕様揺れを根本防止する。

## タスク分類宣言

**docs-only タスク**

- UIコンポーネントの変更なし
- コード実装の変更なし
- 対象: task-specification-creator スキルテンプレートの文書更新 + テストケース定義

## 背景

### 問題の再現

`UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001` Phase 4〜11において：

1. フックが自動的にテスト入力値を変更
2. 「purposeが空でもformatが推論される」テストケースが一時生成
3. 元の仕様（purpose空→format null）との矛盾が手動発見まで気づかれなかった
4. フィールド間独立性がAC-4に明文化されていないことが根本原因

### SmartDefault フィールド独立推論の原則

```
各フィールドは独立して推論される：
- purpose: スキルの目的記述 → 空白の場合は null（推論不可）
- category: スキルカテゴリー → purposeとは独立して推論可能
- format: 出力フォーマット → category が有効ならば推論可能（purposeに依存しない）
```

**誤解パターン**:

```
purpose = "" → format = null（誤: purposeに連鎖して全フィールドがnullになるという誤解）
```

**正しい仕様**:

```
purpose = "" → purpose = null（purposeのみnull）
category = "valid" → format は categoryから独立推論可（purposeとは無関係）
```

## 受け入れ基準（AC一覧）

| AC番号 | 受け入れ基準                                                                    | 検証方法       |
| ------ | ------------------------------------------------------------------------------- | -------------- |
| AC-1   | task-specification-creator スキルテンプレートのAC-4定義にフィールド独立性が明示 | ファイル確認   |
| AC-2   | フォールバック仕様書テンプレートに「フィールド間独立性」の記述が追加            | ファイル確認   |
| AC-3   | purpose空・category有効ケースのテストケースが追加されている                     | テスト実行確認 |
| AC-4   | フィールド独立推論性の定義が矛盾なく一貫している                                | レビュー確認   |
| AC-5   | 既存テストへの回帰影響がない                                                    | テスト全件PASS |

## スコープ定義

### 含む（in-scope）

- `.claude/skills/task-specification-creator/` 配下のAC-4関連テンプレート更新
- SmartDefault フォールバック仕様書テンプレートへの「フィールド間独立性」記述追加
- purpose空・category有効ケースのテストケース追加

### 含まない（out-of-scope）

- SmartDefault推論ロジックのコード変更
- 既存テストケースの削除・変更
- UIコンポーネントの変更
- コミット・PR作成（ユーザー明示承認前）

## 制約・前提条件

| 種別 | 内容                                                                    |
| ---- | ----------------------------------------------------------------------- |
| 制約 | コミット・PR作成はユーザーの明示的指示があるまで禁止                    |
| 制約 | docs-onlyタスクのためコード実装は行わない                               |
| 前提 | `UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001` の成果物が存在すること |
| 前提 | task-specification-creator skillの現行テンプレートを参照可能なこと      |

## 実行タスク

1. 現行のAC-4定義を task-specification-creator スキルテンプレートから調査・確認する
2. フォールバック仕様書テンプレートの現状を確認する
3. フィールド間独立性の正確な定義を文書化する
4. テストケース要件（purpose空・category有効ケース）を定義する
5. 成果物を出力する

## 参照資料

| 資料名                           | パス                                                                                         | 用途                 |
| -------------------------------- | -------------------------------------------------------------------------------------------- | -------------------- |
| task-specification-creator SKILL | `.claude/skills/task-specification-creator/SKILL.md`                                         | AC-4定義確認         |
| phase-templates                  | `.claude/skills/task-specification-creator/references/phase-templates.md`                    | テンプレート構造確認 |
| 検出元タスク仕様書（原票）       | `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001.md` | 問題詳細確認         |
| aiworkflow-requirements          | `.claude/skills/aiworkflow-requirements/SKILL.md`                                            | システム仕様確認     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                | 内容                     |
| -------------------- | ------------------------------------------------------------------- | ------------------------ |
| SmartDefault仕様     | `.claude/skills/aiworkflow-requirements/references/`                | フォールバック推論の仕様 |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` | フィールド型定義         |

## 成果物

| 成果物                 | パス                                             | 説明                         |
| ---------------------- | ------------------------------------------------ | ---------------------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`     | 機能要件・非機能要件         |
| 受け入れ基準書         | `outputs/phase-1/acceptance-criteria.md`         | AC-1〜AC-5 検証可能一覧      |
| フィールド独立性分析書 | `outputs/phase-1/field-independence-analysis.md` | 各フィールドの独立推論性分析 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] AC-4定義の現状が確認・記録されていること
- [ ] フィールド独立推論性の定義が矛盾なく固定されていること
- [ ] テストケース要件が受け入れ基準として明示されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認（AC-4定義の現状調査）
2. フィールド独立性の定義文書化
3. テストケース要件定義
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
