# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 10                         |
| Phase名    | 最終レビューゲート         |
| タスクID   | TASK-9J                    |
| 前提Phase  | Phase 9（品質保証）        |
| 後続Phase  | Phase 11（手動テスト検証） |
| ステータス | 未着手                     |
| 作成日     | 2026-02-28                 |
| 機能名     | TASK-9J-skill-analytics    |

---

## 目的

スキル使用統計・分析機能全体の品質・整合性を8項目のレビュー観点で最終検証し、手動テストフェーズに進む前に品質を保証する。
要件から実装までの一貫性を、機能完全性・セキュリティ・型安全性・テスト品質・コード品質・エラーハンドリング・IPC契約・パフォーマンスの8観点で確認する。

## 背景

スキル使用統計・分析機能はMain Process内の2サービス（SkillAnalytics + AnalyticsStore）と5つのIPCハンドラーで構成される。
electron-storeによる永続化と10,000件以上のイベントデータの集計処理を扱うため、パフォーマンス・データ整合性・セキュリティの観点が特に重要である。
UI層はスコープ外であるためUI/UXレビューは対象外とし、バックエンド品質に集中する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 8項目レビュー実施

**目的**: スキル使用統計・分析機能を8項目のレビュー観点で多角的に検証する

**実行手順**:

1. 全対象ファイルを読み込む
2. 8項目のレビュー観点テーブルに基づいて順次検証する
3. 各観点の結果（OK / 指摘あり）を記録する
4. 指摘がある場合は重要度（MINOR / MAJOR / CRITICAL）を判定する

**8項目レビュー観点テーブル**:

| #   | レビュー観点       | 確認内容                                                                                                     | 結果 | 指摘 |
| --- | ------------------ | ------------------------------------------------------------------------------------------------------------ | ---- | ---- |
| 1   | 機能完全性         | 5 IPCチャンネル（analytics:record/statistics/summary/trend/export）が全て実装・テスト済み                    | -    | -    |
| 2   | セキュリティ       | 全5チャンネルにvalidateIpcSender、3段バリデーション、エラーサニタイズ、日時パラメータバリデーション          | -    | -    |
| 3   | 型安全性           | TypeScript strict準拠、any型不使用、共有型定義（skill-analytics.ts 8IF）がMain/Preload両層で正しく参照される | -    | -    |
| 4   | テスト品質         | カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）、境界値テスト含む                                | -    | -    |
| 5   | コード品質         | Lint/型チェッククリア、未使用import排除、命名規則準拠、SOLID原則適用                                         | -    | -    |
| 6   | エラーハンドリング | 全エラーパスでユーザーフレンドリーなメッセージを返し、内部情報を漏洩しない                                   | -    | -    |
| 7   | IPC契約            | ハンドラー引数形式とPreload呼び出し形式の一致（P44/P45対策）、ISO 8601シリアライズ方針の一貫適用             | -    | -    |
| 8   | パフォーマンス     | 10,000件以上のイベントデータでのstatistics/summary/trend集計速度が許容範囲内（1秒以内）                      | -    | -    |

---

### タスク2: セキュリティ詳細レビュー

**目的**: セキュリティ観点をさらに深掘りし、統計機能固有の攻撃ベクトルに対する防御を検証する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` の統計関連5ハンドラーを読み込む
2. セキュリティレビューマトリクスの全項目を検証する
3. `apps/desktop/src/main/services/skill/SkillAnalytics.ts` の集計処理レビューを実施する
4. `apps/desktop/src/preload/skill-api.ts` のPreload API側もレビューする

**セキュリティレビューマトリクス**:

| チャンネル                   | validateIpcSender | sanitizeError | getAllowedWindows | IPC_CHANNELS定数 | 3段バリデーション |
| ---------------------------- | ----------------- | ------------- | ----------------- | ---------------- | ----------------- |
| `skill:analytics:record`     | -                 | -             | -                 | -                | -                 |
| `skill:analytics:statistics` | -                 | -             | -                 | -                | -                 |
| `skill:analytics:summary`    | -                 | -             | -                 | -                | -                 |
| `skill:analytics:trend`      | -                 | -             | -                 | -                | -                 |
| `skill:analytics:export`     | -                 | -             | -                 | -                | -                 |

**統計機能固有のセキュリティ検証**:

| 攻撃ベクトル                               | 対策確認内容                                                                        | 結果 |
| ------------------------------------------ | ----------------------------------------------------------------------------------- | ---- |
| 不正な日時パラメータ                       | period.start/period.end がISO 8601形式であることの検証が実装されている              | -    |
| 不正なperiod値                             | period.granularity がhour/day/week/monthの許可値のみ受け入れ、それ以外を拒否する    | -    |
| 大量イベントによるメモリ枯渇               | 10,000件以上のイベントデータ処理でメモリ使用量が許容範囲内か                        | -    |
| エクスポートデータからの情報漏洩           | export APIの出力にAPIキー・認証トークン・PIIが含まれていないか                      | -    |
| 不正なformat値（export）                   | export APIのformat引数がjson/csvの許可値のみ受け入れ、それ以外を拒否する            | -    |
| SkillInvoker統合の副作用                   | SkillInvokerからのrecordEvent呼び出しが既存のスキル実行フローに影響を与えていないか | -    |
| electron-storeデータ破損時のフェイルセーフ | electron-storeから不正データを読み込んだ場合に安全側に倒れる（空配列を返す等）      | -    |

**期待される成果物**:

- `outputs/phase-10/security-review.md`

---

### タスク3: 型安全性・IPC契約レビュー

**目的**: Preload型定義とMainハンドラーの型が完全整合し、IPC契約にドリフトがないことを確認する

**実行手順**:

1. `apps/desktop/src/preload/types.ts` の新規追加型を読み込む
2. `apps/desktop/src/main/ipc/skillHandlers.ts` の統計ハンドラー引数・戻り値型と比較する
3. P44対策として、ハンドラー引数形式とPreload側の呼び出し形式が一致していることを確認する
4. P45対策として、引数名のセマンティクスが実際に渡される値と一致していることを確認する
5. `packages/shared/src/types/skill-analytics.ts` の8インターフェースが全レイヤーで一貫して使用されていることを確認する
6. 日時フィールドのISO 8601シリアライズ方針が全レイヤーで一貫していることを確認する

**型整合性マトリクス**:

| メソッド             | Preload引数型 | Main引数型 | Preload戻り値型 | Main戻り値型 | 整合 |
| -------------------- | ------------- | ---------- | --------------- | ------------ | ---- |
| analytics.record     | -             | -          | -               | -            | -    |
| analytics.statistics | -             | -          | -               | -            | -    |
| analytics.summary    | -             | -          | -               | -            | -    |
| analytics.trend      | -             | -          | -               | -            | -    |
| analytics.export     | -             | -          | -               | -            | -    |

**IPC契約チェック（P44/P45対策）**:

| チェック項目             | 確認内容                                                                                     | 結果 |
| ------------------------ | -------------------------------------------------------------------------------------------- | ---- |
| 引数形式一致             | ハンドラーが期待する引数形式とPreload側の渡し方が一致しているか                              | -    |
| 引数名セマンティクス一致 | 引数名（skillName, period, format等）が実際に渡される値の意味と一致しているか                | -    |
| 内部メソッド引数名伝搬   | SkillAnalytics/AnalyticsStore側の引数名もPreload側と一貫しているか                           | -    |
| 型アサーション不使用     | `as` による型アサーションでバリデーションを回避していないか                                  | -    |
| 共有型利用               | 8インターフェースがpackages/sharedから正しくimportされているか                               | -    |
| ISO 8601一貫性           | timestamp/lastUsed/period.start/period.endが全レイヤーでISO 8601文字列として統一されているか | -    |

**P32チェック（型定義の二箇所同時更新）**:

| ファイル                               | 更新状況 |
| -------------------------------------- | -------- |
| `packages/shared/src/types/index.ts`   | -        |
| `apps/desktop/src/preload/types.ts`    | -        |
| `apps/desktop/src/preload/channels.ts` | -        |

**期待される成果物**:

- `outputs/phase-10/type-ipc-contract-review.md`

---

### タスク4: パフォーマンス・既存コード影響レビュー

**目的**: 大量データでの集計速度と、既存コード（SkillInvoker/SkillExecutor）への統合が既存テストを破壊していないことを確認する

**実行手順**:

1. 10,000件以上のイベントデータでのstatistics/summary/trend集計が1秒以内に完了することを確認する
2. AnalyticsStoreの永続化データが肥大化した場合のelectron-store読み書き速度を確認する
3. SkillInvokerへのrecordEvent統合が既存のスキル実行テストを破壊していないことを確認する
4. SkillExecutorへのrecordEvent統合が既存のスキル実行テストを破壊していないことを確認する
5. レイヤー依存方向（Renderer → Preload → Main）が守られていることを確認する
6. `ALLOWED_INVOKE_CHANNELS` に5チャンネルが追加されていることを確認する
7. ハンドラー登録/解除が正しく実装されていることを確認する

**パフォーマンスチェックリスト**:

| チェック項目                    | 基準                                                     | 結果 |
| ------------------------------- | -------------------------------------------------------- | ---- |
| statistics集計（10,000件）      | 1秒以内に完了                                            | -    |
| summary生成（10,000件）         | 1秒以内に完了                                            | -    |
| trend集計（10,000件/月次90日）  | 1秒以内に完了                                            | -    |
| export出力（10,000件/JSON）     | 1秒以内に完了                                            | -    |
| export出力（10,000件/CSV）      | 1秒以内に完了                                            | -    |
| recordEvent記録（単一イベント） | 50ms以内に完了（スキル実行のレイテンシに影響しないこと） | -    |
| AnalyticsStore読み込み          | 10,000件のデータ読み込みが500ms以内に完了                | -    |

**既存コード影響チェックリスト**:

| チェック項目            | 確認内容                                              | 結果 |
| ----------------------- | ----------------------------------------------------- | ---- |
| SkillInvoker既存テスト  | recordEvent統合後もSkillInvokerの全テストがPASS       | -    |
| SkillExecutor既存テスト | recordEvent統合後もSkillExecutorの全テストがPASS      | -    |
| recordEvent失敗時の影響 | recordEventが失敗してもスキル実行自体は正常に完了する | -    |
| ホワイトリスト追加      | `ALLOWED_INVOKE_CHANNELS` に5チャンネル追加済み       | -    |
| ハンドラー登録          | 統計関連5ハンドラーが登録済み                         | -    |
| ハンドラー解除          | unregister時に5チャンネルが解除される                 | -    |
| レイヤー依存方向        | Renderer → Preload → Main の一方向依存                | -    |
| contextBridge経由       | Renderer からの API アクセスが contextBridge 経由     | -    |

**期待される成果物**:

- `outputs/phase-10/performance-integration-review.md`

---

### タスク5: 最終判定

**目的**: 最終レビュー結果を判定する

**実行手順**:

1. タスク1〜4の結果を統合する
2. 問題を重要度別に分類する
3. 判定結果（PASS / MINOR / MAJOR / CRITICAL）を決定する
4. MINOR判定の場合は未タスク仕様書を作成する

**判定基準**:

| 判定     | 条件                                                             | 次のアクション                                      |
| -------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| PASS     | 全8項目のレビュー観点で問題なし                                  | Phase 11 へ進行                                     |
| MINOR    | 軽微な指摘あり（機能・セキュリティに影響なし）                   | 未タスク仕様書に変換後、Phase 11 へ（**省略不可**） |
| MAJOR    | 重大な問題あり（セキュリティ・機能に影響）                       | 影響範囲に応じて Phase 1-5 へ戻る                   |
| CRITICAL | 致命的な問題あり（データ漏洩・パフォーマンス劣化・既存機能破壊） | Phase 1 へ戻り要件再確認                            |

**MINOR判定時の未タスク化手順**（省略不可）:

1. 指摘内容を `docs/30-workflows/unassigned-task/` に指示書として作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

> **注意**: 「機能影響なし」であっても MINOR 指摘の未タスク化は省略不可（05-task-execution.md準拠）

**戻り先決定基準**:

| 問題の種類                               | 戻り先                |
| ---------------------------------------- | --------------------- |
| セキュリティ要件の未充足                 | Phase 1（要件定義）   |
| IPC/型インターフェース設計の問題         | Phase 2（設計）       |
| テスト設計の不足                         | Phase 4（テスト作成） |
| 実装の問題（集計ロジック・データ整合性） | Phase 5（実装）       |
| コード品質の問題                         | Phase 8（リファクタ） |

**レビュー結果サマリー**:

| #   | レビュー観点       | 結果 | 指摘事項 | 重要度 |
| --- | ------------------ | ---- | -------- | ------ |
| 1   | 機能完全性         | -    | -        | -      |
| 2   | セキュリティ       | -    | -        | -      |
| 3   | 型安全性           | -    | -        | -      |
| 4   | テスト品質         | -    | -        | -      |
| 5   | コード品質         | -    | -        | -      |
| 6   | エラーハンドリング | -    | -        | -      |
| 7   | IPC契約            | -    | -        | -      |
| 8   | パフォーマンス     | -    | -        | -      |
| -   | **最終判定**       | -    | -        | -      |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

---

## 参照資料

| 参照資料              | パス                                                             | 内容                   |
| --------------------- | ---------------------------------------------------------------- | ---------------------- |
| SkillAnalytics        | `apps/desktop/src/main/services/skill/SkillAnalytics.ts`         | 統計計算実装           |
| AnalyticsStore        | `apps/desktop/src/main/services/skill/AnalyticsStore.ts`         | 永続化実装             |
| IPCハンドラー         | `apps/desktop/src/main/ipc/skillHandlers.ts`                     | Main Processハンドラー |
| 統計型定義            | `packages/shared/src/types/skill-analytics.ts`                   | 共有型定義（8IF）      |
| Preload API           | `apps/desktop/src/preload/skill-api.ts`                          | Preload API実装        |
| Preload型定義         | `apps/desktop/src/preload/types.ts`                              | 型定義                 |
| チャンネル定数        | `apps/desktop/src/preload/channels.ts`                           | チャンネル定義         |
| 初期化コード          | `apps/desktop/src/main/ipc/index.ts`                             | アプリ起動統合         |
| テストファイル        | `apps/desktop/src/main/services/skill/__tests__/SkillAnalytics*` | 統計計算テスト         |
| テストファイル        | `apps/desktop/src/main/services/skill/__tests__/AnalyticsStore*` | ストアテスト           |
| Phase 9品質ゲート結果 | `outputs/phase-9/quality-report.md`                              | 品質検証結果           |
| Phase 1要件仕様       | `outputs/phase-1/`                                               | 要件                   |
| Phase 2設計           | `outputs/phase-2/`                                               | 設計                   |
| Phase 5実装成果物     | `outputs/phase-5/`                                               | 実装コード・実装記録   |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                          | 内容             |
| ------------------ | ----------------------------------------------------------------------------- | ---------------- |
| IPC仕様            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`          | IPC チャンネル   |
| サービス設計       | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` | Electronサービス |
| セキュリティ原則   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | IPC セキュリティ |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | エラーカテゴリ   |

---

## 成果物

| 成果物                                 | パス                                                 | 内容                             |
| -------------------------------------- | ---------------------------------------------------- | -------------------------------- |
| セキュリティレビュー                   | `outputs/phase-10/security-review.md`                | セキュリティ検証結果             |
| 型安全性・IPC契約レビュー              | `outputs/phase-10/type-ipc-contract-review.md`       | 型整合性・IPC契約確認結果        |
| パフォーマンス・既存コード影響レビュー | `outputs/phase-10/performance-integration-review.md` | パフォーマンス・統合影響評価結果 |
| 最終判定                               | `outputs/phase-10/final-review-result.md`            | 判定結果                         |

---

## 統合テスト連携

> 最終レビューで統合テスト結果を確認する

| 確認項目                         | 基準                                                 |
| -------------------------------- | ---------------------------------------------------- |
| 全テスト                         | 100% パス                                            |
| SkillAnalyticsテスト             | statistics/summary/trend全集計テスト成功             |
| AnalyticsStoreテスト             | 記録・読取・永続化・クリーンアップテスト全件PASS     |
| IPCハンドラーテスト              | 5チャンネル全て正常動作確認済み                      |
| セキュリティテスト               | sender検証・バリデーション・エラーサニタイズ確認済み |
| パフォーマンステスト             | 10,000件以上の集計が1秒以内に完了確認済み            |
| SkillInvoker/SkillExecutorテスト | recordEvent統合後も既存テスト全件PASS                |

---

## 多角的チェック観点

| #   | 観点               | 確認ポイント                                                                                         |
| --- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| 1   | 機能完全性         | 5チャンネル全実装、statistics/summary/trend/export対応、recordEvent記録動作                          |
| 2   | セキュリティ       | validateIpcSender全適用、3段バリデーション、sanitizeErrorMessage、日時・period・formatバリデーション |
| 3   | 型安全性           | TypeScript strict、any型不使用、共有型定義8IFの一貫参照、ISO 8601シリアライズ一貫性                  |
| 4   | テスト品質         | カバレッジ基準達成、境界値・異常系テスト含む、パフォーマンステスト含む                               |
| 5   | コード品質         | Lint/型チェッククリア、命名規則準拠、SOLID原則適用                                                   |
| 6   | エラーハンドリング | 全エラーパスでユーザーフレンドリーメッセージ、内部情報非漏洩、recordEvent失敗時のスキル実行継続      |
| 7   | IPC契約            | P44/P45対策、引数形式一致、引数名セマンティクス一致                                                  |
| 8   | パフォーマンス     | 10,000件集計1秒以内、recordEvent50ms以内、SkillInvoker/SkillExecutor統合の既存テスト非破壊           |

---

## 完了条件

- [ ] 8項目のレビュー観点で全ての検証が完了している
- [ ] セキュリティレビューで全5ハンドラーが要件を満たしている
- [ ] 統計機能固有のセキュリティ検証（7項目）が完了している
- [ ] 型安全性レビューで型不整合がない
- [ ] IPC契約レビューでP44/P45対策が確認済みである
- [ ] ISO 8601シリアライズ方針が全レイヤーで一貫している
- [ ] パフォーマンスレビューで10,000件集計が1秒以内に完了することが確認済みである
- [ ] SkillInvoker/SkillExecutor統合が既存テストを破壊していないことが確認済みである
- [ ] テストカバレッジ目標を達成している
- [ ] 最終判定が PASS または MINOR である
- [ ] MINOR判定の場合は未タスク仕様書が3ステップ全完了で作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（4ファイル）が全て生成されていることを確認
- [ ] 判定結果がPASS/MINORであることを確認

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11（手動テスト検証）へ進む（PASS/MINOR の場合）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9J-skill-analytics/phase-11-manual-test.md`
