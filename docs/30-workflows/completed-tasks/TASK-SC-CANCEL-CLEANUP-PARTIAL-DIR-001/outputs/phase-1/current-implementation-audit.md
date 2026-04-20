# 実装監査レポート

## 対象ファイル

| ファイル                                                                     | 役割                      |
| ---------------------------------------------------------------------------- | ------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | cancel cleanup の実装本体 |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 回帰テスト                |

## 実装詳細（`SkillCreatorService.ts`）

### 1. 事前フラグ取得

```typescript
const skillDir = path.join(this.skillsDir, options.name);
const skillDirExistedBefore = await this.pathExists(skillDir);
```

- スキル作成開始前にディレクトリの存在を確認する
- これにより作業開始時点で存在したディレクトリを削除しない判定材料を持てる
- ただし開始後に別プロセスが同名ディレクトリを作成した競合までは区別できない

### 2. cleanupCancelledSkillDir の実装

```typescript
private async cleanupCancelledSkillDir(
  skillDir: string,
  existedBefore: boolean,
  signal?: AbortSignal,
  error?: unknown,
): Promise<void> {
  if (existedBefore) {
    return;  // 既存ディレクトリは削除しない（AC-2）
  }
  if (!signal?.aborted && !this.isAbortError(error)) {
    return;  // abort/cancel でない通常エラーは削除しない
  }
  try {
    await fs.rm(skillDir, { recursive: true, force: true });
  } catch (cleanupError) {
    this.logger.warn("cancelled skill dir cleanup failed", { ... });
  }
}
```

### 3. catch ブロックでの呼び出し

```typescript
} catch (error) {
  await this.cleanupCancelledSkillDir(
    skillDir,
    skillDirExistedBefore,
    operationSignal,
    error,
  );
  throw error;  // エラーを再 throw（呼び出し元へ伝播）
} finally {
  // AbortController リセットのみ（クリーンアップはここでは行わない）
  if (this.currentAbortController === abortController) {
    this.currentAbortController = null;
  }
}
```

### 4. 旧仕様との差分

| 旧仕様（不正確）               | 実際の実装                     |
| ------------------------------ | ------------------------------ |
| `finally` でクリーンアップ     | `catch` でクリーンアップ       |
| `createdByThisRun` フラグ      | `skillDirExistedBefore` フラグ |
| ディレクトリ作成後にフラグ設定 | スキル作成前に事前確認         |

## テスト確認

### SC-CANCEL-001

```typescript
it("SC-CANCEL-001: should cancel createSkill when cancelCurrentOperation is called", ...)
// fs.rm が呼ばれることを確認（新規 dir の削除）
expect(vi.mocked(fsPromises.rm)).toHaveBeenCalledWith(expectedSkillDir, {
  recursive: true,
  force: true,
});
```

### SC-CANCEL-002

```typescript
it("SC-CANCEL-002: should not remove an existing skill dir when canceling", ...)
// fs.access が undefined を返す（既存 dir）
vi.mocked(fsPromises.access).mockResolvedValue(undefined);
// fs.rm が呼ばれないことを確認
expect(vi.mocked(fsPromises.rm)).not.toHaveBeenCalled();
```

## 監査結果

| 観点                 | 判定 | 詳細                                                  |
| -------------------- | ---- | ----------------------------------------------------- |
| cleanup 実装の存在   | PASS | `cleanupCancelledSkillDir` が実装されている           |
| 既存 dir 保護        | PASS | `existedBefore` フラグによる保護が実装されている      |
| abort/cancel 判定    | PASS | `signal?.aborted` と `isAbortError` の両方を確認      |
| 回帰テストの存在     | PASS | SC-CANCEL-001/002 が存在する                          |
| finally での cleanup | N/A  | finally では cleanup を行わない（仕様書の修正が必要） |
| createdByThisRun     | N/A  | このフラグは使用していない（仕様書の修正が必要）      |
