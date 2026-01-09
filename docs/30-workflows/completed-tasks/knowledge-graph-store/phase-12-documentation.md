# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 12                    |
| Phase名    | ドキュメント更新      |
| 前提Phase  | Phase 11              |
| 後続Phase  | Phase 13              |
| ステータス | 未実施                |
| 作成日     | 2026-01-08            |
| 機能名     | knowledge-graph-store |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。また、スキルフィードバックを収集し、skill-creatorを通じてスキルの継続的改善を行う。

## 背景

Knowledge Graphストアの実装内容を概念的・技術的にドキュメント化し、将来の保守性を高める。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: technical-documentation-guide

**パス**: `.claude/skills/technical-documentation-guide/SKILL.md`

**Trigger条件**:
技術ドキュメントの作成が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 実装ガイドを作成

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### スキル2: skill-creator

**パス**: `.claude/skills/skill-creator/SKILL.md`

**Trigger条件**:
スキルフィードバックの記録・改善が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 全Phaseで使用したスキルのフィードバックを記録
3. 必要に応じてスキル改善を実施

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

## サブフェーズ

### Phase 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                    |
| ------ | ---------------- | --------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（Knowledge Graphとは何か） |
| Part 2 | 開発者・技術者   | 技術的な詳細（API、型定義、使用例）     |

### Phase 12-2: システムドキュメント更新

- 更新対象: `docs/00-requirements/` 配下
- 更新対象: `.claude/skills/aiworkflow-requirements/references/`
- 更新原則: 概要のみ記載、Single Source of Truth遵守

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

各Phaseで使用したスキルの実行結果を評価し記録する。

```bash
# フィードバック記録
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill {{SKILL_NAME}} --result {{success|failure|partial}} --phase {{PHASE_NUMBER}}
```

---

## 成果物

| 成果物               | パス                                           | 必須 | 説明                      |
| -------------------- | ---------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | ✅   | 検出結果（なしでも出力）  |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`    | ✅   | スキル使用結果・改善提案  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成            |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] 関連ドキュメントが更新されている
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] **スキルフィードバックがskill-creatorで記録されている**【必須】
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 使用スキル

- technical-documentation-guide: {{result}}
- skill-creator: {{result}}

### 未タスク検出

- 検出数: {{数}}
- 作成した指示書数: {{数}}

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

`docs/30-workflows/knowledge-graph-store/phase-13-pr-creation.md`
