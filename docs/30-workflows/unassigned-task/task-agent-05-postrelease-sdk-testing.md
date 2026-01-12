# 実SDK接続後E2Eテスト - タスク指示書

## メタ情報

| 項目         | 内容                          |
| ------------ | ----------------------------- |
| タスクID     | AGENT-005-POSTRELEASE         |
| タスク名     | 実SDK接続後E2Eテスト          |
| 分類         | 品質保証                      |
| 対象機能     | エージェント機能              |
| 優先度       | 中                            |
| 見積もり規模 | 中規模                        |
| ステータス   | 待機中（SDKリリース待ち）     |
| 発見元       | AGENT-005 Phase 10-12レビュー |
| 発見日       | 2026-01-12                    |

---

## 依存関係

| 依存タイプ   | 内容                                          |
| ------------ | --------------------------------------------- |
| ブロッキング | `@anthropic-ai/claude-agent-sdk` pnpmリリース |
| 前提タスク   | AGENT-005（Claude Agent SDK統合）完了済み     |
| 並行可能     | なし（SDK公開後に実施）                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

AGENT-005では`@anthropic-ai/claude-agent-sdk`がpnpm未公開のため、モック実装によるテストのみを完了した。SDKの実際の動作、パフォーマンス特性、長時間実行時の安定性は実環境でのテストが必要。

### 1.2 問題点・課題

- 実SDKのストリーミング遅延が未計測
- 長時間実行時のメモリリーク有無が未確認
- ネットワーク障害時の動作が未検証
- 実SDKのHooks/Permission Controlとの互換性が未確認

### 1.3 放置した場合の影響

- 本番環境での予期しない動作
- パフォーマンス問題の見落とし
- メモリリークによるアプリケーション不安定化
- ネットワーク障害時のユーザー体験悪化

---

## 2. 何を達成するか（What）

### 2.1 目的

実SDKを使用したE2Eテスト、パフォーマンス計測、長時間実行テスト、ネットワーク障害テストを完了し、本番品質を保証する。

### 2.2 最終ゴール

- 実SDKでE2Eテストがパスする
- ストリーミング遅延が許容範囲内（目標: 100ms以下）
- 長時間実行（1時間以上）でメモリリークがない
- ネットワーク障害時に適切にエラーハンドリングされる

### 2.3 スコープ

#### 含むもの

- Playwright E2Eテスト追加（実SDK使用）
- パフォーマンス計測スクリプト
- 長時間実行テストシナリオ
- ネットワーク障害シミュレーションテスト
- 結果レポート作成

#### 含まないもの

- 新機能実装
- 既存コードの大幅変更
- UI変更

### 2.4 成果物

| 成果物                     | パス                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| E2Eテストスイート          | `apps/desktop/e2e/agent-sdk-integration.spec.ts`                                             |
| パフォーマンス計測結果     | `docs/30-workflows/claude-code-integration/outputs/postrelease/performance-report.md`        |
| 長時間実行テスト結果       | `docs/30-workflows/claude-code-integration/outputs/postrelease/stability-report.md`          |
| ネットワーク障害テスト結果 | `docs/30-workflows/claude-code-integration/outputs/postrelease/network-resilience-report.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `@anthropic-ai/claude-agent-sdk`がpnpmに公開されている
- AGENT-005が完了している
- Claude Code（ローカル認証済み）がインストールされている
- 有効なClaude Code契約（Pro/Team/Enterprise）がある

### 3.2 依存タスク

- AGENT-005: Claude Agent SDK統合（完了）

### 3.3 必要な知識・スキル

- Playwright E2Eテスト
- パフォーマンス計測手法
- メモリプロファイリング
- ネットワークシミュレーション

### 3.4 推奨アプローチ

1. SDKパッケージをインストール
2. モック実装を実SDK呼び出しに切り替え
3. E2Eテストを実行し動作確認
4. パフォーマンス計測を実施
5. 長時間実行テストを実施
6. ネットワーク障害テストを実施
7. 結果レポートを作成

---

## 4. 実行手順

### Step 1: SDKインストールと設定確認

```bash
# SDKインストール
pnpm --filter @repo/desktop add @anthropic-ai/claude-agent-sdk

# 型定義確認
pnpm --filter @repo/desktop typecheck
```

### Step 2: モック実装の切り替え

実SDKを使用するように`AgentExecutor.ts`のインポートを確認。

### Step 3: E2Eテスト作成・実行

```bash
# E2Eテスト実行
pnpm --filter @repo/desktop test:e2e
```

### Step 4: パフォーマンス計測

- ストリーミング初回応答時間
- メッセージ間遅延
- メモリ使用量推移

### Step 5: 長時間実行テスト

- 1時間連続実行
- メモリ使用量監視
- CPU使用率監視

### Step 6: ネットワーク障害テスト

- ネットワーク切断時の動作
- 再接続時の動作
- タイムアウト時の動作

---

## 5. 完了条件チェックリスト

### テスト要件

- [ ] E2Eテストがすべてパスする
- [ ] 実SDKでストリーミングが正常動作する
- [ ] Hooksシステムが実SDKで動作する
- [ ] Permission Controlが実SDKで動作する

### パフォーマンス要件

- [ ] ストリーミング初回応答: 500ms以下
- [ ] メッセージ間遅延: 100ms以下
- [ ] 1時間実行後のメモリ増加: 100MB以下

### 安定性要件

- [ ] 長時間実行でクラッシュしない
- [ ] ネットワーク切断時に適切にエラー表示
- [ ] ネットワーク復旧後に再実行可能

### ドキュメント要件

- [ ] パフォーマンス計測結果が記録されている
- [ ] 長時間実行テスト結果が記録されている
- [ ] ネットワーク障害テスト結果が記録されている

---

## 6. 検証方法

```bash
# E2Eテスト
pnpm --filter @repo/desktop test:e2e -- --grep "agent-sdk"

# パフォーマンステスト
node apps/desktop/scripts/performance-test.mjs

# メモリプロファイル
node --inspect apps/desktop/scripts/long-running-test.mjs
```

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                      |
| ---------------------- | ------ | -------- | ------------------------- |
| SDK APIの仕様変更      | 高     | 中       | SDK更新時の型チェック実施 |
| パフォーマンス要件未達 | 中     | 低       | ボトルネック分析と最適化  |
| メモリリーク発見       | 高     | 低       | リソース解放箇所の見直し  |

---

## 8. 参照情報

### 関連ドキュメント

- AGENT-005実装ガイド: `docs/30-workflows/claude-code-integration/outputs/phase-12/implementation-guide.md`
- 型定義: `packages/shared/src/types/agent-execution.ts`
- 実装コード: `apps/desktop/src/main/services/agent/`

### 関連タスク

- AGENT-005: Claude Agent SDK統合（本タスクの前提）
- AGENT-004: エージェント実行UI

---

## 9. 備考

### 開始トリガー

`@anthropic-ai/claude-agent-sdk`がnpmに公開され次第、本タスクを開始する。

### 確認方法

```bash
# SDKの公開確認
pnpm view @anthropic-ai/claude-agent-sdk version
```

公開が確認でき次第、ステータスを「未実施」に変更して実行を開始する。
