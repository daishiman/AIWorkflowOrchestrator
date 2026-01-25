# Phase 12: ドキュメント更新 - TASK-3-1-A SDK query() 基本実装

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 12                    |
| Phase名    | ドキュメント更新      |
| 前提Phase  | Phase 11 (手動テスト) |
| 後続Phase  | Phase 13 (PR作成)     |
| ステータス | 未実施                |
| 作成日     | 2026-01-24            |
| 機能名     | TASK-3-1-A-sdk-query  |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

---

## 実行タスク

### Phase 12-1: 実装ガイド作成【必須】

**目的**: SkillExecutor の使用方法を文書化

**2パート構成**で作成する:

| パート | 対象読者         | 内容                             |
| ------ | ---------------- | -------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（スキル実行とは？） |
| Part 2 | 開発者・技術者   | API仕様・使用例・統合方法        |

**実行手順**:

1. Part 1: SkillExecutor の役割・動作の概念的説明を作成
2. Part 2: API リファレンス・コード例を作成
3. `outputs/phase-12/implementation-guide.md` に出力

### Phase 12-2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照

**2ステップで実行**:

#### Step 1: タスク完了記録【必須・全タスク】

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記

**更新対象**:

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`

**追加内容例**:

```markdown
## 完了タスク

### タスク: TASK-3-1-A SDK query() 基本実装（2026-01-XX完了）

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | TASK-3-1-A                                              |
| ステータス   | **完了**                                                |
| 実装ファイル | `apps/desktop/src/main/services/skill/SkillExecutor.ts` |

## 関連ドキュメント

- [実装ガイド](docs/30-workflows/skill-import-agent-system/tasks/TASK-3-1-A-sdk-query/outputs/phase-12/implementation-guide.md)
```

#### Step 2: システム仕様更新【条件付き】

**更新判断基準**:

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

**TASK-3-1-A の場合**:

- SkillExecutor クラスは新規追加 → 仕様書への記載が必要
- 更新対象: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`

### Phase 12-3: ドキュメント更新履歴作成【必須】

**目的**: 更新内容を documentation-changelog.md に記録

**成果物**: `outputs/phase-12/documentation-changelog.md`

### Phase 12-4: 未タスク検出【必須】

**目的**: 残課題の検出と記録（0件でも出力必須）

**確認ソース**:

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

**成果物**: `outputs/phase-12/unassigned-task-report.md`

---

## 参照資料

| 参照資料             | パス                                                                           | 内容           |
| -------------------- | ------------------------------------------------------------------------------ | -------------- |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                                       | Phase 11成果物 |
| 発見課題             | `outputs/phase-11/discovered-issues.md`                                        | Phase 11成果物 |
| Agent SDK仕様        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`    | 更新対象仕様書 |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新手順ガイド |

---

## 成果物

| 成果物               | パス                                          | 必須 | 説明                      |
| -------------------- | --------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  | ✅   | 検出結果（なしでも出力）  |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Phase 12-2 Step 1】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Phase 12-2 Step 1】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Phase 12-2 Step 1】変更履歴セクションにバージョンを追記した**
- [ ] **【Phase 12-2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 未タスク検出レポートテンプレート（0件の場合）

```markdown
# 未タスク検出レポート - TASK-3-1-A

## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| Phase 3レビュー  | 0件     |
| Phase 10レビュー | 0件     |
| Phase 11テスト   | 0件     |
| コードベース     | 0件     |
| **合計**         | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-3-1-A-sdk-query/phase-13-pr-creation.md`
