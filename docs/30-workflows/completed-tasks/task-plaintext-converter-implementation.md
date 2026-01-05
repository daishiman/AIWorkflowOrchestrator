# PlainTextConverter 実装 - タスク指示書

## メタ情報

| 項目             | 内容                                     |
| ---------------- | ---------------------------------------- |
| タスクID         | QUALITY-02                               |
| タスク名         | PlainTextConverter 実装                  |
| 分類             | 新規機能/コンバーター追加                |
| 対象機能         | テキストファイル変換                     |
| 優先度           | 中                                       |
| 見積もり規模     | 小規模（約2時間）                        |
| ステータス       | 未実施                                   |
| 発見元           | Phase 8 手動テスト検証                   |
| 発見日           | 2025-12-25                               |
| 発見エージェント | Phase 8 Manual Testing (text-converters) |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 8の手動テスト検証時に、PlainTextConverterが未実装であることが判明しました。

**現状**:

- HTMLConverter, CSVConverter, JSONConverterは実装済み
- PlainTextConverterは `base-converter.ts` の例示に記載されているが、実際には未実装
- `converters/index.ts` に登録されていない

**影響**:

- プレーンテキストファイル（.txt, .log, .conf等）の変換品質が低下
- BOM（Byte Order Mark）が除去されない
- 改行コードの統一がされない
- ファイル形式の自動判定でプレーンテキストが適切に処理されない可能性

### 1.2 問題点・課題

#### 問題1: BOM除去機能の欠如

UTF-8 BOM（`\uFEFF`）付きファイルをそのまま処理すると、以下の問題が発生：

- テキスト先頭に不可視文字が残る
- 検索・マッチングに失敗する
- 下流処理でエラーの原因となる

#### 問題2: 改行コード正規化の欠如

Windows（CRLF）、Unix（LF）、Mac（CR）の改行コードが混在すると：

- テキスト処理の一貫性が失われる
- 検索結果が不正確になる
- メタデータ抽出（行数カウント等）が不正確

#### 問題3: プレーンテキストのメタデータ抽出

プレーンテキスト特有のメタデータ：

- 行数
- 単語数
- 文字エンコーディング
- ファイル形式（ログファイル、設定ファイル等の推定）

### 1.3 放置した場合の影響

**短期的影響**:

- プレーンテキストファイルの検索精度低下
- BOM付きファイルでの問題発生
- ユーザー体験の低下

**長期的影響**:

- サポートファイル形式の制限
- RAG機能の精度低下（プレーンテキストが多い場合）
- 技術的負債の蓄積

---

## 2. 何を達成するか（What）

### 2.1 目的

プレーンテキストファイル用のコンバーターを実装し、BOM除去・改行コード正規化・メタデータ抽出機能を提供する。

### 2.2 最終ゴール

- **BOM除去**: UTF-8/UTF-16/UTF-32 BOMの自動除去
- **改行コード正規化**: CRLF/CR → LF統一
- **メタデータ抽出**: 行数、単語数、エンコーディング検出
- **コンバーター登録**: グローバルレジストリへの登録
- **テストカバレッジ**: ≥95%
- **ドキュメント**: JSDoc完備

### 2.3 スコープ

#### 含むもの

1. **PlainTextConverterクラス実装**
   - BaseConverterを継承
   - BOM除去機能
   - 改行コード正規化機能
   - メタデータ抽出

2. **BOM検出・除去**
   - UTF-8 BOM (`\uFEFF`, `0xEF 0xBB 0xBF`)
   - UTF-16 BE BOM (`0xFE 0xFF`)
   - UTF-16 LE BOM (`0xFF 0xFE`)
   - UTF-32 BOM

3. **改行コード正規化**
   - CRLF (`\r\n`) → LF (`\n`)
   - CR (`\r`) → LF (`\n`)
   - 混在パターンの処理

4. **メタデータ抽出**
   - 行数カウント
   - 単語数カウント（スペース区切り）
   - 文字数カウント
   - エンコーディング推定

5. **レジストリ登録**
   - `converters/index.ts` への追加
   - MIMEタイプ設定: `text/plain`
   - 優先度設定: 0（標準）

6. **ユニットテスト**
   - BOM除去テスト（各BOMタイプ）
   - 改行コード正規化テスト（CRLF, CR, 混在）
   - メタデータ抽出テスト
   - エッジケーステスト（空ファイル、巨大ファイル）

#### 含まないもの

- バイナリファイルの処理
- 文字エンコーディング変換（UTF-8以外への変換）
- 自然言語処理（言語検出、センチメント分析等）
- ファイル形式の詳細推定（ログパーサー、設定ファイルパーサー等）

### 2.4 成果物

| 成果物             | パス                                                                                        | 内容             |
| ------------------ | ------------------------------------------------------------------------------------------- | ---------------- |
| PlainTextConverter | `packages/shared/src/services/conversion/converters/plain-text-converter.ts`                | コンバーター実装 |
| ユニットテスト     | `packages/shared/src/services/conversion/converters/__tests__/plain-text-converter.test.ts` | テストスイート   |
| 更新されたindex.ts | `packages/shared/src/services/conversion/converters/index.ts`                               | コンバーター登録 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- BaseConverterクラスが実装済み
- ConverterRegistryが実装済み
- TypeScript環境がセットアップ済み
- 既存コンバーター（HTML, CSV, JSON）が正常動作

### 3.2 依存タスク

- なし（独立したコンバーター追加タスク）

### 3.3 必要な知識・スキル

- TypeScript
- 文字エンコーディング（BOM、改行コード）
- Template Methodパターン（BaseConverter継承）
- ユニットテスト（Vitest）
- 正規表現

### 3.4 推奨アプローチ

**アプローチ**: TDDサイクル（Red → Green → Refactor）

1. **Red**: テストケースを先に作成（失敗することを確認）
2. **Green**: 最小限の実装でテストをパスさせる
3. **Refactor**: コード品質を向上させる
4. **Extend**: エッジケースのテストを追加

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義 → Phase 1: テスト作成（TDD Red）→
Phase 2: 実装（TDD Green）→ Phase 3: リファクタリング →
Phase 4: レジストリ登録 → Phase 5: 品質検証
```

---

### Phase 0: 要件定義

#### 目的

PlainTextConverterの詳細仕様を確定する。

#### Claude Code スラッシュコマンド

```
/ai:gather-requirements plain-text-converter
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/req-analyst.md`
- **選定理由**: 要件の詳細化と仕様確定に特化
- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] サポートするBOMタイプが明確
- [ ] 改行コード正規化ルールが明確
- [ ] メタデータ抽出項目が明確

---

### Phase 1: テスト作成（TDD Red）

#### T-01-1: ユニットテスト作成

##### 目的

TDDの「Red」フェーズとして、実装前にテストを作成する。

##### Claude Code スラッシュコマンド

```
/ai:create-test packages/shared/src/services/conversion/converters/plain-text-converter.ts --test-type=unit
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/unit-tester.md`
- **選定理由**: ユニットテスト作成に特化
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                                          | 活用方法               | 選定理由           |
| ------------------------------------------------- | ---------------------- | ------------------ |
| `.claude/skills/tdd-principles/SKILL.md`          | TDDサイクルの適用      | Red-Green-Refactor |
| `.claude/skills/boundary-value-analysis/SKILL.md` | エッジケーステスト設計 | 境界値分析         |

- **参照**: `.claude/skills/skill_list.md`

##### テストケース一覧

1. **プロパティテスト**:
   - `should have correct id: "plain-text-converter"`
   - `should have correct name: "Plain Text Converter"`
   - `should support text/plain mime type`
   - `should have priority 0`

2. **BOM除去テスト**:
   - `should remove UTF-8 BOM`
   - `should remove UTF-16 BE BOM`
   - `should remove UTF-16 LE BOM`
   - `should handle text without BOM`

3. **改行コード正規化テスト**:
   - `should normalize CRLF to LF`
   - `should normalize CR to LF`
   - `should handle mixed line endings`
   - `should preserve LF`

4. **メタデータ抽出テスト**:
   - `should count lines correctly`
   - `should count words correctly`
   - `should count characters correctly`
   - `should extract encoding information`

5. **エッジケーステスト**:
   - `should handle empty file`
   - `should handle single line without newline`
   - `should handle file with only whitespace`
   - `should handle very long lines`

##### 完了条件

- [ ] 20個以上のテストケースが作成されている
- [ ] テストが全て失敗する（実装前なのでRed状態）
- [ ] テストコードにコンパイルエラーがない

---

### Phase 2: 実装（TDD Green）

#### T-02-1: PlainTextConverter実装

##### 目的

TDDの「Green」フェーズとして、テストをパスさせる最小限の実装を行う。

##### Claude Code スラッシュコマンド

```
/ai:implement-business-logic --file=packages/shared/src/services/conversion/converters/plain-text-converter.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`
- **選定理由**: ビジネスロジック実装に特化
- **参照**: `.claude/agents/agent_list.md`

##### 実装方針

**クラス設計**:

````typescript
/**
 * PlainTextConverter
 *
 * プレーンテキストファイルを処理するコンバーター。
 * BOM除去、改行コード正規化、基本的なメタデータ抽出を行う。
 *
 * @example
 * ```typescript
 * const converter = new PlainTextConverter();
 * const result = await converter.convert({
 *   fileId: createFileId("file-1"),
 *   filePath: "/path/to/file.txt",
 *   mimeType: "text/plain",
 *   content: "\uFEFFHello\r\nWorld",
 *   encoding: "utf-8"
 * });
 * // result.data.convertedContent === "Hello\nWorld"
 * ```
 */
export class PlainTextConverter extends BaseConverter {
  readonly id = "plain-text-converter";
  readonly name = "Plain Text Converter";
  readonly supportedMimeTypes = ["text/plain"] as const;
  readonly priority = 0; // 標準優先度（フォールバック）

  protected async doConvert(
    input: ConverterInput,
    options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    try {
      let text = this.getTextContent(input);

      // Step 1: BOM除去
      text = this.removeBOM(text);

      // Step 2: 改行コード正規化
      text = this.normalizeLineEndings(text);

      // Step 3: メタデータ抽出
      const metadata = this.extractPlainTextMetadata(text);
      const baseMetadata = MetadataExtractor.extractFromText(text, options);

      return ok({
        convertedContent: text,
        extractedMetadata: { ...baseMetadata, ...metadata },
        processingTime: 0,
      });
    } catch (error) {
      return err(
        createRAGError(
          ErrorCodes.CONVERSION_FAILED,
          `Failed to convert plain text: ${error instanceof Error ? error.message : String(error)}`,
          { converterId: this.id, fileId: input.fileId },
        ),
      );
    }
  }

  /**
   * BOMを除去
   *
   * @param text - 入力テキスト
   * @returns BOM除去後のテキスト
   */
  private removeBOM(text: string): string {
    // UTF-8 BOM
    if (text.charCodeAt(0) === 0xfeff) {
      return text.substring(1);
    }
    return text;
  }

  /**
   * 改行コードをLFに統一
   *
   * @param text - 入力テキスト
   * @returns 正規化後のテキスト
   */
  private normalizeLineEndings(text: string): string {
    return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  /**
   * プレーンテキスト固有のメタデータを抽出
   *
   * @param text - テキスト
   * @returns メタデータ
   */
  private extractPlainTextMetadata(text: string) {
    return {
      lineCount: text.split("\n").length,
      wordCount: text.split(/\s+/).filter((w) => w.length > 0).length,
      charCount: text.length,
    };
  }
}
````

##### 成果物

| 成果物             | パス                                                                         | 内容             |
| ------------------ | ---------------------------------------------------------------------------- | ---------------- |
| PlainTextConverter | `packages/shared/src/services/conversion/converters/plain-text-converter.ts` | コンバーター実装 |

##### 完了条件

- [ ] PlainTextConverterクラスが実装されている
- [ ] 全テストがパスしている
- [ ] Lintエラーがない
- [ ] 型エラーがない

---

### Phase 3: リファクタリング

#### T-03-1: コード品質向上

##### 目的

TDDの「Refactor」フェーズとして、コード品質を向上させる。

##### Claude Code スラッシュコマンド

```
/ai:refactor --target=packages/shared/src/services/conversion/converters/plain-text-converter.ts --focus=readability
```

- **参照**: `.claude/commands/ai/command_list.md`

##### リファクタリング観点

- [ ] 関数の分割（1関数20行以内）
- [ ] マジックナンバーの定数化
- [ ] コメントの充実
- [ ] エラーメッセージの改善

##### 完了条件

- [ ] コード品質スコア ≥8.5/10
- [ ] 全テストがパスしている（機能不変）

---

### Phase 4: レジストリ登録

#### T-04-1: コンバーター登録

##### 目的

PlainTextConverterをグローバルレジストリに登録し、システム全体で使用可能にする。

##### Claude Code スラッシュコマンド

```
# index.tsを更新
/ai:refactor --target=packages/shared/src/services/conversion/converters/index.ts --pattern=add-converter
```

##### 更新内容

**ファイル**: `converters/index.ts`

```typescript
// Export追加
export { PlainTextConverter } from "./plain-text-converter";

// Import追加
import { PlainTextConverter } from "./plain-text-converter";

// registerDefaultConvertersに追加
const converters = [
  new HTMLConverter(), // priority: 10
  new JSONConverter(), // priority: 5
  new CSVConverter(), // priority: 5
  new PlainTextConverter(), // priority: 0 (フォールバック)
];
```

##### 完了条件

- [ ] PlainTextConverterがエクスポートされている
- [ ] registerDefaultConvertersに登録されている
- [ ] 優先度が正しく設定されている（priority: 0）

---

### Phase 5: 品質検証

#### T-05-1: 統合テスト実施

##### 目的

PlainTextConverterが既存システムと正常に統合されることを確認する。

##### Claude Code スラッシュコマンド

```
# 全コンバーターテスト実行
pnpm --filter @repo/shared test:run converters

# カバレッジ確認
pnpm --filter @repo/shared test:coverage
```

##### 品質基準

| メトリクス       | 目標値       | 確認方法                      |
| ---------------- | ------------ | ----------------------------- |
| テスト成功率     | 100%         | `pnpm test`                   |
| コードカバレッジ | ≥95%         | `pnpm test:coverage`          |
| Lintエラー       | 0            | `pnpm lint`                   |
| 型エラー         | 0            | `pnpm typecheck`              |
| レジストリ登録   | 4 converters | `registerDefaultConverters()` |

##### 完了条件

- [ ] 全品質基準を満たしている
- [ ] 既存コンバーターの動作に影響なし
- [ ] PlainTextConverterが正しく登録されている

---

## 5. 品質基準

### 5.1 機能要件

- [ ] UTF-8 BOMが除去される
- [ ] 改行コードがLFに統一される
- [ ] 行数・単語数・文字数が正確にカウントされる
- [ ] text/plain MIMEタイプをサポートする

### 5.2 非機能要件

- [ ] 変換速度: 1MB以下のファイルで < 100ms
- [ ] メモリ使用量: ファイルサイズの3倍以内
- [ ] エラーハンドリング: 全例外が適切に処理される

### 5.3 コード品質要件

- [ ] コード品質スコア ≥8.5/10
- [ ] Lintエラー 0
- [ ] 型エラー 0
- [ ] テストカバレッジ ≥95%
- [ ] JSDocコメント完備

---

## 6. テスト戦略

### 6.1 BOM除去テスト

| テストケース  | 入力          | 期待出力 |
| ------------- | ------------- | -------- |
| UTF-8 BOM     | `\uFEFFHello` | `Hello`  |
| UTF-16 BE BOM | `\uFEFFHello` | `Hello`  |
| BOMなし       | `Hello`       | `Hello`  |
| 空ファイル    | `""`          | `""`     |

### 6.2 改行コード正規化テスト

| テストケース | 入力             | 期待出力       |
| ------------ | ---------------- | -------------- |
| CRLF         | `Line1\r\nLine2` | `Line1\nLine2` |
| CR           | `Line1\rLine2`   | `Line1\nLine2` |
| LF           | `Line1\nLine2`   | `Line1\nLine2` |
| 混在         | `A\r\nB\rC\nD`   | `A\nB\nC\nD`   |

### 6.3 メタデータ抽出テスト

| テストケース | 入力              | 期待メタデータ                  |
| ------------ | ----------------- | ------------------------------- |
| 単一行       | `Hello World`     | `lines: 1, words: 2, chars: 11` |
| 複数行       | `A\nB\nC`         | `lines: 3, words: 3, chars: 5`  |
| 空白のみ     | `   \n  `         | `lines: 2, words: 0, chars: 6`  |
| 日本語       | `こんにちは 世界` | `lines: 1, words: 2, chars: 8`  |

---

## 7. リスク管理

### 7.1 リスク一覧

| リスク                   | 発生確率 | 影響度 | 対策                           |
| ------------------------ | -------- | ------ | ------------------------------ |
| BOM検出ロジックのバグ    | 中       | 中     | 各BOMタイプを個別テスト        |
| 改行コード正規化の不完全 | 低       | 低     | 正規表現の徹底テスト           |
| パフォーマンス問題       | 低       | 中     | 大きなファイルでのベンチマーク |
| 既存システムへの影響     | 極低     | 高     | 統合テストで検証               |

### 7.2 ロールバック計画

実装後に問題が発生した場合：

1. `converters/index.ts` からPlainTextConverter登録を削除
2. Git commitをrevert
3. 問題を修正後に再実装

---

## 8. 見積もり

| Phase    | 作業項目              | 見積時間             |
| -------- | --------------------- | -------------------- |
| Phase 0  | 要件定義              | 15分                 |
| Phase 1  | テスト作成（TDD Red） | 30分                 |
| Phase 2  | 実装（TDD Green）     | 40分                 |
| Phase 3  | リファクタリング      | 20分                 |
| Phase 4  | レジストリ登録        | 10分                 |
| Phase 5  | 品質検証              | 15分                 |
| **合計** |                       | **130分（約2時間）** |

---

## 9. 参照

### 9.1 関連ドキュメント

- Phase 8 手動テスト結果（本タスクの発見元）
- `docs/30-workflows/text-converters/manual-test-results.md`
- `packages/shared/src/services/conversion/base-converter.ts` (実装例)
- `.claude/skills/tdd-principles/SKILL.md`

### 9.2 関連コード

- `packages/shared/src/services/conversion/base-converter.ts`
- `packages/shared/src/services/conversion/converters/html-converter.ts` (参考実装)
- `packages/shared/src/services/conversion/converters/index.ts`

---

## 10. 備考

### 10.1 Phase 8手動テスト結果

**テストケース1,2の結果**:

- PlainTextConverter: SKIP（未実装）
- 影響: プレーンテキストファイルの変換品質

**他のコンバーター**:

- HTMLConverter: 47 tests PASS
- CSVConverter: 39 tests PASS
- JSONConverter: 34 tests PASS
- 総計: 132/132 tests PASS (100%)

### 10.2 優先順位の判断基準

このタスクは「中」優先度としている理由：

- プレーンテキストファイルの使用頻度が中程度
- 既存コンバーターで多くのファイル形式をカバー済み
- BOM問題は特定環境でのみ発生
- 実施工数が小規模（約2時間）

**推奨実施タイミング**: 次のスプリントまたはプレーンテキストファイル処理の品質向上が必要になったタイミング

---

**タスク作成日**: 2025-12-25
**作成者**: Phase 8 Manual Testing Results
**最終更新**: 2025-12-25
