# Phase 2: 設計

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 2                       |
| タスクID   | TASK-ELECTRON-BUILD-FIX |
| 前提Phase  | Phase 1                 |
| 後続Phase  | Phase 3                 |
| ステータス | completed               |
| 主担当     | Agent-A, Agent-B        |

## 目的

shared 出力形式、preload bundle 経路、native module 再ビルド導線、品質検証導線を設計し、Phase 5 が迷わず実装できる状態にする。

## 実行タスク

- shared / preload のモジュール解決設計をまとめる
- `better-sqlite3` の ABI 再ビルド導線をまとめる
- テスト、lint、typecheck、手動確認の接続順を決める
- 変更ファイル一覧を新規作成 / 修正に分ける

## 参照資料

| 資料                    | パス                                                                           | 用途                  |
| ----------------------- | ------------------------------------------------------------------------------ | --------------------- |
| workflow index          | `docs/30-workflows/electron-build-infra-fix/index.md`                          | AC とインベントリ参照 |
| arch electron services  | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`  | desktop 設計の文脈    |
| quality requirements    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | gate の厚み確認       |
| task workflow completed | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | related lessons       |

## 実行手順

### ステップ1: 問題A の設計

- `packages/shared` の dual output 方針を決める
- preload 側で shared を外部参照として残さない設計を決める

### ステップ2: 問題B の設計

- install 時と packaging 時の双方で ABI 整合をどう担保するか決める
- shell script と afterPack hook の責務を切り分ける

### ステップ3: 実装境界の固定

- 変更ファイル一覧を `修正` と `新規作成` に分ける
- Phase 4 以降で参照する検証コマンドを固定する

## 統合テスト連携

- shared / preload / native rebuild の接続点をテスト観点へ落とせる形で定義する
- Phase 4 の AC 対応表が作れる粒度で設計を固定する

## 成果物

| 成果物    | パス                                     | 説明                    |
| --------- | ---------------------------------------- | ----------------------- |
| 問題A設計 | `outputs/phase-2/problem-a-design.md`    | shared / preload 設計   |
| 問題B設計 | `outputs/phase-2/problem-b-design.md`    | rebuild 導線設計        |
| 実装計画  | `outputs/phase-2/implementation-plan.md` | 新規 / 修正ファイル一覧 |

## 完了条件

- [ ] 問題A の設計が AC-1〜AC-4 を満たす前提になっている
- [ ] 問題B の設計が AC-5〜AC-6 を満たす前提になっている
- [ ] 変更ファイル一覧が `新規作成` と `修正` で分かれている
- [ ] Phase 3 がレビュー可能な粒度まで設計が言語化されている
