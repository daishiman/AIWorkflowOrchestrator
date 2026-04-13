# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 1                                        |
| タスクID   | TASK-UI-SCHEDULE-CRON-SEMANTIC-001       |
| 機能名     | 意味論的 cron バリデーション追加         |
| タスク種別 | implementation                           |
| 前Phase    | なし（開始Phase）                        |
| 次Phase    | Phase 2: 設計                            |
| ステータス | 未実施                                   |
| 作成日     | 2026-04-12                               |
| Issue      | #2074 (daishiman/AIWorkflowOrchestrator) |

---

## 目的

`apps/desktop/src/renderer/utils/scheduleConfigValidator.ts` の `validateCronExpression` 関数は、現在 5 フィールド構文チェックと各フィールドの値域（数値範囲）のみを検証している。コード内のコメントにも「semantic validation（next-run 計算など）は行わない」と明示されており、`"0 0 31 2 *"`（2月31日）のような存在し得ない日付が通過してしまう。

ユーザーがこのようなスケジュールを設定した場合、条件が永久に満たされないため実行されない。この問題を解消するため、意味論的バリデーション（next-execution-time 計算による到達可能性チェック）を追加し、ユーザーが無効なスケジュールを設定した場合に適切なエラーを返せるようにする。

---

## タスク分類宣言

| 項目             | 値                                                       |
| ---------------- | -------------------------------------------------------- |
| タスク種別       | implementation（コード変更あり）                         |
| Phase 11 評価    | NON_VISUAL（UIコンポーネント変更なし・バリデーターのみ） |
| 変更層           | Renderer Utils（`apps/desktop/src/renderer/utils/`）     |
| IPC 変更         | なし                                                     |
| バックエンド変更 | なし                                                     |

---

## Step 0: P50チェック【必須】

Phase 1 開始前に、対象ファイルの実装状態を確認し、既実装コードとの重複・齟齬を防止する。

```bash
# validateCronExpression の現在のシグネチャと実装を確認
grep -n "validateCronExpression\|semantic\|next-run\|cron-parser" \
  apps/desktop/src/renderer/utils/scheduleConfigValidator.ts

# 現在の関数シグネチャと JSDoc を確認
head -60 apps/desktop/src/renderer/utils/scheduleConfigValidator.ts

# 既存テストの semantic 関連ケースを確認
grep -n "semantic\|31.*2\|2月\|0 0 31 2\|存在しない" \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts

# cron-parser が既にインストールされているか確認
grep -n "cron-parser\|cron" \
  apps/desktop/package.json \
  packages/shared/package.json

# 既存の cron 関連ユーティリティを確認
ls apps/desktop/src/renderer/utils/cron*.ts
```

**確認事項**:

- [ ] `validateCronExpression` の関数シグネチャが `(value: string): string | null` であること（オプション引数未追加の状態）
- [ ] JSDoc に「semantic validation（next-run 計算など）は行わない」コメントが存在すること
- [ ] 既存テスト（SCV-01〜SCV-12）に `"0 0 31 2 *"` のような意味論的不正ケースが存在しないこと
- [ ] `cron-parser` ライブラリが `apps/desktop/package.json` に含まれていないこと（未導入の状態）
- [ ] `cronParser.ts`、`cronConverter.ts`、`cronHumanizer.ts` が既に存在することを確認し、API 重複がないこと

---

## 既存コードの命名規則分析

### `scheduleConfigValidator.ts` の API 分析

| 関数名                              | 現在のシグネチャ                                                      | 役割                 |
| ----------------------------------- | --------------------------------------------------------------------- | -------------------- | ------------------------------------ |
| `validateCronExpression`            | `(value: string): string                                              | null`                | cron 式の構文・値域チェック          |
| `validateTimezone`                  | `(value: string): string                                              | null`                | IANA timezone 文字列の妥当性チェック |
| `validateSkillWizardScheduleConfig` | `(config: SkillWizardScheduleConfig): ScheduleConfigValidationResult` | 一括バリデーション   |
| `ScheduleConfigValidationResult`    | `{ cronExpression?: string; timezone?: string }`                      | バリデーション結果型 |

### 関連ユーティリティの役割分担

| ファイル                     | 役割                               | 変更対象 |
| ---------------------------- | ---------------------------------- | -------- |
| `scheduleConfigValidator.ts` | バリデーション（エラー文字列返却） | **YES**  |
| `cronParser.ts`              | cron 式の解析（フィールド分解）    | NO       |
| `cronConverter.ts`           | cron 式と人間可読な表現の変換      | NO       |
| `cronHumanizer.ts`           | cron 式の自然言語説明生成          | NO       |

---

## 受け入れ基準

| AC番号 | 基準                                                                                  | 検証方法               |
| ------ | ------------------------------------------------------------------------------------- | ---------------------- |
| AC-1   | `validateCronExpression("0 0 31 2 *")` がエラー文字列を返す（null でない）            | テスト PASS            |
| AC-2   | `validateCronExpression("0 0 * * *")` 等の正常ケースは引き続き null を返す            | テスト PASS            |
| AC-3   | 既存テスト SCV-01〜SCV-12 が全件 PASS する                                            | `pnpm test` PASS       |
| AC-4   | 意味論的不正ケースのテストが追加され、カバレッジが向上している                        | テスト PASS + coverage |
| AC-5   | `scheduleConfigValidator.ts` の JSDoc が更新され、semantic オプションの説明が含まれる | コードレビュー         |

---

## スコープ

### 含む

- `scheduleConfigValidator.ts` への意味論的検証ロジック追加
- `ValidateCronOptions` インターフェース定義（`options?: { semantic?: boolean }`）
- `cron-parser` ライブラリ（または同等品）の導入検討・評価
- 既存テストへの意味論的不正ケースの追加（`scheduleConfigValidator.test.ts`、`scheduleConfigValidator.edge.test.ts`）

### 含まない

- バックエンド（`ScheduleStore` / `SkillScheduler`）の変更
- IPC チャンネルの変更
- UI の変更（エラーメッセージ表示は既存の仕組みを流用）
- `cronParser.ts`、`cronConverter.ts`、`cronHumanizer.ts` の変更
- `validateTimezone` 関数の変更

---

## 変更対象ファイルの特定

### コード変更ファイル

| ファイル                                                     | 変更種別 | 変更内容                                                                                           |
| ------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts` | 修正     | `ValidateCronOptions` 型追加、`validateCronExpression` 引数拡張、semantic ロジック追加、JSDoc 更新 |

### テスト変更ファイル

| ファイル                                                                | 変更種別 | 変更内容                                |
| ----------------------------------------------------------------------- | -------- | --------------------------------------- |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`      | 修正     | semantic 不正ケース追加（AC-1 関連）    |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | 修正     | 追加エッジケース（AC-4 カバレッジ向上） |

### スコープ外（変更しない）

| ファイル                                                      | 理由                                  |
| ------------------------------------------------------------- | ------------------------------------- |
| `apps/desktop/src/main/services/ScheduleStore.ts`             | バックエンドはスコープ外              |
| `apps/desktop/src/main/services/SkillScheduler.ts`            | バックエンドはスコープ外              |
| `apps/desktop/src/renderer/utils/cronParser.ts`               | バリデーター専用・cronParser 変更不要 |
| UI コンポーネント（ScheduleDialog, ConversationRoundStep 等） | UI 変更はスコープ外                   |

---

## 実行タスク

### タスク1: 現状調査

P50チェックコマンドを実行し、現在の `validateCronExpression` の実装状態・既存テストの状態・`cron-parser` の有無を確認する。

**確認コマンド**:

```bash
# 1. scheduleConfigValidator.ts の全文確認
cat apps/desktop/src/renderer/utils/scheduleConfigValidator.ts

# 2. 既存テストの全ケース確認
cat apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts
cat apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts

# 3. package.json で cron 関連ライブラリ確認
cat apps/desktop/package.json | grep -i cron

# 4. cronParser.ts の既存 API 確認（重複チェック）
cat apps/desktop/src/renderer/utils/cronParser.ts
```

**確認すべき事実**:

- `validateCronExpression` が単純な構文・値域チェックのみで semantic validation を行っていないこと
- 既存テスト SCV-11 が「semantic validationは行わない（月次指定はnull）」とコメントしていること
- `cron-parser` が未インストールの状態であること

### タスク2: ライブラリ評価方針策定

意味論的バリデーションの実装方針を評価する。以下の3アプローチを比較検討し、推奨案を決定する。

| アプローチ                      | 概要                                                       | 評価軸                         |
| ------------------------------- | ---------------------------------------------------------- | ------------------------------ |
| A: `cron-parser` ライブラリ導入 | npm の `cron-parser` を使用して next-execution-time を計算 | バンドルサイズ・正確性・保守性 |
| B: カスタム実装                 | 日付計算を自前実装（月末日チェックなど）                   | 依存関係なし・実装コスト       |
| C: `@datasert/cron-validator`   | 軽量バリデーター特化ライブラリ                             | バンドルサイズ・機能限定性     |

**評価結果は `outputs/phase-1/library-evaluation-plan.md` に記録する**。

---

## 参照資料

| 資料名                               | パス                                                                    | 説明                                       |
| ------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------ |
| scheduleConfigValidator 実装         | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`            | 修正対象：バリデーターロジック             |
| scheduleConfigValidator テスト       | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`      | SCV-01〜SCV-12 の既存テスト                |
| scheduleConfigValidator エッジテスト | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | エッジケーステスト                         |
| cronParser.ts                        | `apps/desktop/src/renderer/utils/cronParser.ts`                         | 既存 cron 関連ユーティリティ（役割確認用） |
| cron-parser npm                      | https://www.npmjs.com/package/cron-parser                               | 候補ライブラリ                             |
| Issue #2074                          | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2074         | バックログ Issue                           |

---

## 成果物

| 成果物             | 配置先                                       | 形式     |
| ------------------ | -------------------------------------------- | -------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Markdown |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Markdown |
| ライブラリ評価計画 | `outputs/phase-1/library-evaluation-plan.md` | Markdown |

---

## 統合テスト連携

Phase 1〜11 は必須。本 Phase での連携内容:

- 受け入れ基準（AC-1〜AC-5）を `outputs/phase-1/acceptance-criteria.md` に記録し、Phase 4〜11 のテスト・QA 基準として使用する
- `"0 0 31 2 *"` シナリオを Phase 4（テスト作成）のTDDケースとして予約する
- ライブラリ評価計画を Phase 2 設計のインプットとして提供する
- NON_VISUAL 評価方針を Phase 11（手動テスト）に引き継ぐ（スクリーンショット不要・ロジックテストのみ）

---

## 完了条件チェックリスト

- [ ] P50チェックを実行し、`validateCronExpression` が semantic validation を行っていないことを確認済みであること
- [ ] `cron-parser` が未インストール状態であることを確認済みであること
- [ ] 既存テスト SCV-01〜SCV-12 に `"0 0 31 2 *"` 系のケースが存在しないことを確認済みであること
- [ ] 受け入れ基準 AC-1〜AC-5 が全て定義・文書化されていること
- [ ] 変更対象ファイル（コード1種 + テスト2種）が確定していること
- [ ] ライブラリ評価計画（アプローチA/B/C 比較）が `outputs/phase-1/library-evaluation-plan.md` に記録されていること
- [ ] `outputs/phase-1/` 配下の全成果物が生成されていること

---

## Phase 末端アクション【必須】

Phase 1 完了時に以下を実行すること:

1. `outputs/phase-1/requirements-definition.md` に本 Phase の要件定義を記録する
2. `outputs/phase-1/acceptance-criteria.md` に AC-1〜AC-5 を記録する
3. `outputs/phase-1/library-evaluation-plan.md` にライブラリ比較評価計画を記録する
4. 全完了条件チェックリストを確認し、未完了項目がある場合は完了させてから Phase 2 へ進む

---

## 依存関係

| 依存タスク                         | 依存種別     | 備考                                          |
| ---------------------------------- | ------------ | --------------------------------------------- |
| TASK-UI-SCHEDULE-VISUAL-PICKER-001 | 完了済み前提 | `scheduleConfigValidator.ts` の初期実装タスク |
| なし（ブロッカーなし）             | -            | 本タスクは独立して開始可能                    |

---

## Phase 実行記録テンプレート

```markdown
## Phase 1 実行記録

- 実行日時: YYYY-MM-DD HH:mm
- 実行者: -
- P50チェック結果: [ ] PASS / [ ] FAIL
- 発見事項:
  - （P50チェックで発見した問題や確認事項を記録）
- 完了条件充足状況: X / 7 項目完了
- Phase 2 移行判定: [ ] PASS / [ ] HOLD（理由: ）
```

---

## 次のPhase案内

**Phase 2: 設計** — `validateCronExpression` の関数シグネチャ拡張設計、`ValidateCronOptions` インターフェース定義、`cron-parser` vs カスタム実装の選択を行う。

**ゲート条件**: Phase 1 の全完了条件を満たさない場合、Phase 2 へ進まないこと。
