var socket = io();

$(function () {
    socket.on("connect", function() {
        if ($("#nickname-div").css("display") === "none") { //on page refresh show nickname div again
            $("#nickname-div").css("display", "block");
        }
        if ($("#chat-div").css("display") === "block") {
            $("#chat-div").css("display", "none");
        }
        if ($("#waiting-div").css("display") === "block") {
            $("#waiting-div").css("display", "none");
        }
        if ($("#table-div").css("display") === "block") {
            $("#table-div").css("display", "none");
        }
        console.log('client connected');
    });

    socket.on("new hand", function() { //reset everything
        hideButtons();
        $("#table-cards").empty();
        $("#pot-header").text("Pot: 0");
        $(".hole-card").remove();
    });

    socket.on("bet", function(data) {
        if (data.id == socket.id) {
            $("#player-action-header").text("Bet " + data.amount);
        }
        else {
            $("#opponent-action-header").text("Bet " + data.amount);
            $("#slider").attr("min", data.min);
            $("#slider").attr("max", data.max);
            if (data.amount > 10) { //if not the small blind
                showButtons(1);
            }
        }
    });

    socket.on("call", function(data) {
        if (data.id == socket.id) {
            $("#player-action-header").text("Call " + data.amount);
            $("#slider").attr("min", data.min);
            $("#slider").attr("max", data.max);
        }
        else {
            $("#opponent-action-header").text("Call " + data.amount);
            $("#slider").attr("min", data.min);
            $("#slider").attr("max", data.otherMax); 
            if (data.checkable) {
                showButtons(2);
            }
        }
        if (!data.checkable) {
            nextRound(data);
        }
    });

    socket.on("check", function(data) {
        if (data.id == socket.id) {
            $("#player-action-header").text("Check");
            $("#slider").attr("min", data.min);
            $("#slider").attr("max", data.max);
            if (!data.checkable) {
                nextRound(data);
            }
        }
        else {
            $("#opponent-action-header").text("Check");
            $("#slider").attr("min", data.min);
            $("#slider").attr("max", data.otherMax); 
            if (!data.checkable) {
                nextRound(data);
            }
            else {
                showButtons(2);
            }
        }

    });

    socket.on("fold", function(data) {
        $("#player-stake").text("");
        $("#opponent-stake").text("");
        if (data.id == socket.id) {
            $("#player-action-header").text("Fold");
            $("#opponent-action-header").text("Winner");
        }
        else {
            $("#opponent-action-header").text("Fold");
            $("#player-action-header").text("Winner");
        }
        $("#pot-header").text(data.pot + "");
    });

    socket.on("hole cards", function(cards) {
        for (var i=0; i<cards.length; i++) {
            $("#player").append($("<img class='hole-card'>").attr("src", "cards/" + cards[i] + ".png"));
        }
    });

    socket.on("result", function(data) {
        window.setTimeout(()=>{
            if (data.result == "single winner") {
                if(data.id == socket.id) {
                    $("#player-action-header").text("Winner");    
                }
                else {
                    $("#opponent-action-header").text("Winner");    
                }
            }
            else {
                $("#opponent-action-header").text("Split Pot");
                $("#player-action-header").text("Split Pot");
            }
        }, 3000);
    });

    $("#nickname-form").submit(function() {
        var nickname = $("#nickname-box").val();
        if (nickname != "") {
            socket.nickname = nickname;
            socket.emit("nickname set", nickname);
            $("#nickname-box").val("");
        }
        $("#nickname-div").css("display", "none");
        $("#waiting-div").css("display", "block");
        return false; //prevent page reloading
    });

    $("#chat-form").submit(function() {
        if ($("#chat-box").val() != "") {
            socket.emit("message", {msg: socket.nickname + ": " + $("#chat-box").val(), id: socket.id});
            console.log('message sent')
        $("#chat-box").val("");
        }
        return false;
    });

    $("#slider").on("input", function() {
        $("#slider-val").text($("#slider").val() + "");
    });

    $(".controls").click(function() {
        hideButtons();
    })

    $("#bet-button").click(function() {
        console.log("bet button clicked");
        socket.emit("bet", {amount: $("#slider").val(), id: socket.id});
        //hide actions?
    });

    $("#call-button").click(function() {
        console.log("call button clicked");
        socket.emit("call", socket.id);
    });

    $("#check-button").click(function() {
        console.log("check button clicked");
        socket.emit("check", socket.id);
        //hide actions?
    });

    $("#fold-button").click(function() {
        console.log("fold button clicked");
        socket.emit("fold", socket.id);
    });

    socket.on("game created", function(names) {
        console.log("new game detected");
        $("#waiting-div").css("display", "none");
        $("#chat-div").css("display", "block");
        $("#table-div").css("display", "block");
        $("#actions-div").css("display", "block");
        for (var i=0; i<names.length; i++) {
            if (names[i] == socket.nickname) {
                $("#actions-div").append($("<h4>").text(names[i]));
            }
            else {
                $("#opponent").append($("<h4>").text(names[i]));
            }
        }
    });

    socket.on("game complete", function(winnerID) { //on game complete
        $("#chat-div").css("display", "none");
        $("#table-div").css("display", "none");
        $("#actions-div").css("display", "none");
        var message = (socket.id == winnerID ? "You Win!" : "You Lose!");
        $("body").append($("<p id='end-message' style='font-size: 36px; margin: 20% 40%'>").text(message));
    })

    socket.on("message", function(message) {
        $("#chat").append($("<li>").text(message));
    });
});

function hideButtons() {
    $("#slider").attr("disabled", "disabled");
    $("#slider").css("display", "none");
    $(".controls").attr("disabled", "disabled");
    $(".controls").css("display", "none");
}

function showButtons(action) { //1 for responding to bet, 2 for checkable/opening bet
    $("#slider").removeAttr("disabled");
    $("#slider").css("display", "block");
    if (action == 1) {
        $("#bet-button").removeAttr("disabled");
        $("#bet-button").css("display", "block");
        $("#call-button").removeAttr("disabled");
        $("#call-button").css("display", "block");  
        $("#fold-button").removeAttr("disabled");
        $("#fold-button").css("display", "block");
    }
    else {
        $("#bet-button").removeAttr("disabled");
        $("#bet-button").css("display", "block");
        $("#check-button").removeAttr("disabled");
        $("#check-button").css("display", "block");  
        $("#fold-button").removeAttr("disabled");
        $("#fold-button").css("display", "block");
    }
}

function nextRound(data) {
    var toPlay = (data.dealer == socket.id ? false : true); //if not the dealer, then plays first

    window.setTimeout(function() { //display call for 2 seconds and then continue game
        $("#opponent-action-header").text("");
        $("#player-action-header").text("");
        if (toPlay && data.playingOn) {
            showButtons(2);
        }
        for (var i=0; i<data.cards.length; i++) {
            $("#table-cards").append($("<img>").attr("src", "cards/" + data.cards[i] + ".png"));
        }
        console.log("pot: " + data.pot);
        $("#pot-header").text("Pot: " + data.pot);
    }, 2000);
}