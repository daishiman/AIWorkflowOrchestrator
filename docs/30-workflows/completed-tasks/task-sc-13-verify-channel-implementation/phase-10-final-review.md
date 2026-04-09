# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 10                                       |
| Phase名    | 最終レビューゲート                       |
| 前提Phase  | Phase 9                                  |
| 後続Phase  | Phase 11                                 |
| ステータス | 未実施                                   |
| 作成日     | 2026-04-08                               |
| 機能名     | task-sc-13-verify-channel-implementation |

---

## 目的

Phase 1 で定義した受入基準（AC-1〜AC-10）を全件検証し、Phase 13（PR作成）へ進める
品質水準を達成しているかを最終判定する。MINOR 判定の指摘事項は未タスク化する。

---

## 実行タスク

1. AC-1〜AC-10 の個別検証を実施する
2. コードレビュー観点を確認する

### タスク1: 受入基準 AC 全件検証

**目的**: AC-1〜AC-10 を個別に検証する

**検証方法**:

| AC番号 | 基準                                                                                         | 検証コマンド / 方法                                                                     | 結果 |
| ------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---- |
| AC-1   | `channels.ts` に `SKILL_CREATOR_VERIFY = "skill-creator:verify"` 定数が追加されている        | `grep -n "SKILL_CREATOR_VERIFY" packages/shared/src/ipc/channels.ts`                    | -    |
| AC-2   | `RuntimeSkillCreatorFacade` に `verify()` メソッドが実装されている                           | `grep -n "verify(" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | -    |
| AC-3   | verify ハンドラが `validateSender + isBlank + sanitizeErrorMessage` パターンで登録されている | コードレビュー（creatorHandlers.ts）                                                    | -    |
| AC-4   | `skill-creator-api.ts` に `verifySkill` メソッドが公開されている                             | `grep -n "verifySkill" apps/desktop/src/preload/skill-creator-api.ts`                   | -    |
| AC-5   | verify レスポンスが `IpcResult<VerifyResult>` 形式である                                     | テスト TC-V-01 PASS 確認                                                                | -    |
| AC-6   | エラー時にサニタイズされた `string` 型エラーメッセージが返る                                 | テスト TC-V-04/TC-V-06 PASS 確認                                                        | -    |
| AC-7   | `unregisterRuntimeSkillCreatorHandlers` に `removeHandler(SKILL_CREATOR_VERIFY)` が追加      | `grep -n "SKILL_CREATOR_VERIFY" apps/desktop/src/main/ipc/creatorHandlers.ts`           | -    |
| AC-8   | 既存 plan/execute/improve テスト全件 PASS                                                    | `pnpm --filter @repo/desktop test apps/desktop/src/main/ipc/__tests__/`                 | -    |
| AC-9   | `pnpm --filter @repo/desktop typecheck` が通る                                               | `pnpm --filter @repo/desktop typecheck`                                                 | -    |
| AC-10  | verify UT と E2E テスト全件 PASS                                                             | Phase 9 品質チェック結果確認                                                            | -    |

---

### タスク2: コードレビュー観点チェック

**確認観点**:

| 観点                | チェック内容                                                           | 結果 |
| ------------------- | ---------------------------------------------------------------------- | ---- |
| パターン一貫性      | verify ハンドラが plan/execute/improve と同じパターンか                | -    |
| error フィールド型  | `error: string` であること（`{ code, message }` ではない）             | -    |
| Preload API 経由    | `safeInvoke` 経由で実装されていること                                  | -    |
| unregister の完全性 | `removeHandler(SKILL_CREATOR_VERIFY)` が unregister に含まれていること | -    |
| 型定義の独立性      | `VerifyResult` が root barrel と衝突していないこと                     | -    |

---

## 参照資料

| 参照資料             | パス                                           | 内容                        |
| -------------------- | ---------------------------------------------- | --------------------------- |
| 依存Phase            | Phase 1 / Phase 2 / Phase 5                    | 本Phase の前提              |
| 品質チェック結果     | `outputs/phase-9/quality-check-result.md`      | Phase 9 の全件 PASS 証跡    |
| リファクタリング結果 | `outputs/phase-8/refactoring-result.md`        | before/after と理由         |
| 既存実装             | `apps/desktop/src/main/ipc/creatorHandlers.ts` | verify ハンドラの実装根拠   |
| 共有型定義           | `packages/shared/src/types/skillCreator.ts`    | VerifyResult / IpcResult 型 |

## レビュー結果判定

| 判定     | 条件                                   | 次のアクション                      |
| -------- | -------------------------------------- | ----------------------------------- |
| PASS     | AC 全件 + コードレビュー観点で問題なし | Phase 11 へ進行                     |
| MINOR    | 軽微な指摘あり                         | 指摘を未タスク化後、Phase 11 へ進行 |
| MAJOR    | 重大な問題あり                         | 影響範囲に応じて Phase 5/8 へ戻る   |
| CRITICAL | 致命的な問題あり                       | Phase 1 へ戻りユーザー確認          |

### 戻り先決定基準

| 問題の種類   | 戻り先                |
| ------------ | --------------------- |
| 要件の問題   | Phase 1（要件定義）   |
| 実装の問題   | Phase 5（実装）       |
| テストの問題 | Phase 4（テスト）     |
| 品質の問題   | Phase 8（リファクタ） |

---

## 成果物

| 成果物           | パス                                      | 内容                           |
| ---------------- | ----------------------------------------- | ------------------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | PASS/MINOR/MAJOR/CRITICAL 判定 |
| AC 検証結果      | `outputs/phase-10/ac-verification.md`     | AC-1〜AC-10 個別検証結果       |

---

## 統合テスト連携

- 最終レビューで統合テスト結果（Plan/Execute/Verify の相互動作）を確認
- AC-8（既存テスト非影響）が最終確認されること

---

## 完了条件

- [ ] AC-1〜AC-10 の全件検証が完了していること
- [ ] コードレビュー観点チェックが完了していること
- [ ] 総合判定（PASS or MINOR 以下）が `outputs/phase-10/final-review-result.md` に記録されていること
- [ ] `outputs/phase-10/ac-verification.md` に AC 個別検証結果が記録されていること
- [ ] MINOR 指摘事項がある場合、未タスク化の計画が記録されていること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11 へ進む（PASS または MINOR 以下時）

---

## 次Phase

**Phase 11: 手動テスト** — NON_VISUAL タスクとして IPC 動作確認・証跡記録を行う。
