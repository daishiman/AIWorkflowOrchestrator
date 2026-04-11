# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| Phase      | 4                                                                |
| タスクID   | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001            |
| 機能名     | SmartDefault AC-4 フォールバック仕様のフィールド独立推論性明示化 |
| 前提Phase  | Phase 3（設計レビューPASS）                                      |
| 後続Phase  | Phase 5                                                          |
| 作成日     | 2026-04-11                                                       |
| ステータス | pending                                                          |

## 目的

フィールド独立推論性の仕様揺れを検出するテストケースを定義し、
TDD Red段階のテストスイートを作成する。

## 事前確認（TDD Red前）

| 確認項目                                    | 確認方法                                                  |
| ------------------------------------------- | --------------------------------------------------------- |
| 既存テストファイルの命名規則（camelCase等） | 既存テストファイルのファイル名・describe名確認            |
| テストパターンがPhase 1-3の命名規則と整合   | Phase 2設計のTC名称とPhase 1受入基準の照合                |
| private methodテスト方針                    | `(facade as unknown as FacadePrivate)` or public callback |

## テストケース一覧

### TC-FB03-01: purpose空・category有効 → formatはcategoryから推論

```typescript
describe("SmartDefault フィールド独立推論性", () => {
  it("TC-FB03-01: purpose空でもcategoryが有効ならformatは推論される", async () => {
    // Arrange
    const input = {
      purpose: "", // 空文字 → null期待
      category: "code-support", // 有効 → 推論継続
    };

    // Act
    const result = await inferSmartDefaults(input);

    // Assert
    expect(result.purpose).toBeNull(); // purposeのみnull
    expect(result.category).toBe("code-support"); // categoryは有効
    expect(result.tool).toBeNull(); // purpose 由来の tool は null
    expect(result.timing).toBeNull(); // purpose 由来の timing も null
    expect(result.format).toBe("code"); // format は category からのみ推論
  });
});
```

### TC-FB03-02: purpose空・category空 → format null（推論ソースなし）

```typescript
it("TC-FB03-02: purpose空・category空ならformatも推論不可でnull", async () => {
  // Arrange
  const input = {
    purpose: "",
    category: "",
  };

  // Act
  const result = await inferSmartDefaults(input);

  // Assert
  expect(result.purpose).toBeNull();
  expect(result.category).toBeNull();
  expect(result.format).toBeNull(); // 推論ソースがないためnull
});
```

### TC-FB03-03: purpose有効・category空 → formatはnull（purposeはformatに影響しない）

```typescript
it("TC-FB03-03: purpose有効・category空でもformatはnullのまま", async () => {
  // Arrange
  const input = {
    purpose: "GitHubのPRレビューを支援するスキル",
    category: "",
  };

  // Act
  const result = await inferSmartDefaults(input);

  // Assert
  expect(result.purpose).toBe("GitHubのPRレビューを支援するスキル");
  expect(result.category).toBeNull();
  expect(result.tool).toBe("github"); // purpose 由来の tool は推論される
  expect(result.timing).toBeNull(); // timing キーワードは含まれない
  expect(result.format).toBeNull(); // format は category がないため null
});
```

### TC-FB03-04（回帰）: 全フィールド有効 → 全フィールド推論済み

```typescript
it("TC-FB03-04: 全フィールド有効なら全て推論される（回帰）", async () => {
  // Arrange
  const input = {
    purpose: "Notionにデータを毎週記録する",
    category: "data-analysis",
  };

  // Act
  const result = await inferSmartDefaults(input);

  // Assert
  expect(result.purpose).toBeTruthy();
  expect(result.category).toBe("data-analysis");
  expect(result.tool).toBe("notion");
  expect(result.timing).toBe("scheduled");
  expect(result.format).toBe("structured");
});
```

## テストコマンドスイート

```bash
# 対象テストファイルのみ実行（メモリ効率のため targeted run）
pnpm vitest run --reporter=verbose <test-file-path>

# カバレッジ付き実行
pnpm vitest run --coverage --reporter=verbose <test-file-path>

# 依存関係整合確認（実行前必須）
pnpm install
pnpm --filter @repo/shared build
```

## TDD実行手順

1. テストファイルを既存テストに追加する（新規ファイル作成は避ける）
2. TC-FB03-01〜04を Red 状態で実行し、失敗を確認する
3. Phase 5（実装）でAC-4追記・テンプレート更新を行い Green にする
4. Phase 6でエッジケースを追加する

## 参照資料

| 資料名                 | パス                                      | 用途                   |
| ---------------------- | ----------------------------------------- | ---------------------- |
| Phase 2 設計書         | `outputs/phase-2/design-spec.md`          | テストケース設計の参照 |
| Phase 3 レビュー       | `outputs/phase-3/design-review-report.md` | 設計確定内容の確認     |
| 既存SmartDefaultテスト | （Phase実行時に調査・特定）               | 命名規則・パターン確認 |

## 成果物

| 成果物                 | パス                                    | 説明                    |
| ---------------------- | --------------------------------------- | ----------------------- |
| テストケース定義書     | `outputs/phase-4/test-cases.md`         | TC-FB03-01〜04 詳細定義 |
| テストコマンドスイート | `outputs/phase-4/test-command-suite.md` | 実行コマンド一覧        |

## 完了条件

- [ ] TC-FB03-01〜04がRed状態で実行確認されていること
- [ ] テスト命名規則が既存コードと整合していること
- [ ] テストコマンドスイートが記録されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
