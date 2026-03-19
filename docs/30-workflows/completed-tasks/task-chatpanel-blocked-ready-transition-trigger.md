# UT-CHATPANEL-FIX-003 blocked → ready 遷移トリガー IPC チャンネル確定

## メタ情報

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | UT-CHATPANEL-FIX-003                                                        |
| タスク名     | blocked → ready 遷移トリガー IPC チャンネル確定                             |
| 分類         | 設計確定                                                                    |
| 対象機能     | ChatPanel 状態機械の blocked → ready 遷移                                   |
| 優先度       | 中                                                                          |
| 見積もり規模 | 小規模                                                                      |
| ステータス   | 未実施                                                                      |
| 発見元       | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 エレガンスレビュー NOTE-4（2026-03-18） |
| 発見日       | 2026-03-18                                                                  |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ChatPanel の状態機械で `blocked` → `ready` への遷移トリガーについて、state-machine.md では `auth-key:exists`（Claude Agent SDK キー）を使用している。しかし LLM プロバイダー API キーの検証には `llm:check-health` が適切であり、遷移トリガーの IPC チャンネルが未確定。

### 1.2 問題点・課題

- `auth-key:exists` は Claude Agent SDK 用のキー存在確認であり、LLM プロバイダー（OpenAI, Anthropic API 等）のキー検証には不適切
- `llm:check-health` はプロバイダーへの接続確認を含むため、より正確だがレイテンシが高い
- 設計書で使用する IPC チャンネルが確定していないため、実装時に判断が分かれる

### 1.3 放置した場合の影響

実装者が誤った IPC チャンネルを使用し、blocked 状態が解除されない、または不正確な検証でセキュリティリスクが発生する可能性がある。

## 2. 何を達成するか（What）

### 2.1 目的

blocked → ready 遷移の IPC チャンネルを確定し、state-machine.md と IPC 契約マトリクスを更新する。

### 2.2 受入基準

- [ ] blocked → ready 遷移トリガーの IPC チャンネルが確定している
- [ ] state-machine.md が更新されている
- [ ] api-ipc-system-core.md の IPC 契約マトリクスが更新されている
- [ ] 遷移トリガーのテストケースが定義されている

## 3. どのように実施するか（How）

### 3.1 対象ファイル

- `outputs/phase-2/state-machine.md`（遷移トリガー更新）
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`（IPC 契約更新）
- `apps/desktop/src/renderer/hooks/useStreamingChat.ts`（遷移トリガー実装）

### 3.2 判断基準

| チャンネル                       | 検証内容                                    | レイテンシ | 正確性                                 |
| -------------------------------- | ------------------------------------------- | ---------- | -------------------------------------- |
| auth-key:exists                  | SDK キー存在のみ                            | 低         | 低（LLM プロバイダーキーを検証しない） |
| llm:check-health                 | プロバイダー接続確認                        | 高         | 高（実際の接続を検証）                 |
| llm:get-providers + ローカル検証 | プロバイダー一覧取得 + ローカルキー存在確認 | 中         | 中                                     |

### 3.3 推奨方針

`llm:get-providers` でプロバイダー一覧を取得し、selectedConfig のプロバイダーに対応するキーがローカルに存在するかを確認する。接続確認は初回送信時に遅延実行する。

## 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                       | 発見経緯                              | 解決策                            | 教訓                                                     |
| ------------------------------------------ | ------------------------------------- | --------------------------------- | -------------------------------------------------------- |
| P62 DEFAULT_CONFIG fallback 禁止の UX 影響 | blocked 状態遷移の初回起動 UX         | ErrorGuidance → Settings 誘導 CTA | blocked 状態の解除条件は UX に直結するため慎重に設計する |
| 8状態×4 capability の組み合わせ爆発        | blocked は none capability でのみ発生 | 有効組み合わせマトリクスで制約    | 遷移トリガー変更時にマトリクスとの整合を確認する         |

**固有の教訓**:

- IPC チャンネルの選択は設計段階で確定すべきだった。Phase 2 で `auth-key:exists` を選択した根拠が不明確で、Phase 10 のエレガンスレビューで初めて指摘された
- blocked → ready 遷移はユーザーの初回起動体験に直結する。遷移トリガーのレイテンシが高すぎると、ユーザーが長時間 blocked 画面を見続けることになる

## 4. 参照

- エレガンスレビュー NOTE-4: `outputs/verification-report.md`
- 状態機械設計: `outputs/phase-2/state-machine.md`
- IPC 契約: `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`
