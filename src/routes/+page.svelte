<script>
	import CreateLobby from "../lib/components/createLobby.svelte";
    import Homepage from "../lib/components/homepage.svelte";

    import { io } from "socket.io-client"; 
	import Lobby from "../lib/components/lobby.svelte";
	import Gameboard from "../lib/components/gameboard.svelte";
	import JoinLobby from "../lib/components/joinLobby.svelte";
	import Winpage from "../lib/components/winpage.svelte";

    let state = "homepage"
    let lobbyInfo = {}

    const socket = io()

    socket.on("lobby info", (info) => {
        lobbyInfo = info
        console.log(info)
        state = "in lobby"
    })

    socket.on("leave lobby", () => { 
        lobbyInfo = {}
        state = "homepage"
    })

    socket.on("toggle ready", (playerId) => {
        const player = lobbyInfo.players[playerId]
        player.ready = !player.ready
        lobbyInfo = lobbyInfo
    })

    socket.on("player left lobby", (playerId) => {
        if (lobbyInfo == null) return
        if (state === "in lobby") {
            delete lobbyInfo.players[playerId]
        }
        lobbyInfo = lobbyInfo
    })

    socket.on("start game", () => {
        state = "in game"
    })

    socket.on("player won", (playerId) => {
        lobbyInfo.playerOnTurn = playerId
        lobbyInfo = lobbyInfo
        state = "winpage"
    })

    function changeState(newState) {
        state = newState
    }
</script>

{#if state === "homepage"}
    <Homepage {changeState} /> 
{:else if state === "create lobby"}
    <CreateLobby {changeState} {socket} />
{:else if state === "join lobby"}
    <JoinLobby {changeState} {socket} />
{:else if state === "in lobby"}
    <Lobby {socket} {lobbyInfo}/>
{:else if state === "in game"}
    <Gameboard {socket} {lobbyInfo}/>
{:else if state === "winpage"}
    <Winpage {lobbyInfo} {socket}/>
{/if}

<style>
    :global(*) {
        padding: 0;
        margin: 0;
    }

    :global(body) {
        background-color: #111;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        height: 100svh;
        overflow: hidden;
        padding: 1rem;
    }


    :global(button) {
        outline: none;
        border: none;
        padding: 1rem;
        font-size: 1.7rem;
        border-radius: 8px;
        background-color: rgb(91, 91, 221);
        color: #fff;
        cursor: pointer;
        transition: all 0.3s ease-out;
    }
    
    :global(button:hover) {
        background-color: rgb(77, 77, 184);
    }

    :global(input) {
        font-size: 1.7rem;
        padding: 1rem;
        border-radius: 8px;
        outline: none;
        border: none;
        background-color: #555;
        color: #fff;
    }
</style>