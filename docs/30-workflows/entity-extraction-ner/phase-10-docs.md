# Phase 10: ドキュメント更新 & 未タスク検出 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 10                              |
| Phase名    | ドキュメント更新 & 未タスク検出 |
| 前提Phase  | Phase 9 (手動テスト)            |
| 後続Phase  | Phase 11 (PR作成)               |
| ステータス | 完了                            |
| 作成日     | 2026-01-05                      |
| 機能名     | entity-extraction-ner           |

---

## 目的

1. **未タスク検出**: 技術的負債の可視化と継続的改善のための未完了タスクを特定
2. **実装ガイド作成**: 概念的説明と技術的詳細の両面からドキュメント化
3. **システム仕様更新**: aiworkflow-requirementsとの整合性確保

## 背景

Phase 10は実装完了後の重要なドキュメント化フェーズ。Phase 3/8/9のレビューで発見されたMINOR判定の課題や、コード中のTODO/FIXMEを追跡可能な形で記録し、今後の改善に繋げる。

---

## Part A: 未タスク検出【必須】

### 確認チェックリスト

| #   | ソース                | 確認項目                      | Grepパターン/パス                                                            | 必須 |
| --- | --------------------- | ----------------------------- | ---------------------------------------------------------------------------- | ---- |
| 1   | Phase 3レビュー結果   | MINOR判定の指摘事項           | `outputs/phase-3/design-review.md`                                           | ✅   |
| 2   | Phase 8レビュー結果   | MINOR判定の指摘事項           | `outputs/phase-8/`                                                           | ✅   |
| 3   | Phase 9手動テスト結果 | スコープ外の発見事項          | `outputs/phase-9/`                                                           | ✅   |
| 4   | 各Phase成果物         | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/`                                   | ✅   |
| 5   | コードベース          | TODO/FIXME/HACK/XXXコメント   | `grep -rn "TODO\|FIXME\|HACK\|XXX" packages/shared/src/services/extraction/` | ✅   |
| 6   | 使用スキルのLOGS.md   | partial/failure記録の改善提案 | 各使用スキルのLOGS.md                                                        | ✅   |

### 検出実行手順

```bash
# 1. Phase 3/8/9レビュー結果のMINOR判定を確認
grep -i "MINOR\|minor\|改善提案" outputs/phase-3/design-review.md
grep -i "MINOR\|minor\|改善提案" outputs/phase-8/*.md
grep -i "スコープ外\|将来対応\|推奨事項" outputs/phase-9/*.md

# 2. outputs/配下のTODO/FIXME検索
grep -rn "TODO\|FIXME\|将来対応\|今後の課題" outputs/

# 3. 実装コードのTODO/FIXME/HACK/XXX検索
grep -rn "TODO\|FIXME\|HACK\|XXX" packages/shared/src/services/extraction/

# 4. 使用スキルのLOGS.md確認（partial/failure）
cat .claude/skills/tdd-principles/LOGS.md | grep -i "partial\|failure"
cat .claude/skills/zod-validation/LOGS.md | grep -i "partial\|failure"
```

### 未タスク分類基準

| 分類           | 基準                     | 優先度 |
| -------------- | ------------------------ | ------ |
| 技術的負債     | コード品質・保守性の課題 | P2     |
| 機能拡張       | スコープ外だが有用な機能 | P3     |
| パフォーマンス | 性能改善の余地           | P3     |
| テスト         | テストカバレッジ・網羅性 | P2     |
| ドキュメント   | 文書化の不足             | P3     |

### 未タスク指示書生成（該当する場合）

検出された未タスクが以下の条件を満たす場合、未タスク指示書を生成:

- 独立したタスクとして実行可能
- 現タスクのスコープ外
- 優先度P2以上

**生成先**: `docs/30-workflows/unassigned-task/task-XX-XX-{{タスク名}}.md`

**テンプレート**: See `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`

---

## Part B: 実装ガイド作成【必須】

### ドキュメント構成

実装ガイドは以下の2部構成で作成する:

#### Part 1: 概念的な説明（中学生でもわかる版）

| セクション                   | 内容                       | 必須 |
| ---------------------------- | -------------------------- | ---- |
| 1.1 身近な例で考えてみよう   | 日常の例えを使った機能説明 | ✅   |
| 1.2 なぜ必要なの？           | 課題と解決策の説明         | ✅   |
| 1.3 どうやって動くの？       | 処理フローの平易な説明     | ✅   |
| 1.4 何ができるようになるの？ | 具体的なメリット           | ✅   |

**例**:

```markdown
## 1. エンティティ抽出って何？

### 1.1 身近な例で考えてみよう

図書館の司書さんを想像してください。新しい本が届くと、司書さんは：

- 著者名を見つける（人名）
- 出版社を確認する（組織名）
- 発売日をチェックする（日付）

エンティティ抽出サービスは、この司書さんと同じことをテキストに対して行います。
```

#### Part 2: 技術的な詳細（開発者向け）

| セクション               | 内容                        | 必須 |
| ------------------------ | --------------------------- | ---- |
| 2.1 アーキテクチャ概要   | ASCII図解付きのレイヤー構造 | ✅   |
| 2.2 データベース設計     | テーブル定義 + 設計理由     | 条件 |
| 2.3 各層の実装詳細       | コード例 + 設計意図         | ✅   |
| 2.4 インターフェース仕様 | 入出力の型定義              | ✅   |
| 2.5 エラーハンドリング   | エラー種別と対処法          | ✅   |
| 2.6 パフォーマンス考慮   | 最適化ポイント              | ✅   |
| 2.7 拡張ポイント         | カスタマイズ方法            | ✅   |
| 2.8 用語集               | 専門用語の読み方・意味      | ✅   |

### 記述原則

| 原則       | 説明                                 | 例                                       |
| ---------- | ------------------------------------ | ---------------------------------------- |
| Why-first  | 「何をしたか」より「なぜそうしたか」 | 「配列ではなくMapを使用→O(1)検索のため」 |
| 対比説明   | 悪い例と良い例を並べる               | 「❌ any型」vs「✅ 厳密な型定義」        |
| 図解活用   | ASCII図でアーキテクチャを可視化      | レイヤー図、データフロー図               |
| コード注釈 | 日本語コメントで意図を補足           | `// 重複排除のためMapを使用`             |
| 読み方併記 | 英語用語にカタカナ読み               | Entity（エンティティ）                   |

### 用語集テンプレート

```markdown
## 8. 用語集

| 用語       | 読み方                | 意味                     | このプロジェクトでの使用例 |
| ---------- | --------------------- | ------------------------ | -------------------------- |
| Entity     | エンティティ          | 識別可能な実体           | 人名、組織名、技術名など   |
| NER        | ナー / エヌイーアール | Named Entity Recognition | エンティティ抽出処理全体   |
| Chunk      | チャンク              | テキストの断片           | 分割されたドキュメント     |
| Confidence | コンフィデンス        | 信頼度スコア             | 0.0〜1.0の数値             |
| Mention    | メンション            | テキスト内での出現       | エンティティの出現位置情報 |
```

---

## Part C: システム仕様更新【必須】

### aiworkflow-requirements参照

> 実装による仕様変更がある場合、aiworkflow-requirementsを更新する。

| 参照資料         | パス                                                                   | 確認内容                 |
| ---------------- | ---------------------------------------------------------------------- | ------------------------ |
| API仕様          | `.claude/skills/aiworkflow-requirements/references/api-design.md`      | 新規APIの追加が必要か    |
| データベース仕様 | `.claude/skills/aiworkflow-requirements/references/database-schema.md` | 新規テーブルの追加       |
| システム概要     | `.claude/skills/aiworkflow-requirements/references/system-overview.md` | アーキテクチャ変更の有無 |

### その他更新対象

> aiworkflow-requirements以外にも、以下のリソースが更新対象となる可能性がある。

| リソース種別       | 更新条件                                           | 参照パス                           |
| ------------------ | -------------------------------------------------- | ---------------------------------- |
| Agentファイル      | 新規エージェントの追加、既存エージェントの責務変更 | `.claude/agents/*.md`              |
| Assetファイル      | 新規テンプレートの追加、既存テンプレートの更新     | `.claude/skills/*/assets/*.md`     |
| SKILL.mdファイル   | スキル仕様の変更、ベストプラクティスの追加         | `.claude/skills/*/SKILL.md`        |
| Referencesファイル | リファレンス情報の追加・更新                       | `.claude/skills/*/references/*.md` |

### 仕様更新フロー

```
Phase 10: ドキュメント更新
    ↓
[仕様変更あり？]
    ↓ Yes
aiworkflow-requirements/references/{{該当ファイル}}.md を編集
    ↓
インデックス再生成（該当する場合）
```

**詳細フロー**: See `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

### 今回の更新対象

| 仕様書             | 更新内容                                                  | 必須 |
| ------------------ | --------------------------------------------------------- | ---- |
| database-schema.md | エンティティ関連テーブル（entities, entity_mentions）追加 | ✅   |
| api-design.md      | エンティティ抽出APIエンドポイント追加                     | ✅   |

---

## Part D: スキルフィードバック & 改善【必須】

> **重要**: スキルの継続的改善はPhase 10の必須プロセス。省略禁止。

### 参照仕様

| 参照資料             | パス                                                                      | 内容                       |
| -------------------- | ------------------------------------------------------------------------- | -------------------------- |
| スキルフィードバック | `.claude/skills/task-specification-creator/agents/skill-feedback-loop.md` | フィードバック収集プロセス |
| フィードバックフロー | `.claude/skills/task-specification-creator/references/feedback-flow.md`   | Step 1-7の詳細プロセス     |
| skill-creatorスキル  | `.claude/skills/skill-creator/SKILL.md`                                   | スキル更新の実行方法       |

### フィードバックプロセス（Step 1-7）

```
┌──────────────────────────────────────────────────────────────┐
│                    タスク実行フェーズ                         │
├──────────────────────────────────────────────────────────────┤
│  Phase 1 → Phase 2 → ... → Phase 10 → Phase 11              │
│      ↓         ↓               ↓                            │
│  [スキル使用記録を蓄積]                                       │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    フィードバック収集                         │
├──────────────────────────────────────────────────────────────┤
│  Step 1. 使用スキル一覧の整理                                 │
│  Step 2. 各スキルの実行結果評価                               │
│  Step 3. 問題点・改善点の特定                                 │
│  Step 4. 改善提案作成                                         │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                    skill-creator 呼び出し                     │
├──────────────────────────────────────────────────────────────┤
│  Step 5. skill-creator: record-feedback 実行                 │
│  入力: 使用スキル、結果、問題点、改善提案                      │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────┬────────────────────────────┐
│  Step 6. LOGS.md 更新           │  Step 7. SKILL.md 改善判定 │
├─────────────────────────────────┼────────────────────────────┤
│ - 実行日時                      │ [改善が必要?]               │
│ - コンテキスト                  │   ├── Yes → SKILL.md更新   │
│ - 結果                          │   └── No → 完了            │
│ - 発見事項                      │                            │
└─────────────────────────────────┴────────────────────────────┘
```

### 結果評価基準

| 評価    | 基準                                           |
| ------- | ---------------------------------------------- |
| success | スキルの指示通りに実行し、期待通りの成果を得た |
| partial | 実行できたが、一部期待と異なる結果があった     |
| failure | スキルの指示が不明確で実行できなかった         |
| n/a     | スキルの適用が不適切だった                     |

### 問題点特定の観点

| 観点               | チェック項目                                     |
| ------------------ | ------------------------------------------------ |
| ワークフローの問題 | Phase/アクションの順序、必要ステップの欠落       |
| 説明の問題         | 指示の曖昧さ、前提条件の明記、成果物形式の不明確 |
| Trigger条件の問題  | スキル選定の迷い、他スキルとの境界不明確         |
| リソースの問題     | agents/の説明不足、references/の情報陳腐化       |

### Step 7: SKILL.md改善判定【重要】

> 以下の条件に該当する場合、**skill-creatorを経由してSKILL.mdを更新**する。

| 条件                  | 判定 | アクション                    |
| --------------------- | ---- | ----------------------------- |
| 同じ問題が3回以上発生 | 改善 | ベストプラクティスに追加      |
| ワークフロー不足      | 改善 | Phase/アクション追加          |
| Trigger選定ミスが多発 | 改善 | Trigger条件見直し             |
| 成果物形式が不統一    | 改善 | テンプレート追加              |
| 上記以外              | 保留 | LOGS.mdに記録のみ（更新不要） |

### skill-creator経由でのスキル更新手順

> **制約**: 直接SKILL.mdを編集せず、必ずskill-creatorを使用する。

```bash
# 1. フィードバック記録（LOGS.md更新）
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill "{{スキル名}}" \
  --result "{{success/partial/failure}}" \
  --phase "{{Phase番号}}" \
  --issue "{{問題点}}" \
  --proposal "{{改善提案}}"

# 2. 改善判定（条件該当チェック）
node .claude/skills/skill-creator/scripts/check_improvement_needed.mjs \
  --skill "{{スキル名}}"

# 3. SKILL.md更新（改善が必要な場合のみ）
# skill-creatorスキルを使用して更新を実行
# 参照: .claude/skills/skill-creator/SKILL.md
```

### スキル更新の実行例

```markdown
## skill-creator 呼び出し例

Task: update-skill

入力:

- スキル: tdd-principles
- 更新種別: ベストプラクティス追加
- 内容: 「1テスト1アサーション」原則を追加
- 根拠: 同じ問題が3回発生（LOGS.md参照）
```

### ビジネスルール（制約）

| 制約               | 説明                                         |
| ------------------ | -------------------------------------------- |
| フィードバック必須 | 省略禁止、必ず記録する                       |
| skill-creator経由  | SKILL.md直接編集禁止、skill-creatorを使用    |
| 改善根拠の明記     | LOGS.mdの記録を根拠として改善を判断          |
| 継続的改善         | フィードバックサイクルを回して品質向上を図る |

---

## 使用スキル

### スキル1: api-documentation-best-practices

**パス**: `.claude/skills/api-documentation-best-practices/SKILL.md`

**Trigger条件**: APIドキュメント、使用例、仕様書

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. API仕様書を作成
3. 使用例を追加

**期待される成果物**:

- API仕様書
- 使用例

---

### スキル2: example-usage-patterns

**パス**: `.claude/skills/example-usage-patterns/SKILL.md`

**Trigger条件**: コード例、サンプル、チュートリアル

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 実践的な使用例を作成
3. エラーハンドリング例を追加

**期待される成果物**:

- コードサンプル

---

## 参照資料

### 実装関連

| 参照資料     | パス                                                 | 内容       |
| ------------ | ---------------------------------------------------- | ---------- |
| 実装コード   | `packages/shared/src/services/extraction/`           | 実装成果物 |
| 型定義       | `packages/shared/src/services/extraction/types.ts`   | 型情報     |
| テストコード | `packages/shared/src/services/extraction/__tests__/` | テスト     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                   | 内容              |
| ---------------- | ---------------------------------------------------------------------- | ----------------- |
| データベース仕様 | `.claude/skills/aiworkflow-requirements/references/database-schema.md` | テーブル定義      |
| API設計          | `.claude/skills/aiworkflow-requirements/references/api-design.md`      | APIエンドポイント |

### task-specification-creator参照

| 参照資料               | パス                                                                                | 内容                 |
| ---------------------- | ----------------------------------------------------------------------------------- | -------------------- |
| 未タスク検出仕様       | `.claude/skills/task-specification-creator/agents/generate-unassigned-task.md`      | 検出手順詳細         |
| 実装ガイドテンプレート | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md` | Part1/Part2構造      |
| 仕様更新フロー         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`      | aiworkflow更新手順   |
| 未タスクテンプレート   | `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`      | 未タスク指示書形式   |
| スキルフィードバック   | `.claude/skills/task-specification-creator/agents/skill-feedback-loop.md`           | フィードバック収集   |
| フィードバックフロー   | `.claude/skills/task-specification-creator/references/feedback-flow.md`             | Step 1-7詳細プロセス |

### skill-creator参照

| 参照資料      | パス                                    | 内容                   |
| ------------- | --------------------------------------- | ---------------------- |
| skill-creator | `.claude/skills/skill-creator/SKILL.md` | スキル作成・更新の実行 |

---

## 成果物

| 成果物                      | パス                                                     | 内容                    | 必須 |
| --------------------------- | -------------------------------------------------------- | ----------------------- | ---- |
| 未タスク検出レポート        | `outputs/phase-10/unassigned-task-report.md`             | 検出された未タスク一覧  | ✅   |
| 実装ガイド                  | `outputs/phase-10/implementation-guide.md`               | Part1/Part2構造のガイド | ✅   |
| 未タスク指示書              | `docs/30-workflows/unassigned-task/task-XX-XX-*.md`      | 該当する場合に生成      | 条件 |
| JSDoc更新                   | `packages/shared/src/services/extraction/*.ts`           | インラインドキュメント  | ✅   |
| aiworkflow-requirements更新 | `.claude/skills/aiworkflow-requirements/references/*.md` | 仕様変更がある場合      | 条件 |
| スキルフィードバック記録    | `outputs/phase-10/skill-feedback-record.md`              | Step 1-7の実行記録      | ✅   |
| LOGS.md更新                 | `.claude/skills/*/LOGS.md`                               | 使用スキルのログ更新    | ✅   |
| SKILL.md更新                | `.claude/skills/*/SKILL.md`                              | 改善判定に基づく更新    | 条件 |

---

## 完了条件

### Part A: 未タスク検出

- [x] Phase 3レビュー結果のMINOR判定を確認済み
- [x] Phase 8レビュー結果のMINOR判定を確認済み
- [x] Phase 9手動テスト結果のスコープ外発見事項を確認済み
- [x] outputs/配下のTODO/FIXME/将来対応を検索済み
- [x] 実装コードのTODO/FIXME/HACK/XXXを検索済み
- [x] 使用スキルのLOGS.mdでpartial/failureを確認済み
- [x] 未タスク検出レポートが `outputs/phase-10/unassigned-task-report.md` に出力されている
- [x] 該当する場合、未タスク指示書が `docs/30-workflows/unassigned-task/` に生成されている（該当なし: 全てP3）

### Part B: 実装ガイド作成

- [x] Part 1: 概念的な説明（中学生でもわかる版）が含まれている
- [x] Part 2: 技術的な詳細（開発者向け）が含まれている
- [x] 用語集セクションが含まれている
- [x] Why-first原則に従った記述がされている
- [x] ASCII図解が含まれている
- [x] 実装ガイドが `outputs/phase-10/implementation-guide.md` に出力されている

### Part C: システム仕様更新

- [x] aiworkflow-requirementsの該当仕様を確認済み
- [x] 仕様変更がある場合、該当ファイルを更新済み（interfaces-rag.mdにNERセクション追加）
- [x] エージェント、アセット、SKILL.md等の更新対象を確認済み（該当なし）

### Part D: スキルフィードバック & 改善

- [x] Step 1: 使用スキル一覧を整理済み
- [x] Step 2: 各スキルの実行結果を評価済み（success/partial/failure）
- [x] Step 3: 問題点・改善点を特定済み
- [x] Step 4: 改善提案を作成済み
- [x] Step 5: skill-creator: record-feedbackを実行済み
- [x] Step 6: 各スキルのLOGS.mdを更新済み（全てsuccessのため更新不要）
- [x] Step 7: SKILL.md改善判定を実行済み
- [x] 改善が必要な場合、skill-creatorを経由してSKILL.mdを更新済み（該当なし）

### 共通

- [x] 全公開APIにJSDocが記載されている
- [x] 使用例が含まれている
- [x] エラーハンドリング例が含まれている
- [x] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11 (PR作成) へ進む

---

## スキルフィードバック記録テンプレート

> 以下のテンプレートを `outputs/phase-10/skill-feedback-record.md` に出力する。

````markdown
# Phase 10 スキルフィードバック記録

## Step 1: 使用スキル一覧

| Phase | スキル名                         | 開始時刻  | 終了時刻  | 結果     |
| ----- | -------------------------------- | --------- | --------- | -------- |
| 1     | {{スキル名}}                     | {{HH:MM}} | {{HH:MM}} | {{結果}} |
| 4     | tdd-principles                   | {{HH:MM}} | {{HH:MM}} | {{結果}} |
| 5     | {{スキル名}}                     | {{HH:MM}} | {{HH:MM}} | {{結果}} |
| 10    | api-documentation-best-practices | {{HH:MM}} | {{HH:MM}} | {{結果}} |
| 10    | example-usage-patterns           | {{HH:MM}} | {{HH:MM}} | {{結果}} |

## Step 2: 結果評価

| スキル名                         | 評価     | 根拠           |
| -------------------------------- | -------- | -------------- |
| api-documentation-best-practices | {{評価}} | {{評価の根拠}} |
| example-usage-patterns           | {{評価}} | {{評価の根拠}} |

評価基準:

- success: 指示通りに実行、期待通りの成果
- partial: 実行できたが一部期待と異なる
- failure: 指示が不明確で実行できなかった
- n/a: スキルの適用が不適切

## Step 3: 問題点特定

| スキル名   | 問題種別           | 具体的な問題点     |
| ---------- | ------------------ | ------------------ |
| {{スキル}} | ワークフローの問題 | {{具体的な問題点}} |
| {{スキル}} | 説明の問題         | {{具体的な問題点}} |
| {{スキル}} | Trigger条件の問題  | {{具体的な問題点}} |
| {{スキル}} | リソースの問題     | {{具体的な問題点}} |

## Step 4: 改善提案

### {{スキル名}} への改善提案

**問題**: {{具体的な問題点}}

**改善案**:

1. {{改善案1}}
2. {{改善案2}}
3. {{改善案3}}

**優先度**: {{高/中/低}}（根拠: {{優先度の根拠}}）

## Step 5: skill-creator呼び出し

```bash
# フィードバック記録
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill "{{スキル名}}" \
  --result "{{success/partial/failure}}" \
  --phase "{{Phase番号}}" \
  --issue "{{問題点}}" \
  --proposal "{{改善提案}}"
```

## Step 6: LOGS.md更新結果

| スキル名                         | LOGS.mdパス                                               | 更新ステータス  |
| -------------------------------- | --------------------------------------------------------- | --------------- |
| api-documentation-best-practices | `.claude/skills/api-documentation-best-practices/LOGS.md` | {{完了/未完了}} |
| example-usage-patterns           | `.claude/skills/example-usage-patterns/LOGS.md`           | {{完了/未完了}} |

## Step 7: SKILL.md改善判定

| スキル名   | 条件チェック          | 該当 | 判定      | アクション           |
| ---------- | --------------------- | ---- | --------- | -------------------- |
| {{スキル}} | 同じ問題が3回以上発生 | Y/N  | 改善/保留 | {{具体的アクション}} |
| {{スキル}} | ワークフロー不足      | Y/N  | 改善/保留 | {{具体的アクション}} |
| {{スキル}} | Trigger選定ミスが多発 | Y/N  | 改善/保留 | {{具体的アクション}} |
| {{スキル}} | 成果物形式が不統一    | Y/N  | 改善/保留 | {{具体的アクション}} |

### SKILL.md更新実行（該当する場合）

```markdown
## skill-creator呼び出し

Task: update-skill

入力:

- スキル: {{スキル名}}
- 更新種別: {{ベストプラクティス追加/Phase追加/Trigger見直し/テンプレート追加}}
- 内容: {{具体的な更新内容}}
- 根拠: {{LOGS.mdの記録参照}}
```

## 未タスク検出結果

| 分類           | 件数  | 対応                            |
| -------------- | ----- | ------------------------------- |
| 技術的負債     | {{N}} | {{未タスク指示書生成/今後対応}} |
| 機能拡張       | {{N}} | {{未タスク指示書生成/今後対応}} |
| パフォーマンス | {{N}} | {{未タスク指示書生成/今後対応}} |

## 作成ドキュメント

| ドキュメント                | ステータス               | パス                                         |
| --------------------------- | ------------------------ | -------------------------------------------- |
| 未タスク検出レポート        | {{完了/未完了}}          | `outputs/phase-10/unassigned-task-report.md` |
| 実装ガイド                  | {{完了/未完了}}          | `outputs/phase-10/implementation-guide.md`   |
| JSDoc                       | {{完了/未完了}}          | 各実装ファイル                               |
| aiworkflow-requirements更新 | {{該当なし/完了/未完了}} | `.claude/skills/aiworkflow-requirements/`    |
| SKILL.md更新                | {{該当なし/完了/未完了}} | 該当スキル                                   |

## 次Phaseへの引き継ぎ事項

- {{引き継ぎ事項があれば記載}}
````

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/entity-extraction-ner/phase-11-pr.md`
