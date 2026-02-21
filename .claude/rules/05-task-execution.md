# タスク実行ワークフロールール

> 正本: `task-specification-creator/SKILL.md`, `references/phase-templates.md`, `references/spec-update-workflow.md`
> 失敗事例: [06-known-pitfalls.md](./06-known-pitfalls.md)

## Phase 1-13 概要

| Phase | 名称             | 目的                                       | ゲート                    |
| ----- | ---------------- | ------------------------------------------ | ------------------------- |
| 1     | 要件定義         | ユーザー要求から要件抽出・受入基準定義     | -                         |
| 2     | 設計             | アーキテクチャ・インターフェース設計       | -                         |
| 3     | 設計レビュー     | 要件・設計の妥当性検証                     | PASS/MINOR/MAJOR          |
| 4     | テスト作成       | テストケース設計・テストコード作成         | -                         |
| 5     | 実装             | プロダクションコード実装                   | -                         |
| 6     | テスト拡充       | カバレッジ不足箇所のテスト追加             | -                         |
| 7     | カバレッジ確認   | カバレッジ基準の充足確認                   | 未達→Phase 6              |
| 8     | リファクタリング | コード品質改善                             | -                         |
| 9     | 品質検証         | Lint・型チェック・全テスト実行             | -                         |
| 10    | 最終レビュー     | 多角的品質・整合性検証                     | PASS/MINOR/MAJOR/CRITICAL |
| 11    | 手動テスト       | UIテスト・E2Eシナリオ実行                  | -                         |
| 12    | ドキュメント     | 実装ガイド・システム仕様更新・未タスク検出 | -                         |
| 13    | 完了             | 成果物最終確認・PR準備                     | -                         |

## レビューゲート判定

### Phase 3（設計レビュー）

| 判定              | 対応                  |
| ----------------- | --------------------- |
| PASS              | Phase 4 へ            |
| MINOR             | 指摘対応後 Phase 4 へ |
| MAJOR（要件問題） | Phase 1 へ戻る        |
| MAJOR（設計問題） | Phase 2 へ戻る        |

### Phase 10（最終レビュー）

| 判定     | 対応                                               |
| -------- | -------------------------------------------------- |
| PASS     | Phase 11 へ                                        |
| MINOR    | 未タスク仕様書に変換後 Phase 11 へ（**省略不可**） |
| MAJOR    | 影響範囲に応じて Phase 1-5 へ戻る                  |
| CRITICAL | Phase 1 へ戻り要件再確認                           |

- DO: MINOR 指摘は**全て**未タスク仕様書に変換（「機能影響なし」でも省略不可）

## Phase 12 必須チェックリスト

> **最重要**: Phase 12 は漏れが最も発生しやすい Phase。必ず全項目を逐次確認。
> 失敗事例: [06-known-pitfalls.md#P1-P4](./06-known-pitfalls.md)

### Task 1: 実装ガイド

- [ ] `implementation-guide.md` Part 1（中学生レベル概念説明 — 日常例え必須）
- [ ] `implementation-guide.md` Part 2（開発者向け実装詳細）
- [ ] `api-documentation.md` / `ipc-documentation.md` / `component-documentation.md`

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書にタスク完了記録を追加（`ui-ux-*.md` 等）
- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `task-specification-creator/LOGS.md` 更新（**2ファイル両方**）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル（該当する場合）

- [ ] `api-endpoints.md` 等の実装ステータス更新

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "TASK_ID" references/` で関連仕様書を検索して更新

#### Step 1-D: topic-map.md 再生成

- [ ] `node generate-index.js` を実行して topic-map.md を再生成

#### Step 2: システム仕様更新（該当する場合）

- [ ] 新規インターフェース・アーキテクチャ変更がある場合のみ

#### Step 3: IPC 契約検証（IPC修正タスクの場合のみ）

- [ ] `ipc-contract-checklist.md` Phase 1-6 を実施
- [ ] ハンドラ引数形式と Preload 側の呼び出し形式が一致
- [ ] 引数名のセマンティクスが実際の値と一致（P45対策）
- [ ] P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）

### Task 3: documentation-changelog.md

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各 Step の完了結果を詳細に記録（漏れの可視化）
- DON'T: 全 Step 確認前に「完了」と記載しない

### Task 4: 未タスク検出

- [ ] `unassigned-task-report.md` 作成（**0件でも必須**）
- [ ] 検出した未タスクは3ステップ全完了:
  1. `unassigned-task/` に指示書作成
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] `unassigned-task-detection.md` の件数・ステータス更新
- [ ] `artifacts.json` の Phase 12 ステータスを更新

## 仕様書品質基準

### 自己完結性

- 依存関係（前 Phase の成果物パス）が明示されている
- 実行タスク名と目的が記載されている
- 成果物パスが明確
- 完了条件がチェックリスト形式

### 必須セクション順序

1. タイトル（h1）→ 2. メタ情報 → 3. 目的 → 4. 実行タスク → 5. 参照資料 → 6. 実行手順 → 7. 成果物 → 8. 完了条件 → 9. 次Phase

## 成果物パス命名規則

```
docs/30-workflows/{{FEATURE_NAME}}/phase-{{N}}-{{英語名}}.md
```

## 並列実行の推奨

- 独立した Phase 群は Task agent で並列バックグラウンド実行可能
- 例: Phase 1-3 / Phase 4-7 / Phase 8-10 / Phase 11 / Phase 12
