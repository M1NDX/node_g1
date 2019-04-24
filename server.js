'use strict'
const http = require('http');
const chalk = require('chalk');
const fs = require('fs');
const log = console.log;

const hostname = '127.0.0.1';
const port = 3000;

let alumnos = JSON.parse( fs.readFileSync('alumnos.json'));
log(alumnos);

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  console.log('Solicitud de '+chalk.green.bold.inverse('datos'));
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
//   res.write('<h1> Mi primer servidor</h1>')
  res.end(JSON.stringify(alumnos));
})
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
})
