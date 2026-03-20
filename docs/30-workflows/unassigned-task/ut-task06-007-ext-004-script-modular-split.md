# UT-TASK06-007-EXT-004: check-ipc-contracts.ts モジュール分割リファクタリング - タスク指示書

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | UT-TASK06-007-EXT-004                                      |
| タスク名     | check-ipc-contracts.ts モジュール分割リファクタリング      |
| 分類         | リファクタリング                                           |
| 対象機能     | check-ipc-contracts.ts（578行 → モジュール分割）           |
| 優先度       | 低                                                         |
| 見積もり規模 | 中規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | UT-TASK06-007 Phase 8 リファクタリングレポート（C-04制約） |
| 発見日       | 2026-03-18                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`check-ipc-contracts.ts` は578行の単一ファイルであり、NFR-05 で定めるファイル行数の目安（200行以内）を大幅に超過している。Phase 8 リファクタリングでモジュール分割を検討したが、worktree 環境での `esbuild` バイナリ不一致（P7亜種）と組み合わさり、分割後のテスト実行における Vitest のモジュール解決が不安定になる懸念から、単一ファイル維持を判断した（C-04制約）。

EXT-001（タプル配列ハンドラ抽出）・EXT-002（エイリアス / 再export / 動的定数解決）・EXT-003（ipcMain.on パターン強化）の拡張を全て実施すると、600行以上への膨張が見込まれる。この状態を放置すると、拡張追加のたびに全体理解が必要になり、開発効率が逓減する。

### 1.2 問題点・課題

- 単一ファイル578行は新規開発者が全体像を把握するコストが高い
- EXT-001/002/003 の拡張実施後にさらに 120 行以上の増加が見込まれる
- 関数間の依存関係が暗黙的で、`extractors` / `resolver` / `validator` / `reporter` の責務境界が不明確
- 個別モジュール単位でのユニットテストが事実上困難な構成になっている

### 1.3 放置した場合の影響

- 拡張追加のたびにファイル全体の理解が必要になり、開発効率が低下する
- テスト実行時間の増加とメンテナンスコストの上昇が続く
- NFR-05 超過を容認する判断が前例化し、他スクリプトにも同様の問題が波及する

---

## 2. 何を達成するか（What）

### 2.1 目的

`check-ipc-contracts.ts` を責務ごとにモジュール分割し、各モジュールが独立してテスト可能な構成にする。分割後も後方互換のエントリポイントを維持し、既存の CLI 呼び出しを変更なしで動作させる。

### 2.2 最終ゴール

以下のモジュール構成で全テストが PASS し、`pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` が引き続き動作すること。

```
apps/desktop/scripts/
  check-ipc-contracts/
    index.ts          # CLIエントリポイント（main関数）
    types.ts          # 型定義（HandlerEntry, PreloadEntry, DriftEntry等）
    extractors.ts     # extractMainHandlers, extractPreloadEntries
    resolver.ts       # resolveChannelMap, resolveChannel
    validator.ts      # matchAndValidate
    reporter.ts       # generateReport
    utils.ts          # collectTsFiles, classifyArgPattern
  check-ipc-contracts.ts  # 後方互換エントリポイント（check-ipc-contracts/index.ts への再 export）
```

各モジュールが200行以内に収まること。

### 2.3 スコープ

#### 含むもの

- ファイル分割と import/export の整理
- テストファイルの import パス更新
- 後方互換エントリポイント（`check-ipc-contracts.ts`）の維持
- 分割後の各モジュール単体テスト追加（最低限: `extractors.ts`, `resolver.ts`, `validator.ts`）

#### 含まないもの

- 機能追加（EXT-001/002/003 のスコープ）
- ロジック変更（既存の抽出・照合アルゴリズムを変更しない）
- `apps/web` / `packages/shared` への影響

### 2.4 成果物

- `apps/desktop/scripts/check-ipc-contracts/` ディレクトリと分割後の各モジュール
- 後方互換エントリポイント `check-ipc-contracts.ts`（再 export）
- 更新済みテストファイル（import パス修正 + 追加ユニットテスト）
- 全テスト PASS の確認ログ

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-TASK06-007 が完了済みであること（`check-ipc-contracts.ts` が存在すること）
- `pnpm --filter @repo/desktop test` が現時点で全件 PASS していること
- `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` が動作していること
- 可能であれば EXT-001/002/003 を先行実施してから本タスクを実施する（依存関係はないが、分割後に再度 import を修正する手戻りが減る）

### 3.2 依存タスク

- UT-TASK06-007（IPC 契約ドリフト自動検出スクリプト）— 完了済み
- UT-TASK06-007-EXT-001/002/003 — 先行推奨（必須ではない）

### 3.3 必要な知識

- TypeScript の `export` / `import` 解決（相対パス vs tsconfig paths）
- Node.js / tsx のモジュール解決と worktree 環境での esbuild バイナリの挙動（P7亜種）
- Vitest の設定（`vitest.config.ts` の `resolve.alias`）と実行ディレクトリ依存（P40）

### 3.4 推奨アプローチ

1. `types.ts` を最初に分離する（他モジュールに依存せず、全モジュールが参照する末端）
2. `utils.ts` を分離する（`types.ts` のみに依存）
3. `extractors.ts`, `resolver.ts` を分離する（`types.ts` と `utils.ts` に依存）
4. `validator.ts`, `reporter.ts` を分離する（上記に依存）
5. `index.ts` に CLI ロジック（`main` 関数）を移動する
6. テストファイルの import パスを更新する
7. 後方互換エントリポイント `check-ipc-contracts.ts` に `export * from "./check-ipc-contracts/index"` を記述する
8. `pnpm tsx` と `pnpm --filter @repo/desktop test` の両方で動作を確認する

---

## 4. 実行手順

### Phase 構成

Phase 1: 調査（依存グラフ確認） → Phase 2: 型定義分離 → Phase 3: ユーティリティ分離 → Phase 4: コアモジュール分離 → Phase 5: テスト更新 → Phase 6: 品質検証

### Phase 1: 調査

#### 目的

現在の `check-ipc-contracts.ts` の関数間依存グラフを把握し、分割順序を確定する。

#### 手順

1. `check-ipc-contracts.ts` の全関数・型定義を一覧化する
2. 各関数がどの関数・型に依存するかの依存グラフを作成する
3. 循環依存が発生しない分割順序を決定する
4. 既存テストが参照している関数・型を特定し、import パス更新対象をリストアップする

#### 成果物

依存グラフ（コメントまたは一時ファイル）と分割計画

#### 完了条件

- 7モジュールへの分割計画が策定されている
- 循環依存が発生しない分割順序が決定されている
- import パス更新対象ファイルのリストが作成されている

### Phase 2: 型定義分離

#### 目的

`types.ts` を作成し、全型定義を集約する。

#### 手順

1. `check-ipc-contracts.ts` から `interface` / `type` 定義を抽出する
2. `apps/desktop/scripts/check-ipc-contracts/types.ts` を作成し、全型定義を移動する
3. 元ファイルに `import { ... } from "./check-ipc-contracts/types"` を追加する
4. `pnpm --filter @repo/desktop typecheck` でコンパイルエラーがないことを確認する

#### 成果物

`apps/desktop/scripts/check-ipc-contracts/types.ts`

#### 完了条件

- TypeScript コンパイルエラーが 0 件
- `types.ts` が200行以内

### Phase 3: ユーティリティ分離

#### 目的

`utils.ts` を作成し、ファイル収集・引数パターン分類の汎用ユーティリティを分離する。

#### 手順

1. `collectTsFiles`, `classifyArgPattern` 等のユーティリティ関数を `check-ipc-contracts/utils.ts` に移動する
2. 元ファイルに import を追加する
3. `pnpm --filter @repo/desktop typecheck` でエラーがないことを確認する

#### 成果物

`apps/desktop/scripts/check-ipc-contracts/utils.ts`

#### 完了条件

- TypeScript コンパイルエラーが 0 件
- `utils.ts` が200行以内

### Phase 4: コアモジュール分離

#### 目的

`extractors.ts`, `resolver.ts`, `validator.ts`, `reporter.ts` を順次分離する。

#### 手順

1. `extractors.ts` に `extractMainHandlers`, `extractPreloadEntries` を移動する
2. `resolver.ts` に `resolveChannelMap`, `resolveChannel` を移動する
3. `validator.ts` に `matchAndValidate` を移動する
4. `reporter.ts` に `generateReport` を移動する
5. 各ステップで `pnpm --filter @repo/desktop typecheck` を実行する
6. `index.ts` を作成し、`main` 関数とCLI引数解析ロジックを移動する

#### 成果物

`extractors.ts`, `resolver.ts`, `validator.ts`, `reporter.ts`, `index.ts`

#### 完了条件

- TypeScript コンパイルエラーが 0 件
- 各モジュールが200行以内
- `pnpm tsx apps/desktop/scripts/check-ipc-contracts/index.ts --report-only` が動作する

### Phase 5: テスト更新

#### 目的

テストファイルの import パスを更新し、各モジュールの単体テストを追加する。

#### 手順

1. 既存テストファイル（`__tests__/check-ipc-contracts.test.ts` 等）の import パスを更新する
2. `extractors.ts`, `resolver.ts`, `validator.ts` の各モジュール単体テストを追加する
3. 後方互換エントリポイント `check-ipc-contracts.ts` を作成する（`export * from "./check-ipc-contracts/index"`）
4. `pnpm --filter @repo/desktop test` で全件 PASS を確認する

#### 成果物

更新済みテストファイル、追加単体テスト、後方互換エントリポイント

#### 完了条件

- 既存テスト全件 PASS
- 新規追加テストが PASS
- 後方互換エントリポイントが動作する

### Phase 6: 品質検証

#### 目的

Lint・型チェック・全テストが通ることを確認する。

#### 手順

1. `pnpm --filter @repo/desktop lint` を実行する
2. `pnpm --filter @repo/desktop typecheck` を実行する
3. `pnpm --filter @repo/desktop test` を実行する
4. `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` で後方互換を確認する
5. `wc -l apps/desktop/scripts/check-ipc-contracts/*.ts` で各モジュールが200行以内であることを確認する

#### 成果物

各コマンドの実行ログ

#### 完了条件

- Lint エラー 0 件
- 型エラー 0 件
- テスト全件 PASS
- 後方互換エントリポイントが動作する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `check-ipc-contracts/` ディレクトリ内に6モジュール以上が作成されている
- [ ] 各モジュールが200行以内に収まっている
- [ ] 後方互換エントリポイント `check-ipc-contracts.ts` が動作する
- [ ] `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` が動作する

### 品質要件

- [ ] 既存テストが全件 PASS（回帰なし）
- [ ] 各モジュールの単体テストが追加されている（`extractors.ts`, `resolver.ts`, `validator.ts` の最低3モジュール）
- [ ] Lint エラーが 0 件
- [ ] 型エラーが 0 件

### ドキュメント要件

- [ ] Phase 12 完了時に `task-workflow-completed-ipc-contract-preload-alignment.md` の EXT-004 導線を完了状態へ更新する
- [ ] Phase 12 完了時に親タスク仕様書の「未タスク」テーブルを更新する

---

## 6. 検証方法

### テストケース

1. 後方互換: `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` が分割前と同一の出力を返すこと
2. モジュール単体: `extractors.ts` の `extractMainHandlers` が既存のフィクスチャに対して正しいチャンネル名を返すこと
3. モジュール単体: `resolver.ts` の `resolveChannel` が定数マップから正しくチャンネル名を解決すること
4. 行数: `wc -l` で各モジュールが200行以内であること

### 検証手順

```bash
# 後方互換確認
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only

# モジュール直接実行確認
pnpm tsx apps/desktop/scripts/check-ipc-contracts/index.ts --report-only

# テスト実行
pnpm --filter @repo/desktop test -- --grep "check-ipc-contracts"

# 全テスト実行
pnpm --filter @repo/desktop test

# 各モジュール行数確認
wc -l apps/desktop/scripts/check-ipc-contracts/*.ts

# Lint・型チェック
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck
```

---

## 7. リスクと対策

| リスク                                                         | 影響度 | 発生確率 | 対策                                                                                                                                 |
| -------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| モジュール解決の複雑化（Phase 8で懸念された問題）              | 高     | 中       | `tsconfig.json` の `paths` 設定で解決する。テスト実行は `pnpm --filter @repo/desktop test` 経由を維持し、直接 tsx 実行も並行確認する |
| worktree 環境での esbuild バイナリ不一致（P7亜種）             | 高     | 中       | 分割後も `pnpm tsx` 経由で実行し、ネイティブバイナリに依存するビルドプロセスを通さない                                               |
| 循環依存の発生                                                 | 中     | 低       | `types.ts` を末端（他モジュールに依存しない）に配置し、一方向依存を厳守する                                                          |
| テストの import パス大規模修正                                 | 中     | 高       | 後方互換エントリポイント（`check-ipc-contracts.ts`）の re-export で既存 import の大半を維持できる                                    |
| EXT-001/002/003 未実施の場合に分割後再度 import 修正が発生する | 低     | 高       | EXT-001/002/003 を先行実施してから本タスクを実施することを推奨する。依存関係はないが手戻りリスクがある                               |
| Vitest の設定ファイル読み込み先の変化（P40 パターン）          | 中     | 中       | テスト実行は `cd apps/desktop && pnpm vitest run` 形式を維持し、プロジェクトルートからの実行を行わない                               |

---

## 8. 参照情報

### 関連ドキュメント

- [`ipc-contract-checklist.md` 将来拡張セクション](../../../.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md)
- [`task-workflow-completed-ipc-contract-preload-alignment.md`](../../../.claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-contract-preload-alignment.md)
- 関連既知の落とし穴: [P7（ネイティブモジュールバイナリ不一致）](../../../.claude/rules/06-known-pitfalls.md#p7)、[P40（テスト実行ディレクトリ依存）](../../../.claude/rules/06-known-pitfalls.md#p40)

### 参考資料

- 親タスク: `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/`
- Phase 8 レポート: `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/outputs/phase-8/refactoring-report.md`（C-04制約の記録）
- 関連 EXT タスク:
  - EXT-001: `docs/30-workflows/unassigned-task/ut-task06-007-ext-001-tuple-array-handler-extraction.md`
  - EXT-002: `docs/30-workflows/unassigned-task/ut-task06-007-ext-002-multi-channel-const-resolution.md`
  - EXT-003: `docs/30-workflows/unassigned-task/ut-task06-007-ext-003-ipc-on-pattern-enhancement.md`

---

## 9. 備考

### P7 亜種への対策

worktree 環境では `esbuild-darwin-arm64` のバイナリが解決できない問題（P7亜種）が発生しやすい。本タスクでは以下の対策を推奨する。

- テスト実行は `pnpm --filter @repo/desktop test` 経由（Vitest の設定を経由する）
- CLI 実行は `pnpm tsx` 経由（esbuild バイナリに依存しない）
- `vitest.config.ts` の `resolve.alias` で `@` エイリアスが正しく解決されることを確認する（P40対策）

### NFR-05 超過容認の根拠の文書化

Phase 8 では「モジュール解決が複雑化する」という理由で NFR-05 超過を容認した。本タスクでは以下を Phase 2 設計書の必須セクションとして含めること。

- 分割の技術的実現性検証結果（P7亜種・P40 の影響評価）
- 後方互換の担保方法（再 export パターンの選択理由）
- 循環依存チェックの結果

---

## 10. 実装時の苦戦ポイント（親タスク UT-TASK06-007 から抽出）

### 10.1 テスト実行のモジュール解決問題

**問題**: Phase 8 でモジュール分割を検討した際、`vitest` のモジュール解決が worktree 環境で不安定だった。`esbuild-darwin-arm64` の解決失敗（P7亜種）と組み合わさり、分割後のテスト実行が保証できなかった。特に、`apps/desktop/vitest.config.ts` の `environment` 設定と `setupFiles` が worktree 環境で正しく読み込まれるかの確認が不十分だった。

**教訓**: 分割前に以下の3点を順番に検証すること。

1. `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts` が正常に動作する（esbuild 不要のパス確認）
2. `cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts` が PASS する（Vitest 設定読み込みの確認）
3. 分割後の相対パス import が TypeScript のパス解決と Node.js のモジュール解決の両方で正しく動作する

**対策**: 分割後も `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts` で実行できるよう、相対パス import のみを使用する（`tsconfig.json` の `paths` エイリアスは使用しない）。

### 10.2 単一ファイル維持の技術的判断根拠の不明確さ

**問題**: Phase 8 で「分割するとテスト実行のモジュール解決が複雑化する」という理由で単一ファイル維持を選択したが、この判断根拠が Phase 10 最終レビューで詳細に検証されなかった。PASS 判定を受けたが、NFR-05 超過の容認判断が妥当かどうかの議論が不十分なまま終了した。

**教訓**: NFR 超過を容認する場合は、Phase 3（設計レビュー）の `gate-decision.md` に「超過容認の根拠」を明記すること（T-01フィードバック反映）。具体的には「分割した場合の技術的リスク」と「単一ファイル維持のコスト（可読性・拡張性の低下）」をトレードオフとして文書化する。

**対策**: 本タスクの Phase 1 調査で「Phase 8 で懸念されたモジュール解決問題が現時点でも再現するか」を最初に検証する。再現しなければ P7亜種の解消として記録し、分割の技術的実現性が確認できた旨を Phase 2 設計書に明記する。

### 10.3 後方互換エントリポイントの維持

**問題**: スクリプトを複数のモジュールに分割した場合、既存の CI スクリプトや `package.json` の `scripts` セクションが `check-ipc-contracts.ts` を直接参照している可能性がある。分割後に元のファイルを削除すると、参照元が壊れる。

**教訓**: 分割前に `grep -rn "check-ipc-contracts" .` でスクリプト参照箇所を全て洗い出し、後方互換の担保が必要な参照先をリストアップすること。

**対策**: 元の `check-ipc-contracts.ts` を削除せず、`export * from "./check-ipc-contracts/index"` を記述した再 export ファイルとして維持する。これにより既存の参照を変更なしで動作させられる。
