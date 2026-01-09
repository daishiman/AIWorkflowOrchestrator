# index.html→structure.md 逆同期機能 - タスク指示書

## メタ情報

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | task-feat-slide-reverse-sync-001                            |
| タスク名     | index.html→structure.md 逆同期機能                          |
| 分類         | 要件                                                        |
| 対象機能     | スライド依存関係管理システム（slide-dependency-management） |
| 優先度       | 高                                                          |
| 見積もり規模 | 中規模                                                      |
| ステータス   | 未実施                                                      |
| 発見元       | Phase 12 - 仕様レビュー                                     |
| 発見日       | 2026-01-09                                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

slide-dependency-management機能は、`structure.md`（設計図）と`index.html`（実際のスライド）の双方向同期を目的として設計された。しかし、現在の実装では**片方向同期（structure.md → index.html）のみ**が実装されており、逆方向の同期（index.html → structure.md）が欠落している。

現在の`file-watcher.ts`は`structure.md`のみを監視しており、`index.html`の変更は検知されない。

```typescript
// file-watcher.ts:85-86（現状）
const structurePath = `${projectPath}/structure.md`;
watcher = chokidar.watch(structurePath, { ... });
```

### 1.2 問題点・課題

1. **監視対象の不足**: `index.html`の変更が検知されない
2. **逆変換ロジックの欠落**: HTMLの変更を構造に反映するロジックが存在しない
3. **Claude Code統合の未実装**: `structure.md`と`index.html`は1:1対応ではないため、AIによる意味解析が必要

**重要**: `structure.md`は高レベルの構造記述、`index.html`は実際のHTML実装であり、**完全なイコールの内容ではない**。そのため、HTMLの差分を検出して構造に反映するには、Claude Code（Agent SDK）による意味的な解析が不可欠。

### 1.3 放置した場合の影響

1. **設計と実装の乖離**: ユーザーが`index.html`を直接編集した場合、`structure.md`が古い状態のまま残る
2. **ワークフローの破綻**: 双方向同期が機能の前提であるため、片方向のみでは設計意図を満たさない
3. **ユーザー体験の低下**: HTMLを編集しても設計図が更新されず、チーム内での情報共有に支障をきたす

---

## 2. 何を達成するか（What）

### 2.1 目的

`index.html`の変更を検知し、Claude Code（Agent SDK）を使用して変更内容を解析し、`structure.md`に適切に反映する逆同期機能を実装する。

### 2.2 最終ゴール

1. `index.html`の変更が自動検知される
2. Claude Codeが変更前後のHTMLを比較し、意味的な差分を抽出する
3. 抽出された差分が`structure.md`に適切に反映される
4. 無限ループ防止機構（changeContextMap）が逆方向にも正しく動作する

### 2.3 スコープ

#### 含むもの

- `file-watcher.ts`の拡張（index.html監視の追加）
- `modifier`スキルの実装（Claude Code経由でHTML→Structure変換）
- 無限ループ防止機構の双方向対応
- 逆同期のUIフィードバック（SyncStatusIndicator）
- 統合テストの追加

#### 含まないもの

- `structure.md`→`index.html`の順方向同期（既存実装で対応）
- スライドプレビュー機能
- 複数ファイルの同時監視（1プロジェクト=1structure.md+1index.html）
- 新しいスキルフェーズの追加（既存の`modifier`フェーズを使用）

### 2.4 成果物

| 成果物                | 説明                                        |
| --------------------- | ------------------------------------------- |
| file-watcher.ts更新   | index.html監視の追加                        |
| skill-executor.ts更新 | modifierスキルの実行ロジック                |
| sync-manager.ts更新   | 逆方向同期のトリガー処理                    |
| modifier-skill実装    | Claude CodeでHTML→Structureを変換するスキル |
| 単体テスト            | 各モジュールのテスト                        |
| 統合テスト            | 双方向同期の統合テスト                      |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Claude Agent SDK（`@anthropic-ai/agent-sdk`または同等）がインストールされていること
- task-imp-slide-agent-sdk-integration-001（Agent SDK統合基盤）が完了していること
- 現在のslide-dependency-management実装を理解していること

### 3.2 依存タスク

| タスクID                                 | 名称          | 状態   |
| ---------------------------------------- | ------------- | ------ |
| task-imp-slide-agent-sdk-integration-001 | Agent SDK統合 | 未実施 |

### 3.3 必要な知識・スキル

- Electron Main/Renderer プロセス分離
- chokidar ファイル監視
- Claude Agent SDK API
- HTML構造解析
- Diff/Patch アルゴリズムの概念

### 3.4 推奨アプローチ

```
[index.html変更検知]
       ↓
[変更前後のHTML取得]
       ↓
[Claude Code (modifier skill) 呼び出し]
       ↓
[HTMLの意味的差分を解析]
       ↓
[structure.mdへの反映内容を決定]
       ↓
[structure.md更新]
       ↓
[changeContextMapにマーク（無限ループ防止）]
```

---

## 4. 実行手順

### Phase構成

本タスクは標準的なタスクフロー（13 Phase）に従い実行する。

### Phase 1: 要件定義

#### 使用スキル

| スキル名                    | パス                                                  | 選定理由                                |
| --------------------------- | ----------------------------------------------------- | --------------------------------------- |
| acceptance-criteria-writing | `.claude/skills/acceptance-criteria-writing/SKILL.md` | Given-When-Then形式で受け入れ基準を定義 |

#### 目的

逆同期機能の詳細要件を定義し、受け入れ基準を明確化する。

#### 成果物

- requirements-definition.md
- acceptance-criteria.md

#### 完了条件

- [ ] 逆同期の機能要件が定義されている
- [ ] Claude Codeの利用方法が明確化されている
- [ ] 受け入れ基準がGiven-When-Then形式で記述されている

### Phase 2: 設計

#### 使用スキル

| スキル名            | パス                                          | 選定理由                      |
| ------------------- | --------------------------------------------- | ----------------------------- |
| domain-modeling     | `.claude/skills/domain-modeling/SKILL.md`     | 逆同期のドメインモデル設計    |
| api-client-patterns | `.claude/skills/api-client-patterns/SKILL.md` | Agent SDK呼び出しパターン設計 |

#### 目的

逆同期機能のアーキテクチャを設計し、Claude CodeとのAPI連携パターンを定義する。

#### 成果物

- architecture-design.md
- api-specification.md（Agent SDK呼び出し仕様）

#### 完了条件

- [ ] file-watcher.tsの拡張設計が完了
- [ ] modifierスキルのインターフェースが定義
- [ ] Agent SDK呼び出しフローが設計されている

### Phase 5: 実装

#### 使用スキル

| スキル名                   | パス                                                 | 選定理由                      |
| -------------------------- | ---------------------------------------------------- | ----------------------------- |
| agent-lifecycle-management | `.claude/skills/agent-lifecycle-management/SKILL.md` | Agent SDKのライフサイクル管理 |
| multi-agent-systems        | `.claude/skills/multi-agent-systems/SKILL.md`        | modifier skill設計            |

#### 目的

逆同期機能を実装する。

#### 成果物

- file-watcher.ts（拡張版）
- skill-executor.ts（modifier対応）
- sync-manager.ts（双方向対応）

#### 完了条件

- [ ] index.html監視が実装されている
- [ ] Claude Codeによる差分解析が動作する
- [ ] structure.mdへの反映が正しく行われる
- [ ] 無限ループ防止が双方向で機能する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] index.htmlの変更を検知できる
- [ ] 変更検知後、Claude Code（modifier skill）が呼び出される
- [ ] Claude Codeが変更前後のHTML差分を意味的に解析できる
- [ ] 解析結果がstructure.mdに正しく反映される
- [ ] 無限ループ（index.html→structure.md→index.html...）が防止される
- [ ] キャンセル機能が動作する

### 品質要件

- [ ] TypeScriptの型エラーが0件
- [ ] ESLintエラーが0件
- [ ] 単体テストカバレッジ80%以上
- [ ] 統合テストが通過する

### ドキュメント要件

- [ ] 実装ガイドが更新されている
- [ ] APIドキュメントが作成されている

---

## 6. 検証方法

### テストケース

| #   | シナリオ                             | 期待結果                                     |
| --- | ------------------------------------ | -------------------------------------------- |
| 1   | index.htmlにスライドを追加           | structure.mdに新しいスライド項目が追加される |
| 2   | index.htmlのスライド内容を変更       | structure.mdの該当箇所が更新される           |
| 3   | index.htmlからスライドを削除         | structure.mdから該当項目が削除される         |
| 4   | structure.mdとindex.htmlを同時に編集 | 競合が適切に処理される                       |
| 5   | 変更中にキャンセル                   | 処理が中断され、ファイルが破損しない         |

### 検証手順

1. Electronアプリを起動
2. スライドプロジェクトを開く
3. index.htmlを外部エディタで編集
4. 保存後、structure.mdが自動更新されることを確認
5. SyncStatusIndicatorが正しく更新されることを確認

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                      |
| -------------------------- | ------ | -------- | ----------------------------------------- |
| Claude Codeの解析精度不足  | 高     | 中       | プロンプトのチューニング、サンプルの蓄積  |
| 無限ループの発生           | 高     | 低       | changeContextMapのTTL調整、テストでの検証 |
| 大きな差分での処理時間増大 | 中     | 中       | チャンク分割、進捗表示の実装              |
| 競合状態（同時編集）       | 中     | 低       | ロック機構の検討、警告表示                |

---

## 8. 参照情報

### 関連ドキュメント

- 現在の実装: `apps/desktop/src/main/slide/`
- 型定義: `packages/shared/src/slide/types.ts`
- 実装ガイド: `docs/30-workflows/slide-dependency-management/outputs/phase-12/implementation-guide.md`

### 参考資料

- Claude Agent SDK ドキュメント
- chokidar ドキュメント: https://github.com/paulmillr/chokidar

---

## 9. 備考

### 発見経緯

Phase 12のレビューにおいて、現在の実装が`structure.md`→`index.html`の片方向同期のみであることが判明。ユーザーから「index.htmlが変更された場合、Claude Codeで差分を解析してstructure.mdに反映する必要がある」との指摘を受け、本未タスクを作成。

### 補足事項

- `structure.md`と`index.html`は完全な1:1対応ではないため、単純な文字列置換ではなく、Claude Codeによる**意味的な解析**が必要
- `modifier`スキルフェーズは既に型定義に存在するため、新しいフェーズの追加は不要
- Agent SDK統合タスク（task-imp-slide-agent-sdk-integration-001）との連携が必要
