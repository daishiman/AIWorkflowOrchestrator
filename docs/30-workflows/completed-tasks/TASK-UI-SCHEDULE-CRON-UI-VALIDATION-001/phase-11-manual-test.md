# Phase 11: 手動テスト（VISUAL）

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 11                                      |
| タスクID   | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |
| タスク名   | VisualCronPicker UIバリデーション整理   |
| 前提Phase  | Phase 10                                |
| 後続Phase  | Phase 12                                |
| 作成日     | 2026-04-13                              |
| ステータス | 完了                                    |
| タスク種別 | VISUAL（スクリーンショット証跡必須）    |

## 目的

`VisualCronPicker` コンポーネントのUIバリデーション動作が正しく機能していることを、
Electronアプリを実際に起動して目視・スクリーンショットで確認する。

本タスクはVISUALタスクであるため、スクリーンショットによる証跡が必須となる。
自動テストのみでは証跡として不十分であり、実際のUI表示・エラーメッセージの描画を確認する。

## 実行タスク

- Electronアプリを起動してスケジュール設定画面へ到達する（smoke test）
- weekly + 空曜日のエラー表示状態をスクリーンショットで記録する
- weekly + 曜日選択済みの正常状態をスクリーンショットで記録する
- monthly + 無効日付（0 または 32）を、ハーネスの `value` 注入で monthly 表示状態にして再現し、エラー表示状態をスクリーンショットで記録する（直接入力モードは別タスク）
- monthly + 有効日付の正常状態をスクリーンショットで記録する
- 手動テスト結果と視覚的レビュー内容を記録する

## 参照資料

| 資料名                                 | パス                                                                                                 | 用途                                |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 2 設計                           | `phase-2-design.md`                                                                                  | バリデーション設計の前提            |
| Phase 5 実装                           | `phase-5-implementation.md`                                                                          | UIコンポーネント実装の確認          |
| Phase 6 テスト拡充                     | `phase-6-test-expansion.md`                                                                          | バリデーションテストの根拠          |
| Phase 9 品質保証                       | `phase-9-quality-assurance.md`                                                                       | 品質ゲート結果の前提                |
| AC検証詳細                             | `outputs/phase-10/ac-verification.md`                                                                | Phase 10 成果物                     |
| 最終レビュー結果                       | `outputs/phase-10/final-review-result.md`                                                            | Phase 10 成果物                     |
| 参考: WEEKDAYS-GUARD Phase 11          | `docs/30-workflows/completed-tasks/TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001/phase-11-manual-test.md` | NON_VISUALとの比較参照              |
| 知見: renderer UIとnode-onlyパッケージ | `docs/lessons-learned/W1-02b-4.md`（相当）                                                           | renderer UI注意事項（知見W1-02b-4） |

## タスク種別判定

| 項目                   | 判定                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| UI変更                 | あり（VISUAL）                                                                                                                 |
| 純粋関数修正           | あり（バリデーションロジック）                                                                                                 |
| スクリーンショット要否 | 必須（VISUAL）                                                                                                                 |
| 証跡の主ソース         | `manual-test-checklist.md` + `manual-test-result.md` + `screenshot-plan.json` + `screenshots/*.png` + `screenshot-coverage.md` |

**VISUAL理由**:
本タスクは `VisualCronPicker` というUIコンポーネントのバリデーション表示を変更する。
エラーメッセージの表示・非表示・テキスト内容はスクリーンショットによる目視確認が必要。
自動テストのみでは実際のUI描画品質を保証できないため、VISUAL判定とする。

## 注意事項（知見 W1-02b-4）

> renderer UIコンポーネントでは `node-only` パッケージをimportしないこと。

- `VisualCronPicker.tsx` 等のrenderer側コンポーネントで `fs`・`path`・`child_process` 等をimportしないこと
- バリデーションロジックをrenderer側に持たせる場合は、純粋なTypeScript関数として実装すること
- Electron IPC経由でmainプロセスの機能を呼び出す場合は `safeInvoke` パターンを使用すること

## 実行手順

### Step 1: 事前確認

```bash
# 作業ブランチの確認
git branch --show-current

# 依存関係のインストール（必要な場合）
pnpm install

# TypeScript型チェックが通ることを確認
pnpm --filter @repo/desktop typecheck
```

### Step 2: Electronアプリの起動

```bash
# デスクトップアプリを開発モードで起動
pnpm --filter @repo/desktop dev
```

起動後、アプリが正常に表示されることを確認する（smoke test）。

### Step 3: スケジュール設定画面への到達

1. アプリ起動後、スケジュール設定画面へナビゲートする
2. `VisualCronPicker` が表示されるフォームを開く
3. 画面が正常に描画されていることを確認する（初期状態のスクリーンショットを任意で撮影）

### Step 4: スクリーンショット撮影（4シーン）

#### シーン 1: weekly + 空曜日（エラー状態）

1. 頻度を「週次（weekly）」に設定する
2. 曜日を**一つも選択しない**状態にする（または選択済みを全て解除する）
3. バリデーションがトリガーされる操作を行う（フォーカスアウト・送信試行等）
4. エラーメッセージが表示された状態でスクリーンショットを撮影する
5. ファイル名: `scene-01-weekly-empty-weekdays-error.png`

**確認ポイント**:

- エラーメッセージが画面に表示されていること
- エラーテキストが曜日未選択を示す内容であること
- 送信ボタン等がdisabled状態になっていること（実装による）

#### シーン 2: weekly + 曜日選択済み（正常状態）

1. 頻度を「週次（weekly）」に設定する
2. 曜日を**1つ以上選択**する（例: 月・水・金）
3. バリデーションエラーが表示されていないことを確認する
4. 正常状態のスクリーンショットを撮影する
5. ファイル名: `scene-02-weekly-valid-weekdays-ok.png`

**確認ポイント**:

- エラーメッセージが表示されていないこと
- 選択した曜日がUIに反映されていること
- フォームが送信可能な状態であること

#### シーン 3: monthly + 無効日付（エラー状態）

1. 頻度を「月次（monthly）」に設定する
2. ハーネスの `value=0 9 0 * *` または `value=0 9 32 * *` による初期表示で monthly 状態を再現する
3. エラーメッセージが表示された状態を確認する
4. エラー表示状態でスクリーンショットを撮影する
5. ファイル名: `scene-03-monthly-invalid-date-error.png`

**確認ポイント**:

- エラーメッセージが画面に表示されていること
- エラーテキストが無効な日付（1〜31の範囲外）を示す内容であること
- `0` と `32` のどちらでもエラーが出ることを確認する

#### シーン 4: monthly + 有効日付（正常状態）

1. 頻度を「月次（monthly）」に設定する
2. 日付に有効な値を入力する（例: `15`）
3. バリデーションエラーが表示されていないことを確認する
4. 正常状態のスクリーンショットを撮影する
5. ファイル名: `scene-04-monthly-valid-date-ok.png`

**確認ポイント**:

- エラーメッセージが表示されていないこと
- 入力した日付がUIに反映されていること
- フォームが送信可能な状態であること

### Step 5: スクリーンショットの格納

撮影した4枚のスクリーンショットを以下のパスに格納する:

```
outputs/phase-11/
├── screenshot-plan.json
├── screenshot-coverage.md
├── manual-test-checklist.md
├── manual-test-result.md
├── discovered-issues.md
├── manual-test-report.md
├── ui-sanity-visual-review.md
└── screenshots/
    ├── scene-01-weekly-empty-weekdays-error.png
    ├── scene-02-weekly-valid-weekdays-ok.png
    ├── scene-03-monthly-invalid-date-error.png
    ├── scene-04-monthly-valid-date-ok.png
    └── phase11-capture-metadata.json
```

### Step 6: 成果物の作成

```bash
# 成果物ディレクトリの確認
ls outputs/phase-11/
ls outputs/phase-11/screenshots/

# manual-test-checklist.md の作成（手動）
# manual-test-result.md の作成（手動）
# discovered-issues.md の作成（手動）
# manual-test-report.md の作成（手動）
# ui-sanity-visual-review.md の作成（手動）
# screenshot-plan.json の作成（手動）
# screenshot-coverage.md の作成（手動）
# screenshots/phase11-capture-metadata.json の作成（手動）
```

## テストケース

| シーンID | 頻度    | 入力値                               | 期待するUI状態       | エラーメッセージ有無 | スクリーンショット                       |
| -------- | ------- | ------------------------------------ | -------------------- | -------------------- | ---------------------------------------- |
| SC-01    | weekly  | 曜日: なし（空）                     | エラーメッセージ表示 | あり                 | scene-01-weekly-empty-weekdays-error.png |
| SC-02    | weekly  | 曜日: 月・水・金                     | 正常（エラーなし）   | なし                 | scene-02-weekly-valid-weekdays-ok.png    |
| SC-03    | monthly | 直接入力: `0 9 0 * *` / `0 9 32 * *` | エラーメッセージ表示 | あり                 | scene-03-monthly-invalid-date-error.png  |
| SC-04    | monthly | 日付: 15                             | 正常（エラーなし）   | なし                 | scene-04-monthly-valid-date-ok.png       |

## 画面カバレッジマトリクス

| カバー対象 | 表示状態     | 証跡                                       |
| ---------- | ------------ | ------------------------------------------ |
| weekly     | 空曜日エラー | `scene-01-weekly-empty-weekdays-error.png` |
| weekly     | 正常表示     | `scene-02-weekly-valid-weekdays-ok.png`    |
| monthly    | 範囲外エラー | `scene-03-monthly-invalid-date-error.png`  |
| monthly    | 正常表示     | `scene-04-monthly-valid-date-ok.png`       |

## ウォークスルーシナリオ発見事項分類欄

| 発見事項ID  | 内容                                                            | 分類（HIGH/MEDIUM/LOW/INFO） | 対処方針                                             |
| ----------- | --------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------- |
| ISSUE-11-01 | weekly エラーの text-xs と monthly エラーの text-sm が不統一    | LOW                          | TASK-CRON-ERROR-STYLE-UNIFICATION-001 として切り出す |
| ISSUE-11-02 | 直接入力モードの月次無効値検証は visual contract に含めていない | MEDIUM                       | TASK-CRON-CUSTOM-VALIDATION-001 の要否を別途判断する |

**HIGH** 問題が発見された場合: Phase 5〜8 に戻り修正する
**MEDIUM/LOW** 問題が発見された場合: Phase 12 の未タスクとして記録する

## 統合テスト連携

Phase 10 で確定した AC を手動テストの確認軸として引き継ぐ。
Phase 12 では、今回の VISUAL 証跡（スクリーンショット4枚）を記録し、Phase 13 への閉じを準備する。

## 多角的チェック観点

| チェック観点     | 確認内容                                                                  |
| ---------------- | ------------------------------------------------------------------------- |
| 視覚的整合性     | エラーメッセージのテキスト・色・位置がデザイン仕様と一致するか            |
| アクセシビリティ | エラー状態がスクリーンリーダー等にも伝わる実装か（aria-invalid等）        |
| エッジケース     | 曜日を途中で全解除した場合にリアルタイムでエラーが出るか                  |
| 回帰確認         | 既存の正常ケース（daily等）が壊れていないか                               |
| renderer制約     | node-onlyパッケージを誤ってrenderer側でimportしていないか（知見W1-02b-4） |

## サブタスク管理

| サブタスクID | 内容                                     | 状態 |
| ------------ | ---------------------------------------- | ---- |
| ST-11-01     | Electronアプリ起動・smoke test           | 完了 |
| ST-11-02     | SC-01: weekly空曜日エラーシーン撮影      | 完了 |
| ST-11-03     | SC-02: weekly正常シーン撮影              | 完了 |
| ST-11-04     | SC-03: monthly無効日付エラーシーン撮影   | 完了 |
| ST-11-05     | SC-04: monthly正常シーン撮影             | 完了 |
| ST-11-06     | 成果物（manual-test-checklist.md等）作成 | 完了 |

## 成果物

| 成果物                        | パス                                                                    | 説明                                 |
| ----------------------------- | ----------------------------------------------------------------------- | ------------------------------------ |
| 手動テストチェックリスト      | `outputs/phase-11/manual-test-checklist.md`                             | 4シーン全ての実行可否・証跡紐付け    |
| 手動テスト結果                | `outputs/phase-11/manual-test-result.md`                                | 4シーン全ての実行結果・判定サマリー  |
| 発見課題                      | `outputs/phase-11/discovered-issues.md`                                 | 高/中/低の発見事項                   |
| 手動テストレポート            | `outputs/phase-11/manual-test-report.md`                                | 4シーン全体の要約                    |
| UI/UX視覚レビュー             | `outputs/phase-11/ui-sanity-visual-review.md`                           | UI整合性・視覚品質のレビュー         |
| 撮影計画                      | `outputs/phase-11/screenshot-plan.json`                                 | 撮影対象と TC-ID の対応              |
| 画面カバレッジ                | `outputs/phase-11/screenshot-coverage.md`                               | カバレッジ率と N/A 理由              |
| キャプチャメタデータ          | `outputs/phase-11/screenshots/phase11-capture-metadata.json`            | タスク種別・撮影シーン・実行日の記録 |
| スクリーンショット（シーン1） | `outputs/phase-11/screenshots/scene-01-weekly-empty-weekdays-error.png` | weekly + 空曜日エラー状態            |
| スクリーンショット（シーン2） | `outputs/phase-11/screenshots/scene-02-weekly-valid-weekdays-ok.png`    | weekly + 曜日選択済み正常状態        |
| スクリーンショット（シーン3） | `outputs/phase-11/screenshots/scene-03-monthly-invalid-date-error.png`  | monthly + 無効日付エラー状態         |
| スクリーンショット（シーン4） | `outputs/phase-11/screenshots/scene-04-monthly-valid-date-ok.png`       | monthly + 有効日付正常状態           |

### `outputs/phase-11/screenshots/phase11-capture-metadata.json` 雛形

```json
{
  "taskId": "TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001",
  "phase": 11,
  "taskType": "VISUAL",
  "reason": "VisualCronPickerコンポーネントのUIバリデーション表示変更。エラーメッセージの描画をスクリーンショットで確認必須。",
  "scenes": [
    {
      "sceneId": "SC-01",
      "description": "weekly + 空曜日: エラーメッセージ表示状態",
      "file": "scene-01-weekly-empty-weekdays-error.png"
    },
    {
      "sceneId": "SC-02",
      "description": "weekly + 曜日選択済み: 正常状態",
      "file": "scene-02-weekly-valid-weekdays-ok.png"
    },
    {
      "sceneId": "SC-03",
      "description": "monthly + 無効日付（0または32）: エラーメッセージ表示状態",
      "file": "scene-03-monthly-invalid-date-error.png"
    },
    {
      "sceneId": "SC-04",
      "description": "monthly + 有効日付: 正常状態",
      "file": "scene-04-monthly-valid-date-ok.png"
    }
  ],
  "executedAt": "2026-04-13"
}
```

## 完了条件

- [x] Electronアプリが正常に起動し、スケジュール設定画面に到達できた（smoke test）
- [x] SC-01〜SC-04 の全シーンのスクリーンショットが撮影・格納されている
- [x] `outputs/phase-11/manual-test-checklist.md` が作成されている
- [x] `outputs/phase-11/manual-test-result.md` が作成されている
- [x] `outputs/phase-11/discovered-issues.md` が作成されている
- [x] `outputs/phase-11/manual-test-report.md` が作成されている
- [x] `outputs/phase-11/ui-sanity-visual-review.md` が作成されている
- [x] `outputs/phase-11/screenshot-plan.json` が作成されている
- [x] `outputs/phase-11/screenshot-coverage.md` が作成されている
- [x] `outputs/phase-11/screenshots/phase11-capture-metadata.json` に `taskType: "VISUAL"` が記載されている
- [x] HIGH 問題なし（または全て unassigned-task として記録済み）
- [x] 全成果物が `outputs/phase-11/` と `outputs/phase-11/screenshots/` に出力されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001
```

## 次Phase

Phase 12: ドキュメント更新
