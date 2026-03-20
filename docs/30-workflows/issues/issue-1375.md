# [#1375] "[UT-RAG-08-009] contract-matrix.md postconditions 3件修正"

## メタ情報

```yaml
task_id: UT-RAG-08-009
task_name: contract-matrix.md postconditions 3件修正
category: 仕様修正
target_feature: rag-embedding-extraction-runtime
priority: 低
scale: 極小
status: 未実施
source_phase: Phase 3 設計レビュー MINOR 指摘（M-01、M-04、M-05）
created_date: 2026-03-19
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-rag-08-009-contract-matrix-postconditions-fix.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 極小   |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task-08（RAG Embedding Extraction Runtime）の Phase 3（設計レビュー）において、
契約行列（contract-matrix.md）の postconditions に記述不整合が指摘された。

MINOR 判定 M-01、M-04、M-05 の3件は機能実装に影響しないが、
仕様書として完結性が欠け、参照者が誤解する可能性がある。

### 1.2 問題点・課題

**M-01: embed() の postcondition が曖昧**

- 現状: `"戻り値は float[] または float[][] を返す"` という記述
- 問題: 入力が `string` の場合と `string[]` の場合で型が変わるが、条件分岐が明示されていない

**M-04: エラー時の postcondition 記述が欠落**

- 現状: 成功時の postcondition のみ記載
- 問題: 外部 API 障害時（3xxx エラー）の状態が未定義

**M-05: embedBatch() の postcondition が embed() と重複**

- 現状: embedBatch() の postcondition が embed() のものと同一
- 問題: バッチ処理固有の保証（部分失敗ハンドリング等）が記載されていない

### 1.3 放置した場合の影響

**短期的影響**:

- Phase 4 テスト設計時に postcondition ベースのテストアサーションが不正確になる
- P37（ドキュメント数値の早期固定）と同様のパターンで、テスト修正コストが増大する

**中長期的影響**:

- contract-matrix の信頼性が低下し、仕様書参照が形骸化する

**影響度**: 低（機能実装への直接影響なし、ドキュメント品質のみ）

---

## 2. 何を達成するか（What）

### 2.1 目的

contract-matrix.md §7.3 の postconditions を正確・完結な記述に修正し、
仕様書の参照価値を回復する。

### 2.2 最終ゴール

- M-01、M-04、M-05 の3指摘が全て解消されている
- postconditions が入力型・エラー状態・バッチ固有動作を明示している

### 2.3 スコープ

#### 含むもの

- `outputs/phase-2/contract-matrix.md` の §7.3 postconditions 修正（M-01、M-04、M-05 のみ）

#### 含まないもの

- §7.3 以外のセクションの変更
- 実装コードの変更
- 他の仕様書への波及変更

### 2.4 成果物

1. 修正済み `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/outputs/phase-2/contract-matrix.md`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] task-08 Phase 3（設計レビュー）のレビューレポートが存在する
- [ ] contract-matrix.md §7.3 の現在の記述を Read で確認済み

### 3.2 依存タスク

- なし（単独で実行可能）

### 3.3 必要な知識・スキル

- Markdown テーブル編集
- embed() / embedBatch() の API 契約の理解
- 契約仕様（preconditions / postconditions）の記述形式

### 3.4 推奨アプローチ

1. contract-matrix.md を Read して §7.3 の現在の記述を確認
2. M-01 修正: 入力型に応じた postcondition の条件分岐を追加
3. M-04 修正: エラー時（3xxx）の postcondition を追加（状態変更なし + エラーコード返却）
4. M-05 修正: embedBatch() 固有の postcondition を追記（部分失敗時の動作）

### 3.5 苦戦ポイント

**P37 の再発防止**（ドキュメント数値の早期固定）:

M-04 のエラー postcondition を記述する際、エラーコード範囲（3xxx）を
設計書の想定値で固定してしまうと、実装時に変更された場合に不整合が生まれる。

対応方針: エラーコード範囲の数値は「実装コードを grep で確認してから記載」する。
仮置きとして `[TBD: 実装コードで確認]` を使い、確認後に数値を埋める。

---

## 4. Phase 構成

```
Phase 1: 現状確認
Phase 2: M-01 修正（embed() postcondition 条件分岐追加）
Phase 3: M-04 修正（エラー時 postcondition 追加）
Phase 4: M-05 修正（embedBatch() 固有 postcondition 追記）
Phase 5: レビュー確認（3件修正が全て反映されているか）
```

### Phase 1: 現状確認

```bash
grep -n "postcondition\|embed\|batch" \
  docs/30-workflows/ai-runtime-authmode-unification/tasks/\
step-04-par-task-08-rag-embedding-extraction-runtime/outputs/phase-2/contract-matrix.md
```

**完了条件**:

- [ ] §7.3 の現在の記述を把握している

### Phase 2: M-01 修正

**修正内容**（例）:

```markdown
#### embed() postconditions

- 入力が `string` の場合: 戻り値は `number[]`（1次元ベクトル）
- 入力が `string[]` の場合: 戻り値は `number[][]`（2次元ベクトル配列）
- 各ベクトルの次元数は Provider に依存（OpenAI: 3072, Qwen3-Embedding: 4096）
```

**完了条件**:

- [ ] 入力型に応じた戻り値型が明示されている

### Phase 3: M-04 修正

**修正内容**（例）:

```markdown
#### エラー時 postconditions

- 外部 API 障害（ExternalServiceError: 3000-3999）: 状態変更なし、エラーオブジェクトを返却
- バリデーションエラー（ValidationError: 1000-1999）: 状態変更なし、エラーオブジェクトを返却
```

**完了条件**:

- [ ] エラー時の状態が明示されている

### Phase 4: M-05 修正

**修正内容**（例）:

```markdown
#### embedBatch() postconditions（embed() との差分）

- バッチ内の一部テキストが失敗した場合: 成功分の結果と失敗インデックスリストを返す
- 全件失敗の場合: 空の results 配列と全インデックスの失敗リストを返す
```

**完了条件**:

- [ ] 部分失敗時の動作が明示されている

---

## 5. 完了条件チェックリスト

- [ ] M-01: embed() の postcondition に入力型による分岐が記載されている
- [ ] M-04: エラー時（3xxx / 1xxx）の postcondition が記載されている
- [ ] M-05: embedBatch() 固有の postcondition（部分失敗）が記載されている
- [ ] §7.3 以外の変更が行われていない（スコープ外変更なし）

---

## 6. 検証方法

### 検証手順

1. 修正後の contract-matrix.md を Read で確認
2. M-01〜M-05 の各指摘が解消されていることを確認
3. `git diff` で §7.3 のみが変更されていることを確認

### 検証テーブル

| 指摘ID | 確認内容                          | 期待結果                           |
| ------ | --------------------------------- | ---------------------------------- |
| M-01   | embed() postcondition の条件分岐  | string/string[] 両方の型が記載済み |
| M-04   | エラー時 postcondition            | 3xxx/1xxx エラーの状態が記載済み   |
| M-05   | embedBatch() の固有 postcondition | 部分失敗時の動作が記載済み         |

---

## 7. リスクと対策

| リスク                                | 影響度 | 発生確率 | 対策                                     |
| ------------------------------------- | ------ | -------- | ---------------------------------------- |
| エラーコード範囲が実装と不一致        | 低     | 中       | 実装コードを grep で確認してから記載する |
| §7.3 の修正が他セクションの記述と矛盾 | 低     | 低       | Read で全体を確認してから Edit する      |

---

## 8. 参照情報

- 発見元: Phase 3 設計レビューレポート（task-08）
- 対象ファイル: `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/outputs/phase-2/contract-matrix.md`
- 関連パターン: P37（ドキュメント数値の早期固定）
- エラーカテゴリ定義: `.claude/rules/02-code-quality.md`

---

## 9. 備考

- 本タスクは機能影響なし（純粋なドキュメント修正）
- Phase 3 MINOR 判定のため、このタスクは未タスク化して後続対応とした
- M-02、M-03 は別タスク（UT-RAG-08-010、UT-RAG-08-011）で対応する
