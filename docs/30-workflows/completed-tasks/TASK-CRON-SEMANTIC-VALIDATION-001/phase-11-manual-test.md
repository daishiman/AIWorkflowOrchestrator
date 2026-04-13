# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| Phase番号  | 11                                |
| タスクID   | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 機能名     | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 前提Phase  | Phase 10: 最終レビューゲート      |
| 後続Phase  | Phase 12: ドキュメント更新        |
| ステータス | completed                         |
| 作成日     | 2026-04-12                        |

---

## 目的

ScheduleDialog および ConversationRoundStep コンポーネントに意味論的バリデーションのエラー表示が正しく統合されていることを、実際のデスクトップアプリケーション上で手動確認する。

**タスク種別: NON_VISUAL**（ScheduleDialog / ConversationRoundStep のエラー表示契約は既存ロジックで確認）

---

## 実行タスク

### Task 11-1: 環境チェック

アプリケーションが正常に起動することを確認する。

```bash
pnpm --filter @repo/desktop preview
```

起動確認項目:

- アプリケーションウィンドウが表示される
- コンソールエラーが出ていない
- ScheduleDialog が正常に開く

### Task 11-2: テストシナリオ実行

以下の4シナリオを順に実行し、期待動作と一致するか確認する。

#### シナリオ 1: 存在しない日付（2月31日）

| 項目     | 内容                                                 |
| -------- | ---------------------------------------------------- |
| 操作     | ScheduleDialog で「月: 2月、日: 31日」に設定する     |
| 期待結果 | エラーメッセージが表示され、保存ボタンが無効化される |
| 確認方法 | エラーメッセージのテキストが意味のある内容か確認     |

#### シナリオ 2: 2月29日（有効入力）

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| 操作     | ScheduleDialog で「月: 2月、日: 29日」に設定する |
| 期待結果 | エラーメッセージは表示されず、保存が可能になる   |
| 確認方法 | 2月29日が有効な入力として扱われるか確認          |

#### シナリオ 3: 存在しない日付（2月30日）

| 項目     | 内容                                                 |
| -------- | ---------------------------------------------------- |
| 操作     | ScheduleDialog で「月: 2月、日: 30日」に設定する     |
| 期待結果 | エラーメッセージが表示され、保存ボタンが無効化される |
| 確認方法 | 2月30日が存在しないことを確認する                    |

#### シナリオ 4: ConversationRoundStep でのエラー表示

| 項目     | 内容                                                    |
| -------- | ------------------------------------------------------- |
| 操作     | ConversationRoundStep で「月: 2月、日: 31日」に設定する |
| 期待結果 | ConversationRoundStep 内にエラー表示が出る              |
| 確認方法 | エラー表示の位置・スタイルが適切か確認                  |

### Task 11-3: スクリーンショット取得

このタスクは validator 上 `NON_VISUAL` 扱いのため、スクリーンショット取得は `N/A`。
必要な確認は `outputs/phase-11/manual-test-checklist.md`、`outputs/phase-11/manual-test-report.md`、`outputs/phase-11/manual-test-result.md` に記録する。
以下の `screenshot-plan.json` は visual タスク向けテンプレート参照であり、本タスクでは使用しない。

screenshot-plan.json:

```json
{
  "mode": "VISUAL",
  "scenarios": [
    {
      "id": "scenario-1",
      "description": "2月31日エラー表示",
      "file": "outputs/phase-11/screenshots/scenario-1-feb31-error.png"
    },
    {
      "id": "scenario-2",
      "description": "2月29日保存成功",
      "file": "outputs/phase-11/screenshots/scenario-2-feb29-valid.png"
    },
    {
      "id": "scenario-3",
      "description": "2月30日エラー表示",
      "file": "outputs/phase-11/screenshots/scenario-3-feb30-error.png"
    },
    {
      "id": "scenario-4",
      "description": "ConversationRoundStepエラー表示",
      "file": "outputs/phase-11/screenshots/scenario-4-conversation-round-error.png"
    }
  ]
}
```

### Task 11-4: 発見された問題の記録

テスト中に発見した問題・改善点を `outputs/phase-11/discovered-issues.md` に記録する。

### Task 11-5: UI サニティ・ビジュアルレビュー

スクリーンショットがある場合はそれをもとに、ない場合は既存 UI コンポーネントの表示契約と手動シナリオ結果をもとに UI の視覚的品質を確認する。

確認観点:

- エラーメッセージのフォントサイズ・色が視認しやすい
- エラー表示位置が UI デザインと整合している
- ダークモード / ライトモードでの表示が適切

---

## 参照資料

| 参照資料              | パス                                                                            | 説明                 |
| --------------------- | ------------------------------------------------------------------------------- | -------------------- |
| 最終レビュー結果      | `outputs/phase-10/final-review-report.md`                                       | Phase 10 成果物      |
| ScheduleDialog        | `apps/desktop/src/renderer/views/ScheduleManager/components/ScheduleDialog.tsx` | 既存 UI consumer     |
| ConversationRoundStep | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`   | 既存 UI consumer     |
| 対象バリデーター      | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`                    | エラー文字列の生成元 |
| GitHub Issue          | `#2082`                                                                         | 元課題               |

---

## 実行手順

### Step 1: アプリ起動または静的確認

```bash
pnpm --filter @repo/desktop preview
```

UI 差分や視覚確認が必要な場合はアプリを起動する。
validator 内部実装のみの変更で UI consumer が既存契約を維持する場合は、テスト結果と既存表示ロジックの静的確認をもって代替してよい。

### Step 2: シナリオ 1〜4 の順次実行

各シナリオを実行し、期待結果と一致するか確認する。

### Step 3: スクリーンショット取得

UI 差分があるシナリオのみ、各シナリオのスクリーンショットを `outputs/phase-11/screenshots/` に保存する。
UI 差分がない場合は `phase11-capture-metadata.json` に `status: "N/A"` と理由を残す。

### Step 4: 問題記録

発見した問題・改善点を `outputs/phase-11/discovered-issues.md` に記録する。

### Step 5: テスト結果レポート作成

```bash
# 成果物ディレクトリの作成
mkdir -p outputs/phase-11
```

`outputs/phase-11/manual-test-result.md` にシナリオ別の結果を記録する。
`outputs/phase-11/manual-test-report.md` に総合レポートを作成する。

### Step 6: phase11-capture-metadata.json 作成

```json
{
  "phase": 11,
  "taskId": "TASK-CRON-SEMANTIC-VALIDATION-001",
  "executedAt": "YYYY-MM-DDTHH:mm:ssZ",
  "scenarios": [
    {
      "id": "scenario-1",
      "status": "PASS/FAIL/N/A",
      "screenshotPath": "...",
      "note": "..."
    },
    {
      "id": "scenario-2",
      "status": "PASS/FAIL/N/A",
      "screenshotPath": "...",
      "note": "..."
    },
    {
      "id": "scenario-3",
      "status": "PASS/FAIL/N/A",
      "screenshotPath": "...",
      "note": "..."
    },
    {
      "id": "scenario-4",
      "status": "PASS/FAIL/N/A",
      "screenshotPath": "...",
      "note": "..."
    }
  ],
  "overallStatus": "PASS/FAIL"
}
```

---

## 統合テスト連携【必須】

- 手動テストで発見された問題は、深刻度に応じて対応 Phase に差し戻す。
- 軽微な問題は `outputs/phase-11/discovered-issues.md` に記録して Phase 12 に申し送る。
- シナリオ 1〜3 が全て PASS の場合のみ Phase 12 へ進む。

---

## 成果物

| ファイル                                         | 説明                                                    |
| ------------------------------------------------ | ------------------------------------------------------- |
| `outputs/phase-11/manual-test-result.md`         | シナリオ別テスト結果                                    |
| `outputs/phase-11/manual-test-report.md`         | 手動テスト総合レポート                                  |
| `outputs/phase-11/discovered-issues.md`          | 発見された問題・改善点                                  |
| `outputs/phase-11/ui-sanity-visual-review.md`    | UI ビジュアルレビュー結果                               |
| `outputs/phase-11/phase11-capture-metadata.json` | スクリーンショットメタデータ                            |
| `outputs/phase-11/screenshots/`                  | 各シナリオのスクリーンショット（UI 差分がある場合のみ） |

---

## 完了条件

- [ ] 環境チェックが完了し、アプリ起動または静的確認のどちらで進めたかが記録されている
- [ ] シナリオ 1: 2月31日エラー表示が確認できた
- [ ] シナリオ 2: 2月29日が有効設定として通過することを確認できた
- [ ] シナリオ 3: 2月30日エラー表示が確認できた
- [ ] シナリオ 4: ConversationRoundStep でのエラー表示が確認できた
- [ ] スクリーンショットが必要な場合は保存され、不要な場合は `phase11-capture-metadata.json` に理由が記録されている
- [ ] 発見された問題が `outputs/phase-11/discovered-issues.md` に記録されている
- [ ] UI ビジュアルレビューが完了している
- [ ] `outputs/phase-11/phase11-capture-metadata.json` が作成されている

---

## サブタスク管理

| サブタスクID | 内容                            | ステータス |
| ------------ | ------------------------------- | ---------- |
| 11-1         | 環境チェック                    | pending    |
| 11-2         | テストシナリオ実行              | pending    |
| 11-3         | スクリーンショット取得          | pending    |
| 11-4         | 発見された問題の記録            | pending    |
| 11-5         | UI サニティ・ビジュアルレビュー | pending    |

---

## タスク100%実行確認【必須】

Phase 11 完了前に以下を全て確認すること。

- [ ] 全サブタスク（11-1〜11-5）が完了またはスキップ理由が記録されている
- [ ] シナリオ 1〜4 の全てに判定結果（PASS/FAIL）が記録されている
- [ ] 必須成果物（5ファイル）が全て `outputs/phase-11/` に保存されている
- [ ] Phase 12 への引き継ぎ情報（申し送り事項・未解決問題）が記録されている

---

## 次のPhase

**Phase 12: ドキュメント更新**

- 手動テストの結果をもとにドキュメントを整備する。
- 発見された問題は Phase 12 のドキュメントに反映する。
