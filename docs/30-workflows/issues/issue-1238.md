# [#1238] "[UT-IMP-RUNTIME-RESOLVER-CHATEDIT-INTEGRATION-TEST-001] ChatEditRuntimeResolver パスの統合テスト追加"

## メタ情報

```yaml
task_id: UT-IMP-RUNTIME-RESOLVER-CHATEDIT-INTEGRATION-TEST-001
task_name: ChatEditRuntimeResolver パスの統合テスト追加
category: 品質改善
target_feature: Workspace Chat Edit の runtime routing
priority: 低
scale: 小規模
status: 未実施
source_phase: UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001（Phase 10 最終レビュー）
created_date: 2026-03-15
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-runtime-resolver-chatedit-integration-test-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 で `RuntimeResolver` を共通化し、`skill:execute` と `agent:start` には統合テスト（`skillHandlers.runtime.test.ts` / `agentHandlers.runtime.test.ts`）を追加した。しかし、`ChatEditRuntimeResolver`（`services/chat-edit/RuntimeResolver.ts`）のパスには同等の統合テストが存在しない。

### 1.2 問題点・課題

- `ChatEditRuntimeResolver` は `RuntimeResolver` の alias import だが、chat-edit 固有の LLMAdapter 生成ロジックを含む
- chat-edit ハンドラの handoff 分岐が統合テストでカバーされていない
- `ipc/index.ts` の Composition Root で `ChatEditRuntimeResolver` のインスタンスが正しく生成・注入されているかの検証が不足

### 1.3 放置した場合の影響

- chat-edit の handoff パスに回帰が発生しても検出が遅れる
- skill/agent は統合テスト済みだが chat-edit だけカバレッジが低い状態
- RuntimeResolver の共通化リファクタリング時に chat-edit パスの動作保証が困難

## 2. 何を達成するか（What）

### 2.1 目的

`ChatEditRuntimeResolver` を使用する chat-edit ハンドラの runtime routing 統合テストを追加する。

### 2.2 最終ゴール

- `chatEditHandlers.runtime.test.ts` で integrated/handoff の両パスが検証済み
- 後方互換テスト（RuntimeResolver 未注入時）も含む

### 2.3 スコープ

#### 含むもの

- `chatEditHandlers.runtime.test.ts` の新規作成
- integrated パス: ChatEditRuntimeResolver が integrated を返す → 既存 chat-edit フロー続行
- handoff パス: ChatEditRuntimeResolver が handoff を返す → HandoffGuidance 応答
- 後方互換パス: RuntimeResolver 未注入 → 既存フロー

#### 含まないもの

- ChatEditRuntimeResolver の実装変更
- chat-edit UI の変更
- LLMAdapter の生成ロジック変更

### 2.4 成果物

- `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.runtime.test.ts`
- テスト3件（integrated / handoff / 後方互換）

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 が完了済み
- TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 が完了済み

### 3.2 依存タスク

- UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001（完了）
- TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001（完了）

### 3.3 必要な知識

- ChatEditRuntimeResolver と RuntimeResolver の関係
- chat-edit IPC ハンドラの構造
- Vitest のモック設計（vi.mock パターン）

### 3.4 推奨アプローチ

1. `skillHandlers.runtime.test.ts` をテンプレートとして使用
2. ChatEditRuntimeResolver の mock を設定
3. chat-edit 固有のレスポンス構造に合わせてアサーションを調整
4. P40（テスト実行ディレクトリ依存）に注意し、`cd apps/desktop` から実行

### 3.5 苦戦箇所（親タスク由来）

| 苦戦箇所                                                     | 再発条件                               | 対処                                                                   |
| ------------------------------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------- |
| ChatEditRuntimeResolver の alias import でモック設定が複雑化 | 同名クラスの alias import をモックする | vi.mock のパスを `../../services/chat-edit/RuntimeResolver` に合わせる |
| chat-edit ハンドラの引数構造が skill/agent と異なる          | テンプレートコピペで引数を合わせ忘れ   | chatEditHandlers の registerChatEditHandlers シグネチャを先に確認      |
| P40 テスト実行ディレクトリ依存                               | プロジェクトルートから vitest 実行     | `cd apps/desktop && pnpm vitest run` で実行                            |

## 4. 実行手順

### Phase 1: テンプレート作成

#### 目的

skillHandlers.runtime.test.ts をベースにテストファイルを作成する。

#### 手順

1. `skillHandlers.runtime.test.ts` をコピー
2. import パスを chatEditHandlers に変更
3. ChatEditRuntimeResolver の mock を設定
4. チャンネル名を chat-edit 系に変更

#### 成果物

テストファイルの骨格。

#### 完了条件

コンパイルが通る状態。

### Phase 2: テストケース実装

#### 目的

3つのテストケースを実装する。

#### 手順

1. integrated テスト: resolve() が `{ type: "integrated" }` → 既存フロー
2. handoff テスト: resolve() が `{ type: "handoff", reason: "..." }` → HandoffGuidance
3. 後方互換テスト: RuntimeResolver 未注入 → 既存フロー

#### 成果物

3テストケースが PASS するテストファイル。

#### 完了条件

全3テストが PASS。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] integrated パスのテストが PASS
- [ ] handoff パスのテストが PASS
- [ ] 後方互換パスのテストが PASS

### 品質要件

- [ ] 既存テストに影響がない
- [ ] テスト実行が 5秒以内

### ドキュメント要件

- [ ] テスト数が `interfaces-agent-sdk-executor-details.md` に記載されている

## 6. 検証方法

### テストケース

- `chatEditHandlers.runtime.test.ts` 全3件実行 → PASS

### 検証手順

1. `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/chatEditHandlers.runtime.test.ts`
2. 全件 PASS を確認

## 7. リスクと対策

| リスク                                    | 影響度 | 発生確率 | 対策                                 |
| ----------------------------------------- | ------ | -------- | ------------------------------------ |
| chatEditHandlers の内部構造が想定と異なる | 中     | 低       | 先に Read で構造を確認               |
| ChatEditRuntimeResolver の mock が複雑    | 低     | 中       | skillHandlers テストのパターンを踏襲 |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` — Runtime routing 契約
- `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details.md` — RuntimeResolver セクション
- `docs/30-workflows/runtime-routing-integration-closure/outputs/phase-4/test-design.md`

### 参考資料

- `apps/desktop/src/main/ipc/__tests__/skillHandlers.runtime.test.ts` — テンプレート
- `apps/desktop/src/main/ipc/__tests__/agentHandlers.runtime.test.ts` — テンプレート
- `apps/desktop/src/main/ipc/chatEditHandlers.ts` — テスト対象
- `apps/desktop/src/main/services/chat-edit/RuntimeResolver.ts` — ChatEditRuntimeResolver

## 9. 備考

### 発見経緯

Phase 10 最終レビューで skill/agent の統合テストは存在するが chat-edit パスの統合テストが不足していることを検出。機能影響はないが、3チャンネル統一のカバレッジ観点から追加が望ましいと判定した。

### 補足事項

本タスクはテスト追加に限定し、ChatEditRuntimeResolver や chat-edit ハンドラの実装変更は含まない。
