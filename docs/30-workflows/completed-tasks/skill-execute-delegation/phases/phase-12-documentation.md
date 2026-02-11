# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 12                                    |
| Phase名    | ドキュメント更新                      |
| 前提Phase  | Phase 11 (手動テスト検証)             |
| 後続Phase  | Phase 13 (PR作成)                     |
| ステータス | 未実施                                |
| 作成日     | 2026-02-10                            |
| タスクID   | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 機能名     | skill-execute-delegation              |

---

## 目的

SkillService.executeSkill()からSkillExecutorへの委譲実装について、ドキュメント化・システム仕様更新・未タスク検出を行う。

## 背景

実装完了後、知識の形式化と継続的改善のためのドキュメント整備を行う。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: documentation-architecture

**パス**: `.claude/skills/documentation-architecture/SKILL.md`

**Trigger条件**:

- ドキュメント構造設計・作成が必要な場合

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/documentation-changelog.md`

### スキル2: skill-creator【必須】

**パス**: `.claude/skills/skill-creator/SKILL.md`

**Trigger条件**:

- スキルフィードバック記録・改善・新規作成が必要な場合

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`
- 各スキルのLOGS.md更新

---

## 参照資料

| 参照資料           | パス                                                           | 内容             |
| ------------------ | -------------------------------------------------------------- | ---------------- |
| SkillService実装   | `apps/desktop/src/main/services/skill/SkillService.ts`         | ドキュメント対象 |
| SkillExecutor      | `apps/desktop/src/main/skill-system/executor/SkillExecutor.ts` | 委譲先           |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`                   | 要件情報         |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`                       | 設計情報         |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md`                       | テスト結果       |

---

## 成果物

| 成果物                       | パス                                          | 必須 | 内容                     |
| ---------------------------- | --------------------------------------------- | ---- | ------------------------ |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`    | ✅   | 概念的説明・技術的詳細   |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md` | ✅   | 更新したドキュメント一覧 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-report.md`  | ✅   | 検出された未タスク       |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`   | ✅   | スキル実行結果・改善提案 |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`      | 条件 | 検出時のみ作成           |

---

## Phase 12の4つの必須作業

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

#### Part 1 必須内容

**執筆ルール**:

- 専門用語を使わない（使う場合は日常語で言い換え）
- 「なぜこの仕組みが必要か」を最初に説明
- 図解はASCIIアートで作成（簡潔に）

**必須アナロジー**:

- SkillServiceとSkillExecutorの関係を「郵便局と配達員」などの日常的なアナロジーで説明
- スキル実行の流れを「注文→調理→配達」のような段階的な例えで説明
- ストリーミングを「電話で進捗報告を受ける」ような例えで説明
- 中断機能を「途中でキャンセル」として説明

#### Part 2 必須内容

**執筆ルール**:

- TypeScriptインターフェースは必ず掲載
- コードサンプルは実際に動作するものを使用
- エラーケースも含めたパターンを網羅

**必須コンテンツ**:

- アーキテクチャ図（ASCII）
- SkillExecutor.execute() のシグネチャと使用例
- SkillExecutionRequest / SkillExecutionResponse 型定義
- StreamCallbackの実装パターン
- エラーハンドリングのパターン（SkillExecutionErrorCode含む）
- AbortControllerの使用方法

**型定義サンプル（Part 2で必ず掲載）**:

```typescript
// SkillExecutionRequest
interface SkillExecutionRequest {
  prompt: string;
  skillId: string;
  timeout?: number;
}

// SkillExecutionResponse
interface SkillExecutionResponse {
  success: boolean;
  executionId?: string;
  error?: {
    code: SkillExecutionErrorCode;
    message: string;
  };
}

// SkillExecutionErrorCode（公式仕様）
type SkillExecutionErrorCode =
  | "MAX_CONCURRENT_EXCEEDED"
  | "ABORTED"
  | "TIMEOUT"
  | "EXECUTION_FAILED"
  | "AUTHENTICATION_ERROR";
```

---

### Task 2: システムドキュメント更新【必須・詳細手順】

#### Step 1-A: タスク完了記録【必須】

**チェックリスト（P1, P25対策 - 2ファイル両方を必ず更新）**:

- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加（**2ファイル両方**）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

**完了タスクセクション追加場所**:

1. `LOGS.md` の「完了タスク」セクション末尾に追加
2. 既存の完了タスクの下に新しいエントリを追加
3. 日付は完了日を記載

**テンプレート（LOGS.mdに追加）**:

```markdown
## 完了タスク

### タスク: TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION（{{COMPLETION_DATE}}完了）

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| タスクID   | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION      |
| ステータス | **完了**                                   |
| テスト数   | {{N}}（自動）+ {{N}}（手動）               |
| 変更内容   | skill:executeハンドラーのSkillExecutor委譲 |
```

**SKILL.md 変更履歴テンプレート**:

```markdown
| {{DATE}} | v1.x.x | TASK-FIX-7-1完了: スキル実行委譲実装 |
```

#### Step 1-B: 実装状況テーブル更新（該当する場合）

- [ ] `interfaces-agent-sdk-executor.md` の実装ステータス更新

#### Step 1-C: 関連タスクテーブル更新

```bash
# 関連仕様書を検索
grep -rn "TASK-FIX-7-1" .claude/skills/aiworkflow-requirements/references/
```

- [ ] 検索結果の仕様書で関連タスクステータスを「完了」に更新

#### Step 1-D: topic-map.md 再生成

- [ ] 仕様書に変更があった場合、topic-map.mdを再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.mjs
```

#### Step 2: システム仕様更新（条件付き）

以下の判断基準で更新要否を判断:

| 更新必要               | 更新不要                   |
| ---------------------- | -------------------------- |
| SkillService IFの変更  | 内部実装の変更のみ         |
| 新規エラーコード追加   | リファクタリング（IF不変） |
| 新規イベントタイプ追加 | バグ修正（仕様変更なし）   |

**本タスクでの更新対象候補**:

| 仕様書                             | 更新判断                                |
| ---------------------------------- | --------------------------------------- |
| `interfaces-agent-sdk-executor.md` | SkillExecutor連携仕様の追記が必要か確認 |
| `interfaces-agent-sdk-skill.md`    | Skill型の変更があれば更新               |
| `security-skill-execution.md`      | セキュリティ要件の変更があれば更新      |

---

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# 手動で outputs/phase-12/documentation-changelog.md を作成
# 更新したドキュメントと変更内容を一覧化
```

**artifacts.json必須項目**:

- Phase 12のステータスを`completed`に更新
- 全Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics`セクションに品質指標が記録されていること

---

### Task 4: 未タスク検出【必須チェックリスト】

以下の**すべてのソース**から未タスクを必ず検出すること:

| #   | ソース                 | 確認項目                      | 必須 |
| --- | ---------------------- | ----------------------------- | ---- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           | ✅   |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           | ✅   |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          | ✅   |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 | ✅   |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   | ✅   |

```bash
# 未タスク検出コマンド
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/services/skill/
grep -rn "TODO\|FIXME\|将来対応" outputs/
```

**検出結果が0件でも、`unassigned-task-report.md`は必ず作成する。**

---

## アーキテクチャ層別ドキュメント（本タスク固有）

| 層           | ドキュメント内容                       | 更新対象                           |
| ------------ | -------------------------------------- | ---------------------------------- |
| Main Process | SkillService→SkillExecutor委譲パターン | `interfaces-agent-sdk-executor.md` |
| IPC通信      | skill:executeチャンネルの使用方法      | `security-skill-ipc.md`            |
| エラー処理   | 認証エラー・実行エラーの伝播パターン   | `error-handling.md`                |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-A】SKILL.md変更履歴を更新した（2ファイル両方）**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した（該当する場合）**
- [ ] **【Task 2 Step 1-D】topic-map.mdを再生成した（仕様書変更があった場合）**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **未タスク検出レポートが出力されている**【必須・0件でも作成】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] スキルフィードバックレポートが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックがskill-creatorで記録されている

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

`docs/30-workflows/skill-execute-delegation/phases/phase-13-pr.md`
