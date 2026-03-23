# Phase 3: 設計レビュー

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | UT-RUNTIME-BUILDER-MIGRATION-001 |
| Phase    | 3（設計レビュー）                |
| 前提     | Phase 2 設計 完了                |
| 作成日   | 2026-03-23                       |

---

## 1. レビュー項目チェックリスト

### 1.1 要件との整合性

| #   | チェック項目                                                   | 結果 | 備考                                           |
| --- | -------------------------------------------------------------- | ---- | ---------------------------------------------- |
| 1   | FR-1: `buildForSurface()` メソッド設計が定義されているか       | PASS | Phase 2 Section 2 で定義済み                   |
| 2   | FR-2: surfaceType 3値が網羅されているか                        | PASS | chat-edit / runtime / skill-docs               |
| 3   | FR-3: 戻り値が HandoffGuidance 型か                            | PASS | TerminalHandoffBundle ではなく HandoffGuidance |
| 4   | FR-4: 旧メソッドの @deprecated 設計があるか                    | PASS | Phase 2 Section 3 で定義済み                   |
| 5   | FR-5: 呼び出し元移行の Before/After が記載されているか         | PASS | Phase 2 Section 4 で 4箇所全て記載             |
| 6   | FR-6: P62 対策（unknown surfaceType エラー）が設計されているか | PASS | Phase 2 Section 5 で never 型 exhaustive check |
| 7   | FR-7: chat-edit Builder の移行設計があるか                     | PASS | Phase 2 Section 4.1 で import 変更を含む設計   |

### 1.2 セキュリティ

| #   | チェック項目                                             | 結果 | 備考                                          |
| --- | -------------------------------------------------------- | ---- | --------------------------------------------- |
| 8   | NFR-1: API key 非含有が維持されるか                      | PASS | sanitizePrompt() が全 surface で適用される    |
| 9   | NFR-2: shell injection 対策が維持されるか                | PASS | 既存の sanitizePrompt() をそのまま使用        |
| 10  | NFR-3: TerminalHandoffBundle が IPC 非通過型を維持するか | PASS | buildForSurface() は HandoffGuidance のみ返却 |

### 1.3 型安全性

| #   | チェック項目                                           | 結果 | 備考                                   |
| --- | ------------------------------------------------------ | ---- | -------------------------------------- |
| 11  | discriminated union の網羅性チェックが実装されているか | PASS | never 型による exhaustive check        |
| 12  | リクエスト型に any / unknown が使われていないか        | PASS | 全フィールドが具体型                   |
| 13  | 既存テストとの互換性が考慮されているか                 | PASS | 旧メソッドは deprecated のみで削除なし |

### 1.4 アーキテクチャ

| #   | チェック項目                            | 結果  | 備考                                               |
| --- | --------------------------------------- | ----- | -------------------------------------------------- |
| 14  | 既存の ownership 境界を侵害していないか | PASS  | Main Process 内で完結                              |
| 15  | 二重 Builder クラスの扱いが適切か       | MINOR | 後述: chat-edit Builder の将来的な削除計画が未記載 |

---

## 2. 指摘事項

### 2.1 MINOR-1: chat-edit/TerminalHandoffBuilder.ts の削除計画

**指摘**: Phase 2 スコープ外に「chat-edit/TerminalHandoffBuilder.ts の完全削除」と記載されているが、移行完了後に残存するファイルの削除計画（未タスク化）が明示されていない。

**対応**: Phase 12 の未タスク検出で「UT-FIX-CHAT-EDIT-BUILDER-CLEANUP-001: chat-edit/TerminalHandoffBuilder.ts の削除」を検出対象とする。

**判定**: Phase 4 着手に支障なし。

### 2.2 MINOR-2: RuntimeSkillCreatorFacade の戻り値型変更の波及範囲

**指摘**: `RuntimeSkillCreatorPlanResponse` の `bundle` → `guidance` 変更は、以下のファイルにも波及する:

- `packages/shared/src/types/` 内の型定義
- `RuntimeSkillCreatorFacade.test.ts` のモック定義
- IPC handler のレスポンス型

**対応**: Phase 5 実装時に `grep -rn "bundle" apps/desktop/src/main/services/runtime/` で全影響箇所を特定してから変更する。

**判定**: Phase 4 着手に支障なし。

---

## 3. レビュー判定

| 判定                  | 理由                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **PASS（MINOR 2件）** | 要件との整合性・セキュリティ・型安全性いずれも問題なし。MINOR 2件は Phase 12 の未タスク検出で対応。Phase 4 へ進行可能。 |

---

## 4. Phase 3 ゲート

| 条件                                 | 結果                                  |
| ------------------------------------ | ------------------------------------- |
| Concern-A/B/C の設計が確定しているか | 対象外（本タスクは Builder 統一のみ） |
| 要件との整合性                       | PASS                                  |
| セキュリティ設計の妥当性             | PASS                                  |
| Phase 3 review で MAJOR 判定か       | No                                    |
| Phase 4 着手可能か                   | **Yes**                               |

---

---

## 統合テスト連携

本 Phase は設計レビューのため、統合テストの追加・更新は不要。Phase 2 テストマトリクス（Section 7）の網羅性を確認済み。

---

## 多角的チェック観点

| 観点           | 確認内容                                            | レビュー結果               |
| -------------- | --------------------------------------------------- | -------------------------- |
| セキュリティ   | NFR-1/NFR-2/NFR-3 が設計に反映されているか          | PASS（Section 1.2 #8-10）  |
| 型安全性       | discriminated union + exhaustive check の設計妥当性 | PASS（Section 1.3 #11-13） |
| アーキテクチャ | 既存 ownership 境界の侵害がないか                   | PASS（Section 1.4 #14）    |

---

## サブタスク管理

Phase 実行開始時に以下のサブタスクを作成すること:

- [ ] 要件との整合性チェック（FR-1〜FR-7）を実施する
- [ ] セキュリティチェック（NFR-1〜NFR-3）を実施する
- [ ] 型安全性チェックを実施する
- [ ] アーキテクチャチェックを実施する
- [ ] PASS/MINOR/MAJOR 判定を行う

## タスク100%実行確認【必須】

- [ ] 全サブタスクが完了している
- [ ] レビュー判定が記録されている

---

## 次 Phase

Phase 4（テスト作成）へ進む。
