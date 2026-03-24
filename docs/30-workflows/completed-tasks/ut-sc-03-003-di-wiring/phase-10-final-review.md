# Phase 10: 最終レビュー

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 10                         |
| タスクID   | UT-SC-03-003               |
| 親タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日     | 2026-03-23                 |
| 前提Phase  | Phase 9（品質検証）全 PASS |

## 目的

Phase 9 の品質検証を通過したコードに対して、要件充足・セキュリティ・設計原則・コード品質の多角的観点から最終レビューを実施する。PASS / MINOR / MAJOR / CRITICAL の判定を行い、Phase 11 以降への進行可否を決定する。

## 実行タスク

### Task 1: 要件充足レビュー

以下の機能要件（FR）および非機能要件（NFR）が全て満たされているか検証する。

**機能要件:**

| ID    | 要件                                                   | 検証方法                                                                                     |
| ----- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| FR-01 | ResourceLoader を Constructor Injection で注入する     | コード確認: constructor 引数に ResourceLoader が含まれる                                     |
| FR-02 | LLMAdapter を Setter Injection で遅延注入する          | コード確認: setLLMAdapter() メソッド定義の存在、プロパティの readonly 修飾子が除去されている |
| FR-03 | graceful degradation（未注入時はスタブ返却）を維持する | テスト確認: 未注入時のテストケースが PASS                                                    |
| FR-04 | 既存のテストが全て PASS すること                       | Phase 9 テスト結果の参照: 全テストスイート PASS                                              |
| FR-05 | `DEFAULT_SKILL_CREATOR_PATH` を使用する                | コード確認: ResourceLoader 初期化時に DEFAULT_SKILL_CREATOR_PATH が使用されている            |

**非機能要件:**

| ID     | 要件                                                        | 検証方法                            |
| ------ | ----------------------------------------------------------- | ----------------------------------- |
| NFR-01 | setLLMAdapter() 呼び出しがアプリ起動時間に影響しない        | fire-and-forget パターンの実装確認  |
| NFR-02 | 型安全性が維持されている（any 型不使用）                    | `grep -n "any" 対象ファイル` で確認 |
| NFR-03 | 既存の IPC ハンドラに回帰影響がない                         | Phase 9 テスト結果の確認            |
| NFR-04 | エラーメッセージにパスワード・APIキー・PII が含まれていない | console.warn メッセージの内容確認   |

### Task 2: セキュリティレビュー

- `setLLMAdapter()` が Renderer プロセスから IPC 経由で呼び出し可能な状態になっていないか確認する
  - Main Process 内部でのみ呼び出されること
  - Preload の allowlist に setLLMAdapter 関連のチャンネルが追加されていないこと
- LLMAdapter インスタンスが不正な値で上書きされるリスクがないか確認する
  - 型チェックによる防御が機能していること
- fire-and-forget async のエラーハンドリングで内部パス情報が漏洩していないか確認する
  - P55（エラーメッセージ中のパスの正規表現メタ文字）に該当するリスクがないこと

### Task 3: 設計パターン準拠レビュー

**P34 準拠（Setter Injection パターン）:**

- BrowserWindow のように外部リソース準備後に注入が必要な LLMAdapter に対して、Setter Injection が適切に適用されているか
- Constructor Injection では対応できない理由が明確か（LLMAdapterFactory.getAdapter() が非同期であり、コンストラクタ時点で利用不可能）
- setLLMAdapter() 呼び出し前のメソッド呼び出しで安全にフォールバックするか

**P5 準拠（リスナー二重登録防止）:**

- `unregisterAllIpcHandlers()` -> `registerAllIpcHandlers()` の再登録フローにおいて、fire-and-forget async による LLMAdapter 注入が二重実行されないか確認する
- macOS `activate` イベント等での再登録時に setLLMAdapter() が累積的に呼び出されるリスクがないか

**P42 準拠（文字列引数バリデーション）:**

- 本タスクでは IPC ハンドラの文字列引数バリデーション変更は行わないが、既存の `skill-creator:*` ハンドラの 3 段バリデーション（型チェック -> 空文字列 -> トリム空文字列）が壊れていないことを確認する

### Task 4: コード品質レビュー

以下の原則に反していないか確認する。

| 原則  | 確認項目                                                                           |
| ----- | ---------------------------------------------------------------------------------- |
| DRY   | setLLMAdapter() のロジックが他の setter と重複していないか                         |
| KISS  | fire-and-forget パターンが過度に複雑になっていないか                               |
| YAGNI | 将来の拡張を見越した不要な抽象化が含まれていないか                                 |
| SRP   | RuntimeSkillCreatorFacade が LLM 管理以外の責務を持っていないか                    |
| DIP   | setLLMAdapter() の引数型が具象クラスではなくインターフェースであること（P61 準拠） |

### Task 5: 判定と報告書作成

レビュー結果を以下の基準で判定する。

| 判定     | 基準                                           | 対応                                           |
| -------- | ---------------------------------------------- | ---------------------------------------------- |
| PASS     | 全レビュー観点で問題なし                       | Phase 11 へ進行                                |
| MINOR    | 機能に影響しない改善点がある                   | 未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | 要件未充足またはセキュリティ上の懸念がある     | 影響範囲に応じて Phase 1-5 へ戻る              |
| CRITICAL | セキュリティ脆弱性または根本的な設計問題がある | Phase 1 へ戻り要件再確認                       |

MINOR 判定の場合:

- 指摘事項を全て未タスク仕様書に変換する（「機能影響なし」でも省略不可）
- 未タスク仕様書は `docs/30-workflows/unassigned-task/` に配置する
- `task-workflow.md` の残課題テーブルに登録する
- 関連仕様書に参照リンクを追加する

## 参照資料

| 資料                                                                  | 用途                               |
| --------------------------------------------------------------------- | ---------------------------------- |
| 05-task-execution.md                                                  | Phase 10 レビューゲート判定基準    |
| 04-electron-security.md                                               | セキュリティ設計原則               |
| 02-code-quality.md                                                    | コード品質基準                     |
| P34（06-known-pitfalls.md）                                           | Setter Injection パターン          |
| P5（06-known-pitfalls.md）                                            | リスナー二重登録防止               |
| P42（06-known-pitfalls.md）                                           | 文字列引数 .trim() バリデーション  |
| P55（06-known-pitfalls.md）                                           | エラーメッセージ中のパス安全性     |
| P61（06-known-pitfalls.md）                                           | IPC ハンドラの DIP 違反検出        |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | レビュー対象ファイル               |
| `apps/desktop/src/main/ipc/index.ts`                                  | レビュー対象ファイル               |
| Phase 9 品質検証レポート                                              | テスト・Lint・型チェック結果の参照 |

## 成果物

| 成果物             | パス                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| 最終レビュー報告書 | `docs/30-workflows/ut-sc-03-003-di-wiring/phase-10-final-review-report.md` |
| 未タスク仕様書     | `docs/30-workflows/unassigned-task/` 配下（MINOR 判定時のみ）              |

## 完了条件

- [ ] FR-01 ~ FR-05 の要件充足が全て検証されている
- [ ] NFR-01 ~ NFR-04 の非機能要件が全て検証されている
- [ ] セキュリティレビューで setLLMAdapter() の外部アクセスリスクが否定されている
- [ ] P34（Setter Injection）、P5（二重登録防止）、P42（バリデーション）の準拠が確認されている
- [ ] DIP 準拠: setLLMAdapter() の引数型がインターフェースであること（P61）
- [ ] DRY / KISS / YAGNI / SRP 原則への準拠が確認されている
- [ ] レビュー判定（PASS / MINOR / MAJOR / CRITICAL）が明確に記録されている
- [ ] MINOR 判定の場合、全ての指摘事項が未タスク仕様書に変換されている（省略不可）
- [ ] 最終レビュー報告書が作成されている

## 統合テスト連携

最終レビューにおける統合テスト確認:

- [ ] 全テストスイートがPASSしていることを最終確認
- [ ] DI配線による regression がないことを確認
- [ ] カバレッジ基準を満たしていることを確認

## 多角的チェック観点（AIが判断）

| 観点               | 適用 | チェック内容                                                                         |
| ------------------ | ---- | ------------------------------------------------------------------------------------ |
| アーキテクチャ     | Yes  | DI配線がレイヤー依存方向（Main→Services）を遵守しているか                            |
| セキュリティ       | No   | 認証・認可の変更なし                                                                 |
| IPC通信            | Yes  | RuntimeSkillCreatorFacade への依存注入が IPC ハンドラ登録と整合しているか            |
| エラーハンドリング | Yes  | graceful degradation（llmAdapter/resourceLoader 未注入時のスタブ返却）が維持されるか |

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
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

- PASS の場合: Phase 11（手動テスト）へ進行する
- MINOR の場合: 未タスク仕様書に変換後、Phase 11（手動テスト）へ進行する
- MAJOR の場合: 影響範囲に応じて Phase 1-5 へ戻る
- CRITICAL の場合: Phase 1 へ戻り要件を再確認する
