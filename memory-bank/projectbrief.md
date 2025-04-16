# プロジェクトの概要
- BacklogAPI と接続するためのMCPサーバーを構築します
- Backlogとの接続はbacklog-jsを使用してください
- BacklogJSのインターフェースはこちらに公開されているので適宜確認してください。https://github.com/nulab/backlog-js/blob/master/src/backlog.ts
- URLlist.mdを参照の上APIのエンドポイントの詳細のURLから./src/tools/getProjectList.tsのようなコード生成して./src/tools/${endpointName}.tsに追加してください。${endpointName}は必ずキャメルケースにしてください。
  - server.toolの上には必ず作っているWebのURLを付与してください
  - handlerではBacklogjsのインターフェースから最適なものを選んでBacklogと接続してください
  - descriptionは英語で対象のURLの内容から取得してください