# 受け入れ基準 - ConversionLogger サービス

## 要件情報

| 項目       | 内容             |
| ---------- | ---------------- |
| タスクID   | CONV-05-01       |
| 機能名     | ConversionLogger |
| バージョン | 1.0              |
| 作成日     | 2026-01-07       |
| 作成者     | Claude Code      |

---

## ユーザーストーリー

```
変換処理サービスとして、
ファイル変換の各ステップをログとして記録したい。
なぜなら、処理の追跡・デバッグ・監査が必要だから。
```

---

## 受け入れ基準

### AC-001: INFOログ記録（FR-001）

**カテゴリ**: 正常系

```gherkin
Scenario: INFOレベルのログを正常に記録できる
  Given ConversionLoggerインスタンスが生成されている
    And LogRepositoryがモックとして注入されている
  When info()メソッドを以下の入力で呼び出す
    | fileId     | file-123   |
    | fileName   | test.md    |
    | action     | convert    |
    | message    | 変換開始   |
  Then Result.successがtrueである
    And Result.dataのlevelが"info"である
    And Result.dataのfileIdが"file-123"である
    And Result.dataのidがUUID形式である
    And Result.dataのtimestampがDate型である
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-002: WARNログ記録（FR-002）

**カテゴリ**: 正常系

```gherkin
Scenario: WARNレベルのログを正常に記録できる
  Given ConversionLoggerインスタンスが生成されている
  When warn()メソッドを以下の入力で呼び出す
    | fileId     | file-456   |
    | fileName   | large.pdf  |
    | action     | convert    |
    | message    | ファイルサイズが大きい |
  Then Result.successがtrueである
    And Result.dataのlevelが"warn"である
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-003: ERRORログ記録（FR-003）

**カテゴリ**: 正常系

```gherkin
Scenario: ERRORレベルのログをスタックトレース付きで記録できる
  Given ConversionLoggerインスタンスが生成されている
    And エラーオブジェクトが存在する
      | message | 変換に失敗しました |
      | stack   | Error: 変換に失敗しました\n    at convert... |
  When error()メソッドを以下の入力とErrorオブジェクトで呼び出す
    | fileId     | file-789   |
    | fileName   | corrupt.doc |
    | action     | convert    |
    | message    | 変換失敗   |
  Then Result.successがtrueである
    And Result.dataのlevelが"error"である
    And Result.dataのdetails.errorMessageが"変換に失敗しました"である
    And Result.dataのdetails.errorStackが定義されている
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-004: ERRORログ記録（Errorオブジェクトなし）

**カテゴリ**: 代替系

```gherkin
Scenario: ERRORログをErrorオブジェクトなしで記録できる
  Given ConversionLoggerインスタンスが生成されている
  When error()メソッドをErrorオブジェクトなしで呼び出す
    | fileId     | file-999   |
    | fileName   | unknown.txt |
    | action     | convert    |
    | message    | 不明なエラー |
  Then Result.successがtrueである
    And Result.dataのlevelが"error"である
    And Result.dataのdetails.errorStackがundefinedである
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Should

---

### AC-005: バッファリング動作（FR-004）

**カテゴリ**: 正常系

```gherkin
Scenario: ログがバッファに蓄積される
  Given ConversionLoggerインスタンスが生成されている
    And bufferSizeが100に設定されている
  When info()を3回呼び出す
  Then バッファに3件のログが蓄積されている
    And LogRepository.bulkInsertは呼び出されていない
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-006: サイズベース自動フラッシュ（FR-005）

**カテゴリ**: 正常系

```gherkin
Scenario: バッファサイズ到達時に自動フラッシュされる
  Given ConversionLoggerインスタンスが生成されている
    And bufferSizeが2に設定されている
    And LogRepositoryのモックが設定されている
  When info()を2回呼び出す
  Then LogRepository.bulkInsertが1回呼び出されている
    And bulkInsertに渡されたログ配列の長さが2である
    And バッファが空になっている
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-007: 時間ベース自動フラッシュ（FR-006）

**カテゴリ**: 正常系

```gherkin
Scenario: 指定時間経過後に自動フラッシュされる
  Given ConversionLoggerインスタンスが生成されている
    And flushIntervalMsが100msに設定されている
    And info()を1回呼び出している
  When 100ms以上経過する
  Then LogRepository.bulkInsertが呼び出されている
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-008: バッチログ記録（FR-007）

**カテゴリ**: 正常系

```gherkin
Scenario: 複数ログを一括で記録できる
  Given ConversionLoggerインスタンスが生成されている
  When batch()メソッドを以下の入力で呼び出す
    | level | fileId | fileName | action  | message |
    | info  | 1      | a.md     | convert | 開始    |
    | warn  | 2      | b.md     | convert | 警告    |
    | error | 3      | c.md     | convert | 失敗    |
  Then Result.successがtrueである
    And Result.dataの長さが3である
    And Result.data[0].levelが"info"である
    And Result.data[1].levelが"warn"である
    And Result.data[2].levelが"error"である
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Should

---

### AC-009: 手動フラッシュ（FR-008）

**カテゴリ**: 正常系

```gherkin
Scenario: flush()で明示的にバッファを保存できる
  Given ConversionLoggerインスタンスが生成されている
    And info()を3回呼び出している
    And バッファに3件のログがある
  When flush()を呼び出す
  Then Result.successがtrueである
    And LogRepository.bulkInsertが呼び出されている
    And bulkInsertに渡されたログ配列の長さが3である
    And バッファが空になっている
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-010: 空バッファのフラッシュ

**カテゴリ**: エッジケース

```gherkin
Scenario: 空のバッファをフラッシュしてもエラーにならない
  Given ConversionLoggerインスタンスが生成されている
    And バッファが空である
  When flush()を呼び出す
  Then Result.successがtrueである
    And LogRepository.bulkInsertは呼び出されていない
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-011: リソース解放（FR-009）

**カテゴリ**: 正常系

```gherkin
Scenario: dispose()でリソースが正しく解放される
  Given ConversionLoggerインスタンスが生成されている
    And 自動フラッシュタイマーが動作している
    And バッファに2件のログがある
  When dispose()を呼び出す
  Then 自動フラッシュタイマーが停止している
    And LogRepository.bulkInsertが呼び出されている
    And バッファが空になっている
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

### AC-012: Repository障害時のエラーハンドリング

**カテゴリ**: 異常系

```gherkin
Scenario: LogRepository障害時にエラーが正しく伝播する
  Given ConversionLoggerインスタンスが生成されている
    And LogRepository.bulkInsertがエラーを返すように設定されている
    And バッファに1件以上のログがある
  When flush()を呼び出す
  Then Result.successがfalseである
    And Result.errorがError型である
```

**検証方法**: [x] 自動テスト [ ] 手動テスト
**優先度**: Must

---

## バリデーションルール

### 入力バリデーション

| フィールド   | ルール                                | エラー時の動作          |
| ------------ | ------------------------------------- | ----------------------- |
| fileId       | 必須、string型                        | Zodバリデーションエラー |
| fileName     | 必須、string型                        | Zodバリデーションエラー |
| action       | 必須、LogAction enum値                | Zodバリデーションエラー |
| message      | 必須、string型                        | Zodバリデーションエラー |
| conversionId | オプション、string型                  | -                       |
| details      | オプション、Record<string, unknown>型 | -                       |
| durationMs   | オプション、number型                  | -                       |

---

## エッジケース

### 境界値

| ケース           | 入力               | 期待結果             |
| ---------------- | ------------------ | -------------------- |
| バッファサイズ=1 | bufferSize: 1      | 毎回フラッシュされる |
| バッファサイズ=0 | bufferSize: 0      | 即座にフラッシュ     |
| フラッシュ間隔=0 | flushIntervalMs: 0 | タイマーが無効       |
| 大量ログバッチ   | 1000件のバッチログ | 正常に処理される     |

### 特殊ケース

| ケース              | 条件                          | 期待結果                       |
| ------------------- | ----------------------------- | ------------------------------ |
| 空文字のfileId      | fileId: ""                    | バリデーションエラー（要検討） |
| 非常に長いmessage   | message: 10000文字            | 正常に記録される               |
| details内の循環参照 | details: { a: { b: [循環] } } | JSONシリアライズエラー         |
| 連続dispose呼び出し | dispose()を2回呼び出し        | 2回目は何もしない              |

---

## 非機能要件

### パフォーマンス

```gherkin
Scenario: ログ記録の応答時間
  Given ConversionLoggerインスタンスが生成されている
    And バッファに空きがある
  When info()を呼び出す
  Then 応答時間は1ms以内である
```

### 信頼性

```gherkin
Scenario: 正常終了時のデータ損失ゼロ
  Given ConversionLoggerインスタンスが生成されている
    And info()を100回呼び出している
  When dispose()を呼び出す
  Then LogRepository.bulkInsertに渡された合計ログ数が100である
```

---

## 完了の定義（DoD）

### コード完了

- [ ] ConversionLoggerクラスが実装されている
- [ ] IConversionLoggerインターフェースが定義されている
- [ ] Zodスキーマ（types.ts）が定義されている
- [ ] コードレビューが完了している
- [ ] 単体テストカバレッジが80%以上

### テスト完了

- [ ] すべての受け入れ基準（AC-001〜AC-012）がテストされている
- [ ] 自動テストがVitestで実装されている
- [ ] 統合テスト（LogRepository接続）が完了している

### ドキュメント完了

- [ ] JSDocコメントが記述されている
- [ ] 型定義が適切にエクスポートされている

---

## テストケースへのマッピング

| 受け入れ基準 | テストケースID                 | テストタイプ | 自動化 |
| ------------ | ------------------------------ | ------------ | ------ |
| AC-001       | info-log-normal                | 単体テスト   | [x]    |
| AC-002       | warn-log-normal                | 単体テスト   | [x]    |
| AC-003       | error-log-with-stack           | 単体テスト   | [x]    |
| AC-004       | error-log-without-error-object | 単体テスト   | [x]    |
| AC-005       | buffer-accumulation            | 単体テスト   | [x]    |
| AC-006       | auto-flush-on-size             | 単体テスト   | [x]    |
| AC-007       | auto-flush-on-interval         | 単体テスト   | [x]    |
| AC-008       | batch-logging                  | 単体テスト   | [x]    |
| AC-009       | manual-flush                   | 単体テスト   | [x]    |
| AC-010       | flush-empty-buffer             | 単体テスト   | [x]    |
| AC-011       | dispose-cleanup                | 単体テスト   | [x]    |
| AC-012       | repository-error-handling      | 統合テスト   | [x]    |

---

## 承認

| 役割       | 氏名 | 日付 | 承認 |
| ---------- | ---- | ---- | ---- |
| 技術リード | -    | -    | [ ]  |
