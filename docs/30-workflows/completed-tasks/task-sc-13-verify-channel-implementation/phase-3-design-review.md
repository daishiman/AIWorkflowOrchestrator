# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 3                                        |
| Phase名    | 設計レビューゲート                       |
| 前提Phase  | Phase 2                                  |
| 後続Phase  | Phase 4                                  |
| ステータス | 未実施                                   |
| 作成日     | 2026-04-08                               |
| 機能名     | task-sc-13-verify-channel-implementation |

---

## 目的

Phase 2 で設計した `skill-creator:verify` チャネル実装設計を多角的にレビューし、
Phase 4（TDD Red）へ進行可否を判定する。

---

## 実行タスク

### タスク1: 設計レビュー実施

**目的**: Phase 2 の設計成果物を以下の観点でレビューする

**実行手順**:

1. `outputs/phase-2/design-decisions.md` を読む
2. `outputs/phase-2/type-interface-design.md` を読む
3. `outputs/phase-2/ipc-flow-diagram.md` を読む
4. 下記レビュー観点で評価し、判定（PASS / MINOR / MAJOR / CRITICAL）を記録する

---

## レビュー観点

### 観点1: 型設計の整合性

| チェック項目                                                                   | 判定 | 備考 |
| ------------------------------------------------------------------------------ | ---- | ---- |
| `VerifyResult` 型が `SkillCreatorVerificationEngine` の出力型と整合しているか  | -    |      |
| `IpcResult<VerifyResult>` の `success/data/error` 構造が既存パターンと同一か   | -    |      |
| `@repo/shared/types/skillCreator` subpath export が root barrel と衝突しないか | -    |      |
| `error` フィールドが `string` 型であること（`{ code, message }` ではない）     | -    |      |

### 観点2: IPC パターンの一貫性

| チェック項目                                                                          | 判定 | 備考 |
| ------------------------------------------------------------------------------------- | ---- | ---- |
| `SKILL_CREATOR_VERIFY` 定数の命名が既存定数（PLAN/EXECUTE/IMPROVE）の規則と一致するか | -    |      |
| `validateSender + isBlank + sanitizeErrorMessage` パターンが適用されているか          | -    |      |
| `unregisterRuntimeSkillCreatorHandlers` への `removeHandler` が設計に含まれているか   | -    |      |
| Preload API が `safeInvoke` 経由であること（直接 `ipcRenderer.on` 禁止）              | -    |      |

### 観点3: 責務境界の明確性

| チェック項目                                                                  | 判定 | 備考 |
| ----------------------------------------------------------------------------- | ---- | ---- |
| 4層（channels/Facade/handlers/preload）の責務が明確に分離されているか         | -    |      |
| `RuntimeSkillCreatorFacade.verify()` が `VerificationEngine` を呼び出す設計か | -    |      |
| verify の実行状態所有権が `Facade` にあることが明示されているか               | -    |      |

### 観点4: テスト設計の実行可能性

| チェック項目                                                                    | 判定 | 備考 |
| ------------------------------------------------------------------------------- | ---- | ---- |
| `creatorHandlers.verify.test.ts` の作成方針が Phase 4 で実行可能な粒度か        | -    |      |
| E2E テスト追加方針が `skill-creator-integration.test.ts` の既存構造と整合するか | -    |      |
| 既存 plan/execute/improve テストへの非影響が設計上保証されているか              | -    |      |

---

## 参照資料

| 参照資料     | パス                                                                           | 内容                             |
| ------------ | ------------------------------------------------------------------------------ | -------------------------------- |
| Phase 2 設計 | `docs/30-workflows/task-sc-13-verify-channel-implementation/phase-2-design.md` | レビュー対象の設計本体           |
| 設計決定書   | `outputs/phase-2/design-decisions.md`                                          | 4層設計と IPC 命名の根拠         |
| 型設計書     | `outputs/phase-2/type-interface-design.md`                                     | VerifyResult / IpcResult の根拠  |
| IPC フロー図 | `outputs/phase-2/ipc-flow-diagram.md`                                          | channels→Facade→handlers→preload |

## レビュー結果判定

| 判定     | 条件                     | 次のアクション                    |
| -------- | ------------------------ | --------------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 4 へ進行                    |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 4 へ進行        |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて Phase 1/2 へ戻る |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認        |

### 戻り先決定基準

| 問題の種類         | 戻り先              |
| ------------------ | ------------------- |
| 要件の問題         | Phase 1（要件定義） |
| 型設計の問題       | Phase 2（設計）     |
| IPC パターン不整合 | Phase 2（設計）     |
| テスト設計の問題   | Phase 2（設計）     |

---

## MINOR 指摘の取り扱い

MINOR 判定の指摘事項は以下のルールで処理する：

1. `outputs/phase-3/minor-tracking.md` に記録する
2. Phase 4 着手前に対応を完了させる
3. 対応できない MINOR 指摘は未タスク化して Phase 12 で formalize する

---

## 参照資料

| 参照資料           | パス                                                                           | 内容                          |
| ------------------ | ------------------------------------------------------------------------------ | ----------------------------- |
| Phase 2 設計       | `docs/30-workflows/task-sc-13-verify-channel-implementation/phase-2-design.md` | レビュー対象の設計本体        |
| 設計決定書         | `outputs/phase-2/design-decisions.md`                                          | 型・IPC・4層設計の判断根拠    |
| 型インターフェース | `outputs/phase-2/type-interface-design.md`                                     | VerifyResult / IpcResult 契約 |
| IPC フロー図       | `outputs/phase-2/ipc-flow-diagram.md`                                          | レイヤー責務と接続経路        |

---

## 成果物

| 成果物           | パス                                      | 内容                       |
| ---------------- | ----------------------------------------- | -------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | PASS/MINOR/MAJOR/CRITICAL  |
| MINOR 追跡表     | `outputs/phase-3/minor-tracking.md`       | MINOR 指摘の詳細と対応方針 |

---

## 統合テスト連携

- Phase 3 レビューで統合テスト観点（IPC 接続・型契約・エラー契約）の問題がないか確認する
- MINOR 以上の問題が統合テスト設計に影響する場合、Phase 4 テスト設計前に解決する

---

## 完了条件

- [ ] 全レビュー観点（観点1〜4）の評価が完了していること
- [ ] 総合判定（PASS/MINOR/MAJOR/CRITICAL）が記録されていること
- [ ] MINOR 判定の場合、指摘事項が `outputs/phase-3/minor-tracking.md` に記録されていること
- [ ] Phase 4 へ進行する判定（PASS or MINOR 対応済み）が確認されていること
- [ ] `outputs/phase-3/` に全成果物が生成されていること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 2 が完了していること
- **後続**: Phase 4 へ進む（PASS または MINOR 対応完了時）

---

## 次Phase

**Phase 4: テスト作成** — `creatorHandlers.verify.test.ts` を TDD Red 状態で作成し、E2E テストケースを追加する。
