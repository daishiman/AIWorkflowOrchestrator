# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 6                             |
| タスクID | UT-SC-05-APPLY-IMPROVEMENT-UI |
| 作成日   | 2026-03-23                    |
| 前提     | Phase 5 完了（テスト全 PASS） |

## 目的

Phase 4-5 で作成した基本テストに加え、境界値・異常系・組合せテストを追加してカバレッジを引き上げる。

## 実行タスク

### Task 1: IPC ハンドラ境界値テスト追加

**ファイル**: `apps/desktop/src/main/ipc/__tests__/creatorHandlers.applyImprovement.test.ts` に追加

| ID   | テスト名                     | 内容                                                                                  |
| ---- | ---------------------------- | ------------------------------------------------------------------------------------- |
| H-12 | suggestions 配列に1件のみ    | 1件の suggestion で正常動作する                                                       |
| H-13 | suggestions 配列に20件       | 大量の suggestion で正常動作する                                                      |
| H-14 | suggestion.before が空文字列 | 空文字列の before でもハンドラが受け付ける（バリデーション通過、Facade 側でスキップ） |
| H-15 | suggestion.reason が空文字列 | 空文字列の reason でもバリデーション通過する                                          |
| H-16 | skillName に特殊文字         | `"my-skill_v2.0"` のようなスキル名で正常動作する                                      |
| H-17 | applyImprovement 部分成功    | applied=1, skipped=1 の混合結果が正しく返る                                           |
| H-18 | applyImprovement errors あり | errors 配列にエラーがある場合も success=true で data が返る                           |

### Task 2: Renderer コンポーネント追加テスト

#### 2-1. ImprovementProposalItem 追加テスト

| ID   | テスト名                | 内容                                                 |
| ---- | ----------------------- | ---------------------------------------------------- |
| C-8  | before/after に改行含む | 複数行テキストが pre/code ブロックで正しく表示される |
| C-9  | section が長文          | 長いセクション名でもレイアウトが崩れない             |
| C-10 | reason が空文字列       | reason が空の場合、理由セクションが非表示になる      |

#### 2-2. ImprovementProposalList 追加テスト

| ID   | テスト名             | 内容                                                        |
| ---- | -------------------- | ----------------------------------------------------------- |
| L-9  | 20件以上の大量提案   | スクロール可能なリストとして表示される                      |
| L-10 | 全選択後に1件解除    | 全選択→個別解除で selectedCount が正しく減る                |
| L-11 | 適用中に他の操作無効 | isApplying=true で全選択/全解除/チェックボックスが disabled |

#### 2-3. ImprovementApplyResult 追加テスト

| ID  | テスト名          | 内容                                              |
| --- | ----------------- | ------------------------------------------------- |
| R-6 | 全件スキップ      | applied=0, skipped=3 で警告メッセージが表示される |
| R-7 | 複数エラー        | errors に3件のエラーが全てリスト表示される        |
| R-8 | skippedDetails 空 | skipped=0 でスキップ詳細セクションが非表示        |

### Task 3: 統合テスト

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/ImprovementProposal.integration.test.tsx`

| ID  | テスト名                    | 内容                                                             |
| --- | --------------------------- | ---------------------------------------------------------------- |
| I-1 | 提案選択→適用フロー         | ImprovementProposalList から ImprovementApplyResult への画面遷移 |
| I-2 | 全選択→適用→結果表示        | 全提案を選択して適用し、結果が表示される                         |
| I-3 | エラー時のフォールバック    | IPC 通信失敗時にエラーメッセージが表示される                     |
| I-4 | エラー後の再選択→再試行     | IPC 通信失敗後にエラーを閉じ、再選択して適用が成功する           |
| I-5 | 部分選択→全解除→再選択→適用 | 全解除→再選択の複合操作後に適用が正しく動作する                  |

## 参照資料

- `docs/30-workflows/w4b-1-sc-apply-improvement-ui/phase-04-test-creation.md`（基本テスト）
- `.claude/rules/02-code-quality.md`（テスト設計の注意: P9 テスト間リーク防止）
- `.claude/rules/06-known-pitfalls.md` P39（happy-dom: fireEvent 使用）

## 成果物

- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.applyImprovement.test.ts`（追加テスト）
- `apps/desktop/src/renderer/components/skill/__tests__/ImprovementProposalItem.test.tsx`（追加テスト）
- `apps/desktop/src/renderer/components/skill/__tests__/ImprovementProposalList.test.tsx`（追加テスト）
- `apps/desktop/src/renderer/components/skill/__tests__/ImprovementApplyResult.test.tsx`（追加テスト）
- `apps/desktop/src/renderer/components/skill/__tests__/ImprovementProposal.integration.test.tsx`（新規）

## 統合テスト連携

本 Phase（テスト拡充）で統合テスト（I-1 ~ I-5）を作成:

- I-1 ~ I-3: 基本 E2E フロー（Phase 4 設計に基づく）
- I-4: エラー後リカバリーフロー
- I-5: 複合操作フロー

## 多角的チェック観点

| 観点         | 適用判断             | 仕様参照先                                          |
| ------------ | -------------------- | --------------------------------------------------- |
| セキュリティ | 境界値バリデーション | `aiworkflow-requirements: security-electron-ipc.md` |
| UI/UX        | 大量提案のスクロール | `aiworkflow-requirements: ui-ux-*.md`               |

## サブタスク管理

Phase 実行開始時に以下のサブタスクを作成:

1. IPC ハンドラ境界値テスト追加（Task 1: H-12 ~ H-18）
2. Renderer コンポーネント追加テスト（Task 2: C-8 ~ C-10, L-9 ~ L-11, R-6 ~ R-8）
3. 統合テスト作成（Task 3: I-1 ~ I-5）

## タスク100%実行確認

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 完了条件

- [ ] 境界値テスト（H-12 ~ H-18）が追加されている
- [ ] コンポーネント追加テスト（C-8 ~ C-10, L-9 ~ L-11, R-6 ~ R-8）が追加されている
- [ ] 統合テスト（I-1 ~ I-5）が作成されている（I-4, I-5 追加）
- [ ] 全テストが PASS する
- [ ] テスト間で状態共有がない（`beforeEach` でリセット）

## 次の Phase

Phase 7: カバレッジ確認
