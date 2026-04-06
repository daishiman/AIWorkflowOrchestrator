# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 3                                                                     |
| Phase名    | 設計レビュー                                                          |
| 対象機能   | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: approval:request surface 追加 |
| 前提Phase  | Phase 2: 設計                                                         |
| 次Phase    | Phase 4: テスト作成（PASS/MINOR） / Phase 2: 設計（MAJOR/CRITICAL）   |
| ステータス | pending                                                               |
| 作成日     | 2026-04-06                                                            |
| 更新日     | 2026-04-06                                                            |

## 目的

Phase 2 の設計書を多角的に検証し、Phase 4 へ進めるか判定する（PASS/MINOR/MAJOR/CRITICAL）。

## 実行手順

### Step 1: Phase 2 の設計書を読み込む

`outputs/phase-2/architecture-design.md` を読み込み、設計の全体像を把握する。

### Step 2: 以下のレビュー観点を順次確認する

## 実行タスク

- Phase 2 の設計書を読み込み、approval surface の設計前提を把握する。
- IPC 4層整合性、UI コンポーネント設計、respondToApproval 接続を判定する。
- simpler alternative とセキュリティを確認し、Phase 4 へ進めるかを決める。

## 参照資料

| 参照資料              | パス                                                                          | 内容                   |
| --------------------- | ----------------------------------------------------------------------------- | ---------------------- |
| Phase 2 成果物        | `outputs/phase-2/architecture-design.md`                                      | 設計書                 |
| skill-creator-api.ts  | `apps/desktop/src/preload/skill-creator-api.ts`                               | listener 設計の参照    |
| SkillLifecyclePanel   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`          | UI 設計の参照          |
| ApprovalGate.ts       | `apps/desktop/src/main/services/runtime/ApprovalGate.ts`                      | TTL / request 型の参照 |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | 4層整合性の確認        |

## レビュー観点

### チェック 1: IPC 4層整合性

| 確認項目                                              | 判定 | 備考 |
| ----------------------------------------------------- | ---- | ---- |
| `APPROVAL_REQUEST` 定数が `channels.ts` に存在する    | -    |      |
| `onApprovalRequest` が preload interface に追加される | -    |      |
| `ApprovalRequest` 型が共有型定義と整合している        | -    |      |
| cleanup function（removeListener）が設計されている    | -    |      |

### チェック 2: UI コンポーネント設計

| 確認項目                                                                | 判定 | 備考 |
| ----------------------------------------------------------------------- | ---- | ---- |
| approval UI の表示状態が網羅されている（idle/pending/expired/resolved） | -    |      |
| Props 型が適切に設計されている                                          | -    |      |
| TTL 計算ロジックが正確か（expiresAt - Date.now()）                      | -    |      |
| expired 時に approve/reject が無効化される設計になっているか            | -    |      |

### チェック 3: respondToApproval() との接続

| 確認項目                                                | 判定 | 備考 |
| ------------------------------------------------------- | ---- | ---- |
| 既実装の `respondToApproval()` の引数型と一致しているか | -    |      |
| エラーハンドリング（IPC 失敗時）が設計されているか      | -    |      |
| 非同期処理中のローディング状態が考慮されているか        | -    |      |

### チェック 4: セキュリティ

| 確認項目                                         | 判定 | 備考 |
| ------------------------------------------------ | ---- | ---- |
| expired request への操作を UI 側でも防いでいるか | -    |      |
| requestId の検証が行われるか（Main 側は既実装）  | -    |      |
| IPC セキュリティパターンに準拠しているか         | -    |      |

### チェック 5: simpler alternative の検討

以下の設計判断について、より単純な代替案がないか検証する:

- `ipcRenderer.on` vs `ipcRenderer.once`: TTL single-use であれば `once` が適切か？
- 専用コンポーネント vs インライン実装: 分離は正当化されるか？
- TTL カウントダウン表示: setInterval は本当に必要か？期限表示のみで十分か？

## 統合テスト連携

- Phase 3 の判定結果は Phase 4 のテストケース作成へそのまま引き継ぐ。
- MINOR が出た場合は Phase 8 / Phase 12 の改善対象に反映する。

## 判定基準

| 判定     | 条件                                                      | 対応                                     |
| -------- | --------------------------------------------------------- | ---------------------------------------- |
| PASS     | 全チェックが問題なし                                      | Phase 4 へ進む                           |
| MINOR    | 軽微な問題あり（設計変更なしで解決可能）                  | Phase 4 へ進み、MINOR 追跡テーブルで管理 |
| MAJOR    | 設計の見直しが必要な問題あり                              | Phase 2 へ戻り設計を修正                 |
| CRITICAL | 根本的な設計上の欠陥あり（AC 未達成・セキュリティ問題等） | Phase 2 へ戻り全面見直し                 |

## MINOR 追跡テーブル（MINOR 判定時に記載）

| 指摘番号 | 内容 | 解決予定Phase | 確認Phase |
| -------- | ---- | ------------- | --------- |
| -        | -    | -             | -         |

## 成果物

| 成果物           | パス                                      | 説明                             |
| ---------------- | ----------------------------------------- | -------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果・指摘事項・MINOR 追跡表 |

## 完了条件

- [ ] Phase 2 の設計書を読み込み、全チェック観点を確認した
- [ ] IPC 4 層整合性チェックが完了している
- [ ] UI コンポーネント設計（状態網羅・Props 型）を確認した
- [ ] respondToApproval() との接続設計を確認した
- [ ] セキュリティチェックが完了している
- [ ] simpler alternative の検討結果を記録した
- [ ] PASS/MINOR/MAJOR/CRITICAL 判定を明記した
- [ ] MINOR の場合、追跡テーブルが作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

- PASS/MINOR → [Phase 4: テスト作成](./phase-4-test-creation.md)
- MAJOR/CRITICAL → [Phase 2: 設計](./phase-2-design.md) へ戻る
