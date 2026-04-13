# スキルウィザード generationModeラジオボタン廃止・LLM専用化・Step 1スキップ修正 - タスク指示書

## メタ情報

```yaml
issue_number: 2130
task_id: TASK-SW-FIX-MODE-MGMT-001
status: open
priority: high
scale: medium
task_type: BUGFIX
```

| 項目           | 内容                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| タスクID       | TASK-SW-FIX-MODE-MGMT-001                                                      |
| タスク名       | スキルウィザード generationModeラジオボタン廃止・LLM専用化・Step 1スキップ修正 |
| 分類           | バグ修正（モード管理整理・フロー正規化）                                       |
| 対象機能       | SkillCreateWizard / SkillInfoStep / generationMode state / Step遷移フロー      |
| 優先度         | 高（`priority:high`）                                                          |
| 見積もり規模   | 中規模（`scale:medium`）                                                       |
| ステータス     | 未実施（`status:open`）                                                        |
| 依存タスク     | TASK-SW-FIX-DATAFLOW-001（Wave A・完了済み）                                   |
| 実行タイミング | Wave B（TASK-SW-FIX-DATAFLOW-001完了後に並列実行可能）                         |
| 発見日         | 2026-04-12                                                                     |
| タスク分類     | BUGFIX タスク（モード管理廃止・フロー正規化）                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

スキル作成ウィザードは本来 LLM 専用モードのみを想定した設計だが、実装上は以下の 3 つの問題が混在している。これらは UI の不整合・状態管理の複雑化・データ欠損を引き起こしており、一括修正が必要な状態にある。

### 1.2 問題点・課題

1. **問題1 - 仕様外ラジオボタンの表示**: `generationMode` state の初期値が `"template"` になっているため、Step 0 に「テンプレートから作成」「LLMで生成」のラジオボタンが表示される。仕様では LLM 専用のはずが UI に不要なモード選択肢が現れている。
2. **問題9 - 2系統フラグの混在**: `generationMode`（`"template" | "llm"`）と `hasActivatedLlmMode`（`boolean`）という2系統のフラグが並存しており、状態遷移ロジックが複雑化しバグの温床になっている。
3. **問題10 - Step 1スキップ**: LLMモード選択時に `handleLlmGenerate` が `goToStep(2)` を直接呼び出すため、Step 1（Q1〜Q6 インタビュー）を完全にスキップして Step 2 へ直接遷移する。この結果、LLM 生成に必要な会話コンテキストが欠損する。

### 1.3 放置した場合の影響

- LLM 生成に必要な Q1〜Q6 の回答が収集されず、生成品質が低下し続ける
- `generationMode` / `hasActivatedLlmMode` の2系統フラグが今後の機能追加時に混乱を招く
- Step 0 に仕様外の UI（ラジオボタン）が存在し続け、UX の一貫性が損なわれる
- Wave C タスク（TASK-SW-FIX-STATE-DETAIL-001 / TASK-SW-FIX-UI-001）の着手条件が満たされない

---

## 2. 何を達成するか（What）

### 2.1 目的

`generationMode` / `hasActivatedLlmMode` state を廃止してウィザードを LLM 専用に一本化し、Step 0→Step 1→Step 2→Step 3 の正規フローを確立する。

### 2.2 最終ゴール

- ラジオボタン（「テンプレートから作成」「LLMで生成」）が Step 0 から完全に削除されている
- `generationMode` state・`hasActivatedLlmMode` state が廃止されている
- Step 0 の「次へ」が常に Step 1（ConversationRoundStep）へ遷移する
- Q1〜Q6 インタビューが LLM モードでもスキップされない

### 2.3 スコープ

**含むもの**:

- `generationMode` / `hasActivatedLlmMode` state の完全削除
- ラジオボタン UI（`SkillInfoStep.tsx`）の削除
- `SkillInfoStep` props から `generationMode` / `onGenerationModeChange` の除去
- `handleLlmGenerate` 内の `goToStep(2)` 直接呼び出しの除去（Step 1 正規遷移への修正）
- `template` 関連の全条件分岐の除去
- 関連テストの更新（templateモード参照テストの削除・LLM専用フローテストへの置き換え）

**含まないもの**:

- Wave C タスク（TASK-SW-FIX-STATE-DETAIL-001 / TASK-SW-FIX-UI-001）の対応
- ConversationRoundStep（Step 1）自体の機能変更
- GenerateStep（Step 2）の内部実装変更
- 新規 LLM 機能の追加

### 2.4 成果物

- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（state削除・handleStep0Next修正）
- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`（ラジオボタンUI削除・props整理）
- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`（テスト更新）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SW-FIX-DATAFLOW-001（Wave A）が完了済みであること
- `SkillCreateWizard.tsx` の現行実装を把握していること
- `SkillInfoStep.tsx` のラジオボタン UI 箇所を特定済みであること

### 3.2 依存タスク

| タスクID                 | 状態   | 説明                                            |
| ------------------------ | ------ | ----------------------------------------------- |
| TASK-SW-FIX-DATAFLOW-001 | 完了済 | Wave A タスク。データフロー修正が本タスクの前提 |

### 3.3 必要な知識

- React の `useState` フック・状態管理パターン
- `SkillCreateWizard.tsx` の step 管理ロジック（`currentStep`・`goToStep`）
- `SkillInfoStep.tsx` のラジオボタン実装・props 定義
- Vitest / React Testing Library を用いたコンポーネントテスト

### 3.4 修正後のフロー概要

```
修正前:
Step 0 → [ラジオ選択]
           ├─ template → Step 2（生成）
           └─ llm → handleLlmGenerate → goToStep(2) → Step 2（Step 1スキップ）

修正後:
Step 0 → Step 1（Q1〜Q6インタビュー） → Step 2（LLM生成） → Step 3（完了）
```

---

## 4. 実行手順

### Phase 1: 要件定義

- `generationMode` / `hasActivatedLlmMode` の全参照箇所を洗い出す
- `template` 条件分岐の全ファイル・全箇所をリストアップする
- `handleLlmGenerate` 内の `goToStep(2)` 呼び出し箇所を特定する
- 削除後の受け入れ基準（AC-1〜AC-5）を矛盾なく固定する
- 成果物: 要件定義書・受け入れ基準・スコープ定義

### Phase 2: 設計

- フロー変更前後の比較（修正前のスキップパス vs 修正後の正規パス）を図示する
- 廃止する state 一覧・ハンドラ修正設計・レンダリング設計を確定する
- 修正後のstate管理（維持するstateの一覧）を記述する
- `handleStep0Next`・`handleGenerate` の擬似コードを定義する
- 成果物: アーキテクチャ設計・フロー比較図・テスト戦略

### Phase 3: 設計レビュー

- Phase 2 の設計に矛盾・漏れがないかチェックする
- AC-1〜AC-5 と設計が整合しているか確認する
- TASK-SW-FIX-DATAFLOW-001 の完了状態との整合を確認する
- ゲート判定（PASS/FAIL）を記録する
- 成果物: 設計レビュー結果・ゲート判定

### Phase 4: テスト作成（TDD - Red フェーズ）

Red テストとして以下の TC を定義する。

| TC-ID | シナリオ                                        | 期待結果                                              |
| ----- | ----------------------------------------------- | ----------------------------------------------------- |
| TC-01 | Step 0 にラジオボタンが表示されない             | `queryByText("テンプレートから作成")` が `null`       |
| TC-02 | `generation-mode-selector` テストIDが存在しない | `queryByTestId("generation-mode-selector")` が `null` |
| TC-03 | Step 0 の次へで Step 1 に遷移する               | `conversation-round-step` が表示される                |
| TC-04 | Step 1 をスキップして Step 2 へ直接遷移できない | Step 2 は表示されず Step 1 が維持される               |
| TC-05 | 正規フロー Step 0→1→2→3 を順番に通過する        | 全ステップを順に通過する                              |
| TC-06 | 旧 template 系テスト残骸が 0 件になっている     | `generationMode`/`hasActivatedLlmMode` 参照が 0 件    |

- 成果物: テスト仕様書・テストケース定義

### Phase 5: 実装

1. `SkillCreateWizard.tsx` から `generationMode` / `hasActivatedLlmMode` state を削除する
2. `handleStep0Next` を `goToStep(1)` のみに修正する（templateモード分岐を除去）
3. `handleLlmGenerate` 内の `goToStep(2)` 直接呼び出しを除去し Step 1 遷移に変更する
4. `SkillInfoStep.tsx` からラジオボタン JSX を削除する
5. `SkillInfoStep` の props インターフェースから `generationMode` / `onGenerationModeChange` を除去する
6. レンダリング部の `<SkillInfoStep>` へ渡している `generationMode` 関連 props を削除する
7. 不要なインポート（`GenerationMode` 型等）を除去する

- 成果物: 実装サマリー・変更ファイル一覧・契約差分

### Phase 6: テスト拡充

- エッジケース（step 遷移の境界値・フォーム入力なし・生成失敗）のテストを追加する
- 回帰テスト（既存テストが全件 PASS することを確認）を実行する
- 成果物: 拡充テストケース定義・回帰テスト結果

### Phase 7: カバレッジ確認

- `pnpm --filter @repo/desktop test -- --coverage` を実行する
- `SkillCreateWizard.tsx` のカバレッジ 80%以上を確認する
- 未到達行を分析し必要に応じてテストを追加する
- 成果物: カバレッジレポート・未到達分析

### Phase 8: リファクタリング

- 不要になったコード・コメント・import を整理する
- 命名の一貫性（step 変数・ハンドラ名）を確認する
- コード品質改善（可読性向上）を実施する
- 成果物: リファクタリングサマリー

### Phase 9: 品質保証

- `pnpm lint` / `pnpm typecheck` を実行し 0 エラーを確認する
- 静的解析で `generationMode` / `hasActivatedLlmMode` の残骸が 0 件であることを検証する
- リスク評価を実施する
- 成果物: 品質保証レポート・静的解析結果

### Phase 10: 最終レビュー

- Phase 1〜9 の成果物を統合してレビューする
- AC-1〜AC-5 が全て満たされているかを確認する
- 矛盾なし・漏れなし・整合あり・依存整合の 4 条件を確認する
- 成果物: 最終レビュー結果

### Phase 11: 手動テスト

- ブラウザ／Electron 実機でラジオボタンが削除されていることを視覚確認する
- Step 0→Step 1 の正規遷移を実機で確認する
- Step 1（Q1〜Q6）がスキップされないことを実機で確認する
- 成果物: 手動テスト結果（スクリーンショット含む）

### Phase 12: ドキュメント

- 実装ガイド（変更内容と修正理由の説明）を作成する
- システム仕様更新サマリーを作成する
- 未タスク検出（フォローアップタスクの洗い出し）を実施する
- 成果物: 実装ガイド・仕様更新サマリー・更新履歴・未タスク検出レポート

### Phase 13: PR 作成

- 差分サマリーとレビュー観点を整理する
- ユーザーの明示承認後のみ `gh pr create` で PR を作成する
- Wave C タスクへの引き継ぎサマリーを作成する
- 成果物: PR 準備メモ・引き継ぎサマリー・承認チェック

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Step 0 からラジオボタン（「テンプレートから作成」「LLMで生成」）が削除されている（AC-1）
- [ ] `generationMode` state が `SkillCreateWizard.tsx` から完全に削除されている（AC-2）
- [ ] `hasActivatedLlmMode` state が `SkillCreateWizard.tsx` から完全に削除されている（AC-2）
- [ ] Step 0 の「次へ」が常に Step 1（ConversationRoundStep）へ遷移する（AC-3）
- [ ] Step 1（Q1〜Q6）が LLM モードでもスキップされない（AC-4）
- [ ] 既存テンプレートモードのテストが全件 PASS または LLM 専用化に伴い適切に更新されている（AC-5）

### 品質要件

- [ ] `pnpm lint` が 0 エラーで通過する
- [ ] `pnpm typecheck` が 0 エラーで通過する
- [ ] テストカバレッジが `SkillCreateWizard.tsx` で 80%以上
- [ ] `generationMode` / `hasActivatedLlmMode` の残骸が全ファイルで 0 件（静的解析で確認）
- [ ] `template` 条件分岐の残骸が全ファイルで 0 件（静的解析で確認）

### ドキュメント要件

- [ ] 変更内容・修正理由を記載した実装ガイドが作成されている
- [ ] `docs/30-workflows/skill-wizard-bugfix-wave/WB-par-02a-fix-mode-mgmt/` の Phase 成果物が全件作成されている
- [ ] Wave C タスクへの引き継ぎサマリーが作成されている

---

## 6. 検証方法

### テストケース

| TC-ID | 入力・操作                                                 | 期待結果                                              | 備考                   |
| ----- | ---------------------------------------------------------- | ----------------------------------------------------- | ---------------------- |
| TC-01 | `render(<SkillCreateWizard />)` → ラジオボタンテキスト検索 | `queryByText("テンプレートから作成")` が `null`       | ラジオボタン削除確認   |
| TC-02 | `render(<SkillCreateWizard />)` → テストID検索             | `queryByTestId("generation-mode-selector")` が `null` | state廃止確認          |
| TC-03 | Step 0 の「次へ」ボタンクリック                            | Step 1（`conversation-round-step`）が表示される       | Step 0→1 正規遷移確認  |
| TC-04 | Step 0 の「次へ」クリック後に Step 2 存在確認              | Step 2（`generate-step`）は表示されない               | Step 1スキップ禁止確認 |
| TC-05 | Step 0 次へ → Step 1 生成ボタン → 生成待機                 | Step 0→1→2→3 の順番で遷移する                         | 正規フロー通過確認     |
| TC-06 | `rg -n "generationMode\|hasActivatedLlmMode" src/` 実行    | 参照残骸が 0 件                                       | 旧フラグ残骸なし確認   |

---

## 7. リスクと対策

| リスク                                                             | 影響度 | 発生確率 | 対策                                                                               |
| ------------------------------------------------------------------ | ------ | -------- | ---------------------------------------------------------------------------------- |
| `generationMode` 参照が想定外のファイルに散在している              | 高     | 中       | Phase 1 で `grep -r "generationMode" apps/desktop/src/` を実行し全件洗い出しを行う |
| `template` 条件分岐の削除により既存テストが大量に失敗する          | 高     | 高       | Phase 4 で TDD（Red）を先に固定し、Phase 5 実装後に Green への移行を確認する       |
| `handleStep0Next` 修正が step 管理の別ロジックと競合する           | 中     | 中       | Phase 2 で step 管理ロジック全体を設計図で可視化し、競合箇所を事前特定する         |
| Wave A（TASK-SW-FIX-DATAFLOW-001）の変更と本タスクの変更が衝突する | 中     | 低       | Phase 1 で依存タスクの完了状態を確認し、変更済みファイルとの整合を確認する         |
| `SkillInfoStep` の props 削除が他コンポーネントから参照されている  | 中     | 低       | Phase 1 で `SkillInfoStep` の全利用箇所を確認し、削除影響範囲を事前特定する        |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント         | パス                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| 詳細仕様書（index）  | `docs/30-workflows/skill-wizard-bugfix-wave/WB-par-02a-fix-mode-mgmt/index.md`                  |
| Phase 1 要件定義     | `docs/30-workflows/skill-wizard-bugfix-wave/WB-par-02a-fix-mode-mgmt/phase-1-requirements.md`   |
| Phase 2 設計         | `docs/30-workflows/skill-wizard-bugfix-wave/WB-par-02a-fix-mode-mgmt/phase-2-design.md`         |
| Phase 4 テスト作成   | `docs/30-workflows/skill-wizard-bugfix-wave/WB-par-02a-fix-mode-mgmt/phase-4-test-creation.md`  |
| Phase 5 実装         | `docs/30-workflows/skill-wizard-bugfix-wave/WB-par-02a-fix-mode-mgmt/phase-5-implementation.md` |
| Phase 13 PR作成      | `docs/30-workflows/skill-wizard-bugfix-wave/WB-par-02a-fix-mode-mgmt/phase-13-pr-creation.md`   |
| ウェーブindex        | `docs/30-workflows/skill-wizard-bugfix-wave/index.md`                                           |
| 依存タスク（Wave A） | `docs/30-workflows/skill-wizard-bugfix-wave/WA-seq-01-fix-dataflow/index.md`                    |

### 関連ソースファイル

| ファイル                                                                          | 役割                      |
| --------------------------------------------------------------------------------- | ------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                | ウィザード本体・state管理 |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`             | Step 0 コンポーネント     |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`     | Step 1 コンポーネント     |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` | ウィザードテスト          |

---

## 9. 備考

### 苦戦箇所

| 項目     | 内容                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| 症状     | `generationMode` / `hasActivatedLlmMode` の参照箇所がコンポーネント間に散在しており、削除漏れが発生しやすい         |
| 原因     | `generationMode` 初期値 `"template"` が意図せずラジオボタンUIを有効化し、LLM 専用という仕様設計と実装が乖離していた |
| 対応予定 | Phase 1 の影響範囲分析で全参照箇所を網羅的にリストアップし、Phase 5 で一括削除する                                  |
| 再発防止 | Phase 9 の静的解析で `generationMode` / `hasActivatedLlmMode` 残骸を 0 件確認する仕組みを組み込む                   |

| 項目     | 内容                                                                                                             |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| 症状     | `template` モード関連の条件分岐が多数のコンポーネントに散在しており、LLM 専用化後も削除漏れが起きやすい          |
| 原因     | 初期実装時にテンプレートモードとLLMモードの分岐が至る所に埋め込まれた                                            |
| 対応予定 | Phase 4 の TDD（Red フェーズ）で template 関連テスト残骸の 0 件確認を必須テストケース（TC-06）として先に定義する |
| 再発防止 | Phase 8 リファクタリングで残存するコメントや dead code を除去し、コードレビューで確認する                        |

| 項目     | 内容                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| 症状     | Step 0→Step 1 遷移の修正時に `handleStep0Next` の修正が既存 step 管理ロジックと競合するリスクがある           |
| 原因     | `goToStep` の呼び出しタイミングや条件分岐が `handleLlmGenerate` とのカップリングで複雑化していた              |
| 対応予定 | Phase 2 の設計フェーズで step 管理ロジック全体の依存図を作成し、修正箇所を明確化してから Phase 5 の実装に入る |
| 再発防止 | Phase 3 の設計レビューでゲート判定（PASS 確認）を経てから TDD に移行する                                      |

### 発見経緯

スキルウィザードのバグ修正ウェーブ（Wave B）のタスク整理において、問題1・問題9・問題10 が互いに関連するモード管理の問題群として特定された。Wave A（TASK-SW-FIX-DATAFLOW-001）のデータフロー修正が完了した後、Wave B として本タスクを並列実行可能なタイミングで着手する。

修正規模が中程度（ファイル数：3、テスト更新を含む）であるため、TDD（Red→Green）の手順を厳守し、Phase 4 の Red テスト定義から Phase 5 の実装へ進むことを強く推奨する。
