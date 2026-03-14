# IPC Handoff 応答 Envelope 統一 - タスク指示書

## メタ情報

```yaml
issue_number: 1237
```

## メタ情報

| 項目         | 内容                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-IPC-HANDOFF-ENVELOPE-CONSISTENCY-001                                         |
| タスク名     | skill:execute と agent:start の handoff 応答 envelope 統一                          |
| 分類         | 改善                                                                                |
| 対象機能     | IPC handoff 応答契約                                                                |
| 優先度       | 低                                                                                  |
| 見積もり規模 | 小規模                                                                              |
| ステータス   | 未実施                                                                              |
| 発見元       | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001（Phase 10 最終レビュー） |
| 発見日       | 2026-03-15                                                                          |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 で `skill:execute` と `agent:start` に runtime routing / handoff 分岐を追加した。両チャンネルで同じ `RuntimeResolver.resolve()` を使用するが、handoff 時の応答形式が異なる。

### 1.2 問題点・課題

- `skill:execute` の handoff 応答: `{ success: true, data: { success: false, handoff: true, guidance, error } }` — IPC envelope を維持
- `agent:start` の handoff 応答: `{ success: false, handoff: true, guidance, error }` — 直接応答
- 同じ概念（handoff）の応答が2つの異なるパターンで存在するため、Renderer 側での処理分岐が複雑化する
- Linter の自動修正が応答型の差異に反応し、テストアサーションを予期せず変更する（苦戦箇所5）

### 1.3 放置した場合の影響

- 新規チャンネルに handoff を追加する際、どちらのパターンに従うか判断が必要
- Renderer 側の handoff 処理ロジックが2つのパターンに分岐
- テストの保守性低下

## 2. 何を達成するか（What）

### 2.1 目的

handoff 応答の envelope 形式を統一し、Renderer 側の処理を単一パターンに収束させる。

### 2.2 最終ゴール

- handoff 応答が全チャンネルで同一形式
- Renderer 側の handoff 判定ロジックが1箇所に集約

### 2.3 スコープ

#### 含むもの

- `skill:execute` と `agent:start` の handoff 応答形式統一
- Renderer 側の handoff 処理ロジック統一
- テストの更新

#### 含まないもの

- RuntimeResolver の判定ロジック変更
- TerminalHandoffCard の UI 変更
- integrated パスの変更

### 2.4 成果物

- 統一された handoff 応答型定義
- 更新済み IPC ハンドラ
- 更新済みテスト

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 が完了済み

### 3.2 依存タスク

- UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001（完了）

### 3.3 必要な知識

- IPC envelope パターン（`safeInvoke` / `safeInvokeUnwrap` の違い）
- Preload API の応答処理

### 3.4 推奨アプローチ

1. `agent:start` の応答を `skill:execute` と同じ envelope 形式に統一するか、逆に両方を直接応答にするか判断
2. Preload 側の `safeInvoke` / `safeInvokeUnwrap` の使い分けを確認し、整合する形式を選択
3. P23（API 二重定義の型管理）を回避するため、handoff 応答型を `packages/shared` に定義

### 3.5 苦戦箇所（親タスク由来）

| 苦戦箇所                                                   | 再発条件                                               | 対処                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| skill:execute は IPC envelope 維持、agent:start は直接応答 | 既存の応答パターンを踏襲して新機能を追加               | 事前に全チャンネルの応答パターンを調査し、統一方針を決定 |
| Linter 自動修正がテストアサーションを変更                  | IPC envelope と直接応答の混在で型推論が揺れる          | 統一後は単一パターンのため Linter 干渉が減少             |
| Preload の safeInvokeUnwrap が envelope を剥がす           | skill API は safeInvokeUnwrap、agent API は safeInvoke | 統一時に Preload 側のアンラップ処理も合わせて確認        |

## 4. 実行手順

### Phase 1: 現状分析

#### 目的

全 handoff 対応チャンネルの応答パターンを一覧化する。

#### 手順

1. `grep -rn "handoff" apps/desktop/src/main/ipc/` で全 handoff 箇所を特定
2. 各チャンネルの応答形式を表にまとめる
3. Preload 側のアンラップ処理を確認

#### 成果物

handoff 応答パターン一覧表。

#### 完了条件

全チャンネルの応答形式が文書化されている。

### Phase 2: 統一方針決定

#### 目的

統一先のパターンを決定する。

#### 手順

1. envelope 維持 vs 直接応答のトレードオフを評価
2. Preload 側の互換性を考慮
3. 統一パターンを決定

#### 成果物

統一方針ドキュメント。

#### 完了条件

統一パターンが決定されている。

### Phase 3: 実装・テスト

#### 目的

統一パターンを実装する。

#### 手順

1. IPC ハンドラの応答形式を統一
2. Preload API のアンラップ処理を更新
3. テストを統一パターンに合わせて更新

#### 成果物

更新済みハンドラ、Preload API、テスト。

#### 完了条件

全テストが PASS。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] handoff 応答が全チャンネルで同一形式
- [ ] Renderer 側の handoff 判定ロジックが1箇所

### 品質要件

- [ ] 既存テストが全件 PASS
- [ ] handoff 応答の型定義が `packages/shared` に存在

### ドキュメント要件

- [ ] `interfaces-agent-sdk-executor-details.md` の handoff 契約が更新されている
- [ ] `arch-electron-services-details.md` の RuntimeResolver セクションが更新されている

## 6. 検証方法

### テストケース

- `skillHandlers.runtime.test.ts` の handoff テストが統一パターンで PASS
- `agentHandlers.runtime.test.ts` の handoff テストが統一パターンで PASS
- Renderer 側の handoff 処理が正常動作

### 検証手順

1. `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/*runtime*`
2. handoff 応答の型定義が統一されていることを型チェックで確認

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                 |
| -------------------------------------------------- | ------ | -------- | ---------------------------------------------------- |
| 既存の Renderer 側 handoff 処理が壊れる            | 中     | 中       | 型定義の変更を先に行い、コンパイルエラーで漏れを検出 |
| safeInvokeUnwrap の挙動変更で非 handoff パスに影響 | 中     | 低       | handoff 判定を envelope 内部で行い、外側の構造は維持 |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` — Runtime routing / handoff 応答契約
- `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details.md` — RuntimeResolver セクション
- `.claude/rules/06-known-pitfalls.md` — P23, P44, P45

### 参考資料

- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/main/ipc/agentHandlers.ts`
- `apps/desktop/src/preload/skill-api.ts`

## 9. 備考

### 発見経緯

Phase 10 最終レビューで `skill:execute` と `agent:start` の handoff 応答形式の不統一を検出。機能影響はないが、保守性と一貫性の観点から統一が望ましいと判定した。

### 補足事項

本タスクは IPC 応答形式の統一に限定し、RuntimeResolver の判定ロジックや TerminalHandoffCard の UI は変更しない。
