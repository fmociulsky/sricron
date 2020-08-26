const mysql = require('mysql');

async function guardarGenRows(rows){
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    Host     : "localhost",
    user     : "root",
    password : "root",
    database : "sricron",
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
  });

  connection.connect();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].rowObj;
    const query = "SELECT * from promosGen where desde = '" + row.Desde + "' AND hasta = '" + row.Hasta + "' AND IdaSola = '" + row.IdaSola + "'";
    connection.query(query, function (error, results, fields) {
      if (error) throw error;
      if(results.length == 0){
        var query = connection.query('INSERT INTO promosGen SET ?', rows[i].rowObj, function (error, results, fields) {
          if (error) throw error;
          console.log(i + " - Inserto promo Gen");
        });
      }else{
        const query = "UPDATE promosGen SET ? where desde = '" + row.Desde + "' AND hasta = '" + row.Hasta + "' AND IdaSola = '" + row.IdaSola + "'";
        connection.query(query, row, function (error, results, fields) {
          if (error) throw error;
          console.log(i + " - Actualiza promo Gen");
        });
      }
    });
  }
}

async function guardarMultiRows(rows){
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    Host     : "localhost",
    user     : "root",
    password : "root",
    database : "sricron",
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
  });

  connection.connect();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].rowObj;
    const query = "SELECT * from promosMulti where IdaDesde = '" + row.IdaDesde + "' AND IdaHasta = '" + row.IdaHasta
    + "' AND VueltaDesde = '" + row.VueltaDesde
    + "' AND VueltaHasta = '" + row.VueltaHasta + "'";
    connection.query(query, function (error, results, fields) {
      if (error) throw error;
      if(results.length == 0){
        connection.query('INSERT INTO promosMulti SET ?', rows[i].rowObj, function (error, results, fields) {
          if (error) throw error;
          console.log(i + " - Inserto promo Multi");
        });
      }else{
        const updateQuery = "UPDATE promosMulti SET ? where IdaDesde = '" + row.IdaDesde + "' AND IdaHasta = '" + row.IdaHasta
        + "' AND VueltaDesde = '" + row.VueltaDesde
        + "' AND VueltaHasta = '" + row.VueltaHasta + "'";

        connection.query(updateQuery, row, function (error, results, fields) {
          if (error) throw error;
          console.log(i + " - Actualiza promo Multi");
        });
      }
    });
  }
}

async function guardarDetalleMultiRow(rowMulti){
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    Host     : "localhost",
    user     : "root",
    password : "root",
    database : "sricron",
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
  });

  connection.connect();
  for (let i = 0; i < rowMulti.length; i++) {
    const row = rowMulti[i];
    const query = "SELECT * from detalleMulti where IdaDesde = '" + row.IdaDesde + "' AND IdaHasta = '" + row.IdaHasta
    + "' AND VueltaDesde = '" + row.VueltaDesde
    + "' AND VueltaHasta = '" + row.VueltaHasta 
    + "' AND Mes = '" + row.Mes+ "'";
    connection.query(query, function (error, results, fields) {
      if (error) throw error;
      if(results.length == 0){
        var query = connection.query('INSERT INTO detalleMulti SET ?', row, function (error, results, fields) {
          if (error) throw error;
          console.log(i + " - Inserto promo Detalle Gen - Vuelo: " + row.IdaDesde + " - " 
          + row.IdaHasta + " - "
          + row.VueltaDesde + " - "
          + row.VueltaHasta + " - " + row.Mes +": $" +row.Precio);
        });
      }else{
        const updateQuery = "UPDATE detalleMulti SET ? where IdaDesde = '" + row.IdaDesde + "' AND IdaHasta = '" + row.IdaHasta
        + "' AND VueltaDesde = '" + row.VueltaDesde
        + "' AND VueltaHasta = '" + row.VueltaHasta 
        + "' AND Mes = '" + row.Mes+ "'";

        connection.query(updateQuery, row, function (error, results, fields) {
          if (error) throw error;
          console.log(i + " - Actualizo promo Detalle Multi - Vuelo: " + row.IdaDesde + " - " 
          + row.IdaHasta + " - "
          + row.VueltaDesde + " - "
          + row.VueltaHasta + " - " + row.Mes +": $" +row.Precio);
        });
      }
    });
  }
}

async function guardarDetalleGenRow(rowsGen){
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    Host     : "localhost",
    user     : "root",
    password : "root",
    database : "sricron",
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
  });

  connection.connect();
  for (let i = 0; i < rowsGen.length; i++) {
    const row = rowsGen[i];
    const query = "SELECT * from detalleGen where desde = '" + row.Desde + "' AND hasta = '" + row.Hasta + "' AND IdaSola = '" + row.IdaSola + "'";
    connection.query(query, function (error, results, fields) {
      if (error) throw error;
      if(results.length == 0){
        var query = connection.query('INSERT INTO detalleGen SET ?', row, function (error, results, fields) {
          if (error) throw error;
          console.log(i + " - Inserto promo Detalle Gen - Vuelo: " + row.Desde + " - " + row.Hasta + " - " + row.Mes +": $" + row.Precio);
        });
      }else{
        const query = "UPDATE detalleGen SET ? where desde = '" + row.Desde 
        + "' AND hasta = '" + row.Hasta 
        + "' AND IdaSola = '" + row.IdaSola  
        + "' AND Mes = '" + row.Mes+ "'";
        connection.query(query, row, function (error, results, fields) {
          if (error) throw error;
          console.log(i + " - Actualiza promo Detalle Gen - Vuelo: " + row.Desde + " - " + row.Hasta + " - " + row.Mes +": $" + row.Precio);
        });
      }
    });
  }
}

async function guardarTablaGen(rowsTablaDetalleGen){
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    Host     : "localhost",
    user     : "root",
    password : "root",
    database : "sricron",
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
  });

  connection.connect();
  for (let i = 0; i < rowsTablaDetalleGen.length; i++) {
    const row = rowsTablaDetalleGen[i];
    const query = "SELECT * from tablaGen where desde = '" + row.desde + "' AND hasta = '" + row.hasta 
    + "' AND ida = '" + row.ida
    + "' AND vuelta = '" + row.vuelta
    + "' AND aerolinea = '" + row.aerolinea 
    + "' AND idaSola = '" + row.idaSola + "'";
    connection.query(query, function (error, results, fields) {
      if (error) throw error;
      if(results.length == 0){
        var query = connection.query('INSERT INTO tablaGen SET ?', row, function (error, results, fields) {
          if (error) throw error;
          console.log(i + " - Inserto tabla Gen - Vuelo: " + row.desde + " - " + row.hasta +": $" + row.precio);
        });
      }else{
        const query = "UPDATE tablaGen SET ? where desde = '" + row.desde + "' AND hasta = '" + row.hasta 
        + "' AND ida = '" + row.ida
        + "' AND vuelta = '" + row.vuelta
        + "' AND aerolinea = '" + row.aerolinea
        + "' AND idaSola = '" + row.idaSola + "'";
        connection.query(query, row, function (error, results, fields) {
          if (error) throw error;
          console.log(i + " - Actualiza tabla Gen - Vuelo: " + row.desde + " - " + row.hasta + ": " + row.precio);
        });
      }
    });
  }
}

  async function guardarTablaMulti(rowsTablaDetalleMulti){
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      Host     : "localhost",
      user     : "root",
      password : "root",
      database : "sricron",
      socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
    });
  
    connection.connect();
    debugger
    for (let i = 0; i < rowsTablaDetalleMulti.length; i++) {
      const row = rowsTablaDetalleMulti[i];
      const query = "SELECT * from tablaMulti where tramo1 = '" + row.tramo1 + "' AND fecha1 = '" + row.hasta 
      + "' AND tramo2 = '" + row.tramo2
      + "' AND fecha2 = '" + row.fecha1
      + "' AND tramo3 = '" + row.tramo3 
      + "' AND fecha3 = '" + row.fecha3 + "'";
      debugger
      connection.query(query, function (error, results, fields) {
        if (error) throw error;
        if(results.length == 0){
          var query = connection.query('INSERT INTO tablaMulti SET ?', row, function (error, results, fields) {
            if (error) throw error;
            console.log(i + " - Inserto tabla Multi - Vuelo: " + row.desde + " - " + row.hasta +": $" + row.precio);
          });
        }else{
          const query = "UPDATE from tablaMulti SET ? where tramo1 = '" + row.tramo1 + "' AND fecha1 = '" + row.hasta 
          + "' AND tramo2 = '" + row.tramo2
          + "' AND fecha2 = '" + row.fecha1
          + "' AND tramo3 = '" + row.tramo3 
          + "' AND fecha3 = '" + row.fecha3 + "'";
          connection.query(query, row, function (error, results, fields) {
            if (error) throw error;
            console.log(i + " - Actualiza tabla Multi - Vuelo: " + row.desde + " - " + row.hasta + ": " + row.precio);
          });
        }
      });
    }
}

module.exports = {guardarGenRows, guardarMultiRows, guardarDetalleGenRow, guardarDetalleMultiRow, guardarTablaGen, guardarTablaMulti}