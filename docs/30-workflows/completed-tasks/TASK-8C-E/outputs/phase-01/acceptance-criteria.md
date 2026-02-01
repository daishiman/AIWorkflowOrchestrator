# Phase 1: 受け入れ基準 - TASK-8C-E E2Eテストフィクスチャ

## 受け入れ基準一覧

| 基準ID | 基準                                                                   | 検証方法                             | 対応テストケース       |
| ------ | ---------------------------------------------------------------------- | ------------------------------------ | ---------------------- |
| AC-001 | test-skill/SKILL.md が SkillScanner でパース可能                       | SkillScanner.scanAll() 実行          | TC-001, TC-002, TC-010 |
| AC-002 | test-skill/agents/test-agent.md が agents サブリソースとして検出される | scanAll() 結果の agents 配列確認     | TC-003, TC-011         |
| AC-003 | test-skill/references/test-ref.md が references として検出される       | scanAll() 結果の references 配列確認 | TC-004, TC-012         |
| AC-004 | another-skill/SKILL.md が正しくパースされる                            | scanAll() 結果確認                   | TC-005, TC-006, TC-013 |
| AC-005 | invalid-skill/ が SkillScanner にスキップされる                        | scanAll() 結果に含まれないことを確認 | TC-007, TC-008, TC-014 |
| AC-006 | E2Eテスト（TASK-8C-B/C/D）からフィクスチャが参照可能                   | パスインポートテスト                 | TC-009                 |

## 検証詳細

### AC-001: test-skill パース検証

```
入力: apps/desktop/src/__tests__/__fixtures__/skills/ をスキャンディレクトリとして設定
期待: scanAll() の結果に name === 'test-skill' のエントリが存在
確認: description === 'E2Eテスト用のスキル'、allowedTools === ['Read', 'Write', 'Edit', 'Bash']
```

### AC-002: agents サブリソース検出

```
入力: AC-001 と同じスキャン
期待: test-skill の agents 配列に filename === 'test-agent.md' のエントリが存在
確認: description が 'Test Agent' を含む
```

### AC-003: references サブリソース検出

```
入力: AC-001 と同じスキャン
期待: test-skill の references 配列に filename === 'test-ref.md' のエントリが存在
確認: description が 'Test Reference' を含む
```

### AC-004: another-skill パース検証

```
入力: AC-001 と同じスキャン
期待: scanAll() の結果に name === 'another-skill' のエントリが存在
確認: description === '別のテスト用スキル'、allowedTools === ['Read', 'Glob']
確認: agents === []、references === []
```

### AC-005: invalid-skill スキップ検証

```
入力: AC-001 と同じスキャン
期待: scanAll() の結果に invalid-skill に関するエントリが存在しない
確認: results.every(s => s.name !== 'invalid-skill') === true
```

### AC-006: E2Eテスト参照可能性

```
入力: テストコードから path.join(__dirname, '..', '__fixtures__', 'skills') でパス解決
期待: SkillScanner のコンストラクタに渡して正常動作
確認: テスト実行時にファイルアクセスエラーが発生しない
```

## 完了ステータス

- [x] タスク3: 受け入れ基準の定義 - 完了
- [x] AC-001〜AC-006 が定義されている
- [x] 各基準の検証方法・対応テストケースが明記されている
