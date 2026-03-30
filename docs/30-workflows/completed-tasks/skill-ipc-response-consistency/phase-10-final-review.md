# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 10                                        |
| Phase名    | 最終レビューゲート                        |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 |
| 前提Phase  | Phase 9（品質保証）                       |
| 後続Phase  | Phase 11（手動テスト検証）                |
| ステータス | 未着手                                    |
| 作成日     | 2026-02-27                                |
| 機能名     | skill-ipc-response-consistency            |

---

## 目的

契約・依存・仕様差分の再監査を行い、PASS/MINOR/MAJOR/CRITICAL を判定する。Phase 9 までの実装品質が確認された上で、契約統一の完全性と仕様整合性を最終確認する。

## 背景

`skill:` チャネルの IPC レスポンス形式統一は、Main/Preload/Renderer の3層にわたる変更である。最終レビューでは、全14チャネルが契約プロファイルに分類され差分がないこと、仕様書（AR-1〜AR-7）との整合性が保たれていること、および関連未完了タスク（GETDETAIL-NAMING-DRIFT-001, ARG-FORM-UNIFICATION-001）との変更境界が明確であることを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 契約完全性レビュー

**目的**: 全14チャネルが契約プロファイルに分類され、差分がないことを確認する

**実行手順**:

1. Phase 2 の契約プロファイル表（`outputs/phase-2/` 内）を読み込む
2. `apps/desktop/src/main/ipc/skillHandlers.ts` の全14 `skill:` ハンドラーの return/throw パターンを確認する
3. 契約プロファイル表と実装を突合する
4. 未分類チャネルがないことを確認する

**契約プロファイル突合マトリクス**:

| チャネル                  | プロファイル分類 | 実装の return パターン | Preload の呼び出し方式 | 突合結果 |
| ------------------------- | ---------------- | ---------------------- | ---------------------- | -------- |
| `skill:list`              | -                | -                      | -                      | -        |
| `skill:getImported`       | -                | -                      | -                      | -        |
| `skill:import`            | -                | -                      | -                      | -        |
| `skill:remove`            | -                | -                      | -                      | -        |
| `skill:get-detail`        | -                | -                      | -                      | -        |
| `skill:execute`           | -                | -                      | -                      | -        |
| `skill:abort`             | -                | -                      | -                      | -        |
| `skill:get-status`        | -                | -                      | -                      | -        |
| `skill:analyze`           | -                | -                      | -                      | -        |
| `skill:improve`           | -                | -                      | -                      | -        |
| `skill:optimize`          | -                | -                      | -                      | -        |
| `skill:optimize:variants` | -                | -                      | -                      | -        |
| `skill:optimize:evaluate` | -                | -                      | -                      | -        |
| `skill:scan`              | -                | -                      | -                      | -        |

> チャネル名の正本は `index.md` の「IPCチャネル正本（Single Source of Truth）」に従う。

**契約監査コマンド**:

```bash
# Main側の return パターンを一覧化
rg -n "ipcMain\.handle\(|return \{ success|safeInvokeUnwrap|safeInvoke\(" apps/desktop/src/main/ipc/skillHandlers.ts apps/desktop/src/preload/skill-api.ts
```

**期待される成果物**:

- `outputs/phase-10/contract-completeness.md`

---

### タスク2: 仕様整合性レビュー

**目的**: コード実装と仕様書（AR-1〜AR-7）の整合性を確認する

**実行手順**:

1. タスク指示書の AR-1〜AR-7 制約を読み込む
2. 各 AR 制約と実装の対応を確認する
3. 仕様と実装の乖離がないことを確認する

**AR制約 整合性マトリクス**:

| AR-ID | 制約内容                                                                      | 実装箇所                    | 整合 |
| ----- | ----------------------------------------------------------------------------- | --------------------------- | ---- |
| AR-1  | `skill:import` は `skillName: string` 受け取り、`ImportedSkill` を返す        | skillHandlers.ts / types.ts | -    |
| AR-2  | `return { success, data }` 系は `safeInvokeUnwrap`、直接返却系は `safeInvoke` | skill-api.ts                | -    |
| AR-3  | `validateIpcSender` + `.trim()` 非空検証を全ハンドラで実施                    | skillHandlers.ts            | -    |
| AR-4  | IPC入力検証を Main 側で行い、不正入力を早期拒否                               | skillHandlers.ts            | -    |
| AR-5  | 型同期（shared/preload）・仕様同期・テスト検証を必須実施                      | channels.ts / types.ts      | -    |
| AR-6  | 本タスクIDと指示書パスの参照整合を維持                                        | task-workflow.md            | -    |
| AR-7  | `skill:remove` の戻り値契約は `RemoveResult`                                  | skillHandlers.ts / types.ts | -    |

**期待される成果物**:

- `outputs/phase-10/spec-consistency.md`

---

### タスク3: 依存関係レビュー

**目的**: 関連タスク（GETDETAIL-NAMING-DRIFT-001, ARG-FORM-UNIFICATION-001）との境界確認

**実行手順**:

1. 本タスクの変更ファイル一覧を確認する
2. 関連未完了タスクの変更予定範囲を確認する
3. 変更境界が明確であること（重複変更がないこと）を確認する
4. 本タスクの変更が関連タスクの実施を阻害しないことを確認する

**依存関係マトリクス**:

| 関連タスクID                              | 状態   | 変更予定範囲                      | 本タスクとの境界 | 影響評価 |
| ----------------------------------------- | ------ | --------------------------------- | ---------------- | -------- |
| UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001   | 未完了 | `skill:get-detail` の引数命名是正 | -                | -        |
| UT-FIX-SKILL-IPC-ARG-FORM-UNIFICATION-001 | 未完了 | 引数形式の統一                    | -                | -        |

**期待される成果物**:

- （`outputs/phase-10/spec-consistency.md` の依存関係セクションに記載）

---

### タスク4: 回帰リスクレビュー

**目的**: 変更による回帰リスクを評価する

**実行手順**:

1. 変更ファイル一覧と影響範囲を確認する
2. 回帰テストカバレッジが十分であることを確認する
3. Renderer 利用側の契約統一が正しく機能していることを確認する

**変更影響範囲**:

| 変更ファイル                                     | 影響範囲                           | 回帰テスト有無 |
| ------------------------------------------------ | ---------------------------------- | -------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`     | 全14 skill: ハンドラーの戻り値契約 | -              |
| `apps/desktop/src/preload/skill-api.ts`          | Preload → Renderer 戻り値型        | -              |
| `apps/desktop/src/preload/types.ts`              | 型定義の整合性                     | -              |
| `apps/desktop/src/renderer/` 内の skill 利用箇所 | Renderer の契約解釈                | -              |

**回帰リスク確認コマンド**:

```bash
# Renderer側のskill API利用箇所を特定
rg -n "electronAPI\.skill\." apps/desktop/src/renderer/
```

---

### タスク5: レビュー判定

**目的**: PASS/MINOR/MAJOR/CRITICAL を判定する

**実行手順**:

1. タスク1〜4の結果を統合する
2. 問題を重要度別に分類する
3. 判定結果（PASS/MINOR/MAJOR/CRITICAL）を決定する
4. MINOR判定の場合は未タスク仕様書を作成する（省略不可）

**レビュー判定基準**:

| 判定     | 条件                                     | 次のアクション                                      |
| -------- | ---------------------------------------- | --------------------------------------------------- |
| PASS     | 全レビュー観点で問題なし                 | Phase 11 へ進行                                     |
| MINOR    | 軽微な指摘あり（機能に影響なし）         | 未タスク仕様書に変換後、Phase 11 へ（**省略不可**） |
| MAJOR    | 重大な問題あり（セキュリティ・機能影響） | 影響範囲に応じて Phase 1-5 へ戻る                   |
| CRITICAL | 致命的な問題あり（データ漏洩リスク）     | Phase 1 へ戻り要件再確認                            |

**戻り先決定基準**:

| 問題の種類                   | 戻り先                |
| ---------------------------- | --------------------- |
| 要件の問題                   | Phase 1（要件定義）   |
| 設計の問題                   | Phase 2（設計）       |
| テスト設計の問題             | Phase 4（テスト作成） |
| 実装の問題（ロジックエラー） | Phase 5（実装）       |
| コード品質の問題             | Phase 8（リファクタ） |

**MINOR判定時の未タスク化手順**:

1. 指摘内容を `docs/30-workflows/unassigned-task/` に指示書として作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

**レビュー結果サマリー**:

| レビュー観点 | 結果 | 指摘事項 |
| ------------ | ---- | -------- |
| 契約完全性   | -    | -        |
| 仕様整合性   | -    | -        |
| 依存関係     | -    | -        |
| 回帰リスク   | -    | -        |
| **最終判定** | -    | -        |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

---

## SubAgent 分担

| SubAgent   | 担当                                                       |
| ---------- | ---------------------------------------------------------- |
| SubAgent-A | タスク1（契約完全性レビュー）                              |
| SubAgent-B | タスク2（仕様整合性レビュー）+ タスク3（依存関係レビュー） |
| SubAgent-C | タスク4（回帰リスクレビュー）+ タスク5（レビュー判定）     |

## 参照資料

| 参照資料                 | パス                                                                       | 内容                   |
| ------------------------ | -------------------------------------------------------------------------- | ---------------------- |
| Phase 1 要件成果物       | `outputs/phase-1/requirements.md`                                          | AR制約の一次根拠       |
| IPCハンドラー実装        | `apps/desktop/src/main/ipc/skillHandlers.ts`                               | Main Processハンドラー |
| Preload API              | `apps/desktop/src/preload/skill-api.ts`                                    | Preload API実装        |
| Preload型定義            | `apps/desktop/src/preload/types.ts`                                        | 型定義                 |
| Phase 2 契約プロファイル | `outputs/phase-2/`                                                         | 突合根拠               |
| Phase 5 実装成果物       | `apps/desktop/src/main/ipc/skillHandlers.ts`                               | 契約統一実装の確認対象 |
| Phase 5 実装成果物       | `apps/desktop/src/preload/skill-api.ts`                                    | 契約統一実装の確認対象 |
| Phase 9 品質ゲート結果   | `outputs/phase-9/quality-report.md`                                        | 品質検証結果           |
| タスク指示書             | `docs/30-workflows/completed-tasks/task-skill-ipc-response-consistency.md` | AR制約一覧             |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                           | 内容             |
| --------------------- | ------------------------------------------------------------------------------ | ---------------- |
| セキュリティ原則      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | IPC セキュリティ |
| アーキテクチャ概要    | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | 全体構成         |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | 契約検証手順     |
| レビューゲート基準    | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | 判定基準         |

---

## 成果物

| 成果物             | パス                                        | 内容                 |
| ------------------ | ------------------------------------------- | -------------------- |
| 契約完全性レビュー | `outputs/phase-10/contract-completeness.md` | 全14チャネル確認結果 |
| 仕様整合性レビュー | `outputs/phase-10/spec-consistency.md`      | AR-1〜AR-7確認結果   |
| 最終レビュー結果   | `outputs/phase-10/final-review-result.md`   | PASS/MINOR/MAJOR判定 |

---

## 統合テスト連携

> 最終レビューで統合テスト結果を確認する

| 確認項目           | 基準                                                 |
| ------------------ | ---------------------------------------------------- |
| 全テスト           | 100% パス                                            |
| IPC連携            | 全14チャネル正常動作確認済み                         |
| セキュリティテスト | sender検証・バリデーション・エラーサニタイズ確認済み |

---

## 多角的チェック観点

| 観点         | 確認ポイント                                                                       |
| ------------ | ---------------------------------------------------------------------------------- |
| 契約完全性   | 全14チャネルが契約プロファイルに100%分類                                           |
| 仕様整合性   | AR-1〜AR-7 と実装の整合                                                            |
| 依存関係     | 関連未完了タスク（GETDETAIL-NAMING-DRIFT / ARG-FORM-UNIFICATION）との境界明確      |
| セキュリティ | validateIpcSender, P42準拠3段バリデーション, sanitizeErrorMessage 全ハンドラー実施 |
| 型安全性     | Preload型とMainハンドラー型の完全整合                                              |
| 回帰リスク   | 変更影響範囲に対する十分なテストカバレッジ                                         |

---

## 完了条件

- [ ] 全14チャネルが契約プロファイルに100%分類されていることが確認されている
- [ ] AR-1〜AR-7 と実装の整合性が確認されている
- [ ] 関連タスクとの変更境界が明確である
- [ ] 回帰リスクが評価されている
- [ ] PASS/MINOR/MAJOR/CRITICAL の判定が記録されている
- [ ] MINOR指摘がある場合、未タスク仕様書に変換されている

---

## サブタスク管理

| #   | タスク名           | ステータス | 備考 |
| --- | ------------------ | ---------- | ---- |
| 1   | 契約完全性レビュー | 未着手     |      |
| 2   | 仕様整合性レビュー | 未着手     |      |
| 3   | 依存関係レビュー   | 未着手     |      |
| 4   | 回帰リスクレビュー | 未着手     |      |
| 5   | レビュー判定       | 未着手     |      |

---

## タスク100%実行確認【必須】チェックリスト

- [ ] タスク1: 契約完全性レビュー — 全14チャネル突合完了
- [ ] タスク2: 仕様整合性レビュー — AR-1〜AR-7 全項目確認
- [ ] タスク3: 依存関係レビュー — 境界確認完了
- [ ] タスク4: 回帰リスクレビュー — リスク評価完了
- [ ] タスク5: レビュー判定 — PASS/MINOR/MAJOR/CRITICAL 判定記録

---

## Phase実行記録

| 項目         | 内容 |
| ------------ | ---- |
| 実行開始日時 |      |
| 実行完了日時 |      |
| 実行者       |      |
| 特記事項     |      |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（3ファイル）が全て生成されていることを確認
- [ ] 判定結果がPASS/MINORであることを確認

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11（手動テスト検証）へ進む（PASS/MINOR の場合）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-ipc-response-consistency/phase-11-manual-test.md`
