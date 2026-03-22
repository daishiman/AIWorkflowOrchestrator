# Phase 10: 最終レビュー

## メタ情報

| 項目          | 内容                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Phase番号     | 10                                                                                                  |
| 機能名        | LLM設定永続化修正 (TASK-FIX-LLM-CONFIG-PERSISTENCE)                                                 |
| 作成日        | 2026-03-20                                                                                          |
| 担当          | -                                                                                                   |
| ステータス    | 未着手                                                                                              |
| 前Phase成果物 | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-9-quality-assurance.md` |

## 目的

Phase 1 の受入基準と Phase 2 の設計方針に対して、実装が正しく満たされているかを多角的にレビューする。PASS/MINOR/MAJOR/CRITICALを判定し、Phase 11 へ進む条件を確認する。

## 実行タスク

### レビュー観点1: Phase 1 受入基準の充足確認

Phase 1 で定義した受入基準を実装が満たしているか確認する。

| 受入基準                                                                                       | 確認方法                                               | 結果 |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---- |
| アプリ再起動後もProvider/Model選択が保持され、Settings画面に正しく表示される                   | Phase 11 手動テストで確認（Phase 10 では設計確認のみ） | -    |
| 再起動後、Main ProcessのcurrentConfigに選択されたProvider/Modelが同期される                    | syncSelectedConfigToMain()の呼び出しコードを確認       | -    |
| 存在しないProviderIDが永続化されていた場合、null（未選択状態）にフォールバックする             | validateAndSyncPersistedConfigの実装を確認             | -    |
| persistに新たにAPIキーや認証情報が含まれないこと                                               | partialize関数のコードを確認                           | -    |
| 既存persistフィールド（`currentView`, `userProfile`, `autoSyncEnabled`）が引き続き正常動作する | T2-3テストとmigrate関数の実装を確認                    | -    |

### レビュー観点2: セキュリティレビュー

```bash
# partialize関数の最終確認
grep -A 15 "partialize" apps/desktop/src/renderer/store/index.ts

# 機密情報の混入確認
grep -n "apiKey\|token\|secret\|password\|credential" \
  apps/desktop/src/renderer/store/index.ts
```

**確認項目**:

- [ ] partialize関数に機密情報が含まれていないこと
- [ ] `selectedProviderId` と `selectedModelId` が単なるID文字列であること（セキュリティ上の問題がないこと）

### レビュー観点3: コード品質チェック

**確認項目**:

- [ ] `any` 型の使用がないこと
- [ ] `@ts-ignore` / `@ts-expect-error` の不適切な使用がないこと
- [ ] P49対策（`in` 演算子でのナロイング）が適用されていること
- [ ] P62対策のコメントが存在すること
- [ ] migrate関数にversionアップ理由のコメントが存在すること

### レビュー観点4: DIP（依存性逆転原則）チェック（P61対策）

**確認項目**:

- [ ] `validateAndSyncPersistedConfig` が具象クラスに直接依存していないこと
- [ ] 外部のProvider型定義（packages/shared等）を正しくインポートしていること

### レビュー観点5: MINOR指摘の処理

MINOR判定の指摘事項は全て未タスク仕様書に変換する（省略不可）。

```
指摘の処理フロー:
1. unassigned-task/ に指示書作成
2. task-workflow.md 残課題テーブルに登録
3. 関連仕様書に参照リンク追加
```

### レビュー判定

| 判定     | 基準                                                     |
| -------- | -------------------------------------------------------- |
| PASS     | すべての受入基準と品質観点が満たされている               |
| MINOR    | 軽微な指摘あり（機能影響なし）、未タスク化後 Phase 11 へ |
| MAJOR    | 設計・実装に根本的な問題あり → Phase 1-5 へ戻る          |
| CRITICAL | 要件に重大な誤り → Phase 1 へ戻り要件再確認              |

**レビュー結果**:

| 観点                   | 判定 | 指摘内容 |
| ---------------------- | ---- | -------- |
| Phase 1 受入基準の充足 | -    | -        |
| セキュリティ           | -    | -        |
| コード品質             | -    | -        |
| DIP チェック           | -    | -        |
| **総合判定**           | -    | -        |

（Phase 10 実行時に記入）

## 参照資料

### プロジェクトルール

| 資料名             | パス                                    |
| ------------------ | --------------------------------------- |
| タスク実行ルール   | `.claude/rules/05-task-execution.md`    |
| セキュリティルール | `.claude/rules/04-electron-security.md` |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`    |

### 前Phase成果物

| 資料名           | パス                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義 | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-1-requirements.md`      |
| Phase 2 設計     | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-2-design.md`            |
| Phase 9 品質検証 | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-9-quality-assurance.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                          | 対策                                     |
| ---------- | --------------------------------------------- | ---------------------------------------- |
| P52        | 防御ガード実装後の non-null assertion 残存    | 対象ファイル全体をスキャンして残存を確認 |
| P61        | IPC ハンドラの DIP 違反が Phase 10 まで未検出 | 依存型がインターフェースであることを確認 |

## 実行手順

1. **レビュー観点1〜4の実施**: 各観点を順番にチェックし、結果を記録する
2. **総合判定の決定**: PASS/MINOR/MAJOR/CRITICALを決定する
3. **MINOR指摘の処理**: MINOR判定の場合、未タスク仕様書（3ステップ）を作成する
4. **MAJOR/CRITICAL指摘の処理**: 影響範囲に応じて適切な Phase へ戻る
5. **判定結果の記録**: レビュー結果テーブルに記入する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                        | パス                                                                                            | 説明             |
| ----------------------------- | ----------------------------------------------------------------------------------------------- | ---------------- |
| Phase 10 仕様書（本ファイル） | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-10-final-review.md` | 最終レビュー結果 |
| MINOR指摘の未タスク仕様書     | `docs/30-workflows/unassigned-task/<指摘内容>.md`                                               | MINOR時のみ      |

## 完了条件

- [ ] レビュー観点1〜4をすべて実施した
- [ ] Phase 1 の受入基準チェックテーブルに全結果を記入した
- [ ] レビュー結果テーブルに総合判定を記入した
- [ ] MINOR判定の場合、未タスク仕様書を3ステップで作成した（省略不可）
- [ ] MAJOR/CRITICAL判定の場合、戻り先 Phase を明記した
- [ ] P52チェック（non-null assertion残存スキャン）を実施した

## 次Phase

- PASS / MINOR（未タスク化後）: Phase 11: 手動テスト（`phase-11-manual-test.md`）
- MAJOR: 影響範囲に応じて Phase 1-5 へ戻る
- CRITICAL: Phase 1 へ戻り要件再確認
