# Phase 7: テストカバレッジ確認 - TASK-P0-01 verify 実行エンジン（Layer 1/2 コア + Layer 3/4 互換）

## メタ情報

| 項目      | 内容                                                   |
| --------- | ------------------------------------------------------ |
| Phase     | 7                                                      |
| Phase名   | テストカバレッジ確認                                   |
| カテゴリ  | 品質ゲート                                             |
| 機能名    | step-09-par-task-p0-01-verify-execution-engine-layer12 |
| 作成日    | 2026-04-04                                             |
| 前提Phase | Phase 6                                                |
| 後続Phase | Phase 8                                                |

## 目的

ユニットテストのカバレッジが基準を満たしていることを確認する。基準未達の場合はテストを追加してカバレッジを引き上げる。current facts では Layer 3/4 互換も既に存在するため、coverage は core だけでなく互換退行も含めて読む。

## カバレッジ基準

| カバレッジ種別    | 基準値 | 理由                                                    |
| ----------------- | ------ | ------------------------------------------------------- |
| Line coverage     | 80%+   | 主要な実行パスを網羅する最低ライン                      |
| Branch coverage   | 60%+   | 条件分岐（Layer 2 出力制御 / 非発行）の主要パスをカバー |
| Function coverage | 80%+   | モジュールプライベート関数を含む全関数をカバー          |

## 実行タスク

### タスク1: カバレッジ計測の実行

**目的**: 現状のカバレッジ数値を取得する

**対象ファイル**: `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`

**実行コマンド**:

```bash
pnpm --filter @repo/desktop test -- --coverage SkillCreatorVerificationEngine
```

**確認項目**:

| 確認項目          | 確認方法                                  |
| ----------------- | ----------------------------------------- |
| Line coverage     | レポートの `Lines` 列を確認する           |
| Branch coverage   | レポートの `Branches` 列を確認する        |
| Function coverage | レポートの `Functions` 列を確認する       |
| 未カバー箇所      | レポートの `Uncovered Lines` 列を確認する |

### タスク2: カバレッジレポートの読み取り

**目的**: 未カバーの箇所を特定し、追加テストの必要性を判断する

**分析観点**:

| 観点                            | 確認内容                                                                 |
| ------------------------------- | ------------------------------------------------------------------------ |
| 未カバーの Layer 1 関数         | `fileExists`・`directoryExists` の全ブランチがカバーされているか         |
| 未カバーの Layer 2 関数         | `readFileContent` の `null` 返却パス（読み込み失敗）がカバーされているか |
| 未カバーの Layer 2 出力制御条件 | Layer 1 error → Layer 2 出力制御の全組み合わせがカバーされているか       |
| 未カバーのヘルパー関数          | `hasH1Heading`・`hasMarkdownSection` の false ケースがカバーされているか |
| 未カバーの Facade パス          | graceful degradation（`verificationEngine` 未注入）がカバーされているか  |

### タスク3: カバレッジ基準の判定

**目的**: 計測結果が基準を満たすかを判定し、不足時は対処する

**判定フロー**:

```
計測結果の確認
  ├── 全基準をクリア → 成果物記録して Phase 8 へ進む
  └── 基準未達 → タスク4（追加テスト作成）へ進む
```

**判定結果記録**:

| カバレッジ種別    | 計測値 | 基準値 | 判定（PASS/FAIL） |
| ----------------- | ------ | ------ | ----------------- |
| Line coverage     | —      | 80%+   | —                 |
| Branch coverage   | —      | 60%+   | —                 |
| Function coverage | —      | 80%+   | —                 |

### タスク4: カバレッジ不足時の追加テスト（基準未達の場合のみ）

**目的**: 基準未達のカバレッジを引き上げるためのテストを追加する

**追加テスト候補**:

| 未カバー箇所                                 | 追加テスト内容                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| `readFileContent` のファイル読み込み失敗     | 読み込み不可能なファイルパスを渡し、`null` が返ることを確認する                 |
| `hasMarkdownSection` の false ケース         | 見出しが存在しないコンテンツを渡し、`false` が返ることを確認する                |
| `validateLayer2` の全出力制御組み合わせ      | L1-001/L1-002/L1-003/L1-005 の error が各 L2 出力制御に反映されることを確認する |
| `createCheck` の `evidenceSummary` あり/なし | optional フィールドが正しく設定されることを確認する                             |

**手順**:

1. 未カバー箇所を特定する
2. 対応するテストケースを `SkillCreatorVerificationEngine.test.ts` に追加する
3. 再度 `pnpm --filter @repo/desktop test -- --coverage SkillCreatorVerificationEngine` を実行する
4. 基準をクリアするまでタスク3〜4を繰り返す

### タスク5: カバレッジレポートの記録

**目的**: 最終的なカバレッジ数値と未カバー箇所の説明を文書化する

**記録内容**:

- 最終カバレッジ数値（Line / Branch / Function）
- 未カバー箇所の一覧とその理由（意図的な非発行含む）
- 基準クリアの確認

## 参照資料

| 資料名               | パス                                                                                      | 説明                       |
| -------------------- | ----------------------------------------------------------------------------------------- | -------------------------- |
| Phase 6 テスト       | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | カバレッジ計測対象のテスト |
| Phase 5 実装         | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                | カバレッジ計測対象の実装   |
| Phase 6 拡充レポート | `outputs/phase-6/expanded-test-report.md`                                                 | 拡充済みテストの一覧       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                                    | 内容                                         |
| ------------------------ | --------------------------------------------------------------------------------------- | -------------------------------------------- |
| Verify契約・Check ID体系 | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | 全チェックの severity 仕様（カバレッジ根拠） |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`       | モジュール構成（カバレッジ対象の特定）       |

## 統合テスト連携

| テスト観点                 | 内容                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------- |
| Branch coverage の重要性   | Layer 1 error → Layer 2 出力制御の分岐が全パターンカバーされていることが重要        |
| Function coverage の対象   | モジュールプライベート関数（`fileExists` 等）も間接的にカバーされていること         |
| P0-02 との型整合カバレッジ | `severity === "error"` の判定分岐が全ケース（error/warning/info）でカバーされること |

## 成果物

| 成果物             | パス                                 | 説明                                   |
| ------------------ | ------------------------------------ | -------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・判定・未カバー箇所の説明記録 |

## 完了条件

- [ ] `pnpm --filter @repo/desktop test -- --coverage SkillCreatorVerificationEngine` を実行している
- [ ] Line coverage が 80% 以上である
- [ ] Branch coverage が 60% 以上である
- [ ] Function coverage が 80% 以上である
- [ ] 未カバー箇所の一覧と理由が記録されている
- [ ] カバレッジレポート `outputs/phase-7/coverage-report.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）
