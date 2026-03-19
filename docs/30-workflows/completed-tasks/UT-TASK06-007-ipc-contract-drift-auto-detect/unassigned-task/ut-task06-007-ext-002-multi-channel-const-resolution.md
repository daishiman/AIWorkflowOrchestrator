# UT-TASK06-007-EXT-002: 別定数オブジェクトのチャンネル解決対応 - タスク指示書

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | UT-TASK06-007-EXT-002                      |
| タスク名     | 別定数オブジェクトのチャンネル解決対応     |
| 分類         | 機能拡張                                   |
| 対象機能     | check-ipc-contracts.ts / resolveChannelMap |
| 優先度       | 低                                         |
| 見積もり規模 | 小規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | UT-TASK06-007 Phase 11 TC-11-04            |
| 発見日       | 2026-03-18                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`check-ipc-contracts.ts` の `resolveChannelMap` は `IPC_CHANNELS` 定数オブジェクトのみを解決対象としている。しかし `CHAT_EDIT_CHANNELS` 等、`IPC_CHANNELS` 以外の定数オブジェクトを経由して登録されるチャンネルが存在し、これらのチャンネル名が解決されないため偽陽性の原因となる。

### 1.2 問題点・課題

- `CHAT_EDIT_CHANNELS` 等の定数オブジェクトを参照するハンドラが、チャンネル名解決に失敗し「未解決」として扱われる
- 将来新たな定数オブジェクトが追加された場合、スクリプト本体を毎回修正する必要があり拡張性が低い

### 1.3 放置した場合の影響

- `CHAT_EDIT_CHANNELS` 経由のチャンネルが偽陽性として継続報告される
- 定数オブジェクト追加のたびにスクリプト修正が発生し、メンテナンスコストが増加する

---

## 2. 何を達成するか（What）

### 2.1 目的

`resolveChannelMap` を複数の定数オブジェクトに対応させ、`IPC_CHANNELS` 以外の定数（`CHAT_EDIT_CHANNELS` 等）からもチャンネル名を解決できるようにする。

### 2.2 最終ゴール

`CHAT_EDIT_CHANNELS` 等の定数オブジェクトのチャンネル名が正しく解決され、偽陽性が 0 件になること。また、新規定数オブジェクト追加時にスクリプト本体の修正が不要な設計になっていること。

### 2.3 スコープ

#### 含むもの

- `resolveChannelMap` の複数定数オブジェクト対応
- `CHAT_EDIT_CHANNELS` を対象とした単体テスト追加
- 拡張容易な設計（設定ファイルまたは自動スキャン）

#### 含まないもの

- タプル配列パターンの抽出（UT-TASK06-007-EXT-001 のスコープ）
- `ipcMain.on` / `safeOn` の照合強化（UT-TASK06-007-EXT-003 のスコープ）

### 2.4 成果物

- `check-ipc-contracts.ts` の `resolveChannelMap` 修正
- 追加単体テスト（`CHAT_EDIT_CHANNELS` パターン）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-TASK06-007 が完了済みであること
- `pnpm --filter @repo/desktop test` が全件 PASS していること

### 3.2 依存タスク

- UT-TASK06-007（完了済み）
- UT-TASK06-007-EXT-001（先行推奨、ただし依存関係なし）

### 3.3 必要な知識

- TypeScript 定数オブジェクトのパターン（`const CHAT_EDIT_CHANNELS = { ... }` 形式）
- 正規表現または AST を使ったソースコード解析
- Vitest を用いた単体テストの記述方法

### 3.4 推奨アプローチ

**オプション A: 定数オブジェクト名リストを設定として外出し**

- `CHANNEL_CONST_NAMES = ["IPC_CHANNELS", "CHAT_EDIT_CHANNELS", ...]` をスクリプトの設定値として定義
- 新規追加時はリストに名前を追記するだけでよい

**オプション B: 定数オブジェクトを自動検出**

- `const XXX_CHANNELS = {` パターンをソースからスキャンして自動収集
- 追加修正不要だが、誤検知の可能性あり

優先度が低いため、実装コストの低いオプション A を推奨する。

---

## 4. 実行手順

### Phase 構成

Phase 1: 調査 → Phase 2: 実装 → Phase 3: テスト追加 → Phase 4: 品質検証

### Phase 1: 調査

#### 目的

`IPC_CHANNELS` 以外の定数オブジェクトの使用箇所を特定する。

#### 手順

1. `grep -rn "CHAT_EDIT_CHANNELS\|_CHANNELS\s*=" apps/desktop/src/ --include="*.ts"` で定数オブジェクトの定義を収集する
2. `check-ipc-contracts.ts` の `resolveChannelMap` 実装を読み、現在の解決ロジックを確認する
3. 対応すべき定数オブジェクト名の一覧を作成する

#### 成果物

対応すべき定数オブジェクト名の一覧

#### 完了条件

- `IPC_CHANNELS` 以外で使用されている定数オブジェクトが全て特定されている

### Phase 2: 実装

#### 目的

`resolveChannelMap` を複数定数オブジェクトに対応させる。

#### 手順

1. 設定リスト（オプション A）またはスキャン（オプション B）で複数定数オブジェクトを解決できるよう修正する
2. `pnpm --filter @repo/desktop typecheck` でコンパイルエラーがないことを確認する

#### 成果物

`check-ipc-contracts.ts` の修正差分

#### 完了条件

- TypeScript コンパイルエラーが 0 件
- `CHAT_EDIT_CHANNELS` のチャンネル名が正しく解決される

### Phase 3: テスト追加

#### 目的

複数定数オブジェクト解決の単体テストを追加する。

#### 手順

1. `CHAT_EDIT_CHANNELS` フィクスチャで `resolveChannelMap` が正しく解決できることをアサートする
2. 既存テストが全件 PASS することを確認する

#### 成果物

追加テストコード

#### 完了条件

- 既存テスト全件 PASS
- 新規テストが PASS

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

- Lint エラー 0 件・型エラー 0 件・テスト全件 PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `CHAT_EDIT_CHANNELS` 定数のチャンネル名が解決される
- [ ] 新規定数オブジェクト追加時の拡張が容易（設定追記またはゼロ修正）

### 品質要件

- [ ] 既存テストが回帰しない
- [ ] `CHAT_EDIT_CHANNELS` を対象とした新規テストが追加されている
- [ ] Lint・型チェックが全件 PASS

### ドキュメント要件

- [ ] Phase 12 完了時に `ipc-contract-checklist.md` の将来拡張セクションを「対応済み」に更新する

---

## 6. 検証方法

### テストケース

1. `CHAT_EDIT_CHANNELS = { FOO: "chat:foo" }` フィクスチャに対して `resolveChannelMap` が `{ FOO: "chat:foo" }` を返すこと
2. `IPC_CHANNELS` 解決が引き続き動作すること
3. 存在しない定数名を渡した場合に空オブジェクトを返すこと

### 検証手順

```bash
# 1. テスト実行
pnpm --filter @repo/desktop test -- --grep "resolveChannelMap"

# 2. スクリプト実行して解決数を確認
node apps/desktop/scripts/check-ipc-contracts.ts 2>&1 | grep -E "解決|resolved|channels"

# 3. 全テスト実行
pnpm --filter @repo/desktop test
```

---

## 7. リスクと対策

| リスク                                    | 影響度 | 発生確率 | 対策                                                 |
| ----------------------------------------- | ------ | -------- | ---------------------------------------------------- |
| 自動スキャン方式で非 IPC 定数を誤検知する | 低     | 中       | オプション A（明示リスト）を採用し、誤検知を回避する |
| 既存テストの回帰                          | 高     | 低       | Phase 4 で全テスト実行を必須とする                   |
| 対応すべき定数オブジェクトの見落とし      | 低     | 中       | Phase 1 の grep を複数パターンで実施し、漏れを防ぐ   |

---

## 8. 参照情報

### 関連ドキュメント

- [`ipc-contract-checklist.md` 将来拡張セクション](../../../.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md)
- [`task-workflow-backlog.md`](../../../.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md)
- 関連既知の落とし穴: [P44](../../../.claude/rules/06-known-pitfalls.md#p44), [P45](../../../.claude/rules/06-known-pitfalls.md#p45)

### 参考資料

- 親タスク: `docs/30-workflows/UT-TASK06-007-ipc-contract-drift-auto-detect/`
- 先行タスク: `docs/30-workflows/unassigned-task/UT-TASK06-007-EXT-001-tuple-array-handler-extraction.md`

---

## 10. 実装時の苦戦ポイント（親タスク UT-TASK06-007 から抽出）

以下は親タスク UT-TASK06-007 の実装過程で遭遇した苦戦ポイントであり、本タスクの実装時に同様の課題に直面する可能性が高い。

### 10.1 定数オブジェクトの命名パターンの多様性

**問題**: `IPC_CHANNELS` は `const IPC_CHANNELS = { KEY: "value" }` の単純な形式だが、`CHAT_EDIT_CHANNELS` 等は異なるファイルに定義されている場合があり、export形式（named export / default export）も異なる可能性がある。`resolveChannelMap` の正規表現 `CHANNEL_CONST_PATTERN = /^\s*([A-Z_]+)\s*:\s*['"]([^'"]+)['"]/gm` が全パターンに適用できるか事前検証が必要。

**教訓**: 正規表現を汎用化する前に `grep -rn "_CHANNELS\s*=" apps/desktop/src/ --include="*.ts"` で全定数オブジェクトの実パターンを収集し、正規表現の適用範囲を確認すること。

**対策**: Phase 1（調査）で全定数オブジェクトの形式を網羅的にリストアップし、正規表現パターンのテストフィクスチャを先に作成する。

### 10.2 チャンネル名解決のカスケード処理

**問題**: `resolveChannel` 関数は `IPC_CHANNELS.XXX` 形式の参照を実チャンネル名に解決するが、複数定数オブジェクト対応では `CHAT_EDIT_CHANNELS.YYY` も解決対象に含める必要がある。チャンネルマップが複数存在するため、解決順序（優先順位）の設計が必要。

**教訓**: 同名キーが複数定数オブジェクトに存在する場合の衝突処理を明確にすること。`Map<prefix.key, channelValue>` の形式で一意性を保証する設計が安全。

**対策**: `resolveChannelMap` の戻り値を `Map<string, string>` から `Map<string, { value: string, source: string }>` に拡張し、ソース情報を保持する。

### 10.3 worktree環境でのesbuildプラットフォーム不一致（P7亜種）

**問題**: worktree環境では `node_modules` がシンボリックリンクで共有されるため、`vitest run` 実行時に `esbuild-darwin-arm64` の解決に失敗する場合がある。

**教訓**: テスト実行は `pnpm tsx` 経由の直接実行を第一手段とする。`vitest` を使う場合は `--pool=forks` オプションを付与する。

**対策**: テスト追加時は `pnpm tsx apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` での実行を先に確認すること。

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
UT-TASK06-007 Phase 11 TC-11-04:
CHAT_EDIT_CHANNELS 等 IPC_CHANNELS 以外の定数オブジェクトのチャンネル名が未解決のまま残存。
resolveChannelMap を複数定数オブジェクトに対応させる必要がある。
```

### 補足事項

- タプル配列パターンの抽出は UT-TASK06-007-EXT-001 のスコープ
- `ipcMain.on` / `safeOn` の照合精度向上は UT-TASK06-007-EXT-003 のスコープ
