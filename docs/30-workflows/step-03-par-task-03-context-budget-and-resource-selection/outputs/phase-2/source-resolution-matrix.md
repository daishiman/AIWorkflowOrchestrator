# Source Resolution Matrix

Task03 の planner は `WorkflowManifestPhase.resourceIds` を required set の一次根拠とし、candidate root 解決はその resource set を満たすための補完レイヤーとして扱う。

## Candidate Root 優先順位

| 優先順位 | source                        | 使う条件                                                                                   | validation                                                                            | 選択時に残す provenance                                                                                      |
| -------- | ----------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1        | manifest absolute path        | `LoadedWorkflowManifest.resources[].absolutePath` があり、phase の required set と整合する | `ManifestLoader` validate / normalize 済み、optional 欠落は selection 時に degrade 化 | `sourcePath`、`manifestDir`、`manifestMtimeMs`、`resourceDescriptorHash`、`cacheKey`、resource absolute path |
| 2        | explicit path / request input | runtime request / workflow config が明示する                                               | absolute path、required markers 存在                                                  | root path、resolver mode=`explicit`                                                                          |
| 3        | env / configured roots        | `AIWORKFLOW_SKILL_CREATOR_PATH` など設定済み候補がある                                     | `SKILL.md` + `scripts/` + required kind directory                                     | root path、resolver mode=`env`                                                                               |
| 4        | home managed roots            | `~/.aiworkflow/skills/**` 配下で `skill-creator` 構造が見つかる                            | structure signature と required resources                                             | root path、resolver mode=`home`                                                                              |
| 5        | repo bundled root             | `.claude/skills/skill-creator` など同梱候補                                                | current workspace に存在し required markers がある                                    | root path、resolver mode=`repo`                                                                              |

## Structure Signature

| 項目                     | 必須     | 用途                           |
| ------------------------ | -------- | ------------------------------ |
| `SKILL.md`               | ✅       | entry marker                   |
| `scripts/`               | ✅       | executable workflow markers    |
| `agents/`                | 条件付き | `plan` / `improve` 系 resource |
| `references/`            | 条件付き | contextual read                |
| `assets/`                | 条件付き | template / prompt asset        |
| `schemas/`               | 条件付き | validation schema              |
| `workflow-manifest.json` | 条件付き | manifest-first path 解決       |

## Conflict Rule

| ケース                                    | ルール                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| 同一 `resourceId` が複数 root に存在      | 優先順位の高い root を採択し、lower root は conflict note に残す                           |
| higher root に required marker が足りない | lower root へ切り替えるが degrade reason を残す                                            |
| required resource がどの root にもない    | selection を停止し `required_resource_missing` を返す                                      |
| optional resource だけ欠落                | degrade して継続し、drop list に記録する                                                   |
| manifest 側で optional resource が欠落    | loader failure にせず、Task03 側で `provenance_incomplete` または optional drop として扱う |
