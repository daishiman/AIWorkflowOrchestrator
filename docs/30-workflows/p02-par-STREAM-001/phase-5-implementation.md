# Phase 5: 実装

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 5                   |
| Phase名    | 実装                |
| 対象機能   | TASK-SW-STREAM-001  |
| 前提Phase  | Phase 4: テスト作成 |
| 次Phase    | Phase 6: テスト拡充 |
| ステータス | 未実施              |
| 作成日     | 2026-04-16          |

## 目的

Phase 4 で設計したテストが Red になることを確認した後、`createSkill()` に
`onProgress` コールバック引数を追加し、処理の5節目でコールバックを呼び出す実装を行う。
テストを Green にする。

## 実行タスク

### Task 1: TDD Red フェーズ確認

実装前に TC-01〜TC-06 が失敗することを確認する。

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "onProgress\|progress\|callback"
```

全テストが失敗（Red）であることを確認してから実装に進む。

### Task 2: SkillCreatorProgress 型定義の追加

**修正対象ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

ファイル上部（既存の型定義付近）に以下を追加する:

```typescript
type SkillCreatorProgress = {
  phase: string;
  percentage: number;
  message: string;
};
```

### Task 3: createSkill シグネチャ変更

**修正内容**:

```typescript
// 変更前
async createSkill(options: CreateSkillOptions): Promise<string>

// 変更後
async createSkill(
  options: CreateSkillOptions,
  onProgress?: (progress: SkillCreatorProgress) => void,
): Promise<string>
```

### Task 4: コールバック呼び出し実装

`createSkill()` 内部の以下5箇所にコールバック呼び出しを追加する:

```typescript
// 1. runCreateWorkflow 開始前（AC-2）
onProgress?.({
  phase: "planning",
  percentage: 10,
  message: "構造を計画しています",
});
structurePlan = await this.runCreateWorkflow(options);

// 2. SKILL.md 生成開始前（AC-3）
onProgress?.({
  phase: "generating-skill",
  percentage: 40,
  message: "SKILL.md を生成しています",
});
// ... SKILL.md 生成処理 ...

// 3. エージェント定義生成開始前（AC-4）
onProgress?.({
  phase: "generating-agents",
  percentage: 70,
  message: "エージェント定義を生成しています",
});
// ... エージェント定義生成処理 ...

// 4. 検証開始前（AC-5）
onProgress?.({
  phase: "validating",
  percentage: 90,
  message: "スキルを検証しています",
});
// ... 検証処理 ...

// 5. スキルディレクトリ返却前（AC-6）
onProgress?.({ phase: "done", percentage: 100, message: "完了しました" });
return skillDir;
```

オプショナルチェーン（`?.`）により `onProgress` が `undefined` の場合は何も実行しない（AC-7）。

### Task 5: TDD Green フェーズ確認

実装後に TC-01〜TC-06 が成功することを確認する。

```bash
# 新規テスト Green 確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "onProgress\|progress\|callback"

# 回帰テスト Green 確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --grep "collaborative"

# 全テスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"
```

### Task 6: 型チェック確認

```bash
pnpm --filter @repo/desktop typecheck
```

### Task 7: lint 確認

```bash
pnpm --filter @repo/desktop lint
```

## 実装上の注意事項

- `onProgress?.()` のオプショナルチェーン呼び出しにより、既存の呼び出し元（引数なし）は変更不要
- コールバック呼び出し位置は各処理の「開始直前」に配置する（処理中ではなく開始を通知）
- `done` コールバックは `createSkill()` の return 直前に配置する
- `create` モード以外（`collaborative` / `orchestrate`）での `planning` 〜 `validating` は呼び出さない（`create` モードの switch ブランチ内に配置）

## 参照資料

- `outputs/phase-4/TASK-SW-STREAM-001-test-design.md` — テストケース（TC-01〜TC-06）
- `outputs/phase-2/TASK-SW-STREAM-001-design.md` — 設計書

## 統合テスト連携

- `createSkill()` のシグネチャ変更（オプショナル引数追加）は後方互換であり IPC/Preload 層への影響なし
- 実装後に TASK-SW-STREAM-002 の接続可否を確認する

## 成果物

| 成果物                                    | パス                                                        |
| ----------------------------------------- | ----------------------------------------------------------- |
| TASK-SW-STREAM-001-implementation-plan.md | `outputs/phase-5/TASK-SW-STREAM-001-implementation-plan.md` |

## 完了条件

- [ ] TC-01〜TC-06 が Red であることを確認した（実装前）
- [ ] `SkillCreatorProgress` 型定義が追加されている
- [ ] `createSkill()` シグネチャに `onProgress?` が追加されている
- [ ] 5箇所のコールバック呼び出しが実装されている
- [ ] TC-01〜TC-06 が Green になっている（実装後）
- [ ] TC-R01〜TC-R02（回帰テスト）が Green を維持している
- [ ] `pnpm --filter @repo/desktop typecheck` が 0 エラー
- [ ] `pnpm --filter @repo/desktop lint` が 0 エラー

## タスク100%実行確認【必須】

- [ ] Task 1（TDD Red フェーズ確認）を100%実行した
- [ ] Task 2（SkillCreatorProgress 型定義の追加）を100%実行した
- [ ] Task 3（createSkill シグネチャ変更）を100%実行した
- [ ] Task 4（コールバック呼び出し実装）を100%実行した
- [ ] Task 5（TDD Green フェーズ確認）を100%実行した
- [ ] Task 6（型チェック確認）を100%実行した
- [ ] Task 7（lint 確認）を100%実行した
- [ ] 成果物（TASK-SW-STREAM-001-implementation-plan.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
