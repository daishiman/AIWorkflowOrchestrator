# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 12                         |
| Phase名    | ドキュメント更新           |
| 前提Phase  | Phase 11 (手動テスト)      |
| 後続Phase  | Phase 13 (PR作成)          |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | community-detection-leiden |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。また、スキルフィードバックを収集し、skill-creatorを通じてスキルの継続的改善を行う。

## 背景

コードだけでなく、アーキテクチャ決定理由、使い方、設計意図などをドキュメント化することで、長期的な保守性と知識の継承を確保する。また、ワークフロー実行中に発見した課題や改善点をスキルにフィードバックすることで、継続的な品質向上を図る。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: technical-documentation-guide

**パス**: `.claude/skills/technical-documentation-guide/SKILL.md`

**Trigger条件**:
技術ドキュメント（実装ガイド）の作成が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（実装ガイド）

---

### スキル2: skill-creator【必須】

**パス**: `.claude/skills/skill-creator/SKILL.md`

**Trigger条件**:
スキルフィードバック記録・改善・新規作成が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 各Phaseで使用したスキルのフィードバックを記録
3. 改善が必要なスキルを判定・更新
4. 新規スキルが必要な場合は作成

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`（スキルフィードバックレポート）
- 各スキルのLOGS.md更新

---

## 参照資料

| 参照資料              | パス                                                                                        | 内容                         |
| --------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 2成果物         | `outputs/phase-2/architecture-design.md`                                                    | アーキテクチャ               |
| Phase 3成果物         | `outputs/phase-3/design-review-result.md`                                                   | 設計レビュー結果             |
| Phase 10成果物        | `outputs/phase-10/gate-decision.md`                                                         | 最終レビュー結果             |
| Phase 11成果物        | `outputs/phase-11/manual-test-results.md`                                                   | 手動テスト結果               |
| 実装コード            | `packages/shared/src/services/graph/leiden-algorithm.ts`                                    | 実装                         |
| 実装コード            | `packages/shared/src/services/graph/community-detector.ts`                                  | 実装                         |
| 型定義                | `packages/shared/src/services/graph/types.ts`                                               | 型定義                       |
| RAGアーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                     | Knowledge Graph型定義        |
| Knowledge Graphストア | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | グラフストアインターフェース |

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

#### Part 1: 概念的説明に含めるべき内容

- Leidenアルゴリズムとは何か（比喩を使った説明）
- コミュニティ検出が必要な理由
- GraphRAGにおける役割

#### Part 2: 技術的詳細に含めるべき内容

- アーキテクチャ図（ASCII）
- API仕様
- 使用例とコードサンプル
- 設計決定の理由（なぜこの設計にしたか）
- 用語集

---

### Phase 12-2: システムドキュメント更新

更新対象と更新内容:

| 更新対象                                                 | 更新内容                   |
| -------------------------------------------------------- | -------------------------- |
| `docs/00-requirements/`                                  | コミュニティ検出機能の概要 |
| `.claude/skills/aiworkflow-requirements/references/*.md` | 新規インターフェース追加   |

**更新原則**: 概要のみ記載、Single Source of Truth遵守

---

### Phase 12-3: 未タスク検出【必須】

以下のソースから未完了タスクを検出し、レポートを出力する:

| #   | ソース                 | 確認項目                      | Grepパターン例                                |
| --- | ---------------------- | ----------------------------- | --------------------------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-3/`                            |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           | `outputs/phase-10/`                           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          | `outputs/phase-11/`                           |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`    |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME\|HACK\|XXX" packages/` |
| 6   | スキルLOGS.md          | partial/failure記録           | 各使用スキルのLOGS.md                         |

#### 検出時のアクション

検出された未タスクに対して、`docs/30-workflows/unassigned-task/` に指示書を作成する。

---

### Phase 12-4: スキルフィードバック・改善・新規作成【必須】

**skill-creator**を使用して、ワークフロー実行中に使用したスキルのフィードバックを記録・改善し、必要に応じて新規スキルを作成する。

#### 12-4-1: フィードバック収集

各Phaseで使用したスキルの実行結果を評価し記録する。

```bash
# フィードバック記録（各スキルごとに実行）
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill {{SKILL_NAME}} --result {{success|failure|partial}} --phase {{PHASE_NUMBER}}
```

#### 12-4-2: 既存スキル改善判定

skill-creatorで改善必要性を判定し、必要な場合は更新する。

```bash
# スキル更新（必要な場合）
node .claude/skills/skill-creator/scripts/detect_mode.mjs \
  --request "スキルを更新" --skill-path .claude/skills/{{SKILL_NAME}}
```

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

#### 改善・作成判定基準

| 条件                     | 判定         | アクション                     |
| ------------------------ | ------------ | ------------------------------ |
| 同じ問題が3回以上発生    | 既存改善     | ベストプラクティスに追加       |
| ワークフロー不足         | 既存改善     | Phase/アクション追加           |
| Trigger選定ミスが多発    | 既存改善     | Trigger条件見直し              |
| 成果物形式が不統一       | 既存改善     | テンプレート追加               |
| **既存スキルで対応不可** | **新規作成** | **skill-creator createモード** |
| **汎用的パターン発見**   | **新規作成** | **skill-creator createモード** |
| 上記以外                 | 保留         | LOGS.mdに記録のみ              |

---

## 本ワークフローで使用したスキル一覧

フィードバック記録対象:

| Phase | 使用スキル                                                                                    |
| ----- | --------------------------------------------------------------------------------------------- |
| 1     | requirements-engineering, acceptance-criteria-writing, functional-non-functional-requirements |
| 2     | architectural-patterns, domain-modeling, clean-architecture-principles                        |
| 3     | code-smell-detection                                                                          |
| 4     | tdd-principles, boundary-value-analysis, integration-testing                                  |
| 5     | clean-code-practices, error-handling-patterns, type-safety-patterns                           |
| 6     | test-coverage-analysis, integration-testing                                                   |
| 7     | test-coverage-analysis                                                                        |
| 8     | refactoring-patterns, code-smell-detection, solid-principles                                  |
| 9     | linting-formatting-automation, type-safety-patterns                                           |
| 10    | code-smell-detection, acceptance-criteria-writing                                             |
| 11    | acceptance-criteria-writing                                                                   |
| 12    | technical-documentation-guide, skill-creator                                                  |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] ドキュメント更新履歴が出力されている
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] **スキルフィードバックがskill-creatorで記録されている**【必須】
- [ ] スキル改善/新規作成が必要な場合、skill-creatorで実行されている
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/community-detection-leiden --phase 12
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている
- [ ] artifacts.jsonを更新

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13 へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

| スキル                        | 結果 | 備考 |
| ----------------------------- | ---- | ---- |
| technical-documentation-guide |      |      |
| skill-creator                 |      |      |

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-detection-leiden/phase-13-pr-creation.md`
