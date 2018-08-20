var socket = io();

let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle,
    Container = PIXI.Container;

let style = new TextStyle({
  fontFamily: ["Basic", "Arial"],
  fontSize: 20,
  fill: "#000000"
});

let callStyle = new TextStyle({
  fontFamily: ["Basic", "Arial"],
  fontSize: 20,
  fill: "#e24343"
});

let checkStyle = new TextStyle({
  fontFamily: ["Basic", "Arial"],
  fontSize: 20,
  fill: "#3374ff"
});

let betStyle = new TextStyle({
  fontFamily: ["Basic", "Arial"],
  fontSize: 20,
  fill: "#20ca4f"
});

let foldStyle = new TextStyle({
  fontFamily: ["Basic", "Arial"],
  fontSize: 20,
  fill: "#8c918d"
});

let winStyle = new TextStyle({
  fontFamily: ["Basic", "Arial"],
  fontSize: 20,
  fill: "#8325c4"
});

let betsThisRound = 0;

let tableCards = new Container();
let holeCards = new Container();
let cardBacks = new Container();
let oppStack = new Text("", style);
let opp = new Text("", style);
let playerStack = new Text("", style);
let player = new Text("", style);
let pot = new Text("", style);

let app = new Application({
width: 1200,
height: 700,
antialias: true,
transparent: false, 
resolution: 1
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
"cards/back.png"
])
.load(setup);


function setup() {
    opp.position.set(app.view.width / 2, 210);
    oppStack.position.set(app.view.width / 2, 245);
    player.position.set(app.view.width / 2, 620);
    playerStack.position.set(app.view.width / 2, 655);
    pot.position.set(app.view.width / 2, app.view.height / 2 + 75);
    app.stage.addChild(opp);
    app.stage.addChild(oppStack);
    app.stage.addChild(player);
    app.stage.addChild(playerStack);
    app.stage.addChild(pot);
    for (var i=0; i<2; i++) {
        let card = new Sprite(resources["cards/back.png"].texture);
        card.scale.set(0.4, 0.4);
        if (i==0) {
            card.x = app.view.width / 2 - card.width - 10;
        }
        else {
            card.x = app.view.width / 2 + 10;
        }
        card.y = 50;
        cardBacks.addChild(card);
    }
    cardBacks.visible = false;
    app.stage.addChild(cardBacks);
    app.stage.addChild(tableCards);
    app.stage.addChild(holeCards);
}

socket.on("game created", function() {
    document.body.insertBefore(app.view, document.getElementById("actions-div"));
});

socket.on("hole cards", function(cards) {
    for (let i=0; i<2; i++) {
        let card = new Sprite(resources["cards/" + cards[i] + ".png"].texture);
        card.scale.set(0.4, 0.4);
        if (i==0) {
            card.x = app.view.width / 2 - card.width - 10;
        }
        else {
            card.x = app.view.width / 2 + 10;
        }
        card.y = 460;
        holeCards.addChild(card);
    }
    cardBacks.visible = true;
});

socket.on("new hand", function() { //reset everything
    betsThisRound = 0;
    tableCards.removeChildren();
    pot.text = "Pot: 0";
    holeCards.removeChildren();
});


socket.on("call", function(data) {
    if (data.id == socket.id) {
        flashText(player, "Call " + data.amount, callStyle);
        playerStack.text = data.stack;
    }
    else {
        flashText(opp, "Call " + data.amount, callStyle);
        oppStack.text = data.stack;
    }
    if (!data.checkable) {
        advanceRound(data);
    }
});


socket.on("check", function(data) {
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
    let action = "";
    console.log("gameStage: " + data.gameStage)
    if (data.gameStage == 1 && data.amount <= 20) {
        action = "Blind ";
    }
    else {
       action = (betsThisRound > 0 ? "Raise " : "Bet "); 
    }
    if (data.id == socket.id) {
        flashText(player, action + data.amount, betStyle);
        playerStack.text = data.stack;
    }
    else {
        flashText(opp, action + data.amount, betStyle);
        oppStack.text = data.stack;
    }
    if (data.amount > 10) {
        betsThisRound += 1;
    }
});


socket.on("fold", function(data) {
    if (data.id == socket.id) {
        flashText(player, "Fold", foldStyle);
        flashText(opp, "Winner", winStyle);
        oppStack.text = data.winnerStack;
    }
    else {
        flashText(opp, "Fold", foldStyle);
        flashText(player, "Winner", winStyle);
    }
    $("#pot-header").text = "Pot" + data.pot;
});

socket.on("result", function(data) {
    window.setTimeout(()=>{
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
            flashText(opp, "Split Pot", winStyle);
        }
        if (data.id == socket.id) {
            playerStack.text = data.stacks[0];
            oppStack.text = data.stacks[1];
        }
        else {
            playerStack.text = data.stacks[1];
            oppStack.text = data.stacks[0];
            flashCards(data.cardsToShow);
        }
    }, 3000);
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

function dealCards(cards) {
    console.log("Dealing " + cards.length + " cards");
    for (let i=0; i<cards.length; i++) {
        let card = new Sprite(resources["cards/" + cards[i] + ".png"].texture);
        card.scale.set(0.4, 0.4);
        card.x = (app.view.width - 5 * (card.width + 20)) / 2 + tableCards.children.length * (card.width + 20);
        card.y = app.view.height / 2 - card.height / 2;
        tableCards.addChild(card);
    }
}

function advanceRound(data) {
    betsThisRound = 0;
    var toPlay = (data.dealer == socket.id ? false : true); //if not the dealer, then plays first
    window.setTimeout(function() { //display call for 2 seconds and then continue game
        if (data.cards) {
            dealCards(data.cards);
        }
        pot.text = "Pot: " + data.pot;
    }, 2000);
}

function flashText(label, text, actionStyle, duration) {
    label.style = actionStyle;
    label.text = text;
    window.setTimeout(function() {
        label.style = style;
        label.text = label.name;
    }, (duration ? duration : 1500));
}

function flashCards(cardsToShow) {
    console.log("flashing cards");
    for (let i=0; i<cardBacks.children.length; i++) {
        cardBacks.children[i].texture = resources["cards/" + cardsToShow[i] + ".png"].texture;
    }
    window.setTimeout(function() {
        for (let i=0; i<cardBacks.children.length; i++) {
            cardBacks.children[i].texture = resources["cards/back.png"].texture;
        }
    }, 1500);
}