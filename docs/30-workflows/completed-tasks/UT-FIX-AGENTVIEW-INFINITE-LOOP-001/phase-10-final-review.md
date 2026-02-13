# Phase 10: 最終レビューゲート

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 10                                 |
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| 機能名   | AgentView無限ループ修正            |
| 作成日   | 2026-02-12                         |

## 目的

全工程の整合性を最終確認し、Phase 11への進行可否を判定する。

## 実行タスク

- 成果物確認: 依存Phase成果物の整合を確認する
- 判定実施: PASS/MINOR/MAJOR/CRITICALを判定する
- 未タスク準備: MINOR時の未タスク化方針を固定する

## 参照資料

| 資料名                | パス                        | 説明          |
| --------------------- | --------------------------- | ------------- |
| Phase 1 要件定義      | `phase-1-requirements.md`   | 依存Phase     |
| Phase 2 設計          | `phase-2-design.md`         | 依存Phase     |
| Phase 5 実装          | `phase-5-implementation.md` | 依存Phase     |
| Phase 10 最終レビュー | `phase-10-final-review.md`  | 本Phase成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                              | 内容       |
| ------------------ | --------------------------------------------------------------------------------- | ---------- |
| 状態管理           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | P31適合性  |
| テスト品質         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質判定   |
| Agent SDK Skill IF | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | UI契約確認 |

## 実行手順

### Step 1: 依存Phaseレビュー

各依存Phaseの完了条件と成果物を確認する。

### Step 2: 判定

判定基準へ照合し、結果を明記する。

### Step 3: 次工程入力作成

Phase 11の手動確認観点を抽出する。

## 統合テスト連携【必須】

| 観点           | 記録内容           |
| -------------- | ------------------ |
| Phase 1/2 接続 | 要件と設計の一致   |
| Phase 5 接続   | 実装結果の検証     |
| 回帰           | 横断機能の影響確認 |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | 永続化やDB操作がある場合           | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理がある場合                 | `aiworkflow-requirements: error-handling.md` |

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | 永続化がある場合            | `aiworkflow-requirements: database-*.md`               |

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の確認（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json更新方針が明記されている
- [ ] Phase末端で完了を明記している

## 成果物

| 成果物           | パス                       | 説明   |
| ---------------- | -------------------------- | ------ |
| 最終レビュー仕様 | `phase-10-final-review.md` | 本文書 |

## 完了条件

- [ ] 判定結果が明記されている
- [ ] 重大な問題の戻り先が明記されている
- [ ] MINOR時の未タスク化手順が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 11: 手動テスト（`phase-11-manual-test.md`）
