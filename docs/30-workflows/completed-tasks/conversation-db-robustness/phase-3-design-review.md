# Phase 3: 設計レビュー

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| Phase    | 3                                       |
| 機能名   | conversation-db-robustness              |
| 作成日   | 2026-03-18                              |
| タスクID | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 |
| 前Phase  | Phase 2（設計）                         |
| 次Phase  | Phase 4（テスト作成）                   |

## 目的

Phase 2 の設計が要件を満たし、実装に進めるかを判定する。

## 実行タスク

- タスク1: 要件との整合性レビュー
- タスク2: セキュリティ・安全性レビュー
- タスク3: simpler alternative の検討
- タスク4: PASS/MINOR/MAJOR 判定

## レビュー観点

| 観点                      | チェック項目                                                                   |
| ------------------------- | ------------------------------------------------------------------------------ |
| 要件整合                  | 受入基準5項目が全て設計でカバーされているか                                    |
| セキュリティ              | DB パスにパストラバーサル攻撃の余地がないか                                    |
| テスト容易性              | Factory 関数がモック可能か（`_resetForTesting()` 提供あるか）                  |
| 後方互換                  | 既存テスト133件が変更なしで通るか                                              |
| 複雑性                    | Factory 関数パターンが過度に複雑でないか                                       |
| Electron 標準             | `app.getPath('userData')` の使用が適切か                                       |
| パフォーマンス            | WAL モード・busyTimeout 設定が適切か（同時アクセス時の応答性）                 |
| 既存パターン整合          | Factory 関数パターンが既存 electron-store パターンと一致しているか             |
| Graceful Degradation 整合 | Fail-fast / Graceful Degradation の方針に矛盾がないか                          |
| activate イベント安全性   | activate イベントでの DB 再利用が安全か（二重初期化しないか）                  |
| will-quit タイミング      | will-quit での DB クローズタイミングが適切か（before-quit ではなく will-quit） |

## ゲート判定

| 判定              | 対応                      |
| ----------------- | ------------------------- |
| PASS              | Phase 4 へ進む            |
| MINOR             | 指摘対応後 Phase 4 へ進む |
| MAJOR（要件問題） | Phase 1 へ戻る            |
| MAJOR（設計問題） | Phase 2 へ戻る            |

### MINOR 追跡テーブル

| MINOR ID             | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| -------------------- | -------- | ------------- | ------------- | ---- |
| （レビュー時に記入） |          |               |               |      |

## 実行手順

### ステップ1: 要件整合レビュー

Phase 1 の受入基準5項目と Phase 2 設計を1対1で照合する。`outputs/phase-1/acceptance-criteria.md` の各項目が `outputs/phase-2/design-summary.md` でカバーされているかを確認。

### ステップ2: セキュリティレビュー

```bash
grep -n "dbPath\|path.join" apps/desktop/src/main/ipc/index.ts
```

Phase 2 設計の `dbPath` 入力値検証が `.claude/rules/04-electron-security.md` のIPCセキュリティ原則に準拠していることを確認。

### ステップ3: DIP準拠レビュー（P61対策）

Factory 関数パターンの設計が DIP に準拠し、`registerAllIpcHandlers` の引数型が `Database.Database | null`（具象クラスではなく SQLite の標準型）であることを設計書で確認。

### ステップ4: テスト容易性レビュー

DI によるモック差替可能性を設計書で確認。

### ステップ5: 後方互換性レビュー

`registerAllIpcHandlers` の第2引数が `Database.Database | null` であり、既存テスト133件が変更なしで通るかを設計書のシグネチャで確認。

### ステップ6: 判定と記録

PASS/MINOR/MAJOR を判定し、`outputs/phase-3/design-review-report.md` に記録。

## 参照資料

### 前Phase成果物

| 成果物               | パス                                         |
| -------------------- | -------------------------------------------- |
| 要件定義             | `outputs/phase-1/requirements-definition.md` |
| 受入基準             | `outputs/phase-1/acceptance-criteria.md`     |
| 設計サマリー         | `outputs/phase-2/design-summary.md`          |
| インターフェース定義 | `outputs/phase-2/interface-definitions.md`   |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容             |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------- |
| architecture-overview   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | レイヤー依存方向 |
| database-implementation | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | DB 実装パターン  |

## 統合テスト連携【必須】

該当なし（設計レビューフェーズのため）。

## 多角的チェック観点

| 観点               | 適用判断 | 仕様参照先                                                                                    |
| ------------------ | -------- | --------------------------------------------------------------------------------------------- |
| セキュリティ       | 適用     | `security-electron-ipc.md` — DB パスのパストラバーサル対策                                    |
| アーキテクチャ     | 適用     | `architecture-overview.md` — DI パターン・DIP 準拠確認                                        |
| データ整合性       | 適用     | `database-implementation.md` — WAL/pragma 設定                                                |
| エラーハンドリング | 適用     | `error-handling.md` — Infrastructure Error (4000-4999) 体系・Graceful Degradation             |
| パフォーマンス     | 適用     | WAL モード・busyTimeout 設定の適切性                                                          |
| 既存パターン整合   | 適用     | `arch-electron-services-core.md` — Factory 関数パターンが electron-store と一致しているか確認 |

## 成果物

| 成果物           | パス                                      | 説明                                                          |
| ---------------- | ----------------------------------------- | ------------------------------------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-report.md` | レビュー観点11項目の確認結果・PASS/MINOR/MAJOR 判定・指摘事項 |

## 完了条件

- [ ] レビュー観点11項目が全て確認されている
- [ ] PASS/MINOR/MAJOR の判定が下されている
- [ ] MINOR 指摘がある場合、追跡テーブルに記録されている
- [ ] Phase 4 開始条件が満たされている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

Phase 3 PASS 後、Phase 4（テスト作成）に進む。
