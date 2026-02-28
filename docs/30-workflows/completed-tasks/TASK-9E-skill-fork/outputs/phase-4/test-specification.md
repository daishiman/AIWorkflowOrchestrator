# Phase 4 テスト仕様書 - TASK-9E-skill-fork

## メタ情報

| 項目                 | 値                 |
| -------------------- | ------------------ |
| タスク               | TASK-9E skill:fork |
| Phase                | 4（テスト作成）    |
| 作成日               | 2026-02-28         |
| テストフレームワーク | Vitest             |

## Phase 4 時点のテスト対象

| ファイル                                                             | テスト数（Phase 4） | 主対象                                                           |
| -------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/__tests__/SkillForker.test.ts` | 28                  | フォーク処理本体（FS操作、Frontmatter更新、ロールバック）        |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.fork.test.ts`     | 25                  | IPCハンドラ（P42バリデーション、sender検証、エラーハンドリング） |

合計: **53テスト（Phase 4 baseline）**

注記: Phase 6 で `SF-29`〜`SF-32` が追加されて 57 テストになり、その後 Phase 12 で2件追加され最終 59 テスト（SkillForker 34 + IPC 25）になっている。

## 仕様観点と対応（Phase 4 baseline）

| 観点                                                      | 対応テスト           |
| --------------------------------------------------------- | -------------------- |
| sourceSkill/newName の3段バリデーション（P42）            | SF-IPC-07〜12        |
| description 指定時バリデーション                          | SF-IPC-13〜14        |
| copyAgents/copyReferences/copyScripts/copyAssets の型検証 | SF-IPC-15〜18        |
| modifyAllowedTools 配列検証                               | SF-IPC-19〜21        |
| IPC sender 検証                                           | SF-IPC-22〜23        |
| フォーク正常系（SKILL.md更新、metadata作成）              | SF-01〜04, SF-16〜17 |
| 異常系（ソース不在、重複、FS失敗）                        | SF-18〜21            |
| ロールバック保証                                          | SF-20                |

## 実行コマンド

```bash
cd apps/desktop
pnpm vitest run src/main/services/skill/__tests__/SkillForker.test.ts
pnpm vitest run src/main/ipc/__tests__/skillHandlers.fork.test.ts
```

## 完了条件

- [x] 2ファイルで実装差分（Service + IPC）をカバー
- [x] 正常系・異常系・境界値を含む
- [x] P42/P44/P45関連観点を明示
- [x] Phase 5 実装へ引き渡し可能
