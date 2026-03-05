# Phase 1 要件定義書

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | TASK-UI-01-A-STORE-SLICE-BASELINE |
| Phase      | 1                                 |
| 作成日     | 2026-03-05                        |
| ステータス | completed                         |

## 1. 目的

既存 Renderer Store の Slice 責務を棚卸しし、`Notification` / `HistorySearch` / `SkillCenter` / `ViewType` の状態境界を固定する。後続の `task-056c` と `task-056d` が同一前提で設計・実装できることを目的とする。

## 2. SubAgent 分担（関心ごとの分離）

| SubAgent                      | 役割                        | 実行方式 | 本Phase成果    |
| ----------------------------- | --------------------------- | -------- | -------------- |
| SA-01 Inventory Analyst       | 既存16 Slice の責務棚卸し   | 並列     | Slice台帳要件  |
| SA-02 Boundary Architect      | 新規/拡張/非対象の境界定義  | 並列     | 境界判定要件   |
| SA-03 Selector Policy Auditor | P31再発防止の命名・利用規約 | 直列     | 規約要件       |
| SA-04 Review Gate Auditor     | 要件矛盾のレビュー観点整理  | 直列     | 受け入れ判定軸 |

## 3. 機能要件（FR）

| ID    | 要件                                                                      | 検証観点                                 |
| ----- | ------------------------------------------------------------------------- | ---------------------------------------- |
| FR-01 | `store/index.ts` と `store/slices/*` を対象に Slice 台帳を作成する        | 15 Slice + chatEditSlice を列挙できる    |
| FR-02 | 台帳は `sliceName/state/actions/selectors/persistence/ownerView` 列を持つ | 列欠損が 0 件                            |
| FR-03 | 境界判定は `new/extend/no-change/local-useState` の4種で定義する          | 4種以外の判定が存在しない                |
| FR-04 | `Notification` と `HistorySearch` を `new` 候補として固定する             | 境界マトリクスに明記される               |
| FR-05 | `SkillCenter` は `local-useState` 境界として固定する                      | Store新規Sliceを作らない方針が記載される |
| FR-06 | `ViewType` は `extend`（既存 Navigation への型拡張）として定義する        | `types.ts` 拡張前提が明記される          |
| FR-07 | P31対策として合成Hook非推奨・個別セレクタ利用規約を定義する               | 命名規約と禁止事項が記載される           |
| FR-08 | `task-056c` / `task-056d` への引き渡しリンクと入力条件を明示する          | リンク切れ 0 件                          |

## 4. 非機能要件（NFR）

| ID     | 要件       | 基準                                           |
| ------ | ---------- | ---------------------------------------------- |
| NFR-01 | 型安全性   | 仕様と実装で型名を一致させる                   |
| NFR-02 | 再現性     | 判定理由を1項目1文で記載する                   |
| NFR-03 | 参照可能性 | 後続タスクが直接参照できる絶対/相対パスを記載  |
| NFR-04 | P31耐性    | 合成Hookの再導入を禁止し、個別セレクタを標準化 |
| NFR-05 | 影響限定   | 本タスクでは IPC 契約を変更しない              |

## 5. スコープ制約

- In Scope:
  - Renderer Store の棚卸し、境界分類、セレクタ規約固定
  - 実装・テスト・文書更新（Phase 5以降）
- Out of Scope:
  - Main/Preload の IPC チャネル追加
  - Notification/HistorySearch の本実装（`task-056c` で実施）

## 6. 統合テスト連携

| 接続要件カテゴリ | 本Phaseでの要件                                |
| ---------------- | ---------------------------------------------- |
| API接続          | IPC追加なし、既存チャネル不変                  |
| 認証フロー       | `authSlice` / `authModeSlice` 境界を侵食しない |
| データフロー     | Renderer Store 内で状態境界を一方向依存に固定  |

## 7. 引き渡し条件

| 引き渡し先                                 | 条件                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------- |
| `task-056c-notification-history-domain.md` | Notification/HistorySearch の境界判定・判定理由・永続化方針が参照可能 |
| `task-056d-viewtype-routing-nav.md`        | ViewType を `extend` とした理由、影響ファイル一覧が参照可能           |

参照:

- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056c-notification-history-domain.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056d-viewtype-routing-nav.md`

## 8. 参照仕様

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`
- `.claude/skills/aiworkflow-requirements/references/error-handling.md`
