# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 9                              |
| Phase名    | 品質保証                       |
| タスクID   | TASK-9J                        |
| 前提Phase  | Phase 8（リファクタリング）    |
| 後続Phase  | Phase 10（最終レビューゲート） |
| ステータス | 未着手                         |
| 作成日     | 2026-02-28                     |
| 機能名     | TASK-9J-skill-analytics        |

---

## 目的

静的解析、型チェック、セキュリティ検証、テスト実行の4観点からスキル使用統計・分析機能全体の品質を検証する。
プロジェクト品質基準（Line Coverage 80%+、Branch Coverage 60%+、Function Coverage 80%+）を満たしていることを確認する。

## 背景

スキル使用統計・分析機能はMain Process（SkillAnalytics + AnalyticsStore + IPCハンドラー5件）とPreload層の2レイヤーにまたがる。
IPCハンドラーはセキュリティ境界に位置し、10,000件以上のイベントデータを集計する処理を制御するため、送信元検証と入力バリデーションに加え、パフォーマンス検証が重要である。
UI層はスコープ外（TASK-9J）であるため、UIコンポーネントの品質検証は対象外とする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Lint 検証

**目的**: ESLint ルールへの準拠を全対象ファイルで確認する

**実行手順**:

1. ESLint を全対象ファイルに対して実行する
2. エラー・警告を確認する
3. 問題があれば修正する
4. 再度 Lint を実行してクリアを確認する

**コマンド**:

```bash
# Lint 実行（desktopパッケージ）
pnpm --filter @repo/desktop lint

# sharedパッケージも確認
pnpm --filter @repo/shared lint

# 自動修正
pnpm --filter @repo/desktop lint --fix
```

**検証対象ファイル**:

| ファイル                                                 | 確認項目                   |
| -------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/main/services/skill/SkillAnalytics.ts` | 統計計算のLintクリア       |
| `apps/desktop/src/main/services/skill/AnalyticsStore.ts` | ストアのLintクリア         |
| `apps/desktop/src/main/ipc/skillHandlers.ts`             | IPCハンドラーのLintクリア  |
| `packages/shared/src/types/skill-analytics.ts`           | 型定義のLintクリア         |
| `packages/shared/src/types/index.ts`                     | re-exportのLintクリア      |
| `apps/desktop/src/preload/skill-api.ts`                  | Preload APIのLintクリア    |
| `apps/desktop/src/preload/channels.ts`                   | チャンネル定数のLintクリア |
| `apps/desktop/src/preload/types.ts`                      | 型定義のLintクリア         |
| `apps/desktop/src/main/ipc/index.ts`                     | 初期化コードのLintクリア   |

**期待される成果物**:

- `outputs/phase-9/lint-report.md`

---

### タスク2: 型チェック検証

**目的**: TypeScript の型エラーがないことを確認し、レイヤー間の型整合性を検証する

**実行手順**:

1. TypeScript コンパイラを desktopパッケージとsharedパッケージに対して実行する
2. `packages/shared/src/types/skill-analytics.ts` の8インターフェースが正しくexportされていることを確認する
3. `preload/types.ts` と `skillHandlers.ts` の型整合性を確認する
4. P32チェック（型定義の二箇所同時更新）を実施する

**コマンド**:

```bash
# 型チェック実行
pnpm --filter @repo/desktop typecheck

# shared パッケージも確認
pnpm --filter @repo/shared typecheck
```

**型整合性チェックポイント**:

| チェック項目                 | 確認内容                                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| Preload型 ↔ Mainハンドラー型 | 5メソッド（record/statistics/summary/trend/export）全ての引数型・戻り値型がハンドラーのレスポンス型と一致 |
| チャンネル定数整合           | `IPC_CHANNELS` に5チャンネル（SKILL_ANALYTICS_RECORD/STATISTICS/SUMMARY/TREND/EXPORT）が定義              |
| ホワイトリスト整合           | `ALLOWED_INVOKE_CHANNELS` に5チャンネルが追加されている                                                   |
| 共有型定義整合               | `packages/shared/src/types/skill-analytics.ts` の8インターフェースが `index.ts` から正しくre-export       |
| SkillUsageEvent型一貫性      | SkillAnalytics / AnalyticsStore / IPCハンドラーが同一の SkillUsageEvent 型を参照している                  |
| ISO 8601シリアライズ一貫性   | 全日時フィールド（timestamp, lastUsed, period.start, period.end）がISO 8601文字列として扱われている       |
| any型不使用                  | `any` 型が使用されていないか                                                                              |

**P32チェック（型定義の二箇所同時更新）**:

| ファイル                               | 確認内容                                |
| -------------------------------------- | --------------------------------------- |
| `packages/shared/src/types/index.ts`   | skill-analytics.ts のre-exportが最新か  |
| `apps/desktop/src/preload/types.ts`    | Preload型定義にanalyticsメソッドが追加  |
| `apps/desktop/src/preload/channels.ts` | ホワイトリストにanalyticsチャンネル追加 |

**期待される成果物**:

- `outputs/phase-9/typecheck-report.md`

---

### タスク3: セキュリティ検証

**目的**: 全5 IPCハンドラーがプロジェクトのセキュリティ要件を満たしていることを確認する

**実行手順**:

1. 全5ハンドラーで `validateIpcSender()` が実施されていることを確認する
2. 全catchブロックで `sanitizeErrorMessage` が使用されていることを確認する
3. チャンネル名が `IPC_CHANNELS` 定数で参照されていることを確認する
4. P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が全ハンドラーで実施されていることを確認する
5. skillName引数に対するパストラバーサル防止チェックが実施されていることを確認する
6. パスワード・APIキー・PIIがログ出力に含まれていないことを確認する

**セキュリティチェックマトリクス**:

| チャンネル                   | validateIpcSender | skillName検証 | sanitizeErrorMessage | IPC_CHANNELS定数 | 3段バリデーション |
| ---------------------------- | ----------------- | ------------- | -------------------- | ---------------- | ----------------- |
| `skill:analytics:record`     | -                 | -             | -                    | -                | -                 |
| `skill:analytics:statistics` | -                 | -             | -                    | -                | -                 |
| `skill:analytics:summary`    | -                 | -             | -                    | -                | -                 |
| `skill:analytics:trend`      | -                 | -             | -                    | -                | -                 |
| `skill:analytics:export`     | -                 | -             | -                    | -                | -                 |

**ハードコード文字列検出コマンド**:

```bash
# safeInvokeでハードコード文字列が使われていないか確認（P27対策）
grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/skill-api.ts | grep -v "IPC_CHANNELS"
```

**統計機能固有のセキュリティ確認**:

| チェック項目                         | 確認内容                                                                |
| ------------------------------------ | ----------------------------------------------------------------------- |
| 大量データによるメモリ枯渇防止       | 10,000件以上のイベント集計でメモリ使用量が許容範囲内か                  |
| エクスポート時の情報漏洩防止         | export APIの出力にAPIキー・認証トークンが含まれていないか               |
| 日時パラメータのインジェクション防止 | period.start/period.end が正しくバリデーションされている                |
| 不正なperiod値の拒否                 | period.granularity（hour/day/week/month）の許可値のみ受け入れられている |

**期待される成果物**:

- `outputs/phase-9/security-report.md`

---

### タスク4: テスト実行・カバレッジ確認

**目的**: 全テストが成功し、カバレッジ基準を満たしていることを確認する

**実行手順**:

1. 全対象テストを実行する
2. カバレッジレポートを確認する
3. カバレッジ基準との照合を行う
4. 基準未達の場合はPhase 6に戻る

**コマンド**:

```bash
# SkillAnalyticsテスト（カバレッジ付き）
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillAnalytics --coverage --reporter=verbose

# AnalyticsStoreテスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/AnalyticsStore --coverage --reporter=verbose

# 統計型定義テスト
cd apps/desktop && pnpm vitest run --coverage --reporter=verbose --grep "analytics"

# 統計関連IPCハンドラーテスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --coverage --reporter=verbose --grep "analytics"
```

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 | 実績 | 判定 |
| ----------------- | -------- | -------- | ---- | ---- |
| Line Coverage     | 80%      | 90%      | -    | -    |
| Branch Coverage   | 60%      | 70%      | -    | -    |
| Function Coverage | 80%      | 90%      | -    | -    |

**テスト対象範囲**:

| テスト対象                   | テストファイル                                                | 分類                            |
| ---------------------------- | ------------------------------------------------------------- | ------------------------------- |
| SkillAnalytics               | `src/main/services/skill/__tests__/SkillAnalytics.test.ts`    | 統計計算/トレンド/サマリー      |
| AnalyticsStore               | `src/main/services/skill/__tests__/AnalyticsStore.test.ts`    | 記録/読取/永続化/クリーンアップ |
| IPCハンドラー（5チャンネル） | `src/main/ipc/__tests__/skillHandlers*.test.ts`               | 正常/異常/セキュリティ          |
| 統計型定義                   | `packages/shared/src/types/__tests__/skill-analytics.test.ts` | 型ガード/バリデーション         |

**期待される成果物**:

- `outputs/phase-9/test-coverage-report.md`

---

### タスク5: 品質ゲート総合判定

**目的**: 全ての品質基準を満たしているか総合判定する

**実行手順**:

1. タスク1〜4の結果を統合する
2. 品質基準との照合を行う
3. 判定結果を記録する

**品質ゲートテーブル**:

| 品質ゲート   | 確認内容                                       | コマンド                                                                    | 結果 |
| ------------ | ---------------------------------------------- | --------------------------------------------------------------------------- | ---- |
| 機能検証     | 全自動テスト成功                               | `cd apps/desktop && pnpm vitest run`                                        | -    |
| コード品質   | Lint/型チェッククリア                          | `pnpm --filter @repo/desktop lint && pnpm --filter @repo/desktop typecheck` | -    |
| テスト網羅性 | カバレッジ基準達成                             | `cd apps/desktop && pnpm vitest run -- --coverage`                          | -    |
| セキュリティ | validateIpcSender適用、3段バリデーション全実施 | 手動レビュー                                                                | -    |

**品質ゲートチェックリスト**:

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] SkillAnalyticsテスト全件PASS（statistics/summary/trend各種集計）
- [ ] AnalyticsStoreテスト全件PASS（記録/読取/永続化/クリーンアップ）
- [ ] IPCハンドラー5チャンネル全テストPASS
- [ ] 型定義テスト全件PASS

#### コード品質

- [ ] Lint エラーなし（desktopパッケージ）
- [ ] Lint エラーなし（sharedパッケージ）
- [ ] 型エラーなし（desktopパッケージ）
- [ ] 型エラーなし（sharedパッケージ）
- [ ] コードフォーマット適用済み
- [ ] any型不使用

#### テスト網羅性

- [ ] Line Coverage 80%+ 達成
- [ ] Branch Coverage 60%+ 達成
- [ ] Function Coverage 80%+ 達成

#### セキュリティ

- [ ] 全ハンドラーで validateIpcSender 実施確認済み
- [ ] P42準拠3段バリデーション全ハンドラー実施確認済み
- [ ] エラーサニタイズ実施確認済み
- [ ] ハードコード文字列なし確認済み（P27対策）
- [ ] 日時パラメータバリデーション確認済み
- [ ] エクスポートデータの情報漏洩防止確認済み

#### IPC契約整合性

- [ ] channels.tsの定義とハンドラ引数が一致
- [ ] Preload APIの引数型とハンドラ引数型が一致
- [ ] ISO 8601シリアライズ方針が全日時フィールドに適用されている

**判定結果テーブル**:

| 品質項目      | 結果 |
| ------------- | ---- |
| Lint          | -    |
| TypeCheck     | -    |
| Security      | -    |
| Test/Coverage | -    |
| IPC Contract  | -    |
| **総合判定**  | -    |

**期待される成果物**:

- `outputs/phase-9/quality-report.md`

---

## 参照資料

| 参照資料           | パス                                                             | 内容                   |
| ------------------ | ---------------------------------------------------------------- | ---------------------- |
| SkillAnalytics     | `apps/desktop/src/main/services/skill/SkillAnalytics.ts`         | 統計計算実装           |
| AnalyticsStore     | `apps/desktop/src/main/services/skill/AnalyticsStore.ts`         | 永続化実装             |
| IPCハンドラー      | `apps/desktop/src/main/ipc/skillHandlers.ts`                     | Main Processハンドラー |
| 統計型定義         | `packages/shared/src/types/skill-analytics.ts`                   | 共有型定義（8IF）      |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`                          | Preload API実装        |
| テストファイル     | `apps/desktop/src/main/services/skill/__tests__/SkillAnalytics*` | 統計計算テスト         |
| テストファイル     | `apps/desktop/src/main/services/skill/__tests__/AnalyticsStore*` | ストアテスト           |
| Phase 5 実装成果物 | `outputs/phase-5/`                                               | 実装結果               |
| Phase 8 成果物     | `outputs/phase-8/`                                               | リファクタリング結果   |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                          | 内容             |
| --------------------- | ----------------------------------------------------------------------------- | ---------------- |
| IPC仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`          | IPC チャンネル   |
| サービス設計          | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` | Electronサービス |
| セキュリティ原則      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | IPC セキュリティ |
| Skill IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`     | Skill系IPC境界   |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | 品質基準         |
| デスクトップ技術      | `.claude/skills/aiworkflow-requirements/references/technology-desktop.md`     | Electron実行基盤 |
| エラーハンドリング    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | エラーカテゴリ   |

---

## 成果物

| 成果物               | パス                                      | 内容             |
| -------------------- | ----------------------------------------- | ---------------- |
| Lintレポート         | `outputs/phase-9/lint-report.md`          | Lint結果         |
| 型チェックレポート   | `outputs/phase-9/typecheck-report.md`     | 型チェック結果   |
| セキュリティレポート | `outputs/phase-9/security-report.md`      | セキュリティ確認 |
| テスト・カバレッジ   | `outputs/phase-9/test-coverage-report.md` | テスト結果       |
| 品質ゲート結果       | `outputs/phase-9/quality-report.md`       | 総合判定         |

---

## 統合テスト連携

> 品質保証で統合テスト結果を確認する

| 確認項目                 | 基準                                                   |
| ------------------------ | ------------------------------------------------------ |
| 全テスト                 | 100% パス                                              |
| SkillAnalyticsテスト     | statistics/summary/trend全集計テスト成功               |
| AnalyticsStoreテスト     | 記録・読取・永続化・クリーンアップテスト全件PASS       |
| IPCハンドラーテスト      | 5チャンネル全て正常動作、セキュリティテスト全件PASS    |
| エラーハンドリングテスト | エラーサニタイズ確認済み                               |
| パフォーマンステスト     | 10,000件以上のイベントデータでの集計が許容時間内に完了 |

---

## 完了条件

- [ ] Lint エラーがない（desktop + sharedパッケージ）
- [ ] 型エラーがない（desktop + sharedパッケージ）
- [ ] セキュリティレビューが完了している（全5ハンドラーで全項目確認済み）
- [ ] 統計機能固有のセキュリティ確認（日時バリデーション・情報漏洩防止）が完了している
- [ ] 全テストが成功している
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を達成している
- [ ] IPC契約整合性（channels.ts ↔ ハンドラ ↔ Preload API）が確認済みである
- [ ] ISO 8601シリアライズ方針が全日時フィールドに適用されている
- [ ] 品質ゲートの全項目をパスしている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] 品質ゲート全項目PASSを確認

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9J-skill-analytics/phase-10-final-review.md`
