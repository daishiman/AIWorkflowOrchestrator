# Phase Template Execution

## 対象

Phase 4〜10。

## Phase 4-6

| Phase | 重点 |
| --- | --- |
| 4 | test scenario、command suite、expected result |
| 5 | `.claude` 正本更新、mirror sync、first validation |
| 6 | regression check、補助 command、再検証 |

### 画面遷移 / handoff 改修タスクの追加ルール

- Phase 4 では App shell の既存 test bundle を先に探し、`renderView` / routing / callback 注入は既存テストへの追記を優先する。
- Phase 5 では CTA 条件や戻り導線を **既存 enum / history state** で表現する。`isExecutionComplete` のような新規 boolean は、既存 state で表現できないと証明できた場合だけ追加する。
- `selectedSkillName` と `currentSkillName` のように責務が近い state は、表示対象・選択状態・route handoff のどれに使うかを明示してから実装する。

### Phase 4 事前確認: 既存ユーティリティ重複検出【必須】

テスト対象機能で使用する可能性のあるユーティリティ関数が既に存在しないか確認する。

```bash
# 例: normalizePath、sanitizePath 等の既存実装を検索
grep -rn "export.*function.*<ユーティリティ名>" packages/ apps/
grep -rn "export const <ユーティリティ名>" packages/ apps/
```

重複が検出された場合は、既存実装を再利用する設計に変更する。

### Phase 4 テストマトリクス: 仕様番号とテスト名の対応列

テストマトリクス作成時は「仕様番号（TC-I-XX）」と「ファイル内テスト名（describe/it の文字列）」を別列で記録する。

| TC 番号   | ファイル内テスト名                             | 対象チャンネル / 関数        | 結果 |
| --------- | ---------------------------------------------- | ---------------------------- | ---- |
| TC-I-01   | `should list sessions and return data`         | `listSessions()`             | PASS |
| TC-I-02   | `should return empty array when no sessions`   | `listSessions()`             | PASS |

**理由**: 仕様書上の番号（TC-I-09 等）と vitest が表示するテスト名が乖離すると、カバレッジ確認やデバッグ時に参照先が曖昧になる。対応列があれば Phase 7/9 の証跡取得が確実になる。

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

### Phase 4: private method テスト方針の明記【必須】

> [Feedback P0-09-U1-1] TDD Red 前に、private method をどのようにテストするかを Phase 4 仕様書に1行で明記する。

| 方針                        | 記述例                                                           | 採用基準                        |
| --------------------------- | ---------------------------------------------------------------- | ------------------------------- |
| キャスト経由                | `(facade as unknown as FacadePrivate).method()`                  | 直接単体検証が必要な場合        |
| public API 経由（推奨）     | public contract を通じて内部の振る舞いを間接的に検証            | 実装隠蔽を守りたい場合          |

Phase 4 仕様書のタスク説明に「本タスクでは public callback 経由を採用する」等を1行添えること。

### Phase 5: canUseTool 適用範囲と制約の明記【SDK Hook 系タスク】

> [Feedback P0-09-U1-2] SDK callback（`canUseTool`）を接続するタスクでは、`improve()` フローへの適用可否を Phase 5 仕様書に明記する。

| フロー         | 経路                          | SDK callback 適用 | 記述例                                                      |
| -------------- | ----------------------------- | ----------------- | ----------------------------------------------------------- |
| `execute()` 系 | SDK `query()` 経由            | 適用される        | 「execute フローは SDK callback で toolUse を制限する」     |
| `improve()` 系 | `llmAdapter.sendChat()` 経由  | 適用されない      | 「improve フローは sendChat 経由のため SDK callback 非適用」|

Phase 5 仕様書のタスク2以降に「canUseTool 適用可能範囲と制約」セクションを設け、上記を1〜3行で明記すること。

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

### 既存テスト回帰確認の先行実行（TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 教訓）

Phase 5 実装開始前に、影響を受ける可能性がある既存テストを先行実行して baseline を確認する。

```bash
# 変更対象ファイルに関連する既存テストを実行
pnpm --filter @repo/desktop exec vitest run src/path/to/related.test.ts

# 変更対象ファイルを特定
git diff --name-only HEAD -- 'apps/**/*.ts' 'packages/**/*.ts'
```

- [ ] 変更対象ファイルの既存テストが全て GREEN であることを確認した（baseline 確認）
- [ ] 新規実装後に既存テストが回帰していないことを確認した

**注意**: 定数・型・インターフェースの変更（例: `status: "error"` → `status: "disconnected"`）は関係する全テストに波及する。変更前に `grep -rn "\"error\""` 等で影響範囲を調査してから実装する。

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
