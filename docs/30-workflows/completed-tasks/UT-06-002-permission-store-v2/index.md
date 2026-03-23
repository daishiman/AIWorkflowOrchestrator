# UT-06-002: AllowedToolEntryV2 PermissionStore 適用

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| タスクID   | UT-06-002                               |
| タスク名   | AllowedToolEntryV2 PermissionStore 適用 |
| Issue      | #1297                                   |
| 作成日     | 2026-03-23                              |
| ステータス | 進行中                                  |
| 前提タスク | TASK-SKILL-LIFECYCLE-06（完了）         |

## 概要

既存の `PermissionStore`（V1）を `AllowedToolEntryV2` 型ベースに拡張し、失効ポリシー（session / time_24h / time_7d / permanent）によるスコープ管理、スキル名照合、期限切れ自動削除、セッション終了 IPC を実装する。

## スコープ

### 含むもの

1. `AllowedToolEntryV2` / `calcExpiresAt` の共有型定義（`@repo/shared`）
2. `PermissionStore` クラスの V2 拡張（V1 メソッドシグネチャの拡張）
3. `electron-store` スキーマバージョン 2 + V1→V2 マイグレーション
4. `permission:clear-session` IPC チャンネル定義・ハンドラ登録
5. `before-quit` セッション終了フック
6. 単体テスト

### 含まないもの

- `PermissionDialog` コンポーネント実装（TASK-SKILL-LIFECYCLE-08）
- `SafetyGate` との統合（UT-06-003）
- `high × time_24h` テスト追加（UT-06-006）
- `high × time_7d` テスト追加（UT-06-007）

## Phase 構成

| Phase | 名称             | 仕様書                         | 出力                                         | ステータス |
| ----- | ---------------- | ------------------------------ | -------------------------------------------- | ---------- |
| 1     | 要件定義         | `phase-1-requirements.md`      | `outputs/phase-1/requirements.md`            | completed  |
| 2     | 設計             | `phase-2-design.md`            | `outputs/phase-2/design.md`                  | completed  |
| 3     | 設計レビュー     | `phase-3-design-review.md`     | `outputs/phase-3/design-review.md`           | completed  |
| 4     | テスト作成       | `phase-4-test-creation.md`     | `outputs/phase-4/test-design.md`             | completed  |
| 5     | 実装             | `phase-5-implementation.md`    | `outputs/phase-5/implementation.md`          | completed  |
| 6     | テスト拡充       | `phase-6-test-expansion.md`    | `outputs/phase-6/test-expansion.md`          | completed  |
| 7     | カバレッジ確認   | `phase-7-coverage-check.md`    | `outputs/phase-7/coverage-report.md`         | completed  |
| 8     | リファクタリング | `phase-8-refactoring.md`       | `outputs/phase-8/refactoring.md`             | completed  |
| 9     | 品質検証         | `phase-9-quality-assurance.md` | `outputs/phase-9/quality-report.md`          | completed  |
| 10    | 最終レビュー     | `phase-10-final-review.md`     | `outputs/phase-10/final-review-result.md`    | completed  |
| 11    | 手動テスト       | `phase-11-manual-test.md`      | `outputs/phase-11/phase-11-manual-test.md`   | completed  |
| 12    | ドキュメント     | `phase-12-documentation.md`    | `outputs/phase-12/phase-12-documentation.md` | completed  |
| 13    | PR作成           | `phase-13-pr.md`               | `outputs/phase-13/phase-13-pr.md`            | pending    |

## 依存タスク

| タスクID                | 関係                                 | ステータス |
| ----------------------- | ------------------------------------ | ---------- |
| TASK-SKILL-LIFECYCLE-06 | 前提（型定義・インターフェース設計） | 完了       |
| TASK-SKILL-LIFECYCLE-08 | 後続（PermissionDialog UI）          | 未実施     |
| UT-06-003               | 後続（SafetyGate 統合）              | 未実施     |
| UT-06-006               | 後続（time_24h テスト）              | 未実施     |
| UT-06-007               | 後続（time_7d テスト）               | 未実施     |

## 変更対象ファイル

| #   | ファイル                                                  | 変更種別 |
| --- | --------------------------------------------------------- | -------- |
| 1   | `packages/shared/src/types/permission-store.ts`           | 拡張     |
| 2   | `packages/shared/src/types/index.ts`                      | 拡張     |
| 3   | `apps/desktop/src/main/services/skill/PermissionStore.ts` | 拡張     |
| 4   | `apps/desktop/src/main/ipc/permission-store-handlers.ts`  | 拡張     |
| 5   | `apps/desktop/src/preload/channels.ts`                    | 拡張     |
| 6   | `apps/desktop/src/main/index.ts`                          | 拡張     |

## 品質基準

| 指標              | 基準 |
| ----------------- | ---- |
| Line Coverage     | 80%+ |
| Branch Coverage   | 60%+ |
| Function Coverage | 80%+ |
| TypeScript エラー | 0件  |
| ESLint エラー     | 0件  |
