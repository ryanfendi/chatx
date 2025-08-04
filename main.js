let playerId;
let players = {};
let avatarType = localStorage.getItem("avatarType") || "pria";

// Kirim avatarType ke server
socket.emit("avatarType", avatarType);

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
  this.load.image("pria", "https://i.imgur.com/uQaaapA.png");
  this.load.image("wanita", "https://i.imgur.com/bMolfpy.png");
}

function create() {
  this.chatBubbles = {};

  socket.on("init", (id) => {
    playerId = id;
  });

  socket.on("state", (serverPlayers) => {
    for (const id in serverPlayers) {
      const data = serverPlayers[id];

      if (!players[id]) {
        const avatarImg = data.avatarType || "pria";
        const avatar = this.add.sprite(data.x, data.y, avatarImg).setScale(2);
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

  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (msg) {
      socket.emit("chat", msg);
      input.value = "";
    }
  });
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
      y: player.avatar.y,
      avatarType: avatarType
    });
  }
}
