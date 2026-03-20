# Phase 8: リファクタリング（TDD: Refactor） - IPC契約ドリフト自動検出スクリプト

## メタ情報

| 項目   | 値                                           |
| ------ | -------------------------------------------- |
| Phase  | 8                                            |
| 機能名 | UT-TASK06-007-ipc-contract-drift-auto-detect |
| 作成日 | 2026-03-18                                   |

## 目的

Phase 5（実装）・Phase 6-7（テスト拡充・カバレッジ確認）で作成した `check-ipc-contracts.ts` のコード品質を、動作を変えずに改善する。抽出ロジック・照合ロジック・レポート生成の責務分離を確認し、SOLID原則に基づくルール追加容易性を担保する。

## 実行タスク

- コード構造改善: 抽出（Extract）・照合（Match）・検出（Validate）・レポート（Report）の4段階が明確に分離されているか確認
- 命名改善: 変数名・関数名がP44/P45の文脈で理解しやすいか確認し、セマンティクス乖離があれば改名
- 重複排除: Mainハンドラ抽出とPreload抽出でパターンマッチロジックの共通化を検討
- SOLID原則適用: 新規検出ルール（R-05以降）の追加が既存コードの変更なしに行えるか確認（開放閉鎖原則）
- 行数制限: NFR-05（200行以内）を維持しつつ、可読性を向上させる

## 参照資料

| 資料名        | パス                                                         | 説明                       |
| ------------- | ------------------------------------------------------------ | -------------------------- |
| Phase 1要件   | `outputs/phase-1/requirements.md`                            | 受入基準と品質制約の再確認 |
| Phase 7成果物 | `outputs/phase-7/coverage-report.md`                         | カバレッジ確認結果         |
| Phase 5実装   | `apps/desktop/scripts/check-ipc-contracts.ts`                | リファクタリング対象       |
| Phase 5テスト | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` | テスト継続成功を確認       |
| Phase 6成果物 | `phase-6-test-expansion.md`                                  | 追加テスト観点を確認       |
| Phase 2設計書 | `outputs/phase-2/design.md`                                  | モジュール構成・型定義設計 |

### システム仕様（aiworkflow-requirements）

> リファクタリング時に以下の仕様との整合性を維持してください。

| 参照資料                   | パス                                                                                        | 内容                         |
| -------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターンの正本           |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | コード品質基準               |
| 開発ガイドライン           | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | コーディング規約             |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPCハンドラの契約検証手順    |
| セキュリティ-Electron IPC  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Electron IPCセキュリティ設計 |

## 実行手順

### ステップ1: 現状のコード構造分析

リファクタリング前にコードの現状を定量評価する。

```bash
# 行数確認（NFR-05: 200行以内）
wc -l apps/desktop/scripts/check-ipc-contracts.ts

# 関数一覧の抽出
grep -n "function \|const .* = " apps/desktop/scripts/check-ipc-contracts.ts

# 重複パターンの検出
grep -c "execSync\|spawnSync" apps/desktop/scripts/check-ipc-contracts.ts
```

| 確認項目          | 基準                                              | 結果       |
| ----------------- | ------------------------------------------------- | ---------- |
| 総行数            | 200行以内（NFR-05）                               | {{RESULT}} |
| 関数数            | 抽出・照合・検出・レポートの4カテゴリに分類可能か | {{RESULT}} |
| 重複コード箇所    | Main/Preload抽出で類似パターンが存在するか        | {{RESULT}} |
| 未使用import/変数 | 不要なコードが残っていないか                      | {{RESULT}} |

### ステップ2: 責務分離の確認と改善

Phase 2設計の4段階処理フローに沿って、各関数の責務が明確に分離されているか確認する。

| 段階        | 期待される責務                  | 確認観点                                         | 結果       |
| ----------- | ------------------------------- | ------------------------------------------------ | ---------- |
| 1. Extract  | Main/Preloadからエントリを抽出  | grep/rg実行と結果パースが分離されているか        | {{RESULT}} |
| 2. Match    | チャンネル名で両側をJOIN        | 照合ロジックがビジネスロジックと混在していないか | {{RESULT}} |
| 3. Validate | R-01〜R-04のルールを適用        | ルール追加が容易な構造か（OCP準拠）              | {{RESULT}} |
| 4. Report   | Markdown/JSON形式でレポート生成 | 出力フォーマットがロジックから独立しているか     | {{RESULT}} |

### ステップ3: 命名改善

P44（引数形式不一致）/P45（命名ドリフト）の文脈に沿った命名を確認する。

| 改善対象         | 改善前（例）        | 改善後（例）       | 理由                          |
| ---------------- | ------------------- | ------------------ | ----------------------------- |
| 引数パターン型   | `"object"`          | `"object"`（維持） | Phase 2設計準拠               |
| チャンネル名変数 | `ch` / `name`       | `channel`          | セマンティクスの明確化（P45） |
| 関数名           | `extract` / `check` | `extractHandlers`  | 対象の明示                    |
| レポート変数     | `result`            | `driftReport`      | DriftReport型との対応を明確化 |

### ステップ4: 重複排除

Mainハンドラ抽出とPreload抽出で共通化可能なロジックを特定する。

```typescript
// 共通化候補: grep実行とライン解析
// Before: extractMainHandlers() と extractPreloadEntries() で類似コード
// After: parseGrepOutput(pattern, targetDir) を共通関数として抽出

// ただし、200行以内制約のため過度な抽象化は避ける
```

| 共通化候補                 | 共通化判断 | 理由                                           |
| -------------------------- | ---------- | ---------------------------------------------- |
| grep/rg実行ラッパー        | 検討       | 呼び出しパターンが類似していれば共通化         |
| パターンマッチ結果のパース | 検討       | Main/Preloadで解析ロジックが異なる場合は不適切 |
| レポートフォーマッター     | 維持       | Markdown/JSON切り替えは既に分離済みのはず      |

### ステップ5: SOLID原則適用確認

| 原則                       | 確認内容                                         | 結果       |
| -------------------------- | ------------------------------------------------ | ---------- |
| 単一責務 (SRP)             | 各関数が1つの責務のみを持つか                    | {{RESULT}} |
| 開放閉鎖 (OCP)             | 新規ルール（R-05）追加が既存コード無変更で可能か | {{RESULT}} |
| リスコフ置換 (LSP)         | N/A（継承未使用）                                | N/A        |
| インターフェース分離 (ISP) | N/A（スクリプト単体のため）                      | N/A        |
| 依存性逆転 (DIP)           | N/A（外部依存なし、DIは不要と設計済み）          | N/A        |

### ステップ6: リファクタリング後のテスト継続成功確認

```bash
# リファクタリング後にテストが全てPASSすることを確認
cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts
```

| 確認項目     | 基準                       | 結果       |
| ------------ | -------------------------- | ---------- |
| テスト全PASS | リファクタ前と同数のテスト | {{RESULT}} |
| 行数維持     | 200行以内（NFR-05）        | {{RESULT}} |
| 型チェック   | `pnpm typecheck` がPASS    | {{RESULT}} |
| Lint         | `pnpm lint` がPASS         | {{RESULT}} |

## 統合テスト連携

| テスト観点     | 確認内容                                                                                           | 結果       |
| -------------- | -------------------------------------------------------------------------------------------------- | ---------- |
| テスト継続成功 | `pnpm --filter @repo/desktop exec vitest run scripts/__tests__/check-ipc-contracts.test.ts` がPASS | {{RESULT}} |
| スクリプト実行 | `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` が正常実行                    | {{RESULT}} |
| 行数制約       | `wc -l` で200行以内を確認                                                                          | {{RESULT}} |
| 型安全         | `pnpm typecheck` がPASS                                                                            | {{RESULT}} |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                                   | 仕様参照先                                                         |
| -------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| コード品質     | 責務分離・命名・重複排除の改善             | `aiworkflow-requirements: development-guidelines.md`               |
| 保守性         | 新規検出ルール追加時の変更容易性           | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| パフォーマンス | リファクタリングによる実行時間への影響なし | NFR-01: 10秒以内                                                   |

## 成果物

| 成果物               | パス                                    | 説明                           |
| -------------------- | --------------------------------------- | ------------------------------ |
| リファクタリング報告 | `outputs/phase-8/refactoring-report.md` | 改善内容・テスト継続成功の記録 |

## 完了条件

- [ ] コード構造が Extract/Match/Validate/Report の4段階に明確に分離されている
- [ ] 変数名・関数名がP44/P45の文脈で理解しやすい命名になっている
- [ ] Main/Preload抽出の重複パターンが共通化されている（共通化不要の場合は理由を記録）
- [ ] 新規検出ルール追加が容易な構造になっている（OCP準拠）
- [ ] スクリプト本体が200行以内を維持している（NFR-05）
- [ ] テストが全てPASSしている（リファクタリング前と同数）
- [ ] `pnpm typecheck` / `pnpm lint` がPASSしている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 現状のコード構造分析（行数・関数一覧・重複パターン）
2. 責務分離の確認と改善
3. 命名改善の実施
4. 重複排除の検討と実施
5. SOLID原則適用確認
6. テスト継続成功確認（vitest + typecheck + lint）
7. 成果物の作成・配置
8. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect --phase 8
```

## 次のPhase

Phase 9: 品質保証
