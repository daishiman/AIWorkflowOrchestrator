# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 3                                     |
| Phase名    | 設計レビューゲート                    |
| 前提Phase  | Phase 2                               |
| 後続Phase  | Phase 4                               |
| ステータス | completed                             |
| 作成日     | 2026-03-05                            |
| 機能名     | task-056c-notification-history-domain |

## 目的

要件と設計の整合を検査し、Phase 4以降で手戻りが発生しない仕様品質を確保する。

## 実行タスク

- 整合レビュー: Phase 1とPhase 2の要件-設計トレーサビリティを確認する
- セキュリティレビュー: IPC公開面とlistener運用の安全要件を確認する
- ゲート判定: PASS/MINOR/MAJOR/CRITICALで判定し戻り先を決定する

## 参照資料

| 参照資料            | パス                                                                           | 内容                   |
| ------------------- | ------------------------------------------------------------------------------ | ---------------------- |
| 要件定義仕様書      | `./phase-1-requirements.md`                                                    | 要件ベースライン       |
| 設計仕様書          | `./phase-2-design.md`                                                          | 設計ベースライン       |
| レビュー基準        | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | ゲート判定基準         |
| IPCセキュリティ正本 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | sender検証とsafeOn要件 |
| アーキテクチャ総論  | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | レイヤー境界と依存方向 |

## システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料            | パス                                                                                        | 内容                                             |
| ------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 状態管理            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Slice境界、永続化、個別セレクタ規約              |
| IPC契約             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | IPCチャネル命名規約、Main-Preload-Renderer契約   |
| IPC一覧             | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | 既存チャネルと追加チャネルの整合                 |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | object引数、safeInvoke/safeOn、レスポンス契約    |
| IPCセキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender検証、listener cleanup、historyAPI安全要件 |
| Preloadセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridge公開境界、ホワイトリスト            |
| エラー処理          | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーコード、Result型、失敗時契約               |
| 履歴データ型        | `.claude/skills/aiworkflow-requirements/references/ui-history-data-types.md`                | History API型、DTO、戻り値構造                   |
| 履歴統合            | `.claude/skills/aiworkflow-requirements/references/ui-history-integration.md`               | preload/main/renderer接続、統合テスト観点        |
| ナビゲーション      | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | 通知導線、履歴導線、View遷移                     |

## 実行手順

### Step 1: 要件-設計マッピング

- Phase 1の要件IDとPhase 2の設計項目を1対1で対応付ける。
- 未対応項目をレビュー指摘として分離する。

### Step 2: セキュリティ観点レビュー

- Preload公開APIが最小公開原則に一致しているか確認する。
- IPCハンドラの入力検証方針が明示されているか確認する。

### Step 3: 判定と戻り先確定

- 判定結果と理由をレビュー結果へ記録する。
- MAJOR以上は戻り先Phaseを明記する。

## 統合テスト連携（Phase 1〜11は必須）

| 接続要件カテゴリ | 記載内容                                     |
| ---------------- | -------------------------------------------- |
| API接続          | 統合テストで使用するチャネル一覧を確定       |
| 認証フロー       | 未認証時の拒否シナリオが設計に含まれるか確認 |
| データフロー     | 通知受信からUI反映までの追跡ポイントを確定   |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                          | 仕様参照先                                       |
| ------------------ | ------------------------------------------------- | ------------------------------------------------ |
| セキュリティ       | IPC公開・入力検証・認証判定が含まれるため適用     | aiworkflow-requirements: security-\*.md          |
| エラーハンドリング | IPC失敗・再試行・例外契約が含まれるため適用       | aiworkflow-requirements: error-handling.md       |
| テスタビリティ     | Slice/IPC単体および統合テスト設計が必要なため適用 | aiworkflow-requirements: quality-requirements.md |
| UI/UX              | 通知/履歴導線の表示検証が必要なため適用           | aiworkflow-requirements: ui-ux-\*.md             |
| アーキテクチャ     | Renderer/Main/Preloadの責務境界が対象のため適用   | aiworkflow-requirements: architecture-\*.md      |
| API設計            | IPCチャネル契約を定義するため適用                 | aiworkflow-requirements: api-\*.md               |
| データ整合性       | 履歴検索結果と通知既読状態の整合が必要なため適用  | aiworkflow-requirements: database-\*.md          |

## 成果物

| 成果物           | パス                                      | 内容               |
| ---------------- | ----------------------------------------- | ------------------ |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定と戻り先       |
| レビュー指摘一覧 | `outputs/phase-3/review-findings.md`      | 指摘分類と修正要求 |

## 完了条件

- [x] 要件-設計の対応表が作成済み
- [x] セキュリティ観点の確認項目が記録済み
- [x] ゲート判定と戻り先が記録済み
- [x] Phase 4開始条件が明記済み

## サブタスク管理

Phase実行開始時に以下のサブタスクを作成し、完了ごとに更新する。

1. 参照資料の確認
2. 実行タスクの実施（各タスクを個別管理）
3. 統合テスト連携の実施（Phase 1〜11は必須）
4. 成果物作成と配置確認
5. 完了条件の検証

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.json更新内容と整合している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-056c-notification-history-domain --phase 3
```

## Phase実行記録

### 実行タスク

- タスク結果: 実施完了（`outputs/phase-3/design-review-result.md` / `outputs/phase-3/review-findings.md` を出力）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-

## 次のPhase

Phase 4: テスト作成
