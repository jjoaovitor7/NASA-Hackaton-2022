document.addEventListener("readystatechange", (e) => {
  if (document.readyState == "complete") {
    const map = document.getElementById("map");

    const map3D = Globe()
      .globeImageUrl("https://globe.gl/example/moon-landing-sites/lunar_surface.jpg")
      .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
      .showGraticules(true);

    fetch("/data/nakamura_1979_sm_locations.csv", { method: "GET" }).then(async (res) => {
      const data = [];
      const factor = 8;

      (await res.text()).csvToArray().slice(1).forEach((arr) => {
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

      for (let i=1; i < ddLines.length; i++) {
        ddLines[i].addEventListener("click", (e) => {
          const f = data.filter((d) => d.yer == parseInt(e.target.textContent));
          setPoints(f);
          setPointsLines(f);
        })
      }

      ddRings[0].addEventListener("click", (e) => {
        setPointsRings(data);
      });

      for (let i=1; i < ddRings.length; i++) {
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
    });
  }
});