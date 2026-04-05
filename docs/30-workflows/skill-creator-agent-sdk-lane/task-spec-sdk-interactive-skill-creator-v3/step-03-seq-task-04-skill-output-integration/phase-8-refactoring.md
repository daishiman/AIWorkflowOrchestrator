# Phase 8: リファクタリング -- Skill Output Integration

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase番号  | 8                         |
| 機能名     | skill-output-integration  |
| タスクID   | TASK-SDK-SC-04            |
| 作成日     | 2026-04-02                |
| 依存 Phase | Phase 7（カバレッジ確認） |

## 目的

Phase 5 の実装を見直し、パース戦略の統一化・ファイル I/O のエラーハンドリング確認・コードの可読性向上を行う。テストは引き続き全件 PASS であることを確認する。

## 実行タスク

### Task 8-1: パース戦略の統一化

#### 現状の確認

`extractSkillFromOutput()` で使用しているマーカー検出ロジックは、現在は `SkillCreatorOutputHandler` の専用パイプラインとして成立している。

#### リファクタリング方針

| 対象               | リファクタリング内容                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| マーカー定数       | `SKILL_START_MARKER_RE` / `SKILL_END_MARKER_RE` を定数として切り出す（クラス外に定義） |
| スラッグ化ロジック | `toSlug(name: string): string` をプライベートメソッドとして抽出する                    |
| name 抽出正規表現  | `NAME_PATTERN = /^name:\s*(.+)$/m` を定数として切り出す                                |

#### リファクタリング後のコード構造

```typescript
// マーカー定数（クラス外に定義し、テストからも参照可能にする）
export const SKILL_START_MARKER_RE = /<!-- SKILL_START:\s*(.+?)\s*-->/;
export const SKILL_END_MARKER_RE = /<!-- SKILL_END:\s*(.+?)\s*-->/;
const NAME_PATTERN = /^name:\s*(.+)$/m;

export class SkillCreatorOutputHandler {
  // ...

  private toSlug(name: string): string {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[\\/]+/g, "-")
      .replace(/\.\.+/g, "-")
      .replace(/\0/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    return slug || "unnamed-skill";
  }

  extractSkillFromOutput(sessionOutput: string): ParsedSkillOutput | null {
    const startMatch = sessionOutput.match(SKILL_START_MARKER_RE);
    const endMatch = sessionOutput.match(SKILL_END_MARKER_RE);

    const startIndex = startMatch?.index;
    const endIndex = endMatch?.index;
    const hasValidMarkers =
      !!startMatch &&
      !!endMatch &&
      startIndex !== undefined &&
      endIndex !== undefined &&
      endIndex > startIndex;

    const content = hasValidMarkers
      ? sessionOutput.slice(startIndex + startMatch[0].length, endIndex).trim()
      : sessionOutput.trim();

    const nameMatch = content.match(NAME_PATTERN);
    const markerName = hasValidMarkers ? startMatch?.[1]?.trim() : undefined;
    const name = nameMatch?.[1]?.trim() ?? markerName;
    if (!name) {
      return null;
    }

    return { name, content, dirName: this.toSlug(name) };
  }
}
```

### Task 8-2: ファイル I/O のエラーハンドリング確認

以下の観点でエラーハンドリングを見直す。

| 観点                                            | 確認内容                                                                          | 対応                                                        |
| ----------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `saveSkill()` でのエラー伝播                    | `mkdir` / `writeFile` のエラーは呼び出し元（`handleSessionComplete`）に伝播させる | 現状通りで問題なし（Phase 5 実装で確認済み）                |
| `handleSessionComplete()` の `saveSkill` エラー | ファイル保存失敗時はエラーログを出力して処理を中断する（IPC 通知を送らない）      | Phase 5 実装を確認・必要なら `try/catch` を追加する         |
| `registerToRegistry()` のエラー                 | Registry 登録失敗は致命的エラーではないため、ログ出力後に IPC 通知は続行する      | Phase 5 実装通りで問題なし                                  |
| `fs.access()` の上書き確認                      | `access()` 失敗 = ファイル未存在として扱う（`ENOENT` 以外のエラーも同様に処理）   | Phase 5 実装を確認・必要なら `err.code === 'ENOENT'` を確認 |

#### `handleSessionComplete()` の改善版

```typescript
async handleSessionComplete(sessionOutput: string): Promise<void> {
  const skill = this.extractSkillFromOutput(sessionOutput);
  if (!skill) {
    return;
  }

  const targetPath = path.join(
    this.projectRoot,
    ".claude",
    "skills",
    skill.dirName,
    "SKILL.md",
  );

  let requiresOverwriteConfirm = false;
  try {
    await fs.access(targetPath);
    requiresOverwriteConfirm = true;
  } catch {
    // ファイルが存在しない（または確認不可）= 上書き確認不要
  }

  if (requiresOverwriteConfirm) {
    this.notifyOutputReady({
      skillName: skill.name,
      savedPath: targetPath,
      content: skill.content,
      requiresOverwriteConfirm: true,
    });
    return;
  }

  let savedPath: string;
  try {
    savedPath = await this.saveSkill(skill);
  } catch (err) {
    console.error("[SkillCreatorOutputHandler] スキル保存失敗:", err);
    return; // 保存失敗時は IPC 通知しない
  }

  try {
    await this.registerToRegistry(savedPath);
  } catch (err) {
    console.error("[SkillCreatorOutputHandler] Registry 登録失敗:", err);
  }

  this.notifyOutputReady({
    skillName: skill.name,
    savedPath,
    content: skill.content,
    requiresOverwriteConfirm: false,
  });
}
```

### Task 8-3: リファクタリング後のテスト再実行

```bash
pnpm --filter @repo/desktop vitest run \
  src/main/services/runtime/__tests__/SkillCreatorOutputHandler.test.ts \
  src/renderer/components/skill-creator/__tests__/SkillCreatorResultPanel.test.tsx \
  --reporter=verbose
```

期待する結果: T-01 から T-09 が全件 PASS。

## 参照資料

| 資料名             | パス                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase 5 実装       | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-5-implementation.md` |
| Phase 7 カバレッジ | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-7-coverage.md`       |

## 成果物

| 成果物                           | パス                                                                                                                                                            | 形式     |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| リファクタリング書（本ファイル） | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-8-refactoring.md` | Markdown |

## 完了条件

- [ ] マーカー定数（`SKILL_START_MARKER_RE` / `SKILL_END_MARKER_RE`）をクラス外定数として切り出した
- [ ] `toSlug()` をプライベートメソッドとして抽出した
- [ ] `NAME_PATTERN` を定数として切り出した
- [ ] `handleSessionComplete()` のエラーハンドリングを改善した（保存失敗時は通知しない）
- [ ] リファクタリング後に T-01 から T-09 が全件 PASS していることを確認した

## 次の Phase: Phase 9 (phase-9-quality-assurance.md)
