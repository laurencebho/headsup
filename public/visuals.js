let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle,
    Container = PIXI.Container;

let style = new TextStyle({
  fontFamily: ["Basic", "Arial"],
  fontSize: "3em",
  fill: "#000000"
});

let callStyle = new TextStyle({
  fontFamily: ["Basic", "Arial"],
  fontSize: "3em",
  fill: "#e24343"
});

let checkStyle = new TextStyle({
  fontFamily: ["Basic", "Arial"],
  fontSize: "3em",
  fill: "#3374ff"
});

let betStyle = new TextStyle({
  fontFamily: ["Basic", "Arial"],
  fontSize: "3em",
  fill: "#20ca4f"
});

let foldStyle = new TextStyle({
  fontFamily: ["Basic", "Arial"],
  fontSize: "3em",
  fill: "#8c918d"
});

let winStyle = new TextStyle({
  fontFamily: ["Basic", "Arial"],
  fontSize: "3em",
  fill: "#8325c4"
});

let stakeStyle = new TextStyle({
  fontFamily: ["Basic", "Arial"],
  fontSize: "3em",
  fill: "#045d2b",
  fontWeight: "bold"
});

let checkAudio = new Audio("sounds/check.mp3");
let betAudio = new Audio("sounds/bet.mp3");
let foldAudio = new Audio("sounds/fold.mp3");
let dealAudio = new Audio("sounds/deal.mp3");
let potAudio = new Audio("sounds/updatepot.mp3");
let winAudio = new Audio("sounds/win.mp3");

let h = 1000,//app.view.height,
    w = 800,//app.view.width;
    widthScaling = 700,
    heightScaling = 700,
    cardScale = 0.6,
    res = 1.2;

let betsThisRound = 0;
let tableCards = new Container();
let holeCards = new Container();
let cardBacks = new Container();
let oppStack = new Text("", style);
let oppStake = new Text("", stakeStyle);
let opp = new Text("", style);
let playerStack = new Text("", style);
let playerStake = new Text("", stakeStyle);
let player = new Text("", style);
let pot = new Text("", style);
let dealer = new Sprite();
let app = new Application({
    width: w,
    height: h,
    antialias: true,
    transparent: false, 
    //autoResize: true,
    resolution: res
});

app.renderer.backgroundColor = 0xffffff;

loader
.add([
"cards/Ah.png",
"cards/Ac.png",
"cards/Ad.png",
"cards/As.png",
"cards/2h.png",
"cards/2c.png",
"cards/2d.png",
"cards/2s.png",
"cards/3h.png",
"cards/3c.png",
"cards/3d.png",
"cards/3s.png",
"cards/4h.png",
"cards/4c.png",
"cards/4d.png",
"cards/4s.png",
"cards/5h.png",
"cards/5c.png",
"cards/5d.png",
"cards/5s.png",
"cards/6h.png",
"cards/6c.png",
"cards/6d.png",
"cards/6s.png",
"cards/7h.png",
"cards/7c.png",
"cards/7d.png",
"cards/7s.png",
"cards/8h.png",
"cards/8c.png",
"cards/8d.png",
"cards/8s.png",
"cards/9h.png",
"cards/9c.png",
"cards/9d.png",
"cards/9s.png",
"cards/Th.png",
"cards/Tc.png",
"cards/Td.png",
"cards/Ts.png",
"cards/Jh.png",
"cards/Jc.png",
"cards/Jd.png",
"cards/Js.png",
"cards/Qh.png",
"cards/Qc.png",
"cards/Qd.png",
"cards/Qs.png",
"cards/Kh.png",
"cards/Kc.png",
"cards/Kd.png",
"cards/Ks.png",
"cards/back.png",
"cards/dealer.png"
])
.load(setup);

function setup() {
    opp.position.set(w / 2, h * 210/heightScaling);
    oppStake.position.set(w / 2 - w * 130/widthScaling, h * 245/heightScaling);
    oppStack.position.set(w / 2, h * 245/heightScaling);
    player.position.set(w / 2, h * 620/heightScaling);
    playerStake.position.set(w / 2 - w * 130/widthScaling, h / 2 + h * 75/heightScaling);
    playerStack.position.set(w / 2, h * 655/heightScaling);
    pot.position.set(w / 2, h / 2 + h * 75/heightScaling);
    dealer.texture = resources["cards/dealer.png"].texture;
    dealer.scale.set(0.3);
    dealer.visible = false;
    app.stage.addChild(opp);
    app.stage.addChild(oppStack);
    app.stage.addChild(oppStake);
    app.stage.addChild(player);
    app.stage.addChild(playerStack);
    app.stage.addChild(playerStake);
    app.stage.addChild(pot);
    app.stage.addChild(dealer);
    for (var i=0; i<2; i++) {
        let card = new Sprite(resources["cards/back.png"].texture);
        card.scale.set(cardScale);
        if (i==0) {
            card.x = w / 2 - card.width - app.view.width * 10/widthScaling;
        }
        else {
            card.x = w / 2 + app.view.width * 10/widthScaling;
        }
        card.y = h * 50/heightScaling;
        cardBacks.addChild(card);
    }
    cardBacks.visible = false;
    app.stage.addChild(cardBacks);
    app.stage.addChild(tableCards);
    app.stage.addChild(holeCards);
    resize();
}

socket.on("connect", function() {
    $("canvas").css("display", "none");
});

socket.on("game created", function() {
    let actions = document.getElementById("actions-div");
    actions.parentNode.insertBefore(app.view, actions);
});

socket.on("game complete", function() {
    $("canvas").css("display", "none");
});

socket.on("other player disconnected", function() {
    $("canvas").css("display", "none");
});

socket.on("hole cards", function(cards) {
    for (let i=0; i<2; i++) {
        let card = new Sprite(resources["cards/" + cards[i] + ".png"].texture);
        card.scale.set(cardScale);
        if (i==0) {
            card.x = w / 2 - card.width - w * 10/widthScaling;
        }
        else {
            card.x = w / 2 + w * 10/widthScaling;
        }
        card.y = h * 460/heightScaling;
        holeCards.addChild(card);
    }
    cardBacks.visible = true;
});

socket.on("new hand", function(id) { //reset everything
    betsThisRound = 0;
    tableCards.removeChildren();
    pot.text = "Pot: 0";
    holeCards.removeChildren();
    oppStake.text = "";
    playerStake.text = "";
    if (socket.id == id) {
        dealer.position.set(w / 2 - w * 55/widthScaling, h * 620/heightScaling);
    }
    else {
        dealer.position.set(w / 2 - w * 55/widthScaling, h * 210/heightScaling);
    }
    if (!dealer.visible) {
        dealer.visible = true;
    }
    console.log(dealer.position.x + ", " + dealer.position.y);
});


socket.on("call", function(data) {
    let action = (data.stack == 0 ? "All In " : "Call ");
    betAudio.play();
    if (data.id == socket.id) {
        flashText(player, action + data.amount, callStyle);
        playerStake.text = data.amount;
        playerStack.text = data.stack;
    }
    else {
        flashText(opp, action + data.amount, callStyle);
        oppStake.text = data.amount;
        oppStack.text = data.stack;
    }
    if (!data.checkable) {
        advanceRound(data);
    }
});


socket.on("check", function(data) {
    checkAudio.play();
    if (data.id == socket.id) {
        flashText(player, "Check", checkStyle);
    }
    else {
        flashText(opp, "Check", checkStyle);
    }
    if (!data.checkable) {
        advanceRound(data);
    }
});


socket.on("bet", function(data) {
    console.log("gameStage: " + data.gameStage)
    if (data.stack == 0) {
        var action = "All In ";
    }
    else if (data.gameStage == 1 && data.amount <= 20) {
        var action = "Blind ";
    }
    else {
       var action = (betsThisRound > 0 ? "Raise " : "Bet "); 
    }
    betAudio.play();
    if (data.id == socket.id) {
        flashText(player, action + data.amount, betStyle);
        playerStake.text = data.amount;
        playerStack.text = data.stack;
    }
    else {
        flashText(opp, action + data.amount, betStyle);
        oppStake.text = data.amount;
        oppStack.text = data.stack;
    }
    if (data.amount > 10) {
        betsThisRound += 1;
    }
});


socket.on("fold", function(data) {
    playerStake.text = "";
    oppStake.text = "";
    window.setTimeout(()=>{
        potAudio.play();
        pot.text = "Pot: " + data.pot
    }, 2000);
    if (data.id == socket.id) {
        foldAudio.play();
        flashText(player, "Fold", foldStyle);
        window.setTimeout(()=>{flashText(opp, "Winner", winStyle)}, 4000);
        window.setTimeout(()=>{
            winAudio.play();
            oppStack.text = data.winnerStack;
            pot.text = "Pot: 0";
        }, 6000);
    }
    else {
        foldAudio.play();
        flashText(opp, "Fold", foldStyle);
        window.setTimeout(()=>{flashText(player, "Winner", winStyle)}, 4000);
        window.setTimeout(()=>{
            winAudio.play();
            playerStack.text = data.winnerStack;
            pot.text = "Pot: 0";
        }, 6000);
    }
    
});

socket.on("result", function(data) {
    window.setTimeout(()=>{
        flashCards(data.cardsToShow[socket.id]);
        if (data.result == "single winner") {
            if(data.id == socket.id) {
                flashText(player, "Winner", winStyle);   
            }
            else {
                flashText(opp, "Winner", winStyle);
            }
        }
        else {
            flashText(opp, "Split Pot", winStyle);
            flashText(player, "Split Pot", winStyle);
        }
    }, 4000);
    window.setTimeout(()=>{
        winAudio.play();
        if (data.id == socket.id) {
            playerStack.text = data.stacks[0];
            oppStack.text = data.stacks[1];
            pot.text = "Pot: 0";
        }
        else {
            playerStack.text = data.stacks[1];
            oppStack.text = data.stacks[0];
            pot.text = "Pot: 0";
        }
    }, 6000);
    
});

socket.on("game created", function(data) {
    for (var i=0; i<data.names.length; i++) {
        if (data.names[i] == socket.nickname) {
            player.name = data.names[i];
            player.text = data.names[i];
            playerStack.text = data.stacks[i];
        }
        else {
            opp.name = data.names[i];
            opp.text = data.names[i];
            oppStack.text = data.stacks[i];
        }
    }
});

$(window).on("resize", resize);

function resize() {
    let widthRatio = window.innerWidth * 0.7/(app.stage.scale.x * w * res);
    let heightRatio = window.innerHeight * 0.8/(app.stage.scale.x * h * res);
    let prevScale = app.stage.scale.x;
    if (heightRatio > widthRatio) {
        app.stage.scale.set(app.stage.scale.x * widthRatio);
    }
    else {
        app.stage.scale.set(app.stage.scale.x * heightRatio);
    }
    app.renderer.resize(w * app.stage.scale.x, h * app.stage.scale.x);
}


function dealCards(cards) {
    console.log("Dealing " + cards.length + " cards");
    for (let i=0; i<cards.length; i++) {
        let card = new Sprite(resources["cards/" + cards[i] + ".png"].texture);
        card.scale.set(cardScale);
        card.x = (w - w * 5/w * (card.width + w * 20/w)) / 2 + tableCards.children.length * (card.width + w * 20/w);
        card.y = h / 2 - card.height / 2;
        tableCards.addChild(card);
    }
}

function advanceRound(data) {
    betsThisRound = 0;
    window.setTimeout(function() {
        playerStake.text = "";
        oppStake.text = "";
        if (pot.text != "Pot: " + data.pot) { //if pot hasn't changed (double check) then don't play audio
            potAudio.play();
            pot.text = "Pot: " + data.pot;
        }
    }, 2000);
    window.setTimeout(function() {
        if (data.cards) {
            if (data.cards.length > 0) {
                dealAudio.play()
                dealCards(data.cards);
            }
        }
    }, 4000);
}

function flashText(label, text, actionStyle, duration) {
    label.style = actionStyle;
    label.text = text;
    window.setTimeout(function() {
        if (label.text == text) { //only reset text and style if it hasn't been changed again in the 1.5s interval
            label.style = style;
            label.text = label.name;
        }
    }, (duration ? duration : 1500));
}

function flashCards(cards) {
    if (cards) {
        console.log("flashing cards");
        for (let i=0; i<cardBacks.children.length; i++) {
            cardBacks.children[i].texture = resources["cards/" + cards[i] + ".png"].texture;
        }
        window.setTimeout(function() {
            for (let i=0; i<cardBacks.children.length; i++) {
                cardBacks.children[i].texture = resources["cards/back.png"].texture;
            }
        }, 1500);
    }

    else { //opponent mucks cards
        flashText(opp, "muck", foldStyle);
        tintContainer(cardBacks, 0x8c918d);
        window.setTimeout(function() {
            tintContainer(cardBacks, 0xffffff);
        }, 1500);
    }
}

function tintContainer(cont, colour) {
    for (let i=0; i<cont.children.length; i++) {
        cont.children[i].tint = colour;
    }
}