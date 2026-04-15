# Phase 2: 設計

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 2                                 |
| Phase名    | 設計                              |
| 対象機能   | TASK-SC-FIX-GENERATE-SKILL-MD-001 |
| 前提Phase  | Phase 1: 要件定義                 |
| 次Phase    | Phase 3: 設計レビュー             |
| ステータス | pending                           |
| 作成日     | 2026-04-14                        |

## 目的

B案（`SkillCreatorService` 側で構造計画 JSON を組み立て、tmp ファイル経由で `--plan` / `--output` 渡し）の
具体的な実装設計を確定する。修正対象行・import 追加・tmp JSON 構造・cleanup 設計を定義する。

## 実行タスク

### Task 1: 修正箇所の特定

修正対象は `SkillCreatorService.ts` の以下の範囲：

```
行 152: // SKILL.md生成
行 153: const skillMdPath = path.join(skillDir, "SKILL.md");
行 154: const tmpPlanPath = path.join(os.tmpdir(), `skill-plan-${randomUUID()}.json`);
行 155: try {
行 156:   const plan = {
行 157:     skillName: options.name,
行 158:     workflow: {
行 159:       summary: options.description,
行 160:       anchors: [],
行 161:       trigger: {
行 162:         description: `Use when ${options.name} is requested`,
行 163:         keywords: [options.name],
行 164:       },
行 165:       phases: [],
行 166:       tasks: [],
行 167:     },
行 168:     directories: {},
行 169:     files: [],
行 170:   };
行 171:   await fs.writeFile(tmpPlanPath, JSON.stringify(plan), "utf-8");
行 172:   const generateResult = await this.scriptExecutor.execute(
行 173:     "generate_skill_md.js",
行 174:     ["--plan", tmpPlanPath, "--output", skillMdPath],
行 175:   );
行 176:   let shouldUseFallback = !generateResult.success;
行 177:   if (!shouldUseFallback) {
行 178:     try {
行 179:       await fs.access(skillMdPath);
行 180:     } catch {
行 181:       shouldUseFallback = true;
行 182:     }
行 183:   }
行 184:   if (shouldUseFallback) {
行 185:     await this.ensureSkillMdExists(skillDir, options.name, options.description);
行 186:   }
行 187: } finally {
行 188:   await fs.unlink(tmpPlanPath).catch(() => {});
行 189: }
```

行 152 の `ensureSkillMdExists` は init 直後の最低限保証として維持する（削除しない）。
行 155-165 の `generate_skill_md.js` 呼び出しブロックを B案の実装で置き換える。

### Task 2: 追加 import の設計

`SkillCreatorService.ts` の先頭（行 1-8 付近）に以下の import を追加する：

```typescript
import os from "os";
```

既存の import 状況：

- `path` → 行 8 に `import path from "path";` が存在する
- `fs/promises` → 行 9 に `import fs from "fs/promises";` が存在する
- `os` → 現時点では import なし → **追加が必要**

### Task 3: 構造計画 JSON の最小形設計

`generate_skill_md.js` が `--plan` で受け取る JSON の最小構造：

```json
{
  "skillName": "<options.name>",
  "workflow": {
    "summary": "<options.description>",
    "anchors": [],
    "trigger": {
      "description": "Use when <skillName> is requested",
      "keywords": ["<skillName>"]
    },
    "phases": [],
    "tasks": []
  },
  "directories": {},
  "files": []
}
```

- `skillName`: スキル名（必須）
- `workflow.summary`: スキルの説明（必須）
- `workflow.tasks`: タスク一覧（空配列で最小動作可能）
- `workflow.anchors` / `workflow.trigger` / `workflow.phases`: 生成スクリプトの必須補助情報

tmp ファイルのパス設計：

- `os.tmpdir()` を使用してシステムの一時ディレクトリに配置
- ファイル名: `skill-plan-${randomUUID()}.json`（並列実行時の衝突を避けるため UUID を付与）
- エンコーディング: `utf-8`

### Task 4: tmp ファイル生成・スクリプト呼び出し・cleanup の設計

置き換え後のブロック設計：

```typescript
// SKILL.md生成
const tmpPlanPath = path.join(os.tmpdir(), `skill-plan-${randomUUID()}.json`);
try {
  const plan = {
    skillName: options.name,
    workflow: {
      summary: options.description,
      anchors: [],
      trigger: {
        description: `Use when ${options.name} is requested`,
        keywords: [options.name],
      },
      phases: [],
      tasks: [],
    },
    directories: {},
    files: [],
  };
  await fs.writeFile(tmpPlanPath, JSON.stringify(plan), "utf-8");
  const generateResult = await this.scriptExecutor.execute(
    "generate_skill_md.js",
    ["--plan", tmpPlanPath, "--output", path.join(skillDir, "SKILL.md")],
  );
  if (!generateResult.success) {
    await this.ensureSkillMdExists(skillDir, options.name, options.description);
  }
} finally {
  await fs.unlink(tmpPlanPath).catch(() => {});
}
```

設計上の決定事項：

- `try/finally` でスクリプト成功・失敗・例外のすべての経路で cleanup を保証（AC-5 対応）
- `finally` 内の `fs.unlink` は `.catch(() => {})` で吸収（tmp ファイルが存在しない場合のエラーを無視）
- スクリプト失敗時（`!generateResult.success`）はフォールバックを維持（AC-4 対応）
- `--output` には `path.join(skillDir, "SKILL.md")` を使用して出力先を明示

### Task 5: スクリプト不在時のフォールバック経路確認

`generate_skill_md.js` スクリプトが存在しない場合：

1. `scriptExecutor.execute` がスクリプト不在エラーを返す
2. `generateResult.success` が `false` になる
3. `ensureSkillMdExists` が呼ばれ、YAML フロントマターと `## Task一覧` を含むフォールバック SKILL.md が生成される（AC-4 対応）
4. `finally` 節で tmp json が削除される（AC-5 対応）

この経路は既存の `isMissingScriptError` ヘルパーの挙動と整合している。

## 参照資料

| 資料名              | パス                                                          | 説明                  |
| ------------------- | ------------------------------------------------------------- | --------------------- |
| 要件定義            | `phase-1-requirements.md`                                     | AC-1〜AC-5 の照合基準 |
| SkillCreatorService | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 修正対象ファイル      |

## 統合テスト連携

- tmp ファイルの生成・削除は fs モックで観測可能な設計とする
- `scriptExecutor.execute` の第 2 引数（args 配列）をテストで検証可能にする

## 成果物

| 成果物 | パス                        | 説明                                                     |
| ------ | --------------------------- | -------------------------------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | 修正箇所・import 追加・tmp JSON 構造・cleanup 設計の詳細 |

## 完了条件

- [ ] 修正対象行（152-188）が特定されている
- [ ] 追加 import（`os`）が設計に含まれている
- [ ] 構造計画 JSON の最小形が定義されている
- [ ] tmp ファイル生成・cleanup の設計が確定している
- [ ] スクリプト不在時のフォールバック経路が設計に含まれている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次 Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
