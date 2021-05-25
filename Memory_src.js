// Variable to hold internal representation of the board
let board;
let openCards = 0;
let id;

// Array to store all times so far
let tijden = [200, 300, 400, 500, 600];

let timeoutVar;

let gameStarted = false;
let startTijd = 0;
// StartTijd is de tijd dat het huidige spel begonnen is.
// Totaaltijd is de som van de tijd van alle gespeelde spelletjes, aantaltijden is het aantal spelletjes
let firstCard = null;
let secondCard = null;
let foundCardPairs = 0;
// De eerste en tweede kaart die zijn omgedraaid.
var karakter;
// Het teken dat op de achterkant van de kaart getoond wordt
var intervalID, tijdID;
// De ID's voor de timeouts voor het terugdraaien van de kaarten en het bijwerken van de tijdweergave

var numberOfCards;
// Aantal kaarten op het bord
var numberOfCardsLeft;
// Aantal kaarten dat nog op het bord ligt
var topScores = [
	{ name: "Barack Obama", time: 200 },
	{ name: "Bernie Sanders", time: 300 },
	{ name: "Hillary Clinton", time: 400 },
	{ name: "Jeb Bush", time: 500 },
	{ name: "Donald Trump", time: 600 }
]


function initGame(size) {
	initVars(size);
	vulSpeelveld(size);
	showScores();
}

function initVars(size) {
	// Initialiseer alle benodigde variabelen en de velden op het scherm

	setCharacter();
	setBoard(size);
	setTijden();
}

function setCharacter() {
	karakter = document.getElementById("character").value;
}

function getTotalTime() {
	let totalTime = 0;
	for (const tijd of tijden) {
		totalTime += tijd;
	}
	return totalTime;
}

function vulSpeelveld(size) {
	// Bouw de size x size table speelveld op. Elk <td> element van de tabel
	// moet een karakter toegewezen worden. Hiervoor kan de nextletter functie
	// gebruikt worden. Ook moet de eventlistener cardClicked aan de cell gekoppeld worden
	// en de opmaak juist gezet worden.

	// Get table
	let table = document.getElementById("speelveld");
	table.innerHTML = ''; // clear list

	// Iterate through rows
	for (let y = 0; y < size; y++) {
		let tableRow = document.createElement('tr');
		table.appendChild(tableRow);

		// Add cards in row
		for (let x = 0; x < size; x++) {
			let tableData = document.createElement('td');
			tableRow.appendChild(tableData);
			tableData.className = "inactive";
			tableData.innerHTML = karakter;
			tableData.addEventListener("click", cardClicked, false);
		}
	}
}

function showScores() {
	// Vul het topscore lijstje op het scherm.

	let orderedList = document.getElementById("topscores");
	orderedList.innerHTML = ''; // clear list

	for (const score of topScores) {
		let scoreItem = document.createElement('li');
		scoreItem.innerHTML = score.name + ": " + score.time;

		orderedList.appendChild(scoreItem);
	}
}

function setBoard(size) {
	board = [];
	let nextLetterFunction = nextLetter(size);
	for (let y = 0; y < size; y++) {
		board[y] = [];
		for (let x = 0; x < size; x++) {
			board[y][x] = nextLetterFunction();
		}
	}
	foundCardPairs = 0;
	numberOfCards = size ** 2;
	numberOfCardsLeft = numberOfCards;
}

// Better name: showStats()
function setTijden() {
	if (gameStarted) {
		let time = getSeconds() - startTijd;
		document.getElementById("tijd").innerHTML = time;
		document.getElementById("gevonden").innerHTML = foundCardPairs;

		let avgTime = Math.round(getTotalTime() / tijden.length);
		let deltaTime = time - avgTime;
		let deltaTimeFormatted = (deltaTime < 0 ? "" : "+") + deltaTime;

		document.getElementById("gemiddeld").innerHTML = `${avgTime}s (${deltaTimeFormatted})`;
	}
	// bereken de verlopen tijd, de gemiddelde tijd en het verschil tussen
	// de huidige speeltijd en de gemiddelde tijd en vul de elementen in de HTML.
	// Vul ook het aantal gevonden kaarten
}

function getSeconds() {
	// Een functie om de Systeemtijd in seconden in plaats van miliseconden
	// op te halen. Altijd handig.
	return Math.floor(Date.now() / 1000);
}

var nextLetter = function(size) {
	var letterArray = "AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPQQRRSSTTUUVVWWXXYYZZ".substring(0, size * size).split('');
	var idx = 0;
	letterArray = shuffle(letterArray);
	return function() {
		var letter = letterArray[idx++];
		return letter;
	}
}

function cardClicked() {
	let card = this;
	checkStarttijd();
	checkDerdeKaart();
	var draaiKaartOm = openCard(card);
	if (draaiKaartOm == 2) {
		checkKaarten();
	}
}

function checkStarttijd() {
	if (!gameStarted) {
		gameStarted = true;
		startTijd = getSeconds();
		tijdBijhouden();
	}
	// Controleer of de startijd van het spel gezet is, i.e. het spel al gestart was.
	// Als dat niet zo is doe dat nu, en start de timeOut voor het bijhouden van de tijd.
}

function checkDerdeKaart() {
	if (firstCard !== null && secondCard !== null) {
		// Both cards aren't null, therefore the third card has been clicked
		closeCards();
	}
	// Controleer of het de derde kaart is die wordt aangeklikt.
	// Als dit zo is kunnen de geopende kaarten gedeactiveerd (gesloten) worden.
}

function closeCards() {
	// Cards can only be opened when they are active
	firstCard.className = "inactive";
	secondCard.className = "inactive";
	firstCard.innerHTML = karakter;
	secondCard.innerHTML = karakter;
	firstCard = null;
	secondCard = null;
	openCards = 0;
}

function openCard(card) {
	if (card === firstCard) {
		// mustn't click the same card twice
		return openCards;
	}
	// Cards can be openened only when they are inactive
	if (card.className !== "inactive") {
		return openCards;
	}
	let x = card.cellIndex;
	let y = card.parentElement.rowIndex;
	card.className = "active";
	card.innerHTML = board[y][x];

	// Set firstCard and secondCard
	if (firstCard === null) {
		firstCard = card;
	} else if (secondCard === null) {
		secondCard = card;
	}

	stopPeekTimer();
	return ++openCards;
}

function foundCards(card1, card2) {
	card1.addEventListener("click", null);
	card2.addEventListener("click", null);
	card1.className = "found";
	card2.className = "found";
	firstCard = null;
	secondCard = null;
	numberOfCardsLeft -= 2;
	openCards -= 2;
	foundCardPairs++;
}

function checkKaarten() {
	// Kijk of de beide kaarten gelijk zijn. Als dit zo is moet het aantal gevonden paren
	// opgehord worden, het aantal resterende kaarten kleiner worden en ervoor
	// gezorgd worden dat er niet meer op de kaarten geklikt kan worden. De kaarten
	// zijn nu found.
	// Als de kaarten niet gelijk zijn moet de timer gaan lopen van de toontijd, en
	// de timeleft geanimeerd worden zodat deze laat zien hoeveel tijd er nog is.
	if (firstCard.innerHTML === secondCard.innerHTML) {
		foundCards(firstCard, secondCard);
	} else {
		startPeekTimer();
	}
}

function startPeekTimer() {
	var elem = document.getElementById("timeLeft");
	let progress = 100;
	let speed = 1; // Update-speed in ms. Must be an integer.
	id = setInterval(frame, speed);

	function frame() {
		if (progress <= 0) {
			elem.style.width = '100%';
			clearInterval(id);
			closeCards();
		} else {
			progress -= 0.1;
			elem.style.width = progress + '%';
		}
	}
}

function stopPeekTimer() {
	clearTimeout(id);
	document.getElementById("timeLeft").style.width = '100%';
}

// De functie tijdBijhouden moet elke halve seconde uitgevoerd worden om te controleren of
// het spel klaar is en de informatie op het scherm te verversen.
function tijdBijhouden() {
	if (numberOfCardsLeft == 0) {
		endGame();
	} else {
		setTijden();
		setTimeout(tijdBijhouden, 500);
	}
}

function endGame() {
	gameStarted = false;
	let speelTijd = getSeconds() - startTijd;
	tijden.push(speelTijd);
	updateTopScores(speelTijd);
	// Bepaal de speeltijd, check topscores en doe de overige
	// administratie.
}

function updateTopScores(speelTijd) {
	if (speelTijd < topScores[topScores.length - 1].time) {

		// Parse username
		let username;
		if (speelTijd < topScores[0].time) {
			username = prompt("Gefeliciteerd, nieuwe highscore! Vul je naam in:");
		} else {
			username = prompt("Gefeliciteerd, top 5! Vul je naam in:");
		}

		if (username.trim().length === 0) {
			username = "Anonymous";
		}
		
		// Voeg de aangeleverde speeltijd toe aal de lijst met topscores
		topScores.push({ name: username, time: speelTijd });
		topScores.sort((a, b) => a.time - b.time);
		topScores.pop();
		showScores();
	} else {
		alert(`Helaas, geen nieuwe topscore. Jouw tijd: ${speelTijd}`);
	}

}

// Deze functie ververst de kleuren van de kaarten van het type dat wordt meegegeven.
function setColor(stylesheetId) {
	var valueLocation = '#value' + stylesheetId.substring(3);
	var color = $(valueLocation).val();
	$(stylesheetId).css('background-color', '#' + color);
}

// knuth array shuffle
// from https://bost.ocks.org/mike/shuffle/
function shuffle(array) {
	var currentIndex = array.length,
		temporaryValue, randomIndex;
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

$(document).ready(function() {
	$("#opnieuw").click(function() {
		initGame($("#size").val());
	});
});