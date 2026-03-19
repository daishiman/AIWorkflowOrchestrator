# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| Phase        | 11                              |
| Phase名      | 手動テスト                      |
| タスクID     | UT-06-001                       |
| 前提Phase    | Phase 10（最終レビュー）        |
| 後続Phase    | Phase 12（ドキュメント）        |
| ステータス   | 未実施                          |
| 作成日       | 2026-03-16                      |
| 機能名       | tool-risk-config-implementation |
| GitHub Issue | #1251                           |

---

## タスク種別判定

| タスク種別           | 判定条件                                   | 判定結果 |
| -------------------- | ------------------------------------------ | -------- |
| **設計タスク**       | タスク種別が「設計・仕様策定」、UI実装なし | -        |
| **docs-only タスク** | UI変更なし、ドキュメント・設定変更のみ     | **該当** |
| **UI タスク**        | Renderer コンポーネントの追加・変更あり    | -        |

本タスクは `packages/shared` への定数追加のみであり、Renderer コンポーネントの変更を含まないため **docs-only タスク** と判定する。

---

## 目的

`packages/shared/src/constants/security.ts` に追加した `RiskLevel` 型・`ToolRiskConfigEntry` interface・`TOOL_RISK_CONFIG` 定数が、ビルド・型チェック・テスト・import の全観点で正常に機能することをコマンドで確認する。UIコンポーネントの変更はないため、スクリーンショット取得は不要（NON_VISUAL判定）。

---

## 背景

Phase 10（最終レビュー）が PASS 判定で完了し、実装品質が確認されている。本 Phase では、ビルド・テスト・型チェック・import の4観点でコマンドベースの手動確認を行い、後続 Phase 12 へ進む前の最終ゲートとする。

---

## NON_VISUAL 判定記録

| 状況                         | 対応方法                                    |
| ---------------------------- | ------------------------------------------- |
| UIコンポーネントが存在しない | `NON_VISUAL` 判定。スクリーンショット省略可 |
| 型定義・定数追加のみの変更   | `NON_VISUAL` 判定。コマンドベース検証で代替 |

本タスクは `packages/shared/src/constants/security.ts` への型・定数追加のみであり、UI実装を含まない。スクリーンショットは不要とする。

---

## docs-only task 確認項目

- [ ] `SKILL.md` から family file へ辿れるか
- [ ] `LOGS.md` から archive へ辿れるか
- [ ] `.claude` と `.agents` の file set が一致するか
- [ ] validator command を再実行できるか

---

## 実行タスク

### タスク1: ビルド確認

**目的**: `@repo/shared` パッケージが新規エクスポートを含めてビルドを完了することを確認する。

**実行手順**:

1. 次のコマンドをワークツリールートから実行する:

   ```bash
   pnpm --filter @repo/shared build
   ```

2. 終了コードが `0` であることを確認する
3. `dist/` 以下に `security.js` / `security.d.ts` が出力されていることを確認する
4. 確認結果を `outputs/phase-11/manual-test-result.md` に記録する

**期待結果**: ビルドが 0 エラーで完了する

---

### タスク2: 単体テスト確認

**目的**: `security.test.ts` の全テストケースが PASS することを確認する。

**実行手順**:

1. 次のコマンドをワークツリールートから実行する:

   ```bash
   pnpm --filter @repo/shared exec vitest run src/constants/security.test.ts
   ```

2. 全テストケースが PASS することを確認する
3. テスト件数・カバレッジ（Line 80%以上・Branch 60%以上・Function 80%以上）を記録する
4. 確認結果を `outputs/phase-11/manual-test-result.md` に追記する

**期待結果**: 全テストケースが PASS する

---

### タスク3: TypeScript 型チェック確認

**目的**: `@repo/shared` パッケージ全体の型チェックが通ることを確認する。

**実行手順**:

1. 次のコマンドをワークツリールートから実行する:

   ```bash
   pnpm --filter @repo/shared exec tsc --noEmit
   ```

2. TypeScript エラーが 0 件であることを確認する
3. 確認結果を `outputs/phase-11/manual-test-result.md` に追記する

**期待結果**: TypeScript エラー 0 件

---

### タスク4: ESLint チェック確認

**目的**: `security.ts` に ESLint エラーがないことを確認する。

**実行手順**:

1. 次のコマンドをワークツリールートから実行する:

   ```bash
   pnpm --filter @repo/shared exec eslint src/constants/security.ts
   ```

2. ESLint エラーが 0 件であることを確認する
3. 確認結果を `outputs/phase-11/manual-test-result.md` に追記する

**期待結果**: ESLint エラー 0 件

---

### タスク5: import 可能性確認

**目的**: 後続タスク（TASK-SKILL-LIFECYCLE-08、UT-06-004）が参照する3シンボルが `@repo/shared` から正しく import できることを確認する。

**実行手順**:

1. 次のインラインスクリプトをワークツリールートから実行する:

   ```bash
   node --input-type=module <<'EOF'
   import { RiskLevel, ToolRiskConfigEntry, TOOL_RISK_CONFIG } from './packages/shared/dist/index.js';
   console.log('RiskLevel: OK (type-only, no runtime check needed)');
   console.log('TOOL_RISK_CONFIG keys:', Object.keys(TOOL_RISK_CONFIG));
   if (!TOOL_RISK_CONFIG.low || !TOOL_RISK_CONFIG.medium || !TOOL_RISK_CONFIG.high) {
     throw new Error('TOOL_RISK_CONFIG の3キーが揃っていない');
   }
   console.log('import 確認: 全シンボルが正常に import 可能');
   EOF
   ```

   > `dist/` がビルド済みであることを前提とする。未ビルドの場合はタスク1を先に実行する。

2. エラーなく実行完了することを確認する
3. 確認結果を `outputs/phase-11/manual-test-result.md` に追記する

**期待結果**: `RiskLevel`・`ToolRiskConfigEntry`（型）・`TOOL_RISK_CONFIG`（値）の3シンボルがエラーなく import できる

---

## ウォークスルーシナリオ発見事項リアルタイム分類欄

各シナリオ実行中に発見した事項を即座に分類するためのテーブル。シナリオ完了後にまとめて分類するのではなく、発見時点でリアルタイムに記録する。

| #   | シナリオ | 発見事項 | 分類 | 対応方針 |
| --- | -------- | -------- | ---- | -------- |
| 1   | TC-11-01 | -        | -    | -        |
| 2   | TC-11-02 | -        | -    | -        |
| 3   | TC-11-03 | -        | -    | -        |
| 4   | TC-11-04 | -        | -    | -        |
| 5   | TC-11-05 | -        | -    | -        |

**分類基準**:

- **Blocker**: Phase 12 完了前に修正必須。仕様整合性・参照リンク切れ・追跡可能性の断絶
- **Note**: 改善推奨だが Phase 12 完了をブロックしない。未タスク化を検討
- **Info**: 記録のみ。今後の参考情報として残す

---

## テストケース

| テストケース | 目的                  | 期待結果                             |
| ------------ | --------------------- | ------------------------------------ |
| TC-11-01     | `@repo/shared` ビルド | `dist/` 生成・終了コード 0           |
| TC-11-02     | 単体テスト PASS       | 全テストが PASS・カバレッジ基準充足  |
| TC-11-03     | TypeScript 型チェック | エラー 0 件                          |
| TC-11-04     | ESLint チェック       | エラー 0 件                          |
| TC-11-05     | import 可能性         | 3シンボルが正常に import・実行できる |

---

## 参照資料

| 参照資料                 | パス                                             | 内容                                  |
| ------------------------ | ------------------------------------------------ | ------------------------------------- |
| Phase 1（要件定義）      | `phase-1-requirements.md`                        | 受入基準12項目を確認する              |
| Phase 2（設計）          | `phase-2-design.md`                              | 型定義・定数値・テスト設計を確認する  |
| Phase 3（設計レビュー）  | `phase-3-design-review.md`                       | レビュー判定とMINOR指摘対応を確認する |
| Phase 10（最終レビュー） | `phase-10-final-review.md`                       | 最終判定後の確認観点を確認する        |
| security.ts              | `packages/shared/src/constants/security.ts`      | 実装済みの型・定数を確認する          |
| security.test.ts         | `packages/shared/src/constants/security.test.ts` | テストケースの網羅範囲を確認する      |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                           | 内容                       |
| ---------------- | ------------------------------------------------------------------------------ | -------------------------- |
| セキュリティ実装 | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | セキュリティ定数の設計方針 |
| セキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/security-principles.md`     | セキュリティ設計の正本     |

---

## 統合テスト連携

後続タスクとの結合確認として、以下の3点を手動テスト結果に明記する:

1. `TOOL_RISK_CONFIG` の `high.allowPermanent === false`・`high.allowTime24h === false`・`high.allowTime7d === false` の3条件（セキュリティ不変条件）がテストで検証済みであること
2. `packages/shared/src/constants/index.ts` から `RiskLevel`・`ToolRiskConfigEntry`・`TOOL_RISK_CONFIG` の3シンボルが re-export されていること
3. TASK-SKILL-LIFECYCLE-08・UT-06-004 が参照する import パスが `@repo/shared` であることが `dist/` ビルドで確認できること

---

## 成果物

| 成果物         | パス                                     | 内容                                                       |
| -------------- | ---------------------------------------- | ---------------------------------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | TC-11-01〜TC-11-05の実施結果を記録する                     |
| 発見事項       | `outputs/phase-11/discovered-issues.md`  | ウォークスルーで発見した Blocker・Note を記録する（0件可） |

---

## 完了条件

- [ ] TC-11-01: `pnpm --filter @repo/shared build` が終了コード 0 で完了している
- [ ] TC-11-02: `vitest run src/constants/security.test.ts` が全テスト PASS している
- [ ] TC-11-03: `tsc --noEmit` が TypeScript エラー 0 件で完了している
- [ ] TC-11-04: `eslint src/constants/security.ts` が ESLint エラー 0 件で完了している
- [ ] TC-11-05: `RiskLevel`・`ToolRiskConfigEntry`・`TOOL_RISK_CONFIG` が `@repo/shared` から import できる
- [ ] 手動テスト結果（`outputs/phase-11/manual-test-result.md`）が生成されている
- [ ] 発見事項（`outputs/phase-11/discovered-issues.md`）が生成されている（0件でも必須）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を上から順に実行する
- [ ] 全TC（TC-11-01〜TC-11-05）が PASS したことを手動テスト結果に記録する
- [ ] FAIL したTCがある場合は原因と対処方針を手動テスト結果に記録し、前のPhaseへ差し戻す

---

## 依存関係

- **前提**: Phase 10（最終レビュー）が PASS 判定で完了していること
- **前提**: `packages/shared/src/constants/security.ts` への実装が完了していること
- **後続**: Phase 12（ドキュメント）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/tool-risk-config-implementation/phase-12-documentation.md`
