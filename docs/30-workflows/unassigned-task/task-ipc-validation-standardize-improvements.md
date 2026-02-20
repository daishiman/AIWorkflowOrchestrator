# IPC入力バリデーション標準化 - タスク指示書

## メタ情報

```yaml
issue_number: 829
```

## メタ情報

| 項目         | 内容                          |
| ------------ | ----------------------------- |
| タスクID     | UT-9A-B-001                   |
| タスク名     | IPC入力バリデーション標準化   |
| 分類         | 改善                          |
| 対象機能     | IPC ハンドラー全般            |
| 優先度       | 中                            |
| 見積もり規模 | 中規模                        |
| ステータス   | 未実施                        |
| 発見元       | Phase 12（TASK-9A-B実装経験） |
| 発見日       | 2026-02-19                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

- TASK-9A-Bで skillFileHandlers.ts に `.trim()` 3段階バリデーションパターンを確立
- このパターンは空白のみの入力（`"   "`）やundefined引数を確実に検出できる
- しかし他のIPCハンドラーでは同等のバリデーションが実装されていない可能性がある

### 1.2 問題点・課題

- IPCハンドラー間でバリデーション品質にばらつきがある
- 空白のみの文字列がバリデーションをすり抜ける可能性（P42: `.trim()` バリデーション漏れ）
- バリデーションパターンが各ハンドラーに散在し、一貫性を保証する仕組みがない

### 1.3 放置した場合の影響

- セキュリティポスチャーの不均一化
- 空白のみの入力による予期しない動作
- 新規IPCハンドラー追加時のバリデーション漏れリスク

---

## 2. 何を達成するか（What）

### 2.1 目的

全IPCハンドラーの文字列引数バリデーションを `.trim()` 3段階パターンで統一する

### 2.2 最終ゴール

- 全IPCハンドラーで文字列引数が3段階バリデーション（typeof → === "" → .trim() === ""）を通過すること
- バリデーションユーティリティ関数の共通化（オプション）
- 既存テストへのバリデーション境界値テスト追加

### 2.3 スコープ

#### 含むもの

- 既存IPCハンドラーのバリデーション調査（aiHandlers, communityHandlers, dashboardHandlers, authHandlers, skillCreatorHandlers）
- バリデーション不足箇所の特定と修正
- 共通バリデーションユーティリティ関数の作成（`validateStringArg(value, paramName)` 等）
- 修正箇所に対するテスト追加

#### 含まないもの

- skillFileHandlers.ts のバリデーション変更（既に実装済み）
- 非文字列引数（number, boolean等）のバリデーション
- Preload層のバリデーション（Main層のみ）

### 2.4 成果物

- `apps/desktop/src/main/ipc/utils/validateArgs.ts`（共通バリデーション関数）
- 各ハンドラーファイルの修正
- テストファイルの追加・修正
- Phase 1-12ワークフロー成果物

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9A-B（スキルファイルIPCハンドラー）が完了していること ✅
- TASK-9A-Bのバリデーションパターンが安定して動作していること ✅

### 3.2 依存タスク

- TASK-9A-B（完了済み）

### 3.3 必要な知識

- Electron IPC通信の仕組み（ipcMain.handle / ipcRenderer.invoke）
- TypeScriptの型ガード関数
- Vitest ESM環境でのIPCテストパターン（handlerMapキャプチャ方式）

### 3.4 推奨アプローチ

1. 全IPCハンドラーファイルの現状バリデーション調査（grep -rn "typeof\|trim()" apps/desktop/src/main/ipc/）
2. 共通バリデーション関数 `validateStringArg(value: unknown, paramName: string): string` を作成
3. 各ハンドラーに段階的に適用（1ファイルずつテスト追加→修正→検証）
4. 既存テストへの境界値テスト追加

### 3.5 実装課題と解決策（TASK-9A-Bからの学び）

| 課題                               | 原因                                                                                    | 解決策                                                                                                | 教訓                                                               |
| ---------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `.trim()` 境界値バリデーション漏れ | 空文字チェック（`=== ""`）だけでは空白のみ文字列が通過                                  | 3段階チェック: typeof → === "" → .trim() === ""                                                       | P42参照。文字列入力は常に `.trim()` を含める                       |
| 引数構造のハンドラー間差異         | 6ハンドラーで引数型が異なる（skillName+relativePath, skillName+relativePath+content等） | 共通化関数を引数名で個別呼び出し: `validateStringArg(args?.skillName, "skillName")`                   | 引数バリデーションは関数単位で共通化し、ハンドラー内で組み合わせる |
| エラーメッセージサニタイズとの連携 | バリデーションエラーは既知エラーではないためsanitizeErrorMessageの対象外                | バリデーションエラーは明確なメッセージ（"Invalid {paramName} parameter"）を返し、サニタイズ不要にする | バリデーション層とエラーサニタイズ層は独立して設計する             |

### 3.6 システム仕様書参照テーブル

| 仕様書                                  | 参照セクション                            | 用途                             |
| --------------------------------------- | ----------------------------------------- | -------------------------------- |
| security-electron-ipc.md                | IPCセキュリティ原則                       | バリデーション設計の原則確認     |
| api-ipc-agent.md                        | スキルファイルIPCセクション               | TASK-9A-Bの実装パターン参照      |
| architecture-implementation-patterns.md | .trim()境界値バリデーション標準化パターン | バリデーション実装パターンの正本 |
| lessons-learned.md                      | TASK-9A-B苦戦箇所4                        | .trim()バリデーション漏れの詳細  |

---

## 4. 実行手順

### Phase構成

| Phase | 名称                         | 目的                                     |
| ----- | ---------------------------- | ---------------------------------------- |
| 1     | 要件定義                     | 全IPCハンドラーのバリデーション現状調査  |
| 2     | 設計                         | 共通バリデーションユーティリティ設計     |
| 3     | 設計レビュー                 | レビューゲート                           |
| 4     | テスト作成                   | 境界値テストケース設計・作成             |
| 5     | 実装                         | 共通ユーティリティ作成・各ハンドラー修正 |
| 6-7   | テスト拡充・カバレッジ       | カバレッジ80%以上確認                    |
| 8-9   | リファクタリング・品質検証   | コード品質改善                           |
| 10-13 | レビュー・ドキュメント・完了 | 最終レビュー・PR                         |

### Phase 1: 要件定義

#### 目的

全IPCハンドラーの文字列引数バリデーション現状を調査し、不足箇所を特定する

#### 手順

1. `grep -rn "ipcMain.handle" apps/desktop/src/main/ipc/` で全ハンドラーを列挙
2. 各ハンドラーの引数バリデーションパターンを分析
3. 不足箇所（typeof未チェック, trim未使用, 空文字未チェック）をリスト化
4. 優先順位（セキュリティ影響度）を付与

#### 成果物

- バリデーション現状調査レポート
- 修正対象ハンドラー一覧

#### 完了条件

- [ ] 全IPCハンドラーの調査が完了
- [ ] 不足箇所が具体的に特定されている

### Phase 4-5: テスト作成・実装

#### 目的

共通バリデーション関数の作成と各ハンドラーへの適用

#### 手順

1. `validateStringArg(value: unknown, paramName: string): string` を作成
2. テストを先に書く（Red）: 空文字、空白のみ、undefined、null、number型の入力
3. 実装（Green）
4. 各ハンドラーに適用

#### 成果物

- `apps/desktop/src/main/ipc/utils/validateArgs.ts`
- `apps/desktop/src/main/ipc/utils/__tests__/validateArgs.test.ts`
- 各ハンドラーの修正コミット

#### 完了条件

- [ ] validateStringArg関数が作成されている
- [ ] 全対象ハンドラーで共通関数が使用されている
- [ ] 境界値テストが全PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 全IPCハンドラーで文字列引数が3段階バリデーションを通過する
- [ ] 共通バリデーション関数 `validateStringArg` が作成されている
- [ ] 空白のみの文字列（`"   "`）がバリデーションで拒否される

### 品質要件

- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 60%以上
- [ ] Function Coverage 80%以上
- [ ] ESLintエラー0件
- [ ] TypeScript型チェックエラー0件

### ドキュメント要件

- [ ] 実装ガイド（Part 1: 概念説明 + Part 2: 技術詳細）
- [ ] システム仕様書更新（security-electron-ipc.md等）
- [ ] documentation-changelog.md

---

## 6. 検証方法

### テストケース

| #   | 入力                    | 期待結果                                |
| --- | ----------------------- | --------------------------------------- |
| 1   | `undefined`             | エラー: "Invalid {paramName} parameter" |
| 2   | `null`                  | エラー                                  |
| 3   | `123` (number)          | エラー                                  |
| 4   | `""` (空文字)           | エラー                                  |
| 5   | `"   "` (空白のみ)      | エラー                                  |
| 6   | `"valid-input"`         | 正常処理                                |
| 7   | `" padded "` (前後空白) | 正常処理（trimされた値を使用）          |

### 検証手順

1. `pnpm --filter @repo/desktop exec vitest run src/main/ipc/` で全テスト実行
2. `--coverage` オプションでカバレッジ確認
3. `pnpm lint && pnpm typecheck` で品質確認

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                             |
| -------------------------------------- | ------ | -------- | ------------------------------------------------ |
| 既存テストの大量修正                   | 中     | 高       | P21/P35参照。影響範囲を事前調査し、段階的に適用  |
| バリデーション追加による既存機能の破壊 | 高     | 低       | 1ハンドラーずつ適用し、各段階でテスト実行        |
| 共通関数の設計が特定ハンドラーに偏る   | 中     | 中       | 全ハンドラーの引数パターンを事前調査してから設計 |

---

## 8. 参照情報

### 関連ドキュメント

- [security-electron-ipc.md](../../.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md) - IPCセキュリティ原則
- [api-ipc-agent.md](../../.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md) - IPC API仕様
- [architecture-implementation-patterns.md](../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md) - 実装パターン集
- [lessons-learned.md](../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md) - TASK-9A-B苦戦箇所

### 関連Pitfall

- P42: 文字列引数の.trim()バリデーション漏れ
- P21: 既存テストへのDI追加時の大規模修正
- P35: DI追加時のテストモック大規模修正

### 参考完了タスク

- TASK-9A-B（IPC ファイルハンドラー追加）- バリデーションパターンの原型

---

## 9. 備考

### 補足事項

- TASK-9A-Bの `skillFileHandlers.ts` を参考実装として使用すること
- 共通バリデーション関数は `apps/desktop/src/main/ipc/utils/` に配置推奨
- handlerMapキャプチャ方式でのテスト実装については UT-9A-B-003 を参照
