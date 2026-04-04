# Phase 11: 手動テスト - 仕様書ウォークスルーと手動確認

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 11                                         |
| Phase名    | 手動テスト                                 |
| 前提Phase  | Phase 10: 最終レビュー                     |
| 後続Phase  | Phase 12                                   |
| ステータス | 未実施                                     |
| 作成日     | 2026-03-29                                 |
| 機能名     | step-ut-sdk-07-shared-ipc-channel-contract |

---

## 目的

仕様書ウォークスルーにより、shared channels.ts と desktop preload channels.ts 間の IPC channel 定義同期が正しく行われていることを手動で確認する。本タスクは設計・仕様タスクのため、UI テストではなく仕様書ウォークスルーを実施する。

## 背景

TASK-SDK-07 の governance bundle 実装において、`APPROVAL_RESPOND`、`APPROVAL_REQUEST`、`EXECUTION_GET_DISCLOSURE_INFO` の3チャネルを shared package へ集約し、desktop 側が shared から import する構成に変更した。Phase 11 では、この変更が正しく反映されていることを仕様書レベル・ビルドレベルで確認する。

---

## 実行タスク

### タスク1: 仕様書ウォークスルー — shared channels.ts の export 確認

**目的**: shared 側の channels.ts に3チャネルが正しく定義・export されていることを確認する

**実行手順**:

1. `packages/shared/src/ipc/channels.ts` を開く
2. 以下の3チャネルが定義されていることを確認する：
   - `APPROVAL_RESPOND = "approval:respond"`
   - `APPROVAL_REQUEST = "approval:request"`
   - `EXECUTION_GET_DISCLOSURE_INFO = "execution:get-disclosure-info"`
3. export 形式（named export）が正しいことを確認する
4. 確認結果を記録する

**期待される成果物**:

- shared channels.ts の export 確認結果

---

### タスク2: desktop preload channels.ts の import 解決確認

**目的**: desktop 側が shared package から正しく import していることを確認する

**実行手順**:

1. `apps/desktop/src/preload/channels.ts` を開く
2. 3チャネルが `@repo/shared/src/ipc/channels` からの import に変更されていることを確認する
3. ローカルの重複定義が除去されていることを確認する
4. TypeScript の型解決が正しいことを IDE 上で確認する

**期待される成果物**:

- import パス解決の確認結果

---

### タスク3: Electron ビルド確認

**目的**: shared → desktop の import パスがビルド時に正しく解決されることを確認する

**実行手順**:

1. `pnpm --filter @repo/desktop build` を実行する
2. ビルドが成功することを確認する
3. ビルドエラーがないことをログから確認する

**期待される成果物**:

- ビルド成功ログ（要約）

---

### タスク4: governance-bundle.test.ts 観点5 のテスト確認

**目的**: 観点5（disclosure info チャネルの parity テスト）が正しく実装されていることを確認する

**実行手順**:

1. `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` を開く
2. 観点5 のテストケースが存在することを確認する
3. shared 側の定義値と desktop 側の使用値が一致する assertion があることを確認する
4. テストを実行して green であることを確認する

**期待される成果物**:

- 観点5 テスト確認結果

---

### タスク5: 発見事項の記録

**目的**: ウォークスルー中に発見した問題や改善点を記録する

**実行手順**:

1. タスク1〜4で発見した問題を一覧化する
2. 各問題の重要度（BLOCKER / MAJOR / MINOR）を判定する
3. BLOCKER がある場合は Phase 12 への移行を阻止する
4. MINOR 以下は Phase 12 タスク12-4（未タスク検出）への入力とする

**期待される成果物**:

- 発見事項一覧

---

## 参照資料

| 参照資料                 | パス                                                                         | 内容                   |
| ------------------------ | ---------------------------------------------------------------------------- | ---------------------- |
| shared channels          | `packages/shared/src/ipc/channels.ts`                                        | shared 側チャネル定義  |
| desktop preload channels | `apps/desktop/src/preload/channels.ts`                                       | desktop 側チャネル定義 |
| preload channels test    | `apps/desktop/src/preload/channels.test.ts`                                  | allowlist / contract   |
| governance bundle test   | `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | 観点5 disclosure test  |
| Phase 1 要件定義         | `phase-1-requirements.md`                                                    | 受入基準               |
| Phase 2 設計             | `phase-2-design.md`                                                          | 設計方針               |
| Phase 3 設計レビュー     | `phase-3-design-review.md`                                                   | レビュー結果           |

---

## 統合テスト連携

- 手動統合テスト確認: shared → desktop の import パスが Electron ビルドで正しく解決されることを手動で確認する
- 自動テストとの棲み分け: cross-layer parity テスト（自動）で検証済みの項目は手動確認から除外する
- データフロー: renderer → preload → main の IPC channel 名が shared 定義と一致することをビルド成功で間接確認する

---

## 成果物

| 成果物         | パス                                     | 内容               |
| -------------- | ---------------------------------------- | ------------------ |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | ウォークスルー結果 |
| 発見事項       | `outputs/phase-11/discovered-issues.md`  | 問題・改善点の一覧 |

---

## 完了条件

- [ ] shared channels.ts の3チャネル定義・export が確認されている
- [ ] desktop preload channels.ts の import パスが shared を参照していることが確認されている
- [ ] `pnpm --filter @repo/desktop build` が成功している
- [ ] governance-bundle.test.ts 観点5 が green であることが確認されている
- [ ] 発見事項が記録されている（0件でも記録）
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

Phase 12: ドキュメント更新 → `phase-12-documentation.md`
