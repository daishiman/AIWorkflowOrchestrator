# Phase 1: 要件抽出マップ

## 受入基準展開

| AC   | 検証可能な最小単位                       | 検証方法       |
| ---- | ---------------------------------------- | -------------- |
| AC-1 | 未完了検出時に復元プロンプトが表示される | UI 手動 + unit |
| AC-2 | 復元選択で session 継続                  | integration    |
| AC-3 | スキップ選択で新規開始                   | integration    |
| AC-4 | アクティブ session ID/経過時間表示       | UI 手動        |
| AC-5 | 期限切れセッションが削除される           | unit           |
| AC-6 | session_id が SDK 入力へ再利用される     | unit           |
| AC-7 | 互換性差分時に新規へフォールバック       | unit           |
| AC-8 | IPC 経由で一覧/詳細取得                  | integration    |
| AC-9 | unit/integration が存在する              | test inventory |

## スコープ

### 含む

- レンダラー側のセッション検出・復元 UI コンポーネント
- IPC ハンドラー（セッション一覧取得、セッション詳細取得、セッション復元、セッション削除）
- session_id / provenance snapshot / manifest hash の保存・復元契約
- SDK resume / continue / forkSession への入力マッピング
- 復元プロンプトコンポーネント（モーダルまたはインラインバナー）
- セッションインジケーター（アクティブセッション ID、経過時間表示）
- SkillLifecyclePanel へのセッション復元フロー統合
- 期限切れセッションのクリーンアップロジック
- preload API へのセッション関連メソッド追加
- ユニットテスト・インテグレーションテスト

### 含まない

- セッション永続化の main プロセス側実装（TASK-SDK-08）
- RuntimeSkillCreatorFacade のセッション管理ロジック変更
- 会話型インタビュー UI（TASK-P0-06）
- LLM アダプターのエラーハンドリング（TASK-RT-01）

## 依存関係

- upstream: TASK-SDK-08（マージ済み）、TASK-RT-06
- downstream: なし

## session_id 保存契約

- session_id を primary key として永続化
- manifestHash / sourceRoot / resolvedSkillPath で resume 互換性を判定
- 非互換時は新規セッションへフォールバック

## 命名規則

- IPC チャネル: `skill-creator:list-sessions` 形式（kebab-case）
- 型名: PascalCase（`SkillCreatorSessionListResponse`）
- ファイル名: kebab-case（`SessionResumePrompt.tsx`）
- 関数名: camelCase（`listSessions`）
