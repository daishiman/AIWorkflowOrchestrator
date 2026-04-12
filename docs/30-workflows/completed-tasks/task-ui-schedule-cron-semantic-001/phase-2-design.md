# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| Phase      | 2                                  |
| タスクID   | TASK-UI-SCHEDULE-CRON-SEMANTIC-001 |
| 機能名     | 意味論的 cron バリデーション追加   |
| タスク種別 | implementation                     |
| 前Phase    | Phase 1: 要件定義                  |
| 次Phase    | Phase 3: 設計レビューゲート        |
| ステータス | 未実施                             |
| 作成日     | 2026-04-12                         |

---

## 目的

Phase 1 で確定した要件・受け入れ基準に基づき、`validateCronExpression` 関数の意味論的バリデーション追加の設計を確定する。

具体的には以下を決定する:

1. `ValidateCronOptions` インターフェース定義と後方互換性の確保方針
2. `cron-parser` ライブラリ vs カスタム実装の最終選択
3. 意味論的バリデーションロジックのフロー設計
4. concern 分離（バンドルサイズ / 後方互換性 / テスタビリティ）

---

## 設計方針

### 基本方針

| 設計要素         | 決定内容                                                     |
| ---------------- | ------------------------------------------------------------ | -------------------- |
| 後方互換性       | `options` パラメータはオプショナル。既存呼び出しは変更不要   |
| semantic 有効化  | `options.semantic === true` の場合のみ意味論的チェックを実行 |
| エラーメッセージ | 既存の `string                                               | null` 戻り値型を維持 |
| ライブラリ選択   | `cron-parser` を推奨（詳細は比較テーブル参照）               |
| JSDoc 更新       | `@param options.semantic` の説明を追加（AC-5 対応）          |

### 後方互換性の保証

```
既存呼び出し例:
  validateCronExpression("0 0 31 2 *")
  → options が undefined → semantic チェックをスキップ → 従来通り null を返す（構文的には有効）

新規呼び出し例（semantic 有効化）:
  validateCronExpression("0 0 31 2 *", { semantic: true })
  → next-execution-time 計算を実施 → 到達不能と判定 → エラー文字列を返す
```

---

## 設計詳細

### 関数シグネチャの変更

**変更前**:

```typescript
export function validateCronExpression(value: string): string | null;
```

**変更後**:

```typescript
/**
 * cron 式の 5 フィールド構文とフィールド値の範囲を検証する。
 * options.semantic が true の場合は next-execution-time 計算による到達可能性チェックも実行する。
 *
 * @param value - 検証対象の cron 式文字列
 * @param options - バリデーションオプション
 * @param options.semantic - true の場合、意味論的検証（next-run 計算）を追加実行する（デフォルト: false）
 * @returns エラーメッセージ文字列、または有効なら null
 */
export function validateCronExpression(
  value: string,
  options?: ValidateCronOptions,
): string | null;
```

### `ValidateCronOptions` インターフェース定義

```typescript
/**
 * validateCronExpression のオプション設定
 */
export interface ValidateCronOptions {
  /**
   * true の場合、構文・値域チェックに加えて next-execution-time 計算による
   * 意味論的バリデーション（到達可能性チェック）を実行する。
   * false または省略した場合は従来の構文チェックのみ実行（後方互換）。
   * @default false
   */
  semantic?: boolean;
}
```

### 意味論的バリデーションロジック フロー図

```
validateCronExpression(value, options)
│
├─ [1] trimmed が空文字 → "cron式を入力してください" を返す
│
├─ [2] fields.length !== 5 → フィールド数エラーを返す
│
├─ [3] 各フィールドの値域チェック（既存ロジック）
│       └─ 不正 → "cron式の形式が正しくありません" を返す
│
├─ [4] options?.semantic !== true → null を返す（従来動作・後方互換）
│
└─ [5] semantic チェック実行（options.semantic === true の場合のみ）
        │
        ├─ cron-parser を使用して next-execution-time を計算
        │   CronExpressionParser.parse(trimmed)
        │
        ├─ 計算成功 → null を返す（到達可能）
        │
        └─ 計算失敗（例外 / 到達不能） → "指定した日付の組み合わせは存在しません" を返す
```

### 意味論的バリデーションの実装イメージ

```typescript
import { CronExpressionParser } from "cron-parser";

// [5] semantic チェック（cron-parser 使用）
if (options?.semantic === true) {
  try {
    // cron-parser が next-execution を計算できる場合は有効
    const interval = CronExpressionParser.parse(trimmed);
    interval.next(); // 次の実行時刻が計算できるか確認
  } catch {
    return "指定した日付の組み合わせは存在しません（例: 2月31日）";
  }
}

return null;
```

---

## cron-parser vs カスタム実装 比較テーブル

| 評価軸             | cron-parser ライブラリ                          | カスタム実装                                        |
| ------------------ | ----------------------------------------------- | --------------------------------------------------- |
| 正確性             | 高（月末日・うるう年・到達可能性判定）          | 低〜中（2月31日のような単純ケースのみ対応しやすい） |
| 実装コスト         | 低（`CronExpressionParser.parse` 呼び出しのみ） | 高（月末計算・うるう年ロジック自前実装）            |
| バンドルサイズ影響 | あり（~10KB gzip）                              | なし（0追加）                                       |
| 保守性             | npm 更新で仕様追従                              | 自前でカバレッジ維持が必要                          |
| テスタビリティ     | 高（ライブラリ動作が確立済み）                  | 中（エッジケースのカバレッジが必要）                |
| Renderer バンドル  | tree-shaking 適用可                             | 不要                                                |
| 後方互換性リスク   | なし（`options.semantic` で明示有効化）         | なし（同左）                                        |
| **総合評価**       | **推奨**                                        | 不採用                                              |

**推奨理由**: `cron-parser` は next-execution-time 計算を提供し、`"0 0 31 2 *"` のような意味論的不正ケースを安全側に検出できる。バンドルサイズ増加はあるが、Renderer バンドルで tree-shaking が効くため実影響は限定的。カスタム実装では 2 月 31 日以外のエッジケース（例: `"0 0 30 2 *"` や月末・うるう年の判定）の正確な対処が難しく、保守コストが高い。

---

## concern 分離

### バンドルサイズ

- `cron-parser` は Renderer バンドルに追加される（Main Process には不要）
- `apps/desktop/package.json` への追加。`cron-parser` は `dependencies` に追加する
- `import { CronExpressionParser } from "cron-parser"` を `scheduleConfigValidator.ts` でのみ使用
- `options.semantic === true` の場合のみ実行するため、semantic 未使用コンポーネントへの影響なし

### 後方互換性

- `options` パラメータはオプショナル（`?`）のため、既存の全呼び出し箇所への変更は不要
- `validateSkillWizardScheduleConfig` の内部実装は変更なし（`validateCronExpression` を呼ぶが `options` を渡さない）
- 既存テスト SCV-01〜SCV-12 は `options` 未指定で呼ぶため、引き続き PASS

### テスタビリティ

- semantic チェックは `options.semantic: true` で明示的に有効化するため、ユニットテストで制御しやすい
- `cron-parser` のモック不要（実際の計算ロジックを使用してテスト）
- 正常ケース（`options.semantic: true` + 有効な cron）と不正ケース（`options.semantic: true` + 存在しない日付）を独立してテスト可能

---

## 変更ファイルリスト

### 新規作成

なし

### 修正

| ファイル                                                                | 変更種別 | 変更内容                                                                                                               |
| ----------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`            | 修正     | `ValidateCronOptions` インターフェース追加、`validateCronExpression` シグネチャ拡張、semantic ロジック追加、JSDoc 更新 |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`      | 修正     | semantic 不正ケーステスト追加（AC-1、AC-4）                                                                            |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | 修正     | semantic 追加エッジケース（AC-4 カバレッジ向上）                                                                       |

### 依存関係追加

| パッケージ名  | バージョン | 追加先                      | 種別           |
| ------------- | ---------- | --------------------------- | -------------- |
| `cron-parser` | `^5.x`     | `apps/desktop/package.json` | `dependencies` |

---

## 設計判断記録

| 決定事項                                 | 選択                               | 理由                                                       |
| ---------------------------------------- | ---------------------------------- | ---------------------------------------------------------- |
| semantic 有効化方式                      | opt-in（`options.semantic: true`） | 後方互換性を壊さず、既存呼び出しへの影響ゼロ               |
| ライブラリ選択                           | `cron-parser`                      | 正確性・保守性が高く、実装コストが低い                     |
| `validateSkillWizardScheduleConfig` 変更 | 変更しない                         | 呼び出し元の判断で `options` を渡す設計とする（UI 側判断） |
| バンドル追加先                           | `dependencies`（要確認）           | Renderer で実行時に必要なため（dev 依存ではない）          |
| エラーメッセージ形式                     | 既存パターンに準拠した日本語       | UI での表示は既存 `ValidationResult` の仕組みを流用        |

---

## 統合テスト連携

- `ValidateCronOptions` インターフェースを Phase 4（テスト作成）のインプットとして提供
- semantic フラグの有効化方法を Phase 4 テストケース設計に反映（`options: { semantic: true }` を明示）
- `"0 0 31 2 *"` のエラーケースを Phase 4 で先行作成し、Phase 5 実装で期待値を満たす
- `cron-parser` インストール手順を Phase 5 実装の冒頭タスクとして記録
- NON_VISUAL 評価（Phase 11）：バリデーターロジックのみの変更のため、スクリーンショット不要・コード動作確認のみ

---

## 完了条件チェックリスト

- [ ] `ValidateCronOptions` インターフェースの定義が確定していること
- [ ] `validateCronExpression` の変更後シグネチャが確定していること
- [ ] `cron-parser` を推奨ライブラリとして採用する判断が記録されていること
- [ ] 意味論的バリデーションロジックのフローが文書化されていること
- [ ] 後方互換性の確保方針（`options` オプショナル）が確定していること
- [ ] 変更ファイルリスト（コード1種 + テスト2種 + 依存関係1件）が確定していること
- [ ] `outputs/phase-2/` 配下の全成果物が生成されていること

---

## Phase 末端アクション【必須】

Phase 2 完了時に以下を実行すること:

1. `outputs/phase-2/api-design.md` に `ValidateCronOptions` インターフェースと変更後シグネチャを記録する
2. `outputs/phase-2/library-comparison.md` に cron-parser vs カスタム実装の比較テーブルと採用理由を記録する
3. `outputs/phase-2/design-consistency-check.md` に後方互換性・バンドルサイズ・テスタビリティの concern 分離を記録する
4. 全完了条件チェックリストを確認し、未完了項目がある場合は完了させてから Phase 3 へ進む

---

## 依存関係

| 依存Phase/タスク                   | 依存内容                                       |
| ---------------------------------- | ---------------------------------------------- |
| Phase 1 完了                       | 受け入れ基準（AC-1〜AC-5）・ライブラリ評価計画 |
| TASK-UI-SCHEDULE-VISUAL-PICKER-001 | 既存 `scheduleConfigValidator.ts` の実装       |

---

## Phase 実行記録テンプレート

```markdown
## Phase 2 実行記録

- 実行日時: YYYY-MM-DD HH:mm
- 実行者: -
- ライブラリ選択: [ ] cron-parser 採用 / [ ] カスタム実装 / [ ] その他
- シグネチャ変更確定: [ ] YES / [ ] NO（理由: ）
- concern 分離確認: [ ] バンドルサイズ / [ ] 後方互換性 / [ ] テスタビリティ
- 完了条件充足状況: X / 7 項目完了
- Phase 3 移行判定: [ ] PASS / [ ] HOLD（理由: ）
```

---

## 次のPhase案内

**Phase 3: 設計レビューゲート** — Phase 2 で確定した設計の機能性・後方互換性・パフォーマンス・テスタビリティ・セキュリティをレビューし、PASS / MINOR / MAJOR を判定する。

**ゲート条件**: Phase 1〜2 の全完了条件を満たさない場合、Phase 3 へ進まないこと。
