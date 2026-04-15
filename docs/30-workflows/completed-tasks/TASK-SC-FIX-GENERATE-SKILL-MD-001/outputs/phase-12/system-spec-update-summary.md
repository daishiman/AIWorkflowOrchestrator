# Phase 12 成果物: システム仕様更新サマリ

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 12                                |
| タスクID | TASK-SC-FIX-GENERATE-SKILL-MD-001 |
| 作成日   | 2026-04-15                        |

## Step 1-A: 完了タスク記録

### artifacts.json 更新（current → completed）

`docs/30-workflows/TASK-SC-FIX-GENERATE-SKILL-MD-001/artifacts.json` の `status` は `completed` に更新済み。

### タスク完了記録

- `TASK-SC-FIX-GENERATE-SKILL-MD-001`: **completed**
- 完了内容: `generate_skill_md.js` への `--plan`/`--output` 引数修正完了（`skillName` 付き plan JSON + UUID tmp ファイル + 存在確認 + fallback 強化）

## Step 1-B: 実装状況テーブル

| タスクID                          | 内容                                                   | ステータス   |
| --------------------------------- | ------------------------------------------------------ | ------------ |
| TASK-SC-FIX-GENERATE-SKILL-MD-001 | `generate_skill_md.js` の `--plan`/`--output` 引数修正 | ✅ completed |

## Step 2: システム仕様の current facts

### `SkillCreatorService.generateSkillMd` の現在のコントラクト

**呼び出しシグネチャ（内部実装）**:

```typescript
// createSkill() 内の SKILL.md 生成ブロック
const skillMdPath = path.join(skillDir, "SKILL.md");
const tmpPlanPath = path.join(os.tmpdir(), `skill-plan-${randomUUID()}.json`);
// try/finally で cleanup 保証
```

**plan JSON 構造**:

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

**スクリプト呼び出し引数**:

```
["--plan", tmpPlanPath, "--output", path.join(skillDir, "SKILL.md")]
```

### 判定テーブル

| 項目                                         | 判定        | 理由                                           |
| -------------------------------------------- | ----------- | ---------------------------------------------- |
| `SkillCreatorService.createSkill` の公開 API | no-op       | シグネチャ変更なし                             |
| `generate_skill_md.js` の呼び出し引数        | **updated** | `--path` → `--plan`/`--output`                 |
| tmpファイル生成と cleanup                    | **updated** | UUID tmp ファイル + finally 節で削除           |
| `ensureSkillMdExists` フォールバック         | **updated** | 生成後の SKILL.md 存在確認後にのみ発火する経路 |
