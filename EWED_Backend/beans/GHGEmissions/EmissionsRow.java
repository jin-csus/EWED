package com.epa.beans.GHGEmissions;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name="emissionsNew")
public class EmissionsRow {

	@EmbeddedId
	EmissionsKey emissionsKey;
	
	@Column(name = "localFacId")
	String localFacId;
	
	@Column(name = "latitude")
	String latitude;
		
	@Column(name = "longitude")
	String longitude;
	
	@Column(name = "emissionAmount")
	String emissionAmount;
	
	@Column(name = "sector")
	int sector;
	
	public EmissionsRow() {
	}

	public EmissionsRow(EmissionsKey emissionsKey, String localFacId, String latitude, String longitude, String emissionAmount,
			int sector) {
		super();
		this.localFacId = localFacId;
		this.emissionsKey = emissionsKey;
		this.latitude = latitude;
		this.longitude = longitude;
		this.emissionAmount = emissionAmount;
		this.sector = sector;
	}

	public EmissionsKey getEmissionsKey() {
		return emissionsKey;
	}

	public void setEmissionsKey(EmissionsKey emissionsKey) {
		this.emissionsKey = emissionsKey;
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

	public String getEmissionAmount() {
		return emissionAmount;
	}

	public void setEmissionAmount(String emissionAmount) {
		this.emissionAmount = emissionAmount;
	}
	
	public int getSector() {
		return sector;
	}

	public void setSector(int sector) {
		this.sector = sector;
	}
	
	public String getLocalFacId() {
		return localFacId;
	}

	public void setLocalFacId(String localFacId) {
		this.localFacId = localFacId;
	}

	@Override
	public String toString() {
		return "EmissionsRow [emissionsKey=" + emissionsKey + ", localFacId=" + localFacId + ", latitude=" + latitude
				+ ", longitude=" + longitude + ", emissionAmount=" + emissionAmount + ", sector=" + sector + "]";
	}

	
}
