# TASK-SC-IMPROVE-PROMPT-IMPL-001: runImprovePromptWorkflow 実処理実装

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | TASK-SC-IMPROVE-PROMPT-IMPL-001                                   |
| issue_number | 2319                                                              |
| タスク名     | SkillCreatorService runImprovePromptWorkflow 実処理実装           |
| 分類         | 改善                                                              |
| 対象機能     | SkillCreatorService.ts / runImprovePromptWorkflow                 |
| 優先度       | 中                                                                |
| 見積もり規模 | 中規模                                                            |
| ステータス   | 未着手                                                            |
| 発見元       | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE Phase 12 未タスク検出 |
| 発見日       | 2026-04-19                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE` タスクで `improve-prompt` モードの dispatch 修正は完了した。
しかし `runImprovePromptWorkflow()` の実処理は `logger.warn` を出力するだけのスタブ実装のままで、
スキルの prompt 改善処理が実際には機能しない状態にある。

`improve-prompt` モードは SKILL.md のプロンプト品質を LLM で分析・改善することを目的としており、
`update` モードより軽量（全体更新ではなく prompt セクションのみ改善）な処理が求められる。

### 1.2 問題点・課題

- `runImprovePromptWorkflow()` は `ensureExistingSkillFiles()` でスキルの存在確認後、`logger.warn` を呼ぶだけで返る
- プロンプト改善提案の生成・適用・失敗時の UX が未整備
- `improveSkill()` メソッド（`improve_skill.js` 経由）との関係が不明確
- LLM を使った改善提案と手動適用の選択肢が設計されていない

### 1.3 放置した場合の影響

- `improve-prompt` モードが UI から選択可能な状態でありながら、実際には何も起きない（サイレント失敗）
- ユーザーがプロンプト改善を期待してリクエストしても、現行スキルが更新されない
- `improveSkill()` と `runImprovePromptWorkflow()` の二重管理が整理されない

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillCreatorService.runImprovePromptWorkflow()` に既存スキルの prompt 改善処理を実装する。
`improve-prompt` モードで呼ばれたとき、既存の SKILL.md を読み込んで LLM でプロンプト品質を
分析し、改善提案を生成・適用する一連のフローを完成させる。

### 2.2 最終ゴール

- `improve-prompt` モード実行時に SKILL.md のプロンプト関連フィールドが実際に改善される
- LLM クライアントが利用可能な場合は改善提案を LLM で生成して反映する
- LLM クライアント未設定時はフォールバックとして `improveSkill()` スクリプト経由処理を試みる
- 改善適用前後の差分をログまたはコールバックで通知できる
- キャンセル（AbortSignal）に対して安全に中断できる
- 型チェック PASS・既存テスト全件 PASS

### 2.3 スコープ

#### 含むもの

- `runImprovePromptWorkflow()` の実処理実装（prompt 改善フロー）
- LLM クライアントを使った改善提案生成（LLM 利用可能時）
- `improveSkill()` スクリプト経由のフォールバック（LLM 未設定時）
- キャンセル対応（各ステップで `throwIfAborted` チェック）
- improve-prompt モードの結合テスト追加

#### 含まないもの

- agents/ ディレクトリ内ファイルの更新
- UI 側の improve-prompt モード入力フォームの変更
- `update` モードの実処理（TASK-SC-UPDATE-SKILL-IMPL-001 で対応）
- `improve_skill.js` スクリプト自体の機能拡張

### 2.4 成果物

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（`runImprovePromptWorkflow` 実装完了）
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`（improve-prompt 実処理テスト追加）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE` が完了していること（dispatch 修正・スキル存在確認実装済み）
- `TASK-SC-LLM-PURPOSE-WIRE-001` が完了していること（`extractPurposeWithLlm` 実装済み）
- `improveSkill()` メソッドの動作確認が完了していること

### 3.2 依存タスク

| タスクID                                    | 依存理由                                                |
| ------------------------------------------- | ------------------------------------------------------- |
| UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE | dispatch 修正・`ensureExistingSkillFiles` 実装済み      |
| TASK-SC-LLM-PURPOSE-WIRE-001                | `extractPurposeWithLlm` パターンを参照する              |
| TASK-SC-UPDATE-SKILL-IMPL-001               | update フロー設計を参照して improve-prompt と差別化する |

### 3.3 必要な知識

- `SkillCreatorService.ts` の `improveSkill()` / `runCreateWorkflow` 実装パターン
- `improve_skill.js` スクリプトの呼び出し規約と出力フォーマット
- `ensureExistingSkillFiles()` が確認するファイル構造（skillDir, SKILL.md）
- SKILL.md の prompt セクション（`## Trigger`, `## 概要` 等）の構造
- Vitest の `vi.spyOn` によるプライベートメソッドのモックパターン

### 3.4 推奨アプローチ

1. `improveSkill()` の `improve_skill.js` 実装を確認し、`runImprovePromptWorkflow` で再利用できるか判定する
2. LLM が利用可能な場合は、現在の SKILL.md 本文を LLM に渡してプロンプト改善案を生成する
3. 改善案を SKILL.md の該当セクション（Trigger キーワード・概要・目的）に差分適用する
4. フォールバック: LLM 未設定時は `improveSkill()` の `autoApply: false` で提案のみ取得し、ログ出力する
5. キャンセル安全性: 各ネットワーク呼び出し前に `throwIfAborted(signal)` を挿入する

---

## 4. 実行手順

### Phase 構成

Phase 1〜13（標準構成）で対応する。中規模タスクのため Phase 5〜6 が主体。

### Phase 1: 要件定義

#### 目的

improve-prompt モードの期待動作を詳細化し、`update` モードとの差別化を明確にする。

#### 手順

1. `improveSkill()` の実装と `improve_skill.js` スクリプトの動作を精読する
2. improve-prompt モードで更新すべき SKILL.md のセクションを特定する（Trigger, 概要 etc.）
3. LLM プロンプト改善エージェント（`extract-purpose` 以外に専用エージェントが必要か）を調査する
4. P50 チェック: `improveSkill()` の再利用範囲を確定し、新規実装範囲を最小化する

#### 成果物

- improve-prompt モード期待動作一覧（要件定義書）

#### 完了条件

- improve-prompt モードの入力・処理・出力が明確に定義されている
- `update` モードとの責務の違いが文書化されている

---

### Phase 2: 設計

#### 目的

`runImprovePromptWorkflow` の処理フローとインターフェースを設計する。

#### 手順

1. 処理フローを設計する（SKILL.md 読み込み → LLM 改善提案生成 → 差分適用）
2. `improveSkill()` スクリプト経由フォールバックの位置づけを決定する
3. AbortSignal チェックポイントを各ステップに明記する
4. 改善適用の success/failure/cancel 3 経路の状態遷移テーブルを作成する
5. SKILL.md プロンプトセクションの差分更新戦略（正規表現 vs パーサー）を選定する

#### 成果物

- 設計書（フロー図・SKILL.md 差分更新戦略・状態遷移テーブル）

#### 完了条件

- 処理フローが確定し、LLM あり/なしの分岐が明確になっている

---

### Phase 3: 設計レビュー

#### 目的

Phase 4 に進める品質かを判定する。

#### 手順

1. SKILL.md の差分更新が既存フォーマットを破壊しないか検証する
2. フォールバック処理（`improveSkill()` 経由）が `runImprovePromptWorkflow` の責務と整合するか確認する

#### 完了条件

- PASS または MINOR 指摘のみで Phase 4 進行

---

### Phase 4: テスト作成

#### 目的

TDD Red フェーズとして、improve-prompt 実処理の失敗するテストケースを作成する。

#### 手順

1. `runImprovePromptWorkflow` が SKILL.md を実際に更新するテストを追加する
2. LLM ありケース: 改善提案が生成され SKILL.md のプロンプトセクションに反映される
3. LLM なしケース: `improveSkill()` フォールバックが動作する
4. AbortSignal 中断テストを追加する
5. `create` モードへの回帰テスト（`runImprovePromptWorkflow` が呼ばれないこと）を確認する

#### 成果物

- `SkillCreatorService.test.ts`（improve-prompt 実処理テスト追加・失敗状態）

#### 完了条件

- テストが失敗（RED）している状態で Phase 5 に進む

---

### Phase 5: 実装

#### 目的

`runImprovePromptWorkflow` の実処理を実装し、テストを GREEN にする。

#### 手順

1. 既存 SKILL.md の読み込み処理を実装する
2. LLM クライアントがある場合は改善提案を生成する
3. SKILL.md のプロンプトセクションに差分を適用して書き戻す
4. 各ステップで `throwIfAborted(signal)` を呼ぶ
5. フォールバック: LLM 未設定時は `improveSkill(skillName, false)` を呼んで提案をログ出力する

#### 成果物

- `SkillCreatorService.ts`（`runImprovePromptWorkflow` 実実装完了）

#### 完了条件

- Phase 4 のテストが GREEN になっている
- TypeScript 型チェック PASS

---

### Phase 6: テスト拡充

#### 目的

fail path・回帰ガードを追加する。

#### 手順

1. SKILL.md 書き込み失敗時のエラーハンドリングテストを追加する
2. `improve_skill.js` が存在しない場合のフォールバック動作テストを追加する
3. progress emit の順序（loading-skill → analyzing → improving → validating → done）を検証する

---

### Phase 7: カバレッジ確認

#### 目的

`runImprovePromptWorkflow` の line/branch カバレッジを確認する。

```bash
pnpm --filter @repo/desktop test --coverage -- --reporter=verbose
```

#### 完了条件

- `runImprovePromptWorkflow` の line coverage 80% 以上

---

### Phase 8: リファクタリング

#### 目的

`update` と `improve-prompt` の共通処理を抽出する。

#### 手順

1. SKILL.md 読み込み・書き込みの共通ヘルパーを `runUpdateWorkflow` と共有できるか検討する
2. 重複コードを抽出し、`readSkillMd` / `writeSkillMd` などのプライベートメソッドに整理する

---

### Phase 9: 品質保証

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test
```

---

### Phase 10: 最終レビュー

#### 完了条件

- improve-prompt モードで既存 SKILL.md のプロンプトセクションが実際に改善される動作を確認
- TypeScript 型チェック PASS
- 全ユニットテスト PASS

---

### Phase 11: 手動テスト

NON_VISUAL タスクとして自動テスト結果を証跡とする。
代替証跡: `phase-10/final-review-result.md` と自動テスト実行結果。

---

### Phase 12: ドキュメント更新

#### 成果物

1. `outputs/phase-12/implementation-guide.md`（Part 1/2 構成）
2. `outputs/phase-12/system-spec-update-summary.md`
3. `outputs/phase-12/documentation-changelog.md`
4. `outputs/phase-12/unassigned-task-detection.md`（0 件でも出力必須）
5. `outputs/phase-12/skill-feedback-report.md`
6. `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

### Phase 13: PR 作成

ユーザーの明示的な承認後のみ実施する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `improve-prompt` モード実行時に SKILL.md のプロンプトセクションが実際に改善される
- [ ] LLM クライアント利用可能時は改善提案が LLM で生成される
- [ ] LLM クライアント未設定時は `improveSkill()` フォールバックが動作する
- [ ] AbortSignal 中断が各ステップで機能する

### 品質要件

- [ ] TypeScript 型チェック PASS
- [ ] 全ユニットテスト PASS
- [ ] improve-prompt 実処理テストケースが追加されている

### ドキュメント要件

- [ ] Phase 12 全 6 成果物が揃っている
- [ ] `update` モードとの責務の違いが implementation-guide に記載されている

---

## 6. 検証方法

### テストケース

| ケース                        | 入力                                    | 期待結果                                               |
| ----------------------------- | --------------------------------------- | ------------------------------------------------------ |
| improve-prompt + LLM あり     | `mode="improve-prompt"`, llmClient あり | SKILL.md プロンプトセクションが LLM 改善案で更新される |
| improve-prompt + LLM なし     | `mode="improve-prompt"`, llmClient なし | `improveSkill()` フォールバックが呼ばれる              |
| improve-prompt + AbortSignal  | 実行中にキャンセル                      | `AbortError` が throw される                           |
| improve-prompt + スキル不存在 | `mode="improve-prompt"`, スキルなし     | `ensureExistingSkillFiles` でエラーが throw される     |
| create モード回帰             | `mode="create"`                         | `runImprovePromptWorkflow` が呼ばれない                |

### 検証手順

```bash
pnpm --filter @repo/desktop test -- --testPathPattern=SkillCreatorService
pnpm --filter @repo/desktop typecheck
```

---

## 7. リスクと対策

| リスク                                              | 影響度 | 発生確率 | 対策                                                                             |
| --------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------- |
| SKILL.md プロンプトセクションのパース失敗           | 中     | 中       | 正規表現ではなくセクション境界（`##` 見出し）を使った安全なパースを実装する      |
| LLM 改善案が意図しない形式で返却される              | 中     | 中       | `normalizePurposeResponse` 相当のバリデーションを改善案にも適用する              |
| `improveSkill()` の `improve_skill.js` が存在しない | 低     | 中       | `isMissingScriptError()` でチェックし、graceful にスタブ動作にフォールバックする |
| update と improve-prompt の責務境界が曖昧になる     | 低     | 中       | Phase 2 設計書で責務境界テーブルを必ず作成し、実装前に確認する                   |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/` — 前タスクの実装詳細
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` — 対象ファイル（`improveSkill()` メソッドを参照）
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` — 参考テスト

### 参考資料

- Phase 12 未タスク検出レポート: `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/outputs/phase-12/unassigned-task-detection.md`

---

## 9. 備考

### 苦戦箇所【記入必須 / 事前記録】

| 項目     | 内容                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| 症状     | `improve-prompt` ケースが空のまま fall-through し、新規作成フローが誤動作する                                        |
| 原因     | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE で dispatch 修正に注力した結果、実処理実装が後回しになった               |
| 対応     | Phase 12 未タスク検出で正式に識別し、本タスクとして仕様化                                                            |
| 再発防止 | モード追加時は switch 全 case に最低限の TODO コメントを残し、スタブのみでマージする場合は必ず未タスクを同時登録する |

### improve-prompt と update の責務差異

| 項目             | improve-prompt                             | update                               |
| ---------------- | ------------------------------------------ | ------------------------------------ |
| 対象ファイル     | SKILL.md プロンプトセクションのみ          | SKILL.md 全体（メタ情報含む）        |
| 処理内容         | プロンプト品質の分析・改善提案の生成・適用 | description/purpose フィールドの更新 |
| LLM エージェント | 専用の prompt-improvement エージェント     | `extract-purpose` エージェント       |
| 重さ             | 軽量（セクション単位）                     | 中程度（ファイル全体）               |

### 補足事項

- `improveSkill()` との責務重複を Phase 1 で整理し、将来的には `improveSkill()` を廃止して `runImprovePromptWorkflow()` に一本化する方向性も検討する
- TASK-SC-UPDATE-SKILL-IMPL-001 と並行実装する場合、共通のヘルパーメソッド（SKILL.md 読み書き）を先に設計してから両タスクで実装する
