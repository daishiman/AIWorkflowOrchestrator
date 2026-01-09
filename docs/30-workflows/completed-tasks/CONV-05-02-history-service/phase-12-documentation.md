# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 12                         |
| Phase名    | ドキュメント更新           |
| 前提Phase  | Phase 11 (手動テスト検証)  |
| 後続Phase  | Phase 13 (PR作成)          |
| ステータス | 未実施                     |
| 作成日     | 2026-01-08                 |
| 機能名     | CONV-05-02-history-service |

---

## 目的

実装内容のドキュメント化、システムドキュメント更新、未タスク検出、スキルフィードバック・改善・新規作成を行う。

## 背景

実装完了後、知識の形式化と継続的改善のためのドキュメント整備を行う。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: documentation-architecture

**パス**: `.claude/skills/documentation-architecture/SKILL.md`

**Trigger条件**:

- ドキュメント構造設計・作成が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/documentation-update-log.md`

---

### スキル2: skill-creator【必須】

**パス**: `.claude/skills/skill-creator/SKILL.md`

**Trigger条件**:

- スキルフィードバック記録・改善・新規作成が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「record-feedback」タスクに従って実行
3. 必要に応じて「update」または「create」モードを実行

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`
- 各スキルのLOGS.md更新
- （該当時）スキル改善実施レポート
- （該当時）新規スキル作成レポート

---

## 参照資料

| 参照資料           | パス                                         | 内容             |
| ------------------ | -------------------------------------------- | ---------------- |
| 実装コード         | `packages/shared/src/services/history/`      | ドキュメント対象 |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | 要件情報         |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | 設計情報         |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md`     | テスト結果       |

---

## 成果物

| 成果物                           | パス                                           | 内容                     |
| -------------------------------- | ---------------------------------------------- | ------------------------ |
| 実装ガイド                       | `outputs/phase-12/implementation-guide.md`     | 概念的説明・技術的詳細   |
| ドキュメント更新記録             | `outputs/phase-12/documentation-update-log.md` | 更新したドキュメント一覧 |
| 未タスク検出レポート             | `outputs/phase-12/unassigned-task-report.md`   | 検出された未タスク       |
| スキルフィードバックレポート     | `outputs/phase-12/skill-feedback-report.md`    | スキル実行結果・改善提案 |
| スキル改善実施レポート（該当時） | `outputs/phase-12/skill-improvement-report.md` | 改善したスキルの一覧     |
| 新規スキル作成レポート（該当時） | `outputs/phase-12/new-skill-report.md`         | 作成した新規スキルの一覧 |

---

## Phase 12の4つの必須作業

### 12-1: 実装ガイド作成

実装した内容を「概念的な説明」と「技術的な詳細」の両面からドキュメント化する。

#### ドキュメント要件

| セクション         | 必須 | 内容                                     |
| ------------------ | ---- | ---------------------------------------- |
| 概念的な説明       | ✅   | 中学生にもわかる比喩・例え話を使った説明 |
| 全体アーキテクチャ | ✅   | ASCII図解付きのレイヤー構造説明          |
| 各層の実装詳細     | ✅   | コード例 + 設計意図の説明                |
| 用語集             | ✅   | 専門用語の読み方・意味・コンテキスト     |

---

### 12-2: システムドキュメント更新【詳細手順】

タスク完了時、システム仕様に変更が必要な場合は `aiworkflow-requirements` スキルを更新する。

#### 更新トリガー

| 変更種別           | 更新対象                                  |
| ------------------ | ----------------------------------------- |
| APIエンドポイント  | `references/api-*.md`                     |
| データベース       | `references/database-*.md`                |
| UI/UX              | `references/ui-ux-*.md`                   |
| アーキテクチャ     | `references/architecture-*.md`            |
| インターフェース   | `references/interfaces-*.md`              |
| セキュリティ       | `references/security-*.md`                |
| 新機能（要件追加） | 該当するreferences/ファイルまたは新規作成 |

#### 更新フロー

```
[仕様変更有り？]
    ↓ Yes
aiworkflow-requirements/references/{{該当ファイル}}.md を編集
    ↓
インデックス再生成
    ↓
node .claude/skills/aiworkflow-requirements/scripts/generate-index.mjs
```

#### 新規仕様の追加手順（該当する場合）

```bash
# 1. テンプレートをコピー
cp .claude/skills/aiworkflow-requirements/assets/spec-template.md \
   .claude/skills/aiworkflow-requirements/references/{prefix}-{topic}.md

# 2. 内容を記述（spec-guidelines.md参照）

# 3. インデックス再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.mjs
```

---

### 12-3: 未タスク検出【必須チェックリスト】

以下の**すべてのソース**から未タスクを必ず検出すること:

| ソース                  | 確認項目                      | Grepパターン例                                | 必須 |
| ----------------------- | ----------------------------- | --------------------------------------------- | ---- |
| Phase 3レビュー結果     | MINOR判定の指摘事項           | `outputs/phase-3/`                            | ✅   |
| Phase 10レビュー結果    | MINOR判定の指摘事項           | `outputs/phase-10/`                           | ✅   |
| Phase 11手動テスト結果  | スコープ外の発見事項          | `outputs/phase-11/`                           | ✅   |
| 各Phase成果物           | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`    | ✅   |
| **使用スキルのLOGS.md** | **partial/failure記録**       | 各使用スキルのLOGS.md                         | ✅   |
| コードベース            | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME\|HACK\|XXX" packages/` | ✅   |

#### 品質基準（Why/What/How）

| カテゴリ | 項目                       | 基準                                         |
| -------- | -------------------------- | -------------------------------------------- |
| Why      | 背景が明確                 | このタスクが必要になった経緯が説明されている |
| Why      | 問題点が具体的             | 現状の問題が定量的/定性的に説明されている    |
| What     | 目的が具体的               | 達成すべきことが一意に解釈できる             |
| What     | スコープが明確             | 含む/含まないが明記されている                |
| How      | 使用スキルが選定されている | タスクに適したスキルが選定されている         |
| How      | 完了条件が検証可能         | チェックリスト形式で確認可能                 |

---

### 12-4: スキルフィードバック・改善・新規作成【必須】

**skill-creator**を使用して、ワークフロー実行中に使用したスキルのフィードバックを記録・改善し、必要に応じて新規スキルを作成する。

#### 12-4-1: フィードバック収集

各Phaseで使用したスキルの実行結果を評価し記録する。

```bash
# フィードバック記録（各スキルごとに実行）
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill {{SKILL_NAME}} --result {{success|failure|partial}} --phase {{PHASE_NUMBER}}
```

**評価基準:**

| 評価    | 基準                                           |
| ------- | ---------------------------------------------- |
| success | スキルの指示通りに実行し、期待通りの成果を得た |
| partial | 実行できたが、一部期待と異なる結果があった     |
| failure | スキルの指示が不明確で実行できなかった         |

#### 12-4-2: 既存スキル改善判定【必須】

**改善判定条件:**

| 条件                  | 判定 | アクション               |
| --------------------- | ---- | ------------------------ |
| 同じ問題が3回以上発生 | 改善 | ベストプラクティスに追加 |
| ワークフロー不足      | 改善 | Phase/アクション追加     |
| Trigger選定ミスが多発 | 改善 | Trigger条件見直し        |
| 成果物形式が不統一    | 改善 | テンプレート追加         |
| 上記以外              | 保留 | LOGS.mdに記録のみ        |

```bash
# スキル更新（改善が必要な場合）
node .claude/skills/skill-creator/scripts/detect_mode.mjs \
  --request "スキルを更新" --skill-path .claude/skills/{{SKILL_NAME}}

# スキル仕様準拠チェック
node .claude/skills/skill-creator/scripts/quick_validate.mjs .claude/skills/{{SKILL_NAME}}
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

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明 + Part 2: 技術的詳細）が作成されている
- [ ] ドキュメント更新記録が出力されている
- [ ] **システム仕様変更がある場合、aiworkflow-requirementsが更新されている**
- [ ] 未タスク検出レポートが出力されている（全ソースを確認）
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] **スキルフィードバックがskill-creatorで記録されている**【必須】
- [ ] **スキル改善/新規作成が必要な場合、skill-creatorで実行されている**
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックがskill-creatorで記録されている
- [ ] スキル改善/新規作成の判定が完了している

---

## 依存関係

- **前提**: Phase 5, 8, 9, 10, 11 が完了していること
- **後続**: Phase 13 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 使用スキル

| スキル                     | 結果                        | 備考     |
| -------------------------- | --------------------------- | -------- |
| documentation-architecture | {{success/partial/failure}} | {{備考}} |
| skill-creator              | {{success/partial/failure}} | {{備考}} |

### 成果物

- 実装ガイド: {{作成/未作成}}
- ドキュメント更新記録: {{作成/未作成}}
- 未タスク検出レポート: {{作成/未作成}}
- スキルフィードバックレポート: {{作成/未作成}}
- システム仕様更新: {{実施/不要}}

### 12-4実行結果

- フィードバック収集: {{完了/未完了}}
- 既存スキル改善判定: {{改善実施/改善不要}}
- 新規スキル必要性判定: {{作成実施/作成不要}}

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

`docs/30-workflows/CONV-05-02-history-service/phase-13-pr-creation.md`
