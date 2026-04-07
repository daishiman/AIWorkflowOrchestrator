# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 10                              |
| Phase名    | 最終レビュー                    |
| 機能名     | ipc-session-runtime-unification |
| 対象機能   | TASK-UI-03 IPC 二重経路統合     |
| 前提Phase  | Phase 9: 品質保証               |
| 次Phase    | Phase 11: 手動テスト            |
| ステータス | pending                         |
| 作成日     | 2026-04-06                      |

## 目的

AC-1〜AC-7 の総合判定を行い、IPC 二重経路統合が完全に機能することを最終確認して手動テストへ進める。

## 実行タスク

### Task 1: AC マトリクス最終照合

AC-1〜AC-7 が test / code / doc の 3 面で閉じているか確認する:

| AC   | テスト | コード | ドキュメント | 判定 |
| ---- | ------ | ------ | ------------ | ---- |
| AC-1 | -      | -      | -            | -    |
| AC-2 | -      | -      | -            | -    |
| AC-3 | -      | -      | -            | -    |
| AC-4 | -      | -      | -            | -    |
| AC-5 | -      | -      | -            | -    |
| AC-6 | -      | -      | -            | -    |
| AC-7 | -      | -      | -            | -    |

### Task 2: IPC 統合完全性最終確認

- Session IPC と Runtime IPC が設計方針（統合 or 分離契約）に沿って整理されていることを最終確認する
- preload API surface が一貫していることを確認する
- creatorHandlers のハンドラー構成が整合的であることを確認する
- チャネルホワイトリストが正しいことを確認する

### Task 3: セキュリティ最終評価

- パストラバーサル防止が全チャネルに均一適用されていることを最終確認する
- sender 検証が全ハンドラーに適用されていることを最終確認する
- セキュリティギャップがないことを最終確認する

### Task 4: TASK-UI-01 依存関係確認

- TASK-UI-01（ルート昇格）が完了していることを確認する
- ルート構造の変更が IPC 統合に影響を与えていないことを確認する

### Task 5: gate 判定

- PASS: 手動テストへ進む
- MINOR: 手動テストしながら観測する
- MAJOR: Phase 8 へ戻す

## 参照資料

| 資料名                  | パス                                          | 説明           |
| ----------------------- | --------------------------------------------- | -------------- |
| 設計成果物              | `outputs/phase-2/design-document.md`          | 統合方針       |
| 統合戦略書              | `outputs/phase-2/ipc-unification-strategy.md` | 方針選択根拠   |
| 実装記録                | `outputs/phase-5/implementation-record.md`    | 実装内容       |
| カバレッジレポート      | `outputs/phase-7/coverage-report.md`          | AC 対応表      |
| QA レポート             | `outputs/phase-9/qa-report.md`                | gate 入力      |
| IPCチャネルインベントリ | `outputs/phase-1/ipc-channel-inventory.md`    | Phase 1 成果物 |
| 仕様抽出マップ          | `outputs/phase-1/spec-extraction-map.md`      | Phase 1 成果物 |
| リファクタリングログ    | `outputs/phase-8/refactoring-log.md`          | Phase 8 成果物 |

## AC 対応表

| AC   | 条件                          | 対応Phase/テスト            | 判定 |
| ---- | ----------------------------- | --------------------------- | ---- |
| AC-1 | IPC 経路の統一設計方針        | Phase 2/3 設計・レビュー    | TBD  |
| AC-2 | 開発者が IPC 経路を判断できる | Phase 12 ドキュメント       | TBD  |
| AC-3 | preload 層の API surface 整理 | Phase 5 実装 / UT           | TBD  |
| AC-4 | creatorHandlers 整合的構成    | Phase 5 実装 / UT           | TBD  |
| AC-5 | IPC 契約チェックリスト準拠    | Phase 9 QA / チェックリスト | TBD  |
| AC-6 | セキュリティ要件均一適用      | Phase 6 セキュリティテスト  | TBD  |
| AC-7 | 既存テスト pass               | Phase 5 実装後 / CI         | TBD  |

## システム仕様（aiworkflow-requirements）

本タスクに関連する正本仕様への確認事項:

### IPC 契約チェックリスト

- [ ] `creatorHandlers.ts` の IPC チャネル定義が channels.ts と整合している
- [ ] Session/Runtime 関連の IPC メッセージ型が `packages/shared/src/types/skillCreator.ts` に定義されている
- [ ] `preload/skill-creator-api.ts` に統合後の API surface が正しく公開されている
- [ ] safeInvoke のタイムアウト設定が正本仕様と一致している

### セキュリティ仕様

- [ ] `security-skill-ipc-core.md` の全要件が実装されていることを確認した
- [ ] パストラバーサル防止が全チャネルで均一に適用されていることを確認した
- [ ] sender 検証が全ハンドラーで適用されていることを確認した

## 統合テスト連携

- AC とテスト対応表をレビュー結果へ持ち込む
- IPC 統合の完全性判定を documentation へ引き継ぐ

## 成果物

| 成果物           | パス                                      | 説明                     |
| ---------------- | ----------------------------------------- | ------------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | AC マトリクス、gate 判定 |

## 完了条件

- [ ] AC-1〜AC-7 の総合判定がある
- [ ] IPC 統合完全性が最終確認されている
- [ ] セキュリティ均一性が最終評価されている
- [ ] TASK-UI-01 依存関係が確認されている
- [ ] 手動テストへの entry 条件が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 11: 手動テスト](./phase-11-manual-test.md)
