# Phase 3: 設計レビューゲート - UT-W3-ANALYTICS-STORE-INTEGRATION-001

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 3                                     |
| 機能名     | UT-W3-ANALYTICS-STORE-INTEGRATION-001 |
| 作成日     | 2026-04-13                            |
| ステータス | not-started                           |
| 前提Phase  | Phase 2（設計）完了                   |

---

## 目的

Phase 2 の設計成果物（`design-decisions.md` / `store-interface.md` / `dependency-graph.md`）を多角的にレビューし、Phase 4（テスト作成）へ進めるか判定する。

- **PASS**: Phase 4 へ進む
- **MINOR指摘**: `minor-tracking.md` に記録し、Phase 4 を継続しながら後続Phaseで対処する
- **MAJOR指摘**: Phase 2 に差し戻し、設計を修正してから再レビューする

---

## レビュー観点

### MAJOR 判定基準（Phase 2 差し戻し）

以下のいずれかに該当する場合は MAJOR と判定し、Phase 2 に差し戻す：

| 判定基準                                                                           | 確認方法                                    |
| ---------------------------------------------------------------------------------- | ------------------------------------------- |
| 循環依存が存在する（例: `analyticsSlice` → `analyticsAdapter` → `analyticsSlice`） | `dependency-graph.md` の依存方向を確認      |
| `analyticsSlice` と `analyticsAdapter` の責務境界が不明確                          | `design-decisions.md` の責務テーブルを確認  |
| 既存の `trackEvent` 公開 API シグネチャの変更が含まれている                        | `trackEvent.ts` の差分有無を確認            |
| `SkillAnalyticsEvent` 型定義が不完全（必須フィールド欠落）                         | `store-interface.md` の型定義を確認         |
| 3アクション（trackSkillStart / trackSkillComplete / trackSkillError）の設計が欠落  | `store-interface.md` のアクション一覧を確認 |

### MINOR 判定基準（継続・後続Phaseで対処）

以下のような指摘は MINOR と判定し、`minor-tracking.md` に記録して継続する：

| 判定基準                                                     | 対処タイミング             |
| ------------------------------------------------------------ | -------------------------- |
| 命名規則の微修正（例: `trackSkillStart` → `emitSkillStart`） | Phase 5 実装時             |
| JSDoc / コメントの不足                                       | Phase 8 リファクタリング時 |
| `analyticsAdapter` の送信 payload 正規化が不明確             | Phase 4 テスト作成時       |
| state/history を後追いで足す必要性が残る                     | Phase 8 リファクタリング時 |

### PASS 判定基準

以下の全てを満たす場合は PASS と判定する：

| 確認項目                                                              | 確認方法                                      |
| --------------------------------------------------------------------- | --------------------------------------------- |
| AC-1〜AC-4 が全て設計に反映されている                                 | `design-decisions.md` の AC対応表を確認       |
| `analyticsSlice` → `analyticsAdapter` の依存が一方向に固定されている  | `dependency-graph.md` の依存方向を確認        |
| `SkillAnalyticsEvent` 型定義が完備されている                          | `store-interface.md` の型定義セクションを確認 |
| 3アクションの引数型・戻り値型が定義されている                         | `store-interface.md` のアクション仕様を確認   |
| テスタビリティ（`analyticsAdapter` のモック可否）が設計に含まれている | `design-decisions.md` のテスト戦略欄を確認    |

---

## 実行タスク

| タスクID | タスク名              | 説明                                                                                       |
| -------- | --------------------- | ------------------------------------------------------------------------------------------ |
| T-03-1   | レビュー実施          | Phase 2 の全成果物を上記レビュー観点でチェックし、各項目に PASS / MINOR / MAJOR を記録する |
| T-03-2   | 判定記録              | 総合判定（PASS / MAJOR差し戻し）を `outputs/phase-3/design-review-result.md` に記録する    |
| T-03-3   | MINOR指摘の未タスク化 | MINOR指摘がある場合は対処タイミングと担当を `outputs/phase-3/minor-tracking.md` に記録する |

---

## レビューチェックリスト

Phase 2 成果物を参照しながら、以下の項目を順番に確認する：

### 依存方向チェック（`dependency-graph.md` 参照）

- [ ] `analyticsSlice` が `analyticsAdapter` に直接依存している
- [ ] `analyticsSlice` → `analyticsAdapter` の依存が一方向である
- [ ] `trackEvent` → `analyticsAdapter` の既存依存は変更されていない
- [ ] `analyticsSlice` が `trackEvent` を新たに import していない
- [ ] 循環依存の可能性がある箇所がない

### インターフェース完備チェック（`store-interface.md` 参照）

- [ ] `SkillAnalyticsEvent` 型に `type` / `skillId` / `timestamp` が含まれている
- [ ] `SkillAnalyticsEvent` 型に `duration?` / `error?` のオプショナルフィールドがある
- [ ] `trackSkillStart(skillId: string): void` が定義されている
- [ ] `trackSkillComplete(skillId: string, duration: number): void` が定義されている
- [ ] `trackSkillError(skillId: string, error: string \| Error): void` が定義されている
- [ ] State 型が action-only として最小構成になっている

### AC対応チェック（`design-decisions.md` 参照）

- [ ] AC-1（自動記録）への対応が設計に含まれている
- [ ] AC-2（Zustand slice）の実装方針が明確である
- [ ] AC-3（既存 API シグネチャ不変）の制約が設計に反映されている
- [ ] AC-4（pnpm typecheck / lint / test PASS）のためのテスト戦略が記載されている

### 責務境界チェック（`design-decisions.md` 参照）

- [ ] `analyticsSlice` が担う責務と担わない責務が明文化されている
- [ ] `analyticsAdapter` の責務は変更しないことが明記されている
- [ ] `trackEvent` は今回のタスクで変更しないことが明記されている

---

## 総合判定フロー

```
MAJOR指摘 あり？
    ↓ Yes
    → Phase 2 差し戻し（design-decisions / store-interface / dependency-graph を修正）
    ↓ No
MINOR指摘 あり？
    ↓ Yes
    → minor-tracking.md に記録 → PASS として Phase 4 へ継続
    ↓ No
→ PASS → Phase 4 へ進む
```

---

## 成果物

| 成果物ファイル                            | 内容                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| `outputs/phase-3/design-review-result.md` | レビュー全項目の PASS / MINOR / MAJOR 判定結果・総合判定・次アクション     |
| `outputs/phase-3/minor-tracking.md`       | MINOR指摘の一覧・対処タイミング・担当（MINOR指摘がない場合は空リストで可） |

---

## 完了条件

- [ ] Phase 2 の全成果物（design-decisions.md / store-interface.md / dependency-graph.md）が存在していること
- [ ] 全レビューチェックリスト項目を確認し、判定を記録したこと（T-03-1）
- [ ] 総合判定（PASS または MAJOR差し戻し）を `outputs/phase-3/design-review-result.md` に記録したこと（T-03-2）
- [ ] MINOR指摘がある場合は `outputs/phase-3/minor-tracking.md` に記録したこと（T-03-3）
- [ ] **PASS 判定が `design-review-result.md` に記録されていること**（Phase 4 進行の必須条件）

---

## 次Phase説明

**Phase 4: テスト作成**

Phase 3 で PASS が確定したら、Phase 2 の設計に基づいてユニットテストを先行作成する（TDD）。`analyticsSlice.test.ts` を作成し、`analyticsAdapter` のモックと `trackEvent` の非変更を確認してから Phase 5 へ進む。
