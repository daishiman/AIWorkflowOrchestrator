# 実装ガイド

## Part 1: 初学者向け（中学生レベル）

### なぜこの機能が必要か？

スキルを作成している最中に「やっぱりやめた」とキャンセルしたとき、作りかけのフォルダが残ってしまう問題がありました。

**たとえば、こんなイメージです。**

図書館で本を返す途中に用事ができてやめたとき、返却途中の本が宙ぶらりんのまま放置されてしまうようなものです。次に来た人が「この本はどこに属しているの？」と混乱してしまいます。

キャンセルしたら作りかけのフォルダをその場で片づけて、次の作業で混乱しないようにしたい——これがこの機能の目的です。

### ただし大切なルールがあります

**もともとあったフォルダは絶対に消してはいけません。**

たとえば、既に「my-skill」というフォルダがある人が「my-skill を更新しようとしてキャンセルした」場合、フォルダを消してしまったら大変です。だから「このフォルダは作業前から存在していたか」を事前にチェックして、もともとあったものは触らないようにしています。

---

## Part 2: 開発者向け（技術詳細）

### 型定義と対象 API

```typescript
type SkillCreatorProgressData = {
  phase: string;
  percentage: number;
  message: string;
};

async createSkill(
  options: CreateSkillOptions,
  onProgress?: (progress: SkillCreatorProgressData) => void,
): Promise<string>
```

この task で直接確認する private API は次のとおり。

```typescript
private async cleanupCancelledSkillDir(
  skillDir: string,
  existedBefore: boolean,
  signal?: AbortSignal,
  error?: unknown,
): Promise<void>
```

### 実コード構造

**ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

#### 事前確認

```typescript
const skillDir = path.join(this.skillsDir, options.name);
const skillDirExistedBefore = await this.pathExists(skillDir);
```

スキル作成開始**前**にディレクトリの存在を確認する。これが既存 dir 保護の根拠。

#### catch ブロックでの cleanup

```typescript
try {
  // スキル作成処理（init, generate, validate...）
} catch (error) {
  await this.cleanupCancelledSkillDir(
    skillDir,
    skillDirExistedBefore,
    operationSignal,
    error,
  );
  throw error; // エラーを再 throw
} finally {
  // AbortController のリセットのみ（cleanup はここでは行わない）
  if (this.currentAbortController === abortController) {
    this.currentAbortController = null;
  }
}
```

#### cleanupCancelledSkillDir の動作

```typescript
private async cleanupCancelledSkillDir(
  skillDir: string,
  existedBefore: boolean,
  signal?: AbortSignal,
  error?: unknown,
): Promise<void> {
  if (existedBefore) return;  // 既存 dir は保護
  if (!signal?.aborted && !this.isAbortError(error)) return;  // abort/cancel 以外はスキップ
  try {
    await fs.rm(skillDir, { recursive: true, force: true });
  } catch (cleanupError) {
    this.logger.warn("cancelled skill dir cleanup failed", { skillDir, cleanupError });
  }
}
```

`existedBefore` は「作業開始時点でそのディレクトリが存在したか」を表す。したがって既存 dir 保護はこの時点のスナップショットに対して成立し、開始後に別プロセスが同名 dir を作成した競合までは区別しない。

### 使用例と差分確認コマンド

```bash
grep -n "cleanupCancelledSkillDir\\|skillDirExistedBefore\\|catch\\|finally" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts

pnpm --filter @repo/desktop test -- SkillCreatorService
```

期待する読み取り結果:

- cleanup は `finally` ではなく `catch` で呼ばれる
- `skillDirExistedBefore` は try 開始前に取得される
- `SC-CANCEL-001`〜`SC-CANCEL-005` が pass する

### 既存テスト

| テスト ID     | 検証内容                                                                  |
| ------------- | ------------------------------------------------------------------------- |
| SC-CANCEL-001 | abort 時に `fs.rm(skillDir, { recursive: true, force: true })` が呼ばれる |
| SC-CANCEL-002 | 既存 dir がある場合は abort しても `fs.rm` が呼ばれない                   |
| SC-CANCEL-003 | `AbortError` 経路でも cleanup が実行される                                |
| SC-CANCEL-004 | 通常エラーでは cleanup しない                                             |
| SC-CANCEL-005 | cleanup 自体が失敗しても warn ログで吸収する                              |

### エッジケース

| ケース                | 動作                                               |
| --------------------- | -------------------------------------------------- |
| 既存 dir + abort      | 削除しない（`existedBefore === true` で即 return） |
| 新規 dir + 通常エラー | 削除しない（`isAbortError` が false で即 return）  |
| 新規 dir + abort      | 削除する（`fs.rm` 呼び出し）                       |
| cleanup 自体の失敗    | warn ログのみ、エラーを伝播しない                  |

### 設定値

| 定数               | 値                                 | ファイル               |
| ------------------ | ---------------------------------- | ---------------------- |
| `fs.rm` オプション | `{ recursive: true, force: true }` | SkillCreatorService.ts |

---

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要

代替証跡:

- `outputs/phase-10/final-review-result.md` — AC-1〜AC-5 の最終判定（全 PASS）
- `outputs/phase-11/manual-test-result.md` — code/spec walkthrough + regression evidence（全 PASS）

補助証跡:

- `outputs/phase-9/quality-gate-report.md` — targeted test と artifact 名整合の補助記録
