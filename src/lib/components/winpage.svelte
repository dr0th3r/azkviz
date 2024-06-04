<script>
    export let lobbyInfo
    export let socket

    function leaveLobby() {
        socket.emit("leave lobby")
    }
</script>

<div>
    <h1>Player {lobbyInfo.players[lobbyInfo.playerOnTurn]?.name} won!</h1>
    <button on:click={leaveLobby}>Leave Lobby</button>
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: .3rem;
    }
</style>