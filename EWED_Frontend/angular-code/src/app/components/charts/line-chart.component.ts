import { Component, OnInit, Input } from "@angular/core";

import {
  // filter,
  // debounce,
  // debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs/operators";
import { Subject } from "rxjs";
import { BackendService } from "@/common/backend.service";
import { Global } from "@/common/global";
import { chartColors } from '../chart.colors';

@Component({
  selector: "app-line-chart",
  templateUrl: "./line-chart.component.html",
  styleUrls: ["./line-chart.component.scss"],
})
export class LineChartComponent implements OnInit {
  noDataShow: boolean;

  constructor(private backendService: BackendService) {
    this.lineChart = {
      chartType: "LineChart",
      dataTable: [],
      options: {
        vAxis: {
          scaleType: "log",
        },
        animation: {
          duration: 100,
        },
        colors: chartColors,
        width: "750",
        height: "300",
        legend: {
          position: "top",
          maxLines: 5,
        },
      },
    };
  }

  // @Input('showToggleBtn') showToggleBtn: boolean;

  public lineChart;
  // public lineChart$ = new Subject();
  toggleEnable: boolean;
  checkWaterAvailability: boolean;
  availArr = [];

  toggleAvailability() {
    // availability is: Off
    if (this.availArr.join(" ").search("Water Availability") < 0) {
      this.lineChart.dataTable.forEach((arr) => {
        this.availArr.push(arr.pop());
      });
    } else {
      // availability is on => turn off
      this.lineChart.dataTable.forEach((arr) => {
        arr.push(this.availArr.shift());
      });
    }

    this.lineChart.component.draw();
  }

  refreshLine() {
    if (this.lineChart.dataTable.length != 0) {
      // should force redraw
      // this.lineChart.component.draw();

      this.lineChart = null;
    }
  }

  ngOnInit() {
    this.backendService.lineChartData$
      .pipe(tap(), distinctUntilChanged())
      .subscribe((res) => {
        if (
          res.getFacilityDataLineChart !== "undefined" &&
          !this.backendService.isEmpty(res.getFacilityDataLineChart) &&
          Object.keys(res.getFacilityDataLineChart.MonthWiseSummary).length != 0
        ) {
          this.noDataShow = false;

          this.checkWaterAvailability =
            Global.urlObj.urlPrefix === "state" ||
            Global.urlObj.urlPrefix === "huc-region";

          if (this.checkWaterAvailability) {
            this.toggleEnable = true;
          } else {
            this.toggleEnable = false;
          }

          let lineArr = [];

          let resData = res.getFacilityDataLineChart.MonthWiseSummary;

          if (this.checkWaterAvailability) {
            lineArr.push([
              "Time",
              "Generation (MWh)",
              "Water Consumption (MGal)",
              "Water Withdrawal (MGal)",
              "Emissions (MtCO₂e)",
              "Water Availability (MGal)",
            ]);

            Object.keys(resData).forEach((data) => {
              Object.keys(resData[data]).forEach((res) => {
                lineArr.push([
                  data + "-" + res,
                  parseInt(resData[data][res].generation),
                  parseInt(resData[data][res].waterConsumption),
                  parseInt(resData[data][res].waterWithdrawal),
                  parseInt(resData[data][res].emission),
                  parseInt(resData[data][res].waterAvailability),
                ]);
              });
            });
          } else {
            lineArr.push([
              "Time",
              "Generation (MWh)",
              "Water Consumption (MGal)",
              "Water Withdrawal (MGal)",
              "Emissions (MtCO₂e)",
            ]);
            Object.keys(resData).forEach((data) => {
              Object.keys(resData[data]).forEach((res) => {
                lineArr.push([
                  data + "-" + res,
                  parseInt(resData[data][res].generation),
                  parseInt(resData[data][res].waterConsumption),
                  parseInt(resData[data][res].waterWithdrawal),
                  parseInt(resData[data][res].emission),
                ]);
              });
            });
          }

          try {
            // this.lineChart.wrapper.setDataTable(lineArr);
            this.lineChart.dataTable = lineArr;

            if (
              typeof this.lineChart !== "undefined" &&
              typeof this.lineChart.component !== "undefined" &&
              this.lineChart.dataTable.length !== 0
            ) {
              this.lineChart.component.draw();
            }
          } catch (err) {
            // Do Nothing
          }
        } else {
          this.noDataShow = true;
        }
      });
  }
}
