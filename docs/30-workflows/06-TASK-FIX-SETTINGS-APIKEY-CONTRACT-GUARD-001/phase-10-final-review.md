# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 10                                               |
| 機能名     | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001   |
| タスク名   | 設定画面 apiKey.list 契約防御と providers 正規化 |
| 作成日     | 2026-03-06                                       |
| ステータス | 未実施                                           |

## 目的

Phase 1-9 の全成果物を横断レビューし、PASS / MINOR / MAJOR / CRITICAL のゲート判定を行う。

## 実行タスク

- 横断レビュー: Phase 1-9 の全成果物に対してレビュー観点 1-5 を網羅的に確認する
- ゲート判定: レビュー結果に基づき PASS / MINOR / MAJOR / CRITICAL を判定する
- MINOR 未タスク変換: MINOR 指摘は全て未タスク仕様書に変換する（省略不可）
- 差戻し対応: MAJOR / CRITICAL は影響範囲に応じて Phase 1-5 へ差戻す

## ゲート判定基準

| 判定     | 条件                                                                | 対応                                                   |
| -------- | ------------------------------------------------------------------- | ------------------------------------------------------ |
| PASS     | 全レビュー観点を充足、blocking リスクなし                           | Phase 11 へ進行                                        |
| MINOR    | 機能影響のない改善指摘（命名不統一、コメント不足、テスト名改善等）  | **全て**未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | 防御ガードの欠落、型定義不整合、テストカバレッジ基準未達            | 影響範囲に応じて Phase 1-5 へ戻る                      |
| CRITICAL | セキュリティ脆弱性、データ破損リスク、Renderer クラッシュ経路の残存 | Phase 1 へ戻り要件再確認                               |

## レビュー観点

### 観点 1: Renderer 4 層防御の完全性

`security-electron-ipc.md` v1.13.0 で定義された 4 層防御が全て実装されているか確認する。

| 防御層  | 確認項目                                            | 判定 |
| ------- | --------------------------------------------------- | ---- |
| Layer 1 | `window.electronAPI?.apiKey` 存在チェック           | [ ]  |
| Layer 2 | `result.success` チェック                           | [ ]  |
| Layer 3 | `Array.isArray(result.data?.providers)` 配列型検証  | [ ]  |
| Layer 4 | フォールバック UI 表示（エラーメッセージ + 再試行） | [ ]  |

### 観点 2: Main 側バリデーション

| 確認項目                                                                             | 判定 |
| ------------------------------------------------------------------------------------ | ---- |
| `apiKeyHandlers.ts` のレスポンスが `IPCResponse<ProviderListResult>` envelope に準拠 | [ ]  |
| エラーレスポンスが `IPCError { code, message }` 形式                                 | [ ]  |
| 内部エラー情報が Renderer に漏洩しない（サニタイズ済み）                             | [ ]  |

### 観点 3: テストカバレッジ基準充足

| 対象ファイル               | Line 目標 | Branch 目標 | Function 目標 | 実績 | 判定 |
| -------------------------- | --------- | ----------- | ------------- | ---- | ---- |
| `ApiKeysSection/index.tsx` | 90%+      | 70%+        | 90%+          |      | [ ]  |
| `apiKeyHandlers.ts`        | 80%+      | 60%+        | 80%+          |      | [ ]  |

### 観点 4: 型定義整合性

| 確認項目                                                               | 判定 |
| ---------------------------------------------------------------------- | ---- |
| `packages/shared/types/api-keys.ts` と実装の `ProviderStatus` 型が一致 | [ ]  |
| `apps/desktop/src/preload/types.ts` との型整合性                       | [ ]  |
| P32 準拠: 型変更時は shared + preload の 2 箇所同時更新                | [ ]  |

### 観点 5: P42/P48 準拠チェック

| 確認項目                                                           | 判定 |
| ------------------------------------------------------------------ | ---- |
| P42: 文字列引数に `.trim()` バリデーションが適用されている         | [ ]  |
| P48: `result.data!` のような non-null assertion が使用されていない | [ ]  |
| P48: `Array.isArray()` / optional chaining による実行時型検証      | [ ]  |

## MINOR 指摘の未タスク変換手順

MINOR 判定の場合、**全指摘**を未タスク仕様書に変換する（「機能影響なし」でも省略不可）。

1. `tasks/unassigned-task/` に指示書を作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンクを追加
4. `unassigned-task-detection.md` の件数・ステータスを更新

## 差戻し先マッピング

| 問題の種類         | 差戻し先 |
| ------------------ | -------- |
| 要件の曖昧性・欠落 | Phase 1  |
| 設計の不整合       | Phase 2  |
| テスト不足         | Phase 4  |
| 実装の欠陥         | Phase 5  |
| カバレッジ未達     | Phase 6  |

## 参照資料

| 資料名                | パス                                                                         | 用途                        |
| --------------------- | ---------------------------------------------------------------------------- | --------------------------- |
| security-electron-ipc | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | 4 層防御パターン（v1.13.0） |
| ui-ux-settings        | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`        | 異常系表示仕様（v1.5.0）    |
| interfaces-auth       | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`       | IPCResponse envelope        |
| known-pitfalls        | `.claude/rules/06-known-pitfalls.md`                                         | P42/P48 チェック            |
| Phase 1-9 成果物      | `outputs/phase-1/` 〜 `outputs/phase-9/`                                     | レビュー入力                |

## 成果物

| 成果物           | パス                                      | 説明                      |
| ---------------- | ----------------------------------------- | ------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 全観点の判定結果と指摘    |
| ゲート判定       | `outputs/phase-10/gate-decision.md`       | PASS/MINOR/MAJOR/CRITICAL |
| 差戻し計画       | `outputs/phase-10/rollback-plan.md`       | MAJOR/CRITICAL 時の戻り先 |

## 完了条件

- [ ] 5 つのレビュー観点が全て判定済み
- [ ] ゲート判定が PASS / MINOR / MAJOR / CRITICAL のいずれかで記録されている
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換されている
- [ ] MAJOR/CRITICAL の場合、差戻し先が明記されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次の Phase

Phase 11: 手動テスト検証

## 統合テスト連携

- 本Phaseの結果は `apps/desktop` の対象Vitest実行（`apiKeyHandlers.list` / `profileHandlers.identities` / `ApiKeysSection`）と連動して判定する。
- Phase 11 ではスクリーンショット証跡（TC-11-01〜03）を統合テスト結果と同じ実装リビジョンで取得する。
