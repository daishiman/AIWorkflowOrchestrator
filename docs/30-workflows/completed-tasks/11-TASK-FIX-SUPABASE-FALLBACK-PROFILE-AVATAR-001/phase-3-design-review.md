# Phase 3: 設計レビュー

## メタ情報

| 項目      | 値                                            |
| --------- | --------------------------------------------- |
| Phase     | 3                                             |
| タスクID  | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 |
| 機能名    | supabase-fallback-profile-avatar              |
| 作成日    | 2026-03-07                                    |
| 前提Phase | Phase 2 設計                                  |

## 目的

Phase 2の設計内容を多角的に検証し、要件との整合性・実装の妥当性・セキュリティ・保守性の観点からレビューを実施する。

## 実行タスク

- Task 1: 要件-設計トレーサビリティ検証: AC-1〜AC-6 が設計に漏れなく対応しているか確認する
- Task 2: レビュー観点の確認: 一貫性 / 網羅性 / セキュリティ / 保守性で設計を精査する
- Task 3: ゲート判定基準の適用: PASS / MINOR / MAJOR の戻り先を明確にする

### Task 1: 要件-設計トレーサビリティ検証

| 受入基準                                   | 設計での対応                                                                   | 判定   |
| ------------------------------------------ | ------------------------------------------------------------------------------ | ------ |
| AC-1: Profile画面クラッシュ防止            | `registerProfileFallbackHandlers()` で11チャンネルにフォールバック登録         | 要確認 |
| AC-2: Profile 11チャンネルのレスポンス形式 | `PROFILE_ERROR_CODES.NOT_CONFIGURED` (`profile/not-configured`) 付きレスポンス | 要確認 |
| AC-3: Avatar 3チャンネルのレスポンス形式   | `AVATAR_ERROR_CODES.NOT_CONFIGURED` (`avatar/not-configured`) 付きレスポンス   | 要確認 |
| AC-4: Supabase設定済み時の正常動作         | if/else排他分岐で担保                                                          | 要確認 |
| AC-5: 既存パターンとの一貫性               | `registerAuthFallbackHandlers()` と同一構造                                    | 要確認 |
| AC-6: 二重登録防止（P5対策）               | `unregisterAllIpcHandlers()` + 排他分岐                                        | 要確認 |

### Task 2: レビュー観点

#### 2.1 一貫性検証

- [ ] レスポンス構造が `registerAuthFallbackHandlers()` と同一形式か
- [ ] エラーコードの命名規約（`{DOMAIN}_NOT_CONFIGURED`）が統一されているか
- [ ] 型定義（`ReadonlyArray<readonly [string, () => Promise<unknown>]>`）が一致しているか

#### 2.2 網羅性検証

- [ ] `channels.ts` に定義された Profile チャンネル11個が全て含まれているか
- [ ] `channels.ts` に定義された Avatar チャンネル3個が全て含まれているか
- [ ] 将来追加されるチャンネルの検出方法が考慮されているか

#### 2.3 セキュリティ検証

- [ ] エラーメッセージに内部パス・スタックトレースが含まれていないか
- [ ] フォールバックレスポンスから設定情報が推測されないか

#### 2.4 保守性検証

- [ ] チャンネル名はハードコード文字列ではなく `IPC_CHANNELS` 定数を使用しているか（P27対策）
- [ ] 関数が独立しておりテスト可能か

### Task 3: ゲート判定基準

| 判定              | 条件                       | 対応                  |
| ----------------- | -------------------------- | --------------------- |
| PASS              | 全レビュー項目がクリア     | Phase 4 へ進む        |
| MINOR             | 軽微な改善指摘あり         | 指摘対応後 Phase 4 へ |
| MAJOR（設計問題） | 設計パターンの見直しが必要 | Phase 2 へ戻る        |
| MAJOR（要件問題） | 要件の追加・変更が必要     | Phase 1 へ戻る        |

## 参照資料

| 資料名           | パス                                                                                                         | 説明         |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | ------------ |
| Phase 1 要件定義 | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/phase-1-requirements.md` | 受入基準     |
| Phase 2 設計     | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/phase-2-design.md`       | 設計内容     |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                                                         | P5, P27, P42 |

### システム仕様（aiworkflow-requirements）

- `references/api-ipc-auth.md` - Profile / Avatar IPC 契約の正本
- `references/security-electron-ipc.md` - fallback 登録の安全性と `ipcMain.handle` 制約
- `references/ipc-contract-checklist.md` - 通常経路 / fallback 経路の契約レビュー観点
- `references/error-handling.md` - error envelope と not configured 系コードの整合確認先

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

1. Phase 2 設計書を通読
2. Task 2 の全レビュー観点をチェック
3. `channels.ts` との照合で網羅性を検証
4. 既存 `registerAuthFallbackHandlers()` との一貫性を検証
5. レビュー結果をゲート判定基準に照合
6. 判定結果を記録

## 統合テスト連携

- Phase 4 に進む前提として、fallback 応答の shape とチャンネル件数をそのままテストケースへ転記できることを確認する
- Phase 6 / 7 に向けて、「件数同期」「二重登録防止」「通常経路との排他」の 3 観点が回帰項目になることを固定する
- Phase 11 の手動テストで再現可能なシナリオになっているかを確認し、UI クラッシュ防止の検証導線を残す

## 成果物

| 成果物           | パス                                                                                                          | 説明           |
| ---------------- | ------------------------------------------------------------------------------------------------------------- | -------------- |
| 設計レビュー結果 | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/phase-3-design-review.md` | 本ドキュメント |

## 完了条件

- [ ] 要件-設計トレーサビリティの全項目を検証済み
- [ ] レビュー観点の全チェック項目を確認済み
- [ ] ゲート判定（PASS/MINOR/MAJOR）が決定済み
- [ ] MINOR指摘がある場合は修正箇所が明記済み

## 次のPhase

Phase 4: テスト作成
