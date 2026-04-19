# TASK-SC-CREATOR-UPDATE-IMPL-001: SkillCreatorService runUpdateWorkflow 実処理実装

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | TASK-SC-CREATOR-UPDATE-IMPL-001                                   |
| issue_number | 2318                                                              |
| タスク名     | SkillCreatorService runUpdateWorkflow 実処理実装                  |
| 分類         | 改善                                                              |
| 対象機能     | SkillCreatorService.ts / runUpdateWorkflow                        |
| 優先度       | 中                                                                |
| 見積もり規模 | 中規模                                                            |
| ステータス   | 未着手                                                            |
| 発見元       | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE Phase 12 未タスク検出 |
| 発見日       | 2026-04-19                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE` タスクで `update` モードの dispatch 修正は完了した。
`SkillCreatorService.runUpdateWorkflow()` が `case "update":` から正しく呼ばれるようになったが、
メソッド本体は `logger.warn` を出力するだけのスタブ実装のままで、既存スキルの差分更新が実際には機能しない。

`TASK-SC-UPDATE-SKILL-IMPL-001`（Issue #2203）は `SkillService.updateSkill()` の永続化ロジックを扱うが、
本タスクはそれを呼び出す `SkillCreatorService.runUpdateWorkflow()` のワークフロー実装を担当する。

### 1.2 問題点・課題

- `runUpdateWorkflow()` は `ensureExistingSkillFiles()` でスキルの存在確認後、`logger.warn` を呼ぶだけで返る
- 既存スキルに対する差分更新処理（SKILL.md の書き換え、agents/ の更新）が実装されていない
- ユーザーが `update` モードでリクエストしても実際には何も更新されない（サイレント失敗）
- `extractPurposeWithLlm` / `generateSkillMd` などの既存コンポーネントとの接続が未実装

### 1.3 放置した場合の影響

- `update` モードが UI から選択可能な状態でありながら、実際には何も起きない
- ユーザーが意図した更新がスキルファイルに反映されず、混乱を招く
- `TASK-SC-IMPROVE-PROMPT-IMPL-001` の実装でも同様のパターンが必要になるため、先行して設計を確立すべき

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillCreatorService.runUpdateWorkflow()` に既存スキルの差分更新処理を実装する。
`update` モードで呼ばれたとき、既存スキルのファイル（主に SKILL.md）を読み込んで
更新内容を適用し、ファイルを書き戻す一連のフローを完成させる。

### 2.2 最終ゴール

- `update` モード実行時に既存スキルの SKILL.md が実際に更新される
- LLM クライアントが利用可能な場合は purpose/description を LLM で再生成して反映する
- LLM クライアント未設定時はフォールバックとして既存内容を保持しつつメタ情報のみ更新
- キャンセル（AbortSignal）に対して安全に中断できる
- 型チェック PASS・既存テスト全件 PASS

### 2.3 スコープ

#### 含むもの

- `runUpdateWorkflow()` の実処理実装（SKILL.md 差分更新フロー）
- LLM クライアントを使った purpose 再抽出（LLM 利用可能時）
- フォールバック処理（LLM 未設定時）
- キャンセル対応（各ステップで `throwIfAborted` チェック）
- update モードの結合テスト追加

#### 含まないもの

- agents/ ディレクトリ内ファイルの更新（別タスク対象）
- UI 側の update モード入力フォームの変更
- `improve-prompt` モードの実処理（TASK-SC-IMPROVE-PROMPT-IMPL-001 で対応）
- `SkillService.updateSkill()` の実装（TASK-SC-UPDATE-SKILL-IMPL-001 #2203 で対応）

### 2.4 成果物

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（`runUpdateWorkflow` 実装完了）
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`（update 実処理テスト追加）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE` が完了していること（dispatch 修正・スキル存在確認実装済み）
- `TASK-SC-LLM-PURPOSE-WIRE-001` が完了していること（`extractPurposeWithLlm` 実装済み）

### 3.2 依存タスク

| タスクID                                    | 依存理由                                           |
| ------------------------------------------- | -------------------------------------------------- |
| UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE | dispatch 修正・`ensureExistingSkillFiles` 実装済み |
| TASK-SC-LLM-PURPOSE-WIRE-001                | `extractPurposeWithLlm` パターンを参照する         |
| TASK-SC-UPDATE-SKILL-IMPL-001 (#2203)       | `SkillService.updateSkill()` 永続化ロジック参照先  |

### 3.3 必要な知識

- `SkillCreatorService.ts` の `runCreateWorkflow` / `extractPurposeWithLlm` / `generateSkillMd` 実装パターン
- `ensureExistingSkillFiles()` が確認するファイル構造（skillDir, SKILL.md）
- `generateSkillMd()` / `ensureSkillMdExists()` のフォールバックパターン
- Vitest の `vi.spyOn` によるプライベートメソッドのモックパターン

### 3.4 推奨アプローチ

1. `runCreateWorkflow` の実装パターンを参照し、update 用の差分フローを設計する
2. LLM が利用可能な場合は `extractPurposeWithLlm` を呼んで新しい purpose を取得する
3. 既存の SKILL.md を読み込み、purpose/description フィールドだけを差分更新する
4. `generateSkillMd()` または直接ファイル書き込みで更新を適用する
5. フォールバック: LLM 未設定時は既存 SKILL.md の `description` フィールドのみ更新する

---

## 4. 実行手順

### Phase 構成

Phase 1〜13（標準構成）で対応する。中規模タスクのため Phase 5〜6 が主体。

### Phase 1: 要件定義

#### 目的

update モードの期待動作を詳細化し、既存コンポーネントの再利用可否を確認する。

#### 手順

1. `runCreateWorkflow` / `extractPurposeWithLlm` / `generateSkillMd` の実装を精読する
2. `TASK-SC-UPDATE-SKILL-IMPL-001` (#2203) の `SkillService.updateSkill()` 実装状況を確認し、連携可否を判断する
3. update モードの入力パラメータ（`CreateSkillOptions` のどのフィールドを使うか）を定義する
4. P50 チェック: 既存実装の再利用範囲を確定し、新規実装範囲を最小化する

#### 成果物

- モード別期待動作一覧（要件定義書）

#### 完了条件

- update モードの入力・処理・出力が明確に定義されている
- `SkillService.updateSkill()` との連携方針が確定している

---

### Phase 2: 設計

#### 目的

`runUpdateWorkflow` の処理フローとインターフェースを設計する。

#### 手順

1. 処理フローを設計する（既存 SKILL.md 読み込み → purpose 更新 → ファイル書き込み）
2. LLM 利用可能時とフォールバック時の分岐を設計する
3. AbortSignal チェックポイントを各ステップに明記する
4. update 成功・失敗・キャンセル 3 経路の状態遷移テーブルを作成する
5. `runImprovePromptWorkflow` との共通ヘルパー抽出可能性を検討する

#### 成果物

- 設計書（フロー図・状態遷移テーブル）

#### 完了条件

- 処理フローが確定し、LLM あり/なしの分岐が明確になっている

---

### Phase 3: 設計レビュー

#### 目的

Phase 4 に進める品質かを判定する。

#### 手順

1. 設計の責務境界（既存スキルファイル操作の所有権）を確認する
2. cleanup 責務の設計（update 失敗時にファイルをロールバックするか）を判定する
3. テスト可能性（依存関係の注入パターン）を確認する

#### 完了条件

- PASS または MINOR 指摘のみで Phase 4 進行

---

### Phase 4: テスト作成

#### 目的

TDD Red フェーズとして、update 実処理の失敗するテストケースを作成する。

#### 手順

1. `runUpdateWorkflow` が実際の SKILL.md 更新を行うテストを追加する
2. LLM ありケース: `extractPurposeWithLlm` が呼ばれ結果が SKILL.md に反映される
3. LLM なしケース: フォールバック処理が動作する
4. AbortSignal 中断テストを追加する
5. エラーケース（スキルディレクトリ不存在）のテストを確認する

#### 成果物

- `SkillCreatorService.test.ts`（update 実処理テスト追加・失敗状態）

#### 完了条件

- テストが失敗（RED）している状態で Phase 5 に進む

---

### Phase 5: 実装

#### 目的

`runUpdateWorkflow` の実処理を実装し、テストを GREEN にする。

#### 手順

1. 既存 SKILL.md の読み込み処理を実装する
2. LLM クライアントがある場合は `extractPurposeWithLlm` を呼ぶ
3. purpose/description フィールドを更新して SKILL.md に書き戻す
4. 各ステップで `throwIfAborted(signal)` を呼ぶ
5. エラー時は既存ファイルを保護するフォールバック処理を実装する

#### 成果物

- `SkillCreatorService.ts`（`runUpdateWorkflow` 実実装完了）

#### 完了条件

- Phase 4 のテストが GREEN になっている
- TypeScript 型チェック PASS

---

### Phase 6: テスト拡充

SKILL.md 書き込み失敗時のエラーハンドリング・create モード回帰・progress emit 順序を検証するテストを追加する。

---

### Phase 7: カバレッジ確認

`runUpdateWorkflow` の line coverage 80% 以上を目標とする。

```bash
pnpm --filter @repo/desktop test --coverage -- --reporter=verbose
```

---

### Phase 8〜10: リファクタリング・品質保証・最終レビュー

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test
```

---

### Phase 11: 手動テスト

NON_VISUAL タスクとして自動テスト結果を証跡とする。スクリーンショット不要。

---

### Phase 12: ドキュメント更新

#### 成果物（全6ファイル必須）

1. `outputs/phase-12/implementation-guide.md`（Part 1/2 構成）
2. `outputs/phase-12/system-spec-update-summary.md`
3. `outputs/phase-12/documentation-changelog.md`
4. `outputs/phase-12/unassigned-task-detection.md`
5. `outputs/phase-12/skill-feedback-report.md`
6. `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

### Phase 13: PR 作成

ユーザーの明示的な承認後のみ実施する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `update` モード実行時に既存 SKILL.md が実際に更新される
- [ ] LLM クライアント利用可能時は purpose が LLM で再生成される
- [ ] LLM クライアント未設定時はフォールバック処理が動作する
- [ ] AbortSignal 中断が各ステップで機能する

### 品質要件

- [ ] TypeScript 型チェック PASS
- [ ] 全ユニットテスト PASS
- [ ] update 実処理テストケースが追加されている

### ドキュメント要件

- [ ] Phase 12 全 6 成果物が揃っている

---

## 6. 検証方法

### テストケース

| ケース                | 入力                            | 期待結果                                           |
| --------------------- | ------------------------------- | -------------------------------------------------- |
| update + LLM あり     | `mode="update"`, llmClient あり | `extractPurposeWithLlm` が呼ばれ SKILL.md が更新   |
| update + LLM なし     | `mode="update"`, llmClient なし | フォールバック処理が動作し SKILL.md が更新         |
| update + AbortSignal  | 実行中にキャンセル              | `AbortError` が throw される                       |
| update + スキル不存在 | `mode="update"`, スキルなし     | `ensureExistingSkillFiles` でエラーが throw される |

### 検証手順

```bash
pnpm --filter @repo/desktop test -- --testPathPattern=SkillCreatorService
pnpm --filter @repo/desktop typecheck
```

---

## 7. リスクと対策

| リスク                                    | 影響度 | 発生確率 | 対策                                                                            |
| ----------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------- |
| SKILL.md のフォーマット変換が複雑         | 中     | 中       | `generateSkillMd` の既存実装を再利用し、差分更新は description のみに絞る       |
| LLM 応答の parse エラーが SKILL.md を破壊 | 高     | 低       | 更新前に既存 SKILL.md をバックアップし、失敗時はロールバックする                |
| `SkillService.updateSkill()` がまだスタブ | 中     | 高       | `SkillService` に依存せず `fs.writeFile` で直接更新するフォールバックを用意する |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/` — 前タスクの実装詳細
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` — 対象ファイル
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` — 参考テスト

### 関連タスク

- `TASK-SC-UPDATE-SKILL-IMPL-001` (#2203) — `SkillService.updateSkill()` 永続化実装（別タスク）
- `TASK-SC-IMPROVE-PROMPT-IMPL-001` — `runImprovePromptWorkflow` 実装（兄弟タスク）

---

## 9. 備考

### 苦戦箇所【事前記録】

| 項目     | 内容                                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------- |
| 想定難所 | SKILL.md の部分的な差分更新（フロントマター + 本文を保持しつつ特定フィールドのみ更新）が複雑になりやすい |
| 対応方針 | 初回は description フィールドのみを対象とし、段階的に拡張する方針で実装コストを抑える                    |
| 再発防止 | スタブ実装でマージする場合は「スタブである」という TODO コメントを全モードの case に必ず残す             |

### 既存タスクとの棲み分け

| タスクID                        | 責務                                                 |
| ------------------------------- | ---------------------------------------------------- |
| TASK-SC-UPDATE-SKILL-IMPL-001   | `SkillService.updateSkill()` メタデータ永続化        |
| TASK-SC-CREATOR-UPDATE-IMPL-001 | `SkillCreatorService.runUpdateWorkflow()` フロー実装 |

両タスクは連携するが独立して実装可能。本タスクが完了すると `runUpdateWorkflow` が `SkillService.updateSkill()` を呼び出すフローも自然に整備される。
