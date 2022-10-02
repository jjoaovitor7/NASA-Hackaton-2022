
const map = document.getElementById("map");

const map3D = Globe()
  .globeImageUrl("https://globe.gl/example/moon-landing-sites/lunar_surface.jpg")
  .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
  .showGraticules(true);

const data = [];
const csv_str_to_arr = [];

`Year,Day,H,M,S,Lat,Long,Magnitude,Comments
1971,107,7,0,55,48,35,2.8,
1971,140,17,25,10,42,-24,2,
1971,192,13,24,45,43,-47,1.9,Or lat -42 long -60
1972,2,22,29,40,54,101,1.9,
1972,261,14,35,55,12,46,1,
1972,341,23,8,20,51,45,1.4,
1972,344,3,50,15,-20,-80,1.2,
1973,39,22,52,10,33,35,0.8,
1973,72,7,56,30,-84,-134,3.2,
1973,171,20,22,0,-1,-71,2.2,
1973,274,3,58,0,-37,-29,1.1,
1974,54,21,16,50,36,-16,0.7,
1974,86,9,11,0,-48,-106,1.6,
1974,109,13,35,15,-37,42,0.9,
1974,149,20,42,15,,,0.6,30 degrees from station 16 on east side of station
1974,192,0,46,30,21,88,2.7,
1975,3,1,42,0,29,-98,3.2,
1975,12,3,14,10,75,40,1.7,
1975,13,0,26,20,-2,-51,1.1,
1975,44,22,3,50,-19,-26,1.4,
1975,127,6,37,5,-49,-45,1.3,
1975,147,23,29,0,3,-58,1.4,
1975,314,7,52,55,-8,64,1.8,
1976,4,11,18,55,50,30,1.8,
1976,12,8,18,5,38,44,1.1,
1976,66,10,12,40,50,-20,2.3,
1976,68,14,42,10,-19,-12,1.8,
1976,137,12,32,40,77,-10,1.5,`.split("\n").forEach((i) => {
  csv_str_to_arr.push(i.split(","));
});

const factor = 8;

csv_str_to_arr.slice(1).forEach((arr) => {
  data.push({
    yer: parseInt(arr[0]),
    day: parseInt(arr[1]),
    hor: parseInt(arr[2]),
    min: parseInt(arr[3]),
    sec: parseInt(arr[4]),
    lat: Number.isNaN(parseInt(arr[5])) ? 0 : parseInt(arr[5]),
    lng: Number.isNaN(parseInt(arr[6])) ? 0 : parseInt(arr[6]),
    mag: arr[7] * factor,
    prd: parseInt(String((arr[0] + arr[1] + arr[2] + arr[3] + arr[4]) / factor).slice(0, 4))
  })
});

const setColors = (d) => {
  if (d.mag >= 0 && d.mag < 1.5 * factor) {
    return "#ffffff";
  } else if (d.mag >= 1.5 * factor && d.mag < 2.5 * factor) {
    return "#ffff00";
  } else {
    return "#ff0000";
  }
}

const setPoints = (data) => {
  map3D.htmlElementsData(data)
    .htmlElement(d => {
      const container = document.createElement("div");
      container.innerHTML = d.yer;
      container.style.background = "#000";
      container.style.color = "#fff";
      container.style.fontSize = "10px";
      container.style.fontWeight = "bold";
      container.style["pointer-events"] = "auto";
      container.style.cursor = "pointer";

      tippy(container, {
        placement: "top",
        arrow: true,
        allowHTML: true,
        content: `${d.day}, ${d.yer}
<br />${d.hor}h ${d.min}min ${d.sec}s
<br />Lat: ${d.lat}
<br />Lng: ${d.lng}
<br />Mag: ${d.mag / factor}`
      });

      return container;
    });
}

const setPointsLines = (data) => {
  map3D.ringsData([])
    .hexBinPointLat(d => d.lat)
    .hexBinPointLng(d => d.lng)
    .hexBinPointWeight(d => d.mag * (factor / 3))
    .hexBinPointsData(data)
    .hexTopColor(d => {
      return setColors(d.points[0]);
    })
    .hexSideColor(d => {
      return setColors(d.points[0]);
    })
}

const setPointsRings = (data) => {
  map3D.hexBinPointsData([])
    .ringMaxRadius("mag")
    .ringColor((d) => {
      return setColors(d);
    })
    .ringPropagationSpeed(1)
    .ringRepeatPeriod("prd")
    .ringsData(data);
}

setPoints(data);
setPointsLines(data);

const ddLines = document.querySelectorAll("#dd-lines a");
const ddRings = document.querySelectorAll("#dd-rings a");

ddLines[0].addEventListener("click", (e) => {
  setPoints(data);
  setPointsLines(data);
});

for (let i = 1; i < ddLines.length; i++) {
  ddLines[i].addEventListener("click", (e) => {
    const f = data.filter((d) => d.yer == parseInt(e.target.textContent));
    setPoints(f);
    setPointsLines(f);
  })
}

ddRings[0].addEventListener("click", (e) => {
  setPointsRings(data);
});

for (let i = 1; i < ddRings.length; i++) {
  ddRings[i].addEventListener("click", (e) => {
    const f = data.filter((d) => d.yer == parseInt(e.target.textContent));
    setPoints(f);
    setPointsRings(f);
  })
}

window.addEventListener("resize", (event) => {
  map3D.width([event.target.innerWidth])
  map3D.height([event.target.innerHeight])
});

map3D(map);
map3D.controls().autoRotate = true;
map3D.controls().autoRotateSpeed = 0.27322;
