# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| Phase    | 12                                        |
| タスクID | TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP   |
| タスク名 | SkillExecutor内の重複型定義を共有型に統一 |
| 分類     | リファクタリング                          |
| 機能名   | skillexecutor-type-cleanup                |
| 作成日   | 2026-02-07                                |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- Task 1: 実装ガイド作成（2パート構成）
- Task 2: システムドキュメント更新（Step 1必須 + Step 2条件付き）
- Task 3: ドキュメント更新履歴作成 & artifacts.json更新
- Task 4: 未タスク検出（0件でも出力必須）

## 参照資料

| 資料名                 | パス                                      | 説明                 |
| ---------------------- | ----------------------------------------- | -------------------- |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md` | Phase 10成果物       |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`  | Phase 11成果物       |
| spec-update-workflow   | `references/spec-update-workflow.md`      | システム仕様更新手順 |
| 実装ガイドテンプレート | `assets/implementation-guide-template.md` | テンプレート         |

---

## Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                         |
| ------ | ---------------- | -------------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）           |
| Part 2 | 開発者・技術者   | 技術的な詳細（型定義・ファイル構成・使用例） |

### Part 1: 概念的説明（中学生でもわかる版）

以下の構成で記述:

1. **背景と目的**: なぜこの変更が必要だったか（日常の例えを使用）
2. **変更の概要**: 何が変わったか（図や例を使用）
3. **メリット**: この変更により何が良くなるか

**日常の例え例**:

- 「型定義の重複」→「同じルールが別々の場所に書かれている状態」
- 「共有型への統一」→「ルールブックを1冊にまとめて、みんながそれを参照する」

### Part 2: 技術的詳細（開発者向け）

以下の構成で記述:

1. **変更対象ファイル**
   - `apps/desktop/src/main/services/skill/SkillExecutor.ts`
   - `packages/shared/src/types/skill-system/skill-executor.ts`

2. **削除されたローカル型定義**
   - 削除された型の一覧と説明

3. **移行後のimport構成**
   - 新しいimport文のコード例

4. **型定義の参照方法**
   - 開発者が型を使用する際の手順

### 成果物

| 成果物     | パス                                       |
| ---------- | ------------------------------------------ |
| 実装ガイド | `outputs/phase-12/implementation-guide.md` |

---

## Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

### Step 1: タスク完了記録【必須・全タスク】

以下の項目を全て実行する:

#### Step 1-A: タスク完了記録

- [ ] 該当する仕様書に「完了タスク」セクションを追加
  - 対象: `aiworkflow-requirements/references/skill-system.md`（存在する場合）

- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加

```markdown
## 2026-02-07

### TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP 完了

- 内容: SkillExecutor内の重複型定義を@repo/sharedに統一
- 変更ファイル:
  - `apps/desktop/src/main/services/skill/SkillExecutor.ts`
  - `packages/shared/src/types/skill-system/skill-executor.ts`
- ステータス: 完了
```

- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加（**2ファイル両方**）

#### Step 1-B: 実装状況テーブル更新（該当する場合）

- [ ] 本タスクは型定義のリファクタリングのため、API/IPC実装ステータステーブルの更新は**不要**

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "TASK-FIX-1-2" references/` で関連仕様書を検索
- [ ] 関連タスクテーブルが存在する場合、ステータスを「完了」に更新

#### Step 1-D: topic-map.md 再生成

- [ ] `node generate-index.js` を実行して topic-map.md を再生成
- [ ] 本タスクで新規セクションが追加された場合のみ必要

### Step 2: システム仕様更新【条件付き】

以下の判断基準で更新要否を判断:

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

**本タスクの判定**:

- 型定義の**配置場所**が変更されたが、型の**内容**は変更なし
- 外部インターフェースに変更なし
- **結論**: システム仕様更新は**不要**

- [ ] `documentation-changelog.md` に「システム仕様更新: 不要（リファクタリングのため、外部インターフェース変更なし）」と記録

### 成果物

| 成果物           | パス                                       |
| ---------------- | ------------------------------------------ |
| システム仕様更新 | 該当仕様書への追記（Step 1で特定した箇所） |

---

## Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

### ドキュメント更新履歴（documentation-changelog.md）

以下の内容を含む `documentation-changelog.md` を作成:

1. **更新日時**: 2026-02-07
2. **タスクID**: TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP
3. **Task 1の完了状況**: 実装ガイド作成結果
4. **Task 2の完了状況**: 各Stepの実行結果
5. **Task 3の完了状況**: 本ファイル作成
6. **Task 4の完了状況**: 未タスク検出結果

### artifacts.json更新

以下のコマンドでartifacts.jsonを更新（スクリプトが存在しない場合は手動で作成）:

```bash
# Phase 12完了登録
node scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-FIX-1-2-skillexecutor-type-cleanup \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-report.md:未タスク検出レポート"
```

**artifacts.json必須項目**:

- Phase 12のステータスが`completed`に更新されていること
- 全Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics`セクションに品質指標が記録されていること

### フォールバック手順（スクリプト未存在時）

手動で `outputs/phase-12/artifacts.json` を作成:

```json
{
  "taskId": "TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP",
  "featureName": "skillexecutor-type-cleanup",
  "completedAt": "2026-02-07T00:00:00Z",
  "phases": {
    "phase-12": {
      "status": "completed",
      "artifacts": [
        "outputs/phase-12/implementation-guide.md",
        "outputs/phase-12/documentation-changelog.md",
        "outputs/phase-12/unassigned-task-report.md"
      ]
    }
  }
}
```

### 成果物

| 成果物               | パス                                            |
| -------------------- | ----------------------------------------------- |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   |
| artifacts.json       | `outputs/phase-12/artifacts.json`（または更新） |

---

## Task 4: 未タスク検出【必須】

> **重要**: 検出結果が0件でも `unassigned-task-report.md` の出力は**必須**

### 検出ソース

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

### 検出手順

```bash
# コードベース内のTODO/FIXME検索
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/services/skill/ --include="*.ts"

# Phase成果物内の未完了項目検索
grep -rn "将来対応\|TODO\|FIXME\|未対応" outputs/ --include="*.md"
```

### 未タスク検出時の3ステップ

検出した未タスクは以下の3ステップを**全て**完了すること:

1. **指示書作成**: `docs/30-workflows/unassigned-task/` に指示書を作成
2. **残課題テーブル登録**: `task-workflow.md` の残課題テーブルに登録
3. **関連仕様書リンク追加**: 関連する仕様書に参照リンクを追加

### 成果物

| 成果物               | パス                                         | 必須 |
| -------------------- | -------------------------------------------- | ---- |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md` | 必須 |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`     | 条件 |

---

## アーキテクチャ層別ドキュメント（本タスク該当分）

本タスクはMain Processの内部実装変更のため、以下の層のドキュメントを作成:

| 層           | ドキュメント内容             | 更新対象               |
| ------------ | ---------------------------- | ---------------------- |
| Main Process | 型定義の配置変更、import構成 | 実装ガイドPart 2に記載 |
| Shared       | 共有型定義の追加・統合       | 実装ガイドPart 2に記載 |

---

## 成果物一覧

| 成果物               | パス                                          | 必須 | 説明                         |
| -------------------- | --------------------------------------------- | ---- | ---------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | 必須 | Part 1 + Part 2の2パート構成 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | 必須 | 各Task完了状況の記録         |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  | 必須 | 0件でも出力必須              |
| artifacts.json       | `outputs/phase-12/artifacts.json`             | 必須 | Phase完了状況                |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`      | 条件 | 検出時のみ作成               |

---

## 完了条件

### Task 1: 実装ガイド

- [ ] Part 1（概念的説明・中学生でもわかる版）が作成されている
- [ ] Part 2（技術的詳細・開発者向け）が作成されている
- [ ] 日常の例えが含まれている（Part 1）

### Task 2: システムドキュメント更新

- [ ] **【Step 1-A】** 該当仕様書に「完了タスク」セクションを追加した
- [ ] **【Step 1-A】** `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加した
- [ ] **【Step 1-A】** `task-specification-creator/LOGS.md` にタスク完了記録を追加した（**2ファイル両方**）
- [ ] **【Step 1-B】** 実装状況テーブルの更新要否を判断した（本タスクは不要）
- [ ] **【Step 1-C】** 関連タスクテーブルを検索し、該当があれば更新した
- [ ] **【Step 1-D】** `topic-map.md` 再生成の要否を判断した
- [ ] **【Step 2】** システム仕様更新の要否を判断し、`documentation-changelog.md` に記録した

### Task 3: ドキュメント更新履歴 & artifacts.json

- [ ] `documentation-changelog.md` が作成されている
- [ ] 各Taskの完了状況が詳細に記録されている
- [ ] `artifacts.json` が更新されている
- [ ] Phase 12のステータスが`completed`になっている

### Task 4: 未タスク検出

- [ ] 全ソース（Phase 3/10/11レビュー、成果物、コードベース）を確認した
- [ ] `unassigned-task-report.md` が出力されている（**0件でも必須**）
- [ ] 検出された未タスクがある場合、3ステップ全完了している

### 全体

- [ ] **本Phase内の全タスク（Task 1-4）を100%実行完了**

---

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. Task 1: 実装ガイド作成
   - Part 1（概念的説明）作成
   - Part 2（技術的詳細）作成
2. Task 2: システムドキュメント更新
   - Step 1-A: タスク完了記録
   - Step 1-B: 実装状況テーブル確認
   - Step 1-C: 関連タスクテーブル検索・更新
   - Step 1-D: topic-map.md 再生成確認
   - Step 2: システム仕様更新判断
3. Task 3: ドキュメント更新履歴 & artifacts.json
4. Task 4: 未タスク検出
5. 成果物の配置確認
6. 完了条件の検証

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1-4）を100%実行完了
- [ ] 各タスクの成果物が `outputs/phase-12/` に生成されている
- [ ] `artifacts.json` が更新されている
- [ ] **全Stepの完了結果が `documentation-changelog.md` に詳細に記録されている**

---

## 次のPhase

Phase 13: PR作成
