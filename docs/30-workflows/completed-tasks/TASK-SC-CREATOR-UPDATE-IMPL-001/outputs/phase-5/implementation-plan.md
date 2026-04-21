# Phase 5: 実装計画

## タスクID: TASK-SC-CREATOR-UPDATE-IMPL-001

## 変更ファイル一覧

| ファイル                                                                     | 変更種別 | 内容                                                                                  |
| ---------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 修正     | `runUpdateWorkflow()` 追加、`extractPurposeFromSkillMd()` 追加、`case "update":` 更新 |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 修正     | `update-TC-01〜06` テスト追加                                                         |

## 実装概要

### 追加メソッド1: `runUpdateWorkflow()`

```
private async runUpdateWorkflow(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<StructurePlanJson | null>
```

処理フロー:

1. `throwIfAborted(signal)` で即時中断確認
2. `options.skillPath || path.join(this.skillsDir, options.name)` でスキルディレクトリを決定
3. `fs.readFile(skillMdPath, "utf-8")` で既存 SKILL.md を読み込み
4. `extractPurposeFromSkillMd(content)` で purpose を抽出（失敗時は null）
5. `throwIfAborted(signal)` で中断確認
6. `extractPurposeWithLlm(options, signal)` で LLM 再生成（失敗時は null）
7. `purpose = regeneratedPurpose ?? existingPurpose ?? options.description` でフォールバック連鎖
8. `StructurePlanJson` を返す

### 追加メソッド2: `extractPurposeFromSkillMd()`

```
private extractPurposeFromSkillMd(content: string): string | null
```

処理フロー:

1. YAML frontmatter を正規表現で抽出（`/^---\n([\s\S]*?)\n---/`）
2. multiline description（`description: |`）を先に試みる
3. single line description を試みる
4. 見つからない場合は null を返す

### `case "update":` の変更

Before:

```typescript
case "update":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  break;
```

After:

```typescript
case "update":
  emitProgress("loading-skill");
  emitProgress("analyzing");
  try {
    structurePlan = await this.runUpdateWorkflow(options, operationSignal);
  } catch (error) {
    if (this.isAbortError(error) || operationSignal.aborted) throw error;
    this.logger.warn("runUpdateWorkflow failed, falling back to null", {...});
    structurePlan = null;
  }
  break;
```

## callback 制約

- `runUpdateWorkflow()` 内から `onProgress` コールバックは直接呼ばない
- progress emit は `createSkill()` 内の `emitProgress()` に集約（TASK-SW-STREAM-FUP-03 の契約を維持）
- `canUseTool` 非適用：本メソッドは SDK ではなく直接 fs/LLM を呼ぶため対象外
