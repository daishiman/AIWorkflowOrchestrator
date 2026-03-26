# Phase 2: 設計

## メタ情報

| 項目       | 内容         |
| ---------- | ------------ |
| タスクID   | TASK-SDK-01  |
| Phase      | 2            |
| Phase名    | 設計         |
| ステータス | spec_created |
| 前提Phase  | Phase 1      |
| 後続Phase  | Phase 3      |
| 作成日     | 2026-03-26   |

## 目的

`workflow-manifest.json` の schema、`ManifestLoader` の責務、cache invalidation の条件を設計し、manifest が runtime authority を侵食しない構造を固める。

## 実行タスク

- top-level schema 設計: manifest の必須フィールドと禁止フィールドを定義する
- loader boundary 設計: 読み込み、検証、正規化、エラー返却の責務を定義する
- cache invalidation 設計: path、mtime、schemaVersion、resource hash の更新条件を定義する
- authority split matrix 作成: manifest、loader、engine、runtime facade の責務境界を表で固定する

## 参照資料

| 資料名                  | パス                                                                                  | 説明                 |
| ----------------------- | ------------------------------------------------------------------------------------- | -------------------- |
| Phase 1 scope           | `phase-1-requirements.md`                                                             | 要件本文             |
| scope definition        | `outputs/phase-1/manifest-scope-definition.md`                                        | scope 入力           |
| non-scope register      | `outputs/phase-1/manifest-non-scope-register.md`                                      | 非責務入力           |
| current code anchor map | `outputs/phase-1/current-code-anchor-map.md`                                          | authority owner 入力 |
| root Phase 2            | `docs/30-workflows/skill-creator-agent-sdk-lane/root-workflow-pack/phase-2-design.md` | root topology        |
| executor guide          | `docs/30-workflows/skill-creator-agent-sdk-lane/executor-guide.md`                    | downstream 読み順    |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| api-ipc-system-core                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | runtime public IPC の current contract |
| arch-electron-services-details-part2 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | facade / execute / handoff 境界        |
| arch-execution-capability-contract   | `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md`   | route authority の shared location     |
| architecture-overview-core           | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`           | Facade / Bridge / SRP 原則             |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | Phase 12 同期先                        |

## 実行手順

1. top-level field を `schemaVersion / workflowId / phases / resources / entry / exit` の単位で整理し、禁止フィールド一覧を併記する。
2. `ManifestLoader` の責務を `read -> validate -> normalize -> cache -> return` に分け、`execute / route / permission / session` を除外する。
3. cache key を `manifestPath + manifestMtime + schemaVersion + resourceDescriptorHash` で設計し、invalid 条件を列挙する。
4. Task02、Task03、Task04 が受け取る handoff を `phase topology / resource descriptor / entry-exit hook` の3成果物へ落とし込む。

## 統合テスト連携

- Phase 4 で schema positive / negative fixture を作る。
- Phase 5 で loader 実装順を `schema -> loader -> cache wiring` に固定する。
- Phase 9 で authority split matrix と current code anchor の不整合を監査する。

## 成果物

| 成果物                    | パス                                           | 説明                        |
| ------------------------- | ---------------------------------------------- | --------------------------- |
| manifest-schema-design    | `outputs/phase-2/manifest-schema-design.md`    | JSON schema 設計            |
| loader-boundary-design    | `outputs/phase-2/loader-boundary-design.md`    | loader 責務設計             |
| cache-invalidation-design | `outputs/phase-2/cache-invalidation-design.md` | cache key と invalid 条件   |
| authority-split-matrix    | `outputs/phase-2/authority-split-matrix.md`    | manifest と周辺責務の境界表 |

## 完了条件

- [ ] manifest schema の必須フィールドと禁止フィールドが記録されている
- [ ] loader が `execute / route / permission / session` を扱わないことが明記されている
- [ ] cache invalidation 条件が path、mtime、schemaVersion、resource hash で定義されている
- [ ] authority split matrix に manifest、loader、engine、runtime facade の4列がある
- [ ] **本Phase内の全タスクを100%実行完了**
