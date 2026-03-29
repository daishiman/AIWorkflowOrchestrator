# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 11                                        |
| Phase名    | 手動テスト                                |
| 対象機能   | claude-sdk-message-contract-normalization |
| 前提Phase  | Phase 10（最終レビューゲート）            |
| 後続Phase  | Phase 12（ドキュメント更新）              |
| ステータス | pending                                   |
| 作成日     | 2026-03-29                                |

## 目的

plan / execute / improve で UI に正規化イベントが期待通り表示されるかを手動確認する。

## 背景

正規化イベントが plan / execute / improve の各フローで UI に正しく表示されるかを手動で確認する。

## 実行タスク

### Task 1: plan 実行で init / result を確認する

**目的**: plan フローにおいて init イベントと result イベントが正しく UI に表示されることを確認する

**実行手順**:

1. plan フローを実行する
2. init イベントの表示を確認する
3. result イベントの表示を確認する

**期待される成果物**:

- plan フローの手動確認結果

### Task 2: execute 実行で result subtype を確認する

**目的**: execute フローにおいて result subtype が正しく UI に反映されることを確認する

**実行手順**:

1. execute フローを実行する
2. result subtype の表示を確認する

**期待される成果物**:

- execute フローの手動確認結果

### Task 3: permission denial ケースを確認する

**目的**: permission denial が発生した場合に正規化イベントが正しく UI に表示されることを確認する

**実行手順**:

1. permission denial が発生するケースを再現する
2. UI 上の表示が期待通りであることを確認する

**期待される成果物**:

- permission denial ケースの手動確認結果

## 参照資料

| 資料名   | パス                       | 説明         |
| -------- | -------------------------- | ------------ |
| Phase 10 | `phase-10-final-review.md` | 最終レビュー |

## 成果物

| 成果物             | パス                                     | 説明     |
| ------------------ | ---------------------------------------- | -------- |
| manual test result | `outputs/phase-11/manual-test-result.md` | 手動確認 |

## 統合テスト連携

手動統合テスト（UI 正規化イベント表示）を確認する

## 完了条件

- [ ] 手動確認が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10 が完了していること
- **後続**: Phase 12 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-12-documentation.md`
