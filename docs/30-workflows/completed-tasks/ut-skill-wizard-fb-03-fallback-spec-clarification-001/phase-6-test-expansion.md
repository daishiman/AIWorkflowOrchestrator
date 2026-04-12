# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| Phase      | 6                                                                |
| タスクID   | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001            |
| 機能名     | SmartDefault AC-4 フォールバック仕様のフィールド独立推論性明示化 |
| 前提Phase  | Phase 5（実装完了・TC-FB03-01〜04 Green）                        |
| 後続Phase  | Phase 7                                                          |
| 作成日     | 2026-04-11                                                       |
| ステータス | pending                                                          |

## 目的

Phase 4で定義したテストに加え、フェイルパス・エッジケース・回帰ガードを追加し、
フィールド独立推論性の仕様揺れを広範に検出できるテストスイートを完成させる。

## 追加テストケース

### フェイルパス（異常系）

#### TC-FB03-05: 全フィールドnull入力 → 全フィールドnull出力

```typescript
it("TC-FB03-05: 全フィールドnull入力 → 全フィールドnull", async () => {
  const input = { purpose: null, category: null };
  const result = await inferSmartDefaults(input);
  expect(result.purpose).toBeNull();
  expect(result.category).toBeNull();
  expect(result.format).toBeNull();
});
```

#### TC-FB03-06: undefined入力が空文字・nullと同等に扱われること

```typescript
it("TC-FB03-06: undefined入力はnull扱いで独立推論に影響しない", async () => {
  const input = { purpose: undefined, category: "code-support" };
  const result = await inferSmartDefaults(input);
  expect(result.purpose).toBeNull();
  expect(result.tool).toBeNull();
  expect(result.timing).toBeNull();
  expect(result.category).toBe("code-support");
  expect(result.format).toBe("code");
});
```

### エッジケース

#### TC-FB03-07: 空白文字のみのpurpose → null扱い

```typescript
it("TC-FB03-07: 空白文字のみのpurposeはnull扱い（trimされる）", async () => {
  const input = { purpose: "   ", category: "code-support" };
  const result = await inferSmartDefaults(input);
  expect(result.purpose).toBeNull(); // 空白trim後null
  expect(result.tool).toBeNull();
  expect(result.timing).toBeNull();
  expect(result.category).toBe("code-support");
  expect(result.format).toBe("code");
});
```

#### TC-FB03-08: purposeが短文でもcategoryのformat推論は独立して動く

```typescript
it("TC-FB03-08: purposeが短文でもcategoryのformat推論は独立して動く", async () => {
  const input = { purpose: "ツール", category: "data-analysis" };
  const result = await inferSmartDefaults(input);
  expect(result.purpose).not.toBeNull();
  expect(result.tool).toBeNull();
  expect(result.timing).toBeNull();
  expect(result.format).toBe("structured"); // categoryから独立推論
});
```

### 回帰ガード

#### TC-FB03-09: 既存SmartDefault正常系回帰

```typescript
it("TC-FB03-09: [回帰] 既存のSmartDefault推論が壊れていないこと", async () => {
  const input = {
    purpose: "Notionにデータを毎週記録する",
    category: "data-analysis",
  };
  const result = await inferSmartDefaults(input);
  expect(result.tool).toBe("notion");
  expect(result.timing).toBe("scheduled");
  expect(result.format).toBe("structured");
  expect(result.inferenceLog).toHaveLength(3);
});
```

## 回帰影響確認コマンド

```bash
# SmartDefault関連テスト全件実行
pnpm vitest run --reporter=verbose --grep "SmartDefault"

# 全テスト実行（回帰なし確認）
pnpm vitest run --reporter=verbose
```

## 参照資料

| 資料名               | パス                                       | 用途                   |
| -------------------- | ------------------------------------------ | ---------------------- |
| Phase 4 テストケース | `outputs/phase-4/test-cases.md`            | 拡充対象のベーステスト |
| Phase 5 実装記録     | `outputs/phase-5/implementation-record.md` | 実装内容の確認         |

## 成果物

| 成果物             | パス                                     | 説明                    |
| ------------------ | ---------------------------------------- | ----------------------- |
| 拡充テストケース書 | `outputs/phase-6/expanded-test-cases.md` | TC-FB03-05〜09 詳細定義 |

## 完了条件

- [ ] TC-FB03-05〜09が追加されていること
- [ ] 全テストケース（TC-FB03-01〜09）がGreen（PASS）であること
- [ ] 既存テストへの回帰影響がゼロであること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 7: カバレッジ確認
