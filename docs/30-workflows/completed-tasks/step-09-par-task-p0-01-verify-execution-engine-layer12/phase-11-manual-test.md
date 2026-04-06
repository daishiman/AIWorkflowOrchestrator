# Phase 11: 手動テスト検証

## メタ情報

| 項目           | 値                                                                           |
| -------------- | ---------------------------------------------------------------------------- |
| Phase番号      | 11                                                                           |
| Phase名        | 手動テスト検証                                                               |
| 対象タスク     | TASK-P0-01: verify 実行エンジン（Layer 1/2 コア + Layer 3/4 互換）の仕様整合 |
| 関連Issue      | #1886                                                                        |
| タスク種別     | バックエンド Main Process 実装（表示層変更なし、IPC変更なし）                |
| タスク種別判定 | **NON_VISUAL**（表示層変更なし、バックエンドのみ）                           |
| 実施者         | Claude Code                                                                  |

## 目的

自動テストでは検証できない動作を手動で確認する。  
本タスクは NON_VISUAL のため、画面キャプチャは不要。証跡の主ソースは自動テスト（ユニットテスト）の実行結果とする。current facts では Layer 3/4 互換も既に存在するため、手動確認では 4-layer 契約を壊していないことも確認する。

## 実行タスク

### Task 11-1: TC-01 — 正常系: 実際のスキルディレクトリで verify 実行

**前提条件**: TC-01 で扱う要件スキルの実ディレクトリが存在すること

**手順**:

1. `SkillCreatorVerificationEngine.verify()` を直接呼び出すスクリプト（または既存テストを利用）で実際のスキルディレクトリを指定して verify を実行する
2. 返却された `RuntimeSkillCreatorVerifyCheck[]` に `severity === 'error'` が含まれていないことを確認する
3. 返却されたチェックに Layer 1 / Layer 2 の ID が含まれていることを確認する

**期待結果**:

- `checks.some((check) => check.severity === 'error') === false`
- エラー件数: 0

**記録項目**: 実行コマンド、出力結果、判定

---

### Task 11-2: TC-02 — 異常系: 不完全なスキルディレクトリで Layer 1 エラー確認

**前提条件**: テスト用の不完全なスキルディレクトリを用意する（必須ファイルを意図的に欠落させる）

**手順**:

1. `SKILL.md` または必須ファイルを含まないディレクトリを指定して verify を実行する
2. Layer 1 チェックでエラーが検出されること

**期待結果**:

- `checks.some((check) => check.id === 'L1-001' && check.severity === 'error') === true`
- L1-001〜L1-005 のうち該当するチェック ID のエラーメッセージが返却されること

**記録項目**: テスト用ディレクトリ構成、出力されたエラー内容、判定

---

### Task 11-3: TC-03 — 異常系: SKILL.md セクション不足で Layer 2 エラー確認

**前提条件**: SKILL.md が存在するが `## 概要` セクションが欠落しているスキルディレクトリを用意する

**手順**:

1. Layer 1 は通過するが SKILL.md の必須セクションが不足するディレクトリを指定して verify を実行する
2. Layer 2 チェックでエラーが検出されること

**期待結果**:

- `checks.some((check) => check.id === 'L2-002' && check.severity === 'error') === true`
- 不足セクション名がエラーメッセージに含まれること

**記録項目**: SKILL.md の内容（欠落セクション明示）、出力されたエラー内容、判定

---

### Task 11-4: TC-04 — verificationEngine 未注入時の Facade 動作（graceful degradation）

**手順**:

1. `verificationEngine` を注入せずに `RuntimeSkillCreatorFacade` をインスタンス化する
2. `verifySkill()` を呼び出して `[]` が返ることを確認する
3. `verifyAndImproveLoop()` を呼び出して PASS ルートに進むことを確認する

**期待結果**:

- クラッシュ・例外の uncaught エラーが発生しないこと
- `verifySkill()` の戻り値が `[]` であること
- `verifyAndImproveLoop()` で `WorkflowEngine.recordVerifyPass()` が 1 回呼ばれること
- 戻り値やログで `verificationEngine` 未設定の graceful degradation が確認できること

**記録項目**: 実行コード、出力結果、判定

---

### Task 11-5: TC-05 — TypeScript コンパイル確認

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck
```

**期待結果**: エラー 0 件

**記録項目**: コマンド出力、エラーの有無、判定

---

### Task 11-6: TC-06 — ESLint 確認

```bash
pnpm lint
```

**期待結果**: エラー 0 件（警告は許容するが記録する）

**記録項目**: コマンド出力、エラー/警告の有無、判定

---

## 参照資料

- `phase-2-design.md`（設計の前提）
- `phase-5-implementation.md`（実装の前提）
- `phase-6-test-expansion.md`（拡充テストの前提）
- `phase-7-coverage.md`（カバレッジ確認の前提）
- `phase-8-refactoring.md`（リファクタリング結果の前提）
- `phase-9-quality.md`（品質確認の前提）
- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts`
- TC-01 の対象スキルディレクトリ（実ディレクトリ）

## 統合テスト連携

- 本 Phase は Phase 10（最終レビューゲート）の PASS を前提とする
- 自動テストで検証済みのケースと重複するテストは省略可（その旨を `manual-test-result.md` に記録すること）

## 成果物

| 成果物          | パス                                     | 必須                 |
| --------------- | ---------------------------------------- | -------------------- |
| 手動テスト結果  | `outputs/phase-11/manual-test-result.md` | 必須                 |
| 発見 Issue 一覧 | `outputs/phase-11/discovered-issues.md`  | 必須（0 件でも出力） |

### `manual-test-result.md` メタ情報（NON_VISUAL 記載必須項目）

- **証跡の主ソース**: 自動テスト（`SkillCreatorVerificationEngine.test.ts`）の実行結果（テストケース件数と `RuntimeSkillCreatorVerifyCheck[]` の判定を明記）
- **画面キャプチャを作らない理由**: バックエンドのみの実装で表示層なし（NON_VISUAL）
- 実行日時
- TC-01 〜 TC-06 の個別判定結果
- 総合判定: PASS / FAIL

### `discovered-issues.md` 記載項目

- 発見された Issue の一覧（0 件の場合は「発見された Issue はありません」と明記）
- 各 Issue の概要・再現手順・影響範囲・優先度

## 完了条件

- [ ] 本 Phase 内の全タスク（Task 11-1 〜 11-6）を 100% 実行完了
- [ ] TC-01 〜 TC-06 の全テストケースを実施し結果を記録した
- [ ] 総合判定が PASS
- [ ] `outputs/phase-11/manual-test-result.md` が出力されている（NON_VISUAL メタ情報を含む）
- [ ] `outputs/phase-11/discovered-issues.md` が出力されている（0 件でも出力）

## 次の Phase

Phase 12: ドキュメント更新（`phase-12-documentation.md`）
