# リスク評価表

## リスク評価結果

| リスク                                                       | レベル | 対処方針                                             | 対処状況               |
| ------------------------------------------------------------ | ------ | ---------------------------------------------------- | ---------------------- |
| useEffectの依存配列が不完全でlint警告が出る                  | 中     | requestIdのみを依存配列に入れ、意図をコメントで補足  | 対処済み（設計済み）   |
| クリア条件が早すぎてundo中にrestoredPendingRequestが失われる | 中     | awaitingUserInputのrequestIdが変化した時のみクリア   | 対処済み（実装済み）   |
| コメントが後続変更（RALLY-010〜013）で矛盾を起こす           | 低     | コメントは優先ルールのみに限定し、実装詳細は含めない | 設計方針として確認済み |

## リスク詳細

### リスク1: exhaustive-deps lint警告

**発生確率**: 低  
**根拠**: `workflowSnapshot?.awaitingUserInput?.requestId` のような深いアクセスパスは `react-hooks/exhaustive-deps` の警告対象外になることが多い。Phase 5のlint実行で最終確認する。

**万一警告が出た場合の対処**:

```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [workflowSnapshot?.awaitingUserInput?.requestId]);
```

上記コメントを追加するが、その際に「なぜ exhaustive-deps を満たさない意図的な設計か」を説明するコメントも必須。

### リスク2: クリア条件の早期発動

**発生確率**: 低  
**根拠**: useEffectの依存配列が `requestId` なので、同じ requestId の awaitingUserInput 参照更新では再実行されない。新しい requestId の質問が届いた時のみクリアされる。

### リスク3: コメントの陳腐化

**発生確率**: 低  
**対処**: コメントに実装詳細（行番号等）を含めないことで、後続RALLY変更後も矛盾しにくい内容に留める。

## 総合リスク評価

**LOW** — 主要リスクは全て対処済みまたは低確率。Phase 4に進んで問題ない。
