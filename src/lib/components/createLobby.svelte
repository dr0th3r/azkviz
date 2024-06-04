<script>
    export let changeState;
    export let socket;

    let username = ""

    function createLobby() {
        if (username === "") return
        socket.emit("create lobby", username)
    }
</script>

<div>
    <input type="text" bind:value={username} placeholder="Username"/>
    <button on:click={createLobby}>Create</button>
    <button on:click={() => changeState("homepage")}>Go Back</button>
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        gap: .3rem;
    }
</style>