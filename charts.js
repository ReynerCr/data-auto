import { dbNodemcu } from "/index.js"
import { ref, onValue, query, limitToLast, onChildAdded } from "firebase/database";

// Cargando Google Charts para el idioma español
google.charts.load('current', { 'packages': ['gauge'], 'language': 'es' });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {

  var data = google.visualization.arrayToDataTable([
    ['Label', 'Value'],
    ['Therm 1', 0],
    ['Therm 2', 0],
    ['Therm 3', 0]
  ]);

  var options = {
    width: 500, min: -20, max: 50,
    greenFrom: -20, greenTo: -10,
    yellowFrom: -10, yellowTo: 0,
    redFrom: 0, redTo: 50,
    majorTicks: ['-15', '-10', '-5', '0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50'],
    minorTicks: 10,
  };

  var formatter = new google.visualization.NumberFormat({
    suffix: ' °C',
    fractionDigits: 2
  });
  formatter.format(data, 1);

  var chart = new google.visualization.Gauge(document.getElementById('chart_div'));

  chart.draw(data, options);

  onValue(query(ref(dbNodemcu, 'Refrigerador/TThe1'), limitToLast(1)), (snapshot) => {
    let value = snapshot.val();
    if (value) {
      data.setValue(0, 1, Object.values(value)[0]);
      formatter.format(data, 1);
      chart.draw(data, options);
    }
  });

  onValue(query(ref(dbNodemcu, 'Refrigerador/TThe2'), limitToLast(1)), (snapshot) => {
    let value = snapshot.val();
    if (value) {
      data.setValue(1, 1, Object.values(value)[0]);
      formatter.format(data, 1);
      chart.draw(data, options);
    }
  });

  onValue(query(ref(dbNodemcu, 'Refrigerador/TThe3'), limitToLast(1)), (snapshot) => {
    let value = snapshot.val();
    if (value) {
      data.setValue(2, 1, Object.values(value)[0]);
      formatter.format(data, 1);
      chart.draw(data, options);
    }
  });
}

/* let i = 0;
onChildAdded(ref(dbNodemcu, 'Refrigerador/TThe3'), (snapshot) => {
  console.log(snapshot.val());
  ++i;
  console.log("iterador: " + i);
});

onValue(ref(dbNodemcu, 'Refrigerador/TThe3'), (snapshot) => {
  console.log(snapshot.val());
  console.log("HUBO CAMBIO THE3");
});
onValue(ref(dbNodemcu, 'Refrigerador/TThe2'), (snapshot) => {
  console.log(snapshot.val());
  console.log("HUBO CAMBIO THE2");
});
onValue(ref(dbNodemcu, 'Refrigerador/TThe1'), (snapshot) => {
  console.log(snapshot.val());
  console.log("HUBO CAMBIO THE1");
}); */