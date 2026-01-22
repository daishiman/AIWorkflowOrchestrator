# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 9                              |
| Phase名    | 品質保証                       |
| 前提Phase  | Phase 8（リファクタリング）    |
| 後続Phase  | Phase 10（最終レビューゲート） |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | clean-architecture-refactoring |
| タスクID   | ARCH-001                       |

---

## 目的

静的解析・セキュリティ・性能の観点から品質を保証する。

## 背景

実装とリファクタリングが完了したため、コード品質の最終確認を行う。アーキテクチャ準拠率100%達成を確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 静的解析

**目的**: コード品質を静的解析ツールで確認する

**実行手順**:

1. TypeScript型チェックを実行する:

   ```bash
   pnpm --filter @repo/shared typecheck
   pnpm --filter @repo/desktop typecheck
   ```

   - [ ] 型エラーが0件であること

2. ESLintを実行する:

   ```bash
   pnpm --filter @repo/shared lint
   pnpm --filter @repo/desktop lint
   ```

   - [ ] Lintエラーが0件であること

3. Prettierフォーマットを確認する:

   ```bash
   pnpm --filter @repo/shared format:check
   pnpm --filter @repo/desktop format:check
   ```

   - [ ] フォーマット違反が0件であること

**期待される成果物**:

- 静的解析結果レポート

---

### タスク2: アーキテクチャ準拠率確認

**目的**: Clean Architecture準拠率100%を達成していることを確認する

**実行手順**:

1. アーキテクチャテストを実行する:

   ```bash
   pnpm --filter @repo/shared test:run --testPathPattern=architecture
   ```

   - [ ] 全テストがPASSすること

2. dependency-cruiserを実行する:

   ```bash
   pnpm depcruise --validate -- packages/shared/src
   ```

   - [ ] 違反が0件であること

3. 準拠チェックリストを確認する:

   **レイヤー分離**:
   - [ ] Domain層がInfrastructure層に依存していない
   - [ ] Domain層がApplication層に依存していない
   - [ ] Application層がInfrastructure層に依存していない
   - [ ] Domain層がDrizzle ORMに依存していない

   **配置**:
   - [ ] リポジトリインターフェースがDomain層に配置されている
   - [ ] リポジトリ実装がInfrastructure層に配置されている
   - [ ] Use CaseがApplication層に配置されている
   - [ ] マッパーがInfrastructure層に配置されている

   **設計原則**:
   - [ ] 各Use Caseが単一責務である
   - [ ] エンティティがビジネスロジックを持っている（Rich Domain Model）
   - [ ] 値オブジェクトが不変である
   - [ ] Result型で統一的にエラーハンドリングされている

4. 準拠率を計算する:
   - 上記チェック項目のうち、達成項目数 / 全項目数 × 100
   - 目標: 100%

**期待される成果物**:

- `outputs/phase-9/architecture-compliance-report.md` - アーキテクチャ準拠レポート

---

### タスク3: セキュリティ確認

**目的**: セキュリティ上の問題がないことを確認する

**実行手順**:

1. 依存パッケージの脆弱性スキャン:

   ```bash
   pnpm audit
   ```

   - [ ] 重大な脆弱性がないこと

2. コードレベルのセキュリティ確認:
   - [ ] SQLインジェクション対策（Drizzle ORMのパラメータバインディング）
   - [ ] XSS対策（ユーザー入力のサニタイズ）
   - [ ] 機密情報の露出がないこと

3. 入力バリデーション確認:
   - [ ] 値オブジェクトで入力が検証されている
   - [ ] Use Caseで業務ルールが検証されている

**期待される成果物**:

- `outputs/phase-9/security-check-report.md` - セキュリティチェックレポート

---

### タスク4: 性能確認

**目的**: 性能上の問題がないことを確認する

**実行手順**:

1. N+1クエリ問題の確認:
   - [ ] リポジトリ実装でN+1クエリが発生していないこと
   - [ ] 必要に応じてeager loadingが使用されていること

2. メモリ使用量の確認:
   - [ ] 大量データ処理時にメモリリークがないこと
   - [ ] 不要なオブジェクト参照が保持されていないこと

3. インデックス確認:
   - [ ] 頻繁に使用されるクエリにインデックスが設定されていること
   - [ ] 既存インデックス（FTS5等）が活用されていること

**期待される成果物**:

- `outputs/phase-9/performance-check-report.md` - 性能チェックレポート

---

### タスク5: テスト最終確認

**目的**: 全テストが成功することを最終確認する

**実行手順**:

1. 全テストスイートを実行する:

   ```bash
   pnpm --filter @repo/shared test:run
   pnpm --filter @repo/desktop test:run
   ```

2. カバレッジを確認する:

   ```bash
   pnpm --filter @repo/shared test:run --coverage
   ```

3. 結果を確認する:
   - [ ] 全ユニットテストがPASSする
   - [ ] 全統合テストがPASSする
   - [ ] 全アーキテクチャテストがPASSする
   - [ ] カバレッジ基準を満たしている

**期待される成果物**:

- テスト実行結果

---

### タスク6: 品質レポート作成

**目的**: 品質保証の結果を文書化する

**実行手順**:

1. 品質レポートを作成する:
   - 静的解析結果サマリー
   - アーキテクチャ準拠率
   - セキュリティチェック結果
   - 性能チェック結果
   - テスト結果サマリー

2. 受け入れ基準との照合:
   - Phase 1で定義した受け入れ基準を確認
   - 各基準の達成状況を記録

**期待される成果物**:

- `outputs/phase-9/quality-assurance-report.md` - 品質保証レポート

---

## 参照資料

| 参照資料      | パス                                     | 内容                 |
| ------------- | ---------------------------------------- | -------------------- |
| Phase 1成果物 | `outputs/phase-1/acceptance-criteria.md` | 受け入れ基準         |
| Phase 8成果物 | `outputs/phase-8/refactoring-report.md`  | リファクタリング内容 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                        | 内容             |
| ---------------- | --------------------------------------------------------------------------- | ---------------- |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準         |
| セキュリティ要件 | `.claude/skills/aiworkflow-requirements/references/security-principles.md`  | セキュリティ原則 |

---

## 成果物

| 成果物                       | パス                                                | 内容                 |
| ---------------------------- | --------------------------------------------------- | -------------------- |
| アーキテクチャ準拠レポート   | `outputs/phase-9/architecture-compliance-report.md` | 準拠率・チェック結果 |
| セキュリティチェックレポート | `outputs/phase-9/security-check-report.md`          | セキュリティ確認結果 |
| 性能チェックレポート         | `outputs/phase-9/performance-check-report.md`       | 性能確認結果         |
| 品質保証レポート             | `outputs/phase-9/quality-assurance-report.md`       | 総合品質レポート     |

---

## 統合テスト連携

品質保証でアーキテクチャ準拠率100%を確認すること:

- 全アーキテクチャテストがPASSすること
- dependency-cruiser違反が0件であること
- 全チェックリスト項目が達成されていること

---

## 品質ゲート

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] 全E2Eテスト成功

#### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] Line Coverage ≥80%
- [ ] Branch Coverage ≥60%
- [ ] Function Coverage ≥80%

#### セキュリティ

- [ ] 脆弱性スキャン完了
- [ ] 重大な脆弱性なし

#### アーキテクチャ

- [ ] Clean Architecture準拠率100%

---

## 完了条件

- [ ] 型エラーが0件である
- [ ] Lintエラーが0件である
- [ ] フォーマット違反が0件である
- [ ] アーキテクチャ準拠率100%を達成している
- [ ] 重大なセキュリティ脆弱性がない
- [ ] 性能上の問題がない
- [ ] 全テストがPASSしている
- [ ] 品質保証レポートが作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 9ステータスを更新

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/clean-architecture-refactoring/phase-10-final-review.md`
