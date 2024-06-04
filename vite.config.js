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
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk']
		];

		const answers = [
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk'],
			['idk']
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
				return {
					id: this.id,
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

				if (fieldId === 0) return [true, true];
				const row = this.getRow(fieldId);
				//console.log(row);
				const leftmostRowFieldId = (row * (row - 1)) / 2 + 1;
				const rightmostRowFieldId = (row * (row + 1)) / 2;

				console.log(
					`row: ${row}, field: ${fieldId}, leftmost: ${leftmostRowFieldId}, rightmost: ${rightmostRowFieldId}`
				);

				if (fieldId === leftmostRowFieldId) return [true, false];
				if (fieldId === rightmostRowFieldId) return [false, true];

				let doesTouchLeft,
					doesTouchRight,
					currentDoesTouchLeft,
					currentDoesTouchRight = false;

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

				lobby = new Lobby(lobbyId);
				lobbies[lobbyId] = lobby;

				lobby.joinGame(socket, username);
				lobby.playerOnTurn = socket.id;
				socket.join(lobbyId);

				socket.emit('lobby info', lobby.serialize());
			});

			socket.on('join lobby', (username, lobbyId) => {
				if (lobby != null) return;

				lobby = lobbies[lobbyId];
				lobby.joinGame(socket, username);
				socket.join(lobbyId);

				io.to(lobbyId).emit('lobby info', lobby.serialize());
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
