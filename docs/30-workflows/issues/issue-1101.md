# [#1101] "[UT-10A-G-001] 他IPCハンドラへの3層テスト横展開"

## メタ情報

```yaml
task_id: UT-10A-G-001
task_name: 他IPCハンドラへの3層テスト横展開
category: テスト強化
target_feature: skillHandlers.ts 全ハンドラ
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-10A-G Phase 12 未タスク検出
created_date: 2026-03-09
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-10a-g-001-3layer-test-expansion.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-G で skill:create ハンドラに3層テスト（IPC契約 + Store統合 + 既存テスト拡張）を実装し、43テスト追加・Branch Coverage 89%を達成した。このテストパターンは testing-component-patterns.md セクション17 に文書化済みである。

### 1.2 問題点・課題

skill:fork, skill:import, skill:remove, skill:schedule 等の他ハンドラにはまだ同等の3層テストが存在しない。各ハンドラのバリデーション（P42準拠3段バリデーション）やエラーサニタイズのテストカバレッジが不十分である。

### 1.3 放置した場合の影響

他ハンドラのリファクタリング・仕様変更時に回帰バグを検出できない。特にP42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）やP44/P45（IPC引数命名の契約ドリフト）の問題がテストなしでは再発するリスクがある。

## 2. 何を達成するか（What）

### 2.1 目的

skill:create で確立した3層テストパターンを他の主要IPCハンドラに横展開する。

### 2.2 最終ゴール

skillHandlers.ts の全主要ハンドラ（fork, import, remove, schedule）に Layer 1 契約テストが存在し、Branch Coverage 80%以上を達成する。

### 2.3 スコープ

#### 含むもの

- skill:fork ハンドラの Layer 1 テスト作成
- skill:import ハンドラの Layer 1 テスト作成
- skill:remove ハンドラの Layer 1 テスト作成

#### 含まないもの

- Layer 2（Store統合）/ Layer 3（既存テスト拡張）の新規作成（必要に応じて後続タスクで対応）
- skill:schedule ハンドラ（スコープ外、必要に応じて別タスクで対応）

### 2.4 成果物

- `skillHandlers.fork.test.ts` Layer 1 契約テスト
- `skillHandlers.import.test.ts` Layer 1 契約テスト
- `skillHandlers.remove.test.ts` Layer 1 契約テスト
- カバレッジレポート（Branch Coverage 80%以上の確認）

## 3. どのように実行するか（How）

### 3.1 前提条件

TASK-10A-G の3層テストパターンが testing-component-patterns.md に文書化されていること（完了済み）。

### 3.2 依存タスク

なし（TASK-10A-G 完了済み）。

### 3.3 必要な知識

- Vitest テストフレームワーク
- IPC ハンドラのモック構成パターン
- P42準拠3段バリデーション
- P44/P45 IPC引数命名の契約ドリフト防止

### 3.4 推奨アプローチ

1. `skillHandlers.create.test.ts` のモック構成をテンプレートとして再利用する
2. 各ハンドラの引数形式・バリデーション・エラーハンドリングを確認する
3. テストケースを設計する（P42準拠バリデーション + エラーサニタイズ）
4. ランダム順序実行で独立性を検証する

## 4. 実行手順

### Phase構成

調査 → テスト設計 → テスト作成 → カバレッジ確認。

### Phase 1: 対象ハンドラ調査

#### 目的

各ハンドラの引数形式・バリデーション・エラーハンドリングを把握する。

#### 手順

1. `skillHandlers.ts` の fork/import/remove ハンドラ実装を確認する。
2. 各ハンドラの引数形式を整理する（P44/P45 準拠で引数名とセマンティクスの一致を検証）。
3. 既存テストの有無とカバレッジ状況を確認する。

#### 成果物

各ハンドラの引数形式・バリデーション仕様の整理表。

#### 完了条件

全対象ハンドラの引数形式とバリデーション仕様が明確になっている。

### Phase 2: テスト設計・作成

#### 目的

Layer 1 契約テストを設計・実装する。

#### 手順

1. `skillHandlers.create.test.ts` をテンプレートにテストケースを設計する。
2. 各ハンドラごとにテストファイルを作成する。
3. P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）のテストを含める。
4. エラーサニタイズのテストを含める。
5. ランダム順序実行（`vitest --sequence.shuffle`）で独立性を検証する。

#### 成果物

3つの Layer 1 契約テストファイル。

#### 完了条件

全テストが PASS し、ランダム順序でも安定して PASS する。

### Phase 3: カバレッジ確認

#### 目的

Branch Coverage 80%以上の達成を確認する。

#### 手順

1. `vitest --coverage` でカバレッジを計測する。
2. `--coverage.include` でスコープを限定する（skillHandlers.ts は1417行の巨大ファイルのため）。
3. 不足箇所があればテストを追加する。

#### 成果物

カバレッジレポート。

#### 完了条件

対象ハンドラの Branch Coverage が 80%以上である。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] skill:fork ハンドラの Layer 1 契約テストが存在する
- [ ] skill:import ハンドラの Layer 1 契約テストが存在する
- [ ] skill:remove ハンドラの Layer 1 契約テストが存在する
- [ ] 全テストが PASS する

### 品質要件

- [ ] Branch Coverage 80%以上を達成する
- [ ] ランダム順序実行で全テストが安定 PASS する
- [ ] P42準拠3段バリデーションのテストが各ハンドラに含まれる

### ドキュメント要件

- [ ] 変更履歴へテスト追加の記録を追記する

## 6. 検証方法

### テストケース

- `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.fork.test.ts`
- `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.import.test.ts`
- `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.remove.test.ts`

### 検証手順

1. 各テストファイルを個別実行して全 PASS を確認する。
2. `vitest --sequence.shuffle` でランダム順序実行の安定性を確認する。
3. `vitest --coverage --coverage.include=src/main/ipc/skillHandlers.ts` でカバレッジを確認する。

## 7. リスクと対策

| リスク                                         | 影響度 | 発生確率 | 対策                                                                 |
| ---------------------------------------------- | ------ | -------- | -------------------------------------------------------------------- |
| ハンドラ引数形式の差異によるテンプレート不適合 | 中     | 高       | 各ハンドラの引数形式を事前調査し、テンプレートを適宜調整する         |
| 巨大ファイル（1417行）のカバレッジ計測精度低下 | 低     | 中       | `--coverage.include` でスコープを限定する                            |
| P44/P45 契約ドリフトの未検出                   | 中     | 中       | テスト設計時にハンドラ引数名とセマンティクスの一致を明示的に検証する |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` セクション17: 3層テスト構成パターン
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` v1.29.51: TASK-10A-G 教訓セクション
- `.claude/skills/skill-creator/references/patterns.md`: 3層テストハードニング戦略パターン

### 参考資料

- `apps/desktop/src/main/ipc/skillHandlers.ts`: テスト対象実装
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`: テンプレート
- `.claude/rules/06-known-pitfalls.md`: P42, P44, P45

## 9. 備考

### TASK-10A-G で得た教訓

- **教訓1**: skillHandlers.ts は1417行の巨大ファイルのため、vitest --coverage でファイル全体が計測される。`--coverage.include` でスコープ限定が必要
- **教訓2**: 各ハンドラの引数形式が異なる（skill:create は2引数 description/options、skill:import は単一文字列 skillName）。テンプレート再利用時に引数形式を必ず確認すること
- **教訓3**: P44/P45（IPC引数命名の契約ドリフト）の教訓から、ハンドラの引数名と実際のセマンティクスが一致しているか検証が必要

### 補足事項

TASK-10A-G で確立した3層テストパターンの横展開タスクであり、テンプレートと文書化済みパターンが存在するため、実装効率は高い見込みである。
