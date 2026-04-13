# Phase 11: 手動テスト（NON_VISUAL）

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 11                                                           |
| タスクID   | UT-W3-ANALYTICS-ADAPTER-001                                  |
| タスク名   | trackEvent analytics adapter差し替え（本番分析基盤への接続） |
| 前提Phase  | Phase 10（最終レビューPASS）                                 |
| 後続Phase  | Phase 12                                                     |
| 作成日     | 2026-04-11                                                   |
| ステータス | 未実施                                                       |

## 目的

NON_VISUAL手動テスト: analytics送信ログ確認・オフライン→オンライン復帰時のキュードレイン確認・
オプトアウト時の送信停止確認・Electron DevToolsのNetworkタブで送信確認を行う。

## Phase 11 手動テスト方針

**タスク分類（NON_VISUAL）**:

- `analyticsAdapter.ts`はロジック層の変更であり、UIコンポーネントの変更を含まない
- スクリーンショット証跡は不要
- 自動テスト結果（Vitest）+ 開発環境での手動動作確認が主要証跡

**証跡の主ソース**:

- `analyticsAdapter.test.ts`全件PASS（Phase 4-7で確立）
- `analyticsHandler.test.ts`全件PASS（IPC経由の場合）
- Electron DevToolsコンソール・Networkタブでの手動確認

**スクリーンショットを作成しない理由**:

- UIコンポーネントの変更がなく、視覚的変化が存在しない（NON_VISUAL）
- analytics送信はバックグラウンド処理であり、UI上での確認は不適切

## 3層評価

| 層       | 確認観点                                           | 扱い              |
| -------- | -------------------------------------------------- | ----------------- |
| Semantic | イベント名、payload、no-op、オプトアウト、復帰送信 | 必須              |
| Visual   | UI差分なし                                         | N/A（理由を記録） |
| AI UX    | ログの読みやすさ、失敗時の診断性、手動確認の明確さ | 必須              |

## 実行タスク

### タスク1: 手動テストチェックリスト作成

**目的**: 実施する手動テストケースを定義する

**実行手順**:

1. 以下のテストケースを定義する:
   - TC-11-01: 開発環境での `trackEvent` 呼び出し後のコンソール出力確認
   - TC-11-02: 本番環境モード（`NODE_ENV=production`）でのsink送信確認
   - TC-11-03: Electron DevToolsのNetworkタブでanalytics送信確認（IPC経由）
   - TC-11-04: オフラインモード切替後のtrackEvent呼び出し→キューイング確認
   - TC-11-05: オンライン復帰後のキュードレイン確認
   - TC-11-06: オプトアウト設定後のtrackEvent呼び出し→送信停止確認
   - TC-11-07: analytics provider初期化失敗シミュレーション→no-opフォールバック確認
2. 各TCに証跡（コンソール出力・テスト結果）の確認方法を記載する

**期待される成果物**:

- `outputs/phase-11/manual-test-checklist.md`

### タスク2: 自動テスト証跡確認

**目的**: Phase 4-9で確立した自動テスト結果を手動テストの主証跡として記録する

**実行手順**:

1. 以下のコマンドを実行し、全件PASSを確認する:

```bash
# analyticsAdapter テスト
pnpm --filter @repo/desktop test:run -- src/renderer/utils/__tests__/analyticsAdapter.test.ts

# trackEvent 回帰テスト
pnpm --filter @repo/desktop test:run -- src/renderer/utils/__tests__/trackEvent.test.ts

# SkillCreateWizard 計装テスト回帰
pnpm --filter @repo/desktop test:run -- src/renderer/components/skill/__tests__/SkillCreateWizard.tracking.test.tsx

# IPCハンドラー テスト（IPC経由の場合）
pnpm --filter @repo/desktop test:run -- src/main/ipc/__tests__/analyticsHandler.test.ts
```

2. テスト件数・PASS件数・失敗件数を記録する
3. 結果を`manual-test-result.md`に記録する

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

### タスク3: 既知制限リスト作成

**目的**: 実地操作不可の制約と代替証跡を明記する

**実行手順**:

1. 実地操作不可の理由を明記する（NON_VISUALのため）
2. 自動テスト結果が代替証跡となる範囲を明記する
3. スコープ外の発見事項があれば記録する
4. Phase 12のunassigned-task-detectionへの入力となる改善提案を記録する

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`（既知制限セクション）
- `outputs/phase-11/manual-test-report.md`（総合所見）

### タスク4: 発見事項記録

**目的**: 手動テスト・自動テスト実行中に発見した問題や改善提案を記録する

**実行手順**:

1. Phase 11実施中に発見した問題を記録する
2. スコープ外の改善提案を記録する
3. HIGH判定の問題は即座にPhase 12のunassigned-task候補として登録する

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

## 手動テストケース

| TC-ID    | テスト内容                         | 証跡タイプ     | 期待結果                           |
| -------- | ---------------------------------- | -------------- | ---------------------------------- |
| TC-11-01 | 開発環境でのconsole出力確認        | コンソールログ | `[trackEvent]`プレフィックスの出力 |
| TC-11-02 | 本番モードでのsink送信確認         | テスト結果     | analytics send関数が呼ばれること   |
| TC-11-03 | DevTools Network analytics送信確認 | テスト結果     | IPC経由で送信されること            |
| TC-11-04 | オフライン時キューイング確認       | テスト結果     | キューにイベントが保持されること   |
| TC-11-05 | オンライン復帰後キュードレイン確認 | テスト結果     | キューがフラッシュされること       |
| TC-11-06 | オプトアウト時送信停止確認         | テスト結果     | analytics sendが呼ばれないこと     |
| TC-11-07 | 初期化失敗フォールバック確認       | テスト結果     | エラー非スロー・no-op動作          |

## 参照資料

| 参照資料                       | パス                                                 |
| ------------------------------ | ---------------------------------------------------- |
| Phase 10 最終レビュー結果      | `outputs/phase-10/final-review-result.md`            |
| Phase 4 テスト仕様書           | `outputs/phase-4/test-specification.md`              |
| FB-4: NON_VISUAL証跡メタ       | `.claude/skills/task-specification-creator/SKILL.md` |
| FB-BEFORE-QUIT-001: NON_VISUAL | `.claude/skills/task-specification-creator/SKILL.md` |

## 成果物

| 成果物                   | パス                                        | 内容                                 |
| ------------------------ | ------------------------------------------- | ------------------------------------ |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | TC一覧・証跡確認方法                 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | TC-ID↔証跡・NON_VISUAL理由・代替証跡 |
| 手動テストレポート       | `outputs/phase-11/manual-test-report.md`    | 実施概要・総合所見                   |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`     | 発見した問題・改善提案               |

## 完了条件

- [ ] 手動テストチェックリスト（TC-11-01〜07）作成完了
- [ ] 自動テスト全件PASS確認・件数記録済み
- [ ] `manual-test-result.md`に「証跡の主ソース（自動テスト名/件数）」と「スクリーンショットを作らない理由」が明記されていること（[Feedback 4]対策）
- [ ] 3層評価（Semantic / Visual / AI UX）の記録完了
- [ ] `manual-test-report.md`に実施概要と総合所見が記録されていること
- [ ] 発見事項記録完了
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次のPhase

Phase 12: ドキュメント更新
