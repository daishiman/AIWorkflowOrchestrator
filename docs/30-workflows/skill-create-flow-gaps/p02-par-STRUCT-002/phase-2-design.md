# Phase 2: 設計

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 2                                             |
| タスクID   | TASK-SW-STRUCT-002                            |
| 機能名     | struct-002-connect-structure-plan-to-skill-md |
| 前提Phase  | Phase 1                                       |
| 後続Phase  | Phase 3                                       |
| 作成日     | 2026-04-15                                    |
| ステータス | pending                                       |

## 目的

`void structurePlan` 削除と `structurePlan` → `plan` オブジェクト接続配線の詳細設計を確定する。
`create` モードと他モードの分岐設計・null フォールバック設計を明確にする。

## 実行タスク

- `void structurePlan` 削除の設計
- `structurePlan` を `plan` オブジェクトに接続する分岐設計
- null フォールバック設計
- 既存テストへの影響範囲の設計
- 検証マトリクスの定義

## 参照資料

| 資料名                 | パス                                                                                    | 用途                 |
| ---------------------- | --------------------------------------------------------------------------------------- | -------------------- |
| Phase 1 成果物         | `outputs/phase-1/requirements.md`                                                       | 要件・AC 参照        |
| phase-2-solution.md    | `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-2-solution.md` | 解決アプローチB 参照 |
| SkillCreatorService.ts | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                           | 修正対象コード確認   |

## 実行手順

### 1. `void structurePlan` 削除設計

行 126 の `void structurePlan;` コメント行を削除する。

```typescript
// 削除対象（:126）
void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）
```

この行を削除するだけで、`structurePlan` 変数はスコープ内で有効のまま後続コードから参照可能になる。

### 2. `structurePlan` → `plan` オブジェクト接続の分岐設計

行 180-194 の `plan` オブジェクト生成ロジックを以下の分岐設計に変更する:

```typescript
// 変更後の plan オブジェクト生成（:180-194 付近）
const plan =
  structurePlan !== null
    ? {
        // create モード: structurePlan の内容を反映
        skillName: structurePlan.skillName,
        workflow: {
          summary: structurePlan.description,
          anchors: structurePlan.anchors ?? [],
          trigger: {
            description: structurePlan.purpose,
            keywords: [structurePlan.skillName],
          },
          phases: [],
          tasks: [],
        },
        directories: {},
        files: [],
      }
    : {
        // フォールバック: create 以外のモード・structurePlan が null の場合
        skillName: options.name,
        workflow: {
          summary: options.description,
          anchors: [],
          trigger: {
            description: `Use when ${options.name} is requested`,
            keywords: [options.name],
          },
          phases: [],
          tasks: [],
        },
        directories: {},
        files: [],
      };
```

**設計ポイント**:

- `structurePlan !== null` の条件分岐により、`create` モード以外（`collaborative` / `orchestrate` 等）は
  `structurePlan` が `null` のままのため、自動的にフォールバック `plan` を使用する
- `structurePlan.anchors ?? []` で `anchors` が未定義の場合も安全に処理する

### 3. null フォールバック設計

`runCreateWorkflow` が例外をスローした場合や、将来モードが追加された場合のために、
`structurePlan === null` の場合は既存の固定値 `plan` をフォールバックとして使用する。

**フォールバック条件**:

- `create` 以外のモード（`collaborative` / `orchestrate`）: switch 文で `structurePlan` に代入しない
- `runCreateWorkflow` が `null` を返した場合（将来の防御的実装）

### 4. `StructurePlanJson` インターフェース確認

`structurePlan.anchors` が `StructurePlanJson` インターフェース（:35-43）に定義されているか確認する:

```bash
grep -n "anchors\|StructurePlanJson" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

`anchors` が未定義の場合は `?? []` によるオプショナルチェーンで安全に処理する。

### 5. 既存テストへの影響範囲の設計

| テストファイル                                                                                | 影響内容                                                        | 対応方針                                                           |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------ |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`                  | `collaborative` モードのテスト: `plan` 生成ロジックが変わらない | フォールバックで既存動作を維持するため変更不要                     |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`（create モード） | `create` モードのテスト: `plan` が `structurePlan` ベースになる | STRUCT-001 完了後に `structurePlan` が正しいデータを持つことが前提 |

### 6. 検証マトリクス

| テスト対象                 | テストコマンド                                                         |
| -------------------------- | ---------------------------------------------------------------------- |
| SkillCreatorService テスト | `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/` |
| 型チェック                 | `pnpm --filter @repo/desktop typecheck`                                |
| lint                       | `pnpm --filter @repo/desktop lint`                                     |

## 統合テスト連携【必須】

`structurePlan` 接続配線の設計と `plan` 分岐設計を反映済み。

| 判定項目                | 基準     | 結果    |
| ----------------------- | -------- | ------- |
| 分岐設計の整合性        | 確認済み | pending |
| null フォールバック設計 | 確認済み | pending |
| 後方互換性設計          | 確認済み | pending |

## 多角的チェック観点

| 観点            | チェック内容                                                                                |
| --------------- | ------------------------------------------------------------------------------------------- |
| 後方互換性      | `collaborative` モードが `structurePlan === null` によってフォールバックを使い続けるか      |
| null 安全性     | `structurePlan.anchors ?? []` など null/undefined の安全な処理が設計されているか            |
| 型整合性        | `structurePlan.purpose` / `structurePlan.skillName` 等が `StructurePlanJson` 型と一致するか |
| STRUCT-001 依存 | STRUCT-001 完了後の `structurePlan` の内容が本設計の前提と一致するか                        |

## 成果物

| 成果物 | パス                        | 説明                                              |
| ------ | --------------------------- | ------------------------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | `structurePlan` 接続配線の詳細設計・plan 分岐設計 |

## 完了条件

- [ ] `void structurePlan` 削除の設計が確定済み
- [ ] `structurePlan` → `plan` オブジェクト接続の分岐設計が確定済み
- [ ] null フォールバック設計が確定済み
- [ ] `StructurePlanJson` インターフェース確認が完了済み
- [ ] 既存テストへの影響範囲が設計済み
- [ ] 検証マトリクスが定義済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. `void structurePlan` 削除設計
2. `structurePlan` → `plan` 分岐設計
3. null フォールバック設計
4. `StructurePlanJson` インターフェース確認
5. 既存テストへの影響範囲確認
6. 検証マトリクス定義
7. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 3: 設計レビューゲート
