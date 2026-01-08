# Phase 1: 要件定義

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 1               |
| 機能名 | logging-service |
| 作成日 | 2026-01-07      |

## 目的

ログ記録サービスの目的、スコープ、受け入れ基準を明文化する。

## 使用スキル

| スキル                        | 選定理由                           |
| ----------------------------- | ---------------------------------- |
| `requirements-engineering`    | ユーザー要求からの要件抽出・仕様化 |
| `acceptance-criteria-writing` | テスト可能な受け入れ基準の作成     |

## 参照資料

| 資料名         | パス                                                              | 説明             |
| -------------- | ----------------------------------------------------------------- | ---------------- |
| 元タスク指示書 | `docs/30-workflows/unassigned-task/task-05-01-logging-service.md` | 元の要件         |
| システム仕様   | `.claude/skills/aiworkflow-requirements/references/`              | 既存システム仕様 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                              | 内容                       |
| ---------------- | ----------------------------------------------------------------- | -------------------------- |
| 変換処理仕様     | `.claude/skills/aiworkflow-requirements/references/conversion.md` | 変換処理の全体フロー       |
| データベース仕様 | `.claude/skills/aiworkflow-requirements/references/database.md`   | テーブル設計・リレーション |

## 実行手順

### ステップ1: 要件抽出

`requirements-engineering` スキルを使用して、元タスク指示書から要件を抽出する。

**入力**: 元タスク指示書（task-05-01-logging-service.md）
**出力**: 機能要件・非機能要件リスト

### ステップ2: 受け入れ基準作成

`acceptance-criteria-writing` スキルを使用して、各要件の受け入れ基準を定義する。

**出力**: テスト可能な受け入れ基準（Given-When-Then形式）

### ステップ3: スコープ定義

実装範囲と除外項目を明確にする。

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ   | 記載内容                              |
| ------------------ | ------------------------------------- |
| LogRepository接続  | ConversionLogger → LogRepository → DB |
| データフロー       | ログ生成 → バッファリング → 一括保存  |
| エラーハンドリング | DB障害時のフォールバック動作          |

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

## 完了条件

- [ ] 全要件が抽出されている
- [ ] 各要件に受け入れ基準がある
- [ ] 機能要件と非機能要件が分類されている
- [ ] LogRepository/DB接続要件が明記されている
- [ ] スコープ（実装範囲・除外項目）が定義されている
- [ ] **本Phase内の全スキルを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. requirements-engineeringスキルの実行
3. acceptance-criteria-writingスキルの実行
4. 統合テスト連携の実施（接続要件明記）
5. 成果物の作成・配置
6. 完了条件の検証

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/logging-service --phase 1
```

## スキルフィードバック記録

Phase完了後、以下を記録してください:

| スキル                      | 結果                        | 備考                        |
| --------------------------- | --------------------------- | --------------------------- |
| requirements-engineering    | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |
| acceptance-criteria-writing | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-

## 次のPhase

Phase 2: 設計
