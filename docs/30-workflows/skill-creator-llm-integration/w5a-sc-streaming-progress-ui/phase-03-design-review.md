# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 3                                |
| タスクID | TASK-SC-07-STREAMING-PROGRESS-UI |
| 作成日   | 2026-03-22                       |

## 目的

Phase 2 の設計内容を多角的にレビューし、既知の落とし穴（P5・P31・P48）への対策が十分かどうかを検証する。PASS / MINOR / MAJOR の判定を行い、次 Phase への移行可否を決定する。

## 実行タスク

1. **P5（リスナー二重登録）対策レビュー**
   - `useEffect` のクリーンアップ関数でリスナー解除が設計されているか確認
   - React StrictMode 下での二重実行を考慮しているか確認
   - モジュールレベルガードの要否を判断する

2. **P31（Zustand無限ループ）対策レビュー**
   - 合成Hook（`useGenerationProgress()`）の戻り値関数が `useEffect` の依存配列に含まれないよう設計されているか確認
   - 個別セレクタ（`useGenerationStage()` / `useGenerationPercent()` 等）が設計されているか確認

3. **P48（useShallow適用）レビュー**
   - `.filter()` / `.map()` を使う派生セレクタに `useShallow` が適用されているか確認
   - `generationProgress` スライスで配列を返すセレクタの有無を確認

4. **エラーハンドリング設計レビュー**
   - 3種類のエラー（API Key未設定・LLMエラー・ネットワーク）の分岐が漏れなく設計されているか確認
   - エラーコードのサニタイズ（Renderer に内部情報を漏洩しない）が設計されているか確認

5. **キャンセル設計レビュー**
   - AbortController の生成・破棄タイミングが正しいか確認
   - キャンセル後の状態リセット漏れがないか確認

6. **総合判定**
   - PASS: Phase 4 へ
   - MINOR: 指摘対応後 Phase 4 へ
   - MAJOR（設計問題）: Phase 2 へ戻る

## 参照資料

- Phase 2 設計書: `phase-02-design.md`
- `.claude/rules/06-known-pitfalls.md` (P5, P31, P48)
- `.claude/rules/03-state-management.md`

## 成果物

- 設計レビュー結果レポート（PASS / MINOR / MAJOR 判定と指摘事項）

## 完了条件

- [ ] P5対策（クリーンアップでリスナー解除）が確認されている
- [ ] P31対策（個別セレクタ使用、合成Hook依存回避）が確認されている
- [ ] P48（useShallow適用箇所の明示）が確認されている
- [ ] エラーハンドリング3パターンの分岐が漏れなく設計されていることが確認されている
- [ ] キャンセルフローの状態リセット漏れがないことが確認されている
- [ ] PASS / MINOR / MAJOR の判定が記録されている

## 次のPhase

Phase 4: テスト作成
