# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Phase      | 9                                                                                              |
| Phase名    | 品質検証                                                                                       |
| タスクID   | UT-06-001                                                                                      |
| 前提Phase  | Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング） |
| 後続Phase  | Phase 10（最終レビュー）                                                                       |
| ステータス | 未実施                                                                                         |
| 作成日     | 2026-03-16                                                                                     |
| 機能名     | tool-risk-config-implementation                                                                |

---

## 目的

Lint・TypeScript 型チェック・全テスト実行・ビルド確認を一括実施し、Issue #1251 受入基準のうち自動検証可能な項目（#9 ビルド成功 / #11 全テスト PASS / #12 TypeScript/ESLint エラー 0 件）を充足することを確認する。Phase 8 リファクタリング後の品質状態を定量的に記録する。

## 背景

Phase 5 で実装し、Phase 6-7 でテスト拡充・カバレッジ確認、Phase 8 でリファクタリングを完了した `packages/shared/src/constants/security.ts` の品質を一括検証する。本 Phase は validator と quality gate の一括判定を行い、Phase 10（最終レビュー）への進行可否を決定するゲートである。

---

## 実行タスク

### タスク1: ESLint 検証

**目的**: 受入基準 #12「ESLint エラー 0 件」を確認する。

**実行手順**:

1. 以下のコマンドを実行する:

   ```bash
   pnpm --filter @repo/shared lint
   ```

2. 終了コードが 0 であることを確認する

3. エラーが出力された場合:
   - エラー箇所を特定し、Phase 8 のリファクタリングに起因するものかを判定する
   - 自動修正可能なエラーは `pnpm --filter @repo/shared lint --fix` で修正する
   - 自動修正不可能なエラーは Phase 8 に戻り、コードを修正する（Phase 8 → Phase 9 の再実行）

4. ESLint 結果を記録する:

   ```
   実行日時: YYYY-MM-DD HH:mm
   コマンド: pnpm --filter @repo/shared lint
   終了コード: 0
   警告件数: 0
   エラー件数: 0
   ```

**期待される成果物**:

- ESLint 実行結果（`outputs/phase-9/qa-checklist.md` に記録）

---

### タスク2: TypeScript 型チェック

**目的**: 受入基準 #12「TypeScript エラー 0 件」を確認する。

**実行手順**:

1. 以下のコマンドを実行する:

   ```bash
   pnpm --filter @repo/shared typecheck
   ```

2. 終了コードが 0 であることを確認する

3. エラーが出力された場合:
   - エラーメッセージを記録する
   - `RiskLevel` / `ToolRiskConfigEntry` / `TOOL_RISK_CONFIG` に関連するエラーは Phase 5 実装の問題として Phase 5 に戻る
   - Phase 8 リファクタリングに起因するエラーは Phase 8 に戻る

4. TypeScript 型チェック結果を記録する:

   ```
   実行日時: YYYY-MM-DD HH:mm
   コマンド: pnpm --filter @repo/shared typecheck
   終了コード: 0
   エラー件数: 0
   ```

**特に確認すべき型エラーパターン**:

| パターン                                                  | 原因箇所              | 対処法                         |
| --------------------------------------------------------- | --------------------- | ------------------------------ |
| `Type '"critical"' is not assignable to type 'RiskLevel'` | security.ts の型定義  | RiskLevel の値を確認           |
| `Property 'allowTime7d' is missing`                       | TOOL_RISK_CONFIG の値 | 全エントリの全フィールドを確認 |
| `Cannot find name 'RiskLevel'`                            | export 漏れ           | エクスポート設定を確認         |

**期待される成果物**:

- TypeScript 型チェック結果（`outputs/phase-9/qa-checklist.md` に記録）

---

### タスク3: 全テスト実行

**目的**: 受入基準 #11「全テスト PASS」を確認する。

**実行手順**:

1. 以下のコマンドを実行する:

   ```bash
   pnpm --filter @repo/shared test
   ```

2. テスト結果の全体サマリーを確認する:
   - PASS: 全テスト通過
   - FAIL: 失敗テストの特定と原因分析

3. `security.test.ts` のテストケースが全て PASS していることを確認する

4. 失敗テストがある場合:
   - テストケース名・失敗内容を記録する
   - Phase 5（実装）のコードに問題がある場合は Phase 5 に戻る
   - Phase 8（リファクタリング）での命名変更に起因する場合は Phase 8 に戻る

5. テスト実行結果を記録する:

   ```
   実行日時: YYYY-MM-DD HH:mm
   コマンド: pnpm --filter @repo/shared test
   終了コード: 0
   テスト総数: N
   PASS: N
   FAIL: 0
   ```

6. `security.test.ts` の個別テストケース PASS/FAIL を記録する:

   | テストケース名                                                     | 結果 |
   | ------------------------------------------------------------------ | ---- |
   | TOOL_RISK_CONFIG が Record<RiskLevel, ...> 型である                | -    |
   | low の dialogWidth が 400 である                                   | -    |
   | medium の dialogWidth が 480 である                                | -    |
   | high の dialogWidth が 640 である                                  | -    |
   | high.allowPermanent === false                                      | -    |
   | high.allowTime24h === false                                        | -    |
   | high.allowTime7d === false                                         | -    |
   | headerColorToken が `--risk-` プレフィックスを持つ                 | -    |
   | 全 RiskLevel キーが TOOL_RISK_CONFIG に存在する                    | -    |
   | 各エントリは ToolRiskConfigEntry の全フィールドを持つ              | -    |
   | dialogWidth は 400 / 480 / 640 のいずれかである                    | -    |
   | headerColorToken は `--risk-low` / `--risk-medium` / `--risk-high` | -    |
   | RiskLevel 型でインデックスアクセスした結果は undefined でない      | -    |
   | dialogWidth は数値型である                                         | -    |
   | headerColorToken は文字列型である                                  | -    |

**期待される成果物**:

- テスト実行結果（`outputs/phase-9/qa-checklist.md` に記録）

---

### タスク4: ビルド確認

**目的**: 受入基準 #9「`pnpm --filter @repo/shared build` 成功」を確認する。

**実行手順**:

1. 以下のコマンドを実行する:

   ```bash
   pnpm --filter @repo/shared build
   ```

2. 終了コードが 0 であることを確認する

3. ビルド成果物（`packages/shared/dist/`）に以下が含まれることを確認する:
   - `constants/security.js`（または該当するバンドルファイル）
   - エクスポートに `TOOL_RISK_CONFIG`、`RiskLevel`、`ToolRiskConfigEntry` が含まれること

4. ビルドエラーが出力された場合:
   - `tsconfig.json` の設定と実装コードの整合性を確認する
   - エラー原因を特定し、Phase 5 または Phase 8 に戻る

5. ビルド実行結果を記録する:

   ```
   実行日時: YYYY-MM-DD HH:mm
   コマンド: pnpm --filter @repo/shared build
   終了コード: 0
   ```

**期待される成果物**:

- ビルド実行結果（`outputs/phase-9/qa-checklist.md` に記録）

---

## 実行手順

### ステップ1: ESLint・TypeScript 型チェックの実行

タスク1・タスク2 に従い、`pnpm --filter @repo/shared lint` と `pnpm --filter @repo/shared typecheck` を実行する。終了コードが 0 であることを確認し、エラーがある場合は Phase 8 または Phase 5 に戻る。

### ステップ2: 全テスト実行と個別テストケース確認

タスク3 に従い、`pnpm --filter @repo/shared test` を実行する。`security.test.ts` の全テストケースが PASS していることを個別に確認し、結果を記録する。

### ステップ3: ビルド確認と品質ゲート判定

タスク4 に従い、`pnpm --filter @repo/shared build` を実行する。終了コードが 0 であることを確認し、品質ゲート4項目の合否を `outputs/phase-9/qa-checklist.md` に記録する。

---

## 参照資料

| 参照資料              | パス                                             | 内容                   |
| --------------------- | ------------------------------------------------ | ---------------------- |
| Phase 5（実装）       | `phase-5-implementation.md`                      | 実装済みコード確認     |
| Phase 8（リファクタ） | `phase-8-refactoring.md`                         | リファクタ変更内容確認 |
| 実装対象ファイル      | `packages/shared/src/constants/security.ts`      | 品質検証対象           |
| テストファイル        | `packages/shared/src/constants/security.test.ts` | テスト実行対象         |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                          | 内容                                           |
| ---------------- | ----------------------------------------------------------------------------- | ---------------------------------------------- |
| セキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/security-principles.md`    | セキュリティ設計原則                           |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | 品質基準定義                                   |
| 開発ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | コード品質基準（Lint・型チェック・テスト基準） |

---

## 品質ゲート

Issue #1251 の自動検証可能な受入基準に対する合否判定:

| 受入基準 # | 内容                                    | 検証コマンド                           | 合否 |
| ---------- | --------------------------------------- | -------------------------------------- | ---- |
| #9         | `pnpm --filter @repo/shared build` 成功 | `pnpm --filter @repo/shared build`     | -    |
| #11        | 全テスト PASS                           | `pnpm --filter @repo/shared test`      | -    |
| #12        | TypeScript エラー 0 件                  | `pnpm --filter @repo/shared typecheck` | -    |
| #12        | ESLint エラー 0 件                      | `pnpm --filter @repo/shared lint`      | -    |

**全項目が「合」であることが Phase 10 進行の必須条件。1項目でも「否」がある場合は該当 Phase に戻って修正する。**

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功（`pnpm --filter @repo/shared test`）
- [ ] 全統合テスト成功（`security.test.ts` の個別テストケース全 PASS）
- [ ] 全E2Eテスト成功（本タスクはE2E対象外のため、ビルド成功で代替確認）

#### コード品質

- [ ] Lintエラーなし（`pnpm --filter @repo/shared lint` 終了コード 0）
- [ ] 型エラーなし（`pnpm --filter @repo/shared typecheck` 終了コード 0）
- [ ] コードフォーマット適用済み（Prettier による自動フォーマット確認済み）

#### テスト網羅性

- [ ] 総合カバレッジ指数180%+達成（Line 80%+ Branch 60%+ Function 80%+ の合算で180%以上）

#### セキュリティ

- [ ] 脆弱性スキャン完了（セキュリティ不変条件テストの PASS で確認）
- [ ] 重大な脆弱性なし（high リスクの許可オプションが全て false であることがテストで検証済み）

---

## 統合テスト連携

- `@repo/shared` のビルドが成功することで、後続タスク（UT-06-004: PermissionDialog）が `TOOL_RISK_CONFIG` を import できる状態になる
- 型エラーが 0 件であることにより、後続タスクが型安全に `RiskLevel` / `ToolRiskConfigEntry` を使用できることが保証される

---

## 成果物

| 成果物            | パス                              | 内容                                          |
| ----------------- | --------------------------------- | --------------------------------------------- |
| QA チェックリスト | `outputs/phase-9/qa-checklist.md` | 品質ゲート4項目の実行結果と合否判定を記録する |

---

## 完了条件

- [ ] `pnpm --filter @repo/shared lint` の終了コードが 0（ESLint エラー 0 件）
- [ ] `pnpm --filter @repo/shared typecheck` の終了コードが 0（TypeScript エラー 0 件）
- [ ] `pnpm --filter @repo/shared test` の終了コードが 0（全テスト PASS）
- [ ] `security.test.ts` の個別テストケースが全て PASS している
- [ ] `pnpm --filter @repo/shared build` の終了コードが 0（ビルド成功）
- [ ] 品質ゲート4項目が全て「合」として `qa-checklist.md` に記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 品質ゲート4項目が全て「合」であることを確認

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 9 実行記録

### 実行タスク

- タスク1（ESLint 検証）: （結果を記録）
- タスク2（TypeScript 型チェック）: （結果を記録）
- タスク3（全テスト実行）: （結果を記録）
- タスク4（ビルド確認）: （結果を記録）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビュー）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/tool-risk-config-implementation/phase-10-final-review.md`
