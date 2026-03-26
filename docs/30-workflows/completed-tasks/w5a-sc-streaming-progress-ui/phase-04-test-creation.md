# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 4                                |
| Phase名    | テスト作成                       |
| タスクID   | TASK-SC-07-STREAMING-PROGRESS-UI |
| 機能名     | w5a-sc-streaming-progress-ui     |
| 前提Phase  | Phase 3                          |
| 後続Phase  | Phase 5                          |
| ステータス | 未実施                           |
| 作成日     | 2026-03-22                       |

## 目的

GenerateStep UI改修に対するテストコードを実装前に作成する（TDDアプローチ）。happy-dom 環境の制約に従い `fireEvent` を使用する。

## 背景

Phase 3 の設計レビューで承認された設計に基づき、TDDの「Red」フェーズとしてテストを先に作成する。実装前にテストを書くことで、期待する振る舞いを明確にし、実装の品質を担保する。

## 実行タスク

### タスク1: GenerateStep 進捗表示テスト作成

**目的**: GenerateStepコンポーネントの進捗表示に関するテストを網羅的に作成する

**実行手順**:

1. 初期状態（生成前）のUI確認テストを作成する
2. 各段階（planning / generating-skill / generating-agents / validating）での表示確認テストを作成する
3. `percent` 値に応じたプログレスバー幅の確認テストを作成する
4. `previewContent` が存在する場合のプレビュー表示確認テストを作成する
5. P39（happy-dom制約）対策として `userEvent` の代わりに `fireEvent` を使用する

**期待される成果物**:

- `GenerateStep.test.tsx` 内に進捗表示関連のテストスイート

### タスク2: エラー表示テスト作成

**目的**: 3種類のエラーパターンとエラー解除後の動作をテストする

**実行手順**:

1. `API_KEY_NOT_SET` エラー時に設定画面への誘導リンクが表示されることを確認するテストを作成する
2. `LLM_ERROR` 時にリトライボタンが表示されることを確認するテストを作成する
3. `NETWORK_ERROR` 時にオフライン表示メッセージが出ることを確認するテストを作成する
4. エラー解除後（リトライ押下）にエラー表示が消えることを確認するテストを作成する

**期待される成果物**:

- `GenerateStep.test.tsx` 内にエラー表示関連のテストスイート

### タスク3: キャンセルテスト作成

**目的**: キャンセル機能の表示タイミング・IPC発火・メッセージ表示をテストする

**実行手順**:

1. キャンセルボタンが生成中にのみ表示されること（done / error 状態では非表示）を確認するテストを作成する
2. キャンセルボタン押下で `skill-creator:cancel` IPC が発火することを確認するテストを作成する
3. キャンセル後に「キャンセルしました」メッセージが表示されることを確認するテストを作成する

**期待される成果物**:

- `GenerateStep.test.tsx` 内にキャンセル関連のテストスイート
- `useCancelGeneration.test.ts` にHook単体のテスト

### タスク4: テスト設計注意事項の適用

**目的**: テスト全体にわたる共通の設計方針を適用し、テストの信頼性を確保する

**実行手順**:

1. P39（happy-dom制約）: happy-dom 環境のため `fireEvent` を使用する
2. 非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む
3. IPC リスナーはモックで代替する
4. P9（テスト間状態汚染）: テスト間の状態共有を防ぐため `beforeEach` でストアをリセットする
5. P63（インポートパス）: 既存テストファイルのインポートパターンに合わせる

**期待される成果物**:

- 全テストファイルで統一された設計方針が適用されている

## 参照資料

| 参照資料             | パス                                                                       | 内容                                |
| -------------------- | -------------------------------------------------------------------------- | ----------------------------------- |
| Phase 2 設計書       | `docs/30-workflows/w5a-sc-streaming-progress-ui/phase-02-design.md`        | UI設計仕様                          |
| Phase 3 設計レビュー | `docs/30-workflows/w5a-sc-streaming-progress-ui/phase-03-design-review.md` | 設計レビュー結果                    |
| 既存テストファイル   | `apps/desktop/src/renderer/components/skill/wizard/__tests__/`             | インポートパターンの参考（P63対策） |

## 成果物

| 成果物                      | パス                                                                                | 内容                             |
| --------------------------- | ----------------------------------------------------------------------------------- | -------------------------------- |
| GenerateStep テスト         | `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx` | UI進捗・エラー・キャンセルテスト |
| useStreamingProgress テスト | `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts`            | 進捗Hook単体テスト               |
| useCancelGeneration テスト  | `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts`             | キャンセルHook単体テスト         |

## 統合テスト連携

本Phaseで確認すべき統合テスト観点:

- GenerateStepコンポーネントとZustandストアの連携が正しくモック化されていること
- IPCリスナーのモック構成が実際のpreloadスクリプトの型定義と整合していること
- テストファイルのインポートパスが実際のモジュール構成と一致していること

## 完了条件

- [ ] GenerateStep 進捗表示テストが作成されている（初期状態・4段階・プレビュー）
- [ ] エラー表示テスト3パターンが作成されている
- [ ] キャンセルテストが作成されている（表示タイミング・IPC発火・メッセージ）
- [ ] P39（happy-dom制約）対策として `fireEvent` 使用が徹底されている
- [ ] P9（テスト間状態汚染）対策として `beforeEach` でストアリセットが設定されている
- [ ] P63（インポートパス）対策としてインポートパスが既存テストファイルと一致している
- [ ] 全テストが Red（実装前は失敗）であることが確認されている

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

## TDD検証

### TDD サイクル確認

テスト実行コマンド:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx src/renderer/hooks/__tests__/useStreamingProgress.test.ts
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

## Phase実行記録

Phase完了後、以下を記録してください:

| タスク           | 結果 | 備考 |
| ---------------- | ---- | ---- |
| （実行後に記入） |      |      |

- 良かった点:
- 問題点:
- 改善提案:
- 次Phaseへの引き継ぎ事項:

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 5: 実装

`docs/30-workflows/w5a-sc-streaming-progress-ui/phase-05-implementation.md`
