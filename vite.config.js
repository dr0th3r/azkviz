import { sveltekit } from '@sveltejs/kit/vite';
import { Server } from 'socket.io';
import { defineConfig } from 'vite';

const setsPerQuestion = 2;

const playerColors = ['blue', 'green'];

const webSocketServer = {
	name: 'wsServer',
	configureServer(server) {
		if (!server.httpServer) return;

		const io = new Server(server.httpServer);

		const questions = [
			['Co je hlavní tepnou lidského těla?'],
			['Jaké cévy přívadí krev do srdce?'],
			['Co rozvádí krev po těle? (K)'],
			['Jak se nazývají nejmenší cévy?'],
			['Jak se nazývá svalová dutina, která se stahuje a tlačí krev do těla?'],
			['Název oběhu mezi srdcem a zbytkem těla?'],
			['Srdeční síň, která přijímá okysličenou krev z plic?'],
			['Srdečni síň, která přijímá odkysličenou krev z tela?'],
			['Část srdce, která svým stahem vypuzuje krev ze srdce? (K)'],
			['Krvinka, která přenáší kyslík?'],
			['Krvinka, jejíž počet se navýší při infekci?'],
			['Jak se nazývá fáze srde, při které dochází ke stalčení?'],
			['Jak se nazývá fáze srde, při které dochází ke uvolnění?'],
			['Příjmení objevitele krevních skupin?'],
			['Krevní tělíska, která se podílejí na srážení a zastavení krvácení? (D)'],
			['Dárce skupiny A může darovat krev skupině?'],
			['Jaký je normální tlak u dospělého?'],
			['Kolik má srdce chlopní?'],
			['Kolik má srdce komor?'],
			['Kolik má srde síní?'],
			['Jaký je minimální normální puls u dětí?'],
			['Malý krevní oběh vede krev do?'],
			['Které cévy mají netlustší stěny?'],
			['Krom krevních tělísek se krev skládá z krevní?'],
			['Stlačení srdce se nazývá?'],
			['Jak se nazývá věda zabývající se srdcem a cévami?'],
			['Jaká je dolní mez normálního množství krve v těle dospělého (v litrech)?'],
			['Která krevní skupina je univerzální dárce?']
		];

		const answers = [
			['aorta'],
			['žily'],
			['kyslík'],
			['vlásečnice'],
			['srdce'],
			['velký'],
			['levá'],
			['pravá'],
			['komora'],
			['červená'],
			['bílá'],
			['systola'],
			['diastola'],
			['jánsky'],
			['destičky'],
			['a'],
			['120/80'],
			['4'],
			['2'],
			['2'],
			['90'],
			['plic'],
			['tepny'],
			['palzmy'],
			['systola'],
			['kardiologie'],
			['4'],
			['0']
		];

		class Lobby {
			playerOnTurn = null;
			fields = Array(28).fill({
				type: 'remaining',
				value: setsPerQuestion
			});
			players = {};
			selectedFieldId = null;

			constructor(id) {
				this.id = id;
			}

			serialize() {
				const id = Object.keys(lobbies).find((key) => lobbies[key].id === this.id);

				return {
					id: id,
					players: this.players,
					fields: this.fields,
					playerOnTurn: this.playerOnTurn
				};
			}

			joinGame(socket, username) {
				this.players[socket.id] = {
					name: username,
					ready: false,
					color: playerColors[Object.keys(this.players).length]
				};
			}

			arePlayersReady() {
				for (const player of Object.values(this.players)) {
					if (!player.ready) {
						return false;
					}
				}
				return true;
			}

			checkForWin() {
				for (let i = 21; i < 28; i++) {
					let doesTouchLeft = i === 21;
					let doesTouchRight = i === 27;

					let visited = [];

					const field = this.fields[i];
					if (field.type === 'player' && field.value === this.playerOnTurn) {
						const [currentDoesTouchLeft, currentDoesTouchRight] = this.recursiveSearchSides(
							i + 1,
							visited
						);
						doesTouchLeft = doesTouchLeft || currentDoesTouchLeft;
						doesTouchRight = doesTouchRight || currentDoesTouchRight;
						console.log(doesTouchLeft, doesTouchRight);
						if (doesTouchLeft && doesTouchRight) {
							return true;
						}
					}
				}
				return false;
			}

			recursiveSearchSides(fieldId, alreadySearched) {
				//could be done better, but this is clearer to imagine
				const field = this.fields[fieldId - 1];
				//console.log(fieldId);
				//console.log(field);
				if (field.type !== 'player' || field.value !== this.playerOnTurn) return [false, false];
				if (fieldId === 1) return [true, true];

				const row = this.getRow(fieldId);
				//console.log(row);
				const leftmostRowFieldId = (row * (row - 1)) / 2 + 1;
				const rightmostRowFieldId = (row * (row + 1)) / 2;

				console.log(
					`row: ${row}, field: ${fieldId}, leftmost: ${leftmostRowFieldId}, rightmost: ${rightmostRowFieldId}`
				);

				let doesTouchLeft,
					doesTouchRight,
					currentDoesTouchLeft,
					currentDoesTouchRight = false;

				if (fieldId === leftmostRowFieldId) doesTouchLeft = true;
				if (fieldId === rightmostRowFieldId) doesTouchRight = true;

				let nextToSearch = null;

				//console.log(alreadySearched);

				//search up
				if (row > 1) {
					nextToSearch = fieldId - row + 1;
					if (!alreadySearched.includes(nextToSearch)) {
						[currentDoesTouchLeft, currentDoesTouchRight] = this.recursiveSearchSides(
							nextToSearch,
							[...alreadySearched, nextToSearch]
						);
						doesTouchLeft = doesTouchLeft || currentDoesTouchLeft;
						doesTouchRight = doesTouchRight || currentDoesTouchRight;
					}
					if (fieldId - row > 0) {
						nextToSearch = fieldId - row;
						if (!alreadySearched.includes(nextToSearch)) {
							[currentDoesTouchLeft, currentDoesTouchRight] = this.recursiveSearchSides(
								nextToSearch,
								[...alreadySearched, nextToSearch]
							);
							doesTouchLeft = doesTouchLeft || currentDoesTouchLeft;
							doesTouchRight = doesTouchRight || currentDoesTouchRight;
						}
					}
				}

				//search left
				nextToSearch = fieldId - 1;
				if (nextToSearch >= leftmostRowFieldId && !alreadySearched.includes(nextToSearch)) {
					[currentDoesTouchLeft, currentDoesTouchRight] = this.recursiveSearchSides(nextToSearch, [
						...alreadySearched,
						nextToSearch
					]);
					doesTouchLeft = doesTouchLeft || currentDoesTouchLeft;
					doesTouchRight = doesTouchRight || currentDoesTouchRight;
				}
				//search right
				nextToSearch = fieldId + 1;
				if (nextToSearch <= rightmostRowFieldId && !alreadySearched.includes(nextToSearch)) {
					[currentDoesTouchLeft, currentDoesTouchRight] = this.recursiveSearchSides(nextToSearch, [
						...alreadySearched,
						nextToSearch
					]);
					doesTouchLeft = doesTouchLeft || currentDoesTouchLeft;
					doesTouchRight = doesTouchRight || currentDoesTouchRight;
				}

				//search down
				if (row < 7) {
					nextToSearch = fieldId + row;
					if (!alreadySearched.includes(nextToSearch)) {
						[currentDoesTouchLeft, currentDoesTouchRight] = this.recursiveSearchSides(
							nextToSearch,
							[...alreadySearched, nextToSearch]
						);
						doesTouchLeft = doesTouchLeft || currentDoesTouchLeft;
						doesTouchRight = doesTouchRight || currentDoesTouchRight;
					}
					nextToSearch = fieldId + row + 1;
					if (!alreadySearched.includes(nextToSearch)) {
						[currentDoesTouchLeft, currentDoesTouchRight] = this.recursiveSearchSides(
							nextToSearch,
							[...alreadySearched, nextToSearch]
						);
						doesTouchLeft = doesTouchLeft || currentDoesTouchLeft;
						doesTouchRight = doesTouchRight || currentDoesTouchRight;
					}
				}

				//add searching down

				return [doesTouchLeft, doesTouchRight];
			}

			getRow(fieldId) {
				switch (true) {
					case fieldId === 1:
						return 1;
					case fieldId < 4:
						return 2;
					case fieldId < 7:
						return 3;
					case fieldId < 11:
						return 4;
					case fieldId < 16:
						return 5;
					case fieldId < 22:
						return 6;
					case fieldId < 29:
						return 7;
				}
			}
		}

		let lobbies = {};

		io.on('connection', (socket) => {
			let lobby = null;

			socket.on('create lobby', (username) => {
				if (lobby != null) return;

				let lobbyId = `${socket.id}_lobby`;
				const shortId = Math.floor(Math.random() * 10000);

				console.log(shortId);

				lobby = new Lobby(lobbyId);
				lobbies[shortId] = lobby;

				lobby.joinGame(socket, username);
				lobby.playerOnTurn = socket.id;
				socket.join(lobbyId);

				socket.emit('lobby info', lobby.serialize());
			});

			socket.on('join lobby', (username, shortId) => {
				if (lobby != null) return;

				lobby = lobbies[shortId];
				lobby.joinGame(socket, username);
				socket.join(lobby.id);

				io.to(lobby.id).emit('lobby info', lobby.serialize());
			});

			socket.on('leave lobby', () => {
				if (lobby == null) return;

				const lobbyPlayers = lobby.players;

				delete lobbyPlayers[socket.id];

				const lobbyId = lobby.id;

				if (Object.keys(lobbyPlayers).length === 0) {
					delete lobbies[lobbyId];
				}

				if (lobby.playerOnTurn === socket.id) {
					lobby.playerOnTurn = Object.keys(lobbyPlayers)[0];
				}

				socket.emit('leave lobby');
				socket.to(lobbyId).emit('player left lobby', socket.id);
			});

			socket.on('toggle ready', () => {
				if (lobby == null) return;

				const player = lobby.players[socket.id];

				player.ready = !player.ready;

				if (Object.keys(lobby.players).length > 1 && lobby.arePlayersReady()) {
					io.to(lobby.id).emit('start game');
					return;
				}

				io.to(lobby.id).emit('toggle ready', socket.id);
			});

			socket.on('show question', (questionId) => {
				if (lobby == null || socket.id !== lobby.playerOnTurn) return;
				console.log(questionId);
				const questionField = lobby.fields[questionId];
				const question = questions[questionId];
				if (questionField.type === 'player') {
					return;
				}

				lobby.selectedFieldId = questionId;

				io.to(lobby.id).emit('show question', question);
			});

			socket.on('check answer', (playerAnswer) => {
				const playerOnTurnId = lobby.playerOnTurn;

				if (lobby == null || socket.id !== playerOnTurnId) return;

				const questionId = lobby.selectedFieldId;
				const answer = answers[questionId][0];

				console.log(playerAnswer, answer);
				const lobbyId = lobby.id;

				if (playerAnswer !== answer) {
					lobby.selectedFieldId = null;

					const playerIds = Object.keys(lobby.players);
					const currentPlayerIndex = playerIds.indexOf(playerOnTurnId);
					const nextPlayerIndex =
						currentPlayerIndex === playerIds.length - 1 ? 0 : currentPlayerIndex + 1;
					lobby.playerOnTurn = playerIds[nextPlayerIndex];

					io.to(lobbyId).emit('wrong answer', lobby.playerOnTurn);
				} else {
					lobby.fields[lobby.selectedFieldId] = {
						type: 'player',
						value: socket.id
					};

					if (lobby.checkForWin()) {
						console.log('win');
						io.to(lobbyId).emit('player won', lobby.playerOnTurn);
						return;
					}

					const playerIds = Object.keys(lobby.players);
					const currentPlayerIndex = playerIds.indexOf(playerOnTurnId);
					const nextPlayerIndex =
						currentPlayerIndex === playerIds.length - 1 ? 0 : currentPlayerIndex + 1;
					lobby.playerOnTurn = playerIds[nextPlayerIndex];

					io.to(lobbyId).emit('correct answer', lobby.playerOnTurn, questionId);
				}
			});
		});
	}
};

export default defineConfig({
	plugins: [sveltekit(), webSocketServer]
});
