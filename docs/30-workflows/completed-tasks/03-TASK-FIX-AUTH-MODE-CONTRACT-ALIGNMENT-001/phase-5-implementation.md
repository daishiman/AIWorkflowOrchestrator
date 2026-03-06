# Phase 5: 実装

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 5                                         |
| 機能名     | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 |
| タスク名   | auth-mode 契約整合の実装計画              |
| 作成日     | 2026-03-06                                |
| ステータス | completed                                 |

## 目的

shared transport DTO、Main adapter、Preload bridge、Renderer slice の更新順序を固定し、契約差分を 1 回で閉じる実装計画を作る。

## 背景

このタスクは公開契約を更新する。更新順序がずれると Main と Renderer の一時不整合が広がり、Red テスト以外の失敗が混ざる。

## SubAgentチーム編成

| SubAgent                | 担当関心                            | 実行形態             | Phase 5 の責務                                             |
| ----------------------- | ----------------------------------- | -------------------- | ---------------------------------------------------------- |
| SubAgent-Contract-Main  | shared 型反映、handler adapter 実装 | 並列開始後に直列接続 | shared と Main の更新順序を固定する                        |
| SubAgent-Bridge-Preload | preload import / export 置換        | Main 完了後に着手    | Preload 公開 API を shared DTO に切り替える                |
| SubAgent-Renderer-State | slice / UI / selector 置換          | Preload 完了後に着手 | Renderer が shared DTO を読むように切り替える              |
| SubAgent-Spec-Sync      | 実装順序監査                        | 直列統合             | 変更対象ファイル、ロールバック、system spec 差分を記録する |

## 実行タスク

- shared 正本化: `packages/shared/src/types/auth-mode.ts` に transport DTO と error union を集約する。
- Main adapter 実装: `authModeHandlers.ts` に internal-to-transport 変換を実装する。
- Preload bridge 実装: `preload/index.ts` と `preload/types.ts` を shared DTO 前提へ切り替える。
- Renderer 切替: `authModeSlice.ts`, `store/index.ts`, Settings UI / テストの受信 shape を shared DTO 前提へ切り替える。
- selector 安定性維持: SettingsView は個別 selector を維持し、`useAuthModeStore` 再導入を禁止する。
- rollback 設計: 変更順序逆順で戻せる手順を記録する。

## 参照資料

### 実装・コード

| 資料名                   | パス                                                                                                 | 用途                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Phase 2 仕様             | `phase-2-design.md`                                                                                  | canonical DTO と責務境界を確認する           |
| Phase 4 仕様             | `phase-4-test-creation.md`                                                                           | Red テストの対象を確認する                   |
| Phase 2 成果物           | `outputs/phase-2/`                                                                                   | DTO 設計と移行順序を確認する                 |
| Phase 4 成果物           | `outputs/phase-4/`                                                                                   | Red テスト名を確認する                       |
| Shared AuthMode 型       | `packages/shared/src/types/auth-mode.ts`                                                             | 正本化対象                                   |
| Main auth 型             | `apps/desktop/src/main/services/auth/types.ts`                                                       | internal type の維持対象                     |
| Subscription provider    | `apps/desktop/src/main/services/auth/SubscriptionAuthProvider.ts`                                    | subscription guidance / token state の参照元 |
| Main IPC handler         | `apps/desktop/src/main/ipc/authModeHandlers.ts`                                                      | adapter 実装対象                             |
| Preload API              | `apps/desktop/src/preload/index.ts`                                                                  | bridge 実装対象                              |
| Preload 型               | `apps/desktop/src/preload/types.ts`                                                                  | 重複型削除対象                               |
| Renderer Slice           | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`                                            | 受信型切替対象                               |
| Store selector           | `apps/desktop/src/renderer/store/index.ts`                                                           | selector export 維持対象                     |
| Settings View            | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                             | mount / 表示 / event 反映の切替対象          |
| AuthModeSelector         | `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx`                           | UI contract の切替対象                       |
| SettingsView テスト      | `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`                                 | mount / message 回帰対象                     |
| AuthModeSelector テスト  | `apps/desktop/src/renderer/components/settings/AuthModeSelector/__tests__/AuthModeSelector.test.tsx` | interaction 回帰対象                         |
| 無限ループ防止テスト     | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx`                              | P31 維持確認対象                             |
| Redテストマトリクス      | `outputs/phase-4/red-test-matrix.md`                                                                 | Phase 4 成果物                               |
| Main IPC Redテスト       | `outputs/phase-4/main-ipc-red-tests.md`                                                              | Phase 4 成果物                               |
| Preload bridge Redテスト | `outputs/phase-4/preload-bridge-red-tests.md`                                                        | Phase 4 成果物                               |
| Renderer slice Redテスト | `outputs/phase-4/renderer-slice-red-tests.md`                                                        | Phase 4 成果物                               |
| Integration Redテスト    | `outputs/phase-4/integration-red-tests.md`                                                           | Phase 4 成果物                               |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                              | 用途                                                           |
| -------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| IPC 契約チェック     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | 3 箇所同時更新ルールを適用する                                 |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender 検証順序を維持する                                      |
| 認証仕様             | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`            | 最終 public 契約を照合する                                     |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | slice 更新境界を確認する                                       |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/patterns.md`                   | SettingsView / `store/index.ts` の selector 維持条件を確認する |
| 開発ガイドライン     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`     | `useEffect` と selector 命名規則を維持する                     |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | test mock 面の壊し方を避ける                                   |

## 実行手順

1. shared DTO を更新し、transport 型の owner を `packages/shared/src/types/auth-mode.ts` に固定する。
2. Main handler に adapter を追加し、service 内部型を transport DTO へ変換する。
3. Preload API と type export を shared DTO ベースへ切り替える。
4. Renderer slice と UI テストの期待 shape を shared DTO ベースへ切り替える。
5. rollback 順序を `renderer -> preload -> main -> shared` の逆順で記録する。

## 統合テスト連携

- shared DTO 更新後に Main unit test を先に通す順序を固定する。
- Main adapter 更新後に Preload / Renderer の contract test を順番に通す。
- `set -> changed -> status` のイベント連鎖が同じ DTO を運ぶことを確認する。
- `validate` の戻り値が `status` と同じ shape であることを確認する。
- SettingsView mount が個別 selector のまま初期化でき、無限ループ防止テストを壊さないことを確認する。

## 多角的チェック観点

| 観点                   | 確認内容                                                                     |
| ---------------------- | ---------------------------------------------------------------------------- |
| 実装順序               | shared から renderer までの順序が 1 本に固定されているか                     |
| 影響範囲               | 変更対象ファイルが漏れなく列挙されているか                                   |
| Selector 安定性        | `store/index.ts` と SettingsView の組み合わせが P31 再発条件へ戻っていないか |
| backward compatibility | 旧 DTO を参照する箇所がテスト対象に含まれているか                            |
| rollback               | 逆順で戻せる計画を持っているか                                               |
| 文書同期               | Phase 12 へ渡す変更対象 references が明示されているか                        |

## 成果物

| 成果物             | パス                                     | 説明                                         |
| ------------------ | ---------------------------------------- | -------------------------------------------- |
| 実装計画           | `outputs/phase-5/implementation-plan.md` | 実装順序と各担当の作業内容                   |
| 変更対象ファイル表 | `outputs/phase-5/changed-files-plan.md`  | 更新対象のコードとテストの一覧               |
| 移行順序           | `outputs/phase-5/migration-order.md`     | shared -> main -> preload -> renderer の順序 |
| rollback 計画      | `outputs/phase-5/rollback-plan.md`       | 逆順復旧の手順                               |

## 完了条件

- [x] `implementation-plan.md` に shared, main, preload, renderer の順序を書く
- [x] `changed-files-plan.md` に code と test の両方を含める
- [x] `migration-order.md` に各手順の入口条件と出口条件を書く
- [x] `rollback-plan.md` に逆順の復旧手順を書く
- [x] `changed-files-plan.md` に `SubscriptionAuthProvider.ts`, `store/index.ts`, `SettingsView`, `AuthModeSelector`, `infinite-loop-prevention.test.tsx` を含める
- [x] Phase 4 の Red テスト名と実装順序が対応している
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. shared 実装計画
2. Main 実装計画
3. Preload 実装計画
4. Renderer 実装計画
5. rollback 計画

## タスク100%実行確認【必須】

- [x] 変更順序を 1 本に固定した
- [x] 変更対象ファイルを code / test で分けて書いた
- [x] rollback 手順を逆順で書いた
- [x] system spec 更新対象を実装計画に紐付けた

## 次のPhase

Phase 6: テスト拡充
