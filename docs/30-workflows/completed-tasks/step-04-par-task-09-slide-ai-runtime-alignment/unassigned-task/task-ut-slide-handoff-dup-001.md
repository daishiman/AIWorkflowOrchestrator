# HandoffGuidance 重複定義解消 - タスク指示書

## メタ情報

```yaml
issue_number: 1362
```

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | UT-SLIDE-HANDOFF-DUP-001                                  |
| タスク名     | HandoffGuidance 重複定義解消                              |
| 分類         | リファクタリング                                          |
| 対象機能     | slide-ai-runtime-alignment                                |
| 優先度       | 低                                                        |
| 見積もり規模 | 小規模                                                    |
| ステータス   | 未実施                                                    |
| 発見元       | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 Phase 11 発見事項 |
| 発見日       | 2026-03-19                                                |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

slide handoff を UI へ横展開する前提として、`HandoffGuidance` の共通型を 1 箇所へ寄せておく必要がある。

### 1.2 問題点・課題

- `HandoffBlock.tsx` にローカル `HandoffGuidance` 定義が残っている
- shared 正本型との drift が将来的に起きうる

### 1.3 放置した場合の影響

- slide handoff UI 実装時に型定義が二重化する
- guidance copy やフィールド追加の横展開コストが上がる

## 2. 何を達成するか（What）

### 2.1 目的

`HandoffGuidance` を shared 正本型へ統一する。

### 2.2 最終ゴール

- ローカル重複定義が消える
- import 元が shared 型へ一本化される

### 2.3 スコープ

#### 含むもの

- `HandoffBlock.tsx` の型 import 修正
- 関連テスト更新

#### 含まないもの

- slide runtime 実装本体
- UI レイアウト改修

### 2.4 成果物

- 型定義の一本化差分

## 3. どのように実行するか（How）

### 3.1 前提条件

- shared 側の `HandoffGuidance` 正本が確定していること

### 3.2 依存タスク

- UT-SLIDE-IMPL-001（推奨）

### 3.3 必要な知識

- shared type import
- renderer component typing

### 3.4 推奨アプローチ

- 先に正本型の import path を固定し、ローカル interface を削除する

## 4. 実行手順

1. `HandoffBlock.tsx` のローカル interface を削除する。
2. shared 正本型を import する。
3. 型エラーと関連テストを確認する。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `HandoffGuidance` のローカル重複定義が消えている
- [ ] shared 正本型の import に統一されている

### 品質要件

- [ ] 型エラーがない
- [ ] related test が通る

### ドキュメント要件

- [ ] `interfaces-agent-sdk-skill-advanced.md` の責務境界と矛盾しない

## 6. 検証方法

1. typecheck を実行する。
2. related component test を実行する。

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                    |
| ------------------------------ | ------ | -------- | --------------------------------------- |
| shared 型の import path を誤る | 低     | 中       | 既存の handoff 利用箇所を先に grep する |
| 実装中の型変更と衝突する       | 低     | 中       | UT-SLIDE-IMPL-001 後に実施する          |

## 8. 参照情報

- `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`
- `packages/shared/src/types/handoff.ts`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md` — HandoffGuidance 正本型定義
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-advanced.md` — modifier/handoff 責務境界
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md` — Task09 教訓

## 9. 備考

単独では小さいが、slide handoff を user-facing にする前に片付けておくと後続の drift を減らせる。

## 10. 苦戦箇所・実装上の注意点（教訓）

### 10.1 HandoffGuidance ローカル定義の発見

Phase 11（設計文書ウォークスルー）の TC-11-02（型定義整合確認）で、HandoffBlock.tsx 内に HandoffGuidance のローカル定義が存在することを発見した。grep で型名を横断検索したことで検出できた。

**教訓**: 型定義の整合確認では `grep -rn "interface TypeName\|type TypeName" apps/ packages/` で定義箇所を全て列挙し、2箇所以上あれば重複として記録する。

### 10.2 shared 型への統一パターン

HandoffGuidance は `packages/shared/src/types/handoff.ts` に正本型があり、`apps/desktop/src/renderer/components/chat/HandoffBlock.tsx` にローカル重複がある。共通パターンとして、正本型の import パスを先に固定してからローカル interface を削除する。

**教訓**: 型の二重定義解消は P23/P32（型定義の二箇所同時更新必須）のリスクそのもの。正本を `@repo/shared` に一本化し、ローカル定義を削除する手順を標準化する。

### 10.3 正本仕様書の HandoffGuidance 定義

api-ipc-agent-core.md に HandoffGuidance の正本型が定義されている:

- `terminalCommand: string` — Claude Code で実行するコマンド例
- `contextSummary: string` — ファイル名・行範囲・コマンドタイプの要約
- `reason: string` — handoff になった理由

この3フィールドは chat-edit 系と slide 系で共通であり、shared 型として一本化する根拠になる。
