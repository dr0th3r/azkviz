<script>
    export let socket;
    export let lobbyInfo;

    function toggleReady() {
        socket.emit("toggle ready")
    }

    function leaveLobby() {
        socket.emit("leave lobby")
    }

</script>

<div class="container">
    <h1>Id: {lobbyInfo.id}</h1>
    {#each Object.values(lobbyInfo.players) as player}
        <div class="player-info">
            <h2>{player.name}
            </h2>
            <span style:color={player.ready ? "green" : "red"}>{player.ready ? "Ready" : "Not Ready"}</span>
        </div>
    {/each}
    <div class="btns">
        <button on:click={toggleReady}>Ready</button>
        <button on:click={leaveLobby}>Leave</button>
    </div>
</div>

<style>
    .player-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .container {
        max-width: 90vw;
    }

    h1 {
        overflow-wrap: break-word;
    }

    .player-info span {
        font-weight: bold;
        font-size: 1.2rem;
        margin: .5rem 0;
    }

    .btns {
        display: flex;
        justify-content: right;
        gap: .3rem;
    }
</style>