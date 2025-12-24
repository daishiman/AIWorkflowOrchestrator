# ファイル変換基盤 - 設計レビュー報告書

## レビュー概要

| 項目                     | 内容                                        |
| ------------------------ | ------------------------------------------- |
| レビュー日               | 2025-12-20                                  |
| 対象フェーズ             | Phase 1（設計）                             |
| レビュー参加エージェント | .claude/agents/arch-police.md, .claude/agents/domain-modeler.md, .claude/agents/req-analyst.md |
| 対象ドキュメント数       | 6件                                         |

---

## 総合判定

### 判定結果

- [ ] PASS（問題なし）
- [x] **MINOR（軽微な改善推奨）**
- [ ] MAJOR（設計見直し必要）
- [ ] CRITICAL（要件から見直し必要）

### 判定理由

3つのレビュー観点すべてで **MINOR** と判定されました。設計の基本的な品質は高く、クリーンアーキテクチャ原則に準拠していますが、以下の軽微な改善が推奨されます：

1. **MetadataExtractor設計書の欠落**（要件充足性）
2. **既存型定義との整合性**（アーキテクチャ、要件充足性）
3. **ドメイン用語の一貫性**（ドメインモデル）

これらはすべて実装前に対応可能な範囲であり、設計の根本的な見直しは不要と判断されます。

---

## レビュー観点別評価

### 観点1: アーキテクチャ整合性 (.claude/agents/arch-police.md)

#### チェックリスト結果

| #   | チェック項目                    | 判定      |
| --- | ------------------------------- | --------- |
| 1   | レイヤー間の依存関係（DIP遵守） | **PASS**  |
| 2   | 抽象と具象の分離                | **MINOR** |
| 3   | クリーンアーキテクチャ原則      | **PASS**  |
| 4   | RAGアーキテクチャ整合性         | **MINOR** |

#### 指摘事項

**MINOR-A01: BaseConverterの配置が曖昧**

**問題箇所**: `design-base-converter.md`

- `BaseConverter`を`application/converters/`に配置しているが、抽象クラスの位置づけが不明確
- インターフェースと同列の「契約」か、実装支援クラスかが曖昧

**推奨改善策**:

```
選択肢B（推奨）: application/converters/support/base-converter.ts
```

- 実装支援用の抽象クラスとして明示
- ドメインの本質的な概念ではないため、applicationレイヤーが適切

---

**MINOR-A02: 既存IDocumentConverterとの関係が未定義**

**問題箇所**: 設計ドキュメント全般

既存コードベースに `IDocumentConverter` が存在:

```typescript
// packages/shared/src/features/rag/domain/interfaces/converters.ts
export interface IDocumentConverter {
  supportedFormats: string[];
  convert(
    content: Buffer | string,
    metadata: DocumentMetadata,
  ): Promise<Result<ConvertedDocument, ConversionError>>;
}
```

新設計の `IConverter` とのシグネチャ差異:

| 項目     | 既存 `IDocumentConverter`       | 新設計 `IConverter`          |
| -------- | ------------------------------- | ---------------------------- |
| 入力型   | `Buffer \| string` + `metadata` | `ConverterInput`             |
| 出力型   | `ConvertedDocument`             | `ConverterOutput`            |
| メソッド | `convert()`                     | `convert()` + `canConvert()` |

**推奨改善策**:

- 既存インターフェースとの関係（置き換え or 共存）を設計書に明記
- マイグレーション戦略を定義

---

**MINOR-A03: エラー型の階層構造が不明確**

**問題箇所**: `design-types.md`

既存の `ConversionError`（オブジェクトリテラル型）と新設計のクラスベースエラーの統合方針が不明確。

**推奨改善策**:

```typescript
// 新設計のクラスに統一し、互換性レイヤーを提供
export class ConversionError extends DomainError {
  // ... 新設計

  // 互換性メソッド
  toLegacy(): LegacyConversionError {
    return {
      code: this.code,
      message: this.message,
      originalError: this.cause as Error | undefined,
    };
  }
}
```

---

#### 良かった点

1. **依存方向の適切性**: infrastructure → application → domain の正しい依存方向
2. **DIP遵守**: `ConversionService`は`IConverter`インターフェースに依存
3. **境界明確**: ドメイン層にインフラストラクチャの詳細が混入していない

---

### 観点2: ドメインモデル妥当性 (.claude/agents/domain-modeler.md)

#### チェックリスト結果

| #   | チェック項目                     | 判定      |
| --- | -------------------------------- | --------- |
| 1   | ユビキタス言語                   | **MINOR** |
| 2   | エンティティ・値オブジェクト境界 | **PASS**  |
| 3   | ドメインルール表現               | **MINOR** |
| 4   | 将来拡張性                       | **PASS**  |

#### 指摘事項

**MINOR-D01: 用語の不整合（MimeType vs FileType）**

**問題箇所**: `design-types.md`

- 設計書: `MimeType` を使用
- マスター設計書: 「ファイル形式」「ファイルタイプ」を使用
- 既存スキーマ: `SupportedFileType` を使用

**推奨改善策**:

```typescript
/**
 * ファイル形式を表す値オブジェクト（ドメイン用語）
 * 例: 'pdf', 'markdown', 'docx'
 */
export type FileFormat = string;

/**
 * MIMEタイプ（技術的な詳細として内部で使用）
 */
export type MimeType = string;
```

---

**MINOR-D02: 優先度管理のドメインルールが散在**

**問題箇所**: `design-types.md`, `design-registry.md`

優先度に基づく処理順序決定のルールが明示されていない。

**推奨改善策**:

```typescript
/**
 * 変換優先度を表す値オブジェクト
 */
export class Priority {
  private constructor(private readonly value: number) {}

  static low(): Priority {
    return new Priority(1);
  }
  static normal(): Priority {
    return new Priority(5);
  }
  static high(): Priority {
    return new Priority(10);
  }
  static critical(): Priority {
    return new Priority(20);
  }

  isHigherThan(other: Priority): boolean {
    return this.value > other.value;
  }
}
```

---

**MINOR-D03: タイムアウトのドメインルールが不明確**

**問題箇所**: `design-service.md`

「変換は60秒以内に完了すべき」などのビジネスルールが明示されていない。

**推奨改善策**:
ドメインルールをドキュメント化:

```typescript
/**
 * 変換タイムアウトのドメインルール
 *
 * - 標準タイムアウト: 60秒
 * - ファイルサイズに応じた動的調整:
 *   - 10MB以下: 60秒
 *   - 10-100MB: 120秒
 *   - 100MB以上: 変換不可（エラー）
 */
```

---

**MINOR-D04: 不変条件の保護が不十分**

**問題箇所**: `design-types.md`

`ConverterInput.filePath` が空文字列や存在しないパスでも受け入れられる。

**推奨改善策**:

```typescript
// FilePath 値オブジェクトで不変条件を保護
export class FilePath {
  private constructor(private readonly value: string) {}

  static create(path: string): Result<FilePath, RAGError> {
    if (!path || path.trim() === "") {
      return err(
        createRAGError(ErrorCodes.INVALID_INPUT, "File path cannot be empty"),
      );
    }
    return ok(new FilePath(path));
  }

  toString(): string {
    return this.value;
  }
}
```

---

#### 良かった点

1. **階層化された抽象化**: IConverter → BaseConverter → 具象クラスの階層が明確
2. **値オブジェクトの適切な使用**: ConverterInput/Outputが不変データコンテナとして設計
3. **ドメインイベントの設計**: ConversionProgressが進捗をイベントとして表現

---

### 観点3: 要件充足性 (.claude/agents/req-analyst.md)

#### チェックリスト結果

| #   | チェック項目     | 判定      |
| --- | ---------------- | --------- |
| 1   | 機能要件反映     | **MINOR** |
| 2   | 非機能要件考慮   | **PASS**  |
| 3   | 受け入れ基準     | **MINOR** |
| 4   | 依存タスク整合性 | **MINOR** |

#### 指摘事項

**MINOR-R01: FR-5 MetadataExtractor設計書の欠落**

**問題箇所**: `requirements-foundation.md` FR-5

FR-5で定義された以下の要件に対応する設計書が存在しない:

- FR-5.1: タイトル抽出機能
- FR-5.2: 見出し抽出機能
- FR-5.3: コードブロック数カウント機能
- FR-5.4: リンク抽出機能
- FR-5.5: 言語検出機能
- FR-5.6: 単語数・行数・文字数カウント機能

**推奨対応**:

```
docs/30-workflows/conversion-base/design-metadata-extractor.md
```

を作成し、以下を含めること:

- MetadataExtractorクラスの詳細設計
- 各抽出メソッドの実装仕様
- 正規表現パターンの定義
- テスト戦略

---

**MINOR-R02: 既存型定義との重複・不整合**

**問題箇所**: `design-types.md`

| 設計書の型        | 既存の型                     | 関係               |
| ----------------- | ---------------------------- | ------------------ |
| `ConverterOutput` | `ConversionResult`           | ほぼ同等（重複）   |
| `IConverter`      | `Converter<TInput, TOutput>` | シグネチャが異なる |

**推奨改善策**:

1. `ConverterOutput`を内部用、`ConversionResult`を外部API用として明確に区別
2. 型定義の関係性を設計書に追記
3. インポートパスを正確に記載（`../../types/rag/entities.ts` → 実際のパスに修正）

---

**MINOR-R03: 受け入れ基準の形式改善**

**問題箇所**: `requirements-foundation.md`

現状のチェックボックス形式より、Given-When-Then形式が検証性を向上させる。

**推奨形式例**:

```markdown
##### AC-FR-1.1: コンバーターインターフェース定義

- **Given**: TypeScript 5.x環境
- **When**: IConverterインターフェースをimportする
- **Then**: id, name, supportedMimeTypes, priority, canConvert, convert, estimateProcessingTimeがすべて型定義されている
```

---

**MINOR-R04: エラーコード定義の確認**

**問題箇所**: 設計書全般

使用されているエラーコード（`CONVERSION_FAILED`, `TIMEOUT`, `RESOURCE_EXHAUSTED`等）が既存の`errors.ts`に定義されているか確認が必要。

**推奨対応**:
既存のエラーコード定義を確認し、不足している場合は追加要件として明記。

---

#### 良かった点

1. **一貫した設計パターン**: SOLID原則が全設計書で適用
2. **詳細なエラーハンドリング**: Result型の一貫使用
3. **テスト容易性**: 依存性注入、モック可能な設計
4. **パフォーマンス要件の具体化**: タイムアウト60秒、同時実行5件等
5. **拡張性の考慮**: customフィールドによる柔軟な拡張
6. **詳細なドキュメント**: 豊富なコード例、フロー図

---

## 統合指摘事項一覧

| ID       | 重要度 | 観点           | 項目                                 | 影響                          |
| -------- | ------ | -------------- | ------------------------------------ | ----------------------------- |
| MINOR-01 | 高     | 要件           | MetadataExtractor設計書欠落          | FR-5の実装が困難              |
| MINOR-02 | 中     | アーキテクチャ | 既存IDocumentConverterとの関係未定義 | 既存コードとの統合時の混乱    |
| MINOR-03 | 中     | アーキテクチャ | エラー型の階層構造不明確             | 既存エラー型との互換性問題    |
| MINOR-04 | 中     | 要件           | 既存型定義との重複・不整合           | インポートパス誤り、型の重複  |
| MINOR-05 | 低     | ドメイン       | 用語の不整合（MimeType vs FileType） | 用語集との不一致              |
| MINOR-06 | 低     | ドメイン       | 優先度管理のドメインルール散在       | ビジネスルールの不明確さ      |
| MINOR-07 | 低     | ドメイン       | タイムアウトルール不明確             | 60秒の根拠が不明              |
| MINOR-08 | 低     | ドメイン       | 不変条件の保護不十分                 | 空文字列のfilePathが許容      |
| MINOR-09 | 低     | 要件           | 受け入れ基準の形式                   | Given-When-Then形式が望ましい |
| MINOR-10 | 低     | 要件           | エラーコード定義の未確認             | 既存errors.tsとの整合性未確認 |

---

## 改善推奨アクション

### 優先度：高（Phase 3進行前に対応推奨）

| ID       | アクション                           | 対応工数 | 担当        |
| -------- | ------------------------------------ | -------- | ----------- |
| MINOR-01 | `design-metadata-extractor.md`の作成 | 2-4時間  | .claude/agents/schema-def.md |

### 優先度：中（Phase 4進行前に対応推奨）

| ID       | アクション                                   | 対応工数 | 担当         |
| -------- | -------------------------------------------- | -------- | ------------ |
| MINOR-02 | 既存IDocumentConverterとの関係を設計書に明記 | 1時間    | .claude/agents/arch-police.md |
| MINOR-03 | エラー型の統合方針を設計書に明記             | 1時間    | .claude/agents/arch-police.md |
| MINOR-04 | 既存型定義との関係性をdesign-types.mdに追記  | 1-2時間  | .claude/agents/schema-def.md  |

### 優先度：低（実装中に対応可）

| ID       | アクション                            | 対応工数 | 担当            |
| -------- | ------------------------------------- | -------- | --------------- |
| MINOR-05 | 用語集との一貫性確保                  | 30分     | .claude/agents/domain-modeler.md |
| MINOR-06 | Priority値オブジェクトの設計          | 1時間    | .claude/agents/domain-modeler.md |
| MINOR-07 | タイムアウトルールのドキュメント化    | 30分     | .claude/agents/req-analyst.md    |
| MINOR-08 | FilePath値オブジェクトの設計          | 1時間    | .claude/agents/schema-def.md     |
| MINOR-09 | 受け入れ基準のGiven-When-Then形式変換 | 2時間    | .claude/agents/req-analyst.md    |
| MINOR-10 | エラーコード一覧の確認と追加          | 30分     | .claude/agents/req-analyst.md    |

---

## レビュー結果詳細

### 良かった点（全観点共通）

#### 1. クリーンアーキテクチャ原則の適用

- レイヤー間の依存関係が適切
- 抽象と具象の分離が明確
- SOLID原則が一貫して適用

#### 2. Result型による型安全なエラーハンドリング

- 例外ではなくResult型を使用
- 既存RAGアーキテクチャのパターンと一貫

#### 3. テンプレートメソッドパターンの適切な適用

- BaseConverterで共通処理を抽象化
- 拡張ポイントが明確（preprocess, postprocess, doConvert）

#### 4. リポジトリパターンによる拡張性

- ConverterRegistryによるプラグイン機構
- 新規コンバーター追加時に既存コード変更不要

#### 5. パフォーマンス要件の具体化

- タイムアウト、同時実行制限が明確
- Promise.race()、チャンク処理による実装方法も設計

#### 6. 詳細なドキュメント

- コード例が豊富
- フロー図による可視化
- テスト戦略が明確

---

## 対応方針の提案

### 提案A: 高優先度のみ対応してPhase 3へ進む（推奨）

**対応項目**:

- MINOR-01: MetadataExtractor設計書の作成

**理由**:

- 他のMINOR指摘は実装中に対応可能
- MetadataExtractorのみ実装に直接影響

**想定工数**: 2-4時間

---

### 提案B: すべてのMINOR指摘に対応してからPhase 3へ進む

**対応項目**:

- すべてのMINOR指摘（MINOR-01～MINOR-10）

**理由**:

- 設計の完全性を確保
- 実装時の手戻りを最小化

**想定工数**: 8-12時間

---

### 提案C: MINOR指摘を記録してPhase 3へ進む

**対応項目**:

- なし（指摘事項を記録のみ）

**理由**:

- すべてMINOR判定であり、実装を阻害しない
- 実装中に具体的な問題が顕在化した時点で対応

**想定工数**: 0時間

---

## レビュー承認

### 承認条件

以下のいずれかの対応を選択し、実施すること:

- [ ] 提案A: MINOR-01のみ対応（推奨）
- [ ] 提案B: すべてのMINOR対応
- [ ] 提案C: 記録のみで進行

### 承認者

- **アーキテクチャ**: .claude/agents/arch-police.md - **MINOR承認**（軽微な改善推奨、実装進行可）
- **ドメインモデル**: .claude/agents/domain-modeler.md - **MINOR承認**（軽微な改善推奨、実装進行可）
- **要件充足**: .claude/agents/req-analyst.md - **MINOR承認**（軽微な改善推奨、実装進行可）

---

## 次のアクション

### Phase 3（テスト作成）へ進む場合

選択した対応方針（提案A/B/C）を実施後、以下のサブタスクを開始:

- T-03-1: 型定義テスト作成
- T-03-2: BaseConverterテスト作成
- T-03-3: Registryテスト作成
- T-03-4: Serviceテスト作成
- T-03-5: メタデータ抽出テスト作成

### Phase 1（設計）に戻る場合

MAJOR以上の問題がないため、Phase 1への戻りは不要と判断。

---

## 変更履歴

| 日付       | バージョン | 変更者 | 変更内容                     |
| ---------- | ---------- | ------ | ---------------------------- |
| 2025-12-20 | 1.0.0      | AI     | 初版作成（設計レビュー完了） |

## MINOR指摘対応完了報告

### 対応完了日時

2025-12-20

### 選択した提案

**提案B: すべてのMINOR対応（完了）**

### 対応サマリー

| ID           | 対応内容                         | 成果物                                    | ステータス |
| ------------ | -------------------------------- | ----------------------------------------- | ---------- |
| MINOR-01     | MetadataExtractor設計書作成      | design-metadata-extractor.md              | ✓ 完了     |
| MINOR-02     | 既存インターフェース統合方針策定 | existing-interface-migration.md           | ✓ 完了     |
| MINOR-03     | エラー型統合方針追記             | design-types.md（セクション3.4）          | ✓ 完了     |
| MINOR-04     | 既存型定義との関係性追記         | design-types.md（セクション1.3, 1.4, 9A） | ✓ 完了     |
| MINOR-05～08 | ドメインルール定義               | design-domain-rules.md                    | ✓ 完了     |
| MINOR-09     | 受け入れ基準Given-When-Then変換  | requirements-foundation.md                | ✓ 完了     |
| MINOR-10     | エラーコード分析                 | error-codes-analysis.md                   | ✓ 完了     |

### 新規追加ドキュメント（4件）

1. **design-metadata-extractor.md** - MetadataExtractor詳細設計（11章構成）
2. **existing-interface-migration.md** - 既存インターフェース統合方針（3パターン定義）
3. **error-codes-analysis.md** - エラーコード整合性分析（追加2件、代用2件）
4. **design-domain-rules.md** - ドメインルール定義（7章構成）

**Phase 2（設計レビューゲート）完了 - Phase 3へ進行可能 ✅**
