# TASK-SC-SHARED-TYPE-PROMOTE-001: StructurePlanJson の @repo/shared 昇格判断・実施

## メタ情報

```yaml
issue_number: 2182
```

## メタ情報

| 項目     | 値                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------ |
| タスクID | TASK-SC-SHARED-TYPE-PROMOTE-001                                                                  |
| 検出元   | TASK-SC-IMP-CREATE-WORKFLOW-001 Phase 12 未タスク検出                                            |
| 優先度   | LOW                                                                                              |
| 影響     | StructurePlanJson がローカル定義のままで、後続の生成・検証処理が増えた場合に重複定義リスクがある |
| 検出日   | 2026-04-15                                                                                       |
| 依存     | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 完了後の契約確認                                      |

## 概要

`apps/desktop/src/main/services/skill/SkillCreatorService.ts` にローカル定義されている `StructurePlanJson` インタフェースを `@repo/shared/types` パッケージに昇格するかどうかを判断・実施するタスク。現時点ではローカル定義で十分だが、将来的に `generate_skill_md.js` や他のサービスが同じ型を参照するなら共通化の余地がある。

## 現状

```typescript
// SkillCreatorService.ts（ローカル定義）
interface StructurePlanJson {
  skillId: string;
  purpose: string;
  agents: string[];
  // ...
}
```

現時点では `StructurePlanJson` の参照箇所は `SkillCreatorService.ts` 内のみ。ローカル定義で完結しており、即時の昇格は不要。ただし、TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 完了後に `generate_skill_md.js` や他のサービスからも同型を参照する可能性がある。

## 苦戦箇所

| 苦戦箇所                                | 問題                                                                                       | 解決策                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| @repo/shared への昇格タイミング         | 早期昇格はオーバーエンジニアリングになるリスクがある                                       | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 完了後に参照箇所を棚卸ししてから判断する |
| ビルド依存関係の変更                    | `@repo/shared` への昇格はビルド依存関係の変更を伴い、worktree 環境でのビルド順序に影響する | 昇格する場合は pnpm の filter オプションを使ったビルド順序を事前に確認する          |
| import シャドウイングリスク（C-4 再発） | ローカル型と shared 型が共存すると import がシャドウイングしうる                           | 昇格時はローカル定義を即時削除し Single Source of Truth を維持する                  |

## 期待される対応

1. TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 完了後に `StructurePlanJson` の参照箇所を棚卸し
2. 2箇所以上で参照される場合は `packages/shared/src/types/skill-creator.ts` に定義を移動し、各参照元の import を切り替える
3. 1箇所のみの場合はローカル定義を維持し、このタスクをクローズ

## 実行タスク（昇格が必要と判断された場合）

- [ ] `StructurePlanJson` の全参照箇所を洗い出す（`grep -r StructurePlanJson`）
- [ ] `packages/shared/src/types/skill-creator.ts` に型定義を追加する
- [ ] `packages/shared/src/index.ts` から re-export する
- [ ] `SkillCreatorService.ts` のローカル定義を削除し、shared からの import に切り替える
- [ ] 他の参照箇所も同様に import を切り替える
- [ ] `pnpm --filter @repo/shared build` → `pnpm --filter @repo/desktop build` の順でビルド確認
- [ ] TypeScript 型チェック PASS を確認する
- [ ] 既存テストが全て PASS することを確認する

## 完了条件

- [ ] 参照箇所棚卸し結果を本タスクに記録する
- [ ] 昇格する場合：`StructurePlanJson` が `packages/shared` で Single Source of Truth として定義され、全参照元が shared からの import に切り替わっていること
- [ ] 昇格しない場合：ローカル定義のまま維持し、理由を本タスクにコメントとして記録してクローズする
- [ ] TypeScript 型チェック PASS
- [ ] 全テスト PASS

## 関連

- 依存タスク: TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001
- 検出元タスク: TASK-SC-IMP-CREATE-WORKFLOW-001
- 類似タスク: TASK-SC-14-SKILL-CREATOR-RUNTIME-API-TYPE-SHARING（同様の型昇格パターン）
- 対象ファイル: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- 昇格先候補: `packages/shared/src/types/skill-creator.ts`
- 参照: TASK-SC-07 苦戦箇所 C-4（PlanResult 型の二重定義によるシャドウイング）
