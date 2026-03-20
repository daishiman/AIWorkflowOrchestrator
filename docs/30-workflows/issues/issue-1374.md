# [#1374] "[UT-RAG-08-008] circuit-breaker.ts / async-utils.ts テスト追加"

## メタ情報

```yaml
task_id: UT-RAG-08-008
task_name: circuit-breaker.ts / async-utils.ts テスト追加
category: テスト追加
target_feature: Embedding / Failure Handling
priority: 低
scale: 小規模
status: 未実施
source_phase: Phase 7 カバレッジ未達（UT-P6-3）
created_date: 2026-03-19
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-rag-08-008-circuit-breaker-async-utils-tests.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`circuit-breaker.ts` と `async-utils.ts` のカバレッジが低く、失敗系とタイムアウト系の境界値が十分に守られていない。境界条件のテストは、後からの事故を減らすために先に固める必要がある。

### 1.2 問題点・課題

- タイムアウトや失敗パスの回帰を見逃しやすい
- 非同期ユーティリティはバグが入り込むと追跡が難しい
- テストがないと、変更時の安全網がほぼない

### 1.3 放置した場合の影響

- リトライや中断の動作が壊れても気づきにくい
- Embedding 周辺の失敗挙動が不安定になる
- 失敗系を確認するたびに手動検証が必要になる

---

## 2. 何を達成するか（What）

### 2.1 目的

失敗系・タイムアウト系の代表ケースを追加し、非同期制御の回帰を検出可能にする。

### 2.2 最終ゴール

- 境界値テストが揃う
- fake timer を使って安定した検証ができる
- 低カバレッジ箇所が改善する

### 2.3 スコープ

#### 含むもの

- `packages/shared/src/services/embedding/circuit-breaker.ts`
- `packages/shared/src/services/embedding/async-utils.ts`
- 対応テスト

#### 含まないもの

- 非同期処理の設計変更
- 例外モデルの変更

### 2.4 成果物

- 境界値テスト
- 改善済みカバレッジ結果

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- タイマー制御を使えるテスト環境であること
- 失敗系の期待値を明確にできること

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- Vitest fake timers
- 非同期例外処理
- timeout / retry の境界値

### 3.4 推奨アプローチ

`runAllTimers` に頼らず、必要な時間だけ進める。成功系より失敗系を先に固め、再現性の低いケースを増やさない。

---

## 4. 実行手順

### Phase 1: ケース整理

#### 目的

境界値を決める。

#### 手順

1. timeout / failure の条件を洗い出す
2. 期待する例外と戻り値を決める
3. fake timer の使い方を決める

#### 完了条件

- 追加する失敗系が確定

### Phase 2: テスト実装

#### 目的

境界値をコード化する。

#### 手順

1. `circuit-breaker.ts` の失敗系を追加する
2. `async-utils.ts` の失敗系を追加する
3. fake timer を使う

#### 完了条件

- 主要境界がカバーされる

### Phase 3: 確認

#### 目的

テストが安定しているか確認する。

#### 手順

1. テストを実行する
2. カバレッジを確認する
3. flaky がないか確認する

#### 完了条件

- 安定して PASS する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] timeout 系の境界値が通る
- [ ] failure 系の境界値が通る

### 品質要件

- [ ] fake timer を正しく使っている
- [ ] 再現性がある

### ドキュメント要件

- [ ] 追加理由が記録されている

---

## 6. 検証方法

### テストケース

- TC-001: timeout で失敗する
- TC-002: 失敗回数の境界に達する
- TC-003: async ヘルパーの異常系が通る

### 検証手順

1. テストを実行する
2. カバレッジを確認する
3. タイマーの巻き戻し漏れがないか確認する

---

## 7. リスクと対策

| リスク                  | 影響度 | 発生確率 | 対策                           |
| ----------------------- | ------ | -------- | ------------------------------ |
| fake timer の扱いを誤る | 中     | 中       | テストごとに時間進行を明示する |
| 境界値が増えすぎる      | 低     | 中       | 代表ケースだけに絞る           |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/outputs/phase-12/unassigned-task-detection.md`

### 参考資料

- `packages/shared/src/services/embedding/circuit-breaker.ts`
- `packages/shared/src/services/embedding/async-utils.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
circuit-breaker.ts と async-utils.ts のカバレッジが低いため、失敗系とタイムアウト系の境界値テストを追加する。
```

### 補足事項

`runAllTimers` 系の乱用は避ける。
