# UT-TASK06-007-EXT-005: R-02 セマンティクスチェック精度向上 - タスク指示書

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | UT-TASK06-007-EXT-005                            |
| タスク名     | R-02 セマンティクスチェック精度向上              |
| 分類         | 品質改善                                         |
| 対象機能     | check-ipc-contracts.ts / matchAndValidate (R-02) |
| 優先度       | 低                                               |
| 見積もり規模 | 中規模                                           |
| ステータス   | 未実施                                           |
| 発見元       | UT-TASK06-007 Phase 9 品質レポート               |
| 発見日       | 2026-03-18                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`check-ipc-contracts.ts` の R-02 検出ルール（引数セマンティクスチェック）は、Main側ハンドラの引数パターン（`object | primitive | none | unknown`）と Preload側の呼び出し引数パターンを比較して不一致を検出する。しかし、現在の検出は「近似検出」であり、Phase 9 品質レポートで19件の R-02 不一致が報告されたが、その中には静的解析の精度限界による偽陽性（false positive）が含まれている。

### 1.2 問題点・課題

- `classifyHandlerArgPattern` が `unknown` を返すケースが多く、`unknown` 同士の比較は常にスキップされるためドリフトが見逃される
- ハンドラが参照渡し（`ipcMain.handle(channel, handlerFunction)`）の場合、引数パターンが `unknown` に分類され、R-02 の検出対象外になる
- `classifyPreloadArgPattern` で `safeInvoke(channel, variable)` のように変数名が渡される場合、型情報なしに `primitive` と分類してしまう可能性がある
- P44/P45 パターン（`skillId` vs `skillName` の命名ドリフト）は現在 `rawSignature` / `rawArgs` の文字列として記録されるが、自動比較は行われていない

### 1.3 放置した場合の影響

- R-02 検出の信頼性が低く、実際のセマンティクスドリフトが見逃される
- 偽陽性が多いと開発者が R-02 レポートを無視するようになり、ルール自体が形骸化する
- P44/P45 再発リスクが軽減されない

---

## 2. 何を達成するか（What）

### 2.1 目的

R-02 検出の精度を向上させ、偽陽性を削減しつつ、P44/P45 パターンの自動検出率を高める。

### 2.2 最終ゴール

- `unknown` 分類率を50%以下に削減
- ハンドラ参照渡しパターンでの引数パターン推定精度を向上
- `rawSignature` / `rawArgs` の引数名比較による P45 パターン自動検出
- R-02 偽陽性率を10%以下に削減

### 2.3 スコープ

#### 含むもの

- `classifyHandlerArgPattern` の精度改善（参照渡しハンドラの引数推定）
- `classifyPreloadArgPattern` の精度改善（変数名からの型推定）
- `rawSignature` / `rawArgs` の引数名比較ロジック追加（P45自動検出）
- 偽陽性削減のためのホワイトリスト機能

#### 含まないもの

- タプル配列パターン対応（EXT-001 のスコープ）
- 別定数オブジェクト対応（EXT-002 のスコープ）
- `ipcMain.on` パターン対応（EXT-003 のスコープ）
- TypeScript AST ベースの完全な型解析（将来課題）

### 2.4 成果物

- `check-ipc-contracts.ts` の `classifyHandlerArgPattern`、`classifyPreloadArgPattern`、`matchAndValidate` 修正
- P45 パターン自動検出の新規テスト
- 偽陽性率レポート

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-TASK06-007 が完了済みであること
- `pnpm --filter @repo/desktop test` が全件 PASS していること

### 3.2 依存タスク

- UT-TASK06-007（完了済み）
- UT-TASK06-007-EXT-004（先行推奨。モジュール分割後の方が修正範囲が明確）

### 3.3 必要な知識

- TypeScript の引数パターン分析（デストラクチャリング、型アノテーション）
- 正規表現による引数名抽出
- P44/P45 パターンの理解（IPC 引数命名の契約ドリフト）

### 3.4 推奨アプローチ

**Phase 1: 参照渡しハンドラの引数推定**

`ipcMain.handle(channel, handlerFunction)` で参照渡しされたハンドラ関数の定義を追跡し、引数パターンを推定する。

1. ハンドラ関数名を抽出
2. 同ファイル内で関数定義を検索
3. 関数定義の引数パターンを `classifyHandlerArgPattern` で分類

**Phase 2: P45 パターン自動検出**

`rawSignature` と `rawArgs` から引数名を抽出し、セマンティクスの一致度を検証する。

- `skillId` vs `skillName` → 不一致（P45パターン）
- `skillName` vs `skillName` → 一致
- `args` vs `data` → 汎用名のため検出対象外

**Phase 3: ホワイトリスト機能**

既知の偽陽性チャンネルをホワイトリストで除外する。

- `--r02-whitelist path/to/whitelist.json` CLIオプション

---

## 4. 実行手順

### Phase 構成

Phase 1: 調査 → Phase 2: 参照渡し推定実装 → Phase 3: P45自動検出実装 → Phase 4: ホワイトリスト実装 → Phase 5: テスト拡充 → Phase 6: 品質検証

### Phase 1: 調査

#### 目的

現在の R-02 検出結果を分析し、偽陽性と真陽性を分類する。

#### 手順

1. `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --format json` を実行して全 R-02 検出結果を取得
2. 19件の R-02 不一致を手動で分類（真陽性 / 偽陽性 / unknown精度限界）
3. `unknown` 分類されたハンドラの一覧を作成し、参照渡しパターンの割合を確認

#### 完了条件

- 19件の R-02 結果が分類されている
- 改善対象のパターンが特定されている

### Phase 2-6: （Phase 1の結果に基づいて詳細化）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ハンドラ参照渡しパターンで `unknown` 以外の分類が返される
- [ ] P45 パターン（引数名の不一致）が R-02 として自動検出される
- [ ] ホワイトリスト機能で既知の偽陽性が除外できる

### 品質要件

- [ ] 既存テストが回帰しない
- [ ] P45 パターンのテストケースが追加されている
- [ ] R-02 偽陽性率が10%以下
- [ ] Lint・型チェックが全件 PASS

### ドキュメント要件

- [ ] Phase 12 完了時に `ipc-contract-checklist.md` の R-02 セクションを更新

---

## 6. 検証方法

### テストケース

1. 参照渡しハンドラ `ipcMain.handle(ch, myHandler)` + 同ファイル内 `function myHandler(event, { skillName })` → `object` 分類
2. P45 パターン: Main側 `skillId`、Preload側 `skillName` → R-02 不一致検出
3. ホワイトリスト指定チャンネルが R-02 検出から除外される
4. 既存19件の R-02 結果で偽陽性が削減されている

### 検証手順

```bash
# R-02 検出結果を確認
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --format json 2>&1 | jq '.drifts[] | select(.rule == "R-02")'

# テスト実行
pnpm tsx apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts

# unknown分類率の確認
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --format json 2>&1 | jq '[.drifts[] | select(.rule == "R-02")] | length'
```

---

## 7. リスクと対策

| リスク                                                   | 影響度 | 発生確率 | 対策                                                           |
| -------------------------------------------------------- | ------ | -------- | -------------------------------------------------------------- |
| 参照渡しハンドラの定義が別ファイルに存在し追跡不可       | 中     | 高       | 同ファイル内のみ追跡し、別ファイルは `unknown` のまま残す      |
| P45 自動検出の偽陽性（汎用名 `args` / `data` の誤検出）  | 中     | 中       | 汎用名リストを除外対象として定義                               |
| 精度向上のためのロジック追加でスクリプト行数がさらに増加 | 低     | 高       | EXT-004（モジュール分割）と連携し、`validator.ts` に独立配置   |
| ホワイトリストの管理コスト                               | 低     | 中       | ホワイトリストは JSON 形式で、変更時の差分が明確になるよう設計 |

---

## 8. 参照情報

### 関連ドキュメント

- [`ipc-contract-checklist.md`](../../../.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md)
- [`task-workflow-backlog.md`](../../../.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md)
- 関連既知の落とし穴: [P44](../../../.claude/rules/06-known-pitfalls.md#p44), [P45](../../../.claude/rules/06-known-pitfalls.md#p45)

### 参考資料

- 親タスク: `docs/30-workflows/UT-TASK06-007-ipc-contract-drift-auto-detect/`
- Phase 9 品質レポート: `outputs/phase-9/quality-report.md`（R-02: 19件の記録）
- Phase 12 実装ガイド: `outputs/phase-12/implementation-guide.md`（R-02 検出ロジックの説明）

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
UT-TASK06-007 Phase 9 品質レポート:
R-02 引数形式不一致: 19件検出
一部は実際のドリフト、一部は unknown 判定の精度限界
```

### 補足事項

- TypeScript AST ベースの完全な型解析は将来課題（ts-morph 等のツール検討）
- EXT-004（モジュール分割）を先行実施すると、R-02 ロジックの修正範囲が `validator.ts` に限定されて効率的

---

## 10. 実装時の苦戦ポイント（親タスク UT-TASK06-007 から抽出）

以下は親タスク UT-TASK06-007 の実装過程で遭遇した苦戦ポイントであり、本タスクの実装時に同様の課題に直面する可能性が高い。

### 10.1 classifyHandlerArgPattern の4分類の限界

**問題**: `classifyHandlerArgPattern` は `(event, args)` のような引数パターンを正規表現で分類するが、TypeScript の型アノテーション（`: { skillName: string }`）を含む場合のパース精度が低い。`arrowMatch` の正規表現 `/\(\s*(?:_?event[^,)]*),?\s*([^)]*)\)/` は型アノテーション内のカンマやコロンに誤マッチする場合がある。

**教訓**: 正規表現だけで TypeScript の引数構文を完全にパースするのは困難。括弧・ブレース・山括弧のネストレベルを追跡するトークナイザーが必要になる場合がある。

**対策**: 第1フェーズでは正規表現の改善に留め、精度が不十分な場合は `ts-morph` 等の AST ツールの導入を検討する。ただし、AST ツール導入はスクリプトの依存関係と実行時間に影響するため、費用対効果を評価すること。

### 10.2 R-02 の19件分析の工数

**問題**: Phase 9 で19件の R-02 不一致が検出されたが、「実際のドリフト」と「精度限界による偽陽性」の区別を手動で行う必要があった。自動分類の仕組みがないため、検出数が増えると分析工数が膨張する。

**教訓**: R-02 検出結果に「信頼度スコア」を付与する仕組みが有効。`unknown` 分類が片方にある場合は信頼度「低」、両方が明確な分類の場合は信頼度「高」とする。

**対策**: `DriftEntry` 型に `confidence: "high" | "medium" | "low"` フィールドを追加し、レポート出力時に信頼度でフィルタリングできるようにする。

### 10.3 worktree環境でのesbuildプラットフォーム不一致（P7亜種）

**問題**: worktree環境では `node_modules` がシンボリックリンクで共有されるため、`vitest run` 実行時に `esbuild-darwin-arm64` の解決に失敗する場合がある。

**教訓**: テスト実行は `pnpm tsx` 経由の直接実行を第一手段とする。`vitest` を使う場合は `--pool=forks` オプションを付与する。

**対策**: テスト追加時は `pnpm tsx apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` での実行を先に確認すること。
