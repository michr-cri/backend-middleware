// should be executed from the directory it is in

const fs = require('fs');

function readCsv(filename) {
	const buffer = fs.readFileSync(filename);
	return buffer.toString().split('\n').map(line => line.split(','));
}

const nicknames = readCsv('./nicknames.csv');
const lastnames = readCsv('./popular-last.csv');

function randInt(i) {
	return Math.floor(Math.random() * i);
}

function randomChoice(l) {
	return l[randInt(l.length)];
}

function fixNameCase(string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function randomName() {
	const [nick, first] = randomChoice(nicknames);
	const [last] = randomChoice(lastnames);
	return [first, nick, last].map(fixNameCase);
}

function fromTo(a, b) {
	let l = [];
	for (let i = a; i <= b; i++) {
		l.push(i);
	}
	return l;
}

function formatDate(date) {
	return date.toISOString().substring(0, 'YYYY-MM-DD'.length);
}

const people = fromTo(1, 100).map(() => {
	const [firstName, nickname, lastName] = randomName();
	return {
		firstName,
		nickname,
		lastName,
		dob: formatDate(new Date(randInt(Date.now())))
	};
});

fs.writeFileSync('../middleware-config/data/people.json', JSON.stringify(people, null, 2));

