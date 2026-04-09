# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 11                                       |
| Phase名    | 手動テスト                               |
| 前提Phase  | Phase 10                                 |
| 後続Phase  | Phase 12                                 |
| ステータス | 未実施                                   |
| 作成日     | 2026-04-08                               |
| 機能名     | task-sc-13-verify-channel-implementation |

---

## 目的

NON_VISUAL タスク（IPC / Main プロセス実装・Renderer UI 変更なし）として、
自動テスト結果を主証跡として手動テスト記録を作成する。

---

## Phase 11 手動テスト方針

**タスク分類**: **NON_VISUAL task**（Phase 1 で記録済み）

- `manual-test-checklist.md` を必ず作成する
- `discovered-issues.md` を必ず作成する
- `screenshot-plan.json` は生成しない（NON_VISUAL のため）
- primary evidence は `vitest` / `typecheck` / `lint` / IPC 動作確認（自動テスト代替）
- `manual-test-result.md` には `TC-ID ↔ evidence`・NON_VISUAL である理由・代替 evidence を明記する
- placeholder-only の証跡は PASS 扱いにしない（Feedback 4 対応）

**`manual-test-result.md` 必須メタ情報**:

- 証跡の主ソース: 自動テスト名 / テスト件数
- スクリーンショットを作らない理由: IPC / Main プロセス実装であり Renderer UI 変更がないため

---

## 実行タスク

### タスク1: 手動テストチェックリスト作成

**目的**: 自動テストで代替する項目を含む手動テストチェックリストを作成する

**チェックリスト項目**:

| TC-ID   | テスト項目                                     | テスト方法     | 代替証跡                                    |
| ------- | ---------------------------------------------- | -------------- | ------------------------------------------- |
| MT-V-01 | verify チャネルが IPC で正常応答すること       | 自動テスト代替 | creatorHandlers.verify.test.ts TC-V-01 PASS |
| MT-V-02 | 不正入力でエラー応答が返ること                 | 自動テスト代替 | TC-V-02 / TC-V-03 PASS                      |
| MT-V-03 | エラーメッセージが sanitize されていること     | 自動テスト代替 | TC-V-04 / TC-V-06 PASS                      |
| MT-V-04 | validateSender が動作していること              | 自動テスト代替 | TC-V-05 PASS                                |
| MT-V-05 | unregister が正常動作すること                  | 自動テスト代替 | TC-V-07 PASS                                |
| MT-V-06 | 既存 plan/execute/improve が影響を受けないこと | 自動テスト代替 | 既存テスト全件 PASS（Phase 9 品質チェック） |
| MT-V-07 | TypeScript 型が正しく解決されること            | 自動テスト代替 | typecheck PASS（Phase 9 品質チェック）      |

**実行手順**:

1. 上記チェックリストを `outputs/phase-11/manual-test-checklist.md` に作成する
2. 各テスト項目の代替証跡（Phase 9 テスト結果）へのリンクを記録する

---

### タスク2: 実地操作確認（自動テスト代替）

**目的**: IPC チャネルが実際に動作するか確認する（Feedback BEFORE-QUIT-001 対応）

**注意**: Phase 11 は「実地操作不可」（Electron アプリの起動は本フェーズのスコープ外）。
自動テスト結果 + 既知制限リストを代替記録として残す。

**代替記録内容**:

1. Phase 9 の自動テスト結果（vitest PASS件数・カバレッジ）を証跡として引用する
2. 実地操作を行わない理由を `manual-test-result.md` に明記する

```bash
# 証跡取得用コマンド（Phase 11 実行時に再実行）
pnpm --filter @repo/desktop test \
  apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts \
  apps/desktop/src/test/skill-creator-integration.test.ts \
  --reporter verbose 2>&1 | tee outputs/phase-11/test-evidence.txt
```

---

### タスク3: 発見事項の記録

**目的**: テスト中に発見した問題・改善提案を記録する

**実行手順**:

1. テスト実行中に発見した問題を `outputs/phase-11/discovered-issues.md` に記録する
2. 問題が MINOR 以上の場合、未タスク化の候補として記録する
3. 問題がない場合も「問題なし」として記録する（空ファイルは禁止）

---

## 参照資料

| 参照資料     | パス                                                                                      | 内容                     |
| ------------ | ----------------------------------------------------------------------------------------- | ------------------------ |
| 依存Phase    | Phase 1 / Phase 2 / Phase 5 / Phase 6 / Phase 7 / Phase 8 / Phase 9 / Phase 10            | 本Phase の前提           |
| 品質保証     | `docs/30-workflows/task-sc-13-verify-channel-implementation/phase-9-quality-assurance.md` | 自動テスト結果の主証跡   |
| 最終レビュー | `docs/30-workflows/task-sc-13-verify-channel-implementation/phase-10-final-review.md`     | AC 全件確認の前提        |
| UT           | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts`                      | 手動テスト代替の単体証跡 |
| E2E          | `apps/desktop/src/test/skill-creator-integration.test.ts`                                 | 手動テスト代替の統合証跡 |

## 統合テスト連携

- Phase 9 の自動テスト結果を主証跡として、手動の画面操作は行わない
- `creatorHandlers.verify.test.ts` と `skill-creator-integration.test.ts` の PASS を統合テスト連携の証跡とする
- NON_VISUAL 判定は Phase 1 のタスク分類に従い、スクリーンショットは不要とする

## 成果物

| 成果物                   | パス                                        | 内容                              |
| ------------------------ | ------------------------------------------- | --------------------------------- |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | TC-ID ↔ evidence・NON_VISUAL 理由 |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | MT-V-01〜MT-V-07                  |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`     | 問題一覧（問題なしの場合も記録）  |

---

## 完了条件

- [ ] `manual-test-checklist.md` が作成されていること（MT-V-01〜MT-V-07）
- [ ] `manual-test-result.md` に TC-ID ↔ evidence 対応が記録されていること
- [ ] `manual-test-result.md` に NON_VISUAL 理由と代替 evidence が明記されていること
- [ ] `discovered-issues.md` が作成されていること（問題なしの場合も「問題なし」と記録）
- [ ] placeholder-only の証跡で PASS としていないこと

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10（最終レビューゲート PASS）が完了していること
- **後続**: Phase 12 へ進む

---

## 次Phase

**Phase 12: ドキュメント更新** — implementation-guide・system-spec-update-summary 等 5成果物を作成する。
