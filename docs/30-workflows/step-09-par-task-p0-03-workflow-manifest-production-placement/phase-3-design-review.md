# Phase 3: 設計レビュー

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 3                                      |
| タスクID   | TASK-P0-03                             |
| 機能名     | workflow-manifest-production-placement |
| カテゴリ   | 新機能（Spec P0系）                    |
| タスク分類 | NON_VISUAL（UIタスクではない）         |
| 作成日     | 2026-04-04                             |

## 目的

Phase 2 で設計した `workflow-manifest.json` の構造が ManifestLoader の全検証ステップを通過し、既存テスト 17 ケースの期待値と完全に一致することをレビューにより確認する。

## 実行タスク

- manifest スキーマ整合性の検証（ALLOWED_TOP_LEVEL_FIELDS 準拠）
- resource path の実在確認（全 path が skill-creator ディレクトリ配下に存在）
- phase ↔ resource 双方向参照の対称性検証
- dependsOn 順序の正当性検証
- entry/exit hook の entryHookId/exitHookId カバレッジ検証
- canonical / mirror 同一性の確保方法の妥当性確認
- テスト期待値との突合

## 参照資料

| 資料名                     | パス                                                                                                 | 説明                |
| -------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------- |
| Phase 1                    | `phase-1-requirements.md`                                                                            | 要件定義            |
| Phase 2                    | `phase-2-design.md`                                                                                  | 設計                |
| ManifestLoader             | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                           | 検証ロジック本体    |
| production-manifest テスト | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts`        | テスト期待値        |
| テストフィクスチャ         | `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` | 構造リファレンス    |
| canonical manifest（現状） | `.claude/skills/skill-creator/workflow-manifest.json`                                                | 現在の本番 manifest |
| 要件定義書                 | `outputs/phase-1/requirements.md`                                                                    | Phase 1 成果物      |
| 設計書                     | `outputs/phase-2/design.md`                                                                          | Phase 2 成果物      |

### システム仕様（aiworkflow-requirements）

| 参照対象                     | パス                                                                                        | 要点                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| workflow manifest foundation | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | `WorkflowManifest*` / `LoadedWorkflowManifest` / `ManifestLoader` の read / validate 契約      |
| orchestration boundary       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`           | `ManifestLoader` は workflow foundation であり state owner ではない                            |
| owner separation             | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | `ManifestLoader` は route/state authority を持たず `SkillCreatorWorkflowEngine` と責務分離する |

### システム仕様（aiworkflow-requirements）

| 参照対象                     | パス                                                                                        | 要点                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| workflow manifest foundation | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | `WorkflowManifest*` / `LoadedWorkflowManifest` / `ManifestLoader` の read / validate 契約      |
| orchestration boundary       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`           | `ManifestLoader` は workflow foundation であり state owner ではない                            |
| owner separation             | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | `ManifestLoader` は route/state authority を持たず `SkillCreatorWorkflowEngine` と責務分離する |

## 実行手順

### ステップ1: manifest スキーマ整合性の検証

Phase 2 の設計 JSON が `ALLOWED_TOP_LEVEL_FIELDS` に準拠していることを確認する:

| チェック項目                        | 期待値                                                    | 判定 |
| ----------------------------------- | --------------------------------------------------------- | ---- |
| トップレベルフィールドが 6 項目のみ | schemaVersion, workflowId, phases, resources, entry, exit | -    |
| 未許可フィールドが含まれていない    | description, metadata 等が存在しない                      | -    |
| schemaVersion が定数値と一致        | `1`（WORKFLOW_MANIFEST_SCHEMA_VERSION）                   | -    |
| workflowId が空でない文字列         | `"skill-creator"`                                         | -    |

### ステップ2: resource path の実在確認

全 resource の path が `.claude/skills/skill-creator/` 配下に実在することを確認する:

| resource id              | path                                 | ファイル実在 |
| ------------------------ | ------------------------------------ | ------------ |
| agent-analyze-request    | ./agents/analyze-request.md          | -            |
| agent-define-boundary    | ./agents/define-boundary.md          | -            |
| ref-core-principles      | ./references/core-principles.md      | -            |
| ref-codex-best-practices | ./references/codex-best-practices.md | -            |
| schema-agent-definition  | ./schemas/agent-definition.json      | -            |
| schema-boundary          | ./schemas/boundary.json              | -            |
| agent-analyze-feedback   | ./agents/analyze-feedback.md         | -            |

検証コマンド: `ls -la .claude/skills/skill-creator/<path>` で各ファイルの存在を確認する。

### ステップ3: phase ↔ resource 双方向参照の対称性検証

ManifestLoader の `assertResourcePhaseReferences()` が要求する双方向一致を確認する:

| phase id               | phase.resourceIds                                   | resource 側の phaseIds に当該 phase が含まれるか |
| ---------------------- | --------------------------------------------------- | ------------------------------------------------ |
| requirements-gathering | [agent-analyze-request]                             | -                                                |
| plan                   | [agent-define-boundary, ref-core-principles]        | -                                                |
| execute                | [ref-codex-best-practices, schema-agent-definition] | -                                                |
| verify                 | [schema-boundary]                                   | -                                                |
| improve                | [agent-analyze-feedback]                            | -                                                |

逆方向（resource → phase）の確認:

| resource id              | resource.phaseIds        | 当該 phase の resourceIds に resource が含まれるか |
| ------------------------ | ------------------------ | -------------------------------------------------- |
| agent-analyze-request    | [requirements-gathering] | -                                                  |
| agent-define-boundary    | [plan]                   | -                                                  |
| ref-core-principles      | [plan]                   | -                                                  |
| ref-codex-best-practices | [execute]                | -                                                  |
| schema-agent-definition  | [execute]                | -                                                  |
| schema-boundary          | [verify]                 | -                                                  |
| agent-analyze-feedback   | [improve]                | -                                                  |

### ステップ4: dependsOn 順序の正当性検証

`assertPhaseReferences()` の順序検証ロジックに基づき、dependsOn の参照先が自身より前のインデックスに存在することを確認する:

| phase（index）             | dependsOn                | 参照先 index | 自身より前か |
| -------------------------- | ------------------------ | ------------ | ------------ |
| requirements-gathering (0) | なし                     | -            | OK（なし）   |
| plan (1)                   | [requirements-gathering] | 0            | -            |
| execute (2)                | [plan]                   | 1            | -            |
| verify (3)                 | [execute]                | 2            | -            |
| improve (4)                | [verify]                 | 3            | -            |

テスト TC-09 の追加期待値:

- 最初の phase は dependsOn が undefined
- 2 番目以降は直前の phase に依存（`phase[i].dependsOn` に `phase[i-1].id` が含まれる）

### ステップ5: entry/exit hook カバレッジ検証

全 phase の entryHookId / exitHookId が entry[] / exit[] に定義されていることを確認する:

| phase id               | entryHookId   | entry[] に存在か | exitHookId   | exit[] に存在か |
| ---------------------- | ------------- | ---------------- | ------------ | --------------- |
| requirements-gathering | rg-entry      | -                | rg-exit      | -               |
| plan                   | plan-entry    | -                | plan-exit    | -               |
| execute                | execute-entry | -                | execute-exit | -               |
| verify                 | verify-entry  | -                | verify-exit  | -               |
| improve                | improve-entry | -                | improve-exit | -               |

entry / exit hook の一意性:

- entry[].id: rg-entry, plan-entry, execute-entry, verify-entry, improve-entry（5 件、全て一意）
- exit[].id: rg-exit, plan-exit, execute-exit, verify-exit, improve-exit（5 件、全て一意）

### ステップ6: canonical / mirror 同一性の確保方法

| 確認項目                       | 設計内容                                        | 妥当性 |
| ------------------------------ | ----------------------------------------------- | ------ |
| 同期方式                       | ファイルコピー（byte-for-byte 同一）            | -      |
| テスト AC-2 の検証方法         | `fs.readFile` で両ファイルの内容を比較          | -      |
| 同期タイミング                 | manifest 更新時に同時配置                       | -      |
| canonical パスからの path 解決 | mirror でも同じ相対パスで resource に到達するか | -      |

mirror パスでの resource 実在確認:

- `.agents/skills/skill-creator/` 配下にも agents/ references/ schemas/ が存在し、同じ相対パスで resource ファイルに到達できることを確認する必要がある

### ステップ7: テスト期待値との突合

| テストケース | 検証内容                        | 設計との整合 |
| ------------ | ------------------------------- | ------------ |
| TC-01        | loadManifest() 成功、workflowId | -            |
| TC-02        | schemaVersion === 1             | -            |
| TC-03        | 全 resource.absolutePath 実在   | -            |
| TC-04        | phases 5 件、正しい順序         | -            |
| TC-05        | entry/exit hooks 定義あり       | -            |
| TC-06        | entryHookId → entry[] 参照整合  | -            |
| TC-07        | exitHookId → exit[] 参照整合    | -            |
| AC-2         | canonical と mirror の同一性    | -            |
| kind検証     | 全 resource.kind が有効値       | -            |
| dependsOn    | 正しい依存順序                  | -            |
| EC-01        | dependsOn 不正 → 拒否           | -            |
| EC-02        | kind 空文字 → 拒否              | -            |
| EC-03        | command 空文字 → 拒否           | -            |
| EC-04        | 1 phase のみ → 通過             | -            |
| RC-01        | resource path 削除 → 検出       | -            |
| RC-02        | schemaVersion 変更 → 検出       | -            |
| RC-03        | workflowId 空文字 → 拒否        | -            |

## 30思考法監査マトリクス

| カテゴリ     | 思考法               | 監査観点                                                             |
| ------------ | -------------------- | -------------------------------------------------------------------- |
| 論理分析系   | 批判的思考           | manifest 構造に暗黙の前提がないか                                    |
| 論理分析系   | 演繹思考             | ManifestLoader の検証ロジックから manifest 構造が必然的に導かれるか  |
| 論理分析系   | 帰納的思考           | テストフィクスチャと本番 manifest の共通パターンが抽出されているか   |
| 論理分析系   | アブダクション       | resource 選定の根拠が最も妥当な説明になっているか                    |
| 論理分析系   | 垂直思考             | 双方向参照の対称性が根本制約として正しいか                           |
| 構造分解系   | 要素分解             | manifest の各要素（phase/resource/hook）が最小単位に分けられているか |
| 構造分解系   | MECE                 | 5 phase が漏れなく重複なく定義されているか                           |
| 構造分解系   | 2軸思考              | 実装コスト vs 網羅性のバランスが取れているか                         |
| 構造分解系   | プロセス思考         | requirements → plan → execute → verify → improve の流れが自然か      |
| メタ・抽象系 | メタ思考             | 何を検証しているか自体が正しいか                                     |
| メタ・抽象系 | 抽象化思考           | resource descriptor のパターンが他の skill にも転用可能か            |
| メタ・抽象系 | ダブル・ループ思考   | 7 resource で十分か、追加すべきか                                    |
| 発想・拡張系 | ブレインストーミング | 別の resource 選定パターンがあり得るか                               |
| 発想・拡張系 | 水平思考             | 固定的な 1:1 対応以外の phase-resource 関係がないか                  |
| 発想・拡張系 | 逆説思考             | resource を減らした方がシンプルにならないか                          |
| 発想・拡張系 | 類推思考             | テストフィクスチャの 2-phase 構造から 5-phase への拡張は妥当か       |
| 発想・拡張系 | if思考               | resource ファイルが将来削除された場合のフォールバックは不要か        |
| 発想・拡張系 | 素人思考             | manifest の構造が非専門家にも理解できるか                            |
| システム系   | システム思考         | manifest → ManifestLoader → WorkflowEngine の因果関係が正しいか      |
| システム系   | 因果関係分析         | manifest の変更が P0-04/P0-07/P0-09 に与える影響は制御可能か         |
| システム系   | 因果ループ           | manifest 更新と mirror 同期の再発問題がないか                        |
| 戦略・価値系 | トレードオン思考     | 最小限の resource で全テストを通過するバランス                       |
| 戦略・価値系 | プラスサム思考       | P0-04/P0-07/P0-09 の全てに価値を提供するか                           |
| 戦略・価値系 | 価値提案思考         | 動的パイプライン構築のコスト削減に寄与するか                         |
| 戦略・価値系 | 戦略的思考           | 今回は manifest 配置のみに閉じ、loader 変更は P0-04 に委譲する判断   |
| 問題解決系   | why思考              | なぜ 7 resource なのか、過不足がないか                               |
| 問題解決系   | 改善思考             | 最小変更で全テスト PASS を実現する設計になっているか                 |
| 問題解決系   | 仮説思考             | mirror パスでの resource 実在が前提として正しいか                    |
| 問題解決系   | 論点思考             | manifest 構造の論点と配置戦略の論点が混在していないか                |
| 問題解決系   | KJ法                 | レビュー指摘を類似項目でクラスタ化して収束させる                     |

## gate 判定

| 判定     | 条件                                                                   | 次の動き                         |
| -------- | ---------------------------------------------------------------------- | -------------------------------- |
| PASS     | 全検証ステップの整合確認完了、テスト期待値との突合完了、双方向参照対称 | Phase 4 へ進む                   |
| MINOR    | 命名規則の軽微な修正（1〜2 箇所）で閉じる                              | Phase 3 内で修正し、再レビュー   |
| MAJOR    | 双方向参照の不整合、resource path の実在しないファイル参照             | Phase 2 へ戻る                   |
| CRITICAL | schemaVersion 不一致、phase 順序の根本的な誤り、トップレベル構造の破綻 | Phase 1 へ戻り、要件を再固定する |

## 統合テスト連携

- Phase 3 のレビュー結果は Phase 4（テスト作成）の前提条件となる
- gate 判定が PASS の場合、既存の `ManifestLoader.production-manifest.test.ts` をそのまま検証ゲートとして使用する
- MINOR / MAJOR / CRITICAL の場合の戻り先を Phase 4 以降へ引き渡す
- Phase 5（実装）では本 Phase のレビュー結果に基づき manifest JSON を配置する

## 多角的チェック観点

- ALLOWED_TOP_LEVEL_FIELDS 以外のフィールドが設計に含まれていないか
- 全 7 resource の path が manifest からの相対パスで正しいファイルに解決されるか
- phase ↔ resource の双方向参照に非対称な箇所がないか
- dependsOn チェーンが直列で、循環参照や飛び越し参照がないか
- entry/exit hook が全 phase をカバーし、未使用の hook がないか
- canonical と mirror で同じ相対パスの resource ファイルが実在するか
- テスト 17 ケースの全期待値と設計が矛盾しないか
- 既存の canonical manifest と設計の差分が意図的なものか

## 成果物

| 成果物           | パス                                      | 説明         |
| ---------------- | ----------------------------------------- | ------------ |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | レビュー結果 |

## 完了条件

- [ ] manifest スキーマ整合性（ALLOWED_TOP_LEVEL_FIELDS 準拠）が検証されている
- [ ] 全 7 resource の path 実在が確認されている
- [ ] phase ↔ resource 双方向参照の対称性が検証されている
- [ ] dependsOn 順序の正当性が検証されている
- [ ] entry/exit hook の entryHookId/exitHookId カバレッジが検証されている
- [ ] canonical / mirror 同一性の確保方法が確認されている
- [ ] テスト 17 ケースの期待値との突合が完了している
- [ ] 30思考法監査が完了している
- [ ] gate 判定の結論が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| SubAgent   | 責務                                 |
| ---------- | ------------------------------------ |
| SubAgent-A | スキーマ整合性・双方向参照レビュー   |
| SubAgent-B | resource path 実在・テスト期待値突合 |
| SubAgent-C | 30思考法監査・gate 判定              |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 4: テスト作成
