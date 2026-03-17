# SkillStreamMessageType に abort/skip type 追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1293
```

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | UT-06-005-C                                    |
| タスク名     | SkillStreamMessageType に abort/skip type 追加 |
| 分類         | 実装                                           |
| 対象機能     | Skill Streaming Protocol                       |
| 優先度       | 中                                             |
| 見積もり規模 | 小規模                                         |
| ステータス   | 未実施                                         |
| 発見元       | UT-06-005 Phase 12 未タスク検出（GAP-06）      |
| 発見日       | 2026-03-17                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-06-005 で abort/skip フォールバックフロー（Permission 拒否時の動作分岐）を実装した。しかし、その際にストリーミングメッセージ型の拡張が未実施のまま残された。現状では abort 発生時は `type:"error"` で、skip 発生時は `type:"tool_use"` で Renderer にストリームメッセージが送信されており、Renderer 側で abort/skip を通常のエラー・ツール使用結果と明確に区別する手段がない。

### 1.2 問題点・課題

1. **abort と通常エラーを Renderer が区別できない**: 両方とも `type:"error"` で送信されるため、abort 専用の UI 表示（操作中断の通知など）が実装できない
2. **skip と通常のツール使用結果を Renderer が区別できない**: 両方とも `type:"tool_use"` で送信されるため、skip 専用の UI 表示（スキップ通知など）が実装できない
3. **`SkillStreamMessageType` に `"abort"` | `"skip"` が未定義**: `packages/shared/src/types/skill.ts` の型定義が実態と乖離している
4. **GAP-01 残存**: shared 型と SkillExecutor ローカル型の `sendStream` 引数型に不整合があり、型安全性が損なわれている

### 1.3 放置した場合の影響

- Renderer 側で abort と通常エラーを区別できないため、abort 時に誤ったエラーメッセージが表示される
- skip と通常のツール使用結果を区別できないため、skip 発生時に専用の通知を出せない
- `sendStream` の型不整合（GAP-01）が蓄積し、将来の型安全性改修コストが増大する
- ストリーミングプロトコルの仕様書と実装が乖離したまま保守されることになる

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillStreamMessageType` に `"abort"` と `"skip"` を追加し、Renderer 側が abort/skip を明確に識別できるストリーミングプロトコルを確立する。また `sendStream` の引数型を shared 型に統一して GAP-01 を解消する。

### 2.2 最終ゴール

- `SkillStreamMessageType` に `"abort"` | `"skip"` が追加されている
- `SkillExecutor` の `sendStream` が shared 型を使用している
- Renderer 側の switch/case に `"abort"` / `"skip"` ケースが追加されている
- 関連するすべてのテストが PASS している

### 2.3 スコープ

#### 含むもの

- `packages/shared/src/types/skill.ts` の `SkillStreamMessageType` 型拡張
- `apps/desktop/src/main/services/skill/SkillExecutor.ts` の `sendStream` 型統一と abort/skip type 使用
- Renderer 側ストリーム処理（switch/case）への `"abort"` / `"skip"` ケース追加
- 関連するテストファイルの更新・追加

#### 含まないもの

- abort/skip のフォールバックロジック本体（UT-06-005 で実装済み）
- Permission ダイアログ UI の変更
- 新規フォールバック方式の追加

### 2.4 成果物

- `packages/shared/src/types/skill.ts`（`SkillStreamMessageType` に `"abort"` | `"skip"` 追加）
- `apps/desktop/src/main/services/skill/SkillExecutor.ts`（`sendStream` 型統一 + abort/skip type 使用箇所の修正）
- Renderer 側ストリーム処理ファイル（`"abort"` / `"skip"` ケース追加）
- テストファイル（型拡張・Renderer ストリーム処理のテスト）

---

## 3. どう実装するか（How）

### 3.1 実装方針

#### Step 1: GAP-01 解消 — sendStream 型統一

まず `SkillExecutor` 内で定義されているローカル型を確認し、`packages/shared/src/types/skill.ts` の `SkillStreamMessageType` と不整合がある箇所を特定する。shared 型を正として SkillExecutor のローカル型を削除し、shared 型をインポートするよう変更する。

```bash
# 不整合箇所の調査コマンド
grep -rn "sendStream\|SkillStreamMessageType" apps/desktop/src/main/services/skill/
grep -rn "SkillStreamMessageType" packages/shared/src/types/
```

#### Step 2: SkillStreamMessageType 拡張

```typescript
// packages/shared/src/types/skill.ts（修正後）
export type SkillStreamMessageType =
  | "text"
  | "tool_use"
  | "tool_result"
  | "error"
  | "done"
  | "abort" // 追加: Permission 拒否によるスキル実行中断
  | "skip"; // 追加: Permission 拒否によるツール呼び出しスキップ
```

#### Step 3: SkillExecutor の abort/skip 送信箇所を修正

abort 発生時は `type:"error"` ではなく `type:"abort"` を、skip 発生時は `type:"tool_use"` ではなく `type:"skip"` を使用するよう修正する。

#### Step 4: Renderer 側の switch/case 追加

Renderer 側でストリームメッセージを処理している箇所に `"abort"` / `"skip"` ケースを追加する。

```bash
# Renderer 側の影響箇所調査
grep -rn "SkillStreamMessageType\|type.*error\|type.*tool_use\|streamMessage\|onStream" \
  apps/desktop/src/renderer/
```

### 3.2 苦戦箇所・注意点（前回の教訓）

- **P32（型定義の二箇所同時更新必須）**: `packages/shared/src/types/skill.ts` の `SkillStreamMessageType` を変更した場合、`apps/desktop/src/preload/types.ts` に同型の再定義や参照がある場合は同時に更新すること。片方だけ更新すると型不整合によるコンパイルエラーが発生する

- **P44/P45（IPC インターフェース不整合）**: `sendStream` の引数型が SkillExecutor のローカル型で定義されている場合、shared 型への統一作業と型拡張を分離して実施する。統一を先に行うことで、型拡張時の影響範囲が明確になる

- **P9（モジュールスコープ変数のテスト間リーク）**: `SkillStreamMessageType` を使用したテストでは `beforeEach` でモックをリセットし、テスト間の状態リークを防ぐこと

- **Renderer 側の網羅性確認**: switch/case に `"abort"` / `"skip"` を追加した際、TypeScript の網羅性チェック（`never` 型を使った exhaustive check）が実装されているか確認すること。未対応の type が Renderer に届いた場合の fallback 処理も記述すること

- **型変更後の typecheck 必須**: `pnpm --filter @repo/shared build` → `pnpm typecheck` の順で実行し、型変更の波及エラーを早期に発見すること

### 3.3 テスト方針

- **SkillStreamMessageType の型テスト**: 新たに追加した `"abort"` | `"skip"` が型として正しく機能することを型レベルで検証
- **SkillExecutor の sendStream テスト**: abort/skip フォールバック時に正しい type でストリームが送信されることを単体テストで検証
- **Renderer ストリーム処理テスト**: `"abort"` / `"skip"` ケースが正しく処理されることを単体テストで検証

---

## 4. 関連情報

### 4.1 関連タスク

| タスクID  | 関係性                                                  |
| --------- | ------------------------------------------------------- |
| UT-06-005 | 依存元（abort/skip フォールバック実装。本タスクの前提） |
| UT-06-003 | 関連（SafetyGate IPC 実装）                             |

### 4.2 関連仕様書

| 参照資料                        | パス                                                                                         | 内容                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------- |
| SkillStreamMessageType 仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md`    | ストリームメッセージ型定義            |
| Permission フォールバックフロー | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | abort/skip フォールバックの詳細フロー |

### 4.3 関連 Pitfall

| Pitfall ID | 内容                                           |
| ---------- | ---------------------------------------------- |
| P32        | 型定義の二箇所同時更新必須                     |
| P44        | IPC ハンドラとPreload のインターフェース不整合 |
| P45        | IPC 引数命名の契約ドリフト                     |
| P9         | モジュールスコープ変数のテスト間リーク         |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SkillStreamMessageType` に `"abort"` | `"skip"` が追加されていること
- [ ] abort フォールバック時に `type:"abort"` でストリームメッセージが送信されること
- [ ] skip フォールバック時に `type:"skip"` でストリームメッセージが送信されること
- [ ] Renderer 側の switch/case に `"abort"` / `"skip"` ケースが追加されていること
- [ ] GAP-01（sendStream 型不整合）が解消されていること

### 品質要件

- [ ] 新規テストが全件パスすること
- [ ] 既存テスト（`SkillExecutor.*.test.ts` 全件）がパスすること
- [ ] `pnpm --filter @repo/shared build` が成功すること
- [ ] `pnpm --filter @repo/desktop typecheck` が通ること
- [ ] `pnpm --filter @repo/desktop lint` が通ること

### ドキュメント要件

- [ ] Phase 12 完了時に `interfaces-agent-sdk-skill-details.md` に実装完了を記録すること
- [ ] Phase 12 完了時に LOGS.md（2ファイル）を更新すること
