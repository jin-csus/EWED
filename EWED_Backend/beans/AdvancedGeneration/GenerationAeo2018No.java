package com.epa.beans.AdvancedGeneration;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.epa.beans.EIAGeneration.KeyItemsNewGeneration;

/**
 * This class maps to the table that holds the new predicted generation for 
 * case AEO2018NO
 *
 */

@Entity
@Table(name = "p_genAEO2018NO")
public class GenerationAeo2018No {
	
	@Column(name = "genData")
	Float genData;
	
	@Column(name = "units")
	String units;

	@EmbeddedId
	KeyItemsNewGeneration keyTimes;
	
	public KeyItemsNewGeneration getKeyTimes() {
		return keyTimes;
	}

	public void setKeyTimes(KeyItemsNewGeneration keyTimes) {
		this.keyTimes = keyTimes;
	}

	

	@Override
	public String toString() {
		return "GenerationAeo2018No [genData=" + genData + ", units=" + units + ", keyTimes=" + keyTimes + "]";
	}

	public Float getGenData() {
		return genData;
	}

	public void setGenData(Float genData) {
		this.genData = genData;
	}

	public String getUnits() {
		return units;
	}

	public void setUnits(String units) {
		this.units = units;
	}
	
}
