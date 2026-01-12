# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 12                        |
| Phase名    | ドキュメント更新          |
| 前提Phase  | Phase 11                  |
| 後続Phase  | Phase 13                  |
| ステータス | 未実施                    |
| 作成日     | 2026-01-12                |
| 機能名     | knowledge-graph-migration |

---

## 目的

ドキュメント更新・仕様反映・未タスク検出を行う。

## 背景

Phase 12では3つの必須作業を行う:

1. **実装ガイド作成**: 概念的説明と技術的詳細のドキュメント化
2. **システムドキュメント更新**: 既存ドキュメントへの反映（aiworkflow-requirements含む）
3. **未タスク検出**: 技術的負債の可視化と継続的改善

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成

**目的**: Knowledge Graphマイグレーションの実装内容をドキュメント化する

**実行手順**:

1. 概念的な説明を作成（Knowledge Graphとは何か、なぜ必要か）
2. 全体アーキテクチャをASCII図解で説明
3. 各テーブルの設計意図と関係性を記述
4. 用語集（Entity, Relation, Community等）を作成

**記述原則**:

- Why-first（なぜ優先）: 「何をしたか」より「なぜそうしたか」を重視
- 対比説明: 「悪い例」と「良い例」を並べて違いを明確化
- 図解活用: ASCII図でアーキテクチャ・データフロー・関係性を可視化

**期待される成果物**:

- 実装ガイド（`outputs/phase-12/implementation-guide.md`）

---

### タスク2: システムドキュメント更新

**目的**: aiworkflow-requirementsを含む既存ドキュメントを更新する

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/database-schema.md` にKnowledge Graphテーブルが記載されているか確認
2. 不足があれば追記・更新
3. `docs/00-requirements/` 配下の関連ドキュメントを確認・更新
4. 更新履歴を記録

**期待される成果物**:

- ドキュメント更新記録（`outputs/phase-12/documentation-update-log.md`）

---

### タスク3: 未タスク検出

**目的**: 技術的負債や将来対応が必要な項目を検出する

**実行手順**:

1. 各Phase成果物から「将来対応」「TODO」「FIXME」をGrep
2. Phase 3/9のMINOR判定項目を確認
3. Phase 11の手動テストで発見されたスコープ外事項を確認
4. コードベース内のTODO/FIXMEコメントを検出
5. 検出された未タスクに対して指示書を作成（該当する場合）

**Grepパターン例**:

```bash
grep -r "TODO\|FIXME\|将来対応" outputs/
grep -rn "TODO\|FIXME\|HACK\|XXX" packages/shared/src/db/
```

**期待される成果物**:

- 未タスク検出レポート（`outputs/phase-12/unassigned-task-report.md`）
- 未タスク指示書（該当時: `docs/30-workflows/unassigned-task/`）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                           | 内容           |
| -------------- | ------------------------------------------------------------------------------ | -------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-report.md`                                       | Phase 11成果物 |
| DB実装仕様     | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | 更新対象仕様   |
| DBスキーマ     | `.claude/skills/aiworkflow-requirements/references/database-schema.md`         | 更新対象仕様   |

---

## 成果物

| 成果物               | パス                                           | 内容           |
| -------------------- | ---------------------------------------------- | -------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | 概念・技術詳細 |
| ドキュメント更新記録 | `outputs/phase-12/documentation-update-log.md` | 更新履歴       |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | 検出結果       |
| 未タスク指示書       | `docs/30-workflows/unassigned-task/`           | 該当時のみ     |

---

## 実装ガイド構成

### Part 1: 概念的説明

| セクション | 必須 | 内容                                            |
| ---------- | ---- | ----------------------------------------------- |
| 概要       | ✅   | Knowledge Graphとは何か（中学生にもわかる説明） |
| なぜ必要か | ✅   | 背景と動機                                      |
| 全体像     | ✅   | ASCII図解付きのテーブル関係図                   |

### Part 2: 技術的詳細

| セクション       | 必須 | 内容                                |
| ---------------- | ---- | ----------------------------------- |
| テーブル設計     | ✅   | 各テーブルの役割と設計意図          |
| 外部キー設計     | ✅   | CASCADE動作の理由と注意点           |
| インデックス設計 | ✅   | パフォーマンス考慮点                |
| マイグレーション | ✅   | 生成・適用手順                      |
| 用語集           | ✅   | Entity, Relation, Community等の説明 |

---

## 完了条件

- [ ] 実装ガイド（Part 1 + Part 2）が作成されている
- [ ] ドキュメント更新記録が出力されている
- [ ] 未タスク検出レポートが出力されている
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] aiworkflow-requirementsが更新されている（該当する場合）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/knowledge-graph-migration --phase 12
```

---

## 依存関係

- **前提**: Phase 11（手動テスト検証）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## Phase実行記録（実行後に記入）

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 実行タスク

- 実装ガイド作成: {{結果}}
- システムドキュメント更新: {{結果}}
- 未タスク検出: {{結果}}

### ドキュメント更新内容

| 対象ファイル | 更新内容 |
| ------------ | -------- |
| -            | -        |

### 検出された未タスク

| #   | 内容 | 優先度 | 対応 |
| --- | ---- | ------ | ---- |
| 1   | -    | -      | -    |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/knowledge-graph-migration/phase-13-pr-creation.md`
