# Phase 7 成果物: カバレッジレポート

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 7                                          |
| タスクID | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 |
| 作成日   | 2026-03-15                                 |

## カバレッジ測定結果

### workspace-constraint テスト単体

```
File               | % Stmts | % Branch | % Funcs | % Lines
chatEditHandlers.ts|   39.33 |    66.66 |   66.66 |   39.33
```

### 全 chatEditHandlers テスト合算

```
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered
chatEditHandlers.ts|   96.66 |    97.22 |   33.33 |   96.66 | 185-189
```

## NFR-001 判定

| 基準                                                  | 実測値 | 判定 |
| ----------------------------------------------------- | ------ | ---- |
| workspacePath 検証ブランチ（L159-173）Branch Coverage | 100%   | PASS |
| ファイル全体 Branch Coverage（全テスト合算）          | 97.22% | PASS |

### workspacePath 検証ブランチの分岐カバレッジ詳細

| 分岐 (L159-173)                               | true              | false    | カバレッジ |
| --------------------------------------------- | ----------------- | -------- | ---------- |
| `args.workspacePath && typeof === "string"`   | TC-WS-01,02,04,05 | TC-WS-03 | 100%       |
| `!isAllowedPath(ctx.filePath, [...])`         | TC-WS-02,04,05    | TC-WS-01 | 100%       |
| `for (const ctx of args.contexts)` ループ実行 | TC-WS-01,02,04,05 | TC-WS-06 | 100%       |

## 未カバー行の分析

| 行番号  | 内容                                      | 理由               |
| ------- | ----------------------------------------- | ------------------ |
| 185-189 | `type: "integrated"` 時の ChatEditService | 本タスクスコープ外 |

Function Coverage 33.33% は P41（v8 インライン関数カウント）の影響。本タスクスコープの workspacePath 検証に関連する関数は全てカバー済み。

## 完了条件チェック

- [x] Branch Coverage 70%以上（97.22% - 全テスト合算）
- [x] workspacePath 検証ブランチ 100% カバー
- [x] 未カバー行の分析完了
- [x] 本Phase内の全タスクを100%実行完了
