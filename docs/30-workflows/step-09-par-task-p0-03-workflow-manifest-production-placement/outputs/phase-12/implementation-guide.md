# Phase 12: 実装ガイド — TASK-P0-03

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 12                                     |
| タスクID | TASK-P0-03                             |
| 機能名   | workflow-manifest-production-placement |
| 実行日   | 2026-04-04                             |

---

## Part 1: 概念説明（中学生レベル）

### レシピ本の目次の例え

このタスクは「料理ロボットのためのレシピ本の目次を正しい場所に置く」作業です。

**料理ロボット（ManifestLoader）** はレシピ本の **目次（workflow-manifest.json）** を見て動きます。

- 目次がなければ、ロボットは何を作ればいいか分からない
- 目次が壊れていたら、ロボットはエラーを出して止まる

**5つの調理工程（フェーズ）** があります:

1. **材料を決める**（requirements-gathering）— 何が必要かリストアップ
2. **手順を計画する**（plan）— どの順番で作るか決める
3. **実際に作る**（execute）— レシピ通りに調理する
4. **確認する**（verify）— 味見して問題ないかチェック
5. **味を調整する**（improve）— フィードバックをもとに改善

各工程には **「開始の合図」（entry hook）** と **「終了の合図」（exit hook）** があります。

- 開始の合図で「この工程を始めます」と宣言
- 終了の合図で「この工程が終わりました」と報告

**本番の厨房（canonical）** と **予備の厨房（mirror）** に同じ目次を置きます。

- どちらの厨房でも同じ料理が作れるようにするため
- 本番: `.claude/skills/skill-creator/workflow-manifest.json`
- 予備: `.agents/skills/skill-creator/workflow-manifest.json`

---

## Part 2: 技術者レベル

### manifest JSON 構造

トップレベル 6 フィールド（`ALLOWED_TOP_LEVEL_FIELDS` に準拠）:

| フィールド    | 型     | 値                  |
| ------------- | ------ | ------------------- |
| schemaVersion | number | 1                   |
| workflowId    | string | "skill-creator"     |
| phases        | array  | 5 件                |
| resources     | array  | 7 件                |
| entry         | array  | 5 件（entry hooks） |
| exit          | array  | 5 件（exit hooks）  |

### ManifestLoader 検証ステップ

ManifestLoader は 12 の検証ステップで manifest を読み込みます:

1. `ensureTopLevelFields()` — 未許可フィールドの排除
2. schemaVersion === 1 の確認
3. workflowId が非空文字列であることの確認
4. `validateHooks()` — entry/exit hook の id/command 存在・一意性
5. `validateResources()` — resource の id/kind/path の妥当性
6. `validatePhases()` — phase の構造検証
7. `assertPhaseReferences()` — dependsOn/hookId/resourceIds の参照整合
8. `assertResourcePhaseReferences()` — phase ↔ resource の双方向参照
9. `buildResourceDescriptorHash()` — リソースハッシュ生成
10. `buildManifestContentHash()` — manifest 全体ハッシュ生成
11. resource.path のファイル存在確認（optional でない場合）
12. absolutePath の解決と LoadedWorkflowManifest の構築

### テストケース概要

`ManifestLoader.production-manifest.test.ts` — 17 ケース:

- **TC-01〜TC-07**: 本番 manifest の正常読み込み検証（AC-1〜AC-7 対応）
- **AC-2**: canonical/mirror の同一性検証
- **kind/dep 検証**: resource.kind の有効値・dependsOn の順序検証
- **EC-01〜EC-04**: エッジケース（不正 dependsOn、空 kind、空 command、最小構成）
- **RC-01〜RC-03**: リグレッション（path 削除、schemaVersion 変更、workflowId 空文字）

### 配置パス

| 種別      | パス                                                  |
| --------- | ----------------------------------------------------- |
| canonical | `.claude/skills/skill-creator/workflow-manifest.json` |
| mirror    | `.agents/skills/skill-creator/workflow-manifest.json` |

### phase 構造

```
requirements-gathering → plan → execute → verify → improve
```

各 phase は直前の phase に `dependsOn` で依存する直列チェーン構造。

### resource 構造

| resource id              | kind      | path                                 | phase                  |
| ------------------------ | --------- | ------------------------------------ | ---------------------- |
| agent-analyze-request    | agent     | ./agents/analyze-request.md          | requirements-gathering |
| agent-define-boundary    | agent     | ./agents/define-boundary.md          | plan                   |
| ref-core-principles      | reference | ./references/core-principles.md      | plan                   |
| ref-codex-best-practices | reference | ./references/codex-best-practices.md | execute                |
| schema-agent-definition  | schema    | ./schemas/agent-definition.json      | execute                |
| schema-boundary          | schema    | ./schemas/boundary.json              | verify                 |
| agent-analyze-feedback   | agent     | ./agents/analyze-feedback.md         | improve                |

### カバレッジ

| メトリクス | ManifestLoader.ts |
| ---------- | ----------------- |
| Line       | 82.01%            |
| Branch     | 73.72%            |
| Function   | 93.75%            |

### 後続タスク

| タスクID   | タスク名                                         | TASK-P0-03 との関係                        |
| ---------- | ------------------------------------------------ | ------------------------------------------ |
| TASK-P0-04 | ManifestLoader dynamic pipeline デフォルト有効化 | 本タスクで配置した manifest を読み込み先に |
| TASK-P0-07 | AGENT_NAMES の動的解決                           | manifest 内の agent 定義を参照             |
| TASK-P0-09 | permission / hooks / audit ガバナンス            | manifest へ permission/hooks 定義を追加    |
