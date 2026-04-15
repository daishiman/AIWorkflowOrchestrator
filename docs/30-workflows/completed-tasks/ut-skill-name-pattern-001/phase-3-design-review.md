# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 3                                  |
| 機能名 | skill-name-pattern-shared-constant |
| 作成日 | 2026-04-14                         |

## 目的

Phase 2 の方針が current facts と一致するかを 4 条件でレビューし、Phase 4 へ進めるかを決める。

## レビュー観点

| 観点         | 確認内容                                                                                |
| ------------ | --------------------------------------------------------------------------------------- |
| 矛盾なし     | `packages/shared/src/index.ts` 前提や旧い文字数前提が残っていない                       |
| 漏れなし     | `SkillScanner.ts`、`init_skill.js`、`skillName.ts`、`constants/index.ts` を網羅している |
| 整合性あり   | 用語が `MAX_SKILL_NAME_LENGTH` と `@repo/shared/constants` に統一されている             |
| 依存関係整合 | `packages/shared` → consumer の依存方向が崩れていない                                   |

## 判定

| 判定  | 条件                                     |
| ----- | ---------------------------------------- |
| PASS  | current facts に一致し、Phase 4 へ進める |
| MINOR | docs のみ修正すれば済む                  |
| MAJOR | 実装または設計を戻す必要がある           |

## 完了条件

- [ ] 4 条件の判定が記録されている
- [ ] Phase 4 へ進むか、Phase 2 に戻すかが決定されている

## 次のPhase

Phase 4: テスト設計
