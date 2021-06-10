package com.epa.beans.GHGEmissions;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Use to map the emission data pulled from the Web Services.
 *
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Emissions {

	//@JsonProperty("FRS_ID") String frsId;  //Linked to Registry ID in  Facility
	@JsonProperty("FACILITY_ID") String localFacId; 
	@JsonProperty("NAICS_CODE") String naicsCode;
	@JsonProperty("FACILITY_NAME") String facilityName;
	@JsonProperty("ADDRESS1") String facilityAddress;
	@JsonProperty("YEAR") String year;
	@JsonProperty("ZIP") String facilityZip;
	@JsonProperty("LATITUDE") String latitude;
	@JsonProperty("LONGITUDE") String longitude;
	@JsonProperty("PUB_FACTS_SECTOR_GHG_EMISSION") EmissionsData[] emissions;
	
	
	public Emissions() {
	}

	public Emissions(String frsId, String localFacId, String naicsCode, String facilityName, String facilityAddress, String year,
			String facilityZip, String latitude, String longitude, EmissionsData[] emissions) {
		super();
		this.localFacId = localFacId;
		this.naicsCode = naicsCode;
		this.facilityName = facilityName;
		this.facilityAddress = facilityAddress;
		this.facilityZip = facilityZip;
		this.year = year;
		this.latitude = latitude;
		this.longitude = longitude;
		this.emissions = emissions;
	}

	public String getLocalFacId() {
		return localFacId;
	}

	public void setLocalFacId(String localFacId) {
		this.localFacId = localFacId;
	}

	public String getNaicsCode() {
		return naicsCode;
	}

	public void setNaicsCode(String naicsCode) {
		this.naicsCode = naicsCode;
	}

	public String getFacilityName() {
		return facilityName;
	}

	public void setFacilityName(String facilityName) {
		this.facilityName = facilityName;
	}

	public String getFacilityAddress() {
		return facilityAddress;
	}

	public void setFacilityAddress(String facilityAddress) {
		this.facilityAddress = facilityAddress;
	}

	public String getFacilityZip() {
		return facilityZip;
	}

	public void setFacilityZip(String facilityZip) {
		this.facilityZip = facilityZip;
	}

	public String getLatitude() {
		return latitude;
	}

	public void setLatitude(String latitude) {
		this.latitude = latitude;
	}

	public String getLongitude() {
		return longitude;
	}

	public void setLongitude(String longitude) {
		this.longitude = longitude;
	}

	public String getYear() {
		return year;
	}

	public void setYear(String year) {
		this.year = year;
	}

	public EmissionsData[] getEmissions() {
			return emissions;
	}

	public void setEmission(EmissionsData[] emissions) {
		this.emissions = emissions;
	}
	
	public String printEmissions(EmissionsData[] emissions) {
		
		StringBuilder emissionsString = new StringBuilder();
		
		for (EmissionsData emission: emissions) {
			emissionsString.append(emission.toString() + " , ");
		}
		
		return emissionsString.toString();
	}

	@Override
	public String toString() {
		return "Emissions [localFacId=" + localFacId + ", naicsCode=" + naicsCode
				+ ", facilityName=" + facilityName + ", facilityAddress=" + facilityAddress + ", year=" + year
				+ ", facilityZip=" + facilityZip + ", latitude=" + latitude + ", longitude=" + longitude
				+ ", emissions=" +  printEmissions(emissions) + "]";
	}


}