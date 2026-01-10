# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 12                 |
| Phase名    | ドキュメント更新   |
| 前提Phase  | Phase 11           |
| 後続Phase  | Phase 13           |
| ステータス | 未実施             |
| 作成日     | 2026-01-10         |
| 機能名     | slide-reverse-sync |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成する。未完了タスクを検出・記録し、スキルフィードバックを収集する。

## 背景

Phase 11までで実装と検証が完了した。この段階で技術ドキュメントを整備し、知識を形式化する。また、ワークフロー中に発見された未タスクを記録し、スキルの改善点を収集する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: technical-documentation-standards

**パス**: `.claude/skills/technical-documentation-standards/SKILL.md`

**選定理由**: 技術ドキュメントの作成を体系的に行うため。

**Trigger条件**:

- 技術ドキュメントの作成、実装ガイドの作成を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 実装ガイドを作成

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md` - 実装ガイド

---

### スキル2: skill-creator

**パス**: `.claude/skills/skill-creator/SKILL.md`

**選定理由**: スキルフィードバックの記録・改善、必要に応じて新規スキル作成を行うため。

**Trigger条件**:

- スキルフィードバックの記録、スキルの改善、新規スキル作成を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. フィードバック収集・改善判定を実施

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md` - スキルフィードバックレポート

---

## 参照資料

| 参照資料         | パス                                      | 内容           |
| ---------------- | ----------------------------------------- | -------------- |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`  | Phase 11成果物 |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Phase 10成果物 |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | Phase 3成果物  |

---

## サブフェーズ

### Phase 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

#### Part 1 構成

1. 逆同期機能とは何か
2. なぜ必要なのか
3. どのように動作するのか（図解）
4. 利用シナリオ

#### Part 2 構成

1. アーキテクチャ概要
2. コンポーネント設計
3. API仕様
4. データフロー
5. エラーハンドリング
6. 設定・カスタマイズ

---

### Phase 12-2: システムドキュメント更新

更新対象:

- `.claude/skills/aiworkflow-requirements/references/` 配下の関連ファイル
  - `interfaces-agent-sdk.md` - Agent SDK連携仕様
  - `api-endpoints.md` - IPC設計

更新原則: 概要のみ記載、Single Source of Truth遵守

---

### Phase 12-3: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |
| 6   | スキルLOGS.md          | partial/failure記録           |

---

### Phase 12-4: スキルフィードバック・改善【必須】

#### 12-4-1: フィードバック収集

各Phaseで使用したスキルの実行結果を評価し記録する:

| Phase | スキル                            | 結果       |
| ----- | --------------------------------- | ---------- |
| 1     | acceptance-criteria-writing       | {{result}} |
| 2     | domain-modeling                   | {{result}} |
| 2     | api-client-patterns               | {{result}} |
| 2     | electron-ipc-patterns             | {{result}} |
| 4     | tdd-principles                    | {{result}} |
| 4     | integration-testing               | {{result}} |
| 4     | boundary-value-analysis           | {{result}} |
| 5     | agent-lifecycle-management        | {{result}} |
| 5     | multi-agent-systems               | {{result}} |
| 5     | clean-code-practices              | {{result}} |
| 5     | error-handling-patterns           | {{result}} |
| 6     | test-coverage                     | {{result}} |
| 6     | integration-testing               | {{result}} |
| 7     | test-coverage                     | {{result}} |
| 8     | refactoring-patterns              | {{result}} |
| 8     | code-smell-detection              | {{result}} |
| 8     | solid-principles                  | {{result}} |
| 9     | agent-quality-standards           | {{result}} |
| 9     | security-configuration-review     | {{result}} |
| 11    | (手動テスト - スキル不使用)       | {{result}} |
| 12    | technical-documentation-standards | {{result}} |

#### 12-4-2: 改善判定基準

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

## 成果物

| 成果物               | パス                                           | 必須 | 内容                      |
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
- [ ] スキル改善が必要な場合、skill-creatorで更新が実行されている
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 11成果物の確認
2. technical-documentation-guideスキルの実行
3. 実装ガイドPart 1の作成
4. 実装ガイドPart 2の作成
5. システムドキュメント更新
6. 未タスク検出の実施
7. skill-creatorスキルの実行
8. スキルフィードバック収集
9. 改善判定・対応
10. 成果物の作成・配置
11. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-reverse-sync --phase 12
```

---

## スキルフィードバック記録（Phase完了後に記載）

```markdown
## Phase 12 実行記録

### 使用スキル

- technical-documentation-standards: {{result}}
- skill-creator: {{result}}

### ドキュメント作成結果

- 実装ガイドPart 1: {{完了/未完了}}
- 実装ガイドPart 2: {{完了/未完了}}
- システムドキュメント更新: {{完了/未完了}}

### 未タスク検出結果

- 検出数: {{COUNT}}件
- 指示書作成: {{COUNT}}件

### スキルフィードバック

- 改善対象スキル: {{COUNT}}件
- 新規作成スキル: {{COUNT}}件

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 13: PR作成

`docs/30-workflows/slide-reverse-sync/phase-13-pr-creation.md`
