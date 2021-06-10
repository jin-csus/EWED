package com.epa.beans.GHGEmissions;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Base table for gas information from GHG.
 * Can map to one return object of gas info in the json.
 *
 */
@Entity
@Table(name="gasInfo")
public class GasInfo {

	@Id
	@Column(name = "gasId")
	@JsonProperty("GAS_ID") String gasId;
	
	@Column(name = "gasCode")
	@JsonProperty("GAS_CODE") String gasCode;
	
	@Column(name = "gasName")
	@JsonProperty("GAS_NAME") String gasName;
	
	@Column(name = "gasLabel")
	@JsonProperty("GAS_LABEL") String gasLabel;
	
	public GasInfo() {
	}

	public GasInfo(String gasId, String gasCode, String gasName, String gasLabel) {
		super();
		this.gasId = gasId;
		this.gasCode = gasCode;
		this.gasName = gasName;
		this.gasLabel = gasLabel;
	}

	@Override
	public String toString() {
		return "GasInfo [gasId=" + gasId + ", gasCode=" + gasCode + ", gasName=" + gasName + ", gasLabel=" + gasLabel
				+ "]";
	}
	
}
