
<script>
    export let changeState;
    export let socket;

    let username = ""
    let lobbyId = ""

    function joinLobby() {
        if (username === "" || lobbyId === "") return
        console.log("test")
        socket.emit("join lobby", username, lobbyId)
    }
</script>

<div>
    <input type="text" bind:value={username} placeholder="Username"/>
    <input type="text" bind:value={lobbyId} placeholder="Lobby Id"/>
    <button on:click={joinLobby}>Join</button>
    <button on:click={() => changeState("homepage")}>Go Back</button>
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        gap: .3rem;
        max-width: 90vw;
    }
</style>