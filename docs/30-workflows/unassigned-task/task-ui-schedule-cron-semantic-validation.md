# TASK-UI-SCHEDULE-CRON-SEMANTIC-001 意味論的 cron 検証の追加 - タスク指示書

## メタ情報

```yaml
issue_number: 2074
```

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | TASK-UI-SCHEDULE-CRON-SEMANTIC-001                       |
| タスク名     | 意味論的 cron 検証の追加                                 |
| 分類         | 改善（バリデーション強化）                               |
| 対象機能     | スケジュール設定 / cronExpression バリデーション         |
| 優先度       | 中                                                       |
| 見積もり規模 | 小〜中規模                                               |
| ステータス   | 未実施                                                   |
| 発見元       | TASK-UI-SCHEDULE-VISUAL-PICKER-001 Phase 12 未タスク検出 |
| 発見日       | 2026-04-09                                               |
| 関連Issue    | daishiman/AIWorkflowOrchestrator#2000                    |
| 前提タスク   | TASK-UI-SCHEDULE-VISUAL-PICKER-001（Phase 1-12完了済み） |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`scheduleConfigValidator.ts` の `validateCronExpression` 関数は、5フィールド構文チェックと各フィールドの値域（分: 0-59、時: 0-23 など）のみを検証する。構文的に正しくても意味的に無効な値（例: `0 0 31 2 *` = 2月31日）を通過させてしまう。

### 1.2 問題点・課題

- 「2月31日」「31日のある月のみ」などのスケジュールが設定可能
- ステップ値 `*/30` が `59` の分フィールドに組み合わさる場合（例: `59/30`）なども許容してしまう
- ユーザーがスケジュールを設定しても、実際には永久に実行されないケースが発生しうる

### 1.3 放置した場合の影響

- スケジュール設定後に「なぜ実行されないのか」とユーザーが混乱する
- サポートコストの増加

## 2. 何を達成するか（What）

### 2.1 目的

構文チェックに加え、実際に次の実行日時が存在するかどうかを確認する「意味論的バリデーション」を追加する。

### 2.2 最終ゴール

`validateCronExpression` 呼び出し時に、次回実行タイムスタンプが算出できないような cron 式（存在しない日付等）を検出し、ユーザーに警告を返せる状態にする。

### 2.3 スコープ

#### 含むもの

- `scheduleConfigValidator.ts` への意味論的検証ロジック追加
- `cron-parser` ライブラリ（または同等品）の導入検討・評価
- 既存テストへの意味論的不正ケースの追加

#### 含まないもの

- バックエンド（ScheduleStore / SkillScheduler）の変更
- IPC チャンネルの変更
- UI の変更（エラーメッセージ表示は既存の仕組みを流用）

### 2.4 成果物

- 更新された `scheduleConfigValidator.ts`
- 追加テストケース（`scheduleConfigValidator.edge.test.ts` 拡充）

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-UI-SCHEDULE-VISUAL-PICKER-001` が完了していること
- `scheduleConfigValidator.ts` が実装済みであること

### 3.2 依存タスク

なし。

### 3.3 必要な知識

- cron 式の意味論（曜日/日付の組み合わせルール、うるう年考慮）
- `cron-parser` ライブラリの API

### 3.4 推奨アプローチ

1. `cron-parser` ライブラリ（`npm: cron-parser`）を評価し、外部依存なし路線と比較する
2. 外部ライブラリ不可の場合は `next-execution-time` を手動算出するロジックを実装
3. 既存の `validateCronExpression` に `semanticCheck` フラグを追加し、オプトイン方式で有効化する

## 4. 実行手順

### Phase構成

要件定義 → 実装（TDD） → テスト拡充 → 統合確認

### Phase 1: ライブラリ選定と実装

#### 目的

意味論的バリデーションの実装方針を決定し、コードを実装する。

#### 手順

1. `cron-parser` 等のライブラリを調査し、バンドルサイズ・ライセンスを評価する
2. `validateCronExpression` に `options.semantic` フラグを追加する
3. Red テスト（`"0 0 31 2 *"` 等）を先に作成する
4. Green になるまで実装する

#### 成果物

- 更新 `scheduleConfigValidator.ts`
- 追加テスト

#### 完了条件

意味論的に不正な cron 式でエラーが返ること。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `"0 0 31 2 *"` に対して `validateCronExpression` がエラーを返す
- [ ] `"0 0 * * *"` 等の正常なケースは引き続き PASS する

### 品質要件

- [ ] 既存テスト全件 PASS
- [ ] 追加テストケースでカバレッジが向上している

### ドキュメント要件

- [ ] `scheduleConfigValidator.ts` の JSDoc を更新する

## 6. 検証方法

### テストケース

- `"0 0 31 2 *"` → エラー（2月31日は存在しない）
- `"0 0 29 2 *"` → 警告（うるう年のみ有効）
- `"0 0 30 * *"` → PASS（30日は多数の月に存在）
- `"0 0 * * *"` → PASS（毎日実行）

### 検証手順

```bash
pnpm vitest run src/__tests__/utils/scheduleConfigValidator.test.ts
pnpm vitest run src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

## 7. リスクと対策

| リスク                                     | 影響度 | 発生確率 | 対策                                             |
| ------------------------------------------ | ------ | -------- | ------------------------------------------------ |
| 外部ライブラリ追加によるバンドルサイズ増大 | 中     | 中       | tree-shaking 対応ライブラリを選定する            |
| 意味論的チェックの過剰拒否                 | 中     | 低       | テストケースを事前に網羅し、正常ケースを保護する |
| うるう年の考慮漏れ                         | 低     | 中       | `"0 0 29 2 *"` のケースをテストに含める          |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/TASK-UI-SCHEDULE-VISUAL-PICKER-001/outputs/phase-12/implementation-guide.md`
- `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`
- `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts`

### 参考資料

- [cron-parser npm](https://www.npmjs.com/package/cron-parser)

## 9. 備考

### 苦戦箇所の記録（TASK-UI-SCHEDULE-VISUAL-PICKER-001 より）

この未タスクは、Phase 12 の未タスク検出時に発見された。現行の `validateCronExpression` は構文チェックのみで意味論的な検証を行っていない。意味論的バリデーションを追加する際は、cron 式の曜日と日付が両方指定された場合の OR 解釈（Unix cron の仕様）に注意が必要。

### 補足事項

TASK-UI-SCHEDULE-VISUAL-PICKER-001 のスコープ外（バックエンド変更なし要件）のため本タスクとして独立させた。
