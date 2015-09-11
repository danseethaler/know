// Returns an object with the
var moment = require('moment');

function relationship(aNum) {

	if (aNum === 1) {
		return {};
	}

	var GenCount,
		Gender,
		OrdSuffix,
		relation,
		relationships,
		GreatCount;

	// Generate a random number for the Ahnentafel number
	// var aNum = Math.floor(Math.random() * 100);

	// --------------- Compute relation:
	switch (aNum) {

		// 2 through 7 are hard-coded relationships

	case 2:
		relation = "father";
		break;
	case 3:
		relation = "mother";
		break;
	case 4:
		relation = "paternal grandfather";
		break;
	case 5:
		relation = "paternal grandmother";
		break;
	case 6:
		relation = "maternal grandfather";
		break;
	case 7:
		relation = "maternal grandmother";
		break;

	default: // count generations:

		if ((aNum % 2) == 1) {
			Gender = "grandmother";
		} else {
			Gender = "grandfather";
		}
		GenCount = 0;
		while (Math.pow(2, GenCount) <= aNum) {
			GenCount++;
		}
		relation = "";
		for (j = 1; j <= (GenCount - 3); j++) {
			relation += "great-";
		}
		relation += Gender;
		GreatCount = GenCount - 3;
		switch (GreatCount) {
		case 1:
			OrdSuffix = "st";
			break;
		case 2:
			OrdSuffix = "nd";
			break;
		case 3:
			OrdSuffix = "rd";
			break;
		default:
			OrdSuffix = "th";
		}
	}


	var returnObj = {
		relation: relation
	}

	if (aNum > 7) {
		var shortRelation = GreatCount.toString() + OrdSuffix + " great-" + Gender;
		returnObj.shortRelation = shortRelation;
	}

	return returnObj;
}

// Return the ancestrial chain for the provided anentafel number
function shortRel(aNum) {

	var j,
		Parentage,
		tStr;
	// --------------- Compute Parentage:
	j = aNum;
	if ((j % 2) == 1) {
		Parentage = "mother";
		j = j - 1;
	} else {
		Parentage = "father"
	}
	j = j / 2;
	while (j > 1) {
		tStr = Parentage;
		if ((j % 2) == 1) {
			Parentage = "mother's " + tStr;
			j = j - 1;
		} else {
			Parentage = "father's " + tStr;
		}
		j = j / 2;
	}

	return Parentage;
}

// Transforms the persons object from the FS API to an array
// with additional properties
function ancArray(ancestors) {
	var personsArray = [];
	var persons = ancestors.getPersons();

	for (var i = 0; i < persons.length; i++) {

		var newPerson = {};
		var thisPerson = persons[i].data.display;

		for (var property in thisPerson) {
			if (thisPerson.hasOwnProperty(property)) {
				switch (property) {
				case 'ascendancyNumber':
					newPerson[property] = Number(thisPerson[property]);

					newPerson.relationship = relationship(Number(thisPerson[property]));
					newPerson.shortRel = shortRel(Number(thisPerson[property]));

					// Determine the number of generations back
					var genCount = 0;
					while (Math.pow(2, genCount) <= thisPerson.ascendancyNumber) {
						genCount++;
					}
					newPerson.genNum = genCount - 1;

					break;
				case 'name':
					newPerson[property] = thisPerson[property].toLowerCase();
					break;
				case 'birthDate':
					// Get the length of the array
					var bdLength = thisPerson.birthDate.split(' ').length;

					if (bdLength === 3) {
						var birthDate = thisPerson.birthDate.split(' ');
						var birthDate = new Date(birthDate[2], new Date(Date.parse(birthDate[1] + " 1, 2015")).getMonth(), birthDate[0]);
						newPerson.bDate = birthDate;

					} else if (bdLength === 2) {
						var birthDate = thisPerson.birthDate.split(' ');
						var birthDate = new Date(birthDate[1], new Date(Date.parse(birthDate[0] + " 1, 2015")).getMonth());
						newPerson.bDate = birthDate;

					} else if (bdLength === 1) {
						var birthDate = new Date(thisPerson.birthDate);
						newPerson.bDate = birthDate;
					}

					newPerson.birthDate = thisPerson.birthDate;

					// Calculate the lifespane of the person
					if (thisPerson.deathDate && thisPerson.deathDate.toUpperCase() != 'UNKNOWN') {

						var bdFormat = thisPerson.birthDate.match(/ /g);

						if (bdFormat === null) {
							var birthMoment = moment(thisPerson.birthDate, 'YYYY');
						} else if (bdFormat.length === 2) {
							var birthMoment = moment(thisPerson.birthDate, 'D MMM YYYY');
						} else {
							var birthMoment = moment(thisPerson.birthDate, 'MMM YYYY');
						}

						var ddFormat = thisPerson.deathDate.match(/ /g);

						if (ddFormat === null) {
							var deathMoment = moment(thisPerson.deathDate, 'YYYY');
						} else if (ddFormat.length === 2) {
							var deathMoment = moment(thisPerson.deathDate, 'D MMM YYYY');
						} else {
							var deathMoment = moment(thisPerson.deathDate, 'MMM YYYY');
						}
						// Get the difference in years
						newPerson.yearsOfLife = deathMoment.diff(birthMoment, 'years');
					}
					break;
				case 'deathDate':
					// Get the length of the array
					var bdLength = thisPerson.deathDate.split(' ').length;

					if (bdLength === 3) {
						var deathDate = thisPerson.deathDate.split(' ');
						var deathDate = new Date(deathDate[2], new Date(Date.parse(deathDate[1] + " 1, 2015")).getMonth(), deathDate[0]);
						newPerson.dDate = deathDate;

					} else if (bdLength === 2) {
						var deathDate = thisPerson.deathDate.split(' ');
						var deathDate = new Date(deathDate[1], new Date(Date.parse(deathDate[0] + " 1, 2015")).getMonth());
						newPerson.dDate = deathDate;

					} else if (bdLength === 1) {
						var deathDate = new Date(thisPerson.deathDate);
						newPerson.dDate = deathDate;
					}

					newPerson.deathDate = thisPerson.deathDate;

					break;
				default:
					newPerson[property] = thisPerson[property];
					break;
				}
			}
		}
		newPerson.id = persons[i].id;

		personsArray.push(newPerson);
	}

	// console.log(JSON.stringify(personsArray, null, 4));
	return personsArray;

}

module.exports = ancArray;
