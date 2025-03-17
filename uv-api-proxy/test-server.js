const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('测试服务器正在运行');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器已在端口 ${PORT} 上启动`);
});