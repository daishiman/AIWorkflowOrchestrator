# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 11                           |
| Phase名    | 手動テスト検証               |
| タスクID   | TASK-9J                      |
| 前提Phase  | Phase 10（最終レビュー）     |
| 後続Phase  | Phase 12（ドキュメント更新） |
| ステータス | 未実施                       |
| 作成日     | 2026-02-28                   |
| 機能名     | TASK-9J-skill-analytics      |

---

## 目的

SkillAnalytics / AnalyticsStore / IPCハンドラーの動作を、自動テスト結果とDevToolsコンソールからの直接呼び出しにより検証する。
UIは別タスク（task-031b）のスコープであるため、本タスクではMain Process側のIPCレベルのテストが主体となる。

## 背景

スキル使用統計機能はMain Processで動作するサービスであり、イベント記録・統計集計・データエクスポートの3つの境界が存在する。
自動テストではモック化されているこれらの境界を、実環境で検証する。

---

## テスト実施方針

### 制限事項

- スキル使用統計UIは別タスク（task-031b）のスコープであるため、DevToolsコンソール経由のIPC呼び出しが主な検証手段となる
- Preload API のスタブ未解消チャンネルが存在する場合、DevToolsからの直接呼び出しが不可能な場合がある
- その場合はユニットテスト結果をもって手動テストの代替とし、理由を `outputs/phase-11/manual-test-result.md` に記録する

### 検証方法

| 方法                           | 対象                              | 優先度 |
| ------------------------------ | --------------------------------- | ------ |
| DevToolsコンソール直接呼び出し | Preload APIが接続済みのチャンネル | 高     |
| ユニットテスト結果の確認       | 全5チャンネル + AnalyticsStore    | 高     |
| コードリーディング             | セキュリティ実装の確認            | 中     |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 自動テストの実行確認

**目的**: 手動テスト前に自動テストが全てパスすることを確認する

**実行手順**:

1. SkillAnalytics のユニットテストを実行する
2. AnalyticsStore のユニットテストを実行する
3. skillHandlers の分析関連テストを実行する
4. 全テストがパスすることを確認する
5. テスト結果サマリーを記録する

**コマンド**:

```bash
# SkillAnalytics テスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillAnalytics --reporter=verbose

# AnalyticsStore テスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/AnalyticsStore --reporter=verbose

# skillHandlers 分析関連テスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-11/auto-test-result.md`

---

### タスク2: 機能テスト（正常系）

**目的**: 5つのIPCチャンネルが正常に動作することを確認する

**テストケーステーブル**:

| No     | カテゴリ         | テスト項目                                      | 前提条件                                    | 操作手順                                                                                                                                                                                   | 期待結果                                                                                               | 実行結果 | 備考 |
| ------ | ---------------- | ----------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | -------- | ---- |
| TC-001 | 正常系・記録     | スキル実行後に使用イベントが記録される          | アプリ起動済み                              | DevToolsで `await window.electronAPI.skill.analyticsRecord({ skillName: "test-skill", eventType: "execution", success: true, duration: 1500, toolsUsed: [], tokenCount: 120 })` を実行する | イベントが記録され、成功レスポンスが返却される                                                         | -        | -    |
| TC-002 | 正常系・統計     | スキル別統計が正確に計算される                  | TC-001完了後（1件以上のイベントが記録済み） | DevToolsで `await window.electronAPI.skill.analyticsStatistics("test-skill")` を実行する                                                                                                   | totalExecutions >= 1、successRate > 0、averageDuration > 0 の SkillStatistics オブジェクトが返却される | -        | -    |
| TC-003 | 正常系・サマリ   | サマリーが全スキルの統計を集約している          | TC-001完了後（1件以上のイベントが記録済み） | DevToolsで `await window.electronAPI.skill.analyticsSummary()` を実行する                                                                                                                  | totalSkills >= 1、totalExecutions >= 1 のAnalyticsSummaryオブジェクトが返却される                      | -        | -    |
| TC-004 | 正常系・トレンド | 使用トレンドが指定粒度で集計される              | TC-001完了後（1件以上のイベントが記録済み） | DevToolsで `await window.electronAPI.skill.analyticsTrend("test-skill", { granularity: "day", start: "2026-02-01T00:00:00.000Z", end: "2026-02-28T23:59:59.999Z" })` を実行する            | UsageTrendオブジェクトが返却され、dataPoints配列にエントリが含まれている                               | -        | -    |
| TC-005 | 正常系・CSV      | CSVエクスポートが正しいフォーマットで出力される | TC-001完了後（1件以上のイベントが記録済み） | DevToolsで `await window.electronAPI.skill.analyticsExport("csv")` を実行する                                                                                                              | CSV形式の文字列が返却され、ヘッダー行とデータ行が含まれている                                          | -        | -    |
| TC-006 | 正常系・JSON     | JSONエクスポートが有効なJSONで出力される        | TC-001完了後（1件以上のイベントが記録済み） | DevToolsで `await window.electronAPI.skill.analyticsExport("json")` を実行する                                                                                                             | `JSON.parse()` でパース可能なJSON文字列が返却され、イベントデータの配列が含まれている                  | -        | -    |

**実行手順（TC-001）**:

1. Electronアプリを起動する
2. DevTools（Cmd+Option+I）を開く
3. Consoleタブで以下を実行する:
   ```javascript
   await window.electronAPI.skill.analyticsRecord({
     skillName: "test-skill",
     eventType: "execution",
     success: true,
     duration: 1500,
     toolsUsed: [],
     tokenCount: 120,
   });
   ```
4. レスポンスが正常に返却されることを確認する
5. エラーが発生していないことを確認する

**期待される成果物**:

- `outputs/phase-11/functional-normal-test-result.md`

---

### タスク3: 機能テスト（異常系）

**目的**: 不正入力時のバリデーションとエラーレスポンスを確認する

**テストケーステーブル**:

| No     | カテゴリ         | テスト項目                                                                | 前提条件       | 操作手順                                                                                                                                                                        | 期待結果                                                                    | 実行結果 | 備考 |
| ------ | ---------------- | ------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------- | ---- |
| TC-007 | 異常系・統計     | 存在しないスキル名で統計取得時にエラーではなく空統計が返る                | アプリ起動済み | DevToolsで `await window.electronAPI.skill.analyticsStatistics("nonexistent-skill")` を実行する                                                                                 | totalExecutions: 0, successRate: 0, averageDuration: 0 の空統計が返却される | -        | -    |
| TC-008 | 異常系・サマリ   | 空のデータベースでサマリー取得時にゼロ値のサマリーが返る                  | 新規起動直後   | アプリを新規起動し、データ記録前に `await window.electronAPI.skill.analyticsSummary()` を実行する                                                                               | totalSkills: 0, totalExecutions: 0 のゼロ値サマリーが返却される             | -        | -    |
| TC-009 | 異常系・トレンド | 不正な期間指定（start > end）でトレンド取得時にバリデーションエラーが返る | アプリ起動済み | DevToolsで `await window.electronAPI.skill.analyticsTrend("test-skill", { granularity: "day", start: "2026-03-01T00:00:00.000Z", end: "2026-02-01T00:00:00.000Z" })` を実行する | VALIDATION_ERROR が返却され、開始日が終了日より後であることが示される       | -        | -    |

**期待される成果物**:

- `outputs/phase-11/functional-error-test-result.md`

---

### タスク4: 統合テスト

**目的**: IPC往復・永続化・同時実行の統合動作を確認する

**テストケーステーブル**:

| No     | カテゴリ     | テスト項目                                           | 前提条件       | 操作手順                                                                                                                                                                                                                          | 期待結果                                                          | 実行結果 | 備考 |
| ------ | ------------ | ---------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------- | ---- |
| TC-010 | 統合・往復   | IPC経由でイベント記録→統計取得の往復が正常に動作する | アプリ起動済み | 1. `analyticsRecord({ skillName: "round-trip-test", eventType: "execution", success: true, duration: 500, toolsUsed: [] })` を実行する 2. `analyticsStatistics("round-trip-test")` を実行する                                     | 記録したイベントが統計に反映され、totalExecutions: 1 が返却される | -        | -    |
| TC-011 | 統合・永続化 | アプリ再起動後もデータが永続化されている             | TC-010完了後   | 1. アプリを終了する 2. アプリを再起動する 3. `analyticsSummary()` を実行する                                                                                                                                                      | 再起動前に記録したイベントのtotalExecutions値が保持されている     | -        | -    |
| TC-012 | 統合・並行   | 複数スキルの同時実行時にイベント記録が競合しない     | アプリ起動済み | 1. `Promise.all([analyticsRecord({ skillName: "skill-a", ... }), analyticsRecord({ skillName: "skill-b", ... }), analyticsRecord({ skillName: "skill-c", ... })])` を実行する 2. `analyticsSummary()` でtotalExecutionsを確認する | 3件のイベントが全て記録され、totalExecutions が3増加している      | -        | -    |

**期待される成果物**:

- `outputs/phase-11/integration-test-result.md`

---

### タスク5: セキュリティテスト

**目的**: IPCチャンネルのセキュリティ保護を確認する

**テストケーステーブル**:

| No     | カテゴリ             | テスト項目                                                      | 前提条件       | 操作手順                                                                                                                                                                                                                                           | 期待結果                                                                            | 実行結果 | 備考                     |
| ------ | -------------------- | --------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- | ------------------------ |
| TC-013 | セキュリティ・送信元 | DevToolsからの直接IPC呼び出しがSender検証で拒否される           | アプリ起動済み | DevToolsで `require('electron').ipcRenderer.invoke('skill:analytics:record', { skillName: "test", eventType: "execution", success: true, duration: 100, toolsUsed: [] })` を実行する（sandbox環境では実行不可を確認する）                          | sandbox有効のためrequire不可、またはvalidateIpcSenderによる送信元検証でエラーが返る | -        | P42準拠3段バリデーション |
| TC-014 | セキュリティ・入力   | 空文字列/スペースのみのskillNameがP42バリデーションで拒否される | アプリ起動済み | 1. `analyticsRecord({ skillName: "", eventType: "execution", success: true, duration: 100, toolsUsed: [] })` を実行する 2. `analyticsRecord({ skillName: "   ", eventType: "execution", success: true, duration: 100, toolsUsed: [] })` を実行する | 両方ともVALIDATION_ERROR が返却され、skillNameが空であることが示される              | -        | P42準拠3段バリデーション |

**期待される成果物**:

- `outputs/phase-11/security-test-result.md`

---

### タスク6: トレンド粒度テスト

**目的**: 4種類の粒度（hour/day/week/month）でトレンド取得が正常に動作することを確認する

**テストケーステーブル**:

| No     | カテゴリ        | テスト項目                     | 前提条件                    | 操作手順                                                                                                                                | 期待結果                                          | 実行結果 | 備考 |
| ------ | --------------- | ------------------------------ | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------- | ---- |
| TC-015 | トレンド・hour  | 時間粒度でトレンドが集計される | 1件以上のイベントが記録済み | `analyticsTrend("test-skill", { granularity: "hour", start: "2026-02-28T00:00:00.000Z", end: "2026-02-28T23:59:59.999Z" })` を実行する  | dataPoints配列にhour単位のエントリが含まれている  | -        | -    |
| TC-016 | トレンド・day   | 日粒度でトレンドが集計される   | 1件以上のイベントが記録済み | `analyticsTrend("test-skill", { granularity: "day", start: "2026-02-01T00:00:00.000Z", end: "2026-02-28T23:59:59.999Z" })` を実行する   | dataPoints配列にday単位のエントリが含まれている   | -        | -    |
| TC-017 | トレンド・week  | 週粒度でトレンドが集計される   | 1件以上のイベントが記録済み | `analyticsTrend("test-skill", { granularity: "week", start: "2026-02-01T00:00:00.000Z", end: "2026-02-28T23:59:59.999Z" })` を実行する  | dataPoints配列にweek単位のエントリが含まれている  | -        | -    |
| TC-018 | トレンド・month | 月粒度でトレンドが集計される   | 1件以上のイベントが記録済み | `analyticsTrend("test-skill", { granularity: "month", start: "2026-01-01T00:00:00.000Z", end: "2026-02-28T23:59:59.999Z" })` を実行する | dataPoints配列にmonth単位のエントリが含まれている | -        | -    |

**期待される成果物**:

- `outputs/phase-11/trend-granularity-test-result.md`

---

### タスク7: 発見課題の記録

**目的**: テスト中に発見した課題を記録する

**実行手順**:

1. タスク1〜6で発見した問題を記録する
2. 問題の重要度を分類する
3. 対応方針を決定する

**課題分類**:

| 重要度   | 基準                       | 対応             |
| -------- | -------------------------- | ---------------- |
| 致命的   | 機能が使用できない         | 即時修正         |
| 重大     | 一部機能に影響             | 本フェーズで修正 |
| 軽微     | 使用に支障なし             | Phase 12 で記録  |
| 改善提案 | より良くするためのアイデア | Phase 12 で記録  |

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

---

## 参照資料

| 参照資料           | パス                                                                    | 内容                            |
| ------------------ | ----------------------------------------------------------------------- | ------------------------------- |
| SkillAnalytics実装 | `apps/desktop/src/main/services/skill/SkillAnalytics.ts`                | 分析サービス                    |
| AnalyticsStore実装 | `apps/desktop/src/main/services/skill/AnalyticsStore.ts`                | 分析データ永続化                |
| IPCハンドラー実装  | `apps/desktop/src/main/ipc/skillHandlers.ts`                            | Main Processハンドラー          |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`                                 | Preload API実装                 |
| 型定義             | `packages/shared/src/types/skill-analytics.ts`                          | 分析型定義（8インターフェース） |
| テストファイル     | `apps/desktop/src/main/services/skill/__tests__/SkillAnalytics.test.ts` | テストコード                    |
| Phase 1要件仕様    | `outputs/phase-1/requirements-definition.md`                            | 要件                            |
| Phase 2設計仕様    | `outputs/phase-2/architecture-design.md`                                | 設計成果物                      |
| Phase 5実装成果物  | `outputs/phase-5/implementation-summary.md`                             | 実装成果物                      |
| Phase 6拡充成果物  | `outputs/phase-6/coverage-report.md`                                    | 追加テスト結果                  |
| Phase 7カバレッジ  | `outputs/phase-7/coverage-report.md`                                    | カバレッジ結果                  |
| Phase 8成果物      | `outputs/phase-8/refactoring-log.md`                                    | リファクタ結果                  |
| Phase 9成果物      | `outputs/phase-9/quality-report.md`                                     | 品質保証結果                    |
| Phase 10成果物     | `outputs/phase-10/final-review-result.md`                               | 最終レビュー結果                |
| セキュリティルール | `.claude/rules/04-electron-security.md`                                 | セキュリティ基準                |

---

## 成果物

| 成果物                 | パス                                                | 内容                        |
| ---------------------- | --------------------------------------------------- | --------------------------- |
| 自動テスト結果         | `outputs/phase-11/auto-test-result.md`              | テスト実行結果              |
| 正常系テスト結果       | `outputs/phase-11/functional-normal-test-result.md` | TC-001〜TC-006の結果        |
| 異常系テスト結果       | `outputs/phase-11/functional-error-test-result.md`  | TC-007〜TC-009の結果        |
| 統合テスト結果         | `outputs/phase-11/integration-test-result.md`       | TC-010〜TC-012の結果        |
| セキュリティテスト結果 | `outputs/phase-11/security-test-result.md`          | TC-013〜TC-014の結果        |
| トレンド粒度テスト結果 | `outputs/phase-11/trend-granularity-test-result.md` | TC-015〜TC-018の結果        |
| 発見課題               | `outputs/phase-11/discovered-issues.md`             | 課題一覧（0件でも記録必須） |

---

## 統合テスト連携

> Electron環境での手動動作確認

| 確認項目                  | 基準                                                                   |
| ------------------------- | ---------------------------------------------------------------------- |
| 全5チャンネル正常動作     | skill:analytics:record, statistics, summary, trend, export             |
| イベント記録→統計反映     | recordで記録したイベントがstatistics/summaryに反映される               |
| 4粒度トレンド対応         | hour, day, week, month の全粒度でトレンドが集計される                  |
| 2形式エクスポート対応     | CSV形式とJSON形式の両方でエクスポートが成功する                        |
| 永続化・復元              | アプリ再起動後にデータが正しく復元される                               |
| バリデーション（P42準拠） | 空文字・スペースのみのskillNameが全チャンネルで拒否される              |
| エラーサニタイズ          | 全エラーレスポンスで内部情報が漏洩しない                               |
| 空データ時の安全な動作    | イベント未記録状態でstatistics/summaryがゼロ値を返す（エラーではない） |

---

## 完了条件

- [ ] 自動テストが全てパスしている
- [ ] 正常系テスト（TC-001〜TC-006）が全てパスしている
- [ ] 異常系テスト（TC-007〜TC-009）が全てパスしている
- [ ] 統合テスト（TC-010〜TC-012）が全てパスしている
- [ ] セキュリティテスト（TC-013〜TC-014）が全てパスしている
- [ ] トレンド粒度テスト（TC-015〜TC-018）が全てパスしている
- [ ] 発見課題が記録されている（0件でも記録必須）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（7タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（7ファイル）が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10 が完了していること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9J-skill-analytics/phase-12-documentation.md`
