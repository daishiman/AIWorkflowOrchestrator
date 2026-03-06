# Phase 13 PR情報

## メタ情報

| 項目           | 内容                                                            |
| -------------- | --------------------------------------------------------------- |
| Phase          | 13                                                              |
| タスクID       | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001                       |
| ブランチ       | `docs/task-fix-auth-mode-contract-alignment-001-specs-20260306` |
| ベースブランチ | `main`                                                          |
| ステータス     | 実行中                                                          |

## PRタイトル

```text
fix(auth-mode): 公開契約整合と Phase 12/13 仕様同期
```

## PR概要

- shared の auth-mode transport 正本を `packages/shared/src/types/auth-mode.ts` に統一し、`IPCResponse<T>` / `AuthModeStatus` / `AuthModeChangedEvent` を Main / Preload / Renderer で揃えた。
- Main IPC、Preload 公開 API、Renderer store / SettingsView を現行契約へ合わせ、`get/set/status/validate/onModeChanged` の request / response / event 形状を正規化した。
- Phase 11 の 5 スクリーンショットと Apple UI/UX 観点レビューを残し、Phase 12/13 で system spec・skill・workflow・未タスク導線を同期した。
- `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/` へ workflow を移管し、関連未タスクと Phase 13 成果物を completed-tasks 側へ揃えた。

## PR本文ドラフト

### 概要

auth-mode の公開契約が Main / Preload / Renderer で微妙にずれていたため、shared DTO を正本にして IPC / preload bridge / renderer state / Settings UI を一括で整合させた。あわせて、Phase 11 の画面証跡、Phase 12 の system spec 同期、Phase 13 の PR handoff を completed workflow に反映した。

### 変更内容

- `packages/shared/src/types/auth-mode.ts` を auth-mode transport 正本へ統一し、error envelope と event payload を shared へ集約
- `apps/desktop/src/main/ipc/authModeHandlers.ts` と関連 type / test を更新し、`status` / `validate` の戻り値と error handling を正規化
- `apps/desktop/src/preload/index.ts` / `types.ts` / contract test を更新し、公開 API を shared 契約へ合わせた
- `apps/desktop/src/renderer/store/slices/authModeSlice.ts` と `SettingsView` / `AuthModeSelector` を更新し、status 表示と changed event 反映を安定化
- Phase 11 専用 harness・5 スクリーンショット・manual result を追加し、Apple UI/UX 観点の視覚検証を記録
- `aiworkflow-requirements` / `task-specification-creator` / `skill-creator` を更新し、auth-mode 契約整合・苦戦箇所・5分解決カード・Phase 12/13 運用ルールを system spec に反映
- workflow を `completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/` へ移し、未タスク `UT-IMP-PHASE12-UNASSIGNED-LINK-DIAGNOSTICS-001` / `UT-IMP-PHASE12-DOMAIN-SPEC-SYNC-BLOCK-VALIDATOR-001` を親 workflow 配下へ整理
- Phase 3.5 として `docs/30-workflows/unassigned-task/task-imp-phase12-task-investigate-five-minute-card-sync-validator-001.md` を Issue #1013 に同期

### 変更タイプ

- [x] 🐛 バグ修正 (bug fix)
- [ ] ✨ 新機能 (new feature)
- [ ] 🔨 リファクタリング (refactoring)
- [x] 📝 ドキュメント (documentation)
- [x] 🧪 テスト (test)
- [ ] 🔧 設定変更 (configuration)
- [ ] 🚀 CI/CD (continuous integration)

### テスト

- [x] ユニットテスト実行 (`pnpm test`) 2026-03-06 にユーザー実行
- [x] 型チェック実行 (`pnpm typecheck`) 2026-03-06 にユーザー実行
- [x] ESLint チェック実行 (`pnpm lint`) 2026-03-06 にユーザー実行
- [x] ビルド確認 (`pnpm --filter @repo/shared build`, `pnpm --filter @repo/desktop build`) 2026-03-06 にユーザー実行
- [x] 手動テスト実施 (`AUTH_MODE_PHASE11_PORT=5183 node apps/desktop/scripts/capture-auth-mode-contract-alignment-phase11.mjs`)
- [x] spec 検証実施 (`verify-all-specs --strict`, `validate-phase-output`, `validate-phase11-screenshot-coverage`, `verify-unassigned-links`)

### 関連 Issue

Closes #

Related:

- #1013 UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001

### 破壊的変更

- [ ] この PR には破壊的変更が含まれます

### スクリーンショット

- `outputs/phase-11/screenshots/TC-11-01-settings-initial.png`
- `outputs/phase-11/screenshots/TC-11-02-api-key-missing.png`
- `outputs/phase-11/screenshots/TC-11-03-subscription-missing.png`
- `outputs/phase-11/screenshots/TC-11-04-mode-changed.png`
- `outputs/phase-11/screenshots/TC-11-05-restored-mode.png`
- 視覚判定: Apple UI/UX 観点で PASS（selector / status card の整列、accent blue、state color）

### チェックリスト

- [x] コードが既存のスタイルに従っている
- [x] 必要に応じてドキュメントを更新した
- [x] 新規・変更機能にテストを追加した
- [x] すべてのローカル検証結果を確認した
- [x] Pre-commit hooks 相当の品質確認を通した

### その他

- Phase 12 実装ガイド反映元: `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-12/implementation-guide.md`
- 反映ポイント 1: `packages/shared/src/types/auth-mode.ts` を transport 正本に据え、layer 間の型ドリフトを止めた
- 反映ポイント 2: `status` / `validate` の資格情報不足を `AuthModeStatus.isValid=false` で表現し、Renderer 表示契約を安定化した
- 反映ポイント 3: `changed` event に `status` を同梱し、再読込なしで UI が追従する構造へ揃えた

## レビューポイント

1. shared 正本 (`IPCResponse<T>`, `AuthModeStatus`, `AuthModeChangedEvent`) と Main / Preload / Renderer 実装が 1 対 1 で一致しているか。
2. `status` / `validate` の失敗表現が envelope error ではなく DTO 返却に寄っている箇所の扱いが妥当か。
3. `SettingsView` と store slice が changed event をそのまま反映し、 fallback path で無限ループを起こさないか。
4. system spec / skill / workflow / unassigned-task / Issue #1013 の導線が Phase 12 / 13 の運用に沿っているか。

## PR URL

- 作成後に追記
