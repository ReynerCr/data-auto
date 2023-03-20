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
const btnTherm1 = document.getElementById("btnTherm1");
btnTherm1.onclick = function () {
  btnTherm2.disabled = false;
  btnTherm3.disabled = false;
  btnTherm1.disabled = true;
  google.charts.setOnLoadCallback(drawLineChart('therm', 1));
}

const btnTherm2 = document.getElementById("btnTherm2");
btnTherm2.onclick = function () {
  btnTherm1.disabled = false;
  btnTherm3.disabled = false;
  btnTherm2.disabled = true;
  google.charts.setOnLoadCallback(drawLineChart('therm', 2));
}

const btnTherm3 = document.getElementById("btnTherm3");
btnTherm3.onclick = function () {
  btnTherm1.disabled = false;
  btnTherm2.disabled = false;
  btnTherm3.disabled = true;
  google.charts.setOnLoadCallback(drawLineChart('therm', 3));
}

let unsubscribeGraph;

/* Funcion para el grafico de lineas */
async function drawLineChart(name, tNumber) {
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

  var formatDate = new google.visualization.DateFormat(
    { prefix: 'Time: ', pattern: "dd MMM HH:mm" });

  formatDate.format(dataTable, 0);

  let chart = new google.visualization.LineChart(document.getElementById('therm'));

  let qTempLast = query(ref(dbNodemcu, 'Refrigerador/TThe' + tNumber), limitToLast(1));

  // TODO esto en teoria se puede mejorar en funciones aparte
  let pTemp = new Promise((resolve, reject) => {
    resolve(getTimestampFraction('TThe' + tNumber, 100));
    //reject(function() { console.log("No se pudo."); }) // TODO ???
  });
  let pYear = new Promise((resolve, reject) => {
    resolve(getTimestampFraction('ano', 100));
    //reject(function() { console.log("No se pudo."); })
  });
  let pMonth = new Promise((resolve, reject) => {
    resolve(getTimestampFraction('mes', 100));
  });
  let pDay = new Promise((resolve, reject) => {
    resolve(getTimestampFraction('dia', 100));
  });
  let pHour = new Promise((resolve, reject) => {
    resolve(getTimestampFraction('hora', 100));
  });
  let pMinutes = new Promise((resolve, reject) => {
    resolve(getTimestampFraction('minutos', 100));
  });

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
    }); /* Promise.all */


  /*
  Se verifica si hay una nueva temperatura registrado
  y entonces se procede a tomar los datos para hacer el nuevo
  timestamp. En vez de hacerlo con varios observers a la base de 
  datos, se hace con uno solo.
*/
  if (unsubscribeGraph) {
    /* Eliminando observers anteriores */
    await unsubscribeGraph();
  }
  unsubscribeGraph = onValue(qTempLast, (snapshot) => {
    if (snapshot.exists()) {
      const tempValue = Object.values(snapshot.val())[0];

      pYear = new Promise((resolve, reject) => {
        resolve(getTimestampFraction('ano'));
      });
      pMonth = new Promise((resolve, reject) => {
        resolve(getTimestampFraction('mes'));
      });
      pDay = new Promise((resolve, reject) => {
        resolve(getTimestampFraction('dia'));
      });
      pHour = new Promise((resolve, reject) => {
        resolve(getTimestampFraction('hora'));
      });
      pMinutes = new Promise((resolve, reject) => {
        resolve(getTimestampFraction('minutos'));
      });

      Promise.all([pYear, pMonth, pDay, pHour, pMinutes]).
        then((values) => {
          const date = new Date(values[0], values[1], values[2], values[3], values[4], 0, 0);
          dataTable.addRow([date, tempValue]);
          chart.draw(dataTable, options);

        }); /* Promise.all */
    } /* if snapshot.exists() */
  }); /* onValue */
}

/* Tomando fragmento del timestamp, de la base de datos */
async function getTimestampFraction(name, nQueries = 1) {
  let value = 0;

  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  let queries = query(ref(dbNodemcu, 'Refrigerador/' + capitalizedName), limitToLast(nQueries));

  await get(queries).then((snap) => {
    if (snap.exists()) {
      value = Object.values(snap.val());
    } else {
      console.log("No hay " + name + ' nQueries = ' + nQueries);
    }
  }).catch((error) => {
    console.error(error);
  });

  return value;
}