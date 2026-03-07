# UT-UI-03-TYPE-ASSERTION-001: AgentView `as unknown as Skill[]` 型アサーション解消

## メタ情報

| 項目         | 内容                              |
| ------------ | --------------------------------- |
| タスクID     | UT-UI-03-TYPE-ASSERTION-001       |
| タスク名     | AgentView型アサーション解消       |
| 親タスクID   | TASK-UI-03-AGENT-VIEW-ENHANCEMENT |
| 分類         | コード品質/型安全性               |
| 優先度       | 中                                |
| 見積もり規模 | 中規模                            |
| ステータス   | 未実施                            |
| 発見元       | Phase 10 最終レビュー MINOR #4    |
| 発見日       | 2026-03-07                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-03（AgentView Enhancement）の実装において、`AgentView/index.tsx` 内で `importedSkills`（`ImportedSkill[]` 型）と `availableSkillsMetadata`（`SkillMetadata[]` 型）を `Skill[]` として扱うために、`as unknown as Skill[]` という二重型アサーションを2箇所で使用している（L170, L173）。

これは P24（Store型定義と Preload型定義の不統一）の派生問題であり、`@repo/shared` の `Skill` 型と `apps/desktop/src/preload/types.ts` の `ImportedSkill` 型の定義が異なることが根本原因である。

```typescript
// 現在の実装（L170, L173）
const skills = importedSkills as unknown as Skill[];
const availableSkills = availableSkillsMetadata as unknown as Skill[];
```

### 1.2 問題点

| #   | 問題点                 | 説明                                                                                                                  |
| --- | ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | 型安全性バイパス       | `as unknown as` は TypeScript の型チェックを完全にバイパスする。P19（型キャストによる実行時検証バイパス）と同パターン |
| 2   | コンパイル時検証の喪失 | `ImportedSkill` と `Skill` のフィールド差異がコンパイル時に検出されない。フィールド追加・削除時に型エラーが発生しない |
| 3   | 保守性低下             | 型定義変更時に `as unknown as` で握りつぶされるため、実際のフィールド不整合に気付けない                               |

### 1.3 放置した場合の影響

- `Skill` 型または `ImportedSkill` 型にフィールドが追加・変更された場合、コンパイルエラーとして検出されず、ランタイムで `undefined` アクセスやプロパティ欠落によるバグが発生する
- 他のコンポーネントでも同様の `as unknown as` パターンが増殖し、プロジェクト全体の型安全性が低下する

### 1.4 TASK-UI-03 実装時の苦戦箇所と教訓

| 項目               | 内容                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **根本原因**       | P24 は `@repo/shared` の `Skill` 型と `preload/types.ts` の `ImportedSkill` 型の定義差異が根本原因。両型は類似しているが完全一致ではない           |
| **同パターン**     | 型アサーション（`as`）の使用は P19（型キャストによる実行時検証バイパス）と同パターン。コンパイル時には通るが実行時に破綻するリスクがある           |
| **未タスク化理由** | 根本解決には共有型の統合が必要だが、`Skill`/`ImportedSkill`/`SkillMetadata` 3型の統合は影響範囲が広いため、MINOR 指摘として未タスク化した          |
| **参照パターン**   | `architecture-implementation-patterns.md` の S23-S25 パターン（API二重定義の型管理、Store型定義不統一、OperationResult波及）を参照して設計すること |

---

## 2. 何を達成するか（What）

### 2.1 目的

`AgentView/index.tsx` 内の `as unknown as Skill[]` 型アサーション2箇所を除去し、型安全なコードに改善する。

### 2.2 最終ゴール

- `as unknown as Skill[]` が完全に除去されている
- `ImportedSkill[]` / `SkillMetadata[]` が型安全に `Skill[]` 互換として扱える
- 既存の動作が維持され、全テストが PASS する

### 2.3 スコープ

#### 含むもの

- `AgentView/index.tsx` の型アサーション2箇所の除去
- `@repo/shared/types/skill.ts` の `Skill` 型拡張（`ImportedSkill` の属性をカバー）
- 型整合性の検証

#### 含まないもの

- プロジェクト全体の `Skill`/`ImportedSkill`/`SkillMetadata` 型の完全統一
- 他コンポーネント・他ファイルの型アサーション修正
- `preload/types.ts` の `ImportedSkill` 型定義の廃止

### 2.4 前提条件

- `@repo/shared` の型定義統一方針が決定していること（他の型統一タスクと同時対応が望ましい）

### 2.5 成果物

| 成果物                | 説明                                           |
| --------------------- | ---------------------------------------------- |
| 修正済み AgentView    | 型アサーション除去済みの `AgentView/index.tsx` |
| 拡張済み Skill 型定義 | `ImportedSkill` 属性をカバーした `Skill` 型    |
| 型整合テスト結果      | `pnpm typecheck` PASS のエビデンス             |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| タスクID                          | 関係 | 状況 |
| --------------------------------- | ---- | ---- |
| TASK-UI-03-AGENT-VIEW-ENHANCEMENT | 先行 | 完了 |

### 3.2 必要な知識

| 知識領域                   | 参照先                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| Skill/ImportedSkill 型定義 | `packages/shared/src/types/skill.ts`                                                        |
| Preload 型定義             | `apps/desktop/src/preload/types.ts`                                                         |
| Store 型定義（AgentSlice） | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                      |
| P19: 型キャストバイパス    | `.claude/rules/06-known-pitfalls.md`                                                        |
| P24: Store型定義不統一     | `.claude/rules/06-known-pitfalls.md`                                                        |
| P32: 型定義二箇所同時更新  | `.claude/rules/06-known-pitfalls.md`                                                        |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                |
| 実装パターン               | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |

### 3.3 推奨アプローチ

#### Step 1: `@repo/shared/types/skill.ts` の `Skill` 型を拡張

`ImportedSkill` の持つ属性を `Skill` 型がカバーするように拡張し、`ImportedSkill` が `Skill` のサブタイプ（または互換型）として扱えるようにする。

#### Step 2: AgentView の型アサーション除去

```typescript
// 修正前（L170）
const skills = importedSkills as unknown as Skill[];

// 修正後（Skill 型拡張後）
const skills: Skill[] = importedSkills;
```

```typescript
// 修正前（L173）
const availableSkills = availableSkillsMetadata as unknown as Skill[];

// 修正後
const availableSkills: Skill[] = availableSkillsMetadata;
```

#### Step 3: 型整合確認

```bash
# 型チェック
pnpm typecheck

# 関連テスト実行
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/

# Lint チェック
pnpm lint
```

### 3.4 注意事項

- P32 準拠: `packages/shared/src/types/skill.ts` と `apps/desktop/src/preload/types.ts` の両方を確認し、型定義の整合性を保つこと
- `Skill` 型の拡張が他のコンポーネントに影響しないか `grep -rn "Skill" apps/desktop/src/` で事前調査すること
- `SkillImportDialog` 等の下流コンポーネントが `Skill[]` 型を期待している場合、そちらの型整合性も確認すること

---

## 4. 影響範囲

### 変更対象ファイル

| ファイル                                              | 変更内容                     |
| ----------------------------------------------------- | ---------------------------- |
| `apps/desktop/src/renderer/views/AgentView/index.tsx` | 型アサーション2箇所の除去    |
| `packages/shared/src/types/skill.ts`                  | `Skill` 型の拡張（属性追加） |

### 影響を受ける可能性のあるファイル

| ファイル                                                            | 確認事項                     |
| ------------------------------------------------------------------- | ---------------------------- |
| `apps/desktop/src/preload/types.ts`                                 | `ImportedSkill` 型との整合性 |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`              | Store 内の型参照             |
| `apps/desktop/src/renderer/components/organisms/SkillImportDialog/` | `Skill[]` props の型互換性   |

---

## 5. 参照資料

### 関連仕様書

| 仕様書                 | パス                                                                                        | 参照理由               |
| ---------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Store 型定義の設計方針 |
| 実装パターン集         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S23-S25 型管理パターン |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                        | P19, P24, P32 の教訓   |
| コード品質ルール       | `.claude/rules/02-code-quality.md`                                                          | 型安全性の基準         |

### 関連タスク

| タスクID                               | 関係 | 説明                                          |
| -------------------------------------- | ---- | --------------------------------------------- |
| TASK-UI-03-AGENT-VIEW-ENHANCEMENT      | 親   | AgentView Enhancement（型アサーション発見元） |
| UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH | 参考 | Agent SDK API 型不整合修正                    |
| UT-FIX-5-1-001                         | 参考 | Skill型/ImportedSkill型の不統一（P24）        |

---

## 6. 完了条件チェックリスト

### 機能要件

- [ ] `AgentView/index.tsx` L170 の `as unknown as Skill[]` が除去されている
- [ ] `AgentView/index.tsx` L173 の `as unknown as Skill[]` が除去されている
- [ ] `importedSkills` が型安全に `Skill[]` として扱えている
- [ ] `availableSkillsMetadata` が型安全に `Skill[]` として扱えている
- [ ] 既存の AgentView の動作が維持されている

### 品質要件

- [ ] `pnpm typecheck` が PASS する
- [ ] `pnpm lint` が PASS する
- [ ] AgentView 関連テストが全て PASS する
- [ ] `as unknown as` がプロジェクト内で新たに増加していないこと

### ドキュメント要件

- [ ] 変更理由がコードコメントまたは PR 説明に記載されている

---

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                          |
| -------------------------------------------------- | ------ | -------- | ------------------------------------------------------------- |
| Skill 型拡張が他コンポーネントに影響               | 中     | 中       | `grep -rn "Skill" apps/desktop/src/` で事前に全使用箇所を調査 |
| ImportedSkill と Skill のフィールド差異が大きい    | 中     | 低       | 差異を一覧化し、共通フィールドのみで型を設計                  |
| SkillImportDialog 等の下流コンポーネントで型エラー | 中     | 低       | 下流コンポーネントの Props 型も同時に確認・修正               |

---

## 8. 検証方法

### テストケース

| TC-ID  | 検証項目                                                       | 期待結果              |
| ------ | -------------------------------------------------------------- | --------------------- |
| TC-001 | AgentView で importedSkills が Skill[] として使用可能          | 型エラーなし          |
| TC-002 | AgentView で availableSkillsMetadata が Skill[] として使用可能 | 型エラーなし          |
| TC-003 | SkillChip に skills を渡して正常レンダリング                   | 既存テスト PASS       |
| TC-004 | SkillImportDialog に availableSkills を渡して正常動作          | 既存テスト PASS       |
| TC-005 | TypeScript コンパイルエラーがない                              | `pnpm typecheck` PASS |

### 検証手順

```bash
# 型チェック
pnpm typecheck

# AgentView テスト実行
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/

# 全テスト実行
cd apps/desktop && pnpm vitest run

# Lint チェック
pnpm lint
```

---

## 9. 備考

### 発見元の原文

```
TASK-UI-03 Phase 10 最終レビュー MINOR #4:
AgentView/index.tsx の L170, L173 で `as unknown as Skill[]` 型アサーションを2箇所使用。
P24（Store型定義とPreload型定義の不統一）の派生。型安全性バイパスのため未タスク化。
```

### 補足事項

- 本タスクは AgentView 内の型アサーション除去に限定する。プロジェクト全体の `Skill`/`ImportedSkill`/`SkillMetadata` 型統一は別タスクとして対応する
- `@repo/shared` の型変更は P32（型定義の二箇所同時更新必須）に準拠し、`packages/shared/src/types/skill.ts` と `apps/desktop/src/preload/types.ts` の整合性を保つこと
