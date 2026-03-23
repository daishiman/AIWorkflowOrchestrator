# Phase 10: 最終レビュー

## メタ情報

| 項目          | 内容                                                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 10                                                                                                                      |
| 機能名        | WorkspaceChatPanelへのインラインモデルセレクタ配置 (TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION)                       |
| 作成日        | 2026-03-21                                                                                                              |
| 更新日        | 2026-03-23                                                                                                              |
| 担当          | -                                                                                                                       |
| ステータス    | 完了                                                                                                                    |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-9-quality.md` |

## 目的

Phase 1 の受入基準AC-3（WorkspaceChatでの動作）に対して実装が正しく満たされているかを多角的にレビューする。PASS/MINOR/MAJOR/CRITICALを判定し、Phase 11 へ進む条件を確認する。

## 実行タスク

### レビュー観点1: AC-3（WorkspaceChatでの動作）受入基準の充足確認

Phase 1 で定義した受入基準を実装が満たしているか確認する。

| 受入基準                                                           | 確認方法                     | 結果 |
| ------------------------------------------------------------------ | ---------------------------- | ---- |
| WorkspaceChatPanelの上部にInlineModelSelector(compact)が表示される | コード確認 + テストI-1のPASS | -    |
| blockedReason=null時にGuidanceBlockが非表示になる                  | テストI-2のPASSを確認        | -    |
| blockedReason="NO_MODEL"時にGuidanceBlockが表示される              | テストI-3のPASSを確認        | -    |
| blockedReason=null（モデル選択済み）でチャット操作が可能           | テストI-4のPASSを確認        | -    |
| ストリーミング中はInlineModelSelectorがdisabledになる              | テストI-5のPASSを確認        | -    |
| controller.blockedReasonの変化でGuidanceBlock表示が連動する        | テストI-6のPASSを確認        | -    |
| InlineModelSelectorとGuidanceBlockが同時表示される（初期状態）     | テストE-2のPASSを確認        | -    |
| ストリーミング開始/完了でdisabled状態が遷移する                    | テストE-3のPASSを確認        | -    |

### レビュー観点2: UI/UX品質レビュー（Apple HIG準拠）

```bash
# InlineModelSelector（compact）の配置確認
grep -n "InlineModelSelector\|compact" \
  apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx
```

**確認項目**:

- [ ] InlineModelSelectorがパネル上部に配置されており、ユーザーが一目で認識できる
- [ ] compact=true による省スペース配置がWorkspaceChatPanelのレイアウトを圧迫していない
- [ ] ストリーミング中のdisabled状態が視覚的に明確（グレーアウト等）
- [ ] モデル未選択時のGuidanceBlock表示がユーザーへの明確なガイダンスになっている

### レビュー観点3: コード品質チェック

**確認項目**:

- [ ] `any` 型の使用がないこと
- [ ] `@ts-ignore` / `@ts-expect-error` の不適切な使用がないこと
- [ ] P31対策（個別セレクタ使用）が維持されていること
- [ ] Props型定義が明示的に記述されていること
- [ ] ARIAラベルが適切に付与されていること（P47対策）

### レビュー観点4: DIP（依存性逆転原則）チェック（P61対策）

```bash
# WorkspaceChatPanelの依存確認
grep -n "import" apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx
```

**確認項目**:

- [ ] WorkspaceChatPanelがInlineModelSelectorをインターフェース経由で使用していること
- [ ] useWorkspaceChatControllerがモデル選択ストアに直接依存していないこと（必要な場合のみ確認）

### レビュー観点5: MINOR指摘の処理

MINOR判定の指摘事項は全て未タスク仕様書に変換する（省略不可）。

```
指摘の処理フロー:
1. docs/30-workflows/unassigned-task/ に指示書作成
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

| 観点                | 判定 | 指摘内容 |
| ------------------- | ---- | -------- |
| AC-3 受入基準の充足 | -    | -        |
| UI/UX品質           | -    | -        |
| コード品質          | -    | -        |
| DIP チェック        | -    | -        |
| **総合判定**        | -    | -        |

（Phase 10 実行時に記入）

## 参照資料

### プロジェクトルール

| 資料名           | パス                                 |
| ---------------- | ------------------------------------ |
| タスク実行ルール | `.claude/rules/05-task-execution.md` |
| アーキテクチャ   | `.claude/rules/01-architecture.md`   |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md` |

### Phase 1-3 ドキュメント

| 資料名                                          | パス                                                                                                                          |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計書（WorkspaceChat配置設計 3.2/3.3） | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/` （Task 01完了後に参照） |

### 前Phase成果物

| 資料名           | パス                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Phase 9 品質検証 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-9-quality.md` |

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

| 成果物                        | パス                                                                                                                          | 説明             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Phase 10 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-10-final-review.md` | 最終レビュー結果 |
| MINOR指摘の未タスク仕様書     | `docs/30-workflows/unassigned-task/<指摘内容>.md`                                                                             | MINOR時のみ      |

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION --phase 10
```

## 完了条件

- [ ] レビュー観点1〜4をすべて実施した
- [ ] AC-3の受入基準チェックテーブルに全結果を記入した
- [ ] UI/UX品質観点でcompact配置がレイアウトを圧迫していないことを確認した
- [ ] レビュー結果テーブルに総合判定を記入した
- [ ] MINOR判定の場合、未タスク仕様書を3ステップで作成した（省略不可）
- [ ] MAJOR/CRITICAL判定の場合、戻り先 Phase を明記した
- [ ] P52チェック（non-null assertion残存スキャン）を実施した

## 次のPhase

- PASS / MINOR（未タスク化後）: Phase 11: 手動テスト（`phase-11-manual-test.md`）
- MAJOR: 影響範囲に応じて Phase 1-5 へ戻る
- CRITICAL: Phase 1 へ戻り要件再確認
