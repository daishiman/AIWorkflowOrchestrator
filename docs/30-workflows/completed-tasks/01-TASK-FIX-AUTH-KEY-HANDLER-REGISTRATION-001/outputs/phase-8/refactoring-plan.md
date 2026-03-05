# Phase 8 リファクタ計画

## 目的

- 振る舞いを変えずに Main/Preload/Renderer の責務境界を明確化し、再発防止の保守性を上げる。

## SubAgent 並列レビュー

### SubAgent-A（Main/IPC責務）

- 対象: `apps/desktop/src/main/ipc/index.ts`
- 判断: 既存修正は最小差分で妥当。追加リファクタは不要。
- 根拠: `registerAuthKeyHandlers` / `unregisterAuthKeyHandlers` がライフサイクルに接続済み。

### SubAgent-B（Preload/API契約）

- 対象: `apps/desktop/src/preload/index.ts`, `apps/desktop/src/preload/channels.ts`
- 判断: 契約変更不要。
- 根拠: `auth-key:*` チャネル名・型・公開境界に変更がない。

### SubAgent-C（Renderer/UX契約）

- 対象: `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`
- 判断: 契約変更不要。
- 根拠: `authKey.exists()` 呼び出し仕様は維持され、Main側登録漏れのみ解消。

### SubAgent-D（統合監査）

- 統合判定: 追加リファクタは実施せず、現行実装を確定。
- 理由: 仕様の矛盾・漏れなく、テストで回帰防止が成立。

## リファクタ実施方針

1. コード構造は現状維持（不要な再配置・命名変更をしない）。
2. 回帰コストを増やす変更を避ける。
3. リファクタ相当の品質改善は文書化とテスト強化で担保する。

## 判定（矛盾/漏れ/整合/依存）

- 矛盾: なし
- 漏れ: なし
- 整合性: Main/Preload/Renderer 契約整合
- 依存関係: Phase 5/7 成果物と整合

## 完了記録

- Phase 8では「実装変更なし」の判断を確定し、以降フェーズを品質保証・最終ゲートへ進める。
