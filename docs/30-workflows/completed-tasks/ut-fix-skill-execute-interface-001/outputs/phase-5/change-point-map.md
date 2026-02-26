# Phase 5 変更点マップ

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- フェーズ: 5

## 変更対象ファイル

| 区分         | ファイル                                                               | 行範囲       | 変更目的                                                       | P対策       |
| ------------ | ---------------------------------------------------------------------- | ------------ | -------------------------------------------------------------- | ----------- |
| Main Handler | `apps/desktop/src/main/ipc/skillHandlers.ts`                           | L257-268     | 名前解決ロジックの改善（scanAvailableSkills → getSkillByName） | GAP-02      |
| Main Handler | `apps/desktop/src/main/ipc/skillHandlers.ts`                           | L240-248直後 | promptバリデーション追加                                       | DG-01, P42  |
| Test         | `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`    | 637行        | mock更新、テストケース追加                                     | R-04, R-05  |
| Test         | `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts`   | 425行        | mock更新（名前解決経路変更）                                   | R-04        |
| Test         | `apps/desktop/src/main/ipc/__tests__/skillHandlers.validation.test.ts` | 1010行       | promptバリデーションテスト追加                                 | R-04, DG-01 |

## 変更なしファイル（明示的に維持）

| 区分     | ファイル                                                | 理由                                          |
| -------- | ------------------------------------------------------- | --------------------------------------------- |
| Shared   | `packages/shared/src/types/skill.ts`                    | SkillExecutionRequest型は変更なし             |
| Preload  | `apps/desktop/src/preload/skill-api.ts`                 | execute()のシグネチャは変更なし               |
| Service  | `apps/desktop/src/main/services/skill/SkillService.ts`  | executeSkill(skillId, params)の契約は変更なし |
| Executor | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 変更なし                                      |

## 影響範囲

### 直接影響

- `skill:execute` ハンドラの名前解決ロジックとバリデーション

### 間接影響（回帰確認対象）

| ハンドラ           | 影響の可能性                                   | 回帰テスト |
| ------------------ | ---------------------------------------------- | ---------- |
| `skill:import`     | なし（独立したハンドラ）                       | EXE-REG-01 |
| `skill:remove`     | なし（独立したハンドラ）                       | EXE-REG-02 |
| `skill:list`       | scanAvailableSkills の呼び出しパターン変更なし | 既存テスト |
| `skill:get-detail` | getSkillById を使用（別メソッド）              | 既存テスト |

## 変更ポリシー

| ポリシー    | 内容                                                            | 根拠                         |
| ----------- | --------------------------------------------------------------- | ---------------------------- |
| P44対策     | 本変更ではMain Handler内の変更のみ。Preload/Shared型は変更不要  | ユニオン型維持・外部契約維持 |
| P45対策     | 命名は外部`skillName` / 内部`skillId`で固定。新規命名の追加なし | contract-mapping-design.md   |
| P42対策     | promptフィールドにP42準拠3段バリデーションを追加                | DG-01対応                    |
| 3層同時更新 | 本変更では不要（Main Handler + テストのみ）                     | 型定義・Preload変更なし      |

## mock変更マップ

| テストファイル     | 現在のmock                                                                  | 変更後のmock                                                     | 影響範囲                 |
| ------------------ | --------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------ |
| execute.test.ts    | `mockSkillService.scanAvailableSkills.mockResolvedValue({ skills: [...] })` | `mockSkillService.getSkillByName.mockResolvedValue(skillObject)` | skillNameパスの全テスト  |
| delegate.test.ts   | 同上                                                                        | 同上                                                             | 委譲検証テスト           |
| validation.test.ts | 変更なし（バリデーションはmock呼び出し前に発生）                            | promptバリデーションテスト追加                                   | バリデーションセクション |

## 完了記録

- [x] 変更箇所を列挙（プロダクション1ファイル + テスト3ファイル）
- [x] 変更なしファイルを明示（型定義・Preload・Service）
- [x] 影響範囲を定義（直接: skill:execute、間接: import/remove/list/get-detail）
- [x] 変更ポリシーを定義（P44/P45/P42対策）
- [x] mock変更マップを定義
