package com.epa.beans.WaterUsage;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonProperty;

/*
 * Table to store the water Availability 
 */
@Entity
@Table(name="waterAvailability")
public class WaterAvailability {
	
	@Id
	@Column(name = "HUCCode")
	@JsonProperty("HUCCode") String HUCCode;
	
	@Column(name = "year")
	@JsonProperty("year") int year;
	
	@Column(name = "month")
	@JsonProperty("month") int month;
	
	@Column(name = "waterAvailable")
	@JsonProperty("waterAvailable") String waterAvailable;
	

	public WaterAvailability() {
		super();
	}

	public WaterAvailability(int year, int month, String waterAvailable) {
		super();
		this.year = year;
		this.month = month;
		this.waterAvailable = waterAvailable;
	}

	public String getHUCCode() {
		return HUCCode;
	}

	public void setHUCCode(String hUCCode) {
		HUCCode = hUCCode;
	}

	public int getYear() {
		return year;
	}

	public void setYear(int year) {
		this.year = year;
	}

	public int getMonth() {
		return month;
	}

	public void setMonth(int month) {
		this.month = month;
	}

	public String getWaterAvailable() {
		return waterAvailable;
	}

	public void setWaterAvailable(String waterAvailable) {
		this.waterAvailable = waterAvailable;
	}

	@Override
	public String toString() {
		return "WaterAvailability [HUCCode=" + HUCCode + ", year=" + year + ", month=" + month + ", waterAvailable="
				+ waterAvailable + "]";
	}

}
