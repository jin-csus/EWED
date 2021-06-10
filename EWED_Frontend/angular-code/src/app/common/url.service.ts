import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { BackendService } from "./backend.service";
import { Global } from "./global";
import { MapService } from "../components/map/map.service";
import { DataService } from "../components/data/data.service";
import { stateCodesToFullName } from "../models/states.list";
import { QueryFormType } from "../components/query-form/query-form.defaults";

@Injectable({
  providedIn: "root",
})
export class UrlService {
  /* Single source for URL data that is used in the application
   * Every component has local copies that are updated by the subscription
   * Initialized with empty object
   * url object */
  urlParameters = new BehaviorSubject<any>("urlParameters Init");

  constructor(
    private backendService: BackendService,
    private mapService: MapService,
    private dataService: DataService
  ) {}

  previousRouteParams: any;
  currentRouteParams: any;

  /* Detect if the url change needs to update dashboard or not
   * change in dataTab and display need not send requests
   * and update dashboard */
  navigationChangeNeedsServerRequest() {
    if (
      Object.keys(this.previousRouteParams).length === 0 || // first load
      (this.previousRouteParams.dataTab === this.currentRouteParams.dataTab &&
        this.previousRouteParams.display === this.currentRouteParams.display) ||
      this.previousRouteParams.viewBy !== this.currentRouteParams.viewBy ||
      this.previousRouteParams.fromYearHistoric !=
        this.currentRouteParams.fromYearHistoric ||
      this.previousRouteParams.fromMonthHistoric !=
        this.currentRouteParams.fromMonthHistoric ||
      this.previousRouteParams.toYearHistoric !=
        this.currentRouteParams.toYearHistoric ||
      this.previousRouteParams.toMonthHistoric !=
        this.currentRouteParams.toMonthHistoric ||
      this.previousRouteParams.fromYearPredicted !=
        this.currentRouteParams.fromYearPredicted ||
      this.previousRouteParams.fromMonthPredicted !=
        this.currentRouteParams.fromMonthPredicted ||
      this.previousRouteParams.toYearPredicted !=
        this.currentRouteParams.toYearPredicted ||
      this.previousRouteParams.toMonthPredicted !=
        this.currentRouteParams.toMonthPredicted
    ) {
      return true;
    }

    return false;
  }

  /* Saves the state name in the urlObj */
  saveStateInUrlObj() {
    let stateCode;

    /* to keep a track of previous state if clicked
    
      1. when a layer is clicked - state to back button needs to be tracked
      2. when not clicked - default state needs to be there
    */

    if (
      typeof this.previousRouteParams.filterValueUrl != "undefined" &&
      this.previousRouteParams.filterValueUrl == "state" &&
      (this.currentRouteParams.urlPrefix == "county" ||
        this.currentRouteParams.urlPrefix == "huc-region")
    ) {
      Global.urlObj.previousState =
        this.backendService.toTitleCase(
          this.previousRouteParams.filterValueUrl
        ) + " (State)";
    }

    if (Global.urlObj.urlPrefix == "huc-region") {
      stateCode = Global.urlObj.searchKeyword
        .split("(")[1]
        .split(",")[0]
        .split(")")[0];
      Global.urlObj.currentState = stateCodesToFullName[stateCode];
    } else if (Global.urlObj.urlPrefix == "state") {
      Global.urlObj.currentState = Global.urlObj.filterValueUrl;
    } else if (Global.urlObj.urlPrefix == "county") {
      Global.urlObj.currentState = Global.urlObj.searchKeyword
        .split("(")[1]
        .split(")")[0];
    }
  }

  tabChangeNavigationCheck(): boolean {
    if (
      this.previousRouteParams.viewBy == this.currentRouteParams.viewBy &&
      this.previousRouteParams.dataTab !== this.currentRouteParams.dataTab
    ) {
      return false;
    }

    return true;
  }

  /* Updates dashboard by sending data and re-rendering 
     map as needed */
  updateAppAfterChecking() {
    // if new data is to be fetched - view change
    if (this.navigationChangeNeedsServerRequest())
      this.backendService.getData();

    // does not update map if tab changes
    if (this.tabChangeNavigationCheck()) this.mapService.updateMap();
  }

  /* Updates the urlobj in Global class */
  updateUrlObjAndGetData(params) {
    this.previousRouteParams = params[0];
    this.currentRouteParams = params[1];

    // Saves data into url object so that other components can access it
    Global.urlObj.formType = this.currentRouteParams.formType;
    Global.urlObj.urlPrefix = this.currentRouteParams.urlPrefix;
    Global.urlObj.filterValueUrl = this.currentRouteParams.filterValueUrl;
    Global.urlObj.dataTab = this.currentRouteParams.dataTab;
    Global.urlObj.previousDataTab = this.previousRouteParams.dataTab;
    Global.urlObj.fuelTypes = this.currentRouteParams.fuelTypes;
    Global.urlObj.climateModel = this.currentRouteParams.climateModel;
    Global.urlObj.climateScenario = this.currentRouteParams.climateScenario;
    Global.urlObj.energyScenario = this.currentRouteParams.energyScenario;
    Global.urlObj.previousViewBy = this.previousRouteParams.viewBy;

    switch (Global.urlObj.formType) {
      case QueryFormType.HISTORIC_FORM_KEYWORD:
        Global.urlObj.fromYearHistoric = this.currentRouteParams.fromYear;
        Global.urlObj.fromMonthHistoric = this.currentRouteParams.fromMonth;
        Global.urlObj.toYearHistoric = this.currentRouteParams.toYear;
        Global.urlObj.toMonthHistoric = this.currentRouteParams.toMonth;

        this.backendService.queryFormDatesSubject$.next("");
        Global.validateHistoricFormMonthYear();
        break;

      case QueryFormType.PROJECTED_FORM_KEYWORD: {
        Global.urlObj.fromYearPredicted = this.currentRouteParams.fromYear;
        Global.urlObj.fromMonthPredicted = this.currentRouteParams.fromMonth;
        Global.urlObj.toYearPredicted = this.currentRouteParams.toYear;
        Global.urlObj.toMonthPredicted = this.currentRouteParams.toMonth;

        Global.validateProjectedFormMonthYear();
        Global.validateProjectedEnergyClimateFields();

        this.backendService.climateModel$.next(Global.urlObj.climateModel);
        this.backendService.climateScenario$.next(
          Global.urlObj.climateScenario
        );
        this.backendService.energyScenario$.next(Global.urlObj.energyScenario);

        this.backendService.predictedQueryFormDatesSubject$.next("");

        break;
      }
    }

    // initialize this with all values set to false
    Global.urlObj.selectedFuelTypesInDialog = {
      "natural gas": false,
      coal: false,
      nuclear: false,
      water: false,
      wind: false,
      solar: false,
      biomass: false,
      geothermal: false,
      petroleum: false,
      other: false,
    };

    if (this.currentRouteParams.fuelTypes === "all") {
      Global.urlObj.selectedFuelTypesInDialog = {
        "natural gas": true,
        coal: true,
        nuclear: true,
        water: true,
        wind: true,
        solar: true,
        biomass: true,
        geothermal: true,
        petroleum: true,
        other: true,
      };
    } else {
      // reset all values to false

      this.currentRouteParams.fuelTypes.split(",").forEach((key) => {
        Global.urlObj.selectedFuelTypesInDialog[key] = false;
      });

      // set url fuel types true in urlObj
      this.currentRouteParams.fuelTypes
        .split(",")
        .forEach(
          (type) => (Global.urlObj.selectedFuelTypesInDialog[type] = true)
        );
    }

    if (
      Global.urlObj.urlPrefix === "county" ||
      Global.urlObj.urlPrefix === "huc-region"
    ) {
      Global.urlObj.viewBy = "facilities";
    } else {
      Global.urlObj.viewBy = this.currentRouteParams.viewBy;
    }

    /* Pass data into map forms - check and avoids updating forms if value is same */
    if (
      Global.urlObj.display !== this.currentRouteParams.display &&
      this.currentRouteParams.display !== undefined
    ) {
      Global.urlObj.display = this.currentRouteParams.display;
      this.backendService.displayFormSubject$.next("");
    }

    /* parse filterValueUrl, generate and update Global.urlObj.searchKeyword */
    this.backendService.convertFilterValueUrlSearchKeyword();

    /* update Global.urlObj.filterValue */
    this.backendService.updateFilterValue();

    /* For back to stateview button */
    this.saveStateInUrlObj();

    /* Update all components of the app */
    this.backendService.queryFormSelect$.next(Global.urlObj.formType);
    this.backendService.viewByFormSubject$.next("");
    this.dataService.lineChartEnable$.next(Global.urlObj.filterValueUrl);
    this.backendService.queryFormSearchSubject$.next("");
    this.dataService.activeTab$.next(this.currentRouteParams.dataTab);

    try {
      this.updateAppAfterChecking();
    } catch (e) {
      // Do Nothing
    }
  }
}
