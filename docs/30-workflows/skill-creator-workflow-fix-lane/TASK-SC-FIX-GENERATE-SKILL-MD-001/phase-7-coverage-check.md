# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 7                                 |
| Phase名    | カバレッジ確認                    |
| 対象機能   | TASK-SC-FIX-GENERATE-SKILL-MD-001 |
| 前提Phase  | Phase 6: テスト拡充               |
| 次Phase    | Phase 8: リファクタリング         |
| ステータス | pending                           |
| 作成日     | 2026-04-14                        |

## 目的

AC-1〜AC-5とconcern coverageを照合し、
`SkillCreatorService.ts`の変更箇所（行152-165）のカバレッジ抜けをなくす。

## 実行タスク

### Task 1: 受入条件カバレッジ照合

- AC-1（generate_skill_md.jsが終了コード0で完了する）のテスト対応表を作成する
- AC-2（生成SKILL.mdに`## Task一覧`セクションが含まれる）のテスト対応表を作成する
- AC-3（生成SKILL.mdにYAMLフロントマターが含まれる）のテスト対応表を作成する
- AC-4（スクリプト不在時はensureSkillMdExistsフォールバックが機能する）のテスト対応表を作成する
- AC-5（tmpファイルがfinallyで削除される）のテスト対応表を作成する

### Task 2: カバレッジコマンド実行

以下のコマンドでカバレッジレポートを取得し、変更箇所の行・ブランチ・関数カバレッジを確認する。

```bash
pnpm --filter @repo/desktop test -- --coverage apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

目標値:

- line coverage: 100%
- branch coverage: 100%
- function coverage: 100%

### Task 3: concern coverageの確認

- `generateSkillMd`メソッドの`--plan`引数構築ロジック（tmpファイル生成）がcoverageに含まれることを確認する
- `spawnFile`の成功・失敗分岐の両経路がcoverageに含まれることを確認する
- `finally`節のfs.unlink呼び出し経路がcoverageに含まれることを確認する
- `ensureSkillMdExists`フォールバック経路がcoverageに含まれることを確認する

### Task 4: カバレッジ抜けの解消

- カバレッジ抜けが発見された場合はPhase 6の拡充対象として記録する
- 行数カバレッジよりconcern coverageを優先して判定する

## 参照資料

| 資料名         | パス                                       | 説明           |
| -------------- | ------------------------------------------ | -------------- |
| テスト拡充記録 | `phase-6-test-expansion.md`                | coverage対象   |
| 実装記録       | `outputs/phase-5/implementation-record.md` | coverageの根拠 |

## 統合テスト連携

- AC-1〜AC-5のすべてに対応するテストが存在することを確認する
- `--plan`引数構築→スクリプト実行→SKILL.md生成の一連フローがcoverageの中核ケースとして計上されていることを確認する

## 成果物

| 成果物             | パス                                 | 説明                |
| ------------------ | ------------------------------------ | ------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | ACとconcernの対応表 |

## 完了条件

- [ ] AC-1〜AC-5の対応表がある
- [ ] concern coverageの抜けがない
- [ ] `SkillCreatorService.ts`の変更箇所がすべてcoverageに含まれている
- [ ] line/branch/function各100%が達成されている
- [ ] Phase 8に渡す重複削減候補が整理されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
