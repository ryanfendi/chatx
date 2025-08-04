const socket = io("https://c62ece58-3908-4b24-8998-bbb028287830-00-13wz9yilxc66m.pike.replit.dev/"); // GANTI URL INI

let playerId;
let players = {};

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#222",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 } }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("avatar", "https://i.imgur.com/SZkVJ06.png");
}

function create() {
  this.otherPlayers = this.add.group();
  this.chatBubbles = {};

  this.input.keyboard.on("keydown-ENTER", () => {
    const msg = prompt("Tulis pesan:");
    if (msg) socket.emit("chat", msg);
  });

  socket.on("init", (id) => {
    playerId = id;
  });

  socket.on("state", (serverPlayers) => {
    for (const id in serverPlayers) {
      const data = serverPlayers[id];

      if (!players[id]) {
        const avatar = this.add.sprite(data.x, data.y, "avatar").setScale(2);
        const bubble = this.add.text(data.x, data.y - 40, "", {
          font: "16px Arial",
          fill: "#fff",
          backgroundColor: "#000",
          padding: { x: 5, y: 2 }
        }).setOrigin(0.5).setVisible(false);

        players[id] = { avatar, bubble };
      } else {
        players[id].avatar.x = data.x;
        players[id].avatar.y = data.y;
        players[id].bubble.x = data.x;
        players[id].bubble.y = data.y - 40;
      }
    }
  });

  socket.on("chat", ({ id, msg }) => {
    const player = players[id];
    if (player) {
      player.bubble.setText(msg).setVisible(true);
      this.time.delayedCall(3000, () => {
        player.bubble.setVisible(false);
      });
    }
  });

  this.cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  const player = players[playerId];
  if (!player) return;

  let moved = false;
  if (this.cursors.left.isDown) {
    player.avatar.x -= 3;
    moved = true;
  } else if (this.cursors.right.isDown) {
    player.avatar.x += 3;
    moved = true;
  }

  if (moved) {
    socket.emit("move", {
      x: player.avatar.x,
      y: player.avatar.y
    });
  }
}
