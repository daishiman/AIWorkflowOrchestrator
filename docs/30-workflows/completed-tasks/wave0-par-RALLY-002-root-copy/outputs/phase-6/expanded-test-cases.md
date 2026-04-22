# Expanded Test Cases

- EC-1: restore と snapshot が同時に非 null
- EC-2: snapshot requestId が変化しない
- EC-3: 復元後に再マウントした場合の再初期化
- EC-6: undo 復元中の再送信は restored requestId を送る
- EC-7: 再送信成功後も新 snapshot 到着まで restored UI を維持する
