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

function btnThermClick(btnNumber) {
  btnTherm1.disabled = (btnNumber == 1) ? true : false;
  btnTherm2.disabled = (btnNumber == 2) ? true : false;
  btnTherm3.disabled = (btnNumber == 3) ? true : false;

  google.charts.setOnLoadCallback(drawLineChart('therm', btnNumber));
}

/* Cargando eventos para botones */
const btnTherm1 = document.getElementById("btnTherm1");
btnTherm1.onclick = function () { btnThermClick(1); }

const btnTherm2 = document.getElementById("btnTherm2");
btnTherm2.onclick = function () { btnThermClick(2); }

const btnTherm3 = document.getElementById("btnTherm3");
btnTherm3.onclick = function () { btnThermClick(3); }

/* Almacena la funcion unsubscribe que arroja el observador onValue */
let unsubscribeGraph;

/* Funcion para el grafico de lineas */
async function drawLineChart(name, tNumber) {
  let chart = new google.visualization.LineChart(document.getElementById("therm"));

  let dataTable = new google.visualization.DataTable();
  dataTable.addColumn('datetime', 'Time');
  dataTable.addColumn('number', 'Temperatura');

  let options = {
    title: 'Tiempo vs temperatura del thermistor ' + tNumber,
    curveType: 'function',
    pointSize: 4,
    height: 350,
    width: 640,
    legend: { position: 'none' },
    hAxis: {
      title: "Tiempo", format: 'HH:mm'
    },
    vAxis: {
      title: "Tempertura (°C)", viewWindowMode: 'explicit', viewWindow: {
        max: 50,
        min: -50
      }
    },
  };

  /* Tomando las 100 ultimas temperaturas con fecha utilizando get y graficando */
  let pTemp = promiseGetFromDB('TThe' + tNumber, 100);
  let pYear = promiseGetFromDB("ano", 100);
  let pMonth = promiseGetFromDB("mes", 100);
  let pDay = promiseGetFromDB("dia", 100);
  let pHour = promiseGetFromDB("hora", 100);
  let pMinutes = promiseGetFromDB("minutos", 100);
  await Promise.all([pYear, pMonth, pDay, pHour, pMinutes, pTemp]).
    then((values) => {
      const years = values[0];
      const months = values[1];
      const days = values[2];
      const hours = values[3];
      const minutes = values[4];
      const temps = values[5];
      for (let i = 0; i < 100; i++) {
        const date = new Date(years[i], months[i], days[i], hours[i], minutes[i], 0, 0);
        dataTable.addRow([date, temps[i]]);
      }
      chart.draw(dataTable, options);
    });

  /* Anyadiendo observer a la ultima temperatura para graficarla por cada nuevo valor  */
  if (unsubscribeGraph) { // Eliminando observers onValue anteriores
    await unsubscribeGraph();
  }
  const qTempLast = query(ref(dbNodemcu, 'Refrigerador/TThe' + tNumber), limitToLast(1));
  unsubscribeGraph = onValue(qTempLast, (snapshot) => {
    if (snapshot.exists()) {
      const tempValue = Object.values(snapshot.val())[0];

      // Tomando la ultima fecha con get
      pYear = promiseGetFromDB("ano", 1);
      pMonth = promiseGetFromDB("mes", 1);
      pDay = promiseGetFromDB("dia", 1);
      pHour = promiseGetFromDB("hora", 1);
      pMinutes = promiseGetFromDB("minutos", 1);
      Promise.all([pYear, pMonth, pDay, pHour, pMinutes]).
        then((values) => {
          const date = new Date(values[0], values[1], values[2], values[3], values[4], 0, 0);
          dataTable.addRow([date, tempValue]);
          chart.draw(dataTable, options);
        });
    } // if snapshot.exists()
  }); // onValue
}

/* Promesa para la toma de datos de la DB con get */
async function promiseGetFromDB(name, nQueries) {
  return new Promise((resolve, reject) => {
    resolve(getFromDB(name, nQueries));
  });
}

/* Tomando un dato de la DB con get */
async function getFromDB(name, nQueries) {
  let value = null;
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  let queries = query(ref(dbNodemcu, 'Refrigerador/' + capitalizedName), limitToLast(nQueries));

  await get(queries).then((snap) => {
    if (snap.exists()) {
      value = Object.values(snap.val());
    } else {
      console.log("No hay " + name + " para nQueries = " + nQueries);
    }
  }).catch((error) => {
    console.error(error);
  });

  return value;
}