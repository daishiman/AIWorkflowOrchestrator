# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 1                               |
| Phase名    | 要件定義                        |
| 前提Phase  | -                               |
| 後続Phase  | Phase 2                         |
| ステータス | 未実施                          |
| 作成日     | 2026-01-25                      |
| 機能名     | TASK-3-1-D-permission-dialog-ui |

---

## 目的

skillAPI経由の権限確認ダイアログ機能に関する機能要件・非機能要件を明確化し、TASK-3-1-Cで実装されたMain Process側との統合要件を定義する。

## 背景

TASK-3-1-CでMain ProcessにPermissionRequest Hook統合が完了した。SkillExecutorがツール実行前に権限確認をRenderer Processに要求する仕組みが実装されたが、Renderer側でその要求を受信・表示・応答する機能が未実装。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存実装の調査

**目的**: 現状の実装状況を把握し、本タスクで追加すべき機能を特定する

**実行手順**:

1. 既存PermissionDialogコンポーネントの仕様を確認
   - `apps/desktop/src/renderer/components/organisms/PermissionDialog/PermissionDialog.tsx`
   - Props: `request`, `onApprove`, `onDeny`
   - フォーカストラップ、アクセシビリティ対応状況

2. agentAPI permission機能の実装状況を確認
   - `apps/desktop/src/preload/index.ts` の `agentAPI.respondPermission`, `agentAPI.onPermission`
   - IPCチャネル: `AGENT_PERMISSION_REQUEST`, `AGENT_PERMISSION_RESPOND`

3. skillAPIの現状を確認
   - `apps/desktop/src/preload/skill-api.ts`
   - permission関連メソッドが存在しないことを確認

4. TASK-3-1-CのMain Process実装を確認
   - SkillExecutorがどのIPCチャネルで権限リクエストを送信するか
   - どのIPCチャネルで権限応答を受信するか

**期待される成果物**:

- `outputs/phase-1/existing-implementation-analysis.md`: 既存実装調査レポート

---

### タスク2: 機能要件定義

**目的**: 実装すべき機能要件を明確に定義する

**実行手順**:

1. skillAPI拡張要件を定義
   - `onPermission(callback)`: 権限リクエスト受信リスナー登録
   - `respondPermission(response)`: 権限応答送信

2. SkillStreamDisplayコンポーネント連携要件を定義
   - PermissionDialogの表示トリガー
   - 状態管理（pendingPermission）との連携

3. IPC通信要件を定義
   - Main → Renderer: 権限リクエスト送信
   - Renderer → Main: 権限応答送信
   - 使用するIPCチャネルの特定

4. ユーザーインタラクション要件を定義
   - ダイアログ表示時のフォーカス管理
   - 「許可」「拒否」ボタン操作
   - キーボードナビゲーション（Tab、Escape）

**期待される成果物**:

- `outputs/phase-1/functional-requirements.md`: 機能要件定義書

---

### タスク3: 非機能要件定義

**目的**: 品質・性能・セキュリティ要件を定義する

**実行手順**:

1. アクセシビリティ要件（WCAG 2.1 AA準拠）
   - フォーカストラップ: モーダル内でTabキーがループ
   - スクリーンリーダー対応: `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`
   - キーボード操作: Enter/Space/Escape対応
   - コントラスト比: 4.5:1以上

2. 性能要件
   - ダイアログ表示レイテンシ: 100ms以内
   - IPC応答時間: 50ms以内

3. セキュリティ要件
   - 権限リクエストの改ざん防止
   - 正当なMain Processからのリクエストのみ処理
   - 許可されたIPCチャネルのみ使用

4. 保守性要件
   - 既存PermissionDialogコンポーネントの再利用
   - 既存agentSlice状態管理パターンの流用

**期待される成果物**:

- `outputs/phase-1/non-functional-requirements.md`: 非機能要件定義書

---

### タスク4: 受け入れ基準定義

**目的**: タスク完了を判断するための明確な基準を定義する

**実行手順**:

1. 機能受け入れ基準
   - skillAPIに`onPermission`, `respondPermission`メソッドが追加されている
   - Main Processからの権限リクエストを受信できる
   - PermissionDialogが表示される
   - 「許可」クリックで`approved: true`が送信される
   - 「拒否」クリックで`approved: false`が送信される

2. 品質受け入れ基準
   - ユニットテストカバレッジ80%以上
   - TypeScript strict PASS
   - ESLint PASS
   - アクセシビリティ（WCAG 2.1 AA準拠）

3. 統合テスト受け入れ基準
   - IPC通信が正常に動作する
   - ダイアログ表示・応答フローが正常に動作する

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`: 受け入れ基準定義書

---

## 参照資料

| 参照資料                  | パス                                                                        | 内容                 |
| ------------------------- | --------------------------------------------------------------------------- | -------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | PermissionRequest型  |
| UI/UXコンポーネント       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | PermissionDialog仕様 |
| 既存PermissionDialog      | `apps/desktop/src/renderer/components/organisms/PermissionDialog/`          | 再利用コンポーネント |
| skillAPI                  | `apps/desktop/src/preload/skill-api.ts`                                     | 拡張対象             |
| channels定義              | `apps/desktop/src/preload/channels.ts`                                      | IPCチャネル定義      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容                 |
| ------------------------- | --------------------------------------------------------------------------- | -------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | IPC通信仕様、型定義  |
| UI/UXコンポーネント       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | PermissionDialog仕様 |

---

## 成果物

| 成果物               | パス                                                  | 内容         |
| -------------------- | ----------------------------------------------------- | ------------ |
| 既存実装調査レポート | `outputs/phase-1/existing-implementation-analysis.md` | 現状分析結果 |
| 機能要件定義書       | `outputs/phase-1/functional-requirements.md`          | 機能要件     |
| 非機能要件定義書     | `outputs/phase-1/non-functional-requirements.md`      | 非機能要件   |
| 受け入れ基準定義書   | `outputs/phase-1/acceptance-criteria.md`              | 完了判定基準 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 1での統合テスト連携アクション:**

- IPC通信要件（permission request/response）を要件に明記する
- Main Process（TASK-3-1-C）との接続ポイントを特定する
- 統合テストで検証すべき項目を受け入れ基準に含める

---

## 完了条件

- [ ] 既存実装調査レポートが作成されている
- [ ] 機能要件定義書が作成されている
- [ ] 非機能要件定義書が作成されている
- [ ] 受け入れ基準定義書が作成されている
- [ ] IPC通信要件が明確に定義されている
- [ ] 統合テスト観点が要件に含まれている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-1-D-permission-dialog-ui/phase-2-design.md`
