var anc = 0;
for (var i = 0; i <= 7; i++) {
    anc += Math.pow(2, i);
}
console.log(anc + 1);

// console.log(Math.floor(15/2));
//
// console.log(
//     for (var i = 0; i < array.length; i++) {
//
//     }
//     [1,2,3,4,5].sort(function(a, b){
//         return b - a;
//     })
// );

function(){
    var missingPeople = [];
    var aCount = 0;
    var genBack = 7;
    // Determine the highest ascendancy number given the generations requested
    for (var i = 0; i <= genBack; i++) {
        aCount += Math.pow(2, i);
    }
    aCount++; // Add one to the aCount to include yourself

    // Add a new property on the object for each aNum
    for (i = 2; i < aCount; i++){
        missingPeople[i] = false;
    }

    return missingPeople;
}();
