# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 3                                      |
| タスクID   | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001   |
| 機能名     | skill-wizard/q5-primary-tool-indicator |
| 前提Phase  | Phase 2                                |
| 後続Phase  | Phase 4（PASS または MINOR の場合）    |
| 作成日     | 2026-04-13                             |
| ステータス | completed                              |

## 目的

Phase 2 の設計内容を多角的にレビューし、Phase 4（テスト作成）への進行可否を判定する。
具体的には AC-1〜AC-6 との整合性・責務境界の適切さ・削除容易性・テスト設計のカバレッジを検証する。

## 実行タスク

- AC整合チェック: 設計が AC-1〜AC-6 を全て満たしているか
- 責務境界チェック: Q3/Q4 汎用 renderQuestion との共通化を崩していないか
- 削除容易性チェック: AC-4 対応方針（TODO コメント・変更箇所最小化）が十分か
- テストカバレッジチェック: 検証マトリクス（TC-1〜TC-7）が AC-1〜AC-6 を網羅しているか
- リスクチェック: isMainTool ロジック・aria-label・スタイルトークンに潜在リスクはないか
- MINOR追跡テーブル: 指摘事項があれば記録
- ゲート判定: PASS / MINOR / MAJOR を記録

## 参照資料

| 資料名             | パス                                                                                         | 用途                           |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 成果物     | `outputs/phase-1/requirements-definition.md`                                                 | 要件・AC-1〜AC-6 参照          |
| Phase 2 成果物     | `outputs/phase-2/design.md`                                                                  | 設計書参照                     |
| 対象コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | 既存 isQ5Required パターン確認 |
| テストファイル     | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 既存テスト構造の確認           |

## 実行手順

### 1. AC 整合チェック

| AC ID | 受け入れ基準                                                            | 設計対応                                                                              | 充足判定 |
| ----- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------- |
| AC-1  | Q5 で2つ以上選択時に先頭選択肢に「主ツール」バッジが表示される          | `isMainTool`（Q5・複数選択・先頭一致）で `<MainToolBadge />` 表示                     | PASS     |
| AC-2  | 1つのみ選択されている場合は「主ツール」バッジが表示されない             | `selectedOptions.length >= 2` の条件により単一選択時は `isMainTool = false`           | PASS     |
| AC-3  | `aria-label` に「主ツールとして使用される」情報が含まれる               | `MainToolBadge` に `aria-label="主ツールとして使用される"` を付与                     | PASS     |
| AC-4  | バッジ表示が不要になった場合の削除が容易な設計                          | TODO コメント・局所化されたインライン定義・削除対象箇所の明示                         | PASS     |
| AC-5  | Phase 11 と同等のスクリーンショット証跡で視覚的変更が確認される         | Phase 11（手動テスト）で before/after スクリーンショット取得（設計外・Phase 11 担当） | PASS     |
| AC-6  | `ConversationRoundStep.test.tsx` が Q5 複数選択時のバッジ表示を検証する | 検証マトリクス TC-1〜TC-7 が `ConversationRoundStep.test.tsx` に追加される            | PASS     |

### 2. 責務境界チェック

Q3/Q4 汎用 `renderQuestion` との共通化を崩さないよう注意すること（タスク指示書 §3.1 の教訓）。

```bash
# renderQuestion の現行実装を確認し、Q5 分岐追加後も構造が維持されるか確認
grep -n "key === .q5.\|isQ5Required\|key === .q3.\|key === .q4." \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
```

| チェック項目                                          | 判定基準                                                | 結果 |
| ----------------------------------------------------- | ------------------------------------------------------- | ---- |
| Q3/Q4 のボタンレンダリングが変更されないか            | `key === "q5"` 分岐のみ追加・Q3/Q4 の出力に影響なし     | PASS |
| isQ5Required と同様のパターンで Q5 分岐が追加されるか | `isQ5Required` 先例と同一パターン（インライン条件分岐） | PASS |
| QUESTIONS 型定義の変更がないか                        | 案A（Q5キー分岐）採用により QUESTIONS 型は変更不要      | PASS |
| renderQuestion 関数のシグネチャが変更されないか       | 追加変数は renderQuestion スコープ内に閉じ込める        | PASS |

### 3. 削除容易性チェック（AC-4）

`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 完了後の削除が容易であるかを評価する。

| チェック項目                                        | 判定基準                                                                                              | 結果 |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---- |
| TODO コメントに削除予定タスク ID が明記されているか | `// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` コメントあり                                      | PASS |
| 削除対象箇所が最小限（4箇所以内）に収まるか         | tsx 内3箇所（isMainTool・aria-label・バッジ呼び出し・コンポーネント定義）+ test 内1 describe ブロック | PASS |
| 外部 state・context・props への影響がゼロか         | `isMainTool` は renderQuestion スコープ内のローカル変数のみ                                           | PASS |
| バッジ削除後に型エラーが発生しないか                | インライン定義のため削除後に未使用型・エクスポートが残らない                                          | PASS |

### 4. テスト設計カバレッジチェック

| テストケース | 検証内容                                                               | 対応 AC | カバレッジ充足 |
| ------------ | ---------------------------------------------------------------------- | ------- | -------------- |
| TC-1         | 2ツール選択時に先頭ツールにバッジあり                                  | AC-1    | PASS           |
| TC-2         | 2ツール選択時に2番目ツールにバッジなし                                 | AC-1    | PASS           |
| TC-3         | 1ツールのみ選択時にバッジ非表示                                        | AC-2    | PASS           |
| TC-4         | Q5 未選択時にバッジ非表示                                              | AC-2    | PASS           |
| TC-5         | 先頭ツールの `MainToolBadge` aria-label に「主ツールとして使用される」 | AC-3    | PASS           |
| TC-6         | Q5 以外の設問（例: Q3）でバッジ非表示                                  | AC-1    | PASS           |
| TC-7         | 3ツール選択時に先頭のみバッジあり                                      | AC-1    | PASS           |
| （AC-4）     | 設計レビューで評価（テスト不要）                                       | AC-4    | 設計で担保     |
| （AC-5）     | Phase 11 手動テストで評価                                              | AC-5    | Phase 11 担当  |
| （AC-6）     | TC-1〜TC-7 の存在自体が AC-6 を充足                                    | AC-6    | PASS           |

未カバー領域の確認:

```bash
# 既存テストファイルの Q5 関連テストケースを確認
grep -n "q5\|Q5\|主ツール\|primaryTool" \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

### 5. リスクチェック

| リスク                                                     | 評価                                                                                                                     | 対応         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------ |
| `selectedOptions[0] === opt` が参照透過でない場合の挙動    | `selectedOptions` は `answer.selectedOptions ?? []` で初期化済み。`opt` は `q.options` の string。比較は安全             | 問題なし     |
| `--status-warning` CSS トークンが未定義の環境での表示崩れ  | 既存トークン使用状況を確認し、未定義時のフォールバックを検討                                                             | 実装時に確認 |
| `aria-label` が `undefined` の場合のスクリーンリーダー挙動 | `undefined` の場合はボタンテキストが読み上げられる（WAI-ARIA 準拠）                                                      | 問題なし     |
| Q5 選択順序変更時（選択解除→再選択）の先頭変化             | `selectedOptions` 配列の先頭が動的に変わるため、バッジも追従する                                                         | 意図した仕様 |
| 既存の Q5 テストケースとの競合                             | 既存テストは `selectedOptions` の結果を検証しており、バッジ追加は影響なし。ただし既存テストの DOM 構造が変わるため要確認 | 実装時に確認 |

### 6. 命名・スタイル規則チェック

```bash
# 既存コンポーネントの命名パターン確認（PascalCase）
grep -n "const [A-Z][a-zA-Z]* = " \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx | head -10

# 既存 CSS トークン使用パターンの確認
grep -n "var(--status-" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx | head -10
```

| 確認項目               | 期待パターン                | 結果 |
| ---------------------- | --------------------------- | ---- |
| バッジコンポーネント名 | PascalCase（MainToolBadge） | PASS |
| isMainTool 変数名      | camelCase                   | PASS |
| CSS トークン記法       | `var(--token-name)` 形式    | PASS |
| TODO コメント形式      | `// TODO(TASK-ID): 説明`    | PASS |

### 7. レビュー判定

**総合判定**: PASS / MINOR / MAJOR（実行時に記録）

| 判定  | 戻り先         | 判定基準                                                        |
| ----- | -------------- | --------------------------------------------------------------- |
| PASS  | Phase 4        | 全チェック項目でリスクなし・AC整合・責務境界・削除容易性が充足  |
| MINOR | Phase 4        | 小さな指摘事項（実装時に並行解消可能）                          |
| MAJOR | Phase 2 に戻る | 設計の根本的な問題（AC 未充足・責務境界の破壊・削除困難な構造） |

**MAJOR となる条件（いずれかに該当する場合）**:

- Q3/Q4 のボタンレンダリングに影響が及ぶ設計変更がある
- AC-1〜AC-3 のいずれかを設計が満たしていない
- `isMainTool` のロジックが `selectedOptions` の状態と矛盾する
- バッジ削除時に QUESTIONS 型定義・外部 state・context の変更が必要

**MINOR となる条件（Phase 4 で並行解消可能）**:

- `--status-warning` トークンの代替色の検討が必要
- aria-label の文言調整が必要
- 既存 Q5 テストの DOM 構造変更による微修正が必要

### 8. MINOR 追跡テーブル

| MINOR ID         | 指摘内容 | 解決予定 Phase | 解決確認 Phase | 備考 |
| ---------------- | -------- | -------------- | -------------- | ---- |
| （実行時に記録） | -        | -              | -              | -    |

## 統合テスト連携【必須】

| 判定項目   | 基準    | 結果 |
| ---------- | ------- | ---- |
| 型チェック | PASS    | PASS |
| lint       | 0 error | PASS |

## 成果物

| 成果物           | パス                               | 説明                            |
| ---------------- | ---------------------------------- | ------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/gate-decision.md` | PASS/MINOR/MAJOR 判定・指摘事項 |

## 完了条件

- [ ] AC-1〜AC-6 の設計対応を全件確認済み
- [ ] 責務境界チェック（Q3/Q4 への影響なし）を確認済み
- [ ] 削除容易性チェック（AC-4 対応方針）を確認済み
- [ ] テスト設計カバレッジチェック（TC-1〜TC-7 と AC の対応）を確認済み
- [ ] リスクチェック（5項目）を確認済み
- [ ] 命名・スタイル規則チェックを確認済み
- [ ] 総合判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR 判定の指摘事項があれば追跡テーブルに記録済み
- [ ] Phase 4 開始条件（PASS または MINOR）が充足されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. AC 整合チェック（AC-1〜AC-6）
2. 責務境界チェック（Q3/Q4 への影響確認）
3. 削除容易性チェック（AC-4）
4. テスト設計カバレッジチェック（TC-1〜TC-7）
5. リスクチェック（5項目）
6. 命名・スタイル規則チェック
7. 総合判定記録
8. MINOR 追跡テーブル記録
9. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 4: テスト作成（PASS または MINOR の場合）
Phase 2: 設計（MAJOR の場合）
