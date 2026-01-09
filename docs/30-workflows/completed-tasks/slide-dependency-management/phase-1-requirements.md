# Phase 1: 要件定義 - スライド依存関係管理システム

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 1                                         |
| タスクID   | task-feat-slide-dependency-management-003 |
| 名称       | 要件定義                                  |
| ステータス | 未実施                                    |
| 依存Phase  | なし                                      |

---

## 目的

依存関係管理システムの詳細要件を定義し、受け入れ基準を明確化する。

---

## 使用スキル

| スキル名                               | パス                                                             | 選定理由                                                |
| -------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- |
| functional-non-functional-requirements | `.claude/skills/functional-non-functional-requirements/SKILL.md` | 機能要件・非機能要件の定義（Trigger: 要件定義）         |
| acceptance-criteria-writing            | `.claude/skills/acceptance-criteria-writing/SKILL.md`            | 受け入れ基準の作成（Trigger: 受け入れ基準）             |
| event-driven-file-watching             | `.claude/skills/event-driven-file-watching/SKILL.md`             | ファイル監視パターンの要件整理（Trigger: ファイル監視） |

**実行方法**: 各スキルのSKILL.mdを読み込み、スキルを参照して実行

---

## 統合テスト連携【必須】

### Phase 1での統合テスト連携アクション

接続要件（API/認証/データフロー）を要件に明記する。

**具体的な確認項目**:

1. **Electron IPC通信**
   - Main→Renderer間のイベント送受信インターフェース
   - ファイルウォッチャーイベントの伝播経路
   - スキル実行結果の通知フロー

2. **スキル実行連携**
   - Claude Agent SDK経由のスキル呼び出しインターフェース
   - スキル実行の進捗通知プロトコル
   - エラー時のリカバリーフロー

3. **状態同期**
   - ファイル変更検知→UI更新のデータフロー
   - 同期状態の判定ロジック
   - 複数クライアント対応（将来拡張を考慮）

---

## 実行手順

### Step 1: 機能要件・非機能要件の定義

`functional-non-functional-requirements` スキルを使用して以下を定義：

#### 機能要件（FR）

| ID    | 要件                                               | 優先度 |
| ----- | -------------------------------------------------- | ------ |
| FR-01 | structure.md変更時にindex.htmlを自動再生成する     | Must   |
| FR-02 | ファイルウォッチャーがリアルタイムで変更を検知する | Must   |
| FR-03 | hearing-facilitatorスキルを呼び出せる              | Must   |
| FR-04 | structure-designerスキルを呼び出せる               | Must   |
| FR-05 | html-generatorスキルを呼び出せる                   | Must   |
| FR-06 | slide-modifierスキルを呼び出せる                   | Must   |
| FR-07 | 依存関係の状態（同期/非同期）をUIに表示する        | Must   |
| FR-08 | 手動同期ボタンで同期を実行できる                   | Should |
| FR-09 | スキル実行の進捗をUIに表示する                     | Should |
| FR-10 | スキル実行をキャンセルできる                       | Could  |

#### 非機能要件（NFR）

| ID     | 要件                               | 指標                 |
| ------ | ---------------------------------- | -------------------- |
| NFR-01 | ファイル変更検知のレイテンシ       | 500ms以内            |
| NFR-02 | スキル実行中のUI応答性             | 操作可能な状態を維持 |
| NFR-03 | ファイルウォッチャーのリソース消費 | メモリ100MB以下      |
| NFR-04 | 無限ループ防止                     | デバウンス500ms      |
| NFR-05 | エラー発生時のリカバリー           | 自動リトライ3回まで  |

### Step 2: 受け入れ基準の作成

`acceptance-criteria-writing` スキルを使用してGiven-When-Then形式で定義：

#### AC-01: structure.md変更時の自動再生成

```gherkin
Given スライドプロジェクトが監視中の状態である
When structure.mdファイルが変更される
Then 500ms以内にhtml-generatorスキルが自動実行される
And index.htmlが最新のstructure.mdの内容で再生成される
And 同期状態が「synced」に更新される
```

#### AC-02: ファイルウォッチャーの起動

```gherkin
Given Electronアプリが起動している
When スライドプロジェクトを開く
Then ファイルウォッチャーがstructure.mdの監視を開始する
And 監視状態がUIに表示される
```

#### AC-03: スキルフェーズの呼び出し

```gherkin
Given スライドプロジェクトが開かれている
When ヒアリングボタンをクリックする
Then hearing-facilitatorスキルが実行される
And 実行中の進捗がUIに表示される
And 実行完了時に結果が通知される
```

#### AC-04: 同期状態の表示

```gherkin
Given スライドプロジェクトが監視中である
When structure.mdとindex.htmlの内容が一致しない
Then 同期状態が「out-of-sync」と表示される
And 手動同期ボタンが有効化される
```

#### AC-05: 無限ループ防止

```gherkin
Given html-generatorが実行中である
When html-generatorによってファイルが変更される
Then 変更元がスキル実行であることを識別する
And 追加のhtml-generator実行をトリガーしない
```

### Step 3: ファイル監視要件の整理

`event-driven-file-watching` スキルを使用して以下を定義：

#### 監視対象

| ファイル     | 監視イベント | トリガーアクション     |
| ------------ | ------------ | ---------------------- |
| structure.md | change       | html-generator自動実行 |
| index.html   | change       | 同期状態チェック       |

#### 監視設定

```typescript
interface WatcherConfig {
  persistent: true;
  ignoreInitial: true;
  awaitWriteFinish: {
    stabilityThreshold: 500;
    pollInterval: 100;
  };
  ignored: ["**/node_modules/**", "**/.git/**"];
}
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 使用スキルの実行（各スキルごとに1タスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## 成果物

| 成果物             | パス                                         | 説明                  | 必須 |
| ------------------ | -------------------------------------------- | --------------------- | ---- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件  | ✅   |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | GWT形式の受け入れ基準 | ✅   |
| スコープ定義       | `outputs/phase-1/scope-definition.md`        | スコープ内外の定義    | ✅   |
| スキル連携フロー図 | `outputs/phase-1/skill-flow-diagram.md`      | スキル間の連携フロー  | ✅   |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                     | 内容              |
| ---------------- | ------------------------------------------------------------------------ | ----------------- |
| Electron IPC設計 | `.claude/skills/aiworkflow-requirements/references/electron-ipc-spec.md` | IPC通信仕様       |
| Agent SDK統合    | `.claude/skills/aiworkflow-requirements/references/agent-sdk-spec.md`    | Agent SDK統合仕様 |

### 元タスク指示書

- `docs/30-workflows/unassigned-task/task-slide-dependency-management.md`

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-dependency-management --phase 1

# Phase完了・成果物登録
node .claude/skills/task-specification-creator/scripts/complete-phase.mjs \
  --workflow docs/30-workflows/slide-dependency-management --phase 1 --artifacts "requirements-definition.md,acceptance-criteria.md,scope-definition.md,skill-flow-diagram.md"
```

---

## 完了条件チェックリスト

- [ ] 4つのスキルフェーズの呼び出し仕様が定義されている
- [ ] ファイルウォッチャーの動作仕様が明確化されている
- [ ] 自動同期のトリガー条件が定義されている
- [ ] 機能要件（FR）が10件以上定義されている
- [ ] 非機能要件（NFR）が5件以上定義されている
- [ ] 受け入れ基準がGiven-When-Then形式で5件以上定義されている
- [ ] 統合テスト連携の接続要件が明記されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## スキルフィードバック記録

| スキル                                 | 結果    | 備考 |
| -------------------------------------- | ------- | ---- |
| functional-non-functional-requirements | pending | -    |
| acceptance-criteria-writing            | pending | -    |
| event-driven-file-watching             | pending | -    |

---

## 次Phase

- [Phase 2: 設計](phase-2-design.md)
