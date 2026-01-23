# Phase 9: 品質確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 9                                      |
| Phase名    | 品質確認                               |
| 前提Phase  | Phase 8                                |
| 後続Phase  | Phase 10                               |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-22                             |
| 機能名     | システムプロンプトのデータベース永続化 |

---

## 目的

静的解析・型チェック・Lint・セキュリティスキャンによりコード品質を確認し、問題があれば修正する。

## 背景

コードの品質を定量的に確認し、プロジェクトの品質基準を満たすことを保証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: TypeScript型チェック

**目的**: 型エラーがないことを確認する

**実行手順**:

1. sharedパッケージの型チェックを実行する
   ```bash
   pnpm --filter @repo/shared typecheck
   ```
2. desktopパッケージの型チェックを実行する
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
3. 型エラーがあれば修正する
4. 成果物を `outputs/phase-9/typecheck-result.md` に出力する

**期待される成果物**:

- `outputs/phase-9/typecheck-result.md`

---

### タスク2: ESLint実行

**目的**: Lintエラー・警告がないことを確認する

**実行手順**:

1. sharedパッケージのLintを実行する
   ```bash
   pnpm --filter @repo/shared lint
   ```
2. desktopパッケージのLintを実行する
   ```bash
   pnpm --filter @repo/desktop lint
   ```
3. エラー・警告があれば修正する
4. 成果物を `outputs/phase-9/lint-result.md` に出力する

**期待される成果物**:

- `outputs/phase-9/lint-result.md`

---

### タスク3: Prettier実行

**目的**: コードフォーマットが統一されていることを確認する

**実行手順**:

1. フォーマットチェックを実行する
   ```bash
   pnpm prettier --check "packages/shared/src/**/*.ts"
   pnpm prettier --check "apps/desktop/src/**/*.ts"
   ```
2. 差分があれば修正する
   ```bash
   pnpm prettier --write "packages/shared/src/**/*.ts"
   pnpm prettier --write "apps/desktop/src/**/*.ts"
   ```
3. 成果物を `outputs/phase-9/format-result.md` に出力する

**期待される成果物**:

- `outputs/phase-9/format-result.md`

---

### タスク4: セキュリティスキャン

**目的**: セキュリティ上の問題がないことを確認する

**実行手順**:

1. 依存パッケージの脆弱性チェックを実行する
   ```bash
   pnpm audit
   ```
2. コードのセキュリティパターンを確認する
   - SQLインジェクション対策
   - XSS対策
   - 認可チェックの漏れ
3. 問題があれば修正する
4. 成果物を `outputs/phase-9/security-scan-result.md` に出力する

**期待される成果物**:

- `outputs/phase-9/security-scan-result.md`

---

### タスク5: 品質メトリクス確認

**目的**: コード品質メトリクスを確認する

**実行手順**:

1. 複雑度を確認する
   - 循環的複雑度が10以下であること
   - 関数の行数が50行以下であること
2. 依存関係を確認する
   - 循環依存がないこと
   - 依存の方向が適切であること
3. コメント・ドキュメントを確認する
   - 公開APIにJSDocがあること
   - 複雑なロジックにコメントがあること
4. 成果物を `outputs/phase-9/quality-metrics.md` に出力する

**期待される成果物**:

- `outputs/phase-9/quality-metrics.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容     |
| -------- | --------------------------------------------------------------------------- | -------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準 |

### 前Phaseの成果物

| 参照資料             | パス                                             | 内容      |
| -------------------- | ------------------------------------------------ | --------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`             | 変更内容  |
| テスト結果           | `outputs/phase-8/test-results-after-refactor.md` | Green確認 |

---

## 成果物

| 成果物           | パス                                      | 内容             |
| ---------------- | ----------------------------------------- | ---------------- |
| 型チェック結果   | `outputs/phase-9/typecheck-result.md`     | TypeScript検証   |
| Lint結果         | `outputs/phase-9/lint-result.md`          | ESLint検証       |
| フォーマット結果 | `outputs/phase-9/format-result.md`        | Prettier検証     |
| セキュリティ結果 | `outputs/phase-9/security-scan-result.md` | セキュリティ検証 |
| 品質メトリクス   | `outputs/phase-9/quality-metrics.md`      | 品質指標         |

---

## 統合テスト連携（Phase 1〜11は必須）

本Phaseでは以下の統合テスト連携アクションを実施すること：

- 品質チェック後の統合テスト再実行
- セキュリティスキャン結果の確認

---

## 完了条件

- [ ] TypeScript型チェックがパスする
- [ ] ESLintエラー・警告がない
- [ ] Prettierフォーマットが統一されている
- [ ] セキュリティスキャンで問題がない
- [ ] 品質メトリクスが基準を満たしている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 品質基準

### 静的解析

| 指標             | 基準              | 達成状況 |
| ---------------- | ----------------- | -------- |
| TypeScriptエラー | 0件               | 未確認   |
| ESLintエラー     | 0件               | 未確認   |
| ESLint警告       | 0件（新規コード） | 未確認   |
| Prettier差分     | 0件               | 未確認   |

### セキュリティ

| 指標                | 基準     | 達成状況 |
| ------------------- | -------- | -------- |
| 高脆弱性            | 0件      | 未確認   |
| 中脆弱性            | 0件      | 未確認   |
| SQLインジェクション | 対策済み | 未確認   |
| 認可チェック        | 実装済み | 未確認   |

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/system-prompt-db/phase-10-final-review.md`
