# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 12                                |
| Phase名    | ドキュメント更新                  |
| 前提Phase  | Phase 11                          |
| 後続Phase  | Phase 13                          |
| ステータス | 未実施                            |
| 作成日     | 2026-01-08                        |
| 機能名     | llm-ui-ipc-adapter-implementation |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。また、スキルフィードバックを収集し、skill-creatorを通じてスキルの継続的改善を行う。

## 背景

Phase 1-11で実装した内容をドキュメント化し、今後の保守・拡張に備える。また、未完了タスクを検出して継続的改善のサイクルを回す。

---

## 使用スキル

### スキル1: documentation-architecture

**パス**: `.claude/skills/documentation-architecture/SKILL.md`

**選定理由**: 技術ドキュメントの構造化を行うため

**Trigger条件**:

- ドキュメント作成
- 技術文書の構造化

**期待される成果物**:

- 実装ガイド

---

### スキル2: knowledge-management

**パス**: `.claude/skills/knowledge-management/SKILL.md`

**選定理由**: ナレッジの形式知化と共有を行うため

**Trigger条件**:

- ナレッジ整理
- 暗黙知の形式知化

**期待される成果物**:

- ナレッジ文書

---

### スキル3: skill-creator

**パス**: `.claude/skills/skill-creator/SKILL.md`

**選定理由**: スキルフィードバック記録・改善・新規作成を行うため【必須】

**Trigger条件**:

- スキルフィードバック記録
- スキル改善・新規作成

**期待される成果物**:

- スキルフィードバックレポート

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 仕様変更時に必ず以下のシステム仕様を確認し、ドキュメント更新を行ってください。

| 参照資料            | パス                                                                  | 内容                    |
| ------------------- | --------------------------------------------------------------------- | ----------------------- |
| LLMインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md` | LLM型定義・スキーマ仕様 |

### Phase 1-11成果物

| 参照資料       | パス                                         | 内容       |
| -------------- | -------------------------------------------- | ---------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | 要件       |
| 設計書         | `outputs/phase-2/`                           | 設計成果物 |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md`     | テスト結果 |

---

## 成果物

| 成果物               | パス                                           | 必須 | 内容                      |
| -------------------- | ---------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | ✅   | 検出結果（なしでも出力）  |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`    | ✅   | スキル使用結果・改善提案  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成            |

---

## サブフェーズ

### Phase 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**Part 1の内容**:

- LLMプロバイダー切り替えとは何か
- なぜこの機能が必要か
- どのように動作するか（比喩を使った説明）
- 用語集

**Part 2の内容**:

- アーキテクチャ概要（ASCII図）
- 各コンポーネントの詳細（UIコンポーネント、IPCハンドラー、アダプター）
- API仕様
- 使用例・コードサンプル
- 設計理由（Why）

### Phase 12-2: システムドキュメント更新

- 更新対象: `docs/00-requirements/` 配下
- 更新対象: `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`
- 更新原則: 概要のみ記載、Single Source of Truth遵守

**詳細フロー**: `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照

### Phase 12-3: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |
| 6   | スキルLOGS.md          | partial/failure記録           |

### Phase 12-4: スキルフィードバック・改善・新規作成【必須】

#### 12-4-1: フィードバック収集

各Phaseで使用したスキルの実行結果を評価し記録する。

```bash
# フィードバック記録
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill {{SKILL_NAME}} --result {{success|failure|partial}} --phase {{PHASE_NUMBER}}
```

#### 12-4-2: 既存スキル改善判定

| 条件                     | 判定         | アクション                     |
| ------------------------ | ------------ | ------------------------------ |
| 同じ問題が3回以上発生    | 既存改善     | ベストプラクティスに追加       |
| ワークフロー不足         | 既存改善     | Phase/アクション追加           |
| Trigger選定ミスが多発    | 既存改善     | Trigger条件見直し              |
| 成果物形式が不統一       | 既存改善     | テンプレート追加               |
| **既存スキルで対応不可** | **新規作成** | **skill-creator createモード** |
| **汎用的パターン発見**   | **新規作成** | **skill-creator createモード** |
| 上記以外                 | 保留         | LOGS.mdに記録のみ              |

#### 12-4-3: 新規スキル必要性判定【重要】

ワークフロー実行中に以下の状況が発生した場合、**新規スキル作成**を検討する:

| 検出条件           | 新規スキル作成の判断基準                     |
| ------------------ | -------------------------------------------- |
| 手動作業の繰り返し | 同じ手順を3回以上手動で実行した              |
| 既存スキル不在     | 必要なスキルが見つからず自前で対応した       |
| スキルの責務超過   | 1つのスキルに複数責務を詰め込んだ            |
| ドメイン知識の欠落 | 特定ドメインの専門知識が必要だった           |
| 再利用性の発見     | 他タスクでも使える汎用的な処理パターンを発見 |

#### 12-4-4: 新規スキル作成

新規スキルが必要と判定された場合、skill-creatorの**createモード**で作成する。

```bash
# 新規スキル作成
node .claude/skills/skill-creator/scripts/detect_mode.mjs \
  --request "{{NEW_SKILL_DESCRIPTION}}"

# 作成後の検証
node .claude/skills/skill-creator/scripts/validate_all.mjs \
  .claude/skills/{{NEW_SKILL_NAME}}

# スキルリスト更新
node .claude/skills/skill-creator/scripts/update_skill_list.mjs \
  --skill-path .claude/skills/{{NEW_SKILL_NAME}}
```

**詳細仕様**: `.claude/skills/task-specification-creator/references/feedback-flow.md` を参照

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] 関連ドキュメントが更新されている
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] **スキルフィードバックがskill-creatorで記録されている**【必須】
- [ ] スキル改善が必要な場合、skill-creatorで更新が実行されている
- [ ] 新規スキルが必要な場合、skill-creatorで作成が実行されている
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## スキルフィードバック記録

```markdown
## Phase 12 実行記録

### 使用スキル

- documentation-architecture: {{result}}
- knowledge-management: {{result}}
- skill-creator: {{result}}

### Phase 1-11 スキル使用サマリ

| Phase | 使用スキル                             | 結果       | 備考 |
| ----- | -------------------------------------- | ---------- | ---- |
| 1     | requirements-engineering               | {{result}} |      |
| 1     | acceptance-criteria-writing            | {{result}} |      |
| 1     | functional-non-functional-requirements | {{result}} |      |
| 2     | clean-architecture-principles          | {{result}} |      |
| 2     | electron-ipc-patterns                  | {{result}} |      |
| 2     | api-client-patterns                    | {{result}} |      |
| 2     | factory-patterns                       | {{result}} |      |
| 3     | approval-gates                         | {{result}} |      |
| 3     | code-smell-detection                   | {{result}} |      |
| 4     | tdd-principles                         | {{result}} |      |
| 4     | frontend-testing                       | {{result}} |      |
| 4     | integration-testing                    | {{result}} |      |
| 4     | test-doubles                           | {{result}} |      |
| 4     | boundary-value-analysis                | {{result}} |      |
| 5     | clean-code-practices                   | {{result}} |      |
| 5     | error-handling-patterns                | {{result}} |      |
| 5     | type-safety-patterns                   | {{result}} |      |
| 5     | electron-ipc-patterns                  | {{result}} |      |
| 6     | test-coverage                          | {{result}} |      |
| 6     | integration-testing                    | {{result}} |      |
| 6     | frontend-testing                       | {{result}} |      |
| 7     | test-coverage                          | {{result}} |      |
| 7     | integration-testing                    | {{result}} |      |
| 8     | refactoring-patterns                   | {{result}} |      |
| 8     | code-smell-detection                   | {{result}} |      |
| 8     | solid-principles                       | {{result}} |      |
| 9     | code-static-analysis-security          | {{result}} |      |
| 9     | performance-testing                    | {{result}} |      |
| 10    | approval-gates                         | {{result}} |      |
| 11    | accessibility-wcag                     | {{result}} |      |
| 11    | responsive-design                      | {{result}} |      |
| 11    | playwright-testing                     | {{result}} |      |

### 未タスク検出結果

- 検出数: {{count}}件
- 指示書作成: {{created_count}}件

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/llm-ui-ipc-adapter-implementation/phase-13-pr-creation.md`
