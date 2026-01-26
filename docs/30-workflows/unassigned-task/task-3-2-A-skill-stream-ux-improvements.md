# SkillStreamDisplay UX改善 - タスク指示書

## メタ情報

```yaml
issue_number: 520
```

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-3-2-A                                     |
| タスク名     | SkillStreamDisplay UX改善                      |
| 分類         | 改善                                           |
| 対象機能     | SkillStreamDisplay UIコンポーネント            |
| 優先度       | 低                                             |
| 見積もり規模 | 小規模                                         |
| ステータス   | 未実施                                         |
| 発見元       | Phase 12（TASK-3-2 ドキュメント更新）          |
| 発見日       | 2026-01-25                                     |
| 親タスク     | TASK-3-2 SkillExecutor IPC Handler Integration |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-3-2でSkillExecutor IPC Handler統合を完了し、SkillStreamDisplayコンポーネントを実装した。Phase 11の手動テスト検証において、全テストがPASSし重大な問題は発見されなかったが、UX向上のための改善提案が3点挙げられた。

### 1.2 問題点・課題

| ID  | 課題                           | 現状                                 |
| --- | ------------------------------ | ------------------------------------ |
| R1  | 視覚的ローディング表示が簡素   | テキストベースのみのローディング表示 |
| R2  | メッセージタイムスタンプ非表示 | 実行タイムラインの追跡が困難         |
| R3  | クリップボードコピー機能なし   | デバッグ時のメッセージ共有が手動     |

### 1.3 放置した場合の影響

- **R1**: 長時間実行時にユーザーが処理中かどうか判断しにくい
- **R2**: 問題発生時の時系列分析が困難
- **R3**: デバッグ情報の共有効率が低下

**注意**: これらは重大な機能欠落ではなく、UX向上のための任意改善項目である。

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillStreamDisplayコンポーネントのユーザー体験を向上させ、スキル実行の可視性とデバッグ効率を改善する。

### 2.2 最終ゴール

| 改善項目                   | 達成状態                                         |
| -------------------------- | ------------------------------------------------ |
| ローディングアニメーション | スピナーまたはプログレスバーが表示される         |
| タイムスタンプ表示         | 各メッセージに相対時刻または絶対時刻が表示される |
| クリップボードコピー       | ワンクリックでメッセージをコピーできる           |

### 2.3 スコープ

#### 含むもの

- SkillStreamDisplayコンポーネントのUI改善
- 関連するユニットテストの追加
- アクセシビリティ対応（WCAG 2.1 AA準拠）

#### 含まないもの

- バックエンド（Main Process）の変更
- IPC通信プロトコルの変更
- 他のコンポーネントへの影響

### 2.4 成果物

| 成果物                 | パス                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| 改善済みコンポーネント | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`                              |
| 追加テスト             | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`               |
| 実装ガイド更新         | `docs/30-workflows/TASK-3-2-A-skill-stream-ux-improvements/outputs/phase-12/implementation-guide.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-3-2が完了していること
- SkillStreamDisplayコンポーネントが正常に動作していること
- 138テストが全てPASSしていること

### 3.2 依存タスク

| タスクID | タスク名                              | ステータス |
| -------- | ------------------------------------- | ---------- |
| TASK-3-2 | SkillExecutor IPC Handler Integration | 完了       |

### 3.3 必要な知識

| 技術領域     | 必要な知識                             |
| ------------ | -------------------------------------- |
| React        | useState/useEffect、コンポーネント設計 |
| TypeScript   | 型定義、インターフェース               |
| CSS/Tailwind | アニメーション、レスポンシブデザイン   |
| Testing      | Vitest、React Testing Library          |
| A11y         | aria属性、キーボードナビゲーション     |

### 3.4 推奨アプローチ

1. **R1 ローディングアニメーション**
   - `isExecuting` 状態時にスピナーコンポーネントを表示
   - Tailwind CSSの `animate-spin` を使用

2. **R2 タイムスタンプ表示**
   - `SkillStreamChunk.timestamp` を活用
   - 相対時刻（例: "2秒前"）形式で表示
   - オプションで絶対時刻表示切り替え

3. **R3 クリップボードコピー**
   - `navigator.clipboard.writeText()` APIを使用
   - コピー成功時のフィードバック表示
   - キーボードショートカット対応（Ctrl+C）

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 概要                     |
| ----- | ---------------- | ------------------------ |
| 1     | 要件定義         | 詳細仕様の確定           |
| 2     | 設計             | UI/UXデザイン            |
| 4     | テスト作成       | 追加テストケース作成     |
| 5     | 実装             | コンポーネント改善       |
| 7     | カバレッジ確認   | テストカバレッジ維持確認 |
| 11    | 手動テスト       | UX確認                   |
| 12    | ドキュメント更新 | 実装ガイド更新           |

### Phase 5: 実装

#### 目的

3つのUX改善を実装する。

#### 手順

1. **R1: ローディングアニメーション追加**

   ```tsx
   // SkillStreamDisplay.tsx
   {
     isExecuting && (
       <div className="flex items-center gap-2">
         <span className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent" />
         <span>実行中...</span>
       </div>
     );
   }
   ```

2. **R2: タイムスタンプ表示追加**

   ```tsx
   // utils/formatTime.ts
   export function formatRelativeTime(timestamp: number): string {
     const seconds = Math.floor((Date.now() - timestamp) / 1000);
     if (seconds < 60) return `${seconds}秒前`;
     // ...
   }
   ```

3. **R3: クリップボードコピー追加**
   ```tsx
   const handleCopy = async (text: string) => {
     await navigator.clipboard.writeText(text);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
   };
   ```

#### 成果物

- 改善済みSkillStreamDisplay.tsx
- formatTime.ts ユーティリティ

#### 完了条件

- [ ] ローディングアニメーションが表示される
- [ ] 各メッセージにタイムスタンプが表示される
- [ ] コピーボタンクリックでクリップボードにコピーされる
- [ ] 既存テストが全てPASSする

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] R1: 実行中にスピナーアニメーションが表示される
- [ ] R2: メッセージに相対時刻が表示される
- [ ] R3: コピーボタンクリックでメッセージがコピーされる
- [ ] R3: コピー成功時にフィードバックが表示される

### 品質要件

- [ ] 既存テスト138件が全てPASS
- [ ] 追加テストがPASS
- [ ] カバレッジが100%を維持
- [ ] TypeScript型エラーなし
- [ ] ESLintエラーなし

### アクセシビリティ要件

- [ ] スピナーに適切なaria-label
- [ ] コピーボタンにaria-label
- [ ] キーボードでコピー操作可能
- [ ] スクリーンリーダーでコピー成功を通知

### ドキュメント要件

- [ ] 実装ガイドが更新されている
- [ ] システム仕様書（ui-ux-components.md）が更新されている

---

## 6. 検証方法

### テストケース

| TC-ID  | テスト内容                             | 期待結果                         |
| ------ | -------------------------------------- | -------------------------------- |
| TC-301 | 実行中にスピナーが表示される           | スピナーが回転表示される         |
| TC-302 | 実行完了時にスピナーが非表示になる     | スピナーが消える                 |
| TC-303 | メッセージにタイムスタンプが表示される | "X秒前"形式で表示                |
| TC-304 | コピーボタンクリックでコピーされる     | クリップボードにテキストがコピー |
| TC-305 | コピー成功時にフィードバック表示       | "コピーしました"表示             |

### 検証手順

1. 開発サーバーを起動: `pnpm --filter @repo/desktop dev`
2. スキル実行を開始
3. 各改善項目の動作を確認
4. アクセシビリティを確認（VoiceOver/NVDA）

---

## 7. リスクと対策

| リスク                          | 影響度 | 発生確率 | 対策                           |
| ------------------------------- | ------ | -------- | ------------------------------ |
| クリップボードAPI非対応ブラウザ | 低     | 低       | フォールバック実装（手動選択） |
| パフォーマンス低下              | 低     | 低       | useMemo/useCallbackで最適化    |
| 既存テスト破壊                  | 中     | 低       | 変更前に全テスト実行           |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                | パス                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| TASK-3-2実装ガイド          | `docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/outputs/phase-12/implementation-guide.md` |
| TASK-3-2手動テスト結果      | `docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/outputs/phase-11/manual-test-result.md`   |
| UI/UXコンポーネント仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                             |
| インターフェース仕様（SDK） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`                         |

### 参考資料

| 資料名                 | URL/パス                                                   |
| ---------------------- | ---------------------------------------------------------- |
| Clipboard API          | https://developer.mozilla.org/en-US/docs/Web/API/Clipboard |
| Tailwind CSS Animation | https://tailwindcss.com/docs/animation                     |
| WCAG 2.1 AA            | https://www.w3.org/WAI/WCAG21/quickref/                    |

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
TASK-3-2 Phase 12 Unassigned Task Detection Report - Future Improvement Suggestions:

| ID  | Suggestion                         | Priority | Rationale                                 |
| --- | ---------------------------------- | -------- | ----------------------------------------- |
| R1  | Add visual loading animation       | Low      | Enhanced UX during long executions        |
| R2  | Add message timestamp display      | Low      | Better traceability of execution timeline |
| R3  | Add copy-to-clipboard for messages | Low      | Convenience feature for debugging         |

Note: These suggestions are not blocking issues and do not require immediate action.
```

### 補足事項

- この改善は任意タスクであり、他の優先タスクがある場合は後回しにしてよい
- 各改善項目は独立しているため、部分的な実装も可能
- 将来的にSkillStreamDisplayを他の画面で再利用する際に有用
