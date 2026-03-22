# Phase 10: 最終レビュー — ChatViewへのインラインモデルセレクタ配置

## メタ情報

| 項目          | 値                                          |
| ------------- | ------------------------------------------- |
| 機能名        | chatview-inline-model-selector-integration  |
| タスクID      | TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION |
| Phase         | 10                                          |
| 作成日        | 2026-03-21                                  |
| 依存          | Phase 9（品質検証）完了後                   |
| 前Phase成果物 | ./phase-9-quality-assurance.md              |

## 目的

Phase 2設計書のAC-2（ChatViewでの動作）を軸に実装の多角的品質・整合性を検証し、PASS/MINOR/MAJOR/CRITICALを判定する。

## 実行タスク

- AC-2（ChatViewでの動作）の全受入基準を検証する
- セキュリティ・型安全・状態管理の観点でコードレビューを行う
- 判定に応じてPhase 11へ進むか、または上位Phaseへ戻るかを決定する
- MINOR指摘は全件を未タスク仕様書に変換する（省略不可）

## 参照資料

| 資料                                             | パス                                  |
| ------------------------------------------------ | ------------------------------------- |
| Phase 1 要件定義（受入基準）                     | ./phase-1-requirements.md             |
| Phase 2 設計書（ChatView配置設計 3.1/3.3）       | ./phase-2-design.md                   |
| Phase 9 品質検証結果                             | ./phase-9-quality-assurance.md        |
| タスク実行ワークフロールール（Phase 10判定基準） | .claude/rules/05-task-execution.md    |
| セキュリティルール                               | .claude/rules/04-electron-security.md |
| コード品質ルール                                 | .claude/rules/02-code-quality.md      |

## 実行手順

### Step 1: AC-2 受入基準の検証

Phase 2設計書セクション3.3のAC-2（ChatViewでの動作）に記載された受入基準を1項目ずつ検証する。

**確認項目（Phase 2設計書より）:**

| AC-2項目                                                  | 確認方法                    | 結果     |
| --------------------------------------------------------- | --------------------------- | -------- |
| InlineModelSelectorがChatViewヘッダー左側に配置されている | コードレビュー + テスト結果 | （記入） |
| SystemPromptToggleButtonの隣に配置されている              | コードレビュー              | （記入） |
| ストリーミング中にInlineModelSelectorがdisabledになる     | TC-I-5確認                  | （記入） |
| モデル選択後にLLMGuidanceBannerが非表示になる             | TC-I-4確認                  | （記入） |
| モデル未選択時にLLMGuidanceBannerが表示される             | TC-I-3確認                  | （記入） |
| モデル選択後にチャット送信が正常に動作する                | TC-I-2確認                  | （記入） |

### Step 2: セキュリティ観点レビュー

- Renderer層でNode.js APIを直接使用していないことを確認する
- InlineModelSelectorからのモデル選択がIPC経由の正規フローで処理されることを確認する
- P31（合成Hook無限ループ）・P48（useShallow未適用）のリスクがないことを確認する

```bash
grep -n "window\.\|require(\|process\." \
  apps/desktop/src/renderer/views/ChatView/index.tsx
```

### Step 3: 型安全観点レビュー

- `any`型・`@ts-ignore`・`as`キャストが増加していないことを確認する
- InlineModelSelectorのProps型がPhase 2設計書と一致していることを確認する

```bash
grep -n "any\|@ts-ignore\|as " \
  apps/desktop/src/renderer/views/ChatView/index.tsx
```

### Step 4: 状態管理観点レビュー

- `isStreaming`状態の取得が個別セレクタ経由であることを確認する（P31対策）
- InlineModelSelectorのdisabledプロップへの連動が正しく機能することを確認する

### Step 5: 判定

| 判定     | 条件                                 | 対応                                     |
| -------- | ------------------------------------ | ---------------------------------------- |
| PASS     | AC-2全項目を満たし、重大な問題なし   | Phase 11へ進む                           |
| MINOR    | 機能影響なしの軽微な指摘がある       | 指摘を未タスク仕様書に変換後、Phase 11へ |
| MAJOR    | 設計の根幹に関わる問題がある         | 影響範囲に応じてPhase 1-5へ戻る          |
| CRITICAL | 要件・セキュリティの重大な問題がある | Phase 1へ戻り要件再確認                  |

**MINOR指摘は「機能影響なし」であっても全件を未タスク仕様書に変換すること（省略不可）。**

### Step 6: レビュー結果の記録

判定結果と根拠を以下の形式で記録する。

**レビュー判定（実行時に記入）:**

| 観点         | 判定         | 指摘内容     |
| ------------ | ------------ | ------------ |
| AC-2受入基準 | （記入）     | （記入）     |
| セキュリティ | （記入）     | （記入）     |
| 型安全       | （記入）     | （記入）     |
| 状態管理     | （記入）     | （記入）     |
| **総合判定** | **（記入）** | **（記入）** |

## 統合テスト連携

最終レビューでは、Phase 9の品質検証結果（Lint, TypeCheck, テスト8件, 広域テスト）がすべてPASSであることを前提に、AC-2受入基準の充足を検証する。MINOR指摘は全件を未タスク仕様書に変換する（省略不可）。

## 成果物

| 成果物                                    | パス                               | 説明                     |
| ----------------------------------------- | ---------------------------------- | ------------------------ |
| レビュー結果（本ファイルへ追記）          | 本ファイル                         | 各観点の判定と根拠       |
| MINOR指摘の未タスク仕様書（該当する場合） | docs/30-workflows/unassigned-task/ | MINOR指摘ごとに1ファイル |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION --phase 10
```

## 完了条件

- [ ] AC-2の全項目が検証されている
- [ ] セキュリティ観点（IPC経由・Node.js API非使用）が確認されている
- [ ] 型安全観点（any/ts-ignore/asキャストの非増加）が確認されている
- [ ] 状態管理観点（P31対策の個別セレクタ）が確認されている
- [ ] 総合判定がPASSまたはMINORである
- [ ] MINOR指摘がある場合は全件を未タスク仕様書に変換している（省略不可）

## 次のPhase

[Phase 11: 手動テスト](./phase-11-manual-test.md)

---

_MAJOR・CRITICAL判定の場合は上位Phaseへ戻ること。戻り先と理由をこのファイルに記録してから戻ること。_
