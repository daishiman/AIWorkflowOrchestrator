# Implementation Guide: SkillCreatorService runUpdateWorkflow 実装

## タスクID: TASK-SC-CREATOR-UPDATE-IMPL-001

## 視覚証跡

> **UI/UX変更なしのため Phase 11 スクリーンショット不要**
> NON_VISUAL task。証跡は `docs/30-workflows/TASK-SC-CREATOR-UPDATE-IMPL-001/outputs/phase-11/manual-test-result.md` を参照。

---

## Part 1: なぜ必要か

`SkillCreatorService.runUpdateWorkflow()` は `update` モードの公開契約が存在するにも関わらず、スタブ状態（進捗 emit のみ）だった。前タスク `UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE` が dispatch 接続まで完了したタイミングで、本体実装を閉じることが最小コストと判断した。

たとえると、既存のノートを少し直したいだけなのに、毎回まるごと新しいノートを作り直していた状態に近い。必要なのは「どこを直すか」を安全に見つけて更新する流れであり、ただ作り直せばよいわけではない。

**何をするか**: 既存スキルの SKILL.md を読み込み、purpose を再生成（LLM 優先・既存値フォールバック）した上で `StructurePlanJson` を返すことで、`runCreateWorkflow()` と整合するワークフローを完成させる。

---

## Part 2: 型・API・エラーハンドリング・fallback・設定要素

### 新規メソッド: `runUpdateWorkflow()`

```typescript
private async runUpdateWorkflow(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<StructurePlanJson | null>
```

| 項目           | 内容                                                                 |
| -------------- | -------------------------------------------------------------------- |
| 入力           | `CreateSkillOptions`（`skillPath` optional）、`AbortSignal` optional |
| 出力           | `StructurePlanJson` または `null`（全体失敗時）                      |
| purpose 決定順 | `regeneratedPurpose` → `existingPurpose` → `options.description`     |
| AbortSignal    | `throwIfAborted()` を 2 箇所で呼び出し                               |
| エラー処理     | `isAbortError()` は rethrow、その他は `null` にフォールバック        |

### 新規メソッド: `extractPurposeFromSkillMd()`

```typescript
private extractPurposeFromSkillMd(content: string): string | null
```

| 項目           | 内容                                         |
| -------------- | -------------------------------------------- |
| 対象           | YAML frontmatter の `description` フィールド |
| 対応形式       | multiline と singleline の両方に対応         |
| 非 frontmatter | `null` を返す                                |

### `case "update":` の変更点

```typescript
// Before（スタブ）
case "update":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  break;

// After（実処理）
case "update":
  emitProgress("loading-skill");
  try {
    structurePlan = await this.runUpdateWorkflow(options, operationSignal);
  } catch (error) {
    if (this.isAbortError(error) || operationSignal.aborted) throw error;
    structurePlan = null;
  }
  emitProgress("analyzing");
  break;
```

### フォールバック連鎖

```
LLM 再生成 → 成功 → purpose に使用
           → 失敗 → 既存 SKILL.md の description
                  → SKILL.md なし → options.description
```

### 設定要素

| 要素                    | 変更有無 | 備考                        |
| ----------------------- | -------- | --------------------------- |
| `PROGRESS_FLOWS.update` | 変更なし | 既存の 5 フェーズを維持     |
| `LlmClient` DI          | 変更なし | constructor 注入のまま      |
| `skillPath` フィールド  | 変更なし | `CreateSkillOptions` に既存 |

## 残る既知制約

- `update` は path 解決を修正したが、既存スキルを完全な差分更新として扱う契約までは未完了
- この大きな課題は `docs/30-workflows/unassigned-task/TASK-SC-UPDATE-MODE-DIFF-SEMANTICS-001.md` に分離した
