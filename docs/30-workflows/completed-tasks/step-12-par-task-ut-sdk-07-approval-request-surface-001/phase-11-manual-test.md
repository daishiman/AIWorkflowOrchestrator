# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 11                                                                    |
| Phase名    | 手動テスト                                                            |
| 対象機能   | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: approval:request surface 追加 |
| 前提Phase  | Phase 10: 最終レビュー（PASS/MINOR）                                  |
| 次Phase    | Phase 12: ドキュメント更新                                            |
| ステータス | pending                                                               |
| UI/UX分類  | UI変更あり → スクリーンショット必須                                   |
| 作成日     | 2026-04-06                                                            |
| 更新日     | 2026-04-06                                                            |

## 目的

approval request の表示・操作・TTL expired の動作を手動で確認し、AC-2・AC-4 のスクリーンショット証跡を取得する。

## 実行タスク

- screenshot 計画を確定し、pending / expired / approved / rejected の状態を撮影する。
- 手動操作で `respondToApproval()` の接続と TTL expired の無効化を確認する。
- 取得した証跡を `manual-test-result.md` と screenshot ディレクトリへ記録する。

## 参照資料

| 参照資料             | パス                                                                  | 内容                       |
| -------------------- | --------------------------------------------------------------------- | -------------------------- |
| Phase 10 成果物      | `outputs/phase-10/final-review-result.md`                             | 手動テスト前の最終レビュー |
| ApprovalRequestPanel | `apps/desktop/src/renderer/components/skill/ApprovalRequestPanel.tsx` | UI 証跡対象                |
| SkillLifecyclePanel  | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | 連携 UI                    |
| ApprovalGate.ts      | `apps/desktop/src/main/services/runtime/ApprovalGate.ts`              | TTL / expired 判定         |

## スクリーンショット計画

### 撮影対象コンポーネント

`ApprovalRequestPanel`（新規）・`SkillLifecyclePanel`（変更あり）

### 撮影計画

| TC番号 | 状態ラベル | テーマ | ファイル名                          | 優先度  |
| ------ | ---------- | ------ | ----------------------------------- | ------- |
| TC-01  | pending    | light  | `TC-01-approval-pending-light.png`  | [A]必須 |
| TC-02  | pending    | dark   | `TC-02-approval-pending-dark.png`   | [A]必須 |
| TC-03  | expired    | light  | `TC-03-approval-expired-light.png`  | [A]必須 |
| TC-04  | expired    | dark   | `TC-04-approval-expired-dark.png`   | [A]必須 |
| TC-05  | approved   | light  | `TC-05-approval-approved-light.png` | [A]必須 |
| TC-06  | rejected   | light  | `TC-06-approval-rejected-light.png` | [A]必須 |

撮影先: `outputs/phase-11/screenshots/`

## 手動テストケース

### TC-01 / TC-02: approval request 表示（pending 状態）

**前提条件**:

1. Electron アプリを起動
2. Skill Creator を開く
3. 高権限ツールを使用するスキルを実行して `approval:request` を発火させる

**確認項目**:

- [ ] approval 確認 UI が表示される（AC-2）
- [ ] ツール名・引数が表示されている
- [ ] 承認ボタンと拒否ボタンが表示されている
- [ ] TTL カウントダウン（残り時間）が表示されている
- [ ] ライト・ダークモードで正しく表示される

**スクリーンショット**: `TC-01-approval-pending-light.png` / `TC-02-approval-pending-dark.png`

---

### TC-03 / TC-04: TTL expired 表示

**前提条件**:

- TTL を短く設定した approval request を発火させる（またはリクエスト発行から 300s 経過後）

**確認項目**:

- [ ] expired 警告メッセージが表示される
- [ ] 承認・拒否ボタンが disabled になっている
- [ ] ボタンをクリックしても反応しない

**スクリーンショット**: `TC-03-approval-expired-light.png` / `TC-04-approval-expired-dark.png`

---

### TC-05: approve 操作

**確認項目**:

- [ ] 承認ボタンをクリックすると `respondToApproval({ approved: true })` が送信される
- [ ] スキルの危険操作が実行される
- [ ] approval UI が非表示になる
- [ ] AC-4 enforcement が機能していることを確認（AC-4）

**スクリーンショット**: `TC-05-approval-approved-light.png`

---

### TC-06: reject 操作

**確認項目**:

- [ ] 拒否ボタンをクリックすると `respondToApproval({ approved: false })` が送信される
- [ ] スキルの危険操作がキャンセルされる
- [ ] approval UI が非表示になる

**スクリーンショット**: `TC-06-approval-rejected-light.png`

## 3層評価

| 評価層           | 確認内容                                                     | 判定 |
| ---------------- | ------------------------------------------------------------ | ---- |
| Semantic（意味） | approval UI がセキュリティ目的で正しく機能しているか         | -    |
| Visual（視覚）   | pending/expired/approved/rejected 状態が視覚的に区別できるか | -    |
| AI UX            | ユーザーが approve/reject を直感的に操作できるか             | -    |

## 統合テスト連携

- Phase 11 の screenshot と manual test の結果は Phase 12 のドキュメント更新と Phase 13 の PR 情報へ引き継ぐ。
- AC-2 / AC-4 の証跡は Phase 10 の最終レビューと Phase 12 の compliance check の根拠にする。

## 成果物

| 成果物             | パス                                     | 説明                                     |
| ------------------ | ---------------------------------------- | ---------------------------------------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | 全 TC の確認結果・スクリーンショット一覧 |
| スクリーンショット | `outputs/phase-11/screenshots/*.png`     | TC-01〜TC-06（必須 6 枚）                |

## 完了条件

- [ ] Electron アプリを起動して approval request を発火させた
- [ ] TC-01〜TC-06 の全テストケースを実施した
- [ ] スクリーンショット 6 枚（TC-01〜TC-06）が撮影されている
- [ ] AC-2（approval UI 表示）のスクリーンショット証跡がある
- [ ] AC-4（enforcement の手動テスト screenshot）のスクリーンショット証跡がある
- [ ] expired 時のボタン無効化を確認した
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
