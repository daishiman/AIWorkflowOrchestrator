# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Phase      | 11                                                 |
| Phase名    | 手動テスト                                         |
| カテゴリ   | テスト                                             |
| 前提Phase  | Phase 10                                           |
| 後続Phase  | Phase 12                                           |
| 作成日     | 2026-04-06                                         |
| タスク分類 | **UI task = VISUAL**（スクリーンショット取得必須） |

## 目的

Electron アプリ上で手動テストを実施し、SessionResumePrompt・SessionIndicator のビジュアル確認と UX フローを検証する。
スクリーンショットは `UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001` への引き継ぎ資料として保存する。

---

## 注意事項

**本タスクは UI task = VISUAL 分類**であるため、自動テスト代替は使用しない。
Electron アプリを実際に起動して、TC-01〜TC-06 の各シナリオを手動で実施すること。

---

## 実行タスク

### タスク1: アプリ起動の確認

```bash
pnpm --filter @repo/desktop dev
```

起動後に以下を確認する:

- [ ] アプリが正常に起動する
- [ ] TypeScript / Vite のビルドエラーがない

### タスク2: 手動テストシナリオの実施（TC-01〜TC-06）

| TC    | 前提条件                              | 操作手順                                                     | 確認内容                                                       |
| ----- | ------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| TC-01 | 未完了セッションが0件                 | アプリを起動する                                             | SessionResumePrompt が表示されない                             |
| TC-02 | 未完了セッションが0件（ダークテーマ） | ダークテーマでアプリを起動する                               | SessionResumePrompt が表示されない（ダークテーマで確認）       |
| TC-03 | 未完了セッションが1件以上存在する     | アプリを起動する                                             | SessionResumePrompt にセッション一覧が表示される               |
| TC-04 | TC-03 の状態から操作                  | 「削除して新規開始」ボタンをクリックする                     | セッションが削除され、新規セッション開始画面に遷移する         |
| TC-05 | TC-03 の状態から操作                  | 「続きから再開」ボタンをクリックし、resumeSession が失敗する | エラーバナーが表示される（`SkillLifecyclePanel` のエラー表示） |
| TC-06 | セッションがアクティブな状態          | スキル作成フロー中にパネルを確認する                         | SessionIndicator に session_id と経過時間が pulse 表示される   |

### タスク3: スクリーンショットの取得

各 TC のスクリーンショットを取得し、`outputs/phase-11/screenshots/` に保存する:

| ファイル名                    | 対応 TC | 内容                         |
| ----------------------------- | ------- | ---------------------------- |
| `tc-01-no-session.png`        | TC-01   | セッションなし初期状態       |
| `tc-02-no-session-dark.png`   | TC-02   | ダークテーマ・セッションなし |
| `tc-03-session-list.png`      | TC-03   | セッション一覧表示           |
| `tc-04-after-skip.png`        | TC-04   | スキップ後新規開始           |
| `tc-05-error-banner.png`      | TC-05   | resumeSession エラー表示     |
| `tc-06-session-indicator.png` | TC-06   | SessionIndicator pulse 表示  |

**スクリーンショット取得が困難な場合**: セッション状態の再現方法として、`SkillCreatorWorkflowSessionRepository` の storage に直接 fixture checkpoint を注入してからアプリを起動する。

### タスク4: 発見された問題の記録

`outputs/phase-11/discovered-issues.md` に以下の形式で記録する:

```markdown
| 問題ID                          | TC  | 重大度 | 内容 | 対処方針 |
| ------------------------------- | --- | ------ | ---- | -------- |
| （問題がなければ「0件」と記録） |
```

---

## 参照資料

| 資料名                | パス                                                                            | 説明                         |
| --------------------- | ------------------------------------------------------------------------------- | ---------------------------- |
| index.md              | `index.md`                                                                      | 受入基準・完了イメージ       |
| UT-P0-08-PHASE11 spec | `docs/30-workflows/unassigned-task/UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001.md` | 後続スクリーンショットタスク |

---

## 成果物

| 成果物                   | パス                                        | 説明                          |
| ------------------------ | ------------------------------------------- | ----------------------------- |
| manual-test-checklist.md | `outputs/phase-11/manual-test-checklist.md` | TC-01〜TC-06 チェックリスト   |
| manual-test-result.md    | `outputs/phase-11/manual-test-result.md`    | テスト実施結果                |
| discovered-issues.md     | `outputs/phase-11/discovered-issues.md`     | 発見された問題（0件でも出力） |
| screenshots/             | `outputs/phase-11/screenshots/*.png`        | 各 TC のスクリーンショット    |

---

## 統合テスト連携【必須】

| 判定項目               | 基準 | 備考                                                     |
| ---------------------- | ---- | -------------------------------------------------------- |
| TC-01〜TC-06 全実施    | PASS | Electron アプリで実際に手動テストを実施すること          |
| スクリーンショット取得 | 6件  | tc-01〜tc-06 の PNG が screenshots/ に保存されていること |
| 発見済み HIGH 問題     | 0件  | HIGH がある場合は Phase 5/8 へ差し戻し                   |

## 完了条件

- [ ] TC-01〜TC-06 が全て実施されている
- [ ] スクリーンショット（tc-01〜tc-06）が `outputs/phase-11/screenshots/` に保存されている
- [ ] `manual-test-result.md` に各 TC の PASS/FAIL が記録されている
- [ ] `discovered-issues.md` が作成されている（0件でも出力必須）
- [ ] HIGH 重大度の問題がある場合は Phase 5/8 へ差し戻されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 後続タスクへの引き継ぎ

| 後続タスク                               | 引き継ぎ内容                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------- |
| UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001 | `outputs/phase-11/screenshots/` の PNG ファイルと手動テスト結果を引き継ぐ |

## 次のPhase

Phase 12: ドキュメント更新
