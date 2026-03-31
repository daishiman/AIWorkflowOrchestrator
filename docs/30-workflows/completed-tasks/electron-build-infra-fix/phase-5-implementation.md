# Phase 5: 実装

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 5                       |
| タスクID   | TASK-ELECTRON-BUILD-FIX |
| 前提Phase  | Phase 4                 |
| 後続Phase  | Phase 6                 |
| ステータス | completed               |
| 主担当     | Agent-A, Agent-B        |

## 目的

Phase 2 の実装計画に従って、shared / preload / ABI 再ビルド導線を実装し、AC 達成の土台を作る。

## 実行タスク

- shared の dual output と exports を実装する
- preload bundle 側の shared 解決を実装する
- ABI 再ビルド導線を install 時と packaging 時に実装する
- 実装後の確認コマンドを回して基礎整合を取る

## 参照資料

| 資料           | パス                                                                  | 用途             |
| -------------- | --------------------------------------------------------------------- | ---------------- |
| workflow index | `docs/30-workflows/electron-build-infra-fix/index.md`                 | インベントリ参照 |
| phase 2        | `docs/30-workflows/electron-build-infra-fix/phase-2-design.md`        | 実装根拠         |
| phase 4        | `docs/30-workflows/electron-build-infra-fix/phase-4-test-creation.md` | RED 条件参照     |

## 実行手順

### ステップ1: shared / preload 実装

- `packages/shared/tsup.config.ts`
- `packages/shared/package.json`
- `apps/desktop/electron.vite.config.ts`

### ステップ2: native module 実装

- `apps/desktop/package.json`
- `scripts/setup-native-modules.sh`
- `apps/desktop/scripts/rebuild-native-for-electron.mjs`
- `apps/desktop/electron-builder.yml`
- `package.json`

### ステップ3: 基礎確認

- build、ABI、preload bundle の基礎確認を行う
- 未達があれば Phase 4 または Phase 2 へ戻す

## 統合テスト連携

- Phase 4 で定義した RED 条件を GREEN に変える
- shared、desktop、runtime の結果を Phase 6 と Phase 9 に引き渡す

## 成果物

| 成果物       | パス                                        | 説明                       |
| ------------ | ------------------------------------------- | -------------------------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 変更ファイル一覧           |
| 基礎検証     | `outputs/phase-5/verification-result.md`    | build / ABI / preload 確認 |
| AC 達成状況  | `outputs/phase-5/ac-achievement.md`         | 暫定達成状況               |

## 完了条件

- [ ] 新規作成と修正のファイル一覧が実装結果と一致している
- [ ] 問題A の実装が AC-1〜AC-4 へ接続している
- [ ] 問題B の実装が AC-5〜AC-6 へ接続している
- [ ] Phase 6 で拡充すべきテスト観点が把握できている
