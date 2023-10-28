import React, { createRef, Component } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { connect } from "react-redux";

import {
  MAPBOX_ACCESS_TOKEN,
  MAP_STYLE_ACTION,
  MAP_FLY_ACTION,
} from "../../actions/constants";

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

var map = null;

class MapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      matches: window.matchMedia("(min-width: 1000px)").matches,
    };
  }
  mapboxElRef = createRef();

  componentDidMount() {
    var mapStyle = JSON.parse(JSON.stringify(this.props.style)).style;
    map = new mapboxgl.Map({
      container: this.mapboxElRef.current,
      style: mapStyle,
      center: [16, 27],
      zoom: 2,
    });
    this.renderMap(map);
  }

  renderMap = (map) => {
    var nav = new mapboxgl.NavigationControl();
    map.addControl(nav, this.state.matches ? "bottom-right" : "top-right");

    fetch("/data/mapdata.json")
      .then((response) => response.json())
      .then((data) => {
        map.once("load", function () {
          map.addSource("points", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: data.features,
            },
          });
          map.addLayer({
            id: "circles",
            source: "points",
            type: "circle",
            paint: {
              "circle-opacity": 0.75,
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["get", "confirmed"],
                1,
                4,
                1000,
                8,
                4000,
                10,
                8000,
                14,
                12000,
                18,
                100000,
                40,
                250000,
                100,
              ],
              "circle-color": "#EA240F",
            },
          });
          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
          });

          let previous_id;

          map.on("mousemove", "circles", (e) => {
            const key = e.features[0].properties.key;
            if (key !== previous_id) {
              const { name, confirmed, deaths, recovered } = e.features[0].properties;
              map.getCanvas().style.cursor = "pointer";

              const coordinates = e.features[0].geometry.coordinates.slice();
              const HTML = `<div>
                <h3>${name}</h3>
                <p>Confirmed: ${confirmed}</p>
                <p>Deaths: ${deaths}</p>
                <p>Recovered: ${recovered}</p>
              </div>`;

              while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
              }
              popup.setLngLat(coordinates).setHTML(HTML).addTo(map);
            }
          });

          map.on("mouseleave", "circles", function () {
            previous_id = undefined;
            map.getCanvas().style.cursor = "";
            popup.remove();
          });
        });
      })
      .catch((error) => {
        console.error("An error occurred while fetching the data:", error);
      });
  };

  render() {
    var actionType = JSON.parse(JSON.stringify(this.props.action)).action;
    if (actionType.action !== undefined) {
      var action = actionType.action;
      var mapStyle = JSON.parse(JSON.stringify(this.props.style)).style;
      var statistics = JSON.parse(JSON.stringify(this.props.countryStatistics)).statistics;

      if (mapStyle.style !== undefined && action === MAP_STYLE_ACTION) {
        map = new mapboxgl.Map({
          container: this.mapboxElRef.current,
          style: mapStyle.style,
          center: [16, 27],
          zoom: 2,
        });
        this.renderMap(map);
      }
      if (map !== null && action === MAP_FLY_ACTION) {
        if (statistics.item !== undefined) {
          map.flyTo({
            center: statistics.item,
            zoom: 4,
            bearing: 0,
            speed: 1,
            curve: 1,
            easing: function (t) {
              return t;
            },
            essential: true,
          });
        }
      }
    }
    return (
      <div className="mapbox-container">
        <div className="mapBox" ref={this.mapboxElRef} />
      </div>
    );
  }
}

const stateProps = (state) => ({
  countryStatistics: state.countryStatistics,
  style: state.style,
  action: state.action,
});

export default connect(stateProps, null)(MapComponent);
