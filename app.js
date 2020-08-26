const cron = require("node-cron");
const express = require("express");
const request = require("request");
const format = require('date-format');
const {promisify} = require('util');
const parser = require("node-html-parser");
const parserHtml = require('./parserHtml');
const dbUtils = require('./dbUtils');
require('events').EventEmitter.defaultMaxListeners = 25
require('dotenv').config();
app = express();

parsearMainPageHTML();
//parsearHTML();
//cron.schedule('*/5 * * * * ', parsearMainPageHTML);

function parsearMainPageHTML() {
    const url = process.env.URL;
    console.log("Buscando en la url: " + url);
    request({uri: url}, 
        function(error, response, body) {
            const rowsGen = [];
            const rowsMulti = [];
            const dt = new Date();
            dt.setHours( dt.getHours() - 3);
            const fecha = format("dd-MM-yyyy hh:mm:ss",dt);
            const h2s = parserHtml.obtenerH2Promos(body);
            console.log(fecha+ " - Se encontraron " + h2s.length + " ofertas");
            if(h2s.length > 0){
              for (let index = 0; index < h2s.length; index++){
                const h2 = h2s[index];
                const a = h2.querySelector('a');
                const isMulti = a.firstChild.rawText != ' ';
                const isOneWay = a.rawAttrs.includes('oneway');
                const spans = h2.querySelectorAll("span");
                if(spans.length > 0){
                  if(isMulti && !isOneWay){
                    const rowObj = parserHtml.getMultiRow(spans, dt);
                    rowsMulti.push({a, rowObj});
                  }else{
                    const rowObj = parserHtml.getGenRow(spans, dt, isOneWay);
                    rowsGen.push({a, rowObj});
                  }
                } 
              }
              dbUtils.guardarGenRows(rowsGen);
              dbUtils.guardarMultiRows(rowsMulti);
              for (let i = 0; i < rowsGen.length; i++) {
                const row = rowsGen[i];
                const urlPromo = process.env.URL + row.a.rawAttrs.replace('href="','').replace('"','')
                parserHtml.getPromoGraph(urlPromo, row.rowObj, false);
              }
              for (let i = 0; i < rowsMulti.length; i++) {
                const row = rowsMulti[i];
                const urlPromo = process.env.URL + row.a.rawAttrs.replace('href="','').replace('"','')
                parserHtml.getPromoGraph(urlPromo, row.rowObj, true);
              }
            }     
    });
}

const port = process.env.PORT || 5000
app.listen(port, () =>  {
    console.log('Servidor escuchando en el puerto ' + port)
});




