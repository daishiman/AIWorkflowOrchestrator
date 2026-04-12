# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 8                                                     |
| 機能名     | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001    |
| タスク名   | ConversationRoundStep semantic default 入力元拡張対応 |
| 前提Phase  | Phase 7（カバレッジ計画）                             |
| 後続Phase  | Phase 9                                               |
| 作成日     | 2026-04-11                                            |
| ステータス | pending                                               |

---

## 目的

Phase 5 実装後のコードを整理し、`outputs/phase-3/design-decisions.md` の正準形マッピング表を追記する。
コード品質・可読性・保守性を向上させる。

---

## 実行タスク

### Task 1: コードクリーンアップ

**対象ファイル:**

- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`
- `packages/shared/src/types/skill-wizard-label-map.ts`

**作業内容:**

| 作業                                           | コマンド / 手順                                                  | 完了チェック |
| ---------------------------------------------- | ---------------------------------------------------------------- | ------------ |
| `resolveSemanticLabel()` に JSDoc コメント追加 | エディタで手動追加                                               | [ ]          |
| 旧ハードコードの残骸確認                       | `grep -n "案\|だけ\|のみ" ConversationRoundStep.tsx` で0件を確認 | [ ]          |
| 不要な import の削除確認                       | TypeScript コンパイラ警告 / ESLint `no-unused-vars` 確認         | [ ]          |

> **NOTE: Feedback VSCPKR-01 適用** — JSDoc コメント内に `*/` を含む説明を避けること。
> 例えば `* /n` のようにスペースを挿入して回避する。

**JSDoc テンプレート例:**

```ts
/**
 * 選択肢ラベルを正準形に正規化する。
 * 変換テーブルは SEMANTIC_LABEL_MAP（@repo/shared）を参照する。
 *
 * @param label - ユーザーが選択したラベル文字列
 * @param labelMap - 変換テーブル（省略時は SEMANTIC_LABEL_MAP を使用）
 * @returns 正準形ラベル文字列。マッピングが存在しない場合は label をそのまま返す。
 *
 * @example
 * resolveSemanticLabel("案A") // => "optionA"
 */
```

### Task 2: outputs/phase-3/design-decisions.md の更新

**目的:** AC-4 の直接対応タスク。正準形マッピング表と設計根拠を `outputs/phase-3/design-decisions.md` に追記する。

**追記内容:**

1. 正準形マッピング表（q1〜q6 の全変換エントリ）

   | 質問ID | 入力ラベル例   | 正準形出力 |
   | ------ | -------------- | ---------- |
   | q1     | 案A / A案      | optionA    |
   | q1     | 案B / B案      | optionB    |
   | q2     | だけ / のみ    | exclusive  |
   | q2     | 含む / 含める  | inclusive  |
   | q3〜q6 | （全エントリ） | （対応値） |

2. 変換方針（設定駆動型採用の理由）
   - ハードコードによる管理限界を解消するため
   - 将来の q7〜qN 追加時に `skill-wizard-label-map.ts` のみ修正すれば済む

3. 「なぜ shared に置いたか」の設計根拠
   - `apps/desktop` 固有のコンポーネント内に変換テーブルを埋め込むと、他パッケージからの参照や単体テストが困難になる
   - `@repo/shared` に置くことで管理責務を一元化し、型安全な参照を実現する

### Task 3: リファクタリング記録

**対象 / Before / After / 理由 テーブル（Feedback RT-03 対応）:**

| 対象                                | Before                                   | After                               | 理由                           |
| ----------------------------------- | ---------------------------------------- | ----------------------------------- | ------------------------------ |
| resolveSemanticLabel 変換テーブル   | ConversationRoundStep.tsx にハードコード | SEMANTIC_LABEL_MAP への参照         | 管理責務を shared に集約       |
| outputs/phase-3/design-decisions.md | 正準形マッピング表なし                   | q1〜q6 全エントリのマッピング表追記 | AC-4 対応                      |
| resolveSemanticLabel の JSDoc       | コメントなし                             | パラメータ・戻り値・使用例を明記    | 可読性・保守性の向上           |
| 不要 import                         | 存在する可能性あり                       | 削除済み（0件）                     | バンドルサイズ削減・コード整理 |

### Task 4: 再テスト確認

**リファクタリング後に全テストが引き続き PASS であることを確認する。**

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

| 確認項目                      | 期待結果  | 実績 |
| ----------------------------- | --------- | ---- |
| applySmartDefaults 関連テスト | 全件 PASS |      |
| resolveSemanticLabel テスト   | 全件 PASS |      |
| リグレッションなし            | 差分なし  |      |

---

## 参照資料

| 資料名                   | パス                                                  | 用途                     |
| ------------------------ | ----------------------------------------------------- | ------------------------ |
| Phase 5 changed-files.md | `outputs/phase-5/changed-files.md`                    | 実装差分の確認           |
| Phase 7 coverage-plan.md | `outputs/phase-7/coverage-plan.md`                    | テストカバレッジ計画参照 |
| Phase 2 型設計           | `outputs/phase-2/type-design.md`                      | 型定義の設計意図確認     |
| SEMANTIC_LABEL_MAP       | `packages/shared/src/types/skill-wizard-label-map.ts` | 変換テーブル本体         |

---

## 統合テスト連携

- リファクタリング完了後、Phase 9（品質保証）へ以下を引き継ぐ:
  - `outputs/phase-3/design-decisions.md` 更新済みであること
  - 全テスト PASS の記録
  - JSDoc 追加済み、不要 import 0件
- Phase 9 では型チェック・Lint・フォーマット・全テストを一括確認し、出荷品質を担保する

---

## 多角的チェック観点（AIが判断）

| 思考法       | 確認内容                                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| 論点思考     | リファクタリングの本質的な論点（管理責務の移動）が `outputs/phase-3/design-decisions.md` に正しく記録されているか |
| システム思考 | `shared` への依存が一方向（desktop → shared）であり逆依存が生じていないか                                         |
| 価値提案思考 | このリファクタリングによって将来の q7〜qN 追加コストが実際に下がるか                                              |
| 整合性確認   | Before/After テーブルが実際のコード変更と一致しているか                                                           |
| リスク確認   | リファクタリングによって既存動作が壊れていないか（再テストで確認）                                                |

---

## 成果物

| 成果物名                       | パス                                             | 必須 |
| ------------------------------ | ------------------------------------------------ | ---- |
| refactoring-plan.md            | `outputs/phase-8/refactoring-plan.md`            | ✅   |
| post-refactor-test-plan.md     | `outputs/phase-8/post-refactor-test-plan.md`     | ✅   |
| responsibility-boundary-map.md | `outputs/phase-8/responsibility-boundary-map.md` | ✅   |

---

## 完了条件

- [ ] `outputs/phase-3/design-decisions.md` に正準形マッピング表（q1〜q6 全エントリ）が追記されている
- [ ] `outputs/phase-3/design-decisions.md` に変換方針と「なぜ shared に置いたか」の設計根拠が記録されている
- [ ] `resolveSemanticLabel()` に JSDoc コメントが追加されている
- [ ] 旧ハードコードの残骸が0件（grep で確認済み）
- [ ] 不要な import が削除されている
- [ ] `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` が全件 PASS
- [ ] リファクタリング記録（Before/After テーブル）が `outputs/phase-8/refactoring-plan.md` に保存されている

## タスク100%実行確認【必須】

- [ ] Task 1: コードクリーンアップ ✅
- [ ] Task 2: outputs/phase-3/design-decisions.md の更新 ✅
- [ ] Task 3: リファクタリング記録 ✅
- [ ] Task 4: 再テスト確認 ✅
- [ ] 全成果物が `outputs/phase-8/` に保存されていること ✅

---

## 次Phase

**Phase 9: 品質保証**（`phase-9-quality-assurance.md`）へ進む。
