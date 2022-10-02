const map = document.getElementById("map");

const map3D = Globe()
  .globeImageUrl("https://globe.gl/example/moon-landing-sites/lunar_surface.jpg")
  .showGraticules(true);

(async function createMap() {
  const res = await fetch("/data/nakamura_1979_sm_locations.csv", { method: "GET" });
  const data_arr = await res.text();
  let data = [];
  const factor = 8;

  data_arr.csvToArray().slice(1).forEach((arr) => {
    data.push({
      yer: arr[0],
      lat: arr[5],
      lng: arr[6],
      mag: arr[7] * factor,
      prd: parseInt(String((arr[0] + arr[1] + arr[2] + arr[3] + arr[4]) / factor).slice(0, 4))
    })
  });

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
        content: `${d.yer}<br />Lat: ${d.lat}<br />Lng: ${d.lng}<br />Mag: ${d.mag / factor}`,
      });
      return container;
    })

  map3D
    .ringMaxRadius("mag")
    .ringColor((i) => {
      if (i.mag >= 0 && i.mag < 1.5 * factor) {
        return "#ffffff";
      } else if (i.mag >= 1.5 * factor && i.mag < 2 * factor) {
        return "#ffff00";
      } else {
        return "#ff0000";
      }
    })
    .ringPropagationSpeed(1)
    .ringRepeatPeriod("prd")
    .ringsData(data);

  map3D(map);

  window.addEventListener("resize", (event) => {
    map3D.width([event.target.innerWidth])
    map3D.height([event.target.innerHeight])
  });

  map3D.controls().autoRotate = true;
  map3D.controls().autoRotateSpeed = 0.25;
})();