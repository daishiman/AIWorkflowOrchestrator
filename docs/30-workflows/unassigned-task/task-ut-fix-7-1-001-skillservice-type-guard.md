# SkillService型アサーション→型ガード改善 - タスク指示書

## メタ情報

```yaml
issue_number: 788
```

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | UT-FIX-7-1-001                                 |
| タスク名     | SkillService型アサーション→型ガード改善        |
| 分類         | リファクタリング                               |
| 対象機能     | Skill System                                   |
| 優先度       | 低                                             |
| 見積もり規模 | 小規模（1-2時間）                              |
| ステータス   | 未実施                                         |
| issue_number | 775                                            |
| 発見元       | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12 |
| 発見日       | 2026-02-12                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-7-1（executeSkillのSkillExecutor委譲実装）において、`SkillService.executeSkill()` メソッド内で `Skill` 型から `SkillMetadata` 型への変換処理が実装された。この変換は手動でフィールドを1つずつ列挙するマッピング方式で実装されている。

### 1.2 問題点・課題

- **手動フィールド列挙の保守性**: `SkillService.ts` の214-225行目で、`Skill` 型の各フィールドを手動で `SkillMetadata` オブジェクトに列挙している。`SkillMetadata` は `Omit<Skill, "lastModified">` として定義されているが、実装上は明示的にフィールドをコピーしている
- **型定義と実装の乖離リスク**: `Skill` 型にフィールドが追加された場合、`SkillMetadata` の型定義は自動で追従する（`Omit` 型のため）が、手動マッピングコードは更新されずフィールド漏れが発生する
- **スプレッド構文で解決可能**: `const { lastModified, ...metadata } = skill;` のように分割代入で型安全に変換できるが、現在はその方式を採用していない

### 1.3 放置した場合の影響

- `Skill` 型にフィールドが追加された際に、`SkillMetadata` への変換でフィールド漏れが検出されない
- コンパイル時に型エラーが発生しないため、ランタイムで予期しない動作が起こる可能性がある
- 同様の変換パターンが他の場所にも増殖するリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillService.executeSkill()` 内の `Skill` → `SkillMetadata` 変換を、型安全かつ保守性の高い方式に改善する。

### 2.2 最終ゴール

- 手動フィールド列挙を廃止し、スプレッド構文（分割代入）またはランタイム型ガードによる変換に置き換える
- `Skill` 型にフィールドが追加された場合に自動で `SkillMetadata` に反映される
- 既存テストが全てPASSする

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/main/services/skill/SkillService.ts` の `executeSkill()` メソッド内の型変換処理の改善
- 改善後のテスト追加（型変換の網羅性テスト）

#### 含まないもの

- `SkillMetadata` 型定義自体の変更
- `SkillExecutor` のインターフェース変更
- 他のサービスの型変換改善

### 2.4 成果物

| 成果物                | 説明                                         |
| --------------------- | -------------------------------------------- |
| 修正済み SkillService | `SkillService.ts` の型変換処理改善           |
| 型変換テスト          | 分割代入によるフィールド網羅性のテストケース |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION が完了していること

### 3.2 依存タスク

| タスクID                              | 関係 | 状況 |
| ------------------------------------- | ---- | ---- |
| TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION | 先行 | 完了 |

### 3.3 必要な知識

| 知識領域                   | 参照先                                                                 |
| -------------------------- | ---------------------------------------------------------------------- |
| SkillExecutor型定義        | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                |
| Skill/SkillMetadata型定義  | `packages/shared/src/types/skill.ts`                                   |
| TypeScript分割代入パターン | TypeScript公式ドキュメント                                             |
| 型安全ルール               | `.claude/rules/02-code-quality.md`                                     |
| 実装教訓                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |

### 3.4 推奨アプローチ

```typescript
// 現在の実装（手動フィールド列挙）
const metadata: SkillMetadata = {
  id: skill.id,
  name: skill.name,
  slug: skill.slug,
  description: skill.description,
  path: skill.path,
  triggers: skill.triggers,
  anchors: skill.anchors,
  allowedTools: skill.allowedTools,
  category: skill.category,
};

// 改善後（スプレッド構文による型安全な変換）
const { lastModified, ...metadata } = skill;
// metadata は Omit<Skill, "lastModified"> 型に自動推論される
```

### 3.5 TASK-FIX-7-1からの実装課題と教訓

本タスクの対象コードはTASK-FIX-7-1で実装されたものである。実装過程で以下の課題に遭遇し、これらの経験が本タスクの背景となっている。

#### 課題1: Skill → SkillMetadata 型変換の設計判断

| 項目               | 内容                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **課題**           | Skill型からSkillMetadata型（`Omit<Skill, "lastModified">`）への変換方式の選択            |
| **検討した選択肢** | (A) 専用変換メソッド `toSkillMetadata()` (B) インライン手動マッピング (C) スプレッド構文 |
| **採用した方式**   | (B) インライン手動マッピング（9フィールドを明示的に列挙）                                |
| **採用理由**       | 使用箇所が1箇所のため専用メソッドへの抽出は過剰な抽象化と判断                            |
| **残課題**         | 手動列挙はフィールド追加時の漏れリスクあり → **本タスクで(C)スプレッド構文に改善**       |

#### 課題2: テストモックの大規模修正

| 項目     | 内容                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------- |
| **課題** | SkillExecutorのSetter Injection追加に伴い、既存5テストファイルに`mockSkillExecutor`を追加する必要があった      |
| **影響** | 本タスクの型変換改善でもテストの修正が必要となる可能性がある                                                   |
| **対策** | 変更前に `grep -rn "SkillMetadata\|metadata" apps/desktop/src/main/services/skill/__tests__/` で影響範囲を調査 |

**参照**: [lessons-learned.md](../../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md)

---

## 4. 実行手順

### Phase構成

Phase 1-13の標準ワークフローに従う（小規模リファクタリング）。

### Phase 1: 要件定義

#### 目的

`Skill` 型と `SkillMetadata` 型のフィールド差異を正確に特定する。

#### 手順

1. `SkillExecutor.ts` の `SkillMetadata` 型定義を確認
2. `packages/shared/src/types/skill.ts` の `Skill` 型定義を確認
3. 差異フィールド（`lastModified`）を特定

#### 完了条件

- [ ] フィールド差異が一覧化されている

### Phase 5: 実装

#### 目的

手動フィールド列挙をスプレッド構文に置き換える。

#### 手順

1. `SkillService.ts` の214-225行目を修正
2. `const { lastModified, ...metadata } = skill;` に変更
3. `pnpm typecheck` で型整合性を検証
4. 既存テスト実行で回帰がないことを確認

#### 完了条件

- [ ] 手動フィールド列挙が廃止されている
- [ ] スプレッド構文で型安全に変換されている
- [ ] 型チェックがPASSする

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SkillService.executeSkill()` 内の型変換がスプレッド構文で実装されている
- [ ] `Skill` 型にフィールドが追加された場合に `SkillMetadata` に自動反映される
- [ ] 既存の動作が維持されている

### 品質要件

- [ ] 既存テストが全てPASS
- [ ] 型チェック（`pnpm typecheck`）がPASS
- [ ] Lintチェック（`pnpm lint`）がPASS

### ドキュメント要件

- [ ] 変更理由がコードコメントに記載されている
- [ ] CHANGELOGへの記録

---

## 6. 検証方法

### テストケース

| TC-ID  | 検証項目                                   | 期待結果                        |
| ------ | ------------------------------------------ | ------------------------------- |
| TC-001 | スプレッド構文で正しく変換される           | 全フィールドが含まれている      |
| TC-002 | `lastModified` が `metadata` に含まれない  | `lastModified` が除外されている |
| TC-003 | `SkillExecutor.execute()` に正しく渡される | 既存テストがPASS                |
| TC-004 | TypeScriptコンパイルエラーがない           | `pnpm typecheck` PASS           |

### 検証手順

```bash
# 型チェック
pnpm typecheck

# テスト実行
pnpm --filter @repo/desktop test -- --grep "SkillService"

# Lintチェック
pnpm lint
```

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                             |
| ------------------------------------ | ------ | -------- | ------------------------------------------------ |
| スプレッド構文で余分なフィールド混入 | 低     | 低       | `SkillMetadata` 型で受けることで型チェックが機能 |
| 既存テストの破壊                     | 中     | 低       | 変更前に全テスト実行で現状を確認                 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント        | パス                                                       |
| ------------------- | ---------------------------------------------------------- |
| SkillExecutor型定義 | `apps/desktop/src/main/services/skill/SkillExecutor.ts`    |
| SkillService実装    | `apps/desktop/src/main/services/skill/SkillService.ts`     |
| TASK-FIX-7-1成果物  | `docs/30-workflows/TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION/` |

### 関連タスク

| タスクID                              | 関係 | 説明                 |
| ------------------------------------- | ---- | -------------------- |
| TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION | 先行 | executeSkill委譲実装 |
| TASK-FIX-1-5                          | 並行 | SkillMetadata型統一  |

### システム仕様書

| 仕様書       | パス                                                 | 参照理由                  |
| ------------ | ---------------------------------------------------- | ------------------------- |
| 型定義仕様   | `references/interfaces-agent-sdk-skill.md`           | SkillMetadata型の正式仕様 |
| 実装パターン | `references/architecture-implementation-patterns.md` | 型変換パターン            |
| 品質基準     | `references/quality-requirements.md`                 | テストカバレッジ基準      |
| 実装教訓     | `references/lessons-learned.md`                      | 苦戦箇所と解決策          |

---

## 9. 備考

### 発見元の原文

```
TASK-FIX-7-1 Phase 12にて検出:
SkillService.executeSkill()内でSkill→SkillMetadataの変換が手動フィールド列挙で実装されている。
Omit<Skill, "lastModified">型定義との乖離を防ぐため、スプレッド構文への改善が推奨される。
```

### 補足事項

- TASK-FIX-1-5（SkillMetadata型統一）と同時実施することで効率化が期待できる
- 変更範囲は `SkillService.ts` の214-225行目のみで、影響範囲は限定的
