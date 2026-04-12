# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 1                                                            |
| タスクID   | UT-W3-ANALYTICS-ADAPTER-001                                  |
| タスク名   | trackEvent analytics adapter差し替え（本番分析基盤への接続） |
| 前提Phase  | -（W3-seq-04完了済み）                                       |
| 後続Phase  | Phase 2                                                      |
| 作成日     | 2026-04-11                                                   |
| ステータス | 未実施                                                       |

## 目的

CSP設定調査・analytics provider選定・オフラインキュー要件確認・プライバシー設定API調査を実施し、
AC-1〜AC-9を確定する。trackEvent.ts現状スタブと将来差し替えイメージを把握する。

## 背景

W3-seq-04（usage tracking）で実装した `trackEvent` は renderer-local の no-op / `console.info` スタブである。
本番環境では一切データが収集されておらず、ウィザード改善の効果測定ができない。

`trackEvent.ts` の L44 付近に以下のTODOコメントが存在する：

```typescript
// 将来: execution-centric 基盤とは独立した sink に差し替える
```

W3-seq-04 実装ガイドには「差し替え時は `trackEvent.ts` の実装のみ変更すればよく、呼び出し側の変更は不要」と明記されており、本タスクはその設計意図通りの拡張作業である。

## タスク分類

- **type**: implementation（既存スタブの本番実装への差し替え）
- **UI task**: NO（ロジック層の変更）
- **docs-only task**: NO（実装変更を伴う）
- **Phase 11 type**: NON_VISUAL（UIコンポーネント変更なし）

## P50チェック（Step 0）

実装前に以下を確認すること：

```bash
# carry-over確認
git log --oneline -5

# trackEvent現状実装確認
cat apps/desktop/src/renderer/utils/trackEvent.ts

# 計装ポイント確認
grep -n "trackEvent" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

# 既存IPC構造確認
ls apps/desktop/src/main/ipc/

# CSP設定ファイル確認
find apps/desktop/src/main -name "*.ts" | xargs grep -l "Content-Security-Policy\|webSecurity\|CSP"

# プライバシー設定ストア確認
find apps/desktop/src -name "*.ts" | xargs grep -l "optOut\|privacy\|consent"
```

## 実行タスク

### タスク1: 現状調査

**目的**: trackEvent.ts現状とCSP設定・既存IPC構造を把握する

**実行手順**:

1. P50で取得した `git log --oneline -5` の結果を棚卸しし、既存コードの命名規則（camelCase / kebab-case / PascalCase）を確認する
2. `apps/desktop/src/renderer/utils/trackEvent.ts` を読み込み、現状実装とTODOコメントを確認する
3. `SkillCreateWizard.tsx` の計装ポイント（5箇所）を確認する
4. Electron CSP設定ファイルを特定し、外部URL通信の許可状況を確認する
5. `apps/desktop/src/main/ipc/` 配下の既存IPCハンドラーパターンを確認する
6. プライバシー設定ストアの有無・APIを調査する

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`（現状調査結果含む）

### タスク2: analytics provider選定基準確定

**目的**: 技術的制約を考慮したprovider選定基準を定める

**実行手順**:

1. 各provider（Amplitude/Mixpanel/PostHog/IPC経由カスタム）の特徴を比較する
2. Electron Renderer環境でのCSP制限リスクを評価する
3. IPC経由アプローチの優位性を評価する（MainプロセスはCSP制限なし）
4. プロジェクトの外部依存ポリシーを確認する
5. 選定基準を文書化する

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`（provider比較含む）

### タスク3: 受入条件確定

**目的**: AC-1〜AC-9を具体的な検証方法と共に確定する

**実行手順**:

1. AC-1〜AC-9の各条件を検証可能な形式で記述する
2. 各ACに対して具体的な検証コマンドを定義する
3. スコープ（含む/含まない）を明確化する
4. 非機能要件（パフォーマンス・セキュリティ）を定義する

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

### タスク4: IPC設計前提整理

**目的**: IPC経由アプローチを前提とした設計前提条件を確定する

**実行手順**:

1. 既存IPCチャネル命名規則（`safeInvoke`/`safeOn`パターン）を確認する
2. Preload API経由の必須要件を記録する（直接`ipcRenderer.on`は禁止パターン）
3. analytics送信用IPCチャネル名の候補を検討する
4. `ALLOWED_INVOKE_CHANNELS`への追記が必要であることを記録する（[Feedback SC-13-1]参照）

**期待される成果物**:

- `outputs/phase-1/requirements-definition.md`（IPC設計前提含む）

## 参照資料

| 参照資料                       | パス                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| trackEvent現状実装             | `apps/desktop/src/renderer/utils/trackEvent.ts`                                            |
| W3-seq-04実装ガイド            | `docs/30-workflows/W3-seq-04-usage-tracking/outputs/phase-12/implementation-guide.md`      |
| W3-seq-04未タスク検出レポート  | `docs/30-workflows/W3-seq-04-usage-tracking/outputs/phase-12/unassigned-task-detection.md` |
| 元のunassigned-task仕様書      | `docs/30-workflows/unassigned-task/UT-W3-ANALYTICS-ADAPTER-001.md`                         |
| Electron Main IPC              | `apps/desktop/src/main/ipc/`                                                               |
| IPC設計参照（FB-SDK-07-1,2,4） | `.claude/skills/task-specification-creator/SKILL.md`                                       |
| aiworkflow-requirements        | `.claude/skills/aiworkflow-requirements/SKILL.md`                                          |

## 受け入れ基準（Acceptance Criteria）

| ID   | 基準                                                                                             | 検証方法                                    |
| ---- | ------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| AC-1 | 本番環境（`NODE_ENV=production`）で `trackEvent` が analytics sink にイベントを送信できる        | E2E動作確認・ネットワークログ確認           |
| AC-2 | 選定した analytics provider への接続が CSP 制限に抵触しない                                      | Electron DevToolsコンソールエラーなし確認   |
| AC-3 | オフライン時にイベントがキューに保持され、オンライン復帰後に送信される                           | Network DevToolsでオフライン→オンライン確認 |
| AC-4 | ユーザーのオプトアウト設定が有効な場合、`trackEvent` がイベントを送信しない                      | オプトアウト設定後のイベント送信なし確認    |
| AC-5 | `trackEvent.ts` の公開 API シグネチャ（`trackEvent<K>(eventName, payload): void`）が変更されない | TypeScript型チェック・既存テスト回帰なし    |
| AC-6 | `SkillCreateWizard.tsx` の計装ポイントへの変更が不要（または最小）である                         | git diff確認・既存計装テスト回帰なし        |
| AC-7 | analytics adapter のユニットテストカバレッジが 90% 以上である                                    | `pnpm --filter @repo/desktop test:coverage` |
| AC-8 | `pnpm typecheck` / `pnpm lint` / `pnpm test` が全て PASS する                                    | CI相当コマンド全通過                        |
| AC-9 | analytics provider 初期化失敗時に `trackEvent` が no-op にフォールバックする                     | 初期化失敗シミュレーションテスト            |

## 機能要件

| ID    | 要件                                                                             |
| ----- | -------------------------------------------------------------------------------- |
| FR-01 | `analyticsAdapter.ts`が analytics provider との接続を抽象化する                  |
| FR-02 | `trackEvent.ts`の内部sinkが`analyticsAdapter.send()`を呼び出す                   |
| FR-03 | IPC経由アプローチ: Renderer→`analyticsAdapter`→IPC→Main→HTTP送信                 |
| FR-04 | オフライン時イベントをキューに保持し上限件数（例:500件）と TTL（例:7日）を設ける |
| FR-05 | ユーザーのオプトアウト設定APIを参照し、送信前に確認する                          |
| FR-06 | `ALLOWED_INVOKE_CHANNELS`にanalyticsチャネルを追加する                           |
| FR-07 | analytics provider初期化失敗時はno-opにフォールバックし、エラーをスローしない    |

## 非機能要件

| ID     | 要件                                                                 |
| ------ | -------------------------------------------------------------------- |
| NFR-01 | `trackEvent`の公開APIシグネチャが変更されない（後方互換性）          |
| NFR-02 | `SkillCreateWizard.tsx`の計装ポイントへの変更が最小であること        |
| NFR-03 | Electronセキュリティポリシー（CSP・webSecurity）を維持または強化する |
| NFR-04 | analytics SDKの導入は`pnpm --filter @repo/desktop add`で行う         |
| NFR-05 | オフラインキューのメモリ使用量が適切な上限内に収まること             |

## 因果ループ分析

**強化ループ（問題発生ループ）**:
stub実装のまま本番稼働 → イベントデータが収集されない → 改善の根拠がない
→ ウィザード設計が主観的判断に依存 → データ品質が向上しない

**バランスループ（修正ループ）**:
analytics adapter実装 → 本番でイベント収集 → データ分析可能
→ ウィザード改善根拠が蓄積 → ユーザー体験向上 → さらなる計装価値増大

## スコープ

### 含むもの

- analytics provider の選定
- `analyticsAdapter.ts` の新規作成
- `trackEvent.ts` の sink 差し替え
- オフライン時イベントキューイングの設計・実装
- ユーザーのプライバシー設定（オプトイン/アウト）との連動実装
- CSP 設定の確認・更新
- analytics adapter のユニットテスト作成
- IPC経由アプローチを選択する場合のMainプロセス側ハンドラ実装

### 含まないもの

- `SkillWizardEvents` 型定義の変更（W3-seq-04完了済み）
- analytics ダッシュボード UI や集計機能
- `SkillAnalytics` / `AnalyticsStore`（execution-centric既存基盤）との統合

## 統合テスト連携

- 接続要件（IPC/認証/データフロー）を要件に明記
- analytics送信IPCチャネル設計の前提確認

## 成果物

| 成果物       | パス                                                    | 内容                           |
| ------------ | ------------------------------------------------------- | ------------------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md`            | 機能要件・非機能要件・調査結果 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                | AC-1〜AC-9の詳細               |
| 仕様抽出結果 | `outputs/phase-1/aiworkflow-requirements-extraction.md` | aiworkflow仕様抽出結果         |

## 完了条件

- [ ] CSP設定ファイルの場所を特定
- [ ] 前タスク棚卸しと命名規則分析を完了
- [ ] analytics provider選定基準を文書化
- [ ] AC-1〜AC-9を検証方法と共に確定
- [ ] IPC経由アプローチのIPCチャネル命名規則を確認
- [ ] `ALLOWED_INVOKE_CHANNELS`追加要件を記録
- [ ] プライバシー設定ストアの有無を調査
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次のPhase

Phase 2: 設計
