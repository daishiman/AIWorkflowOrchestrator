# Phase 8: リファクタリング

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | UT-RUNTIME-BUILDER-MIGRATION-001 |
| Phase    | 8（リファクタリング）            |
| 前提     | Phase 7 カバレッジ確認 完了      |
| 作成日   | 2026-03-23                       |

---

## 1. 目的

コードの機能は変更せず、可読性向上・重複排除のみを目的としてリファクタリングを実施する。機能追加は禁止。

---

## 参照資料

| 参照資料               | パス                                                              |
| ---------------------- | ----------------------------------------------------------------- |
| Phase 7 カバレッジ確認 | `docs/30-workflows/runtime-builder-migration/phase-7-coverage.md` |
| Phase 2 設計書         | `docs/30-workflows/runtime-builder-migration/phase-2-design.md`   |

---

## 2. リファクタリング対象の検討

### 2.1 buildForSurface() 内の surfaceType 別ロジック分離

**検討ポイント**: `buildForSurface()` 内の surfaceType 別ロジックが private メソッドに適切に分離されているか。

| surfaceType  | 現状確認                                        | 対応方針                                             |
| ------------ | ----------------------------------------------- | ---------------------------------------------------- |
| `chat-edit`  | インライン実装か private メソッド委譲か確認する | 複雑度が高い場合は `_buildForChatEdit()` に抽出する  |
| `runtime`    | agent と skill の分岐が明確か確認する           | 複雑度が高い場合は `_buildForRuntime()` に抽出する   |
| `skill-docs` | インライン実装か private メソッド委譲か確認する | 複雑度が高い場合は `_buildForSkillDocs()` に抽出する |

**基準**: 各 surfaceType の処理が 10 行を超える場合は private メソッドに抽出する。10 行以内であればインラインで十分。

**確認コマンド**:

```bash
grep -n "buildForSurface\|_buildFor\|case \"" \
  apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts
```

---

### 2.2 型定義の集約状況

**検討ポイント**: 型定義が1ファイルに集約されているか（分散していないか）。

| 型名                       | 期待配置場所                           | 確認方法                                                                   |
| -------------------------- | -------------------------------------- | -------------------------------------------------------------------------- |
| `BuildForSurfaceRequest`   | `runtime/TerminalHandoffBuilder.ts` 内 | `grep -rn "BuildForSurfaceRequest" apps/desktop/src/`                      |
| `HandoffGuidance`          | `packages/shared/src/types/handoff.ts` | `grep -rn "HandoffGuidance" packages/shared/src/`                          |
| `TerminalHandoffBundle`    | `runtime/TerminalHandoffBuilder.ts` 内 | `grep -rn "TerminalHandoffBundle" apps/desktop/src/main/services/runtime/` |
| `AgentHandoffBuildRequest` | `runtime/TerminalHandoffBuilder.ts` 内 | `grep -rn "AgentHandoffBuildRequest" apps/desktop/src/`                    |

**対応方針**:

- 同一ファイル内にしか使われない型は実装ファイル内に留める
- `packages/shared` に公開型は残す（`HandoffGuidance` 等）
- 型が複数ファイルに重複定義されている場合は1箇所に集約してインポートに統一する

**確認コマンド**:

```bash
grep -rn "type BuildForSurfaceRequest\|interface BuildForSurfaceRequest" \
  apps/desktop/src/
```

---

### 2.3 移行ブリッジパターンの適用（DRY 原則）

**検討ポイント**: 旧メソッド内で `buildForSurface()` を呼び出す「移行ブリッジ」パターンが適用可能か。

**現状の旧メソッド実装パターン（移行前）**:

```typescript
// 旧メソッドが独自実装を持つ場合（重複あり）
/** @deprecated buildForSurface() を使用してください */
buildForAgentExecution(request: AgentHandoffBuildRequest, reason: string): HandoffGuidance {
  // ← 独自実装（buildForSurface と重複する可能性）
}
```

**移行ブリッジパターン（DRY 準拠）**:

```typescript
// 旧メソッドが buildForSurface() に委譲する
/** @deprecated buildForSurface() を使用してください */
buildForAgentExecution(request: AgentHandoffBuildRequest, reason: string): HandoffGuidance {
  return this.buildForSurface(request, "runtime", reason);
}
```

**対応方針**:

- Phase 5 実装で旧メソッドが `buildForSurface()` に委譲済みであれば対応不要
- 独自実装が残っている場合は委譲パターンに変更する
- これにより旧メソッドのロジック重複を完全に排除できる

**確認コマンド**:

```bash
grep -A 5 "@deprecated" \
  apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts
```

---

### 2.4 extractPrompt() / buildContextSummary のロジック重複

**検討ポイント**: `extractPrompt()` と `buildContextSummary` 系メソッドのロジック重複がないか。

| メソッド                | 役割                                       | 重複リスク                                           |
| ----------------------- | ------------------------------------------ | ---------------------------------------------------- |
| `extractPrompt()`       | リクエストからプロンプトテキストを抽出する | surface 別に類似した抽出ロジックが複数存在するリスク |
| `buildContextSummary()` | surfaceType に応じた contextSummary を構築 | フォーマット文字列の組み立てロジックが重複するリスク |
| `sanitizePrompt()`      | API key 等の機密情報をマスクする           | 既存メソッドのため重複は発生しにくいが確認する       |

**対応方針**:

- 各 surface の `buildContextSummary` ロジックが共通部分を持つ場合、共通ヘルパーを抽出する
- `extractPrompt()` が surface 別に重複実装されている場合、discriminated union で統一する

**確認コマンド**:

```bash
grep -n "extractPrompt\|buildContextSummary\|contextSummary" \
  apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts
```

---

## 3. リファクタリング実施チェックリスト

| #   | 検討項目                                         | 状態 | 対応内容                         |
| --- | ------------------------------------------------ | ---- | -------------------------------- |
| 1   | buildForSurface() の private メソッド分離        | [ ]  | 10行超の場合のみ抽出             |
| 2   | 型定義の集約（重複・分散がないか）               | [ ]  | 重複型を1箇所に集約              |
| 3   | 旧メソッドの移行ブリッジパターン適用             | [ ]  | buildForSurface() への委譲に変更 |
| 4   | extractPrompt() / buildContextSummary の重複排除 | [ ]  | 共通ヘルパーを抽出               |
| 5   | 未使用 import の削除                             | [ ]  | ESLint で自動検出                |
| 6   | magic string の定数化                            | [ ]  | surfaceType 文字列を定数に       |

---

## 4. リファクタリング禁止事項

- **機能追加禁止**: 新しい surfaceType の追加、新しい引数の追加
- **インターフェース変更禁止**: `buildForSurface()` のシグネチャ変更
- **@deprecated 削除禁止**: Phase 12 完了まで旧メソッドの削除は行わない
- **テスト変更禁止**: 既存テストの期待値変更（リファクタリングによって動作が変わってはならない）

---

## 5. テスト回帰確認

リファクタリング後、必ず以下のテストが全件 PASS することを確認する。

```bash
# TerminalHandoffBuilder 単体テスト
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/TerminalHandoffBuilder.test.ts

# 関連テスト（呼び出し元の移行確認）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/agentHandlers.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/chatEditHandlers.test.ts

# 全テスト（回帰確認）
cd apps/desktop && pnpm vitest run
```

テストが1件でも FAIL した場合は、リファクタリング前の状態に戻してから原因を特定する。

---

## 6. 完了条件

- [ ] リファクタリング実施チェックリスト全項目が完了している
- [ ] `pnpm lint` が PASS している
- [ ] `pnpm typecheck` が PASS している
- [ ] TerminalHandoffBuilder.test.ts が全件 PASS している
- [ ] 全テストが回帰なく PASS している
- [ ] 機能追加・インターフェース変更が行われていないことを確認した

---

---

## 統合テスト連携

リファクタリング後、Phase 6 の統合テスト（C-1〜C-3, D-1）も回帰確認に含める。

---

## 多角的チェック観点

| 観点     | 確認内容                                          | 対応              |
| -------- | ------------------------------------------------- | ----------------- |
| 保守性   | private メソッド分離により可読性が向上しているか  | Section 2.1       |
| DRY 原則 | 旧メソッドが buildForSurface() に委譲されているか | Section 2.3       |
| 型安全性 | surfaceType の magic string が定数化されているか  | チェックリスト #6 |

---

## サブタスク管理

- [ ] buildForSurface() の private メソッド分離を検討・実施する
- [ ] 型定義の集約状況を確認する
- [ ] 旧メソッドの移行ブリッジパターンを適用する
- [ ] extractPrompt() / buildContextSummary の重複を排除する
- [ ] 未使用 import を削除する
- [ ] magic string を定数化する
- [ ] テスト回帰確認を実行する（全件 PASS）

## 次 Phase

Phase 9（品質検証）へ進む。
