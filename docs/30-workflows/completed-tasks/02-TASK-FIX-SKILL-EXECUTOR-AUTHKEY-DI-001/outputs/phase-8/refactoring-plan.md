# Phase 8 リファクタ計画

## 方針

- 振る舞い不変を最優先にし、認証判定分裂を再発させない最小差分を維持する。
- 今回はPhase 5でDI配線の根因を解消済みのため、追加コードリファクタは実施せず、次サイクルの安全な分割計画を確定する。

## SubAgent別計画

### SubAgent-A（Main/IPC責務）

- 現状: `registerAllIpcHandlers`で`AuthKeyService`単一生成 + `registerSkillHandlers`注入を達成。
- 次リファクタ候補:
  1. `skillHandlers.ts` の責務分割（execute/register/validate/chain）
  2. `registerSkillHandlers`の依存オブジェクト化（DI引数を構造体化）

### SubAgent-B（Preload/API契約）

- 現状: `errorCode`伝搬は契約維持。
- 次リファクタ候補:
  1. `skill-api.ts` のラッパ関数をカテゴリ分割
  2. `safeInvoke`エラー整形ロジックの共通化

### SubAgent-C（Renderer/UX契約）

- 現状: preflight失敗時の実行抑止を維持。
- 次リファクタ候補:
  1. hook内の判定関数抽出
  2. エラー種別とUI状態の対応表を定数化

### SubAgent-D（統合監査）

- 判定: 本タスク範囲で追加リファクタを行うと回帰リスクが利益を上回るため、今回は計画化のみで凍結。

## 完了条件判定

- 矛盾: なし
- 漏れ: なし
- 整合性: あり
- 依存関係: あり（Phase 7カバレッジ分析を入力）
