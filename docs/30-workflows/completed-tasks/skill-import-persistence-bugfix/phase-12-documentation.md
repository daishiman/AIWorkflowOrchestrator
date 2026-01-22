# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 内容                           |
| --------- | ------------------------------ |
| Phase     | 12                             |
| Phase名   | ドキュメント更新               |
| 目的      | ドキュメント・システム仕様更新 |
| 前提Phase | Phase 11: 手動テスト検証       |
| 次Phase   | Phase 13: PR作成               |

---

## 1. 目的

修正内容をドキュメントに反映し、システム仕様を必要に応じて更新する。

---

## 2. 実行タスク

### Task 1: 実装ガイド作成

#### 手順

1. `outputs/phase-12/implementation-guide.md`を作成する

2. 以下の内容を記載する（2パート構成）：

   **Part 1: 概念的説明（初学者・非技術者向け）**
   - 問題の概要
   - 解決策の概要
   - 影響範囲

   **Part 2: 技術的詳細（開発者向け）**
   - 根本原因の詳細
   - 修正内容の詳細
   - コード変更箇所
   - テスト方法

#### 成果物

- `outputs/phase-12/implementation-guide.md`

#### 完了条件

- [ ] 実装ガイドが作成されている
- [ ] 2パート構成になっている

---

### Task 2: システム仕様書更新

#### 手順

1. `.claude/skills/task-specification-creator/references/spec-update-workflow.md`を参照する

2. 以下のチェックリストに基づいて更新が必要かを判断する：

   **更新判断チェックリスト**
   - [ ] メソッドシグネチャ変更 → `interfaces-agent-sdk.md`
   - [ ] 新規エラークラス追加 → `error-handling.md`
   - [ ] 新規ビジネスルール → `interfaces-agent-sdk.md`
   - [ ] 認可/認証ロジック → `security-*.md`
   - [ ] 新規定数/設定値 → 該当`interfaces-*.md`
   - [ ] DBスキーマ変更 → `database-*.md`

3. 該当する場合は、システム仕様を更新する

4. 更新した場合は、変更履歴セクションにバージョンを追記する

#### 成果物

- 更新済みシステム仕様（該当する場合）

#### 完了条件

- [ ] システム仕様更新の要否が判断されている
- [ ] 必要な場合は更新が完了している

---

### Task 3: ドキュメント更新履歴作成

#### 手順

1. `outputs/phase-12/documentation-changelog.md`を作成する

2. 以下の内容を記載する：
   - 作成したドキュメント一覧
   - 更新したドキュメント一覧（システム仕様含む）
   - 各ドキュメントの変更概要

#### 成果物

- `outputs/phase-12/documentation-changelog.md`

#### 完了条件

- [ ] ドキュメント更新履歴が作成されている

---

### Task 4: 未タスク検出レポート作成

#### 手順

1. 以下のソースから未完了タスクを検出する：
   - Phase 11の発見課題
   - テスト結果のFAIL項目
   - アクセシビリティ違反

2. `outputs/phase-12/unassigned-tasks-report.md`を作成する

3. 検出されなくても「検出タスクなし」と明記する

#### 検出結果形式（0件の場合）

```markdown
## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| テスト結果       | 0件     |
| 発見課題         | 0件     |
| アクセシビリティ | 0件     |
| **合計**         | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

#### 成果物

- `outputs/phase-12/unassigned-tasks-report.md`

#### 完了条件

- [ ] 未タスク検出レポートが作成されている（0件でも出力必須）

---

## 3. 参照資料

### システム仕様（aiworkflow-requirements）

> 更新が必要な場合は以下のシステム仕様を参照してください。

| 参照資料               | パス                                                                           | 内容                   |
| ---------------------- | ------------------------------------------------------------------------------ | ---------------------- |
| スキル管理IPC仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`    | IPCチャネル・API仕様   |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | スキル管理サービス設計 |
| 仕様更新ワークフロー   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新判断基準           |

### 前Phaseの成果物

| 成果物                 | パス                                     |
| ---------------------- | ---------------------------------------- |
| 手動テスト結果レポート | `outputs/phase-11/manual-test-result.md` |
| 発見課題               | `outputs/phase-11/discovered-issues.md`  |

---

## 4. 成果物一覧

| 成果物               | 配置先                                        | 形式     |
| -------------------- | --------------------------------------------- | -------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Markdown |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | Markdown |
| 未タスク検出レポート | `outputs/phase-12/unassigned-tasks-report.md` | Markdown |

---

## 5. 完了条件チェックリスト

- [ ] Task 1: 実装ガイドが作成されている
- [ ] Task 2: システム仕様更新の要否が判断され、必要に応じて更新されている
- [ ] Task 3: ドキュメント更新履歴が作成されている
- [ ] Task 4: 未タスク検出レポートが作成されている（0件でも出力必須）

---

## 6. 次Phaseへの引き継ぎ事項

- 実装ガイド
- ドキュメント更新履歴
- 未タスク検出レポート

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-22 | 初版作成 |
