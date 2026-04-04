# workflow-manifest.json の本番配置 - タスク指示書

```yaml
issue_number: 1887
task_id: TASK-P0-03
task_name: workflow-manifest-production-placement
category: 新機能（Spec P0系）
target_feature: Skill Creator Agent SDK Lane - ManifestLoader/動的パイプライン
priority: 高
scale: 小規模
status: 未実施
source: P0是正パック（manifest未配置が根本原因として特定）
created_date: 2026-04-04
step: 09（並列実行可能）
dependencies: []
```

## メタ情報

| 項目         | 値                                                                  |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | TASK-P0-03                                                          |
| タスク名     | workflow-manifest.json の本番配置                                   |
| 分類         | 新機能（Spec P0系）                                                 |
| 対象機能     | Skill Creator Agent SDK Lane - ManifestLoader / 動的パイプライン    |
| 優先度       | 高                                                                  |
| 見積もり規模 | 小規模                                                              |
| ステータス   | 未実施                                                              |
| 発見元       | P0是正パック（manifest未配置が根本原因として特定）                  |
| 発見日       | 2026-04-04                                                          |
| Step         | 09（並列実行可能）                                                  |
| 依存タスク   | なし（ただし P0-04 / P0-07 / P0-09 はこのタスクの完了を前提とする） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`ManifestLoader` を使った動的パイプラインは TASK-SDK-01〜08 で設計・実装済みである。
`ManifestLoader` はファイルシステム上の `workflow-manifest.json` を読み込み、フェーズ定義・リソース・hooks を動的に解決する責務を持つ。

しかし **`workflow-manifest.json` が本番環境のパスに配置されていない**。
テストフィクスチャ（`apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json`）のみが存在しており、ManifestLoader が実際に読み込める場所には置かれていない。

その結果、ManifestLoader はデフォルト有効化されていないため、動的パイプラインが一切機能していない状態となっている。

### 1.2 問題点・課題

- `workflow-manifest.json` が canonical パス（`.claude/skills/skill-creator/`）に存在しない
- mirror パス（`.agents/skills/skill-creator/`）にも同ファイルが存在しない
- P0-04（ManifestLoader デフォルト有効化）・P0-07（AGENT_NAMES 動的化）・P0-09（permission/hooks ガバナンス）はいずれも本番 manifest の存在を前提とする
- テストフィクスチャの manifest 構造（schemaVersion, phases, resources, entry, exit）と本番 manifest の構造を揃えないと ManifestLoader の検証が通過しない

### 1.3 放置した場合の影響

- ManifestLoader を有効化しても読み込み対象ファイルがなく、動的パイプラインが実行不可のまま残る
- P0-04 / P0-07 / P0-09 が TASK-P0-03 の完了を前提としているため、後続タスクがブロックされる
- skill-creator スキルが実際には静的定義（ハードコード）で動作し続ける

---

## 2. 何を達成するか（What）

### 2.1 目的

`workflow-manifest.json` を本番配置パスに配置し、`ManifestLoader` が実際のパイプライン定義を読み込める状態にする。

### 2.2 最終ゴール

1. `.claude/skills/skill-creator/workflow-manifest.json`（canonical）が配置されている
2. `.agents/skills/skill-creator/workflow-manifest.json`（mirror）が canonical と同一内容で配置されている
3. `ManifestLoader.loadManifest(canonicalManifestPath)` がエラーなく完了し、`workflowId: "skill-creator"` を返す
4. manifest が参照する全 resource ファイルが実在する（`fs.access()` が成功する）
5. manifest が 5 フェーズ（requirements-gathering, plan, execute, verify, improve）を含む
6. `schemaVersion` が `1` である
7. 全 phase の `entryHookId` / `exitHookId` が `entry[]` / `exit[]` に存在する
8. 既存テスト `ManifestLoader.production-manifest.test.ts` の全ケースが PASS する

### 2.3 スコープ

#### 含むもの

- `workflow-manifest.json` の内容定義（workflowId, phases, resources, entry, exit）
- canonical 配置パス（`.claude/skills/skill-creator/workflow-manifest.json`）への配置
- mirror 配置パス（`.agents/skills/skill-creator/workflow-manifest.json`）への配置（canonical と同一内容）
- ManifestLoader が本番 manifest を読み込めることの確認
- manifest スキーマ（`WORKFLOW_MANIFEST_SCHEMA_VERSION = 1`）とフィクスチャの整合確認

#### 含まないもの

- ManifestLoader のデフォルト有効化（P0-04 の責務）
- AGENT_NAMES の動的化（P0-07 の責務）
- permission / hooks 定義の追加（P0-09 の責務）
- manifest の内容変更後のランタイム動作確認（P0-04 完了後に検証）

### 2.4 成果物

| 成果物                           | パス                                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| canonical workflow-manifest.json | `.claude/skills/skill-creator/workflow-manifest.json`                                         |
| mirror workflow-manifest.json    | `.agents/skills/skill-creator/workflow-manifest.json`                                         |
| 統合テスト（既存 - 参照のみ）    | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js / pnpm が利用可能であること
- `.claude/skills/skill-creator/` ディレクトリが存在すること（agents/ / references/ / schemas/ が配置済み）
- `.agents/skills/skill-creator/` ディレクトリが存在すること
- `ManifestLoader.ts` の検証ロジック（schemaVersion, phases, resources, entry, exit の相互参照）を理解していること
- `WORKFLOW_MANIFEST_SCHEMA_VERSION` の値（`1`）を確認していること

### 3.2 依存タスク

なし。このタスク自体は独立して実行できる。

ただし以下のタスクは TASK-P0-03 の完了を前提とする：

- `TASK-P0-04`（ManifestLoader dynamic pipeline のデフォルト有効化）
- `TASK-P0-07`（ハードコードされた AGENT_NAMES の動的解決）
- `TASK-P0-09`（Claude Code SDK permission / hooks / audit ガバナンス）

### 3.3 必要な知識

#### ManifestLoader の動作

`ManifestLoader.loadManifest(manifestPath: string)` は以下の順序で検証する：

1. JSON ファイルを読み込み、トップレベルフィールドが `ALLOWED_TOP_LEVEL_FIELDS`（schemaVersion / workflowId / phases / resources / entry / exit）のみであることを確認する
2. `schemaVersion === 1` を確認する
3. `workflowId` が空でない文字列であることを確認する
4. `entry[]` / `exit[]` それぞれが 1 件以上あり、各要素に `id` / `command` が存在することを確認する
5. `resources[]` 各要素に `id` / `kind` / `path` が存在し、`kind` が `agent|reference|schema|asset` のいずれかであることを確認する
6. `phases[]` 各要素に `id` / `title` / `entryHookId` / `exitHookId` が存在することを確認する
7. 各 phase の `entryHookId` が `entry[]` に、`exitHookId` が `exit[]` に存在することを確認する（クロスリファレンス）
8. `phase.resourceIds[]` が `resources[].id` に存在することを確認する
9. `resource.phaseIds[]` が `phases[].id` に存在し、かつ `phases[].resourceIds[]` と双方向一致することを確認する
10. `phases` の順序を検証する（`dependsOn` で参照される phase が先に定義されていること）
11. 全 resource の `path` を manifest ディレクトリからの相対パスで解決し、`optional` でない場合は `fs.access()` でファイル存在を確認する

#### manifest スキーマ構造

```jsonc
{
  "schemaVersion": 1,
  "workflowId": "<文字列>",
  "phases": [
    {
      "id": "<一意な文字列>",
      "title": "<表示名>",
      "dependsOn": ["<先行phaseのid>"], // 省略可（最初のphaseのみ省略）
      "resourceIds": ["<resources[].id>"], // 省略可
      "entryHookId": "<entry[].id>",
      "exitHookId": "<exit[].id>",
    },
  ],
  "resources": [
    {
      "id": "<一意な文字列>",
      "kind": "agent | reference | schema | asset",
      "path": "<manifestDirからの相対パス>",
      "phaseIds": ["<phases[].id>"], // 省略可
      "optional": false, // 省略可（デフォルト: false）
    },
  ],
  "entry": [{ "id": "<一意な文字列>", "command": "<コマンド説明>" }],
  "exit": [{ "id": "<一意な文字列>", "command": "<コマンド説明>" }],
}
```

#### テスト仕様（ManifestLoader.production-manifest.test.ts）

既存テストが以下の条件を検証する：

- `workflowId` が `"skill-creator"` であること
- `schemaVersion` が `1` であること
- 全 resource の `absolutePath` が実在すること
- `phases` が 5 件（`requirements-gathering`, `plan`, `execute`, `verify`, `improve`）であること
- この順序であること
- `entry[]` / `exit[]` が 1 件以上あること
- canonical と mirror の内容が完全一致すること（バイト単位）
- 最初の phase の `dependsOn` が未定義であること
- 2 番目以降の phase が直前の phase に依存すること（`dependsOn` が前 phase の id を含む）

### 3.4 推奨アプローチ

**テストフィクスチャを参考にしつつ、既存テストの期待値に合わせて manifest を定義する。**

既存テスト（`ManifestLoader.production-manifest.test.ts`）が期待する manifest 構造は明確に定義されているため、テストを先に読み、期待値に合わせた manifest を作成する。

各フェーズが参照する resource は、`.claude/skills/skill-creator/` 配下の **実在するファイル** を指さなければならない。

推奨する 5 フェーズ定義：

| phase id                 | title    | 参照リソース例                                                        |
| ------------------------ | -------- | --------------------------------------------------------------------- |
| `requirements-gathering` | 要件収集 | `agents/analyze-request.md`                                           |
| `plan`                   | 計画策定 | `agents/define-boundary.md`, `references/core-principles.md`          |
| `execute`                | 実行     | `references/codex-best-practices.md`, `schemas/agent-definition.json` |
| `verify`                 | 検証     | `schemas/boundary.json`                                               |
| `improve`                | 改善     | `agents/analyze-feedback.md`                                          |

resource の `path` は manifest ファイルからの相対パス（`./agents/analyze-request.md` 形式）を使用する。

---

## 4. 実行手順

### Phase 1: ManifestLoader 動作確認

#### 目的

ManifestLoader の検証ロジックと `WORKFLOW_MANIFEST_SCHEMA_VERSION` の現在値を確認し、manifest に必要な構造を把握する。

#### 手順

1. `ManifestLoader.ts` を読み込み、`ALLOWED_TOP_LEVEL_FIELDS` の内容を確認する
2. `WORKFLOW_MANIFEST_SCHEMA_VERSION` の値を確認する（`packages/shared/src/types/` 内で定義）
3. `validateHooks()` / `validateResources()` / `validatePhases()` / `assertPhaseReferences()` / `assertResourcePhaseReferences()` の検証ロジックを確認し、manifest が満たすべき制約を整理する
4. `ManifestLoader.production-manifest.test.ts` を読み込み、テストケースの期待値をすべて確認する

#### 成果物

- ManifestLoader が要求する manifest 制約の一覧（メモ）

#### 完了条件

- [ ] `schemaVersion` の期待値（`1`）が確認されている
- [ ] 5 フェーズの `id` が確認されている（テストの期待値と一致）
- [ ] `dependsOn` の順序ルールが理解されている
- [ ] resource の双方向参照（phase ↔ resource）ルールが理解されている

---

### Phase 2: テストフィクスチャ分析

#### 目的

既存テストフィクスチャの manifest 構造と、本番 manifest に必要な構造の差異を把握する。

#### 手順

1. `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` を読み込む
2. フィクスチャの `phases` / `resources` / `entry` / `exit` の構造を確認する
3. `.claude/skills/skill-creator/` 配下に存在するファイル（agents/ / references/ / schemas/）を確認する
4. 本番 manifest が参照できる実在ファイルの一覧を作成する
5. `ManifestLoader.production-manifest.test.ts` の TC-03「全 resource の path が実在ファイルを指す」に合格するため、参照するファイルが実在することを確認する

#### 成果物

- 利用可能な実在ファイルの一覧と、各フェーズへの割り当て案

#### 完了条件

- [ ] 5 フェーズに対応する resource が各 1 件以上実在することが確認されている
- [ ] 各 resource の `path` が `.claude/skills/skill-creator/` から相対パスで解決できることが確認されている

---

### Phase 3: 本番 manifest 設計

#### 目的

canonical に配置する `workflow-manifest.json` の内容を確定する。

#### 手順

1. 以下の制約を満たす manifest JSON を設計する：
   - `schemaVersion: 1`
   - `workflowId: "skill-creator"`
   - `phases` に 5 件（`requirements-gathering`, `plan`, `execute`, `verify`, `improve`）を定義
   - 各 phase は `id` / `title` / `entryHookId` / `exitHookId` を持つ
   - `requirements-gathering` の `dependsOn` は省略する（最初の phase）
   - `plan` 以降は直前 phase に依存する（`dependsOn: ["<前phaseId>"]`）
   - 各 phase に `resourceIds` を 1 件以上割り当てる
   - `resources` に各リソースを定義し、`kind` / `path` / `phaseIds` を正確に設定する
   - `entry` に 5 件（各 phase 用）を定義する
   - `exit` に 5 件（各 phase 用）を定義する
2. resource の双方向参照が一致することを手動で検証する（`phase.resourceIds` と `resource.phaseIds` の対称性）
3. 参照するすべてのファイルが `.claude/skills/skill-creator/` 配下に実在することを確認する

#### 成果物

- 確定した manifest JSON（テキスト）

#### 完了条件

- [ ] 5 フェーズが正しい順序で定義されている
- [ ] 全 resource が実在ファイルを指している
- [ ] phase / resource の双方向参照が一致している
- [ ] entry / exit の hook が全 phase の `entryHookId` / `exitHookId` をカバーしている

---

### Phase 4: 配置・mirror 同期

#### 目的

canonical と mirror の両方に manifest を配置する。

#### 手順

1. 設計した manifest JSON を `.claude/skills/skill-creator/workflow-manifest.json` として書き込む
2. 同一内容を `.agents/skills/skill-creator/workflow-manifest.json` として書き込む
3. 両ファイルのバイト数が一致することを確認する（`wc -c` または diff で確認）
4. `.agents/skills/skill-creator/` に対応する resource ファイルが存在するか確認する。存在しない場合は canonical と同様に必要なファイルを配置する（または `.agents/` が `.claude/` を参照する仕組みがあるか確認する）

#### 成果物

- 配置済み canonical `workflow-manifest.json`
- 配置済み mirror `workflow-manifest.json`

#### 完了条件

- [ ] `.claude/skills/skill-creator/workflow-manifest.json` が存在する
- [ ] `.agents/skills/skill-creator/workflow-manifest.json` が存在する
- [ ] 両ファイルの内容が完全一致する

---

### Phase 5: 動作確認

#### 目的

ManifestLoader が本番 manifest を正しく読み込めることを確認する。

#### 手順

1. 以下のテストを実行する：
   ```bash
   pnpm --filter @repo/desktop test ManifestLoader.production-manifest
   ```
2. テストが全件 PASS することを確認する
3. 失敗した場合は、エラーメッセージから原因を特定する：
   - `schemaVersion は 1 のみ受理します` → schemaVersion の値を確認する
   - `phases[N].entryHookId が entry に存在しません` → entry の id と phase の entryHookId を照合する
   - `resource X の phaseId が未定義です` → phaseIds と phases の id を照合する
   - `resource X の path が存在しない` → path の相対パスが正しいか、ファイルが実在するかを確認する
   - `canonical と mirror の manifest が同一内容である` が失敗 → 両ファイルの内容を diff で確認する
4. 全テスト PASS 後、既存の ManifestLoader 全テストが通ることを確認する：
   ```bash
   pnpm --filter @repo/desktop test ManifestLoader
   ```

#### 成果物

- テスト実行結果（全 PASS）

#### 完了条件

- [ ] `ManifestLoader.production-manifest.test.ts` の全テストケースが PASS
- [ ] `ManifestLoader.test.ts` の既存テストが PASS（リグレッションなし）

---

### Phase 6: エッジケース・リグレッション確認

#### 目的

意図しない変更が既存の動作を破壊していないことを確認する。

#### 手順

1. 本番 manifest を一時的に変更してエラーが正しく検出されることを確認する（エッジケーステスト `TASK-P0-03: edge case & regression tests` を実行する）：
   ```bash
   pnpm --filter @repo/desktop test ManifestLoader.production-manifest
   ```
2. エッジケーステスト（EC-01〜RC-03）が全 PASS することを確認する
3. `pnpm --filter @repo/desktop typecheck` を実行しエラーがないことを確認する
4. `pnpm --filter @repo/desktop lint` を実行しエラーがないことを確認する

#### 成果物

- エッジケーステスト実行結果（全 PASS）

#### 完了条件

- [ ] EC-01〜RC-03 が全 PASS
- [ ] 型エラーなし
- [ ] lint エラーなし

---

### Phase 12: 中学生レベルの概念説明

このタスクで何をしているか、身近な例で説明します。

**例え: レシピ本の目次を作る**

料理ロボット（ManifestLoader）は「何をどの順番で作るか」が書かれた目次（workflow-manifest.json）を見て動きます。

目次には 5 つの調理工程（フェーズ）が書かれています：

1. 材料を決める（要件収集）
2. 手順を計画する（計画策定）
3. 実際に作る（実行）
4. できあがりを確認する（検証）
5. 味を調整する（改善）

各工程には「作業開始の合図」（entry hook）と「作業終了の合図」（exit hook）があり、必要な材料（resource）が指定されています。

料理ロボットには「試作用の目次」（テストフィクスチャ）はすでにありますが、本番の厨房（`.claude/skills/skill-creator/`）に目次が置かれていませんでした。このタスクは本番の厨房に目次を置く作業です。

また、同じ目次を予備の厨房（`.agents/skills/skill-creator/`）にも置いておきます（mirror）。これにより、どちらの厨房でも同じレシピで動作できます。

---

### Phase 13: PR 作成

#### 目的

変更を main ブランチにマージする PR を作成する。

#### 手順

1. ブランチが最新の main と同期されていることを確認する
2. 以下が全 PASS であることを確認する：
   ```bash
   pnpm --filter @repo/desktop test ManifestLoader
   pnpm --filter @repo/desktop typecheck
   pnpm --filter @repo/desktop lint
   ```
3. PR を作成する。タイトル: `feat(manifest): TASK-P0-03 workflow-manifest.json 本番配置`
4. PR 本文に以下を記載する：
   - 配置したファイルのパス（canonical / mirror）
   - テスト通過件数
   - 後続タスク（P0-04 / P0-07 / P0-09）との依存関係
5. CI が全 PASS であることを確認する

#### 成果物

- GitHub PR

#### 完了条件

- [ ] PR が作成されている
- [ ] CI が全 PASS

---

## 5. 完了条件チェックリスト

### 機能要件（AC）

- [ ] AC-1: `.claude/skills/skill-creator/workflow-manifest.json` が存在する
- [ ] AC-2: `.agents/skills/skill-creator/workflow-manifest.json` が存在し、canonical と同一内容である
- [ ] AC-3: `ManifestLoader.loadManifest(canonicalManifestPath)` がエラーなく完了する
- [ ] AC-4: 全 resource の `absolutePath` が実在ファイルを指す（`fs.access()` が成功する）
- [ ] AC-5: `phases` が 5 件（requirements-gathering, plan, execute, verify, improve）をこの順序で含む
- [ ] AC-6: `schemaVersion` が `1` である
- [ ] AC-7: 全 phase の `entryHookId` が `entry[]` に、`exitHookId` が `exit[]` に存在する

### 品質要件

- [ ] `ManifestLoader.production-manifest.test.ts` の全テストケース（TC-01〜RC-03）が PASS
- [ ] `ManifestLoader.test.ts` の既存テストが PASS（リグレッションなし）
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし

---

## 6. 検証方法

### テストコマンド

```bash
# 本番 manifest 統合テストのみ実行
pnpm --filter @repo/desktop test ManifestLoader.production-manifest

# ManifestLoader 全テスト実行（リグレッション確認）
pnpm --filter @repo/desktop test ManifestLoader

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

### テストケース一覧

| テストID | 内容                                                   | 期待結果                                                            |
| -------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| TC-01    | canonical を `loadManifest()` で読み込む               | エラーなし、workflowId が "skill-creator"                           |
| TC-02    | schemaVersion が 1 である                              | `manifest.schemaVersion === 1`                                      |
| TC-03    | 全 resource の path が実在ファイルを指す               | 全 `absolutePath` で `fs.access()` 成功                             |
| TC-04    | phases が 5 件を含む                                   | `manifest.phases.length === 5`、正しい順序                          |
| TC-05    | entry/exit hooks が定義されている                      | `entry.length > 0`、`exit.length > 0`、各 hook に id / command あり |
| TC-06    | 全 phase の entryHookId が entry[] に存在する          | Set に全 entryHookId が含まれる                                     |
| TC-07    | 全 phase の exitHookId が exit[] に存在する            | Set に全 exitHookId が含まれる                                      |
| AC-2     | canonical と mirror の manifest が同一内容である       | `canonicalContent === mirrorContent`                                |
| EC-01    | dependsOn に存在しない phase ID を指定すると拒否される | `rejects.toThrow("dependsOn が未定義です")`                         |
| EC-02    | resource の kind が空文字だと拒否される                | `rejects.toThrow()`                                                 |
| EC-03    | entry hook の command が空文字だと拒否される           | `rejects.toThrow()`                                                 |
| EC-04    | phases が 1 つでも検証は通過する                       | `manifest.phases.length === 1`                                      |
| RC-01    | resource path のファイル削除を検出する                 | `rejects.toThrow()`                                                 |
| RC-02    | schemaVersion 変更を検出する                           | `rejects.toThrow("schemaVersion は 1 のみ受理します")`              |
| RC-03    | workflowId が空文字だと拒否される                      | `rejects.toThrow()`                                                 |

### 手動確認手順

1. canonical ファイルの存在確認：
   ```bash
   ls -la .claude/skills/skill-creator/workflow-manifest.json
   ```
2. mirror ファイルの存在確認：
   ```bash
   ls -la .agents/skills/skill-creator/workflow-manifest.json
   ```
3. canonical と mirror の差分確認：
   ```bash
   diff .claude/skills/skill-creator/workflow-manifest.json \
        .agents/skills/skill-creator/workflow-manifest.json
   ```
   （差分がゼロであることを確認）
4. manifest の JSON 構文検証：
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('.claude/skills/skill-creator/workflow-manifest.json', 'utf-8')); console.log('JSON valid')"
   ```

---

## 7. リスクと対策

| リスク                                                                  | 影響度 | 発生確率 | 対策                                                                                                                                                    |
| ----------------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| resource の双方向参照（phase ↔ resource）が一致しない                   | 高     | 中       | Phase 3 で設計時に手動で対称性を確認する。ManifestLoader の `assertResourcePhaseReferences()` が最終的に検出する                                        |
| 参照先 resource ファイルが `.claude/skills/skill-creator/` に存在しない | 高     | 低       | Phase 2 でファイル一覧を確認し、実在するファイルのみを resource として定義する                                                                          |
| canonical と mirror の内容が一致しない                                  | 中     | 低       | 書き込み後に `diff` で確認する。テスト TC-08（canonical と mirror の一致）が検出する                                                                    |
| `.agents/skills/skill-creator/` に対応 resource が存在しない            | 中     | 中       | `.agents/` 配下の resource ファイルを確認し、存在しない場合は canonical からコピーするか、`optional: true` にするか判断する                             |
| manifest の配置パスが ManifestLoader に渡される期待パスと異なる         | 高     | 低       | `ManifestLoader.production-manifest.test.ts` のパス定義（`projectRoot + "/.claude/skills/skill-creator/workflow-manifest.json"`）を確認してから配置する |
| P0-04 実装前に manifest を誤って有効化してしまう                        | 低     | 低       | このタスクは manifest ファイルの配置のみを行う。ManifestLoader の有効化は P0-04 の責務であり、本タスクでは変更しない                                    |

---

## 8. 参照情報

### 苦戦箇所

#### 苦戦箇所 1: 配置パスの正規化

ManifestLoader は `manifestPath` を `path.resolve()` で絶対パスに変換してから読み込む。
配置パスとして `.claude/skills/skill-creator/workflow-manifest.json`（プロジェクトルートからの相対パス）を使用する。

テスト `ManifestLoader.production-manifest.test.ts` は以下のようにパスを定義している：

```typescript
const projectRoot = path.resolve(__dirname, "../../../../../../..");
const canonicalManifestPath = path.join(
  projectRoot,
  ".claude/skills/skill-creator/workflow-manifest.json",
);
```

`__dirname` は `apps/desktop/src/main/services/runtime/__tests__/` であり、7 階層上がプロジェクトルートとなる。

#### 苦戦箇所 2: 単一 root 原則（ハードコード禁止）

設計原則として「`skill-creator` の呼び出し対象は常に `.claude/skills/skill-creator/` を正本として動的解決し、ハードコードしたスキル内容へ置き換えない」が定められている（P0 是正パック設計原則より）。

`workflow-manifest.json` は `.claude/skills/skill-creator/` を canonical root とし、`.agents/skills/skill-creator/` を mirror として配置する。この 2 パスはテストで参照するため変更できないが、アプリケーションコード側で manifest パスをハードコードすることは P0-04 の設計判断に委ねる。

#### 苦戦箇所 3: テストフィクスチャとの構造の揃え方

テストフィクスチャ（`__tests__/fixtures/workflow-manifest/workflow-manifest.json`）は `workflowId: "task-sdk-01-foundation"` で 2 フェーズの最小構成である。本番 manifest は `workflowId: "skill-creator"` で 5 フェーズ構成が必要であり、フィクスチャとは異なる構造となる。

フィクスチャはあくまで ManifestLoader の検証ロジック自体のテスト用であり、本番 manifest の設計はテスト `ManifestLoader.production-manifest.test.ts` の期待値を正とする。

### 関連ドキュメント

| ドキュメント                         | パス                                                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| ManifestLoader 実装                  | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                           |
| 本番 manifest 統合テスト             | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts`        |
| テストフィクスチャ                   | `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` |
| P0 是正パック（設計方針）            | `docs/30-workflows/skill-creator-agent-sdk-lane/p0-verify-manifest-remediation-pack.md`              |
| canonical skill-creator ディレクトリ | `.claude/skills/skill-creator/`                                                                      |
| mirror skill-creator ディレクトリ    | `.agents/skills/skill-creator/`                                                                      |
| 後続タスク: ManifestLoader 有効化    | `docs/30-workflows/unassigned-task/task-p0-04-manifest-loader-default-startup.md`                    |

---

## 9. 備考

### 現状確認（2026-04-04 時点）

調査の結果、以下の状態が確認されている：

- **canonical パス** `.claude/skills/skill-creator/workflow-manifest.json` は **すでに存在する**
- **mirror パス** `.agents/skills/skill-creator/workflow-manifest.json` は **すでに存在する**
- 両ファイルの内容は同一（5 フェーズ定義済み）

ただし、本タスク仕様書はこれらが「未配置」という前提で起票されたものであり、現在の配置状態がすべての AC を満たしているかどうかを **テスト実行で確認する必要がある**。

テストが全件 PASS であれば、このタスクは実質的に完了状態である。テストが失敗する場合は、本仕様書の手順に従い manifest を修正・再配置する。

### テスト実行による状態確認コマンド

```bash
pnpm --filter @repo/desktop test ManifestLoader.production-manifest
```

### 後続タスクへの影響

本タスク完了後、以下のタスクが着手可能になる：

- `TASK-P0-04`: ManifestLoader を動的パイプラインのデフォルトとして有効化する
- `TASK-P0-07`: AGENT_NAMES を manifest から動的解決する
- `TASK-P0-09`: permission / hooks / audit ガバナンスの統合（P0-04 完了後）

### resource の実在ファイル確認方法

```bash
# skill-creator に存在するエージェント一覧
ls .claude/skills/skill-creator/agents/

# skill-creator に存在するリファレンス一覧
ls .claude/skills/skill-creator/references/

# skill-creator に存在するスキーマ一覧
ls .claude/skills/skill-creator/schemas/
```
