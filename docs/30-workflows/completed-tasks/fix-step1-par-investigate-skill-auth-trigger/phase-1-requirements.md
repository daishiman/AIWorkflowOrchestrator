# Phase 1: 調査要件定義

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 1                         |
| 機能名 | TASK-TRACE-SKILL-AUTH-001 |
| 作成日 | 2026-04-01                |

## 目的

「なぜスキル生成がauth:loginを呼ぶか」を特定するための調査要件を固定する。
調査範囲・検証条件・成功基準を明確にし、Phase 2 の調査設計に必要な前提を確立する。

## 背景と問題定義

### 発生事象

スキル生成ボタン押下時に `auth:login` IPC チャネルへの呼び出しが発生し、タイムアウトエラーが起きている。

### 既知の情報

| 調査済み内容                                                 | 結果                                 |
| ------------------------------------------------------------ | ------------------------------------ |
| `SkillLifecyclePanel.handlePrepare` → detectMode → planSkill | `login()` を直接呼ばないことを確認   |
| `auth:login` の呼び出し元コンポーネント調査                  | AccountSection / AuthView のみと確認 |
| SkillLifecyclePanel の直接 `login()` 呼び出し                | 存在しないことを確認                 |
| agentSlice / authModeSlice の直接呼び出し                    | 直接的な呼び出しは未発見             |
| 未発見コンポーネントの存在                                   | 可能性が高いと判断                   |

### 問題の核心

静的コード解析だけでは呼び出し経路が特定できない。
実行時のスタックトレースを取得して動的に経路を確認する必要がある。

## skill 準拠レビュー観点

| skill                      | 確認すること                                                                                 | 反映先                         |
| -------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------ |
| task-specification-creator | Phase 1-13 の単一責務性、Phase 12 / 13 の完了条件、SubAgent 分割、コミット/PR 禁止、実行粒度 | index / phase-2 / phase-5      |
| aiworkflow-requirements    | canonical root、関連タスク表、current facts、path drift、index 再生成、仕様同期の完全性      | index / lane index / artifacts |

## ブランチ差分

| 変更点                  | 意味                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| 旧 workflow root の削除 | `docs/30-workflows/skill-creator-agent-sdk-lane/fix-step1-par-investigate-skill-auth-trigger/` は削除済み |
| 新 workflow root の追加 | `docs/30-workflows/fix-step1-par-investigate-skill-auth-trigger/` を canonical root として扱う            |
| 参照リンクの drift      | 親 lane index の相対リンク更新が必要                                                                      |
| 並列タスクの再確認      | `TASK-FIX-AUTH-IPC-001` と `TASK-FIX-IPC-TIMEOUT-001` を同 wave で扱う                                    |

## SubAgent分担

| SubAgent | 責務                                                    | 並列可否               |
| -------- | ------------------------------------------------------- | ---------------------- |
| A        | 2つの skill 定義から必須項目を抽出する                  | B と並列               |
| B        | 旧/new workflow root と親参照の drift を洗い出す        | A と並列               |
| C        | 並列タスク・依存関係・除外範囲を整理して Phase 2 へ渡す | A/B の初期結果後に直列 |

## 機能要求（FR）

| ID   | 要求                                                                                     |
| ---- | ---------------------------------------------------------------------------------------- |
| FR-1 | スキル生成ボタン押下から `auth:login` IPC 呼び出しまでのスタックトレースを取得できること |
| FR-2 | スタックトレースから呼び出し元コンポーネント/関数を特定できること                        |
| FR-3 | 不要な `auth:login` 呼び出しを除去できること                                             |
| FR-4 | 除去後にスキル生成フローが正常に動作することを確認できること                             |

## 非機能要求（NFR）

| ID    | 要求                                                                   |
| ----- | ---------------------------------------------------------------------- |
| NFR-1 | デバッグコードは調査完了後に必ず除去すること                           |
| NFR-2 | 修正はスキル生成フローの正常系に影響を与えないこと                     |
| NFR-3 | 修正は `auth:login` の正当な呼び出し（AccountSection等）を妨げないこと |

## 制約

- 本タスクは調査主体のため、Phase 3 のゲートでユーザー承認を得るまで修正作業に着手しない
- 修正範囲は `auth:login` の不要な呼び出しの除去のみとし、認証フローの再設計は対象外とする
- デバッグ用のスタックトレース出力コードは成果物として記録後に除去する

## 調査対象候補

| 優先度 | ファイル                                                         | 調査観点                                    |
| ------ | ---------------------------------------------------------------- | ------------------------------------------- |
| 高     | `apps/desktop/src/renderer/store/slices/agentSlice.ts`           | 完全実装確認・login呼び出しパターン検索     |
| 高     | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts` | preflight処理でのauth呼び出し確認           |
| 中     | `apps/desktop/src/preload/index.ts`                              | `auth:login` IPC 境界の実装確認             |
| 中     | `docs/30-workflows/skill-creator-agent-sdk-lane/index.md`        | 親 lane の参照パスと並列タスクの整合確認    |
| 中     | スキル生成 → terminal_handoff 受信後の Renderer 側処理全体       | useEffect連鎖によるトリガー                 |
| 中     | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`        | dispatch連鎖による間接的な login() 呼び出し |

## 検証4条件

調査完了の判定基準として以下4条件を全て満たすことを要件とする:

1. **スタックトレース取得**: `auth:login` 呼び出し時の完全なコールスタックが取得できていること
2. **呼び出し元特定**: スタックトレースから具体的なファイル名・関数名・行番号が判明していること
3. **トリガー条件特定**: スキル生成のどのタイミングで呼び出しが発生するか特定できていること
4. **修正方針確定**: 不要な呼び出しを除去するための具体的な修正方針が決定していること

## 参照資料

| 資料名                      | パス                                                                     | 説明                             |
| --------------------------- | ------------------------------------------------------------------------ | -------------------------------- |
| agentSlice 実装             | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                   | 調査対象                         |
| skillExecutionAuthPreflight | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`         | 調査対象                         |
| authSlice                   | `apps/desktop/src/renderer/store/slices/authSlice.ts`                    | login() が定義されているスライス |
| TASK-FIX-AUTH-IPC-001       | `../fix-step2-seq-auth-login-ipc-nonblocking/`                           | 並列実行候補（auth handler 側）  |
| TASK-FIX-IPC-TIMEOUT-001    | `../skill-creator-agent-sdk-lane/fix-step1-par-ipc-timeout-per-channel/` | 並列実行候補（timeout 側）       |

## 実行手順

### ステップ1: 調査スコープの確定

- 調査対象ファイルの優先順位を確定する
- 静的解析で特定できない理由（動的dispatch・useEffect連鎖等）を整理する
- スタックトレース取得方法の候補を列挙する

### ステップ2: 成功基準の固定

- 検証4条件の合否判定基準を具体化する
- Phase 3 でユーザー承認を得る際の判断基準を明文化する

### ステップ3: 除外範囲の確定

- 調査対象外のファイル・コンポーネントを明記する
- 修正で触れない既存の正当な auth:login 呼び出し経路を特定しておく

## 成果物

| 成果物           | パス                      | 説明                   |
| ---------------- | ------------------------- | ---------------------- |
| 要件定義書       | `phase-1-requirements.md` | 本ファイル             |
| 調査スコープ定義 | `investigation-scope.md`  | 対象ファイル・除外範囲 |

## 完了条件

- [ ] 問題の核心（スタックトレース取得による動的調査の必要性）が明記されている
- [ ] 機能要求 FR-1〜FR-4 が定義されている
- [ ] 検証4条件が明記されている
- [ ] 検証対象 skill（task-specification-creator / aiworkflow-requirements）が明記されている
- [ ] ブランチ差分と canonical root の移設が明記されている
- [ ] 並列実行候補（TASK-FIX-AUTH-IPC-001 / TASK-FIX-IPC-TIMEOUT-001）が明記されている
- [ ] 調査対象候補が優先度付きで列挙されている
- [ ] 除外範囲（認証フロー再設計等）が明記されている
- [ ] Phase 3 ゲートでユーザー承認を得る旨が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
