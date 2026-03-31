# Phase 3: 30思考法監査

## 論理分析系

- **批判的思考**: shared の dual output は本当に必要か？ → preload でインライン化するなら CJS export 不要では？ → main プロセスも shared を使う可能性があるため、dual output は保険として妥当
- **演繹思考**: preload は CJS → externalize すると require() → shared は ESM のみ → FAIL。解は externalize 除外 OR CJS 追加

## 構造分解系

- **MECE**: 問題A（モジュール形式）と問題B（ABI）は完全に直交。両方修正しないと起動しない
- **プロセス思考**: install → build → dev → package の各段階で検査が入る設計は適切

## メタ・抽象系

- **メタ思考**: esbuild の version pin は過去の worktree 問題への対処跡。根本を直すなら削除が正しい
- **ダブルループ思考**: 今回の修正が将来の同種問題を防ぐか？ → setup-native-modules.sh の強化でカバー

## 発想・拡張系

- **逆説思考**: shared を ESM のみに保つ場合は？ → preload の format を esm に変更する案。しかし Electron の preload は CJS 前提なので不可
- **if思考**: shared に native module が入ったら？ → 現時点では pure TS なので preload へのインライン化は安全

## システム系

- **因果関係分析**: esbuild pin → shared build 失敗 → preload build 失敗 → desktop dev 失敗。根本は esbuild pin
- **因果ループ**: worktree 作成 → native binary 不整合 → rebuild → 今度は ABI 不整合 → electron-rebuild が必要

## 戦略・価値系

- **トレードオン思考**: preload バンドルサイズ vs 確実性。確実性を優先し、バンドルサイズの微増は許容

## 問題解決系

- **why思考**: なぜ preload が壊れる？→ shared が ESM のみ。なぜ ESM のみ？→ tsup の初期設定のまま。なぜ CJS を出さなかった？→ web 側は ESM で十分だった
- **仮説思考**: esbuild pin を削除すれば shared build が通る → 検証可能
