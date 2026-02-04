# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 12                          |
| 機能名 | TASK-FIX-1-1-TYPE-ALIGNMENT |
| 作成日 | 2026-02-04                  |

## 目的

実装した型統合をドキュメントに反映し、未完了タスクを検出・記録する。

## 参照資料

| 資料名               | パス                                                                              | 説明                     |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------ |
| Phase 11手動テスト   | `outputs/phase-11/manual-test-result.md`                                          | Phase 11成果物           |
| spec-update-workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`    | 仕様更新ワークフロー詳細 |
| phase-11-12-guide    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`       | Phase 11/12ガイダンス    |
| interfaces-agent-sdk | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル型定義仕様         |

## 実行タスク

### Task 1: 実装ガイド作成【必須・2パート構成】

> **重要**: テンプレートは `assets/implementation-guide-template.md` を参照

#### Part 1: 概念的説明（中学生レベル）【必須要件】

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**日常の例え話の例**:

> スキルの型定義は「契約書」のようなものです。
>
> たとえば、宅配便を送るとき、「送り主」「届け先」「中身」を決まったフォーマットで書きますよね。
> これと同じで、スキルがメッセージを送るときも「誰が」「何を」「いつ」送ったかを決まった形式で書く必要があります。
>
> 今回の修正は、2種類あった「契約書のフォーマット」を1種類に統一したということです。
> これにより、「どのフォーマットを使えばいいの？」という混乱がなくなりました。

#### Part 2: 技術的詳細【必須要件】

- インターフェース/型定義（TypeScript）を含める
- APIシグネチャと使用例を記載
- エラーハンドリングとエッジケースを説明
- 設定可能なパラメータと定数を一覧化

**統合後の型定義**:

| 型名                     | 定義内容                                                            | 用途                     |
| ------------------------ | ------------------------------------------------------------------- | ------------------------ |
| `SkillStreamMessageType` | `"assistant" \| "tool_use" \| "tool_result" \| "status" \| "error"` | メッセージ種別           |
| `SkillStreamMessage`     | Discriminated Union（type別content型）                              | ストリーミングメッセージ |
| `SkillExecutionRequest`  | `skillName`, `prompt`, `workingDirectory`                           | 実行リクエスト           |
| `ExecutionState`         | `"idle" \| "running" \| "completed" \| "error"`                     | 実行状態                 |

**使用例**:

```typescript
import { SkillStreamMessage } from "@repo/shared";

function handleMessage(message: SkillStreamMessage) {
  switch (message.type) {
    case "assistant":
      // TypeScriptが自動的にcontent.textを認識
      console.log(message.content.text);
      break;
    case "tool_use":
      // content.toolNameが使用可能
      console.log(message.content.toolName);
      break;
  }
}
```

### Task 2: システムドキュメント更新【必須・6サブステップ + 条件付きStep 2】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を必ず参照

#### Step 1-A: タスク完了記録【必須・全タスク】

**チェックリスト**:

- [ ] `interfaces-agent-sdk-skill.md` に「完了タスク」セクション追加
  - テスト結果サマリー表（機能/エラーハンドリング/アクセシビリティ/統合テスト）
  - 成果物テーブル（テスト結果レポート/実装ガイド等）
- [ ] 「関連ドキュメント」セクションに実装ガイドリンク追加
- [ ] 「変更履歴」にバージョン番号を追記
- [ ] **aiworkflow-requirements/LOGS.md** にタスク完了エントリ追加
- [ ] **task-specification-creator/LOGS.md** にタスク完了記録追加

**LOGS.md更新形式（2ファイル両方必須）**:

```markdown
## 2026-02-04: スキル型定義の統一（TASK-FIX-1-1-TYPE-ALIGNMENT）

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | TASK-FIX-1-1-TYPE-ALIGNMENT                      |
| 操作         | update-spec                                      |
| 対象ファイル | interfaces-agent-sdk-skill.md                    |
| 結果         | success                                          |
| 備考         | SkillStreamMessage型統合、skill-execution.ts削除 |
```

#### Step 1-B: 実装状況テーブル更新【実装完了時は必須】

- [ ] `interfaces-agent-sdk-skill.md` の実装状況テーブルを確認
- [ ] 該当項目が「未実装」の場合、「完了」に変更
- [ ] ⚠️ これは「システム仕様更新」ではなく必須アクション

#### Step 1-C: 関連タスクテーブル更新【該当する場合は必須】

**確認手順**:

```bash
# タスクIDで関連仕様書を検索
grep -rn "TASK-FIX-1-1" .claude/skills/aiworkflow-requirements/references/
```

- [ ] 検索結果の仕様書内「関連タスク」「未タスク候補」テーブルを確認
- [ ] 該当タスクのステータスを「完了」に更新

#### Step 1-D: topic-map.md再生成【新規セクション追加時は必須】

```bash
# topic-map.md再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されている

#### Step 1-E: 未タスク指示書作成・登録【1件以上検出時は必須】

- [ ] 未タスク候補が1件以上の場合、`docs/30-workflows/unassigned-task/` に指示書を作成・配置
- [ ] `task-workflow.md` の残課題（未タスク）テーブルに新規未タスクを登録
- [ ] 関連仕様書（`interfaces-agent-sdk-skill.md`等）の残課題テーブルに新規未タスクを登録
- [ ] ⚠️ 検出レポート作成だけでなく、指示書作成+テーブル登録まで完了すること

**本タスクの判断**: 型統合タスクであり、未タスク検出は0件の可能性が高い → **Task 4の検出結果に応じて対応**

#### Step 1-F: DevOps関連ファイル更新【CI/CD最適化タスクの場合は必須】

- [ ] `deployment-gha.md` にCI/CD変更内容を記載（該当する場合）
- [ ] `technology-devops.md` にパターン・完了タスクを追加（該当する場合）
- [ ] `quality-requirements.md` に品質関連設定を追加（該当する場合）

**本タスクの判断**: CI/CD関連タスクではない → **該当なし**

#### Step 2: システム仕様更新【条件付き】

**更新判断基準**:

| 更新必要                      | 更新不要                   |
| ----------------------------- | -------------------------- |
| 新規インターフェース/型の追加 | 内部実装の詳細変更のみ     |
| 既存インターフェースの変更    | リファクタリング（IF不変） |
| 新規定数/設定値の追加         | バグ修正（仕様変更なし）   |

**本タスクの判断**: 既存型の統合であり、新規インターフェース追加なし → **更新不要**

- [ ] `documentation-changelog.md` に「Step 2: 更新不要（既存型の統合のため、インターフェース変更なし）」と記録

### Task 3: ドキュメント更新履歴【必須】

```bash
# 更新履歴生成（スクリプトがない場合は手動作成）
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/skill-import-agent-system/TASK-FIX-1-1-TYPE-ALIGNMENT
```

**documentation-changelog.mdに含める内容**:

| Step     | 結果                                                     |
| -------- | -------------------------------------------------------- |
| Step 1-A | ✅ interfaces-agent-sdk-skill.md完了タスク追加           |
| Step 1-B | ✅ 該当なし（実装状況テーブルなし）                      |
| Step 1-C | ✅/該当なし（Grep検索結果による）                        |
| Step 1-D | ✅ topic-map.md再生成完了                                |
| Step 1-E | ✅/該当なし（未タスク検出結果による）                    |
| Step 1-F | 該当なし（CI/CD最適化タスクではない）                    |
| Step 2   | 更新不要（既存型の統合のため、インターフェース変更なし） |

### Task 4: 未タスク検出【必須・0件でも出力必須】

| #   | ソース                 | 確認項目                           |
| --- | ---------------------- | ---------------------------------- |
| 1   | 元タスク仕様書         | 「スコープ外」として明示された項目 |
| 2   | Phase 3レビュー結果    | MINOR判定の指摘事項                |
| 3   | Phase 10レビュー結果   | MINOR判定の指摘事項                |
| 4   | Phase 11手動テスト結果 | スコープ外の発見事項・改善提案     |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント        |

```bash
# 未タスク検出
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan packages/shared/src/types \
  --output .tmp/unassigned-candidates.json
```

**0件の場合の出力形式**:

```markdown
## 検出結果サマリー

| ソース         | 検出数  |
| -------------- | ------- |
| テスト結果     | 0件     |
| 発見課題       | 0件     |
| コードコメント | 0件     |
| **合計**       | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

## アーキテクチャ層別ドキュメント

| 層      | ドキュメント内容             | 更新対象仕様書                  |
| ------- | ---------------------------- | ------------------------------- |
| Shared  | 型定義の統合方針、使用ガイド | `interfaces-agent-sdk-skill.md` |
| IPC通信 | チャンネル型定義の一貫性     | `api-ipc-agent.md`              |
| Store   | SkillSliceでの型使用         | `arch-state-management.md`      |

## 成果物

| 成果物               | パス                                            | 必須 | 説明                       |
| -------------------- | ----------------------------------------------- | ---- | -------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント  |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴（全Step結果含む） |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）   |
| 未タスク指示書       | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成             |

## 完了条件

### Task 1完了条件

- [ ] 実装ガイド（Part 1: **中学生レベル概念説明**・日常の例え話含む）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている

### Task 2完了条件（Step別）

- [ ] **【Step 1-A】** システム仕様書に「完了タスク」セクションを追加した
- [ ] **【Step 1-A】** 関連ドキュメントセクションに実装ガイドリンクを追加した
- [ ] **【Step 1-A】** 変更履歴セクションにバージョンを追記した
- [ ] **【Step 1-A】** **aiworkflow-requirements/LOGS.md** にエントリ追加
- [ ] **【Step 1-A】** **task-specification-creator/LOGS.md** にエントリ追加
- [ ] **【Step 1-B】** 実装状況テーブルが更新されている（該当する場合）
- [ ] **【Step 1-C】** 関連タスクテーブルのステータスを「完了」に更新した（該当する場合）
- [ ] **【Step 1-D】** topic-map.mdが再生成されている（新規セクション追加の場合）
- [ ] **【Step 1-E】** 未タスク指示書を作成し、テーブル登録を完了した（1件以上検出の場合）
- [ ] **【Step 1-F】** DevOps関連ファイルを更新した（CI/CD最適化タスクの場合）
- [ ] **【Step 2】** システム仕様更新の要否を判断し、documentation-changelog.mdに記録した

### Task 3/4完了条件

- [ ] ドキュメント更新履歴（全Step結果含む）が出力されている
- [ ] **未タスク検出レポートが出力されている**【0件でも必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）

### Phase完了条件

- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                   |
| ------------------------------------- | ---------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動で`documentation-changelog.md`を作成（上記形式に従う） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseレビュー結果・発見課題を確認し、レポート作成  |
| `generate-index.js`                   | 手動でtopic-map.mdの行番号を更新                           |

## 次のPhase

Phase 13: PR作成
