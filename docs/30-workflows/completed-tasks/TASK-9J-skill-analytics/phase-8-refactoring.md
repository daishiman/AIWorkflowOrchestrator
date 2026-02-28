# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 8                                 |
| Phase名    | リファクタリング（TDD: Refactor） |
| タスクID   | TASK-9J                           |
| 前提Phase  | Phase 7（カバレッジ確認）         |
| 後続Phase  | Phase 9（品質保証）               |
| ステータス | 未着手                            |
| 作成日     | 2026-02-28                        |
| 機能名     | TASK-9J-skill-analytics           |

---

## 目的

TDD の Refactor フェーズとして、テストを維持しながらスキル使用統計・分析機能全体（SkillAnalytics / AnalyticsStore / IPCハンドラー）のコード品質を向上させる。
重複コードの抽出、SOLID原則の適用、命名の統一を実施し、保守性を改善する。

## 背景

Phase 5〜7 で実装した SkillAnalytics（統計計算・トレンド集計・サマリー生成）、AnalyticsStore（electron-storeベース永続化）、IPCハンドラー5件は、各レイヤーで類似のバリデーション・エラーハンドリングパターンを繰り返している。
特に statistics / summary / trend の3つの集計メソッドと、5つのIPCハンドラーの3段バリデーションパターンに重複が見込まれる。
統合的なリファクタリングにより、レイヤー横断での品質向上と今後のダッシュボードUI実装時の保守性を確保する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: SkillAnalytics の重複コード分析・抽出

**目的**: SkillAnalytics 内の statistics / summary / trend 集計メソッド間で重複がないか分析し、抽出する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillAnalytics.ts` を読み込む
2. statistics（統計計算）/ summary（サマリー生成）/ trend（トレンド集計）の3メソッドで重複箇所を特定する
3. 日時フィルタリング処理（期間指定によるイベント絞り込み）が各メソッドで共通化可能か分析する
4. スキル名によるイベントグルーピング処理が統一されているか確認する
5. SRP（単一責務原則）の観点で「データ取得」「フィルタリング」「集計」「フォーマット」の責務分離を検討する
6. 抽出・分離する場合は実装し、全テストがパスすることを確認する
7. 分離しない場合はその理由を記録する

**分析観点**:

| 観点                                | 確認内容                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| 日時フィルタリング重複              | statistics/summary/trendの各メソッドで同一の期間フィルタリングが繰り返されていないか |
| イベントグルーピング重複            | スキル名でのグルーピング処理が各メソッドで独立に実装されていないか                   |
| 集計ロジックの責務分離              | SkillAnalyticsが「データ取得」と「集計」の両方を担当し肥大化していないか             |
| エラーハンドリングパターン          | 各メソッドのcatchブロックで同一パターンが繰り返されていないか                        |
| AnalyticsStore との集計ロジック重複 | AnalyticsStore側にも集計ロジックが存在し、SkillAnalyticsと重複していないか           |

**判断基準**:

| 判断     | 条件                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| 抽出する | 3行以上の完全に同一のコードブロックが3箇所以上ある場合                        |
| 分離する | フィルタリング・グルーピングのメソッドが4つ以上あり独立した責務を形成する場合 |
| 見送る   | 抽出・分離すると可読性が低下し、テストの保守コストが増加する場合              |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillAnalytics --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/skillanalytics-refactoring-analysis.md`

---

### タスク2: AnalyticsStore のバリデーション・読み書きロジック抽出

**目的**: AnalyticsStore 内のイベント保存・読み込み・クリーンアップ処理の重複を分析・抽出する

**実行手順**:

1. `apps/desktop/src/main/services/skill/AnalyticsStore.ts` を読み込む
2. recordEvent / getEvents / getStatistics で同一のデータアクセスパターンが繰り返されていないか確認する
3. electron-store からの読み込みデータの実行時バリデーション（P19対策）が統一されているか確認する
4. ISO 8601 日時フィールドのシリアライズ/デシリアライズが一貫しているか確認する
5. イベントデータの整合性チェック（日時範囲、スキル名の存在確認）の共通化可能性を分析する
6. 共通バリデーション関数の抽出可否を判断する
7. 抽出する場合は実装し、全テストがパスすることを確認する

**バリデーション重複候補**:

```typescript
// Before: get系メソッドで繰り返されるパターン（想定）
const rawData = this.store.get("skill-analytics-events");
if (!Array.isArray(rawData)) {
  return [];
}
const events = rawData.filter(
  (e) => typeof e === "object" && e !== null && typeof e.skillName === "string",
);

// After: 共通バリデーション関数（検討）
function validateAndFilterEvents(rawData: unknown): SkillUsageEvent[] {
  // electron-store読み込みデータの実行時バリデーションを1箇所に集約
}
```

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/AnalyticsStore --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/analyticsstore-validation-extraction.md`

---

### タスク3: IPCハンドラーの共通バリデーション関数化

**目的**: 5つの統計関連IPCハンドラーに共通する3段バリデーション（型チェック → 空文字列 → トリム空文字列）を共通関数に抽出する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` の統計関連5ハンドラーを読み込む
2. 各ハンドラーの `validateIpcSender` → バリデーション → try/catch パターンを分析する
3. P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が各ハンドラーで重複していないか確認する
4. 既存の他のskillHandlers（TASK-9A〜9Gで追加されたものを含む）との共通化可能性を確認する
5. 共通バリデーション関数の抽出可否を判断する
6. 抽出する場合は実装し、全テスト（統計関連ハンドラーテスト全件）がパスすることを確認する

**抽出候補**:

```typescript
// Before: 各ハンドラーで繰り返されるパターン
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}

// After: 共通バリデーション関数（検討）
function validateStringArg(value: unknown, argName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: `${argName} must be a non-empty string`,
    };
  }
  return value.trim();
}
```

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose --grep "analytics"
```

**期待される成果物**:

- `outputs/phase-8/ipc-analytics-validation-commonization.md`

---

### タスク4: 命名規則・型定義統一確認

**目的**: スキル使用統計・分析機能の全ファイルで命名規則と型定義が統一されていることを確認する

**実行手順**:

1. 全対象ファイルの命名パターンを確認する
2. P45対策として、IPCハンドラーの引数名が実際の値のセマンティクスと一致しているか確認する
3. boolean変数に `is`/`has`/`can`/`should` プレフィックスが使われているか確認する
4. `packages/shared/src/types/skill-analytics.ts` の型名とプロパティ名がプロジェクト全体の命名規則に準拠しているか確認する
5. 8つの共有インターフェース間で一貫した命名が使用されているか確認する
6. 全テストがパスすることを確認する

**命名規則チェックリスト**:

| チェック項目         | 基準                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| 型名                 | PascalCase（例: `SkillUsageEvent`, `SkillStatistics`, `AnalyticsSummary`） |
| 関数名               | camelCase（例: `recordEvent`, `getStatistics`, `getUsageTrend`）           |
| 定数名               | UPPER_SNAKE_CASE（例: `SKILL_ANALYTICS_RECORD`, `SKILL_ANALYTICS_TREND`）  |
| boolean変数          | `is`/`has`/`can`/`should` プレフィックス                                   |
| 引数名セマンティクス | 実際の値と一致（P45対策: skillName/period等の乖離なし）                    |

**対象ファイル**:

| ファイル                                                 | 確認内容           |
| -------------------------------------------------------- | ------------------ |
| `apps/desktop/src/main/services/skill/SkillAnalytics.ts` | サービス層命名     |
| `apps/desktop/src/main/services/skill/AnalyticsStore.ts` | ストア層命名       |
| `apps/desktop/src/main/ipc/skillHandlers.ts`             | IPCハンドラー命名  |
| `packages/shared/src/types/skill-analytics.ts`           | 型定義命名         |
| `apps/desktop/src/preload/skill-api.ts`                  | Preload API命名    |
| `apps/desktop/src/preload/types.ts`                      | 型定義命名         |
| `apps/desktop/src/preload/channels.ts`                   | チャンネル定数命名 |

**確認コマンド**:

```bash
# P45対策: 引数名の一致確認
grep -rn "skillName\|period\|format" apps/desktop/src/main/services/skill/SkillAnalytics.ts apps/desktop/src/main/services/skill/AnalyticsStore.ts apps/desktop/src/main/ipc/skillHandlers.ts
```

**期待される成果物**:

- `outputs/phase-8/naming-type-unification.md`

---

## 参照資料

| 参照資料                 | パス                                                             | 内容                   |
| ------------------------ | ---------------------------------------------------------------- | ---------------------- |
| SkillAnalytics           | `apps/desktop/src/main/services/skill/SkillAnalytics.ts`         | 統計計算実装           |
| AnalyticsStore           | `apps/desktop/src/main/services/skill/AnalyticsStore.ts`         | 永続化実装             |
| IPCハンドラー            | `apps/desktop/src/main/ipc/skillHandlers.ts`                     | Main Processハンドラー |
| 統計型定義               | `packages/shared/src/types/skill-analytics.ts`                   | 共有型定義（8IF）      |
| Preload API              | `apps/desktop/src/preload/skill-api.ts`                          | Preload API実装        |
| Preload型定義            | `apps/desktop/src/preload/types.ts`                              | 型定義                 |
| チャンネル定数           | `apps/desktop/src/preload/channels.ts`                           | チャンネル定義         |
| テストファイル           | `apps/desktop/src/main/services/skill/__tests__/SkillAnalytics*` | 統計計算テスト         |
| テストファイル           | `apps/desktop/src/main/services/skill/__tests__/AnalyticsStore*` | ストアテスト           |
| Phase 1 要件成果物       | `outputs/phase-1/`                                               | 要件・受入基準         |
| Phase 2 設計成果物       | `outputs/phase-2/`                                               | 設計仕様               |
| Phase 5 実装成果物       | `outputs/phase-5/`                                               | 実装サマリー           |
| Phase 6 テスト拡充成果物 | `outputs/phase-6/`                                               | 追加テスト結果         |
| Phase 7 カバレッジ成果物 | `outputs/phase-7/`                                               | カバレッジ判定結果     |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                          | 内容             |
| ------------------ | ----------------------------------------------------------------------------- | ---------------- |
| IPC仕様            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`          | IPC チャンネル   |
| サービス設計       | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` | Electronサービス |
| セキュリティ原則   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | IPC セキュリティ |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | エラーカテゴリ   |

---

## 成果物

| 成果物                       | パス                                                        | 内容                               |
| ---------------------------- | ----------------------------------------------------------- | ---------------------------------- |
| SkillAnalyticsリファクタ分析 | `outputs/phase-8/skillanalytics-refactoring-analysis.md`    | 統計集計メソッド重複分析・抽出結果 |
| AnalyticsStoreバリデーション | `outputs/phase-8/analyticsstore-validation-extraction.md`   | バリデーション共通化結果           |
| IPCバリデーション共通化      | `outputs/phase-8/ipc-analytics-validation-commonization.md` | 3段バリデーション共通化結果        |
| 命名・型定義統一             | `outputs/phase-8/naming-type-unification.md`                | 命名規則・型統一確認結果           |
| リファクタ総括ログ           | `outputs/phase-8/refactoring-log.md`                        | 4成果物の変更点・回帰確認の要約    |

---

## 統合テスト連携

> リファクタ後の統合テスト継続成功を確認する

| 確認項目                   | 基準                                           |
| -------------------------- | ---------------------------------------------- |
| 全ユニットテスト           | 100% パス                                      |
| SkillAnalyticsテスト       | 統計計算・トレンド集計テスト全件PASS           |
| AnalyticsStoreテスト       | 永続化・読み込み・クリーンアップテスト全件PASS |
| IPCハンドラーテスト（5件） | 全テストケースPASS                             |
| 統計型テスト               | 型定義テスト全件PASS                           |
| セキュリティテスト         | sender検証・バリデーションPASS                 |
| カバレッジ維持             | リファクタ前と同等以上                         |

---

## TDD検証

### TDD サイクル確認

```bash
# リファクタリング中は継続的にテスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillAnalytics --watch
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/AnalyticsStore --watch
```

**確認項目**:

- [ ] リファクタリング後もSkillAnalyticsテストが全て成功する
- [ ] リファクタリング後もAnalyticsStoreテストが全て成功する
- [ ] リファクタリング後もIPCハンドラーテスト（統計関連5件）が全て成功する
- [ ] リファクタリング後も型定義テストが全て成功する

---

## 完了条件

- [ ] SkillAnalyticsの重複コード分析と抽出判断（実施または見送り理由記録）が完了している
- [ ] AnalyticsStoreのバリデーション・読み書きロジック共通化判断が完了している
- [ ] IPCハンドラーの3段バリデーション共通化判断が完了している
- [ ] 命名規則・型定義が全ファイルで統一されている（P45対策: skillName統一を含む）
- [ ] 8つの共有インターフェース間で一貫した命名が使用されている
- [ ] 全てのテストがパスしている
- [ ] カバレッジがリファクタ前と同等以上である

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] テストが継続してGreen状態であることを確認

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9J-skill-analytics/phase-9-quality-assurance.md`
