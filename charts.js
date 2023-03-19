import { dbNodemcu } from "/index.js"
import { ref, onValue, query, limitToLast } from "firebase/database";

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
  let data = new google.visualization.DataTable();

  data.addColumn('datetime', 'Time');
  data.addColumn('number', 'Temperatura');

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

  formatDate.format(data, 0);

  let chart = new google.visualization.LineChart(document.getElementById(name + tNumber));

  //chart.draw(data, options);


/*   var hora = firebase.database().ref('Refrigerador/Hora').limitToLast(qtyDatos);
  var minutos = firebase.database().ref('Refrigerador/Minutos').limitToLast(qtyDatos);
  var dia = firebase.database().ref('Refrigerador/Dia').limitToLast(qtyDatos);
  var mes = firebase.database().ref('Refrigerador/Mes').limitToLast(qtyDatos);
  var año = firebase.database().ref('Refrigerador/Ano').limitToLast(qtyDatos); */

  let temp = query(ref(dbNodemcu, 'Refrigerador/TThe' + tNumber), limitToLast(1));
  let hour = query(ref(dbNodemcu, 'Refrigerador/Hora'), limitToLast(1));
  let minute = query(ref(dbNodemcu, 'Refrigerador/Minutos'), limitToLast(1));
  let day = query(ref(dbNodemcu, 'Refrigerador/Dia'), limitToLast(1));
  let month = query(ref(dbNodemcu, 'Refrigerador/Mes'), limitToLast(1));
  let year = query(ref(dbNodemcu, 'Refrigerador/Ano'), limitToLast(1));


  
  onValue(temp, (snapshot) => {
    let value = snapshot.val();
    console.log(value);
/*     if (temp) {
      data.setValue(1, 1, Object.values(value)[0]);
      formatter.format(data, 1);
      chart.draw(data, options);
    } */
  });

  onValue(hour, (snapshot) => {
    let value = snapshot.val();
    console.log(value);
    /*     if (temp) {
          data.setValue(1, 1, Object.values(value)[0]);
          formatter.format(data, 1);
          chart.draw(data, options);
        } */
  });

  onValue(minute, (snapshot) => {
    let value = snapshot.val();
    console.log(value);
    /*     if (temp) {
          data.setValue(1, 1, Object.values(value)[0]);
          formatter.format(data, 1);
          chart.draw(data, options);
        } */
  });

  onValue(day, (snapshot) => {
    let value = snapshot.val();
    console.log(value);
    /*     if (temp) {
          data.setValue(1, 1, Object.values(value)[0]);
          formatter.format(data, 1);
          chart.draw(data, options);
        } */
  });
  
  onValue(month, (snapshot) => {
    let value = snapshot.val();
    console.log(value);
    /*     if (temp) {
          data.setValue(1, 1, Object.values(value)[0]);
          formatter.format(data, 1);
          chart.draw(data, options);
        } */
  });

  onValue(year, (snapshot) => {
    let value = snapshot.val();
    console.log(value);
    /*     if (temp) {
          data.setValue(1, 1, Object.values(value)[0]);
          formatter.format(data, 1);
          chart.draw(data, options);
        } */
  });





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
}