# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 4               |
| 機能名 | logging-service |
| 作成日 | 2026-01-07      |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 使用スキル

| スキル                    | 選定理由                           |
| ------------------------- | ---------------------------------- |
| `tdd-principles`          | TDD原則に基づくテスト先行開発      |
| `test-doubles`            | LogRepositoryのモック/スタブ設計   |
| `boundary-value-analysis` | バッファサイズ等の境界値テスト設計 |

## 参照資料

| 資料名           | パス                                                              | 説明             |
| ---------------- | ----------------------------------------------------------------- | ---------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md`                      | Phase 1成果物    |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`                          | Phase 1成果物    |
| アーキテクチャ   | `outputs/phase-2/architecture-design.md`                          | Phase 2成果物    |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`                         | Phase 3成果物    |
| 元実装仕様       | `docs/30-workflows/unassigned-task/task-05-01-logging-service.md` | テストケース参考 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                              | 内容                       |
| ---------------- | ----------------------------------------------------------------- | -------------------------- |
| 変換処理仕様     | `.claude/skills/aiworkflow-requirements/references/conversion.md` | 変換処理の全体フロー       |
| データベース仕様 | `.claude/skills/aiworkflow-requirements/references/database.md`   | テーブル設計・リレーション |
| 型定義仕様       | `.claude/skills/aiworkflow-requirements/references/types.md`      | 共通型定義パターン         |

## 実行手順

### ステップ1: テストシナリオ設計

`tdd-principles` スキルを参照し、受け入れ基準からテストシナリオを導出する。

### ステップ2: モック/スタブ設計

`test-doubles` スキルを参照し、LogRepositoryのモックを設計する。

```typescript
// モック設計例
const mockRepository: LogRepository = {
  bulkInsert: vi.fn().mockResolvedValue(ok(undefined)),
  findByFileId: vi.fn(),
  findByLevel: vi.fn(),
  findByDateRange: vi.fn(),
};
```

### ステップ3: ユニットテスト作成

元タスク指示書のテストケースを参考に、以下のテストを作成する:

```typescript
describe("ConversionLogger", () => {
  it("INFOログを正常に記録できる");
  it("WARNログを正常に記録できる");
  it("ERRORログにスタックトレースを含められる");
  it("バッファが満杯になると自動フラッシュされる");
  it("バッチログ記録が動作する");
  it("dispose時にフラッシュされる");
  it("自動フラッシュタイマーが動作する");
});
```

### ステップ4: 境界値テスト

`boundary-value-analysis` スキルを参照し、エッジケースのテストを追加する。

- バッファサイズ0, 1, 100, 101
- フラッシュインターバル0ms, 最小値, 最大値

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ     | 検証内容                                | テストファイル          |
| -------------------- | --------------------------------------- | ----------------------- |
| Repository接続テスト | ConversionLogger → LogRepository疎通    | `*.integration.test.ts` |
| データフローテスト   | ログ生成→バッファ→フラッシュ→Repository | `*.flow.test.ts`        |
| エラーハンドリング   | Repository障害時のエラー伝播            | `*.error.test.ts`       |
| バッファリングテスト | サイズ/時間ベースの自動フラッシュ       | `*.buffer.test.ts`      |

## 成果物

| 成果物             | パス                                                                       | 説明               |
| ------------------ | -------------------------------------------------------------------------- | ------------------ |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                    | テスト設計         |
| テストケース       | `outputs/phase-4/test-cases.md`                                            | ケース一覧         |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md`                               | 統合テスト設計     |
| テストファイル     | `packages/shared/src/services/logging/__tests__/conversion-logger.test.ts` | 実際のテストコード |

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] LogRepositoryのモック/スタブが作成されている
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] 境界値テストが含まれている
- [ ] **本Phase内の全スキルを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. tdd-principlesスキルの実行
3. test-doublesスキルの実行（モック設計）
4. boundary-value-analysisスキルの実行
5. ユニットテストの作成
6. 統合テストシナリオの設計
7. Red状態の確認
8. 成果物の作成・配置
9. 完了条件の検証

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/logging-service --phase 4
```

## スキルフィードバック記録

Phase完了後、以下を記録してください:

| スキル                  | 結果                        | 備考                        |
| ----------------------- | --------------------------- | --------------------------- |
| tdd-principles          | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |
| test-doubles            | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |
| boundary-value-analysis | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-

## 次のPhase

Phase 5: 実装（TDD: Green）
