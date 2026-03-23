# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 3                                  |
| 機能名 | terminal-handoff-adapter-placement |
| 作成日 | 2026-03-22                         |

## 目的

Phase 1-2 の要件定義・設計の妥当性を検証し、Phase 4 以降の実装着手可否を判定する。

## 実行タスク

- 要件・設計整合性検証: FR/NFR と設計の対応確認
- アーキテクチャ検証: 配置先・依存方向・import サイクルの妥当性
- セキュリティ検証: サニタイズ設計の網羅性
- P44/P64 準拠チェック: 型定義の一意性と IPC インターフェース整合

## 参照資料

| 資料名           | パス                      | 説明               |
| ---------------- | ------------------------- | ------------------ |
| Phase 1 要件定義 | `phase-1-requirements.md` | FR/NFR/AC 定義     |
| Phase 2 設計     | `phase-2-design.md`       | アーキテクチャ設計 |

## 実行手順

### 1. 要件・設計対応マトリクス

| 要件ID | 要件概要                                   | 設計カバー                        | 検証結果    |
| ------ | ------------------------------------------ | --------------------------------- | ----------- |
| FR-01  | adapter 関数を単一箇所に配置               | Section 2                         | PASS        |
| FR-02  | SendWithContextRequest → HandoffGuidance   | Section 3.2 ChatEditHandoffSource | PASS        |
| FR-03  | AgentHandoffBuildRequest → HandoffGuidance | Section 3.2 AgentHandoffSource    | PASS        |
| FR-04  | SkillHandoffBuildRequest → HandoffGuidance | Section 3.2 SkillHandoffSource    | PASS        |
| FR-05  | TerminalHandoffBundle → HandoffGuidance    | Section 3.2 BundleHandoffSource   | PASS        |
| FR-06  | HandoffBlock.tsx 型統一                    | Section 4.3                       | PASS        |
| FR-07  | Skill Docs スタブ定義                      | 未設計（推奨要件）                | N/A（推奨） |
| NFR-01 | import サイクルなし                        | Section 1 選定理由 4              | PASS        |
| NFR-02 | 既存テスト非破壊                           | Section 4.1 段階的移行            | PASS        |
| NFR-03 | カバレッジ 90%+                            | Phase 4 で検証                    | DEFERRED    |
| NFR-04 | 機密情報除外                               | Section 5                         | PASS        |
| NFR-05 | 既存パターン一貫性                         | Section 1-2                       | PASS        |

### 2. アーキテクチャレビュー

#### 2.1 配置先の妥当性

| チェック項目                                     | 結果 | 備考                                         |
| ------------------------------------------------ | ---- | -------------------------------------------- |
| `adapters/handoff/` は Main Process 層に属するか | PASS | `apps/desktop/src/main/adapters/` 配下       |
| 既存 `adapters/llm/` と同レベルの構造か          | PASS | 同一親ディレクトリ                           |
| `packages/shared` への逆依存がないか             | PASS | `shared` → `adapters` の import は発生しない |
| Renderer → Main の直接 import がないか           | PASS | Renderer は IPC 経由でのみアクセス           |

#### 2.2 Discriminated Union 設計の妥当性

| チェック項目                                  | 結果 | 備考                            |
| --------------------------------------------- | ---- | ------------------------------- |
| `kind` プロパティで exhaustive check が可能か | PASS | `switch` + `never` で網羅性保証 |
| 各 source 型が必要十分なフィールドを持つか    | PASS | 既存 Builder の入力と一致       |
| 将来の Consumer 追加が容易か                  | PASS | union に型を追加するだけ        |

#### 2.3 P64 対策: 同名インターフェースの多重定義チェック

| チェック項目                                                 | 結果   | 備考                                             |
| ------------------------------------------------------------ | ------ | ------------------------------------------------ |
| `HandoffGuidance` が `packages/shared` の 1 箇所のみに定義   | 要修正 | `HandoffBlock.tsx` にローカル定義が残存（FR-06） |
| `HandoffSource` が `adapters/handoff/types.ts` の 1 箇所のみ | PASS   | 新規定義のため重複なし                           |

### 3. セキュリティレビュー

| チェック項目                                       | 結果 | 備考                             |
| -------------------------------------------------- | ---- | -------------------------------- |
| shell injection 対策（4 種類のエスケープ）が設計済 | PASS | Section 5.1                      |
| API キー・トークンの非含有が設計済                 | PASS | Section 5.2                      |
| PII 除外方針が明示されている                       | PASS | contextSummary に PII を含めない |

### 4. P44/P45 準拠チェック（IPC インターフェース）

| チェック項目                                | 結果 | 備考                             |
| ------------------------------------------- | ---- | -------------------------------- |
| adapter 出力型と IPC ハンドラの引数型が一致 | PASS | `HandoffGuidance` をそのまま転送 |
| 引数名のセマンティクスが実際の値と一致      | PASS | 新規設計のため命名ドリフトなし   |

### 5. レビュー指摘事項

#### MINOR 指摘

| ID   | 指摘内容                                                                                       | 対応方針                                                                       |
| ---- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| MN-1 | FR-07（Skill Docs Consumer スタブ）が設計に含まれていない                                      | 推奨要件のため Phase 5 で TODO コメントとして追加                              |
| MN-2 | `ChatEditHandoffSource` が `SendWithContextRequest` を丸ごと含むが、必要フィールドの明示がない | Phase 5 で必要フィールドのみ抽出する設計に修正可能（現設計でも動作に問題なし） |

### 6. 判定

| 項目       | 判定                               |
| ---------- | ---------------------------------- |
| 総合判定   | **PASS**                           |
| MINOR 指摘 | 2 件（MN-1, MN-2）→ Phase 5 で対応 |
| MAJOR 指摘 | なし                               |
| 判断       | **Phase 4 に進行可**               |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                                 | 仕様参照先                                          |
| -------------- | ---------------------------------------- | --------------------------------------------------- |
| アーキテクチャ | adapter 配置先・依存方向の妥当性レビュー | `aiworkflow-requirements: architecture-overview.md` |
| セキュリティ   | サニタイズ設計の網羅性レビュー           | `aiworkflow-requirements: security-electron-ipc.md` |
| DIP            | adapter が具象クラスではなく型に依存     | `aiworkflow-requirements: architecture-overview.md` |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                         | 仕様参照先                                                                               |
| -------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| バックエンド（Main） | adapter の配置は Main Process 層 | `aiworkflow-requirements: architecture-overview.md`                                      |
| IPC 通信             | HandoffGuidance の IPC 転送整合  | `aiworkflow-requirements: interfaces-agent-sdk-skill-reference-share-debug-analytics.md` |

## 統合テスト連携（Phase 3）

- 設計レビュー段階のため統合テストの実行はなし
- Phase 4 でテスト設計に統合テストシナリオを含める

## 成果物

| 成果物           | パス                                      | 説明           |
| ---------------- | ----------------------------------------- | -------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 本ドキュメント |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 要件・設計対応マトリクスの検証
3. アーキテクチャレビューの実施
4. セキュリティレビューの実施
5. P44/P45 準拠チェックの実施
6. レビュー指摘事項の記録・判定
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/terminal-handoff-adapter-placement --phase 3
```

## 完了条件

- [ ] 要件・設計対応マトリクスの全項目を検証済み
- [ ] アーキテクチャレビュー（配置先・Discriminated Union・P64）が完了
- [ ] セキュリティレビューが完了
- [ ] P44/P45 準拠チェックが完了
- [ ] レビュー指摘事項が記録されている（MINOR 2 件）
- [ ] 総合判定が記録されている（PASS）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 4: テスト作成（TDD: Red）
