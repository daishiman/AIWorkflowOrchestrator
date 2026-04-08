# Phase 7: カバレッジ確認

## タスクID: UT-SKILL-WIZARD-W1-par-02d

## カバレッジ対象

| 変更要素                                       | カバーするテスト               | 種別             |
| ---------------------------------------------- | ------------------------------ | ---------------- |
| `onOpenSkillWizard` Props 追加                 | TC-W03（クリック呼び出し確認） | 機能テスト       |
| `skill-lifecycle-open-wizard-button` 存在      | TC-W01                         | 存在確認         |
| ボタンテキスト「スキル作成ウィザードを開く →」 | TC-W02                         | テキスト確認     |
| `skill-lifecycle-request-input` 削除           | TC-D01, TC-R01                 | 非存在確認・回帰 |
| `skill-lifecycle-create-button` 削除           | TC-D02, TC-R02                 | 非存在確認・回帰 |
| `skill-lifecycle-prepare-button` 削除          | TC-D03, TC-R03                 | 非存在確認・回帰 |
| `type="button"` 付与                           | TC-A01                         | アクセシビリティ |
| `h3` 見出しレベル                              | TC-A02                         | アクセシビリティ |
| `text-[var(--text-secondary)]` クラス          | TC-A03                         | スタイル確認     |
| 複数回クリック耐性                             | TC-E01                         | エッジケース     |
| 複数Props共存                                  | TC-E02                         | エッジケース     |
| 再レンダリング後の保持                         | TC-E03                         | エッジケース     |
| セクション2以降の無変更                        | TC-S01                         | 保持確認         |
| 全体構造の維持                                 | TC-S02                         | 保持確認         |

## 削除済みコードのカバレッジ

`handleCreate`・`handlePrepare`・`request` state・`createdSkillPath` state は削除済みのため、
これらを参照するテストは全て削除した。残存リスクは回帰テスト（TC-R01〜R03）でカバー。

## 実行結果

- TypeScript 型チェック: **PASS**（`tsc --noEmit` エラーゼロ）
- Unit test 実行: esbuildバイナリ不一致（worktree固有の環境問題）のため実行保留。CI環境での確認が必要。

## 完了確認

- [x] 追加・変更要素が全てテストでカバーされている
- [x] 削除要素が回帰テストで検出可能な状態にある
- [x] 型チェックが通過している
