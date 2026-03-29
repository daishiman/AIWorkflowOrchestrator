# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 10                               |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

全 Phase の成果物を横断的にレビューし、AC-1〜AC-7 の充足を最終確認する。

## 実行タスク

- AC-1〜AC-7 の充足状況を確認する
- 全変更ファイルの差分を最終レビューする
- テスト結果を最終確認する
- Phase 3 Minor Notes の対応状況を確認する

## 参照資料

| 資料名           | パス                           | 説明                |
| ---------------- | ------------------------------ | ------------------- |
| index.md         | `index.md`                     | 受入基準 AC-1〜AC-7 |
| Phase 3 レビュー | `phase-3-design-review.md`     | Minor Notes         |
| Phase 9 QA       | `phase-9-quality-assurance.md` | 品質監査結果        |

## 実行手順

### ステップ1: AC 充足マトリクスを作成する

| AC   | 基準                                 | 充足確認方法                               | 状態 |
| ---- | ------------------------------------ | ------------------------------------------ | ---- |
| AC-1 | plan() が明示的エラーを返す          | TC-01, TC-02 が GREEN                      | -    |
| AC-2 | execute() がエラーを返す             | TC-03, TC-04 が GREEN                      | -    |
| AC-3 | improve() がエラーを返す             | TC-05 が GREEN                             | -    |
| AC-4 | reason code + userMessage が含まれる | TC-06 が GREEN                             | -    |
| AC-5 | IPC handler が正しくフォーマットする | TC-07, TC-08 が GREEN                      | -    |
| AC-6 | UI がエラー状態を表示する            | Phase 11 手動テストで確認                  | -    |
| AC-7 | 正常系パスが変更されていない         | TC-09, TC-10 が GREEN + 既存テスト全 GREEN | -    |

### ステップ2: 全変更ファイルの差分レビュー

- `git diff` で全変更を確認する。
- 不要な変更、コメントアウト、デバッグコードがないことを確認する。
- コミットメッセージが適切であることを確認する。

### ステップ3: Phase 3 Minor Notes の対応状況

| Minor Note                               | 対応状況                  |
| ---------------------------------------- | ------------------------- |
| execute() / improve() のスタブ行番号確認 | Phase 5 で対応済み        |
| userMessage の i18n 対応                 | follow-up task として記録 |
| degraded status のユースケース定義       | follow-up task として記録 |
| reason code の拡張性                     | Phase 9 で確認済み        |

### ステップ4: 全テストを最終実行する

```bash
pnpm vitest run
pnpm typecheck
pnpm lint
```

## 統合テスト連携

- Phase 11 で手動テストを実施する。

## 成果物

| 成果物            | パス          | 説明                    |
| ----------------- | ------------- | ----------------------- |
| AC 充足マトリクス | Phase 10 出力 | AC-1〜AC-7 充足確認結果 |

## 完了条件

- [ ] AC-1〜AC-7 の充足状況が確認されている
- [ ] 全変更ファイルの差分がレビュー済みである
- [ ] Phase 3 Minor Notes が対応または follow-up 記録されている
- [ ] 全テストが GREEN である
- [ ] `pnpm typecheck` / `pnpm lint` がエラー 0 件で通る
- [ ] **本Phase内の全タスクを100%実行完了**
