# UT-TASK06-007-EXT-001: タプル配列経由ハンドラ抽出パターン拡張 - タスク指示書

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| タスクID     | UT-TASK06-007-EXT-001                        |
| タスク名     | タプル配列経由ハンドラ抽出パターン拡張       |
| 分類         | 品質改善                                     |
| 対象機能     | check-ipc-contracts.ts / extractMainHandlers |
| 優先度       | 中                                           |
| 見積もり規模 | 小規模                                       |
| ステータス   | 未実施                                       |
| 発見元       | UT-TASK06-007 Phase 11 TC-11-04              |
| 発見日       | 2026-03-18                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`check-ipc-contracts.ts` の Main ハンドラ抽出ロジック（`extractMainHandlers`）は、`ipcMain.handle(IPC_CHANNELS.XXX, handler)` の直接呼び出し形式のみを対象としている。しかし `registerFallbackHandlers` 等ではチャンネルとハンドラをタプル配列 `[IPC_CHANNELS.XXX, handler]` の形式で登録するパターンが用いられており、これらが抽出されていない。

### 1.2 問題点・課題

UT-TASK06-007 の再監査では `--report-only` 基準値が `handlers: 216` で確定した一方、`registerFallbackHandlers` 等のタプル配列経由登録が静的抽出対象から漏れていることを確認した。未抽出チャンネルは「Main に未登録」として誤検知され、実際には存在するハンドラが契約ドリフトとして報告されてしまう。

### 1.3 放置した場合の影響

- 約 108 件のチャンネルが常に偽陽性（未登録誤検知）として報告され続ける
- 自動検出スクリプトの信頼性が低下し、運用上の有用性が損なわれる
- 本物の契約ドリフトがノイズに埋もれて見逃されるリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

`extractMainHandlers` にタプル配列内パターンマッチを追加し、`[IPC_CHANNELS.XXX, handler]` 形式の登録を正しく抽出できるようにする。

### 2.2 最終ゴール

抽出数が current baseline の `216` 件を上回り、手動棚卸しで確認できるタプル配列由来の登録が静的抽出に反映されること。

### 2.3 スコープ

#### 含むもの

- `extractMainHandlers` へのタプル配列パターンマッチ追加
- タプル配列形式を対象とした単体テスト追加
- 既存テストの回帰確認

#### 含まないもの

- エイリアス / 再export / 動的定数解決（UT-TASK06-007-EXT-002 のスコープ）
- `ipcMain.on` / `safeOn` の照合強化（UT-TASK06-007-EXT-003 のスコープ）

### 2.4 成果物

- `check-ipc-contracts.ts` の `extractMainHandlers` 修正
- 追加単体テスト（タプル配列パターン）
- 既存テスト全件 PASS の確認ログ

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-TASK06-007 が完了済みであること（`check-ipc-contracts.ts` が存在すること）
- `pnpm --filter @repo/desktop test` が現時点で全件 PASS していること

### 3.2 依存タスク

- UT-TASK06-007（IPC 契約ドリフト自動検出スクリプト）— 完了済み

### 3.3 必要な知識

- TypeScript AST / 正規表現によるソースコード解析
- `ipcMain.handle` の登録パターン（直接呼び出し vs タプル配列）
- Vitest を用いた単体テストの記述方法

### 3.4 推奨アプローチ

1. `check-ipc-contracts.ts` の `extractMainHandlers` 実装を読み、現在のパターンマッチ正規表現を確認する
2. `registerFallbackHandlers` 等のタプル配列登録コードを grep で収集し、実際のパターンを把握する
3. 正規表現またはパーサーロジックを拡張してタプル配列を抽出できるようにする
4. 単体テストを追加し、抽出数が期待値に近づいたことを確認する

---

## 4. 実行手順

### Phase 構成

Phase 1: 調査 → Phase 2: 実装 → Phase 3: テスト拡充 → Phase 4: 品質検証

### Phase 1: 調査

#### 目的

現在の `extractMainHandlers` のパターンマッチ実装と、タプル配列登録箇所を把握する。

#### 手順

1. `grep -rn "\[IPC_CHANNELS\." apps/desktop/src/main/ --include="*.ts"` でタプル配列登録パターンを収集する
2. `check-ipc-contracts.ts` の `extractMainHandlers` 実装を読み、現在の正規表現・AST 解析ロジックを把握する
3. タプル配列由来で未抽出になっているチャンネル候補の一覧を作成する

#### 成果物

タプル配列登録パターンの一覧（コメントまたは一時ファイル）

#### 完了条件

- 未抽出チャンネルの原因コードが特定されている
- 修正すべき箇所が 1 ファイル以内に絞られている

### Phase 2: 実装

#### 目的

`extractMainHandlers` にタプル配列パターンのマッチロジックを追加する。

#### 手順

1. `check-ipc-contracts.ts` の `extractMainHandlers` に配列内パターンマッチを追加する
2. 既存のパターンマッチと新規パターンマッチを `OR` 条件でまとめる
3. `pnpm --filter @repo/desktop typecheck` でコンパイルエラーがないことを確認する

#### 成果物

`check-ipc-contracts.ts` の修正差分

#### 完了条件

- TypeScript コンパイルエラーが 0 件
- `check-ipc-contracts.ts` を実行したとき抽出数が current baseline `216` 件を上回り、差分理由が説明できる

### Phase 3: テスト拡充

#### 目的

タプル配列パターンに対応した単体テストを追加し、回帰を防止する。

#### 手順

1. 既存の `check-ipc-contracts.test.ts`（または同等のテストファイル）にタプル配列フィクスチャを追加する
2. `extractMainHandlers` がタプル配列から正しくチャンネル名を抽出できることをアサートする
3. 既存テストが全件 PASS することを確認する

#### 成果物

追加テストコード（タプル配列パターン）

#### 完了条件

- 既存テスト全件 PASS
- 新規追加テストが PASS

### Phase 4: 品質検証

#### 目的

Lint・型チェック・全テストが通ることを確認する。

#### 手順

1. `pnpm --filter @repo/desktop lint` を実行する
2. `pnpm --filter @repo/desktop typecheck` を実行する
3. `pnpm --filter @repo/desktop test` を実行する

#### 成果物

各コマンドの実行ログ

#### 完了条件

- Lint エラー 0 件
- 型エラー 0 件
- テスト全件 PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `registerFallbackHandlers` 等のタプル配列内のチャンネル名が抽出される
- [ ] 抽出数が current baseline `216` 件を上回り、差分理由が説明できる
- [ ] 偽陽性（未登録誤検知）が 0 件になる

### 品質要件

- [ ] 既存テストが回帰しない
- [ ] 新規タプル配列パターンのテストが追加されている
- [ ] Lint・型チェックが全件 PASS

### ドキュメント要件

- [ ] Phase 12 完了時に `ipc-contract-checklist.md` の将来拡張セクションを「対応済み」に更新する

---

## 6. 検証方法

### テストケース

1. タプル配列形式 `[IPC_CHANNELS.FOO, handler]` のフィクスチャに対して `extractMainHandlers` が `IPC_CHANNELS.FOO` を返すこと
2. 直接呼び出し形式 `ipcMain.handle(IPC_CHANNELS.BAR, handler)` の抽出が引き続き動作すること
3. `check-ipc-contracts.ts` を実際のコードベースに対して実行し、抽出数が current baseline `216` 件を上回ること、または残差分が文書化されること

### 検証手順

```bash
# 1. テスト実行
pnpm --filter @repo/desktop test -- --grep "extractMainHandlers"

# 2. スクリプト実行して抽出数確認
node apps/desktop/scripts/check-ipc-contracts.ts 2>&1 | grep -E "抽出|extracted|handlers"

# 3. 全テスト実行
pnpm --filter @repo/desktop test
```

---

## 7. リスクと対策

| リスク                                         | 影響度 | 発生確率 | 対策                                                                             |
| ---------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------- |
| タプル配列パターンが多様で正規表現が複雑になる | 中     | 中       | 複数の正規表現を OR 結合し、テストケースでカバレッジを上げる                     |
| 既存テストの回帰                               | 高     | 低       | Phase 4 で全テスト実行を必須とする                                               |
| 抽出数の改善が限定的で別パターンが残存する     | 低     | 中       | 差分分析を Phase 1 で徹底し、残余パターンは EXT-002/003 のスコープとして切り出す |

---

## 8. 参照情報

### 関連ドキュメント

- [`ipc-contract-checklist.md` 将来拡張セクション](../../../.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md)
- [`task-workflow-completed-ipc-contract-preload-alignment.md`](../../../.claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-contract-preload-alignment.md)
- 関連既知の落とし穴: [P44](../../../.claude/rules/06-known-pitfalls.md#p44), [P45](../../../.claude/rules/06-known-pitfalls.md#p45)

### 参考資料

- 親タスク: `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
UT-TASK06-007 Phase 11 TC-11-04:
report-only 基準値は handlers 216。
registerFallbackHandlers 等のタプル配列経由登録が静的抽出対象から漏れている。
```

### 補足事項

- `IPC_CHANNELS` 以外の定数解決や alias 追跡は UT-TASK06-007-EXT-002 のスコープ
- `ipcMain.on` / `safeOn` の照合精度向上は UT-TASK06-007-EXT-003 のスコープ

---

## 10. 実装時の苦戦ポイント（親タスク UT-TASK06-007 から抽出）

以下は親タスク UT-TASK06-007 の実装過程で遭遇した苦戦ポイントであり、本タスクの実装時に同様の課題に直面する可能性が高い。

### 10.1 正規表現のマルチライン対応の複雑性

**問題**: `ipcMain.handle()` の引数が複数行にまたがるケースがある。単純な1行マッチでは不十分で、開始行を検出した後に閉じ括弧まで蓄積するロジックが必要になった。タプル配列パターン `[IPC_CHANNELS.XXX, handler]` では配列リテラルの開始 `[` から終了 `]` まで追跡する必要があり、正規表現だけでは対応困難。

**教訓**: 配列リテラルのネストレベルを追跡するステートマシン（括弧カウンタ）を実装する方が、複雑な正規表現よりも保守性が高い。`extractMainHandlers` の既存マルチライン対応コード（L94-140）を参考にすること。

**対策**: 正規表現とステートマシンのハイブリッドアプローチを推奨。正規表現で開始パターンを検出し、括弧カウンタで範囲を特定する。

### 10.2 NFR 行数目安（200行）と実装規模の乖離

**問題**: Phase 2 設計で NFR-05「200行以内」を目安としたが、2026-03-19 再監査時点で `check-ipc-contracts.ts` は578行になっている。Phase 8 リファクタリングで分割を検討したが、テスト実行のモジュール解決が複雑化するため単一ファイル維持を選択した。

**教訓**: 本タスクで新パターンを追加するとさらに行数が増加する。事前にファイル分割（EXT-004スコープ）との優先順序を検討すること。

**対策**: 新パターン追加は関数レベルで独立させ、将来のファイル分割に備える。具体的には `extractTupleArrayHandlers()` を独立関数として実装し、`extractMainHandlers()` から呼び出す構成にする。

### 10.3 worktree環境でのesbuildプラットフォーム不一致（P7亜種）

**問題**: worktree環境では `node_modules` がシンボリックリンクで共有されるため、`vitest run` 実行時に `esbuild-darwin-arm64` の解決に失敗する場合がある。

**教訓**: テスト実行は `pnpm tsx` 経由の直接実行を第一手段とする。`vitest` を使う場合は `--pool=forks` オプションを付与する。

**対策**: テスト追加時は `pnpm tsx apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` での実行を先に確認すること。

---
