# UT-W3-ANALYTICS-HTTP-PROVIDER-001 - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| タスクID     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                                                 |
| タイトル     | Analytics HTTP プロバイダー実装（外部分析基盤への接続）                           |
| ステータス   | implementation_complete                                                           |
| 優先度       | Medium                                                                            |
| タスク種別   | implementation                                                                    |
| 依存タスク   | UT-W3-ANALYTICS-ADAPTER-001（完了済み）                                           |
| 関連タスク   | UT-W3-ANALYTICS-DASHBOARD-001（完了済み）                                         |
| 起票日       | 2026-04-13                                                                        |
| GitHub Issue | [#2125](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2125) (CLOSED) |

---

## 目的

`analyticsHandler.ts` Line 106 の TODO を実装し、Renderer からの analytics イベントを外部分析基盤（HTTP エンドポイント）へ実際に送信する `AnalyticsHttpProvider` を新規実装する。

現状、`analytics:send` IPC チャネルで受け取ったイベントは開発環境では `console.info` に出力されるだけで、本番環境では実質的に破棄される。UT-W3-ANALYTICS-ADAPTER-001（完了済み）で IPC パイプライン基盤は整備済みであり、本タスクでその上に HTTP 送信機能を実装する。

---

## スコープ

### 含む

- `AnalyticsHttpProvider` クラス新規実装（`apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts`）
- `analyticsHandler.ts` の TODO 解消（HTTP 送信関数の実装・接続）
- リトライ（指数バックオフ、最大 3 回）・タイムアウト（5 秒）・エラーハンドリング設計
- 外部エンドポイント URL の設定（環境変数 `ANALYTICS_ENDPOINT_URL`）
- `analyticsStore` に `sentCount` / `failedCount` カウンター追加
- `analytics:get-stats` IPC チャネル追加（`channels.ts`, `preload`, `ipcMain.handle`）
- ユニットテスト拡充（`AnalyticsHttpProvider.test.ts` 新規作成）

### 含まない

- 外部分析基盤自体の構築（バックエンドサービス側）
- analytics ダッシュボード UI（→ UT-W3-ANALYTICS-DASHBOARD-001、完了済み）
- コミット・PR 作成（別タスクにて対応）

---

## Phase 構成

| Phase | 名称                 | 仕様書ファイル                                               | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | completed  |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | completed  |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | completed  |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | completed  |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | completed  |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | completed  |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed  |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | completed  |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | completed  |
| 13    | PR 作成              | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |

---

## 主要成果物（計画）

| Phase | 主要成果物                                                                                                   |
| ----- | ------------------------------------------------------------------------------------------------------------ |
| 1     | 要件定義書、機能要件（FR）・非機能要件（NFR）・受け入れ基準（AC）一覧                                        |
| 2     | 設計書（AnalyticsHttpProvider クラス設計・IPC 4層整合性テーブル・analyticsStore スキーマ拡張・リトライ設計） |
| 3     | 設計レビュー書（MAJOR/MINOR 判定・承認記録）                                                                 |
| 4     | ユニットテストスケルトン（AnalyticsHttpProvider.test.ts）                                                    |
| 5     | AnalyticsHttpProvider.ts 実装、analyticsHandler.ts TODO 解消、channels.ts 拡張、preload 拡張                 |
| 6     | 拡充テスト（境界値・異常系・タイムアウト・リトライシナリオ）                                                 |
| 7     | カバレッジ確認書（目標: 行カバレッジ 80% 以上）                                                              |
| 8     | リファクタリング記録                                                                                         |
| 9     | 品質検証記録（typecheck・lint・test PASS 確認）                                                              |
| 10    | 最終レビュー書（AC-1〜AC-6 突合）                                                                            |
| 11    | 手動テスト記録・スクリーンショット撮影計画                                                                   |
| 12    | 実装ガイド・仕様更新要約・変更記録・未タスク検出・スキル改善報告                                             |
| 13    | PR 本文・PR URL                                                                                              |

---

## aiworkflow-requirements 抽出結果

本タスクに関連する `aiworkflow-requirements` 参照資料は以下のとおりです。

| 参照資料                        | パス                                                                          | 関連性                                                             |
| ------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| IPC Agent API 契約              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`          | analytics:send / analytics:get-stats チャネル契約確認              |
| Electron セキュリティ API 設計  | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`  | contextBridge 経由の API 公開・ホワイトリスト管理                  |
| Electron IPC セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | preload サンドボックス・ALLOWED_INVOKE_CHANNELS 登録規則           |
| エラーハンドリング設計          | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | エラー非伝播設計・catch 握り潰しパターン・success: false 返却      |
| 品質要件                        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | TDD・カバレッジ下限・typecheck/lint PASS 要件                      |
| Electron サービスアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` | Main プロセスサービス配置規則・DI 境界・サービスクラス設計パターン |

---

## 受入基準サマリー

| AC ID | 基準                                                                           |
| ----- | ------------------------------------------------------------------------------ |
| AC-1  | `ANALYTICS_ENDPOINT_URL` が設定されている環境でイベントが HTTP POST 送信される |
| AC-2  | 送信失敗時（ネットワークエラー / タイムアウト）に `success: false` が返る      |
| AC-3  | リトライが最大 3 回実行される（指数バックオフ）                                |
| AC-4  | `analyticsStore.sentCount` / `failedCount` が正確に記録される                  |
| AC-5  | `ANALYTICS_ENDPOINT_URL` 未設定時は no-op で動作する                           |
| AC-6  | `AnalyticsHttpProvider.test.ts` が新規作成されテストが green                   |

---

## 実行フロー

```
Phase 1 (要件定義) → Phase 2 (設計) → Phase 3 (設計レビューゲート) → Phase 4 (テスト作成)
                                              ↓ (MAJOR → 戻り)
Phase 5 (実装) → Phase 6 (テスト拡充) → Phase 7 (カバレッジ確認)
                                              ↓ (未達 → 戻り)
Phase 8 (リファクタリング) → Phase 9 (品質保証) → Phase 10 (最終レビューゲート)
                                              ↓ (MAJOR → 戻り)
Phase 11 (手動テスト) → Phase 12 (ドキュメント更新) → Phase 13 (PR 作成) → 完了
```

---

## Phase 完了時の必須アクション

1. **タスク 100% 実行**: Phase 内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json 更新**: `complete-phase.js` で Phase 完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase 完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

_このファイルはタスク仕様書として 2026-04-14 に作成されました。_
