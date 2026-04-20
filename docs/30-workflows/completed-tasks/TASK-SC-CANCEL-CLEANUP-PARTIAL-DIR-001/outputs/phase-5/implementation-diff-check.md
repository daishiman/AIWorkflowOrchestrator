# 実装差分確認レポート

## 確認方針

本 task における「実装」= 既存コードとの差分確認 + spec 修正の適用

## 実コード確認結果

### SkillCreatorService.ts

#### cleanupCancelledSkillDir（259-280行付近）

```typescript
private async cleanupCancelledSkillDir(
  skillDir: string,
  existedBefore: boolean,
  signal?: AbortSignal,
  error?: unknown,
): Promise<void> {
  if (existedBefore) {
    return;  // ✓ 既存 dir 保護
  }
  if (!signal?.aborted && !this.isAbortError(error)) {
    return;  // ✓ abort/cancel でない通常エラーはスキップ
  }
  try {
    await fs.rm(skillDir, { recursive: true, force: true });  // ✓ 削除実行
  } catch (cleanupError) {
    this.logger.warn("cancelled skill dir cleanup failed", { ... });
  }
}
```

**判定**: 実装は正しい。仕様書を実装に合わせる。

#### skillDirExistedBefore の取得位置（373-374行付近）

```typescript
const skillDir = path.join(this.skillsDir, options.name);
const skillDirExistedBefore = await this.pathExists(skillDir);  // ✓ try ブロック開始前
try {
  ...
} catch (error) {
  await this.cleanupCancelledSkillDir(  // ✓ catch ブロックで呼び出し
    skillDir,
    skillDirExistedBefore,
    operationSignal,
    error,
  );
  throw error;
} finally {
  // ✓ finally では AbortController リセットのみ
  if (this.currentAbortController === abortController) {
    this.currentAbortController = null;
  }
}
```

**判定**: 実装は正しい。仕様書を実装に合わせる。

## spec との差分一覧

| 差分             | 旧 spec（誤）      | 正しい記述              | 修正済み         |
| ---------------- | ------------------ | ----------------------- | ---------------- |
| cleanup 実行位置 | `finally` ブロック | `catch` ブロック        | ✓ 本 task で修正 |
| 保護フラグ       | `createdByThisRun` | `skillDirExistedBefore` | ✓ 本 task で修正 |
| task 分類        | `docs-only` 混在   | `NON_VISUAL code task`  | ✓ 本 task で修正 |
| artifact 名      | 混在・不統一       | canonical 名に統一      | ✓ 本 task で修正 |

## テストファイル確認結果

### SC-CANCEL-001

- `fsPromises.access` が ENOENT を返す → `skillDirExistedBefore = false`
- `cancelCurrentOperation()` を呼ぶ → AbortController に abort シグナル
- `fs.rm(skillDir, ...)` が呼ばれることを検証 → ✓

### SC-CANCEL-002

- `fsPromises.access` が `undefined` を返す → `skillDirExistedBefore = true`
- `cancelCurrentOperation()` を呼ぶ → AbortController に abort シグナル
- `fs.rm` が**呼ばれない**ことを検証 → ✓

## 結論

既存コードは正しく実装されている。仕様書の修正のみで AC-1〜AC-5 を満たせる。コードパッチは不要。
