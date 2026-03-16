# Phase Template Execution

## 対象

Phase 4〜10。

## Phase 4-6

| Phase | 重点 |
| --- | --- |
| 4 | test scenario、command suite、expected result |
| 5 | `.claude` 正本更新、mirror sync、first validation |
| 6 | regression check、補助 command、再検証 |

### Phase 4 事前確認: テスト対象ファイルの import 副作用チェック

テスト対象ファイルを `import` した際にトップレベル副作用（DB接続、サーバー起動、グローバル状態変更、Electron `app.whenReady()` 等）が実行されないか確認する。
副作用がある場合は、Phase 8（リファクタリング）のファイル分離を Phase 5 で先行実施するか判断する（下記「Phase 5 判断基準」参照）。

確認コマンド:
```bash
# テスト対象ファイルのモジュールスコープで実行されるコードを確認
grep -n "^[^/]*\(app\.\|server\.\|connect\|initialize\|ipcMain\.\|BrowserWindow\)" <target-file>
```

副作用が検出された場合の選択肢:
1. **vi.mock で副作用モジュールをモック化** — 副作用が少数の場合
2. **ファイル分離を Phase 5 で先行実施** — 副作用が広範囲の場合（下記判断基準参照）

### Phase 5 判断: ファイル分離の先行実施

以下の条件のいずれかを満たす場合、Phase 8（リファクタリング）のファイル分離を Phase 5 で先行実施する:
1. テスト対象ファイルにトップレベル副作用があり、vi.mock では対処困難
2. 新規ロジックが50行以上で、既存ファイルの責務と明確に分離可能
3. テスト容易性が著しく低下する構造（例: Electron main.ts に直接ロジック追加）

先行実施した場合は Phase 8 で「Phase 5 で実施済み」と明記し、重複作業を防止する。

## Phase 7-10

| Phase | 重点 |
| --- | --- |
| 7 | concern × command × dependency edge の coverage |
| 8 | duplicate、naming、navigation 短縮 |
| 9 | validator と quality gate の一括判定 |
| 10 | acceptance criteria と blocker の final review |

## execution template

```md
## 実行タスク
- タスク1: ...
- タスク2: ...
- タスク3: ...

## 実行手順
### ステップ1: ...
### ステップ2: ...
### ステップ3: ...

## 統合テスト連携
## 成果物
## 完了条件
```

## 注意事項

- Phase 5 は `.claude` 正本を先に更新する。
- Phase 8 は refactor 後も validator を再実行する。
- Phase 10 は MINOR と MAJOR の戻り先を曖昧にしない。
