# useSkillExecution リトライイベント対応 - タスク指示書

## メタ情報

```yaml
issue_number: 615
```

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | -                                                |
| タスク名     | useSkillExecution リトライイベント対応           |
| 分類         | 改善                                             |
| 対象機能     | useSkillExecution Hook (Renderer Process)        |
| 優先度       | 中                                               |
| 見積もり規模 | 小規模                                           |
| ステータス   | 未実施                                           |
| 発見元       | TASK-SKILL-RETRY-001 Phase 11 スコープ外発見事項 |
| 発見日       | 2026-01-31                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-RETRY-001にてSkillExecutorにリトライ機構を実装した。リトライ発生時にはMain Processの`skill:stream`チャネル経由で`retry`タイプのSkillStreamMessageが送信される。しかし、Renderer Process側の`useSkillExecution`フックにはこの`retry`イベントを処理するハンドラが存在しない。SkillStreamMessageTypeに`retry`が定義済みだが、UI側で未対応のままとなっている。

### 1.2 問題点・課題

- リトライ発生中にユーザーへのフィードバックがない（UIが無反応に見える）
- リトライの試行回数が表示されないため、ユーザーは処理が進んでいるか判断できない
- リトライ中のエラー内容が表示されないため、問題の切り分けが困難
- SkillStreamDisplayコンポーネントにリトライ状態の表示がない

### 1.3 放置した場合の影響

- ユーザーがリトライ中に処理がフリーズしたと誤認し、手動で中断する可能性がある
- リトライの発生自体がユーザーに知覚されず、エラー状況の把握が遅れる
- UX品質の低下（ユーザーが何が起きているか分からない状態）

---

## 2. 何を達成するか（What）

### 2.1 目的

useSkillExecutionフックにretryイベント処理を追加し、リトライ発生時のUIフィードバックを実現する。

### 2.2 最終ゴール

- useSkillExecutionフックがretryタイプのストリームメッセージを処理する
- リトライ中であることがUIに表示される（インジケータ）
- 現在の試行回数/最大回数が表示される
- 直近のリトライエラー内容が表示される
- SkillStreamDisplayコンポーネントにリトライ状態が反映される

### 2.3 スコープ

#### 含むもの

- useSkillExecutionフックのretryイベントハンドラ追加
- retryCount、isRetrying、lastRetryError等のstate追加
- SkillStreamDisplayコンポーネントへのリトライインジケータ表示
- 対応するテスト

#### 含まないもの

- リトライ設定UI（別タスク: UT-001）
- リトライ履歴の永続化（別タスク: UT-002）
- リトライのキャンセル機能

### 2.4 成果物

- `apps/desktop/src/renderer/hooks/useSkillExecution.ts`の変更差分
- `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`の変更差分
- 対応するテストファイル

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SKILL-RETRY-001（SkillExecutorリトライ機構）が完了していること（完了済み）
- useSkillExecutionフックの現在の構造を理解していること
- SkillStreamDisplayコンポーネントの現在の構造を理解していること

### 3.2 依存タスク

| タスクID             | タスク名                       | ステータス |
| -------------------- | ------------------------------ | ---------- |
| TASK-SKILL-RETRY-001 | SkillExecutor リトライ機構実装 | 完了       |

### 3.3 必要な知識

- React Hooks（useState、useCallback）
- Electron IPC リスナー（ipcRenderer.on）
- SkillStreamMessage型、SkillStreamMessageType型
- SkillStreamDisplayコンポーネントの既存UI構造
- Tailwind CSSによるUIスタイリング

### 3.4 推奨アプローチ

#### useSkillExecution hook拡張

```typescript
// 追加するstate
const [isRetrying, setIsRetrying] = useState(false);
const [retryCount, setRetryCount] = useState(0);
const [maxRetries, setMaxRetries] = useState(0);
const [lastRetryError, setLastRetryError] = useState<string | null>(null);

// retryイベントハンドラ
case 'retry':
  const retryData = JSON.parse(message.content);
  setIsRetrying(true);
  setRetryCount(retryData.attempt);
  setMaxRetries(retryData.maxRetries);
  setLastRetryError(retryData.errorMessage);
  break;

case 'text':
  // リトライ後のテキスト受信でリトライ状態をリセット
  setIsRetrying(false);
  break;

case 'complete':
  setIsRetrying(false);
  setRetryCount(0);
  break;
```

#### 戻り値の拡張

```typescript
return {
  // 既存の戻り値...
  isRetrying,
  retryCount,
  maxRetries,
  lastRetryError,
};
```

#### SkillStreamDisplay UIイメージ

リトライ中に以下のインジケータを表示する:

- 回転アイコン + 「リトライ中...（2/3回目）」テキスト
- 直前のエラー理由（例:「ネットワークエラー: Connection timeout」）
- プログレスバー（試行回数/最大回数）

---

## 4. 実行手順

### Phase構成

2フェーズ構成（小規模改善タスク）

### Phase 1: useSkillExecution hook拡張

#### 目的

retryイベントを処理しstate管理を追加する

#### 手順

1. useSkillExecution.tsのストリームメッセージハンドラに`retry`ケースを追加
2. isRetrying、retryCount、maxRetries、lastRetryErrorのstateを追加
3. retryイベント受信時にstateを更新
4. text/completeイベント受信時にリトライ状態をリセット
5. 戻り値にリトライ関連stateを追加
6. 単体テストを作成

#### 成果物

- `apps/desktop/src/renderer/hooks/useSkillExecution.ts`の変更差分
- `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.retry.test.ts`

#### 完了条件

- retryイベント受信時にstateが正しく更新される
- リトライ後の成功時にstateがリセットされる
- テストがすべてパスする

### Phase 2: SkillStreamDisplay UI拡張

#### 目的

リトライ状態をUIに反映する

#### 手順

1. SkillStreamDisplayコンポーネントのpropsにリトライ関連stateを追加
2. リトライ中インジケータコンポーネントを実装（回転アイコン + テキスト）
3. 試行回数/最大回数の表示を実装
4. 直前エラー理由の表示を実装
5. Tailwind CSSでスタイリング（警告色のボーダー、アニメーション等）
6. コンポーネントテストを作成

#### 成果物

- `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`の変更差分
- 対応するテストファイル

#### 完了条件

- リトライ中にインジケータが表示される
- 試行回数が正しく表示される
- リトライ完了後にインジケータが消える

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] useSkillExecutionフックがretryイベントを処理する
- [ ] isRetrying stateがリトライ中にtrueになる
- [ ] retryCount stateが現在の試行回数を保持する
- [ ] lastRetryError stateが直近のエラーメッセージを保持する
- [ ] SkillStreamDisplayにリトライインジケータが表示される
- [ ] リトライ後の成功/完了時にstateがリセットされる

### 品質要件

- [ ] hookのテストがすべてパスする
- [ ] UIコンポーネントのテストがすべてパスする
- [ ] 既存のuseSkillExecutionテストが壊れない
- [ ] 既存のSkillStreamDisplayテストが壊れない
- [ ] TypeScript型エラーが発生しない

### ドキュメント要件

- [ ] 追加したstateにJSDocコメントが記載されている
- [ ] リトライUIのデザイン意図がコメントで説明されている

---

## 6. 検証方法

### テストケース

| No. | テストケース                   | 期待結果                                 |
| --- | ------------------------------ | ---------------------------------------- |
| 1   | retryイベント受信              | isRetrying=true、retryCount更新          |
| 2   | retry後にtextイベント受信      | isRetrying=false                         |
| 3   | retry後にcompleteイベント受信  | 全stateがリセットされる                  |
| 4   | 3回リトライ後に成功            | retryCountが1→2→3と更新後リセット        |
| 5   | リトライ中にUIインジケータ表示 | 「リトライ中...（N/M回目）」が表示される |
| 6   | リトライ中にエラー理由表示     | lastRetryErrorの内容が表示される         |

### 検証手順

1. useSkillExecutionの単体テストを実行し全パスを確認
2. SkillStreamDisplayのコンポーネントテストを実行し全パスを確認
3. 実際にリトライが発生する状況（ネットワーク切断等）を再現し、UIの表示を確認
4. リトライ成功後にインジケータが消えることを確認

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                             |
| ---------------------------------- | ------ | -------- | ------------------------------------------------ |
| retryイベントのcontent形式が不明確 | 中     | 中       | SkillExecutorのretryメッセージ送信部分を事前確認 |
| 既存UIレイアウトの崩れ             | 低     | 中       | 条件付きレンダリングでリトライ中のみ表示         |
| 高速リトライ時のstate更新頻度      | 低     | 低       | React 18のautomatic batchingで問題なし           |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/renderer/hooks/useSkillExecution.ts` - 現在のhook実装
- `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` - 現在のUI実装
- `apps/desktop/src/main/services/skill/SkillExecutor.ts` - retryストリーミングメッセージの送信ロジック
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` - SkillStreamMessageType retryタイプ

### 参考資料

- React Hooks テストパターン: @testing-library/react-hooks
- Tailwind CSS アニメーション: animate-spin、animate-pulse

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
TASK-SKILL-RETRY-001 Phase 11 スコープ外発見事項:
Renderer側のuseSkillExecutionフックにはretryイベントハンドラがない。
リトライ発生中のUI表示（リトライ中インジケータ、試行回数表示等）が未実装。
```

### 補足事項

- retryメッセージのcontent形式はSkillExecutorのストリーミング送信部分を参照すること
- SkillStreamDisplayの既存デザインパターン（Tailwind CSS）に合わせて実装すること
- 本タスクはユーザー体験の改善が主目的であり、機能的な変更は最小限にすること
