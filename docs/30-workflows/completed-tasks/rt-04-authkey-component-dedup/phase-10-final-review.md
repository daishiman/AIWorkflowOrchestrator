# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 10                            |
| 機能名 | rt-04-authkey-component-dedup |
| 作成日 | 2026-04-06                    |

## 目的

受入条件 AC-1〜AC-6 をすべてチェックし、Phase 11（手動テスト）への進行可否を判定する。
MAJOR 指摘が残っている場合は対応 Phase に差し戻す。MINOR 指摘は Phase 12 で未タスク化する。

---

## 実行タスク

### タスク1: 受入条件 AC 判定テーブル

各 AC を PASS / MINOR / MAJOR のいずれかで判定し、根拠を記録する。

| AC   | 内容                                                                                     | 確認方法                                                                           | 判定 | 根拠・備考 |
| ---- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---- | ---------- |
| AC-1 | ApiKeySettingsPanel の IPC ロジックが AuthKeySection（または共通フック）に統合されている | `useAuthKeyManagement.ts` 内に IPC 呼び出しが集約されているか確認                  | -    |            |
| AC-2 | ApiKeyStatus 型が `packages/shared` に唯一定義され、両コンポーネントが共有している       | `grep -rn "type ApiKeyStatus" packages/ apps/` で重複がないか確認                  | -    |            |
| AC-3 | AuthKeySection が `onStatusChange` props を受け取れる                                    | `AuthKeySection` の props 型定義に `onStatusChange` が含まれるか確認               | -    |            |
| AC-4 | 既存テストが全 PASS                                                                      | Phase 9 テスト実行結果（FAIL 0 件）                                                | -    |            |
| AC-5 | pnpm lint / pnpm typecheck エラーなし                                                    | Phase 9 lint / typecheck 実行結果（エラー 0 件）                                   | -    |            |
| AC-6 | useAuthKeyManagement フックに IPC 呼び出しが統合されている                               | フック内で `window.electronAPI.authKey.{exists,set,delete}` を呼び出しているか確認 | -    |            |

**確認コマンド例:**

```bash
# AC-1, AC-6: IPC 統合確認
grep -n "electronAPI.authKey" \
  apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts

# AC-2: ApiKeyStatus 唯一定義確認
grep -rn "type ApiKeyStatus\|interface ApiKeyStatus" packages/ apps/

# AC-3: onStatusChange props 確認
grep -n "onStatusChange" \
  apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx
```

---

### タスク2: MINOR 指摘テーブル（Phase 3 からの継続）

| MINOR ID  | 指摘内容                                                           | 解決予定 Phase | 解決確認 Phase | ステータス                      |
| --------- | ------------------------------------------------------------------ | -------------- | -------------- | ------------------------------- |
| TECH-M-01 | `ApiKeySettingsPanel` 廃止は委譲実装後の未タスクとして保留         | Phase 12       | Phase 12       | 未解決（Phase 12 で未タスク化） |
| TECH-M-02 | `useAuthModeStatus` store 依存を `useAuthKeyManagement` に含めるか | Phase 5        | Phase 9        | Phase 5 で解決済み想定          |

> **MINOR 指摘の処理方針**: MINOR 判定の指摘は Phase 12 にて `unassigned-task-detection.md` へ記録する。
> 参照: `docs/30-workflows/unassigned-task/unassigned-task-guidelines.md`

---

### タスク3: 新規 MINOR 指摘の記録

Phase 10 レビュー中に新たに発見された MINOR 指摘があれば以下に記録する（0 件でも記録欄を残すこと）。

| MINOR ID | 指摘内容 | 解決予定 Phase | 備考 |
| -------- | -------- | -------------- | ---- |
| （なし） | -        | -              | -    |

---

### タスク4: 戻り先判定テーブル

MAJOR 判定が存在する場合、以下の基準で対応 Phase に差し戻す。

| 判定種別        | 対応 Phase            | 条件                                         |
| --------------- | --------------------- | -------------------------------------------- |
| CRITICAL        | Phase 1 へ            | 要件レベルの根本的な問題が発見された場合     |
| MAJOR（設計）   | Phase 2 へ            | アーキテクチャ・フック設計に問題がある場合   |
| MAJOR（実装）   | Phase 5 へ            | 実装コードに MAJOR バグ・型不整合がある場合  |
| MAJOR（テスト） | Phase 4 へ            | テスト設計に根本的な問題がある場合           |
| MINOR           | Phase 12 で未タスク化 | 現タスクスコープ外・後続タスク候補として記録 |
| なし（PASS）    | Phase 11 へ進む       | AC-1〜AC-6 すべて PASS かつ MAJOR 指摘なし   |

**最終判定: （PASS / 差し戻し先 Phase を記入）**

---

### タスク5: Phase 11 開始条件の確認

- [ ] Phase 9（品質保証）完了・品質ゲート PASS
- [ ] AC-1: IPC ロジック統合 PASS
- [ ] AC-2: ApiKeyStatus 唯一定義 PASS
- [ ] AC-3: onStatusChange props PASS
- [ ] AC-4: テスト全 PASS
- [ ] AC-5: lint/typecheck エラーなし
- [ ] AC-6: フック IPC 統合 PASS
- [ ] MAJOR 指摘なし

---

## 参照資料

| 参照資料             | パス                                                              | 内容                            |
| -------------------- | ----------------------------------------------------------------- | ------------------------------- |
| システム仕様         | `.claude/skills/aiworkflow-requirements/references/`              | AIWorkflowOrchestrator 正本仕様 |
| 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)                | AC-1〜AC-6 定義                 |
| 設計書               | [phase-2-design.md](phase-2-design.md)                            | フック設計・型統一方針          |
| 設計レビュー         | [phase-3-design-review.md](phase-3-design-review.md)              | MINOR 指摘一覧（TECH-M-01/02）  |
| 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md)      | lint/typecheck/test 結果        |
| 未タスクガイドライン | `docs/30-workflows/unassigned-task/unassigned-task-guidelines.md` | MINOR の未タスク化手順          |

---

## 統合テスト連携【必須】

| 判定項目           | 基準                                    | 確認方法               |
| ------------------ | --------------------------------------- | ---------------------- |
| AC-1〜AC-6 全 PASS | MAJOR / CRITICAL 指摘なし               | タスク1 判定テーブル   |
| MINOR 指摘の記録   | Phase 12 未タスク化対象として記録済み   | タスク2・3 テーブル    |
| 戻り先判定         | MAJOR がある場合は対応 Phase に差し戻し | タスク4 テーブル       |
| Phase 11 開始条件  | 全項目チェック済み                      | タスク5 チェックリスト |

---

## 成果物

| 成果物           | パス                                        | 説明                            |
| ---------------- | ------------------------------------------- | ------------------------------- |
| 最終レビュー記録 | `outputs/phase-10/final-review-decision.md` | AC 判定テーブル・ゲート判定結果 |

---

## 完了条件

- [ ] AC-1〜AC-6 全項目の判定完了（PASS / MINOR / MAJOR を記録）
- [ ] MINOR 指摘テーブル更新済み（Phase 3 からの継続 + 新規分）
- [ ] 戻り先判定テーブル確認済み
- [ ] MAJOR 指摘がないことを確認（または差し戻し先 Phase を明記）
- [ ] Phase 11 開始条件チェック完了
- [ ] 成果物 `outputs/phase-10/final-review-decision.md` 作成済み
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク100%実行確認【必須】

| タスク                          | 完了 |
| ------------------------------- | ---- |
| タスク1: AC 判定テーブル記入    | [ ]  |
| タスク2: MINOR 指摘テーブル更新 | [ ]  |
| タスク3: 新規 MINOR 指摘の記録  | [ ]  |
| タスク4: 戻り先判定テーブル確認 | [ ]  |
| タスク5: Phase 11 開始条件確認  | [ ]  |

---

## 次のPhase

Phase 11: 手動テスト（[phase-11-manual-test.md](phase-11-manual-test.md)）

**AC-1〜AC-6 全 PASS かつ MAJOR 指摘なしの場合のみ Phase 11 へ進むこと。**
