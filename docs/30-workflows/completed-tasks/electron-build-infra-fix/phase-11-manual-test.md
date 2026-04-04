# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 11                      |
| タスクID   | TASK-ELECTRON-BUILD-FIX |
| 前提Phase  | Phase 10                |
| 後続Phase  | Phase 12                |
| ステータス | completed               |
| 主担当     | Agent-A, Agent-B        |

## 目的

ローカル macOS 環境で desktop 起動、ABI ロード、preload bundle の観察点を確認し、自動検証では拾いにくい差異を拾う。UI 差分のない build-infra task のため、視覚証跡は NON_VISUAL 判定として文書で管理する。

## 実行タスク

- desktop 開発起動の確認
- `better-sqlite3` ロード確認
- preload bundle の確認
- NON_VISUAL 証跡の保存
- 発見事項の分類

## 参照資料

| 資料           | パス                                                                      | 用途                 |
| -------------- | ------------------------------------------------------------------------- | -------------------- |
| workflow index | `docs/30-workflows/electron-build-infra-fix/index.md`                     | AC-5、AC-7 参照      |
| phase 9        | `docs/30-workflows/electron-build-infra-fix/phase-9-quality-assurance.md` | 事前 gate の確認     |
| phase 10       | `docs/30-workflows/electron-build-infra-fix/phase-10-final-review.md`     | 最終判定後の実行条件 |

## 実行手順

### ステップ1: 起動確認

- `pnpm --filter @repo/desktop dev` を実行し、起動開始点まで到達するか確認する

### ステップ2: runtime 確認

- `ELECTRON_RUN_AS_NODE=1 electron -e "require('better-sqlite3')"` を実行する
- preload build 出力を確認する

### ステップ3: NON_VISUAL 証跡整理

- `manual-test-result.md` と `screenshot-plan.json` に「UI 差分なし」の理由と確認観点を記録する
- representative evidence として `outputs/phase-11/screenshots/phase11-build-infra-review-board.png` を保存し、`outputs/phase-11/phase11-capture-metadata.json` と対応付ける

### ステップ4: 発見事項整理

- blocker、minor、note、info に分類する

## 統合テスト連携

- AC-5 と AC-7 の手動結果を Phase 12 の unassigned task 検出へ引き渡す
- 自動 gate で拾えない差異だけを追加記録する

## 成果物

| 成果物                | パス                                                                | 説明                              |
| --------------------- | ------------------------------------------------------------------- | --------------------------------- |
| manual test checklist | `outputs/phase-11/manual-test-checklist.md`                         | 手順一覧                          |
| manual test result    | `outputs/phase-11/manual-test-result.md`                            | 結果記録                          |
| screenshot plan       | `outputs/phase-11/screenshot-plan.json`                             | Phase 11 証跡計画                 |
| review-board png      | `outputs/phase-11/screenshots/phase11-build-infra-review-board.png` | NON_VISUAL 代表証跡               |
| capture metadata      | `outputs/phase-11/phase11-capture-metadata.json`                    | capture method と source evidence |

## 完了条件

- [x] AC-7 の観察結果が記録されている
- [x] AC-5 の観察結果が記録されている
- [x] 発見事項が分類されている
- [x] Phase 12 に渡す未タスク候補が把握できている
- [x] NON_VISUAL task としての manual-test-result / screenshot-plan / review-board PNG / metadata が current workflow 配下に揃っている
