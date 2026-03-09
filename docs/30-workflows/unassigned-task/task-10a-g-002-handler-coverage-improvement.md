# UT-10A-G-002 skillHandlers.ts 全体カバレッジ向上（schedule/docs/chain） - タスク指示書

## メタ情報

```yaml
issue_number: 1102
```

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | UT-10A-G-002                                               |
| タスク名     | skillHandlers.ts 全体カバレッジ向上（schedule/docs/chain） |
| 分類         | テスト強化                                                 |
| 対象機能     | skillHandlers.ts の schedule/docs/chain ハンドラ           |
| 優先度       | 低                                                         |
| 見積もり規模 | 中規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | TASK-10A-G Phase 12 未タスク検出                           |
| 発見日       | 2026-03-09                                                 |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-G で skill:create スコープの Branch Coverage は 89% を達成したが、skillHandlers.ts ファイル全体では Line Coverage 68.24%、Function Coverage 34.37% にとどまっている。

### 1.2 問題点・課題

schedule, docs, chain 等のハンドラにはテストが不足しており、vitest --coverage のファイル全体計測で Line/Function Coverage が低く表示される。

### 1.3 放置した場合の影響

ファイル全体のカバレッジメトリクスが改善されず、品質基準（Line 80%+, Function 80%+）の未達が続く。

## 2. 何を達成するか（What）

### 2.1 目的

skillHandlers.ts の Line Coverage 80%+、Function Coverage 80%+ を達成する。

### 2.2 最終ゴール

vitest --coverage でファイル全体が Line 80%+, Branch 60%+, Function 80%+ を満たす。

### 2.3 スコープ

#### 含むもの

schedule, docs, chain ハンドラのユニットテスト作成。

#### 含まないもの

UI レベルの統合テスト（Layer 2/3）。

### 2.4 成果物

- 各ハンドラのユニットテストファイル（skillHandlers.schedule.test.ts, skillHandlers.docs.test.ts, skillHandlers.chain.test.ts 等）
- カバレッジレポート（スコープ注釈付き）

## 3. どのように実行するか（How）

### 3.1 前提条件

skillHandlers.ts の既存テスト（skillHandlers.create.test.ts, skillHandlers.fork.test.ts）が PASS していること。

### 3.2 依存タスク

UT-10A-G-001（他ハンドラの3層テスト横展開）が先行すると効率的だが、必須ではない。

### 3.3 必要な知識

Vitest のカバレッジ計測（v8 プロバイダ）、IPC ハンドラのモック構成、skillHandlers.ts のアーキテクチャ。

### 3.4 推奨アプローチ

skillHandlers.create.test.ts のモック構成を再利用し、ハンドラごとにテストファイルを分割して作成する。

## 4. 実行手順

### Phase構成

未カバー特定 → テスト設計 → テスト実装 → カバレッジ検証。

### Phase 1: 未カバー行・関数の特定

#### 目的

カバレッジ不足箇所を正確に把握する。

#### 手順

1. `vitest --coverage.include="apps/desktop/src/main/ipc/skillHandlers.ts"` でファイル全体のカバレッジを計測する。
2. HTML レポートで未カバーの行・関数・分岐を特定する。
3. ハンドラごとの未カバー行数を記録する。

#### 成果物

未カバー箇所のリスト。

#### 完了条件

全ハンドラの未カバー状況が把握できている。

### Phase 2: テストケース設計・実装

#### 目的

各ハンドラの正常系・異常系テストを作成する。

#### 手順

1. skillHandlers.create.test.ts のモック構成（validateIpcSender, SkillService モック等）をテンプレートとして流用する。
2. 各ハンドラについて正常系・異常系・バリデーションエラーのテストケースを設計する。
3. ハンドラごとに独立したテストファイルを作成する。
4. validateIpcSender のオプションオブジェクト内コールバックも明示的にテストする（P41 対策）。

#### 成果物

ハンドラごとのテストファイル。

#### 完了条件

全テストが PASS する。

### Phase 3: カバレッジ検証

#### 目的

品質基準の充足を確認する。

#### 手順

1. `vitest --coverage` でファイル全体のカバレッジを再計測する。
2. Line 80%+, Branch 60%+, Function 80%+ を確認する。
3. カバレッジレポートにスコープ注釈を付記する。

#### 成果物

カバレッジレポート（基準充足の証跡）。

#### 完了条件

Line 80%+, Branch 60%+, Function 80%+ を全て満たす。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] schedule ハンドラの正常系・異常系テストが PASS する
- [ ] docs ハンドラの正常系・異常系テストが PASS する
- [ ] chain ハンドラの正常系・異常系テストが PASS する

### 品質要件

- [ ] skillHandlers.ts 全体の Line Coverage が 80% 以上
- [ ] skillHandlers.ts 全体の Branch Coverage が 60% 以上
- [ ] skillHandlers.ts 全体の Function Coverage が 80% 以上

### ドキュメント要件

- [ ] カバレッジレポートにスコープ注釈を付記する

## 6. 検証方法

### テストケース

- `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.*.test.ts --coverage`

### 検証手順

1. 全テストファイルを実行し PASS を確認する。
2. カバレッジレポートで Line/Branch/Function の各基準値を確認する。
3. `--coverage.include` オプションで skillHandlers.ts 単体の計測結果を確認する。

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                                                  |
| -------------------------------------------- | ------ | -------- | --------------------------------------------------------------------- |
| v8 プロバイダのインライン関数カウント（P41） | 中     | 高       | validateIpcSender のコールバック戻り値を明示的にテストで検証する      |
| テストファイル肥大化                         | 低     | 中       | ハンドラごとにテストファイルを分割する（既存パターン準拠）            |
| カバレッジ計測スコープの不一致               | 中     | 中       | `--coverage.include` でファイル単位のスコープを限定し、注釈を付記する |

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/ipc/skillHandlers.ts`（テスト対象、1417行）
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`（テンプレート、25テスト）
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.fork.test.ts`（既存パターン参照）

### 参考資料

- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` セクション17（3層テスト構成パターン）
- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`（カバレッジ基準値）
- `.claude/rules/06-known-pitfalls.md#P41`（v8 カバレッジプロバイダのインライン関数カウント）

## 9. 備考

### 苦戦箇所（TASK-10A-G で得た教訓）

- **教訓1（P41）**: vitest の v8 カバレッジプロバイダは、インライン arrow function を独立関数としてカウントする。validateIpcSender のオプションオブジェクト内のコールバックも計測対象になるため、テストで明示的に呼び出しが必要。
- **教訓2**: skillHandlers.ts が1417行の巨大ファイルのため、1つのテストファイルで全ハンドラをカバーするのではなく、ハンドラごとにテストファイルを分割する（skillHandlers.create.test.ts, skillHandlers.fork.test.ts のように既存パターンに従う）。
- **教訓3**: カバレッジ計測のスコープ不一致の失敗パターンを回避するため、カバレッジレポートには必ずスコープ注釈を付ける。
- **参照**: lessons-learned.md v1.29.51（教訓2: カバレッジ計測の誤解）、skill-creator/patterns.md（失敗パターン: カバレッジ計測のスコープ不一致）

### 補足事項

UT-10A-G-001（3層テスト横展開）と並行実施する場合、モック構成の共通化を検討すると効率的である。
