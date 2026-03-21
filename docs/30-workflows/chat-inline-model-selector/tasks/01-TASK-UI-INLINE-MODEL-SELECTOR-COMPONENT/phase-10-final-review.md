# Phase 10: 最終レビュー

## メタ情報

| 項目          | 内容                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| Phase番号     | 10                                                                                                                 |
| 機能名        | チャット向けコンパクトモデルセレクタ共通コンポーネント作成 (TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT)               |
| 作成日        | 2026-03-21                                                                                                         |
| 担当          | -                                                                                                                  |
| ステータス    | 未着手                                                                                                             |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-9-quality.md` |

## 目的

Phase 1 の受入基準と Phase 2 の設計方針に対して、実装が正しく満たされているかを多角的にレビューする。PASS/MINOR/MAJOR/CRITICAL を判定し、Phase 11 へ進む条件を確認する。

## 実行タスク

### レビュー観点1: 受入基準の充足確認

Phase 1 で定義した受入基準を実装が満たしているか確認する。

| 受入基準 ID | 受入基準                                                            | 確認方法                                            | 結果 |
| ----------- | ------------------------------------------------------------------- | --------------------------------------------------- | ---- |
| AC-1        | Provider/Model の選択がドロップダウンで行えること                   | T1-2 / T2-2 / T3-1 テストの PASS を確認             | -    |
| AC-2        | ヘルスステータスがドットで視覚的に表示されること                    | T4-1 〜 T4-4 テストの PASS を確認                   | -    |
| AC-3        | compact prop でコンパクト表示が切替可能なこと                       | T6-1 / T6-2 テストの PASS を確認                    | -    |
| AC-4        | disabled prop で操作を無効化できること                              | T7-1 / T7-2 テストの PASS を確認                    | -    |
| AC-5        | index.ts からインポートでき、他のコンポーネントから再利用できること | `import { InlineModelSelector }` が解決できるか確認 | -    |
| AC-6        | キーボード操作（Escape/Tab/Enter）が動作すること                    | T8-1 〜 T8-3 テストの PASS を確認                   | -    |

### レビュー観点2: 再利用性の検証（AC-5）

```bash
# index.ts からのエクスポートを確認
grep "InlineModelSelector" apps/desktop/src/renderer/components/llm/index.ts

# 型定義のエクスポートも確認
grep "InlineModelSelectorProps" apps/desktop/src/renderer/components/llm/index.ts

# デザイントークン定数のエクスポートも確認（P47対策）
grep "selectorTriggerStyles\|healthDotStyles" apps/desktop/src/renderer/components/llm/index.ts
```

**確認項目**:

- [ ] `InlineModelSelector` コンポーネントが `index.ts` からエクスポートされている
- [ ] `InlineModelSelectorProps` 型が `index.ts` からエクスポートされている
- [ ] デザイントークン定数（`selectorTriggerStyles` 等）が `index.ts` からエクスポートされている

### レビュー観点3: コード品質チェック

**確認項目**:

- [ ] `any` 型の使用がないこと
- [ ] `@ts-ignore` / `@ts-expect-error` の不適切な使用がないこと
- [ ] P31 対策（個別セレクタ使用、合成 Hook 禁止）が維持されていること
- [ ] P47 対策（デザイントークン定数の `export`）が維持されていること
- [ ] P48 対策（`useShallow` の適用）が維持されていること

### レビュー観点4: Apple HIG 準拠チェック

**確認項目**:

- [ ] 8px グリッドに準拠したスペーシングが使用されていること
- [ ] 角丸が 8px〜12px の範囲内であること
- [ ] CSS 変数でライト/ダーク両モードのカラーが対応していること
- [ ] アクション要素にホバー・アクティブ・フォーカス状態のスタイルがあること

### レビュー観点5: MINOR 指摘の処理

MINOR 判定の指摘事項は全て未タスク仕様書に変換する（省略不可）。

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

| 観点             | 判定 | 指摘内容 |
| ---------------- | ---- | -------- |
| 受入基準の充足   | -    | -        |
| 再利用性（AC-5） | -    | -        |
| コード品質       | -    | -        |
| Apple HIG 準拠   | -    | -        |
| **総合判定**     | -    | -        |

（Phase 10 実行時に記入）

## 参照資料

### プロジェクトルール

| 資料名               | パス                                 |
| -------------------- | ------------------------------------ |
| タスク実行ルール     | `.claude/rules/05-task-execution.md` |
| アーキテクチャルール | `.claude/rules/01-architecture.md`   |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md` |

### 前Phase成果物

| 資料名           | パス                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| Phase 9 品質検証 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-9-quality.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                       | 対策                                         |
| ---------- | ------------------------------------------ | -------------------------------------------- |
| P52        | 防御ガード実装後の non-null assertion 残存 | 対象ファイル全体をスキャンして残存を確認     |
| P61        | IPC ハンドラの DIP 違反                    | （本タスクは UI コンポーネントのため対象外） |

## 実行手順

1. **レビュー観点1〜4の実施**: 各観点を順番にチェックし、結果を記録する
2. **総合判定の決定**: PASS/MINOR/MAJOR/CRITICAL を決定する
3. **MINOR 指摘の処理**: MINOR 判定の場合、未タスク仕様書（3ステップ）を作成する
4. **MAJOR/CRITICAL 指摘の処理**: 影響範囲に応じて適切な Phase へ戻る
5. **判定結果の記録**: レビュー結果テーブルに記入する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこの Phase で確認・更新する
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと 1 対 1 で突合する

## 成果物

| 成果物                        | パス                                                                                                                     | 説明             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| Phase 10 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-10-final-review.md` | 最終レビュー結果 |
| MINOR 指摘の未タスク仕様書    | `docs/30-workflows/unassigned-task/<指摘内容>.md`                                                                        | MINOR 時のみ     |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT --phase 10
```

## 完了条件

- [ ] レビュー観点1〜4をすべて実施した
- [ ] 受入基準チェックテーブル（AC-1〜AC-6）に全結果を記入した
- [ ] レビュー結果テーブルに総合判定を記入した
- [ ] MINOR 判定の場合、未タスク仕様書を3ステップで作成した（省略不可）
- [ ] MAJOR/CRITICAL 判定の場合、戻り先 Phase を明記した
- [ ] P52 チェック（non-null assertion 残存スキャン）を実施した

## 次のPhase

- PASS / MINOR（未タスク化後）: Phase 11: 手動テスト（`phase-11-manual-test.md`）
- MAJOR: 影響範囲に応じて Phase 1-5 へ戻る
- CRITICAL: Phase 1 へ戻り要件再確認
