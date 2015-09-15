var moment = require('moment');
var logger = require('tracer').console();

// Get the written out ascendancy chain
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

// Find the first provided direct descendant
function findDesc(aNum, ancestors) {
	var descendant = 1;

	descNum = Math.floor(aNum / 2);

	// Continue down the tree until a descendant is found
	while (descNum >= 1) {
		// Iterate over the array to find a match
		for (var i = 0; i < ancestors.length; i++) {
			if (ancestors[i].ascendancyNumber == descNum) {
				return {
					name: ancestors[i].name,
					id: ancestors[i].id,
					descendant: descendant
				};
			}
		}
		descNum = Math.floor(descNum / 2);
		descendant++;
	}
}

// Determine the number of generations back provided the ascendancy number
function genNum(aNum) {
	var genCount = 0;
	while (Math.pow(2, genCount) <= aNum) {
		genCount++;
	}
	return genCount - 1;
}

// Transforms the persons object from the FS API to an array
// with additional properties
function ancArray(ancestors) {
	var personsObj = {};
	personsObj.ancestors = [];

	// Create a list of all the ahnentafel numbers that should be returned
	personsObj.missingPeople = [];
	// Create the incompletePers array
	personsObj.incompletePers = [];

	var persons = ancestors.getPersons();

	// Sort by aNum to be able to get any missing persons direct descendant
	persons.sort(function (a, b) {
		var firstNum = a.data.display.ascendancyNumber ? a.data.display.ascendancyNumber : 0;
		var secondNum = b.data.display.ascendancyNumber ? b.data.display.ascendancyNumber : 0;
		return firstNum - secondNum;
	});

	for (var i = 0; i < persons.length; i++) {

		var thisPerson = persons[i].data.display;

		// Create the newPerson obj
		var newPerson = {};
		newPerson.id = persons[i].data.id;

		if (priorANum) {
			while (priorANum != parseInt(thisPerson.ascendancyNumber) - 1) {
				priorANum++;
				// Add missing ancestor to missingPeople array
				personsObj.missingPeople.push({
					aNum: priorANum,
					genNum: genNum(priorANum),
					path: shortRel(priorANum),
					nextDesc: findDesc(priorANum, personsObj.ancestors)
				});
			}
		}

		for (var property in thisPerson) {
			if (thisPerson.hasOwnProperty(property)) {
				switch (property) {
				case 'ascendancyNumber':
					newPerson[property] = Number(thisPerson[property]);

					newPerson.relationship = relationship(Number(thisPerson[property]));
					newPerson.shortRel = shortRel(Number(thisPerson[property]));
					newPerson.genNum = genNum(thisPerson.ascendancyNumber);

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

					if (thisPerson.lifespan.search('Living') >= 0) {
						newPerson.living = true;
					}

					newPerson.birthDate = thisPerson.birthDate;

					// Calculate the lifespan of the person
					if (thisPerson.deathDate && thisPerson.deathDate.toUpperCase() != 'UNKNOWN') {

						var bdFormat = thisPerson.birthDate.match(/ /g);

						if (bdFormat === null) {
							var birthMoment = moment(thisPerson.birthDate, 'YYYY');
						} else if (bdFormat.length === 2) {
							var birthMoment = moment(thisPerson.birthDate, 'D MMM YYYY');
						} else {
							var birthMoment = moment(thisPerson.birthDate, 'MMM YYYY');
						}

						// Count the number of spaces in the date
						var ddFormat = thisPerson.deathDate.match(/ /g);
						var deathMoment = 0;

						if (ddFormat === null) {
							deathMoment = moment(thisPerson.deathDate, 'YYYY');
							// Get the difference in years
							newPerson.yearsOfLife = deathMoment.diff(birthMoment, 'years');
						} else if (ddFormat.length === 2) {
							deathMoment = moment(thisPerson.deathDate, 'D MMM YYYY');
							// Get the difference in years
							newPerson.yearsOfLife = deathMoment.diff(birthMoment, 'years');
						} else if (ddFormat.length === 1) {
							deathMoment = moment(thisPerson.deathDate, 'MMM YYYY');
							// Get the difference in years
							newPerson.yearsOfLife = deathMoment.diff(birthMoment, 'years');
						}
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

		// Check for missing properties
		var requiredProps = [
		    'birthDate',
		    'birthPlace',
		    'deathDate',
		    'deathPlace',
		    'marriageDate',
		    'marriagePlace'
		]

		var missPropObj = {};
		missPropObj.props = [];

		for (var p = 0; p < requiredProps.length; p++) {
		    // If the ancestor is missing a required property
		    if (!thisPerson[requiredProps[p]] && parseInt(thisPerson.ascendancyNumber, 10) > 1) {
		        // If the person id deceased check all properties
		        if (thisPerson.lifespan.search('Living') < 0) {
		            missPropObj.props.push(requiredProps[p])

		        // If the person is living don't check for death data
		        } else if (requiredProps[p] !== 'deathDate' && requiredProps[p] !== 'deathPlace') {
		            missPropObj.props.push(requiredProps[p])
		        }
		    }
		}

		// If the missPropObj
		if (missPropObj.props.length > 0) {
		    // Add the missing property to the list
		    missPropObj.id = thisPerson.id;
		    missPropObj.name = thisPerson.name;
		    personsObj.incompletePers.push(missPropObj);
		}

		var priorANum = thisPerson.ascendancyNumber;

		personsObj.ancestors.push(newPerson);
	}

	return personsObj;

}

module.exports = ancArray;
