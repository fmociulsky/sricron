const parser = require("node-html-parser");
const puppeteer = require('puppeteer');
const dbUtils = require('./dbUtils');

function obtenerH2Promos(body){
    const root = parser.parse(body);
    const promos = root.querySelector("#flightBestpricesGrid");
    const row = promos.querySelector(".row");
    return row.querySelectorAll(".tc-img-destino");
}


function getGenRow(spans, fecha, isOneWay){
    const rowObj = {
        Fecha: fecha,
        Desde: spans[1].text.replace('\n','').replace('\n','').replace('Desde ', '').trim(),
        Hasta: spans[0].text.replace('\n','').replace('\n','').trim(),
        Precio: spans[2].text.replace('\n','').replace('\n','').replace('$','').replace('.','').trim(),
        IdaSola: isOneWay ? "SI" : "NO"
    }
    return rowObj;
}

function getMultiRow(spans, fecha){
    if(spans[0].text.includes("+")){
      titulo1 = spans[0].text.replace('\n','').replace('\n','').trim().split(" + ");
      titulo2 = spans[1].text.replace('\n','').replace('\n','').replace('Desde ', '').trim();
      const rowObj = {
        Fecha: fecha,
        IdaDesde: titulo2,
        IdaHasta: titulo1[0],
        VueltaDesde: titulo1[1],
        VueltaHasta: titulo2,
        Precio: spans[2].text.replace('\n','').replace('\n','').replace('$','').replace('.','').trim(),
        Multitramo: 'SI' 
      }
      return rowObj;
    }else{
      const desde = spans[0].text.replace('\n','').replace('\n','').trim().split(" - ");
      const hasta = spans[1].text.replace('\n','').replace('\n','').trim().split(" - ");
      const rowObj = {
          Fecha: fecha,
          IdaDesde: desde[0],
          IdaHasta: desde[1],
          VueltaDesde: hasta[0],
          VueltaHasta: hasta[1],
          Precio: spans[2].text.replace('\n','').replace('\n','').replace('$','').replace('.','').trim(),
          Multitramo: 'NO' 
      }
      return rowObj;
    }
}

async function getPromoGraph(urlPromo, row, isMulti) {
    try {
      const parser = require("node-html-parser");
      const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      console.log(urlPromo);
      await page.goto(urlPromo, { waitUntil: 'networkidle0' });
      const priceBarChart = await page.evaluate(() => document.querySelector('#priceBarChart').outerHTML);
      const tabla = await page.evaluate(() => document.querySelector('.tc-price-table').outerHTML);
      const ps = parser.parse(priceBarChart).querySelectorAll("p");
      const spans = parser.parse(priceBarChart).querySelectorAll("span");
      const tablaDetalle = parser.parse(tabla).querySelectorAll("tr");
      guardarDetalles(ps, spans, row, isMulti);
      guardarDetallesTabla(tablaDetalle, row, isMulti);
    } catch (err) {
      console.error(err);
    }
  }

  async function parsearPromos(rows){
    let i = 1;

    rows.forEach(async row => {
      const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      const parserHtml = require('./parserHtml');
      const urlPromo = process.env.URL + row.a.rawAttrs.replace('href="','').replace('"','')
      console.log(i + " - " + urlPromo);
      //getPromoGraph(browser, page, urlPromo, row.rowObj, false, row.rowObj.isOneWay == 'SI', i);
      i++;
    });
  }

  function guardarDetallesTabla(trs, row, isMulti){
    const rowsTablaDetalleGen = [];
    const rowsTablaDetalleMulti = [];
    if(isMulti){
      debugger
      for (let r = 1; r < trs.length-1; r++) {
        const tr = trs[r];
        const tds = tr.querySelectorAll("td");
        const multiTramo = tds.length > 7;
        const tramo1 = tds[0].innerHTML.replace("<br>"," ").replace("/n"," ").replace("/n"," ").trim();
        const fecha1 = tds[1].text.trim();
        const tramo2 = tds[2].innerHTML.replace("<br>"," ").replace("/n"," ").replace("/n"," ").trim();
        const fecha2 = tds[3].text.trim();
        const tramo3 = multiTramo? tds[4].innerHTML.replace("<br>"," ").replace("/n"," ").replace("/n"," ").trim() : "";
        const fecha3 = multiTramo? tds[5].text.trim() : "";
        const duracion = multiTramo? tds[6].text.trim() : tds[4].text.trim();
        const escalas = multiTramo? tds[7].text.trim() : tds[5].text.trim();
        const precio = multiTramo? tds[8].text.trim().replace("$ ", "") : tds[6].text.trim().replace("$ ", "");
        const rowTablaDetalleMulti = {fecha : row.Fecha, tramo1, fecha1, tramo2, fecha2, tramo3, fecha3, duracion, escalas, precio}
        rowsTablaDetalleMulti.push(rowTablaDetalleMulti);
      }
    }else{
      for (let r = 1; r < trs.length; r++) {
        const tr = trs[r];
        const tds = tr.querySelectorAll("td");
        const ida = tds[0].text.trim();
        const vuelta = row.IdaSola == "NO" ? tds[1].text.trim() : "";
        const estadia = row.IdaSola == "NO" ? tds[2].text.trim(): "";
        const duracion = row.IdaSola == "NO" ? tds[3].text.trim() : tds[1].text.trim();
        const escalas = row.IdaSola == "NO" ? tds[4].text.trim() : tds[2].text.trim();
        const aerolinea = row.IdaSola == "NO" ? tds[5].innerHTML.split(" ")[2].replace('alt="', "").replace('"',"") : tds[3].innerHTML.split(" ")[2].replace('alt="', "").replace('"',"");
        const precio = row.IdaSola == "NO" ? tds[6].text.trim().replace("$ ", "") : tds[4].text.trim().replace("$ ", "");
        const rowTablaDetalleGen = {fecha : row.Fecha, desde: row.Desde, hasta: row.Hasta, ida, vuelta, estadia, duracion, escalas, aerolinea, precio, idaSola: row.IdaSola}
        rowsTablaDetalleGen.push(rowTablaDetalleGen);
      }
    }
    if(rowsTablaDetalleGen.length > 0) { dbUtils.guardarTablaGen(rowsTablaDetalleGen)}
    if(rowsTablaDetalleMulti.length > 0) {dbUtils.guardarTablaMulti(rowsTablaDetalleMulti)}     
  }

  function guardarDetalles(ps, spans, row, isMulti){
    const rowsGen = [];
    const rowsMulti = [];

    for (let i = 0; i < ps.length; i++) {
      const precio = ps[i].text.replace('Desde $ ','').replace('.','');
      const mes = spans[i].getAttribute("title");
      const rowAux = {}
      rowAux.Mes = mes;
      rowAux.Precio = precio;
      
      if(isMulti){
        const rowAux = {
            Fecha: row.Fecha,
            IdaDesde: row.IdaDesde,
            IdaHasta: row.IdaHasta,
            VueltaDesde: row.VueltaDesde,
            VueltaHasta: row.VueltaHasta,
            Precio: precio,
            Mes: mes
        }
        rowsMulti.push(rowAux);
      }else{
        const rowAux = {
            Fecha: row.Fecha,
            Desde: row.Desde,
            Hasta: row.Hasta,
            IdaSola: row.IdaSola,
            Precio: precio,
            Mes: mes
        }
        rowsGen.push(rowAux);
      }
    }
    dbUtils.guardarDetalleGenRow(rowsGen);
    dbUtils.guardarDetalleMultiRow(rowsMulti);
  }

module.exports = {obtenerH2Promos, getGenRow, getMultiRow, getPromoGraph, parsearPromos}