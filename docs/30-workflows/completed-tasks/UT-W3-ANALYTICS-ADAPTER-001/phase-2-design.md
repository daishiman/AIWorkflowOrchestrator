# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 2                                                            |
| タスクID   | UT-W3-ANALYTICS-ADAPTER-001                                  |
| タスク名   | trackEvent analytics adapter差し替え（本番分析基盤への接続） |
| 前提Phase  | Phase 1                                                      |
| 後続Phase  | Phase 3                                                      |
| 作成日     | 2026-04-11                                                   |
| ステータス | 未実施                                                       |

## 目的

`analyticsAdapter.ts` のインターフェース設計・sink差し替えパターン確定・オフラインキュー設計・
オプトアウト連動設計・IPCチャネル設計を行い、Phase 3レビューの入力を準備する。

## 実行タスク

### タスク0: 既存コンポーネント再利用評価

**目的**: 既存の trackEvent / preload / IPC パターンを再利用できるか確認し、追加責務を最小化する

**実行手順**:

1. `trackEvent.ts` の sink 変更だけで吸収できる範囲を確認する
2. `SkillCreateWizard.tsx` / preload API / 既存 IPC ハンドラーの再利用可否を判定する
3. 新規抽象化が必要な場合のみ追加する
4. 判定結果を `outputs/phase-2/dependency-consistency-matrix.md` に記録する

**期待される成果物**:

- `outputs/phase-2/dependency-consistency-matrix.md`

### タスク1: analyticsAdapterインターフェース設計

**目的**: `analyticsAdapter.ts`の公開インターフェースと内部構造を設計する

**実行手順**:

1. `AnalyticsAdapter`インターフェースの型定義を設計する
   - `send(eventName, payload): void` メソッド
   - `initialize(): Promise<void>` メソッド
   - `flush(): Promise<void>` メソッド（オフラインキュードレイン）
   - `isOptedOut(): boolean` メソッド
2. ファクトリ関数または初期化パターンを設計する
3. `trackEvent.ts`からの内部呼び出し方式を確定する（sink差し替えパターン）
4. テスタビリティを考慮したDI（依存性注入）設計を検討する

**期待される成果物**:

- `outputs/phase-2/architecture-design.md`

### タスク2: IPC経由analytics設計

**目的**: Electron CSP制限を回避するIPC経由analytics送信アーキテクチャを設計する

**実行手順**:

1. Renderer→Preload→IPC→Main→HTTP送信のデータフローを設計する
2. IPCチャネル名を命名規則に従い決定する（例: `analytics:send`）
3. `ALLOWED_INVOKE_CHANNELS`への追加内容を確定する（[FB-SDK-13-1]対策）
4. 公開IPCメソッド名と内部エンジン名の衝突確認・DTO変換表を作成する（[FB-SDK-13-2]対策）
5. Preload APIのエクスポート設計を行う（直接`ipcRenderer.on`禁止）

**期待される成果物**:

- `outputs/phase-2/ipc-contract-design.md`

### タスク3: オフラインキュー設計

**目的**: ネットワーク断時のイベント保持と復帰後送信の設計を行う

**実行手順**:

1. キューストレージ方式を選択する（in-memory / ElectronStore / ローカルファイル）
2. キューの上限件数（例: 500件）とTTL（例: 7日）を定義する
3. オンライン復帰検知方法を設計する（`navigator.onLine` / IPC経由）
4. キュードレイン（バッチ送信）の設計を行う
5. ステップ間のstate ownership（Renderer側 or Main側）を明確化する

**期待される成果物**:

- `outputs/phase-2/architecture-design.md`（キュー設計セクション）

### タスク4: オプトアウト連動設計

**目的**: ユーザープライバシー設定との連動方式を設計する

**実行手順**:

1. Phase 1で調査したプライバシー設定ストアのAPIを参照する
2. `analyticsAdapter.isOptedOut()`の実装方式を決定する
3. 未整備の場合のフォールバック（デフォルトno-op）を設計する
4. オプトアウト設定変更の動的反映方式を検討する

**期待される成果物**:

- `outputs/phase-2/architecture-design.md`（オプトアウト設計セクション）

### タスク5: テスト戦略設計

**目的**: TDD Red→GreenサイクルのためのテストアーキテクチャとモックPatternを設計する

**実行手順**:

1. `analyticsAdapter.test.ts`のテストカテゴリを定義する
   - 初期化成功・失敗
   - イベント送信（通常・オプトアウト）
   - オフライン時キューイング
   - オンライン復帰後ドレイン
   - フォールバック（no-op）
2. IPCハンドラーのモック方式を設計する（[Feedback VSCPKR-02]対策: `vi.stubGlobal`禁止）
3. Electron環境モックの設計（happy-dom環境での`window.api`モック方法）
4. カバレッジ目標を確定する（analyticsAdapter: 90%+、trackEvent: 100%）

**期待される成果物**:

- `outputs/phase-2/test-strategy.md`

## 参照資料

| 参照資料                              | パス                                                                                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| trackEvent現状実装                    | `apps/desktop/src/renderer/utils/trackEvent.ts`                                                                                                                                 |
| 既存IPCハンドラー例                   | `apps/desktop/src/main/ipc/`                                                                                                                                                    |
| Preload API定義                       | `apps/desktop/src/preload/`                                                                                                                                                     |
| IPC設計ガイド                         | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator.md` / `.claude/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator-part2.md` |
| FB-SDK-07-1: 既存コンポーネント再利用 | `.claude/skills/task-specification-creator/SKILL.md`                                                                                                                            |
| FB-SDK-13-1/2: IPC surface設計        | `.claude/skills/task-specification-creator/SKILL.md`                                                                                                                            |
| パターン: parallel IPC                | `.claude/skills/task-specification-creator/references/patterns-parallel-ipc.md`                                                                                                 |

## 設計制約

| 制約                              | 理由                                                      |
| --------------------------------- | --------------------------------------------------------- |
| Renderer→Main IPC経由必須         | CSP制限回避（Mainプロセスはブラウザ制限外）               |
| `ipcRenderer.on`直接使用禁止      | Preload API経由必須（[FB-SDK-07-2]）                      |
| `vi.stubGlobal("window")`使用禁止 | React内部`instanceof`判定破壊回避（[Feedback VSCPKR-02]） |
| `trackEvent`公開APIシグネチャ不変 | SkillCreateWizard.tsx計装ポイントへの影響ゼロ化           |

## IPC設計前提

```
Renderer Layer:
  trackEvent.ts → analyticsAdapter.ts → window.api.analytics.send()
                                         ↓（Preload経由）
Preload Layer:
  contextBridge.exposeInMainWorld("api", { analytics: { send: safeInvoke("analytics:send") }})
                                         ↓
Main Layer:
  ipcMain.handle("analytics:send", analyticsHandler)
                                         ↓
  HTTP送信 → analytics provider
```

## ステップ間state ownership

| state              | Owner    | 理由                                 |
| ------------------ | -------- | ------------------------------------ |
| イベントキュー     | Main     | 永続化・HTTP送信の責務はMainに集約   |
| オプトアウト設定   | Main     | 設定ストアはMainが管理               |
| オンライン状態     | Renderer | `navigator.onLine`はRenderer側で検知 |
| provider初期化状態 | Main     | SDK初期化はMainで実施                |

## 成果物

| 成果物             | パス                                               | 内容                          |
| ------------------ | -------------------------------------------------- | ----------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`           | 全体設計・IPC設計・キュー設計 |
| IPC契約設計        | `outputs/phase-2/ipc-contract-design.md`           | チャネル名・DTO定義           |
| テスト戦略         | `outputs/phase-2/test-strategy.md`                 | テストカテゴリ・モック設計    |
| 依存整合マトリクス | `outputs/phase-2/dependency-consistency-matrix.md` | 依存関係・責務境界            |

## 完了条件

- [ ] `AnalyticsAdapter`インターフェース設計完了
- [ ] 既存コンポーネント再利用評価完了
- [ ] IPCチャネル名・DTO型定義確定
- [ ] `ALLOWED_INVOKE_CHANNELS`追加内容確定
- [ ] オフラインキュー設計（上限件数・TTL・ストレージ方式）確定
- [ ] オプトアウト連動設計確定
- [ ] テスト戦略（カテゴリ・モック方式）確定
- [ ] state ownershipテーブル作成
- [ ] `dependency-consistency-matrix.md` 作成完了
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次のPhase

Phase 3: 設計レビューゲート
