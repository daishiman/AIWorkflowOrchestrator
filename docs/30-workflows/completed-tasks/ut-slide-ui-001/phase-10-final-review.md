# Phase 10: 最終レビュー

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 10                           |
| 機能名   | ut-slide-ui-001              |
| タスク名 | Slide Workspace UI 4領域実装 |
| 作成日   | 2026-03-21                   |

## 目的

多角的品質・整合性検証を実施し、PASS / MINOR / MAJOR / CRITICAL 判定を行う。Phase 1 の受入基準と実装の網羅性、既知の落とし穴対策の実装状況、Apple HIG 準拠を最終確認する。

## 実行タスク

| #   | タスク名                     | 目的                                             |
| --- | ---------------------------- | ------------------------------------------------ |
| 1   | 要件 <-> 実装の網羅性確認    | Phase 1 受入基準と実装状態の突合                 |
| 2   | 正本仕様との最終整合確認     | ui-ux-feature-components-details.md との整合検証 |
| 3   | 既知の落とし穴対策の実装確認 | P31/P48/P62/P46/P47 対策が適用されているか       |
| 4   | アクセシビリティ実装確認     | ARIA、コントラスト比、キーボード操作の検証       |
| 5   | Apple HIG 準拠確認           | System Colors、8px グリッド、角丸の統一性検証    |
| 6   | コードレビュー               | DIP 違反チェック、コード品質の最終確認           |
| 7   | テストカバレッジ最終確認     | カバレッジ基準の最終充足確認                     |

- 最終レビュー: 要件網羅、正本準拠、pitfall 対策、UI 品質、コード品質、coverage を最終判定する。

## 参照資料

| 資料                                                                                    | 用途                               |
| --------------------------------------------------------------------------------------- | ---------------------------------- |
| `docs/30-workflows/ut-slide-ui-001/phase-1-requirements.md`                             | 受入基準の参照                     |
| `docs/30-workflows/ut-slide-ui-001/phase-2-design.md`                                   | Phase 2 設計意図の確認             |
| `docs/30-workflows/ut-slide-ui-001/phase-5-implementation.md`                           | 実装差分の確認                     |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-details.md` | 正本仕様（コンポーネント詳細）     |
| `.claude/rules/01-architecture.md`                                                      | Apple HIG カラーパレット・設計原則 |
| `.claude/rules/06-known-pitfalls.md`                                                    | 既知の落とし穴リスト               |
| `apps/desktop/src/renderer/slide/`                                                      | レビュー対象コード                 |
| `docs/30-workflows/ut-slide-ui-001/outputs/phase-9/quality-verification-report.md`      | 品質検証結果（Phase 9 成果物）     |

## 実行手順

### Task 1: 要件 <-> 実装の網羅性確認

1. Phase 1 仕様書の受入基準を全て列挙する
2. 各受入基準に対応する実装箇所を特定する
3. 対応関係をマトリクスとして記録する:
   - 受入基準 ID
   - 対応コンポーネント / ファイル
   - 実装状態（完了 / 部分完了 / 未実装）
   - 対応テストケース
4. 未実装または部分完了の受入基準がある場合、MAJOR 判定の候補とする
5. 以下の4領域コンポーネントが全て実装されているか確認する:
   - SlideSyncCard: 同期状態カード
   - SlideProgressRow: 進捗行表示
   - SlideWatchStatus: 監視ステータス
   - SlideGuidanceBlock + TerminalLauncher: ガイダンス + ターミナル起動

### Task 2: 正本仕様との最終整合確認

1. `ui-ux-feature-components-details.md` を読み込む
2. 仕様書に記載された各コンポーネントの要件と実装を突合する:
   - Props 定義が仕様と一致しているか
   - 表示要素（テキスト、アイコン、カラー）が仕様通りか
   - 状態遷移パターンが仕様通りか
3. 仕様と実装の乖離がある場合、乖離内容と影響を記録する
4. 乖離の深刻度に応じて判定レベルを決定する

### Task 3: 既知の落とし穴対策の実装確認

1. **P31（Zustand Store Hooks 無限ループ）**: セレクタが個別セレクタベース（`useSlide*`）で実装されているか確認する
2. **P48（useShallow 未適用）**: `.filter()` / `.map()` で配列を返す派生セレクタに `useShallow` が適用されているか確認する
   ```bash
   grep -rn "\.filter\|\.map" apps/desktop/src/renderer/slide/selectors.ts
   grep -rn "useShallow" apps/desktop/src/renderer/slide/selectors.ts
   ```
3. **P62（DEFAULT_CONFIG 暗黙 fallback）**: 未選択状態でのフォールバック処理が適切か確認する
4. **P46（HTMLAttributes Props 型衝突）**: `Omit<React.HTMLAttributes<...>, "conflictingProp">` パターンが必要な箇所に適用されているか確認する
5. **P47（variantStyles Record 外部定義）**: variantStyles が export され、テストから import 参照されているか確認する
   ```bash
   grep -rn "export.*variantStyles" apps/desktop/src/renderer/slide/components/
   grep -rn "import.*variantStyles" apps/desktop/src/renderer/slide/components/__tests__/
   ```

### Task 4: アクセシビリティ実装確認

1. **ARIA ラベル**: 全インタラクティブ要素に `aria-label` または `aria-labelledby` が付与されているか確認する
   ```bash
   grep -rn "aria-" apps/desktop/src/renderer/slide/components/
   ```
2. **コントラスト比**: 以下の基準を満たしているか確認する
   - 通常テキスト: 4.5:1 以上
   - 大テキスト / UI 部品: 3:1 以上
3. **キーボード操作**: ボタン・リンク等がキーボードでフォーカス可能か確認する
4. **色だけで情報を伝えていないか**: ステータス表示にアイコンやテキストが併用されているか確認する
5. **role 属性**: セマンティクスが正しい HTML 要素が使用されているか確認する

### Task 5: Apple HIG 準拠確認

1. **System Colors**: ライト/ダークモードの両方で Apple 公式のシステムカラーが使用されているか確認する
   - Tailwind Slate（青みがかった灰色）が使用されていないか確認する
   ```bash
   grep -rn "slate-\|Slate" apps/desktop/src/renderer/slide/components/
   ```
2. **8px グリッド**: スペーシングが 8px グリッドに準拠しているか確認する（`p-2`, `m-4`, `gap-2` 等）
3. **角丸**: コンポーネント間で角丸が統一されているか確認する（8px - 12px）
4. **影**: カード系コンポーネントの影が繊細か確認する（`0 1px 3px rgba(0,0,0,0.04)` 程度）
5. **フィードバック**: ホバー、アクティブ、フォーカス状態の視覚フィードバックが全操作要素に実装されているか確認する
6. **アニメーション**: アニメーション時間が 200-300ms の範囲内か確認する

### Task 6: コードレビュー

1. **DIP 違反チェック（P61対策）**: コンポーネントが具象クラスではなくインターフェース / 型に依存しているか確認する
2. **SRP**: 各コンポーネントが単一責務を守っているか最終確認する
3. **型安全**: `any` 型、`@ts-ignore`、non-null assertion `!` が使用されていないか確認する
   ```bash
   grep -rn "any\|@ts-ignore\|@ts-expect-error" apps/desktop/src/renderer/slide/
   grep -rn "!\." apps/desktop/src/renderer/slide/
   ```
4. **エラーハンドリング**: エラーが利用者へ明示され、握りつぶされていないか確認する
5. **命名規則**: boolean は `is` / `has` / `can` / `should` プレフィックスが付いているか確認する

### Task 7: テストカバレッジ最終確認

1. `cd apps/desktop && pnpm vitest run --coverage src/renderer/slide/` を実行する
2. カバレッジ基準の最終確認:
   - Line Coverage: 80% 以上
   - Branch Coverage: 60% 以上
   - Function Coverage: 80% 以上
3. Phase 9 の結果と比較して劣化がないことを確認する
4. カバレッジレポートをレビューレポートに記録する

## 統合テスト連携

- Phase 1 の受入基準と実装の対応関係を明確にする
- Phase 9 の品質検証結果を引き継ぎ、最終確認として位置付ける
- MINOR 判定の場合は未タスク仕様書への変換が必須（省略不可）

## 多角的チェック観点

| 観点             | 確認内容                                             | 判定基準                       |
| ---------------- | ---------------------------------------------------- | ------------------------------ |
| 要件網羅性       | Phase 1 受入基準が全て実装されているか               | 未実装の受入基準がゼロ         |
| 正本仕様整合     | ui-ux-feature-components-details.md との乖離がないか | 乖離がゼロまたは MINOR レベル  |
| P31 対策         | 個別セレクタベースで実装されているか                 | 合成 Hook 未使用               |
| P48 対策         | 派生セレクタに useShallow が適用されているか         | 該当セレクタ全てに適用済み     |
| P46 対策         | HTML 属性型衝突が Omit で解決されているか            | 衝突パターンなし               |
| P47 対策         | variantStyles が外部定義されテスト参照可能か         | export + テストで import       |
| P62 対策         | 暗黙 fallback がないか                               | 明示的エラーまたはリダイレクト |
| ARIA             | 全インタラクティブ要素に ARIA ラベルがあるか         | ARIA 属性付与率 100%           |
| コントラスト比   | WCAG 2.1 AA 基準を満たしているか                     | 4.5:1 以上（通常テキスト）     |
| Apple HIG Colors | Tailwind Slate を使用していないか                    | Slate 不使用                   |
| 8px グリッド     | スペーシングが 8px グリッド準拠か                    | 非準拠箇所がゼロ               |
| DIP              | 具象クラスへの直接依存がないか                       | インターフェース依存のみ       |
| 型安全           | any / @ts-ignore / non-null assertion がないか       | 使用箇所がゼロ                 |
| カバレッジ       | Line 80%+ / Branch 60%+ / Function 80%+              | 全基準充足                     |

## 判定基準

| 判定     | 条件                | 対応                                           |
| -------- | ------------------- | ---------------------------------------------- |
| PASS     | 全項目クリア        | Phase 11 へ                                    |
| MINOR    | 軽微改善点あり      | 未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | 重大な設計/実装問題 | Phase 1-5 へ戻る                               |
| CRITICAL | 要件の根本的問題    | Phase 1 へ戻り要件再確認                       |

### MINOR 判定時の必須対応

- 全ての MINOR 指摘を未タスク仕様書に変換する（「機能影響なし」でも省略不可）
- 未タスク仕様書は `docs/30-workflows/unassigned-task/` に配置する
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` の follow-up 台帳へ登録する
- 関連仕様書に参照リンクを追加する

## 成果物

| ファイル                                  | 説明                                     |
| ----------------------------------------- | ---------------------------------------- |
| `outputs/phase-10/final-review-report.md` | 最終レビュー結果レポート（判定結果含む） |
| 未タスク仕様書（MINOR 判定時のみ）        | MINOR 指摘の未タスク化                   |

## 完了条件

- [ ] Task 1: 要件 <-> 実装の網羅性マトリクスが作成され、未実装がないことを確認した
- [ ] Task 2: 正本仕様との乖離が MINOR 以下であることを確認した
- [ ] Task 3: P31/P48/P62/P46/P47 対策が全て実装されていることを確認した
- [ ] Task 4: アクセシビリティ要件（ARIA、コントラスト比、キーボード）を満たしている
- [ ] Task 5: Apple HIG 準拠（System Colors、8px グリッド、角丸）を確認した
- [ ] Task 6: DIP 違反、any 型、non-null assertion がないことを確認した
- [ ] Task 7: カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を最終確認した
- [ ] PASS / MINOR / MAJOR / CRITICAL の判定を行った
- [ ] MINOR 判定の場合、全指摘を未タスク仕様書に変換した
- [ ] final-review-report.md が作成されている

## サブタスク管理

- [ ] Task 1: 要件 <-> 実装の網羅性確認
- [ ] Task 2: 正本仕様との最終整合確認
- [ ] Task 3: 既知の落とし穴対策の実装確認
- [ ] Task 4: アクセシビリティ実装確認
- [ ] Task 5: Apple HIG 準拠確認
- [ ] Task 6: コードレビュー
- [ ] Task 7: テストカバレッジ最終確認

## タスク100%実行確認

- [ ] 全 Task が完了している
- [ ] 完了条件が全てチェック済みである
- [ ] 成果物が全て生成されている
- [ ] 判定結果が明確に記録されている
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換済みである

## 次のPhase

- **PASS 判定**: Phase 11: 手動テスト（`phase-11-manual-test.md`）に進む
- **MINOR 判定**: 未タスク仕様書変換完了後、Phase 11 に進む
- **MAJOR 判定**: 影響範囲に応じて Phase 1-5 へ戻る
- **CRITICAL 判定**: Phase 1 へ戻り要件再確認
