# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 3                               |
| Phase名    | 設計レビューゲート              |
| タスクID   | UT-06-001                       |
| 前提Phase  | Phase 2                         |
| 後続Phase  | Phase 4                         |
| ステータス | 未実施                          |
| 作成日     | 2026-03-16                      |
| 機能名     | tool-risk-config-implementation |

---

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を多角的にレビューし、Phase 4（テスト作成）へ進行可能かを PASS / MINOR / MAJOR で判定する。特に Issue #1251 の受入基準12項目と Phase 5 プロトタイプとの設計差分が全12項目について解決されているかを検証する。

## 背景

本タスクは小規模実装（型定義 + 定数 + テスト）だが、セキュリティ不変条件（high の許可制限）と後続タスク（UT-06-004: PermissionDialog）へのインターフェース提供という重要な責務を持つ。設計段階での見落としが後続タスクに波及するため、レビューゲートで確実に品質を担保する。

---

## 実行タスク

### タスク1: 要件-設計整合性レビュー

**目的**: Phase 1 の確定要件と Phase 2 の設計が整合しているかを検証する。

**実行手順**:

1. Phase 1 受入基準12項目と Phase 2 設計の対応を表形式で確認:

   | 受入基準                                          | Phase 2 設計での対応        | 判定 |
   | ------------------------------------------------- | --------------------------- | ---- |
   | `TOOL_RISK_CONFIG` が `Record<RiskLevel, ...>` 型 | 型定義設計書で定義済み      | -    |
   | `RiskLevel` 型が export されている                | エクスポート設計で定義済み  | -    |
   | `ToolRiskConfigEntry` interface が export         | エクスポート設計で定義済み  | -    |
   | dialogWidth: low=400 / medium=480 / high=640      | 定数値設計で確定済み        | -    |
   | headerColorToken: CSS変数名形式                   | `--risk-low/medium/high`    | -    |
   | `allowPermanent`: high のみ false                 | 定数値設計で確定済み        | -    |
   | `allowTime24h`/`allowTime7d`: high のみ false     | 定数値設計で確定済み        | -    |
   | JSDoc コメント付与                                | 型定義設計で JSDoc 設計済み | -    |
   | `pnpm --filter @repo/shared build` 成功           | 実装後に検証（Phase 5）     | -    |
   | テストファイル追加                                | テスト設計書で設計済み      | -    |
   | 全テスト PASS                                     | 実装後に検証（Phase 5）     | -    |
   | TypeScript/ESLint エラー 0 件                     | 実装後に検証（Phase 9）     | -    |

2. 不整合がある場合は指摘事項として記録する

**期待される成果物**:

- `outputs/phase-3/requirements-design-alignment.md`

---

### タスク2: セキュリティ制約レビュー

**目的**: セキュリティ不変条件が設計で正しく反映されているかを検証する。

**実行手順**:

1. Phase 4 デシジョンテーブルの不変条件を確認:
   - `high.allowPermanent === false`（恒久許可禁止）
   - `high.allowTime24h === false`（24時間許可禁止）
   - `high.allowTime7d === false`（7日間許可禁止）

2. Phase 2 の定数設計がこれらの不変条件を満たしているか確認

3. テスト設計にセキュリティ不変条件の検証テストが含まれているか確認

4. `.claude/rules/04-electron-security.md` のセキュリティ原則との整合性を確認

**期待される成果物**:

- `outputs/phase-3/security-constraint-review.md`

---

### タスク3: 設計レビュー判定

**目的**: レビュー結果を総合し、PASS / MINOR / MAJOR を判定する。

**実行手順**:

1. タスク1・タスク2の結果を総合する
2. 判定基準:

   | 判定  | 条件                                                               | 次のアクション        |
   | ----- | ------------------------------------------------------------------ | --------------------- |
   | PASS  | 全レビュー観点で問題なし                                           | Phase 4 へ進行        |
   | MINOR | 軽微な指摘あり（JSDoc 不足、命名改善、フォーマット不一致）         | 指摘記録後 Phase 4 へ |
   | MAJOR | 重大な問題あり（型定義不整合、セキュリティ違反、エクスポート漏れ） | Phase 1 or 2 へ戻る   |

3. MINOR の場合は MINOR 追跡テーブルを作成:

   | MINOR ID  | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
   | --------- | -------- | ------------- | ------------- | ---- |
   | TECH-M-01 | ...      | Phase 5       | Phase 9/10    | ...  |

**期待される成果物**:

- `outputs/phase-3/gate-decision.md`（レビュー判定結果）

---

## 実行手順

### ステップ1: 要件-設計整合性の確認

1. Phase 1 受入基準12項目と Phase 2 設計の対応表を作成する
2. 不整合がある場合は指摘事項として記録する
3. 成果物: `outputs/phase-3/requirements-design-alignment.md`

### ステップ2: セキュリティ制約の検証

1. セキュリティ不変条件3項目が Phase 2 設計で正しく反映されているか確認する
2. テスト設計にセキュリティ不変条件の検証テストが含まれているか確認する
3. `.claude/rules/04-electron-security.md` のセキュリティ原則との整合性を確認する
4. 成果物: `outputs/phase-3/security-constraint-review.md`

### ステップ3: よりシンプルな代替案の検討と最終判定

1. 現在の設計に対し、よりシンプルな代替案がないか検討する
2. タスク1・タスク2の結果を総合し、PASS / MINOR / MAJOR を判定する
3. MINOR の場合は追跡テーブルを作成する
4. 成果物: `outputs/phase-3/gate-decision.md`

---

## よりシンプルな代替案の検討

本 Phase では、Phase 2 の設計に対して以下の代替案を検討し、結果を `gate-decision.md` に記録する:

| 検討観点                 | 現設計                          | 代替案                                    | 採否判断の基準                             |
| ------------------------ | ------------------------------- | ----------------------------------------- | ------------------------------------------ |
| リスクレベル数           | 3段階（low/medium/high）        | 2段階（normal/high）                      | Issue #1251 受入基準が3段階を要求          |
| TOOL_RISK_CONFIG の配置  | `security.ts` 内に追加          | 独立ファイル `tool-risk-config.ts` に分離 | 323行のファイルへの追加量で判断            |
| headerColorToken の形式  | CSS変数名文字列（`--risk-low`） | Tailwind クラス名 / enum                  | 後続 PermissionDialog の参照方式で判断     |
| allowTime24h/allowTime7d | 個別 boolean フィールド         | `allowedDurations: Duration[]` 配列形式   | Phase 4 デシジョンテーブルとの整合性で判断 |

---

## 参照資料

| 参照資料           | パス                                                                                                                                  | 内容                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Phase 1 確定要件   | `outputs/phase-1/requirements-spec.md`                                                                                                | 確定した要件仕様            |
| Phase 2 型定義設計 | `outputs/phase-2/type-design.md`                                                                                                      | 型定義設計書                |
| Phase 2 実装設計   | `outputs/phase-2/implementation-design.md`                                                                                            | 実装設計書                  |
| Phase 2 テスト設計 | `outputs/phase-2/test-design.md`                                                                                                      | テスト設計書                |
| デシジョンテーブル | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-4/decision-table-risk-permission.md` | リスクレベル×権限マトリクス |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                            | 内容                                                      |
| ---------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/security-principles.md`      | セキュリティ設計原則（最小権限・フェイルセキュア）        |
| スキル実行セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | 既存リスクレベル定義（ToolRiskLevel 4段階）との整合性確認 |

---

## 統合テスト連携

- Phase 2 テスト設計のテストケースが、後続の Phase 4 で実際に作成可能であることを確認する
- エクスポート設計が `@repo/shared` パッケージの既存のエクスポートパターンと整合していることを確認する

---

## 成果物

| 成果物                   | パス                                               | 内容                   |
| ------------------------ | -------------------------------------------------- | ---------------------- |
| 要件-設計整合性レビュー  | `outputs/phase-3/requirements-design-alignment.md` | 12項目の整合性確認結果 |
| セキュリティ制約レビュー | `outputs/phase-3/security-constraint-review.md`    | 不変条件の検証結果     |
| 設計レビュー判定         | `outputs/phase-3/gate-decision.md`                 | PASS/MINOR/MAJOR 判定  |

---

## レビューゲート

### レビュー結果判定

| 判定  | 条件                     | 次のアクション         |
| ----- | ------------------------ | ---------------------- |
| PASS  | 全レビュー観点で問題なし | Phase 4 へ進行         |
| MINOR | 軽微な指摘あり           | 指摘対応後、Phase 4 へ |
| MAJOR | 重大な問題あり           | 影響範囲に応じて戻る   |

### 戻り先決定基準

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |

---

## Phase 4 開始条件

Phase 4（テスト作成）は以下の全条件を満たした場合に開始可能:

- [ ] Phase 3 のレビュー判定が PASS または MINOR である
- [ ] MAJOR 判定の場合は Phase 1 または Phase 2 へ戻り、再レビューで PASS/MINOR を取得済みである
- [ ] MINOR 指摘がある場合は MINOR 追跡テーブルが `gate-decision.md` に記録されている
- [ ] Phase 1 の成果物3件と Phase 2 の成果物3件が全て生成されている

## Phase 13 blocked 条件

以下のいずれかに該当する場合、Phase 13（完了）は blocked となる:

- Phase 3 の MINOR 追跡テーブルに未解決の MINOR が残っている（解決確認Phase が空）
- Phase 3 のレビュー判定が MAJOR のまま再レビューが実施されていない
- セキュリティ不変条件（high の3項目 === false）がテスト設計に反映されていない

---

## 完了条件

- [ ] 受入基準12項目と Phase 2 設計の対応表が作成されている
- [ ] セキュリティ不変条件3項目が Phase 2 設計で正しく反映されていることが確認されている
- [ ] レビュー判定（PASS/MINOR/MAJOR）が `gate-decision.md` に記録されている
- [ ] MINOR 判定の場合、追跡テーブルが作成されている
- [ ] Phase 4 開始条件が明確になっている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（3タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（3ファイル）が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 2（設計）が完了していること
- **後続**: Phase 4（テスト作成）へ進む（PASS/MINOR の場合）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/tool-risk-config-implementation/phase-4-test-creation.md`
