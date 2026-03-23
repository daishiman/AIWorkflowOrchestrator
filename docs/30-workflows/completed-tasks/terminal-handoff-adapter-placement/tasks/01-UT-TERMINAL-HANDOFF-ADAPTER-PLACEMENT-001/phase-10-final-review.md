# Phase 10: 最終レビューゲート

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| 機能名   | terminal-handoff-adapter-placement        |
| Phase    | 10 - 最終レビュー                         |
| 作成日   | 2026-03-22                                |
| 前Phase  | Phase 9（品質検証）                       |
| 次Phase  | Phase 11（手動テスト）                    |
| タスクID | UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 |

## 目的

Phase 1-9 の全成果物に対して多角的な品質・整合性検証を実施し、最終的なリリース可否を判定する。MINOR 指摘は全て未タスク仕様書に変換する（省略不可）。

## 前提条件

- Phase 9 の全品質ゲートを PASS 済み
- 本タスクは UI 変更を伴わない（HandoffBlock.tsx の型 import のみ変更）

## レビュー観点

### 観点 1: 要件充足（AC-01 ~ AC-07）

全ての受入基準を再確認し、充足状況を記録する。

| AC    | 内容                                                        | 判定 |
| ----- | ----------------------------------------------------------- | ---- |
| AC-01 | toHandoffGuidance 関数が adapters/handoff/ に配置されている | -    |
| AC-02 | HandoffData を HandoffGuidance に正しく変換する             | -    |
| AC-03 | 全ての HandoffKind に対応した変換が実装されている           | -    |
| AC-04 | サニタイズ処理が適用されている                              | -    |
| AC-05 | 機密情報が除外されている                                    | -    |
| AC-06 | 既存 TerminalHandoffBuilder に影響がない                    | -    |
| AC-07 | テストカバレッジ基準を達成している                          | -    |

### 観点 2: コード品質

- [ ] **SOLID 原則**: 単一責務・開放閉鎖・依存性逆転が守られている
- [ ] **命名規則**: boolean 変数は `is`/`has`/`can`/`should` プレフィックス
- [ ] **型安全**: `any` 型の使用がない、`strict: true` 準拠
- [ ] **型アサーション**: `as` によるバリデーション回避がない（P19 準拠）
- [ ] **non-null assertion**: `!` による安全性偽装がない（P48 準拠）
- [ ] **const assertion**: リテラル型に `as const` が適切に適用されている
- [ ] **JSDoc**: 公開関数に適切なドキュメントがある
- [ ] **early return**: 不要なネストが除去されている
- [ ] **未使用 import**: 不要な import が残っていない

### 観点 3: セキュリティ

- [ ] **サニタイズ処理**: ユーザー入力が適切にサニタイズされている
- [ ] **機密情報除外**: API キー、トークン、パスワード等が出力に含まれない
- [ ] **パストラバーサル**: ファイルパス関連の処理がある場合、パストラバーサル対策が施されている
- [ ] **エラーメッセージ**: 内部情報がエラーメッセージに含まれない（P55 準拠）

### 観点 4: P23/P64 準拠 - HandoffGuidance 型の一意性確認

- [ ] `HandoffGuidance` 型がプロジェクト内で一意に定義されている
- [ ] 同名の型が別ファイルに存在しないことを確認:

```bash
grep -rn "interface HandoffGuidance\|type HandoffGuidance" apps/desktop/src/ packages/
```

- [ ] 型定義の配置が適切（adapters 層 or 共有パッケージ）
- [ ] import 元が全箇所で統一されている:

```bash
grep -rn "import.*HandoffGuidance" apps/desktop/src/ | grep -v __tests__ | grep -v node_modules
```

### 観点 5: P44/P45 準拠 - IPC インターフェース整合

本タスクは IPC ハンドラの変更を伴わないが、将来の IPC 統合に備えて以下を確認する:

- [ ] HandoffGuidance 型が structured clone 互換である（関数・Symbol プロパティなし）
- [ ] 既存の IPC チャンネル定義に影響を与えていない
- [ ] Preload 層の型定義に変更が不要であることを確認:

```bash
grep -rn "handoff\|Handoff" apps/desktop/src/preload/
```

### 観点 6: テスト網羅性

- [ ] Line Coverage >= 90%（Phase 7 結果を参照）
- [ ] Branch Coverage >= 60%（Phase 7 結果を参照）
- [ ] Function Coverage >= 90%（Phase 7 結果を参照）
- [ ] 正常系テストが網羅されている（全 HandoffKind）
- [ ] 異常系テストが網羅されている（null/undefined/空文字列/不正値）
- [ ] 境界値テストが含まれている
- [ ] サニタイズ関連テストが含まれている
- [ ] テスト間の状態リークがない（P9 準拠）

### 観点 7: 段階的移行 - 既存 Builder への影響なし

- [ ] TerminalHandoffBuilder の既存コードに変更がない:

```bash
git diff HEAD -- apps/desktop/src/main/runtime/TerminalHandoffBuilder.ts
```

- [ ] TerminalHandoffBuilder の既存テストが全 PASS:

```bash
cd apps/desktop && pnpm vitest run --reporter=verbose 2>&1 | grep -i "TerminalHandoffBuilder"
```

- [ ] adapters/handoff/ が runtime/TerminalHandoffBuilder に依存していない（循環参照なし）
- [ ] HandoffBlock.tsx の変更が型 import のみであること:

```bash
git diff HEAD -- apps/desktop/src/renderer/components/HandoffBlock.tsx
```

## 統合テスト連携確認

1. adapters 層と runtime 層の統合テスト:

```bash
cd apps/desktop && pnpm vitest run --reporter=verbose 2>&1 | grep -E "(handoff|adapter)" -i
```

2. 確認項目:
   - [ ] adapters 層テストと runtime 層テストが独立して PASS
   - [ ] 共有型の整合性が保たれている
   - [ ] 将来の段階的移行パス（Builder → Adapter）が明確

## 判定基準

| 判定     | 条件                                 | 対応                                           |
| -------- | ------------------------------------ | ---------------------------------------------- |
| PASS     | 全観点で問題なし                     | Phase 11 へ進行                                |
| MINOR    | 機能に影響しない軽微な改善点         | 未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | 要件未充足、設計上の問題             | 影響範囲に応じて Phase 1-5 へ差し戻し          |
| CRITICAL | セキュリティ脆弱性、データ損失リスク | Phase 1 へ戻り要件再確認                       |

### MINOR 指摘の未タスク化手順

MINOR 指摘が検出された場合、以下の 3 ステップを全て実施する（P3 準拠、省略不可）:

1. `docs/30-workflows/unassigned-task/` に指示書を作成
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

## 実行手順

### Task 1: 観点 1-7 のレビュー実施

各観点のチェック項目を順に確認し、結果を記録する。

### Task 2: 指摘事項の分類

検出された指摘を PASS / MINOR / MAJOR / CRITICAL に分類する。

### Task 3: MINOR 指摘の未タスク化（該当する場合）

MINOR 指摘を未タスク仕様書に変換する（3 ステップ全完了必須）。

### Task 4: レビュー結果レポートの作成

`outputs/phase-10/final-review-result.md` にレビュー結果を記録する:

```markdown
# 最終レビュー結果

## レビュー日時

YYYY-MM-DD HH:MM

## レビュー観点別結果

### 観点 1: 要件充足

- AC-01: PASS / FAIL
- AC-02: PASS / FAIL
- AC-03: PASS / FAIL
- AC-04: PASS / FAIL
- AC-05: PASS / FAIL
- AC-06: PASS / FAIL
- AC-07: PASS / FAIL

### 観点 2: コード品質

- 判定: PASS / MINOR / MAJOR
- 指摘事項: （該当する場合）

### 観点 3: セキュリティ

- 判定: PASS / CRITICAL
- 指摘事項: （該当する場合）

### 観点 4: P23/P64 準拠

- 判定: PASS / MINOR / MAJOR
- 指摘事項: （該当する場合）

### 観点 5: P44/P45 準拠

- 判定: PASS / N/A
- 指摘事項: （該当する場合）

### 観点 6: テスト網羅性

- 判定: PASS / MINOR / MAJOR
- 指摘事項: （該当する場合）

### 観点 7: 段階的移行

- 判定: PASS / MAJOR
- 指摘事項: （該当する場合）

## 指摘事項サマリ

| #   | 観点 | 重要度 | 内容 | 対応 |
| --- | ---- | ------ | ---- | ---- |
| 1   | -    | -      | -    | -    |

## MINOR 指摘の未タスク化（該当する場合）

| 指摘# | 未タスクID | 指示書パス | task-workflow 登録 | 仕様書リンク |
| ----- | ---------- | ---------- | ------------------ | ------------ |
| -     | -          | -          | -                  | -            |

## 総合判定

PASS / MINOR / MAJOR / CRITICAL

## 次Phase

Phase 11 / 差し戻し先Phase
```

## 成果物

| 成果物           | パス                                      |
| ---------------- | ----------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                        | 仕様参照先                                          |
| ------------------ | ------------------------------- | --------------------------------------------------- |
| セキュリティ       | サニタイズ実装の最終確認        | `aiworkflow-requirements: security-electron-ipc.md` |
| アーキテクチャ     | adapter配置・依存方向の最終確認 | `aiworkflow-requirements: architecture-overview.md` |
| エラーハンドリング | exhaustive checkの動作確認      | `aiworkflow-requirements: error-handling.md`        |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                  | 仕様参照先                                                                               |
| -------------------- | ------------------------- | ---------------------------------------------------------------------------------------- |
| バックエンド（Main） | adapter最終レビュー       | `aiworkflow-requirements: architecture-overview.md`                                      |
| IPC通信              | HandoffGuidance転送の整合 | `aiworkflow-requirements: interfaces-agent-sdk-skill-reference-share-debug-analytics.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 要件充足確認（AC-01〜AC-07）
3. コード品質レビュー
4. セキュリティレビュー
5. テスト網羅性確認
6. レビュー判定の記録
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/terminal-handoff-adapter-placement --phase 10
```

## 完了条件

- [ ] 観点 1（要件充足）: AC-01 ~ AC-07 の全項目を確認した
- [ ] 観点 2（コード品質）: SOLID 原則・命名規則・型安全を確認した
- [ ] 観点 3（セキュリティ）: サニタイズ・機密情報除外を確認した
- [ ] 観点 4（P23/P64 準拠）: HandoffGuidance 型の一意性を確認した
- [ ] 観点 5（P44/P45 準拠）: IPC インターフェース整合を確認した
- [ ] 観点 6（テスト網羅性）: カバレッジ基準達成を確認した
- [ ] 観点 7（段階的移行）: 既存 Builder への影響がないことを確認した
- [ ] 統合テスト連携確認が全項目 PASS した
- [ ] 検出された指摘を PASS / MINOR / MAJOR / CRITICAL に分類した
- [ ] MINOR 指摘は全て未タスク仕様書に変換した（3 ステップ全完了、省略不可）
- [ ] レビュー結果レポートが `outputs/phase-10/final-review-result.md` に記録された
- [ ] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 11: 手動テスト（`phase-11-manual-test.md`）
