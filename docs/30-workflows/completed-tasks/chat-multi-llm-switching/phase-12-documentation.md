# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 12                       |
| Phase名    | ドキュメント更新         |
| 前提Phase  | Phase 11                 |
| 後続Phase  | Phase 13                 |
| ステータス | 未実施                   |
| 作成日     | 2026-01-07               |
| 機能名     | chat-multi-llm-switching |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 背景

実装した機能の理解を深めるためのドキュメントを作成し、技術的負債となりうる未完了タスクを可視化する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: tutorial-design

**パス**: `.claude/skills/tutorial-design/SKILL.md`

**Trigger条件**:
機能の使い方ドキュメントが必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### スキル2: api-documentation-best-practices

**パス**: `.claude/skills/api-documentation-best-practices/SKILL.md`

**Trigger条件**:
API仕様書の更新が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-12/documentation-update-log.md`

---

## 参照資料

| 参照資料       | パス                | 内容             |
| -------------- | ------------------- | ---------------- |
| Phase 1成果物  | `outputs/phase-1/`  | 要件定義         |
| Phase 2成果物  | `outputs/phase-2/`  | 設計             |
| Phase 3成果物  | `outputs/phase-3/`  | 設計レビュー結果 |
| Phase 9成果物  | `outputs/phase-9/`  | 品質レポート     |
| Phase 11成果物 | `outputs/phase-11/` | 手動テスト結果   |

---

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                 | 内容             |
| ---------------- | -------------------------------------------------------------------- | ---------------- |
| ドキュメント方針 | `.claude/skills/aiworkflow-requirements/references/documentation.md` | ドキュメント基準 |
| API設計          | `.claude/skills/aiworkflow-requirements/references/api-design.md`    | API設計          |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "documentation"`

---

## 成果物

| 成果物               | パス                                           | 必須 | 内容                      |
| -------------------- | ---------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成            |

---

## サブフェーズ

### Phase 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**ドキュメント要件**:

| セクション         | 必須 | 内容                                     |
| ------------------ | ---- | ---------------------------------------- |
| 概念的な説明       | ✅   | 中学生にもわかる比喩・例え話を使った説明 |
| 全体アーキテクチャ | ✅   | ASCII図解付きのレイヤー構造説明          |
| 各層の実装詳細     | ✅   | コード例 + 設計意図の説明                |
| 用語集             | ✅   | 専門用語の読み方・意味・コンテキスト     |

**記述原則**:

1. **Why-first（なぜ優先）**: 「何をしたか」より「なぜそうしたか」を重視
2. **対比説明**: 「悪い例」と「良い例」を並べて違いを明確化
3. **図解活用**: ASCII図でアーキテクチャ・データフロー・関係性を可視化
4. **コード注釈**: コードスニペットには必ず日本語コメントで意図を補足
5. **読み方併記**: 英語の専門用語にはカタカナ読みを付記

---

### Phase 12-2: システムドキュメント更新

- 更新対象: `docs/00-requirements/` 配下
- 更新対象: `.claude/skills/aiworkflow-requirements/references/`
- 更新原則: 概要のみ記載、Single Source of Truth遵守

---

### Phase 12-3: 未タスク検出【必須】

| #   | ソース               | 確認項目                      | Grepパターン例                                      |
| --- | -------------------- | ----------------------------- | --------------------------------------------------- |
| 1   | Phase 3レビュー結果  | MINOR判定の指摘事項           | `outputs/phase-3/`                                  |
| 2   | Phase 10レビュー結果 | MINOR判定の指摘事項           | `outputs/phase-10/`                                 |
| 3   | Phase 11手動テスト   | スコープ外の発見事項          | `outputs/phase-11/`                                 |
| 4   | 各Phase成果物        | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`          |
| 5   | コードベース         | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME\|HACK\|XXX" packages/ apps/` |
| 6   | スキルLOGS.md        | partial/failure記録           | 各使用スキルのLOGS.md                               |

**未タスク指示書作成基準**:

検出された課題が以下に該当する場合、未タスク指示書を作成:

- [ ] 本タスクのスコープ外だが重要
- [ ] 将来的な技術的負債になりうる
- [ ] ユーザー体験に影響する改善点
- [ ] セキュリティ/パフォーマンスの改善余地

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] 関連ドキュメントが更新されている
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. tutorial-designスキルの実行
3. api-documentation-best-practicesスキルの実行
4. Phase 12-1: 実装ガイド作成（Part 1 + Part 2）
5. Phase 12-2: システムドキュメント更新
6. Phase 12-3: 未タスク検出
7. 成果物の作成・配置
8. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/chat-multi-llm-switching --phase 12
```

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

- tutorial-design: {{result}}
- api-documentation-best-practices: {{result}}

### ドキュメント作成状況

- 実装ガイド Part 1（概念的説明）: {{完了/未完了}}
- 実装ガイド Part 2（技術的詳細）: {{完了/未完了}}
- 用語集: {{完了/未完了}}

### 未タスク検出結果

- 検出数: {{number}}
- 指示書作成数: {{number}}

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

`docs/30-workflows/chat-multi-llm-switching/phase-13-pr-creation.md`
