# 検索・置換機能 ユーティリティ改善 - タスク指示書

## メタ情報

| 項目             | 内容                                     |
| ---------------- | ---------------------------------------- |
| タスクID         | UTIL-SR-001                              |
| タスク名         | ユーティリティモジュール品質改善         |
| 分類             | リファクタリング                         |
| 対象機能         | generateId / FileReader / PatternMatcher |
| 優先度           | 低                                       |
| 見積もり規模     | 小規模                                   |
| ステータス       | 未実施                                   |
| 発見元           | Phase 7 - 最終レビューゲート             |
| 発見日           | 2025-12-12                               |
| 発見エージェント | .claude/agents/code-quality.md, .claude/agents/sec-auditor.md              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

検索・置換機能のT-07-1最終レビューにおいて、以下の3つの軽微な改善点が指摘された：

1. **generateId**: UUID v4への移行推奨
2. **FileReader**: エンコーディング自動検出の欠如
3. **PatternMatcher**: 追加ReDoSパターン検出

### 1.2 問題点・課題

#### generateId: UUID非使用

- 現在の実装は独自のID生成ロジックを使用
- UUID v4と比較して衝突確率が高い可能性
- 標準的なID形式ではないため、外部システムとの連携時に問題になる可能性

#### FileReader: エンコーディング検出なし

- 現在はUTF-8固定でファイルを読み込む
- Shift-JIS、EUC-JP等の日本語ファイルで文字化けが発生する可能性
- レガシーシステムからのファイルインポート時に問題

#### PatternMatcher: 追加ReDoSパターン

- 現在の検出パターンでは一部のReDoS脆弱性パターンを見逃す可能性
- より包括的な検出パターンが推奨される

### 1.3 放置した場合の影響

- **generateId**: 大量トランザクション時のID衝突リスク（低確率）
- **FileReader**: 非UTF-8ファイルでの検索・置換失敗
- **PatternMatcher**: 特殊なReDoSパターンによるDoS攻撃リスク（低確率）

---

## 2. 何を達成するか（What）

### 2.1 目的

ユーティリティモジュールの品質とロバスト性を向上させる。

### 2.2 最終ゴール

- `generateId`が`crypto.randomUUID()`を使用
- `FileReader`がエンコーディングを自動検出
- `PatternMatcher`が追加のReDoSパターンを検出

### 2.3 スコープ

#### 含むもの

- generateIdのUUID v4移行
- FileReaderへのchardet導入検討
- PatternMatcherへの追加ReDoSパターン実装
- 関連テストの更新

#### 含まないもの

- UIコンポーネントの変更
- 他のユーティリティ関数の変更

### 2.4 成果物

| 種別   | 成果物                   | 配置先                                           |
| ------ | ------------------------ | ------------------------------------------------ |
| 機能   | 改修されたgenerateId     | `apps/desktop/src/main/utils/generateId.ts`      |
| 機能   | 改修されたFileReader     | `apps/desktop/src/main/search/FileReader.ts`     |
| 機能   | 改修されたPatternMatcher | `apps/desktop/src/main/search/PatternMatcher.ts` |
| テスト | 更新されたテスト         | 各ファイルの`__tests__/`配下                     |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 検索・置換機能のPhase 6品質ゲート通過済み
- 既存テストが全て成功していること

### 3.2 依存タスク

- なし（独立して実行可能、3つのサブタスクも互いに独立）

### 3.3 必要な知識・スキル

- TypeScript
- Node.js cryptoモジュール
- 文字エンコーディング（chardetパッケージ）
- 正規表現とReDoS脆弱性

### 3.4 推奨アプローチ

#### サブタスク1: generateIdのUUID移行

```typescript
// generateId.ts - 推奨修正
import { randomUUID } from "crypto";

export function generateId(): string {
  return randomUUID();
}
```

#### サブタスク2: FileReaderのエンコーディング検出

```typescript
// FileReader.ts - 推奨修正（検討段階）
import chardet from 'chardet';
import iconv from 'iconv-lite';

async readFile(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  const encoding = chardet.detect(buffer) || 'utf-8';
  return iconv.decode(buffer, encoding);
}
```

#### サブタスク3: 追加ReDoSパターン

```typescript
// PatternMatcher.ts - 追加パターン例
const REDOS_PATTERNS = [
  // 既存パターン...

  // 追加パターン
  /\.\*[^?].*\.\*/, // .*foo.* のような貪欲なパターン
  /\([^)]+\|[^)]+\)[+*]/, // (a|b)+ のような選択の繰り返し
  /\[[^\]]+\][+*]{2,}/, // [abc]++ のような文字クラスの過度な繰り返し
];
```

---

## 4. 実行手順

### Phase構成

```
サブタスク1: generateId UUID移行
サブタスク2: FileReader エンコーディング検出
サブタスク3: PatternMatcher 追加ReDoSパターン

各サブタスクは独立して実行可能
```

---

## サブタスク1: generateId UUID移行

### Phase 3: テスト作成 (TDD: Red)

#### 目的

UUID形式のIDが生成されることを検証するテストを作成する。

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests apps/desktop/src/main/utils/generateId.ts
```

#### 使用エージェント

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: ユーティリティ関数のテスト設計に最適

#### テストケース例

```typescript
describe("generateId", () => {
  it("should return UUID v4 format", () => {
    const id = generateId();
    // UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(id).toMatch(uuidV4Regex);
  });

  it("should generate unique IDs", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateId()));
    expect(ids.size).toBe(1000);
  });
});
```

### Phase 4: 実装 (TDD: Green)

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/main/utils/generateId.ts
```

#### 完了条件

- [ ] `crypto.randomUUID()`を使用している
- [ ] UUID v4形式のIDが生成される
- [ ] テストが成功する

---

## サブタスク2: FileReader エンコーディング検出

### Phase 3: テスト作成 (TDD: Red)

#### 目的

異なるエンコーディングのファイルが正しく読み込めることを検証する。

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests apps/desktop/src/main/search/FileReader.ts
```

#### 使用エージェント

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: ファイルI/Oテストの設計に最適

#### テストケース例

```typescript
describe("FileReader エンコーディング検出", () => {
  it("should read UTF-8 file correctly", async () => {
    // UTF-8ファイルの読み込みテスト
  });

  it("should read Shift-JIS file correctly", async () => {
    // Shift-JISファイルの読み込みテスト
  });

  it("should fallback to UTF-8 for unknown encoding", async () => {
    // 不明なエンコーディングの場合のフォールバック
  });
});
```

### Phase 4: 実装 (TDD: Green)

#### パッケージ追加

```bash
pnpm --filter @repo/desktop add chardet iconv-lite
pnpm --filter @repo/desktop add -D @types/chardet
```

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/main/search/FileReader.ts
```

#### 完了条件

- [ ] chardetパッケージが導入されている
- [ ] エンコーディング自動検出が動作する
- [ ] UTF-8以外のファイルも正しく読み込める
- [ ] テストが成功する

---

## サブタスク3: PatternMatcher 追加ReDoSパターン

### Phase 3: テスト作成 (TDD: Red)

#### 目的

追加のReDoSパターンが検出されることを検証する。

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests apps/desktop/src/main/search/PatternMatcher.ts
```

#### 使用エージェント

- **エージェント**: .claude/agents/sec-auditor.md, .claude/agents/unit-tester.md
- **選定理由**: セキュリティ観点でのReDoSパターン設計に.claude/agents/sec-auditor.md、テスト実装に.claude/agents/unit-tester.md

#### テストケース例

```typescript
describe("PatternMatcher ReDoS検出", () => {
  it("should detect greedy .* patterns", () => {
    const matcher = new PatternMatcher();
    expect(() => matcher.match("text", ".*foo.*", { useRegex: true })).toThrow(
      /unsafe regex/i,
    );
  });

  it("should detect alternation with repetition", () => {
    const matcher = new PatternMatcher();
    expect(() => matcher.match("text", "(a|b)+", { useRegex: true })).toThrow(
      /unsafe regex/i,
    );
  });
});
```

### Phase 4: 実装 (TDD: Green)

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/main/search/PatternMatcher.ts
```

#### 完了条件

- [ ] 追加ReDoSパターンが実装されている
- [ ] 危険なパターンが検出される
- [ ] テストが成功する

---

## 5. 完了条件チェックリスト

### サブタスク1: generateId

- [ ] UUID v4形式のIDが生成される
- [ ] 後方互換性が維持される（既存コードへの影響なし）
- [ ] テストが成功する

### サブタスク2: FileReader

- [ ] エンコーディング自動検出が動作する
- [ ] UTF-8、Shift-JIS、EUC-JPファイルが読み込める
- [ ] 不明なエンコーディングはUTF-8にフォールバック
- [ ] テストが成功する

### サブタスク3: PatternMatcher

- [ ] 追加ReDoSパターンが検出される
- [ ] 既存の検出パターンが維持される
- [ ] テストが成功する

---

## 6. 検証方法

### テストケース

#### generateId

- UUID v4形式の検証
- 1000件生成時のユニーク性確認

#### FileReader

- UTF-8ファイル読み込み
- Shift-JISファイル読み込み
- 不明エンコーディングのフォールバック

#### PatternMatcher

- `.*foo.*`パターンの検出
- `(a|b)+`パターンの検出
- 安全なパターンは通過

### 検証手順

```bash
# 全テスト実行
pnpm --filter @repo/desktop test:run

# 個別テスト実行
pnpm --filter @repo/desktop test:run generateId
pnpm --filter @repo/desktop test:run FileReader
pnpm --filter @repo/desktop test:run PatternMatcher
```

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                         |
| ---------------------------- | ------ | -------- | -------------------------------------------- |
| UUIDへの移行による後方互換性 | 低     | 低       | 既存IDは変更せず、新規生成分のみUUID         |
| chardetの検出精度            | 中     | 中       | 検出失敗時はUTF-8フォールバック              |
| ReDoS検出の誤検知            | 中     | 低       | ホワイトリスト機能の検討                     |
| chardetパッケージのサイズ    | 低     | 低       | バンドルサイズ確認、必要に応じてlazy loading |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/search-replace/task-step07-final-review.md` - 最終レビューレポート

### 参考資料

- [Node.js crypto.randomUUID](https://nodejs.org/api/crypto.html#cryptorandomuuidoptions) - UUID生成
- [chardet GitHub](https://github.com/runk/node-chardet) - エンコーディング検出
- [ReDoS - OWASP](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS) - ReDoS攻撃

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
| 優先度 | ファイル               | 問題                     | 推奨対策                      |
| LOW    | generateId.ts          | UUID非使用               | `crypto.randomUUID()`への移行 |
| LOW    | FileReader.ts          | エンコーディング検出なし | `chardet`導入検討             |
| LOW    | PatternMatcher.ts      | 追加ReDoSパターン検出    | パターン追加                  |
```

### 補足事項

- 各サブタスクは優先度LOWのため、他の優先度の高いタスクの後に実施推奨
- サブタスク2（エンコーディング検出）は追加パッケージが必要なため、バンドルサイズへの影響を考慮
- サブタスク3（ReDoSパターン）は誤検知のリスクがあるため、慎重にパターンを選定
