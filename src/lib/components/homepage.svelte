<script>
    export let changeState;
</script>

<div class="buttons">
    <button on:click={() => changeState("create lobby")}>Create Lobby</button>
    <button on:click={() => changeState("join lobby")}>Join Lobby</button>
</div>

<style>
    .buttons {
        display: flex;
        flex-direction: column;
        gap: .3rem;
    }
</style>