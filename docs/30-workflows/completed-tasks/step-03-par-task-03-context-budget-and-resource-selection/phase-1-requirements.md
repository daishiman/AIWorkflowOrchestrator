# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 1                                     |
| 機能名 | context-budget-and-resource-selection |
| 作成日 | 2026-03-26                            |

## 目的

phase / operation ごとに必要な prompt / agent / reference だけを読む要件を定義し、`skill-creator` の配置先や file layout が固定でなくても解決できる前提を固める。

## 実行タスク

- source discovery 要件を定義する
- resource selection 方針を定義する
- token budget 方針を定義する
- source provenance と lane-neutral degrade 条件を定義する

## 要件レビュー一次結論

| 項目                       | 結論                                                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点                   | `skill-creator` をどこから読むかを compile-time の固定 path に閉じ込めず、runtime で説明可能にすること                           |
| 依存関係・責務境界の問題点 | Task01 は manifest absolute path を出せるが、固定 path fallback と budget/degrade は Task03 で整理しないと downstream がばらける |
| 価値とコストの不均衡       | 複数 root 解決と provenance 固定は高価値だが、UI 表示や governance まで同時に持つと task が膨張する                              |
| 改善優先順位               | 1. source discovery 2. provenance 3. resource selection 4. budget 5. degrade trigger                                             |
| 4条件評価                  | 価値性: 高 / 実現性: 高 / 整合性: Task01/02 を再利用可能 / 運用性: Task07/08 へ handoff すれば維持可能                           |

## 参照資料

| 資料名       | パス                                                                    | 説明                                 |
| ------------ | ----------------------------------------------------------------------- | ------------------------------------ |
| 要件草案     | `../requirements-draft.md`                                              | lane 全体の背景と source drift 前提  |
| 親 workflow  | `../root-workflow-pack/index.md`                                        | predecessor / downstream matrix      |
| Task01 index | `../../step-01-seq-task-01-manifest-contract-foundation/index.md`       | manifest contract と loader boundary |
| Task02 index | `../step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md` | owner と source snapshot の受け皿    |

### システム仕様（aiworkflow-requirements）

| 参照資料                      | パス                                                                                        | 内容                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Runtime public IPC 契約       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | runtime public surface の current contract |
| Runtime / handoff 設計        | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | `RuntimePolicyResolver` / response union   |
| Skill reference               | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | `ResourceLoader` の current API            |
| execution capability contract | `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md`   | `ResourceLoader` DI と follow-up           |

### 現行コードアンカー

| ファイル                                                              | 観察点                                                                                                |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/ResourceLoader.ts`              | 単一 `basePath` の leaf reader であり、source authority ではない                                      |
| `apps/desktop/src/main/services/skill/constants.ts`                   | `DEFAULT_SKILL_CREATOR_PATH` の候補列と限界                                                           |
| `apps/desktop/src/main/ipc/index.ts`                                  | `new ResourceLoader(DEFAULT_SKILL_CREATOR_PATH)` が固定注入されている                                 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `plan()` が固定 3 agent を読む                                                                        |
| `apps/desktop/src/main/services/runtime/ManifestLoader.ts`            | `sourcePath` / `manifestDir` / `manifestMtimeMs` / `resourceDescriptorHash` / `cacheKey` を生成できる |

## 実行手順

### ステップ1: source discovery 要件を固定する

- source root は単一固定 path を正本としない。
- foundation snapshot は `LoadedWorkflowManifest` の current canonical fields をそのまま使い、Task03 側で別名に再定義しない。
- 候補列は `manifest resource descriptor`、`explicit path / request input`、`env/configured roots`、`home managed roots`、`repo bundled root` の順で扱う。
- 候補 root ごとに `SKILL.md`、`scripts/`、`agents/`、`references/`、`assets/`、`schemas/`、`workflow-manifest.json` の有無から structure signature を作る。

### ステップ2: resource selection 要件を固定する

- selection は operation / phase / resource kind / required-optional / priority tier で決める。
- required set の一次根拠は `WorkflowManifestPhase.resourceIds` とし、budget tier はその上に重ねる二次選別とする。
- `plan` は agent prompt と最小 reference を優先し、`execute` は task-specific prompt と schema、`improve` は current skill content と improvement prompt、`verify` は contract / rule set を優先する。
- 同名 resource が複数 root にある場合は優先順位と conflict rule を明記する。

### ステップ3: provenance と degrade を固定する

- foundation snapshot として `sourcePath`、`manifestDir`、`manifestMtimeMs`、`resourceDescriptorHash`、`cacheKey` を保持し、Task03 extension と分離する。
- Task03 extension として resolved root、resolved resource path、selected/dropped resource、structure signature を残す。
- budget overflow、required resource missing、multi-root conflict、structure mismatch を lane-neutral degrade trigger として定義する。
- optional resource 欠落は `ManifestLoader` の validation failure にせず、Task03 selection で degrade へ変換する。
- `integrated_api` / `terminal_handoff` への route choice と disclosure 文言は Task07 に委譲する。

## 統合テスト連携

- Phase 4 で multi-root discovery、structure variant、budget overflow、required/optional resource を test matrix 化する。
- Phase 7 で resource kind と candidate root の coverage を確認する。
- Phase 9 で固定 path 前提と silent fallback が残っていないか監査する。

## 成果物

| 成果物              | パス                                     | 説明                                |
| ------------------- | ---------------------------------------- | ----------------------------------- |
| 要件定義書          | `phase-1-requirements.md`                | Task03 の要件固定                   |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | spec source と code anchor の対応表 |

## 完了条件

- [ ] 全読み込みをしない方針が明記されている
- [ ] 単一固定 directory を正本にしない source discovery 方針が明記されている
- [ ] source provenance と degrade 条件が定義されている
- [ ] degrade 条件と lane choice の責務境界が分離されている
- [ ] **本Phase内の全タスクを100%実行完了**
