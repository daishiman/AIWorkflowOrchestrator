# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 値                                                      |
| ---------- | ------------------------------------------------------- |
| Phase      | 3                                                       |
| タスクID   | TASK-UI-SCHEDULE-CRON-SEMANTIC-001                      |
| 機能名     | 意味論的 cron バリデーション追加                        |
| タスク種別 | implementation                                          |
| 前Phase    | Phase 2: 設計                                           |
| 次Phase    | Phase 4: テスト作成（PASS時）/ Phase 2: 設計（MAJOR時） |
| ステータス | 未実施                                                  |
| 作成日     | 2026-04-12                                              |

---

## 目的

Phase 2 で確定した設計（`ValidateCronOptions` インターフェース追加・`cron-parser` 採用・意味論的バリデーションフロー）の整合性・後方互換性・パフォーマンス・テスタビリティ・セキュリティをレビューし、PASS / MINOR / MAJOR を判定して Phase 4 への進行可否を決定する。

---

## 実行タスク

- **タスク1**: 機能性レビュー（AC-1〜AC-5 との設計整合性確認）
- **タスク2**: 後方互換性チェック（`options` オプショナル・既存呼び出し影響確認）
- **タスク3**: パフォーマンス評価（`cron-parser` バンドルサイズ影響・実行時コスト）
- **タスク4**: テスタビリティ評価（semantic フラグの on/off テスト設計の実現可能性）
- **タスク5**: セキュリティ評価（外部ライブラリ導入リスク・入力値サニタイズ）
- **タスク6**: MINOR 追跡テーブル作成（発見された指摘がある場合）
- **タスク7**: Phase 4 開始条件の確定

---

## 参照資料

| 資料名                         | パス                                                               | 説明                             |
| ------------------------------ | ------------------------------------------------------------------ | -------------------------------- |
| Phase 1 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                           | AC-1〜AC-5 との照合              |
| Phase 1 ライブラリ評価計画     | `outputs/phase-1/library-evaluation-plan.md`                       | cron-parser 評価根拠             |
| Phase 2 API 設計               | `outputs/phase-2/api-design.md`                                    | シグネチャ・インターフェース設計 |
| Phase 2 ライブラリ比較         | `outputs/phase-2/library-comparison.md`                            | cron-parser 採用根拠             |
| Phase 2 concern 分離チェック   | `outputs/phase-2/design-consistency-check.md`                      | バンドル・後方互換・テスト観点   |
| scheduleConfigValidator 実装   | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`       | レビュー対象の変更先ファイル     |
| scheduleConfigValidator テスト | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts` | 既存テスト SCV-01〜SCV-12        |

---

## レビュー観点テーブル

### 機能性

| 確認項目                                                                                          | 判定 |
| ------------------------------------------------------------------------------------------------- | ---- |
| AC-1: `validateCronExpression("0 0 31 2 *", { semantic: true })` がエラーを返す設計になっているか | TBD  |
| AC-2: `validateCronExpression("0 0 * * *", { semantic: true })` が null を返す設計になっているか  | TBD  |
| AC-3: `options` 未指定時（既存呼び出し）も null を返す設計になっているか                          | TBD  |
| AC-5: JSDoc に `options.semantic` の説明が追加される設計になっているか                            | TBD  |
| `cron-parser` の `CronExpressionParser.parse().next()` で到達不能を検出できるか                   | TBD  |

**確認コマンド**:

```bash
# cron-parser の挙動確認（インストール後）
node -e "
  const { CronExpressionParser } = require('cron-parser');
  try {
    const interval = CronExpressionParser.parse('0 0 31 2 *');
    console.log('next:', interval.next().toDate());
  } catch (e) {
    console.log('error:', e.message);
  }
"
```

### 後方互換性

| 確認項目                                                                                                    | 判定 |
| ----------------------------------------------------------------------------------------------------------- | ---- |
| `options` がオプショナル（`?`）であり、既存呼び出しは変更不要か                                             | TBD  |
| `validateSkillWizardScheduleConfig` 内で `validateCronExpression` に `options` を渡さない設計になっているか | TBD  |
| 既存テスト SCV-01〜SCV-12 が `options` 未指定のままで PASS し続けるか                                       | TBD  |
| SCV-11「semantic validationは行わない（月次指定はnull）」の挙動が維持されるか                               | TBD  |

**確認コマンド**:

```bash
# 既存の validateCronExpression 呼び出し箇所を確認
grep -rn "validateCronExpression" \
  apps/desktop/src/ \
  packages/

# validateSkillWizardScheduleConfig の実装確認
grep -A 10 "validateSkillWizardScheduleConfig" \
  apps/desktop/src/renderer/utils/scheduleConfigValidator.ts
```

### パフォーマンス

| 確認項目                                                                      | 判定 |
| ----------------------------------------------------------------------------- | ---- |
| `cron-parser` のバンドルサイズが許容範囲内か（目安: 追加 ~10KB gzip）         | TBD  |
| `options.semantic` が false/undefined の場合は `cron-parser` が実行されないか | TBD  |
| tree-shaking で未使用コードが除外される設計になっているか                     | TBD  |
| next-execution-time 計算が同期処理であり、UI をブロックしないか               | TBD  |

**確認コマンド**:

```bash
# cron-parser のパッケージサイズ確認
npm pack cron-parser --dry-run 2>/dev/null | grep "size"

# または
du -sh node_modules/cron-parser 2>/dev/null
```

### テスタビリティ

| 確認項目                                                                                       | 判定 |
| ---------------------------------------------------------------------------------------------- | ---- |
| `options.semantic: true` と `options.semantic: false/undefined` のテストを独立して記述できるか | TBD  |
| `cron-parser` のモックなしで `"0 0 31 2 *"` のエラーケースが実現できるか                       | TBD  |
| AC-3: 既存テスト SCV-01〜SCV-12 が新設計でも PASS できるか                                     | TBD  |
| AC-4: 追加テストケースがカバレッジを向上させる構造になっているか                               | TBD  |

### セキュリティ

| 確認項目                                                                                   | 判定 |
| ------------------------------------------------------------------------------------------ | ---- |
| `cron-parser` が信頼できるパッケージか（npm downloads / メンテナンス状態）                 | TBD  |
| `cron-parser` への入力は既にバリデーション済みの cron 式のみか（ReDoS 対策）               | TBD  |
| ユーザー入力が直接 `CronExpressionParser.parse` に渡される前に構文チェックが完了しているか | TBD  |

**確認コマンド**:

```bash
# cron-parser のメンテナンス状態・脆弱性確認
npm info cron-parser | grep -E "version|maintainers|time"
npm audit --dry-run 2>/dev/null | grep cron-parser
```

---

## 判定基準

| 判定  | 条件                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------ |
| PASS  | 全チェック項目が問題なし。Phase 4 へ進む                                                         |
| MINOR | 軽微な指摘あり（ドキュメント不足・ログ追加等）。Phase 4 継続可、Phase 5〜8 で解決                |
| MAJOR | 設計の根本的問題（後方互換性破壊・セキュリティリスク・cron-parser 挙動の誤解等）。Phase 2 へ戻る |

### MAJOR 判定となる条件例

- `cron-parser` が `"0 0 31 2 *"` をエラーとして検出できないことが判明した場合
- `options` を `required` にしてしまい後方互換性を破壊する設計になっている場合
- `cron-parser` に既知のセキュリティ脆弱性が存在する場合
- 意味論的チェックが構文チェックより前に実行される設計（未 trim の入力が `CronExpressionParser.parse` に渡される）になっている場合

---

## MINOR 追跡テーブル

Phase 3 で MINOR 判定された指摘を追跡する（指摘がある場合のみ記入）:

| MINOR ID | 観点                 | 指摘内容                           | 解決予定Phase | 解決確認Phase | 備考 |
| -------- | -------------------- | ---------------------------------- | ------------- | ------------- | ---- |
| SEM-M-01 | （例）パフォーマンス | `cron-parser` バンドルサイズ再確認 | Phase 5       | Phase 9       | -    |
| SEM-M-02 | （例）ドキュメント   | エラーメッセージの文言統一         | Phase 5       | Phase 10      | -    |

※ 指摘がない場合は「MINOR なし」と記録する。

---

## Phase 4 開始条件

以下の全条件を満たす場合のみ Phase 4 へ進む:

- [ ] レビュー判定が「PASS」または「MINOR のみ」であること
- [ ] MAJOR 判定が残存していないこと
- [ ] `outputs/phase-3/design-review-result.md` にレビュー結果が記録されていること

**MAJOR 判定が存在する場合**: Phase 2 へ戻り、設計を修正した上で再度 Phase 3 レビューを実施する。

---

## 完了条件チェックリスト

- [ ] 機能性レビュー（AC-1〜AC-5 との整合性）が完了していること
- [ ] 後方互換性チェックが完了し、既存呼び出し箇所への影響がないことが確認済みであること
- [ ] パフォーマンス評価（バンドルサイズ・実行コスト）が完了していること
- [ ] テスタビリティ評価が完了していること
- [ ] セキュリティ評価（`cron-parser` の信頼性・ReDoS 対策）が完了していること
- [ ] レビュー判定（PASS / MINOR / MAJOR）が確定していること
- [ ] MINOR 追跡テーブルが記録済みであること（指摘なしの場合は「MINOR なし」と記録）
- [ ] `outputs/phase-3/design-review-result.md` に全結果が記録されていること

---

## Phase 末端アクション【必須】

Phase 3 完了時に以下を実行すること:

1. `outputs/phase-3/design-review-result.md` に各観点のレビュー結果と判定（PASS / MINOR / MAJOR）を記録する
2. MINOR が存在する場合は MINOR 追跡テーブルに追記し、解決予定 Phase を記録する
3. MAJOR が存在する場合は Phase 2 へ戻り、設計修正後に再レビューを実施する
4. 判定が「PASS」または「MINOR のみ」の場合は Phase 4 開始条件を明示的に確定する（「PASS: Phase 4 へ進む」等）

---

## 依存関係

| 依存Phase/タスク | 依存内容                                                 |
| ---------------- | -------------------------------------------------------- |
| Phase 1 完了     | 受け入れ基準（AC-1〜AC-5）が確定していること             |
| Phase 2 完了     | API 設計・ライブラリ比較・concern 分離が確定していること |

---

## Phase 実行記録テンプレート

```markdown
## Phase 3 実行記録

- 実行日時: YYYY-MM-DD HH:mm
- 実行者: -
- レビュー観点別判定:
  - 機能性: [ ] PASS / [ ] MINOR / [ ] MAJOR
  - 後方互換性: [ ] PASS / [ ] MINOR / [ ] MAJOR
  - パフォーマンス: [ ] PASS / [ ] MINOR / [ ] MAJOR
  - テスタビリティ: [ ] PASS / [ ] MINOR / [ ] MAJOR
  - セキュリティ: [ ] PASS / [ ] MINOR / [ ] MAJOR
- 総合判定: [ ] PASS / [ ] MINOR のみ / [ ] MAJOR あり
- MINOR 件数: X 件
- MAJOR 件数: X 件
- 完了条件充足状況: X / 8 項目完了
- Phase 4 移行判定: [ ] PASS（Phase 4 へ進む）/ [ ] HOLD（Phase 2 へ戻る）
```

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | Markdown |

---

## 次のPhase案内

**PASS / MINOR のみの場合**: **Phase 4: テスト作成（Red 段階）** — TDD に従い、実装前に `"0 0 31 2 *"` のエラーケースを先行作成する。`options: { semantic: true }` の明示指定と既存テスト SCV-01〜SCV-12 の PASS 維持を確認する。

**MAJOR あり（Phase 2 へ戻る）**: 指摘内容に基づき `validateCronExpression` シグネチャ設計・ライブラリ選択・意味論的バリデーションフローを修正し、Phase 3 レビューを再実施する。

**Phase 13 blocked 条件**: MAJOR 判定が最終的に残存している場合は PR 作成不可。
