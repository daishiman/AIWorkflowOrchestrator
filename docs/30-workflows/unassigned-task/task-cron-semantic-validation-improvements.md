# cronExpression 意味論的バリデーション改善 - タスク指示書

## メタ情報

```yaml
issue_number: 2082
task_id: TASK-CRON-SEMANTIC-VALIDATION-001
status: open
priority: medium
scale: medium
task_type: IMPROVEMENT
```

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | TASK-CRON-SEMANTIC-VALIDATION-001                                          |
| タスク名     | cronExpression 意味論的バリデーション改善                                  |
| 分類         | 改善（UX品質向上）                                                         |
| 対象機能     | VisualCronPicker / scheduleConfigValidator / cronExpression バリデーション |
| 優先度       | 中（`priority:medium`）                                                    |
| 見積もり規模 | 中規模（`scale:medium`）                                                   |
| ステータス   | 未実施（`status:open`）                                                    |
| 発見元       | TASK-UI-SCHEDULE-VISUAL-PICKER-001 Phase 12（Task 12-4: 未タスク検出）     |
| 発見日       | 2026-04-09                                                                 |
| タスク分類   | IMPROVEMENT タスク（UX 改善）                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`scheduleConfigValidator.ts` の `validateCronExpression` 関数は、現在 5 フィールド構文チェックと値域（0-59 等）の範囲チェックのみを行っている。

### 1.2 問題点・課題

1. **「2月31日」を許容する**: `0 9 31 2 *` のような意味論的に存在しない日時を有効な cron 式として通過させる。
2. **矛盾するステップ値を許容する**: `0 0/30 * * *` のような合理的な式でも、より複雑な矛盾パターンを検出できない。
3. **実行されない cron 式が保存される**: ユーザーが存在しない日時を設定した場合、スケジュールが永久に実行されない状態になる。

### 1.3 放置した場合の影響

- ユーザーが設定したスケジュールが一度も実行されないまま放置される
- ユーザーが原因を特定できず困惑する（UX 低下）
- データ破壊はないが、運用品質に影響する

---

## 2. 何を達成するか（What）

### 2.1 目的

cron 式の意味論的妥当性を検証し、存在しない日時の設定をユーザーに事前に伝える。

### 2.2 最終ゴール

`validateCronExpression()` が実行不可能な cron 式（例: `0 9 31 2 *`）を検出し、ユーザーフレンドリーなエラーメッセージを表示する状態。

### 2.3 スコープ

**含むもの**:

- cron-parser ライブラリ（または同等のブラウザ対応ライブラリ）の導入検討
- next-execution-time 計算による実行可能性チェック実装
- 日本語エラーメッセージの定義
- `scheduleConfigValidator.ts` の `validateCronExpression` 拡張
- VisualCronPicker / ScheduleDialog でのエラー表示統合

**含まないもの**:

- cron 式の手書き入力サポート（AdvancedToggle 経由は既存のまま）
- タイムゾーン考慮の意味論的検証（別タスク）
- 複数年先の計算最適化

### 2.4 成果物

- `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`（改善版）
- テストケース（2月29日・31日、毎月30日設定等のエッジケース）
- エラーメッセージ定義（`ja` / `en` 対応）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-UI-SCHEDULE-VISUAL-PICKER-001` の実装完了（本タスクはそのフォローアップ）
- Node.js / ブラウザ両対応の cron ライブラリの利用可否確認が必要

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識

- cron 式の 5 フィールド構文理解
- cron-parser ライブラリの `parseExpression().next()` API 使用方法
- 日付計算（うるう年、月末日判定）

### 3.4 推奨アプローチ

**Option A（推奨）: cron-parser ライブラリ**

```typescript
import { parseExpression } from "cron-parser";

function validateCronSemantics(expr: string): {
  valid: boolean;
  error?: string;
} {
  try {
    const interval = parseExpression(expr);
    interval.next(); // 次の実行時刻が計算できればOK
    return { valid: true };
  } catch (e) {
    return { valid: false, error: "この設定では実行日時が存在しません" };
  }
}
```

**Option B: browser-safe 実装（外部依存なし）**

月の最終日チェックなど代表的なエッジケースのみを手動実装する。網羅性は Option A に劣るが、バンドルサイズへの影響がない。

---

## 4. 実行手順

### Phase 1-3: 要件・設計

- ライブラリ選定（cron-parser vs 手動実装）の判断
- エラーメッセージ定義（日本語 / 英語）
- バリデーションフロー設計（構文チェック → 値域チェック → 意味論チェック の順）

### Phase 4: テスト設計

- エッジケーステーブル作成:
  - `0 9 31 2 *`（2月31日） → エラー
  - `0 9 29 2 *`（2月29日、うるう年以外） → エラー
  - `0 9 30 2 *`（2月30日） → エラー
  - `0 9 1 2 *`（2月1日） → 正常
  - `0 9 * * 1-5`（平日毎日） → 正常

### Phase 5: 実装

- `scheduleConfigValidator.ts` の `validateCronExpression` 拡張
- エラー型定義の追加（`CronValidationError`）
- VisualCronPicker / ScheduleDialog のエラー表示統合

### Phase 6-10: テスト・レビュー・QA

### Phase 11: 手動テスト

- UI で「2月31日」設定を試み、エラーメッセージを確認
- 有効な日時（例: 毎月1日）設定で保存できることを確認

### Phase 12: ドキュメント更新

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `0 9 31 2 *` でバリデーションエラーが返される
- [ ] 日本語エラーメッセージが VisualCronPicker / ScheduleDialog に表示される
- [ ] 有効な cron 式では保存ボタンが有効のまま

### 品質要件

- [ ] テストカバレッジ: 新規コード 80%以上
- [ ] 既存テスト PASS（回帰なし）
- [ ] バリデーション処理時間 < 100ms

### ドキュメント要件

- [ ] `scheduleConfigValidator.ts` の JSDoc 更新
- [ ] エラーメッセージ一覧を `implementation-guide.md` に追記

---

## 6. 検証方法

### テストケース

| cron 式      | 期待結果 | 備考                  |
| ------------ | -------- | --------------------- |
| `0 9 31 2 *` | エラー   | 2月31日は存在しない   |
| `0 9 29 2 *` | エラー   | 2月29日（うるう年外） |
| `0 9 30 2 *` | エラー   | 2月30日は存在しない   |
| `0 9 1 2 *`  | 正常     | 2月1日は有効          |
| `0 9 * * *`  | 正常     | 毎日9時               |

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                               |
| ---------------------------- | ------ | -------- | ---------------------------------- |
| cron-parser がブラウザ非対応 | 高     | 中       | Option B（手動実装）で代替         |
| バンドルサイズ増加           | 中     | 中       | tree-shaking 対応ライブラリを選定  |
| `next()` 計算の性能問題      | 中     | 低       | キャッシングまたは debounce で対策 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/TASK-UI-SCHEDULE-VISUAL-PICKER-001/outputs/phase-12/unassigned-task-detection.md`（MEDIUM-01）
- `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`
- `apps/desktop/src/renderer/components/schedule/`

### 参考資料

- [cron-parser npm](https://www.npmjs.com/package/cron-parser)

---

## 9. 備考

### 苦戦箇所

| 項目     | 内容                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| 症状     | 構文チェック PASS の cron 式が実行されないケースを検出できない                  |
| 原因     | `validateCronExpression` が値域のみ検証し、カレンダー上の存在確認を行っていない |
| 対応予定 | cron-parser の `next()` で実行可能性を検証するアプローチを採用                  |
| 再発防止 | Phase 2 設計で「構文 → 値域 → 意味論」の 3 段階バリデーションフローを明記する   |

### 発見経緯

TASK-UI-SCHEDULE-VISUAL-PICKER-001 の Phase 12 (Task 12-4: 未タスク検出) において MEDIUM-01 として検出。CRITICAL/HIGH ではないため当該タスクでは対応せず、フォローアップタスクとして分離した。
