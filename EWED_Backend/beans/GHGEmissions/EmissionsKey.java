package com.epa.beans.GHGEmissions;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Embeddable;

/* 
 * Composite key for emission table
 * */
@Embeddable
public class EmissionsKey implements Serializable{

	private static final long serialVersionUID =0;

	@Column(name = "ORISCode")
	String ORISCode;
	
	@Column(name = "emYear")
	String emYear;
	
	@Column(name = "gasId")
	String gasId;
	
	public EmissionsKey() {
	}

	public EmissionsKey(String ORISCode, String emYear, String gasId) {
		super();
		this.ORISCode = ORISCode;
		this.emYear = emYear;
		this.gasId = gasId;
	}

	public String getORISCode() {
		return ORISCode;
	}

	

	public void setORISCode(String oRISCode) {
		ORISCode = oRISCode;
	}

	

	public String getEmYear() {
		return emYear;
	}

	public void setEmYear(String emYear) {
		this.emYear = emYear;
	}

	public String getGasId() {
		return gasId;
	}

	public void setGasId(String gasId) {
		this.gasId = gasId;
	}

	@Override
	public String toString() {
		return "EmissionsKey [ORISCode=" + ORISCode + ", emYear=" + emYear + ", gasId=" + gasId + "]";
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((ORISCode == null) ? 0 : ORISCode.hashCode());
		result = prime * result + ((emYear == null) ? 0 : emYear.hashCode());
		result = prime * result + ((gasId == null) ? 0 : gasId.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		EmissionsKey other = (EmissionsKey) obj;
		if (ORISCode == null) {
			if (other.ORISCode != null)
				return false;
		} else if (!ORISCode.equals(other.ORISCode))
			return false;
		if (emYear == null) {
			if (other.emYear != null)
				return false;
		} else if (!emYear.equals(other.emYear))
			return false;
		if (gasId == null) {
			if (other.gasId != null)
				return false;
		} else if (!gasId.equals(other.gasId))
			return false;
		return true;
	}

	
}
