# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 8                   |
| Phase名    | リファクタリング    |
| 前提Phase  | Phase 7             |
| 後続Phase  | Phase 9             |
| ステータス | 未実施              |
| 作成日     | 2026-02-27          |
| 機能名     | TASK-9H-skill-debug |

---

## 目的

TDD の「Refactor」フェーズとして、テストを維持しながら SkillDebugger・DebugSession・IPC ハンドラのコード品質を改善する。

## 背景

Phase 5 で「動く最小限のコード」を書いた後、リファクタリングによりコードの可読性、保守性、拡張性を向上させる。テストが通り続けることを確認しながら改善を行う。デバッグ機能は複数の設計パターン（Strategy、Observer）の適用候補があり、適切な抽象化を検討する。

---

## 実行タスク

### タスク1: リファクタリング対象評価

- 責務分離、Strategy、バリデーション共通化、Observer の4観点で適用要否を判定する

### タスク2: 小粒度リファクタリング実施

- 1変更ごとに実装し、失敗時に直前変更へ戻せる粒度で進める

### タスク3: TDD回帰検証

- 各変更後にテスト再実行とカバレッジ維持確認を実施する

### タスク4: 記録と引き継ぎ

- 判断理由と実施内容を `outputs/phase-8/refactoring-log.md` に記録する

---

## SubAgent 分担

| SubAgent                   | 関心ごと                        | 参照先                                                                                     | 期待成果物           |
| -------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------ | -------------------- |
| `design-consistency-agent` | 責務分離・依存方向・設計整合    | `.claude/skills/aiworkflow-requirements/SKILL.md` / `references/arch-electron-services.md` | 設計整合メモ         |
| `refactor-step-agent`      | 小粒度リファクタリングとTDD継続 | `.claude/skills/task-specification-creator/SKILL.md` / `references/quality-standards.md`   | `refactoring-log.md` |
| `hook-safety-agent`        | Hook/イベント連携の回帰確認     | `.claude/skills/claude-agent-sdk/SKILL.md`                                                 | 回帰確認ログ         |

SubAgent は担当範囲の変更理由・テスト結果を分離記録し、最終統合時に重複変更を除去する。

---

## 参照資料

| 参照資料         | パス                                                                                        | 内容                 |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------------- |
| Phase 1 成果物   | `outputs/phase-1/requirements-definition.md`                                                | 要件制約             |
| Phase 2 成果物   | `outputs/phase-2/architecture-design.md`                                                    | 設計制約             |
| Phase 5 実装     | `apps/desktop/src/main/services/skill/SkillDebugger.ts`                                     | SkillDebugger 実装   |
| Phase 5 実装     | `apps/desktop/src/main/services/skill/DebugSession.ts`                                      | DebugSession 実装    |
| Phase 5 実装     | `apps/desktop/src/main/ipc/skillDebugHandlers.ts`                                           | IPC ハンドラ         |
| Phase 5 実装     | `packages/shared/src/types/skill-debug.ts`                                                  | 共有型定義           |
| Phase 6 成果物   | `outputs/phase-6/coverage-report.md`                                                        | 追加テスト証跡       |
| Phase 7 成果物   | `outputs/phase-7/coverage-report.md`                                                        | カバレッジ証跡       |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | リファクタリング指針 |
| Electronサービス | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main層責務指針       |

---

## 実行手順

1. SubAgent 分担に沿って対象候補の分析と改善案を作成する。
2. 1変更単位で実装し、変更ごとに `TDD 検証` のテストを実行する。
3. カバレッジ低下の有無と統合連携の維持を確認し、`refactoring-log.md` に記録する。

---

## リファクタリング対象候補

### 1. SkillDebugger と DebugSession の責務分離確認

**現状分析ポイント**:

- SkillDebugger がセッションの生成・管理・コマンドディスパッチを全て担当していないか
- DebugSession が状態管理以外の責務（ブレークポイント評価、式評価）を過剰に持っていないか

**改善方針**:

- SkillDebugger: セッションライフサイクル管理とコマンドルーティングに特化
- DebugSession: セッション状態管理と実行コンテキスト管理に特化
- ブレークポイント管理: 独立した BreakpointManager クラスへの分離を検討

**判断基準**:

- 各クラスの public メソッド数が 10 以下であること
- 各メソッドの行数が 20 行以下であること

### 2. ブレークポイント評価ロジックの Strategy パターン適用可能性

**現状分析ポイント**:

- 無条件ブレークポイント、条件式ブレークポイント、ヒットカウントブレークポイントの評価ロジックが分岐で実装されていないか

**改善方針**:

- Strategy パターンの適用が有効かどうかを判断する基準:
  - ブレークポイントの種類が3つ以上ある場合 → 適用する
  - 2種類以下の場合 → 現状の分岐で十分（過剰抽象化を避ける）
- 適用する場合: `BreakpointEvaluator` インターフェースを定義し、種類ごとの具象クラスを作成

**判断基準**:

- ブレークポイント種類数を数え、3つ以上の場合のみ Strategy パターンを適用する

### 3. IPC ハンドラのバリデーション共通化

**現状分析ポイント**:

- 全7チャネルで P42 準拠3段バリデーション（型チェック → 空文字列 → trim 空文字列）が個別実装されていないか

**改善方針**:

- `validateStringArg(value: unknown, fieldName: string): string` ヘルパー関数を作成
- 全7チャネルのバリデーションでこのヘルパーを使用する
- セッション ID 存在チェックも `validateSessionExists(sessionId: string): DebugSession` として共通化

**判断基準**:

- 同一バリデーションパターンが3箇所以上で重複している場合 → 共通化する
- 2箇所以下の場合 → 現状維持

### 4. デバッグイベント発行の Observer パターン確認

**現状分析ポイント**:

- デバッグイベント（ブレーク、変数変更、セッション終了）の通知が直接結合していないか
- イベント発行と受信側が密結合していないか

**改善方針**:

- EventEmitter ベースの実装が既に行われている場合 → 追加のリファクタリングは不要
- 直接コールバック呼び出しの場合 → EventEmitter パターンへの移行を検討

**判断基準**:

- イベントリスナーの追加・削除が動的に行えること
- テストでイベント発火を独立して検証できること

---

## SOLID 原則チェック

### チェックリスト

| 原則                           | 確認項目                                                                 | 対象ファイル     | 判定 |
| ------------------------------ | ------------------------------------------------------------------------ | ---------------- | ---- |
| 単一責務原則 (SRP)             | 各クラスが1つの責務のみを持つ                                            | SkillDebugger.ts | -    |
| 単一責務原則 (SRP)             | 各クラスが1つの責務のみを持つ                                            | DebugSession.ts  | -    |
| 開放閉鎖原則 (OCP)             | ブレークポイント種類の追加が既存コード変更なしで可能                     | SkillDebugger.ts | -    |
| リスコフの置換原則 (LSP)       | インターフェース実装が契約に準拠                                         | 全ファイル       | -    |
| インターフェース分離原則 (ISP) | クライアントが使用しないメソッドに依存していない                         | DebugSession.ts  | -    |
| 依存性逆転原則 (DIP)           | SkillDebugger が DebugSession の具象クラスではなくインターフェースに依存 | SkillDebugger.ts | -    |

---

## リファクタリングチェックリスト

### 重複の排除

- [ ] 重複したバリデーションコードが存在しないか
- [ ] 類似のエラーハンドリングロジックが共通化されているか
- [ ] ヘルパー関数の抽出が適切か

### メソッドの分割

- [ ] 1つのメソッドが1つの責務を持っているか
- [ ] メソッドの行数が 20 行以下か
- [ ] ネストの深さが 3 レベル以下か

### 命名の改善

- [ ] 変数名が意図を表しているか（P45 対策: セマンティクスに一致する命名）
- [ ] 関数名がアクションを表しているか
- [ ] 型名がドメインを反映しているか

### 構造の改善

- [ ] 早期リターンによるガード節が使用されているか
- [ ] 条件分岐がシンプルか
- [ ] エラーハンドリングが一貫しているか

---

## TDD 検証

### TDD サイクル確認

```bash
# テスト実行コマンド（各リファクタリング後に実行）
cd apps/desktop && pnpm vitest run -- --grep "SkillDebugger|DebugSession|debug"
```

**確認項目**:

- [ ] リファクタリング前にテストが成功することを確認
- [ ] 各リファクタリング変更後にテストが成功することを確認
- [ ] テストカバレッジが維持されている（Phase 7 の値を下回らない）

### リファクタリング実行ルール

1. 1回のリファクタリングで変更するのは1つのパターンのみ
2. 変更後に必ずテストを実行する
3. テストが失敗した場合は直前の変更を取り消す
4. カバレッジが低下した場合は原因を調査し、テストを追加する

---

## 成果物

| 成果物               | パス                                                                       | 内容           |
| -------------------- | -------------------------------------------------------------------------- | -------------- |
| リファクタリング記録 | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-8/refactoring-log.md` | 変更内容と理由 |

---

## 統合テスト連携（Phase 1〜11 は必須）

Phase 8 では以下の統合テスト連携アクションを実施:

- [ ] リファクタリング後の全テスト継続成功を確認
- [ ] SkillDebugger → DebugSession 間の連携が維持されていることを確認
- [ ] IPC ハンドラの全7チャネルが正常動作することを確認
- [ ] デバッグイベント通知フローが維持されていることを確認

---

## 完了条件

- [ ] 重複コードが排除されている（同一バリデーションパターンが3箇所以上重複していない）
- [ ] メソッド分割基準を満たしている（各メソッド 20 行以下、ネスト 3 レベル以下）
- [ ] 命名が改善されている（P45 対策: セマンティクスに一致する命名が使用されている）
- [ ] SOLID 原則チェックが完了している
- [ ] リファクタリング対象候補4項目の分析と判断が完了している
- [ ] 全てのテストが成功する
- [ ] テストカバレッジが Phase 7 の値を下回っていない
- [ ] 統合テスト連携アクションが完了している
- [ ] 本 Phase 内の全 SubAgent タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全 SubAgent タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] SubAgent 実行記録が記録されている

---

## 依存関係

- **前提**: Phase 5, 6, 7 が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. SubAgent 分担タスクの実行（各担当ごとに1タスク）
3. リファクタリング対象候補の分析（4項目）
4. SOLID 原則チェック
5. リファクタリング実施
6. TDD 検証（各変更後のテスト実行）
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## SubAgent 100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全 SubAgent タスクを 100%実行完了
- [ ] 各担当の成果物が生成されている
- [ ] SubAgent 実行記録が `outputs/phase-8/refactoring-log.md` に記録されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9H-skill-debug --phase 8
```

---

## SubAgent 実行記録（全 Phase 共通）

Phase 完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### SubAgent 実行結果

- design-consistency-agent: [success/failure/partial]
- refactor-step-agent: [success/failure/partial]
- hook-safety-agent: [success/failure/partial]

### リファクタリング内容

| 対象                  | 実施内容          | 理由   | テスト結果 |
| --------------------- | ----------------- | ------ | ---------- |
| 責務分離確認          | [実施/不要]       | [理由] | [PASS/N/A] |
| Strategy パターン     | [適用/不要]       | [理由] | [PASS/N/A] |
| バリデーション共通化  | [実施/不要]       | [理由] | [PASS/N/A] |
| Observer パターン確認 | [確認済み/要修正] | [理由] | [PASS/N/A] |

### カバレッジ維持確認

- Phase 7 時点: Line [数値]%, Branch [数値]%, Function [数値]%
- Phase 8 後: Line [数値]%, Branch [数値]%, Function [数値]%
- 判定: [維持/低下]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次 Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9H-skill-debug/phase-9-quality-assurance.md`
