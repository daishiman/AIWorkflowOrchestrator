# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| Phase      | 12                                 |
| タスクID   | TASK-UI-SCHEDULE-CRON-SEMANTIC-001 |
| 機能名     | 意味論的 cron バリデーション追加   |
| タスク種別 | implementation                     |
| 前Phase    | Phase 11: 手動テスト検証           |
| 次Phase    | Phase 13: PR作成                   |
| ステータス | 未実施                             |
| 作成日     | 2026-04-12                         |

---

## 目的

Phase 12 の必須5タスク（実装ガイド作成・仕様書更新・変更履歴・未タスク検出・スキルフィードバック）を完了し、本タスクの実装内容を将来の開発者が参照・再利用できる状態にする。

---

## 実行タスク

**全タスクは完了必須。「該当なし」の場合も記録を残すこと。**

---

### Task 12-1: 実装ガイド作成（2パート構成）

成果物: `outputs/phase-12/implementation-guide.md`

#### Part 1（中学生レベル）

以下の観点で説明する:

- **たとえ話**: 「カレンダーに存在しない日付の確認」
  - 「2月31日は存在しない」という日常の感覚で説明する
  - スケジュールで `"0 0 31 2 *"` を設定するのは「毎年2月31日に実行してください」と指示するのと同じであり、その日は永遠に来ない
- **なぜ必要か**: 無効なスケジュールを設定したユーザーに即座に警告することで、永遠に実行されないタスクを防ぐ
- **何をするか**: `cron-parser` ライブラリを使い、「その日付は本当にカレンダーに存在するか」を自動で確認する

#### Part 2（技術者レベル）

以下の内容を含める:

**`ValidateCronOptions` インターフェース定義**:

```typescript
export interface ValidateCronOptions {
  /** true の場合、cron-parser を使用して意味論的バリデーション（next-execution-time 計算）を実行する */
  semantic?: boolean;
}
```

**`validateCronExpression` の API シグネチャ**:

```typescript
/**
 * cron 式を検証する。
 * @param value - 検証する cron 式（5フィールド形式）
 * @param options - オプション（省略時は従来の構文・値域チェックのみ）
 * @param options.semantic - true の場合、next-execution-time 計算による意味論的バリデーションを追加する
 * @returns エラーメッセージ文字列（エラーなしの場合は null）
 */
export function validateCronExpression(
  value: string,
  options?: ValidateCronOptions,
): string | null;
```

**`cron-parser` ライブラリの使用方法**:

```typescript
import { CronExpressionParser } from "cron-parser";

// 意味論的バリデーション実装例
if (options?.semantic) {
  try {
    const interval = CronExpressionParser.parse(value);
    interval.next(); // 次回実行日時を計算（到達不能な場合は例外）
  } catch (e) {
    return "到達不能なスケジュールです（例: 2月31日は存在しません）";
  }
}
```

**エラーハンドリング**:

- `CronExpressionParser.parse()` が例外を投げた場合 → 意味論的エラーとしてエラー文字列を返す
- `interval.next()` が到達不能な日付の場合 → 同様にエラー文字列を返す
- `options?.semantic` が false または undefined の場合 → 従来の構文・値域チェックのみ実行（`cron-parser` は呼び出さない）

**設定可能なパラメータ**:

| パラメータ         | 型      | デフォルト | 説明                                            |
| ------------------ | ------- | ---------- | ----------------------------------------------- |
| `options.semantic` | boolean | undefined  | true の場合、意味論的バリデーションを有効にする |

---

### Task 12-2: システム仕様書更新

成果物: `outputs/phase-12/system-spec-update-summary.md`

#### Step 1-A: タスク完了記録

以下のドキュメントを更新する:

| 更新対象                  | 更新内容                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 関連ドキュメントリンク    | TASK-UI-SCHEDULE-CRON-SEMANTIC-001 の完了リンクを追加                                                            |
| 変更履歴                  | `scheduleConfigValidator.ts` + `ValidateCronOptions` の変更を記録                                                |
| LOGS.md（タスク用）       | `.claude/skills/task-specification-creator/LOGS.md` に Phase 12 完了ログを追記                                   |
| LOGS.md（プロジェクト用） | `.claude/skills/aiworkflow-requirements/LOGS.md` に完了を記録                                                    |
| topic-map.md              | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` に `ValidateCronOptions` / `semantic` フラグを追加 |

#### Step 1-B: 実装状況テーブル更新

`validateCronExpression` の意味論的バリデーション対応状況を「未実装」→「完了」に更新する。

#### Step 1-C: 関連タスクテーブル更新

TASK-UI-SCHEDULE-CRON-SEMANTIC-001 の関連タスクテーブル（完了日・実装ファイル等）を更新する。

#### Step 2: 新規インターフェース追加（条件付き → 本タスクは実施する）

**実施理由**: 新規インターフェース `ValidateCronOptions` を `scheduleConfigValidator.ts` に追加したため。

更新内容:

- `ValidateCronOptions` インターフェースをシステム仕様書のインターフェース一覧に追加する
- `validateCronExpression` のシグネチャ変更（オプション引数追加）を API ドキュメントに反映する

---

### Task 12-3: ドキュメント更新履歴作成

成果物: `outputs/phase-12/documentation-changelog.md`

以下の全 Step の結果を明記する（「該当なし」も記録すること）:

| Step     | 更新対象                 | 更新内容                                                     | 結果 |
| -------- | ------------------------ | ------------------------------------------------------------ | ---- |
| Step 1-A | タスク完了記録           | 関連ドキュメントリンク + 変更履歴 + LOGS.md×2 + topic-map.md | TBD  |
| Step 1-B | 実装状況テーブル         | 「未実装」→「完了」                                          | TBD  |
| Step 1-C | 関連タスクテーブル       | 完了日・実装ファイル等の更新                                 | TBD  |
| Step 2   | 新規インターフェース追加 | `ValidateCronOptions` をインターフェース一覧に追加           | TBD  |

---

### Task 12-4: 未タスク検出レポート作成（0件でも出力必須）

成果物: `outputs/phase-12/unassigned-task-detection.md`

**検出ソース**:

| 検出ソース                     | 内容                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------- |
| 元タスク仕様書のスコープ外事項 | バックエンド変更（`ScheduleStore` / `SkillScheduler`）は本タスクのスコープ外 |
| 元タスク仕様書のスコープ外事項 | IPC チャンネルの変更は本タスクのスコープ外                                   |
| Phase 10 MINOR 指摘事項        | Phase 10 レビューで MINOR 判定された項目（解決状況を確認）                   |
| コードコメントの TODO/FIXME    | `scheduleConfigValidator.ts` および関連ファイルの TODO/FIXME を確認          |
| 将来の拡張候補                 | DOM/DOW の安全側判定のユーザー説明強化（LIM-001 参照）                       |

**検出コマンド**:

```bash
# コードコメントの TODO/FIXME を確認
grep -rn "TODO\|FIXME" \
  apps/desktop/src/renderer/utils/scheduleConfigValidator.ts \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

**記録方針**: 検出された未タスクが0件の場合も「未タスクなし」と明記する。

---

### Task 12-5: スキルフィードバックレポート作成（改善点なしでも出力必須）

成果物: `outputs/phase-12/skill-feedback-report.md`

以下の観点でフィードバックを記録する:

| 観点                       | 記録内容                                                           |
| -------------------------- | ------------------------------------------------------------------ |
| Phase ワークフローの有効性 | Phase 1〜11 の流れが本タスクに適していたか                         |
| TDD サイクルの効果         | Phase 4（テスト先行作成）→ Phase 5（実装）の流れが有効だったか     |
| NON_VISUAL 判定の妥当性    | renderer utility タスクへの NON_VISUAL 適用が適切だったか          |
| `cron-parser` 採用の評価   | Phase 2〜3 で検討したライブラリ選択の結果評価                      |
| 改善提案                   | 次回の類似タスクへの改善提案（なしの場合は「改善提案なし」と明記） |

---

### Task 12-6: phase12-task-spec-compliance-check.md 作成（root evidence）

成果物: `outputs/phase-12/phase12-task-spec-compliance-check.md`

Phase 12 の全必須タスクが完了したことを証明する root evidence ドキュメント。

以下のチェック項目を記録する:

| タスク    | 成果物ファイル                                           | 完了確認 |
| --------- | -------------------------------------------------------- | -------- |
| Task 12-1 | `outputs/phase-12/implementation-guide.md`               | [ ] DONE |
| Task 12-2 | `outputs/phase-12/system-spec-update-summary.md`         | [ ] DONE |
| Task 12-3 | `outputs/phase-12/documentation-changelog.md`            | [ ] DONE |
| Task 12-4 | `outputs/phase-12/unassigned-task-detection.md`          | [ ] DONE |
| Task 12-5 | `outputs/phase-12/skill-feedback-report.md`              | [ ] DONE |
| Task 12-6 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | [ ] DONE |

---

## 参照資料

| 資料名                       | パス                                                            | 説明                           |
| ---------------------------- | --------------------------------------------------------------- | ------------------------------ |
| scheduleConfigValidator 実装 | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`    | 変更対象：バリデーターロジック |
| Phase 1 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                        | AC-1〜AC-5 の定義              |
| Phase 2 API 設計             | `outputs/phase-2/api-design.md`                                 | `ValidateCronOptions` 設計書   |
| Phase 11 手動テスト結果      | `outputs/phase-11/manual-test-result.md`                        | 自動テスト全件 PASS の証跡     |
| Phase 11 既知制限リスト      | `outputs/phase-11/manual-test-checklist.md`                     | LIM-001〜LIM-004               |
| Issue #2074                  | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2074 | バックログ Issue               |

---

## 成果物

| 成果物                                 | 配置先                                                   | 形式     |
| -------------------------------------- | -------------------------------------------------------- | -------- |
| 実装ガイド（2パート）                  | `outputs/phase-12/implementation-guide.md`               | Markdown |
| システム仕様書更新サマリ               | `outputs/phase-12/system-spec-update-summary.md`         | Markdown |
| ドキュメント更新履歴                   | `outputs/phase-12/documentation-changelog.md`            | Markdown |
| 未タスク検出レポート                   | `outputs/phase-12/unassigned-task-detection.md`          | Markdown |
| スキルフィードバックレポート           | `outputs/phase-12/skill-feedback-report.md`              | Markdown |
| Phase 12 準拠チェック（root evidence） | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Markdown |

---

## 完了条件チェックリスト

- [ ] Task 12-1（実装ガイド）が `outputs/phase-12/implementation-guide.md` に出力されていること（中学生レベル＋技術者レベルの2パート構成）
- [ ] Task 12-2（システム仕様書更新）が `outputs/phase-12/system-spec-update-summary.md` に記録されていること（Step 1-A/1-B/1-C/Step 2 全て）
- [ ] Task 12-3（変更履歴）が `outputs/phase-12/documentation-changelog.md` に記録されていること（「該当なし」も含む）
- [ ] Task 12-4（未タスク検出）が `outputs/phase-12/unassigned-task-detection.md` に出力されていること（0件でも出力）
- [ ] Task 12-5（スキルフィードバック）が `outputs/phase-12/skill-feedback-report.md` に出力されていること（改善点なしでも出力）
- [ ] Task 12-6（root evidence）が `outputs/phase-12/phase12-task-spec-compliance-check.md` に出力されていること
- [ ] `outputs/phase-12/` 配下の全成果物（6ファイル）が生成されていること

---

## Phase 末端アクション【必須】

Phase 12 完了時に以下を実行すること:

1. `outputs/phase-12/implementation-guide.md` を生成する（2パート構成を忘れずに）
2. `outputs/phase-12/system-spec-update-summary.md` に Step 1-A/1-B/1-C/Step 2 の更新結果を記録する
3. `outputs/phase-12/documentation-changelog.md` に全 Step の結果を記録する（「該当なし」も明記）
4. `outputs/phase-12/unassigned-task-detection.md` を生成する（0件でも「未タスクなし」と記録）
5. `outputs/phase-12/skill-feedback-report.md` を生成する（改善点なしでも「改善提案なし」と記録）
6. `outputs/phase-12/phase12-task-spec-compliance-check.md` を生成し、全タスクの完了を確認する
7. 全完了条件チェックリストを確認し、未完了項目がある場合は完了させてから Phase 13 へ進む

---

## 依存関係

| 依存Phase/タスク | 依存内容                                                                         |
| ---------------- | -------------------------------------------------------------------------------- |
| Phase 11 完了    | 自動テスト全件 PASS の証跡が `outputs/phase-11/manual-test-result.md` にあること |
| Phase 5 完了     | `ValidateCronOptions` の実装が `scheduleConfigValidator.ts` に反映されていること |
| Phase 10 完了    | 最終レビューゲートで PASS 判定されていること                                     |

---

## Phase 実行記録テンプレート

```markdown
## Phase 12 実行記録

- 実行日時: YYYY-MM-DD HH:mm
- 実行者: -
- Task 12-1（実装ガイド）: [ ] 完了 / [ ] 未完了
- Task 12-2（システム仕様書更新）: [ ] 完了 / [ ] 未完了
  - Step 1-A: [ ] 完了 / [ ] 未完了
  - Step 1-B: [ ] 完了 / [ ] 未完了
  - Step 1-C: [ ] 完了 / [ ] 未完了
  - Step 2: [ ] 完了 / [ ] 未完了
- Task 12-3（変更履歴）: [ ] 完了 / [ ] 未完了
- Task 12-4（未タスク検出）: [ ] 完了 / [ ] 未完了（検出件数: X）
- Task 12-5（スキルフィードバック）: [ ] 完了 / [ ] 未完了
- Task 12-6（root evidence）: [ ] 完了 / [ ] 未完了
- 完了条件充足状況: X / 7 項目完了
- Phase 13 移行判定: [ ] PASS / [ ] HOLD（理由: ）
```

---

## 次のPhase案内

**Phase 13: PR作成** — ユーザーの明示的な承認後に、コミットと PR を作成する。Phase 12 の全成果物が揃っていることを確認してから Phase 13 へ進むこと。

**ゲート条件**: Phase 12 の全完了条件（7項目）を満たさない場合、Phase 13 へ進まないこと。
