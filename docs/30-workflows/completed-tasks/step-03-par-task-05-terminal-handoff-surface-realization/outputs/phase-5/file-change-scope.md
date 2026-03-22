# Phase 5 成果物: ファイル変更スコープ

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase      | 5                                                 |
| 成果物種別 | ファイル変更スコープ                              |
| 作成日     | 2026-03-22                                        |
| 依存成果物 | phase-5/implementation-plan.md                    |

---

## 1. 変更対象ファイル

### 1.1 packages/shared/src/types/handoff.ts

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| 変更種別     | 追加（新規エクスポート）                                 |
| 変更内容     | `toHandoffGuidance()` 関数を追加                         |
| 対応タスク   | Phase 5 タスク 1 (MN-1 対応)                             |
| 対応テスト   | UT-A-1〜6                                                |
| 影響範囲     | `packages/shared` を参照する全パッケージ                 |
| 型定義変更   | `HandoffGuidance` インターフェース定義を同ファイルに集約 |
| IPC 通過可否 | 可（packages/shared に配置のため NFR-2b 準拠）           |

**変更前後の差分**:

```typescript
// 追加する export
export function toHandoffGuidance(
  result: SkillDocsCapabilityResult,
): HandoffGuidance | null { ... }
```

**依存確認コマンド**:

```bash
grep -rn "from.*handoff" packages/shared/src/
grep -rn "HandoffGuidance" apps/desktop/src/
```

---

### 1.2 apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| 変更種別     | 追加（既存クラスへのメソッド追加）                                          |
| 変更内容     | `buildForSurface(bundle, surfaceType)` メソッドを追加                       |
| 対応タスク   | Phase 5 タスク 2                                                            |
| 対応テスト   | IT-A-1                                                                      |
| 影響範囲     | `TerminalHandoffBuilder` を使用するサービス (chatEditHandlers, agent 系)    |
| 型定義変更   | 引数型として `TerminalHandoffBundle`、返却型として `HandoffGuidance` を使用 |
| IPC 通過可否 | 不可（Main Process 内部型 `TerminalHandoffBundle` を Renderer に渡さない）  |

**変更前後の差分**:

```typescript
// 追加するメソッド
buildForSurface(
  bundle: TerminalHandoffBundle,
  surfaceType: "agent" | "skill" | "docs",
): HandoffGuidance { ... }
```

**依存確認コマンド**:

```bash
grep -rn "TerminalHandoffBuilder" apps/desktop/src/main/
grep -rn "buildForSurface" apps/desktop/src/
```

---

### 1.3 apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| 変更種別     | 変更（既存メソッドへのロジック追加）                                 |
| 変更内容     | `terminal-handoff` パスに `toHandoffGuidance()` 呼び出しを追加       |
| 対応タスク   | Phase 5 タスク 3 (GAP-06)                                            |
| 対応テスト   | IT-B-1〜4                                                            |
| 影響範囲     | Skill Docs 関連の IPC ハンドラ、SkillDocsCapabilityResolver のテスト |
| 型定義変更   | なし（既存の `SkillDocsCapabilityResult` 型を使用）                  |
| IPC 通過可否 | `HandoffGuidance` のみ IPC 経由で返却（NFR-2b 準拠）                 |

**変更前後の差分**:

```typescript
// 変更前: terminal-handoff パスが未実装 (placeholder)
// 変更後: toHandoffGuidance() を呼び出して HandoffGuidance を返す
const handoffGuidance = toHandoffGuidance(capabilityResult);
return { type: "handoff", guidance: handoffGuidance };
```

**依存確認コマンド**:

```bash
grep -rn "SkillDocsCapabilityResolver" apps/desktop/src/
grep -rn "terminal-handoff" apps/desktop/src/main/services/skill/
```

---

### 1.4 apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx

| 項目         | 内容                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| 変更種別     | 変更（判定ロジックの整理 + placeholder 更新）                                                         |
| 変更内容     | GuidanceBlock vs TerminalHandoffCard 判定条件を明記 (MN-3)、terminal case placeholder 更新 (タスク 5) |
| 対応タスク   | Phase 5 タスク 4 (MN-3 対応) + タスク 5                                                               |
| 対応テスト   | UT-B-1〜5, IT-C-1〜4                                                                                  |
| 影響範囲     | ExecutionEnvironment を使用する全 surface（Chat / Workspace / Docs）                                  |
| 型定義変更   | なし                                                                                                  |
| IPC 通過可否 | Renderer 内のレンダリング判定のみ。capability 判定は Main Process から受け取った値を使用              |

**変更前後の差分**:

```typescript
// 変更前: handoff / guidance-only の混在、terminal case が TODO placeholder
// 変更後:
// - capability === "handoff" || "terminal-handoff" → TerminalHandoffCard
// - capability === "guidance-only" → GuidanceBlock
// - capability === "terminalSurface" → launcher CTA (TODO(Task06) stub)
```

**Renderer ローカル判定禁止の確認**:

```bash
# Renderer に auth / apiKey の判定が混入していないことを確認
grep -rn "authMode\|apiKey\|apikey" apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/
```

---

## 2. 除外ファイル（変更不要）

| ファイル                                             | 除外理由                                                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-api.ts`              | 既存の `HandoffGuidance` 型ブリッジは変更不要。追加 IPC チャンネルなし                      |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts` | 既存の handoff path は `HandoffGuidance` を正しく返しているため変更不要 (IT-A-1 で確認済み) |
| `apps/desktop/src/main/handlers/skillDocHandlers.ts` | `SkillDocsCapabilityResolver` の変更で対応。ハンドラ自体の変更不要                          |
| `packages/shared/src/types/skill-docs.ts`            | `SkillDocsCapabilityResult` 型は変更不要。adapter 側で吸収する                              |

---

## 3. 型定義の二箇所同時更新チェック (P32 対策)

P32 準拠: IPC 関連の型定義変更は `packages/shared` と `apps/desktop/src/preload/types.ts` の 2箇所を同時に確認する。

| 型名                | packages/shared | preload/types.ts | 変更要否         |
| ------------------- | --------------- | ---------------- | ---------------- |
| `HandoffGuidance`   | 定義済み (追加) | 参照のみ         | preload 変更不要 |
| `toHandoffGuidance` | export 追加     | 不要             | -                |

**typecheck による確認**:

```bash
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
```

---

## 4. 変更ファイルの影響ソート

```
packages/shared/src/types/handoff.ts
  └─ 影響先:
       ├─ apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts (import 追加)
       ├─ apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts (返却型)
       └─ apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx (型参照)

apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts
  └─ 影響先:
       └─ apps/desktop/src/main/handlers/chatEditHandlers.ts (buildForSurface 使用)

apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts
  └─ 影響先:
       └─ apps/desktop/src/main/handlers/ 内の Skill Docs 関連ハンドラ

apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx
  └─ 影響先:
       └─ Chat / Workspace / Docs の surface コンポーネント
```
