# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 12                             |
| Phase名    | ドキュメント更新               |
| 前提Phase  | Phase 11                       |
| 後続Phase  | Phase 13                       |
| ステータス | 未実施                         |
| 作成日     | 2026-01-07                     |
| 機能名     | CONV-06-05-relation-extraction |

---

## 目的

実装内容のドキュメント化、未タスクの検出と指示書作成を行う。

## 背景

Phase 12では4つの必須作業を行う：

1. **実装ガイド作成**: 概念的説明と技術的詳細のドキュメント化
2. **システムドキュメント更新**: 既存ドキュメントへの反映
3. **未タスク検出**: 技術的負債の可視化と継続的改善
4. **スキルフィードバック・改善・新規作成**: skill-creatorによる継続的スキル改善

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: technical-documentation-guide

**パス**: `.claude/skills/technical-documentation-guide/SKILL.md`

**Trigger条件**: 技術ドキュメントの作成が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 実装ガイドを作成
3. API仕様を文書化

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/documentation-update-log.md`

### スキル2: skill-creator【必須】

**パス**: `.claude/skills/skill-creator/SKILL.md`

**Trigger条件**: スキルフィードバックの記録、既存スキルの改善、新規スキル作成が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 各Phaseで使用したスキルのフィードバックを記録
3. 改善が必要なスキルを特定し、updateモードで更新
4. 新規スキルが必要な場合はcreateモードで作成

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`
- 各スキルのLOGS.md更新
- （該当時）新規/更新されたスキル

---

## 参照資料

| 参照資料       | パス                                                            | 内容         |
| -------------- | --------------------------------------------------------------- | ------------ |
| Phase 5成果物  | `packages/shared/src/services/extraction/relation-extractor.ts` | 実装コード   |
| Phase 3成果物  | `outputs/phase-3/design-review-result.md`                       | レビュー結果 |
| Phase 10成果物 | `outputs/phase-10/final-review-result.md`                       | レビュー結果 |
| Phase 11成果物 | `outputs/phase-11/manual-test-result.md`                        | テスト結果   |

---

## 成果物

| 成果物               | パス                                           | 必須 | 内容                     |
| -------------------- | ---------------------------------------------- | ---- | ------------------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | ✅   | 技術ドキュメント         |
| ドキュメント更新記録 | `outputs/phase-12/documentation-update-log.md` | ✅   | 更新内容の記録           |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | ✅   | 検出結果                 |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`    | ✅   | スキル使用結果・改善提案 |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成           |

---

## Phase 12-1: 実装ガイド作成

### ドキュメント要件

| セクション         | 必須 | 内容                                     |
| ------------------ | ---- | ---------------------------------------- |
| 概念的な説明       | ✅   | 中学生にもわかる比喩・例え話を使った説明 |
| 全体アーキテクチャ | ✅   | ASCII図解付きのレイヤー構造説明          |
| 各層の実装詳細     | ✅   | コード例 + 設計意図の説明                |
| 用語集             | ✅   | 専門用語の読み方・意味・コンテキスト     |

### 記述原則

1. **Why-first（なぜ優先）**: 「何をしたか」より「なぜそうしたか」を重視
2. **対比説明**: 「悪い例」と「良い例」を並べて違いを明確化
3. **図解活用**: ASCII図でアーキテクチャ・データフロー・関係性を可視化
4. **コード注釈**: コードスニペットには必ず日本語コメントで意図を補足
5. **読み方併記**: 英語の専門用語にはカタカナ読みを付記

---

## Phase 12-2: システムドキュメント更新

### 更新対象

| ドキュメント | パス                                                 | 更新内容               |
| ------------ | ---------------------------------------------------- | ---------------------- |
| システム要件 | `docs/00-requirements/`                              | 関係抽出機能の概要追加 |
| API仕様      | `.claude/skills/aiworkflow-requirements/references/` | IRelationExtractor仕様 |

### 更新原則

- **概要のみ記載**: 詳細は実装ガイドを参照
- **Single Source of Truth遵守**: 重複記載を避ける
- **変更履歴を記録**: documentation-update-log.mdに記載

---

## Phase 12-3: 未タスク検出

### 検出ソース

| ソース                 | 確認項目                      | Grepパターン例                                |
| ---------------------- | ----------------------------- | --------------------------------------------- |
| Phase 3レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-3/`                            |
| Phase 10レビュー結果   | MINOR判定の指摘事項           | `outputs/phase-10/`                           |
| Phase 11手動テスト結果 | スコープ外の発見事項          | `outputs/phase-11/`                           |
| 各Phase成果物          | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`    |
| コードベース           | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME\|HACK\|XXX" packages/` |
| スキルLOGS.md          | partial/failure記録           | 各使用スキルのLOGS.md                         |

### 検出コマンド

```bash
# コードコメントからTODO/FIXMEを検出
grep -rn "TODO\|FIXME\|HACK\|XXX" packages/shared/src/services/extraction/

# 成果物から将来対応を検出
grep -r "将来対応\|TODO\|FIXME" docs/30-workflows/CONV-06-05-relation-extraction/outputs/
```

### 未タスク指示書の作成

検出された未タスクは以下に指示書を作成:

```
docs/30-workflows/unassigned-task/task-{{CATEGORY}}-{{FEATURE_NAME}}.md
```

---

## Phase 12-4: スキルフィードバック・改善・新規作成【必須】

**skill-creator**を使用して、ワークフロー実行中に使用したスキルのフィードバックを記録・改善し、必要に応じて新規スキルを作成する。

### 12-4-1: フィードバック収集

各Phaseで使用したスキルの実行結果を評価し記録する。

```bash
# フィードバック記録
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill {{SKILL_NAME}} --result {{success|failure|partial}} --phase {{PHASE_NUMBER}}
```

### 12-4-2: 既存スキル改善判定

skill-creatorで改善必要性を判定し、必要な場合は更新する。

```bash
# スキル更新（必要な場合）
node .claude/skills/skill-creator/scripts/detect_mode.mjs \
  --request "スキルを更新" --skill-path .claude/skills/{{SKILL_NAME}}
```

### 12-4-3: 新規スキル必要性判定

ワークフロー実行中に以下の状況が発生した場合、**新規スキル作成**を検討する:

| 検出条件           | 新規スキル作成の判断基準                     |
| ------------------ | -------------------------------------------- |
| 手動作業の繰り返し | 同じ手順を3回以上手動で実行した              |
| 既存スキル不在     | 必要なスキルが見つからず自前で対応した       |
| スキルの責務超過   | 1つのスキルに複数責務を詰め込んだ            |
| ドメイン知識の欠落 | 特定ドメインの専門知識が必要だった           |
| 再利用性の発見     | 他タスクでも使える汎用的な処理パターンを発見 |

### 12-4-4: 新規スキル作成

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

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明 + Part 2: 技術的詳細）が作成されている
- [ ] ドキュメント更新記録が出力されている
- [ ] 未タスク検出レポートが出力されている
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] **スキルフィードバックがskill-creatorで記録されている**【必須】
- [ ] スキル改善/新規作成が必要な場合、skill-creatorで実行されている
- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 11（手動テスト検証）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Phase 12-1: 実装ガイド作成（technical-documentation-guide使用）
3. Phase 12-2: システムドキュメント更新
4. Phase 12-3: 未タスク検出
5. Phase 12-4: スキルフィードバック・改善・新規作成（skill-creator使用）
6. 成果物の作成・配置（outputs/phase-12/）
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/CONV-06-05-relation-extraction --phase 12
```

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 使用スキル

- technical-documentation-guide: [success/failure/partial]
- skill-creator: [success/failure/partial]

### ドキュメント作成

- 実装ガイド Part 1（概念的説明）: [作成済み/未作成]
- 実装ガイド Part 2（技術的詳細）: [作成済み/未作成]
- ドキュメント更新記録: [作成済み/未作成]
- 未タスク検出: [数値]件

### スキルフィードバック・改善

- フィードバック記録: [完了/未完了]
- 既存スキル改善: [数値]件
- 新規スキル作成: [数値]件

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

`docs/30-workflows/CONV-06-05-relation-extraction/phase-13-pr-creation.md`
