# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 1                           |
| Phase名    | 要件定義                    |
| 前提Phase  | なし                        |
| 後続Phase  | Phase 2                     |
| ステータス | 未実施                      |
| 作成日     | 2026-03-25                  |
| 機能名     | w5b-sc-e2e-terminal-handoff |
| タスクID   | TASK-SC-08-E2E-VALIDATION   |

---

## 目的

Skill Creator LLM統合の全フロー（plan → execute → verify → improve → TerminalHandoff）をE2Eテストするための要件を定義する。正本（`index.md`）の全AC（AC-1〜AC-8）充足確認シナリオと NFR 検証項目を確定する。

## 背景

Skill Creator LLM統合は Wave 1〜5 の8タスクで構成される。本タスク（w5b）は Wave 5 の最終タスクであり、以下の役割を持つ:

1. **E2E検証**: タスク01〜07の全成果物が統合されて正常に動作することを検証する
2. **verify() 実装**: FR-4（生成スキルの要求充足をトータル検証）を実装する
3. **TerminalHandoff 検証**: FR-6（API Key 未設定時の TerminalHandoff 経路保証）を検証する

前提タスク:

- w3a（TASK-SC-04-OUTPUT-PERSISTENCE）: SkillFileWriter + SkillStructureReader
- w3b（TASK-SC-05-IMPROVE-LLM）: improve() 差分提案 + applyDiff
- w4（TASK-SC-06-UI-RUNTIME-CONN）: UI→Runtime + 承認フロー + ライフサイクルUI

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: E2Eテストシナリオの定義（5シナリオ）

**目的**: 全AC を網羅する5つのテストシナリオを定義する

**実行手順**:

1. 正本（`index.md`）の AC-1〜AC-8 と FR-1〜FR-6 を読み込む
2. 以下の5シナリオを定義する:
   - **シナリオA: 正常フロー** - plan → execute-plan → スキル生成完了（AC-1, AC-2）
   - **シナリオB: TerminalHandoff 経路** - API Key 未設定時の `suggestedCommand` 付きレスポンス検証（AC-4）
   - **シナリオC: LLMエラー発生時の回復フロー** - エラーメッセージ表示とリトライ（AC-7）
   - **シナリオD: improve 機能** - 既存スキルの改善（AC-5）
   - **シナリオE: 後方互換** - 既存の `skill:create` チャンネルが引き続き動作すること（AC-8）

**期待される成果物**:

- E2Eテストシナリオ定義書（5シナリオ）

### タスク2: AC-FR-シナリオ対応表の作成

**目的**: 全AC・全FR がシナリオでカバーされていることを可視化する

**実行手順**:

1. 以下の対応表を作成する:

| AC   | 正本定義                                                    | 対応シナリオ        | 対応FR |
| ---- | ----------------------------------------------------------- | ------------------- | ------ |
| AC-1 | 自然言語入力 → LLM がカテゴリベースでスキル一式を生成する   | シナリオA           | FR-1   |
| AC-2 | 生成スキルが `.claude/skills/` に永続化され即座に実行可能   | シナリオA           | FR-2   |
| AC-3 | 生成進捗が UI にストリーミング表示される                    | w5a で検証済み      | FR-2   |
| AC-4 | API Key 未設定時は TerminalHandoffBundle + CLI コマンド表示 | シナリオB           | FR-6   |
| AC-5 | improve: フィードバック → 差分提案 → 承認で適用             | シナリオD           | FR-3   |
| AC-6 | verify: 生成スキルが要求を満たすかトータル検証できる        | シナリオA（verify） | FR-4   |
| AC-7 | エラー時に適切なメッセージ表示                              | シナリオC           | -      |
| AC-8 | 既存 skill:create（テンプレート生成）が破壊されない         | シナリオE           | -      |

2. 全ACにシナリオが割り当てられていることを確認する

**期待される成果物**:

- AC-FR-シナリオ対応表

### タスク3: NFR（非機能要件）検証項目の定義

**目的**: 非機能要件の検証方法を定義する

**実行手順**:

1. 以下の NFR 検証項目を定義する:
   - **NFR-1（セキュリティ）**: IPC経由で機密情報（API Key, スタックトレース）が漏洩しないこと
   - **NFR-2（パフォーマンス）**: plan が 30秒以内、execute が 120秒以内に完了すること
   - **NFR-3（後方互換）**: 既存 `skill:create` API が破壊されないこと
   - **NFR-4（エラー耐性）**: LLMエラー後にアプリがクラッシュしないこと
2. 各NFR に対して具体的な検証方法（テスト手法・計測方法）を記述する

**期待される成果物**:

- NFR検証項目一覧（4項目）

### タスク4: IPC チャネル・レスポンス形式のインベントリ

**目的**: E2Eテストで検証する IPC チャネルとレスポンス形式を明確に列挙する

**実行手順**:

1. 正本から以下のIPCチャネルを抽出する:
   - `skill-creator:plan` - 要求分析・カテゴリ選択
   - `skill-creator:execute-plan` - ファイル生成・永続化
   - `skill-creator:verify` - 生成スキルの動作検証
   - `skill-creator:improve-skill` - フィードバック → 差分適用
   - `skill-creator:cancel` - キャンセル
   - `SKILL_CREATOR_PROGRESS` - 進捗ストリーミング
   - `skill:create` - 既存テンプレート生成（後方互換）
2. 各チャネルの成功・エラーレスポンス形式を定義する

**期待される成果物**:

- IPCチャネル・レスポンス形式インベントリ

### タスク5: 前提タスクの完了確認方法の定義

**目的**: 前提タスク（w3a, w3b, w4）の完了を確認する方法を定義する

**実行手順**:

1. 各前提タスクの成果物が存在することの確認コマンドを定義する:
   - w3a: `SkillFileWriter` / `SkillStructureReader` クラスの存在
   - w3b: `improve()` メソッドの実装と `SkillDiff` 型の定義
   - w4: UI→Runtime パイプラインの接続確認
2. 各前提タスクのPhase 10 最終レビュー結果が PASS であることの確認方法を定義する

**期待される成果物**:

- 前提タスク完了確認チェックリスト

---

## 参照資料

| 参照資料         | パス                                                                           | 内容                                   |
| ---------------- | ------------------------------------------------------------------------------ | -------------------------------------- |
| 正本（全体仕様） | `docs/30-workflows/skill-creator-llm-integration/index.md`                     | AC/FR定義・アーキテクチャ・型設計      |
| UI/UX仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-skill-creator.md`     | Skill Creator のUI/UX仕様              |
| w3a仕様          | `docs/30-workflows/skill-creator-llm-integration/w3a-sc-output-persistence/`   | SkillFileWriter + SkillStructureReader |
| w3b仕様          | `docs/30-workflows/skill-creator-llm-integration/w3b-sc-improve-llm/`          | improve() 差分提案                     |
| w4仕様           | `docs/30-workflows/skill-creator-llm-integration/w4-sc-ui-runtime-connection/` | UI-Runtime接続                         |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                           | P40, P60, P63                          |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                       | 内容                                        |
| ----------------------- | -------------------------------------------------------------------------- | ------------------------------------------- |
| Skill Creator UI/UX仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-skill-creator.md` | TerminalHandoff経路・承認フロー・進捗UI仕様 |

---

## 成果物

| 成果物                | パス                                        | 内容                         |
| --------------------- | ------------------------------------------- | ---------------------------- |
| 本ドキュメント        | `phase-01-requirements.md`                  | Phase 1 要件定義書           |
| E2Eテストシナリオ定義 | `outputs/phase-1/e2e-test-scenarios.md`     | 5シナリオ定義                |
| AC-FR-シナリオ対応表  | `outputs/phase-1/ac-fr-scenario-mapping.md` | 網羅性確認表                 |
| NFR検証項目一覧       | `outputs/phase-1/nfr-verification-items.md` | 4項目の検証方法              |
| IPCインベントリ       | `outputs/phase-1/ipc-inventory.md`          | チャネル・レスポンス形式定義 |

---

## 統合テスト連携

本Phase では以下の統合テスト連携アクションを実施する:

- 接続要件（IPC チャネル・レスポンス形式・進捗ストリーミング）を要件に明記する
- E2Eテストで検証する統合ポイント（Main Process ↔ Renderer ↔ LLM）を定義する
- 前提タスク（w3a, w3b, w4）との統合インターフェースを確認する

---

## 完了条件

- [ ] 5つのE2Eテストシナリオ（A〜E）が定義されている
- [ ] シナリオと AC-1〜AC-8（正本準拠）の対応表が作成されている
- [ ] 全ACにシナリオが割り当てられている（AC-3 は w5a で検証済みとして記録）
- [ ] NFR-1〜NFR-4 の検証項目が定義されている
- [ ] パフォーマンス基準（plan 30秒以内 / execute 120秒以内）が明記されている
- [ ] IPCチャネル名が正本準拠（`skill-creator:execute-plan` 等）であることが確認されている
- [ ] 前提タスク（w3a / w3b / w4）の完了確認方法が定義されている

---

## Phase末端アクション

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（Wave 5 の最初の Phase）
- **後続**: Phase 2 へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 実行タスク

- タスク1（E2Eテストシナリオ定義）:
- タスク2（AC-FR-シナリオ対応表）:
- タスク3（NFR検証項目定義）:
- タスク4（IPCインベントリ）:
- タスク5（前提タスク完了確認）:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/w5b-sc-e2e-terminal-handoff/phase-02-design.md`
