# SkillCreatorVerificationEngine $schema URL有効性検証実装 - タスク指示書

## メタ情報

```yaml
issue_number: 1822
```

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | UT-SDK-SCHEMA-URL-VALID-001                              |
| タスク名     | SkillCreatorVerificationEngine $schema URL有効性検証実装 |
| 分類         | 改善                                                     |
| 対象機能     | SkillCreatorVerificationEngine (Layer3 L3-001検証)       |
| 優先度       | 低                                                       |
| 見積もり規模 | 小規模                                                   |
| ステータス   | 未実施                                                   |
| 発見元       | Phase 11（UT-IMP-SDK-06 Layer3/4 verify拡張テスト）      |
| 発見日       | 2026-04-01                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在の `SkillCreatorVerificationEngine` の L3-001 チェック（`validateLayer3` 関数内、
`SkillCreatorVerificationEngine.ts` 約 line 237-249）は、`output-schema.json` の
`$schema` フィールドの「存在確認」のみを行っている。

```typescript
// 現在の実装（L3-001）
const hasSchemaField = "$schema" in parsed;
checks.push(
  createCheck(
    "L3-001",
    "layer3",
    hasSchemaField ? "info" : "warning",
    hasSchemaField
      ? "output-schema.json has $schema field"
      : "output-schema.json is missing $schema field (JSON Schema draft-07 recommended)",
    `path: ${schemaPath}`,
  ),
);
```

この実装では `$schema` フィールドに任意の文字列（例: `"foo"`、`"not-a-url"` 等）を設定しても
severity が `"info"` になるため、スキルのスキーマ品質が保証されない。
JSON Schema 仕様では `$schema` フィールドは正式なスキーマ識別子 URI を指定することが推奨されており、
誤った URL が設定されているスキルを検出できないことが課題である。

### 1.2 問題点・課題

| 問題点                                                                             | 影響                                                                    |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `$schema` フィールドに任意文字列を設定しても `"info"` と判定される                 | 無効な $schema を持つスキルが品質チェックをすり抜ける                   |
| JSON Schema の複数バージョン（draft-04/06/07/2019-09/2020-12）への対応が存在しない | スキーマバージョンの一貫性が担保されない                                |
| HTTP fetch によるURL検証がないため実際のスキーマ到達性が不明                       | 外部ツールやバリデーターが `$schema` を参照した際に失敗する可能性がある |

### 1.3 放置した場合の影響

| 影響カテゴリ | 内容                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| スキル品質   | 不正な `$schema` 値を持つスキルが誤って品質チェックをパスし続ける                           |
| 相互運用性   | JSON Schema バリデーターや外部ツールが `$schema` を参照した際に予期せぬ失敗が発生する可能性 |
| 保守性       | L3-001 が「存在確認のみ」であることが暗黙的な仕様になり、改善コストが将来的に高くなる       |

---

## 2. 何を達成するか（What）

### 2.1 目的

L3-001 チェックを「`$schema` フィールドの存在確認」から「有効な JSON Schema URL であることの確認」へ
強化する。ホワイトリスト方式を採用することでネットワーク依存なしにテスト可能な実装を実現する。

### 2.2 最終ゴール

- 既知の有効な JSON Schema URL（ホワイトリスト）に一致する場合のみ `"info"` を返す
- ホワイトリスト外の文字列が `$schema` に設定されている場合は `"warning"` を返す
- `$schema` フィールドが存在しない場合は従来通り `"warning"` を返す
- ホワイトリストはコード内定数として管理し、テスト時に fetch が不要

### 2.3 スコープ

#### 含むもの

- 既知の有効 JSON Schema URL のホワイトリスト定数（draft-04/06/07/2019-09/2020-12）
- URLパターン検証ロジック（`json-schema.org` ドメインチェック）
- L3-001 の判定ロジック強化（存在確認 → URL有効性確認）
- `SkillCreatorVerificationEngine.test.ts` へのテストケース追加

#### 含まないもの

- HTTP fetch によるURL到達性確認（ネットワーク依存のため）
- オフライン環境でのfetch fallback実装
- JSON Schema コンテンツの実際の取得・解析
- カスタムスキーマ（`json-schema.org` 以外のドメイン）への対応

### 2.4 成果物

| 成果物                  | 説明                                                                              |
| ----------------------- | --------------------------------------------------------------------------------- |
| ホワイトリスト定数      | `KNOWN_VALID_JSON_SCHEMA_URLS` 定数（`SkillCreatorVerificationEngine.ts` に追加） |
| URL検証関数             | `isValidJsonSchemaUrl(url: unknown): boolean` 内部関数                            |
| L3-001 判定ロジック更新 | `validateLayer3` 内の L3-001 ブロックを URL有効性確認に拡張                       |
| ユニットテスト追加      | `SkillCreatorVerificationEngine.test.ts` に URL検証ケースを追加                   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `SkillCreatorVerificationEngine.ts` の既存実装が正常に動作していること
- 既存の `SkillCreatorVerificationEngine.test.ts` が全て PASS していること
- `pnpm --filter @repo/desktop test` が実行できる環境であること

### 3.2 依存タスク

| タスクID      | タイトル                            | 状態 |
| ------------- | ----------------------------------- | ---- |
| UT-IMP-SDK-06 | Layer3/4 verify拡張テスト実装       | 完了 |
| TASK-P0-01    | SkillCreatorVerificationEngine 実装 | 完了 |

### 3.3 必要な知識

- JSON Schema 仕様（draft-04/06/07/2019-09/2020-12）の `$schema` フィールド定義
- JSON Schema の公式 URL 一覧（`https://json-schema.org/` ドメイン）
- TypeScript ユニットテスト（Vitest）でのテストフィクスチャ作成パターン
- `SkillCreatorVerificationEngine.ts` の `createCheck`・`validateLayer3` 関数の構造

### 3.4 推奨アプローチ

**ホワイトリスト方式**（fetch不要・オフライン対応・テスト容易）を採用する。

```typescript
// ホワイトリスト定数（実装例）
const KNOWN_VALID_JSON_SCHEMA_URLS = new Set<string>([
  // JSON Schema 公式ドラフト
  "http://json-schema.org/draft-04/schema#",
  "http://json-schema.org/draft-04/schema",
  "http://json-schema.org/draft-06/schema#",
  "http://json-schema.org/draft-06/schema",
  "http://json-schema.org/draft-07/schema#",
  "http://json-schema.org/draft-07/schema",
  "https://json-schema.org/draft/2019-09/schema",
  "https://json-schema.org/draft/2020-12/schema",
]);

// URLパターン検証関数（実装例）
function isValidJsonSchemaUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  // ホワイトリスト完全一致
  if (KNOWN_VALID_JSON_SCHEMA_URLS.has(value)) return true;
  // json-schema.org ドメインのパターンマッチ（緩やかな許容）
  try {
    const url = new URL(value);
    return url.hostname === "json-schema.org";
  } catch {
    return false;
  }
}

// L3-001 判定ロジック更新イメージ
if (!hasSchemaField) {
  checks.push(createCheck("L3-001", "layer3", "warning", "..."));
} else {
  const schemaValue = parsed["$schema"];
  const isValidUrl = isValidJsonSchemaUrl(schemaValue);
  checks.push(
    createCheck(
      "L3-001",
      "layer3",
      isValidUrl ? "info" : "warning",
      isValidUrl
        ? `output-schema.json has valid $schema URL: ${String(schemaValue)}`
        : `output-schema.json has $schema field but value is not a recognized JSON Schema URL: ${JSON.stringify(schemaValue)}`,
      `path: ${schemaPath}`,
    ),
  );
}
```

---

## 4. 実行手順

### Phase構成

| Phase | 名称              | 目的                                      |
| ----- | ----------------- | ----------------------------------------- |
| 1     | 要件分析・設計    | 現在の実装確認とホワイトリスト設計        |
| 2     | テスト作成（Red） | URL検証を確認するテストの作成（失敗状態） |
| 3     | 実装（Green）     | ホワイトリスト・URL検証ロジックの実装     |
| 4     | リファクタリング  | コードの整理・JSDocコメント追加           |
| 5     | 最終検証          | 全テスト・型チェック・Lint確認            |

---

### Phase 1: 要件分析・設計

#### 目的

現在の L3-001 実装の詳細を把握し、ホワイトリストの内容と URL検証ロジックの設計を確定する。

#### 手順

1. `SkillCreatorVerificationEngine.ts` の L3-001 実装箇所（約 line 237-249）を確認
2. JSON Schema 公式ドキュメントで有効な `$schema` URL の一覧を確認
   - draft-04: `http://json-schema.org/draft-04/schema#`
   - draft-06: `http://json-schema.org/draft-06/schema#`
   - draft-07: `http://json-schema.org/draft-07/schema#`
   - 2019-09: `https://json-schema.org/draft/2019-09/schema`
   - 2020-12: `https://json-schema.org/draft/2020-12/schema`
3. ホワイトリスト完全一致 + `json-schema.org` ドメインパターンの2段階検証方式を確定
4. `isValidJsonSchemaUrl` 関数のシグネチャを設計
5. テスト戦略を決定（fetch モック不要・フィクスチャのみでテスト可能）

#### 成果物

- 設計メモ（ホワイトリスト定数の全URL一覧・関数シグネチャ）

#### 完了条件

- [ ] ホワイトリストに含める URL 一覧が確定している
- [ ] `isValidJsonSchemaUrl` 関数のシグネチャが確定している
- [ ] テストケース一覧が設計されている

---

### Phase 2: テスト作成（TDD Red）

#### 目的

URL有効性検証の動作を確認するテストを `SkillCreatorVerificationEngine.test.ts` に追加する。
この時点では実装が存在しないためテストは FAIL 状態。

#### 手順

1. 以下のテストケースを `describe("L3-001 $schema URL validation")` ブロック内に作成：
   - TC-001: 有効URL（`draft-07#`）で `info` になることを確認
   - TC-002: 有効URL（`2020-12`）で `info` になることを確認
   - TC-003: 無効URL（`"foo"`）で `warning` になることを確認
   - TC-004: 無効URL（`"not-a-url"`）で `warning` になることを確認
   - TC-005: `json-schema.org` ドメインの未知パスで `info` になることを確認（緩やかな許容）
   - TC-006: `$schema` フィールドなしで `warning` になること（従来通り）
2. `createSkillFixture` を使って各テストケースに対応する `output-schema.json` を生成
3. テストが FAIL することを確認

#### 成果物

- `SkillCreatorVerificationEngine.test.ts` へのテスト追加（6件以上）

#### 完了条件

- [ ] 6件以上のテストケースが作成されている
- [ ] テストが FAIL 状態（実装前）
- [ ] テスト構造が既存テストのパターンと一致している

---

### Phase 3: 実装（TDD Green）

#### 目的

`SkillCreatorVerificationEngine.ts` にホワイトリスト定数・URL検証関数・L3-001判定ロジックを実装し、
Phase 2 のテストを PASS させる。

#### 手順

1. `KNOWN_VALID_JSON_SCHEMA_URLS` 定数を `VALID_JSON_SCHEMA_TYPES` 定数の近くに追加
2. `isValidJsonSchemaUrl(value: unknown): boolean` 関数を追加
   - ホワイトリスト完全一致チェック
   - `new URL()` による `json-schema.org` ドメインチェック
   - URL パース失敗時は `false` を返す
3. `validateLayer3` 内の L3-001 ブロックを更新：
   - `hasSchemaField` が `true` の場合に `isValidJsonSchemaUrl` を呼び出す
   - 有効URL → `"info"`、無効URL → `"warning"` に変更
   - エビデンスサマリーに `$schema` の値を含める
4. テストを実行して全件 PASS を確認

#### 成果物

- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` の更新

#### 完了条件

- [ ] `KNOWN_VALID_JSON_SCHEMA_URLS` 定数が追加されている
- [ ] `isValidJsonSchemaUrl` 関数が実装されている
- [ ] L3-001 判定ロジックが URL有効性を確認している
- [ ] Phase 2 の全テストが PASS

---

### Phase 4: リファクタリング

#### 目的

実装コードの品質を高め、将来の保守を容易にする。

#### 手順

1. `isValidJsonSchemaUrl` 関数に JSDoc コメントを追加
   - パラメータの説明
   - ホワイトリスト方式を採用した理由
   - 返り値の説明
2. `KNOWN_VALID_JSON_SCHEMA_URLS` にコメントを追加（各ドラフトバージョンの説明）
3. エラーメッセージの文言が一貫しているか確認・調整
4. Lint・フォーマットを確認

#### 成果物

- JSDoc コメント付きの更新済み実装ファイル

#### 完了条件

- [ ] `isValidJsonSchemaUrl` に JSDoc コメントが追加されている
- [ ] `KNOWN_VALID_JSON_SCHEMA_URLS` にバージョン説明コメントが追加されている
- [ ] Lint エラーがない

---

### Phase 5: 最終検証

#### 目的

既存テストへの影響がないこと・型チェック・Lint が全て PASS することを確認する。

#### 手順

1. テスト全件実行: `pnpm --filter @repo/desktop test SkillCreatorVerificationEngine`
2. 型チェック: `pnpm --filter @repo/desktop typecheck`
3. Lint: `pnpm --filter @repo/desktop lint`
4. 既存の L3-001 テストケース（`$schema` フィールドなし・あり）が引き続き期待通りに動作することを確認

#### 成果物

- CI ログ（テスト・型チェック・Lint の実行結果）

#### 完了条件

- [ ] 既存テストが全て PASS
- [ ] 新規テスト（Phase 2 追加分）が全て PASS
- [ ] 型チェック PASS
- [ ] Lint エラーなし

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 有効な JSON Schema URL（例: `http://json-schema.org/draft-07/schema#`）が設定された場合に L3-001 が `"info"` を返す
- [ ] 無効な URL 文字列（例: `"foo"`、`"not-a-url"`）が設定された場合に L3-001 が `"warning"` を返す
- [ ] `$schema` フィールドが存在しない場合に L3-001 が `"warning"` を返す（従来通り）
- [ ] `json-schema.org` ドメインの URL（ホワイトリスト未登録のパスも含む）が `"info"` を返す
- [ ] `$schema` の値が文字列以外（数値・null・配列等）の場合に `"warning"` を返す

### 品質要件

- [ ] テストカバレッジ: 新規追加ロジックに対して 80% 以上
- [ ] 型チェック: PASS
- [ ] Lint: エラーなし
- [ ] fetch・ネットワーク依存なしでテストが完結する

### ドキュメント要件

- [ ] `isValidJsonSchemaUrl` 関数に JSDoc コメントが記載されている
- [ ] `KNOWN_VALID_JSON_SCHEMA_URLS` 定数にホワイトリストの意図がコメントされている

---

## 6. 検証方法

### テストケース

| TC-ID  | シナリオ                                                         | 期待する L3-001 severity | 期待するサマリーの要素                      |
| ------ | ---------------------------------------------------------------- | ------------------------ | ------------------------------------------- |
| TC-001 | `$schema: "http://json-schema.org/draft-07/schema#"` を設定      | `"info"`                 | `"valid $schema URL"` を含む                |
| TC-002 | `$schema: "https://json-schema.org/draft/2020-12/schema"` を設定 | `"info"`                 | `"valid $schema URL"` を含む                |
| TC-003 | `$schema: "http://json-schema.org/draft-04/schema#"` を設定      | `"info"`                 | `"valid $schema URL"` を含む                |
| TC-004 | `$schema: "foo"` を設定（無効文字列）                            | `"warning"`              | `"not a recognized JSON Schema URL"` を含む |
| TC-005 | `$schema: "not-a-url"` を設定（URLでない文字列）                 | `"warning"`              | `"not a recognized JSON Schema URL"` を含む |
| TC-006 | `$schema: "https://json-schema.org/custom/schema"` を設定        | `"info"`                 | `json-schema.org` ドメインを許容            |
| TC-007 | `$schema` フィールドなし                                         | `"warning"`              | `"missing $schema field"` を含む            |
| TC-008 | `$schema: 123`（文字列以外）を設定                               | `"warning"`              | `"not a recognized JSON Schema URL"` を含む |

### 検証手順

```bash
# ユニットテスト実行
pnpm --filter @repo/desktop test SkillCreatorVerificationEngine

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint
```

---

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                                                                |
| -------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------- |
| ネットワーク依存でCIが不安定                 | 中     | 高       | ホワイトリスト方式を採用し fetch を使用しない                                       |
| JSON Schema仕様更新への追従                  | 低     | 中       | `KNOWN_VALID_JSON_SCHEMA_URLS` 定数を一元管理し、新ドラフト追加を容易に             |
| `json-schema.org` 以外のカスタムスキーマ対応 | 低     | 低       | 本タスクのスコープ外とする（別タスクで対応）                                        |
| 既存テストへの影響                           | 中     | 低       | L3-001 の `"info"` → `"warning"` 変更が既存テストを壊す可能性がある。Phase 5 で確認 |
| `new URL()` のブラウザ/Node.js互換性         | 低     | 低       | Electron (Node.js環境) では `new URL()` が利用可能なため問題なし                    |

---

## 8. 参照情報

### 関連ファイル

| ファイル                                                                                  | 説明                                                |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                | 実装対象ファイル（L3-001ロジック: 約 line 237-249） |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | テスト追加対象ファイル                              |

### 関連タスク

| タスクID                                | タイトル                                      | 関係                       |
| --------------------------------------- | --------------------------------------------- | -------------------------- |
| UT-IMP-SDK-06                           | Layer3/4 verify拡張テスト実装                 | 本タスク発見元（完了済み） |
| TASK-P0-01                              | SkillCreatorVerificationEngine 実装           | 前提タスク                 |
| task-perf-verification-engine-cache-007 | SkillCreatorVerificationEngine キャッシュ実装 | 同エンジンの別改善タスク   |

### 参考資料

- [JSON Schema 公式サイト](https://json-schema.org/)
- [JSON Schema specification - $schema keyword](https://json-schema.org/understanding-json-schema/reference/schema.html)
- [JSON Schema 各ドラフトの $schema URI 一覧](https://json-schema.org/specification-links)

### 苦戦箇所記録（発見時の知見）

UT-IMP-SDK-06 の Phase 11（テスト実行・検証）において、L3-001 の URL有効性検証を
本タスクのスコープに含めることを検討したが、以下の理由からスコープ外として記録した：

1. **HTTP fetch によるURL検証はネットワーク依存でテストが困難**
   CI 環境でのネットワーク不安定性・オフライン環境での動作保証が必要となるため、
   単純な fetch 呼び出しでは品質が保証できない。

2. **テスト時に fetch をモックするとユニットテストの価値が下がる**
   fetch モックを使う場合、実際の URL到達性ではなくモックの動作を検証することになり、
   テストの本来の目的が薄れる。

3. **JSON Schema 仕様の複数バージョン（draft-04/06/07/2019-09/2020-12）への対応**
   各バージョンで `$schema` の URL形式が異なる（`http://` vs `https://`、末尾 `#` の有無等）ため、
   単純な URL比較では対応できない。ホワイトリスト方式が最も保守性が高い。

4. **実行コスト**
   L3-001 の URL検証強化は独立した改善タスクとして扱うべき規模であり、
   UT-IMP-SDK-06 のスコープに含めると実装工数が想定を超える恐れがあった。

**推奨解決策**: 既知の有効 JSON Schema URL をホワイトリスト化し、さらに
`json-schema.org` ドメインの URL を緩やかに許容するパターンマッチを組み合わせることで、
fetch なしで実用的な URL有効性検証が実現できる。

---

## 9. 備考

### 発見コンテキスト

このタスクは UT-IMP-SDK-06（Layer3/4 verify拡張テスト実装）の Phase 11（テスト実行・検証）にて
発見された deferred item である。
実行コストが高いため本タスクスコープ外として記録された。

### 実装上の注意事項

- `isValidJsonSchemaUrl` は `SkillCreatorVerificationEngine.ts` 内の純粋な内部関数として実装する
  （エクスポート不要）
- `KNOWN_VALID_JSON_SCHEMA_URLS` は既存の `VALID_JSON_SCHEMA_TYPES` 定数と同じファイルスコープに配置する
- draft-07 の URL は `http://` と末尾 `#` の組み合わせが正式形式であることに注意
  （`https://` や末尾 `#` なしのバリアントもホワイトリストに含める）
- L3-001 の severity 変更（`"info"` → `"warning"` への場合あり）により、
  既存のスキルでテストが影響を受ける可能性があるため、Phase 5 で既存テストを必ず全件確認する

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-04-01 | 初版作成 |
