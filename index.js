const express = require('express')
const app = express()
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Server Is Running')
})

app.listen(port, () => {
  console.log(`QuickCash Server Running in Port ${port}`)
})