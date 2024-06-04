<script>
    export let socket;
    export let lobbyInfo;

    console.log(lobbyInfo)

    const idxArr = (len) => Array.from({length: len}, (_, i) => i) 

    let question = ""
    let answer = ""

    let answerCounter = 0

    function showQuestion(questionId) {
        if (socket.id !== lobbyInfo.playerOnTurn || lobbyInfo?.fields[questionId]?.type !== "remaining") return;
        socket.emit("show question", questionId)
    }

    function checkAnswer() {
        if (socket.id !== lobbyInfo.playerOnTurn) return;
        socket.emit("check answer", answer)
    }

    socket.on("wrong answer", (nextPlayerId) => {
        lobbyInfo.playerOnTurn = nextPlayerId
        question = ""
        answerCounter++
    })

    socket.on("correct answer", (nextPlayerId, questionId) => {
        lobbyInfo.fields[questionId] = {
            type: "player",
            value: lobbyInfo.playerOnTurn,
        }
        lobbyInfo.playerOnTurn = nextPlayerId
        question = ""
        lobbyInfo = lobbyInfo
        answerCounter++
    })

    $: answerCounter, console.log(lobbyInfo)

    socket.on("show question", (newQuestion) => {
        question = newQuestion
        console.log(question)
    })
</script>

<div class="container">
    {#key answerCounter}
        {#each idxArr(8) as i}
            <div class="row">
                {#each idxArr(i) as j}
                    {@const questionId = (i * (i - 1)) / 2 + j}
                    {@const field = lobbyInfo.fields[questionId]} 
                    {#if field &&  field.type === "remaining"}
                        <button class="question-btn remaining" on:click={() => showQuestion(questionId)}>
                        </button>
                    {:else}
                        {@const player = lobbyInfo.players[field?.value]}
                        <button class="question-btn" style:background={player?.color || "blue"}>
                        </button>
                    {/if}
                {/each}
            </div>
        {/each}
    {/key}
</div>
{#if question !== ""}
    <div class="modal">
        <h1>{question}</h1>
        {#if lobbyInfo.playerOnTurn === socket.id}
            <input type="text" bind:value={answer}>
            <button on:click={checkAnswer}>Submit</button>
        {/if}
    </div>
{/if}

<style>
    .container {
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: .3rem;
    }

    .row {
        display: flex;
        gap: .3rem;
    }

    .question-btn {
        width: 8vw;
        height: 8vw;
        color: blue;
    }

    .remaining {
        background-color: red;
    }

    .modal {
        position: absolute;
        background-color: #111;
        border: 2px solid #222;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: .3rem;
        padding: 1rem;
        min-width: 10rem;
    }

</style>