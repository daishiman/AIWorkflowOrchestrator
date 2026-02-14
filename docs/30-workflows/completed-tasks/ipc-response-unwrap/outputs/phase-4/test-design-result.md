# Phase 4: テスト作成結果 (TDD Red)

## タスクID

UT-FIX-IPC-RESPONSE-UNWRAP-001

## テスト設計サマリ

### 新規テストファイル

- **ファイル**: `apps/desktop/src/preload/__tests__/skill-api.unwrap.test.ts`
- **テストケース数**: 25

### テストカテゴリ構成

| カテゴリ                                   | テスト数 | 内容                                                                                      |
| ------------------------------------------ | -------- | ----------------------------------------------------------------------------------------- |
| 1. safeInvokeUnwrap レスポンスラッパー展開 | 5        | 配列展開、オブジェクト展開、エラースロー、デフォルトエラー、許可チャンネル検証            |
| 2. skill-api メソッド展開テスト            | 8        | list(), getImported(), rescan() の正常系・異常系、import() の直接返却パターン             |
| 3. エッジケーステスト                      | 7        | data未存在、success未存在、null応答、undefined応答、reject伝播、data:null、data:undefined |
| 4. 境界値テスト                            | 5        | 空配列、100件配列、単一要素配列、空文字列エラー、長いエラーメッセージ                     |

### テスト設計方針

- **TDD Red-Green-Refactor**: Phase 4でテストケースを設計し、Phase 5で実装してGreenにする
- **テストフィクスチャ**: `createMockSkillMetadata()` と `createMockImportedSkill()` ヘルパーを使用
- **モック戦略**: `vi.hoisted()` で electron モジュールをモック、`mockInvoke` で IPC 呼び出しをシミュレート

### 受入基準との対応

| AC#  | 受入基準                                    | テストケース                                             |
| ---- | ------------------------------------------- | -------------------------------------------------------- |
| AC-1 | getImported() が ImportedSkill[] を直接返す | セクション2: getImported() テスト                        |
| AC-2 | list() が SkillMetadata[] を直接返す        | セクション1: 配列展開テスト + セクション2: list() テスト |
| AC-3 | import() が ImportedSkill を直接返す        | セクション2: import() テスト                             |
| AC-4 | rescan() が SkillMetadata[] を直接返す      | セクション2: rescan() テスト                             |
| AC-5 | forEach が正常動作                          | セクション1: 配列展開でArray.isArray確認                 |
| AC-6 | 型注釈と実行時値の一致                      | セクション1: ラッパーオブジェクト非返却検証              |
| AC-7 | 既存テストが全PASS                          | 既存テストのモック値更新で対応                           |

## 完了条件

- [x] テストケースが設計されている
- [x] テストコードが作成されている
- [x] 受入基準の全7項目がテストケースでカバーされている
- [x] エッジケース・境界値テストが含まれている
