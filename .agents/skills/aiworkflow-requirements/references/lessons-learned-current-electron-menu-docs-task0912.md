# Lessons Learned / Electron Menu / Skill Docs / Task09-12（2026-03-16〜18）

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> インデックス: [lessons-learned-current.md](lessons-learned-current.md)
> 役割: TASK-FIX-ELECTRON-APP-MENU-ZOOM-001、TASK-IMP-SKILL-DOCS-AI-RUNTIME-001、Task09-12 の実装教訓

---

### 2026-03-16 TASK-FIX-ELECTRON-APP-MENU-ZOOM-001

#### 苦戦箇所1: Main Process エントリポイント（index.ts）のトップレベル副作用でテスト不可能

| 項目 | 内容 |
| --- | --- |
| 課題 | Main Process の index.ts に直接メニューロジックを追加しようとしたが、テストファイルで import するだけで `setupCustomProtocol` 等のトップレベル副作用が実行され、テストが動作しない |
| 再発条件 | Main Process のエントリポイント（index.ts）に直接ロジックを追加しようとした時 |
| 解決策 | ロジックを独立したモジュール（menu.ts）に分離してテスト容易性を確保（SRP準拠）。エントリポイントは薄い呼び出し層に留める |
| 標準ルール | Electron Main Process にメニュー/機能を追加する際は、まず独立モジュールに分離してからエントリポイントで呼び出す |
| 関連パターン | P5（リスナー二重登録）、SRP（単一責務原則） |
| 関連タスク | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 |

#### 苦戦箇所2: Electron role ベースメニューの検証手法

| 項目 | 内容 |
| --- | --- |
| 課題 | Electron の role ベースメニュー項目（cut, copy, paste, zoomIn 等）は OS ネイティブ処理に委譲されるため、動作の直接テストが困難 |
| 再発条件 | Electron の role ベースメニュー項目のテストを書く時 |
| 解決策 | `Menu.buildFromTemplate` のモック呼出し引数を検査してメニュー構造を検証する。`vi.spyOn(process, "platform", "get")` で platform 分岐もテスト可能 |
| 標準ルール | role ベースのメニュー項目は Electron に処理を委譲（カスタム click 不要）し、テストはメニュー構造の検証に留める |
| 関連タスク | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 |

```typescript
// role ベースメニューのテスト手法
vi.spyOn(process, "platform", "get").mockReturnValue("darwin");
setupApplicationMenu();
const template = vi.mocked(Menu.buildFromTemplate).mock.calls[0][0];
expect(template).toContainEqual(expect.objectContaining({ role: "zoomIn" }));
```

#### 苦戦箇所3: 小規模修正に対する13 Phase ワークフローの適用

| 項目 | 内容 |
| --- | --- |
| 課題 | 83行の新規ファイル + 2行の既存ファイル変更程度の小規模修正に対して、13 Phase のフルワークフローは過剰に見えた |
| 再発条件 | 小規模な機能追加（100行未満）にフルワークフローを適用する場合 |
| 解決策 | テスト20件・カバレッジ100%の品質が確保されており、platform 分岐の品質保証ができた |
| 標準ルール | ワークフローの規模判断は実装行数ではなく、品質保証の必要度（platform 分岐、セキュリティ影響等）で判断する |
| 関連タスク | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 |

#### 同種課題の簡潔解決手順（5ステップ）

1. Electron Main Process にメニュー/機能を追加する際は、まず独立モジュールに分離する。
2. role ベースのメニュー項目は Electron に処理を委譲し、カスタム click ハンドラは不要。
3. macOS は Apple HIG 準拠の4メニュー（App/Edit/View/Window）、Windows/Linux は最小構成にする。
4. テストは `Menu.buildFromTemplate` のモック引数検査でメニュー構造を検証する。
5. platform 分岐テストは `vi.spyOn(process, "platform", "get").mockReturnValue(...)` でモックする。

---

### 2026-03-16 TASK-IMP-SKILL-DOCS-AI-RUNTIME-001

#### 教訓1: Constructor Injection による queryFn 差替パターン

| 項目 | 内容 |
| --- | --- |
| 状況 | SkillDocGenerator の stubQueryFn を LLMDocQueryAdapter.query() に差し替える必要があった |
| 解決策 | `adapter.query.bind(adapter)` で既存の `LLMQueryFn` シグネチャに合わせることで、SkillDocGenerator 自体に変更を加えずに adapter を注入できた（Open-Closed Principle） |
| 適用範囲 | 他の LLM 統合箇所（chat-edit, agent-execution 等）でも同パターンが適用可能 |
| 関連タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |

#### 教訓2: CapabilityResolver パターンの再利用性

| 項目 | 内容 |
| --- | --- |
| 状況 | Skill Docs の capability 判定（integrated-api / guidance-only / terminal-handoff）を3パスで実装 |
| 解決策 | ILLMDocQueryAdapter インターフェースの isAvailable() / getProviderName() を基に resolver が判定する疎結合設計 |
| 注意 | terminal-handoff は事後判定（LLM呼出し失敗後の fallback）であり、事前判定には isAvailable() では不十分。実LLM接続テストが必要（UT-SKILL-DOCS-TERMINAL-HANDOFF-001 として未タスク化） |
| 関連タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |

#### 教訓3: Phase 4-5 統合実行の効率性

| 項目 | 内容 |
| --- | --- |
| 状況 | Phase 4（テスト作成 Red）と Phase 5（実装 Green）を別エージェントで実行しようとした |
| 解決策 | TDD の Red-Green サイクルを1エージェントで統合実行するほうが、型定義→テスト→実装のコンテキスト切替コストが低く効率的だった |
| 適用範囲 | 今後の Phase 4-5 実行時は統合エージェントを推奨 |
| 関連タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |

#### 同種課題の簡潔解決手順（3ステップ）

1. LLM adapter 差し替えは `bind()` パターンで既存シグネチャに合わせ、Generator クラス本体を変更しない。
2. CapabilityResolver の terminal-handoff パスは「失敗後 fallback」として設計し、事前判定と混在させない。
3. Phase 4-5 は同一エージェントで Red-Green サイクルを完結させる。

---

### 2026-03-18 Task09-12 スキルライフサイクル統合 UI GAP 解消 仕様書作成

#### P64: GAP ID正本テーブルの後追い付番による番号不整合

| 項目 | 内容 |
| --- | --- |
| 課題 | GAP ID正本テーブルを既存タスク仕様書の作成後に追加した場合、正本の番号体系と既存仕様書の参照番号が乖離する。正本テーブルのC-04〜C-07の定義がTask09-12の仕様書の使用と逆転していた |
| 症状 | 正本テーブルではC-04=improve要約転送（Task09担当）だが、Task10がC-04を使用（chip UI）。実装者が誤ったGAPを担当する可能性 |
| 解決策 | 正本テーブルを既存タスク仕様書の番号体系に合わせて修正。新規正本追加時は `grep -rn "C-0[2-7]" docs/` で全参照を確認してから付番する |
| 再発条件 | 複数タスク仕様書を先に作成し、後から「GAP ID正本テーブル」を統合ドキュメントに追加する |
| 標準ルール | 正本テーブルを後から追加する場合は、既存仕様書の全参照をgrepで洗い出し、使用済みIDに合わせて付番する |
| 関連タスク | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001, TASK-IMP-LIFECYCLE-CONSTRAINT-CHIPS-001, TASK-IMP-LIFECYCLE-QUALITY-RUNTIME-UI-001, TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001 |

#### P65: Phase 2設計での存在しないProps/型値の前提使用

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 2設計でSkillLifecyclePanelの `currentPhase` Propsを前提にしたが、実際の実装にはこのPropsが存在しなかった。同様にTask12ではSkillExecutionStatusに存在しない`"review"`を前提に設計していた |
| 症状 | Phase 4テストがコンパイルエラーで実行不可能。Phase 5実装者が設計に立ち戻る手戻り |
| 再発条件 | Phase 1（要件定義）で対象コンポーネントの既存Props・型定義を確認せずにPhase 2設計を進める |
| 解決策 | Phase 1のP50チェック（既実装状態の調査）で対象コンポーネントのPropsと型定義を確認し、Phase 2設計の前提条件として明記する |
| 標準ルール | 既存コンポーネントを改修するタスクのPhase 1では、対象ファイルの実際のProps型・Union型の値を `grep -n "interface\|type " <target-file>` で確認してから設計する |
| 関連パターン | P50（既実装防御の発見によるPhase転換）、P32（型定義の二箇所同時更新必須） |
| 関連タスク | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001, TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001 |

#### 同種課題の簡潔解決手順（4ステップ）

1. 既存コンポーネント改修タスクのPhase 1では `grep -n "interface\|Props\|type " <target-file>` で実際の型・Propsを確認する（P65対策）。
2. GAP ID正本テーブルを後追いで追加する場合は `grep -rn "GAP-ID-PREFIX" docs/` で全参照を確認し、使用済みIDに合わせて付番する（P64対策）。
3. 上流文書（ui-ux-diagrams.md等）に複数の状態遷移図がある場合、Phase 3レビューで全図の整合チェックを必須とする。
4. プロダクションコード変更（ラベル変更等）は必ず仕様書記録を先に作成してから実施する。
