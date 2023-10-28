import React, { Component } from "react";
import { connect } from "react-redux";
import NumberFormat from "react-number-format";
import { OrbitSpinner } from "react-epic-spinners";
import FlatList from "flatlist-react";

import {
  fetchCoronaStatistics,
  showCountryStatistics,
  setMapStyle,
  setAction,
} from "../../actions";
import { MAP_STYLE_ACTION, MAP_FLY_ACTION } from "../../actions/constants";

class CoronaStatisticsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isAboutModal: false,
      isSelected: -1,
      tabMenuSelect: 1,
      tabSelectedtPos: -1,
      statistics: [],
      matches: window.matchMedia("(min-width: 1000px)").matches,
    };
    this.filter_statistics = [];
  }

  componentDidMount() {
    this.props.fetchCoronaStatistics();
  }

  showCountryStatistics = (item, index) => {
    if (this.state.matches) {
      this.setState({
        isSelected: index,
      });
    } else {
      this.setState({
        isSelected: index,
        tabSelectedtPos: 2,
        tabMenuSelect: 2,
      });
    }
    this.props.setAction(MAP_FLY_ACTION);
    this.props.showCountryStatistics(item.coordinates);
  };

  onTabSelection = (index) => {
    if (index === 3) {
      this.setState({
        tabSelectedtPos: index,
        tabMenuSelect: index,
        isAboutModal: true,
      });
    } else {
      this.setState({
        tabSelectedtPos: index,
        tabMenuSelect: index,
        isAboutModal: false,
      });
    }
  };

  onSetMapStyle = (mapStyle) => {
    this.props.setAction(MAP_STYLE_ACTION);
    this.props.setMapStyle(mapStyle);
  };

  onSetAboutModal = (isShown) => {
    this.setState({
      isAboutModal: isShown,
    });
  };

  renderItem = (item, index) => {
    return (
      <div key={item.country} className={"country-statistics-container"}>
        <div
          className={
            this.state.isSelected === index
              ? "country-selected-list-container"
              : "country-list-container"
          }
          onClick={this.showCountryStatistics.bind(this, item, index)}
        >
          <div className={"country-name-container"}>
            <span className={"country-name-txt"}>
              {item.country === "US" ? "United States" : item.country}
            </span>
          </div>
          <div className={"country-statistics-container"}>
            <NumberFormat
              className={"country-statistics-txt"}
              value={item.confirmed}
              displayType={"text"}
              thousandSeparator={true}
            />
            <span className={"country-statistics-label-txt"}>CONFIRMED</span>
          </div>
          <div className={"country-statistics-container"}>
            <NumberFormat
              className={"country-statistics-txt"}
              value={item.deaths}
              displayType={"text"}
              thousandSeparator={true}
            />
            <span className={"country-statistics-label-txt"}>DEATHS</span>
          </div>
          <div className={"country-statistics-container"}>
            <NumberFormat
              className={"country-statistics-txt"}
              value={item.recovered}
              displayType={"text"}
              thousandSeparator={true}
            />
            <span className={"country-statistics-label-txt"}>RECOVERED</span>
          </div>
        </div>
      </div>
    );
  };

  searchCountry = (event) => {
    let keyword = event.target.value;
    const newData = this.filter_statistics.filter((item) => {
      const itemData = `${item.country.toUpperCase()}`;
      const textData = keyword.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      isLoading: true,
      statistics: newData,
    });
  };

  renderStatistics = () => {
    var data = JSON.parse(JSON.stringify(this.props.statistics)).results;
    if (data !== undefined) {
      var totalConfirmed = data.total_confirmed;
      var totalDeaths = data.total_deaths;
      var totalRecovered = data.total_recovered;
      var date = data.last_date_updated;

      var statistics = data.country_statistics;
      if (statistics !== undefined && !this.state.isLoading) {
        this.filter_statistics = statistics;
        this.setState({
          isLoading: true,
          statistics: statistics,
        });
      }

      return (
        <div className={"list-container"}>
          <div className={"header-container"}>
            <div className={"covid-label-container"}>
              <p className={"covid-label"}>Coronavirus (COVID-19) Tracker</p>
              <p className={"covid-desc-txt"}>
                Coronavirus (COVID-19) which is an infectious disease caused by
                respiratory illness and symptoms like flu, cough, fever,
                difficulty breathing, on December 31, 2019, the first case was
                recorded in Wuhan, China and later the virus got spread around
                the world and as of now around&nbsp;
                <NumberFormat
                  className={"total-confirmed-count"}
                  value={totalConfirmed}
                  displayType={"text"}
                  thousandSeparator={true}
                />
                &nbsp;confirmed cases are being recorded since then.
              </p>
            </div>
            <div className={"covid-date-container"}>
              <span className={"covid-timeline-label"}>Last Updated:</span>
              <span className={"covid-timeline"}>JAN 2022</span>
            </div>
            <div className={"total-statistics-container"}>
              <div className={"total-death-recovery-container"}>
                <div className={"dr-container"}>
                  <NumberFormat
                    className={"total-confirmed-count"}
                    value={totalConfirmed}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                  <span className={"dr-confirmed-label"}>CONFIRMED</span>
                </div>
                <div className={"dr-container"}>
                  <NumberFormat
                    className={"total-deaths-count"}
                    value={totalDeaths}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                  <span className={"dr-deaths-label"}>DEATHS</span>
                </div>
                <div className={"dr-container"}>
                  <NumberFormat
                    className={"total-recovered-count"}
                    value={totalRecovered}
                    displayType={"text"}
                    thousandSeparator={true}
                  />
                  <span className={"dr-recovered-label"}>RECOVERED</span>
                </div>
              </div>
            </div>
          </div>
          <div className={"header-bottom-line"}></div>
          <div className={"search-container"}>
            <div className={"search-input-border"}>
              <input
                type="text"
                className={"search-input-text"}
                placeholder="Search country"
                onChange={(e) => this.searchCountry(e)}
              />
            </div>
          </div>
          <div className={"counrty-statistics-list-container"}>
            {this.state.isLoading &&
            this.state.statistics &&
            this.state.statistics.length > 0 ? (
              <FlatList
                list={this.state.statistics}
                renderItem={this.renderItem}
                extraData={this.state}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              />
            ) : (
              <div
                className={
                  !this.state.isLoading
                    ? "progress-loading-container"
                    : "progress-loading-container-hide"
                }
              >
                <OrbitSpinner color="black" size={60} />
                <p className={"please-wait-text"}>Please wait...</p>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  render() {
    return (
      <div className={"corona-parent-container"}>
        <div
          className={
            this.state.isAboutModal && !this.state.matches
              ? "tooltip-container-hide"
              : "tooltip-container"
          }
        >
          <button
            className="map-style-dark-button"
            style={{
              background: "url(dark-theme-image-url.jpg)",
              backgroundSize: "cover",
            }}
            onClick={() =>
              this.onSetMapStyle(
                "mapbox://styles/hackbotone/ck8vtayrp0x5f1io3sakcmpnv"
              )
            }
          >
            Dark
          </button>

          <button
            className="map-style-light-button"
            style={{
              background: "url(light-theme-image-url.jpg)",
              backgroundSize: "cover",
            }}
            onClick={() =>
              this.onSetMapStyle(
                "mapbox://styles/hackbotone/ck8vt8vdj2fz91ilax6nwtins"
              )
            }
          >
            Light
          </button>
        </div>
        <div
          className={
            this.state.tabSelectedtPos === 1 || this.state.tabSelectedtPos === 3
              ? "map-box-container-hide"
              : "map-box-container"
          }
        ></div>
        <div
          className={
            this.state.tabSelectedtPos === 2 || this.state.tabSelectedtPos === 3
              ? "parent-container-hide"
              : "parent-container"
          }
        >
          {this.renderStatistics()}
        </div>
        <div className={"bottom-tab-menu-container"}>
          <div
            className={
              this.state.tabMenuSelect === 1
                ? "total-cases-selected-tab-menu-container"
                : "total-cases-tab-menu-container"
            }
            onClick={this.onTabSelection.bind(this, 1)}
          >
            <img
              src={
                this.state.tabMenuSelect === 1
                  ? "https://assets.hackbotone.com/images/icons/ic_selected_list.svg"
                  : "https://assets.hackbotone.com/images/icons/ic_list.svg"
              }
              alt="Total Cases"
              className={"total-cases-icon"}
            />
            <span
              className={
                this.state.tabMenuSelect === 1
                  ? "total-cases-selected-label"
                  : "total-cases-label"
              }
            >
              Total Cases
            </span>
          </div>
          <div
            className={
              this.state.tabMenuSelect === 2
                ? "map-selected-tab-menu-container"
                : "map-tab-menu-container"
            }
            onClick={this.onTabSelection.bind(this, 2)}
          >
            <img
              src={
                this.state.tabMenuSelect === 2
                  ? "https://assets.hackbotone.com/images/icons/ic_selected_map.svg"
                  : "https://assets.hackbotone.com/images/icons/ic_map.svg"
              }
              alt="Map"
              className={"map-icon"}
            />
            <span
              className={
                this.state.tabMenuSelect === 2
                  ? "map-selected-label"
                  : "map-label"
              }
            >
              Map
            </span>
          </div>
          <div
            className={
              this.state.tabMenuSelect === 3
                ? "about-selected-tab-menu-container"
                : "about-tab-menu-container"
            }
            onClick={this.onTabSelection.bind(this, 3)}
          >
            <img
              src={
                this.state.tabMenuSelect === 3
                  ? "https://assets.hackbotone.com/images/icons/ic_selected_info.svg"
                  : "https://assets.hackbotone.com/images/icons/ic_info.svg"
              }
              alt="About"
              className={"about-icon"}
            />
            <span
              className={
                this.state.tabMenuSelect === 3
                  ? "about-selected-label"
                  : "about-label"
              }
            >
              About
            </span>
          </div>
        </div>
      </div>
    );
  }
}

const stateProps = (state) => ({
  statistics: state.statistics,
});

const dispatchProps = (dispatch) => ({
  fetchCoronaStatistics: () => dispatch(fetchCoronaStatistics()),
  showCountryStatistics: (item) => dispatch(showCountryStatistics(item)),
  setMapStyle: (style) => dispatch(setMapStyle(style)),
  setAction: (action) => dispatch(setAction(action)),
});

export default connect(stateProps, dispatchProps)(CoronaStatisticsContainer);
