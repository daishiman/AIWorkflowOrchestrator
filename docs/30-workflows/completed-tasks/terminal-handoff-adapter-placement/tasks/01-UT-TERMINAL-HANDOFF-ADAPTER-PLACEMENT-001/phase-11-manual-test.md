# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 11                                 |
| 機能名 | terminal-handoff-adapter-placement |
| 作成日 | 2026-03-22                         |

## 目的

自動テストでは検証できない統合動作・型整合性・リグレッションを手動で確認し、adapter 層の変更が既存機能を破壊していないことを検証する。

## テスト方式

本タスクはバックエンド/アダプター層の変更のみで、UI レイアウト変更を伴わない。`HandoffBlock.tsx` の型 import 変更（`@repo/shared` への正本 import 置換）は UI の見た目・振る舞いに影響しない。

スクリーンショット: **NON_VISUAL**（UIレイアウト変更なし。型 import 変更のみ）

## 実行タスク

- 機能テスト: adapter 関数の正常動作確認（自動テスト結果で代替）
- 統合テスト: `HandoffBlock.tsx` の型 import 変更後も Renderer がエラーなく起動すること
- リグレッションテスト: 既存の `TerminalHandoffBuilder` 関連テストが全 PASS

## 参照資料

| 資料名       | パス                                      | 説明                        |
| ------------ | ----------------------------------------- | --------------------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md` | Phase 10 成果物（判定結果） |
| 設計書       | `phase-2-design.md`                       | Phase 2 成果物（設計）      |
| 要件定義     | `phase-1-requirements.md`                 | FR/NFR/AC 定義              |

## テストカテゴリ

- **機能テスト**: adapter 関数（`toHandoffGuidance`）の各 `kind` 別変換が正常に動作すること（自動テスト結果で代替）
- **統合テスト**: `HandoffBlock.tsx` の型 import 変更後も Renderer がエラーなく起動すること
- **リグレッションテスト**: 既存の `TerminalHandoffBuilder` 関連テストが全 PASS すること

## スクリーンショット適用判断

| タスク種別                    | スクリーンショット   | 判断基準                            |
| ----------------------------- | -------------------- | ----------------------------------- |
| UI/UX 変更あり                | 必須                 | Renderer コンポーネントの追加・変更 |
| IPC/API 変更のみ              | 推奨                 | DevTools 動作確認エビデンスとして   |
| バックエンド/ドキュメントのみ | **不要（本タスク）** | UI 変更を伴わないタスク             |

本タスクは adapter 層（Main Process）の新規モジュール追加と `HandoffBlock.tsx` の型 import パス変更のみである。UI のレイアウト・スタイル・インタラクションに変更はないため、スクリーンショットは**不要**とする。

## テストケース

### 非視覚テストケース（NON_VISUAL）

| No    | カテゴリ       | テスト項目                                | 前提条件                                                     | 操作手順                                                                                             | 期待結果                                                        | 実行結果   | 備考                          |
| ----- | -------------- | ----------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------- | ----------------------------- |
| TC-01 | 機能テスト     | adapter 自動テスト全 PASS                 | Phase 6 までのテストが作成済み                               | `cd apps/desktop && pnpm vitest run src/main/adapters/handoff/`                                      | 全テストケースが PASS、カバレッジ Line 90%+                     | {{RESULT}} | 自動テスト結果で代替          |
| TC-02 | 統合テスト     | TypeCheck 全 PASS                         | adapter モジュールと HandoffBlock.tsx の型 import 変更が完了 | `pnpm typecheck`                                                                                     | exit 0、型エラー 0 件                                           | {{RESULT}} | import サイクルの検出も兼ねる |
| TC-03 | リグレッション | 既存 TerminalHandoffBuilder テスト全 PASS | 既存 Builder のテストファイルが存在                          | `cd apps/desktop && pnpm vitest run src/main/services/chat-edit/ src/main/services/runtime/`         | 既存テストが全て PASS                                           | {{RESULT}} | NFR-02 検証                   |
| TC-04 | リグレッション | Lint チェック PASS                        | adapter モジュールが作成済み                                 | `pnpm lint`                                                                                          | ESLint エラー 0 件                                              | {{RESULT}} | コード品質確認                |
| TC-05 | セキュリティ   | 機密情報非含有テスト PASS                 | セキュリティテストケースが作成済み                           | `cd apps/desktop && pnpm vitest run src/main/adapters/handoff/ --grep "sanitize\|secret\|sensitive"` | 機密情報（API キー、トークン）が `terminalCommand` に含まれない | {{RESULT}} | NFR-04 / AC-07 検証           |

## 統合テスト連携

手動統合テスト（バックエンド/アダプター層）を確認:

| テスト項目         | 確認内容                                   | 期待結果                          | 実行結果   |
| ------------------ | ------------------------------------------ | --------------------------------- | ---------- |
| 型整合性           | `pnpm typecheck` で型エラーなし            | exit 0                            | {{RESULT}} |
| adapter 自動テスト | adapter ユニットテスト全 PASS              | 全 PASS、カバレッジ基準達成       | {{RESULT}} |
| 既存テスト非破壊   | `TerminalHandoffBuilder` 関連テスト全 PASS | 全 PASS                           | {{RESULT}} |
| import サイクル    | `pnpm typecheck` + 手動 import パス確認    | adapter → shared の単方向依存のみ | {{RESULT}} |

## ウォークスルーシナリオ発見事項リアルタイム分類欄

| #   | シナリオ | 発見事項 | 分類 | 対応方針 |
| --- | -------- | -------- | ---- | -------- |
|     |          |          |      |          |

**分類基準**:

- **Blocker**: Phase 12 完了前に修正必須。仕様整合性・参照リンク切れ・追跡可能性の断絶
- **Note**: 改善推奨だが Phase 12 完了をブロックしない。未タスク化を検討
- **Info**: 記録のみ。今後の参考情報として残す

## 多角的チェック観点

| 観点           | 適用判断                               | 仕様参照先                                          |
| -------------- | -------------------------------------- | --------------------------------------------------- |
| アーキテクチャ | adapter 配置先と依存方向の手動確認     | `aiworkflow-requirements: architecture-overview.md` |
| セキュリティ   | terminalCommand のサニタイズテスト確認 | `aiworkflow-requirements: security-electron-ipc.md` |

**Electron デスクトップアプリ観点**:

| 層                   | 適用判断                         | 仕様参照先                                                                               |
| -------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| バックエンド（Main） | adapter の配置は Main Process 層 | `aiworkflow-requirements: architecture-overview.md`                                      |
| IPC 通信             | HandoffGuidance の IPC 転送確認  | `aiworkflow-requirements: interfaces-agent-sdk-skill-reference-share-debug-analytics.md` |

## 成果物

| 成果物               | パス                                             | 必須   | 説明                                                               |
| -------------------- | ------------------------------------------------ | ------ | ------------------------------------------------------------------ |
| テスト結果           | `outputs/phase-11/manual-test-result.md`         | 必須   | 手動テスト結果                                                     |
| 発見課題一覧         | `outputs/phase-11/discovered-issues.md`          | 必須   | 発見した課題（0 件でも出力）                                       |
| テスト実施レポート   | `outputs/phase-11/manual-test-report.md`         | 必須   | 実施概要と所見                                                     |
| 視覚レビュー         | `outputs/phase-11/ui-sanity-visual-review.md`    | 条件付 | NON_VISUAL判定のため省略（型import変更のみでUIレイアウト変更なし） |
| キャプチャメタデータ | `outputs/phase-11/phase11-capture-metadata.json` | 条件付 | NON_VISUAL判定のため省略                                           |

## 完了条件

- [ ] TC-01: adapter 自動テストが全 PASS し、カバレッジ基準を達成している
- [ ] TC-02: `pnpm typecheck` が exit 0 で完了し、型エラーが 0 件である
- [ ] TC-03: 既存 `TerminalHandoffBuilder` 関連テストが全 PASS している
- [ ] TC-04: `pnpm lint` が ESLint エラー 0 件で完了している
- [ ] TC-05: 機密情報非含有テストが PASS している
- [ ] 統合テスト手動確認が完了している
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] `outputs/phase-11/discovered-issues.md` が作成されている（0 件でも出力）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 10 最終レビュー結果）
2. TC-01〜TC-05 の実行
3. 統合テスト連携の実施
4. 成果物の作成・配置（manual-test-result.md, discovered-issues.md）
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase 完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/terminal-handoff-adapter-placement --phase 11
```

## 次の Phase

Phase 12: ドキュメント更新
