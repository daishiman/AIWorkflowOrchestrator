# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase番号  | 12                                       |
| Phase名    | ドキュメント更新                         |
| 目的       | ドキュメント更新・仕様反映・未タスク検出 |
| 前提Phase  | Phase 11（手動テスト検証）               |
| 後続Phase  | Phase 13（PR作成）                       |
| ステータス | 未実施                                   |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

---

## 使用スキル

| スキル名                         | パス                                                       | 選定理由                                            |
| -------------------------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| api-documentation-best-practices | `.claude/skills/api-documentation-best-practices/SKILL.md` | APIドキュメント作成（Trigger: APIドキュメント）     |
| tutorial-design                  | `.claude/skills/tutorial-design/SKILL.md`                  | チュートリアル設計（Trigger: チュートリアル）       |
| version-control-for-docs         | `.claude/skills/version-control-for-docs/SKILL.md`         | ドキュメントバージョン管理（Trigger: ドキュメント） |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

---

## 成果物

| 成果物               | 説明                      | 配置先                                         | 必須 |
| -------------------- | ------------------------- | ---------------------------------------------- | ---- |
| 実装ガイド           | 概念的+技術的ドキュメント | `outputs/phase-12/implementation-guide.md`     | ✅   |
| APIリファレンス      | Agent SDK統合API仕様      | `outputs/phase-12/api-reference.md`            | ✅   |
| ドキュメント更新履歴 | 更新履歴                  | `outputs/phase-12/documentation-update-log.md` | ✅   |
| 未タスク検出レポート | 検出結果（なしでも出力）  | `outputs/phase-12/unassigned-task-report.md`   | ✅   |
| 未完了タスク指示書   | 検出時のみ作成            | `docs/30-workflows/unassigned-task/*.md`       | 条件 |

---

## サブフェーズ

### Phase 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**Part 1: 概念的な説明**

含める内容:

1. **比喩を使った説明**: 中学生にもわかるように
2. **なぜこの設計にしたか**: 設計理由の説明
3. **全体の流れ**: ユーザーの操作から結果表示まで

**Part 2: 技術的な詳細**

含める内容:

1. **全体アーキテクチャ**: ASCII図解付きのレイヤー構造
2. **各層の実装詳細**: コード例と設計意図
3. **API仕様**: 入出力・エラーハンドリング
4. **用語集**: 専門用語の読み方・意味

**アーキテクチャ図**:

```
┌─────────────────────────────────────────────────────┐
│                   Renderer Process                   │
│  ┌─────────────────────────────────────────────────┐ │
│  │                   React UI                       │ │
│  │          window.agentAPI.query()                │ │
│  └──────────────────────┬──────────────────────────┘ │
└─────────────────────────┼───────────────────────────┘
                          │ IPC (contextBridge)
┌─────────────────────────┼───────────────────────────┐
│                   Main Process                       │
│  ┌──────────────────────┴──────────────────────────┐ │
│  │              IPC Handler (agent-handler)         │ │
│  └──────────────────────┬──────────────────────────┘ │
│  ┌──────────────────────┴──────────────────────────┐ │
│  │              Agent Client (@repo/shared)         │ │
│  └──────────────────────┬──────────────────────────┘ │
└─────────────────────────┼───────────────────────────┘
                          │ HTTPS
┌─────────────────────────┴───────────────────────────┐
│                Claude Agent SDK                      │
│             (Anthropic Cloud Service)               │
└─────────────────────────────────────────────────────┘
```

### Phase 12-2: システムドキュメント更新

api-documentation-best-practicesスキルを参照し、APIリファレンスを作成する。

**更新対象**:

- `docs/00-requirements/` 配下（必要に応じて）
- `.claude/skills/aiworkflow-requirements/references/`（必要に応じて）

**更新原則**: 概要のみ記載、Single Source of Truth遵守

**API一覧**:

| API名              | 説明           | 入力               | 出力        |
| ------------------ | -------------- | ------------------ | ----------- |
| `agentAPI.query`   | クエリ送信     | prompt, options    | QueryResult |
| `agentAPI.session` | セッション管理 | action, sessionId? | SessionInfo |

### Phase 12-3: 未タスク検出【必須】

**検出ソース**:

| #   | ソース               | 確認項目                | Grepパターン                                        |
| --- | -------------------- | ----------------------- | --------------------------------------------------- |
| 1   | Phase 3レビュー結果  | MINOR判定の指摘事項     | `outputs/phase-3/`                                  |
| 2   | Phase 10レビュー結果 | MINOR判定の指摘事項     | `outputs/phase-10/`                                 |
| 3   | Phase 11手動テスト   | スコープ外の発見事項    | `outputs/phase-11/`                                 |
| 4   | 各Phase成果物        | 「将来対応」「TODO」    | `grep -r "TODO\|FIXME\|将来対応" outputs/`          |
| 5   | コードベース         | TODO/FIXME/HACKコメント | `grep -rn "TODO\|FIXME\|HACK\|XXX" packages/ apps/` |
| 6   | スキルLOGS.md        | partial/failure記録     | 各使用スキルのLOGS.md                               |

**検出コマンド**:

```bash
# TODO/FIXMEコメント検索
grep -rn "TODO\|FIXME\|HACK\|XXX" packages/ apps/

# 各Phaseの成果物確認
ls outputs/phase-*/

# スキルフィードバック確認
grep -rn "partial\|failure" .claude/skills/*/LOGS.md
```

**出力先**: 検出された未タスクがある場合、`docs/30-workflows/unassigned-task/` に指示書を作成する。

---

## 実行手順

### Step 1: Phase 12-1の実行

1. tutorial-designスキルを参照し、Part 1（概念的説明）を作成
2. api-documentation-best-practicesスキルを参照し、Part 2（技術的詳細）を作成
3. 実装ガイドを `outputs/phase-12/implementation-guide.md` に出力

### Step 2: Phase 12-2の実行

1. version-control-for-docsスキルを参照し、ドキュメント更新方針を確認
2. APIリファレンスを `outputs/phase-12/api-reference.md` に出力
3. 更新履歴を `outputs/phase-12/documentation-update-log.md` に記録

### Step 3: Phase 12-3の実行

1. 上記検出ソースを全て確認
2. 未タスク検出レポートを `outputs/phase-12/unassigned-task-report.md` に出力
3. 検出された未タスクがある場合、指示書を作成

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] APIリファレンスが作成されている
- [ ] ドキュメント更新履歴が記録されている
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                  | 内容                    |
| -------------- | --------------------------------------------------------------------- | ----------------------- |
| interfaces-llm | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md` | LLMインターフェース仕様 |

---

## スキルフィードバック記録

| スキル                           | 結果    | 備考              |
| -------------------------------- | ------- | ----------------- |
| api-documentation-best-practices | pending | Phase完了後に記録 |
| tutorial-design                  | pending | Phase完了後に記録 |
| version-control-for-docs         | pending | Phase完了後に記録 |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（aiworkflow-requirements）
2. Phase 12-1: 実装ガイド作成（Part 1 + Part 2）
3. tutorial-designスキルの実行
4. api-documentation-best-practicesスキルの実行
5. Phase 12-2: システムドキュメント更新
6. version-control-for-docsスキルの実行
7. Phase 12-3: 未タスク検出
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-sdk-integration --phase 12
```

---

## 次のPhase

Phase 13: PR作成

---

## 備考

- 実装ガイドは「なぜ」を重視した説明を含める
- 未タスクは優先度を付けて記録する
- Part 1は中学生でも理解できる比喩を使う
