# Phase 11: 手動テスト検証

## 1. テスト環境準備

### 1.1 テストディレクトリ作成

```bash
# テスト用スキルディレクトリ作成
mkdir -p ~/.aiworkflow/skills/test-manual-skill/references
mkdir -p ~/.claude/skills/readonly-test-skill/references

# テスト用SKILL.md作成
echo "---
name: test-manual-skill
description: 手動テスト用スキル
---

# Test Manual Skill" > ~/.aiworkflow/skills/test-manual-skill/SKILL.md

# 読み取り専用スキルのSKILL.md（既存のものを使用するか、テスト用に作成）
```

### 1.2 テストファイル作成

```bash
# 編集可能スキルにテストファイル作成
echo "# Test Reference
This is a test file for manual testing." > ~/.aiworkflow/skills/test-manual-skill/references/test.md
```

## 2. 手動テストケース

### 2.1 ファイル読み込み（F-01）

| ステップ | 操作                                                | 期待結果               |
| -------- | --------------------------------------------------- | ---------------------- |
| 1        | readFile('test-manual-skill', 'SKILL.md')           | ファイル内容が返される |
| 2        | readFile('test-manual-skill', 'references/test.md') | ファイル内容が返される |
| 3        | readFile('test-manual-skill', 'nonexistent.md')     | FileNotFoundError      |
| 4        | readFile('nonexistent-skill', 'SKILL.md')           | SkillNotFoundError     |

### 2.2 ファイル書き込み（F-02）

| ステップ | 操作                                                           | 期待結果                   |
| -------- | -------------------------------------------------------------- | -------------------------- |
| 1        | writeFile('test-manual-skill', 'references/test.md', '新内容') | 成功、バックアップ作成     |
| 2        | ファイル内容を確認                                             | 新内容が書き込まれている   |
| 3        | バックアップファイルを確認                                     | .backup.{timestamp} が存在 |
| 4        | writeFile('readonly-test-skill', 'test.md', '内容')            | ReadonlySkillError         |

### 2.3 ファイル作成（F-03）

| ステップ | 操作                                                         | 期待結果           |
| -------- | ------------------------------------------------------------ | ------------------ |
| 1        | createFile('test-manual-skill', 'references/new.md', '新規') | 成功               |
| 2        | ファイルを確認                                               | 新規ファイルが存在 |
| 3        | createFile('test-manual-skill', 'references/new.md', '重複') | FileExistsError    |

### 2.4 ファイル削除（F-04）

| ステップ | 操作                                                 | 期待結果                    |
| -------- | ---------------------------------------------------- | --------------------------- |
| 1        | deleteFile('test-manual-skill', 'references/new.md') | 成功、バックアップ作成      |
| 2        | ファイルを確認                                       | ファイルが存在しない        |
| 3        | バックアップを確認                                   | .deleted.{timestamp} が存在 |

### 2.5 バックアップ一覧（F-05）

| ステップ | 操作                             | 期待結果                       |
| -------- | -------------------------------- | ------------------------------ |
| 1        | listBackups('test-manual-skill') | バックアップ一覧が返される     |
| 2        | 各バックアップの情報を確認       | filename, type, timestamp あり |

### 2.6 バックアップ復元（F-06）

| ステップ | 操作                                                 | 期待結果       |
| -------- | ---------------------------------------------------- | -------------- |
| 1        | listBackups でバックアップパスを取得                 | パス一覧       |
| 2        | restoreBackup('test-manual-skill', バックアップパス) | 成功           |
| 3        | 復元されたファイルを確認                             | 元の内容が復元 |

## 3. セキュリティ手動検証

### 3.1 パストラバーサル

| ステップ | 操作                                                 | 期待結果           |
| -------- | ---------------------------------------------------- | ------------------ |
| 1        | readFile('test-manual-skill', '../../../etc/passwd') | PathTraversalError |
| 2        | writeFile('test-manual-skill', '../test.md', '内容') | PathTraversalError |

### 3.2 読み取り専用保護

| ステップ | 操作                                     | 期待結果           |
| -------- | ---------------------------------------- | ------------------ |
| 1        | ~/.claude/skills/ のスキルに書き込み試行 | ReadonlySkillError |
| 2        | ~/.claude/skills/ のスキルを読み込み     | 成功               |

## 4. テスト結果記録

### 4.1 機能テスト結果

| 機能          | テスト結果 | 備考 |
| ------------- | ---------- | ---- |
| F-01 読み込み | ⬜         |      |
| F-02 書き込み | ⬜         |      |
| F-03 作成     | ⬜         |      |
| F-04 削除     | ⬜         |      |
| F-05 一覧     | ⬜         |      |
| F-06 復元     | ⬜         |      |

### 4.2 セキュリティテスト結果

| 検証項目             | テスト結果 | 備考 |
| -------------------- | ---------- | ---- |
| パストラバーサル防止 | ⬜         |      |
| 読み取り専用保護     | ⬜         |      |

### 4.3 発見事項

| ID  | 種別 | 内容 | 重要度 | 対応方針 |
| --- | ---- | ---- | ------ | -------- |
| 1   | ⬜   | ⬜   | ⬜     | ⬜       |

## 5. クリーンアップ

```bash
# テスト用ファイル・ディレクトリの削除
rm -rf ~/.aiworkflow/skills/test-manual-skill
# 注: ~/.claude/skills/ は Claude CLI 管理のため触らない
```

## 6. 統合テスト連携【必須】

### 手動統合テスト（本タスク固有）

| テスト項目           | 確認内容                                   | 期待結果                      | 実行結果 |
| -------------------- | ------------------------------------------ | ----------------------------- | -------- |
| ファイルシステム連携 | 実ディレクトリでの読み書き操作             | 正常動作                      | ⬜       |
| バックアップ連携     | writeFile/deleteFile時のバックアップ作成   | .backup/.deleted ファイル生成 | ⬜       |
| バックアップ復元     | listBackups→restoreBackup の往復           | 元の内容が復元                | ⬜       |
| パストラバーサル防止 | `../` パターンの手動検証                   | PathTraversalError            | ⬜       |
| 読み取り専用保護     | ~/.claude/skills/ への書き込み試行         | ReadonlySkillError            | ⬜       |
| IPC/UI接続           | **本タスクスコープ外**（TASK-9A-B で対応） | N/A                           | N/A      |

> **注記**: UI連携・IPC経由のテストは本タスクスコープ外。本フェーズではサービスクラスの手動検証に集中する。

## 7. 完了条件

- [ ] 全機能テストが PASS
- [ ] セキュリティテストが PASS
- [ ] 発見事項が記録されている
- [ ] クリーンアップが完了
- [ ] 手動統合テストが完了している
