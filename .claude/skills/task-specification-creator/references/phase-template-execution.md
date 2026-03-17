# Phase Template Execution

## 対象

Phase 4〜10。

## Phase 4-6

| Phase | 重点 |
| --- | --- |
| 4 | test scenario、command suite、expected result |
| 5 | `.claude` 正本更新、mirror sync、first validation |
| 6 | regression check、補助 command、再検証 |

### Phase 4 事前確認: 既存ユーティリティ重複検出【必須】

テスト対象機能で使用する可能性のあるユーティリティ関数が既に存在しないか確認する。

```bash
# 例: normalizePath、sanitizePath 等の既存実装を検索
grep -rn "export.*function.*<ユーティリティ名>" packages/ apps/
grep -rn "export const <ユーティリティ名>" packages/ apps/
```

重複が検出された場合は、既存実装を再利用する設計に変更する。

### Phase 4 事前確認: IPC レスポンス形式の事前合意

テスト設計時に、IPC ハンドラのレスポンス形式を明示的に決定する。

| 形式 | 使用基準 | 例 |
| --- | --- | --- |
| `{ success: true, data: T }` / `{ success: false, error: E }` | CRUD 操作、外部サービス連携 | skill:import, auth:login |
| 直接値返却 (`T`) | 単純な取得操作、同期的な判定 | theme:get, config:read |

テストの期待値をレスポンス形式と一致させること。

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

## Phase 5 追加チェック項目

### IPC ハンドラ register/unregister ペアの確認（P5 対策）

IPC ハンドラを新規作成した場合、以下を確認する:

- [ ] `register*Handlers` 関数を作成した場合、対応する `unregister*Handlers` 関数も同時に作成したか
- [ ] `unregisterAllIpcHandlers()` に新規ハンドラの解除処理が含まれているか
- [ ] macOS `activate` イベント等での再登録パスで二重登録が発生しないか

```bash
# register/unregister ペアの確認
grep -rn "register.*Handlers\|unregister.*Handlers" apps/desktop/src/main/
```

### 既存ユーティリティ重複検出（Phase 4 から継続）

Phase 4 で確認した既存ユーティリティの再利用状況を実装時にも再確認する。新規ユーティリティを作成する場合は、配置先を `architecture-implementation-patterns-core.md` の横断ユーティリティ配置ガイドラインに従って決定する。

## 注意事項

- Phase 5 は `.claude` 正本を先に更新する。
- Phase 8 は refactor 後も validator を再実行する。
- Phase 10 は MINOR と MAJOR の戻り先を曖昧にしない。
