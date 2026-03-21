# Phase 1: 要件定義 - UT-TASK06-007-EXT-006

## 実施日

2026-03-21

## 対象関数/パターンの仕様確認結果

| #   | 関数/パターン名               | 行番号   | export状態 | 役割                                                            |
| --- | ----------------------------- | -------- | ---------- | --------------------------------------------------------------- |
| 1   | `normalizeTypeAnnotation()`   | L68-73   | 非export   | 型アノテーションから arrow function / default / readonly を除去 |
| 2   | `isPrimitiveTypeAnnotation()` | L76-88   | 非export   | union 型の各パーツが `PRIMITIVE_TS_TYPES` に全て含まれるか判定  |
| 3   | `mergeChannelMaps()`          | L271-284 | 非export   | 複数ファイルからチャンネルマップをマージ（先勝ち）              |
| 4   | `CHANNEL_OBJECT_PATTERN`      | L53-54   | 非export   | `const XXX = { ... } as const` パターンの正規表現               |
| 5   | `PRELOAD_CALL_START_PATTERN`  | L56-57   | 非export   | `safeInvoke()` / `safeOn()` 開始箇所を検出する正規表現          |

## テスト戦略

**export追加 + 直接テスト**

理由:

1. `normalizeTypeAnnotation` と `isPrimitiveTypeAnnotation` は純粋関数であり、直接テストが最も効率的
2. 間接テスト（`extractMainHandlers` / `extractPreloadEntries` 経由）では境界値テストの意図がぼやける
3. `export` キーワードの追加はロジック変更ではない
4. `mergeChannelMaps` は `fs.readFileSync` に依存するため、間接テストが困難

## 機能要件（FR-1〜FR-4: 合計20件）

### FR-1: normalizeTypeAnnotation テスト（5件）

| テストID | 入力                        | 期待出力            | 検証ポイント       |
| -------- | --------------------------- | ------------------- | ------------------ |
| T-N-01   | `"string"`                  | `"string"`          | パススルー         |
| T-N-02   | `"(value: string) => void"` | `"(value: string)"` | arrow function除去 |
| T-N-03   | `"string = 'default'"`      | `"string"`          | default value除去  |
| T-N-04   | `"readonly string[]"`       | `"string[]"`        | readonly除去       |
| T-N-05   | `"  string  "`              | `"string"`          | 前後空白のtrim     |

### FR-2: isPrimitiveTypeAnnotation テスト（6件）

| テストID | 入力                    | 期待出力 | 検証ポイント                             |
| -------- | ----------------------- | -------- | ---------------------------------------- |
| T-P-01   | `"string \| number"`    | `true`   | union型（全パーツがプリミティブ）        |
| T-P-02   | `"string & Branded"`    | `false`  | intersection型（ヒューリスティック外）   |
| T-P-03   | `""`                    | `false`  | 空文字列                                 |
| T-P-04   | `"readonly string[]"`   | `false`  | readonly配列（配列はプリミティブでない） |
| T-P-05   | `"string \| undefined"` | `true`   | undefined含みunion                       |
| T-P-06   | `"MyCustomType"`        | `false`  | カスタム型                               |

### FR-3: mergeChannelMaps テスト（4件）

| テストID | シナリオ                   | 期待動作                                           |
| -------- | -------------------------- | -------------------------------------------------- |
| T-M-01   | 1ファイルマージ            | resolveChannelMap結果と同一                        |
| T-M-02   | 2ファイルマージ            | 両ファイルのチャンネルが合算され、重複キーは先勝ち |
| T-M-03   | 空ファイルリスト           | 空Mapが返る                                        |
| T-M-04   | チャンネル定義なしファイル | 空Mapが返る                                        |

### FR-4: CHANNEL_OBJECT_PATTERN / PRELOAD_CALL_START_PATTERN テスト（5件）

| テストID | パターン対象               | 入力例                                                | 期待動作                  |
| -------- | -------------------------- | ----------------------------------------------------- | ------------------------- |
| T-R-01   | CHANNEL_OBJECT_PATTERN     | `const IPC = { A: 'a' } as const`                     | マッチする                |
| T-R-02   | CHANNEL_OBJECT_PATTERN     | `export const IPC = { A: 'a' } as const`              | exportありでもマッチする  |
| T-R-03   | CHANNEL_OBJECT_PATTERN     | `const IPC = { A: 'a' }`（as constなし）              | マッチしない              |
| T-R-04   | CHANNEL_OBJECT_PATTERN     | 複数 const object + 空 body                           | 全件抽出できる            |
| T-R-05   | PRELOAD_CALL_START_PATTERN | `safeInvoke<{...}>(...)` / `safeOn<SystemTheme>(...)` | generic付きでもマッチする |

## 非機能要件（NFR-1〜NFR-4）

| NFR-ID | 要件                        |
| ------ | --------------------------- |
| NFR-1  | 既存49テストが全PASS維持    |
| NFR-2  | Line Coverage 95%以上を維持 |
| NFR-3  | テスト追加数: 20件          |
| NFR-4  | テスト実行時間: 10秒以内    |

## 完了条件チェック

- [x] 対象5関数/パターンの仕様が確認されている
- [x] テスト戦略（export追加 + 直接テスト）が決定されている
- [x] FR-1〜FR-4の機能要件が定義されている（合計20件）
- [x] NFR-1〜NFR-4の非機能要件が定義されている
- [x] 本Phase内の全タスクを100%実行完了
