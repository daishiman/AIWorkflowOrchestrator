# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 6                                                     |
| 機能名     | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001    |
| タスク名   | ConversationRoundStep semantic default 入力元拡張対応 |
| 前提Phase  | Phase 5（実装）                                       |
| 後続Phase  | Phase 7                                               |
| 作成日     | 2026-04-11                                            |
| ステータス | pending                                               |

---

## 目的

Phase 4 で作成した基本テストに加え、エッジケース・異形入力・回帰テストを追加する。
`applySmartDefaults()` と `resolveSemanticLabel()` が多様な入力パターンに対して
堅牢に動作することを検証し、Phase 5 の実装変更（shared への外部化）が
既存の動作を破壊していないことを確認する。

---

## 実行タスク

### Task 1: 追加テストケースの設計（英語入力・略称・異形バリエーション）

Phase 4 の基本テストマトリクスに加え、以下のバリエーションをテスト仕様として設計する。

**英語入力パターン（自然言語バリアント）:**

| 入力文字列      | 期待する正規化結果 | 備考                              |
| --------------- | ------------------ | --------------------------------- |
| `"myself only"` | `"自分のみ"`       | 英語入力 // length: 11            |
| `"just me"`     | `"自分のみ"`       | 英語略称 // length: 7             |
| `"daily"`       | `"毎日"`           | 英語略称（実行頻度） // length: 5 |
| `"weekly"`      | `"毎週"`           | 英語略称（実行頻度） // length: 6 |

**表記揺れパターン（意味的同一・表記が異なる）:**

| 入力文字列   | 期待する正規化結果 | 備考                                          |
| ------------ | ------------------ | --------------------------------------------- |
| `"自分だけ"` | `"自分のみ"`       | 意味的に同じが表記が異なる // length: 4       |
| `"自分のみ"` | `"自分のみ"`       | 正準形入力（変換不要） // length: 4           |
| `"毎日行う"` | `"毎日"`           | 助動詞付き表現 // length: 4（実文字「毎日」） |

> **NOTE: Feedback W0-RV-001 適用** — テスト文字列を書く前に `.length` で実文字数確認を必須とする。
> 日本語文字は`.length`が文字数と一致しない場合があるため、実際の文字列を確認してから
> `// length: N` コメントを付与すること。

**テスト記述の必須フォーマット:**

```typescript
it('英語入力 "myself only" を正規化して "自分のみ" を返す', () => {
  // length: 11 ("myself only".length === 11)
  const input = "myself only";
  expect(resolveSemanticLabel(input)).toBe("自分のみ");
});
```

各テストに `// length: N` コメントを付与すること。

### Task 2: 異常系テストの追加

以下の異常系入力パターンに対するテストを追加する。

**null-like 入力:**

| 入力             | 期待する動作                         | 備考                         |
| ---------------- | ------------------------------------ | ---------------------------- |
| `undefined`      | 空文字列 `""` または元の値をそのまま | undefined 入力 // 対象外入力 |
| `null`           | 空文字列 `""` または元の値をそのまま | null 入力                    |
| `""`（空文字列） | 空文字列 `""` をそのまま返す         | 空文字列入力 // length: 0    |

**特殊・境界値入力:**

| 入力                   | 期待する動作            | 備考                      |
| ---------------------- | ----------------------- | ------------------------- |
| `"123"`                | `"123"` をそのまま返す  | 数値文字列 // length: 3   |
| `"@#$%"`               | `"@#$%"` をそのまま返す | 特殊文字 // length: 4     |
| `"　"`（全角スペース） | `"　"` をそのまま返す   | 全角スペース // length: 1 |

**全角半角混在入力:**

| 入力          | 期待する動作         | 備考                           |
| ------------- | -------------------- | ------------------------------ |
| `"自分only"`  | 変換なし（そのまま） | 全角半角混在 // length: 6      |
| `"Daily毎日"` | 変換なし（そのまま） | 英数字+日本語混在 // length: 7 |

**テストファイル配置先:** `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`

### Task 3: 回帰テストの追加

**既存ウィザードフロー全体での `applySmartDefaults()` 動作確認:**

```typescript
describe("applySmartDefaults - 回帰テスト（Phase 5 実装変更後）", () => {
  it("shared 外部化前と同じ変換結果を返す（q1〜q6 全エントリ）", () => {
    // Phase 4 で確立した基本テストケースを全て再実行
    // 外部化前の期待値と一致することを確認
  });

  it("inferSmartDefaults が返す全パターンを正しく変換できる", () => {
    // inferSmartDefaults の既知の返り値パターンを入力として
    // applySmartDefaults が期待するUI表示値を返すことを確認
  });
});
```

**他コンポーネントとの結合テスト（ConversationRoundStep を利用しているコンポーネント）:**

```bash
# 利用箇所の確認
grep -rn "ConversationRoundStep\|applySmartDefaults" \
  apps/desktop/src/components/ --include="*.tsx" --include="*.ts"
```

- `ConversationRoundStep` を利用している親コンポーネントが存在する場合は
  `applySmartDefaults()` の呼び出し文脈を確認し、結合テストを追加する
- 結合テストは `__tests__/ConversationRoundStep.test.tsx` に `describe('結合テスト')` ブロックで追加する

### Task 4: テスト実行と結果確認

**実行コマンド:**

```bash
# 詳細出力でテスト実行
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx --reporter=verbose
```

**確認チェックリスト:**

| 確認項目                       | 確認方法                             | 合否 |
| ------------------------------ | ------------------------------------ | ---- |
| 追加テスト件数が規定以上       | 出力の `Tests:` 行で件数確認         |      |
| 全件 PASS                      | 出力に `failed` が0件                |      |
| 既存テストのリグレッションなし | Phase 4 の件数と比較して減っていない |      |
| エラー出力なし                 | stderr が空であること                |      |

**全件 PASS を確認してから Phase 7 へ進む。**

---

## 参照資料

| 資料名                   | パス                                                                                         | 用途                           |
| ------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 4 テスト仕様書     | `outputs/phase-4/test-specification.md`                                                      | 基本テストケース確認           |
| Phase 5 実装サマリー     | `outputs/phase-5/implementation-summary.md`                                                  | 変更内容の確認                 |
| Phase 5 変更ファイル一覧 | `outputs/phase-5/changed-files.md`                                                           | 変更ファイルの把握             |
| テストファイル本体       | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | テスト追加先                   |
| 正準形マッピング定数     | `packages/shared/src/types/skill-wizard-label-map.ts`                                        | 変換テーブルの正準エントリ確認 |

---

## 統合テスト連携

- Phase 6 で追加した拡張テストケース数を `outputs/phase-6/expanded-test-cases.md` に記録し、
  **Phase 7 カバレッジ確認**で「カバーされているテスト件数」として引き継ぐ
- 回帰テストの PASS/FAIL 結果は Phase 7 のトレーサビリティ確認（AC-5 検証）に使用する
- 追加した異常系テストのカバレッジ寄与は Phase 7 の未到達分析に活用する

---

## 多角的チェック観点（AIが判断）

| 思考法       | 確認内容                                                                       |
| ------------ | ------------------------------------------------------------------------------ |
| 論点思考     | テスト追加の目的が「実装の保護」か「実装の仕様化」かを明確にしているか         |
| システム思考 | 英語入力テストを追加することで、将来の入力元拡張に対する保護になっているか     |
| 逆説思考     | テストを増やしすぎることで保守コストが上がっていないか（不要な組み合わせ爆発） |
| 整合性確認   | `// length: N` コメントが実際の `.length` 値と一致しているか（W0-RV-001）      |
| 素人思考     | 異常系テストが実際のユーザー操作で発生しうるシナリオを反映しているか           |

---

## 成果物

| 成果物名             | パス                                        | 必須 |
| -------------------- | ------------------------------------------- | ---- |
| 拡張テストケース一覧 | `outputs/phase-6/expanded-test-cases.md`    | ✅   |
| 回帰テスト結果       | `outputs/phase-6/regression-test-result.md` | ✅   |
| 異常系テスト結果     | `outputs/phase-6/edge-case-result.md`       | ✅   |

---

## 完了条件

- [ ] Task 1 の英語入力・略称・表記揺れテストが `ConversationRoundStep.test.tsx` に追加されている
- [ ] 各テストに `// length: N` コメントが付与されている（Feedback W0-RV-001 対応）
- [ ] Task 2 の異常系テスト（null-like・特殊文字・全角半角混在）が追加されている
- [ ] Task 3 の回帰テストブロックが `describe('回帰テスト')` として追加されている
- [ ] **追加後の総テスト件数が15件以上**であること
- [ ] `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx --reporter=verbose` で全件 PASS
- [ ] 3つの成果物ファイルが `outputs/phase-6/` に保存されている

## タスク100%実行確認【必須】

- [ ] Task 1: 追加テストケースの設計（英語入力・略称・異形バリエーション） ✅
- [ ] Task 2: 異常系テストの追加 ✅
- [ ] Task 3: 回帰テストの追加 ✅
- [ ] Task 4: テスト実行と結果確認 ✅
- [ ] 全成果物が `outputs/phase-6/` に保存されていること ✅

---

## 次Phase

完了後 → **Phase 7: テストカバレッジ確認**（`phase-7-coverage-check.md`）へ進む。
全件 PASS が確認できない場合は Phase 5 の実装に戻って修正する。
