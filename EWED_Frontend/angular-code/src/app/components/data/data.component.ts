import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
} from "@angular/core";

import { MatSort } from "@angular/material/sort";
import { MatTableDataSource, MatTable } from "@angular/material/table";

import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";

import { PieChartComponent } from "../charts/pie-chart/pie-chart.component";
import { LineChartComponent } from "../charts/line-chart/line-chart.component";
import { BarChartComponent } from "../charts/bar-chart/bar-chart.component";

import { BehaviorSubject, Subject } from "rxjs";

import { ActivatedRoute } from "@angular/router";

import { filter, tap } from "rxjs/operators";
import { saveAs } from "file-saver";

import * as html2canvas from "../../../assets/js/html2canvas.min.js";
import * as sorttable from "../../../assets/js/sorttable.js";
import * as jsPDF from "jspdf";
import { Title } from "@angular/platform-browser";
import { BackendService } from "../../common/backend.service";
import { MapService } from "../map/map.service";
import { DataService } from "./data.service";
import { Global } from "../../common/global";
import { FacDataSummaryForTable } from "./interfaces/fac-data-summary-for-table.interface";
import { FacilityData } from "./interfaces/facility-data.interface";
import { TotalsData } from "./interfaces/totals-data.interface";
import { DataTableTabId } from "./data-table-tab-id.type";
import { DownloadDataCsv } from "./interfaces/download-data.interface";

export interface StatesFacilityData {
  Summary: FacilityData;
  "Total Summary": TotalsData;
}

declare var sorttable;

var _tableData: FacDataSummaryForTable[] = [];

var nameColumn: string = "";

@Component({
  selector: "app-data",
  templateUrl: "./data.component.html",
  styleUrls: ["./data.component.scss"],
})
export class DataComponent implements OnInit {
  constructor(
    private backendService: BackendService,
    private mapService: MapService,
    private dataService: DataService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private activeRoute: ActivatedRoute,
    public cd: ChangeDetectorRef,
    private titleService: Title
  ) {}

  @ViewChild("chartDownloadReference", { static: true }) screen: ElementRef;
  @ViewChild("canvas", { static: true }) canvas: ElementRef;
  @ViewChild("downloadLinkPng", { static: true }) downloadLinkPng: ElementRef;
  @ViewChild("downloadLinkPdf", { static: true }) downloadLinkPdf: ElementRef;
  @ViewChild("dataTable", { static: true }) dataTableElem: ElementRef;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(PieChartComponent) pie: PieChartComponent;
  @ViewChild(LineChartComponent) line: LineChartComponent;
  @ViewChild(BarChartComponent) bar: BarChartComponent;
  @ViewChild("nameColRef", { static: true }) nameColRef: ElementRef;

  columns = ["state", "ww", "wc", "em", "wa"];

  generationTotal;
  emissionsTotal;
  withdrawalTotal;
  consumptionTotal;
  localTableDataJson;
  showDwldPdfBtn;
  showToggleBtn;
  currentLink;
  activeTabLocal;
  tabActive;
  downloadDataBtnTxt: string = "PNG";
  currentId;
  pageUrlVisible;
  pageUrl;
  initLoadSorted: boolean = true;

  showDownloadCSVBtn = true;

  displayedColumns: string[] = [
    "sno",
    "Facility Name",
    "Generation",
    "Emissions",
    "Water Withdrawal",
    "Water Consumption",
  ];

  displayedColumns2: string[] = [
    "num",
    "Total",
    "GenTotal",
    "EmTotal",
    "WWTotal",
    "WCTotal",
  ];

  dataTableFooter: string[] = ["", "", "", "", ""];
  dataSource = new MatTableDataSource(_tableData);

  lineChartTabEnable: boolean;

  defaultData: Object = {};

  nameColumn = "";
  resultsDuration: string = "";
  activityRegion: string = "";

  fuelTypesOptions: string;
  name: string;
  tableDataSubscription;

  tableData$ = new Subject<FacDataSummaryForTable[]>();
  tabData = new BehaviorSubject([]);

  lineChartClasses = "line-chart-container";
  dataTableClasses = "data-table-container";
  pieChartClasses = "pie-chart-container";
  barChartClasses = "bar-chart-container";

  filtersApplied: string = "";
  showDownloadPNGPDFBtns = true;

  ngOnChanges(values) {
    this.cd.detectChanges();
  }

  /* Activates the data table tab based on id, updates the 
  variables used for hiding/showing tabs :
  0 - table
  1 - line
  2 - pie
  3 - bar */
  showTab(id: DataTableTabId) {
    this.currentId = id;
    this.activeTabLocal = id;

    switch (id) {
      case 0: {
        Global.urlObj.dataTab = "table";
        this.dataTableClasses = "data-table-container show";
        this.lineChartClasses = "line-chart-container";
        this.pieChartClasses = "pie-chart-container";
        this.barChartClasses = "bar-chart-container";

        break;
      }
      case 1: {
        Global.urlObj.dataTab = "line";
        this.dataTableClasses = "data-table-container";
        this.lineChartClasses = "line-chart-container show";
        this.pieChartClasses = "pie-chart-container";
        this.barChartClasses = "bar-chart-container";
        break;
      }
      case 2: {
        Global.urlObj.dataTab = "pie";
        this.lineChartClasses = "line-chart-container";
        this.dataTableClasses = "data-table-container";
        this.pieChartClasses = "pie-chart-container show";
        this.barChartClasses = "bar-chart-container";
        break;
      }
      case 3: {
        Global.urlObj.dataTab = "bar";
        this.lineChartClasses = "line-chart-container";
        this.dataTableClasses = "data-table-container";
        this.pieChartClasses = "pie-chart-container";
        this.barChartClasses = "bar-chart-container show";
        break;
      }
    }

    this.cd.detectChanges();

    this.backendService.updateUrl();
  }

  /* Generates and returns a file name */
  get getFileName() {
    let name = this.activityRegion + " " + this.resultsDuration;
    name = name.replace("Activity for ", "");
    name = name.split(" ").join("_");
    return name;
  }

  /* Used when download csv button is clicked */
  generateAndDownloadCSV() {
    let preparedJsonDataForCsv: Array<Object> = [];

    if (Global.urlObj.viewBy == "facilities") {
      this.localTableDataJson.forEach((val) => {
        preparedJsonDataForCsv.push({
          name: val.PRIMARY_NAME,
          gn: val.GenerationSummary,
          em: val.EmissionSummary,
          wc: val.WaterConsumptionSummary,
          ww: val.WaterWithdrawalSummary,
        });
      });
    } else {
      this.localTableDataJson.forEach((val) => {
        preparedJsonDataForCsv.push({
          name: val.filterName,
          gn: val.generation,
          em: val.emission,
          ww: val.waterWithdrawal,
          wc: val.waterConsumption,
        });
      });
    }

    let fileName = this.getFileName;

    let downloadFileData: DownloadDataCsv = {
      fileName: fileName,
      csvData: preparedJsonDataForCsv,
      activityRegion: this.activityRegion,
      activityDuration: this.resultsDuration,
      filtersApplied: this.filtersApplied,
      nameColumn: this.nameColumn,
    };

    this.dataService.downloadFile(downloadFileData);
  }

  downloadPNG() {
    /* for data tabs other than table, html2canvas is used 
      for generating png/pdf. html2canvas() captures the image
      of charts and saves as png or pdf
      */
    // hide the toggle water availability button
    this.showToggleBtn = false;
    html2canvas(this.screen.nativeElement, {
      scrollY: -window.scrollY,
      height: this.screen.nativeElement.offsetHeight,
    }).then((canvas) => {
      this.generateAndDownloadPNG(canvas);
    });
  }

  downloadDataPDF() {
    /* for data tabs other than table, html2canvas is used 
      for generating png/pdf. html2canvas() captures the image
      of charts and saves as png or pdf
      */
    // hide the toggle water availability button
    this.showToggleBtn = false;
    html2canvas(this.screen.nativeElement, {
      scrollY: -window.scrollY,
      height: this.screen.nativeElement.offsetHeight,
    }).then((canvas) => {
      this.generateAndDownloadPDF(canvas);
    });
  }

  generateAndDownloadPNG(canvas) {
    this.downloadLinkPng.nativeElement.href = canvas.toDataURL("image/png");
    this.downloadLinkPng.nativeElement.download = this.getFileName + ".png";
    this.downloadLinkPng.nativeElement.click();
  }

  /* @param- canvas - the html2canvas element,
  btnId - "png/csv" or "pdf" */
  generateAndDownloadPDF(canvas) {
    let fileName = this.getFileName;

    var imgData = canvas.toDataURL("image/png", 1.0);
    this.canvas.nativeElement.src = canvas.toDataURL();

    /* A4 is 210mm x 297mm */
    var pdf = new jsPDF("p", "mm", "a4");

    let ratio = canvas.width / canvas.height;

    /* Constants for page setting */
    const PDF_CHART_WIDTH = 190;
    const MAX_PIE_CHART_HEIGHT = 270;
    const PX_TO_MM_CONVERSION_FACTOR = 0.26458333;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(10, 10, `Energy-Water-Emissions Dashboard`);
    pdf.text(10, 15, "Source Url:");
    pdf.setTextColor(0, 0, 255);
    pdf.setFontSize(7);
    pdf.text(10, 20, this.currentLink);

    /*  Sets constrain on page limit to accommodate the image inside A4 size
        adjusts width in ratio if height is longer than page height
        same with height resize 
    */
    if (canvas.height * PX_TO_MM_CONVERSION_FACTOR > MAX_PIE_CHART_HEIGHT) {
      pdf.addImage(
        imgData,
        10,
        25,
        MAX_PIE_CHART_HEIGHT * ratio,
        MAX_PIE_CHART_HEIGHT
      );
    } else if (PDF_CHART_WIDTH * PX_TO_MM_CONVERSION_FACTOR) {
      pdf.addImage(imgData, 10, 25, PDF_CHART_WIDTH, PDF_CHART_WIDTH / ratio);
    }

    pdf.save(fileName + ".pdf");
    this.downloadLinkPdf.nativeElement.click();
  }

  ngOnInit() {
    /* Table data:

      Case 1: All US => state names and data => defaultViewData/stateName
      Case 2: state/huc-regions => huc names and data => getSummaryWithin/state/{xxxx}/HUC8Name
      Case 3: state/counties => county names and data => getSummaryWithin/state/{xxxx}/CountyState1
      Case 4: state/facilities => facility names and data => getFacilityData/stateName/{xxxx}
      Case 5: county => facility names and data => getFacilityData/CountyState1/{xxxx}
      Case 6: huc-region => facility names and data => getFacilityData/HUC8Name/{xxxx}

    */

    this.showToggleBtn = true;

    /* For disabling line chart in All US view */
    this.dataService.lineChartEnable$.subscribe((filterValueUrl) => {
      if (Global.urlObj.urlPrefix === "all-us") {
        this.lineChartTabEnable = false;
      } else {
        this.lineChartTabEnable = true;
      }
    });

    /* For showing hiding active tab */
    this.dataService.activeTab$.subscribe((tabId) => {
      this.activeTabLocal = this.activateTabById(tabId);
      this.showTab(this.activeTabLocal);
    });

    /* Main subscription which receives the table data and 
    updates the table */
    this.tableDataSubscription = this.backendService.tableData$
      .pipe(
        tap((val) => {}),
        filter((val) => val !== "init"),
        filter((val) => Object.keys(val[Object.keys(val)[0]]).length > 0)
      )
      .subscribe(
        (res) => {
          try {
            this.updateColumnName();
            this.updateActivityRegion();

            this.resultsDuration = Global.updateActivityDuration;

            this.titleService.setTitle(
              `${Global.urlObj.searchKeyword} - ${this.resultsDuration} - EWED`
            );
            this.currentLink = `http://${Global.serverAddr}/${Global.getUrlString}`;

            if (!this.backendService.isEmpty(res)) {
              /* Case 1: all us */
              if (Global.urlObj.urlPrefix === "all-us") {
                this.formatSummarisedDataWithinRegion(res.defaultViewData);
                this.localTableDataJson = res.defaultViewData.Summary;
              }

              /* Case 2: state : a) huc-regions   b) counties   c) facilities*/
              if (Global.urlObj.urlPrefix === "state") {
                /* Case 2c */
                if (Global.urlObj.viewBy === "facilities") {
                  this.formatFacilityData(res.getFacilityData);
                  this.localTableDataJson =
                    res.getFacilityData["All Facilities"];
                } else {
                  /* for Case 2a and 2b*/
                  this.formatSummarisedHucDataWithinState(
                    res.getSummaryWithinData
                  );
                  this.localTableDataJson = res.getSummaryWithinData.Summary;
                }
              }

              /* Case 3 : county view */
              if (
                Global.urlObj.urlPrefix === "county" ||
                Global.urlObj.urlPrefix === "huc-region"
              ) {
                if (typeof res.getFacilityData != "undefined") {
                  this.formatFacilityData(res.getFacilityData);
                  this.localTableDataJson =
                    res.getFacilityData["All Facilities"];
                }
              }
            }

            /* Sort name column in ascending order by default */
            if (!sorttable.innerSortFunction)
              sorttable.makeSortable(this.dataTableElem.nativeElement);

            if (
              this.nameColRef.nativeElement.classList.contains(
                "sorttable_sorted_reverse"
              ) || // if sorted in reverse order
              this.initLoadSorted || // set sort for initial load
              this.nameColRef.nativeElement.classList.length == 1 // check if first column is not sorted
            ) {
              sorttable.innerSortFunction.apply(
                this.nameColRef.nativeElement,
                []
              );
              this.initLoadSorted = false;
            }
          } catch (e) {
            // Do Nothing
          }
        },
        (err) => alert(err),
        function () {}
      );
  }

  /* Returns tabId based on keyword from urlservice subscription */
  activateTabById(tabId) {
    if (tabId === "table") return 0;
    if (tabId === "line") return 1;
    if (tabId === "pie") return 2;
    if (tabId === "bar") return 3;
  }

  /* Sets the first column name in table depending on the view */
  updateColumnName() {
    if (Global.urlObj.urlPrefix === "all-us") {
      this.nameColumn = "State Name";
    } else if (Global.urlObj.urlPrefix === "state") {
      if (Global.urlObj.viewBy === "huc-regions") {
        this.nameColumn = "Watershed Name";
      }

      if (Global.urlObj.viewBy === "counties") {
        this.nameColumn = "County Name";
      }

      if (Global.urlObj.viewBy === "facilities") {
        this.nameColumn = "Facility Name";
      }
    } else if (
      Global.urlObj.urlPrefix === "huc-region" ||
      Global.urlObj.urlPrefix === "county"
    ) {
      this.nameColumn = "Facility Name";
    }
  }

  /* Updates the activity region that is displayed above table in data component */
  updateActivityRegion() {
    if (Global.urlObj.searchKeyword)
      this.activityRegion = `Activity for ${Global.urlObj.searchKeyword}`;

    this.filtersApplied =
      Global.urlObj.fuelTypes == "All"
        ? ``
        : this.backendService.toTitleCase(
            Global.urlObj.fuelTypes.split(",").join(", ")
          );
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /* Set totals value to 0 if it is undefined */
  checkTotalsData(response) {
    if (typeof response.Summary[0] == "undefined") {
      this.generationTotal = 0;
      this.emissionsTotal = 0;
      this.consumptionTotal = 0;
      this.withdrawalTotal = 0;
    }
  }

  /* Used for displaying error messages */
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  dataTableRowMouseOver(row) {
    if (Global.urlObj.viewBy === "facilities") {
      this.mapService.showFacNameInfoBoxOnRowHover(row.pgm_sys_id);
    } else if (Global.urlObj.viewBy == "huc-regions") {
      this.mapService.layerHoverShowBoundary$.next(row.actualName);
    } else {
      this.mapService.layerHoverShowBoundary$.next(row.stateName);
    }
  }

  dataTableRowMouseOut(row) {
    if (Global.urlObj.viewBy === "facilities") {
      this.mapService.showFacNameInfoBoxOnRowMouseOut();
    } else {
      this.mapService.hideHucLayerBoundary();
    }
  }

  dataTableRowMouseClick(id) {
    this.mapService.showFacDetailsInfoBox(id);
  }

  /* The following format functions prepare the different 
  responses for display in table : 
  formatFacilityData(),
  formatSummarisedDataWithinRegion(), 
  formatSummarisedHucDataWithinState(),
  formatDefaultData() */
  formatFacilityData(response) {
    _tableData = [];

    this.checkTotalsData(response);

    this.generationTotal = response.Summary[0].totalGeneration;
    this.emissionsTotal = response.Summary[0].totalEmission;
    this.consumptionTotal = response.Summary[0].totalWaterConsumption;
    this.withdrawalTotal = response.Summary[0].totalWaterWithdrawal;

    response["All Facilities"].forEach((fac) => {
      _tableData.push({
        stateName: fac.PRIMARY_NAME,
        pgm_sys_id: fac.PGM_SYS_ID,
        generation: fac.GenerationSummary,
        emission: fac.EmissionSummary,
        waterConsumption: fac.WaterConsumptionSummary,
        waterWithdrawal: fac.WaterWithdrawalSummary,
      });
    });

    this.tableData$.next(_tableData);
  }

  formatSummarisedDataWithinRegion(response) {
    if (typeof response === "undefined" || Object.keys(response).length === 0)
      return;

    if (response["Total Summary"].length === 0) {
      response["Total Summary"][0].totalGeneration = 0;
      response["Total Summary"][0].totalEmission = 0;
      response["Total Summary"][0].totalWaterConsumption = 0;
      response["Total Summary"][0].totalWaterWithdrawal = 0;
    }

    this.generationTotal = response["Total Summary"][0].totalGeneration;
    this.emissionsTotal = response["Total Summary"][0].totalEmission;
    this.consumptionTotal = response["Total Summary"][0].totalWaterConsumption;
    this.withdrawalTotal = response["Total Summary"][0].totalWaterWithdrawal;

    _tableData = [];

    let summaryData = response.Summary;

    let _keys = Object.keys(summaryData);

    for (let i = 0; i < _keys.length; i++) {
      _tableData[i] = {
        stateName: summaryData[i].filterName,
        generation: summaryData[i].generation,
        emission: summaryData[i].emission,
        waterConsumption: summaryData[i].waterConsumption,
        waterWithdrawal: summaryData[i].waterWithdrawal,
      };
    }

    this.tableData$.next(_tableData);
  }

  formatSummarisedHucDataWithinState(response) {
    _tableData = [];

    if (
      typeof response === "undefined" ||
      response.length ||
      response["Total Summary"].length === 0
    )
      return;

    // No totals available in this response
    this.generationTotal = response["Total Summary"][0].totalGeneration;
    this.emissionsTotal = response["Total Summary"][0].totalEmission;
    this.consumptionTotal = response["Total Summary"][0].totalWaterConsumption;
    this.withdrawalTotal = response["Total Summary"][0].totalWaterWithdrawal;

    if (this.nameColumn == "Watershed Name") {
      response.Summary.forEach((val) => {
        if (val.filterName == null) val.filterName = "null";
        _tableData.push({
          stateName: val.filterName.replace(" watershed", ""),
          actualName: val.filterName,
          generation: val.generation,
          emission: val.emission,
          waterConsumption: val.waterConsumption,
          waterWithdrawal: val.waterWithdrawal,
        });
      });
    } else {
      for (let i = 0; i < response.Summary.length; i++) {
        _tableData[i] = {
          stateName: response.Summary[i].filterName,
          generation: response.Summary[i].generation,
          emission: response.Summary[i].emission,
          waterConsumption: response.Summary[i].waterConsumption,
          waterWithdrawal: response.Summary[i].waterWithdrawal,
        };
      }
    }

    this.tableData$.next(_tableData);
  }

  formatDefaultData(response) {
    _tableData = [];

    this.generationTotal = response["Total Summary"].totalGeneration;
    this.emissionsTotal = response["Total Summary"].totalEmission;
    this.consumptionTotal = response["Total Summary"].totalWaterConsumption;
    this.withdrawalTotal = response["Total Summary"].totalWaterWithdrawal;

    for (let i = 0; i < response.Summary.length; i++) {
      _tableData[i] = {
        stateName: response.Summary[i].filterName,
        generation: response.Summary[i].generation,
        emission: response.Summary[i].emission,
        waterConsumption: response.Summary[i].waterConsumption,
        waterWithdrawal: response.Summary[i].waterWithdrawal,
      };
    }
  }

  /* Called when a table row is clicked */
  onRowClicked(row) {
    /* Open facility popup if facility is clicked */
    if (this.nameColumn === "Facility Name") {
      this.dataTableRowMouseClick(row.pgm_sys_id);
    } else {
      /* Update URL object and navigate to url */
      switch (this.nameColumn) {
        case "State Name": {
          Global.urlObj.urlPrefix = "state";
          Global.urlObj.searchKeyword = row.stateName + " (State)";
          Global.urlObj.viewBy = "huc-regions";
          break;
        }

        case "Watershed Name": {
          Global.urlObj.urlPrefix = "huc-region";
          Global.urlObj.searchKeyword = row.actualName;
          break;
        }

        case "County Name": {
          Global.urlObj.urlPrefix = "county";
          let keyword = Global.urlObj.searchKeyword;
          Global.urlObj.searchKeyword =
            row.stateName + " (" + keyword.split(" (")[0] + ")";
          break;
        }
      }

      this.backendService.updateUrl();
    }
  }
}
