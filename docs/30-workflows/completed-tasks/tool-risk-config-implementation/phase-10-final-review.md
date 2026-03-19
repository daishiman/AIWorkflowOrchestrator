# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 10                              |
| Phase名    | 最終レビューゲート              |
| タスクID   | UT-06-001                       |
| 前提Phase  | Phase 1〜9（全Phase）           |
| 後続Phase  | Phase 11（手動テスト）          |
| ステータス | 未実施                          |
| 作成日     | 2026-03-16                      |
| 機能名     | tool-risk-config-implementation |

---

## 目的

Phase 1〜9 の全成果物を統合的にレビューし、Issue #1251 の受入基準12項目が全て充足されているかを検証する。PASS / MINOR / MAJOR / CRITICAL を判定し、Phase 11（手動テスト）へ進行する可否を決定する。特にセキュリティ不変条件と後続タスク（UT-06-004: PermissionDialog）へのインターフェース整合性を最終確認する。

## 背景

Phase 1 で定義した受入基準12項目と Phase 2 で設計した `TOOL_RISK_CONFIG` 定数・`RiskLevel` 型・`ToolRiskConfigEntry` インターフェースに対し、Phase 5 での実装、Phase 6-7 でのテスト拡充・カバレッジ確認、Phase 8 でのリファクタリング、Phase 9 での品質検証が完了した。本 Phase は acceptance criteria と blocker の final review を行い、Phase 11（手動テスト）への進行可否を最終判定する。

---

## 実行タスク

### タスク1: 受入基準12項目の最終判定

**目的**: Issue #1251 の受入基準12項目を全て確認し、充足状況を判定する。

**実行手順**:

1. 以下の判定テーブルを埋める:

   | #   | 受入基準                                                          | 検証方法        | 判定 | 証跡・備考                 |
   | --- | ----------------------------------------------------------------- | --------------- | ---- | -------------------------- |
   | 1   | `TOOL_RISK_CONFIG` が `Record<RiskLevel, ToolRiskConfigEntry>` 型 | コードレビュー  | -    | security.ts の型注釈確認   |
   | 2   | `RiskLevel` 型（`"low" \| "medium" \| "high"`）が export          | コードレビュー  | -    | named export 確認          |
   | 3   | `ToolRiskConfigEntry` interface が export                         | コードレビュー  | -    | named export 確認          |
   | 4   | dialogWidth: low=400 / medium=480 / high=640                      | テスト結果      | -    | security.test.ts PASS      |
   | 5   | headerColorToken: `--risk-low` / `--risk-medium` / `--risk-high`  | テスト結果      | -    | security.test.ts PASS      |
   | 6   | `allowPermanent`: high のみ false                                 | テスト結果      | -    | セキュリティ不変条件テスト |
   | 7   | `allowTime24h` / `allowTime7d`: high のみ false                   | テスト結果      | -    | セキュリティ不変条件テスト |
   | 8   | JSDoc コメント付与                                                | コードレビュー  | -    | Phase 8 成果物確認         |
   | 9   | `pnpm --filter @repo/shared build` 成功                           | Phase 9 QA 結果 | -    | qa-checklist.md 確認       |
   | 10  | `security.test.ts` にテスト追加                                   | コードレビュー  | -    | テストファイル存在確認     |
   | 11  | 全テスト PASS                                                     | Phase 9 QA 結果 | -    | qa-checklist.md 確認       |
   | 12  | TypeScript / ESLint エラー 0 件                                   | Phase 9 QA 結果 | -    | qa-checklist.md 確認       |

2. 各項目の判定は「充足」「不充足」「未確認」のいずれかで記録する

3. 不充足・未確認項目がある場合はレビュー判定に反映する

**期待される成果物**:

- `outputs/phase-10/acceptance-criteria-result.md`（受入基準12項目の判定結果）

---

### タスク2: セキュリティ不変条件の最終確認

**目的**: セキュリティ不変条件がコード・テスト・ドキュメントの全レイヤーで保持されているかを確認する。

**実行手順**:

1. コードレビュー（`packages/shared/src/constants/security.ts`）:
   - `TOOL_RISK_CONFIG.high.allowPermanent === false` であることを目視確認
   - `TOOL_RISK_CONFIG.high.allowTime24h === false` であることを目視確認
   - `TOOL_RISK_CONFIG.high.allowTime7d === false` であることを目視確認

2. テスト確認（`packages/shared/src/constants/security.test.ts`）:
   - セキュリティ不変条件を検証するテストケースが存在することを確認
   - 各テストケースが PASS していることを Phase 9 結果から確認

3. JSDoc 確認（Phase 8 成果物）:
   - `TOOL_RISK_CONFIG` の JSDoc `@remarks` にセキュリティ不変条件の説明が含まれていることを確認

4. `.claude/rules/04-electron-security.md` の「フェイルセキュア」原則との整合性を確認:
   - high リスクで全許可オプションが false であることは「障害時は安全側に倒す」原則と整合するか

   | セキュリティ原則 | 対応状況                       | 判定 |
   | ---------------- | ------------------------------ | ---- |
   | 最小権限         | high では許可オプションを禁止  | -    |
   | フェイルセキュア | 不明なリスクは high 扱いを推奨 | -    |
   | 完全仲介         | TOOL_RISK_CONFIG で一元管理    | -    |

**期待される成果物**:

- `outputs/phase-10/security-invariant-check.md`（セキュリティ不変条件の最終確認結果）

---

### タスク3: 後続タスクインターフェース検証

**目的**: 後続タスク（UT-06-004: PermissionDialog コンポーネント実装）が `TOOL_RISK_CONFIG` を問題なく使用できるインターフェースが整備されているかを確認する。

**実行手順**:

1. エクスポート確認:
   - `packages/shared/src/constants/security.ts` から `RiskLevel`・`ToolRiskConfigEntry`・`TOOL_RISK_CONFIG` が named export されていることを確認
   - `packages/shared/src/index.ts` または `packages/shared/src/constants/index.ts` で re-export されていることを確認（後続タスクが `@repo/shared` から直接 import できること）

2. 型互換性確認:
   - `RiskLevel` が `"low" | "medium" | "high"` の literal union type であることを確認
   - `ToolRiskConfigEntry` の全5フィールドが必須（optional でない）であることを確認
   - `TOOL_RISK_CONFIG` が全3エントリ（low/medium/high）を持つことを確認

3. UT-06-004 の使用想定コードが型安全に動作するかをコードレビューで確認:

   ```typescript
   // 後続タスクの使用想定コード（UT-06-004）
   import {
     TOOL_RISK_CONFIG,
     RiskLevel,
     ToolRiskConfigEntry,
   } from "@repo/shared";

   const config: ToolRiskConfigEntry = TOOL_RISK_CONFIG[riskLevel]; // riskLevel: RiskLevel
   const width: 400 | 480 | 640 = config.dialogWidth;
   const showPermanent: boolean = config.allowPermanent;
   ```

   上記のコードが TypeScript エラーなく動作する状態であることを確認する。

**期待される成果物**:

- `outputs/phase-10/interface-compatibility-check.md`（インターフェース互換性確認結果）

---

### タスク4: レビュー判定

**目的**: タスク1〜3の結果を総合し、最終判定（PASS/MINOR/MAJOR/CRITICAL）を下す。

**実行手順**:

1. 判定基準:

   | 判定     | 条件                                                                                   | 次のアクション                       |
   | -------- | -------------------------------------------------------------------------------------- | ------------------------------------ |
   | PASS     | 受入基準12項目が全て「充足」、セキュリティ不変条件が全レイヤーで確認済み               | Phase 11 へ進行                      |
   | MINOR    | 軽微な問題あり（JSDoc 補足、テスト記述改善、コメント追加）。機能・安全性に影響なし     | MINOR 追跡テーブル作成後 Phase 11 へ |
   | MAJOR    | 受入基準の未充足あり、またはセキュリティ不変条件の違反                                 | 影響範囲に応じて Phase 1〜8 へ戻る   |
   | CRITICAL | セキュリティ不変条件の重大違反（high.allowPermanent/allowTime24h/allowTime7d が true） | Phase 1 へ戻り要件再確認             |

2. MINOR 判定の場合、追跡テーブルを作成する:

   | MINOR ID  | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
   | --------- | -------- | ------------- | ------------- | ---- |
   | TECH-M-01 | ...      | Phase 12      | Phase 12      | ...  |

3. 判定結果と理由を `outputs/phase-10/final-review-report.md` に記録する

**期待される成果物**:

- `outputs/phase-10/final-review-report.md`（最終判定結果・理由・次のアクション）

---

## 実行手順

### ステップ1: 受入基準12項目の最終判定

タスク1 に従い、Issue #1251 の受入基準12項目を全て確認し、「充足」「不充足」「未確認」のいずれかで判定する。判定結果を `outputs/phase-10/acceptance-criteria-result.md` に記録する。

### ステップ2: セキュリティ不変条件・インターフェース互換性の確認

タスク2・タスク3 に従い、セキュリティ不変条件がコード・テスト・JSDoc の全レイヤーで保持されていることを確認する。後続タスク（UT-06-004）が `TOOL_RISK_CONFIG` を型安全に使用できるインターフェースが整備されていることを確認する。

### ステップ3: レビュー判定と報告書作成

タスク4 に従い、ステップ1・2 の結果を総合して PASS/MINOR/MAJOR/CRITICAL を判定する。判定結果・理由・次のアクションを `outputs/phase-10/final-review-report.md` に記録する。

---

## 参照資料

| 参照資料                | パス                                             | 内容                                |
| ----------------------- | ------------------------------------------------ | ----------------------------------- |
| Phase 1（要件定義）     | `phase-1-requirements.md`                        | 確定した受入基準12項目              |
| Phase 2（設計）         | `phase-2-design.md`                              | 型定義・定数値・テスト設計          |
| Phase 3（設計レビュー） | `phase-3-design-review.md`                       | 設計レビュー時の MINOR 追跡テーブル |
| Phase 8（リファクタ）   | `phase-8-refactoring.md`                         | JSDoc 整備結果                      |
| Phase 9（品質検証）     | `phase-9-quality-assurance.md`                   | QA チェックリスト（4項目の合否）    |
| 実装対象ファイル        | `packages/shared/src/constants/security.ts`      | 最終コードレビュー対象              |
| テストファイル          | `packages/shared/src/constants/security.test.ts` | テストケース最終確認対象            |
| Phase 9 QA 結果         | `outputs/phase-9/qa-checklist.md`                | 品質ゲート4項目の実行結果           |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                       | 内容                                                     |
| -------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------- |
| セキュリティ原則     | `.claude/skills/aiworkflow-requirements/references/security-principles.md` | セキュリティ設計原則（不変条件の最終確認根拠）           |
| インターフェース定義 | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md`     | 共有型定義の設計方針（エクスポート互換性の検証根拠）     |
| タスク台帳           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`       | 残課題・完了タスク記録（Issue #1251 の受入基準との照合） |

---

## レビューゲート

### レビュー結果判定

| 判定     | 条件                                                         | 次のアクション                              |
| -------- | ------------------------------------------------------------ | ------------------------------------------- |
| PASS     | 受入基準12項目が全て充足、セキュリティ不変条件が全て確認済み | Phase 11 へ進行                             |
| MINOR    | 軽微な指摘あり、機能・安全性に影響なし                       | 全 MINOR を追跡テーブルに記録後 Phase 11 へ |
| MAJOR    | 受入基準の未充足、またはセキュリティ不変条件の違反           | 影響範囲に応じて戻る                        |
| CRITICAL | セキュリティ不変条件の重大違反                               | Phase 1 へ戻り要件再確認                    |

### 戻り先決定基準

| 問題の種類                      | 戻り先                      |
| ------------------------------- | --------------------------- |
| 受入基準の解釈誤り              | Phase 1（要件定義）         |
| 型定義・定数値の設計誤り        | Phase 2（設計）             |
| テスト設計の不備                | Phase 4（テスト作成）       |
| 実装コードの誤り                | Phase 5（実装）             |
| テストケースの不足              | Phase 6（テスト拡充）       |
| JSDoc・命名の品質問題           | Phase 8（リファクタリング） |
| Lint / TypeCheck / ビルドエラー | Phase 8 または Phase 5      |

---

## 統合テスト連携

- Phase 10 PASS により、後続タスク（UT-06-004: PermissionDialog）が `TOOL_RISK_CONFIG` を安全に使用できることが保証される
- MINOR 追跡テーブルの項目は Phase 12（ドキュメント）で未タスクとして管理し、UT-06-004 完了後に解決する

---

## 成果物

| 成果物                       | パス                                                | 内容                             |
| ---------------------------- | --------------------------------------------------- | -------------------------------- |
| 受入基準12項目の判定結果     | `outputs/phase-10/acceptance-criteria-result.md`    | 全12項目の充足/不充足と証跡      |
| セキュリティ不変条件確認結果 | `outputs/phase-10/security-invariant-check.md`      | 不変条件3項目の全レイヤー確認    |
| インターフェース互換性確認   | `outputs/phase-10/interface-compatibility-check.md` | UT-06-004 使用想定の型安全性確認 |
| 最終レビュー報告             | `outputs/phase-10/final-review-report.md`           | 最終判定・理由・次のアクション   |

---

## 完了条件

- [ ] 受入基準12項目の判定テーブルが埋まっており、全て「充足」である
- [ ] セキュリティ不変条件（high.allowPermanent/allowTime24h/allowTime7d === false）がコード・テスト・JSDoc で全て確認されている
- [ ] `@repo/shared` から `RiskLevel`・`ToolRiskConfigEntry`・`TOOL_RISK_CONFIG` が import 可能であることが確認されている
- [ ] レビュー判定（PASS/MINOR/MAJOR/CRITICAL）が `final-review-report.md` に記録されている
- [ ] MINOR 判定の場合、MINOR 追跡テーブルが作成されている
- [ ] MAJOR/CRITICAL 判定の場合、戻り先 Phase が明記されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（4ファイル）が全て生成されていることを確認

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 10 実行記録

### 実行タスク

- タスク1（受入基準12項目の最終判定）: （結果を記録）
- タスク2（セキュリティ不変条件の最終確認）: （結果を記録）
- タスク3（後続タスクインターフェース検証）: （結果を記録）
- タスク4（レビュー判定）: （結果を記録）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 依存関係

- **前提**: Phase 9（品質検証）が完了し、品質ゲート4項目が全て「合」であること
- **後続**: Phase 11（手動テスト）へ進む（PASS/MINOR の場合）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/tool-risk-config-implementation/phase-11-manual-test.md`
