# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 11                    |
| 機能名     | api-key-management-ui |
| 作成日     | 2026-03-29            |
| ステータス | pending               |

## 目的

SkillLifecyclePanel の AuthKey 導線を実画面で検証し、representative screenshot を current workflow 配下へ残す。

## 実行タスク

- UI初期状態を確認する
- 保存・検証・削除または Settings CTA を確認する
- env-fallback と error 状態を確認する

## 参照資料

| 資料名            | パス                                                                                | 説明            |
| ----------------- | ----------------------------------------------------------------------------------- | --------------- |
| Phase 10          | `phase-10-final-review.md`                                                          | 事前 gate       |
| Phase 11/12 guide | `.agents/skills/task-specification-creator/references/phase-11-12-guide.md`         | evidence ルール |
| screenshot guide  | `.agents/skills/task-specification-creator/references/phase-11-screenshot-guide.md` | capture ルール  |

## 実行手順

### ステップ1: テスト計画を作る

1. TC-ID を確定する。
2. screenshot plan を作る。
3. 対象 selector と state 名を固定する。

### ステップ2: 画面確認を行う

1. 初期表示
2. 保存成功または Settings CTA
3. env-fallback または error 表示

### ステップ3: 証跡を同期する

1. `manual-test-checklist.md`
2. `manual-test-result.md`
3. `screenshot-coverage.md`
4. `phase11-capture-metadata.json`

## 統合テスト連携

- 自動テスト ID と TC-ID を結び付ける。
- Phase 12 changelog に capture method と結果を記録する。

## テストケース

| テストケース | 観点             | 期待結果                                                 |
| ------------ | ---------------- | -------------------------------------------------------- |
| TC-11-01     | 初期表示         | SkillLifecyclePanel 上で AuthKey 状態と CTA が確認できる |
| TC-11-02     | 保存または導線   | 保存・検証・削除、または Settings への遷移導線が成立する |
| TC-11-03     | fallback / error | env-fallback またはエラー状態が識別可能に表示される      |

## 画面カバレッジマトリクス

| テストケース | 状態                  | 証跡                                                               | 備考                 |
| ------------ | --------------------- | ------------------------------------------------------------------ | -------------------- |
| TC-11-01     | initial               | `outputs/phase-11/screenshots/TC-11-01-skill-authkey-initial.png`  | 基本状態             |
| TC-11-02     | action-success-or-cta | `outputs/phase-11/screenshots/TC-11-02-skill-authkey-action.png`   | 保存成功または CTA   |
| TC-11-03     | fallback-or-error     | `outputs/phase-11/screenshots/TC-11-03-skill-authkey-fallback.png` | env-fallback / error |

## 成果物

| 成果物                   | パス                                                         | 説明              |
| ------------------------ | ------------------------------------------------------------ | ----------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`                  | 実施一覧          |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                     | 実測結果          |
| screenshot coverage      | `outputs/phase-11/screenshot-coverage.md`                    | TC と証跡の紐付け |
| screenshot plan          | `outputs/phase-11/screenshot-plan.json`                      | 撮影計画          |
| capture metadata         | `outputs/phase-11/screenshots/phase11-capture-metadata.json` | 撮影情報          |

## 完了条件

- [ ] TC-11-01〜03 が実施されている
- [ ] screenshot evidence が current workflow 配下にある
- [ ] capture method / fallback reason が metadata に記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
