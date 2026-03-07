# Phase 13: PR作成

## メタ情報

| 項目      | 値                                            |
| --------- | --------------------------------------------- |
| Phase     | 13                                            |
| タスクID  | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 |
| 機能名    | supabase-fallback-profile-avatar              |
| 作成日    | 2026-03-07                                    |
| 前提Phase | Phase 12 ドキュメント更新                     |

## 目的

全Phase（1-12）の成果物を最終確認し、PRを作成して本タスクを完了させる。

## 実行タスク

### Task 1: 成果物最終確認

| Phase    | 成果物               | ステータス |
| -------- | -------------------- | ---------- |
| Phase 1  | 要件定義書           | 要確認     |
| Phase 2  | 設計書               | 要確認     |
| Phase 3  | 設計レビュー結果     | 要確認     |
| Phase 4  | テストファイル       | 要確認     |
| Phase 5  | 実装コード           | 要確認     |
| Phase 6  | 拡充テスト           | 要確認     |
| Phase 7  | カバレッジレポート   | 要確認     |
| Phase 8  | リファクタリング結果 | 要確認     |
| Phase 9  | 品質検証結果         | 要確認     |
| Phase 10 | 最終レビュー結果     | 要確認     |
| Phase 11 | 手動テスト結果       | 要確認     |
| Phase 12 | ドキュメント一式     | 要確認     |

### Task 2: コミット

#### ブランチ名

```
fix/supabase-fallback-profile-avatar
```

#### コミットメッセージ

```
fix(ipc): add Profile/Avatar fallback handlers for Supabase-unconfigured environments

Register fallback IPC handlers for 11 Profile channels and 3 Avatar
channels when Supabase is not configured, preventing unhandled
'No handler registered' errors and screen crashes.
```

### Task 3: PR作成

#### PRタイトル

```
fix(ipc): Supabase未設定時のProfile/Avatarフォールバックハンドラ追加
```

#### PR本文テンプレート

```markdown
## Summary

- Supabase未設定環境でProfile画面/Avatar操作時に `Error: No handler registered` でクラッシュする問題を修正
- `registerProfileFallbackHandlers()` (11チャンネル) と `registerAvatarFallbackHandlers()` (3チャンネル) を新設
- 既存の `registerAuthFallbackHandlers()` と同一パターンで実装

## Test Plan

- [ ] ユニットテスト: Profile 11チャンネルのフォールバックレスポンス検証
- [ ] ユニットテスト: Avatar 3チャンネルのフォールバックレスポンス検証
- [ ] ユニットテスト: チャンネル数同期検証（回帰テスト）
- [ ] 手動テスト: Supabase未設定環境でProfile画面がクラッシュしないことを確認
- [ ] 手動テスト: Supabase設定済み環境で通常動作に影響がないことを確認
```

### Task 4: CI確認

- [ ] GitHub Actions の全チェックがパス
- [ ] Lint / TypeCheck / Test が全件成功

## 参照資料

| 資料名                   | パス                                  | 説明                       |
| ------------------------ | ------------------------------------- | -------------------------- |
| PR作成ルール             | `.claude/rules/07-git-and-tooling.md` | ブランチ名・PRタイトル規約 |
| コミット前チェックリスト | `.claude/rules/07-git-and-tooling.md` | lint/typecheck/test確認    |

### システム仕様（aiworkflow-requirements）

- 該当なし（PR作成は仕様書参照不要）

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

1. 全Phase（1-12）の成果物ステータスを確認
2. `fix/supabase-fallback-profile-avatar` ブランチを作成
3. 変更をステージング
4. コミット（`--no-verify` 禁止）
5. リモートにプッシュ
6. `gh pr create` でPR作成
7. CI結果を確認

## 成果物

| 成果物 | パス          | 説明                     |
| ------ | ------------- | ------------------------ |
| PR     | GitHub PR URL | マージ待ちのPull Request |

## 完了条件

- [ ] 全Phase（1-12）の成果物が揃っていることを確認
- [ ] ブランチ名が `fix/` プレフィックス
- [ ] PRタイトルが70文字以内
- [ ] PR本文にSummary + Test Plan が含まれる
- [ ] CI全チェックがパス
- [ ] `--no-verify` を使用していない

## 次のPhase

なし（タスク完了）
