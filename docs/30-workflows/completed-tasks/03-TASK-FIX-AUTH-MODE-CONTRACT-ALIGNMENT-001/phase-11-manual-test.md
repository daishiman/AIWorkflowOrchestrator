# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 11                                        |
| 機能名     | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 |
| タスク名   | auth-mode 契約整合の手動テスト検証        |
| 作成日     | 2026-03-06                                |
| ステータス | completed                                 |

## 目的

SettingsView 上で auth-mode の取得、切替、永続化、event 反映を実操作で確認し、Phase 12 へ渡す証跡を揃える。

## 背景

このタスクは UI から見える `message`, `errorCode`, `mode`, `changed` 反映が揃って初めて完了になる。手動検証では画面、ログ、永続化の 3 点を同時に見る。

## SubAgentチーム編成

| SubAgent                | 担当関心          | 実行形態 | Phase 11 の責務                                         |
| ----------------------- | ----------------- | -------- | ------------------------------------------------------- |
| SubAgent-Contract-Main  | ログと永続化確認  | 並列     | handler / service の結果と保存状態を確認する            |
| SubAgent-Bridge-Preload | bridge event 確認 | 並列     | `changed` event と DTO 反映を確認する                   |
| SubAgent-Renderer-State | Settings UI 確認  | 並列     | 表示 message、切替、復元を確認する                      |
| SubAgent-Spec-Sync      | 証跡統合          | 直列統合 | manual result、evidence、screenshots、issues を統合する |

## 実行タスク

- 操作シナリオ実施: 起動直後、mode 切替、restart 後復元の操作を実施する。
- 証跡取得: `/settings` の初期表示、API key 未設定表示、subscription token 不在表示、復元後表示を撮影する。
- 結果記録: PASS / FAIL と証跡パスを `manual-test-result.md` と `evidence-matrix.md` に記録する。

## 参照資料

### 実装・コード

| 資料名                       | パス                                                                       | 用途                                               |
| ---------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------- |
| Phase 1 仕様                 | `phase-1-requirements.md`                                                  | AC を確認する                                      |
| Phase 2 仕様                 | `phase-2-design.md`                                                        | DTO と event 契約を確認する                        |
| Phase 5 仕様                 | `phase-5-implementation.md`                                                | 実装対象を確認する                                 |
| Phase 6 仕様                 | `phase-6-test-expansion.md`                                                | regression case を確認する                         |
| Phase 7 仕様                 | `phase-7-coverage-check.md`                                                | gap を確認する                                     |
| Phase 8 仕様                 | `phase-8-refactoring.md`                                                   | 最終境界を確認する                                 |
| Phase 9 仕様                 | `phase-9-quality-assurance.md`                                             | error / security 観点を確認する                    |
| Phase 10 仕様                | `phase-10-final-review.md`                                                 | manual test 前提を確認する                         |
| Phase 1 成果物               | `outputs/phase-1/`                                                         | AC と scope を確認する                             |
| Phase 2 成果物               | `outputs/phase-2/`                                                         | DTO と test strategy を確認する                    |
| Phase 5 成果物               | `outputs/phase-5/`                                                         | changed files を確認する                           |
| Phase 6 成果物               | `outputs/phase-6/`                                                         | event regression を確認する                        |
| Phase 7 成果物               | `outputs/phase-7/`                                                         | coverage gap を確認する                            |
| Phase 8 成果物               | `outputs/phase-8/`                                                         | refactor 後の owner を確認する                     |
| Phase 9 成果物               | `outputs/phase-9/`                                                         | risk と quality を確認する                         |
| Phase 10 成果物              | `outputs/phase-10/`                                                        | gate 判定を確認する                                |
| Settings UI                  | `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx` | 手動操作対象を確認する                             |
| Settings View                | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                   | route、初期化、status message の表示位置を確認する |
| SettingsView テスト          | `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`       | 自動テスト済み期待値との差分を確認する             |
| Store selector               | `apps/desktop/src/renderer/store/index.ts`                                 | mount 時の selector 利用を確認する                 |
| 無限ループ防止テスト         | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx`    | 手動確認で見るべき no-loop 条件を確認する          |
| 最終レビュー結果             | `outputs/phase-10/final-review-result.md`                                  | Phase 10 成果物                                    |
| リリースリスクチェックリスト | `outputs/phase-10/release-risk-checklist.md`                               | Phase 10 成果物                                    |
| ゲート判定                   | `outputs/phase-10/gate-decision.md`                                        | Phase 10 成果物                                    |

### システム仕様（aiworkflow-requirements）

| 資料名                     | パス                                                                                        | 用途                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 認証仕様                   | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                      | SettingsView が表示する `mode`, `message`, `errorCode`, `guidance` を確認する |
| 状態管理                   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | UI state 反映観点を確認する                                                   |
| IPC セキュリティ           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | unauthorized path を確認する                                                  |
| 実装パターン               | `.claude/skills/aiworkflow-requirements/references/patterns.md`                             | P31 防止の manual 観点を確認する                                              |
| 開発ガイドライン           | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | selector / `useEffect` の期待動作を確認する                                   |
| コンポーネントテスト       | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | `electronAPI.authMode` mock と実画面差分を確認する                            |
| Phase 11/12 ガイド         | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | 証跡形式と Phase 12 連携を確認する                                            |
| スクリーンショット検証手順 | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md` | ファイル実在、取得日、内容一致の確認方法を揃える                              |

## 実行手順

1. Phase 10 の gate decision を確認し、 `/settings` を開く前提条件を満たす。
2. `outputs/phase-11/screenshots/` 配下に TC 単位の証跡配置計画を立て、優先度 A 状態を 100% 対象にし、`screenshot-verification-procedure.md` に従ってファイル名・実在・取得日を記録する。
3. SubAgent-Contract-Main、SubAgent-Bridge-Preload、SubAgent-Renderer-State が並列で操作、ログ、画面を確認する。
4. `manual-test-result.md` に `テストケース` 列で TC ごとの PASS / FAIL と証跡を記録し、`evidence-matrix.md` に画像 / ログ / non-visual 補足を紐付ける。
5. `screenshot-plan.md` と `discovered-issues.md` を作成し、`node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001` を実行できる状態で Phase 12 へ渡す。

## 統合テスト連携

- 起動直後に `get -> status` が同じ mode を返すことを確認する。
- mode 切替直後に `changed` event と画面表示が同じ DTO を反映することを確認する。
- restart 後に永続化された mode が復元されることを確認する。
- credential 不在時に `status.message` と UI message が一致することを確認する。

## テストケース

| テストケース | 操作                                                 | 期待結果                                                                          |
| ------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| TC-11-01     | アプリ起動後に `/settings` を開く                    | 現在の mode と status message が表示される                                        |
| TC-11-02     | API key mode へ切替し、key 不在状態を確認する        | `mode=api-key`、`errorCode=auth-mode/no-api-key` 相当の表示が出る                 |
| TC-11-03     | subscription mode へ切替し、token 不在状態を確認する | `mode=subscription`、`errorCode=auth-mode/no-subscription-token` 相当の表示が出る |
| TC-11-04     | mode 切替直後の画面を再読込せず確認する              | `changed` event により mode と message が更新される                               |
| TC-11-05     | アプリ再起動後に `/settings` を再確認する            | 前回保存した mode が復元される                                                    |

## 画面カバレッジマトリクス

| テストケース | 状態                    | ルート      | 証跡名                              | 優先度 |
| ------------ | ----------------------- | ----------- | ----------------------------------- | ------ |
| TC-11-01     | 初期表示                | `/settings` | `TC-11-01-settings-initial.png`     | A      |
| TC-11-02     | API key 不在            | `/settings` | `TC-11-02-api-key-missing.png`      | A      |
| TC-11-03     | subscription token 不在 | `/settings` | `TC-11-03-subscription-missing.png` | A      |
| TC-11-04     | 切替直後の表示更新      | `/settings` | `TC-11-04-mode-changed.png`         | A      |
| TC-11-05     | restart 後の復元        | `/settings` | `TC-11-05-restored-mode.png`        | A      |

## 実行コマンド

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001
```

## 多角的チェック観点

| 観点                   | 確認内容                                                |
| ---------------------- | ------------------------------------------------------- |
| 初期表示               | 起動直後の mode と status が一致するか                  |
| 切替反映               | event 発火後に再読込なしで更新されるか                  |
| 表示整合               | UI message と status.message が一致するか               |
| 永続化                 | restart 後に mode が復元されるか                        |
| Selector 安定性        | SettingsView mount で無限ループや過剰再描画が起きないか |
| 証跡性                 | 各 TC に画像またはログの証跡があるか                    |
| スクリーンショット検証 | 各画像でファイル実在、取得日、内容一致を確認できるか    |

## 成果物

| 成果物                 | パス                                     | 説明                       |
| ---------------------- | ---------------------------------------- | -------------------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md` | TC ごとの結果              |
| 証跡行列               | `outputs/phase-11/evidence-matrix.md`    | TC と画像 / ログの対応表   |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.md`    | `/settings` の撮影対象一覧 |
| 発見課題               | `outputs/phase-11/discovered-issues.md`  | FAIL や気付きの記録        |

## 完了条件

- [x] `manual-test-result.md` に TC-11-01 から TC-11-05 を記録する
- [x] `evidence-matrix.md` に各 TC の証跡パスとスクリーンショット取得日を記録する
- [x] `screenshot-plan.md` に `/settings` の初期表示、API key 不在、subscription token 不在、復元後表示を書く
- [x] `discovered-issues.md` を 0 件でも作成する
- [x] `validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001` が PASS になる前提で TC と証跡名を合わせる
- [x] restart 後の復元確認を 1 件以上含める
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 初期表示確認
2. mode 切替確認
3. restart 後復元確認
4. 証跡整理
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 5 つの TC を定義した
- [x] 各 TC の証跡を紐付けた
- [x] discovered issues を 0 件でも出力すると決めた
- [x] Phase 12 に渡す証跡を整理した

## 次のPhase

Phase 12: ドキュメント更新
