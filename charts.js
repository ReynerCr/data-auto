import { dbNodemcu } from "/index.js"
import { ref, onValue, query, limitToLast, get } from "firebase/database";

// Cargando Google Charts para el idioma español
google.charts.load('current', { 'packages': ['corechart', 'gauge'], 'language': 'es' });
google.charts.setOnLoadCallback(drawGauges);

/* Funcion para los gauges */
function drawGauges() {
  let data = google.visualization.arrayToDataTable([
    ['Label', 'Value'],
    ['Therm 1', 0],
    ['Therm 2', 0],
    ['Therm 3', 0]
  ]);

  const options = {
    width: 500, min: -20, max: 50,
    greenFrom: -20, greenTo: -10,
    yellowFrom: -10, yellowTo: 0,
    redFrom: 0, redTo: 50,
    majorTicks: ['-15', '-10', '-5', '0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50'],
    minorTicks: 10,
  };

  const formatter = new google.visualization.NumberFormat({
    suffix: ' °C',
    fractionDigits: 2
  });
  formatter.format(data, 1);

  const chart = new google.visualization.Gauge(document.getElementById('chart_div'));
  chart.draw(data, options);

  const q1 = query(ref(dbNodemcu, 'Refrigerador/TThe1'), limitToLast(1));
  onValue(q1, (snapshot) => {
    let value = snapshot.val();
    if (value) {
      data.setValue(0, 1, Object.values(value)[0]);
      formatter.format(data, 1);
      chart.draw(data, options);
    }
  });

  const q2 = query(ref(dbNodemcu, 'Refrigerador/TThe2'), limitToLast(1));
  onValue(q2, (snapshot) => {
    let value = snapshot.val();
    if (value) {
      data.setValue(1, 1, Object.values(value)[0]);
      formatter.format(data, 1);
      chart.draw(data, options);
    }
  });

  const q3 = query(ref(dbNodemcu, 'Refrigerador/TThe3'), limitToLast(1));
  onValue(q3, (snapshot) => {
    let value = snapshot.val();
    if (value) {
      data.setValue(2, 1, Object.values(value)[0]);
      formatter.format(data, 1);
      chart.draw(data, options);
    }
  });
}

/* Cargando eventos para botones */
document.getElementById("btnTherm1").onclick = function () {
  google.charts.setOnLoadCallback(drawLineChart('therm', 1));
}
document.getElementById("btnTherm2").onclick = function () {
  google.charts.setOnLoadCallback(drawLineChart('therm', 2));
}
document.getElementById("btnTherm3").onclick = function () {
  google.charts.setOnLoadCallback(drawLineChart('therm', 3));
}
document.getElementById("btnTherm4").onclick = function () {
  google.charts.setOnLoadCallback(drawLineChart('therm', 4));
}

/* Funcion para el grafico de lineas */
function drawLineChart(name, tNumber) {
  let dataTable = new google.visualization.DataTable();

  dataTable.addColumn('datetime', 'Time');
  dataTable.addColumn('number', 'Temperatura');

  let options = {
    title: 'Tiempo vs temperatura del thermistor ' + tNumber,
    curveType: 'function',
    pointSize: 30,
    width: 300,
    legend: { position: 'bottom' },

    hAxis: {
      title: "Tiempo", format: 'HH:mm'
    },
    vAxis: {
      title: "Tempertura (°C)", viewWindowMode: 'explicit', viewWindow: {
        max: 50,
        min: -20
      }
    },
  };

  var formatDate = new google.visualization.DateFormat(
    { prefix: 'Time: ', pattern: "dd MMM HH:mm" });

  formatDate.format(dataTable, 0);

  let chart = new google.visualization.LineChart(document.getElementById(name + tNumber));

  let qTempLast = query(ref(dbNodemcu, 'Refrigerador/TThe' + tNumber), limitToLast(1));

  // TODO pilas aqui porque esto quizas se puede mejorar???
  let qTempLast100 = query(ref(dbNodemcu, 'Refrigerador/TThe' + tNumber), limitToLast(100));

  let data = [];

  onValue(qTempLast, (snapshot) => {
    if (snapshot.exists()) {
      const tempValue = snapshot.val();

      let pYear = new Promise((resolve, reject) => {
        resolve(getTimestampFraction('ano'));
      });
      let pMonth = new Promise((resolve, reject) => {
        resolve(getTimestampFraction('mes'));
      });
      let pDay = new Promise((resolve, reject) => {
        resolve(getTimestampFraction('dia'));
      });
      let pHour = new Promise((resolve, reject) => {
        resolve(getTimestampFraction('hora'));
      });
      let pMinutes = new Promise((resolve, reject) => {
        resolve(getTimestampFraction('minutos'));
      });
      
      Promise.all([pYear, pMonth, pDay, pHour, pMinutes]).
        then((values) => {
          const date = new Date(values[0], values[1], values[2], values[3], values[4], 0, 0);

          data.push(date);
        }); /* Promise.all */
    } /* if snapshot.exists() */

    /* setInterval(function () {
        dataTableTime = new google.visualization.DataTable();
        dataTableTime.addColumn('datetime', 'Time');
        dataTableTime.addColumn('number', 'Temperatura');
        for (index = 0; index < qtyDatos; index++) {
          dataTableTime.addRow(
            [new Date(año[index], mes[index] - 1, dia[index], hora[index], minutos[index], 0, 0), temp[index]]);
        }
        chartTime.draw(dataTableTime, optionsChartTime);
        }, 1300); */

  }); /* onValue */
}

/* Tomando fragmento del timestamp, de la base de datos */
async function getTimestampFraction(name, nQueries = 1) {
  let value = 0;

  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  let qMinutes = query(ref(dbNodemcu, 'Refrigerador/' + capitalizedName), limitToLast(nQueries));

  await get(qMinutes).then((snap) => {
    if (snap.exists()) {
      value = Object.values(snap.val())[0];
    } else {
      console.log("No hay " + name);
    }
  }).catch((error) => {
    console.error(error);
  });

  return value;
}